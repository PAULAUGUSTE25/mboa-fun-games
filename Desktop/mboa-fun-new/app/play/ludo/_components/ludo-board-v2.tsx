'use client';

/**
 * Ludo board v2 — Ludo-King-style polished design.
 *
 * Layout (15x15 grid):
 *   ┌──────┬───┬──────┐
 *   │ red  │ ↓ │ blue │   col 0..5 | col 6..8 | col 9..14
 *   │ base │ B │ base │   row 0..5
 *   ├──────┼───┼──────┤
 *   │ R →  │ X │  ← G │   row 6..8 — full cross
 *   ├──────┼───┼──────┤
 *   │yellow│ Y │green │   row 9..14
 *   │ base │ ↑ │ base │
 *   └──────┴───┴──────┘
 *
 * The 52 perimeter cells form a cross. The 5 "home column" cells per colour
 * are coloured paths leading to the central finish square.
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
import { LudoPawn as LudoPawnGfx } from './ludo-pawn';

type Cell = { r: number; c: number };

// 52-cell clockwise track (red entry at index 0).
const TRACK_CELLS: Cell[] = [
  { r: 6, c: 1 }, { r: 6, c: 2 }, { r: 6, c: 3 }, { r: 6, c: 4 }, { r: 6, c: 5 },
  { r: 5, c: 6 }, { r: 4, c: 6 }, { r: 3, c: 6 }, { r: 2, c: 6 }, { r: 1, c: 6 }, { r: 0, c: 6 },
  { r: 0, c: 7 }, { r: 0, c: 8 },
  { r: 1, c: 8 }, { r: 2, c: 8 }, { r: 3, c: 8 }, { r: 4, c: 8 }, { r: 5, c: 8 },
  { r: 6, c: 9 }, { r: 6, c: 10 }, { r: 6, c: 11 }, { r: 6, c: 12 }, { r: 6, c: 13 }, { r: 6, c: 14 },
  { r: 7, c: 14 }, { r: 8, c: 14 },
  { r: 8, c: 13 }, { r: 8, c: 12 }, { r: 8, c: 11 }, { r: 8, c: 10 }, { r: 8, c: 9 },
  { r: 9, c: 8 }, { r: 10, c: 8 }, { r: 11, c: 8 }, { r: 12, c: 8 }, { r: 13, c: 8 }, { r: 14, c: 8 },
  { r: 14, c: 7 }, { r: 14, c: 6 },
  { r: 13, c: 6 }, { r: 12, c: 6 }, { r: 11, c: 6 }, { r: 10, c: 6 }, { r: 9, c: 6 },
  { r: 8, c: 5 }, { r: 8, c: 4 }, { r: 8, c: 3 }, { r: 8, c: 2 }, { r: 8, c: 1 }, { r: 8, c: 0 },
  { r: 7, c: 0 }, { r: 6, c: 0 },
];

const HOME_COLUMN_CELLS: Record<LudoColor, Cell[]> = {
  red:    [{ r: 7, c: 1 }, { r: 7, c: 2 }, { r: 7, c: 3 }, { r: 7, c: 4 }, { r: 7, c: 5 }],
  blue:   [{ r: 1, c: 7 }, { r: 2, c: 7 }, { r: 3, c: 7 }, { r: 4, c: 7 }, { r: 5, c: 7 }],
  green:  [{ r: 7, c: 13 }, { r: 7, c: 12 }, { r: 7, c: 11 }, { r: 7, c: 10 }, { r: 7, c: 9 }],
  yellow: [{ r: 13, c: 7 }, { r: 12, c: 7 }, { r: 11, c: 7 }, { r: 10, c: 7 }, { r: 9, c: 7 }],
};

// Bases: outer 6x6 box. The 4 inner pawn-parking circles sit inside an inner 4x4 zone.
const BASE_ORIGIN: Record<LudoColor, { r: number; c: number }> = {
  red:    { r: 0, c: 0 },
  blue:   { r: 0, c: 9 },
  green:  { r: 9, c: 9 },
  yellow: { r: 9, c: 0 },
};

const COLOR_HEX: Record<LudoColor, string> = {
  red: '#df2833',
  blue: '#2d71ff',
  green: '#1ea45d',
  yellow: '#e9b915',
};
const COLOR_DARK: Record<LudoColor, string> = {
  red: '#741010',
  blue: '#102a7a',
  green: '#062f1d',
  yellow: '#8a5d08',
};
const COLOR_LIGHT: Record<LudoColor, string> = {
  red: '#f3b8b8',
  blue: '#bcd7ff',
  green: '#b9efc8',
  yellow: '#fff09c',
};
const COLOR_DEEP: Record<LudoColor, string> = {
  red: '#b51f28',
  blue: '#1c55c9',
  green: '#13894d',
  yellow: '#d7a60d',
};
// Grandes aires culturelles du Cameroun, affectées aux 4 clans Ludo.
const CLAN_NAME: Record<LudoColor, string> = {
  red:    'Clan Bamiléké', // Ouest / Grassfields
  blue:   'Clan Foulbé',   // Nord / Adamaoua
  yellow: 'Clan Sawa',     // Littoral / Côtier
  green:  'Clan Béti',     // Centre / Sud
};

// Rotation de la flèche ➤ posée sur la case de SORTIE de base (start cell)
// de chaque couleur, pour qu'elle pointe dans le sens de marche réel sur la piste.
//   red    : (6,1) → (6,2)   → DROITE  (0°)
//   blue   : (1,8) → (2,8)   → BAS     (90°)
//   green  : (8,13) → (8,12) → GAUCHE  (180°)
//   yellow : (13,6) → (12,6) → HAUT    (270°)
const START_ROT: Record<LudoColor, number> = {
  red: 0,
  blue: 90,
  green: 180,
  yellow: 270,
};

interface LudoBoardProps {
  players: LudoPlayer[];
  selectablePawnIds: string[];
  onPawnClick: (pawnId: string) => void;
  currentColor: LudoColor;
  hoveredCellIdx: number | null;
  onHoverCell: (idx: number | null) => void;
}

export function LudoBoardV2({
  players,
  selectablePawnIds,
  onPawnClick,
  currentColor,
  hoveredCellIdx,
  onHoverCell,
}: LudoBoardProps) {
  // Build a map from "r-c" → cell descriptor (track or home column)
  type CellInfo =
    | { kind: 'track'; idx: number }
    | { kind: 'home'; color: LudoColor; idx: number };
  const cellMap = new Map<string, CellInfo>();
  TRACK_CELLS.forEach((c, i) => cellMap.set(`${c.r}-${c.c}`, { kind: 'track', idx: i }));
  (Object.keys(HOME_COLUMN_CELLS) as LudoColor[]).forEach((color) => {
    HOME_COLUMN_CELLS[color].forEach((c, i) => cellMap.set(`${c.r}-${c.c}`, { kind: 'home', color, idx: i }));
  });

  // Group pawns by absolute board position
  const pawnsByCell = new Map<string, LudoPawn[]>();
  const pawnsInBase: Record<LudoColor, LudoPawn[]> = { red: [], blue: [], green: [], yellow: [] };
  const finishedPawns: LudoPawn[] = [];

  for (const player of players) {
    for (const pawn of player.pawns) {
      if (isInBase(pawn)) {
        pawnsInBase[pawn.color].push(pawn);
      } else if (pawn.progress === 57) {
        finishedPawns.push(pawn);
      } else if (isInHomeColumn(pawn)) {
        const cell = HOME_COLUMN_CELLS[pawn.color][pawn.progress - 52];
        const key = `${cell.r}-${cell.c}`;
        const arr = pawnsByCell.get(key) ?? [];
        arr.push(pawn);
        pawnsByCell.set(key, arr);
      } else {
        const idx = pawnTrackIndex(pawn);
        if (idx !== -1) {
          const cell = TRACK_CELLS[idx];
          const key = `${cell.r}-${cell.c}`;
          const arr = pawnsByCell.get(key) ?? [];
          arr.push(pawn);
          pawnsByCell.set(key, arr);
        }
      }
    }
  }

  // Render helpers
  const renderTrackCell = (r: number, c: number, info: CellInfo) => {
    const key = `${r}-${c}`;
    const isTrack = info.kind === 'track';
    const trackIdx = isTrack ? info.idx : -1;
    const village = isTrack ? LUDO_VILLAGES[trackIdx] : null;
    const isSafe = isTrack && SAFE_INDICES.has(trackIdx);
    const startColor = isTrack
      ? (Object.keys(COLOR_START_INDEX) as LudoColor[]).find((col) => COLOR_START_INDEX[col] === trackIdx)
      : undefined;
    const homeColor = info.kind === 'home' ? info.color : null;
    const cellPawns = pawnsByCell.get(key) ?? [];
    const isHovered = trackIdx === hoveredCellIdx;

    const STONE = '#e9e3d4';
    let bg: string =
      `linear-gradient(145deg, rgba(255,255,255,0.42), rgba(255,255,255,0.06)), ${STONE}`;
    // Couloir maison + case de sortie : dégradé saturé pour qu'on RESSENTE la couleur.
    if (homeColor) {
      bg = `linear-gradient(145deg, ${COLOR_LIGHT[homeColor]} 0%, ${COLOR_HEX[homeColor]} 55%, ${COLOR_DEEP[homeColor]} 100%)`;
    } else if (startColor) {
      bg = `linear-gradient(145deg, ${COLOR_LIGHT[startColor]} 0%, ${COLOR_HEX[startColor]} 60%, ${COLOR_DEEP[startColor]} 100%)`;
    }

    return (
      <div
        key={key}
        onMouseEnter={() => onHoverCell(isTrack ? trackIdx : null)}
        onMouseLeave={() => onHoverCell(null)}
        className="relative"
        style={{
          gridRow: r + 1,
          gridColumn: c + 1,
          background: bg,
          border: '1px solid rgba(27,16,8,0.4)',
          boxShadow: isHovered
            ? 'inset 0 0 0 2px #f59e0b'
            : 'inset 0 0 0 1px rgba(255,255,255,0.25)',
        }}
      >
        {/* Coloured arrow on each base's START cell, pointing in the actual
            forward march direction along the track — like a classic Ludo board. */}
        {startColor && (
          <span
            className="absolute inset-0 flex items-center justify-center text-2xl font-black pointer-events-none"
            style={{
              color: '#ffffff',
              textShadow:
                '0 0 2px #000, 0 0 2px #000, 0 0 3px #000, 0 2px 0 rgba(0,0,0,0.55)',
              transform: `rotate(${START_ROT[startColor]}deg)`,
            }}
          >
            ➤
          </span>
        )}
        {/* Star on safe cells (non-entry safe) */}
        {isSafe && !startColor && (
          <span
            className="absolute inset-0 flex items-center justify-center text-lg pointer-events-none"
            style={{ color: '#070706', textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
          >
            ✦
          </span>
        )}
        {/* Tooltip village name */}
        {village && isHovered && (
          <div
            className="absolute z-40 pointer-events-none px-2 py-1 rounded text-[11px] font-bold whitespace-nowrap"
            style={{
              bottom: '110%',
              left: '50%',
              transform: 'translateX(-50%)',
              background: '#0d0601',
              color: '#F4CE96',
              border: '1px solid #B18A62',
              boxShadow: '0 2px 8px rgba(0,0,0,0.6)',
            }}
          >
            {village.name}
          </div>
        )}
        {/* Pawns on this cell */}
        <div className="absolute inset-0 flex items-center justify-center">
          {cellPawns.map((p, i) => {
            const total = cellPawns.length;
            const offsetX = total > 1 ? (i - (total - 1) / 2) * 4 : 0;
            const offsetY = total > 1 ? (i - (total - 1) / 2) * 2 : 0;
            const selectable = selectablePawnIds.includes(p.id);
            return (
              <div
                key={p.id}
                className="absolute"
                style={{
                  width: '95%',
                  height: '95%',
                  left: `calc(50% + ${offsetX}px)`,
                  top: `calc(50% + ${offsetY}px)`,
                  transform: 'translate(-50%, -50%)',
                  zIndex: selectable ? 30 : 10 + i,
                }}
              >
                <LudoPawnGfx
                  color={p.color}
                  selectable={selectable}
                  onClick={() => selectable && onPawnClick(p.id)}
                />
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  return (
    <motion.div
      className="relative"
      animate={{
        // Lueur dorée qui respire autour du cadre
        boxShadow: [
          '0 0 0 7px rgba(0,0,0,0.4), 0 28px 80px rgba(0,0,0,0.75), inset 0 0 35px rgba(255,213,121,0.10), 0 0 12px rgba(216,168,74,0.25)',
          '0 0 0 7px rgba(0,0,0,0.4), 0 28px 80px rgba(0,0,0,0.75), inset 0 0 45px rgba(255,213,121,0.22), 0 0 28px rgba(255,213,121,0.55)',
          '0 0 0 7px rgba(0,0,0,0.4), 0 28px 80px rgba(0,0,0,0.75), inset 0 0 35px rgba(255,213,121,0.10), 0 0 12px rgba(216,168,74,0.25)',
        ],
      }}
      transition={{ duration: 4.2, repeat: Infinity, ease: 'easeInOut' }}
      style={{
        padding: 26,
        borderRadius: 28,
        background:
          'linear-gradient(135deg, rgba(255,224,150,0.16), transparent 28%), linear-gradient(45deg, #160b05, #301708 45%, #120905)',
        border: '2px solid rgba(216,168,74,0.75)',
        fontFamily: 'Georgia, "Times New Roman", serif',
      }}
    >
      {/* Side ornaments */}
      <div
        aria-hidden
        className="absolute hidden md:grid place-items-center rounded-full z-20"
        style={{
          width: 64, height: 64, left: -28, top: '50%', transform: 'translateY(-50%)',
          border: '2px solid rgba(216,168,74,0.7)',
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22), transparent 28%), linear-gradient(145deg, #2b1809, #070504)',
          color: '#ffe2a0', fontSize: 30,
          boxShadow: '0 10px 24px rgba(0,0,0,0.65), inset 0 0 15px rgba(216,168,74,0.18)',
        }}
      >🦁</div>
      <div
        aria-hidden
        className="absolute hidden md:grid place-items-center rounded-full z-20"
        style={{
          width: 64, height: 64, right: -28, top: '50%', transform: 'translateY(-50%)',
          border: '2px solid rgba(216,168,74,0.7)',
          background: 'radial-gradient(circle at 30% 20%, rgba(255,255,255,0.22), transparent 28%), linear-gradient(145deg, #2b1809, #070504)',
          color: '#ffe2a0', fontSize: 30,
          boxShadow: '0 10px 24px rgba(0,0,0,0.65), inset 0 0 15px rgba(216,168,74,0.18)',
        }}
      >👑</div>

      {/* Bottom ribbon */}
      <div
        className="absolute z-10 text-center"
        style={{
          left: '50%', bottom: -18, transform: 'translateX(-50%)',
          width: 'min(86%, 650px)', padding: '12px 20px', borderRadius: 14,
          border: '2px solid rgba(255,225,151,0.72)',
          background:
            'linear-gradient(90deg, rgba(0,95,55,0.26), transparent 22%, rgba(207,20,43,0.22)), linear-gradient(180deg, #18100a, #080503)',
          boxShadow: '0 12px 30px rgba(0,0,0,0.55), inset 0 0 15px rgba(216,168,74,0.22)',
          fontWeight: 900, letterSpacing: '0.2em', fontSize: 18,
          color: '#ffe2a0', textTransform: 'uppercase', textShadow: '0 3px 0 #000',
        }}
      >
        Ludo Mboa
      </div>

      <div
        className="relative grid overflow-hidden"
        style={{
          gridTemplateColumns: 'repeat(15, 1fr)',
          gridTemplateRows: 'repeat(15, 1fr)',
          aspectRatio: '1 / 1',
          width: 'min(86vmin, 680px)',
          borderRadius: 18,
          border: '5px solid #070504',
          outline: '2px solid rgba(216,168,74,0.85)',
          background:
            'linear-gradient(90deg, rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / calc(100%/15) calc(100%/15), linear-gradient(rgba(255,255,255,0.035) 1px, transparent 1px) 0 0 / calc(100%/15) calc(100%/15), radial-gradient(circle at 50% 50%, rgba(216,168,74,0.13), transparent 42%), #19110b',
          boxShadow: 'inset 0 0 35px rgba(0,0,0,0.9)',
          gap: 0,
        }}
      >
      {/* ─── BASES ─── */}
      {(Object.keys(BASE_ORIGIN) as LudoColor[]).map((color) => {
        const origin = BASE_ORIGIN[color];
        const isCurrent = currentColor === color;
        return (
          <div
            key={`base-${color}`}
            className="relative flex items-center justify-center"
            style={{
              gridRow: `${origin.r + 1} / span 6`,
              gridColumn: `${origin.c + 1} / span 6`,
              background: `radial-gradient(circle at 50% 18%, rgba(255,255,255,0.22), transparent 24%), linear-gradient(135deg, ${COLOR_HEX[color]}, ${COLOR_DARK[color]} 78%)`,
              border: '3px solid rgba(255,221,145,0.75)',
              boxShadow: isCurrent
                ? `inset 0 0 0 6px rgba(0,0,0,0.16), inset 0 0 28px rgba(0,0,0,0.6), 0 0 28px ${COLOR_HEX[color]}aa`
                : 'inset 0 0 0 6px rgba(0,0,0,0.16), inset 0 0 28px rgba(0,0,0,0.6)',
            }}
          >
            {/* Clan label */}
            <span
              className="absolute pointer-events-none select-none"
              style={{
                left: '8%', top: '6%',
                color: 'rgba(255,231,169,0.94)',
                fontSize: 11, fontWeight: 800,
                letterSpacing: '0.15em', textTransform: 'uppercase',
                textShadow: '0 2px 0 #000',
              }}
            >
              {CLAN_NAME[color]}
            </span>
            {/* Inner cream yard */}
            <div
              className="relative grid"
              style={{
                width: '72%',
                height: '72%',
                background: 'linear-gradient(135deg, #fff7c5, #f4dfa0 55%, #d7b15d)',
                borderRadius: '16px',
                border: '3px solid rgba(255,249,203,0.8)',
                gridTemplateColumns: '1fr 1fr',
                gridTemplateRows: '1fr 1fr',
                gap: '14%',
                padding: '12%',
                boxShadow: 'inset 0 0 20px rgba(0,0,0,0.22), 0 10px 18px rgba(0,0,0,0.35)',
              }}
            >
              {[0, 1, 2, 3].map((slot) => {
                const pawn = pawnsInBase[color][slot];
                const selectable = pawn ? selectablePawnIds.includes(pawn.id) : false;
                return (
                  <div
                    key={slot}
                    className="relative flex items-center justify-center rounded-full"
                    style={{
                      background: `radial-gradient(circle at 30% 25%, #fff 0%, ${COLOR_LIGHT[color]} 80%)`,
                      border: `2px solid ${COLOR_DARK[color]}`,
                      boxShadow: 'inset 0 -3px 5px rgba(0,0,0,0.18)',
                    }}
                  >
                    {pawn && (
                      <div className="w-[88%] h-[88%]">
                        <LudoPawnGfx
                          color={pawn.color}
                          selectable={selectable}
                          onClick={() => selectable && onPawnClick(pawn.id)}
                        />
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      })}

      {/* ─── CENTER (4 colored triangles converging) ─── */}
      <div
        className="relative"
        style={{
          gridRow: '7 / span 3',
          gridColumn: '7 / span 3',
          background: '#0d0601',
          border: '2px solid rgba(0,0,0,0.5)',
        }}
      >
        <svg viewBox="0 0 100 100" className="absolute inset-0 w-full h-full">
          {/* 4 triangles meeting at centre */}
          <polygon points="0,0 100,0 50,50" fill={COLOR_HEX.blue} stroke="#000" strokeWidth="0.8" />
          <polygon points="100,0 100,100 50,50" fill={COLOR_HEX.green} stroke="#000" strokeWidth="0.8" />
          <polygon points="100,100 0,100 50,50" fill={COLOR_HEX.yellow} stroke="#000" strokeWidth="0.8" />
          <polygon points="0,100 0,0 50,50" fill={COLOR_HEX.red} stroke="#000" strokeWidth="0.8" />
          <circle cx="50" cy="50" r="14" fill="#fde68a" stroke="#92400e" strokeWidth="2" />
          <text
            x="50"
            y="58"
            textAnchor="middle"
            fontSize="20"
            fontWeight="bold"
            fill="#92400e"
          >
            🏆
          </text>
        </svg>
        {/* Finished pawn indicators */}
        <div className="absolute inset-0 grid grid-cols-2 grid-rows-2 pointer-events-none">
          {(['red', 'blue', 'green', 'yellow'] as LudoColor[]).map((color, i) => {
            const finishedCount = finishedPawns.filter((p) => p.color === color).length;
            if (finishedCount === 0) return null;
            const positions = [
              { top: '8%', left: '8%' },
              { top: '8%', right: '8%' },
              { bottom: '8%', right: '8%' },
              { bottom: '8%', left: '8%' },
            ];
            const colorOrder: LudoColor[] = ['red', 'blue', 'green', 'yellow'];
            const idx = colorOrder.indexOf(color);
            return (
              <div
                key={color}
                className="absolute text-[10px] font-black px-1.5 py-0.5 rounded-full"
                style={{
                  ...positions[idx],
                  background: '#fde68a',
                  color: COLOR_DARK[color],
                  border: `1.5px solid ${COLOR_DARK[color]}`,
                }}
              >
                ×{finishedCount}
              </div>
            );
          })}
        </div>
      </div>

      {/* ─── TRACK + HOME COLUMNS ─── */}
      {Array.from({ length: 15 }).flatMap((_, r) =>
        Array.from({ length: 15 }).map((_, c) => {
          const info = cellMap.get(`${r}-${c}`);
          if (!info) return null;
          return renderTrackCell(r, c, info);
        }),
      )}
      </div>
    </motion.div>
  );
}
