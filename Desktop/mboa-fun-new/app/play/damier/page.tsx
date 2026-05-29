'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { Gamepad2, ArrowLeft, Grid3X3 } from 'lucide-react';
import { GameShell } from '@/components/layout/game-shell';

export default function DamierGamePage() {
  return (
    <GameShell
      title="Damier Mboa"
      gems={500}
    >
      <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-4">
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-teal-500/5 rounded-full blur-3xl" />
          <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-mboa-gold/5 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-center relative z-10"
        >
          <div className="inline-flex items-center justify-center w-24 h-24 rounded-3xl bg-gradient-to-br from-teal-500/20 to-mboa-surface-high border border-teal-500/20 mb-6">
            <Grid3X3 className="h-12 w-12 text-teal-400" />
          </div>

          <h1 className="text-3xl sm:text-4xl font-bold text-mboa-text mb-4">
            Damier Mboa
          </h1>
          
          <p className="text-lg text-mboa-text-muted mb-2 max-w-md mx-auto">
            Duel tactique sous ambiance village et baobab.
          </p>
          
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-mboa-gold/10 border border-mboa-gold/20 mb-8">
            <span className="text-mboa-gold font-semibold">2 joueurs</span>
          </div>

          <div className="p-6 rounded-2xl bg-mboa-surface-high border border-white/10 mb-8">
            <div className="flex items-center justify-center gap-3 mb-4">
              <Gamepad2 className="h-6 w-6 text-mboa-primary" />
              <span className="text-xl font-semibold text-mboa-text">
                Gameplay bientôt disponible
              </span>
            </div>
            <p className="text-mboa-text-muted text-sm">
              Notre équipe développe activement ce jeu. Reviens bientôt pour jouer !
            </p>
          </div>

          <Link href="/dashboard">
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-mboa-surface-high text-mboa-text hover:bg-mboa-surface-highest transition-colors border border-white/10"
            >
              <ArrowLeft className="h-4 w-4" />
              Retour au dashboard
            </motion.button>
          </Link>
        </motion.div>
      </div>
    </GameShell>
  );
}
