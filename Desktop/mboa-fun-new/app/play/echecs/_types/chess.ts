export type PieceType = 'king' | 'queen' | 'rook' | 'bishop' | 'knight' | 'pawn';
export type PieceColor = 'white' | 'black';
export type File = 'a' | 'b' | 'c' | 'd' | 'e' | 'f' | 'g' | 'h';
export type Rank = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
export type Position = `${File}${Rank}`;

export interface Piece {
  type: PieceType;
  color: PieceColor;
  position: Position;
  hasMoved?: boolean; // For castling and en passant
}

export interface ChessMove {
  from: Position;
  to: Position;
  piece: Piece;
  captured?: Piece;
  promotion?: PieceType;
  isCastling?: boolean;
  isEnPassant?: boolean;
}

export interface ChessGameState {
  pieces: Piece[];
  currentPlayer: PieceColor;
  moveHistory: ChessMove[];
  status: 'playing' | 'check' | 'checkmate' | 'stalemate' | 'draw' | 'resigned';
  selectedPiece: Piece | null;
  possibleMoves: Position[];
  lastMove: ChessMove | null;
  capturedPieces: { white: Piece[]; black: Piece[] };
  timer?: { white: number; black: number };
}

export interface ChessBoardProps {
  gameState: ChessGameState;
  onMove: (move: ChessMove) => void;
  onResign: () => void;
  onNewGame: () => void;
}

// Unicode chess symbols
export const PIECE_SYMBOLS: Record<PieceType, { white: string; black: string }> = {
  king: { white: '♔', black: '♚' },
  queen: { white: '♕', black: '♛' },
  rook: { white: '♖', black: '♜' },
  bishop: { white: '♗', black: '♝' },
  knight: { white: '♘', black: '♞' },
  pawn: { white: '♙', black: '♟' },
};

// Initial board setup
export const INITIAL_POSITIONS: Piece[] = [
  // White pieces
  { type: 'rook', color: 'white', position: 'a1' },
  { type: 'knight', color: 'white', position: 'b1' },
  { type: 'bishop', color: 'white', position: 'c1' },
  { type: 'queen', color: 'white', position: 'd1' },
  { type: 'king', color: 'white', position: 'e1' },
  { type: 'bishop', color: 'white', position: 'f1' },
  { type: 'knight', color: 'white', position: 'g1' },
  { type: 'rook', color: 'white', position: 'h1' },
  ...(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as File[]).map((file, i) => ({
    type: 'pawn' as PieceType,
    color: 'white' as PieceColor,
    position: `${file}${2}` as Position,
  })),
  
  // Black pieces
  { type: 'rook', color: 'black', position: 'a8' },
  { type: 'knight', color: 'black', position: 'b8' },
  { type: 'bishop', color: 'black', position: 'c8' },
  { type: 'queen', color: 'black', position: 'd8' },
  { type: 'king', color: 'black', position: 'e8' },
  { type: 'bishop', color: 'black', position: 'f8' },
  { type: 'knight', color: 'black', position: 'g8' },
  { type: 'rook', color: 'black', position: 'h8' },
  ...(['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as File[]).map((file, i) => ({
    type: 'pawn' as PieceType,
    color: 'black' as PieceColor,
    position: `${file}${7}` as Position,
  })),
];
