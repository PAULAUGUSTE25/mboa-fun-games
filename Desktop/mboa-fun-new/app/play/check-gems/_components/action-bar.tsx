'use client';

import { motion } from 'framer-motion';
import { Hand, SkipForward, RotateCcw } from 'lucide-react';

interface ActionBarProps {
  onDraw: () => void;
  onPass: () => void;
  onRestart: () => void;
  canDraw: boolean;
  canPass: boolean;
  pendingDraws: number;
  message: string;
}

export function ActionBar({
  onDraw,
  onPass,
  onRestart,
  canDraw,
  canPass,
  pendingDraws,
  message,
}: ActionBarProps) {
  return (
    <div className="flex flex-col gap-3 items-center w-full">
      {/* Message */}
      <motion.div
        key={message}
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center text-mboa-text text-sm sm:text-base font-medium"
      >
        {message}
      </motion.div>

      {/* Buttons */}
      <div className="flex items-center gap-3">
        <motion.button
          whileHover={canDraw ? { scale: 1.04 } : undefined}
          whileTap={canDraw ? { scale: 0.96 } : undefined}
          onClick={onDraw}
          disabled={!canDraw}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canDraw
              ? 'bg-gradient-to-r from-mboa-primary-container to-[#00695c] text-mboa-primary border border-mboa-primary/40 shadow-[0_0_20px_rgba(148,211,193,0.2)]'
              : 'bg-mboa-surface-high text-mboa-text-muted border border-white/5 cursor-not-allowed opacity-60'
          }`}
        >
          <Hand className="h-4 w-4" />
          Piocher
          {pendingDraws > 0 && (
            <span className="ml-1 px-1.5 py-0.5 rounded-full bg-red-500/30 text-red-300 text-[10px] font-bold border border-red-500/40">
              +{pendingDraws}
            </span>
          )}
        </motion.button>

        <motion.button
          whileHover={canPass ? { scale: 1.04 } : undefined}
          whileTap={canPass ? { scale: 0.96 } : undefined}
          onClick={onPass}
          disabled={!canPass}
          className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-semibold text-sm transition-all ${
            canPass
              ? 'bg-mboa-surface-high text-mboa-text border border-white/10 hover:bg-mboa-surface-highest'
              : 'bg-mboa-surface-high/50 text-mboa-text-muted border border-white/5 cursor-not-allowed opacity-50'
          }`}
        >
          <SkipForward className="h-4 w-4" />
          Passer
        </motion.button>

        <motion.button
          whileHover={{ scale: 1.04 }}
          whileTap={{ scale: 0.96 }}
          onClick={onRestart}
          className="flex items-center gap-2 px-3 py-2.5 rounded-xl font-semibold text-sm bg-mboa-surface-high/60 text-mboa-text-muted border border-white/5 hover:text-mboa-text hover:bg-mboa-surface-highest transition-all"
          title="Nouvelle partie"
        >
          <RotateCcw className="h-4 w-4" />
        </motion.button>
      </div>
    </div>
  );
}
