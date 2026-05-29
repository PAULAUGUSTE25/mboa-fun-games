'use client';

import { ReactNode } from 'react';

interface GameTableProps {
  children: ReactNode;
}

/**
 * The felt table where deck + discard sit.
 * 2.5D effect via gradients + multiple shadows + slight perspective.
 */
export function GameTable({ children }: GameTableProps) {
  return (
    <div
      className="relative rounded-[40px] sm:rounded-[60px] p-6 sm:p-10"
      style={{
        background: `
          radial-gradient(ellipse at center, #1a5c4f 0%, #0e3a30 60%, #082822 100%)
        `,
        boxShadow: `
          inset 0 0 60px rgba(0, 0, 0, 0.5),
          inset 0 0 0 2px rgba(233, 195, 73, 0.15),
          inset 0 0 0 6px rgba(0, 0, 0, 0.3),
          inset 0 0 0 8px rgba(233, 195, 73, 0.08),
          0 20px 60px rgba(0, 0, 0, 0.6)
        `,
      }}
    >
      {/* Subtle felt texture */}
      <div
        className="absolute inset-0 rounded-[40px] sm:rounded-[60px] opacity-10 pointer-events-none"
        style={{
          backgroundImage:
            'repeating-linear-gradient(45deg, transparent 0 2px, rgba(255,255,255,0.05) 2px 3px)',
        }}
      />

      {/* Center logo watermark */}
      <div className="absolute inset-0 flex items-center justify-center pointer-events-none opacity-[0.04]">
        <span className="text-6xl sm:text-8xl font-bold text-mboa-gold tracking-widest">
          MBOA
        </span>
      </div>

      <div className="relative">{children}</div>
    </div>
  );
}
