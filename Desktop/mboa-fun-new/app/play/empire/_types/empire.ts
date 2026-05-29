export type District = 'douala' | 'yaounde' | 'regions' | 'marche';
export type SpaceType = 'start' | 'jail' | 'parking' | 'go-to-jail' | 'property' | 'chance' | 'tax';

export interface BoardSpace {
  position: number; // 0..23 (clockwise from bottom-right)
  type: SpaceType;
  name: string;
  /** Subtitle / district label */
  district?: District;
  /** Purchase price */
  price?: number;
  /** Base rent */
  rent?: number;
  /** Tax to pay */
  tax?: number;
  /** Icon (emoji or lucide name) */
  icon?: string;
}

export type StatusKey =
  | 'etudiant'
  | 'administrateur'
  | 'commercant'
  | 'sportif'
  | 'transporteur'
  | 'artisan';

export type Sector =
  | 'residentiel'
  | 'commerce'
  | 'transport'
  | 'sport'
  | 'education'
  | 'admin'
  | 'prestige'
  | 'industrie'
  | 'special';

export type CellType =
  | 'depart'
  | 'property'        // generic buyable property
  | 'transport'       // gare / port / aéroport
  | 'impots'
  | 'chance'
  | 'caisse-commune'
  | 'tresor'          // small bonus / mini-card
  | 'prison-visit'    // simple visit, no effect
  | 'stade'
  | 'cite-u'
  | 'quartier-admin'
  | 'marche'
  | 'centre-commercial'
  | 'village-artisanal'
  | 'place-fetes'
  | 'ecole-leaders'
  | 'palais-royal'
  | 'route-palmiers'
  | 'hotel-amba'
  | 'zone-industrielle'
  | 'aeroport';

export interface CellMeta {
  index: number;
  name: string;
  type: CellType;
  sector?: Sector;
  /** Purchase price (only if buyable) */
  price?: number;
  /** Base rent (if not 20% of price) */
  baseRent?: number;
}

export interface Player {
  id: string;
  name: string;
  /** Token emoji or color */
  token: string;
  /** Token tailwind color (for ring/glow) */
  color: string;
  position: number;
  money: number;
  /** Cell indices owned by this player */
  properties: number[];
  inJail: boolean;
  jailTurns: number;
  bankrupt: boolean;
  /** Chosen status (Phase 1+2) */
  statusKey: StatusKey | null;
  /** Reputation points (Phase 6) */
  reputation: number;
  /** Outstanding loan to be reimbursed when passing DÉPART */
  loanRemaining: number;
  /** Owns at least one usine on Zone Industrielle */
  hasUsine: boolean;
  /** Skip next turn (e.g. via Place des Fêtes) */
  skipNextTurn: boolean;
  /** Holds an unused Leadership card (École des Leaders) */
  hasLeadershipCard: boolean;
  /** Improvement level on each owned cell (0..3). Map cellIdx -> level. */
  improvements: Record<number, number>;
  /** True if this player is controlled by the computer. */
  isAI?: boolean;
}

export const DISTRICT_COLORS: Record<District, { bg: string; border: string; label: string }> = {
  douala: {
    // Antique gold band - economic district (yellow flag color)
    bg: '#CEA271',
    border: '#684A29',
    label: 'Douala',
  },
  yaounde: {
    // Deep Cameroon red - political capital
    bg: '#90271B',
    border: '#4a1109',
    label: 'Yaoundé',
  },
  regions: {
    // Warm rich mahogany
    bg: '#8B3F1C',
    border: '#4F2F17',
    label: 'Régions',
  },
  marche: {
    // Deep Cameroon green - markets
    bg: '#2A4C23',
    border: '#142811',
    label: 'Marchés',
  },
};
