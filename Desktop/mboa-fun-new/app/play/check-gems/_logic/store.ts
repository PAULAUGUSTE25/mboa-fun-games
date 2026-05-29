import { create } from 'zustand';
import type { Card, GameState, Player, Suit } from '../_types/card';
import { buildDeck, drawCards, shuffleDeck } from './deck';
import { aiChooseCard, aiChooseSuit, getCardEffect, hasPlayableCard, isPlayable } from './rules';

interface GameStore extends GameState {
  // Actions
  startNewGame: () => void;
  playCard: (cardId: string) => void;
  chooseSuit: (suit: Suit) => void;
  drawCard: () => void;
  passTurn: () => void;
  /** Le joueur annonce « CHECK » ou « GAMES ». */
  sayCheck: () => void;
  sayGames: () => void;
  // Internal
  _runAiTurn: () => void;
}

const INITIAL_HAND_SIZE = 4;

function makeInitialState(): Omit<GameState, 'wins' | 'losses'> {
  const fullDeck = shuffleDeck(buildDeck());
  const playerHand = fullDeck.slice(0, INITIAL_HAND_SIZE);
  const opponentHand = fullDeck.slice(INITIAL_HAND_SIZE, INITIAL_HAND_SIZE * 2);

  // Carte de départ : on évite toute carte spéciale (J, 7, A, Joker) pour ne pas commencer dans le chaos.
  const remaining = fullDeck.slice(INITIAL_HAND_SIZE * 2);
  let startIdx = remaining.findIndex(
    (c) => !['J', '7', 'A', 'JOKER'].includes(c.rank) && c.suit !== 'joker',
  );
  if (startIdx === -1) startIdx = 0;

  const startCard = remaining[startIdx];
  const deck = remaining.filter((_, i) => i !== startIdx);

  return {
    deck,
    discard: [startCard],
    playerHand,
    opponentHand,
    currentPlayer: 'player',
    activeSuit: startCard.suit,
    status: 'playing',
    pendingDraws: 0,
    message: 'À toi de jouer !',
    lastPlayedId: null,
    turn: 0,
    playerCheckSaid: false,
    playerGamesSaid: false,
    dealing: true,
    dealingIndex: 0,
  };
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...makeInitialState(),
  wins: 0,
  losses: 0,

  startNewGame: () => {
    const initial = makeInitialState();
    set({
      ...initial,
    });
  },

  playCard: (cardId: string) => {
    const state = get();
    if (state.status !== 'playing' || state.currentPlayer !== 'player') return;

    const card = state.playerHand.find((c) => c.id === cardId);
    if (!card) return;

    const topCard = state.discard[state.discard.length - 1] ?? null;
    if (!isPlayable(card, topCard, state.activeSuit, state.pendingDraws)) {
      set({ message: 'Carte non jouable !' });
      return;
    }

    const newHand = state.playerHand.filter((c) => c.id !== cardId);
    const newDiscard = [...state.discard, card];
    const effect = getCardEffect(card);

    // ─── Règle « CHECK / GAMES » ──────────────────────────────────────
    // newHand = 1 → il devait dire CHECK avant de poser cette carte.
    // newHand = 0 → il devait dire GAMES avant de poser sa dernière carte.
    let penalty: { drawn: Card[]; deck: Card[]; discard: Card[] } | null = null;
    let penaltyMsg = '';

    if (newHand.length === 1 && !state.playerCheckSaid) {
      penalty = drawCards(state.deck, newDiscard, 2);
      penaltyMsg = '⚠️ Tu as oublié de dire « CHECK » ! +2 cartes';
    } else if (newHand.length === 0 && !state.playerGamesSaid) {
      // La victoire est ANNULÉE : le joueur pioche 2 cartes au lieu de gagner.
      penalty = drawCards(state.deck, newDiscard, 2);
      penaltyMsg = '⚠️ Tu as oublié de dire « GAMES » ! Victoire annulée, +2 cartes';
    }

    // Victoire validée (la dernière carte a bien été annoncée par GAMES).
    if (newHand.length === 0 && !penalty) {
      set({
        playerHand: newHand,
        discard: newDiscard,
        status: 'won',
        message: '🏆 GAMES ! Tu as gagné !',
        lastPlayedId: card.id,
        wins: state.wins + 1,
        playerCheckSaid: false,
        playerGamesSaid: false,
      });
      return;
    }

    // Si pénalité, on applique : on ajoute les 2 cartes piochées à la main.
    if (penalty) {
      const handAfterPenalty = [...newHand, ...penalty.drawn];
      const newPendingDraws = state.pendingDraws + effect.drawPenalty;
      const nextPlayer: Player = effect.replay ? 'player' : 'opponent';
      const newActiveSuit = card.suit === 'joker' ? state.activeSuit : card.suit;
      // Note : on reset les flags car la situation a changé (la main grossit).
      set({
        playerHand: handAfterPenalty,
        discard: penalty.discard,
        deck: penalty.deck,
        activeSuit: effect.wild || effect.jokerWild ? state.activeSuit : newActiveSuit,
        currentPlayer: effect.wild || effect.jokerWild ? state.currentPlayer : nextPlayer,
        pendingDraws: newPendingDraws,
        status: effect.wild || effect.jokerWild ? 'choosing-suit' : state.status,
        message: penaltyMsg,
        lastPlayedId: card.id,
        turn: state.turn + 1,
        playerCheckSaid: false,
        playerGamesSaid: false,
      });
      if (!(effect.wild || effect.jokerWild) && nextPlayer === 'opponent') {
        setTimeout(() => get()._runAiTurn(), 1100);
      }
      return;
    }

    // Reset des flags CHECK/GAMES :
    //  - check est « consommé » dès qu'on passe à 1 carte
    //  - les deux sont remis à zéro si la main remonte au-dessus de 2
    const resetFlags = {
      playerCheckSaid: newHand.length === 2 ? state.playerCheckSaid : false,
      playerGamesSaid: newHand.length === 1 ? state.playerGamesSaid : false,
    };

    // Valet OU Joker -> choix de couleur obligatoire (wildcard).
    // Si Valet joué pendant une pioche, il BLOQUE la pioche (pendingDraws remis à 0)
    const blockedDraw = effect.wild && state.pendingDraws > 0;
    if (effect.wild || effect.jokerWild) {
      set({
        playerHand: newHand,
        discard: newDiscard,
        pendingDraws: blockedDraw ? 0 : state.pendingDraws + effect.drawPenalty,
        status: 'choosing-suit',
        message: blockedDraw ? 'Valet bloque la pioche ! Choisis une couleur' : effect.message,
        lastPlayedId: card.id,
        ...resetFlags,
      });
      return;
    }

    const newPendingDraws = state.pendingDraws + effect.drawPenalty;
    const nextPlayer: Player = effect.replay ? 'player' : 'opponent';
    const newActiveSuit = card.suit === 'joker' ? state.activeSuit : card.suit;

    set({
      playerHand: newHand,
      discard: newDiscard,
      activeSuit: newActiveSuit,
      currentPlayer: nextPlayer,
      pendingDraws: newPendingDraws,
      message: effect.message || (nextPlayer === 'player' ? 'À toi' : "À l'adversaire"),
      lastPlayedId: card.id,
      turn: state.turn + 1,
      ...resetFlags,
    });

    if (nextPlayer === 'opponent') {
      setTimeout(() => get()._runAiTurn(), 900);
    }
  },

  chooseSuit: (suit: Suit) => {
    const state = get();
    if (state.status !== 'choosing-suit') return;

    set({
      activeSuit: suit,
      status: 'playing',
      currentPlayer: 'opponent',
      message: `Couleur : ${suit}`,
      turn: state.turn + 1,
    });

    setTimeout(() => get()._runAiTurn(), 900);
  },

  drawCard: () => {
    const state = get();
    if (state.status !== 'playing' || state.currentPlayer !== 'player') return;

    // Resolve pending draws (+2 chain)
    const toDraw = state.pendingDraws > 0 ? state.pendingDraws : 1;
    const { drawn, deck, discard } = drawCards(state.deck, state.discard, toDraw);

    const newHand = [...state.playerHand, ...drawn];
    const wasPenalty = state.pendingDraws > 0;

    set({
      deck,
      discard,
      playerHand: newHand,
      pendingDraws: 0,
      currentPlayer: wasPenalty || toDraw > 1 ? 'opponent' : 'player',
      message: wasPenalty
        ? `Tu pioches ${toDraw} cartes`
        : 'Tu as pioché 1 carte',
      turn: state.turn + 1,
    });

    // If just penalty draw, pass turn
    if (wasPenalty) {
      setTimeout(() => get()._runAiTurn(), 900);
    } else {
      // Check if drawn card is playable - keep turn so player can play it
      const topCard = discard[discard.length - 1] ?? null;
      const playableAfterDraw = hasPlayableCard(newHand, topCard, get().activeSuit, 0);
      if (!playableAfterDraw) {
        // Must pass
        setTimeout(() => {
          set({ currentPlayer: 'opponent', message: 'Tour passé' });
          setTimeout(() => get()._runAiTurn(), 600);
        }, 600);
      }
    }
  },

  passTurn: () => {
    const state = get();
    if (state.status !== 'playing' || state.currentPlayer !== 'player') return;
    set({ currentPlayer: 'opponent', message: 'Tour passé' });
    setTimeout(() => get()._runAiTurn(), 700);
  },

  sayCheck: () => {
    const state = get();
    if (state.status !== 'playing') return;
    // Légal seulement quand on a 2 cartes (la prochaine sera l'avant-dernière à 1).
    if (state.playerHand.length !== 2) return;
    if (state.playerCheckSaid) return;
    set({ playerCheckSaid: true, message: '✅ CHECK !' });
  },

  sayGames: () => {
    const state = get();
    if (state.status !== 'playing') return;
    if (state.playerHand.length !== 1) return;
    if (state.playerGamesSaid) return;
    set({ playerGamesSaid: true, message: '✅ GAMES !' });
  },

  _runAiTurn: () => {
    const state = get();
    if (state.status !== 'playing' || state.currentPlayer !== 'opponent') return;

    const topCard = state.discard[state.discard.length - 1] ?? null;
    const card = aiChooseCard(state.opponentHand, topCard, state.activeSuit, state.pendingDraws);

    if (!card) {
      // AI must draw
      const toDraw = state.pendingDraws > 0 ? state.pendingDraws : 1;
      const { drawn, deck, discard } = drawCards(state.deck, state.discard, toDraw);
      const newHand = [...state.opponentHand, ...drawn];

      set({
        deck,
        discard,
        opponentHand: newHand,
        pendingDraws: 0,
        message: `L'adversaire pioche ${toDraw}`,
        turn: state.turn + 1,
      });

      // After draw, try to play once more if not penalty
      if (state.pendingDraws === 0) {
        setTimeout(() => {
          const s = get();
          const top = s.discard[s.discard.length - 1] ?? null;
          const c = aiChooseCard(s.opponentHand, top, s.activeSuit, 0);
          if (c) {
            // Play it
            playAiCard(c, get, set);
          } else {
            set({ currentPlayer: 'player', message: 'À toi de jouer' });
          }
        }, 700);
      } else {
        setTimeout(() => set({ currentPlayer: 'player', message: 'À toi de jouer' }), 700);
      }
      return;
    }

    playAiCard(card, get, set);
  },
}));

