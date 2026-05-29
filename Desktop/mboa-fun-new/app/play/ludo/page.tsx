'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { GameShell } from '@/components/layout/game-shell';
import { LudoBoardV2 as LudoBoard } from './_components/ludo-board-v2';
import { LUDO_VILLAGES } from './_data/villages';
import { ETHNIE_STORIES, pickRandomEthnie, type EthnieStory } from './_data/ethnies';
import {
  aiPickPawn,
  applyMove,
  initialState,
  movablePawns,
  passTurn,
  pawnTrackIndex,
  PLAY_ORDER,
  rollDie,
  SAFE_INDICES,
  COLOR_START_INDEX,
  type LudoColor,
  type LudoState,
} from './_lib/engine';
import {
  playDiceRoll,
  playPawnStep,
  playPawnLand,
  playPawnExit,
  playPawnSafe,
  playPawnCapture,
  playPawnFinish,
  playWin,
  resumeAudio,
} from './_audio/sounds';

const COLOR_LABEL: Record<LudoColor, string> = {
  red: 'Rouge',
  blue: 'Bleu',
  green: 'Vert',
  yellow: 'Jaune',
};
const COLOR_HEX: Record<LudoColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
};

interface LogEntry { msg: string; color?: LudoColor }
interface CaptureModal { story: EthnieStory; capturer: LudoColor; victim: LudoColor }
interface VillageModal { idx: number }

