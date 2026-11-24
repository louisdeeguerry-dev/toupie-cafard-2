// La boutique entre les manches : investir dans le BUREAU (plus d'argent plus tard)
// ou dans la TOUPIE (plus forte tout de suite). C'est le choix stratégique principal d'une partie.

export const AMELIORATIONS = [
  // ---------- BUREAU : capitalisation ----------
  { id: 'nid', branche: 'bureau', nom: 'Nid de cafards', icone: '🪺', max: 6, prix: n => 3 + n * 2,
    desc: '+2 cafards par vague (donc plus de 💰)' },
  { id: 'dodus', branche: 'bureau', nom: 'Cafards dodus', icone: '🍩', max: 5, prix: n => 4 + n * 3,
    desc: '+25 % de 💰 par cafard écrasé' },
  { id: 'tirelire', branche: 'bureau', nom: 'Tirelire', icone: '🐷', max: 3, prix: n => 5 + n * 4,
    desc: '+1 💰 d\'intérêts maximum par manche' },
  { id: 'dore', branche: 'bureau', nom: 'Cafard doré', icone: '✨', max: 3, prix: n => 6 + n * 4,
    desc: '+5 % de chances qu\'un cafard soit doré (×5 💰)' },

  // ---------- TOUPIE : puissance ----------
  { id: 'aiguiser', branche: 'toupie', nom: 'Aiguiser la couronne', icone: '⚔️', stat: 'attaque', max: 8, prix: n => 3 + n * 2,
    desc: '+1 Attaque' },
  { id: 'huiler', branche: 'toupie', nom: 'Huiler la pointe', icone: '💨', stat: 'vitesse', max: 8, prix: n => 3 + n * 2,
    desc: '+1 Vitesse' },
  { id: 'ressort', branche: 'toupie', nom: 'Ressort du lanceur', icone: '🔋', stat: 'endurance', max: 8, prix: n => 3 + n * 2,
    desc: '+1 Endurance' },
  { id: 'stabiliser', branche: 'toupie', nom: 'Stabilisateur', icone: '⚖️', stat: 'equilibre', max: 8, prix: n => 3 + n * 2,
    desc: '+1 Équilibre' },
  { id: 'lester', branche: 'toupie', nom: 'Lester', icone: '🪨', stat: 'poids', max: 8, prix: n => 3 + n * 2,
    desc: '+1 Poids' },
];
export const AMELIO = Object.fromEntries(AMELIORATIONS.map(a => [a.id, a]));

export const NOMS_BOTS = [
  'Cafouillette', 'TourneVite', 'Sir Spinzalot', 'Mamie Toupie', 'Blatte Runner', 'Gyro Gearloose',
  'Pointe Sèche', 'La Foreuse', 'Kiki Couronne', 'Toupinator', 'Dame Vrille', 'Croque-Cafard',
  'Rotor', 'Ptit Clou', 'Vortex', 'Bzzt', 'Tornadine', 'Capitaine Pivot',
];
