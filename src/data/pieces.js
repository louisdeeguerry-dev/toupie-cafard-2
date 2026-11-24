// Le catalogue des pièces de toupie. Une toupie = 4 emplacements : base, couronne, pointe, âme.
// Chaque pièce donne des avantages ET des inconvénients (modificateurs ajoutés aux stats de base).

export const SLOTS = [
  { id: 'base', nom: 'Base', icone: '⚙️', desc: 'Le cœur de la toupie : son poids et sa tenue.' },
  { id: 'couronne', nom: 'Couronne', icone: '👑', desc: 'Le tour de la toupie : c\'est elle qui frappe les cafards et les autres toupies.' },
  { id: 'pointe', nom: 'Pointe', icone: '🔻', desc: 'Ce qui touche le plateau : vitesse et équilibre.' },
  { id: 'ame', nom: 'Âme', icone: '✴️', desc: 'Le signe sur le dessus de la toupie : un pouvoir passif.' },
];

export const STATS = [
  { id: 'attaque', nom: 'Attaque', icone: '⚔️', desc: 'Dégâts infligés aux cafards et aux toupies adverses' },
  { id: 'vitesse', nom: 'Vitesse', icone: '💨', desc: 'Vitesse de lancer et de déplacement' },
  { id: 'endurance', nom: 'Endurance', icone: '🔋', desc: 'Durée de rotation : plus elle est haute, plus la toupie tourne longtemps' },
  { id: 'equilibre', nom: 'Équilibre', icone: '⚖️', desc: 'Résistance aux chocs : une toupie instable perd beaucoup de rotation quand on la frappe' },
  { id: 'poids', nom: 'Poids', icone: '🪨', desc: 'Plus elle est lourde, moins elle est repoussée' },
];

export const RARETES = {
  commune: { nom: 'Commune', couleur: '#b9c2cc', chance: 55 },
  rare: { nom: 'Rare', couleur: '#4aa3ff', chance: 30 },
  epique: { nom: 'Épique', couleur: '#b56cff', chance: 12 },
  legendaire: { nom: 'Légendaire', couleur: '#ffb020', chance: 3 },
};

