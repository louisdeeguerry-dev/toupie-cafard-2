// La boutique entre les manches : investir dans le BUREAU (plus d'argent plus tard)
// ou dans la TOUPIE / le LANCEUR (plus fort tout de suite). Mêmes améliorations que l'atelier du jeu 1.
// On n'y change PAS de pièces : la toupie choisie avant la partie reste la même jusqu'à la fin.
import { STATS } from '../stats.js';

// Prix et plafonds des améliorations de partie. Le BUREAU (économie) est un groupe de stats comme la toupie et le lanceur
// (voir src/stats.js) : certaines pièces en donnent ou en retirent aussi.
// Les prix montent de plus en plus vite (n² ) : impossible de tout acheter d'un coup en fin de partie.
const REGLES = {
  multi: { max: 2, prix: n => 35 + n * 35 }, // très cher : une toupie de plus, c'est énorme
  nid: { max: 6, prix: n => 4 + n * 3 + n * n }, prime: { max: 6, prix: n => 4 + n * 3 + n * n }, chance: { max: 4, prix: n => 6 + n * 4 + n * n },
  combo: { max: 5, prix: n => 4 + n * 3 + n * n }, appat: { max: 5, prix: n => 5 + n * 3 + n * n }, trampoline: { max: 4, prix: n => 7 + n * 4 + n * n },
  tirelire: { max: 3, prix: n => 6 + n * 5 + n * n },
};
// Toupie et lanceur : +1 niveau dans une stat (les pouvoirs spéciaux coûtent plus cher)
export const STAT_ACHATS = STATS.map(s => ({
  id: s.id, stat: true, groupe: s.groupe, nom: s.nom, icone: s.icone, desc: s.desc,
  max: REGLES[s.id]?.max ?? (s.special ? 6 : 8),
  prix: REGLES[s.id]?.prix || (s.special ? n => 6 + n * 3 + n * n : n => 3 + n * 2 + Math.floor((n * n) / 2)),
}));
export const BUREAU = STAT_ACHATS.filter(a => a.groupe === 'bureau');

// Priorité de terrain : achetable à partir de la 3e manche, seulement si on a choisi un terrain. Points CACHÉS à l'adversaire.
export const PRIORITE = { id: 'priorite', groupe: 'terrain', nom: 'Priorité de terrain', icone: '🏟️', max: 10, prix: n => 2 + n * 2,
  desc: 'En duel, si l\'adversaire a aussi un terrain, celui qui a le plus de points impose le sien (égalité : bureau neutre). Tes points restent secrets.',
  fmt: n => `${n} point${n > 1 ? 's' : ''} (secret)` };
export const MANCHE_PRIORITE = 3; // disponible après 3 manches

export const AMELIORATIONS = [...STAT_ACHATS, PRIORITE];
export const AMELIO = Object.fromEntries(AMELIORATIONS.map(a => [a.id, a]));

export const NOMS_BOTS = [
  'Cafouillette', 'TourneVite', 'Sir Spinzalot', 'Mamie Toupie', 'Blatte Runner', 'Gyro Gearloose',
  'Pointe Sèche', 'La Foreuse', 'Kiki Couronne', 'Toupinator', 'Dame Vrille', 'Croque-Cafard',
  'Rotor', 'Ptit Clou', 'Vortex', 'Bzzt', 'Tornadine', 'Capitaine Pivot',
];
