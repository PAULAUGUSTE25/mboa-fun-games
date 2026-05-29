'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Play } from 'lucide-react';
import type { Game } from '@/lib/design-system/games';

interface FeaturedGameCardProps {
  game: Game;
}

export function FeaturedGameCard({ game }: FeaturedGameCardProps) {
  return (
    <Link href={`/play/${game.slug}`} className="block">
      <motion.div
        whileHover={{ y: -2 }}
        whileTap={{ scale: 0.99 }}
        className="group relative overflow-hidden rounded-3xl border border-mboa-primary/20 transition-all duration-500 hover:border-mboa-primary/40 hover:shadow-[0_0_50px_rgba(148,211,193,0.2)]"
      >
        {/* Background image */}
        <div
          className="relative h-72 sm:h-80 w-full bg-gradient-to-br from-mboa-primary-container/40 to-mboa-surface"
          style={{
            backgroundImage: `url(${game.image})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
        >
          {/* Multi-layer overlay for depth */}
          <div className="absolute inset-0 bg-gradient-to-t from-mboa-bg via-mboa-bg/30 to-mboa-bg/60" />
          <div className="absolute inset-0 bg-gradient-to-br from-mboa-primary-container/20 via-transparent to-mboa-bg/40" />

          {/* Glow effects */}
          <div className="absolute -top-1/4 -right-1/4 w-1/2 h-1/2 bg-mboa-primary/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-1/4 -left-1/4 w-1/2 h-1/2 bg-mboa-gold/5 rounded-full blur-3xl" />

          {/* Content */}
          <div className="relative h-full flex flex-col justify-between p-6 sm:p-8">
            {/* Top - Featured badge */}
            <div>
              <span className="inline-block text-[10px] sm:text-xs font-bold tracking-[0.2em] text-mboa-primary uppercase">
                ★ Featured
              </span>
            </div>

            {/* Middle - Title */}
            <div className="flex-1 flex flex-col justify-center">
              <h2 className="text-3xl sm:text-5xl font-bold wood-text leading-tight">
                {game.name}
              </h2>
            </div>

            {/* Bottom - CTA */}
            <motion.div
              whileTap={{ scale: 0.98 }}
              className="w-full sm:max-w-sm flex items-center justify-center gap-2 rounded-2xl bg-mboa-bg/60 backdrop-blur-md border border-white/10 py-3.5 text-mboa-text font-semibold tracking-wide hover:bg-mboa-primary-container/60 hover:border-mboa-primary/40 transition-all"
            >
              <Play className="h-4 w-4 fill-mboa-primary text-mboa-primary" />
              <span>JOUER MAINTENANT</span>
            </motion.div>
          </div>
        </div>
      </motion.div>
    </Link>
  );
}
