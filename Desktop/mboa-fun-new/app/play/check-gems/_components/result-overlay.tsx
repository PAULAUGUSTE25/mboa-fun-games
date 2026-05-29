'use client';

import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Frown, RotateCcw, Home } from 'lucide-react';
import Link from 'next/link';

interface ResultOverlayProps {
  status: 'won' | 'lost' | null;
  onRestart: () => void;
  wins: number;
  losses: number;
}

export function ResultOverlay({ status, onRestart, wins, losses }: ResultOverlayProps) {
  const isWin = status === 'won';

  return (
    <AnimatePresence>
      {status && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[70] flex items-center justify-center bg-mboa-bg/85 backdrop-blur-sm p-4"
        >
          <motion.div
            initial={{ scale: 0.8, y: 30 }}
            animate={{ scale: 1, y: 0 }}
            transition={{ type: 'spring', stiffness: 200, damping: 20 }}
            className={`relative max-w-sm w-full bg-mboa-surface rounded-3xl p-8 border ${
              isWin ? 'border-mboa-gold/40 shadow-[0_0_60px_rgba(233,195,73,0.3)]' : 'border-mboa-outline'
            }`}
          >
            {/* Icon */}
            <div className="flex justify-center mb-4">
              <div
                className={`w-20 h-20 rounded-full flex items-center justify-center ${
                  isWin
                    ? 'bg-gradient-to-br from-mboa-gold/20 to-amber-500/10 border-2 border-mboa-gold/40'
                    : 'bg-mboa-surface-high border-2 border-mboa-outline'
                }`}
              >
                {isWin ? (
                  <Trophy className="h-10 w-10 text-mboa-gold" />
                ) : (
                  <Frown className="h-10 w-10 text-mboa-text-muted" />
                )}
              </div>
            </div>

            <h2
              className={`text-3xl font-bold text-center mb-2 ${
                isWin ? 'gradient-text' : 'text-mboa-text'
              }`}
            >
              {isWin ? 'Victoire !' : 'Défaite'}
            </h2>

            <p className="text-center text-mboa-text-muted text-sm mb-2">
              {isWin
                ? 'Tu as posé toutes tes cartes. Bien joué !'
                : 'L\'adversaire a fini en premier. Réessaie !'}
            </p>

            {isWin && (
              <div className="text-center mb-4">
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-mboa-gold/10 border border-mboa-gold/30 text-mboa-gold font-semibold">
                  +50 Gems
                </span>
              </div>
            )}

            {/* Session stats */}
            <div className="flex justify-center gap-4 mb-6 text-sm">
              <div className="text-center">
                <p className="text-mboa-gold font-bold text-lg">{wins}</p>
                <p className="text-xs text-mboa-text-muted">Victoires</p>
              </div>
              <div className="w-px bg-mboa-outline" />
              <div className="text-center">
                <p className="text-mboa-text-muted font-bold text-lg">{losses}</p>
                <p className="text-xs text-mboa-text-muted">Défaites</p>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-2">
              <Link href="/dashboard" className="flex-1">
                <motion.button
                  whileTap={{ scale: 0.97 }}
                  className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-mboa-surface-high text-mboa-text border border-white/10 hover:bg-mboa-surface-highest transition-colors font-semibold text-sm"
                >
                  <Home className="h-4 w-4" />
                  Accueil
                </motion.button>
              </Link>
              <motion.button
                whileTap={{ scale: 0.97 }}
                onClick={onRestart}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl bg-gradient-to-r from-mboa-primary-container to-[#00695c] text-mboa-primary border border-mboa-primary/30 font-semibold text-sm shadow-[0_0_20px_rgba(148,211,193,0.2)]"
              >
                <RotateCcw className="h-4 w-4" />
                Rejouer
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
