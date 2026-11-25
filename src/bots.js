// Les bots : ils simulent de vrais joueurs. Chacun a une toupie faite de pièces au hasard (avec niveaux de pièce),
// un niveau de jeu (habileté), une façon de dépenser son argent (style), parfois un terrain.
// Pendant que tu joues tes lancers, eux « jouent » les leurs : leur argent dépend de leur toupie, de leur habileté
// et de la résistance des cafards, et ils achètent vraiment dans la boutique (mêmes prix que toi).
import { PARTIE, CAFARDS, ECONOMIE } from './config.js';
import { PIECES, SLOTS, RARETES } from './data/pieces.js';
import { TERRAINS } from './data/terrains.js';
import { AMELIO, MANCHE_PRIORITE } from './data/boutique.js';
import { statsToupie, puissance, tempsRotation } from './stats.js';
import { compositionEtape, TYPES } from './data/cafards.js';

const hasard = a => a[Math.floor(Math.random() * a.length)];
const entre = (a, b) => a + Math.random() * (b - a);

export const STYLES = {
  eco: { nom: 'économe', desc: 'Investit d\'abord dans le bureau, puis dans la toupie' },
  force: { nom: 'bagarreur', desc: 'Tout dans la toupie et le lanceur' },
  mixte: { nom: 'équilibré', desc: 'Un peu de tout' },
  specialiste: { nom: 'spécialiste', desc: 'Pousse 2 ou 3 stats à fond' },
};
const BUREAU = ['nid', 'prime', 'combo', 'chance', 'tirelire'];
const COMBAT = ['lames', 'endurance', 'puissance', 'elan', 'inertie', 'equilibre', 'poids', 'diametre', 'critique', 'glisse', 'precision'];

// Une pièce au hasard, avec les mêmes chances de rareté que les boîtes mystère (un bot a ouvert des boîtes lui aussi)
function pieceAuHasard(slot) {
  const total = Object.values(RARETES).reduce((a, r) => a + r.chance, 0);
  let x = Math.random() * total * 0.9, rar = 'commune'; // un peu moins de légendaires que la moyenne
  for (const [id, r] of Object.entries(RARETES)) if ((x -= r.chance) < 0) { rar = id; break; }
  const pool = PIECES.filter(p => p.slot === slot && p.rarete === rar);
  return pool.length ? hasard(pool) : hasard(PIECES.filter(p => p.slot === slot));
}

export function creerBot(nom) {
  const equipe = {}, nivPieces = {};
  for (const s of SLOTS) {
    const p = pieceAuHasard(s.id);
    equipe[s.id] = p.id;
    const r = Math.random();
    nivPieces[p.id] = r < 0.6 ? 1 : r < 0.88 ? 2 : 3; // certains bots jouent leurs doublons
  }
  const terrain = Math.random() < 0.35 ? hasard(TERRAINS.filter(t => t.id !== 'aucun')).id : 'aucun';
  // Habileté : la plupart des bots sont moyens, quelques-uns très bons ou très mauvais
  const habilete = Math.min(0.95, Math.max(0.2, (Math.random() + Math.random() + Math.random()) / 3 * 0.9 + 0.1));
  const style = hasard(Object.keys(STYLES));
  const focus = style === 'specialiste' ? [...COMBAT].sort(() => Math.random() - 0.5).slice(0, 2 + Math.floor(Math.random() * 2)) : null;
  return {
    nom, bot: true, vies: PARTIE.vies, equipe, nivPieces, terrain, niveaux: {}, elimine: false, place: 0,
    habilete, style, focus, argent: terrain !== 'aucun' ? PARTIE.argentAvecTerrain : PARTIE.argentSansTerrain,
  };
}

