// La boutique entre les manches : investir dans le BUREAU (plus d'argent plus tard)
// ou dans la TOUPIE / le LANCEUR (plus fort tout de suite). Mêmes améliorations que l'atelier du jeu 1.
// On n'y change PAS de pièces : la toupie choisie avant la partie reste la même jusqu'à la fin.
import { STATS } from '../stats.js';
import { RARETE_OFFRE } from '../config.js';

// Prix et plafonds des améliorations de partie. Le BUREAU (économie) est un groupe de stats comme la toupie et le lanceur
// (voir src/stats.js) : certaines pièces en donnent ou en retirent aussi.
// Les prix montent de plus en plus vite (n² ) : impossible de tout acheter d'un coup en fin de partie.
const REGLES = {
  multi: { max: 2, prix: n => 60 + n * 50 }, // très cher : une toupie de plus, c'est énorme
  nid: { max: 6, prix: n => 4 + n * 3 + n * n }, prime: { max: 6, prix: n => 4 + n * 3 + n * n }, chance: { max: 4, prix: n => 6 + n * 4 + n * n },
  combo: { max: 5, prix: n => 4 + n * 3 + n * n },
  tirelire: { max: 3, prix: n => 6 + n * 5 + n * n },
  veine: { max: 5, prix: n => 4 + n * 3 + n * n }, // Chance : un investissement, rentable si on achète beaucoup ensuite
};
// Toupie et lanceur : +1 niveau dans une stat (les pouvoirs spéciaux coûtent plus cher)
export const STAT_ACHATS = STATS.map(s => ({
  id: s.id, stat: true, groupe: s.groupe, nom: s.nom, icone: s.icone, desc: s.desc,
  max: REGLES[s.id]?.max ?? (s.special ? 6 : 8),
  prix: REGLES[s.id]?.prix || (s.special ? n => 6 + n * 3 + Math.floor((n * n) / 2) : n => 3 + n * 2 + Math.floor((n * n) / 4)),
}));
export const BUREAU = STAT_ACHATS.filter(a => a.groupe === 'bureau');

// Priorité de terrain : achetable à tout moment (bouton à part dans la boutique), seulement si on a choisi un terrain. Points CACHÉS à l'adversaire.
export const PRIORITE = { id: 'priorite', groupe: 'terrain', nom: 'Priorité de terrain', icone: '🏟️', max: 10, prix: n => 2 + n * 2,
  desc: 'En duel, si l\'adversaire a aussi un terrain, celui qui a le plus de points impose le sien (égalité : bureau neutre). Tes points restent secrets.',
  fmt: n => `${n} point${n > 1 ? 's' : ''} (secret)` };
export const MANCHE_PRIORITE = 0; // achetable à tout moment (avec un terrain)

export const AMELIORATIONS = [...STAT_ACHATS, PRIORITE];
export const AMELIO = Object.fromEntries(AMELIORATIONS.map(a => [a.id, a]));

// Un achat = un PAQUET de +3 niveaux (moins de clics, effet bien visible), 15 % moins cher que 3 achats séparés.
// Le Multi-lancer et la Priorité de terrain s'achètent un par un.
export const PAQUET = 3;
// n = nombre d'achats déjà faits (le prix et le plafond portent sur les ACHATS) ; la rareté multiplie les niveaux gagnés.
export const SANS_RARETE = id => id === 'multi' || id === 'priorite';
export function paquet(a, n, rarete = 'commune') {
  const k = SANS_RARETE(a.id) ? 1 : Math.min(PAQUET, a.max - n);
  if (k <= 0) return null;
  let prix = 0;
  for (let i = 0; i < k; i++) prix += a.prix(n + i);
  const mult = SANS_RARETE(a.id) ? 1 : RARETE_OFFRE[rarete]?.mult || 1;
  return { achats: k, niveaux: Math.round(k * mult * 10) / 10, prix: k > 1 ? Math.round(prix * 0.85) : prix };
}

export const NOMS_BOTS = [
  'Cafouillette', 'TourneVite', 'Sir Spinzalot', 'Mamie Toupie', 'Blatte Runner', 'Gyro Gearloose',
  'Pointe Sèche', 'La Foreuse', 'Kiki Couronne', 'Toupinator', 'Dame Vrille', 'Croque-Cafard',
  'Rotor', 'Ptit Clou', 'Vortex', 'Bzzt', 'Tornadine', 'Capitaine Pivot',
];
