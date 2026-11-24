import { TERRAINS } from './terrains.js';
// Le catalogue des pièces. Toupie = 4 emplacements (base, couronne, pointe, âme) ; lanceur = 2 (engrenage, ressort).
// Chaque pièce donne des NIVEAUX dans les stats du jeu 1 (voir src/stats.js).
//
// RÈGLE D'ÉQUILIBRAGE : chaque pièce a autant de bonus que de malus (somme pondérée des niveaux = 0, vérifiée par
// tests/equilibre.mjs ; un niveau de Multi-lancer vaut 10, car une toupie de plus double presque tout).
// Une pièce rare n'est donc pas « meilleure » : elle est plus spécialisée. Les doublons débloquent des NIVEAUX de pièce
// qui amplifient TOUT (bonus ET malus) : une pièce niveau 2 est plus extrême, pas plus forte.
//
// On choisit ses pièces AVANT la partie : une fois la partie lancée, tout est verrouillé jusqu'à la fin.

export const SLOTS = [
  { id: 'base', groupe: 'toupie', nom: 'Base', icone: '⚙️', desc: 'Le cœur de la toupie : son poids et sa tenue.' },
  { id: 'couronne', groupe: 'toupie', nom: 'Couronne', icone: '👑', desc: 'Le tour de la toupie : c\'est elle qui frappe les cafards et les autres toupies.' },
  { id: 'pointe', groupe: 'toupie', nom: 'Pointe', icone: '🔻', desc: 'Ce qui touche le plateau : vitesse et équilibre.' },
  { id: 'ame', groupe: 'toupie', nom: 'Âme', icone: '✴️', desc: 'Le signe sur le dessus de la toupie : un pouvoir, contre un sacrifice.' },
  { id: 'engrenage', groupe: 'lanceur', nom: 'Engrenage', icone: '⚙️', desc: 'Donne la vitesse de rotation. Un gros engrenage prend la place du ressort : moins d\'élan.' },
  { id: 'ressort', groupe: 'lanceur', nom: 'Ressort', icone: '🌀', desc: 'Donne l\'élan. Un gros ressort prend la place de l\'engrenage : moins de rotation.' },
];

export const RARETES = {
  commune: { nom: 'Commune', couleur: '#b9c2cc', chance: 55 },
  rare: { nom: 'Rare', couleur: '#4aa3ff', chance: 30 },
  epique: { nom: 'Épique', couleur: '#b56cff', chance: 12 },
  legendaire: { nom: 'Légendaire', couleur: '#ffb020', chance: 3 },
};

// Niveaux de pièce : avec N exemplaires, on peut jouer la pièce jusqu'au niveau N (max 5).
// Niveau k : tous les bonus ET tous les malus ×(1 + 0,5 × (k − 1)) → ×1,5 au niveau 2, ×2 au niveau 3…
export const NIVEAU_PIECE_MAX = 5;
export const POIDS_EQUILIBRAGE = { multi: 10 };
export const multiplicateurNiveau = k => 1 + 0.5 * (Math.max(1, k) - 1);
export function niveauxPiece(p, k = 1) {
  const m = multiplicateurNiveau(k), r = {};
  for (const [s, v] of Object.entries(p.niveaux)) r[s] = Math.sign(v) * Math.round(Math.abs(v) * m);
  return r;
}

