'use client';

import { motion } from 'framer-motion';
import { Coins, Home } from 'lucide-react';
import type { Player } from '../_types/empire';
import { PlayerToken } from './player-token';
import { formatGems } from '@/lib/format';

interface PlayerPanelProps {
  player: Player;
  isActive: boolean;
  compact?: boolean;
}

export function PlayerPanel({ player, isActive, compact }: PlayerPanelProps) {
  return (
    <motion.div
      animate={{
        scale: isActive ? 1.02 : 1,
      }}
      className="relative rounded-2xl transition-all overflow-hidden empire-panel"
      style={{
        backdropFilter: 'blur(12px)',
        borderColor: isActive ? '#F4CE96' : '#B18A62',
        boxShadow: isActive
          ? '0 0 18px rgba(206, 162, 113, 0.55), inset 0 1px 0 rgba(244,206,150,0.25), inset 0 -1px 0 rgba(0,0,0,0.6), 0 8px 24px rgba(0, 0, 0, 0.5)'
          : 'inset 0 1px 0 rgba(244, 206, 150, 0.15), inset 0 -1px 0 rgba(0, 0, 0, 0.6), 0 8px 24px rgba(0, 0, 0, 0.5)',
      }}
    >
      {/* Bankrupt overlay */}
      {player.bankrupt && (
        <div className="absolute inset-0 bg-mboa-bg/80 z-10 flex items-center justify-center">
          <span className="text-red-400 font-bold text-xs sm:text-sm uppercase tracking-wider">
            Faillite
          </span>
        </div>
      )}

      <div className={`flex items-center gap-3 ${compact ? 'p-2.5' : 'p-3 sm:p-4'}`}>
        <PlayerToken player={player} size={compact ? 'sm' : 'md'} active={isActive} />

        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5">
            <span
              className={`font-bold truncate ${compact ? 'text-xs' : 'text-sm'}`}
              style={{
                color: isActive ? '#F4CE96' : '#CEA271',
                textShadow: '0 1px 2px rgba(0, 0, 0, 0.8)',
              }}
            >
              {player.name}
            </span>
            {player.inJail && (
              <span className="text-[9px] px-1.5 py-0.5 rounded-full bg-red-500/20 border border-red-500/30 text-red-300 font-semibold">
                Prison
              </span>
            )}
          </div>

          <div className="flex items-center gap-3 mt-1">
            <div className="flex items-center gap-1">
              <Coins className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} style={{ color: '#F4CE96' }} />
              <span
                className={`${compact ? 'text-xs' : 'text-sm'} font-bold`}
                style={{ color: '#F4CE96', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
              >
                ${formatGems(player.money)}
              </span>
            </div>
            <div className="flex items-center gap-1">
              <Home className={`${compact ? 'h-3 w-3' : 'h-3.5 w-3.5'}`} style={{ color: '#B18A62' }} />
              <span
                className={`${compact ? 'text-xs' : 'text-sm'} font-semibold`}
                style={{ color: '#CEA271', textShadow: '0 1px 2px rgba(0,0,0,0.7)' }}
              >
                {player.properties.length}
              </span>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
