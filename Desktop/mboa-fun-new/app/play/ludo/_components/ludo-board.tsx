'use client';

/**
 * Plateau Ludo 15x15 dessiné en CSS grid.
 *
 * Coordonnées :
 *   - 4 bases de couleur dans les 4 coins (6x6 chacune).
 *   - Une croix de cases passant par les rangées 6-8 et colonnes 6-8.
 *   - Les 52 cases de la piste extérieure (TRACK_CELLS) sont définies en
 *     sens horaire à partir de l'entrée du joueur Rouge.
 *   - Chaque couleur a 5 cases « colonne maison » menant au centre.
 */

import { motion } from 'framer-motion';
import { LUDO_VILLAGES } from '../_data/villages';
import {
  COLOR_START_INDEX,
  isInBase,
  isInHomeColumn,
  pawnTrackIndex,
  SAFE_INDICES,
  type LudoColor,
  type LudoPawn,
  type LudoPlayer,
} from '../_lib/engine';

// ─── Coordonnées des 52 cases de la piste (sens horaire) ────────────────────
// Index 0 = case d'entrée du joueur Rouge.
type Cell = { r: number; c: number };

const TRACK_CELLS: Cell[] = [
  // Bras gauche → centre haut-gauche (5 cellules)
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
  // Coin → bras haut (6 cellules)
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
  // Sommet (2 cellules)
  { r: 0, c: 7 }, { r: 0, c: 8 },
  // Bras haut droite → entrée Bleu (6 cellules)
  { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
  // Bras droit (6 cellules)
  { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
  // Côté droit (2 cellules)
  { r: 7, c: 14 }, { r: 8, c: 14 },
  // Bras droit bas → entrée Vert (6 cellules)
  { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
  // Bras bas (6 cellules)
  { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
  // Bas (2 cellules)
  { r: 14, c: 7 }, { r: 14, c: 6 },
  // Bras bas gauche → entrée Jaune (6 cellules)
  { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
  // Bras gauche (6 cellules)
  { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
  // Côté gauche (2 cellules)
  { r: 7, c: 0 }, { r: 6, c: 0 },
];

// ─── Colonnes maison (5 cases vers le centre par couleur) ───────────────────
const HOME_COLUMN_CELLS: Record<LudoColor, Cell[]> = {
  red:    [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
  blue:   [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
  green:  [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
  yellow: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }],
};

// ─── Bases (zones 6x6 dans les coins, parking des pions au repos) ───────────
const BASE_AREAS: Record<LudoColor, { rStart: number; cStart: number; pawnSpots: Cell[] }> = {
  red:    { rStart: 0,  cStart: 0,  pawnSpots: [{ r: 1, c: 1 }, { r: 1, c: 4 }, { r: 4, c: 1 }, { r: 4, c: 4 }] },
  blue:   { rStart: 0,  cStart: 9,  pawnSpots: [{ r: 1, c: 10 }, { r: 1, c: 13 }, { r: 4, c: 10 }, { r: 4, c: 13 }] },
  green:  { rStart: 9,  cStart: 9,  pawnSpots: [{ r: 10, c: 10 }, { r: 10, c: 13 }, { r: 13, c: 10 }, { r: 13, c: 13 }] },
  yellow: { rStart: 9,  cStart: 0,  pawnSpots: [{ r: 10, c: 1 }, { r: 10, c: 4 }, { r: 13, c: 1 }, { r: 13, c: 4 }] },
};

const COLOR_HEX: Record<LudoColor, string> = {
  red: '#dc2626',
  blue: '#2563eb',
  green: '#16a34a',
  yellow: '#ca8a04',
};

const COLOR_LIGHT: Record<LudoColor, string> = {
  red: '#fecaca',
  blue: '#bfdbfe',
  green: '#bbf7d0',
  yellow: '#fef08a',
};

// ─── API ────────────────────────────────────────────────────────────────────

interface LudoBoardProps {
  players: LudoPlayer[];
  /** Pions sélectionnables (mis en avant), avec callback. */
  selectablePawnIds: string[];
  onPawnClick: (pawnId: string) => void;
  /** Couleur du joueur courant pour l'aura active. */
  currentColor: LudoColor;
  /** Quand on survole une case, on peut afficher le nom du village. */
  hoveredCellIdx: number | null;
  onHoverCell: (idx: number | null) => void;
}

export function LudoBoard({
  players,
  selectablePawnIds,
  onPawnClick,
  currentColor,
  hoveredCellIdx,
  onHoverCell,
}: LudoBoardProps) {
  const cellMap: Map<string, { kind: 'track'; idx: number } | { kind: 'home'; color: LudoColor; idx: number }> = new Map();
  TRACK_CELLS.forEach((c, i) => cellMap.set(`${c.r}-${c.c}`, { kind: 'track', idx: i }));
  (Object.keys(HOME_COLUMN_CELLS) as LudoColor[]).forEach((color) => {
    HOME_COLUMN_CELLS[color].forEach((c, i) => cellMap.set(`${c.r}-${c.c}`, { kind: 'home', color, idx: i }));
  });

  // Index pawns par cellule pour empilement / collision rendering
  const pawnsByCell = new Map<string, LudoPawn[]>();
  const pushPawn = (key: string, p: LudoPawn) => {
    const arr = pawnsByCell.get(key) ?? [];
    arr.push(p);
    pawnsByCell.set(key, arr);
  };
  for (const player of players) {
    for (const pawn of player.pawns) {
      if (isInBase(pawn)) {
        const baseIdx = parseInt(pawn.id.split('-')[1], 10);
        const spot = BASE_AREAS[pawn.color].pawnSpots[baseIdx];
        pushPawn(`${spot.r}-${spot.c}`, pawn);
      } else if (isInHomeColumn(pawn)) {
        const idxInHome = pawn.progress - 52; // 0..4
        const cell = HOME_COLUMN_CELLS[pawn.color][idxInHome];
        pushPawn(`${cell.r}-${cell.c}`, pawn);
      } else if (pawn.progress === 57) {
        // arrivé : on l'affiche au centre
        pushPawn(`7-7`, pawn);
      } else {
        const idx = pawnTrackIndex(pawn);
        if (idx !== -1) {
          const cell = TRACK_CELLS[idx];
          pushPawn(`${cell.r}-${cell.c}`, pawn);
        }
      }
    }
  }

  return (
    <div
      className="relative grid bg-[#0d0601] rounded-xl shadow-2xl border-2 border-[#B18A62]/40 overflow-hidden"
      style={{
        gridTemplateColumns: 'repeat(15, minmax(0, 1fr))',
        gridTemplateRows: 'repeat(15, minmax(0, 1fr))',
        aspectRatio: '1 / 1',
        width: 'min(92vmin, 720px)',
      }}
    >
      {/* 4 bases colorées (zones 6x6) */}
      {(Object.keys(BASE_AREAS) as LudoColor[]).map((color) => {
        const area = BASE_AREAS[color];
        return (
          <div
            key={`base-${color}`}
            className="border border-black/30 rounded-md m-1"
            style={{
              gridRow: `${area.rStart + 1} / span 6`,
              gridColumn: `${area.cStart + 1} / span 6`,
              background: `linear-gradient(135deg, ${COLOR_HEX[color]} 0%, ${COLOR_LIGHT[color]} 100%)`,
              outline: currentColor === color ? `3px solid ${COLOR_HEX[color]}` : 'none',
              outlineOffset: '-2px',
              boxShadow: currentColor === color ? `0 0 24px ${COLOR_HEX[color]}` : 'inset 0 1px 2px rgba(0,0,0,0.2)',
            }}
          >
            {/* 4 emplacements internes pour les pions au repos */}
            <div className="relative w-full h-full">
              {[0, 1, 2, 3].map((i) => {
                const spot = area.pawnSpots[i];
                // % position relative à la zone 6x6
                const xPct = ((spot.c - area.cStart) / 6) * 100 + 8;
                const yPct = ((spot.r - area.rStart) / 6) * 100 + 8;
                return (
                  <div
                    key={i}
                    className="absolute rounded-full bg-white/40 border border-black/20"
                    style={{
                      left: `${xPct}%`,
                      top: `${yPct}%`,
                      width: '28%',
                      height: '28%',
                    }}
                  />
                );
              })}
            </div>
          </div>
        );
      })}

      {/* Centre : triangle d'arrivée 3x3 (rangées 6-8, colonnes 6-8) */}
      <div
        className="flex items-center justify-center"
        style={{
          gridRow: '7 / span 3',
          gridColumn: '7 / span 3',
          background: 'radial-gradient(circle, #fde68a 0%, #4F2F17 100%)',
        }}
      >
        <div className="text-2xl">🏁</div>
      </div>

      {/* Cases de la piste + colonnes maison */}
      {Array.from({ length: 15 }).map((_, r) =>
        Array.from({ length: 15 }).map((_, c) => {
          const key = `${r}-${c}`;
          const meta = cellMap.get(key);
          if (!meta) return null;

          const isTrack = meta.kind === 'track';
          const trackIdx = isTrack ? meta.idx : -1;
          const village = isTrack ? LUDO_VILLAGES[trackIdx] : null;
          const isSafe = isTrack && SAFE_INDICES.has(trackIdx);
          const isStartFor = (Object.keys(COLOR_START_INDEX) as LudoColor[]).find(
            (col) => COLOR_START_INDEX[col] === trackIdx,
          );
          const homeColor = !isTrack ? meta.color : null;
          const cellPawns = pawnsByCell.get(key) ?? [];

          return (
            <div
              key={key}
              onMouseEnter={() => onHoverCell(isTrack ? trackIdx : null)}
              onMouseLeave={() => onHoverCell(null)}
              className="relative border border-black/40"
              style={{
                gridRow: `${r + 1}`,
                gridColumn: `${c + 1}`,
                background: homeColor
                  ? COLOR_LIGHT[homeColor]
                  : isStartFor
                  ? COLOR_LIGHT[isStartFor]
                  : '#fef9c3',
              }}
            >
              {isSafe && (
                <span className="absolute inset-0 flex items-center justify-center text-[10px] opacity-50 pointer-events-none">
                  ★
                </span>
              )}
              {village && hoveredCellIdx === trackIdx && (
                <div
                  className="absolute z-30 pointer-events-none px-1.5 py-0.5 rounded text-[10px] font-semibold whitespace-nowrap"
                  style={{
                    bottom: '105%',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    background: 'rgba(13,6,1,0.95)',
                    color: '#F4CE96',
                    border: '1px solid #B18A62',
                  }}
                >
                  {village.name}
                </div>
              )}
              {/* Pions sur la case */}
              <div className="absolute inset-0 flex items-center justify-center">
                {cellPawns.map((p, i) => {
                  const selectable = selectablePawnIds.includes(p.id);
                  const offset = (i - (cellPawns.length - 1) / 2) * 6;
                  return (
                    <motion.button
                      key={p.id}
                      layout
                      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
                      onClick={() => selectable && onPawnClick(p.id)}
                      className="absolute rounded-full"
                      style={{
                        width: '70%',
                        height: '70%',
                        left: `calc(50% + ${offset}px)`,
                        top: '50%',
                        transform: 'translate(-50%, -50%)',
                        background: `radial-gradient(circle at 35% 30%, #fff 0%, ${COLOR_HEX[p.color]} 60%, #000 130%)`,
                        border: `1.5px solid ${COLOR_HEX[p.color]}`,
                        boxShadow: selectable
                          ? `0 0 0 2px #fff, 0 0 12px ${COLOR_HEX[p.color]}`
                          : '0 1px 3px rgba(0,0,0,0.6)',
                        cursor: selectable ? 'pointer' : 'default',
                        zIndex: selectable ? 10 : 5,
                      }}
                      whileHover={selectable ? { scale: 1.15 } : undefined}
                      whileTap={selectable ? { scale: 0.95 } : undefined}
                      animate={
                        selectable
                          ? { scale: [1, 1.1, 1] }
                          : { scale: 1 }
                      }
                    />
                  );
                })}
              </div>
            </div>
          );
        }),
      )}
    </div>
  );
}
