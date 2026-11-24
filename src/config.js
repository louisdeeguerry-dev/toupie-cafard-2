// Réglages généraux de la partie. Tout ce qui sert à l'équilibrage est ici, pour pouvoir l'ajuster sans toucher au moteur.

export const VERSION = '0.1.0-proto';

// Le bureau (mêmes dimensions que le jeu 1) — en mètres
export const DESK_X = 0.68; // demi-largeur
export const DESK_Z = 0.55; // demi-profondeur
export const RAIL_Z = DESK_Z - 0.07; // rail du lanceur du joueur (bord bas)
export const RAIL_MARGIN = 0.1; // le lanceur ne va pas jusque dans les coins

// La partie
export const PARTIE = {
  joueurs: 8, // toi + 7 bots (matchmaking complété par des bots)
  vies: 5,
  cycle: ['cafards', 'cafards', 'cafards', 'duel'], // 3 vagues de cafards, puis un duel, et on recommence
  // Vies perdues lors d'un duel perdu = numéro de l'étape (étape = un cycle de 4 manches) : la partie se resserre vite.
  // Simulation : ~6 étapes (~24 manches) pour départager 8 joueurs avec 5 vies.
  degatsDuel: etape => etape,
  lancersParVague: 3,
  // Argent de départ : choisir un terrain de duel coûte tout l'argent de départ (à équilibrer)
  argentSansTerrain: 8,
  argentAvecTerrain: 0,
  dureeMaxDuel: 30, // s : au-delà, la toupie qui tourne le plus fort gagne
};

// Les vagues de cafards. n = numéro de la vague de cafards (1, 2, 3…), etape = étape en cours (1 + nombre de duels passés).
// Les cafards ÉVOLUENT après chaque duel : vie ×1,15 par étape, et de nouvelles espèces (voir src/data/cafards.js).
export const VAGUE = {
  nombre: n => 10 + Math.floor((n - 1) * 0.7), // 10 cafards au début
  objectif: nb => Math.ceil(nb * 0.5),
  vieCafard: (n, etape) => 2.2 * Math.pow(1.06, n - 1) * Math.pow(1.15, etape - 1),
  prime: 1, // 💰 par cafard normal (les autres espèces rapportent plus)
  primeEtape: etape => 1 + 0.25 * (etape - 1), // les cafards évolués rapportent plus : investir dans la toupie reste rentable
  bonusObjectif: n => 2 + Math.floor(n / 2), // 💰 si l'objectif est atteint
};

// Économie entre les manches
export const ECONOMIE = {
  revenuManche: 2, // 💰 donnés à chaque fin de manche
  interetPour: 10, // +1 💰 par tranche de 10 💰 gardés…
  interetMax: 3, // … plafonné
  victoireDuel: 2,
};

// Stats : chaque stat de toupie vaut 5 de base, puis les pièces et les améliorations la modifient
export const STAT_BASE = 5;
export const STAT_MIN = 1;
