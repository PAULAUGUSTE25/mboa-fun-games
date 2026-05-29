'use client';

import { motion } from 'framer-motion';
import { Users, Plus, Trophy, Crown, Settings, MessageSquare } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { PremiumCard } from '@/components/mboa/premium-card';
import { PlayerAvatar } from '@/components/mboa/player-avatar';
import { PlayerBadge } from '@/components/mboa/player-badge';
import { formatGems } from '@/lib/format';

const clanInfo = {
  name: 'Les Lions du Mboa',
  tag: 'LMB',
  members: 12,
  maxMembers: 20,
  trophies: 15420,
  rank: 42,
  description: 'Clan de joueurs passionnés, ensemble vers la victoire !',
};

const members = [
  { username: 'MboaKing', role: 'leader', gems: 12500, badges: ['champion', 'veteran'] as const },
  { username: 'Paul237', role: 'coleader', gems: 9800, badges: ['veteran'] as const },
  { username: 'YdeChampion', role: 'member', gems: 8200, badges: ['strategist'] as const },
  { username: 'DoualaPro', role: 'member', gems: 6500, badges: [] as const },
  { username: 'BamendaElite', role: 'member', gems: 5400, badges: ['fast'] as const },
];

const roleLabels: Record<string, string> = {
  leader: 'Chef',
  coleader: 'Co-chef',
  member: 'Membre',
};

const roleColors: Record<string, string> = {
  leader: 'text-mboa-gold',
  coleader: 'text-mboa-primary',
  member: 'text-mboa-text-muted',
};

export default function ClanPage() {
  return (
    <PageShell
      topBarProps={{
        username: 'Joueur',
        gems: 500,
        title: 'Clan',
      }}
    >
      <div className="py-6 space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold wood-text">Clan</h1>
            <p className="text-mboa-text-muted text-sm">
              Rejoins un clan ou crée le tien
            </p>
          </div>
          
          <div className="flex gap-2">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mboa-surface-high border border-white/10 text-mboa-text hover:bg-mboa-surface-highest transition-colors"
            >
              <MessageSquare className="h-4 w-4" />
              <span className="hidden sm:inline">Chat</span>
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-mboa-primary-container to-[#00695c] text-white font-semibold border border-mboa-primary/30"
            >
              <Plus className="h-4 w-4" />
              Créer un clan
            </motion.button>
          </div>
        </div>

        {/* Clan Card */}
        <PremiumCard glowColor="gold">
          <div className="flex flex-col sm:flex-row sm:items-center gap-4 mb-6">
            <div className="h-16 w-16 rounded-2xl bg-gradient-to-br from-mboa-gold/20 to-mboa-surface-high flex items-center justify-center border border-mboa-gold/30">
              <Crown className="h-8 w-8 text-mboa-gold" />
            </div>
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-1">
                <h2 className="text-xl font-bold wood-text">{clanInfo.name}</h2>
                <span className="px-2 py-0.5 rounded bg-mboa-surface-high text-xs text-mboa-text-muted">
                  [{clanInfo.tag}]
                </span>
              </div>
              <p className="text-sm text-mboa-text-muted">{clanInfo.description}</p>
            </div>
            <div className="flex items-center gap-2">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                className="p-2 rounded-lg bg-mboa-surface-high hover:bg-mboa-surface-highest transition-colors"
              >
                <Settings className="h-5 w-5 text-mboa-text-muted" />
              </motion.button>
            </div>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-4 py-4 border-t border-b border-white/5">
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-mboa-gold mb-1">
                <Users className="h-4 w-4" />
                <span className="font-semibold">{clanInfo.members}/{clanInfo.maxMembers}</span>
              </div>
              <span className="text-xs text-mboa-text-muted">Membres</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-mboa-primary mb-1">
                <Trophy className="h-4 w-4" />
                <span className="font-semibold">{formatGems(clanInfo.trophies)}</span>
              </div>
              <span className="text-xs text-mboa-text-muted">Trophées</span>
            </div>
            <div className="text-center">
              <div className="flex items-center justify-center gap-1 text-mboa-text mb-1">
                <Crown className="h-4 w-4" />
                <span className="font-semibold">#{clanInfo.rank}</span>
              </div>
              <span className="text-xs text-mboa-text-muted">Classement</span>
            </div>
          </div>
        </PremiumCard>

        {/* Members List */}
        <PremiumCard>
          <h3 className="text-lg font-bold wood-text mb-4 flex items-center gap-2">
            <Users className="h-5 w-5 text-mboa-gold" />
            Membres ({members.length})
          </h3>
          
          <div className="space-y-3">
            {members.map((member, index) => (
              <div
                key={member.username}
                className="flex items-center gap-3 p-3 rounded-xl bg-mboa-surface/50 hover:bg-mboa-surface-high transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-mboa-surface-high text-xs font-medium text-mboa-text-muted">
                  {index + 1}
                </div>
                <PlayerAvatar username={member.username} size="sm" isOnline={index < 3} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-mboa-text truncate">{member.username}</span>
                    {member.badges.map((badge) => (
                      <PlayerBadge key={badge} type={badge} size="sm" />
                    ))}
                  </div>
                  <span className={`text-xs ${roleColors[member.role]}`}>
                    {roleLabels[member.role]}
                  </span>
                </div>
                <span className="text-sm font-semibold text-mboa-gold">
                  {formatGems(member.gems)}
                </span>
              </div>
            ))}
          </div>
        </PremiumCard>
      </div>
    </PageShell>
  );
}
