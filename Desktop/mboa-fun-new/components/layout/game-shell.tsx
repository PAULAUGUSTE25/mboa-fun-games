'use client';

import { ReactNode } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatGems } from '@/lib/format';

interface GameShellProps {
  children: ReactNode;
  title: string;
  backgroundImage?: string;
  gems?: number;
}

export function GameShell({
  children,
  title,
  backgroundImage,
  gems = 500,
}: GameShellProps) {
  const router = useRouter();

  return (
    <div className="min-h-screen flex flex-col relative">
      {/* Background */}
      <div 
        className="absolute inset-0 bg-mboa-bg"
        style={{
          backgroundImage: backgroundImage ? `url(${backgroundImage})` : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Dark overlay */}
        <div className="absolute inset-0 bg-mboa-bg/85" />
        
        {/* Pattern overlay */}
        <div className="absolute inset-0 mboa-pattern opacity-50" />
      </div>

      {/* Top bar */}
      <header className="relative z-50">
        <div className="glass-panel border-b border-mboa-outline/30">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex h-16 items-center justify-between">
              {/* Back button + title */}
              <div className="flex items-center gap-3">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => router.push('/dashboard')}
                  className="flex h-10 w-10 items-center justify-center rounded-full bg-mboa-surface-high hover:bg-mboa-surface-highest transition-colors"
                >
                  <ArrowLeft className="h-5 w-5 text-mboa-text" />
                </motion.button>
                <h1 className="text-lg font-bold wood-text">{title}</h1>
              </div>

              {/* Logo */}
              <div className="absolute left-1/2 transform -translate-x-1/2 hidden sm:block">
                <span className="text-lg font-bold wood-text">Mboa Fun</span>
              </div>

              {/* Gems */}
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-2 rounded-full bg-mboa-surface-high/80 px-4 py-2 border border-mboa-gold/20">
                  <Diamond className="h-4 w-4 text-mboa-gold fill-mboa-gold" />
                  <span className="text-sm font-semibold text-mboa-gold">
                    {formatGems(gems)} Gems
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Game content */}
      <main className="relative z-10 flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}
