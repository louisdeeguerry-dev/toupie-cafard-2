// Calcul des stats d'une toupie et traduction en grandeurs physiques.
import { STATS, PIECE } from './data/pieces.js';
import { AMELIORATIONS } from './data/boutique.js';
import { STAT_BASE, STAT_MIN } from './config.js';

// equipe : { base, couronne, pointe, ame } (ids de pièces) ; niveaux : { aiguiser: 2, ... }
export function statsToupie(equipe, niveaux = {}) {
  const s = Object.fromEntries(STATS.map(st => [st.id, STAT_BASE]));
  for (const id of Object.values(equipe)) {
    const p = PIECE[id];
    if (!p) continue;
    for (const [k, v] of Object.entries(p.stats)) s[k] += v;
  }
  for (const a of AMELIORATIONS) if (a.stat && niveaux[a.id]) s[a.stat] += niveaux[a.id];
  for (const k of Object.keys(s)) s[k] = Math.max(STAT_MIN, s[k]);
  return s;
}

export function passifToupie(equipe) {
  return PIECE[equipe.ame]?.passif || null;
}

// Grandeurs physiques (unités : mètres, secondes). Les stats tournent autour de 5.
export function physique(s) {
  return {
    rayon: 0.042,
    vitesseLancer: 0.55 + 0.085 * s.vitesse, // m/s à pleine puissance
    derive: 0.10 + 0.012 * s.vitesse, // la toupie « danse » sur le bureau
    frottement: 0.32,
    rotation: 100 * (0.7 + 0.07 * s.endurance), // la « vie » de la toupie
    usure: 0.075 * (1.35 - 0.05 * s.endurance), // perte de rotation par seconde (proportionnelle)
    seuilChute: Math.min(0.42, Math.max(0.08, 0.34 - 0.022 * s.equilibre)), // tombe sous cette fraction de sa rotation
    instabilite: Math.max(0.35, 1.45 - 0.08 * s.equilibre), // multiplicateur des pertes de rotation dues aux chocs
    masse: 0.6 + 0.12 * s.poids,
    degats: 0.6 + 0.45 * s.attaque,
  };
}

// Puissance globale d'une toupie (utilisée pour simuler les duels entre bots)
export function puissance(s) {
  return s.attaque * 1.2 + s.vitesse + s.endurance * 1.1 + s.equilibre + s.poids * 0.9;
}