// niveaux : ajoutés aux stats (ids de src/stats.js) ; forme : utilisée par topMesh.js pour dessiner la pièce
export const PIECES = [
  // ---------- BASES ----------
  { id: 'base-standard', slot: 'base', nom: 'Base standard', rarete: 'commune', forme: 'standard', couleur: 0x8f99a5,
    niveaux: {}, desc: 'Équilibrée, sans surprise.' },
  { id: 'base-plomb', slot: 'base', nom: 'Base en plomb', rarete: 'rare', forme: 'lourde', couleur: 0x4f5864,
    niveaux: { poids: 6, inertie: 3, glisse: -4, elan: -5 }, desc: 'Très lourde : dure à bousculer, mais lente.' },
  { id: 'base-alu', slot: 'base', nom: 'Base alu ajourée', rarete: 'rare', forme: 'legere', couleur: 0xd7dde3,
    niveaux: { elan: 4, glisse: 3, poids: -4, inertie: -3 }, desc: 'Légère et rapide, mais facile à repousser.' },
  { id: 'base-gyro', slot: 'base', nom: 'Base gyroscope', rarete: 'epique', forme: 'gyro', couleur: 0x2e8b7a,
    niveaux: { equilibre: 6, inertie: 2, lames: -4, glisse: -4 }, desc: 'Un anneau intérieur qui la garde droite, au prix du mordant.' },
  { id: 'base-noyau', slot: 'base', nom: 'Noyau de météorite', rarete: 'legendaire', forme: 'noyau', couleur: 0x6b2f9e,
    niveaux: { poids: 5, lames: 4, puissance: 3, elan: -5, endurance: -4, glisse: -3 }, desc: 'Une pierre tombée du ciel : un bélier lourd et dur, mais pataud.' },

  // ---------- COURONNES ----------
  { id: 'couronne-standard', slot: 'couronne', nom: 'Couronne ronde', rarete: 'commune', forme: 'standard', couleur: 0xc0392b,
    niveaux: {}, desc: 'Un anneau tout simple.' },
  { id: 'couronne-large', slot: 'couronne', nom: 'Couronne large', rarete: 'commune', forme: 'large', couleur: 0x16a085,
    niveaux: { diametre: 5, poids: 1, glisse: -3, elan: -3 }, desc: 'Plus grande : touche plus de cafards, mais freine.' },
  { id: 'couronne-dents', slot: 'couronne', nom: 'Couronne dentée', rarete: 'rare', forme: 'dents', couleur: 0xe67e22,
    niveaux: { lames: 5, critique: 3, endurance: -5, equilibre: -3 }, desc: 'Des dents qui mordent, mais qui freinent et secouent.' },
  { id: 'couronne-bouclier', slot: 'couronne', nom: 'Couronne bouclier', rarete: 'rare', forme: 'bouclier', couleur: 0x2c6fbb,
    niveaux: { inertie: 6, diametre: 2, lames: -5, elan: -3 }, desc: 'Lisse et épaisse : encaisse les chocs, frappe peu.' },
  { id: 'couronne-lames', slot: 'couronne', nom: 'Couronne à lames', rarete: 'epique', forme: 'lames', couleur: 0xd8dde4,
    niveaux: { lames: 8, critique: 4, equilibre: -6, endurance: -4, inertie: -2 }, desc: 'Quatre lames tranchantes. Dangereuse… pour tout le monde.' },
  { id: 'couronne-inertie', slot: 'couronne', nom: 'Anneau d\'inertie', rarete: 'legendaire', forme: 'inertie', couleur: 0xffc531,
    niveaux: { endurance: 5, poids: 3, puissance: 3, elan: -5, glisse: -3, lames: -3 }, desc: 'Un anneau d\'or massif qui garde l\'élan… une fois lancé.' },

  // ---------- POINTES ----------
  { id: 'pointe-standard', slot: 'pointe', nom: 'Pointe standard', rarete: 'commune', forme: 'standard', couleur: 0x7f8c8d,
    niveaux: {}, desc: 'Ni trop fine, ni trop large.' },
  { id: 'pointe-ventouse', slot: 'pointe', nom: 'Pointe ventouse', rarete: 'commune', forme: 'ventouse', couleur: 0x27ae60,
    niveaux: { equilibre: 4, inertie: 1, glisse: -5 }, desc: 'Colle un peu au bureau : stable, mais glisse mal.' },
  { id: 'pointe-clou', slot: 'pointe', nom: 'Pointe clou', rarete: 'rare', forme: 'clou', couleur: 0xaab4bd,
    niveaux: { elan: 6, glisse: 5, equilibre: -8, endurance: -3 }, desc: 'Très fine : énormément de vitesse, mais énormément moins d\'équilibre.' },
  { id: 'pointe-foreuse', slot: 'pointe', nom: 'Pointe foreuse', rarete: 'rare', forme: 'foreuse', couleur: 0xb8860b,
    niveaux: { equilibre: 7, inertie: 2, elan: -5, endurance: -4 }, desc: 'Plantée dans le bureau : énormément de stabilité, mais lente et vite fatiguée.' },
  { id: 'pointe-diamant', slot: 'pointe', nom: 'Pointe diamant', rarete: 'legendaire', forme: 'diamant', couleur: 0xbfefff,
    niveaux: { endurance: 6, glisse: 4, poids: -5, lames: -5 }, desc: 'Ne s\'use presque pas et glisse à merveille, mais la toupie devient légère et inoffensive.' },
  { id: 'pointe-bille', slot: 'pointe', nom: 'Pointe bille', rarete: 'epique', forme: 'bille', couleur: 0xecf0f1,
    niveaux: { endurance: 5, glisse: 3, lames: -4, equilibre: -4 }, desc: 'Roule sans frotter : tourne très longtemps, mais tient mal et frappe mollement.' },

  // ---------- ÂMES (les pouvoirs du jeu 1, contre un sacrifice) ----------
  { id: 'ame-vide', slot: 'ame', nom: 'Sans âme', rarete: 'commune', forme: 'vide', couleur: 0x95a5a6,
    niveaux: {}, desc: 'Pas de pouvoir.' },
  { id: 'ame-oeil', slot: 'ame', nom: 'Œil de lynx', rarete: 'rare', forme: 'oeil', couleur: 0x1abc9c,
    niveaux: { precision: 5, critique: 3, poids: -4, lames: -4 }, desc: 'Vise juste et frappe là où ça fait mal, mais tape moins fort.' },
  { id: 'ame-aimant', slot: 'ame', nom: 'Âme aimant', rarete: 'rare', forme: 'aimant', couleur: 0xe74c3c,
    niveaux: { agressivite: 5, equilibre: -3, endurance: -2 }, desc: 'Attirée par le cafard ou la toupie la plus proche.' },
  { id: 'ame-ressort', slot: 'ame', nom: 'Âme ressort', rarete: 'rare', forme: 'ressort', couleur: 0x3498db,
    niveaux: { rebond: 8, inertie: -4, poids: -4 }, desc: 'Garde presque toute sa vitesse sur les bords, mais devient légère.' },
  { id: 'ame-flamme', slot: 'ame', nom: 'Âme de flamme', rarete: 'epique', forme: 'flamme', couleur: 0xff6b1a,
    niveaux: { feu: 6, endurance: -3, equilibre: -3 }, desc: 'Laisse une traînée de feu qui brûle les cafards… et se consume.' },
  { id: 'ame-sangsue', slot: 'ame', nom: 'Âme sangsue', rarete: 'epique', forme: 'sangsue', couleur: 0x2ecc71,
    niveaux: { souffle: 6, lames: -3, elan: -3 }, desc: 'Chaque cafard écrasé lui rend de la rotation.' },
  { id: 'ame-orage', slot: 'ame', nom: 'Âme d\'orage', rarete: 'epique', forme: 'orage', couleur: 0x8fd3ff,
    niveaux: { eclair: 6, puissance: -3, endurance: -3 }, desc: 'Ses coups lancent des éclairs qui sautent de cafard en cafard.' },
  { id: 'ame-cyclone', slot: 'ame', nom: 'Âme cyclone', rarete: 'epique', forme: 'cyclone', couleur: 0xb2bec3,
    niveaux: { tornade: 6, glisse: -3, elan: -3 }, desc: 'Aspire les cafards proches.' },
  { id: 'ame-carapace', slot: 'ame', nom: 'Âme carapace', rarete: 'legendaire', forme: 'carapace', couleur: 0xf1c40f,
    niveaux: { inertie: 2, poids: 2, lames: -2, elan: -2 }, passif: 'carapace', desc: 'Le premier gros choc reçu en duel est annulé.' },

  // ---------- LANCEUR : ENGRENAGES (rotation) ----------
  { id: 'engrenage-standard', slot: 'engrenage', nom: 'Engrenage standard', rarete: 'commune', forme: 'standard', couleur: 0x9aa3ad,
    niveaux: {}, desc: 'Moyen en tout.' },
  { id: 'engrenage-fin', slot: 'engrenage', nom: 'Engrenage fin', rarete: 'commune', forme: 'fin', couleur: 0x7fb3d5,
    niveaux: { precision: 3, puissance: -3 }, desc: 'Petites dents régulières : jauge plus facile, rotation plus faible.' },
  { id: 'engrenage-grand', slot: 'engrenage', nom: 'Grand engrenage', rarete: 'rare', forme: 'grand', couleur: 0xb08d57,
    niveaux: { puissance: 5, elan: -5 }, desc: 'Fait tourner la toupie bien plus vite, mais laisse peu de place au ressort.' },
  { id: 'engrenage-turbo', slot: 'engrenage', nom: 'Engrenage turbo', rarete: 'epique', forme: 'turbo', couleur: 0xe74c3c,
    niveaux: { puissance: 8, elan: -5, precision: -3 }, desc: 'Rotation énorme, mais lancer mou et jauge capricieuse.' },
  { id: 'engrenage-double', slot: 'engrenage', nom: 'Engrenage double', rarete: 'legendaire', forme: 'double', couleur: 0xffc531,
    niveaux: { multi: 1, puissance: -6, elan: -4 }, desc: 'Lance deux toupies d\'un coup, mais chacune tourne et part moins fort.' },

  // ---------- LANCEUR : RESSORTS (élan) ----------
  { id: 'ressort-standard', slot: 'ressort', nom: 'Ressort standard', rarete: 'commune', forme: 'standard', couleur: 0x9aa3ad,
    niveaux: {}, desc: 'Moyen en tout.' },
  { id: 'ressort-souple', slot: 'ressort', nom: 'Ressort souple', rarete: 'commune', forme: 'souple', couleur: 0x82e0aa,
    niveaux: { puissance: 3, elan: -3 }, desc: 'Petit ressort : laisse de la place à l\'engrenage, mais lance doucement.' },
  { id: 'ressort-renforce', slot: 'ressort', nom: 'Ressort renforcé', rarete: 'rare', forme: 'renforce', couleur: 0x5d6d7e,
    niveaux: { elan: 5, puissance: -5 }, desc: 'Lance fort et loin, mais prend la place de l\'engrenage.' },
  { id: 'ressort-catapulte', slot: 'ressort', nom: 'Ressort catapulte', rarete: 'epique', forme: 'catapulte', couleur: 0xd35400,
    niveaux: { elan: 8, puissance: -6, precision: -2 }, desc: 'Propulse la toupie comme un boulet, mais elle tourne peu.' },
  { id: 'ressort-detente', slot: 'ressort', nom: 'Ressort à double détente', rarete: 'legendaire', forme: 'detente', couleur: 0xffc531,
    niveaux: { elan: 5, puissance: 5, precision: -6, equilibre: -4 }, desc: 'Lance fort ET fait tourner vite, mais la jauge devient capricieuse et la toupie part de travers.' },

  // ---------- EXTENSION : pièces d'économie et de spécialisation (toujours somme des niveaux = 0) ----------
  { id: 'base-plume', slot: 'base', nom: 'Base plume', rarete: 'commune', forme: 'legere', couleur: 0xf5f0e6,
    niveaux: { elan: 3, endurance: 2, poids: -5 }, desc: 'Ultra-légère : part vite et tourne longtemps, mais s\'envole au moindre choc.' },
  { id: 'base-tirelire', slot: 'base', nom: 'Base tirelire', rarete: 'rare', forme: 'standard', couleur: 0xf78fb3,
    niveaux: { prime: 5, poids: -3, inertie: -2 }, desc: 'Chaque cafard rapporte plus, mais la toupie est fragile.' },
  { id: 'base-aimantee', slot: 'base', nom: 'Base aimantée', rarete: 'rare', forme: 'gyro', couleur: 0xc0392b,
    niveaux: { agressivite: 4, elan: -2, glisse: -2 }, desc: 'Attirée par les cibles, mais lourde à lancer.' },
  { id: 'base-ressorts', slot: 'base', nom: 'Base à ressorts', rarete: 'epique', forme: 'legere', couleur: 0x74b9ff,
    niveaux: { rebond: 5, trampoline: 2, equilibre: -4, poids: -3 }, desc: 'Rebondit sur tout, mais tient mal debout.' },
  { id: 'base-tresor', slot: 'base', nom: 'Base au trésor', rarete: 'legendaire', forme: 'noyau', couleur: 0xffd700,
    niveaux: { chance: 4, prime: 3, combo: 2, lames: -4, endurance: -5 }, desc: 'Une toupie de collectionneur : elle fait pleuvoir l\'or, mais se bat mal.' },
  { id: 'couronne-epines', slot: 'couronne', nom: 'Couronne d\'épines', rarete: 'commune', forme: 'dents', couleur: 0x6d4c41,
    niveaux: { lames: 3, inertie: -3 }, desc: 'Pique un peu, mais encaisse mal les chocs.' },
  { id: 'couronne-crocs', slot: 'couronne', nom: 'Couronne à crocs', rarete: 'rare', forme: 'dents', couleur: 0xecf0f1,
    niveaux: { critique: 6, lames: -2, endurance: -4 }, desc: 'Des crocs qui trouvent les points faibles : coups critiques fréquents.' },
  { id: 'couronne-chaine', slot: 'couronne', nom: 'Couronne à chaîne', rarete: 'rare', forme: 'large', couleur: 0x95a5a6,
    niveaux: { combo: 5, diametre: 2, equilibre: -3, endurance: -4 }, desc: 'Enchaîne les cafards : gros bonus de combo, mais s\'épuise vite.' },
  { id: 'couronne-or', slot: 'couronne', nom: 'Couronne de pièces d\'or', rarete: 'epique', forme: 'inertie', couleur: 0xf1c40f,
    niveaux: { chance: 5, prime: 2, lames: -4, diametre: -3 }, desc: 'Attire les cafards dorés, mais petite et peu tranchante.' },
  { id: 'pointe-patin', slot: 'pointe', nom: 'Pointe patin', rarete: 'commune', forme: 'clou', couleur: 0x81ecec,
    niveaux: { glisse: 6, equilibre: -3, lames: -3 }, desc: 'Glisse partout sur le bureau, mais sans mordant.' },
  { id: 'pointe-caoutchouc', slot: 'pointe', nom: 'Pointe caoutchouc', rarete: 'commune', forme: 'ventouse', couleur: 0x2d3436,
    niveaux: { rebond: 4, inertie: 2, elan: -3, glisse: -3 }, desc: 'Amortit les chocs et rebondit bien, mais accroche le bureau.' },
  { id: 'pointe-crayon', slot: 'pointe', nom: 'Pointe crayon', rarete: 'rare', forme: 'standard', couleur: 0xfdcb6e,
    niveaux: { precision: 3, critique: 3, endurance: -3, glisse: -3 }, desc: 'Précise comme un trait : lancers parfaits et coups critiques.' },
  { id: 'ame-avare', slot: 'ame', nom: 'Âme avare', rarete: 'rare', forme: 'vide', couleur: 0xf9ca24,
    niveaux: { prime: 4, tirelire: 2, lames: -3, elan: -3 }, desc: 'Économise tout : plus d\'argent et plus d\'intérêts, moins de combat.' },
  { id: 'ame-miel', slot: 'ame', nom: 'Âme de miel', rarete: 'rare', forme: 'sangsue', couleur: 0xe1b12c,
    niveaux: { appat: 4, nid: 2, endurance: -3, elan: -3 }, desc: 'Attire des cafards en renfort : plus de cibles, plus d\'argent… si on les tue.' },
  { id: 'ame-trefle', slot: 'ame', nom: 'Âme trèfle', rarete: 'epique', forme: 'oeil', couleur: 0x2ecc71,
    niveaux: { chance: 5, critique: 2, poids: -4, lames: -3 }, desc: 'Porte-bonheur : cafards dorés et coups chanceux, mais toupie frêle.' },
  { id: 'ame-meute', slot: 'ame', nom: 'Âme de meute', rarete: 'epique', forme: 'aimant', couleur: 0x8e44ad,
    niveaux: { combo: 5, agressivite: 2, inertie: -4, equilibre: -3 }, desc: 'Chasse en série : combos énormes, mais s\'expose aux chocs.' },
  { id: 'engrenage-rouille', slot: 'engrenage', nom: 'Engrenage rouillé', rarete: 'commune', forme: 'standard', couleur: 0xa0522d,
    niveaux: { puissance: 2, elan: 2, precision: -4 }, desc: 'Un peu plus fort partout, mais la jauge est capricieuse.' },
  { id: 'engrenage-horloger', slot: 'engrenage', nom: 'Engrenage horloger', rarete: 'rare', forme: 'fin', couleur: 0xdfe6e9,
    niveaux: { precision: 6, critique: 2, puissance: -5, elan: -3 }, desc: 'Mécanisme de précision : PARFAIT presque à chaque fois.' },
  { id: 'ressort-matelas', slot: 'ressort', nom: 'Ressort de matelas', rarete: 'commune', forme: 'souple', couleur: 0xdcdde1,
    niveaux: { rebond: 3, precision: 2, elan: -5 }, desc: 'Mou et régulier : lancers doux et précis.' },
  { id: 'ressort-titane', slot: 'ressort', nom: 'Ressort en titane', rarete: 'epique', forme: 'renforce', couleur: 0xb2bec3,
    niveaux: { elan: 6, endurance: 2, puissance: -4, poids: -4 }, desc: 'Léger et nerveux : la toupie part comme une flèche, mais légère.' },
];