// forme : utilisée par topMesh.js pour dessiner la pièce
export const PIECES = [
  // ---------- BASES ----------
  { id: 'base-standard', slot: 'base', nom: 'Base standard', rarete: 'commune', forme: 'standard', couleur: 0x8f99a5,
    stats: {}, desc: 'Équilibrée, sans surprise.' },
  { id: 'base-plomb', slot: 'base', nom: 'Base en plomb', rarete: 'rare', forme: 'lourde', couleur: 0x4f5864,
    stats: { poids: 3, equilibre: 1, vitesse: -2 }, desc: 'Très lourde : dure à bousculer, mais lente.' },
  { id: 'base-alu', slot: 'base', nom: 'Base alu ajourée', rarete: 'rare', forme: 'legere', couleur: 0xd7dde3,
    stats: { vitesse: 2, endurance: 1, poids: -2 }, desc: 'Légère et rapide, mais facile à repousser.' },
  { id: 'base-gyro', slot: 'base', nom: 'Base gyroscope', rarete: 'epique', forme: 'gyro', couleur: 0x2e8b7a,
    stats: { equilibre: 3, endurance: 1, attaque: -1 }, desc: 'Un anneau intérieur qui la garde droite.' },
  { id: 'base-noyau', slot: 'base', nom: 'Noyau de météorite', rarete: 'legendaire', forme: 'noyau', couleur: 0x6b2f9e,
    stats: { poids: 3, attaque: 2, endurance: 1, vitesse: -1 }, desc: 'Une pierre tombée du ciel, lourde et dure.' },

  // ---------- COURONNES ----------
  { id: 'couronne-standard', slot: 'couronne', nom: 'Couronne ronde', rarete: 'commune', forme: 'standard', couleur: 0xc0392b,
    stats: {}, desc: 'Un anneau tout simple.' },
  { id: 'couronne-dents', slot: 'couronne', nom: 'Couronne dentée', rarete: 'rare', forme: 'dents', couleur: 0xe67e22,
    stats: { attaque: 3, endurance: -2 }, desc: 'Des dents qui mordent, mais qui freinent.' },
  { id: 'couronne-bouclier', slot: 'couronne', nom: 'Couronne bouclier', rarete: 'rare', forme: 'bouclier', couleur: 0x2c6fbb,
    stats: { equilibre: 2, poids: 1, attaque: -2 }, desc: 'Lisse et épaisse : encaisse les chocs, frappe peu.' },
  { id: 'couronne-lames', slot: 'couronne', nom: 'Couronne à lames', rarete: 'epique', forme: 'lames', couleur: 0xd8dde4,
    stats: { attaque: 5, equilibre: -2, endurance: -1 }, desc: 'Quatre lames tranchantes. Dangereuse… pour tout le monde.' },
  { id: 'couronne-inertie', slot: 'couronne', nom: 'Anneau d\'inertie', rarete: 'legendaire', forme: 'inertie', couleur: 0xffc531,
    stats: { endurance: 3, poids: 2, attaque: 1, vitesse: -1 }, desc: 'Un anneau d\'or massif qui garde l\'élan.' },

  // ---------- POINTES ----------
  { id: 'pointe-standard', slot: 'pointe', nom: 'Pointe standard', rarete: 'commune', forme: 'standard', couleur: 0x7f8c8d,
    stats: {}, desc: 'Ni trop fine, ni trop large.' },
  { id: 'pointe-ventouse', slot: 'pointe', nom: 'Pointe ventouse', rarete: 'commune', forme: 'ventouse', couleur: 0x27ae60,
    stats: { equilibre: 2, vitesse: -1 }, desc: 'Colle un peu au bureau : stable, un peu lente.' },
  { id: 'pointe-clou', slot: 'pointe', nom: 'Pointe clou', rarete: 'rare', forme: 'clou', couleur: 0xaab4bd,
    stats: { vitesse: 4, attaque: 1, equilibre: -4 }, desc: 'Très fine : énormément de vitesse, mais très peu d\'équilibre.' },
  { id: 'pointe-foreuse', slot: 'pointe', nom: 'Pointe foreuse', rarete: 'rare', forme: 'foreuse', couleur: 0xb8860b,
    stats: { equilibre: 4, vitesse: -3, endurance: -2 }, desc: 'Plantée dans le bureau : énormément de stabilité, mais lente et vite fatiguée.' },
  { id: 'pointe-bille', slot: 'pointe', nom: 'Pointe bille', rarete: 'epique', forme: 'bille', couleur: 0xecf0f1,
    stats: { endurance: 3, vitesse: 1, attaque: -1 }, desc: 'Roule sans frotter : tourne très longtemps.' },

  // ---------- ÂMES (passifs) ----------
  { id: 'ame-vide', slot: 'ame', nom: 'Sans âme', rarete: 'commune', forme: 'vide', couleur: 0x95a5a6,
    stats: {}, passif: null, desc: 'Pas de pouvoir.' },
  { id: 'ame-flamme', slot: 'ame', nom: 'Âme de flamme', rarete: 'rare', forme: 'flamme', couleur: 0xff6b1a,
    stats: {}, passif: 'flamme', desc: '+50 % de dégâts tant que la toupie va vite.' },
  { id: 'ame-aimant', slot: 'ame', nom: 'Âme aimant', rarete: 'rare', forme: 'aimant', couleur: 0xe74c3c,
    stats: {}, passif: 'aimant', desc: 'Attirée par le cafard ou la toupie la plus proche.' },
  { id: 'ame-ressort', slot: 'ame', nom: 'Âme ressort', rarete: 'epique', forme: 'ressort', couleur: 0x3498db,
    stats: {}, passif: 'ressort', desc: 'Chaque rebond sur un bord la relance au lieu de la freiner.' },
  { id: 'ame-sangsue', slot: 'ame', nom: 'Âme sangsue', rarete: 'epique', forme: 'sangsue', couleur: 0x2ecc71,
    stats: {}, passif: 'sangsue', desc: 'Chaque cafard écrasé lui rend de la rotation.' },
  { id: 'ame-carapace', slot: 'ame', nom: 'Âme carapace', rarete: 'legendaire', forme: 'carapace', couleur: 0xf1c40f,
    stats: {}, passif: 'carapace', desc: 'Le premier gros choc reçu en duel est annulé.' },
];

export const PIECE = Object.fromEntries(PIECES.map(p => [p.id, p]));
export const DEPART = { base: 'base-standard', couronne: 'couronne-standard', pointe: 'pointe-standard', ame: 'ame-vide' };

// Tirage d'une boîte mystère : rareté d'abord, puis une pièce au hasard de cette rareté (hors pièces de départ)
export function tirerPiece(rand = Math.random) {
  const total = Object.values(RARETES).reduce((a, r) => a + r.chance, 0);
  let x = rand() * total, rarete = 'commune';
  for (const [id, r] of Object.entries(RARETES)) { if ((x -= r.chance) < 0) { rarete = id; break; } }
  const pool = PIECES.filter(p => p.rarete === rarete && !Object.values(DEPART).includes(p.id));
  return pool[Math.floor(rand() * pool.length)];
}
