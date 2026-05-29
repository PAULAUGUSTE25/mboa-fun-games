/**
 * Histoires brèves de grandes ethnies / peuples du Cameroun.
 * Affichées dans une modale lorsqu'un pion en mange un autre — l'idée :
 * apprendre les origines des peuples en jouant.
 */
export interface EthnieStory {
  /** Nom du peuple. */
  name: string;
  /** Régions où on les rencontre principalement. */
  regions: string;
  /** Petit récit historique / culturel (3–4 phrases). */
  story: string;
  /** Anecdote ou fait marquant. */
  fact: string;
}

export const ETHNIE_STORIES: EthnieStory[] = [
  {
    name: 'Bamiléké',
    regions: 'Ouest, hauts plateaux',
    story:
      "Les Bamilékés descendent de migrations Tikar venues du nord vers le XVIᵉ siècle. " +
      "Ils se sont organisés en chefferies puissantes (Bandjoun, Bafoussam, Baham, Bana, Bafou…), " +
      "chacune dirigée par un Fo (chef sacré). Leur réputation de bâtisseurs et de commerçants " +
      "s'est forgée dans la diaspora intérieure : Bafoussam, Yaoundé, Douala, Garoua…",
    fact: "Les chefferies Bamiléké ont une architecture traditionnelle unique : toits coniques en raphia.",
  },
  {
    name: 'Beti / Ewondo / Bulu / Fang',
    regions: 'Centre, Sud',
    story:
      "Les peuples Beti regroupent les Ewondo (Yaoundé), les Bulu (Sangmélima, Ebolowa) et les Fang " +
      "(jusqu'au Gabon et la Guinée équatoriale). La tradition orale raconte la traversée de la " +
      "Sanaga sur le dos d'un python géant pour fuir les Mvélé. Ils parlent des langues très proches " +
      "et partagent l'organisation en clans patrilinéaires.",
    fact: "« Yaoundé » vient du clan Ewondo « Mvog-Tsoung-Mballa ».",
  },
  {
    name: 'Bassa',
    regions: 'Centre, Littoral',
    story:
      "Les Bassa occupent la zone forestière entre Édéa et Eséka. Leur histoire est marquée par la " +
      "résistance anti-coloniale : Ruben Um Nyobé, leader de l'UPC, est un héros bassa tombé en 1958. " +
      "Le « Ngondo » bassa est un rite de passage initiatique encore pratiqué.",
    fact: "Le Mont Ngok-Lituba est leur lieu sacré d'origine : un rocher percé d'où serait sorti l'ancêtre.",
  },
  {
    name: 'Sawa / Douala',
    regions: 'Littoral, côte du Wouri',
    story:
      "Les Sawa sont les peuples côtiers : Douala, Bakweri, Bakoko, Malimba, Pongo, Yabassi… Les Douala " +
      "se sont installés sur les rives du Wouri au XVIᵉ siècle, devenant intermédiaires du commerce " +
      "avec les Européens dès le XVIIᵉ. Leur fête traditionnelle — le Ngondo — célèbre les ancêtres " +
      "de l'eau chaque mois de décembre.",
    fact: "« Cameroun » vient du portugais « Rio dos Camarões » — la rivière des crevettes du Wouri.",
  },
  {
    name: 'Bamoun',
    regions: 'Ouest (Foumban)',
    story:
      "Le royaume Bamoun fut fondé en 1394 par Nchare Yen, prince Tikar. Foumban est la capitale " +
      "historique avec son célèbre Palais. Le Sultan Ibrahim Njoya (XIXᵉ–XXᵉ siècle) est resté dans " +
      "l'histoire pour avoir inventé son propre alphabet — l'écriture « A-ka-u-ku » — ainsi qu'une " +
      "religion syncrétique mêlant islam, christianisme et traditions.",
    fact: "Le Palais Royal de Foumban abrite l'un des plus riches musées d'art africain.",
  },
  {
    name: 'Foulbé / Peul',
    regions: 'Adamaoua, Nord, Extrême-Nord',
    story:
      "Les Foulbé arrivent au Cameroun lors du djihad d'Ousmane dan Fodio (début XIXᵉ). " +
      "Ils fondent des lamidats : Ngaoundéré, Garoua, Maroua, Rey-Bouba, Tibati. Bergers nomades " +
      "à l'origine, ils sont aujourd'hui sédentarisés mais restent éleveurs de zébus. " +
      "Leur chef traditionnel s'appelle le Lamido.",
    fact: "Le Lamidat de Rey-Bouba est célèbre pour avoir longtemps gardé son indépendance face au pouvoir central.",
  },
  {
    name: 'Pygmées Baka / Bakola / Bagyeli',
    regions: 'Forêts de l\'Est et du Sud',
    story:
      "Les Pygmées sont les premiers habitants du bassin du Congo, présents bien avant les vagues " +
      "bantoues. Ils vivent en clans semi-nomades de chasseurs-cueilleurs. Leur connaissance de la " +
      "forêt est encyclopédique : plantes médicinales, pistage, miel sauvage. Leurs polyphonies " +
      "vocales sont reconnues à l'UNESCO.",
    fact: "Les Baka chantent en yodel — technique vocale rare au monde.",
  },
  {
    name: 'Tikar',
    regions: 'Adamaoua, Ouest, Nord-Ouest',
    story:
      "Les Tikar sont considérés comme les ancêtres communs des Bamoun, Bamiléké et de plusieurs " +
      "chefferies des Grassfields. Ils auraient migré du Tchad il y a plusieurs siècles, fuyant " +
      "les royaumes Kanem-Bornou. Leur descendance s'est éclatée en multiples royaumes.",
    fact: "On les surnomme parfois « le peuple-mère » des hauts plateaux du Cameroun.",
  },
  {
    name: 'Bakweri',
    regions: 'Sud-Ouest, autour du Mont Cameroun',
    story:
      "Les Bakweri vivent sur les flancs du Mont Cameroun (« Mont Fako » dans leur langue). Leur " +
      "tradition orale parle d'« Efasa Moto » — l'esprit de la montagne, mi-homme mi-singe. Ils ont " +
      "résisté aux Allemands en 1891 lors de la « guerre Bakweri ».",
    fact: "Leur fête traditionnelle, le « Ngondo Bakweri », célèbre la montagne sacrée.",
  },
  {
    name: 'Maka',
    regions: 'Est',
    story:
      "Les Maka peuplent la forêt de l'Est autour d'Abong-Mbang et Doumé. Ils sont organisés en " +
      "lignages patrilinéaires et leurs maisons traditionnelles, en raphia, possèdent des cases " +
      "rondes décorées. La pêche au filet et la chasse à l'arbalète restent pratiquées.",
    fact: "Les Maka ont été parmi les premiers à accueillir les missions chrétiennes presbytériennes.",
  },
  {
    name: 'Mafa / Kapsiki',
    regions: 'Extrême-Nord, monts Mandara',
    story:
      "Les Mafa habitent les flancs rocheux des monts Mandara — paysages de pitons volcaniques. " +
      "Ils ont développé une agriculture en terrasses ingénieuse pour cultiver le mil sur la pente. " +
      "Les Kapsiki, voisins, sont célèbres pour leurs forgerons et leurs masques rituels.",
    fact: "Le village de Rhumsiki, en pays Kapsiki, est l'un des plus photographiés d'Afrique.",
  },
  {
    name: 'Toupouri',
    regions: 'Extrême-Nord (Yagoua)',
    story:
      "Les Toupouri occupent la plaine de la Bénoué. Leur fête annuelle — le « Maray » — célèbre " +
      "la fin de l'initiation des jeunes hommes par des danses guerrières et des courses de pirogues " +
      "sur le Logone. C'est l'une des fêtes les plus spectaculaires du Cameroun.",
    fact: "Le Maray attire chaque année des milliers de visiteurs à Yagoua.",
  },
  {
    name: 'Mboum',
    regions: 'Adamaoua (Meiganga)',
    story:
      "Les Mboum habitaient l'Adamaoua bien avant l'arrivée des Foulbé. Ils sont les fondateurs " +
      "originels du plateau et leurs chefs portaient le titre de « Belaka ». La cohabitation avec les " +
      "Lamidats Peuls a profondément métissé leurs cultures.",
    fact: "Les Mboum auraient introduit l'élevage bovin dans la région avant les Peuls.",
  },
  {
    name: 'Mousgoum',
    regions: 'Extrême-Nord (Maga, Pouss)',
    story:
      "Les Mousgoum sont célèbres pour leurs « cases obus » — habitations en terre battue de forme " +
      "conique parfaite, sans charpente, héritées d'un savoir-faire ancestral. Leur économie repose " +
      "sur la pêche dans le Logone et la riziculture.",
    fact: "Les cases obus Mousgoum sont reconnues comme un chef-d'œuvre architectural en terre crue.",
  },
];

export function pickRandomEthnie(): EthnieStory {
  return ETHNIE_STORIES[Math.floor(Math.random() * ETHNIE_STORIES.length)];
}
