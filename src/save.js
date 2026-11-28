// Sauvegarde de la progression hors partie : collection de pièces, toupie équipée, boîtes à ouvrir.
// localStorage peut être indisponible (navigation privée…) : le jeu fonctionne quand même, sans mémoire.
import { DEPART, PIECE } from './data/pieces.js';

const KEY = 'toupie-cafard-2-v1';

function neuf() {
  return {
    collection: Object.fromEntries(Object.values(DEPART).map(id => [id, 1])),
    equipe: { ...DEPART },
    boites: 1, // une boîte mystère offerte au premier lancement
    parties: 0,
    victoires: 0,
    meilleure: 0,
    ecrous: 0, // monnaie (achète des boîtes mystère)
    xp: 0,
    niveau: 1,
    rangPoints: 0, // parties classées
    meilleurRang: 0,
    mode: 'normale',
    niveauxPieces: {}, // niveau choisi pour chaque pièce (doublons)
    terrain: 'aucun', // terrain de duel choisi
    terrains: [], // terrains de duel trouvés dans les boîtes mystère
    boitesSansLegendaire: 0, // compteur de la garantie (légendaire assuré à la 30e boîte)
    builds: null, // 4 emplacements de build (rempli par verifierBuilds)
    buildActif: 0,
  };
}

export function charger() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    if (s && s.collection && s.equipe) {
      // On retire ce qui n'existe plus dans le catalogue (pièce renommée/supprimée)
      for (const id of Object.keys(s.collection)) if (!PIECE[id]) delete s.collection[id];
      for (const id of Object.values(DEPART)) s.collection[id] = s.collection[id] || 1; // nouveaux emplacements (lanceur)
      s.equipe = { ...DEPART, ...s.equipe };
      for (const [slot, id] of Object.entries(s.equipe)) if (!PIECE[id] || !s.collection[id] || PIECE[id].slot !== slot) s.equipe[slot] = DEPART[slot];
      const r = { ...neuf(), ...s };
      if (r.terrain !== 'aucun' && !r.terrains.includes(r.terrain)) r.terrain = 'aucun'; // terrain non possédé
      return verifierBuilds(r);
    }
  } catch { /* sauvegarde illisible ou stockage bloqué */ }
  return verifierBuilds(neuf());
}

// ---------------------------------------------------------------- Emplacements de build
// 4 builds nommés (toupie + lanceur + niveaux des pièces + terrain). L'équipement « actif » reste save.equipe /
// save.niveauxPieces / save.terrain (tout le jeu s'en sert) : changer de build recopie le build choisi dedans.
export const NB_BUILDS = 4, MAX_BUILDS = 12; // 4 au départ ; on peut en créer jusqu'à 12 et en supprimer (au moins 1)
const copieBuild = s => ({ equipe: { ...s.equipe }, niveauxPieces: { ...s.niveauxPieces }, terrain: s.terrain });
const buildNeuf = i => ({ nom: `Build ${i + 1}`, equipe: { ...DEPART }, niveauxPieces: {}, terrain: 'aucun' });
export function verifierBuilds(s) {
  if (!Array.isArray(s.builds) || !s.builds.length) s.builds = Array.from({ length: NB_BUILDS }, (_, i) => (i === (s.buildActif || 0) ? { nom: `Build ${i + 1}`, ...copieBuild(s) } : buildNeuf(i)));
  for (let i = 0; i < s.builds.length; i++) {
    const b = s.builds[i] ||= buildNeuf(i);
    b.nom = String(b.nom || `Build ${i + 1}`).slice(0, 20);
    b.equipe = { ...DEPART, ...b.equipe };
    for (const [slot, id] of Object.entries(b.equipe)) if (!PIECE[id] || !s.collection[id] || PIECE[id].slot !== slot) b.equipe[slot] = DEPART[slot];
    b.niveauxPieces ||= {};
    if (b.terrain !== 'aucun' && !(s.terrains || []).includes(b.terrain)) b.terrain = 'aucun';
  }
  s.builds.length = Math.min(MAX_BUILDS, s.builds.length);
  s.buildActif = Math.max(0, Math.min(s.builds.length - 1, s.buildActif || 0));
  return s;
}
// Recopie l'équipement actif dans son emplacement (appelé à chaque sauvegarde)
function noterBuild(s) {
  if (!s.builds) verifierBuilds(s);
  if (!s.builds[s.buildActif]) return;
  Object.assign(s.builds[s.buildActif], copieBuild(s));
}
export function creerBuild(s) {
  if (s.builds.length >= MAX_BUILDS) return false;
  noterBuild(s);
  let n = s.builds.length + 1;
  while (s.builds.some(b => b.nom === `Build ${n}`)) n++;
  s.builds.push({ ...buildNeuf(0), nom: `Build ${n}` });
  return true;
}
export function supprimerBuild(s, i) {
  if (s.builds.length <= 1) return false;
  noterBuild(s);
  s.builds.splice(i, 1);
  const actif = s.buildActif === i ? Math.min(i, s.builds.length - 1) : s.buildActif - (i < s.buildActif ? 1 : 0);
  s.buildActif = -1; // l'ancien actif n'existe plus : on charge le nouveau sans le recopier
  chargerBuild(s, actif);
  return true;
}
export function changerBuild(s, i) {
  noterBuild(s);
  verifierBuilds(s);
  chargerBuild(s, i);
}
function chargerBuild(s, i) {
  const b = s.builds[i];
  s.buildActif = i;
  // Remplacement EN PLACE : l'atelier garde des références vers ces objets
  for (const k of Object.keys(s.equipe)) delete s.equipe[k];
  Object.assign(s.equipe, b.equipe);
  for (const k of Object.keys(s.niveauxPieces)) delete s.niveauxPieces[k];
  Object.assign(s.niveauxPieces, b.niveauxPieces);
  s.terrain = b.terrain;
}

export function sauver(s) {
  if (s?.equipe) noterBuild(s);
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* stockage bloqué : tant pis */ }
}

export function reinitialiser() {
  try { localStorage.removeItem(KEY); } catch { /* rien */ }
  return neuf();
}
