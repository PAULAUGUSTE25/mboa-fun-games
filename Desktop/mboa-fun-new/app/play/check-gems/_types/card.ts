export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades' | 'joker';
export type Rank =
  | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10'
  | 'J' | 'Q' | 'K' | 'A' | 'JOKER';

export interface Card {
  id: string;
  suit: Suit;
  rank: Rank;
}

/** Couleurs jouables (sans le joker, qui est wild). */
export const PLAYABLE_SUITS: Exclude<Suit, 'joker'>[] = [
  'hearts', 'diamonds', 'clubs', 'spades',
];

export type Player = 'player' | 'opponent';

export type GameStatus = 'idle' | 'playing' | 'choosing-suit' | 'won' | 'lost';

export interface GameState {
  deck: Card[];
  discard: Card[];
  playerHand: Card[];
  opponentHand: Card[];
  currentPlayer: Player;
  /** Active suit (can differ from top card after a Jack is played) */
  activeSuit: Suit;
  status: GameStatus;
  /** Number of cards next player must draw (+2 chain) */
  pendingDraws: number;
  /** Last action message for UI */
  message: string;
  /** Card just played, for animation reference */
  lastPlayedId: string | null;
  /** Increments each turn for re-renders */
  turn: number;
  /** Track wins for session */
  wins: number;
  losses: number;
  /**
   * Le joueur a annoncé « CHECK » (avant-dernière carte).
   * Doit être true au moment où sa main passe de 2 → 1 cartes,
   * sinon pénalité +2.
   */
  playerCheckSaid: boolean;
  /**
   * Le joueur a annoncé « GAMES » (dernière carte).
   * Doit être true au moment où sa main passe de 1 → 0,
   * sinon la victoire est annulée et il pioche +2.
   */
  playerGamesSaid: boolean;
  /** Phase de distribution animée au début du tour. */
  dealing: boolean;
  /** Index de la carte en cours de distribution (pour l'animation). */
  dealingIndex: number;
}

export interface CardVisual {
  symbol: string;
  color: 'red' | 'black';
  label: string;
}
