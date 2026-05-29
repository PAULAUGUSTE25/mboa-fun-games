'use client';

import { AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import type { Card } from '../_types/card';

interface DiscardPileProps {
  topCard: Card | null;
  prevCard: Card | null;
}

export function DiscardPile({ topCard, prevCard }: DiscardPileProps) {
  return (
    <div className="relative w-16 h-24 sm:w-20 sm:h-28">
      {/* Previous card (slight rotation for stack feel) */}
      {prevCard && (
        <div
          className="absolute inset-0 opacity-60"
          style={{ transform: 'rotate(-4deg)' }}
        >
          <PlayingCard card={prevCard} />
        </div>
      )}

      {/* Top card */}
      <AnimatePresence mode="popLayout">
        {topCard && (
          <div
            key={topCard.id}
            className="absolute inset-0"
            style={{ transform: 'rotate(2deg)' }}
          >
            <PlayingCard card={topCard} layoutId={`card-${topCard.id}`} />
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
