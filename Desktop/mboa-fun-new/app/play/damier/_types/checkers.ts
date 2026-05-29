export type PieceColor = 'white' | 'black';
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Position = `${File}${Rank}`;

export interface CheckersPiece {
  color: PieceColor;
  position: Position;
  isKing: boolean;
}

export interface CheckersMove {
  from: Position;
  to: Position;
  piece: CheckersPiece;
  captured?: CheckersPiece[];
  isKingMove?: boolean;
}

export interface CheckersGameState {
  pieces: CheckersPiece[];
  currentPlayer: PieceColor;
  moveHistory: CheckersMove[];
  status: 'playing' | 'won' | 'draw' | 'resigned';
  selectedPiece: CheckersPiece | null;
  possibleMoves: CheckersMove[];
  lastMove: CheckersMove | null;
  capturedPieces: { white: CheckersPiece[]; black: CheckersPiece[] };
  mustCapture: boolean; // True if current player must capture
}

export interface CheckersBoardProps {
  gameState: CheckersGameState;
  onMove: (move: CheckersMove) => void;
  onResign: () => void;
  onNewGame: () => void;
}

// Checkers piece symbols
export const PIECE_SYMBOLS: Record<PieceColor, { normal: string; king: string }> = {
  white: { normal: '⚪', king: '👑' },
  black: { normal: '⚫', king: '🎯' },
};

// Initial board setup for international checkers (10x10 would be standard, but we'll use 8x8 for simplicity)
export const INITIAL_POSITIONS: CheckersPiece[] = [
  // Black pieces (top 3 rows, dark squares only)
  ...(['a', 'c', 'e', 'g'] as File[]).flatMap(file =>
    ([8, 6] as Rank[]).map(rank => ({
      color: 'black' as PieceColor,
      position: `${file}${rank}` as Position,
      isKing: false,
    }))
  ),
  ...(['b', 'd', 'f', 'h'] as File[]).map(file => ({
    color: 'black' as PieceColor,
    position: `${file}${7}` as Position,
    isKing: false,
  })),
  
  // White pieces (bottom 3 rows, dark squares only)
  ...(['a', 'c', 'e', 'g'] as File[]).flatMap(file =>
    ([1, 3] as Rank[]).map(rank => ({
      color: 'white' as PieceColor,
      position: `${file}${rank}` as Position,
      isKing: false,
    }))
  ),
  ...(['b', 'd', 'f', 'h'] as File[]).map(file => ({
    color: 'white' as PieceColor,
    position: `${file}${2}` as Position,
    isKing: false,
  })),
];
