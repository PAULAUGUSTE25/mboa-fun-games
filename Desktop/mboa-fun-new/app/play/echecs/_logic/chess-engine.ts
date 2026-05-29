import type { Piece, PieceType, PieceColor, Position, ChessMove, ChessGameState } from '../_types/chess';
import { INITIAL_POSITIONS, PIECE_SYMBOLS } from '../_types/chess';

export class ChessEngine {
  private gameState: ChessGameState;

  constructor() {
    this.gameState = {
      pieces: INITIAL_POSITIONS.map(p => ({ ...p, hasMoved: false })),
      currentPlayer: 'white',
      moveHistory: [],
      status: 'playing',
      selectedPiece: null,
      possibleMoves: [],
      lastMove: null,
      capturedPieces: { white: [], black: [] },
    };
  }

  getGameState(): ChessGameState {
    return { ...this.gameState };
  }

  // Convert position like 'a1' to coordinates [0, 0]
  positionToCoords(pos: Position): [number, number] {
    const file = pos.charCodeAt(0) - 'a'.charCodeAt(0);
    const rank = parseInt(pos[1]) - 1;
    return [file, rank];
  }

  // Convert coordinates [0, 0] to position 'a1'
  coordsToPosition(file: number, rank: number): Position {
    return `${String.fromCharCode('a'.charCodeAt(0) + file)}${rank + 1}` as Position;
  }

  getPieceAt(position: Position): Piece | null {
    return this.gameState.pieces.find(p => p.position === position) || null;
  }

  isValidPosition(position: Position): boolean {
    const [file, rank] = this.positionToCoords(position);
    return file >= 0 && file < 8 && rank >= 0 && rank < 8;
  }

  // Get all possible moves for a piece
  getPossibleMoves(piece: Piece): Position[] {
    const moves: Position[] = [];
    const [file, rank] = this.positionToCoords(piece.position);

    switch (piece.type) {
      case 'pawn':
        const direction = piece.color === 'white' ? 1 : -1;
        const startRank = piece.color === 'white' ? 1 : 6;

        // Move forward one square
        const oneStep = this.coordsToPosition(file, rank + direction);
        if (this.isValidPosition(oneStep) && !this.getPieceAt(oneStep)) {
          moves.push(oneStep);

          // Move forward two squares from starting position
          if (rank === startRank) {
            const twoStep = this.coordsToPosition(file, rank + 2 * direction);
            if (this.isValidPosition(twoStep) && !this.getPieceAt(twoStep)) {
              moves.push(twoStep);
            }
          }
        }

        // Capture diagonally
        [-1, 1].forEach(df => {
          const capturePos = this.coordsToPosition(file + df, rank + direction);
          const target = this.getPieceAt(capturePos);
          if (this.isValidPosition(capturePos) && target && target.color !== piece.color) {
            moves.push(capturePos);
          }

          // En passant
          if (this.gameState.lastMove) {
            const lastPiece = this.gameState.lastMove.piece;
            if (
              lastPiece.type === 'pawn' &&
              Math.abs(this.positionToCoords(this.gameState.lastMove.from)[1] - this.positionToCoords(this.gameState.lastMove.to)[1]) === 2 &&
              this.positionToCoords(this.gameState.lastMove.to)[0] === file + df &&
              rank === (piece.color === 'white' ? 4 : 3)
            ) {
              moves.push(capturePos);
            }
          }
        });
        break;

      case 'knight':
        const knightMoves = [
          [-2, -1], [-2, 1], [-1, -2], [-1, 2],
          [1, -2], [1, 2], [2, -1], [2, 1]
        ];
        knightMoves.forEach(([df, dr]) => {
          const newPos = this.coordsToPosition(file + df, rank + dr);
          const target = this.getPieceAt(newPos);
          if (this.isValidPosition(newPos) && (!target || target.color !== piece.color)) {
            moves.push(newPos);
          }
        });
        break;

      case 'bishop':
        this.addLineMoves(moves, piece, file, rank, [[1, 1], [1, -1], [-1, 1], [-1, -1]]);
        break;

      case 'rook':
        this.addLineMoves(moves, piece, file, rank, [[0, 1], [0, -1], [1, 0], [-1, 0]]);
        break;

      case 'queen':
        this.addLineMoves(moves, piece, file, rank, [
          [0, 1], [0, -1], [1, 0], [-1, 0],
          [1, 1], [1, -1], [-1, 1], [-1, -1]
        ]);
        break;

      case 'king':
        const kingMoves = [
          [-1, -1], [-1, 0], [-1, 1],
          [0, -1], [0, 1],
          [1, -1], [1, 0], [1, 1]
        ];
        kingMoves.forEach(([df, dr]) => {
          const newPos = this.coordsToPosition(file + df, rank + dr);
          const target = this.getPieceAt(newPos);
          if (this.isValidPosition(newPos) && (!target || target.color !== piece.color)) {
            moves.push(newPos);
          }
        });

        // Castling
        if (!piece.hasMoved && !this.isKingInCheck(piece.color)) {
          // Kingside castling
          const rook = this.getPieceAt(this.coordsToPosition(7, rank));
          if (rook && rook.type === 'rook' && rook.color === piece.color && !rook.hasMoved) {
            if (!this.getPieceAt(this.coordsToPosition(5, rank)) && !this.getPieceAt(this.coordsToPosition(6, rank))) {
              if (!this.wouldBeInCheck(piece, this.coordsToPosition(5, rank)) && 
                  !this.wouldBeInCheck(piece, this.coordsToPosition(6, rank))) {
                moves.push(this.coordsToPosition(6, rank));
              }
            }
          }
          // Queenside castling
          const queenRook = this.getPieceAt(this.coordsToPosition(0, rank));
          if (queenRook && queenRook.type === 'rook' && queenRook.color === piece.color && !queenRook.hasMoved) {
            if (!this.getPieceAt(this.coordsToPosition(1, rank)) && !this.getPieceAt(this.coordsToPosition(2, rank)) && !this.getPieceAt(this.coordsToPosition(3, rank))) {
              if (!this.wouldBeInCheck(piece, this.coordsToPosition(2, rank)) && 
                  !this.wouldBeInCheck(piece, this.coordsToPosition(3, rank))) {
                moves.push(this.coordsToPosition(2, rank));
              }
            }
          }
        }
        break;
    }

    return moves;
  }

