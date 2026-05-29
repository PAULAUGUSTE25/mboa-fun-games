'use client';

import { ReactNode, useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, RotateCcw, Copy } from 'lucide-react';
import type { Player } from '../_types/empire';
import { PlayerToken } from './player-token';

interface ImageBoardProps {
  players: Player[];
  /** Id of the active player — pawn pulses to highlight whose turn it is. */
  activePlayerId?: string;
  /** Optional center HUD content (dice, buttons, etc.) */
  centerContent?: ReactNode;
  /** Optional content rendered over the bottom carved-wood band of the board image */
  bottomContent?: ReactNode;
  /** When true, shows numbered gold hotspots at each cell position for calibration */
  showDebug?: boolean;
}

/**
 * Board positions in the empire-bg.png image, as % coordinates.
 * The board occupies roughly x: 9-91%, y: 27-95% of the image.
 * 32 cells: 4 corners + 7 inner cells per side, clockwise from DÉPART (bottom-left).
 */
interface CellPosition {
  /** Center X in % of board container */
  x: number;
  /** Center Y in % of board container */
  y: number;
}

/**
 * Canonical cell names, going CLOCKWISE from DÉPART (index 0).
 * 29 entries — must stay in sync with CELL_POSITIONS.
 */
export const CELL_NAMES: string[] = [
  'DÉPART',                    // 0
  'Quartier Résidentiel',      // 1
  'Place des Fêtes',           // 2
  'Chance ?',                  // 3
  'Route des Palmiers',        // 4
  'École des Leaders',         // 5
  'Hôtel des Ambassadeurs',    // 6
  'Palais Royal',              // 7
  'IMPÔTS',                    // 8
  'Caisse Commune',            // 9
  'Trésor',                    // 10
  'Centre Commercial',         // 11
  'Village Artisanal',         // 12
  'Village Artisanal',         // 13
  'Industrie',                 // 14
  'Aéroport International',    // 15
  'Gare Routière',             // 16
  'Port Autonome',             // 17
  'Chance',                    // 18
  'Maetur',                    // 19
  'Boulevard de la Liberté',   // 20
  'Marché',                    // 21
  'Prison',                    // 22
  'Quartier Administratif',    // 23
  'Cité Universitaire',        // 24
  'Stade Omnisport',           // 25
  'Trésor',                    // 26
  'Caisse Commune',            // 27
];

/**
 * Hand-calibrated cell centers for the empire-bg.png board.
 * 28 cells total (0..27), going CLOCKWISE from DÉPART (bottom-left corner).
 * Coordinates are in % of the board container (so they remain accurate at any size).
 * These values were tuned visually in debug mode using the draggable hotspots.
 */
export const CELL_POSITIONS: CellPosition[] = [
  { x: 14.55, y: 75.18 }, // 0  — DÉPART
  { x: 25.73, y: 77.52 }, // 1  — Quartier Résidentiel
  { x: 34.36, y: 77.27 }, // 2  — Place des Fêtes
  { x: 41.45, y: 76.48 }, // 3  — Chance ?
  { x: 49.18, y: 74.73 }, // 4  — Route des Palmiers
  { x: 55.64, y: 74.75 }, // 5  — École des Leaders
  { x: 63.27, y: 74.64 }, // 6  — Hôtel des Ambassadeurs
  { x: 70.09, y: 74.52 }, // 7  — Palais Royal
  { x: 81.27, y: 74.14 }, // 8  — IMPÔTS
  { x: 78.71, y: 64.85 }, // 9  — Caisse Commune
  { x: 76.43, y: 57.84 }, // 10 — Trésor
  { x: 74.51, y: 51.10 }, // 11 — Centre Commercial
  { x: 72.86, y: 45.81 }, // 12 — Village Artisanal
  { x: 71.84, y: 40.71 }, // 13 — Village Artisanal
  { x: 70.47, y: 36.01 }, // 14 — Industrie
  { x: 67.64, y: 30.59 }, // 15 — Aéroport International
  { x: 62.29, y: 31.00 }, // 16 — Gare Routière
  { x: 57.30, y: 30.86 }, // 17 — Port Autonome
  { x: 52.49, y: 30.86 }, // 18 — Chance
  { x: 46.60, y: 30.59 }, // 19 — Maetur
  { x: 42.25, y: 30.45 }, // 20 — Boulevard de la Liberté
  { x: 37.26, y: 30.18 }, // 21 — Marché
  { x: 30.45, y: 31.14 }, // 22 — Prison
  { x: 27.17, y: 36.30 }, // 23 — Quartier Administratif
  { x: 25.88, y: 41.32 }, // 24 — Cité Universitaire
  { x: 23.78, y: 48.53 }, // 25 — Stade Omnisport
  { x: 19.77, y: 55.60 }, // 26 — Trésor
  { x: 17.39, y: 63.90 }, // 27 — Caisse Commune
];