// ---------------------------------------------------------------- Manche de cafards simulée
// Cafards tués ≈ capacité du bureau × taux de réussite (habileté, dégâts de la toupie face à la vie des cafards)
export function jouerLancerBot(b, n, etape) {
  const s = statsToupie(b.equipe, b.niveaux, b.nivPieces);
  const comp = compositionEtape(etape);
  const vieMoy = CAFARDS.vieCafard(n, etape) * Object.entries(comp).reduce((a, [t, p]) => a + p * TYPES[t].vie, 0);
  const coups = Math.max(1, vieMoy / (2.6 * s.lames * (1 + s.crit * (s.critMult - 1))));
  const couverture = (s.rayon / 0.04) * Math.sqrt(s.vitesse / 0.95) * Math.min(1.3, Math.sqrt(tempsRotation(s) / 11.6));
  const taux = Math.min(0.85, Math.max(0.05, b.habilete * 0.75 * couverture / Math.pow(coups, 0.7) * entre(0.75, 1.25)));
  const capacite = Math.max(4, CAFARDS.capacite + s.nid);
  const tues = Math.round(capacite * taux * s.toupies ** 0.5);
  const primeMoy = Object.entries(comp).reduce((a, [t, p]) => a + p * TYPES[t].prime, 0);
  const gain = Math.round(tues * CAFARDS.prime * CAFARDS.primeEtape(etape) * primeMoy * s.prime * (1 + s.chanceDore * 3) * (1 + s.comboBonus * 2));
  b.argent += gain;
  return tues;
}

// Fin de manche : revenu + intérêts, puis achats selon le style
export function finMancheBot(b, manche, etape) {
  const s = statsToupie(b.equipe, b.niveaux, b.nivPieces);
  b.argent += ECONOMIE.revenuManche + Math.min(Math.floor(b.argent / ECONOMIE.interetPour), s.interetMax);
  const voulu = () => {
    if (b.style === 'eco') return etape < 3 ? BUREAU : COMBAT;
    if (b.style === 'force') return COMBAT;
    if (b.style === 'specialiste') return Math.random() < 0.75 ? b.focus : COMBAT;
    return Math.random() < 0.45 ? BUREAU : COMBAT;
  };
  const garde = b.style === 'eco' && etape < 3 ? 10 : 0; // l'économe garde de quoi toucher des intérêts
  for (let essais = 0; essais < 30; essais++) {
    const id = hasard(voulu()), a = AMELIO[id], niv = b.niveaux[id] || 0;
    if (!a || niv >= a.max) continue;
    const prix = a.prix(niv);
    if (b.argent - prix < garde) continue;
    b.argent -= prix;
    b.niveaux[id] = niv + 1;
  }
  // Priorité de terrain, en secret, à partir de la 3e manche
  if (b.terrain !== 'aucun' && manche >= MANCHE_PRIORITE && b.argent >= 4 && Math.random() < 0.4) {
    const n = b.niveaux.priorite || 0, prix = AMELIO.priorite.prix(n);
    if (b.argent >= prix) { b.argent -= prix; b.niveaux.priorite = n + 1; }
  }
}

// ---------------------------------------------------------------- Duels
// Lancer d'un bot face à toi : plus il est habile, plus il vise juste et lance fort (et touche parfois PARFAIT)
export function lancerDuelBot(b, cible) {
  const bruit = (1 - b.habilete) * 0.5;
  const tx = (cible ? cible.x : 0) + (Math.random() - 0.5) * bruit, tz = (cible ? cible.z : 0.1) + (Math.random() - 0.5) * bruit;
  const parfait = Math.random() < b.habilete * b.habilete * 0.8;
  const puiss = parfait ? 1.08 : Math.min(1, Math.max(0.3, 0.45 + 0.5 * b.habilete + (Math.random() - 0.5) * bruit));
  return { tx, tz, puiss };
}

// Duel entre deux bots (simulé) : puissance de la toupie × habileté × hasard
export function duelSimule(a, b) {
  const f = j => puissance(j.equipe, j.niveaux, j.nivPieces) * (0.6 + 0.8 * j.habilete) * entre(0.7, 1.3);
  return f(a) >= f(b) ? a : b;
}

