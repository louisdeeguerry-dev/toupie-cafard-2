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
  // Une étape = 3 LANCERS contre les cafards (un lancer par manche, boutique entre chaque), puis 1 duel.
  cycle: ['cafards', 'cafards', 'cafards', 'duel'],
  // Vies perdues lors d'un duel perdu = numéro de l'étape : la partie se resserre vite.
  degatsDuel: etape => etape,
  // Argent de départ : choisir un terrain de duel coûte tout l'argent de départ (à équilibrer)
  argentSansTerrain: 8,
  argentAvecTerrain: 0,
  dureeMaxDuel: 30, // s : au-delà, la toupie qui tourne le plus fort gagne
};

// Les cafards. Avant CHAQUE lancer, le bureau est rempli jusqu'à sa capacité (10 + Nid) : les survivants restent
// (avec leurs blessures), on complète avec des nouveaux. n = numéro du lancer contre les cafards (1, 2, 3…),
// etape = 1 + nombre de duels passés. Après chaque duel, les cafards ÉVOLUENT (voir src/data/cafards.js).
export const CAFARDS = {
  capacite: 10, // cafards sur le bureau au début de chaque lancer (+ Nid)
  vieCafard: (n, etape) => 1.7 * Math.pow(1.03, n - 1) * Math.pow(1.12, etape - 1),
  prime: 1.5, // 💰 par cafard normal (les autres espèces rapportent plus ; les centimes sont gardés)
  primeEtape: etape => 1 + 0.2 * (etape - 1), // les cafards évolués rapportent plus : investir dans la toupie reste rentable
};

// Boutique : nombre d'offres tirées au hasard à chaque manche (0 = tout afficher) et prix pour relancer
export const BOUTIQUE = { offres: 6, relance: 2 };

// Économie entre les manches
export const ECONOMIE = {
  revenuManche: 2, // 💰 donnés à chaque fin de manche
  interetPour: 5, // +1 💰 par tranche de 5 💰 gardés (plafond : stat Tirelire)
  // Un duel ne rapporte ni ne coûte d'argent : il ne fait perdre que des vies.
};

// Stats : chaque stat de toupie vaut 5 de base, puis les pièces et les améliorations la modifient
export const STAT_BASE = 5;
export const STAT_MIN = 1;
