'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { motion } from 'framer-motion';
import { mainNavigation } from '@/lib/design-system/navigation';

export function DesktopNavBar() {
  const pathname = usePathname();

  return (
    <nav className="hidden md:flex items-center gap-1">
      {mainNavigation.map((item) => {
        const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
        const Icon = item.icon;
        
        return (
          <Link key={item.href} href={item.href}>
            <motion.div
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className={`relative flex items-center gap-2 px-4 py-2 rounded-xl transition-colors ${
                isActive
                  ? 'text-mboa-primary bg-mboa-primary/10'
                  : 'text-mboa-text-muted hover:text-mboa-text hover:bg-mboa-surface-high/50'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium">{item.label}</span>
              {isActive && (
                <motion.div
                  layoutId="desktopNavIndicator"
                  className="absolute bottom-0 left-2 right-2 h-0.5 bg-mboa-primary rounded-full"
                  transition={{ type: 'spring', bounce: 0.2, duration: 0.6 }}
                />
              )}
            </motion.div>
          </Link>
        );
      })}
    </nav>
  );
}
