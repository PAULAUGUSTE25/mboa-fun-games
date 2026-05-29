import { Home, Gamepad2, Store, Users, User } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
}

export const mainNavigation: NavItem[] = [
  { label: 'Accueil', href: '/dashboard', icon: Home },
  { label: 'Lobby', href: '/lobby', icon: Gamepad2 },
  { label: 'Store', href: '/store', icon: Store },
  { label: 'Clan', href: '/clan', icon: Users },
  { label: 'Profil', href: '/profile', icon: User },
];

export const gameRoutes = [
  '/play/empire',
  '/play/ludo',
  '/play/check-gems',
  '/play/damier',
  '/play/echecs',
];

export const isGameRoute = (pathname: string): boolean => {
  return gameRoutes.some((route) => pathname.startsWith(route));
};
