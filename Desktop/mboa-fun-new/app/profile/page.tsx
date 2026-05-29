'use client';

import { motion } from 'framer-motion';
import { User, Settings, Trophy, Gamepad2, History, Edit3 } from 'lucide-react';
import { PageShell } from '@/components/layout/page-shell';
import { PremiumCard } from '@/components/mboa/premium-card';
import { PlayerAvatar } from '@/components/mboa/player-avatar';
import { PlayerBadge } from '@/components/mboa/player-badge';
import { GemsBadge } from '@/components/mboa/gems-badge';

const userStats = {
  username: 'Joueur',
  level: 12,
  xp: 2450,
  maxXp: 3000,
  gems: 500,
  gamesPlayed: 47,
  gamesWon: 23,
  trophies: 1250,
  joinedAt: 'Janvier 2026',
};

const recentGames = [
  { game: 'Ludo 237', result: 'win', gems: 50, date: 'Il y a 2h' },
  { game: 'Mboa Empire', result: 'loss', gems: -20, date: 'Il y a 5h' },
  { game: 'Check Gems', result: 'win', gems: 30, date: 'Hier' },
];

const achievements = [
  { name: 'Première victoire', icon: Trophy, unlocked: true },
  { name: '10 parties jouées', icon: Gamepad2, unlocked: true },
  { name: '1000 Gems gagnés', icon: Trophy, unlocked: false },
  { name: 'Maître stratège', icon: Gamepad2, unlocked: false },
];

export default function ProfilePage() {
  return (
    <PageShell
      topBarProps={{
        username: userStats.username,
        gems: userStats.gems,
        title: 'Profil',
      }}
    >
      <div className="py-6 space-y-6">
        {/* Profile Header */}
        <PremiumCard glowColor="emerald">
          <div className="flex flex-col sm:flex-row sm:items-center gap-6">
            <div className="relative">
              <PlayerAvatar username={userStats.username} size="xl" />
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                className="absolute bottom-0 right-0 h-8 w-8 rounded-full bg-mboa-primary-container flex items-center justify-center border-2 border-mboa-surface"
              >
                <Edit3 className="h-4 w-4 text-mboa-primary" />
              </motion.button>
            </div>
            
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h1 className="text-2xl font-bold wood-text">{userStats.username}</h1>
                <PlayerBadge type="veteran" size="md" />
              </div>
              
              <div className="flex items-center gap-2 mb-3">
                <span className="text-sm text-mboa-text-muted">Niveau {userStats.level}</span>
                <span className="text-mboa-text-muted">•</span>
                <span className="text-sm text-mboa-text-muted">{userStats.joinedAt}</span>
              </div>

              {/* XP Bar */}
              <div className="w-full max-w-xs">
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-mboa-text-muted">XP</span>
                  <span className="text-mboa-text">{userStats.xp}/{userStats.maxXp}</span>
                </div>
                <div className="h-2 bg-mboa-surface-high rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(userStats.xp / userStats.maxXp) * 100}%` }}
                    className="h-full bg-gradient-to-r from-mboa-primary to-mboa-primary-container"
                    transition={{ duration: 1, delay: 0.3 }}
                  />
                </div>
              </div>
            </div>

            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-mboa-surface-high border border-white/10 text-mboa-text hover:bg-mboa-surface-highest transition-colors"
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </motion.button>
          </div>
        </PremiumCard>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <PremiumCard className="text-center py-4">
            <Gamepad2 className="h-5 w-5 text-mboa-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-mboa-text">{userStats.gamesPlayed}</p>
            <p className="text-xs text-mboa-text-muted">Parties jouées</p>
          </PremiumCard>
          <PremiumCard className="text-center py-4">
            <Trophy className="h-5 w-5 text-mboa-gold mx-auto mb-2" />
            <p className="text-2xl font-bold text-mboa-text">{userStats.gamesWon}</p>
            <p className="text-xs text-mboa-text-muted">Victoires</p>
          </PremiumCard>
          <PremiumCard className="text-center py-4">
            <Trophy className="h-5 w-5 text-mboa-primary mx-auto mb-2" />
            <p className="text-2xl font-bold text-mboa-text">{userStats.trophies}</p>
            <p className="text-xs text-mboa-text-muted">Trophées</p>
          </PremiumCard>
          <PremiumCard className="text-center py-4">
            <div className="flex items-center justify-center gap-1 mb-2">
              <span className="text-xl">💎</span>
            </div>
            <p className="text-2xl font-bold text-mboa-gold">{userStats.gems}</p>
            <p className="text-xs text-mboa-text-muted">Gems</p>
          </PremiumCard>
        </div>

        {/* Recent Games */}
        <PremiumCard>
          <h3 className="text-lg font-bold wood-text mb-4 flex items-center gap-2">
            <History className="h-5 w-5 text-mboa-gold" />
            Historique récent
          </h3>
          <div className="space-y-3">
            {recentGames.map((game, index) => (
              <div
                key={index}
                className="flex items-center justify-between p-3 rounded-xl bg-mboa-surface/50"
              >
                <div>
                  <p className="font-medium text-mboa-text">{game.game}</p>
                  <p className="text-xs text-mboa-text-muted">{game.date}</p>
                </div>
                <div className="text-right">
                  <span className={`text-sm font-semibold ${
                    game.result === 'win' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {game.result === 'win' ? '+' : ''}{game.gems} Gems
                  </span>
                  <p className={`text-xs ${
                    game.result === 'win' ? 'text-green-400/70' : 'text-red-400/70'
                  }`}>
                    {game.result === 'win' ? 'Victoire' : 'Défaite'}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </PremiumCard>

        {/* Achievements */}
        <PremiumCard>
          <h3 className="text-lg font-bold wood-text mb-4 flex items-center gap-2">
            <Trophy className="h-5 w-5 text-mboa-gold" />
            Succès
          </h3>
          <div className="grid grid-cols-2 gap-3">
            {achievements.map((achievement) => {
              const Icon = achievement.icon;
              return (
                <div
                  key={achievement.name}
                  className={`flex items-center gap-3 p-3 rounded-xl border ${
                    achievement.unlocked
                      ? 'bg-mboa-gold/5 border-mboa-gold/20'
                      : 'bg-mboa-surface/50 border-white/5'
                  }`}
                >
                  <div className={`h-10 w-10 rounded-lg flex items-center justify-center ${
                    achievement.unlocked
                      ? 'bg-mboa-gold/10'
                      : 'bg-mboa-surface-high'
                  }`}>
                    <Icon className={`h-5 w-5 ${
                      achievement.unlocked ? 'text-mboa-gold' : 'text-mboa-text-muted'
                    }`} />
                  </div>
                  <span className={`text-sm font-medium ${
                    achievement.unlocked ? 'text-mboa-text' : 'text-mboa-text-muted'
                  }`}>
                    {achievement.name}
                  </span>
                </div>
              );
            })}
          </div>
        </PremiumCard>
      </div>
    </PageShell>
  );
}
