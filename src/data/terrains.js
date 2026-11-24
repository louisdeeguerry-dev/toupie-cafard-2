// Terrains de duel. Contre les cafards, le bureau est toujours NEUTRE.
// En duel, chaque joueur peut avoir choisi un terrain à l'atelier (s'il l'a débloqué). Choisir un terrain coûte
// l'argent de départ de la partie. Si les deux joueurs en ont un, c'est la PRIORITÉ DE TERRAIN (points achetés en partie,
// cachés à l'adversaire) qui décide. Égalité : tirage au sort.

export const TERRAINS = [
  { id: 'aucun', nom: 'Aucun terrain', icone: '🪵', niveauRequis: 1,
    desc: 'Bureau neutre en duel. Tu commences la partie avec plus d\'argent.' },
  { id: 'rebond', nom: 'Bords rebondissants', icone: '🤸', niveauRequis: 2,
    desc: 'Les bords relancent les toupies : duels rapides et chaotiques.' },
  { id: 'collant', nom: 'Bords collants', icone: '🍯', niveauRequis: 3,
    desc: 'Les bords engluent les toupies : celle qui touche un bord perd sa vitesse et de la rotation.' },
  { id: 'cuve', nom: 'Cuve', icone: '🥣', niveauRequis: 4,
    desc: 'Le plateau est creusé en cuvette : les toupies glissent vers le centre et se percutent sans arrêt.' },
];
export const TERRAIN = Object.fromEntries(TERRAINS.map(t => [t.id, t]));

// Quel terrain pour un duel entre a et b ? (chacun : { terrain, niveaux: { priorite } })
export function terrainDuel(a, b, rand = Math.random) {
  const ta = a.terrain && a.terrain !== 'aucun' ? a.terrain : null;
  const tb = b.terrain && b.terrain !== 'aucun' ? b.terrain : null;
  if (!ta && !tb) return { terrain: null, de: null };
  if (ta && !tb) return { terrain: ta, de: a };
  if (tb && !ta) return { terrain: tb, de: b };
  const pa = a.niveaux.priorite || 0, pb = b.niveaux.priorite || 0;
  const gagnant = pa > pb ? a : pb > pa ? b : rand() < 0.5 ? a : b;
  return { terrain: gagnant.terrain, de: gagnant, egalite: pa === pb };
}
