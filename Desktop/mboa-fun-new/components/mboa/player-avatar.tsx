'use client';

import { User, Crown } from 'lucide-react';

interface PlayerAvatarProps {
  username: string;
  avatarUrl?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  isOnline?: boolean;
  isHost?: boolean;
  showStatus?: boolean;
}

export function PlayerAvatar({
  username,
  avatarUrl,
  size = 'md',
  isOnline = true,
  isHost = false,
  showStatus = true,
}: PlayerAvatarProps) {
  const sizeClasses = {
    sm: 'h-8 w-8',
    md: 'h-10 w-10',
    lg: 'h-14 w-14',
    xl: 'h-20 w-20',
  };

  const iconSizes = {
    sm: 'h-4 w-4',
    md: 'h-5 w-5',
    lg: 'h-7 w-7',
    xl: 'h-10 w-10',
  };

  const statusSizes = {
    sm: 'h-2 w-2',
    md: 'h-2.5 w-2.5',
    lg: 'h-3 w-3',
    xl: 'h-4 w-4',
  };

  const crownSizes = {
    sm: 'h-3 w-3 -top-1 -right-1',
    md: 'h-3.5 w-3.5 -top-1 -right-1',
    lg: 'h-4 w-4 -top-1.5 -right-1.5',
    xl: 'h-5 w-5 -top-2 -right-2',
  };

  return (
    <div className="relative inline-flex flex-col items-center gap-1">
      <div className={`relative ${sizeClasses[size]} rounded-full overflow-hidden bg-gradient-to-br from-mboa-primary-container to-mboa-surface-high border-2 ${isOnline ? 'border-mboa-primary' : 'border-mboa-outline'}`}>
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={username}
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="h-full w-full flex items-center justify-center">
            <User className={`${iconSizes[size]} text-mboa-primary`} />
          </div>
        )}
        
        {/* Host crown */}
        {isHost && (
          <div className={`absolute ${crownSizes[size]} bg-mboa-gold rounded-full flex items-center justify-center border border-mboa-surface`}>
            <Crown className="h-2/3 w-2/3 text-mboa-surface" />
          </div>
        )}
      </div>

      {/* Online status indicator */}
      {showStatus && (
        <span className={`absolute bottom-0 right-0 ${statusSizes[size]} rounded-full border-2 border-mboa-surface ${isOnline ? 'bg-green-500' : 'bg-mboa-text-muted'}`} />
      )}

      {/* Username (only for larger sizes) */}
      {size !== 'sm' && (
        <span className="text-xs text-mboa-text-muted truncate max-w-[80px]">{username}</span>
      )}
    </div>
  );
}
