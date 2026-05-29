'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { mainNavigation } from '@/lib/design-system/navigation';
import { isGameRoute } from '@/lib/design-system/navigation';

export function BottomNavBar() {
  const pathname = usePathname();
  
  // Hide on game routes
  if (isGameRoute(pathname)) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="glass-panel border-t border-mboa-outline/30 px-2 pb-safe">
        <div className="mx-auto max-w-md">
          <div className="flex h-16 items-center justify-around">
            {mainNavigation.map((item) => {
              const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
              const Icon = item.icon;
              
              return (
                <Link key={item.href} href={item.href} className="relative">
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className={`flex flex-col items-center gap-1 px-3 py-2 rounded-xl transition-colors ${
                      isActive
                        ? 'text-mboa-primary'
                        : 'text-mboa-text-muted hover:text-mboa-text'
                    }`}
                  >
                    <div className="relative">
                      <Icon className="h-5 w-5" />
                      {isActive && (
                        <motion.div
                          layoutId="bottomNavIndicator"
                          className="absolute -inset-2 rounded-full bg-mboa-primary/10 -z-10"
                          transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                        />
                      )}
                    </div>
                    <span className="text-[10px] font-medium">{item.label}</span>
                  </motion.div>
                </Link>
              );
            })}
          </div>
        </div>
      </div>
    </nav>
  );
}
