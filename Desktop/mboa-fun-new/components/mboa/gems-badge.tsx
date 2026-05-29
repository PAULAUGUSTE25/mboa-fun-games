'use client';

import { Diamond } from 'lucide-react';
import { motion } from 'framer-motion';
import { formatGems } from '@/lib/format';

interface GemsBadgeProps {
  gems: number;
  size?: 'sm' | 'md' | 'lg';
  showIcon?: boolean;
}

export function GemsBadge({ gems, size = 'md', showIcon = true }: GemsBadgeProps) {
  const sizeClasses = {
    sm: 'px-2 py-1 text-xs',
    md: 'px-3 py-1.5 text-sm',
    lg: 'px-4 py-2 text-base',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-4 w-4',
    lg: 'h-5 w-5',
  };

  return (
    <motion.div
      whileHover={{ scale: 1.02 }}
      className={`inline-flex items-center gap-1.5 rounded-full bg-mboa-surface-high border border-mboa-gold/30 ${sizeClasses[size]}`}
    >
      {showIcon && (
        <Diamond className={`${iconSizes[size]} text-mboa-gold fill-mboa-gold`} />
      )}
      <span className="font-semibold text-mboa-gold">
        {formatGems(gems)} Gems
      </span>
    </motion.div>
  );
}
