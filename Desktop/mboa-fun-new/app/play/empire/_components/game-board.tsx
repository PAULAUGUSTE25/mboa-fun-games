'use client';

import { ReactNode } from 'react';
import { BOARD, positionToGrid } from '../_logic/board';
import { BoardSpace } from './board-space';
import type { Player } from '../_types/empire';

interface GameBoardProps {
  players: Player[];
  ownerByPosition?: Record<number, string>; // position -> player color
  highlightedPosition?: number | null;
  onSpaceClick?: (position: number) => void;
  /** Center content (logo, dice, action area) */
  centerContent?: ReactNode;
}

export function GameBoard({
  players,
  ownerByPosition = {},
  highlightedPosition,
  onSpaceClick,
  centerContent,
}: GameBoardProps) {
  // Build 7x7 grid of cells
  const cells = Array.from({ length: 49 }, (_, i) => {
    const row = Math.floor(i / 7);
    const col = i % 7;
    return { row, col, index: i };
  });

  // Map each position to its space
  const spaceByPosition = new Map(BOARD.map((s) => [s.position, s]));

  // Build a lookup of position from grid cell
  function gridToPosition(row: number, col: number): number | null {
    // Search all positions and find matching grid
    for (let p = 0; p < 24; p++) {
      const g = positionToGrid(p);
      if (g.row === row && g.col === col) return p;
    }
    return null;
  }

  return (
    <div
      className="relative w-full max-w-[760px] aspect-square mx-auto"
      style={{
        perspective: '1600px',
        perspectiveOrigin: '50% 35%',
      }}
    >
      {/* Warm spotlight from top */}
      <div
        className="absolute -top-12 left-1/2 -translate-x-1/2 w-3/4 h-1/2 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse at center top, rgba(255, 200, 100, 0.25) 0%, transparent 70%)',
          filter: 'blur(40px)',
        }}
      />

      {/* OUTER CARVED WOOD FRAME with ornate motifs */}
      <div
        className="relative w-full h-full rounded-2xl overflow-hidden"
        style={{
          transform: 'rotateX(22deg)',
          transformStyle: 'preserve-3d',
          background: `
            linear-gradient(135deg, #4F2F17 0%, #2a1810 50%, #1C1308 100%)
          `,
          boxShadow: `
            0 30px 80px rgba(0, 0, 0, 0.85),
            0 15px 40px rgba(0, 0, 0, 0.6),
            0 0 0 2px #684A29,
            0 0 0 4px #1C1308,
            inset 0 1px 0 rgba(244, 206, 150, 0.25),
            inset 0 -1px 0 rgba(0, 0, 0, 0.8)
          `,
        }}
      >
        {/* Carved wood grain on the frame */}
        <div
          className="absolute inset-0 opacity-50 pointer-events-none"
          style={{
            backgroundImage: `
              repeating-linear-gradient(90deg,
                transparent 0 2px,
                rgba(0,0,0,0.25) 2px 3px,
                transparent 3px 8px,
                rgba(212, 165, 116, 0.04) 8px 9px),
              repeating-linear-gradient(0deg,
                transparent 0 12px,
                rgba(0,0,0,0.1) 12px 13px)
            `,
          }}
        />

        {/* Ornate geometric border pattern (Cameroonian motif) */}
        <div className="absolute inset-1 rounded-xl pointer-events-none">
          <div
            className="absolute inset-0 rounded-xl border-2"
            style={{
              borderImage:
                'repeating-linear-gradient(45deg, #B18A62 0 4px, #1C1308 4px 8px) 2',
              opacity: 0.4,
            }}
          />
          {/* Corner gold accents */}
          {[
            'top-1 left-1',
            'top-1 right-1',
            'bottom-1 left-1',
            'bottom-1 right-1',
          ].map((pos) => (
            <div
              key={pos}
              className={`absolute ${pos} w-6 h-6 sm:w-8 sm:h-8 rounded-md`}
              style={{
                background:
                  'radial-gradient(circle at 35% 35%, #F4CE96 0%, #B18A62 50%, #4F2F17 100%)',
                boxShadow:
                  '0 2px 4px rgba(0,0,0,0.6), inset 0 1px 0 rgba(244,206,150,0.7)',
              }}
            />
          ))}
        </div>

        {/* INNER PLAYING SURFACE - polished wood */}
        <div
          className="absolute inset-4 sm:inset-5 rounded-lg overflow-hidden"
          style={{
            background: `
              radial-gradient(ellipse at 50% 30%, #684A29 0%, #4F2F17 45%, #2a1810 80%, #1C1308 100%)
            `,
            boxShadow: `
              inset 0 4px 12px rgba(0, 0, 0, 0.5),
              inset 0 -4px 12px rgba(0, 0, 0, 0.7),
              inset 0 0 80px rgba(0, 0, 0, 0.3),
              0 0 0 1px rgba(0, 0, 0, 0.6),
              0 0 0 2px rgba(177, 138, 98, 0.3)
            `,
          }}
        >
          {/* Polished wood reflection highlight */}
          <div
            className="absolute inset-0 pointer-events-none"
            style={{
              background:
                'linear-gradient(170deg, rgba(255, 220, 150, 0.12) 0%, transparent 30%, transparent 80%, rgba(0, 0, 0, 0.25) 100%)',
            }}
          />

          {/* Strong wood grain */}
          <div
            className="absolute inset-0 opacity-40 pointer-events-none"
            style={{
              backgroundImage: `
                repeating-linear-gradient(88deg,
                  transparent 0 6px,
                  rgba(0,0,0,0.18) 6px 7px,
                  transparent 7px 14px,
                  rgba(255, 220, 150, 0.05) 14px 15px)
              `,
            }}
          />

        {/* Grid */}
        <div className="absolute inset-1.5 sm:inset-2 grid grid-cols-7 grid-rows-7 gap-0">
          {cells.map(({ row, col, index }) => {
            const position = gridToPosition(row, col);
            const isOuter = position !== null;

            if (!isOuter) {
              // Center area: spans interior cells (1..5 row, 1..5 col)
              if (row === 1 && col === 1) {
                return (
                  <div
                    key={index}
                    className="col-span-5 row-span-5 relative flex items-center justify-center"
                  >
                    {centerContent}
                  </div>
                );
              }
              if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
                // Already covered by the span above
                return null;
              }
              return <div key={index} />;
            }

            const space = spaceByPosition.get(position!);
            if (!space) return <div key={index} />;

            const playersOnSpace = players.filter((p) => p.position === position);
            const ownerColor = ownerByPosition[position!];

            return (
              <BoardSpace
                key={index}
                space={space}
                players={playersOnSpace}
                ownerColor={ownerColor}
                highlighted={highlightedPosition === position}
                onClick={onSpaceClick ? () => onSpaceClick(position!) : undefined}
              />
            );
          })}
        </div>
        </div>
      </div>
    </div>
  );
}
