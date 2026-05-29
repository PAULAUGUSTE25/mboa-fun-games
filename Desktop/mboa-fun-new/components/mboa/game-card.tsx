'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Users, Dice1, Diamond, Grid3X3, CircleDot, Crown } from 'lucide-react';
import type { Game } from '@/lib/design-system/games';

interface GameCardProps {
  game: Game;
  activePlayers?: number;
}

const gameIcons: Record<string, typeof Dice1> = {
  empire: Crown,
  ludo: Dice1,
  'check-gems': Diamond,
  damier: Grid3X3,
  echecs: CircleDot,
};

export function GameCard({ game, activePlayers }: GameCardProps) {
  const Icon = gameIcons[game.slug] || Dice1;

  return (
    <Link href={`/play/${game.slug}`} className="block">
      <motion.div
        whileHover={{ y: -4 }}
        whileTap={{ scale: 0.99 }}
        className="group relative overflow-hidden rounded-2xl bg-mboa-surface border border-white/5 transition-all duration-300 hover:border-mboa-primary/30 hover:shadow-[0_0_30px_rgba(148,211,193,0.15)]"
      >
        {/* Background image */}
        <div
          className="relative h-44 sm:h-52 w-full bg-gradient-to-br from-mboa-surface-high to-mboa-surface"
          style={{
            backgroundImage: `url(${game.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Bottom gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-mboa-bg via-mboa-bg/40 to-transparent" />

          {/* Top-left icon */}
          <div className="absolute top-3 left-3 h-10 w-10 rounded-xl bg-mboa-bg/80 backdrop-blur-md border border-white/10 flex items-center justify-center">
            <Icon className="h-5 w-5 text-mboa-primary" />
          </div>

          {/* Top-right active players badge */}
          {activePlayers !== undefined && (
            <div className="absolute top-3 right-3 flex items-center gap-1 rounded-full bg-mboa-bg/80 backdrop-blur-md border border-white/10 px-2.5 py-1">
              <Users className="h-3 w-3 text-mboa-primary" />
              <span className="text-xs font-semibold text-mboa-text">{activePlayers}</span>
            </div>
          )}
        </div>

        {/* Content */}
        <div className="p-4 space-y-3">
          <div>
            <h3 className="text-lg font-bold wood-text mb-1">{game.name}</h3>
            <p className="text-sm text-mboa-text-muted line-clamp-2">
              {game.description}
            </p>
          </div>

          <motion.div
            whileTap={{ scale: 0.98 }}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-mboa-primary-container to-[#00695c] text-mboa-primary font-bold text-sm tracking-wider text-center border border-mboa-primary/20 group-hover:emerald-glow transition-all"
          >
            JOUER
          </motion.div>
        </div>
      </motion.div>
    </Link>
  );
}
