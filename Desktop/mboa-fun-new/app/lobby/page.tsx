'use client';

import { motion } from 'framer-motion';
import { Plus, Search, Filter } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { PremiumCard } from '@/components/mboa/premium-card';
import { RoomCard } from '@/components/mboa/room-card';
import type { Room } from '@/components/mboa/room-card';

const mockRooms: Room[] = [
  {
    id: '1',
    name: 'Empire Noobs Only',
    game: 'Mboa Empire',
    players: 3,
    maxPlayers: 6,
    isPrivate: false,
    status: 'waiting',
    host: 'Paul237',
  },
  {
    id: '2',
    name: 'Ludo Pro Series',
    game: 'Ludo 237',
    players: 4,
    maxPlayers: 4,
    isPrivate: false,
    status: 'playing',
    host: 'MboaKing',
  },
  {
    id: '3',
    name: 'Check VIP Room',
    game: 'Check Gems',
    players: 4,
    maxPlayers: 6,
    isPrivate: true,
    status: 'waiting',
    host: 'CardMaster',
  },
  {
    id: '4',
    name: 'Damier Championship',
    game: 'Damier Mboa',
    players: 2,
    maxPlayers: 2,
    isPrivate: false,
    status: 'full',
    host: 'Strategist',
  },
  {
    id: '5',
    name: 'Échecs Elite',
    game: 'Échecs 237',
    players: 1,
    maxPlayers: 2,
    isPrivate: false,
    status: 'waiting',
    host: 'GrandMaster',
  },
];

export default function LobbyPage() {
  return (
    <PageShell
      topBarProps={{
        username: 'Joueur',
        gems: 500,
        title: 'Lobby',
      }}
    >
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold wood-text">Lobby</h1>
            <p className="text-mboa-text-muted text-sm">
              Rejoins une partie ou crée ton propre salon
            </p>
          </div>
          
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-mboa-primary-container to-[#00695c] text-white font-semibold border border-mboa-primary/30"
          >
            <Plus className="h-4 w-4" />
            Créer un salon
          </motion.button>
        </div>

        {/* Filters */}
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-mboa-text-muted" />
            <input
              type="text"
              placeholder="Rechercher un salon..."
              className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-mboa-surface-high border border-mboa-outline/30 text-mboa-text placeholder:text-mboa-text-muted focus:outline-none focus:border-mboa-primary/50"
            />
          </div>
          <button className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mboa-surface-high border border-mboa-outline/30 text-mboa-text hover:bg-mboa-surface-highest transition-colors">
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filtrer</span>
          </button>
        </div>

        {/* Rooms Grid */}
        <PremiumCard>
          <h2 className="text-lg font-bold wood-text mb-4">
            Salons disponibles
          </h2>
          <div className="space-y-3">
            {mockRooms.map((room) => (
              <RoomCard key={room.id} room={room} />
            ))}
          </div>
        </PremiumCard>

        {/* Empty state hint */}
        <div className="text-center py-8 text-mboa-text-muted text-sm">
          <p>Plus de salons à venir...</p>
        </div>
      </div>
    </PageShell>
  );
}
