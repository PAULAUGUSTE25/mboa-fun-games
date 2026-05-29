'use client';

import { motion } from 'framer-motion';
import type { Suit } from '../_types/card';
import { SUIT_NAMES, SUIT_SYMBOLS } from '../_logic/deck';

interface ActiveSuitIndicatorProps {
  suit: Suit;
}

export function ActiveSuitIndicator({ suit }: ActiveSuitIndicatorProps) {
  const isRed = suit === 'hearts' || suit === 'diamonds';

  return (
    <motion.div
      key={suit}
      initial={{ scale: 0.7, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
      className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-mboa-bg/80 backdrop-blur-md border border-mboa-gold/20"
    >
      <span className="text-xs text-mboa-text-muted">Couleur</span>
      <span
        className={`text-xl ${isRed ? 'text-red-400' : 'text-mboa-text'}`}
        style={{ filter: 'drop-shadow(0 0 4px currentColor)' }}
      >
        {SUIT_SYMBOLS[suit]}
      </span>
      <span className="text-xs font-semibold text-mboa-text">{SUIT_NAMES[suit]}</span>
    </motion.div>
  );
}
