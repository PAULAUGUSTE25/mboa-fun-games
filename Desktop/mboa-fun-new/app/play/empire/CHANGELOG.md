# Mboa Empire — Changelog

## Méthode de calibrage des zones cliquables sur image

Le projet utilise des **images statiques** (plateau de jeu, écran de
sélection des statuts) sur lesquelles on doit pouvoir cliquer à des endroits
précis. Pour aligner les zones cliquables sur les éléments visuels de
l'image, on utilise toujours la **même méthode** :

### Principes

1. **Les positions sont en pourcentage** de la largeur/hauteur de l'image.
   Cela permet de garder la calibration valide à toute taille d'écran.

2. **Mode Debug** (toggle `○ Debug` / `✓ Debug`) :
   - Affiche les zones cliquables en pointillé doré.
   - Affiche une pastille numérotée + label au centre de chaque zone.
   - La pastille est **glissable** (drag) pour ajuster la position.

3. **Zoom & Pan** :
   - Boutons `+` / `−` / `↺` pour zoomer.
   - Quand zoomé, on peut glisser l'image pour la déplacer.
   - Les zones suivent le zoom car elles sont relatives à l'image.

4. **Persistance** :
   - À chaque mouvement, les positions sont sauvegardées dans
     `localStorage` (clé versionnée, ex. `empire.statusHotspots.v3`).
   - Au reload, les positions sauvegardées sont restaurées.
   - Une bump de version dans le code force un reset (utile quand on change
     les défauts).

5. **Export final** :
   - Bouton `📋` copie les positions exactes au format TypeScript prêt à
     coller dans le code source.
   - Les valeurs gravées dans le code deviennent les défauts pour tous les
     utilisateurs (plus dépendant du `localStorage`).

### Fichiers concernés

- **Plateau principal** : `_components/image-board.tsx`
  - 28 cases (DÉPART, IMPÔTS, propriétés, etc.) calibrées via `CELL_POSITIONS`.
  - Chaque case a un `{ x, y }` (centre en %).

- **Sélection de statut** : `_components/status-select-modal.tsx`
  - 6 cartes (Étudiant, Administrateur, Commerçant, Sportif, Transporteur,
    Artisan) calibrées via `DEFAULT_HOTSPOTS`.
  - Chaque hotspot a `{ cx, cy, w, h }` (centre + taille de la zone
    cliquable, en %).

### Workflow utilisateur (toi)

1. Ouvrir l'écran (modal de statut, ou plateau de jeu).
2. Cliquer le bouton **Debug** dans la barre d'outils en haut à droite.
3. Glisser chaque pastille numérotée sur le bon élément visuel de l'image.
4. (Optionnel) Zoomer pour positionner plus précisément.
5. Cliquer **📋 Copier** quand tout est aligné.
6. Coller le bloc TypeScript dans le chat → je le grave dans le code.
7. Désactiver Debug → les zones sont maintenant invisibles, seuls les
   clics aux bons endroits valident la sélection.

### Important

- En mode normal (Debug = off), les zones cliquables sont **invisibles**
  mais fonctionnelles. Cliquer sur une carte du statut **valide ce statut
  pour le joueur** (même sans visuel de confirmation immédiat — la modal
  passe juste au joueur suivant ou ferme).

- Le hover gold-glow indique où se trouve la zone active.

---

## V1 — État au 25 mai 2026

### ✅ Phase 1 + 2 (data + boucle de jeu)

- Types complets : `Player` étendu avec `statusKey`, `reputation`,
  `loanRemaining`, `hasUsine`, `skipNextTurn`, `hasLeadershipCard`,
  `improvements`.
- Métadonnées des 28 cases (`_data/cells.ts`).
- 6 statuts (`_data/statuses.ts`) avec avantages.
- Decks Chance & Caisse Commune (`_data/cards.ts`).
- Boucle complète : roll → move → DÉPART bonus → résolution de la case
  (achat / loyer / IMPÔTS / carte / événement) → fin de tour.
- Doubles → re-roll ; 3 doubles consécutifs → IMPÔTS direct.
- Modal interactif de choix de statut sur image.

### ✅ Audio (Web Audio API, sons synthétisés)

- Click, dice, gain, loss, card, prison, buy.
- Musique d'ambiance : charge `/assets/audio/empire-ambient.mp3` si
  présent ; sinon fallback drone synthétisé en Ré mineur.
- Bouton `🎵 Musique / 🔇 Silence` dans le HUD.

### 🔜 Phase 3 — questions Mboa

- Stade Lions Indomptables, culture générale (Cité U), institutions (QA),
  culture camerounaise (Village Artisanal), commerce (Marché).
- Aéroport : téléportation 100 💎.
- Marché : dé événement.

### 🔜 Phase 4 — empire & propriétés

- Améliorations niveau 1/2/3 par propriété.
- Carte Leadership (École des Leaders).
- Pouvoir royal (Palais Royal).
- Usine (Zone Industrielle).

### 🔜 Phase 5 — faillite & fin de partie

- Hypothèque, prêt 300/350, vente entre joueurs.
- Modes de fin : classique, rapide (45 min), Empire.

### 🔜 Phase 6 — réputation

- Notable du Mboa à 5 points.
