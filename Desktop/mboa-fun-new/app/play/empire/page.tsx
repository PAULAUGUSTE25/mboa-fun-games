'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Dices } from 'lucide-react';
import { GameShell } from '@/components/layout/game-shell';
import { ImageBoard, CELL_NAMES } from './_components/image-board';
import { Dice } from './_components/dice';
import { PlayerPanel } from './_components/player-panel';
import { StatusSelectModal } from './_components/status-select-modal';
import { ActionModal, type ActionModalAction } from './_components/action-modal';
import { AudioControls } from './_components/audio-controls';
import {
  playClick,
  playDice,
  playGain,
  playLoss,
  playCard,
  playPrison,
  playBuy,
  resumeAudio,
} from './_audio/sounds';
import type { Player, StatusKey } from './_types/empire';
import { CELL_META, isBuyable, computeBaseRent } from './_data/cells';
import { STATUS_BY_KEY } from './_data/statuses';
import {
  CHANCE_DECK,
  CAISSE_COMMUNE_DECK,
  drawCard,
  type CardDef,
  type CardEffect,
} from './_data/cards';
import {
  AEROPORT_SCENARIOS,
  PORT_SCENARIOS,
  GARE_SCENARIOS,
  PLACE_FETES_SCENARIOS,
  TRESOR_SCENARIOS,
  STADE_QUIZZES,
  STADE_QUIZZES_EXTRA,
  CHANCE_QUIZZES,
  CITE_U_QUIZZES,
  MARCHE_QUIZZES,
  URBAIN_QUIZZES,
  ADMIN_QUIZZES,
  PALAIS_QUIZZES,
  HOTEL_QUIZZES,
  ROUTE_QUIZZES,
  ECOLE_LEADERS_QUIZZES,
  COMMERCE_QUIZZES,
  INDUSTRIE_QUIZZES,
  PRISON_VERDICTS,
  pickRandom,
  type ChoiceScenario,
  type ChoiceOption,
  type Quiz,
} from './_data/events';

const ALL_STADE_QUIZZES: Quiz[] = [...STADE_QUIZZES, ...STADE_QUIZZES_EXTRA];

const N_CELLS = CELL_META.length; // 28
const STEP_MS = 260;
const PASS_BONUS = 200;
const LAND_DEPART_BONUS = 250;
const IMPOTS_BASE = 200;

function makePlayer(
  id: string,
  name: string,
  token: string,
  color: string,
  isAI = false,
): Player {
  return {
    id,
    name,
    token,
    color,
    position: 0,
    money: 1500,
    properties: [],
    inJail: false,
    jailTurns: 0,
    bankrupt: false,
    statusKey: null,
    reputation: 0,
    loanRemaining: 0,
    hasUsine: false,
    skipNextTurn: false,
    hasLeadershipCard: false,
    improvements: {},
    isAI,
  };
}

const INITIAL_PLAYERS: Player[] = [
  makePlayer('p1', 'Toi', '👑', '#94d3c1', false),
  makePlayer('p2', 'Computer', '�', '#e9c349', true),
];

// ─────────────────────────────────────────────────────────────────────────────
// Prompt types — drive the action modal
// ─────────────────────────────────────────────────────────────────────────────

type Prompt =
  | {
      kind: 'buy';
      playerIdx: number;
      cellIdx: number;
      effectivePrice: number;
      basePrice: number;
      discountReason?: string;
    }
  | {
      kind: 'rent-paid';
      payerIdx: number;
      ownerIdx: number;
      cellIdx: number;
      amount: number;
      sectorBonus: boolean;
    }
  | {
      kind: 'own-property';
      playerIdx: number;
      cellIdx: number;
    }
  | {
      kind: 'card';
      playerIdx: number;
      deck: 'chance' | 'caisse' | 'tresor';
      card: CardDef;
    }
  | {
      kind: 'impots';
      playerIdx: number;
      total: number;
      breakdown: string[];
    }
  | {
      kind: 'event';
      playerIdx: number;
      title: string;
      message: string;
      delta: number; // positive = gain, negative = pay
      /** When set, after Continue the player is offered to buy / rent this cell. */
      chainPropertyCellIdx?: number;
    }
  | {
      kind: 'depart-bonus';
      playerIdx: number;
      amount: number;
      passed: boolean;
    }
  | {
      kind: 'goto';
      playerIdx: number;
      targetIdx: number;
      reason: string;
    }
  | {
      kind: 'choice';
      playerIdx: number;
      scenario: ChoiceScenario;
      chainPropertyCellIdx?: number;
    }
  | {
      kind: 'quiz';
      playerIdx: number;
      quiz: Quiz;
      chainPropertyCellIdx?: number;
    }
  | null;

