'use client';

import { Medal, Zap, Target, Crown } from 'lucide-react';

export type BadgeType = 'veteran' | 'fast' | 'strategist' | 'champion';

interface PlayerBadgeProps {
  type: BadgeType;
  size?: 'sm' | 'md';
}

export function PlayerBadge({ type, size = 'sm' }: PlayerBadgeProps) {
  const badgeConfig = {
    veteran: {
      icon: Medal,
      label: 'Vétéran',
      color: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    },
    fast: {
      icon: Zap,
      label: 'Rapide',
      color: 'text-blue-400 bg-blue-400/10 border-blue-400/30',
    },
    strategist: {
      icon: Target,
      label: 'Stratège',
      color: 'text-purple-400 bg-purple-400/10 border-purple-400/30',
    },
    champion: {
      icon: Crown,
      label: 'Champion',
      color: 'text-mboa-gold bg-mboa-gold/10 border-mboa-gold/30',
    },
  };

  const config = badgeConfig[type];
  const Icon = config.icon;

  const sizeClasses = {
    sm: 'px-2 py-0.5 text-[10px] gap-1',
    md: 'px-2.5 py-1 text-xs gap-1.5',
  };

  const iconSizes = {
    sm: 'h-3 w-3',
    md: 'h-3.5 w-3.5',
  };

  return (
    <span className={`inline-flex items-center rounded-full border font-medium ${config.color} ${sizeClasses[size]}`}>
      <Icon className={iconSizes[size]} />
      {config.label}
    </span>
  );
}