  private addLineMoves(moves: Position[], piece: Piece, file: number, rank: number, directions: number[][]) {
    directions.forEach(([df, dr]) => {
      for (let i = 1; i < 8; i++) {
        const newPos = this.coordsToPosition(file + df * i, rank + dr * i);
        if (!this.isValidPosition(newPos)) break;
        
        const target = this.getPieceAt(newPos);
        if (target) {
          if (target.color !== piece.color) {
            moves.push(newPos);
          }
          break;
        }
        moves.push(newPos);
      }
    });
  }

  makeMove(from: Position, to: Position): ChessMove | null {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.gameState.currentPlayer) {
      return null;
    }

    const possibleMoves = this.getPossibleMoves(piece);
    if (!possibleMoves.includes(to)) {
      return null;
    }

    const captured = this.getPieceAt(to);
    const move: ChessMove = {
      from,
      to,
      piece: { ...piece },
      captured: captured || undefined,
    };

    // Handle special moves
    if (piece.type === 'pawn' && (to[1] === '8' || to[1] === '1')) {
      // Promotion (auto-promote to queen for simplicity)
      move.promotion = 'queen';
    }

    if (piece.type === 'king' && Math.abs(this.positionToCoords(from)[0] - this.positionToCoords(to)[0]) === 2) {
      move.isCastling = true;
    }

    if (piece.type === 'pawn' && this.isEnPassant(piece, from, to)) {
      move.isEnPassant = true;
      const capturedPos = this.coordsToPosition(
        this.positionToCoords(to)[0],
        this.positionToCoords(from)[1]
      );
      move.captured = this.getPieceAt(capturedPos) || undefined;
    }

    // Execute the move
    this.executeMove(move);

