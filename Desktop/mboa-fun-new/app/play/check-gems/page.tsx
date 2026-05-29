'use client';

import { GameShell } from '@/components/layout/game-shell';
import { useGameStore } from './_logic/store';
import { isPlayable } from './_logic/rules';
import { GameTable } from './_components/game-table';
import { DeckPile } from './_components/deck-pile';
import { DiscardPile } from './_components/discard-pile';
import { PlayerHand } from './_components/player-hand';
import { OpponentHand } from './_components/opponent-hand';
import { ActionBar } from './_components/action-bar';
import { SuitPicker } from './_components/suit-picker';
import { ActiveSuitIndicator } from './_components/active-suit-indicator';
import { ResultOverlay } from './_components/result-overlay';
import type { Card } from './_types/card';

export default function CheckGemsGamePage() {
  const {
    deck,
    discard,
    playerHand,
    opponentHand,
    currentPlayer,
    activeSuit,
    status,
    pendingDraws,
    message,
    wins,
    losses,
    playCard,
    chooseSuit,
    drawCard,
    passTurn,
    startNewGame,
  } = useGameStore();

  const topCard = discard[discard.length - 1] ?? null;
  const prevCard = discard.length > 1 ? discard[discard.length - 2] : null;
  const isPlayerTurn = currentPlayer === 'player' && status === 'playing';

  const isCardPlayable = (card: Card) =>
    isPlayable(card, topCard, activeSuit, pendingDraws);

  const hasAnyPlayable = playerHand.some((c) => isCardPlayable(c));
  const canDraw = isPlayerTurn;
  const canPass = isPlayerTurn && !hasAnyPlayable && pendingDraws === 0;

  return (
    <GameShell title="Check Gems" backgroundImage="/assets/backgrounds/check-gems-bg.png" gems={500}>
      <div className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-between py-4 px-3 sm:py-6 sm:px-6 max-w-3xl mx-auto w-full">
        {/* Opponent zone */}
        <div className="w-full flex justify-center">
          <OpponentHand
            cardCount={opponentHand.length}
            isOpponentTurn={currentPlayer === 'opponent' && status === 'playing'}
            name="Mboa IA"
          />
        </div>

        {/* Center: Table with deck + discard */}
        <div className="w-full my-3 sm:my-6 flex-1 flex items-center justify-center">
          <GameTable>
            <div className="flex flex-col items-center gap-4">
              {/* Active suit indicator */}
              <ActiveSuitIndicator suit={activeSuit} />

              {/* Deck + Discard side by side */}
              <div className="flex items-center gap-6 sm:gap-10">
                <DeckPile
                  count={deck.length}
                  onClick={drawCard}
                  disabled={!canDraw}
                  highlighted={canDraw && !hasAnyPlayable}
                />

                {/* Arrow between */}
                <div className="text-mboa-gold/30 text-2xl">→</div>

                <DiscardPile topCard={topCard} prevCard={prevCard} />
              </div>

              {/* Hint text */}
              {topCard && (
                <p className="text-[10px] sm:text-xs text-mboa-text-muted/70 text-center mt-1">
                  Joue une carte de la même couleur ou même valeur
                </p>
              )}
            </div>
          </GameTable>
        </div>

        {/* Action bar */}
        <div className="w-full mb-3">
          <ActionBar
            onDraw={drawCard}
            onPass={passTurn}
            onRestart={startNewGame}
            canDraw={canDraw}
            canPass={canPass}
            pendingDraws={pendingDraws}
            message={message}
          />
        </div>

        {/* Player hand */}
        <div className="w-full">
          <PlayerHand
            cards={playerHand}
            onPlayCard={playCard}
            isPlayableCard={isCardPlayable}
            isPlayerTurn={isPlayerTurn}
          />
        </div>

        {/* Overlays */}
        <SuitPicker open={status === 'choosing-suit'} onPick={chooseSuit} />
        <ResultOverlay
          status={status === 'won' || status === 'lost' ? status : null}
          onRestart={startNewGame}
          wins={wins}
          losses={losses}
        />
      </div>
    </GameShell>
  );
}
