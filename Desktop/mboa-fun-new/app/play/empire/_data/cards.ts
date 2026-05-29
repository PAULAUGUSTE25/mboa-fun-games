/**
 * Minimal Chance & Caisse Commune decks.
 * Each card has an `apply` description; full effect logic is handled by the
 * game engine via the `effect` discriminated union.
 */

export type CardEffect =
  | { kind: 'gain'; amount: number }
  | { kind: 'pay'; amount: number }
  | { kind: 'goto'; cellIndex: number }
  | { kind: 'skip-turn' }
  | { kind: 'all-pay-me'; amount: number } // every other player pays me
  | { kind: 'all-gain'; amount: number }   // everyone (including me) gains
  | { kind: 'play-again' }
  | { kind: 'gain-if-status'; status: import('../_types/empire').StatusKey; amount: number };

export interface CardDef {
  text: string;
  effect: CardEffect;
}

export const CHANCE_DECK: CardDef[] = [
  { text: 'Tu gagnes un marché public.',                    effect: { kind: 'gain', amount: 200 } },
  { text: 'Contrôle fiscal surprise.',                      effect: { kind: 'pay',  amount: 150 } },
  { text: 'Ton business buzz sur les réseaux.',             effect: { kind: 'gain', amount: 150 } },
  { text: 'Mauvais investissement.',                        effect: { kind: 'pay',  amount: 100 } },
  { text: 'Invitation au Palais Royal.',                    effect: { kind: 'goto', cellIndex: 7 } },
  { text: "Bourse d'études (si Étudiant).",                 effect: { kind: 'gain-if-status', status: 'etudiant', amount: 150 } },
  { text: 'Fête nationale ! Tous les joueurs reçoivent 50.', effect: { kind: 'all-gain', amount: 50 } },
  { text: 'Panne de voiture.',                              effect: { kind: 'pay',  amount: 60 } },
  { text: 'Opportunité en or — rejoue.',                    effect: { kind: 'play-again' } },
  { text: 'Embouteillage terrible — recule à la Place des Fêtes.', effect: { kind: 'goto', cellIndex: 2 } },
];

export const CAISSE_COMMUNE_DECK: CardDef[] = [
  { text: 'Contribution familiale.',                        effect: { kind: 'pay',  amount: 50 } },
  { text: 'Tontine réussie !',                              effect: { kind: 'gain', amount: 150 } },
  { text: 'Réunion du quartier.',                           effect: { kind: 'pay',  amount: 30 } },
  { text: "On t'aide à lancer ton business.",               effect: { kind: 'gain', amount: 100 } },
  { text: 'Tu participes à un deuil au village.',           effect: { kind: 'pay',  amount: 70 } },
  { text: 'Une association te récompense.',                 effect: { kind: 'gain', amount: 120 } },
  { text: 'Tu dois aider un cousin.',                       effect: { kind: 'pay',  amount: 40 } },
  { text: 'Projet communautaire — chaque joueur te paie 20.', effect: { kind: 'all-pay-me', amount: 20 } },
  { text: 'Tu gagnes une grande tontine !',                 effect: { kind: 'gain', amount: 200 } },
  { text: 'Retard administratif — passe ton prochain tour.', effect: { kind: 'skip-turn' } },
  { text: "Appel du village — retourne à la case Départ.",  effect: { kind: 'goto', cellIndex: 0 } },
];

/** Picks a random card from a deck. */
export function drawCard(deck: CardDef[]): CardDef {
  return deck[Math.floor(Math.random() * deck.length)];
}
