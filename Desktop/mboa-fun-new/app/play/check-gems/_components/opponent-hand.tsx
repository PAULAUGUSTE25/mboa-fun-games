'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { User } from 'lucide-react';

interface OpponentHandProps {
  cardCount: number;
  isOpponentTurn: boolean;
  name?: string;
}

export function OpponentHand({ cardCount, isOpponentTurn, name = 'Adversaire' }: OpponentHandProps) {
  const total = cardCount;
  const maxAngle = Math.min(30, total * 4);
  const startAngle = -maxAngle / 2;
  const step = total > 1 ? maxAngle / (total - 1) : 0;

  return (
    <div className="relative flex flex-col items-center gap-2">
      {/* Avatar + name + thinking indicator */}
      <div className="flex items-center gap-2">
        <div className={`relative h-10 w-10 rounded-full border-2 ${isOpponentTurn ? 'border-mboa-primary' : 'border-mboa-outline'} bg-gradient-to-br from-mboa-primary-container to-mboa-surface-high flex items-center justify-center transition-colors`}>
          <User className="h-5 w-5 text-mboa-primary" />
          {isOpponentTurn && (
            <motion.div
              animate={{ scale: [1, 1.3, 1], opacity: [0.6, 0, 0.6] }}
              transition={{ duration: 1.5, repeat: Infinity }}
              className="absolute inset-0 rounded-full bg-mboa-primary/40"
            />
          )}
        </div>
        <div className="flex flex-col">
          <span className="text-sm font-semibold text-mboa-text">{name}</span>
          <span className="text-[10px] text-mboa-text-muted">
            {cardCount} carte{cardCount > 1 ? 's' : ''}
            {cardCount === 1 && ' • Check !'}
          </span>
        </div>
      </div>

      {/* Hand of face-down cards (rotated, smaller) */}
      <div className="relative flex items-end justify-center h-16 sm:h-20">
        <AnimatePresence>
          {Array.from({ length: total }).map((_, i) => {
            const rotation = startAngle + step * i;
            return (
              <motion.div
                key={i}
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="relative w-10 h-14 sm:w-12 sm:h-16 rounded-md sm:rounded-lg border-2 border-mboa-primary/30 overflow-hidden"
                style={{
                  marginLeft: i === 0 ? 0 : -20,
                  zIndex: i,
                  transform: `rotate(${rotation}deg)`,
                  background:
                    'linear-gradient(135deg, #003d33 0%, #00564a 50%, #003d33 100%)',
                  boxShadow: '0 4px 12px rgba(0,0,0,0.4)',
                }}
              >
                <div className="absolute inset-0.5 rounded-sm border border-mboa-gold/30" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-4 h-4 sm:w-5 sm:h-5 rotate-45 border border-mboa-gold/60 bg-mboa-gold/10" />
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
