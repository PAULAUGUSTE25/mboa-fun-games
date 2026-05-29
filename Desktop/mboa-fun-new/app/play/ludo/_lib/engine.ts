/**
 * Moteur de jeu Ludo (règles type Ludo King) — fonctions pures.
 *
 * Conventions :
 * - Le plateau a 52 cases sur la piste extérieure (index 0..51 en sens horaire).
 * - Chaque couleur a une « case d'entrée » fixe sur la piste :
 *      red = 0, blue = 13, green = 26, yellow = 39
 * - Une couleur a 4 pions. Chaque pion a une « progression » (`progress`) :
 *      progress = 0       : encore à la base (pas sorti)
 *      progress = 1..51   : sur la piste extérieure (51 cases parcourues max)
 *      progress = 52..56  : dans la colonne maison (5 cases vers le centre)
 *      progress = 57      : arrivé au centre (terminé)
 * - On obtient la case absolue d'un pion sur la piste extérieure par :
 *      (startIndex + progress - 1) % 52
 * - Cases sûres (« stars ») : les 4 cases d'entrée + 4 cases en milieu de bras.
 *
 * Règles principales :
 * - Au début, tous les pions sont en base (progress = 0).
 * - Pour sortir un pion, il faut faire 6 → progress passe à 1 (sur la case d'entrée).
 * - Faire 6 donne un tour bonus. Trois 6 d'affilée → tour perdu.
 * - Pour entrer dans la colonne maison, il faut le score exact pour atteindre 57.
 *   Sinon le pion ne bouge pas (s'il n'y a pas d'autre coup possible).
 * - On capture un pion adverse en atterrissant dessus, sauf si la case est sûre.
 *   Le pion capturé revient à sa base (progress = 0).
 * - Le premier joueur à amener ses 4 pions à 57 gagne.
 */

export type LudoColor = 'red' | 'blue' | 'green' | 'yellow';

export interface LudoPawn {
  id: string;
  color: LudoColor;
  /** 0 = base, 1..51 = piste, 52..56 = colonne maison, 57 = arrivé. */
  progress: number;
  /**
   * Si non-null, le pion est CAPTURÉ et stocké dans la base du joueur indiqué.
   * Pour le libérer : (a) répondre juste à un quiz, OU (b) rouler 6.
   */
  heldBy: LudoColor | null;
}

export interface LudoPlayer {
  color: LudoColor;
  name: string;
  isAI: boolean;
  pawns: LudoPawn[];
}

export interface LudoState {
  players: LudoPlayer[];
  currentIdx: number;
  /** Dé courant (1..6) ou null avant lancer. */
  dice: number | null;
  /** Compteur de 6 consécutifs pour le joueur courant. */
  consecutiveSixes: number;
  /** True quand le dé est lancé et qu'on attend un mouvement. */
  awaitingMove: boolean;
  winner: LudoColor | null;
  /**
   * Compteur de tours consécutifs sans aucune progression (pour le quiz joker).
   * Réinitialisé dès qu'un pion fait un coup utile.
   */
  stuckTurns: Record<LudoColor, number>;
  /**
   * « Carte joker » obtenue après un quiz réussi : permet UNE action spéciale
   * (sortir, terminer, libérer) lors du prochain tour, indépendamment du dé.
   */
  joker: Record<LudoColor, boolean>;
}

export const LUDO_TRACK_LENGTH = 52;

/** Index de la case d'entrée pour chaque couleur sur la piste extérieure. */
export const COLOR_START_INDEX: Record<LudoColor, number> = {
  red: 0,
  blue: 13,
  green: 26,
  yellow: 39,
};

/** Cases sûres : entrées des 4 couleurs + 4 stars (à mi-chemin entre entrées). */
export const SAFE_INDICES: ReadonlySet<number> = new Set([
  0, 13, 26, 39, // entrées
  8, 21, 34, 47, // stars
]);

/** Couleurs ordonnées comme elles jouent (sens horaire). */
export const PLAY_ORDER: LudoColor[] = ['red', 'blue', 'green', 'yellow'];

// ─── Création / utilitaires ─────────────────────────────────────────────────

export function makePawn(color: LudoColor, idx: number): LudoPawn {
  return { id: `${color}-${idx}`, color, progress: 0, heldBy: null };
}

export function makePlayer(color: LudoColor, name: string, isAI: boolean): LudoPlayer {
  return {
    color,
    name,
    isAI,
    pawns: [0, 1, 2, 3].map((i) => makePawn(color, i)),
  };
}

export function initialState(playerNames: Record<LudoColor, { name: string; isAI: boolean }>): LudoState {
  return {
    players: PLAY_ORDER.map((c) => makePlayer(c, playerNames[c].name, playerNames[c].isAI)),
    currentIdx: 0,
    dice: null,
    consecutiveSixes: 0,
    awaitingMove: false,
    winner: null,
    stuckTurns: { red: 0, blue: 0, green: 0, yellow: 0 },
    joker: { red: false, blue: false, green: false, yellow: false },
  };
}

