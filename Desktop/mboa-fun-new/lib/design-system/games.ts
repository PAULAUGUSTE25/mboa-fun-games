export interface Game {
  slug: string;
  name: string;
  description: string;
  players: string;
  image: string;
  featured?: boolean;
  color?: string;
}

export const games: Game[] = [
  {
    slug: 'empire',
    name: 'Mboa Empire',
    description: 'Construis ton empire, achète les coins chauds et deviens le boss du Mboa.',
    players: '2-6',
    image: '/assets/backgrounds/empire-bg.png',
    featured: true,
    color: '#94d3c1',
  },
  {
    slug: 'ludo',
    name: 'Ludo 237',
    description: 'Le classique du quartier, version digitale.',
    players: '2-4',
    image: '/assets/backgrounds/ludo-bg.png',
    color: '#e9c349',
  },
  {
    slug: 'check-gems',
    name: 'Check Gems',
    description: 'Jeu de cartes rapide inspiré du huit américain, version Mboa.',
    players: '2-6',
    image: '/assets/backgrounds/check-gems-bg.png',
    color: '#ff6b6b',
  },
  {
    slug: 'damier',
    name: 'Damier Mboa',
    description: 'Duel tactique sous ambiance village et baobab.',
    players: '2',
    image: '/assets/backgrounds/damier-bg.png',
    color: '#4ecdc4',
  },
  {
    slug: 'echecs',
    name: 'Échecs 237',
    description: 'Stratégie premium inspirée des palais traditionnels.',
    players: '2',
    image: '/assets/backgrounds/echecs-bg.png',
    color: '#c9b037',
  },
];

export const getGameBySlug = (slug: string): Game | undefined => {
  return games.find((game) => game.slug === slug);
};

export const getFeaturedGame = (): Game | undefined => {
  return games.find((game) => game.featured);
};
