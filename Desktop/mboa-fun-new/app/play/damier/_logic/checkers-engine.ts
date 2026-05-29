import type { CheckersPiece, PieceColor, Position, CheckersMove, CheckersGameState } from '../_types/checkers';
import { INITIAL_POSITIONS, PIECE_SYMBOLS } from '../_types/checkers';

export class CheckersEngine {
  private gameState: CheckersGameState;

  constructor() {
    this.gameState = {
      pieces: INITIAL_POSITIONS.map(p => ({ ...p })),
      currentPlayer: 'white',
      moveHistory: [],
      status: 'playing',
      selectedPiece: null,
      possibleMoves: [],
      lastMove: null,
      capturedPieces: { white: [], black: [] },
      mustCapture: false,
    };
  }

  getGameState(): CheckersGameState {
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

  getPieceAt(position: Position): CheckersPiece | null {
    return this.gameState.pieces.find(p => p.position === position) || null;
  }

  isValidPosition(position: Position): boolean {
    const [file, rank] = this.positionToCoords(position);
    return file >= 0 && file < 8 && rank >= 0 && rank < 8;
  }

  isDarkSquare(position: Position): boolean {
    const [file, rank] = this.positionToCoords(position);
    return (file + rank) % 2 === 1;
  }

  // Get all possible moves for a piece
  getPossibleMoves(piece: CheckersPiece): CheckersMove[] {
    const moves: CheckersMove[] = [];
    const [file, rank] = this.positionToCoords(piece.position);

    // Determine move directions based on piece type and color
    const directions = piece.isKing 
      ? [[-1, -1], [-1, 1], [1, -1], [1, 1]] // Kings can move in all diagonal directions
      : piece.color === 'white' 
        ? [[-1, -1], [1, -1]] // White moves up
        : [[-1, 1], [1, 1]]; // Black moves down

    // First, check for capture moves (mandatory in checkers)
    const captureMoves = this.getCaptureMoves(piece, directions);
    if (captureMoves.length > 0) {
      return captureMoves;
    }

    // If no captures available and player doesn't have to capture, check for regular moves
    if (!this.mustCaptureForCurrentPlayer()) {
      directions.forEach(([df, dr]) => {
        const newPos = this.coordsToPosition(file + df, rank + dr);
        if (this.isValidPosition(newPos) && this.isDarkSquare(newPos) && !this.getPieceAt(newPos)) {
          moves.push({
            from: piece.position,
            to: newPos,
            piece: { ...piece },
            captured: [],
            isKingMove: piece.isKing,
          });
        }
      });
    }

    return moves;
  }

  private getCaptureMoves(piece: CheckersPiece, directions: number[][]): CheckersMove[] {
    const moves: CheckersMove[] = [];
    const [file, rank] = this.positionToCoords(piece.position);

    directions.forEach(([df, dr]) => {
      const enemyPos = this.coordsToPosition(file + df, rank + dr);
      const landingPos = this.coordsToPosition(file + 2 * df, rank + 2 * dr);

      if (this.isValidPosition(landingPos) && this.isDarkSquare(landingPos)) {
        const enemyPiece = this.getPieceAt(enemyPos);
        if (enemyPiece && enemyPiece.color !== piece.color && !this.getPieceAt(landingPos)) {
          // Check for multiple captures
          const captured = [enemyPiece];
          const multiCaptures = this.getMultiCaptures(piece, landingPos, captured, directions);
          
          if (multiCaptures.length > 0) {
            moves.push(...multiCaptures);
          } else {
            moves.push({
              from: piece.position,
              to: landingPos,
              piece: { ...piece },
              captured,
              isKingMove: piece.isKing,
            });
          }
        }
      }
    });

    return moves;
  }

  private getMultiCaptures(
    piece: CheckersPiece, 
    currentPos: Position, 
    capturedSoFar: CheckersPiece[], 
    directions: number[][]
  ): CheckersMove[] {
    const moves: CheckersMove[] = [];
    const [file, rank] = this.positionToCoords(currentPos);

    directions.forEach(([df, dr]) => {
      const enemyPos = this.coordsToPosition(file + df, rank + dr);
      const landingPos = this.coordsToPosition(file + 2 * df, rank + 2 * dr);

      if (this.isValidPosition(landingPos) && this.isDarkSquare(landingPos)) {
        const enemyPiece = this.getPieceAt(enemyPos);
        if (enemyPiece && enemyPiece.color !== piece.color && 
            !this.getPieceAt(landingPos) && 
            !capturedSoFar.includes(enemyPiece)) {
          
          const newCaptured = [...capturedSoFar, enemyPiece];
          const furtherCaptures = this.getMultiCaptures(piece, landingPos, newCaptured, directions);
          
          if (furtherCaptures.length > 0) {
            moves.push(...furtherCaptures);
          } else {
            moves.push({
              from: piece.position,
              to: landingPos,
              piece: { ...piece },
              captured: newCaptured,
              isKingMove: piece.isKing,
            });
          }
        }
      }
    });

    return moves;
  }

  private mustCaptureForCurrentPlayer(): boolean {
    const playerPieces = this.gameState.pieces.filter(p => p.color === this.gameState.currentPlayer);
    return playerPieces.some(piece => {
      const [file, rank] = this.positionToCoords(piece.position);
      const directions = piece.isKing 
        ? [[-1, -1], [-1, 1], [1, -1], [1, 1]]
        : piece.color === 'white' 
          ? [[-1, -1], [1, -1]]
          : [[-1, 1], [1, 1]];

      return this.getCaptureMoves(piece, directions).length > 0;
    });
  }

  makeMove(from: Position, to: Position): CheckersMove | null {
    const piece = this.getPieceAt(from);
    if (!piece || piece.color !== this.gameState.currentPlayer) {
      return null;
    }

    const possibleMoves = this.getPossibleMoves(piece);
    const move = possibleMoves.find(m => m.from === from && m.to === to);
    
    if (!move) {
      return null;
    }

    // Execute the move
    this.executeMove(move);

    return move;
  }

  private executeMove(move: CheckersMove) {
    // Remove captured pieces
    if (move.captured && move.captured.length > 0) {
      move.captured.forEach(captured => {
        this.gameState.pieces = this.gameState.pieces.filter(p => p.position !== captured.position);
        this.gameState.capturedPieces[captured.color].push(captured);
      });
    }

    // Move the piece
    const piece = this.gameState.pieces.find(p => p.position === move.from);
    if (piece) {
      piece.position = move.to;

      // Check for king promotion
      if (!piece.isKing) {
        const [, rank] = this.positionToCoords(move.to);
        if ((piece.color === 'white' && rank === 7) || (piece.color === 'black' && rank === 0)) {
          piece.isKing = true;
        }
      }
    }

    // Update game state
    this.gameState.moveHistory.push(move);
    this.gameState.lastMove = move;
    this.gameState.currentPlayer = this.gameState.currentPlayer === 'white' ? 'black' : 'white';
    this.gameState.selectedPiece = null;
    this.gameState.possibleMoves = [];
    this.gameState.mustCapture = this.mustCaptureForCurrentPlayer();

    // Check game status
    this.updateGameStatus();
  }

  private updateGameStatus() {
    const currentColor = this.gameState.currentPlayer;
    const playerPieces = this.gameState.pieces.filter(p => p.color === currentColor);
    
    if (playerPieces.length === 0) {
      this.gameState.status = 'won';
      return;
    }

    // Check if current player has any legal moves
    const hasLegalMoves = playerPieces.some(piece => this.getPossibleMoves(piece).length > 0);
    
    if (!hasLegalMoves) {
      this.gameState.status = 'won'; // Current player loses
    } else {
      this.gameState.status = 'playing';
    }
  }

  selectPiece(position: Position): void {
    const piece = this.getPieceAt(position);
    if (piece && piece.color === this.gameState.currentPlayer) {
      this.gameState.selectedPiece = piece;
      this.gameState.possibleMoves = this.getPossibleMoves(piece);
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
      pieces: INITIAL_POSITIONS.map(p => ({ ...p })),
      currentPlayer: 'white',
      moveHistory: [],
      status: 'playing',
      selectedPiece: null,
      possibleMoves: [],
      lastMove: null,
      capturedPieces: { white: [], black: [] },
      mustCapture: false,
    };
  }
}
