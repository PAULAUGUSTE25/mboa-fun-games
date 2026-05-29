'use client';

import { motion } from 'framer-motion';
import type { Card } from '../_types/card';
import { getCardVisual } from '../_logic/deck';

interface PlayingCardProps {
  card: Card;
  faceDown?: boolean;
  playable?: boolean;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
  size?: 'sm' | 'md' | 'lg';
  layoutId?: string;
  rotation?: number;
  index?: number;
}

const sizeClasses = {
  sm: 'w-12 h-16 text-xs',
  md: 'w-16 h-24 text-sm sm:w-20 sm:h-28 sm:text-base',
  lg: 'w-24 h-36 text-lg',
};

export function PlayingCard({
  card,
  faceDown = false,
  playable = false,
  selected = false,
  onClick,
  className = '',
  size = 'md',
  layoutId,
  rotation = 0,
}: PlayingCardProps) {
  const visual = getCardVisual(card);

  return (
    <motion.button
      layoutId={layoutId}
      onClick={onClick}
      disabled={!onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0, rotate: rotation }}
      exit={{ opacity: 0, scale: 0.8 }}
      whileHover={
        onClick && !faceDown
          ? { y: -16, scale: 1.05, rotate: rotation, transition: { duration: 0.2 } }
          : undefined
      }
      whileTap={onClick ? { scale: 0.95 } : undefined}
      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
      className={`
        relative ${sizeClasses[size]} rounded-lg sm:rounded-xl
        shadow-[0_4px_12px_rgba(0,0,0,0.4),0_8px_24px_rgba(0,0,0,0.3)]
        transition-shadow duration-200
        ${onClick && !faceDown ? 'cursor-pointer' : ''}
        ${playable ? 'ring-2 ring-mboa-primary ring-offset-2 ring-offset-transparent shadow-[0_0_24px_rgba(148,211,193,0.5)]' : ''}
        ${selected ? 'ring-2 ring-mboa-gold' : ''}
        ${!playable && onClick && !faceDown ? 'opacity-70 grayscale-[30%]' : ''}
        ${className}
      `}
      style={{
        transformStyle: 'preserve-3d',
        perspective: '600px',
      }}
    >
      {faceDown ? (
        <CardBack />
      ) : card.rank === 'JOKER' ? (
        <JokerFace color={visual.color} />
      ) : (
        <CardFace
          rank={card.rank}
          symbol={visual.symbol}
          color={visual.color}
        />
      )}
    </motion.button>
  );
}

function CardBack() {
  return (
    <div
      className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden border-2 border-mboa-primary/30"
      style={{
        background: `
          linear-gradient(135deg, #003d33 0%, #00564a 50%, #003d33 100%),
          radial-gradient(circle at 30% 30%, rgba(233, 195, 73, 0.15), transparent 50%)
        `,
      }}
    >
      {/* Pattern */}
      <div className="absolute inset-0 opacity-40">
        <div
          className="absolute inset-1 rounded-md border border-mboa-gold/40"
          style={{
            background:
              'repeating-linear-gradient(45deg, transparent 0 6px, rgba(233, 195, 73, 0.08) 6px 7px)',
          }}
        />
      </div>

      {/* Center diamond emblem */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="w-8 h-8 sm:w-10 sm:h-10 rotate-45 border-2 border-mboa-gold/70 bg-gradient-to-br from-mboa-gold/20 to-transparent shadow-[0_0_10px_rgba(233,195,73,0.4)]" />
      </div>

      {/* Corner decorations */}
      <div className="absolute top-1 left-1 w-2 h-2 border-t border-l border-mboa-gold/50" />
      <div className="absolute top-1 right-1 w-2 h-2 border-t border-r border-mboa-gold/50" />
      <div className="absolute bottom-1 left-1 w-2 h-2 border-b border-l border-mboa-gold/50" />
      <div className="absolute bottom-1 right-1 w-2 h-2 border-b border-r border-mboa-gold/50" />
    </div>
  );
}

interface CardFaceProps {
  rank: string;
  symbol: string;
  color: 'red' | 'black';
}

function CardFace({ rank, symbol, color }: CardFaceProps) {
  const colorClass = color === 'red' ? 'text-red-500' : 'text-gray-900';

  return (
    <div
      className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden bg-gradient-to-br from-white via-gray-50 to-gray-200 border border-gray-300"
      style={{
        boxShadow:
          'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.1)',
      }}
    >
      {/* Top-left rank + suit */}
      <div className={`absolute top-1 left-1.5 flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-bold">{rank}</span>
        <span className="text-[10px] sm:text-xs">{symbol}</span>
      </div>

      {/* Bottom-right (rotated) */}
      <div
        className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none ${colorClass}`}
        style={{ transform: 'rotate(180deg)' }}
      >
        <span className="font-bold">{rank}</span>
        <span className="text-[10px] sm:text-xs">{symbol}</span>
      </div>

      {/* Center big symbol */}
      <div className={`absolute inset-0 flex items-center justify-center ${colorClass}`}>
        <span className="text-2xl sm:text-4xl font-bold opacity-90 drop-shadow-sm">
          {symbol}
        </span>
      </div>
    </div>
  );
}

function JokerFace({ color }: { color: 'red' | 'black' }) {
  const colorClass = color === 'red' ? 'text-red-500' : 'text-gray-900';
  return (
    <div
      className="relative w-full h-full rounded-lg sm:rounded-xl overflow-hidden border border-gray-300"
      style={{
        background:
          'radial-gradient(circle at 30% 25%, rgba(255,210,90,0.25), transparent 55%), linear-gradient(160deg, #fffaf0 0%, #faedcf 60%, #f0d089 100%)',
        boxShadow: 'inset 0 1px 0 rgba(255,255,255,0.9), inset 0 -1px 0 rgba(0,0,0,0.15)',
      }}
    >
      {/* Coins */}
      <div className={`absolute top-1 left-1.5 flex flex-col items-center leading-none ${colorClass}`}>
        <span className="font-bold text-[10px] sm:text-xs">🃏</span>
      </div>
      <div
        className={`absolute bottom-1 right-1.5 flex flex-col items-center leading-none ${colorClass}`}
        style={{ transform: 'rotate(180deg)' }}
      >
        <span className="font-bold text-[10px] sm:text-xs">🃏</span>
      </div>

      {/* Centre : étoile + label JOKER vertical */}
      <div className="absolute inset-0 flex flex-col items-center justify-center gap-0.5">
        <span className="text-2xl sm:text-3xl drop-shadow-sm">🃏</span>
        <span
          className={`font-black tracking-widest text-[8px] sm:text-[10px] ${colorClass}`}
          style={{ textShadow: '0 1px 0 rgba(255,255,255,0.6)' }}
        >
          JOKER
        </span>
        <span className="text-[9px] sm:text-[10px] font-bold text-amber-700">+4</span>
      </div>
    </div>
  );
}
