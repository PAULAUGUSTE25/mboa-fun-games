'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { GameShell } from '@/components/layout/game-shell';
import { CheckersBoard } from './_components/checkers-board';
import { CheckersEngine } from './_logic/checkers-engine';
import type { CheckersMove, Position } from './_types/checkers';

export default function DamierGamePage() {
  const [engine] = useState(() => new CheckersEngine());
  const [gameState, setGameState] = useState(engine.getGameState());

  useEffect(() => {
    setGameState(engine.getGameState());
  }, [engine]);

  const handleSquareClick = (position: Position) => {
    if (gameState.status === 'won' || gameState.status === 'resigned') {
      return;
    }

    const piece = engine.getPieceAt(position);
    
    if (gameState.selectedPiece) {
      // Try to make a move
      const move = engine.makeMove(gameState.selectedPiece.position, position);
      if (move) {
        setGameState(engine.getGameState());
      } else if (piece && piece.color === gameState.currentPlayer) {
        // Select a different piece
        engine.selectPiece(position);
        setGameState(engine.getGameState());
      } else {
        // Deselect
        engine.selectPiece(position);
        setGameState(engine.getGameState());
      }
    } else if (piece && piece.color === gameState.currentPlayer) {
      // Select piece
      engine.selectPiece(position);
      setGameState(engine.getGameState());
    }
  };

  const handleResign = () => {
    engine.resign();
    setGameState(engine.getGameState());
  };

  const handleNewGame = () => {
    engine.newGame();
    setGameState(engine.getGameState());
  };

  return (
    <GameShell
      title="Damier Mboa"
      backgroundImage="/assets/backgrounds/damier-bg.png"
      gems={500}
    >
      <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center py-4">
        <CheckersBoard
          gameState={gameState}
          onSquareClick={handleSquareClick}
          onResign={handleResign}
          onNewGame={handleNewGame}
        />
      </div>
    </GameShell>
  );
}
