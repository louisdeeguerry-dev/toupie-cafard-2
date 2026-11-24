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
      return r;
    }
  } catch { /* sauvegarde illisible ou stockage bloqué */ }
  return neuf();
}

export function sauver(s) {
  try { localStorage.setItem(KEY, JSON.stringify(s)); } catch { /* stockage bloqué : tant pis */ }
}

export function reinitialiser() {
  try { localStorage.removeItem(KEY); } catch { /* rien */ }
  return neuf();
}
