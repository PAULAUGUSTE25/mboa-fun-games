'use client';

import { CSSProperties, useId } from 'react';
import { motion } from 'framer-motion';
import type { Player } from '../_types/empire';

interface PlayerTokenProps {
  player: Player;
  size?: 'xs' | 'sm' | 'md' | 'lg';
  active?: boolean;
  style?: CSSProperties;
}

// Pixel size (width × height). The pion is taller than it is wide — Ludo / Monopoly style.
const sizeDims: Record<NonNullable<PlayerTokenProps['size']>, { w: number; h: number; emoji: number }> = {
  xs: { w: 18, h: 24, emoji: 8 },
  sm: { w: 26, h: 36, emoji: 11 },
  md: { w: 40, h: 54, emoji: 16 },
  lg: { w: 56, h: 76, emoji: 22 },
};

/**
 * A 3D-looking Ludo / Monopoly pawn rendered with SVG.
 * The pawn body uses player.color with radial highlights for a glossy plastic look.
 * The player's emoji floats above the head as a small badge so it stays recognisable.
 */
export function PlayerToken({ player, size = 'md', active, style }: PlayerTokenProps) {
  const uid = useId().replace(/:/g, '');
  const idHead = `pwn-head-${uid}`;
  const idBody = `pwn-body-${uid}`;
  const idBase = `pwn-base-${uid}`;
  const idShadow = `pwn-shadow-${uid}`;
  const { w, h, emoji } = sizeDims[size];
  const color = player.color;

  return (
    <motion.div
      layout
      transition={{ type: 'spring', stiffness: 220, damping: 22 }}
      style={{ width: w, height: h, ...style }}
      className="relative flex items-end justify-center select-none"
    >
      {/* Pulsing halo for active player */}
      {active && (
        <motion.div
          animate={{ scale: [1, 1.25, 1], opacity: [0.55, 0.15, 0.55] }}
          transition={{ duration: 1.4, repeat: Infinity }}
          className="absolute left-1/2 -translate-x-1/2 rounded-full pointer-events-none"
          style={{
            width: w * 0.9,
            height: w * 0.9,
            bottom: -2,
            background: `${color}55`,
            filter: 'blur(6px)',
          }}
        />
      )}

      {/* The pawn itself, drawn in an SVG that scales with size */}
      <svg
        viewBox="0 0 40 56"
        width={w}
        height={h}
        className="relative drop-shadow-[0_3px_3px_rgba(0,0,0,0.55)]"
      >
        <defs>
          {/* Head — glossy sphere */}
          <radialGradient id={idHead} cx="35%" cy="30%" r="70%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.95" />
            <stop offset="35%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.55" />
          </radialGradient>

          {/* Body — vertical highlight */}
          <linearGradient id={idBody} x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.45" />
            <stop offset="35%" stopColor={color} stopOpacity="1" />
            <stop offset="60%" stopColor="#ffffff" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.5" />
          </linearGradient>

          {/* Base disc */}
          <radialGradient id={idBase} cx="50%" cy="40%" r="60%">
            <stop offset="0%" stopColor="#ffffff" stopOpacity="0.5" />
            <stop offset="60%" stopColor={color} stopOpacity="1" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0.6" />
          </radialGradient>

          {/* Ground shadow */}
          <radialGradient id={idShadow} cx="50%" cy="50%" r="50%">
            <stop offset="0%" stopColor="#000000" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#000000" stopOpacity="0" />
          </radialGradient>
        </defs>

        {/* Ground shadow ellipse */}
        <ellipse cx="20" cy="53" rx="13" ry="2.6" fill={`url(#${idShadow})`} />

        {/* Base disc */}
        <ellipse cx="20" cy="48" rx="14" ry="4" fill={`url(#${idBase})`} stroke={color} strokeWidth="0.6" />

        {/* Body — classic pawn silhouette */}
        <path
          d="
            M 13 46
            C 11 38, 9 32, 12 26
            C 13 24, 14 22, 16 21
            L 24 21
            C 26 22, 27 24, 28 26
            C 31 32, 29 38, 27 46
            Z
          "
          fill={`url(#${idBody})`}
          stroke={color}
          strokeWidth="0.8"
        />

        {/* Neck ring */}
        <ellipse cx="20" cy="20" rx="6" ry="1.8" fill="#000" opacity="0.35" />
        <ellipse cx="20" cy="19.2" rx="6" ry="1.6" fill={color} opacity="0.95" />

        {/* Head — sphere */}
        <circle cx="20" cy="12" r="8" fill={`url(#${idHead})`} stroke={color} strokeWidth="0.6" />

        {/* Specular highlight on head */}
        <ellipse cx="17" cy="9" rx="2.5" ry="1.5" fill="#ffffff" opacity="0.55" />
      </svg>

      {/* Emoji badge floating on the head so the player remains identifiable */}
      <span
        className="absolute pointer-events-none"
        style={{
          top: h * 0.06,
          fontSize: emoji,
          lineHeight: 1,
          textShadow: '0 1px 2px rgba(0,0,0,0.7)',
        }}
      >
        {player.token}
      </span>
    </motion.div>
  );
}