/** Roule un dé 1..6 (valeur déjà calculée à l'extérieur). */
export function rollDie(): number {
  return 1 + Math.floor(Math.random() * 6);
}

/** Case absolue (0..51) d'un pion sur la piste, ou -1 s'il n'y est pas. */
export function pawnTrackIndex(pawn: LudoPawn): number {
  if (pawn.progress < 1 || pawn.progress > 51) return -1;
  const start = COLOR_START_INDEX[pawn.color];
  return (start + pawn.progress - 1) % LUDO_TRACK_LENGTH;
}

/** Vrai si le pion est dans sa colonne maison (5 cases avant l'arrivée). */
export function isInHomeColumn(pawn: LudoPawn): boolean {
  return pawn.progress >= 52 && pawn.progress <= 56;
}

export function isFinished(pawn: LudoPawn): boolean {
  return pawn.progress === 57;
}

/** Vrai si le pion est dans SA PROPRE base (libre, pas capturé). */
export function isInBase(pawn: LudoPawn): boolean {
  return pawn.progress === 0 && pawn.heldBy === null;
}

/** Vrai si le pion est capturé et retenu dans la base d'un autre joueur. */
export function isHeld(pawn: LudoPawn): boolean {
  return pawn.heldBy !== null;
}

/**
 * Vrai si la case absolue `idx` est bloquée par une barrière ennemie
 * (≥ 2 pions d'une couleur AUTRE que `forColor` sur la même case).
 */
export function cellHasBarrier(
  state: LudoState,
  idx: number,
  forColor: LudoColor,
): boolean {
  if (idx < 0) return false;
  for (const pl of state.players) {
    if (pl.color === forColor) continue;
    const count = pl.pawns.filter(
      (p) => !isInBase(p) && !isFinished(p) && !isHeld(p) && pawnTrackIndex(p) === idx,
    ).length;
    if (count >= 2) return true;
  }
  return false;
}

// ─── Logique de mouvement ───────────────────────────────────────────────────

/**
 * Liste les pions qu'un joueur peut bouger avec le dé donné.
 * - Si dé = 6 : peut sortir un pion de la base.
 * - Sinon, ne peut bouger que les pions déjà sortis.
 * - Un pion ne peut pas dépasser progress = 57 (il faut le score exact).
 */
/**
 * Liste les pions du joueur courant qui peuvent bouger avec le dé donné,
 * en tenant compte des barrières ennemies (sauf si 3×6 consécutifs).
 */
export function movablePawns(player: LudoPlayer, dice: number, state?: LudoState): LudoPawn[] {
  const canSmashBarrier = !!state && state.consecutiveSixes >= 2 && dice === 6;
  // (consecutiveSixes incrémenté lors du 1er et 2e 6 — au 3e 6 on a déjà 2 dans le compteur)
  return player.pawns.filter((p) => {
    if (isFinished(p)) return false;
    // Pion captif : libérable avec un 6 (le retour à sa base se fait via applyMove)
    if (isHeld(p)) return dice === 6;
    if (isInBase(p)) return dice === 6;
    const next = p.progress + dice;
    if (next > 57) return false;
    // Vérifier les barrières sur le trajet (et sur la case d'arrivée), piste extérieure uniquement.
    if (state && p.progress >= 1 && p.progress <= 51) {
      const start = COLOR_START_INDEX[p.color];
      for (let step = 1; step <= dice; step++) {
        const stepProgress = p.progress + step;
        if (stepProgress > 51) break; // entrée dans le couloir maison : safe
        const idx = (start + stepProgress - 1) % LUDO_TRACK_LENGTH;
        if (cellHasBarrier(state, idx, p.color) && !canSmashBarrier) {
          return false;
        }
      }
    }
    return true;
  });
}

/**
 * Applique le mouvement d'un pion avec le dé donné.
 * Retourne le nouvel état + l'éventuel pion capturé.
 *
 * NOTE : suppose que le coup est légal (présent dans movablePawns).
 */
export interface MoveResult {
  state: LudoState;
  capturedPawn: LudoPawn | null;
  movedPawn: LudoPawn;
  finished: boolean;
  rolledSix: boolean;
}

