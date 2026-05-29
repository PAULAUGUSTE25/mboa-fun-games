import type { BoardSpace } from '../_types/empire';

/**
 * Mboa Empire board — 24 spaces (clockwise from bottom-right corner).
 * Layout in a 7x7 grid uses only the outer ring (4 corners + 5 spaces per side).
 *
 * Positions:
 *  0  = DÉPART (bottom-right corner)
 *  1-5 = Bottom row (going left)
 *  6  = PRISON (bottom-left corner)
 *  7-11 = Left column (going up)
 *  12 = PARKING (top-left corner)
 *  13-17 = Top row (going right)
 *  18 = VA EN PRISON (top-right corner)
 *  19-23 = Right column (going down)
 */
export const BOARD: BoardSpace[] = [
  // 0 — DÉPART (bottom-right corner)
  { position: 0, type: 'start', name: 'DÉPART', icon: '⭐' },

  // 1-5 — Quartier Douala (bottom row, right→left)
  { position: 1, type: 'property', name: 'Bonabéri', district: 'douala', price: 60, rent: 6 },
  { position: 2, type: 'property', name: 'Akwa', district: 'douala', price: 80, rent: 8 },
  { position: 3, type: 'chance', name: 'Carte Mboa', icon: '🎴' },
  { position: 4, type: 'property', name: 'Bonapriso', district: 'douala', price: 100, rent: 10 },
  { position: 5, type: 'property', name: 'Bali', district: 'douala', price: 120, rent: 12 },

  // 6 — PRISON (bottom-left corner)
  { position: 6, type: 'jail', name: 'PRISON', icon: '🔒' },

  // 7-11 — Quartier Yaoundé (left column, bottom→top)
  { position: 7, type: 'property', name: 'Bastos', district: 'yaounde', price: 140, rent: 14 },
  { position: 8, type: 'property', name: 'Mvog-Ada', district: 'yaounde', price: 160, rent: 16 },
  { position: 9, type: 'chance', name: 'Carte Mboa', icon: '🎴' },
  { position: 10, type: 'property', name: 'Nlongkak', district: 'yaounde', price: 180, rent: 18 },
  { position: 11, type: 'property', name: 'Mfandena', district: 'yaounde', price: 200, rent: 20 },

  // 12 — PARKING (top-left corner)
  { position: 12, type: 'parking', name: 'PARKING', icon: '🅿️' },

  // 13-17 — Quartier Régions (top row, left→right)
  { position: 13, type: 'property', name: 'Bafoussam', district: 'regions', price: 220, rent: 22 },
  { position: 14, type: 'property', name: 'Bamenda', district: 'regions', price: 240, rent: 24 },
  { position: 15, type: 'tax', name: 'Taxe', icon: '💰', tax: 100 },
  { position: 16, type: 'property', name: 'Limbé', district: 'regions', price: 260, rent: 26 },
  { position: 17, type: 'property', name: 'Kribi', district: 'regions', price: 280, rent: 28 },

  // 18 — VA EN PRISON (top-right corner)
  { position: 18, type: 'go-to-jail', name: 'EN PRISON', icon: '🚔' },

  // 19-23 — Quartier Marchés (right column, top→bottom)
  { position: 19, type: 'property', name: 'Mokolo', district: 'marche', price: 300, rent: 30 },
  { position: 20, type: 'property', name: 'Sandaga', district: 'marche', price: 320, rent: 32 },
  { position: 21, type: 'chance', name: 'Carte Mboa', icon: '🎴' },
  { position: 22, type: 'property', name: 'Mfoundi', district: 'marche', price: 350, rent: 35 },
  { position: 23, type: 'property', name: 'Marché Central', district: 'marche', price: 400, rent: 40 },
];

/**
 * Map a position (0..23) to a grid cell {row, col} in the 7x7 grid.
 */
export function positionToGrid(position: number): { row: number; col: number } {
  // 0 = bottom-right corner (row 6, col 6)
  if (position === 0) return { row: 6, col: 6 };
  // 1-5 = bottom row, going left
  if (position <= 5) return { row: 6, col: 6 - position };
  // 6 = bottom-left corner
  if (position === 6) return { row: 6, col: 0 };
  // 7-11 = left column, going up
  if (position <= 11) return { row: 6 - (position - 6), col: 0 };
  // 12 = top-left corner
  if (position === 12) return { row: 0, col: 0 };
  // 13-17 = top row, going right
  if (position <= 17) return { row: 0, col: position - 12 };
  // 18 = top-right corner
  if (position === 18) return { row: 0, col: 6 };
  // 19-23 = right column, going down
  return { row: position - 18, col: 6 };
}

/**
 * Get the orientation of a space (which side it's on) for rotation purposes.
 */
export function getSpaceSide(position: number): 'bottom' | 'left' | 'top' | 'right' | 'corner' {
  if ([0, 6, 12, 18].includes(position)) return 'corner';
  if (position >= 1 && position <= 5) return 'bottom';
  if (position >= 7 && position <= 11) return 'left';
  if (position >= 13 && position <= 17) return 'top';
  return 'right';
}
