'use client';

import { AnimatePresence } from 'framer-motion';
import { PlayingCard } from './playing-card';
import type { Card } from '../_types/card';

interface PlayerHandProps {
  cards: Card[];
  onPlayCard: (cardId: string) => void;
  isPlayableCard: (card: Card) => boolean;
  isPlayerTurn: boolean;
}

export function PlayerHand({ cards, onPlayCard, isPlayableCard, isPlayerTurn }: PlayerHandProps) {
  const total = cards.length;
  // Fan-out arc parameters
  const maxAngle = Math.min(40, total * 6);
  const startAngle = -maxAngle / 2;
  const step = total > 1 ? maxAngle / (total - 1) : 0;

  return (
    <div className="relative h-32 sm:h-36 flex items-end justify-center w-full pb-2">
      <div className="relative flex items-end justify-center">
        <AnimatePresence>
          {cards.map((card, i) => {
            const rotation = startAngle + step * i;
            const offset = Math.abs(i - (total - 1) / 2);
            const yOffset = offset * 1.5;
            const playable = isPlayerTurn && isPlayableCard(card);

            return (
              <div
                key={card.id}
                className="relative"
                style={{
                  marginLeft: i === 0 ? 0 : -32,
                  zIndex: i,
                  transform: `translateY(${yOffset}px)`,
                }}
              >
                <PlayingCard
                  card={card}
                  layoutId={`card-${card.id}`}
                  rotation={rotation}
                  playable={playable}
                  onClick={isPlayerTurn ? () => onPlayCard(card.id) : undefined}
                />
              </div>
            );
          })}
        </AnimatePresence>
      </div>
    </div>
  );
}
