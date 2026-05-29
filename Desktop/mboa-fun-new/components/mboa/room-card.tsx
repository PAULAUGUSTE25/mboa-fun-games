'use client';

import { motion } from 'framer-motion';
import { Diamond, Dice1, Crown, Grid3X3, CircleDot } from 'lucide-react';
import { formatGems } from '@/lib/format';

export interface Room {
  id: string;
  name: string;
  game: string;
  gameSlug?: string;
  players: number;
  maxPlayers: number;
  isPrivate: boolean;
  status: 'waiting' | 'playing' | 'full';
  host: string;
  bet?: number;
}

interface RoomCardProps {
  room: Room;
}

const gameIcons: Record<string, typeof Dice1> = {
  empire: Crown,
  ludo: Dice1,
  'check-gems': Diamond,
  damier: Grid3X3,
  echecs: CircleDot,
};

export function RoomCard({ room }: RoomCardProps) {
  const Icon = gameIcons[room.gameSlug || ''] || Dice1;
  const isJoinable = room.status !== 'full';

  return (
    <motion.div
      whileHover={{ y: -2 }}
      whileTap={{ scale: 0.99 }}
      className="group relative overflow-hidden rounded-2xl bg-mboa-surface-high border border-white/5 p-4 transition-all duration-300 hover:border-mboa-primary/20"
    >
      <div className="flex items-start gap-3">
        {/* Game icon */}
        <div className="h-12 w-12 rounded-xl bg-mboa-bg/60 border border-white/10 flex items-center justify-center shrink-0">
          <Icon className="h-6 w-6 text-mboa-primary" />
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2 mb-1">
            <h4 className="font-semibold text-mboa-text truncate">{room.name}</h4>
            {room.bet !== undefined && (
              <div className="flex items-center gap-1 shrink-0">
                <Diamond className="h-3 w-3 text-mboa-gold fill-mboa-gold" />
                <span className="text-xs font-semibold text-mboa-gold">
                  {formatGems(room.bet)}
                </span>
              </div>
            )}
          </div>
          <p className="text-xs text-mboa-text-muted truncate">
            {room.game}
            {room.bet !== undefined && ` · Bet: ${room.bet}`}
          </p>
        </div>
      </div>

      {/* Bottom row: avatars + count + JOIN */}
      <div className="flex items-center justify-between mt-3 pt-3 border-t border-white/5">
        <div className="flex items-center gap-2">
          {/* Stacked avatars */}
          <div className="flex -space-x-2">
            {Array.from({ length: Math.min(room.players, 3) }).map((_, i) => (
              <div
                key={i}
                className="h-6 w-6 rounded-full bg-gradient-to-br from-mboa-primary-container to-mboa-surface-high border-2 border-mboa-surface-high"
              />
            ))}
          </div>
          <span className="text-xs text-mboa-text-muted">
            {room.players}/{room.maxPlayers}
          </span>
        </div>

        {isJoinable && (
          <motion.button
            whileTap={{ scale: 0.95 }}
            className="px-4 py-1.5 rounded-lg bg-mboa-primary-container/40 hover:bg-mboa-primary-container/70 text-mboa-primary text-xs font-bold tracking-wider border border-mboa-primary/20 transition-colors"
          >
            JOIN
          </motion.button>
        )}
      </div>
    </motion.div>
  );
}