    return move;
  }

  private executeMove(move: ChessMove) {
    // Remove captured piece
    if (move.captured && !move.isEnPassant) {
      this.gameState.pieces = this.gameState.pieces.filter(p => p.position !== move.to);
      this.gameState.capturedPieces[move.captured.color].push(move.captured);
    }

    // Handle en passant capture
    if (move.isEnPassant && move.captured) {
      this.gameState.pieces = this.gameState.pieces.filter(p => p.position !== move.captured!.position);
      this.gameState.capturedPieces[move.captured.color].push(move.captured);
    }

    // Handle castling
    if (move.isCastling) {
      const [fromFile, fromRank] = this.positionToCoords(move.from);
      const [toFile] = this.positionToCoords(move.to);
      
      if (toFile === 6) { // Kingside
        const rook = this.getPieceAt(this.coordsToPosition(7, fromRank));
        if (rook) {
          rook.position = this.coordsToPosition(5, fromRank);
          rook.hasMoved = true;
        }
      } else { // Queenside
        const rook = this.getPieceAt(this.coordsToPosition(0, fromRank));
        if (rook) {
          rook.position = this.coordsToPosition(3, fromRank);
          rook.hasMoved = true;
        }
      }
    }

    // Move the piece
    const piece = this.gameState.pieces.find(p => p.position === move.from);
    if (piece) {
      piece.position = move.to;
      piece.hasMoved = true;

      // Handle promotion
      if (move.promotion) {
        piece.type = move.promotion;
      }
    }

    // Update game state
    this.gameState.moveHistory.push(move);
    this.gameState.lastMove = move;
    this.gameState.currentPlayer = this.gameState.currentPlayer === 'white' ? 'black' : 'white';
    this.gameState.selectedPiece = null;
    this.gameState.possibleMoves = [];

    // Check game status
    this.updateGameStatus();
  }

  private updateGameStatus() {
    const currentColor = this.gameState.currentPlayer;
    const king = this.findKing(currentColor);
    
    if (!king) return;

    const isInCheck = this.isKingInCheck(currentColor);
    const hasLegalMoves = this.hasAnyLegalMoves(currentColor);

    if (isInCheck && !hasLegalMoves) {
      this.gameState.status = 'checkmate';
    } else if (!isInCheck && !hasLegalMoves) {
      this.gameState.status = 'stalemate';
    } else if (isInCheck) {
      this.gameState.status = 'check';
    } else {
      this.gameState.status = 'playing';
    }
  }

  private findKing(color: PieceColor): Piece | null {
    return this.gameState.pieces.find(p => p.type === 'king' && p.color === color) || null;
  }

  isKingInCheck(color: PieceColor): boolean {
    const king = this.findKing(color);
    if (!king) return false;

    const enemyColor = color === 'white' ? 'black' : 'white';
    const enemyPieces = this.gameState.pieces.filter(p => p.color === enemyColor);

    return enemyPieces.some(piece => {
      const moves = this.getPossibleMoves(piece);
      return moves.includes(king.position);
    });
  }

  private wouldBeInCheck(piece: Piece, newPosition: Position): boolean {
    // Simulate the move
    const originalPosition = piece.position;
    const capturedPiece = this.getPieceAt(newPosition);
    
    piece.position = newPosition;
    if (capturedPiece) {
      this.gameState.pieces = this.gameState.pieces.filter(p => p !== capturedPiece);
    }

    const inCheck = this.isKingInCheck(piece.color);

    // Restore the board
    piece.position = originalPosition;
    if (capturedPiece) {
      this.gameState.pieces.push(capturedPiece);
    }

    return inCheck;
  }

  private hasAnyLegalMoves(color: PieceColor): boolean {
    const pieces = this.gameState.pieces.filter(p => p.color === color);
    return pieces.some(piece => {
      const moves = this.getPossibleMoves(piece);
      return moves.some(move => !this.wouldBeInCheck(piece, move));
    });
  }

  private isEnPassant(piece: Piece, from: Position, to: Position): boolean {
    if (piece.type !== 'pawn') return false;
    
    const [fromFile, fromRank] = this.positionToCoords(from);
    const [toFile, toRank] = this.positionToCoords(to);
    
    if (Math.abs(fromFile - toFile) === 1 && fromRank === (piece.color === 'white' ? 4 : 3)) {
      const lastMove = this.gameState.lastMove;
      if (lastMove && lastMove.piece.type === 'pawn') {
        const [lastFromFile, lastFromRank] = this.positionToCoords(lastMove.from);
        const [lastToFile, lastToRank] = this.positionToCoords(lastMove.to);
        
        return Math.abs(lastFromRank - lastToRank) === 2 && lastToFile === toFile && lastToRank === fromRank;
      }
    }
    
    return false;
  }

  selectPiece(position: Position): void {
    const piece = this.getPieceAt(position);
    if (piece && piece.color === this.gameState.currentPlayer) {
      this.gameState.selectedPiece = piece;
      this.gameState.possibleMoves = this.getPossibleMoves(piece).filter(move => !this.wouldBeInCheck(piece, move));
    } else {
      this.gameState.selectedPiece = null;
      this.gameState.possibleMoves = [];
    }
  }

  resign(): void {
    this.gameState.status = 'resigned';
  }

  newGame(): void {
    this.gameState = {
      pieces: INITIAL_POSITIONS.map(p => ({ ...p, hasMoved: false })),
      currentPlayer: 'white',
      moveHistory: [],
      status: 'playing',
      selectedPiece: null,
      possibleMoves: [],
      lastMove: null,
      capturedPieces: { white: [], black: [] },
    };
  }
}
