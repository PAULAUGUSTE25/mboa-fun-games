'use client';

import { Music, VolumeX } from 'lucide-react';
import { useState } from 'react';
import { startBgm, stopBgm, isBgmEnabled } from '../_audio/sounds';

export function AudioControls() {
  const [enabled, setEnabled] = useState<boolean>(() =>
    typeof window !== 'undefined' ? isBgmEnabled() : false,
  );

  function toggle() {
    if (enabled) {
      stopBgm();
      setEnabled(false);
    } else {
      startBgm();
      setEnabled(true);
    }
  }

  return (
    <button
      onClick={toggle}
      className="empire-btn flex items-center gap-1.5"
      style={{ padding: '6px 12px', fontSize: '10px' }}
      title={enabled ? 'Couper la musique' : "Lancer l'ambiance forêt-aventure"}
    >
      {enabled ? (
        <>
          <Music className="h-3 w-3" />
          Musique
        </>
      ) : (
        <>
          <VolumeX className="h-3 w-3" />
          Silence
        </>
      )}
    </button>
  );
}