export const PIECE = Object.fromEntries(PIECES.map(p => [p.id, p]));
export const DEPART = {
  base: 'base-standard', couronne: 'couronne-standard', pointe: 'pointe-standard', ame: 'ame-vide',
  engrenage: 'engrenage-standard', ressort: 'ressort-standard',
};

// ---------------------------------------------------------------- Boîte mystère
// 1. On tire une rareté (55 / 30 / 12 / 3 %).
// 2. Commune, rare, épique : une pièce de cette rareté (doublons possibles = niveaux de pièce).
// 3. Légendaire : la moitié du temps un TERRAIN (tant qu'il en reste à trouver ; tous les terrains ont la même chance,
//    jamais en double), sinon un autre lot légendaire : une pièce légendaire ou un coffre d'écrous.
// GARANTIE : la 30e boîte d'affilée sans lot légendaire est forcément légendaire.
export const GARANTIE_LEGENDAIRE = 30;
export const PART_TERRAINS = 0.5;
export const COFFRE = { id: 'coffre-ecrous', nom: 'Coffre d\'écrous', icone: '🧰', ecrous: 300, desc: 'De quoi acheter 3 boîtes mystère.' };

export function tirerBoite(terrainsPossedes = [], { garantie = false } = {}, rand = Math.random) {
  let rarete = 'legendaire';
  if (!garantie) {
    const total = Object.values(RARETES).reduce((a, r) => a + r.chance, 0);
    let x = rand() * total;
    for (const [id, r] of Object.entries(RARETES)) { if ((x -= r.chance) < 0) { rarete = id; break; } }
  }
  const pieces = PIECES.filter(p => p.rarete === rarete && !Object.values(DEPART).includes(p.id)).map(piece => ({ type: 'piece', piece, rarete }));
  if (rarete !== 'legendaire') return pieces[Math.floor(rand() * pieces.length)];
  const terrains = TERRAINS.filter(t => t.rarete && !terrainsPossedes.includes(t.id));
  if (terrains.length && rand() < PART_TERRAINS) return { type: 'terrain', terrain: terrains[Math.floor(rand() * terrains.length)], rarete };
  const autres = [...pieces, { type: 'coffre', coffre: COFFRE, rarete }];
  return autres[Math.floor(rand() * autres.length)];
}
