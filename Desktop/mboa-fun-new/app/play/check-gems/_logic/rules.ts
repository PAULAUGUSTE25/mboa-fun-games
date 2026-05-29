import type { Card, Suit } from '../_types/card';
import { isJoker } from './deck';

/**
 * Check Gems — règles "Crazy Eights / Mau-Mau" :
 *  - Pose une carte si : même couleur active OU même rang
 *  - 7      → l'adversaire pioche 2 cartes
 *  - Joker  → l'adversaire pioche 4 cartes (wildcard, posable n'importe quand)
 *  - Valet  → wildcard, le joueur choisit la nouvelle couleur active
 *  - As     → le joueur rejoue (extra turn)
 *  - Cartes "draw" empilables : un 7 sur un 7, un Joker sur un Joker,
 *    un Joker sur un 7 ou un 7 sur un Joker — tout pour repasser la pioche.
 *  - Pioche vide → on remélange la défausse (sauf la carte du dessus).
 */

/** Cartes qui imposent une pioche à l'adversaire (peuvent contrer une pioche). */
function isDrawCard(card: Card): boolean {
  return card.rank === '7' || isJoker(card);
}

export function isPlayable(
  card: Card,
  topCard: Card | null,
  activeSuit: Suit,
  pendingDraws: number,
): boolean {
  if (!topCard) return true;

  // Pioche en attente : on peut contrer avec une carte "draw" (7, Joker) OU avec un Valet (J) qui bloque la pioche
  if (pendingDraws > 0) {
    return isDrawCard(card) || card.rank === 'J';
  }

  // 2 : passe-partout (toujours posable, comme un wildcard sans effet)
  if (card.rank === '2') return true;

  // Joker : toujours posable (wildcard absolue +4)
  if (isJoker(card)) return true;

  // Valet : toujours posable (wildcard couleur, peut bloquer une pioche)
  if (card.rank === 'J') return true;

  // Sinon : match couleur active OU même rang
  return card.suit === activeSuit || card.rank === topCard.rank;
}

export function hasPlayableCard(
  hand: Card[],
  topCard: Card | null,
  activeSuit: Suit,
  pendingDraws: number,
): boolean {
  return hand.some((c) => isPlayable(c, topCard, activeSuit, pendingDraws));
}

export interface PlayEffect {
  /** Carte qui rejoue (As) — le joueur garde la main. */
  replay: boolean;
  /** Pioche imposée à l'adversaire (s'empile sur pendingDraws). */
  drawPenalty: number;
  /** Wildcard couleur (Valet) — choix de la nouvelle suite. */
  wild: boolean;
  /** Wildcard absolue (Joker) — la "couleur active" devient celle choisie après. */
  jokerWild: boolean;
  message: string;
}

export function getCardEffect(card: Card): PlayEffect {
  if (isJoker(card)) {
    return {
      replay: false,
      drawPenalty: 4,
      wild: false,
      jokerWild: true,
      message: '🃏 +4 cartes ! Choisis une couleur',
    };
  }
  switch (card.rank) {
    case '2':
      return { replay: false, drawPenalty: 0, wild: false, jokerWild: false, message: '2 passe-partout !' };
    case '7':
      return { replay: false, drawPenalty: 2, wild: false, jokerWild: false, message: '+2 cartes !' };
    case 'J':
      return { replay: false, drawPenalty: 0, wild: true, jokerWild: false, message: 'Commande : choisis une couleur' };
    case 'A':
      return { replay: true, drawPenalty: 0, wild: false, jokerWild: false, message: 'Tu rejoues !' };
    default:
      return { replay: false, drawPenalty: 0, wild: false, jokerWild: false, message: '' };
  }
}

/** Heuristique IA : choisit la meilleure carte à jouer. */
export function aiChooseCard(
  hand: Card[],
  topCard: Card | null,
  activeSuit: Suit,
  pendingDraws: number,
): Card | null {
  const playable = hand.filter((c) => isPlayable(c, topCard, activeSuit, pendingDraws));
  if (playable.length === 0) return null;

  // Pioche en attente : contre avec joker (+4), puis Valet pour bloquer, puis 7 (+2)
  if (pendingDraws > 0) {
    return (
      playable.find((c) => isJoker(c)) ??
      playable.find((c) => c.rank === 'J') ??
      playable.find((c) => c.rank === '7') ??
      null
    );
  }

  // Sinon : préfère cartes spéciales (joker > A > J > 7 > 2 passe-partout) puis grosse carte normale.
  const joker = playable.find((c) => isJoker(c));
  if (joker) return joker;
  const ace = playable.find((c) => c.rank === 'A');
  if (ace) return ace;
  const jack = playable.find((c) => c.rank === 'J');
  if (jack) return jack;
  const seven = playable.find((c) => c.rank === '7');
  if (seven) return seven;
  const two = playable.find((c) => c.rank === '2');
  if (two) return two;

  // Carte normale : décharge les hauts rangs en premier.
  const rankOrder: Record<string, number> = {
    K: 13, Q: 12, '10': 10, '9': 9, '8': 8, '6': 6, '5': 5, '4': 4, '3': 3, '2': 2,
  };
  return playable.sort((a, b) => (rankOrder[b.rank] ?? 0) - (rankOrder[a.rank] ?? 0))[0];
}

/** L'IA choisit la couleur la plus représentée dans sa main (pour Valet/Joker). */
export function aiChooseSuit(hand: Card[]): Suit {
  const counts: Record<'hearts' | 'diamonds' | 'clubs' | 'spades', number> = {
    hearts: 0, diamonds: 0, clubs: 0, spades: 0,
  };
  for (const card of hand) {
    if (card.suit !== 'joker' && card.rank !== 'J') counts[card.suit]++;
  }
  return (Object.entries(counts) as ['hearts' | 'diamonds' | 'clubs' | 'spades', number][])
    .sort((a, b) => b[1] - a[1])[0][0];
}