export default function EmpireGamePage() {
  const [players, setPlayers] = useState<Player[]>(INITIAL_PLAYERS);
  const [activePlayerIdx, setActivePlayerIdx] = useState(0);
  const [dice, setDice] = useState<[number, number]>([1, 1]);
  const [rolling, setRolling] = useState(false);
  const [moving, setMoving] = useState(false);
  const [lastRoll, setLastRoll] = useState<number | null>(null);
  const [showDebug, setShowDebug] = useState(false);
  const [phase, setPhase] = useState<'choose-statuses' | 'play'>('choose-statuses');
  const [statusSelectIdx, setStatusSelectIdx] = useState(0);
  const [prompt, setPrompt] = useState<Prompt>(null);
  const [consecutiveDoubles, setConsecutiveDoubles] = useState(0);
  const [log, setLog] = useState<string[]>([]);

  const activePlayer = players[activePlayerIdx];
  const busy = rolling || moving || prompt !== null;

  // Use a ref to keep the latest players array in async callbacks (setTimeout)
  const playersRef = useRef(players);
  playersRef.current = players;

  const pushLog = useCallback((msg: string) => {
    setLog((prev) => [msg, ...prev].slice(0, 30));
  }, []);

  // ───────────────────────────────────────────────────────────────────────────
  // Helpers
  // ───────────────────────────────────────────────────────────────────────────

  const ownerOf = useCallback(
    (cellIdx: number): number | null => {
      const ownerIdx = playersRef.current.findIndex((p) =>
        p.properties.includes(cellIdx),
      );
      return ownerIdx === -1 ? null : ownerIdx;
    },
    [],
  );

  const sectorComplete = useCallback(
    (ownerIdx: number, sector: string | undefined): boolean => {
      if (!sector) return false;
      const sectorCells = CELL_META.filter((c) => c.sector === sector && isBuyable(c));
      if (sectorCells.length === 0) return false;
      const owner = playersRef.current[ownerIdx];
      return sectorCells.every((c) => owner.properties.includes(c.index));
    },
    [],
  );

  const updatePlayer = useCallback(
    (idx: number, patch: Partial<Player> | ((p: Player) => Partial<Player>)) => {
      setPlayers((prev) =>
        prev.map((p, i) => {
          if (i !== idx) return p;
          const partial = typeof patch === 'function' ? patch(p) : patch;
          return { ...p, ...partial };
        }),
      );
    },
    [],
  );

  const addMoney = useCallback(
    (idx: number, delta: number) => {
      setPlayers((prev) =>
        prev.map((p, i) => (i === idx ? { ...p, money: p.money + delta } : p)),
      );
    },
    [],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Status selection (Phase 1+2 setup)
  // ───────────────────────────────────────────────────────────────────────────

  const handleStatusSelect = useCallback(
    (key: StatusKey) => {
      // Player 1 picks; the other players (AI) auto-pick a different status,
      // and we start the game immediately.
      const allKeys: StatusKey[] = [
        'etudiant',
        'administrateur',
        'commercant',
        'sportif',
        'transporteur',
        'artisan',
      ];
      const taken = new Set<StatusKey>([key]);
      setPlayers((prev) =>
        prev.map((p, i) => {
          if (i === 0) {
            return { ...p, statusKey: key };
          }
          // Pick the first remaining status for AI players
          const remaining = allKeys.find((k) => !taken.has(k))!;
          taken.add(remaining);
          return { ...p, statusKey: remaining };
        }),
      );
      pushLog(`${players[0].name} → ${STATUS_BY_KEY[key].label}`);
      setPhase('play');
    },
    [players, pushLog],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Roll & move
  // ───────────────────────────────────────────────────────────────────────────

  const handleRoll = useCallback(() => {
    if (busy || phase !== 'play') return;
    resumeAudio();
    playDice();
    setRolling(true);
    setLastRoll(null);

    const interval = setInterval(() => {
      setDice([
        (Math.floor(Math.random() * 6) + 1) as number,
        (Math.floor(Math.random() * 6) + 1) as number,
      ]);
    }, 80);

    setTimeout(() => {
      clearInterval(interval);
      const d1 = Math.floor(Math.random() * 6) + 1;
      const d2 = Math.floor(Math.random() * 6) + 1;
      const total = d1 + d2;
      const isDouble = d1 === d2;
      setDice([d1, d2]);
      setLastRoll(total);
      setRolling(false);

      const newDoubles = isDouble ? consecutiveDoubles + 1 : 0;
      setConsecutiveDoubles(newDoubles);

      pushLog(
        `🎲 ${activePlayer.name} fait ${d1}+${d2}=${total}${isDouble ? ' (double !)' : ''}`,
      );

      // 3 doubles in a row → straight to IMPÔTS, no movement animation
      if (newDoubles >= 3) {
        playPrison();
        pushLog(`🚨 3 doubles → ${activePlayer.name} est convoqué aux IMPÔTS !`);
        updatePlayer(activePlayerIdx, { position: 8 });
        setConsecutiveDoubles(0);
        // Trigger IMPÔTS landing
        setTimeout(() => triggerImpots(activePlayerIdx), 600);
        return;
      }

      // Animate step by step
      setMoving(true);
      const startPos = activePlayer.position;
      let crossedDepart = false;
      for (let step = 1; step <= total; step++) {
        setTimeout(() => {
          setPlayers((prev) =>
            prev.map((p, i) => {
              if (i !== activePlayerIdx) return p;
              const newPos = (p.position + 1) % N_CELLS;
              return { ...p, position: newPos };
            }),
          );
        }, step * STEP_MS);
      }

      setTimeout(() => {
        setMoving(false);
        const finalPos = (startPos + total) % N_CELLS;
        crossedDepart = startPos + total >= N_CELLS;

        // Apply DÉPART bonus
        if (finalPos === 0) {
          // Landed on DÉPART
          repayLoanAndPay(activePlayerIdx, LAND_DEPART_BONUS);
          pushLog(`🏁 ${activePlayer.name} atterrit sur DÉPART : +${LAND_DEPART_BONUS} 💎`);
          setPrompt({
            kind: 'depart-bonus',
            playerIdx: activePlayerIdx,
            amount: LAND_DEPART_BONUS,
            passed: false,
          });
          return;
        } else if (crossedDepart) {
          // Passed DÉPART
          repayLoanAndPay(activePlayerIdx, PASS_BONUS);
          pushLog(`➡️ ${activePlayer.name} passe par DÉPART : +${PASS_BONUS} 💎`);
        }

        // Resolve landing on the final cell
        resolveLanding(activePlayerIdx, finalPos);
      }, total * STEP_MS + 280);
    }, 800);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [busy, phase, consecutiveDoubles, activePlayer, activePlayerIdx]);

  /** Pay player on DÉPART, taking loan reimbursement into account. */
  const repayLoanAndPay = useCallback(
    (playerIdx: number, gross: number) => {
      const p = playersRef.current[playerIdx];
      if (p.loanRemaining > 0) {
        const repay = Math.min(50, p.loanRemaining); // 50 per pass per spec
        updatePlayer(playerIdx, (curr) => ({
          money: curr.money + gross - repay,
          loanRemaining: Math.max(0, curr.loanRemaining - repay),
        }));
        pushLog(`💳 ${p.name} rembourse ${repay} sur son prêt (reste ${Math.max(0, p.loanRemaining - repay)})`);
      } else {
        addMoney(playerIdx, gross);
      }
    },
    [updatePlayer, addMoney, pushLog],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Landing resolution
  // ───────────────────────────────────────────────────────────────────────────

  const resolveLanding = useCallback(
    (playerIdx: number, cellIdx: number) => {
      const meta = CELL_META[cellIdx];
      const player = playersRef.current[playerIdx];

      switch (meta.type) {
        case 'depart':
          // Already handled above (landing bonus). Just end turn.
          finishTurn();
          return;

        case 'impots':
          triggerImpots(playerIdx);
          return;

        case 'chance':
          // Cameroon-themed quiz instead of plain card
          playCard();
          setPrompt({ kind: 'quiz', playerIdx, quiz: pickRandom(CHANCE_QUIZZES) });
          return;

        case 'caisse-commune':
          drawDeckCard(playerIdx, 'caisse');
          return;

        case 'tresor':
          // Cameroon-themed choice scenario
          setPrompt({
            kind: 'choice',
            playerIdx,
            scenario: pickRandom(TRESOR_SCENARIOS),
          });
          return;

        case 'prison-visit': {
          // The machine randomly decides : simple visite OR peine (1-3 tours)
          const verdict = pickRandom(PRISON_VERDICTS);
          playPrison();
          // Apply fine immediately
          if (verdict.fine > 0) addMoney(playerIdx, -verdict.fine);
          // Apply jail turns
          if (verdict.skipTurns > 0) {
            updatePlayer(playerIdx, {
              inJail: true,
              jailTurns: verdict.skipTurns,
            });
          }
          pushLog(
            `${verdict.skipTurns > 0 ? '�' : '�'} ${player.name} → ${verdict.title}` +
              (verdict.skipTurns > 0 ? ` (${verdict.skipTurns} tour${verdict.skipTurns > 1 ? 's' : ''})` : '') +
              (verdict.fine > 0 ? ` − amende ${verdict.fine} 💎` : ''),
          );
          setPrompt({
            kind: 'event',
            playerIdx,
            title: verdict.title,
            message:
              verdict.message +
              (verdict.skipTurns > 0
                ? `\n⏸️ Tu sautes ${verdict.skipTurns} tour${verdict.skipTurns > 1 ? 's' : ''}.`
                : ''),
            delta: -verdict.fine,
          });
          return;
        }

        case 'place-fetes':
          setPrompt({
            kind: 'choice',
            playerIdx,
            scenario: pickRandom(PLACE_FETES_SCENARIOS),
          });
          return;

        case 'village-artisanal':
          handleVillageArtisanal(playerIdx, cellIdx);
          return;

        case 'cite-u':
          // University quiz; Étudiant status still gets a side bonus.
          if (player.statusKey === 'etudiant') {
            playGain();
            addMoney(playerIdx, 60);
            pushLog(`🎓 ${player.name} bonus étudiant : +60 💎`);
          }
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(CITE_U_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'quartier-admin':
          // Administrator status still gets a side bonus, then admin quiz + buy/rent.
          if (player.statusKey === 'administrateur') {
            playGain();
            addMoney(playerIdx, 80);
            pushLog(`🏛️ ${player.name} bonus administrateur : +80 💎`);
          }
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(ADMIN_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'aeroport':
          // Public infrastructure: not buyable. Only scenario / education.
          setPrompt({
            kind: 'choice',
            playerIdx,
            scenario: pickRandom(AEROPORT_SCENARIOS),
          });
          return;

        case 'transport':
          // Public infrastructure: not buyable. Only scenario / education.
          if (cellIdx === 17) {
            setPrompt({
              kind: 'choice',
              playerIdx,
              scenario: pickRandom(PORT_SCENARIOS),
            });
            return;
          }
          if (cellIdx === 16) {
            setPrompt({
              kind: 'choice',
              playerIdx,
              scenario: pickRandom(GARE_SCENARIOS),
            });
            return;
          }
          // No other transport cells exist; safety fallthrough.
          return;

        case 'stade':
          // Lions Indomptables quiz → then offer to buy / pay rent.
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(ALL_STADE_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'marche':
          // Marché quiz → then offer to buy / pay rent.
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(MARCHE_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'property':
          // Residentiel cells (1 Quartier, 19 Maetur, 20 Bd Liberté)
          // → urban quiz then buy/rent.
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(URBAIN_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'route-palmiers':
          // Public infrastructure: not buyable. Quiz only.
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(ROUTE_QUIZZES),
          });
          return;

        case 'ecole-leaders':
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(ECOLE_LEADERS_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'hotel-amba':
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(HOTEL_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'palais-royal':
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(PALAIS_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'centre-commercial':
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(COMMERCE_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        case 'zone-industrielle':
          playCard();
          setPrompt({
            kind: 'quiz',
            playerIdx,
            quiz: pickRandom(INDUSTRIE_QUIZZES),
            chainPropertyCellIdx: cellIdx,
          });
          return;

        default:
          handleStandardProperty(playerIdx, cellIdx);
          return;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [],
  );

  // ── IMPÔTS ────────────────────────────────────────────────────────────────
  const triggerImpots = useCallback(
    (playerIdx: number) => {
      const p = playersRef.current[playerIdx];
      const breakdown: string[] = [`Base : ${IMPOTS_BASE} 💎`];
      let total = IMPOTS_BASE;
      const ownsIndustrie = p.properties.includes(14);
      const ownsCentreCo = p.properties.includes(11);
      if (ownsIndustrie) {
        total += 50;
        breakdown.push('+50 (Zone Industrielle)');
      }
      if (ownsCentreCo) {
        total += 50;
        breakdown.push('+50 (Centre Commercial)');
      }
      if (p.money > 2000) {
        total += 100;
        breakdown.push('+100 (richesse > 2000)');
      }
      setPrompt({ kind: 'impots', playerIdx, total, breakdown });
    },
    [],
  );

  const confirmImpots = useCallback(() => {
    if (!prompt || prompt.kind !== 'impots') return;
    const { playerIdx, total } = prompt;
    playLoss();
    addMoney(playerIdx, -total);
    pushLog(`💸 ${playersRef.current[playerIdx].name} paie ${total} 💎 d'impôts`);
    setPrompt(null);
    finishTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, addMoney, pushLog]);

  // ── Card draw ─────────────────────────────────────────────────────────────
  const drawDeckCard = useCallback(
    (playerIdx: number, deck: 'chance' | 'caisse' | 'tresor') => {
      const card =
        deck === 'chance'
          ? drawCard(CHANCE_DECK)
          : drawCard(CAISSE_COMMUNE_DECK);
      // 'tresor' uses the Caisse Commune deck for now
      const usedCard = deck === 'tresor' ? drawCard(CAISSE_COMMUNE_DECK) : card;
      playCard();
      setPrompt({ kind: 'card', playerIdx, deck, card: usedCard });
    },
    [],
  );

  const confirmCard = useCallback(() => {
    if (!prompt || prompt.kind !== 'card') return;
    const { playerIdx, card } = prompt;
    applyCardEffect(playerIdx, card.effect);
    setPrompt(null);
    // applyCardEffect handles ending the turn (or re-triggering)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt]);

  const applyCardEffect = useCallback(
    (playerIdx: number, effect: CardEffect) => {
      const p = playersRef.current[playerIdx];
      switch (effect.kind) {
        case 'gain':
          playGain();
          addMoney(playerIdx, effect.amount);
          pushLog(`🎁 ${p.name} gagne ${effect.amount} 💎`);
          finishTurn();
          break;
        case 'pay':
          playLoss();
          addMoney(playerIdx, -effect.amount);
          pushLog(`💸 ${p.name} paie ${effect.amount} 💎`);
          finishTurn();
          break;
        case 'goto': {
          updatePlayer(playerIdx, { position: effect.cellIndex });
          pushLog(`🚀 ${p.name} se déplace vers ${CELL_NAMES[effect.cellIndex]}`);
          // After teleport, resolve the new cell (without DÉPART bonus to keep simple)
          setTimeout(() => resolveLanding(playerIdx, effect.cellIndex), 500);
          break;
        }
        case 'skip-turn':
          updatePlayer(playerIdx, { skipNextTurn: true });
          pushLog(`⏭️ ${p.name} passera son prochain tour`);
          finishTurn();
          break;
        case 'all-pay-me': {
          playGain();
          let collected = 0;
          setPlayers((prev) =>
            prev.map((pl, i) => {
              if (i === playerIdx) return pl;
              collected += effect.amount;
              return { ...pl, money: pl.money - effect.amount };
            }),
          );
          addMoney(playerIdx, collected);
          pushLog(`🎉 ${p.name} encaisse ${collected} 💎 des autres joueurs`);
          finishTurn();
          break;
        }
        case 'all-gain':
          playGain();
          setPlayers((prev) =>
            prev.map((pl) => ({ ...pl, money: pl.money + effect.amount })),
          );
          pushLog(`🎉 Tous les joueurs gagnent ${effect.amount} 💎`);
          finishTurn();
          break;
        case 'play-again':
          pushLog(`🎲 ${p.name} rejoue !`);
          // Don't end turn; let the same player roll again.
          break;
        case 'gain-if-status':
          if (p.statusKey === effect.status) {
            addMoney(playerIdx, effect.amount);
            pushLog(`🎓 ${p.name} bénéficie de son statut : +${effect.amount} 💎`);
          } else {
            pushLog(`📭 Carte sans effet pour ${p.name} (mauvais statut)`);
          }
          finishTurn();
          break;
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addMoney, updatePlayer, pushLog],
  );

  // ── Standard property (buy / rent) ────────────────────────────────────────
  const handleStandardProperty = useCallback(
    (playerIdx: number, cellIdx: number) => {
      const meta = CELL_META[cellIdx];
      const player = playersRef.current[playerIdx];

      if (!isBuyable(meta) || meta.price === undefined) {
        finishTurn();
        return;
      }

      const owner = ownerOf(cellIdx);

      if (owner === null) {
        // Unowned: offer to buy with eventual status discount
        const { effectivePrice, basePrice, discountReason } = computeBuyPrice(
          meta,
          player.statusKey,
        );
        setPrompt({
          kind: 'buy',
          playerIdx,
          cellIdx,
          effectivePrice,
          basePrice,
          discountReason,
        });
        return;
      }

      if (owner === playerIdx) {
        // Own property
        setPrompt({ kind: 'own-property', playerIdx, cellIdx });
        return;
      }

      // Pay rent
      const baseRent = computeBaseRent(meta);
      const sectorBonus = sectorComplete(owner, meta.sector);
      const amount = sectorBonus ? baseRent * 2 : baseRent;
      playLoss();
      addMoney(playerIdx, -amount);
      addMoney(owner, amount);
      const ownerName = playersRef.current[owner].name;
      pushLog(
        `💰 ${player.name} paie ${amount} 💎 de loyer à ${ownerName} (${meta.name})${sectorBonus ? ' [secteur ×2]' : ''}`,
      );
      setPrompt({
        kind: 'rent-paid',
        payerIdx: playerIdx,
        ownerIdx: owner,
        cellIdx,
        amount,
        sectorBonus,
      });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownerOf, sectorComplete, addMoney, pushLog],
  );

  /** Compute buy price with status-based discounts. */
  function computeBuyPrice(
    meta: ReturnType<() => typeof CELL_META[number]>,
    statusKey: StatusKey | null,
  ): { basePrice: number; effectivePrice: number; discountReason?: string } {
    const basePrice = meta.price ?? 0;
    if (statusKey === 'commercant' && (meta.type === 'marche' || meta.type === 'centre-commercial')) {
      return {
        basePrice,
        effectivePrice: Math.max(0, basePrice - 50),
        discountReason: 'Commerçant : −50',
      };
    }
    if (statusKey === 'etudiant' && meta.index === 1 /* Quartier Résidentiel */) {
      return {
        basePrice,
        effectivePrice: Math.max(0, basePrice - 20),
        discountReason: 'Étudiant : −20',
      };
    }
    return { basePrice, effectivePrice: basePrice };
  }

  const confirmBuy = useCallback(() => {
    if (!prompt || prompt.kind !== 'buy') return;
    const { playerIdx, cellIdx, effectivePrice } = prompt;
    const p = playersRef.current[playerIdx];
    if (p.money < effectivePrice) {
      // Should not happen because button is disabled, but guard anyway.
      setPrompt(null);
      finishTurn();
      return;
    }
    playBuy();
    updatePlayer(playerIdx, (curr) => ({
      money: curr.money - effectivePrice,
      properties: [...curr.properties, cellIdx],
    }));
    pushLog(`🏠 ${p.name} achète ${CELL_META[cellIdx].name} pour ${effectivePrice} 💎`);
    setPrompt(null);
    finishTurn();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, updatePlayer, pushLog]);

  const declineBuy = useCallback(() => {
    setPrompt(null);
    finishTurn();
  }, []);

  // ── Cité U / Quartier Admin (status bonus + buyable) ──────────────────────
  const handleSpecialBuyableWithStatus = useCallback(
    (
      playerIdx: number,
      cellIdx: number,
      bonusStatus: StatusKey,
      gainIfStatus: number,
      payIfNotStatus: number,
    ) => {
      const p = playersRef.current[playerIdx];
      const meta = CELL_META[cellIdx];
      const owner = ownerOf(cellIdx);

      if (p.statusKey === bonusStatus) {
        playGain();
        addMoney(playerIdx, gainIfStatus);
        pushLog(`🎓 ${p.name} reçoit ${gainIfStatus} 💎 (statut) sur ${meta.name}`);
      } else if (owner !== null && owner !== playerIdx) {
        // Pay rent like a normal property
        handleStandardProperty(playerIdx, cellIdx);
        return;
      } else {
        // Pay status tax to bank (or to a player with that status if any)
        const statusOwnerIdx = playersRef.current.findIndex(
          (pl) => pl.statusKey === bonusStatus,
        );
        if (statusOwnerIdx !== -1 && statusOwnerIdx !== playerIdx) {
          playLoss();
          addMoney(playerIdx, -payIfNotStatus);
          addMoney(statusOwnerIdx, payIfNotStatus);
          pushLog(
            `📜 ${p.name} paie ${payIfNotStatus} 💎 à ${playersRef.current[statusOwnerIdx].name} (${meta.name})`,
          );
        } else {
          playLoss();
          addMoney(playerIdx, -payIfNotStatus);
          pushLog(`📜 ${p.name} paie ${payIfNotStatus} 💎 (${meta.name})`);
        }
      }

      // After status bonus/tax, still offer to buy if unowned
      if (owner === null && isBuyable(meta)) {
        const { effectivePrice, basePrice, discountReason } = computeBuyPrice(
          meta,
          p.statusKey,
        );
        setPrompt({
          kind: 'buy',
          playerIdx,
          cellIdx,
          effectivePrice,
          basePrice,
          discountReason,
        });
      } else {
        finishTurn();
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [ownerOf, addMoney, pushLog, handleStandardProperty],
  );

  // ── Village Artisanal ─────────────────────────────────────────────────────
  const handleVillageArtisanal = useCallback(
    (playerIdx: number, cellIdx: number) => {
      const p = playersRef.current[playerIdx];
      if (p.statusKey === 'artisan') {
        playGain();
        addMoney(playerIdx, 80);
        pushLog(`🎨 ${p.name} reçoit 80 💎 au Village Artisanal`);
        setPrompt({
          kind: 'event',
          playerIdx,
          title: 'Village Artisanal',
          message: 'Tes ventes artisanales rapportent gros !',
          delta: 80,
        });
      } else {
        playLoss();
        addMoney(playerIdx, -40);
        pushLog(`🎁 ${p.name} achète un souvenir : −40 💎`);
        setPrompt({
          kind: 'event',
          playerIdx,
          title: 'Village Artisanal',
          message: 'Tu craques pour un souvenir...',
          delta: -40,
        });
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addMoney, pushLog],
  );

  // ── Place des Fêtes ───────────────────────────────────────────────────────
  const handlePlaceFetes = useCallback(
    (playerIdx: number) => {
      const p = playersRef.current[playerIdx];
      const roll = Math.floor(Math.random() * 6) + 1;
      let title = 'Place des Fêtes';
      let message = '';
      let delta = 0;
      let skip = false;
      switch (roll) {
        case 1:
          message = 'Tu finances la fête !';
          delta = -100;
          break;
        case 2:
          message = 'Tu as trop dansé... tu rateras ton prochain tour.';
          skip = true;
          break;
        case 3:
          message = 'Soirée tranquille. Rien ne se passe.';
          break;
        case 4:
          message = 'Petits gains de la soirée.';
          delta = 50;
          break;
        case 5:
          message = 'La nuit fut profitable.';
          delta = 100;
          break;
        case 6:
          message = 'Gros concert ! Tous les joueurs te paient 30 💎';
          break;
      }
      if (delta > 0) playGain();
      else if (delta < 0) playLoss();
      if (delta !== 0) addMoney(playerIdx, delta);
      if (skip) updatePlayer(playerIdx, { skipNextTurn: true });
      if (roll === 6) {
        let collected = 0;
        setPlayers((prev) =>
          prev.map((pl, i) => {
            if (i === playerIdx) return pl;
            collected += 30;
            return { ...pl, money: pl.money - 30 };
          }),
        );
        addMoney(playerIdx, collected);
        delta = collected;
      }
      pushLog(`🎉 ${p.name} → Place des Fêtes (dé=${roll}) ${delta !== 0 ? `${delta > 0 ? '+' : ''}${delta} 💎` : skip ? '(passe son prochain tour)' : ''}`);
      setPrompt({ kind: 'event', playerIdx, title, message, delta });
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [addMoney, updatePlayer, pushLog],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Choice scenario & Quiz handlers
  // ───────────────────────────────────────────────────────────────────────────

  const applyChoiceOption = useCallback(
    (playerIdx: number, option: ChoiceOption, chainPropertyCellIdx?: number) => {
      const p = playersRef.current[playerIdx];
      const eff = option.effect;
      const mkEvent = (delta: number) => ({
        kind: 'event' as const,
        playerIdx,
        title: option.label,
        message: eff.flavor,
        delta,
        chainPropertyCellIdx,
      });
      switch (eff.kind) {
        case 'gain':
          playGain();
          addMoney(playerIdx, eff.amount);
          pushLog(`✅ ${p.name} : ${option.label} → +${eff.amount} 💎`);
          setPrompt(mkEvent(eff.amount));
          break;
        case 'pay':
          playLoss();
          addMoney(playerIdx, -eff.amount);
          pushLog(`💸 ${p.name} : ${option.label} → −${eff.amount} 💎`);
          setPrompt(mkEvent(-eff.amount));
          break;
        case 'skip-turn':
          updatePlayer(playerIdx, { skipNextTurn: true });
          pushLog(`⏭️ ${p.name} : ${option.label}`);
          setPrompt(mkEvent(0));
          break;
        case 'goto-jail':
          playPrison();
          updatePlayer(playerIdx, { position: 22, jailTurns: 1, inJail: true });
          pushLog(`🚔 ${p.name} → Prison`);
          setPrompt(mkEvent(0));
          break;
        case 'goto-depart':
          updatePlayer(playerIdx, { position: 0 });
          addMoney(playerIdx, LAND_DEPART_BONUS);
          pushLog(`🏁 ${p.name} → DÉPART (+${LAND_DEPART_BONUS} 💎)`);
          setPrompt(mkEvent(LAND_DEPART_BONUS));
          break;
        case 'nothing':
          setPrompt(mkEvent(0));
          break;
      }
    },
    [addMoney, updatePlayer, pushLog],
  );

  const handleChoice = useCallback(
    (option: ChoiceOption) => {
      if (!prompt || prompt.kind !== 'choice') return;
      applyChoiceOption(prompt.playerIdx, option, prompt.chainPropertyCellIdx);
    },
    [prompt, applyChoiceOption],
  );

  const handleQuizAnswer = useCallback(
    (idx: number) => {
      if (!prompt || prompt.kind !== 'quiz') return;
      const { playerIdx, quiz, chainPropertyCellIdx } = prompt;
      const p = playersRef.current[playerIdx];
      const correct = idx === quiz.correctIdx;
      const delta = correct ? quiz.reward : -quiz.penalty;
      if (correct) playGain();
      else playLoss();
      addMoney(playerIdx, delta);
      pushLog(
        `${correct ? '✅' : '❌'} ${p.name} — quiz : ${correct ? `+${quiz.reward}` : `−${quiz.penalty}`} 💎`,
      );
      setPrompt({
        kind: 'event',
        playerIdx,
        title: correct ? 'Bonne réponse !' : 'Mauvaise réponse',
        message:
          (correct
            ? `Tu connais ton Cameroun ! Réponse : ${quiz.options[quiz.correctIdx]}.`
            : `La bonne réponse était : ${quiz.options[quiz.correctIdx]}.`) +
          (quiz.explanation ? `\n${quiz.explanation}` : ''),
        delta,
        chainPropertyCellIdx,
      });
    },
    [prompt, addMoney, pushLog],
  );

  // ───────────────────────────────────────────────────────────────────────────
  // Turn management
  // ───────────────────────────────────────────────────────────────────────────

  const finishTurn = useCallback(() => {
    // Defer next-turn computation to allow state updates to flush.
    setTimeout(() => {
      const dub = consecutiveDoubles;
      // If the player rolled a double (and not the 3rd), they play again.
      if (dub > 0 && dub < 3) {
        // Stay on the same player; do nothing.
        return;
      }
      setActivePlayerIdx((prev) => {
        const total = playersRef.current.length;
        let next = (prev + 1) % total;
        // Skip players that must skip
        let safety = 0;
        while (
          safety < total &&
          (playersRef.current[next].skipNextTurn ||
            playersRef.current[next].bankrupt ||
            playersRef.current[next].jailTurns > 0)
        ) {
          const p = playersRef.current[next];
          if (p.jailTurns > 0) {
            const remaining = p.jailTurns - 1;
            updatePlayer(next, {
              jailTurns: remaining,
              inJail: remaining > 0,
            });
            pushLog(
              `🔒 ${p.name} reste en cellule (${remaining > 0 ? `${remaining} tour${remaining > 1 ? 's' : ''} restants` : 'dernier tour'})`,
            );
          } else if (p.skipNextTurn) {
            updatePlayer(next, { skipNextTurn: false });
            pushLog(`⏭️ ${p.name} passe son tour`);
          }
          next = (next + 1) % total;
          safety++;
        }
        return next;
      });
      setLastRoll(null);
      setConsecutiveDoubles(0);
    }, 50);
  }, [consecutiveDoubles, updatePlayer, pushLog]);

  // ───────────────────────────────────────────────────────────────────────────
  // Generic prompt actions
  // ───────────────────────────────────────────────────────────────────────────

  const closePromptAndFinish = useCallback(() => {
    setPrompt(null);
    finishTurn();
  }, [finishTurn]);

  /**
   * Continue from an 'event' prompt. If the event carries a chained property
   * cell index, immediately trigger the standard buy/rent property flow on it
   * instead of ending the turn.
   */
  const continueFromEvent = useCallback(() => {
    if (!prompt || prompt.kind !== 'event') {
      setPrompt(null);
      finishTurn();
      return;
    }
    const chain = prompt.chainPropertyCellIdx;
    const playerIdx = prompt.playerIdx;
    setPrompt(null);
    if (chain !== undefined) {
      // Defer one tick to let setPrompt(null) flush
      setTimeout(() => handleStandardProperty(playerIdx, chain), 30);
    } else {
      finishTurn();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [prompt, finishTurn]);

  // ───────────────────────────────────────────────────────────────────────────
  // AI auto-play
  // ───────────────────────────────────────────────────────────────────────────

  // Auto-roll the dice for an AI player on its turn (no prompt pending).
  useEffect(() => {
    if (phase !== 'play') return;
    const active = players[activePlayerIdx];
    if (!active?.isAI) return;
    if (busy) return;
    if (prompt !== null) return;
    const t = setTimeout(() => {
      handleRoll();
    }, 900);
    return () => clearTimeout(t);
  }, [activePlayerIdx, phase, busy, prompt, players, handleRoll]);

  // Auto-resolve any open prompt directed at an AI player.
  useEffect(() => {
    if (!prompt) return;
    const playerIdx =
      prompt.kind === 'rent-paid' ? prompt.payerIdx : prompt.playerIdx;
    const target = players[playerIdx];
    if (!target?.isAI) return;

    const t = setTimeout(() => {
      switch (prompt.kind) {
        case 'buy': {
          // AI buys if it can comfortably afford it (keeps a 200 💎 buffer)
          if (target.money >= prompt.effectivePrice + 200) confirmBuy();
          else declineBuy();
          break;
        }
        case 'event':
          continueFromEvent();
          break;
        case 'rent-paid':
        case 'own-property':
        case 'depart-bonus':
        case 'goto':
          closePromptAndFinish();
          break;
        case 'card':
          confirmCard();
          break;
        case 'impots':
          confirmImpots();
          break;
        case 'choice': {
          // Pick a sensible random option (avoid "skip-turn" if possible)
          const safe = prompt.scenario.options.filter(
            (o) => o.effect.kind !== 'skip-turn',
          );
          const pool = safe.length > 0 ? safe : prompt.scenario.options;
          handleChoice(pool[Math.floor(Math.random() * pool.length)]);
          break;
        }
        case 'quiz': {
          // 50% chance the AI gets it right
          const idx =
            Math.random() < 0.5
              ? prompt.quiz.correctIdx
              : Math.floor(Math.random() * prompt.quiz.options.length);
          handleQuizAnswer(idx);
          break;
        }
      }
    }, 1500);
    return () => clearTimeout(t);
  }, [
    prompt,
    players,
    confirmBuy,
    declineBuy,
    confirmCard,
    confirmImpots,
    closePromptAndFinish,
    continueFromEvent,
    handleChoice,
    handleQuizAnswer,
  ]);

  // ───────────────────────────────────────────────────────────────────────────
  // Render
  // ───────────────────────────────────────────────────────────────────────────

  const currentCellName = CELL_NAMES[activePlayer.position] ?? '—';

  return (
    <GameShell
      title="Mboa Empire"
      backgroundImage="/assets/backgrounds/empire-bg.png"
      gems={500}
    >
      <div className="min-h-[calc(100vh-4rem)] flex flex-col p-3 sm:p-6 max-w-7xl mx-auto w-full gap-3 sm:gap-4">
        {/* Top toolbar: audio + debug */}
        <div className="flex justify-end gap-2">
          <AudioControls />
          <button
            onClick={() => setShowDebug(!showDebug)}
            className="empire-btn text-[10px]"
            style={{ padding: '6px 12px', fontSize: '10px' }}
          >
            {showDebug ? '✓ Debug cases' : '○ Debug cases'}
          </button>
        </div>

        {/* Player panels with status & current cell */}
        <div className="grid grid-cols-2 gap-2 sm:gap-3">
          {players.map((p, i) => (
            <div key={p.id} className="flex flex-col gap-1">
              <PlayerPanel player={p} isActive={i === activePlayerIdx} compact />
              <div
                className="text-[10px] sm:text-xs px-2 py-1 rounded text-center font-semibold flex items-center justify-center gap-2"
                style={{
                  color: '#F4CE96',
                  background: 'rgba(28, 19, 8, 0.55)',
                  border: '1px solid rgba(177, 138, 98, 0.4)',
                }}
              >
                {p.statusKey && (
                  <span title={STATUS_BY_KEY[p.statusKey].label}>
                    {STATUS_BY_KEY[p.statusKey].emoji}
                  </span>
                )}
                <span className="empire-accent uppercase tracking-wider text-[8px] sm:text-[9px]">
                  Sur :
                </span>
                <span className="truncate">{CELL_NAMES[p.position] ?? '—'}</span>
              </div>
            </div>
          ))}
        </div>

        {/* Center: cinematic board */}
        <div className="flex-1 flex items-center justify-center min-h-0">
          <ImageBoard
            players={players}
            activePlayerId={activePlayer?.id}
            showDebug={showDebug}
            centerContent={
              <CenterDice
                dice={dice}
                rolling={rolling}
                activePlayerName={activePlayer.name}
              />
            }
            bottomContent={
              <BottomBar
                lastRoll={lastRoll}
                rolling={rolling}
                onRoll={handleRoll}
                disabled={busy || phase !== 'play'}
                activePlayerName={activePlayer.name}
                currentCellName={currentCellName}
              />
            }
          />
        </div>
      </div>

      {/* Status selection at game start */}
      {phase === 'choose-statuses' && (
        <StatusSelectModal
          playerName={players[statusSelectIdx].name}
          takenStatuses={players
            .map((p) => p.statusKey)
            .filter((s): s is StatusKey => s !== null)}
          onSelect={handleStatusSelect}
        />
      )}

      {/* Action prompts */}
      {prompt && renderPrompt(prompt, {
        players,
        confirmBuy,
        declineBuy,
        confirmImpots,
        confirmCard,
        closePromptAndFinish,
        continueFromEvent,
        handleChoice,
        handleQuizAnswer,
      })}
    </GameShell>
  );
}

// ─────────────────────────────────────────────────────────────────────────────
// Prompt renderer
// ─────────────────────────────────────────────────────────────────────────────

function renderPrompt(
  prompt: NonNullable<Prompt>,
  handlers: {
    players: Player[];
    confirmBuy: () => void;
    declineBuy: () => void;
    confirmImpots: () => void;
    confirmCard: () => void;
    closePromptAndFinish: () => void;
    continueFromEvent: () => void;
    handleChoice: (option: ChoiceOption) => void;
    handleQuizAnswer: (idx: number) => void;
  },
) {
  const {
    players,
    confirmBuy,
    declineBuy,
    confirmImpots,
    confirmCard,
    closePromptAndFinish,
    continueFromEvent,
    handleChoice,
    handleQuizAnswer,
  } = handlers;

  switch (prompt.kind) {
    case 'buy': {
      const meta = CELL_META[prompt.cellIdx];
      const player = players[prompt.playerIdx];
      const canAfford = player.money >= prompt.effectivePrice;
      const actions: ActionModalAction[] = [
        {
          label: `Acheter (${prompt.effectivePrice} 💎)`,
          variant: 'primary',
          onClick: confirmBuy,
          disabled: !canAfford,
        },
        { label: 'Passer', variant: 'secondary', onClick: declineBuy },
      ];
      return (
        <ActionModal
          eyebrow={`${player.name} — Achat possible`}
          title={meta.name}
          actions={actions}
        >
          <p>
            Cette case est libre. Prix d&apos;achat :
            <br />
            <span className="font-bold text-lg" style={{ color: '#F4CE96' }}>
              {prompt.effectivePrice} 💎
            </span>
            {prompt.discountReason && (
              <span className="text-xs italic ml-2 opacity-80">
                ({prompt.discountReason}, prix de base {prompt.basePrice})
              </span>
            )}
          </p>
          {!canAfford && (
            <p className="text-red-300 text-xs mt-2">
              Tu n&apos;as pas assez de gemmes ({player.money} 💎).
            </p>
          )}
        </ActionModal>
      );
    }

    case 'rent-paid': {
      const meta = CELL_META[prompt.cellIdx];
      const owner = players[prompt.ownerIdx];
      return (
        <ActionModal
          eyebrow="Loyer perçu"
          title={meta.name}
          actions={[{ label: 'Continuer', variant: 'primary', onClick: closePromptAndFinish }]}
        >
          <p>
            Tu paies <span className="font-bold" style={{ color: '#F4CE96' }}>{prompt.amount} 💎</span> à {owner.name}
            {prompt.sectorBonus && <span className="block text-xs italic mt-1">Secteur complet → loyer ×2</span>}
          </p>
        </ActionModal>
      );
    }

    case 'own-property': {
      const meta = CELL_META[prompt.cellIdx];
      return (
        <ActionModal
          eyebrow="Ta propriété"
          title={meta.name}
          actions={[{ label: 'Continuer', variant: 'primary', onClick: closePromptAndFinish }]}
        >
          <p>C&apos;est ta propriété — repose-toi un peu.</p>
        </ActionModal>
      );
    }

    case 'card': {
      const eyebrow =
        prompt.deck === 'chance'
          ? '🎲 Carte Chance'
          : prompt.deck === 'tresor'
          ? '💎 Trésor'
          : '🤝 Caisse Commune';
      return (
        <ActionModal
          eyebrow={eyebrow}
          title="Tu piges une carte..."
          actions={[{ label: 'Appliquer', variant: 'primary', onClick: confirmCard }]}
        >
          <p className="italic">&laquo; {prompt.card.text} &raquo;</p>
        </ActionModal>
      );
    }

    case 'impots': {
      const player = players[prompt.playerIdx];
      const canPay = player.money >= prompt.total;
      return (
        <ActionModal
          eyebrow="🚨 IMPÔTS"
          title={`Total à payer : ${prompt.total} 💎`}
          actions={[
            {
              label: 'Payer',
              variant: 'danger',
              onClick: confirmImpots,
              disabled: !canPay,
            },
          ]}
        >
          <ul className="text-xs list-disc pl-5 text-left inline-block">
            {prompt.breakdown.map((b, i) => (
              <li key={i}>{b}</li>
            ))}
          </ul>
        </ActionModal>
      );
    }

    case 'event': {
      const chained = prompt.chainPropertyCellIdx !== undefined;
      return (
        <ActionModal
          eyebrow="Événement"
          title={prompt.title}
          actions={[
            {
              label: chained ? 'Voir la propriété' : 'Continuer',
              variant: 'primary',
              onClick: continueFromEvent,
            },
          ]}
        >
          <p>{prompt.message}</p>
          {prompt.delta !== 0 && (
            <p className="mt-2 font-bold" style={{ color: prompt.delta > 0 ? '#86efac' : '#fca5a5' }}>
              {prompt.delta > 0 ? '+' : ''}
              {prompt.delta} 💎
            </p>
          )}
        </ActionModal>
      );
    }

    case 'depart-bonus': {
      return (
        <ActionModal
          eyebrow="🏁 DÉPART"
          title={`+${prompt.amount} 💎`}
          actions={[{ label: 'Continuer', variant: 'primary', onClick: closePromptAndFinish }]}
        >
          <p>Bonus de DÉPART encaissé.</p>
        </ActionModal>
      );
    }

    case 'goto': {
      return (
        <ActionModal
          eyebrow="Téléportation"
          title={CELL_NAMES[prompt.targetIdx]}
          actions={[{ label: 'OK', variant: 'primary', onClick: closePromptAndFinish }]}
        >
          <p>{prompt.reason}</p>
        </ActionModal>
      );
    }

    case 'choice': {
      const player = players[prompt.playerIdx];
      const { scenario } = prompt;
      const actions: ActionModalAction[] = scenario.options.map((opt) => {
        const eff = opt.effect;
        const canAfford = eff.kind !== 'pay' || player.money >= eff.amount;
        const variant: ActionModalAction['variant'] =
          eff.kind === 'gain'
            ? 'primary'
            : eff.kind === 'pay'
            ? 'danger'
            : 'secondary';
        return {
          label: opt.label,
          variant,
          disabled: !canAfford,
          onClick: () => handleChoice(opt),
        };
      });
      // Stack the actions and inline each option's description on its own line.
      const richActions = actions.map((a, i) => ({
        ...a,
        label: scenario.options[i]?.description
          ? `${a.label} — ${scenario.options[i].description}`
          : a.label,
      }));
      return (
        <ActionModal
          eyebrow={`${scenario.eyebrow} — ${player.name}`}
          title={scenario.title}
          actions={richActions}
          actionsLayout="stack"
          size="lg"
        >
          <p className="mb-2">{scenario.message}</p>
        </ActionModal>
      );
    }

    case 'quiz': {
      const player = players[prompt.playerIdx];
      const { quiz } = prompt;
      const actions: ActionModalAction[] = quiz.options.map((opt, i) => ({
        label: opt,
        variant: 'secondary',
        onClick: () => handleQuizAnswer(i),
      }));
      return (
        <ActionModal
          eyebrow={`${quiz.eyebrow} — ${player.name}`}
          title={quiz.question}
          actions={actions}
          actionsLayout="stack"
          size="lg"
        >
          <p className="text-xs opacity-80">
            ✅ Bonne réponse : +{quiz.reward} 💎 &nbsp;&nbsp; ❌ Mauvaise : −{quiz.penalty} 💎
          </p>
        </ActionModal>
      );
    }
  }
}

// ─────────────────────────────────────────────────────────────────────────────
// Sub-components: dice display + bottom action bar
// ─────────────────────────────────────────────────────────────────────────────

interface CenterDiceProps {
  dice: [number, number];
  rolling: boolean;
  activePlayerName: string;
}

function CenterDice({ dice, rolling, activePlayerName }: CenterDiceProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex flex-col items-center gap-2"
    >
      <div
        className="text-[9px] sm:text-[10px] uppercase tracking-[0.3em] font-semibold px-2 py-0.5 rounded"
        style={{
          color: '#F4CE96',
          background: 'rgba(28, 19, 8, 0.6)',
          textShadow: '0 1px 0 rgba(0,0,0,0.7)',
        }}
      >
        {activePlayerName}
      </div>
      <div className="flex items-center gap-2 sm:gap-3">
        <Dice value={dice[0]} rolling={rolling} size="md" />
        <Dice value={dice[1]} rolling={rolling} size="md" />
      </div>
    </motion.div>
  );
}

interface BottomBarProps {
  lastRoll: number | null;
  rolling: boolean;
  onRoll: () => void;
  disabled: boolean;
  activePlayerName: string;
  currentCellName: string;
}

function BottomBar({
  lastRoll,
  rolling,
  onRoll,
  disabled,
  activePlayerName,
  currentCellName,
}: BottomBarProps) {
  return (
    <div className="flex justify-start">
      <div
        className="flex items-center gap-3 sm:gap-4 px-3 sm:px-4 py-1.5 sm:py-2 rounded-lg"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,19,8,0.55) 0%, rgba(28,19,8,0.75) 100%)',
          border: '1px solid rgba(177,138,98,0.5)',
          backdropFilter: 'blur(4px)',
          boxShadow: '0 4px 14px rgba(0,0,0,0.5)',
        }}
      >
        <div className="flex flex-col leading-tight pr-1">
          <span className="empire-accent text-[8px] sm:text-[9px] uppercase tracking-[0.2em] opacity-80">
            {activePlayerName}
          </span>
          <motion.span
            key={currentCellName}
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            className="font-bold text-[12px] sm:text-sm whitespace-nowrap"
            style={{
              color: '#F4CE96',
              textShadow: '0 1px 0 rgba(0,0,0,0.7), 0 0 8px rgba(206,162,113,0.35)',
            }}
          >
            {currentCellName}
          </motion.span>
        </div>

        <div className="self-stretch w-px" style={{ background: 'rgba(177,138,98,0.4)' }} />

        {lastRoll !== null && !rolling ? (
          <motion.div
            key={lastRoll}
            initial={{ scale: 0.6, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="flex items-baseline gap-1.5"
          >
            <span className="empire-accent text-[8px] sm:text-[10px] uppercase tracking-wider">
              Total
            </span>
            <span
              className="text-2xl sm:text-3xl font-bold leading-none"
              style={{
                color: '#F4CE96',
                textShadow: '0 2px 6px rgba(0,0,0,0.85), 0 0 10px rgba(206,162,113,0.5)',
              }}
            >
              {lastRoll}
            </span>
          </motion.div>
        ) : (
          <div
            className="text-[10px] sm:text-xs uppercase tracking-[0.25em] empire-accent opacity-70"
            style={{ minWidth: '52px' }}
          >
            {rolling ? '...' : 'Prêt'}
          </div>
        )}

        <motion.button
          whileTap={!disabled ? { scale: 0.96 } : undefined}
          onClick={onRoll}
          disabled={disabled}
          className="empire-btn flex items-center justify-center gap-2"
          style={{ padding: '8px 24px', fontSize: '12px', minWidth: '160px' }}
        >
          <Dices className="h-3.5 w-3.5" />
          {rolling ? 'LANCEMENT...' : 'LANCER LES DÉS'}
        </motion.button>
      </div>
    </div>
  );
}
