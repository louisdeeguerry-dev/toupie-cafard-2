// Terrains de duel. Contre les cafards, le bureau est toujours NEUTRE.
// En duel, chaque joueur peut avoir choisi un terrain à l'atelier (s'il l'a débloqué). Choisir un terrain coûte
// l'argent de départ de la partie. Si les deux joueurs en ont un, c'est la PRIORITÉ DE TERRAIN (points achetés en partie,
// cachés à l'adversaire) qui décide. Égalité : bureau neutre.
// Les terrains se trouvent dans les BOÎTES MYSTÈRE : récompenses LÉGENDAIRES, tous avec la même chance, sans doublon
// (une fois trouvé, il est à toi). Voir tirerBoite() dans pieces.js.

export const TERRAINS = [
  { id: 'aucun', nom: 'Aucun terrain', icone: '🪵', rarete: null,
    desc: 'Bureau neutre en duel. Tu commences la partie avec plus d\'argent.' },
  { id: 'rebond', nom: 'Bords rebondissants', icone: '🤸', rarete: 'legendaire',
    desc: 'Arène carrée : chaque bande accélère la toupie (+35 %, jusqu\'à presque 2× sa vitesse de lancer). Idéal pour les toupies d\'Élan.' },
  { id: 'collant', nom: 'Bords collants', icone: '🍯', rarete: 'legendaire',
    desc: 'Les bords engluent les toupies : celle qui touche un bord perd sa vitesse et de la rotation.' },
  { id: 'cuve', nom: 'Cuve', icone: '🥣', rarete: 'legendaire',
    desc: 'Le plateau est creusé en cuvette : les toupies glissent vers le centre et se percutent sans arrêt.' },
];
export const TERRAIN = Object.fromEntries(TERRAINS.map(t => [t.id, t]));

// Quel terrain pour un duel entre a et b ? (chacun : { terrain, niveaux: { priorite } })
export function terrainDuel(a, b) {
  const ta = a.terrain && a.terrain !== 'aucun' ? a.terrain : null;
  const tb = b.terrain && b.terrain !== 'aucun' ? b.terrain : null;
  if (!ta && !tb) return { terrain: null, de: null };
  if (ta && !tb) return { terrain: ta, de: a };
  if (tb && !ta) return { terrain: tb, de: b };
  const pa = a.niveaux.priorite || 0, pb = b.niveaux.priorite || 0;
  if (ta === tb) return { terrain: ta, de: pa >= pb ? a : b }; // même terrain : pas de conflit
  if (pa === pb) return { terrain: null, de: null, egalite: true }; // égalité de priorité : bureau neutre
  const gagnant = pa > pb ? a : b;
  return { terrain: gagnant.terrain, de: gagnant };
}