function playAiCard(
  card: Card,
  get: () => GameStore,
  set: (partial: Partial<GameStore>) => void,
) {
  const state = get();
  const newHand = state.opponentHand.filter((c) => c.id !== card.id);
  const newDiscard = [...state.discard, card];
  const effect = getCardEffect(card);

  // Win check
  if (newHand.length === 0) {
    set({
      opponentHand: newHand,
      discard: newDiscard,
      status: 'lost',
      message: 'L\'adversaire a gagné !',
      lastPlayedId: card.id,
      losses: state.losses + 1,
    });
    return;
  }

  // Valet ou Joker -> l'IA choisit la couleur la plus représentée dans sa main.
  let nextSuit: Suit = card.suit === 'joker' ? state.activeSuit : card.suit;
  let suitMsg = '';
  // Si Valet joué pendant pioche, il bloque la pioche
  const blockedDraw = effect.wild && state.pendingDraws > 0;
  if (effect.wild || effect.jokerWild) {
    nextSuit = aiChooseSuit(newHand);
    suitMsg = blockedDraw ? ` (bloque la pioche !)` : ` (${nextSuit})`;
  }

  const newPendingDraws = blockedDraw ? 0 : state.pendingDraws + effect.drawPenalty;
  // As : l'IA rejoue. Sinon, à toi.
  const nextPlayer: Player = effect.replay ? 'opponent' : 'player';

  set({
    opponentHand: newHand,
    discard: newDiscard,
    activeSuit: nextSuit,
    currentPlayer: nextPlayer,
    pendingDraws: newPendingDraws,
    message: (effect.message || 'À toi de jouer') + suitMsg,
    lastPlayedId: card.id,
    turn: state.turn + 1,
  });

  // If AI gets another turn (skip), re-run
  if (nextPlayer === 'opponent') {
    setTimeout(() => get()._runAiTurn(), 900);
  }
}