export default function LudoGamePage() {
  // Setup : 1 humain (rouge) + 3 IA. On peut customiser via le menu plus tard.
  const [state, setState] = useState<LudoState>(() =>
    initialState({
      red:    { name: 'Toi',           isAI: false },
      blue:   { name: 'Ordi Bleu',     isAI: true  },
      green:  { name: 'Ordi Vert',     isAI: true  },
      yellow: { name: 'Ordi Jaune',    isAI: true  },
    }),
  );
  const [rolling, setRolling] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([
    { msg: '🎲 Bienvenue au Ludo 237 — chaque case est un village du Cameroun !' },
  ]);
  const [hoveredCellIdx, setHoveredCellIdx] = useState<number | null>(null);
  const [captureModal, setCaptureModal] = useState<CaptureModal | null>(null);
  const [villageModal, setVillageModal] = useState<VillageModal | null>(null);
  const stateRef = useRef(state);
  stateRef.current = state;

  const currentPlayer = state.players[state.currentIdx];
  const currentColor = currentPlayer.color;

  const pushLog = useCallback((msg: string, color?: LudoColor) => {
    setLogs((prev) => [{ msg, color }, ...prev].slice(0, 30));
  }, []);

  // ─── Lancer le dé ──────────────────────────────────────────────────────
  const rollDice = useCallback(() => {
    if (state.dice !== null || state.awaitingMove || state.winner || rolling) return;
    resumeAudio();
    playDiceRoll();
    setRolling(true);
    const finalRoll = rollDie();
    // petite anim de 700 ms
    const start = Date.now();
    const tick = () => {
      const elapsed = Date.now() - start;
      if (elapsed >= 700) {
        setState((s) => ({ ...s, dice: finalRoll, awaitingMove: true }));
        setRolling(false);
        const player = stateRef.current.players[stateRef.current.currentIdx];
        pushLog(`🎲 ${player.name} fait ${finalRoll}.`, player.color);
        return;
      }
      setState((s) => ({ ...s, dice: rollDie() }));
      requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [state.dice, state.awaitingMove, state.winner, rolling, pushLog]);

  // ─── Auto-pass si aucun mouvement possible, ou auto-move si un seul ─────
  useEffect(() => {
    if (!state.awaitingMove || state.dice === null || state.winner) return;
    if (animatingRef.current) return;
    const player = state.players[state.currentIdx];
    const movable = movablePawns(player, state.dice);

    // Aucun coup → passer
    if (movable.length === 0) {
      const t = setTimeout(() => {
        pushLog(`⏭️ ${player.name} : aucun coup possible.`, player.color);
        setState((s) => passTurn(s, false));
      }, 800);
      return () => clearTimeout(t);
    }

    // Un seul coup possible → auto-pilote (humain comme IA)
    if (movable.length === 1 && !player.isAI) {
      const t = setTimeout(() => {
        if (animatingRef.current) return;
        executeMove(movable[0].id);
      }, 600);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state.awaitingMove, state.dice, state.currentIdx, state.players, state.winner, pushLog]);

  // ─── IA : auto-roll + auto-move ────────────────────────────────────────
  useEffect(() => {
    if (state.winner) return;
    if (animatingRef.current) return;
    const player = state.players[state.currentIdx];
    if (!player.isAI) return;
    if (state.dice === null && !state.awaitingMove && !rolling) {
      const t = setTimeout(() => rollDice(), 900);
      return () => clearTimeout(t);
    }
    if (state.awaitingMove && state.dice !== null) {
      const t = setTimeout(() => {
        if (animatingRef.current) return;
        const id = aiPickPawn(state);
        if (id) {
          executeMove(id);
        } else {
          setState((s) => passTurn(s, false));
        }
      }, 1100);
      return () => clearTimeout(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state, rolling]);

  // ─── Mouvement animé case par case + sons ──────────────────────────────
  const [animating, setAnimating] = useState(false);
  const animatingRef = useRef(false);
  animatingRef.current = animating;

  /** Met à jour SEULEMENT la progress du pion en cours d'animation (visuel only). */
  const setPawnProgress = useCallback((color: LudoColor, pawnId: string, progress: number) => {
    setState((s) => ({
      ...s,
      players: s.players.map((pl) =>
        pl.color !== color
          ? pl
          : { ...pl, pawns: pl.pawns.map((p) => (p.id === pawnId ? { ...p, progress } : p)) },
      ),
    }));
  }, []);

  const wait = (ms: number) => new Promise<void>((res) => setTimeout(res, ms));

  const executeMove = useCallback(
    async (pawnId: string) => {
      if (animatingRef.current) return;
      const snapshot = stateRef.current;
      const result = applyMove(snapshot, pawnId);
      const movedColor = result.movedPawn.color;
      const movedPlayerName = snapshot.players.find((p) => p.color === movedColor)?.name ?? movedColor;
      const targetProgress = result.movedPawn.progress;
      const startProgress = snapshot.players[snapshot.currentIdx].pawns.find((p) => p.id === pawnId)!.progress;

      setAnimating(true);
      resumeAudio();

      // 1) Sortie de base → "pop" et apparition directe sur la case d'entrée
      if (startProgress === 0 && targetProgress === 1) {
        playPawnExit();
        setPawnProgress(movedColor, pawnId, 1);
        await wait(280);
        playPawnLand();
        pushLog(`🚪 ${movedPlayerName} sort un pion de sa base.`, movedColor);
      } else {
        // 2) Déplacement case par case : tap tap tap...
        const STEP_MS = 130;
        for (let p = startProgress + 1; p < targetProgress; p++) {
          setPawnProgress(movedColor, pawnId, p);
          // détecte le passage sur case sûre (sur la piste extérieure uniquement)
          if (p >= 1 && p <= 51) {
            const trackIdx = (COLOR_START_INDEX[movedColor] + p - 1) % 52;
            if (SAFE_INDICES.has(trackIdx)) {
              playPawnSafe();
            } else {
              playPawnStep();
            }
          } else {
            playPawnStep();
          }
          await wait(STEP_MS);
        }
        // 3) Dernier pas → "Boungloum"
        setPawnProgress(movedColor, pawnId, targetProgress);
        playPawnLand();
        const trackIdx = pawnTrackIndex(result.movedPawn);
        if (trackIdx !== -1) {
          const village = LUDO_VILLAGES[trackIdx];
          pushLog(`🚶 ${movedPlayerName} arrive à ${village.name}.`, movedColor);
        }
      }

      // 4) Capture éventuelle (renvoi du pion ennemi en base + son)
      if (result.capturedPawn) {
        await wait(120);
        playPawnCapture();
        const victimColor = result.capturedPawn.color;
        const victimName = snapshot.players.find((p) => p.color === victimColor)?.name ?? victimColor;
        const story = pickRandomEthnie();
        pushLog(`💥 ${movedPlayerName} mange un pion de ${victimName} ! (${story.name})`, movedColor);
        setCaptureModal({ story, capturer: movedColor, victim: victimColor });
      }

      // 5) Pion arrivé à la maison
      if (result.finished) {
        await wait(100);
        playPawnFinish();
        pushLog(`🏁 ${movedPlayerName} amène un pion à la maison !`, movedColor);
      }

      // 6) Victoire
      if (result.state.winner) {
        await wait(150);
        playWin();
        const winnerName = snapshot.players.find((p) => p.color === result.state.winner)?.name;
        pushLog(`🏆 Victoire de ${winnerName} (${COLOR_LABEL[result.state.winner!]}) !`, result.state.winner);
      }

      // 7) Commit officiel de l'état (gère le tour suivant, capture, etc.)
      setState(result.state);
      setAnimating(false);
    },
    [pushLog, setPawnProgress],
  );

  const handlePawnClick = useCallback(
    (pawnId: string) => {
      const player = stateRef.current.players[stateRef.current.currentIdx];
      if (player.isAI) return;
      if (!stateRef.current.awaitingMove || stateRef.current.dice === null) return;
      const movable = movablePawns(player, stateRef.current.dice);
      if (!movable.some((p) => p.id === pawnId)) return;
      executeMove(pawnId);
    },
    [executeMove],
  );

  // ─── Villages info au survol ───────────────────────────────────────────
  const hoveredVillage = hoveredCellIdx !== null ? LUDO_VILLAGES[hoveredCellIdx] : null;

  // ─── Pions sélectionnables (pour le joueur humain) ─────────────────────
  const selectablePawnIds = useMemo(() => {
    if (currentPlayer.isAI || !state.awaitingMove || state.dice === null) return [];
    return movablePawns(currentPlayer, state.dice).map((p) => p.id);
  }, [currentPlayer, state.awaitingMove, state.dice]);

  return (
    <GameShell title="Ludo Mboa" gems={500}>
      <div className="flex flex-col items-center gap-4 p-4 max-w-[900px] mx-auto">
        <LudoBoard
          players={state.players}
          selectablePawnIds={selectablePawnIds}
          onPawnClick={handlePawnClick}
          currentColor={currentColor}
          hoveredCellIdx={hoveredCellIdx}
          onHoverCell={setHoveredCellIdx}
        />

        {/* Bandeau village au survol */}
        {hoveredVillage && (
          <div className="text-center text-sm bg-[#1c1308]/80 border border-[#B18A62]/40 rounded px-3 py-1.5">
            <span className="text-[#F4CE96] font-bold">{hoveredVillage.name}</span>
            <span className="text-[#E5C788] ml-2">— {hoveredVillage.region}</span>
            <button
              onClick={() => setVillageModal({ idx: hoveredCellIdx! })}
              className="ml-3 text-xs underline text-[#B18A62] hover:text-[#F4CE96]"
            >
              en savoir plus
            </button>
          </div>
        )}

        {/* Dé + bouton lancer (compact, sous le plateau) */}
        <div
          className="flex items-center gap-4 rounded-xl px-5 py-3 border-2"
          style={{
            background: 'linear-gradient(180deg, rgba(28,19,8,0.96) 0%, rgba(13,6,1,0.98) 100%)',
            borderColor: COLOR_HEX[currentColor],
            boxShadow: `0 6px 20px rgba(0,0,0,0.5), 0 0 0 1px rgba(216,168,74,0.2)`,
          }}
        >
          <DiceFace value={state.dice} rolling={rolling} color={COLOR_HEX[currentColor]} />
          <button
            onClick={rollDice}
            disabled={
              rolling ||
              state.dice !== null ||
              state.awaitingMove ||
              currentPlayer.isAI ||
              !!state.winner
            }
            className="empire-btn"
            style={{ padding: '12px 22px', fontSize: '13px' }}
          >
            {rolling
              ? '...'
              : currentPlayer.isAI
              ? '⏳ Ordi…'
              : state.awaitingMove
              ? 'Choisis ton pion'
              : 'Lancer le dé'}
          </button>
        </div>
      </div>

      {/* ─── Modale capture / histoire ethnie ─── */}
      <AnimatePresence>
        {captureModal && (
          <Modal onClose={() => setCaptureModal(null)} title={`💥 ${COLOR_LABEL[captureModal.capturer]} mange ${COLOR_LABEL[captureModal.victim]}`}>
            <div className="text-center mb-2">
              <span className="text-xs uppercase tracking-widest text-[#B18A62]">Histoire camerounaise</span>
              <h3 className="text-xl font-bold text-[#F4CE96] mt-1">{captureModal.story.name}</h3>
              <p className="text-xs text-[#E5C788] italic mt-1">{captureModal.story.regions}</p>
            </div>
            <p className="text-sm text-[#E5C788] leading-relaxed mb-3">{captureModal.story.story}</p>
            <p className="text-xs text-[#F4CE96] bg-[#4F2F17]/40 rounded p-2 italic">
              💡 {captureModal.story.fact}
            </p>
            <div className="mt-4 flex justify-center">
              <button onClick={() => setCaptureModal(null)} className="empire-btn" style={{ padding: '8px 22px', fontSize: '12px' }}>
                Continuer
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ─── Modale info village ─── */}
      <AnimatePresence>
        {villageModal && (
          <Modal onClose={() => setVillageModal(null)} title={LUDO_VILLAGES[villageModal.idx].name}>
            <p className="text-xs uppercase tracking-widest text-[#B18A62] text-center">
              {LUDO_VILLAGES[villageModal.idx].region}
            </p>
            <p className="text-sm text-[#E5C788] mt-3 leading-relaxed text-center">
              {LUDO_VILLAGES[villageModal.idx].fact}
            </p>
            <div className="mt-4 flex justify-center">
              <button onClick={() => setVillageModal(null)} className="empire-btn" style={{ padding: '8px 22px', fontSize: '12px' }}>
                Fermer
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>

      {/* ─── Modale victoire ─── */}
      <AnimatePresence>
        {state.winner && (
          <Modal onClose={() => {}} title={`🏆 ${COLOR_LABEL[state.winner]} a gagné !`}>
            <p className="text-sm text-[#E5C788] text-center">
              Bravo à {state.players.find((p) => p.color === state.winner)?.name} qui a ramené ses 4 pions à la maison !
            </p>
            <div className="mt-4 flex justify-center gap-2">
              <button
                onClick={() => window.location.reload()}
                className="empire-btn"
                style={{ padding: '10px 22px', fontSize: '12px' }}
              >
                Rejouer
              </button>
            </div>
          </Modal>
        )}
      </AnimatePresence>
    </GameShell>
  );
}

// ─── Sous-composants ────────────────────────────────────────────────────────

// Pip layout for each face: 9-cell grid (3x3), bool = visible pip.
// Index order: 0=TL 1=TC 2=TR / 3=ML 4=MC 5=MR / 6=BL 7=BC 8=BR
const PIPS: Record<number, boolean[]> = {
  1: [false, false, false, false, true,  false, false, false, false],
  2: [true,  false, false, false, false, false, false, false, true ],
  3: [true,  false, false, false, true,  false, false, false, true ],
  4: [true,  false, true,  false, false, false, true,  false, true ],
  5: [true,  false, true,  false, true,  false, true,  false, true ],
  6: [true,  false, true,  true,  false, true,  true,  false, true ],
};

function DiceFace({ value, rolling, color }: { value: number | null; rolling: boolean; color: string }) {
  const face = value && value >= 1 && value <= 6 ? PIPS[value] : null;
  return (
    <motion.div
      animate={rolling ? { rotate: [0, 90, 180, 270, 360] } : { rotate: 0 }}
      transition={rolling ? { duration: 0.7, repeat: 0 } : { duration: 0 }}
      className="relative grid"
      style={{
        width: 60,
        height: 60,
        gridTemplateColumns: 'repeat(3, 1fr)',
        gridTemplateRows: 'repeat(3, 1fr)',
        gap: 4,
        padding: 8,
        borderRadius: 12,
        background:
          'radial-gradient(circle at 30% 25%, #ffffff 0%, #f8f5ee 35%, #d9cdb0 100%)',
        boxShadow: `inset 0 -3px 6px rgba(0,0,0,0.18), inset 0 3px 4px rgba(255,255,255,0.85), 0 0 0 2px ${color}, 0 5px 10px rgba(0,0,0,0.55)`,
        border: '1px solid rgba(0,0,0,0.25)',
      }}
    >
      {face
        ? face.map((on, i) => (
            <span
              key={i}
              style={{
                width: '100%',
                height: '100%',
                borderRadius: '50%',
                background: on
                  ? 'radial-gradient(circle at 35% 30%, #4b2b08 0%, #0d0601 80%)'
                  : 'transparent',
                boxShadow: on ? 'inset 0 1px 1px rgba(255,255,255,0.4)' : undefined,
              }}
            />
          ))
        : (
          <span
            style={{
              gridColumn: '1 / 4',
              gridRow: '1 / 4',
              display: 'grid',
              placeItems: 'center',
              fontSize: 26,
              fontWeight: 900,
              color: '#1c1308',
              opacity: 0.6,
            }}
          >
            ?
          </span>
        )}
    </motion.div>
  );
}

function Modal({ title, children, onClose }: { title: string; children: React.ReactNode; onClose: () => void }) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
      className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="empire-panel max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto"
        style={{
          background: 'linear-gradient(180deg, rgba(28,19,8,0.97) 0%, rgba(13,6,1,0.99) 100%)',
        }}
      >
        <h2 className="empire-title text-lg font-bold text-center mb-3" style={{ color: '#F4CE96' }}>
          {title}
        </h2>
        {children}
      </motion.div>
    </motion.div>
  );
}

