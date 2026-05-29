'use client';

import { motion } from 'framer-motion';
import type { CheckersGameState, CheckersPiece, Position, CheckersMove } from '../_types/checkers';
import { PIECE_SYMBOLS } from '../_types/checkers';

interface CheckersBoardProps {
  gameState: CheckersGameState;
  onSquareClick: (position: Position) => void;
  onResign: () => void;
  onNewGame: () => void;
}

export function CheckersBoard({ gameState, onSquareClick, onResign, onNewGame }: CheckersBoardProps) {
  const files = ['a', 'b', 'c', 'd', 'e', 'f', 'g', 'h'] as const;
  const ranks = [8, 7, 6, 5, 4, 3, 2, 1];

  const getPieceAt = (position: Position): CheckersPiece | null => {
    return gameState.pieces.find(p => p.position === position) || null;
  };

  const isPossibleMove = (position: Position): boolean => {
    return gameState.possibleMoves.some(move => move.to === position);
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

  const getMoveCaptures = (position: Position): CheckersPiece[] => {
    const move = gameState.possibleMoves.find(m => m.to === position);
    return move?.captured || [];
  };

  return (
    <div className="flex flex-col items-center gap-4 p-4">
      {/* Game status and controls */}
      <div className="flex items-center justify-between w-full max-w-2xl">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-mboa-text mb-2">
            Damier 237
          </h2>
          <div className="flex items-center gap-2 justify-center">
            <div className={`w-4 h-4 rounded-full ${gameState.currentPlayer === 'white' ? 'bg-white border-2 border-gray-800' : 'bg-gray-800 border-2 border-gray-400'}`} />
            <span className="text-mboa-text font-medium">
              {gameState.currentPlayer === 'white' ? 'Blanc' : 'Noir'} - Joueur
            </span>
          </div>
          {gameState.mustCapture && (
            <div className="text-orange-500 font-bold mt-2">Prise obligatoire !</div>
          )}
          {gameState.status === 'won' && (
            <div className="text-green-600 font-bold mt-2">
              Victoire ! {gameState.currentPlayer === 'white' ? 'Noir' : 'Blanc'} gagne !
            </div>
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
          <span className="text-mboa-text-muted text-sm">Prises (Noir):</span>
          <div className="flex gap-1">
            {gameState.capturedPieces.black.map((piece, i) => (
              <span key={i} className="text-2xl">
                {PIECE_SYMBOLS[piece.color][piece.isKing ? 'king' : 'normal']}
              </span>
            ))}
          </div>
        </div>
        <div className="flex gap-2">
          <span className="text-mboa-text-muted text-sm">Prises (Blanc):</span>
          <div className="flex gap-1">
            {gameState.capturedPieces.white.map((piece, i) => (
              <span key={i} className="text-2xl">
                {PIECE_SYMBOLS[piece.color][piece.isKing ? 'king' : 'normal']}
              </span>
            ))}
          </div>
        </div>
      </div>

      {/* Checkers board */}
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
              const captures = getMoveCaptures(position);

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

                  {/* Captured pieces indicator */}
                  {captures.length > 0 && (
                    <div className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                      {captures.length}
                    </div>
                  )}

                  {/* Checkers piece */}
                  {piece && (
                    <motion.div
                      className="relative flex items-center justify-center"
                      initial={{ y: -20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ type: 'spring', stiffness: 300, damping: 25 }}
                    >
                      {/* Piece shadow */}
                      <div className="absolute inset-0 bg-black/20 rounded-full blur-sm" />
                      
                      {/* Piece body */}
                      <div
                        className={`
                          relative w-10 h-10 sm:w-12 sm:h-12 rounded-full border-2 flex items-center justify-center
                          ${piece.color === 'white' 
                            ? 'bg-white border-gray-800 shadow-lg' 
                            : 'bg-gray-800 border-gray-600 shadow-xl'
                          }
                        `}
                      >
                        {/* Inner circle for depth */}
                        <div
                          className={`
                            w-8 h-8 sm:w-10 sm:h-10 rounded-full
                            ${piece.color === 'white' 
                              ? 'bg-gray-100' 
                              : 'bg-gray-900'
                            }
                          `}
                        />
                        
                        {/* King crown */}
                        {piece.isKing && (
                          <motion.div
                            className="absolute text-lg sm:text-xl"
                            animate={{ rotateY: [0, 360] }}
                            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                          >
                            {piece.color === 'white' ? '👑' : '🎯'}
                          </motion.div>
                        )}
                      </div>
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
                    {move.from}→{move.to}
                    {move.captured?.length && move.captured.length > 0 && `×${move.captured.length}`}
                    {move.piece.isKing && '👑'}
                  </span>
                ) : (
                  <span className="text-red-400">
                    {move.from}→{move.to}
                    {move.captured?.length && move.captured.length > 0 && `×${move.captured.length}`}
                    {move.piece.isKing && '👑'}
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
