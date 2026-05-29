'use client';

import { motion } from 'framer-motion';
import type { LudoColor } from '../_lib/engine';

// Palette saturée — chaque pion est nettement de sa couleur, pas de mélange noir.
const COLOR_HEX: Record<LudoColor, string> = {
  red: '#ef2929',
  blue: '#1e6bff',
  green: '#13b85c',
  yellow: '#f5c211',
};
const COLOR_LIGHT: Record<LudoColor, string> = {
  red: '#ff9a9a',
  blue: '#9ec1ff',
  green: '#9be8b8',
  yellow: '#fde879',
};
const COLOR_DEEP: Record<LudoColor, string> = {
  red: '#a30b13',
  blue: '#0b3aa6',
  green: '#0b6b35',
  yellow: '#a17707',
};

interface LudoPawnProps {
  color: LudoColor;
  selectable?: boolean;
  /** Diameter as a CSS size, e.g. "78%" for fill or "26px". */
  size?: string;
  onClick?: () => void;
}

/**
 * 3D-looking glossy Ludo pawn rendered with SVG.
 * Designed to feel like Ludo King's plastic pieces — base disc, curved body,
 * neck ring, spherical head with specular highlight, ground shadow.
 */
export function LudoPawn({ color, selectable, size = '78%', onClick }: LudoPawnProps) {
  const c = COLOR_HEX[color];
  const cLight = COLOR_LIGHT[color];
  const cDeep = COLOR_DEEP[color];
  return (
    <motion.button
      onClick={onClick}
      whileHover={selectable ? { scale: 1.18, y: -2 } : undefined}
      whileTap={selectable ? { scale: 0.94 } : undefined}
      animate={selectable ? { y: [0, -3, 0] } : { y: 0 }}
      transition={selectable ? { duration: 0.9, repeat: Infinity } : undefined}
      style={{
        width: size,
        height: size,
        cursor: selectable ? 'pointer' : 'default',
        background: 'transparent',
        border: 'none',
        padding: 0,
      }}
      className="relative flex items-end justify-center"
      aria-label={`pion ${color}`}
    >
      <svg viewBox="0 0 40 50" width="100%" height="100%" style={{ overflow: 'visible' }}>
        <defs>
          {/* Tête : reflet blanc → couleur vive → nuance plus foncée DE LA MÊME couleur */}
          <radialGradient id={`p-h-${color}`} cx="35%" cy="28%" r="70%">
            <stop offset="0%" stopColor="#ffffff" />
            <stop offset="22%" stopColor={cLight} />
            <stop offset="60%" stopColor={c} />
            <stop offset="100%" stopColor={cDeep} />
          </radialGradient>
          {/* Corps : dégradé latéral nuancé en restant DANS LA COULEUR */}
          <linearGradient id={`p-b-${color}`} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor={cDeep} />
            <stop offset="35%" stopColor={c} />
            <stop offset="60%" stopColor={cLight} />
            <stop offset="100%" stopColor={cDeep} />
          </linearGradient>
          {/* Ombre au sol (la SEULE zone vraiment noire) */}
          <radialGradient id={`p-g-${color}`} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000" stopOpacity="0" />
          </radialGradient>
        </defs>
        {/* ombre au sol */}
        <ellipse cx="20" cy="48" rx="13" ry="2.5" fill={`url(#p-g-${color})`} />
        {/* disque de base — couleur pleine */}
        <ellipse cx="20" cy="44" rx="13" ry="3.5" fill={c} stroke={cDeep} strokeWidth="0.6" />
        {/* corps galbé — dégradé monochromatique */}
        <path
          d="M 13 42 C 11 35, 9 28, 12 23 C 13 21, 15 19, 17 18 L 23 18 C 25 19, 27 21, 28 23 C 31 28, 29 35, 27 42 Z"
          fill={`url(#p-b-${color})`}
          stroke={cDeep}
          strokeWidth="0.5"
        />
        {/* anneau du cou — légère ombre dans la couleur foncée (pas noir) */}
        <ellipse cx="20" cy="17" rx="5.2" ry="1.6" fill={cDeep} opacity="0.8" />
        {/* tête sphérique — gradient monochromatique avec reflet blanc */}
        <circle cx="20" cy="11" r="7" fill={`url(#p-h-${color})`} stroke={cDeep} strokeWidth="0.5" />
        {/* reflet spéculaire */}
        <ellipse cx="17.5" cy="8.5" rx="2" ry="1.3" fill="#fff" opacity="0.7" />
      </svg>

      {selectable && (
        <motion.div
          animate={{ opacity: [0.4, 0.9, 0.4], scale: [1, 1.15, 1] }}
          transition={{ duration: 1.1, repeat: Infinity }}
          className="absolute pointer-events-none rounded-full"
          style={{
            inset: '-15%',
            background: `radial-gradient(circle, ${c}55 0%, transparent 70%)`,
            filter: 'blur(2px)',
          }}
        />
      )}
    </motion.button>
  );
}