export function applyMove(state: LudoState, pawnId: string): MoveResult {
  const dice = state.dice ?? 0;
  const player = state.players[state.currentIdx];
  const pawn = player.pawns.find((p) => p.id === pawnId);
  if (!pawn) throw new Error(`pawn ${pawnId} not found`);

  // 1. Calcule la nouvelle progression
  const newProgress = isInBase(pawn) && dice === 6 ? 1 : pawn.progress + dice;

  // 2. Détecte une capture (uniquement si pion sur la piste extérieure)
  let capturedPawn: LudoPawn | null = null;
  let nextPlayers = state.players.map((pl) =>
    pl.color === player.color
      ? {
          ...pl,
          pawns: pl.pawns.map((p) => (p.id === pawnId ? { ...p, progress: newProgress } : p)),
        }
      : pl,
  );

  // Vérifie capture : on regarde si un pion adverse occupe la case absolue d'arrivée
  const movedPawn = nextPlayers[state.currentIdx].pawns.find((p) => p.id === pawnId)!;
  const targetTrackIdx = pawnTrackIndex(movedPawn);
  if (targetTrackIdx !== -1 && !SAFE_INDICES.has(targetTrackIdx)) {
    for (let i = 0; i < nextPlayers.length; i++) {
      if (i === state.currentIdx) continue;
      const opp = nextPlayers[i];
      const victim = opp.pawns.find(
        (p) => !isInBase(p) && !isFinished(p) && pawnTrackIndex(p) === targetTrackIdx,
      );
      if (victim) {
        capturedPawn = { ...victim };
        nextPlayers = nextPlayers.map((pl, idx) =>
          idx === i
            ? {
                ...pl,
                pawns: pl.pawns.map((p) => (p.id === victim.id ? { ...p, progress: 0 } : p)),
              }
            : pl,
        );
        break; // une capture suffit (Ludo King ne permet pas double-occup hors safe)
      }
    }
  }

  // 3. Vérifie victoire
  const updatedPlayer = nextPlayers[state.currentIdx];
  const allFinished = updatedPlayer.pawns.every(isFinished);
  const winner = allFinished ? updatedPlayer.color : null;

  // 4. Détermine si le joueur rejoue (6, capture, ou pion arrivé)
  const finishedThisMove = newProgress === 57;
  const rolledSix = dice === 6;
  const playsAgain = rolledSix || !!capturedPawn || finishedThisMove;

  let nextConsecutive = rolledSix ? state.consecutiveSixes + 1 : 0;
  let nextIdx = state.currentIdx;

  // Trois 6 d'affilée : tour perdu, le pion ne bouge pas
  // (NOTE : règle simplifiée — on autorise quand même le 1er et 2e mouvement,
  //  c'est le 3e qui est annulé. Pour rester safe on garde simple ici.)
  if (nextConsecutive >= 3) {
    nextConsecutive = 0;
    nextIdx = (state.currentIdx + 1) % nextPlayers.length;
  } else if (!playsAgain && !winner) {
    nextIdx = (state.currentIdx + 1) % nextPlayers.length;
    nextConsecutive = 0;
  }

  return {
    state: {
      ...state,
      players: nextPlayers,
      currentIdx: nextIdx,
      dice: null,
      awaitingMove: false,
      consecutiveSixes: nextConsecutive,
      winner,
    },
    capturedPawn,
    movedPawn,
    finished: finishedThisMove,
    rolledSix,
  };
}

/**
 * Quand on a lancé le dé mais qu'aucun coup n'est possible,
 * on passe au joueur suivant (sauf si on a fait 6 et que rien ne bouge,
 * dans ce cas on reste sur le joueur, qu'il puisse relancer).
 */
export function passTurn(state: LudoState, hadAnyMove: boolean): LudoState {
  const rolledSix = state.dice === 6;
  let nextIdx = state.currentIdx;
  let nextConsecutive = state.consecutiveSixes;

  if (rolledSix && !hadAnyMove) {
    // 6 sans mouvement possible — relance autorisée
    nextConsecutive = state.consecutiveSixes + 1;
    if (nextConsecutive >= 3) {
      nextConsecutive = 0;
      nextIdx = (state.currentIdx + 1) % state.players.length;
    }
  } else {
    nextIdx = (state.currentIdx + 1) % state.players.length;
    nextConsecutive = 0;
  }

  return {
    ...state,
    dice: null,
    awaitingMove: false,
    currentIdx: nextIdx,
    consecutiveSixes: nextConsecutive,
  };
}

// ─── IA simple ─────────────────────────────────────────────────────────────

/**
 * Choisit un pion pour l'IA :
 * 1. S'il y a une capture possible → priorité.
 * 2. Sinon, sortir un pion de la base si dé = 6.
 * 3. Sinon, faire avancer le pion le plus avancé.
 */
export function aiPickPawn(state: LudoState): string | null {
  const dice = state.dice ?? 0;
  const player = state.players[state.currentIdx];
  const movable = movablePawns(player, dice);
  if (movable.length === 0) return null;

  // 1. Capture
  for (const p of movable) {
    const newProgress = isInBase(p) && dice === 6 ? 1 : p.progress + dice;
    const simulated: LudoPawn = { ...p, progress: newProgress };
    const targetIdx = pawnTrackIndex(simulated);
    if (targetIdx === -1 || SAFE_INDICES.has(targetIdx)) continue;
    for (let i = 0; i < state.players.length; i++) {
      if (i === state.currentIdx) continue;
      for (const opp of state.players[i].pawns) {
        if (!isInBase(opp) && !isFinished(opp) && pawnTrackIndex(opp) === targetIdx) {
          return p.id;
        }
      }
    }
  }

  // 2. Sortir si possible (dé = 6 et au moins un pion en base)
  if (dice === 6) {
    const inBase = movable.find(isInBase);
    if (inBase) return inBase.id;
  }

  // 3. Pion le plus avancé
  const onTrack = movable.filter((p) => !isInBase(p));
  if (onTrack.length > 0) {
    return [...onTrack].sort((a, b) => b.progress - a.progress)[0].id;
  }

  return movable[0].id;
}
