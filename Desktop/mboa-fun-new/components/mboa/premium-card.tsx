'use client';

import { ReactNode } from 'react';
import { motion } from 'framer-motion';

interface PremiumCardProps {
  children: ReactNode;
  className?: string;
  hoverable?: boolean;
  glowColor?: 'emerald' | 'gold' | 'none';
  onClick?: () => void;
}

export function PremiumCard({
  children,
  className = '',
  hoverable = true,
  glowColor = 'emerald',
  onClick,
}: PremiumCardProps) {
  const glowClasses = {
    emerald: 'hover:border-mboa-primary/30 hover:shadow-[0_0_30px_rgba(148,211,193,0.1)]',
    gold: 'hover:border-mboa-gold/30 hover:shadow-[0_0_30px_rgba(233,195,73,0.1)]',
    none: '',
  };

  return (
    <motion.div
      whileHover={hoverable ? { y: -2 } : undefined}
      whileTap={onClick ? { scale: 0.98 } : undefined}
      onClick={onClick}
      className={`
        bg-[#1a2421] 
        border border-white/5 
        rounded-[20px] 
        p-6 
        transition-all duration-300
        ${hoverable ? glowClasses[glowColor] : ''}
        ${onClick ? 'cursor-pointer' : ''}
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}
