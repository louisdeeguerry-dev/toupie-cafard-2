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

// Les vagues de cafards (manche n = numéro global de la manche de cafards, à partir de 1)
export const VAGUE = {
  nombre: n => 6 + Math.round(n * 1.6),
  objectif: n => Math.ceil((6 + Math.round(n * 1.6)) * 0.7),
  vieCafard: n => 2.2 * Math.pow(1.16, n - 1),
  prime: 1, // 💰 par cafard
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
