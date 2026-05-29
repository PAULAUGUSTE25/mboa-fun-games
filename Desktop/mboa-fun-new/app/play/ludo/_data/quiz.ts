/**
 * Questions difficiles sur l'histoire, la géographie et la culture du Cameroun.
 * Utilisées :
 *   1. Quand un pion est capturé → la victime peut le libérer
 *   2. Quand un joueur est bloqué 3 tours d'affilée → carte joker
 */

export interface LudoQuiz {
  q: string;
  options: string[];
  /** Index (0-based) de la bonne réponse dans `options`. */
  answer: number;
  /** Anecdote/explication affichée après la réponse. */
  explain?: string;
}

export const LUDO_HARD_QUIZ: LudoQuiz[] = [
  {
    q: "En quelle année le Cameroun français a-t-il obtenu son indépendance ?",
    options: ['1958', '1960', '1961', '1972'],
    answer: 1,
    explain: "Le Cameroun français accède à l'indépendance le 1ᵉʳ janvier 1960.",
  },
  {
    q: "Qui fut le tout premier président du Cameroun indépendant ?",
    options: ['Paul Biya', 'Ahmadou Ahidjo', 'Ruben Um Nyobè', 'André-Marie Mbida'],
    answer: 1,
    explain: "Ahmadou Ahidjo a été président de 1960 à 1982.",
  },
  {
    q: "Le Mont Cameroun culmine à environ…",
    options: ['2 800 m', '3 250 m', '4 095 m', '5 199 m'],
    answer: 2,
    explain: "Le Mont Cameroun est le plus haut sommet d'Afrique de l'Ouest, à 4 095 m.",
  },
  {
    q: "Quel fleuve traverse Douala et se jette dans l'Atlantique ?",
    options: ['Sanaga', 'Wouri', 'Logone', 'Nyong'],
    answer: 1,
  },
  {
    q: "Combien de régions administratives compte le Cameroun depuis 2008 ?",
    options: ['8', '10', '12', '14'],
    answer: 1,
  },
  {
    q: "Quel ancien nom les Allemands donnaient-ils à Douala ?",
    options: ['Kamerunstadt', 'Bell-Town', 'Buea', 'Edéa'],
    answer: 0,
    explain: "Les Allemands l'appelaient « Kamerunstadt » — la ville du Cameroun.",
  },
  {
    q: "Qui est le leader UPC assassiné dans le maquis bassa en 1958 ?",
    options: ['Félix Moumié', 'Ruben Um Nyobè', 'Ernest Ouandié', 'Osendé Afana'],
    answer: 1,
    explain: "Ruben Um Nyobè, « Mpodol », tué le 13 septembre 1958.",
  },
  {
    q: "Quel sultan bamoun a inventé une écriture africaine au XIXᵉ siècle ?",
    options: ['Njoya', 'Mbouombouo', 'Kamga II', 'Ibrahim Mbombo Njoya'],
    answer: 0,
    explain: "Le sultan Ibrahim Njoya a créé l'alphabet Shü-mom et le palais de Foumban.",
  },
  {
    q: "Quelle ethnie peuple historiquement l'Adamaoua et le Nord ?",
    options: ['Bamiléké', 'Foulbé', 'Sawa', 'Béti'],
    answer: 1,
  },
  {
    q: "En quelle année les deux Cameroun (anglais et français) se sont-ils réunifiés ?",
    options: ['1960', '1961', '1972', '1984'],
    answer: 1,
    explain: "Réunification le 1ᵉʳ octobre 1961.",
  },
  {
    q: "Quel stade de Yaoundé a accueilli la finale de la CAN 2022 ?",
    options: ['Ahmadou-Ahidjo', 'Olembé (Paul Biya)', 'Mfandena', 'Japoma'],
    answer: 1,
    explain: "Stade Paul Biya d'Olembé, 60 000 places.",
  },
  {
    q: "Qui a marqué le 1ᵉʳ but du Cameroun en Coupe du Monde 1990 ?",
    options: ['Roger Milla', 'Omam-Biyik', 'Patrick Mboma', 'Thomas N\u2019Kono'],
    answer: 1,
    explain: "François Omam-Biyik a inscrit le but contre l'Argentine (1-0) le 8 juin 1990.",
  },
  {
    q: "Quelle ville est surnommée « ville aux sept collines » au Cameroun ?",
    options: ['Bafoussam', 'Bamenda', 'Yaoundé', 'Buea'],
    answer: 2,
  },
  {
    q: "Le lac Nyos est tristement célèbre pour…",
    options: [
      'une éruption volcanique en 1999',
      "une émanation de CO2 mortelle en 1986",
      'un naufrage en 1972',
      'un séisme en 2004',
    ],
    answer: 1,
    explain: "En août 1986, le lac Nyos a relâché un nuage de CO2 tuant ~1 700 personnes.",
  },
  {
    q: "Quel est le surnom de l'équipe nationale de football du Cameroun ?",
    options: ['Aigles Verts', 'Lions Indomptables', 'Étalons', 'Éléphants'],
    answer: 1,
  },
  {
    q: "L'Université de Yaoundé I est issue de la scission de l'université créée en quelle année ?",
    options: ['1962', '1972', '1993', '1984'],
    answer: 0,
    explain: "Université fédérale du Cameroun fondée en 1962, scindée en 6 universités en 1993.",
  },
  {
    q: "Quelle danse traditionnelle vient du peuple Bassa ?",
    options: ['Bikutsi', 'Assiko', 'Mangambeu', 'Makossa'],
    answer: 1,
    explain: "L'Assiko est la danse traditionnelle bassa, rythmée par la guitare et la bouteille.",
  },
  {
    q: "Combien d'étoiles figurent sur le drapeau camerounais ?",
    options: ['0', '1', '2', '3'],
    answer: 1,
    explain: "Une seule étoile jaune au centre, symbole de l'unité.",
  },
  {
    q: "Quelle plante a fait la richesse coloniale du Sud-Ouest camerounais ?",
    options: ['Café', 'Cacao', 'Banane', 'Hévéa'],
    answer: 2,
    explain: "Les plantations bananières de la CDC ont dominé l'économie coloniale anglaise.",
  },
  {
    q: "Quel chef de l'UPC est exécuté publiquement à Bafoussam en janvier 1971 ?",
    options: ['Félix Moumié', 'Ernest Ouandié', 'Ruben Um Nyobè', 'Abel Kingué'],
    answer: 1,
    explain: "Ernest Ouandié, fusillé le 15 janvier 1971 — dernier dirigeant historique de l'UPC.",
  },
];

export function pickRandomQuiz(exclude?: LudoQuiz): LudoQuiz {
  let q: LudoQuiz;
  do {
    q = LUDO_HARD_QUIZ[Math.floor(Math.random() * LUDO_HARD_QUIZ.length)];
  } while (exclude && q === exclude && LUDO_HARD_QUIZ.length > 1);
  return q;
}
