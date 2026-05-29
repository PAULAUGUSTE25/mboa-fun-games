import type { StatusKey } from '../_types/empire';

export interface StatusDef {
  key: StatusKey;
  label: string;
  emoji: string;
  /** One-line tagline shown in the selection modal */
  tagline: string;
  /** Bullet list of benefits */
  benefits: string[];
}

export const STATUSES: StatusDef[] = [
  {
    key: 'etudiant',
    label: 'Étudiant',
    emoji: '🎓',
    tagline: "Le savoir avant tout — bourses & avantages éducatifs",
    benefits: [
      'Cité U : reçois 100 gemmes (au lieu de payer)',
      'École des Leaders : formation à 50 gemmes au lieu de 100',
      'Quartier Résidentiel : achat à 100 au lieu de 120',
    ],
  },
  {
    key: 'administrateur',
    label: 'Administrateur',
    emoji: '🏛️',
    tagline: 'Maître des dossiers et des tampons',
    benefits: [
      'Quartier Administratif : reçois 100 gemmes',
      'Résidence Administrative : tu ne paies pas',
      'Les autres joueurs te paient 60 gemmes au QA',
    ],
  },
  {
    key: 'commercant',
    label: 'Commerçant',
    emoji: '🛒',
    tagline: 'Roi du marché et du business',
    benefits: [
      'Marché & Centre Commercial : −50 gemmes à l\'achat',
      'Marché + Centre Commercial : loyers boostés',
      'Caisse Commune : événements positifs renforcés',
    ],
  },
  {
    key: 'sportif',
    label: 'Sportif',
    emoji: '⚽',
    tagline: 'Lions Indomptables dans le sang',
    benefits: [
      'Stade : 200 gemmes au lieu de 150 sur bonne réponse',
      'Bonus sur les questions Lions Indomptables',
    ],
  },
  {
    key: 'transporteur',
    label: 'Transporteur',
    emoji: '🚌',
    tagline: 'Maître des routes, ports et aéroports',
    benefits: [
      'Avance gratuitement vers la prochaine case transport',
      'Gare Routière : reçois 80 gemmes au lieu de payer',
      'Port Autonome : 100 gemmes ou téléportation',
    ],
  },
  {
    key: 'artisan',
    label: 'Artisan / Créatif',
    emoji: '🎨',
    tagline: 'L\'âme culturelle du Mboa',
    benefits: [
      'Village Artisanal : reçois 80 gemmes',
      'Place des Fêtes : événements positifs renforcés',
      'Palais Royal : avantages culturels',
    ],
  },
];

export const STATUS_BY_KEY: Record<StatusKey, StatusDef> = STATUSES.reduce(
  (acc, s) => ({ ...acc, [s.key]: s }),
  {} as Record<StatusKey, StatusDef>,
);
