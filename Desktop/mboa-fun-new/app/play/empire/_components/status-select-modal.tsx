'use client';

import { STATUSES } from '../_data/statuses';
import type { StatusKey } from '../_types/empire';
import { playClick } from '../_audio/sounds';

interface StatusSelectModalProps {
  playerName: string;
  takenStatuses: StatusKey[];
  onSelect: (key: StatusKey) => void;
}

export function StatusSelectModal({
  playerName,
  takenStatuses,
  onSelect,
}: StatusSelectModalProps) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/85 backdrop-blur-sm overflow-auto">
      <div
        className="empire-panel w-full max-w-lg p-5 sm:p-6"
        style={{
          background:
            'linear-gradient(180deg, rgba(28,19,8,0.97) 0%, rgba(13,6,1,0.99) 100%)',
        }}
      >
        <div className="text-center mb-5">
          <p className="empire-accent text-[10px] sm:text-xs uppercase tracking-[0.3em] mb-1">
            {playerName} — choisis ton statut
          </p>
          <h2
            className="text-xl sm:text-2xl font-bold"
            style={{ color: '#F4CE96' }}
          >
            Quel sera ton rôle dans le Mboa ?
          </h2>
        </div>

        <ul className="space-y-2.5">
          {STATUSES.map((s, i) => {
            const taken = takenStatuses.includes(s.key);
            return (
              <li key={s.key}>
                <button
                  disabled={taken}
                  onClick={() => {
                    playClick();
                    onSelect(s.key);
                  }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-left transition disabled:opacity-40 disabled:cursor-not-allowed hover:bg-[#4F2F17]/60 focus:outline-none focus:ring-2 focus:ring-[#F4CE96]"
                  style={{
                    background: taken
                      ? 'rgba(13,6,1,0.6)'
                      : 'rgba(79,47,23,0.4)',
                    border: '1px solid #B18A62',
                  }}
                >
                  <span
                    className="flex items-center justify-center font-bold text-sm shrink-0"
                    style={{
                      width: 32,
                      height: 32,
                      borderRadius: '50%',
                      background:
                        'radial-gradient(circle, #F4CE96 0%, #B18A62 100%)',
                      color: '#1C1308',
                      boxShadow: '0 2px 6px rgba(0,0,0,0.5)',
                    }}
                  >
                    {i + 1}
                  </span>

                  <span className="text-2xl shrink-0">{s.emoji}</span>

                  <span className="flex-1 min-w-0">
                    <span
                      className="block font-bold text-sm sm:text-base"
                      style={{ color: '#F4CE96' }}
                    >
                      {s.label}
                    </span>
                    <span
                      className="block text-[11px] italic truncate"
                      style={{ color: '#CEA271' }}
                    >
                      {s.tagline}
                    </span>
                  </span>

                  {taken && (
                    <span
                      className="text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded shrink-0"
                      style={{
                        color: '#fca5a5',
                        background: 'rgba(0,0,0,0.6)',
                        border: '1px solid #90271B',
                      }}
                    >
                      Pris
                    </span>
                  )}
                </button>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
