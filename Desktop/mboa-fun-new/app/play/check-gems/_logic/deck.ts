import type { Card, Suit, Rank, CardVisual } from '../_types/card';

const SUITS: Exclude<Suit, 'joker'>[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Exclude<Rank, 'JOKER'>[] = [
  '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K', 'A',
];

export const SUIT_SYMBOLS: Record<Suit, string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
  joker: '★',
};

export const SUIT_NAMES: Record<Suit, string> = {
  hearts: 'Cœur',
  diamonds: 'Carreau',
  clubs: 'Trèfle',
  spades: 'Pique',
  joker: 'Joker',
};

export function isJoker(card: Card): boolean {
  return card.rank === 'JOKER';
}

export function getCardVisual(card: Card): CardVisual {
  if (isJoker(card)) {
    // Le 1er joker est rouge, le 2nd noir (différenciés par leur id).
    const red = card.id.endsWith('A');
    return {
      symbol: '★',
      color: red ? 'red' : 'black',
      label: 'JOKER',
    };
  }
  const isRed = card.suit === 'hearts' || card.suit === 'diamonds';
  return {
    symbol: SUIT_SYMBOLS[card.suit],
    color: isRed ? 'red' : 'black',
    label: `${card.rank}${SUIT_SYMBOLS[card.suit]}`,
  };
}

export function buildDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ id: `${suit}-${rank}`, suit, rank });
    }
  }
  // 2 jokers (un « rouge » id finit par A, un « noir » id finit par B)
  deck.push({ id: 'joker-A', suit: 'joker', rank: 'JOKER' });
  deck.push({ id: 'joker-B', suit: 'joker', rank: 'JOKER' });
  return deck;
}

/** Fisher-Yates shuffle */
export function shuffleDeck<T>(deck: T[]): T[] {
  const arr = [...deck];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Draw N cards from the top of the deck.
 * If deck runs out, reshuffle the discard pile (keeping the top card).
 */
export function drawCards(
  deck: Card[],
  discard: Card[],
  n: number,
): { drawn: Card[]; deck: Card[]; discard: Card[] } {
  let currentDeck = [...deck];
  let currentDiscard = [...discard];
  const drawn: Card[] = [];

  for (let i = 0; i < n; i++) {
    if (currentDeck.length === 0) {
      // Reshuffle discard (except top)
      if (currentDiscard.length <= 1) break;
      const top = currentDiscard[currentDiscard.length - 1];
      const rest = currentDiscard.slice(0, -1);
      currentDeck = shuffleDeck(rest);
      currentDiscard = [top];
    }
    const card = currentDeck.shift();
    if (card) drawn.push(card);
  }

  return { drawn, deck: currentDeck, discard: currentDiscard };
}
