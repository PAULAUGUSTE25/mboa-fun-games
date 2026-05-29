import { ReactNode } from 'react';
import { TopAppBar } from './top-app-bar';
import { BottomNavBar } from './bottom-nav-bar';
import { DesktopNavBar } from './desktop-nav-bar';

interface PageShellProps {
  children: ReactNode;
  className?: string;
  showNav?: boolean;
  backgroundImage?: string;
  topBarProps?: {
    username?: string;
    avatarUrl?: string;
    gems?: number;
    showBackButton?: boolean;
    title?: string;
  };
}

export function PageShell({
  children,
  className = '',
  showNav = true,
  backgroundImage,
  topBarProps,
}: PageShellProps) {
  return (
    <div className="relative min-h-screen flex flex-col">
      {/* Cinematic background layer */}
      {backgroundImage && (
        <>
          <div
            className="fixed inset-0 -z-10 bg-mboa-bg"
            style={{
              backgroundImage: `url(${backgroundImage})`,
              backgroundSize: 'cover',
              backgroundPosition: 'center center',
              backgroundRepeat: 'no-repeat',
              backgroundAttachment: 'fixed',
            }}
          />
          {/* Very light overlay just for content legibility */}
          <div className="fixed inset-0 -z-10 bg-mboa-bg/25" />
          {/* Soft vignette - fade only at edges */}
          <div className="fixed inset-0 -z-10 bg-gradient-to-b from-mboa-bg/30 via-transparent to-mboa-bg/50" />
        </>
      )}

      {/* Fallback subtle pattern when no bg image */}
      {!backgroundImage && <div className="fixed inset-0 -z-10 mboa-pattern bg-mboa-bg" />}

      <TopAppBar {...topBarProps} />

      {/* Desktop nav - shown below top bar on larger screens */}
      {showNav && (
        <div className="hidden md:block border-b border-mboa-outline/20">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-3">
            <DesktopNavBar />
          </div>
        </div>
      )}

      <main className={`flex-1 mx-auto w-full max-w-7xl px-4 sm:px-6 lg:px-8 pb-24 md:pb-8 ${className}`}>
        {children}
      </main>

      {showNav && <BottomNavBar />}
    </div>
  );
}
