// La boutique entre les manches : investir dans le BUREAU (plus d'argent plus tard)
// ou dans la TOUPIE / le LANCEUR (plus fort tout de suite). Mêmes améliorations que l'atelier du jeu 1.
// On n'y change PAS de pièces : la toupie choisie avant la partie reste la même jusqu'à la fin.
import { STATS } from '../stats.js';

// Bureau : économie de la partie (repris du jeu 1 : Nid, Prime, Trèfle doré, Combo, Appât, Bords trampolines)
export const BUREAU = [
  { id: 'nid', nom: 'Nid', icone: '🪺', max: 6, prix: n => 3 + n * 2, desc: 'Plus de cafards à chaque vague.',
    fmt: n => `${2 * n} cafards de plus par vague` },
  { id: 'prime', nom: 'Prime', icone: '💰', max: 6, prix: n => 4 + n * 3, desc: 'Chaque cafard écrasé rapporte plus.',
    fmt: n => `×${(1 + 0.2 * n).toFixed(1)} argent` },
  { id: 'chance', nom: 'Trèfle doré', icone: '🍀', max: 4, prix: n => 6 + n * 4, desc: 'Des cafards dorés qui rapportent 5 fois plus.',
    fmt: n => n ? `${Math.round((0.04 + 0.03 * n) * 100)} % de cafards dorés` : 'aucun cafard doré' },
  { id: 'combo', nom: 'Combo', icone: '🔗', max: 5, prix: n => 4 + n * 3, desc: 'Bonus quand on écrase plusieurs cafards à la suite.',
    fmt: n => `+${Math.round((0.1 + 0.05 * n) * 100)} % / cafard, ${(1.2 + 0.2 * n).toFixed(1)} s` },
  { id: 'appat', nom: 'Appât', icone: '🧀', max: 5, prix: n => 5 + n * 3, desc: 'Des cafards arrivent en renfort pendant la vague.',
    fmt: n => n ? `1 renfort toutes les ${(6 / (1 + 0.25 * (n - 1))).toFixed(1)} s` : 'pas de renforts' },
  { id: 'trampoline', nom: 'Bords trampolines', icone: '🤸', max: 4, prix: n => 7 + n * 4, desc: 'Les bords relancent la toupie encore plus vite.',
    fmt: n => n ? `rebond ×${(1.1 + 0.05 * n).toFixed(2)}` : 'bords en bois' },
  { id: 'tirelire', nom: 'Tirelire', icone: '🐷', max: 3, prix: n => 5 + n * 4, desc: 'Plus d\'intérêts sur l\'argent gardé.',
    fmt: n => `${3 + n} 💰 d'intérêts max` },
];

// Toupie et lanceur : +1 niveau dans une stat (les pouvoirs spéciaux coûtent plus cher)
const PRIX_STAT = { multi: n => 14 + n * 14 };
export const STAT_ACHATS = STATS.map(s => ({
  id: s.id, stat: true, groupe: s.groupe, nom: s.nom, icone: s.icone, desc: s.desc,
  max: s.id === 'multi' ? 2 : s.special ? 6 : 8,
  prix: PRIX_STAT[s.id] || (s.special ? n => 6 + n * 3 : n => 3 + n * 2),
}));

// Priorité de terrain : achetable à partir de la 3e manche, seulement si on a choisi un terrain. Points CACHÉS à l'adversaire.
export const PRIORITE = { id: 'priorite', groupe: 'terrain', nom: 'Priorité de terrain', icone: '🏟️', max: 10, prix: n => 2 + n * 2,
  desc: 'En duel, si l\'adversaire a aussi un terrain, celui qui a le plus de points impose le sien (égalité : tirage au sort). Tes points restent secrets.',
  fmt: n => `${n} point${n > 1 ? 's' : ''} (secret)` };
export const MANCHE_PRIORITE = 3; // disponible après 3 manches

export const AMELIORATIONS = [...BUREAU.map(b => ({ ...b, groupe: 'bureau' })), ...STAT_ACHATS, PRIORITE];
export const AMELIO = Object.fromEntries(AMELIORATIONS.map(a => [a.id, a]));

export const NOMS_BOTS = [
  'Cafouillette', 'TourneVite', 'Sir Spinzalot', 'Mamie Toupie', 'Blatte Runner', 'Gyro Gearloose',
  'Pointe Sèche', 'La Foreuse', 'Kiki Couronne', 'Toupinator', 'Dame Vrille', 'Croque-Cafard',
  'Rotor', 'Ptit Clou', 'Vortex', 'Bzzt', 'Tornadine', 'Capitaine Pivot',
];
