'use client';

import { motion } from 'framer-motion';

interface DiceProps {
  value: number; // 1..6
  rolling?: boolean;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'w-10 h-10',
  md: 'w-14 h-14',
  lg: 'w-20 h-20',
};

const dotSizeClasses = {
  sm: 'w-1 h-1',
  md: 'w-1.5 h-1.5',
  lg: 'w-2.5 h-2.5',
};

/**
 * Pip positions for each face (in a 3x3 grid using grid-area).
 * Each face = array of grid cell indices (0..8) where a dot should be.
 */
const DOT_POSITIONS: Record<number, number[]> = {
  1: [4],
  2: [0, 8],
  3: [0, 4, 8],
  4: [0, 2, 6, 8],
  5: [0, 2, 4, 6, 8],
  6: [0, 2, 3, 5, 6, 8],
};

export function Dice({ value, rolling, size = 'md' }: DiceProps) {
  const dots = DOT_POSITIONS[value] || [];

  return (
    <motion.div
      animate={
        rolling
          ? { rotate: [0, 360, 720, 1080], scale: [1, 1.1, 0.95, 1] }
          : { rotate: 0, scale: 1 }
      }
      transition={{ duration: rolling ? 0.8 : 0.3, ease: 'easeOut' }}
      className={`relative ${sizeClasses[size]}`}
      style={{ perspective: '600px' }}
    >
      <div
        className="relative w-full h-full rounded-lg sm:rounded-xl flex items-center justify-center"
        style={{
          background: 'linear-gradient(135deg, #1a1108 0%, #0D0601 60%, #050200 100%)',
          boxShadow: `
            0 6px 16px rgba(0, 0, 0, 0.7),
            0 2px 4px rgba(0, 0, 0, 0.5),
            0 0 0 1px #B18A62,
            inset 0 1px 0 rgba(206, 162, 113, 0.35),
            inset 0 -1px 0 rgba(0, 0, 0, 0.6)
          `,
          border: '1px solid #B18A62',
        }}
      >
        <div className="grid grid-cols-3 grid-rows-3 gap-0.5 sm:gap-1 p-2 w-full h-full">
          {Array.from({ length: 9 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center">
              {dots.includes(i) && (
                <div
                  className={`${dotSizeClasses[size]} rounded-full`}
                  style={{
                    background: 'radial-gradient(circle at 30% 30%, #FFEFC8 0%, #F4CE96 60%, #B18A62 100%)',
                    boxShadow: '0 0 4px rgba(244, 206, 150, 0.6), inset 0 1px 0 rgba(255,255,255,0.4)',
                  }}
                />
              )}
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
