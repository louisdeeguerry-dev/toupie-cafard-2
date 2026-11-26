// Réglages généraux de la partie. Tout ce qui sert à l'équilibrage est ici, pour pouvoir l'ajuster sans toucher au moteur.

export const VERSION = '0.1.0-proto';

// Le plateau est ROND (contre les cafards comme en duel) — en mètres
export const ARENE_R = 0.6; // rayon du plateau
export const RAIL_R = ARENE_R - 0.07; // le lanceur glisse sur un arc, près du bord
export const RAIL_ANGLE = (50 * Math.PI) / 180; // l'arc va de −50° à +50° autour du bas (et du haut pour l'adversaire)
export const RAIL_XMAX = RAIL_R * Math.sin(RAIL_ANGLE);
// Position du rail pour une abscisse x (bas = côté joueur, z positif ; haut = côté adversaire)
export const railZ = (x, haut = false) => (haut ? -1 : 1) * Math.sqrt(Math.max(0, RAIL_R * RAIL_R - x * x));
// Anciennes dimensions (cadrage de la caméra)
export const DESK_X = ARENE_R;
export const DESK_Z = ARENE_R;

// La partie
export const PARTIE = {
  joueurs: 8, // toi + 7 bots (matchmaking complété par des bots)
  vies: 5,
  // Une étape = 3 LANCERS contre les cafards (un lancer par manche, boutique entre chaque), puis 1 duel.
  cycle: ['cafards', 'cafards', 'cafards', 'duel'],
  // Vies perdues lors d'un duel perdu = numéro de l'étape : la partie se resserre vite.
  degatsDuel: () => 1, // un duel perdu coûte 1 vie : 5 vies = 5 défaites possibles
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
// La relance coûte de plus en plus cher dans une même boutique (2, 3, 5, 7, 10…), puis redevient à 2 à la manche suivante.
// Relance : 1, 2, 3, 5, 8, 13… 💰 (suite de Fibonacci) ; elle repart à zéro à chaque manche
const fibo = n => { let a = 1, b = 2; for (let i = 0; i < n; i++) [a, b] = [b, a + b]; return a; };
export const BOUTIQUE = { offres: 4, relance: fibo };

// Rareté des offres de la boutique : MÊME PRIX, mais plus de niveaux gagnés (effet ×1,5 / ×2 / ×3).
// La stat « Chance » (🎲) rend les raretés hautes plus fréquentes.
export const RARETES_OFFRE = [
  { id: 'commune', nom: 'Commune', mult: 1, poids: 76, couleur: '#b2bec3' },
  { id: 'rare', nom: 'Rare', mult: 1.5, poids: 18, couleur: '#3fa7ff' },
  { id: 'epique', nom: 'Épique', mult: 2, poids: 5, couleur: '#b36bff' },
  { id: 'legendaire', nom: 'Légendaire', mult: 3, poids: 1, couleur: '#ffb52e' },
];
export const RARETE_OFFRE = Object.fromEntries(RARETES_OFFRE.map(r => [r.id, r]));
// Chaque niveau de Chance : les raretés hautes pèsent plus, la commune moins (plafonné, rendements décroissants)
const BONUS_CHANCE = [-0.06, 0.15, 0.3, 0.5];
export function poidsRaretes(veine = 0) {
  const L = Math.min(25, Math.max(0, veine));
  return RARETES_OFFRE.map((r, i) => r.poids * Math.max(0.15, 1 + BONUS_CHANCE[i] * L));
}
export function tirerRarete(veine = 0) {
  const w = poidsRaretes(veine), tot = w.reduce((a, b) => a + b, 0);
  let x = Math.random() * tot;
  for (let i = 0; i < w.length; i++) if ((x -= w[i]) < 0) return RARETES_OFFRE[i].id;
  return 'commune';
}
// Probabilité d'avoir mieux que commune (affichée dans la stat Chance)
export const probaMieux = veine => { const w = poidsRaretes(veine); return 1 - w[0] / w.reduce((a, b) => a + b, 0); };

// Économie entre les manches
export const ECONOMIE = {
  revenuManche: 2, // 💰 donnés à chaque fin de manche
  interetPour: 5, // +1 💰 par tranche de 5 💰 gardés (plafond : stat Tirelire)
  // Un duel ne rapporte ni ne coûte d'argent : il ne fait perdre que des vies.
};

// Stats : chaque stat de toupie vaut 5 de base, puis les pièces et les améliorations la modifient
export const STAT_BASE = 5;
export const STAT_MIN = 1;
