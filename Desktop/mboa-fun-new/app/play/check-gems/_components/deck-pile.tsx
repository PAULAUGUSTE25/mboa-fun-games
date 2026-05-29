'use client';

import { motion } from 'framer-motion';

interface DeckPileProps {
  count: number;
  onClick?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
}

export function DeckPile({ count, onClick, disabled, highlighted }: DeckPileProps) {
  const stackSize = Math.min(3, Math.max(1, Math.ceil(count / 10)));

  return (
    <motion.button
      onClick={onClick}
      disabled={disabled || count === 0}
      whileHover={!disabled && count > 0 ? { y: -4, scale: 1.03 } : undefined}
      whileTap={!disabled && count > 0 ? { scale: 0.96 } : undefined}
      className={`relative w-16 h-24 sm:w-20 sm:h-28 ${disabled || count === 0 ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
      style={{ perspective: '600px' }}
    >
      {/* Stack effect (multiple layered card backs) */}
      {Array.from({ length: stackSize }).map((_, i) => (
        <div
          key={i}
          className="absolute inset-0 rounded-lg sm:rounded-xl border-2 border-mboa-primary/30 overflow-hidden"
          style={{
            transform: `translate(${i * 2}px, ${-i * 2}px)`,
            background: `
              linear-gradient(135deg, #003d33 0%, #00564a 50%, #003d33 100%)
            `,
            boxShadow: '0 4px 12px rgba(0,0,0,0.4), 0 8px 24px rgba(0,0,0,0.3)',
            zIndex: stackSize - i,
          }}
        >
          {i === 0 && (
            <>
              <div className="absolute inset-1 rounded-md border border-mboa-gold/40" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-8 h-8 sm:w-10 sm:h-10 rotate-45 border-2 border-mboa-gold/70 bg-gradient-to-br from-mboa-gold/20 to-transparent" />
              </div>
            </>
          )}
        </div>
      ))}

      {/* Highlighted glow */}
      {highlighted && (
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="absolute -inset-1 rounded-xl bg-mboa-primary/30 blur-md -z-10"
        />
      )}

      {/* Count badge */}
      <div className="absolute -bottom-2 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded-full bg-mboa-bg/90 border border-mboa-gold/30 text-mboa-gold text-[10px] font-bold whitespace-nowrap">
        {count}
      </div>
    </motion.button>
  );
}