export function ImageBoard({ players, activePlayerId, centerContent, bottomContent, showDebug }: ImageBoardProps) {
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  // Lazy init from localStorage so calibration survives reloads
  const [cells, setCells] = useState<CellPosition[]>(() => {
    if (typeof window === 'undefined') return CELL_POSITIONS;
    try {
      const saved = window.localStorage.getItem('empire.cells');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === CELL_POSITIONS.length) {
          return parsed;
        }
      }
    } catch {}
    return CELL_POSITIONS;
  });
  const [names] = useState<string[]>(CELL_NAMES);

  // Auto-save cells to localStorage whenever they change
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      window.localStorage.setItem('empire.cells', JSON.stringify(cells));
    } catch {}
  }, [cells]);
  const boardRef = useRef<HTMLDivElement>(null);
  const panDragRef = useRef<{ startX: number; startY: number; origX: number; origY: number } | null>(null);
  const cellDragRef = useRef<{ index: number; startX: number; startY: number; origCell: CellPosition } | null>(null);

  const zoomIn = () => setZoom((z) => Math.min(z * 1.25, 4));
  const zoomOut = () => setZoom((z) => Math.max(z / 1.25, 1));
  const zoomReset = () => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
  };

  const onMouseDown = (e: React.MouseEvent) => {
    if (zoom <= 1) return;
    panDragRef.current = { startX: e.clientX, startY: e.clientY, origX: pan.x, origY: pan.y };
  };
  const onMouseMove = (e: React.MouseEvent) => {
    // Cell drag has priority over board pan
    if (cellDragRef.current && boardRef.current) {
      const d = cellDragRef.current;
      const rect = boardRef.current.getBoundingClientRect();
      const dxPct = ((e.clientX - d.startX) / rect.width) * 100 / zoom;
      const dyPct = ((e.clientY - d.startY) / rect.height) * 100 / zoom;
      setCells((prev) =>
        prev.map((c, i) =>
          i === d.index ? { x: d.origCell.x + dxPct, y: d.origCell.y + dyPct } : c
        )
      );
      return;
    }
    if (!panDragRef.current) return;
    const d = panDragRef.current;
    setPan({ x: d.origX + (e.clientX - d.startX), y: d.origY + (e.clientY - d.startY) });
  };
  const onMouseUp = () => {
    panDragRef.current = null;
    cellDragRef.current = null;
  };

  const startCellDrag = (e: React.MouseEvent, index: number) => {
    e.stopPropagation();
    e.preventDefault();
    cellDragRef.current = {
      index,
      startX: e.clientX,
      startY: e.clientY,
      origCell: { ...cells[index] },
    };
  };

  const resetPositions = () => {
    if (
      typeof window !== 'undefined' &&
      window.confirm('Réinitialiser toutes les positions des cases aux valeurs par défaut ?')
    ) {
      setCells(CELL_POSITIONS);
      try {
        window.localStorage.removeItem('empire.cells');
      } catch {}
    }
  };

  const copyPositions = () => {
    const payload = cells
      .map((c, i) => `  { x: ${c.x.toFixed(2)}, y: ${c.y.toFixed(2)} }, // ${i} — ${names[i] ?? ''}`)
      .join('\n');
    const text = `export const CELL_POSITIONS: CellPosition[] = [\n${payload}\n];`;
    navigator.clipboard?.writeText(text).then(
      () => console.log('[ImageBoard] CELL_POSITIONS copied to clipboard'),
      (err) => console.error('[ImageBoard] copy failed', err)
    );
    console.log(text);
  };

  return (
    <div className="relative w-full max-w-[1100px] mx-auto">
      <div
        ref={boardRef}
        className="relative w-full overflow-hidden rounded-2xl"
        style={{
          aspectRatio: '3 / 2',
          boxShadow:
            '0 30px 80px rgba(0, 0, 0, 0.7), 0 0 0 2px #B18A62, 0 0 0 4px #1C1308, 0 0 60px rgba(206, 162, 113, 0.15)',
          cursor: zoom > 1 ? (panDragRef.current ? 'grabbing' : 'grab') : 'default',
        }}
        onMouseDown={onMouseDown}
        onMouseMove={onMouseMove}
        onMouseUp={onMouseUp}
        onMouseLeave={onMouseUp}
      >
        {/* Zoomable & pannable inner stage */}
        <div
          className="absolute inset-0"
          style={{
            transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
            transformOrigin: 'center center',
            backgroundImage: 'url(/assets/backgrounds/empire-bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            transition: panDragRef.current || cellDragRef.current ? 'none' : 'transform 0.15s ease-out',
          }}
        >
        {/* Warm vignette to integrate the image */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            background:
              'radial-gradient(ellipse at center, transparent 50%, rgba(28, 19, 8, 0.5) 100%)',
          }}
        />

        {/* DEBUG: draggable numbered hotspots + cell names */}
        {showDebug &&
          cells.map((cell, i) => (
            <div
              key={`debug-${i}`}
              className="absolute flex flex-col items-center select-none"
              style={{
                left: `${cell.x}%`,
                top: `${cell.y}%`,
                transform: 'translate(-50%, -50%)',
                zIndex: 15,
              }}
            >
              <div
                onMouseDown={(e) => startCellDrag(e, i)}
                className="flex items-center justify-center font-bold text-[10px] cursor-move"
                style={{
                  width: '28px',
                  height: '28px',
                  background:
                    'radial-gradient(circle, rgba(244,206,150,0.9) 0%, rgba(177,138,98,0.7) 70%, rgba(28,19,8,0.4) 100%)',
                  border: '2px solid #F4CE96',
                  borderRadius: '50%',
                  color: '#1C1308',
                  textShadow: '0 1px 0 rgba(244,206,150,0.6)',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.6), 0 0 12px rgba(206,162,113,0.4)',
                }}
                title="Drag to reposition"
              >
                {i}
              </div>
              <div
                className="mt-0.5 px-1 text-[8px] font-semibold text-center whitespace-nowrap pointer-events-none"
                style={{
                  color: '#F4CE96',
                  background: 'rgba(28,19,8,0.75)',
                  borderRadius: '3px',
                  textShadow: '0 1px 0 rgba(0,0,0,0.8)',
                  maxWidth: '90px',
                  overflow: 'hidden',
                  textOverflow: 'ellipsis',
                }}
              >
                {names[i]}
              </div>
            </div>
          ))}

        {/* Player tokens positioned at their current cell */}
        {players.map((player, idx) => {
          const cell = cells[player.position % cells.length];
          if (!cell) return null;

          // Offset multiple tokens on same cell
          const sameCell = players.filter((p) => p.position === player.position);
          const indexOnCell = sameCell.findIndex((p) => p.id === player.id);
          const offsetX = (indexOnCell - (sameCell.length - 1) / 2) * 1.8;

          return (
            <motion.div
              key={player.id}
              layout
              transition={{ type: 'spring', stiffness: 180, damping: 22 }}
              className="absolute"
              style={{
                left: `${cell.x + offsetX}%`,
                // anchor the pawn so its base sits on the cell centre
                top: `${cell.y}%`,
                transform: 'translate(-50%, -85%)',
                zIndex: 20 + idx,
              }}
            >
              <PlayerToken
                player={player}
                size="sm"
                active={activePlayerId === player.id}
              />
            </motion.div>
          );
        })}

        </div>
        {/* /Zoomable stage */}

        {/* Bottom HUD (rolls, button) — stays fixed on the carved-wood band, anchored left */}
        {bottomContent && (
          <div
            className="absolute pointer-events-none flex items-center"
            style={{
              left: '3%',
              right: '3%',
              bottom: '1.5%',
              zIndex: 35,
            }}
          >
            <div className="pointer-events-auto w-full">{bottomContent}</div>
          </div>
        )}

        {/* Center HUD (dice + actions) — stays fixed regardless of zoom */}
        {centerContent && (
          <div
            className="absolute pointer-events-none"
            style={{
              left: '50%',
              top: '58%',
              transform: 'translate(-50%, -50%)',
              zIndex: 30,
            }}
          >
            <div className="pointer-events-auto">{centerContent}</div>
          </div>
        )}

        {/* Zoom controls (debug mode only) */}
        {showDebug && (
          <div
            className="absolute top-2 right-2 flex flex-col gap-1"
            style={{ zIndex: 40 }}
            onMouseDown={(e) => e.stopPropagation()}
          >
            <button
              onClick={zoomIn}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-[#B18A62] bg-[#1C1308]/85 text-[#F4CE96] hover:bg-[#4F2F17] transition"
              title="Zoom in"
            >
              <ZoomIn size={16} />
            </button>
            <button
              onClick={zoomOut}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-[#B18A62] bg-[#1C1308]/85 text-[#F4CE96] hover:bg-[#4F2F17] transition"
              title="Zoom out"
            >
              <ZoomOut size={16} />
            </button>
            <button
              onClick={zoomReset}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-[#B18A62] bg-[#1C1308]/85 text-[#F4CE96] hover:bg-[#4F2F17] transition"
              title="Reset zoom & pan"
            >
              <RotateCcw size={14} />
            </button>
            <button
              onClick={copyPositions}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-[#B18A62] bg-[#1C1308]/85 text-[#F4CE96] hover:bg-[#4F2F17] transition"
              title="Copier les positions actuelles (console + presse-papiers)"
            >
              <Copy size={14} />
            </button>
            <button
              onClick={resetPositions}
              className="w-9 h-9 flex items-center justify-center rounded-md border border-[#90271B] bg-[#1C1308]/85 text-[#F4CE96] hover:bg-[#90271B] transition text-[14px] font-bold"
              title="Réinitialiser TOUTES les positions aux valeurs du code"
            >
              ⟲
            </button>
            <div className="text-[10px] text-center text-[#F4CE96] font-mono bg-[#1C1308]/85 rounded px-1 py-0.5 border border-[#B18A62]">
              {zoom.toFixed(2)}×
            </div>
            <div className="text-[9px] text-center text-[#F4CE96] font-mono bg-[#1C1308]/85 rounded px-1 py-0.5 border border-[#B18A62]">
              {cells.length} cases
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
