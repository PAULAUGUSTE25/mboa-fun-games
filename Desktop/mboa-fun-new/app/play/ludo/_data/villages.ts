/**
 * 52 villages / villes / lieux du Cameroun, posés en sens horaire
 * sur la piste extérieure du Ludo. Index 0 = case d'entrée du joueur Rouge.
 *
 * Ordre choisi : on traverse le pays — Ouest → Nord → Est → Sud → Littoral —
 * pour qu'un tour de plateau ressemble à une « tournée » du Cameroun.
 */
export interface VillageInfo {
  /** Nom à afficher sur la case. */
  name: string;
  /** Région administrative. */
  region: string;
  /** Petite info culturelle / pédagogique. */
  fact: string;
}

export const LUDO_VILLAGES: VillageInfo[] = [
  // ── Sud-Ouest / Littoral (départ Rouge — index 0..12) ──
  { name: 'Buea',        region: 'Sud-Ouest',    fact: "Au pied du Mont Cameroun (4 095 m)." },
  { name: 'Limbé',       region: 'Sud-Ouest',    fact: "Plages de sable noir, raffinerie SONARA." },
  { name: 'Kumba',       region: 'Sud-Ouest',    fact: "Grand marché du Sud-Ouest." },
  { name: 'Mamfé',       region: 'Sud-Ouest',    fact: "Carrefour vers le Nigeria." },
  { name: 'Mundemba',    region: 'Sud-Ouest',    fact: "Porte du Parc national de Korup." },
  { name: 'Tiko',        region: 'Sud-Ouest',    fact: "Plantations bananières de la CDC." },
  { name: 'Idenau',      region: 'Sud-Ouest',    fact: "Petit port de pêche." },
  { name: 'Bonabéri',    region: 'Littoral',     fact: "Rive droite du Wouri, à Douala." },
  { name: 'Douala',      region: 'Littoral',     fact: "Capitale économique." },
  { name: 'Edéa',        region: 'Littoral',     fact: "Barrage et aluminium." },
  { name: 'Nkongsamba',  region: 'Littoral',     fact: "Au pied du Mont Manengouba." },
  { name: 'Loum',        region: 'Littoral',     fact: "Plantations de bananes-plantain." },
  { name: 'Penja',       region: 'Littoral',     fact: "Poivre blanc IGP réputé mondial." },

  // ── Ouest / Nord-Ouest (entrée Bleu — index 13..25) ──
  { name: 'Mbanga',      region: 'Littoral',     fact: "Sol volcanique, agriculture riche." },
  { name: 'Bafoussam',   region: 'Ouest',        fact: "Capitale Bamiléké des hauts plateaux." },
  { name: 'Bandjoun',    region: 'Ouest',        fact: "Chefferie traditionnelle classée." },
  { name: 'Dschang',     region: 'Ouest',        fact: "Université, climat frais." },
  { name: 'Mbouda',      region: 'Ouest',        fact: "Marché agricole majeur." },
  { name: 'Bafang',      region: 'Ouest',        fact: "Pays Banka, chutes de la Métché." },
  { name: 'Bangangté',   region: 'Ouest',        fact: "Pays Bamiléké central." },
  { name: 'Foumban',     region: 'Ouest',        fact: "Sultanat Bamoun, palais royal." },
  { name: 'Foumbot',     region: 'Ouest',        fact: "Maraîchage et tomate." },
  { name: 'Bamenda',     region: 'Nord-Ouest',   fact: "Cœur Grassfields anglophone." },
  { name: 'Bafut',       region: 'Nord-Ouest',   fact: "Chefferie inscrite au patrimoine." },
  { name: 'Kumbo',       region: 'Nord-Ouest',   fact: "Royaume Nso, culture du café." },
  { name: 'Wum',         region: 'Nord-Ouest',   fact: "Lac Nyos non loin." },

  // ── Nord / Adamaoua / Extrême-Nord (entrée Vert — index 26..38) ──
  { name: 'Ngaoundéré',  region: 'Adamaoua',     fact: "Plateau frais, élevage bovin." },
  { name: 'Tibati',      region: 'Adamaoua',     fact: "Lac et savane." },
  { name: 'Meiganga',    region: 'Adamaoua',     fact: "Pays Mboum." },
  { name: 'Banyo',       region: 'Adamaoua',     fact: "Massif de l'Atlantika." },
  { name: 'Garoua',      region: 'Nord',         fact: "Capitale du Nord, Bénoué." },
  { name: 'Poli',        region: 'Nord',         fact: "Parc national du Faro." },
  { name: 'Tcholliré',   region: 'Nord',         fact: "Pays Lamidat." },
  { name: 'Maroua',      region: 'Extrême-Nord', fact: "Capitale de l'Extrême-Nord." },
  { name: 'Mokolo',      region: 'Extrême-Nord', fact: "Pays Mafa, monts Mandara." },
  { name: 'Rhumsiki',    region: 'Extrême-Nord', fact: "Paysage de pitons volcaniques." },
  { name: 'Kousséri',    region: 'Extrême-Nord', fact: "Frontière du Tchad." },
  { name: 'Yagoua',      region: 'Extrême-Nord', fact: "Pays Toupouri, fête du Maray." },
  { name: 'Mora',        region: 'Extrême-Nord', fact: "Pays Mandara." },

  // ── Est / Centre / Sud (entrée Jaune — index 39..51) ──
  { name: 'Bertoua',     region: 'Est',          fact: "Capitale de l'Est, peuple Gbaya." },
  { name: 'Yokadouma',   region: 'Est',          fact: "Forêt dense, Pygmées Baka." },
  { name: 'Batouri',     region: 'Est',          fact: "Carrefour de l'Est." },
  { name: 'Abong-Mbang', region: 'Est',          fact: "Pays Maka." },
  { name: 'Yaoundé',     region: 'Centre',       fact: "Capitale politique." },
  { name: 'Mbalmayo',    region: 'Centre',       fact: "Pays Ewondo, scieries." },
  { name: 'Bafia',       region: 'Centre',       fact: "Pays Bafia, chutes de la Sanaga." },
  { name: 'Akonolinga',  region: 'Centre',       fact: "Lac, lamantins du Nyong." },
  { name: 'Sangmélima',  region: 'Sud',          fact: "Pays Bulu, forêts." },
  { name: 'Ebolowa',     region: 'Sud',          fact: "Capitale du Sud, cacao." },
  { name: 'Ambam',       region: 'Sud',          fact: "Frontière Gabon / Guinée Eq." },
  { name: 'Kribi',       region: 'Sud',          fact: "Plages, chutes de la Lobé." },
  { name: 'Campo',       region: 'Sud',          fact: "Réserve de faune, pygmées Bagyeli." },
];

export const LUDO_TRACK_LENGTH = LUDO_VILLAGES.length; // 52
