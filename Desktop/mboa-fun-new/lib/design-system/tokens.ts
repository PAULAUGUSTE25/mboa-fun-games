// Design Tokens - Emerald Heritage
export const tokens = {
  colors: {
    bg: '#111413',
    surface: '#1d201f',
    surfaceHigh: '#282b29',
    surfaceHighest: '#323534',
    primary: '#94d3c1',
    primaryContainer: '#004d40',
    gold: '#e9c349',
    text: '#e1e3e1',
    textMuted: '#bfc9c4',
    outline: '#3f4945',
  },
  fonts: {
    sans: 'var(--font-montserrat), system-ui, sans-serif',
  },
  spacing: {
    xs: '4px',
    sm: '8px',
    md: '16px',
    lg: '24px',
    xl: '32px',
    xxl: '48px',
  },
  borderRadius: {
    sm: '8px',
    md: '12px',
    lg: '16px',
    xl: '20px',
    xxl: '24px',
  },
  shadows: {
    emerald: '0 0 20px rgba(148, 211, 193, 0.3)',
    gold: '0 0 20px rgba(233, 195, 73, 0.3)',
    card: '0 4px 20px rgba(0, 0, 0, 0.3)',
  },
} as const;

export type Tokens = typeof tokens;
