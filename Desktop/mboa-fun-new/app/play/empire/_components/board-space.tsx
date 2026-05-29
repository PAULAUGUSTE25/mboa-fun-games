'use client';

import { motion } from 'framer-motion';
import { Star, Lock, ParkingSquare, Siren, HelpCircle, DollarSign } from 'lucide-react';
import type { BoardSpace as Space, Player } from '../_types/empire';
import { DISTRICT_COLORS } from '../_types/empire';
import { getSpaceSide } from '../_logic/board';
import { PlayerToken } from './player-token';

interface BoardSpaceProps {
  space: Space;
  players: Player[];
  ownerColor?: string;
  highlighted?: boolean;
  onClick?: () => void;
}

const CORNER_ICONS = {
  start: Star,
  jail: Lock,
  parking: ParkingSquare,
  'go-to-jail': Siren,
};

export function BoardSpace({ space, players, ownerColor, highlighted, onClick }: BoardSpaceProps) {
  const side = getSpaceSide(space.position);
  const isCorner = side === 'corner';

  // Rotation so the colored stripe always faces the inside of the board
  const rotation = {
    bottom: 0,
    left: 90,
    top: 180,
    right: 270,
    corner: 0,
  }[side];

  return (
    <motion.div
      whileHover={onClick ? { scale: 1.04, zIndex: 30 } : undefined}
      onClick={onClick}
      className={`relative w-full h-full overflow-hidden ${onClick ? 'cursor-pointer' : ''}`}
      style={{
        background: isCorner
          ? 'linear-gradient(135deg, #2a1810 0%, #1C1308 50%, #0d0703 100%)'
          : 'linear-gradient(160deg, #B18A62 0%, #8c6840 30%, #684A29 65%, #4F2F17 100%)',
        boxShadow: highlighted
          ? '0 0 0 2px #F4CE96, 0 0 18px rgba(206, 162, 113, 0.65), inset 0 1px 0 rgba(244,206,150,0.4), inset 0 -1px 0 rgba(0,0,0,0.5)'
          : 'inset 0 1px 0 rgba(244,206,150,0.25), inset 0 -1px 0 rgba(0,0,0,0.6), inset 1px 0 0 rgba(0,0,0,0.3), inset -1px 0 0 rgba(0,0,0,0.3)',
      }}
    >
      {/* Wood grain texture per cell */}
      <div
        className="absolute inset-0 pointer-events-none opacity-35"
        style={{
          backgroundImage: isCorner
            ? 'repeating-linear-gradient(90deg, transparent 0 3px, rgba(177,138,98,0.08) 3px 4px), repeating-linear-gradient(0deg, transparent 0 7px, rgba(0,0,0,0.18) 7px 8px)'
            : 'repeating-linear-gradient(92deg, transparent 0 4px, rgba(0,0,0,0.15) 4px 5px), repeating-linear-gradient(0deg, transparent 0 9px, rgba(244,206,150,0.06) 9px 10px)',
        }}
      />
      <div
        className="absolute inset-0 flex flex-col items-stretch"
        style={{ transform: `rotate(${rotation}deg)` }}
      >
        {isCorner ? (
          <CornerContent space={space} />
        ) : (
          <SpaceContent space={space} ownerColor={ownerColor} />
        )}
      </div>

      {/* Players on this space */}
      {players.length > 0 && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="flex flex-wrap items-center justify-center gap-0.5 max-w-full">
            {players.map((p, i) => (
              <PlayerToken
                key={p.id}
                player={p}
                size="xs"
                style={{
                  transform: `translate(${(i - (players.length - 1) / 2) * 6}px, 0)`,
                }}
              />
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}

function CornerContent({ space }: { space: Space }) {
  const Icon = CORNER_ICONS[space.type as keyof typeof CORNER_ICONS] ?? HelpCircle;
  const iconColor =
    space.type === 'go-to-jail' ? '#90271B' :     // Deep red
    space.type === 'start' ? '#F4CE96' :          // Ivory gold
    space.type === 'jail' ? '#CEA271' :           // Soft gold
    '#B18A62';                                    // Antique gold (parking)

  return (
    <div className="flex flex-col items-center justify-center h-full p-1 gap-1">
      <Icon
        className="h-5 w-5 sm:h-6 sm:w-6"
        style={{
          color: iconColor,
          filter:
            'drop-shadow(0 1px 1px rgba(0,0,0,0.8)) drop-shadow(0 0 4px rgba(0,0,0,0.6))',
        }}
      />
      <span
        className="text-[7px] sm:text-[9px] font-bold text-center leading-tight uppercase tracking-[0.15em]"
        style={{
          color: '#CEA271',
          textShadow:
            '0 1px 0 rgba(0, 0, 0, 0.85), 0 -1px 0 rgba(244, 206, 150, 0.15)',
        }}
      >
        {space.name}
      </span>
    </div>
  );
}

// Engraved-look text style (dark inscription carved into wood)
const engravedStyle = {
  color: '#1C1308',
  textShadow:
    '0 1px 0 rgba(244, 206, 150, 0.5), 0 -1px 0 rgba(0, 0, 0, 0.5)',
};

const engravedPrice = {
  color: '#4F2F17',
  textShadow:
    '0 1px 0 rgba(244, 206, 150, 0.55), 0 -1px 0 rgba(0, 0, 0, 0.35)',
};

function SpaceContent({ space, ownerColor }: { space: Space; ownerColor?: string }) {
  if (space.type === 'property' && space.district) {
    const colors = DISTRICT_COLORS[space.district];
    return (
      <>
        {/* Color stripe at the top (faces center of board) - gem-like with shine */}
        <div
          className="h-2.5 sm:h-3.5 w-full border-b-2 border-black/70 relative overflow-hidden"
          style={{
            background: `linear-gradient(180deg, ${colors.bg} 0%, ${colors.border} 100%)`,
            boxShadow:
              'inset 0 1px 2px rgba(255,255,255,0.4), inset 0 -1px 2px rgba(0,0,0,0.6)',
          }}
        >
          {ownerColor && (
            <div
              className="absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-black/80"
              style={{
                background: `radial-gradient(circle at 35% 30%, ${ownerColor}, ${ownerColor}aa)`,
                boxShadow: '0 1px 2px rgba(0,0,0,0.6)',
              }}
            />
          )}
        </div>
        <div className="relative flex-1 flex flex-col items-center justify-between p-0.5 sm:p-1">
          <span
            className="text-[7px] sm:text-[9px] font-bold text-center leading-tight uppercase tracking-wide"
            style={engravedStyle}
          >
            {space.name}
          </span>
          <span
            className="text-[7px] sm:text-[9px] font-bold"
            style={engravedPrice}
          >
            ${space.price}
          </span>
        </div>
      </>
    );
  }

  if (space.type === 'chance') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-1 gap-1">
        <HelpCircle
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          style={{ color: '#1B0D05', filter: 'drop-shadow(0 1px 0 rgba(255,220,150,0.4))' }}
        />
        <span
          className="text-[6px] sm:text-[8px] font-bold text-center leading-tight uppercase tracking-wider"
          style={engravedStyle}
        >
          Mboa
        </span>
      </div>
    );
  }

  if (space.type === 'tax') {
    return (
      <div className="flex flex-col items-center justify-center h-full p-1 gap-1">
        <DollarSign
          className="h-3.5 w-3.5 sm:h-4 sm:w-4"
          style={{ color: '#1B0D05', filter: 'drop-shadow(0 1px 0 rgba(255,220,150,0.4))' }}
        />
        <span
          className="text-[6px] sm:text-[8px] font-bold text-center leading-tight uppercase tracking-wider"
          style={engravedStyle}
        >
          Taxe
        </span>
        <span
          className="text-[7px] sm:text-[8px] font-bold"
          style={engravedPrice}
        >
          ${space.tax}
        </span>
      </div>
    );
  }

  return null;
}
