'use client';

import { motion, AnimatePresence } from 'framer-motion';
import type { Suit } from '../_types/card';
import { SUIT_NAMES, SUIT_SYMBOLS } from '../_logic/deck';

interface SuitPickerProps {
  open: boolean;
  onPick: (suit: Suit) => void;
}

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];

export function SuitPicker({ open, onPick }: SuitPickerProps) {
  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-center justify-center bg-mboa-bg/80 backdrop-blur-sm"
        >
          <motion.div
            initial={{ scale: 0.9, y: 20 }}
            animate={{ scale: 1, y: 0 }}
            exit={{ scale: 0.9, y: 20 }}
            className="bg-mboa-surface border border-mboa-gold/30 rounded-3xl p-6 sm:p-8 shadow-[0_0_40px_rgba(233,195,73,0.3)] max-w-sm w-[90%]"
          >
            <h3 className="text-center text-mboa-text font-bold text-lg mb-1">
              Choisis une couleur
            </h3>
            <p className="text-center text-mboa-text-muted text-sm mb-6">
              Le valet change la couleur active
            </p>

            <div className="grid grid-cols-2 gap-3">
              {SUITS.map((suit) => {
                const isRed = suit === 'hearts' || suit === 'diamonds';
                return (
                  <motion.button
                    key={suit}
                    whileHover={{ scale: 1.05, y: -2 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => onPick(suit)}
                    className="flex flex-col items-center justify-center gap-2 py-4 rounded-2xl bg-white/95 border border-gray-300 shadow-[0_4px_12px_rgba(0,0,0,0.3)] hover:shadow-[0_8px_20px_rgba(0,0,0,0.4)] transition-shadow"
                  >
                    <span className={`text-4xl ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                      {SUIT_SYMBOLS[suit]}
                    </span>
                    <span className={`text-sm font-semibold ${isRed ? 'text-red-500' : 'text-gray-900'}`}>
                      {SUIT_NAMES[suit]}
                    </span>
                  </motion.button>
                );
              })}
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
