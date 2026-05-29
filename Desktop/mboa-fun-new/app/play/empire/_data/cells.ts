import type { CellMeta } from '../_types/empire';

/**
 * Metadata for each of the 28 cells (indices 0..27).
 * Order MUST match CELL_NAMES / CELL_POSITIONS in image-board.tsx.
 *
 * Pricing follows the V1 spec; values not stated in spec are estimated to be
 * coherent with neighbouring cells.
 */
export const CELL_META: CellMeta[] = [
  { index: 0,  name: 'DÉPART',                  type: 'depart' },
  { index: 1,  name: 'Quartier Résidentiel',    type: 'property',           sector: 'residentiel', price: 120, baseRent: 30 },
  { index: 2,  name: 'Place des Fêtes',         type: 'place-fetes',        sector: 'special' },
  { index: 3,  name: 'Chance ?',                type: 'chance' },
  { index: 4,  name: 'Route des Palmiers',      type: 'route-palmiers',     sector: 'transport',   price: 100 },
  { index: 5,  name: 'École des Leaders',       type: 'ecole-leaders',      sector: 'education',   price: 200 },
  { index: 6,  name: 'Hôtel des Ambassadeurs',  type: 'hotel-amba',         sector: 'prestige',    price: 200, baseRent: 100 },
  { index: 7,  name: 'Palais Royal',            type: 'palais-royal',       sector: 'prestige',    price: 400, baseRent: 150 },
  { index: 8,  name: 'IMPÔTS',                  type: 'impots' },
  { index: 9,  name: 'Caisse Commune',          type: 'caisse-commune' },
  { index: 10, name: 'Trésor',                  type: 'tresor' },
  { index: 11, name: 'Centre Commercial',       type: 'centre-commercial',  sector: 'commerce',    price: 300, baseRent: 80 },
  { index: 12, name: 'Village Artisanal',       type: 'village-artisanal',  sector: 'special' },
  { index: 13, name: 'Village Artisanal',       type: 'village-artisanal',  sector: 'special' },
  { index: 14, name: 'Industrie',               type: 'zone-industrielle',  sector: 'industrie',   price: 300 },
  { index: 15, name: 'Aéroport International',  type: 'aeroport',           sector: 'transport',   price: 350, baseRent: 120 },
  { index: 16, name: 'Gare Routière',           type: 'transport',          sector: 'transport',   price: 200, baseRent: 50 },
  { index: 17, name: 'Port Autonome',           type: 'transport',          sector: 'transport',   price: 200, baseRent: 100 },
  { index: 18, name: 'Chance',                  type: 'chance' },
  { index: 19, name: 'Maetur',                  type: 'property',           sector: 'residentiel', price: 150, baseRent: 30 },
  { index: 20, name: 'Boulevard de la Liberté', type: 'property',           sector: 'residentiel', price: 180, baseRent: 36 },
  { index: 21, name: 'Marché',                  type: 'marche',             sector: 'commerce',    price: 200, baseRent: 40 },
  { index: 22, name: 'Prison',                  type: 'prison-visit' },
  { index: 23, name: 'Quartier Administratif',  type: 'quartier-admin',     sector: 'admin',       price: 250, baseRent: 50 },
  { index: 24, name: 'Cité Universitaire',      type: 'cite-u',             sector: 'education',   price: 200, baseRent: 50 },
  { index: 25, name: 'Stade Omnisport',         type: 'stade',              sector: 'sport',       price: 280, baseRent: 80 },
  { index: 26, name: 'Trésor',                  type: 'tresor' },
  { index: 27, name: 'Caisse Commune',          type: 'caisse-commune' },
];

/** Returns true if a cell can be bought (has a price). */
export function isBuyable(meta: CellMeta): boolean {
  return typeof meta.price === 'number' && meta.price > 0;
}

/** Default rent computation (20% of price, or explicit baseRent). */
export function computeBaseRent(meta: CellMeta): number {
  if (meta.baseRent !== undefined) return meta.baseRent;
  if (meta.price !== undefined) return Math.floor(meta.price * 0.2);
  return 0;
}
