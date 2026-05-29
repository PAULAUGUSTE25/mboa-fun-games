'use client';

import { useRouter } from 'next/navigation';
import { ArrowLeft, User, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatGems } from '@/lib/format';

export interface TopAppBarProps {
  username?: string;
  avatarUrl?: string;
  gems?: number;
  showBackButton?: boolean;
  title?: string;
}

export function TopAppBar({
  username = 'Joueur',
  avatarUrl,
  gems = 500,
  showBackButton = false,
  title,
}: TopAppBarProps) {
  const router = useRouter();

  return (
    <header className="sticky top-0 z-50 w-full">
      <div className="glass-panel border-b border-mboa-outline/30">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex h-16 items-center justify-between">
            {/* Left section: avatar + logo */}
            <div className="flex items-center gap-3">
              {showBackButton ? (
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.back()}
                  className="flex h-9 w-9 items-center justify-center rounded-full bg-mboa-surface-high hover:bg-mboa-surface-highest transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-mboa-text" />
                </motion.button>
              ) : (
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-mboa-primary-container to-mboa-surface-high overflow-hidden border border-mboa-primary/20">
                  {avatarUrl ? (
                    <img
                      src={avatarUrl}
                      alt={username}
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    <User className="h-4 w-4 text-mboa-primary" />
                  )}
                </div>
              )}

              <span className="text-lg font-bold wood-text tracking-tight">
                {title || 'Mboa Fun'}
              </span>
            </div>

            {/* Right section - Gems */}
            <div className="flex items-center gap-2">
              <motion.div
                whileHover={{ scale: 1.02 }}
                className="flex items-center gap-2 rounded-full bg-mboa-surface-high/80 px-4 py-2 border border-mboa-gold/20"
              >
                <Diamond className="h-4 w-4 text-mboa-gold fill-mboa-gold" />
                <span className="text-sm font-semibold text-mboa-gold">
                  {formatGems(gems)} Gems
                </span>
              </motion.div>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
