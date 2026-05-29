'use client';

import { motion } from 'framer-motion';
import type { ChessGameState, Piece, Position } from '../_types/chess';
import { PIECE_SYMBOLS } from '../_types/chess';

interface ChessBoardProps {
  gameState: ChessGameState;
  onSquareClick: (position: Position) => void;
  onResign: () => void;
  onNewGame: () => void;
}

export function ChessBoard({ gameState, onSquareClick, onResign, onNewGame }: ChessBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const getPieceAt = (position: Position): Piece | null => {
    return gameState.pieces.find(p => p.position === position) || null;
  };

  const isPossibleMove = (position: Position): boolean => {
    return gameState.possibleMoves.includes(position);
  };

  const isSelected = (position: Position): boolean => {
    return gameState.selectedPiece?.position === position;
  };

  const isLastMove = (position: Position): boolean => {
    return gameState.lastMove?.to === position || gameState.lastMove?.from === position;
  };

  const getSquareColor = (file: string, rank: number): 'light' | 'dark' => {
    const fileIndex = files.indexOf(file as typeof files[number]);
    return (fileIndex + rank) % 2 === 0 ? 'light' : 'dark';
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Game status and controls */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mboa-text mb-2">
            Échecs 237
          </h2>
          <div className="flex items-center gap-2 justify-center">
            <div className={`w-4 h-4 rounded-full ${gameState.currentPlayer === 'white' ? 'bg-white border-2 border-gray-800' : 'bg-gray-800 border-2 border-gray-400'}`} />
            <span className="text-mboa-text font-medium">
              {gameState.currentPlayer === 'white' ? 'Blanc' : 'Noir'} - Joueur
            </span>
          </div>
          {gameState.status === 'check' && (
            <div className="text-red-500 font-bold mt-2">Échec !</div>
          )}
          {gameState.status === 'checkmate' && (
            <div className="text-red-600 font-bold mt-2">
              Échec et mat ! {gameState.currentPlayer === 'white' ? 'Noir' : 'Blanc'} gagne !
            </div>
          )}
          {gameState.status === 'stalemate' && (
            <div className="text-yellow-600 font-bold mt-2">Pat ! Match nul.</div>
          )}
          {gameState.status === 'resigned' && (
            <div className="text-red-600 font-bold mt-2">
              Abandon ! {gameState.currentPlayer === 'white' ? 'Noir' : 'Blanc'} gagne !
            </div>
          )}
        </div>
        <div className="flex gap-2">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onNewGame}
            className="px-4 py-2 bg-mboa-primary text-white rounded-lg font-medium"
          >
            Nouvelle partie
          </motion.button>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={onResign}
            className="px-4 py-2 bg-red-500 text-white rounded-lg font-medium"
          >
            Abandonner
          </motion.button>
        </div>
      </div>

      {/* Captured pieces */}
      <div className="flex justify-between w-full max-w-2xl">
        <div className="flex gap-2">
          <span className="text-mboa-text-muted text-sm">Perdues (Noir):</span>
          <div className="flex gap-1">
            {gameState.capturedPieces.black.map((piece, i) => (
              <span key={i} className="text-2xl">
                {PIECE_SYMBOLS[piece.type][piece.color]}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-mboa-text-muted text-sm">Perdues (Blanc):</span>
          <div className="flex gap-1">
            {gameState.capturedPieces.white.map((piece, i) => (
              <span key={i} className="text-2xl">
                {PIECE_SYMBOLS[piece.type][piece.color]}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Chess board */}
      <div className="relative">
        <div className="grid grid-cols-8 gap-0 border-4 border-mboa-gold rounded-lg overflow-hidden shadow-2xl">
          {ranks.map((rank) =>
            files.map((file) => {
              const position = `${file}${rank}` as Position;
              const piece = getPieceAt(position);
              const squareColor = getSquareColor(file, rank);
              const possible = isPossibleMove(position);
              const selected = isSelected(position);
              const lastMove = isLastMove(position);

              return (
                <motion.div
                  key={position}
                  whileHover={{ scale: possible ? 1.05 : 1 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => onSquareClick(position)}
                  className={`
                    relative w-12 h-12 sm:w-16 sm:h-16 flex items-center justify-center cursor-pointer
                    ${squareColor === 'light' ? 'bg-amber-100' : 'bg-amber-700'}
                    ${selected ? 'ring-4 ring-blue-500 z-10' : ''}
                    ${lastMove ? 'ring-2 ring-yellow-400' : ''}
                  `}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: (8 - rank) * 0.05 + files.indexOf(file) * 0.05 }}
                >
                  {/* Possible move indicator */}
                  {possible && (
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      {piece ? (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-red-500 rounded-full opacity-70" />
                      ) : (
                        <div className="w-3 h-3 sm:w-4 sm:h-4 bg-green-500 rounded-full opacity-70" />
                      )}
                    </div>
                  )}

                  {/* Chess piece */}
                  {piece && (
                    <motion.div
                      className="text-3xl sm:text-4xl select-none"
                      style={{
                        filter: piece.color === 'white' ? 'drop-shadow(0 2px 2px rgba(0,0,0,0.3))' : 'drop-shadow(0 2px 2px rgba(255,255,255,0.3))',
                      }}
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      {PIECE_SYMBOLS[piece.type][piece.color]}
                    </motion.div>
                  )}

                  {/* Coordinate labels */}
                  {file === 'a' && (
                    <div className="absolute left-1 top-1 text-xs text-mboa-text-muted font-bold">
                      {rank}
                    </div>
                  )}
                  {rank === 1 && (
                    <div className="absolute right-1 bottom-1 text-xs text-mboa-text-muted font-bold">
                      {file.toUpperCase()}
                    </div>
                  )}
                </motion.div>
              );
            })
          )}
        </div>
      </div>

      {/* Move history */}
      <div className="w-full max-w-2xl">
        <h3 className="text-lg font-bold text-mboa-text mb-2">Historique des coups</h3>
        <div className="bg-mboa-surface-high rounded-lg p-3 max-h-32 overflow-y-auto">
          <div className="grid grid-cols-2 gap-2 text-sm">
            {gameState.moveHistory.map((move, i) => (
              <div key={i} className="text-mboa-text">
                <span className="font-medium">{Math.floor(i / 2) + 1}.</span>{' '}
                {i % 2 === 0 ? (
                  <span className="text-blue-400">
                    {move.piece.type[0].toUpperCase()}{move.from}→{move.to}
                    {move.promotion && `=${move.promotion[0].toUpperCase()}`}
                  </span>
                ) : (
                  <span className="text-red-400">
                    {move.piece.type[0].toUpperCase()}{move.from}→{move.to}
                    {move.promotion && `=${move.promotion[0].toUpperCase()}`}
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
