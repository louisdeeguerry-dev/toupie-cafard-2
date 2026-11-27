// Progression hors partie : monnaie, expérience (niveau de joueur), rang (parties classées), boîtes mystère.
// À la fin de chaque partie on gagne selon sa place ; en partie classée, le rang monte ou descend.

export const MODES = {
  normale: { nom: 'Partie normale', icone: '🎮', desc: 'Pour s\'entraîner et tester des toupies : pas de rang en jeu.' },
  classee: { nom: 'Partie classée', icone: '🏆', desc: 'Ta place fait monter ou descendre ton rang.' },
};

export const MONNAIE = { nom: 'Écrous', icone: '🔩' };
export const PRIX_BOITE = 100;

// Gains selon la place (1re → 8e)
const ECROUS = [100, 75, 60, 50, 35, 30, 25, 20];
const XP = [200, 170, 150, 130, 100, 90, 80, 70];
const POINTS_RANG = [40, 30, 20, 10, -10, -20, -30, -40];

export const RANGS = [
  { nom: 'Carton', icone: '📦', min: 0 },
  { nom: 'Bois', icone: '🪵', min: 100 },
  { nom: 'Bronze', icone: '🥉', min: 250 },
  { nom: 'Argent', icone: '🥈', min: 450 },
  { nom: 'Or', icone: '🥇', min: 700 },
  { nom: 'Platine', icone: '💠', min: 1000 },
  { nom: 'Diamant', icone: '💎', min: 1400 },
  { nom: 'Maître de la Toupie', icone: '👑', min: 1900 },
];
export const rangDe = points => [...RANGS].reverse().find(r => points >= r.min);
export const xpPourNiveau = n => 300 + 100 * (n - 1);

// Calcule et applique les récompenses ; renvoie le détail pour l'écran de fin
export function recompenser(save, place, mode) {
  const i = Math.max(0, Math.min(7, place - 1));
  const r = { ecrous: ECROUS[i], xp: XP[i], boites: place === 1 ? 1 : 0, niveaux: 0, points: 0, rangAvant: rangDe(save.rangPoints), rangApres: null };
  save.ecrous += r.ecrous;
  save.xp += r.xp;
  while (save.xp >= xpPourNiveau(save.niveau)) { // chaque niveau de joueur offre une boîte mystère
    save.xp -= xpPourNiveau(save.niveau);
    save.niveau++;
    r.niveaux++;
    r.boites++;
  }
  save.boites += r.boites;
  if (mode === 'classee') {
    r.points = POINTS_RANG[i];
    save.rangPoints = Math.max(0, save.rangPoints + r.points);
    save.meilleurRang = Math.max(save.meilleurRang || 0, save.rangPoints);
  }
  r.rangApres = rangDe(save.rangPoints);
  save.parties++;
  if (place === 1) save.victoires++;
  save.meilleure = save.meilleure ? Math.min(save.meilleure, place) : place;
  return r;
}

// Boutique : un produit = N boîtes mystère pour un prix (petit paquet 1 pour 100, gros carton 5 pour 450)
export function acheterProduit(save, { pieces, prix }) {
  if (save.ecrous < prix) return false;
  save.ecrous -= prix;
  save.boites += pieces;
  return true;
}
export function acheterBoite(save) {
  if (save.ecrous < PRIX_BOITE) return false;
  save.ecrous -= PRIX_BOITE;
  save.boites++;
  return true;
}
