// Les bots : ils simulent de vrais joueurs. Chacun a une toupie faite de pièces au hasard (avec niveaux de pièce),
// un niveau de jeu (habileté), une façon de dépenser son argent (style), parfois un terrain.
// Pendant que tu joues tes lancers, eux « jouent » les leurs : leur argent dépend de leur toupie, de leur habileté
// et de la résistance des cafards, et ils achètent vraiment dans la boutique (mêmes prix que toi).
import { PARTIE, CAFARDS, ECONOMIE, BOUTIQUE } from './config.js';
import { PIECES, SLOTS, RARETES } from './data/pieces.js';
import { TERRAINS } from './data/terrains.js';
import { AMELIO, MANCHE_PRIORITE, paquet, tirerOffresPour } from './data/boutique.js';
import { statsToupie, tempsRotation } from './stats.js';
import { compositionEtape, TYPES } from './data/cafards.js';

const hasard = a => a[Math.floor(Math.random() * a.length)];
const entre = (a, b) => a + Math.random() * (b - a);

export const STYLES = {
  eco: { nom: 'économe', desc: 'Investit d\'abord dans le bureau, puis dans la toupie' },
  force: { nom: 'bagarreur', desc: 'Tout dans la toupie et le lanceur' },
  mixte: { nom: 'équilibré', desc: 'Un peu de tout' },
  specialiste: { nom: 'spécialiste', desc: 'Pousse 2 ou 3 stats à fond' },
};
const BUREAU = ['nid', 'prime', 'combo', 'chance', 'tirelire', 'veine'];
const COMBAT = ['lames', 'endurance', 'puissance', 'elan', 'inertie', 'equilibre', 'poids', 'diametre', 'critique', 'glisse', 'precision'];

// Une pièce au hasard, avec les mêmes chances de rareté que les boîtes mystère (un bot a ouvert des boîtes lui aussi)
function pieceAuHasard(slot) {
  const total = Object.values(RARETES).reduce((a, r) => a + r.chance, 0);
  let x = Math.random() * total * 0.9, rar = 'commune'; // un peu moins de légendaires que la moyenne
  for (const [id, r] of Object.entries(RARETES)) if ((x -= r.chance) < 0) { rar = id; break; }
  const pool = PIECES.filter(p => p.slot === slot && p.rarete === rar);
  return pool.length ? hasard(pool) : hasard(PIECES.filter(p => p.slot === slot));
}

const ARCHETYPES = [
  ['poids', 'inertie', 'equilibre', 'puissance'], // lourd
  ['elan', 'glisse', 'agressivite', 'vitesse'], // rapide
  ['lames', 'critique', 'eclair', 'feu'], // tranchant
  ['endurance', 'souffle', 'equilibre', 'inertie'], // endurant
  ['prime', 'chance', 'combo', 'nid', 'lames'], // économe
];
export function creerBot(nom) {
  const equipe = {}, nivPieces = {}, arch = hasard(ARCHETYPES);
  const score = p => Object.entries(p.niveaux).reduce((a, [k, v]) => a + (arch.includes(k) ? v : 0), 0);
  for (const s of SLOTS) {
    // Comme un vrai joueur : parmi quelques pièces possédées, il équipe celle qui colle à son style
    const p = [pieceAuHasard(s.id), pieceAuHasard(s.id), pieceAuHasard(s.id)].sort((x, y) => score(y) - score(x))[0];
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
    nom, bot: true, vies: PARTIE.vies, equipe, nivPieces, terrain, niveaux: {}, achats: {}, elimine: false, place: 0,
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
  const gain = Math.round(tues * CAFARDS.prime * CAFARDS.primeEtape(etape) * primeMoy * s.prime * (1 + s.chanceDore * 3) * (1 + s.comboBonus));
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
  // Même boutique que le joueur : 4 offres au hasard (raretés selon sa Chance), relance après chaque achat,
  // relances payantes (prix croissant) quand rien ne lui convient
  const tirer = () => tirerOffresPour(b.achats, statsToupie(b.equipe, b.niveaux, b.nivPieces).veine);
  let offres = tirer(), relances = 0;
  for (let essais = 0; essais < 30; essais++) {
    const voulus = voulu();
    const ok = offres.map(o => ({ o, pq: paquet(AMELIO[o.id], b.achats[o.id] || 0, o.rarete) }))
      .filter(({ o, pq }) => pq && voulus.includes(o.id) && b.argent - pq.prix >= garde);
    if (ok.length) {
      const { o, pq } = ok.sort((x, y) => y.pq.niveaux / y.pq.prix - x.pq.niveaux / x.pq.prix)[0]; // la meilleure affaire
      b.argent -= pq.prix;
      b.niveaux[o.id] = (b.niveaux[o.id] || 0) + pq.niveaux;
      b.achats[o.id] = (b.achats[o.id] || 0) + pq.achats;
      offres = tirer();
      continue;
    }
    const prixR = BOUTIQUE.relance(relances);
    if (relances < 4 && b.argent - prixR >= garde + 6) { b.argent -= prixR; relances++; offres = tirer(); continue; }
    break;
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
  // Les bons bots anticipent : ils visent là où ta toupie VA être
  const avance = 0.15 + 0.35 * b.habilete;
  const tx = (cible ? cible.x + cible.vx * avance : 0) + (Math.random() - 0.5) * bruit;
  const tz = (cible ? cible.z + cible.vz * avance : 0.1) + (Math.random() - 0.5) * bruit;
  const parfait = Math.random() < b.habilete * b.habilete * 0.8;
  const puiss = parfait ? 1.08 : Math.min(1, Math.max(0.3, 0.45 + 0.5 * b.habilete + (Math.random() - 0.5) * bruit));
  return { tx, tz, puiss };
}

// Duel entre deux bots (simulé) : stats de combat de la toupie (rotation, endurance, lames, inertie, poids)
// × habileté × hasard. Les stats du Bureau ne comptent pas.
export function forceDuel(j) {
  const s = statsToupie(j.equipe, j.niveaux, j.nivPieces);
  return (s.tours / 600) * Math.sqrt(tempsRotation(s) / 11.6) * Math.sqrt(s.lames) * Math.pow(s.masse / 20, 0.3) / Math.sqrt(s.inertie)
    * Math.pow(0.7, s.toupies - 1) * s.toupies;
}
export function duelSimule(a, b) {
  const f = j => forceDuel(j) * (0.6 + 0.8 * j.habilete) * entre(0.7, 1.3);
  return f(a) >= f(b) ? a : b;
}

