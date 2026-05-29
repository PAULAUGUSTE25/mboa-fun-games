'use client';

import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { FeaturedGameCard } from '@/components/mboa/featured-game-card';
import { GameCard } from '@/components/mboa/game-card';
import { RoomCard } from '@/components/mboa/room-card';
import { games, getFeaturedGame } from '@/lib/design-system/games';
import type { Room } from '@/components/mboa/room-card';

// Active players per game (static)
const activePlayersByGame: Record<string, number> = {
  ludo: 450,
  'check-gems': 320,
  damier: 890,
  echecs: 128,
};

// Active rooms (static)
const activeRooms: Room[] = [
  {
    id: '1',
    name: 'Douala Kings',
    game: 'Ludo 237',
    gameSlug: 'ludo',
    players: 2,
    maxPlayers: 4,
    isPrivate: false,
    status: 'waiting',
    host: 'Paul237',
    bet: 50,
  },
  {
    id: '2',
    name: 'Yaoundé Champions',
    game: 'Check Gems',
    gameSlug: 'check-gems',
    players: 3,
    maxPlayers: 6,
    isPrivate: false,
    status: 'waiting',
    host: 'MboaKing',
    bet: 100,
  },
  {
    id: '3',
    name: 'Bafoussam Elite',
    game: 'Damier Mboa',
    gameSlug: 'damier',
    players: 1,
    maxPlayers: 2,
    isPrivate: false,
    status: 'waiting',
    host: 'CardMaster',
    bet: 200,
  },
];

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.08 },
  },
};

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.4 },
  },
};

export default function DashboardPage() {
  const featuredGame = getFeaturedGame();
  const regularGames = games.filter((g) => !g.featured);

  return (
    <PageShell
      backgroundImage="/assets/backgrounds/dashboard-hero.png"
      topBarProps={{
        username: 'Joueur',
        gems: 500,
      }}
    >
      <motion.div
        variants={containerVariants}
        initial="visible"
        animate="visible"
        className="py-5 space-y-6 max-w-2xl mx-auto"
      >
        {/* Featured Game */}
        {featuredGame && (
          <motion.section variants={itemVariants}>
            <FeaturedGameCard game={featuredGame} />
          </motion.section>
        )}

        {/* Bibliothèque */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold wood-text uppercase tracking-wider">
              Bibliothèque
            </h2>
            <button className="flex items-center gap-1 text-sm font-semibold text-mboa-primary hover:text-mboa-primary/80 transition-colors uppercase tracking-wide">
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-4">
            {regularGames.map((game) => (
              <motion.div key={game.slug} variants={itemVariants}>
                <GameCard
                  game={game}
                  activePlayers={activePlayersByGame[game.slug]}
                />
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* Active Rooms */}
        <motion.section variants={itemVariants}>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold wood-text uppercase tracking-wider">
              Salons actifs
            </h2>
            <button className="flex items-center gap-1 text-sm font-semibold text-mboa-primary hover:text-mboa-primary/80 transition-colors uppercase tracking-wide">
              Voir tout
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
          <div className="space-y-3">
            {activeRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </motion.section>
      </motion.div>
    </PageShell>
  );
}
