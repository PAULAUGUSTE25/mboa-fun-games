'use client';

export interface ActionModalAction {
  label: string;
  variant?: 'primary' | 'secondary' | 'danger';
  onClick: () => void;
  disabled?: boolean;
}

interface ActionModalProps {
  title: string;
  /** Small uppercase eyebrow above the title */
  eyebrow?: string;
  children: React.ReactNode;
  actions: ActionModalAction[];
  /**
   * Force how the action buttons are laid out.
   * - 'row'   : horizontal on sm+ (default for ≤2 actions)
   * - 'stack' : always vertical, full-width, numbered (default for ≥3 actions)
   */
  actionsLayout?: 'row' | 'stack';
  /** Maximum modal width. Default 'md'. Use 'lg' for long quiz answers. */
  size?: 'md' | 'lg';
}

const variantClass: Record<NonNullable<ActionModalAction['variant']>, string> = {
  primary: 'empire-btn',
  secondary:
    'rounded-md border border-[#B18A62] text-[#F4CE96] px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#4F2F17]/50 transition',
  danger:
    'rounded-md border border-[#90271B] text-[#F4CE96] bg-[#90271B]/40 px-3 py-2 text-xs font-semibold uppercase tracking-wider hover:bg-[#90271B]/70 transition',
};

export function ActionModal({
  title,
  eyebrow,
  children,
  actions,
  actionsLayout,
  size = 'md',
}: ActionModalProps) {
  // Auto-pick a stacked, full-width, numbered layout when there are 3+ actions
  // (typically quiz answers) or when the caller forces it.
  const stack = actionsLayout === 'stack' || (actionsLayout !== 'row' && actions.length >= 3);
  const widthClass = size === 'lg' ? 'max-w-lg' : 'max-w-md';

  return (
    <div className="fixed inset-0 z-[90] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
      <div
        key={title}
        className={`empire-panel ${widthClass} w-full p-4 sm:p-5 max-h-[92vh] overflow-y-auto`}
        style={{
          background:
            'linear-gradient(180deg, rgba(28,19,8,0.96) 0%, rgba(13,6,1,0.98) 100%)',
        }}
      >
        {eyebrow && (
          <p
            className="empire-accent text-[10px] uppercase tracking-[0.3em] text-center mb-1"
          >
            {eyebrow}
          </p>
        )}
        <h2
          className="empire-title text-base sm:text-lg font-bold text-center mb-3 leading-snug"
          style={{ color: '#F4CE96' }}
        >
          {title}
        </h2>

        <div
          className="text-sm leading-relaxed mb-4 text-center"
          style={{ color: '#E5C788', whiteSpace: 'pre-line' }}
        >
          {children}
        </div>

        {stack ? (
          // Stacked numbered list — every option fits on its own row, wraps freely.
          <div className="flex flex-col gap-2">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                disabled={a.disabled}
                className="group flex items-start gap-3 w-full text-left rounded-md border border-[#B18A62] bg-[#2a1808]/60 hover:bg-[#4F2F17]/70 transition px-3 py-2.5 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <span
                  className="flex-shrink-0 w-7 h-7 rounded-full border border-[#B18A62] bg-[#4F2F17]/70 group-hover:bg-[#B18A62]/40 flex items-center justify-center text-[11px] font-bold"
                  style={{ color: '#F4CE96' }}
                >
                  {i + 1}
                </span>
                <span
                  className="text-sm leading-snug whitespace-normal break-words"
                  style={{ color: '#F4CE96' }}
                >
                  {a.label}
                </span>
              </button>
            ))}
          </div>
        ) : (
          <div className="flex flex-col sm:flex-row justify-center gap-2 flex-wrap">
            {actions.map((a, i) => (
              <button
                key={i}
                onClick={a.onClick}
                disabled={a.disabled}
                className={`${variantClass[a.variant ?? 'primary']} disabled:opacity-50 disabled:cursor-not-allowed`}
                style={a.variant === 'primary' ? { padding: '10px 22px', fontSize: '12px', minWidth: '140px' } : undefined}
              >
                {a.label}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
