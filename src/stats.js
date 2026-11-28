// Les stats de la toupie : TOUTES celles de Toupie contre Cafards (jeu 1), avec les mêmes noms et la même
// logique (des niveaux qui se convertissent en valeurs réelles : secondes, cm, grammes, tr/min…).
// Les pièces donnent des niveaux (+ ou −), la boutique en partie en ajoute.
import { PIECE, PIECES, SLOTS, niveauxPiece, NIVEAU_PIECE_MAX } from './data/pieces.js';
import { probaMieux } from './config.js';

export const GROUPES = [
  { id: 'toupie', nom: 'Toupie', icone: '🌀' },
  { id: 'lanceur', nom: 'Lanceur', icone: '🚀' },
  { id: 'bureau', nom: 'Bureau (économie)', icone: '🪑' },
];

// special : pouvoir à 0 par défaut (affiché « — » tant qu'on ne l'a pas)
export const STATS = [
  { id: 'endurance', groupe: 'toupie', nom: 'Endurance', icone: '🔋', desc: 'Perd sa rotation moins vite : tourne plus longtemps.',
    fmt: s => `${tempsRotation(s).toFixed(1)} s de rotation` },
  { id: 'diametre', groupe: 'toupie', nom: 'Diamètre', icone: '📏', desc: 'Une toupie plus large touche plus de cafards.',
    fmt: s => `${(s.rayon * 200).toFixed(1)} cm` },
  { id: 'poids', groupe: 'toupie', nom: 'Poids', icone: '🪨', desc: 'Frappe plus fort et se fait moins repousser.',
    fmt: s => `${Math.round(s.masse)} g` },
  { id: 'glisse', groupe: 'toupie', nom: 'Glisse', icone: '⛸️', desc: 'Pointe plus fine : glisse plus loin et se promène plus vite.',
    fmt: s => `balade ${Math.round((s.derive / s.frottement) * 100)} cm/s` },
  { id: 'lames', groupe: 'toupie', nom: 'Lames', icone: '⚔️', desc: 'Plus de dégâts par contact, sur les cafards comme sur les toupies.',
    fmt: s => `×${s.lames.toFixed(2)} dégâts` },
  { id: 'inertie', groupe: 'toupie', nom: 'Inertie', icone: '🛞', desc: 'Perd moins de rotation dans les chocs (cafards et toupies adverses).',
    fmt: s => Math.abs(s.inertie - 1) < 0.005 ? 'perte au choc normale' : s.inertie < 1 ? `−${Math.round((1 - s.inertie) * 100)} % de perte au choc` : `+${Math.round((s.inertie - 1) * 100)} % de perte au choc` },
  { id: 'equilibre', groupe: 'toupie', nom: 'Équilibre', icone: '⚖️', desc: 'Reste debout même en tournant lentement.',
    fmt: s => `tombe sous ${Math.round(s.seuilChute * 100)} %` },
  { id: 'rebond', groupe: 'toupie', nom: 'Rebond', icone: '🏓', desc: 'Garde sa vitesse en rebondissant sur les bords.',
    fmt: s => `${Math.round(s.rebond * 100)} % conservé` },
  { id: 'agressivite', groupe: 'toupie', nom: 'Agressivité', icone: '😠', special: true, desc: 'La toupie se dirige vers les cafards et les toupies proches.',
    fmt: s => s.attraction ? `attraction ${s.attraction.toFixed(2)}` : '—' },
  { id: 'critique', groupe: 'toupie', nom: 'Coup critique', icone: '💥', special: true, desc: 'Chance d\'infliger un coup ×3. Au-delà de 100 %, le surplus rend les critiques encore plus forts.',
    fmt: s => s.crit ? `${Math.round(s.crit * 100)} % de chance${s.critMult > 3 ? `, coups ×${s.critMult.toFixed(2)}` : ''}` : '—' },
  { id: 'feu', groupe: 'toupie', nom: 'Traînée de feu', icone: '🔥', special: true, desc: 'Enflamme le plateau sur son passage : les cafards qui marchent dans les flammes brûlent.',
    fmt: s => s.feu ? `brûlure ${Math.round(s.feu * 100)} % d'un coup/s, ${s.feuDuree.toFixed(1)} s` : '—' },
  { id: 'souffle', groupe: 'toupie', nom: 'Second souffle', icone: '🌬️', special: true, desc: 'Chaque cafard écrasé redonne un peu de rotation (plafonné à chaque lancer).',
    fmt: s => s.souffle ? `+${Math.round(s.souffle * 100)} % par cafard, ${Math.round(s.souffleMax * 100)} % max` : '—' },
  { id: 'tornade', groupe: 'toupie', nom: 'Tourbillon', icone: '🌪️', special: true, desc: 'La toupie aspire les cafards proches vers elle.',
    fmt: s => s.tornade ? `rayon ${Math.round(s.tornadeRayon * 100)} cm` : '—' },
  { id: 'puissance', groupe: 'lanceur', nom: 'Puissance', icone: '🚀', desc: 'La toupie démarre en tournant plus vite : elle encaisse plus de chocs avant de s\'arrêter (sa « vie » en duel).',
    fmt: s => `${Math.round(s.tours).toLocaleString('fr-FR')} tr/min` },
  { id: 'elan', groupe: 'lanceur', nom: 'Élan', icone: '💨', desc: 'La toupie part plus vite et plus loin.',
    fmt: s => `${Math.round(s.vitesse * 100)} cm/s` },
  { id: 'precision', groupe: 'lanceur', nom: 'Précision', icone: '🎯', desc: 'Zone « PARFAIT » de la jauge plus large (+8 % de puissance).',
    fmt: s => `zone de ${Math.round(s.parfait * 100)} %` },
  { id: 'multi', groupe: 'lanceur', nom: 'Multi-lancer', icone: '🌀', special: true, desc: 'Lance plusieurs toupies d\'un coup, mais chacune tourne moins fort.',
    fmt: s => s.toupies > 1 ? `${s.toupies} toupies par lancer, −${Math.round((1 - Math.pow(0.7, s.toupies - 1)) * 100)} % de rotation chacune` : '1 toupie par lancer' },
  // Bureau (économie, repris de l'atelier du jeu 1) : améliorables en partie, et donnés ou retirés par certaines pièces
  { id: 'nid', groupe: 'bureau', nom: 'Nid', icone: '🪺', desc: 'Plus de cafards sur le bureau à chaque lancer (donc plus d\'argent… s\'ils meurent).',
    fmt: s => s.nid ? `${10 + s.nid} cafards sur le bureau` : '10 cafards sur le bureau' },
  { id: 'prime', groupe: 'bureau', nom: 'Prime', icone: '💰', desc: 'Chaque cafard écrasé rapporte plus.',
    fmt: s => `×${s.prime.toFixed(2)} argent par cafard` },
  { id: 'chance', groupe: 'bureau', nom: 'Trèfle doré', icone: '🍀', special: true, desc: 'Des cafards dorés qui rapportent 4 fois plus.',
    fmt: s => s.chanceDore ? `${Math.round(s.chanceDore * 100)} % de cafards dorés` : '—' },
  { id: 'combo', groupe: 'bureau', nom: 'Combo', icone: '🔗', desc: 'Bonus quand on écrase plusieurs cafards à la suite.',
    fmt: s => `+${Math.round(s.comboBonus * 100)} % / cafard, ${s.comboFenetre.toFixed(1)} s` },
  { id: 'tirelire', groupe: 'bureau', nom: 'Tirelire', icone: '🐷', desc: 'Plus d\'intérêts sur l\'argent gardé entre les manches.',
    fmt: s => `${s.interetMax} 💰 d'intérêts max` },
  { id: 'veine', groupe: 'bureau', nom: 'Chance', icone: '🎲', desc: 'Les améliorations de la boutique sortent plus souvent rares, épiques ou légendaires : même prix, mais effet ×1,5, ×2 ou ×3.',
    fmt: s => `${Math.round(probaMieux(s.veine) * 100)} % d'offres rares ou mieux` },
];
export const STAT = Object.fromEntries(STATS.map(s => [s.id, s]));

// Niveaux → valeurs réelles (mêmes formules que le jeu 1, recalées pour des parties courtes).
// Symétrie : +L niveaux multiplient par (1 + a×L), −L niveaux divisent par le même nombre. Un malus ne pèse donc
// jamais plus lourd que le bonus équivalent (important pour l'équilibre des pièces et de leurs niveaux).
const f = (a, L) => (L >= 0 ? 1 + a * L : 1 / (1 + a * -L));

export const SEUIL_DEGRESSIF = 10;
export const nidCafards = n => (n <= 5 ? n : 5 + 5 * Math.log(1 + (n - 5) / 5));
export const degressif = x => (x <= SEUIL_DEGRESSIF ? x : SEUIL_DEGRESSIF * (1 + Math.log(1 + (x - SEUIL_DEGRESSIF) / SEUIL_DEGRESSIF)));
export function calculer(niv) {
  // Rendements DÉGRESSIFS : jusqu'à 10 niveaux, chaque niveau compte en entier ; au-delà, chaque niveau compte de moins
  // en moins (logarithme), sans jamais s'arrêter. Pas de plafond, mais on ne peut pas tout pousser à l'infini.
  const L = id => degressif(niv[id] || 0), P = id => Math.max(0, degressif(niv[id] || 0));
  return {
    rayon: 0.046 * f(0.08, L('diametre')),
    masse: 20 * f(0.15, L('poids')),
    inertie: 1 / f(0.12, L('inertie')),
    usure: 0.12 / f(0.15, L('endurance')),
    frottement: 0.32 / f(0.1, L('glisse')),
    derive: 0.14 * f(0.1, L('glisse')),
    lames: f(0.15, L('lames')),
    seuilChute: Math.min(0.6, 0.25 / f(0.06, L('equilibre'))),
    rebond: Math.max(0.2, Math.min(0.95, 0.6 + 0.04 * L('rebond'))),
    attraction: 0.12 * P('agressivite'),
    crit: Math.min(1, 0.04 * P('critique')), // 4 % par niveau, jusqu'à 100 %…
    critMult: 3 * Math.max(1, 0.04 * P('critique')), // …et tout ce qui dépasse 100 % rend les critiques plus forts (125 % → coups ×3,75)
    feu: P('feu') ? 0.25 + 0.08 * P('feu') : 0,
    feuDuree: 1 + 0.08 * P('feu'),
    souffle: P('souffle') ? 0.03 + 0.012 * P('souffle') : 0,
    souffleMax: 0.25 + 0.03 * P('souffle'),
    tornade: P('tornade') ? 0.12 + 0.03 * P('tornade') : 0,
    tornadeRayon: 0.1 + 0.012 * P('tornade'),
    tours: 600 * f(0.18, L('puissance')),
    vitesse: 0.95 * f(0.1, L('elan')),
    parfait: Math.max(0.03, Math.min(0.4, 0.1 + 0.02 * L('precision'))),
    toupies: Math.min(2, 1 + Math.round(P('multi'))), // au plus 2 toupies : pièce (≤ 1) ou un seul achat (rareté mythique)
    // Bureau
    // Nid : +1 cafard par niveau jusqu'à 5 (Âme de miel : 1 à 5), puis de moins en moins (5 + 5·ln(1 + (n − 5)/5)) :
    // au 30e niveau, un Nid légendaire (+3 niveaux) n'ajoute plus qu'environ un demi-cafard (demande de Louis, 28/11)
    nid: Math.max(-4, Math.floor(nidCafards(niv.nid || 0) + 1e-6)),
    prime: f(0.12, L('prime')),
    chanceDore: P('chance') ? 1 - Math.exp(-(0.02 + 0.02 * P('chance'))) : 0, // probabilité : se rapproche de 100 % sans l'atteindre
    comboFenetre: Math.max(0.6, 1.0 + 0.15 * L('combo')),
    comboBonus: Math.max(0, 0.05 + 0.03 * L('combo')),
    interetMax: Math.max(0, Math.floor(3 + L('tirelire'))),
    veine: P('veine'),
  };
}

// Durée de rotation estimée (sans chocs) pour un lancer à pleine puissance — même calcul que le jeu 1
export function tempsRotation(s) { return Math.log(1 / s.seuilChute) / s.usure; }

// Niveaux d'une toupie = somme des niveaux de ses pièces (selon le niveau de chaque pièce) + améliorations achetées en partie
// nivPieces : { idPiece: niveau de la pièce (1 par défaut) }
export function niveauxToupie(equipe, achats = {}, nivPieces = {}) {
  const n = {};
  for (const id of Object.values(equipe)) {
    if (!PIECE[id]) continue;
    for (const [k, v] of Object.entries(niveauxPiece(PIECE[id], nivPieces[id] || 1))) n[k] = (n[k] || 0) + v;
  }
  for (const st of STATS) if (achats[st.id]) n[st.id] = (n[st.id] || 0) + achats[st.id];
  return n;
}

// Bornes de chaque stat sur TOUS les assortiments possibles (une pièce par emplacement, niveaux 1 à max).
// Les niveaux s'additionnent emplacement par emplacement : le pire (meilleur) assortiment = la somme des pires (meilleures)
// contributions de chaque emplacement. Les barres vont de 1 % (pire assortiment) à 100 % (meilleur assortiment au niveau max).
export const BORNES = (() => {
  const b = {};
  for (const st of STATS) {
    let lo = 0, hi = 0;
    for (const slot of SLOTS) {
      let mn = Infinity, mx = -Infinity;
      for (const p of PIECES.filter(x => x.slot === slot.id))
        for (let k = 1; k <= NIVEAU_PIECE_MAX; k++) { const v = niveauxPiece(p, k)[st.id] || 0; mn = Math.min(mn, v); mx = Math.max(mx, v); }
      if (mn !== Infinity) { lo += mn; hi += mx; }
    }
    b[st.id] = { min: lo, max: hi };
  }
  return b;
})();

export function statsToupie(equipe, achats = {}, nivPieces = {}) { return calculer(niveauxToupie(equipe, achats, nivPieces)); }

export function passifToupie(equipe) { return PIECE[equipe.ame]?.passif || null; }

// Puissance globale (pour simuler les duels entre bots) : somme pondérée des niveaux
export function puissance(equipe, achats = {}, nivPieces = {}) {
  const n = niveauxToupie(equipe, achats, nivPieces);
  return 40 + Object.entries(n).reduce((a, [k, v]) => a + v * (STAT[k]?.special ? 1.3 : 1), 0);
}

// Effet d'un nombre de niveaux sur une stat, en unités réelles et signé (« +7 % de chance », « −5 g »)
const sg = x => (x >= 0 ? '+' : '−') + Math.abs(x);
export function effet(id, n) {
  const a = calculer({}), b = calculer({ [id]: n });
  const r1 = x => Math.round(x * 10) / 10, r0 = Math.round;
  switch (id) {
    case 'endurance': return `${sg(r1(tempsRotation(b) - tempsRotation(a)))} s de rotation`;
    case 'diametre': return `${sg(r1((b.rayon - a.rayon) * 200))} cm de diamètre`;
    case 'poids': return `${sg(r0(b.masse - a.masse))} g`;
    case 'glisse': return `${sg(r0((b.derive / b.frottement - a.derive / a.frottement) * 100))} cm/s de balade`;
    case 'lames': return `${sg(r0((b.lames / a.lames - 1) * 100))} % de dégâts`;
    case 'inertie': return `${sg(r0((b.inertie - a.inertie) * 100))} % de perte au choc`;
    case 'equilibre': return `tombe sous ${r0(b.seuilChute * 100)} % (au lieu de ${r0(a.seuilChute * 100)} %)`;
    case 'rebond': return `${sg(r0((b.rebond - a.rebond) * 100))} % de vitesse gardée aux bords`;
    case 'agressivite': return `${sg(r1(b.attraction))} d'attraction vers les cibles`;
    case 'critique': return `${sg(r0(b.crit * 100))} % de chance de critique`;
    case 'puissance': return `${sg(r0(b.tours - a.tours))} tr/min`;
    case 'elan': return `${sg(r0((b.vitesse - a.vitesse) * 100))} cm/s d'élan`;
    case 'precision': return `${sg(r0((b.parfait - a.parfait) * 100))} % de zone PARFAIT`;
    case 'multi': return `${sg(b.toupies - a.toupies)} toupie par lancer`;
    case 'nid': return `${sg(b.nid - a.nid)} cafards sur le bureau`;
    case 'prime': return `${sg(r0((b.prime - 1) * 100))} % d'argent par cafard`;
    case 'chance': return `${r0(b.chanceDore * 100)} % de cafards dorés`;
    case 'combo': return `${sg(r0((b.comboBonus - a.comboBonus) * 100))} % par cafard en combo`;
    case 'tirelire': return `${sg(b.interetMax - a.interetMax)} 💰 d'intérêts max`;
    case 'veine': return `${sg(Math.round((probaMieux(b.veine) - probaMieux(a.veine)) * 100))} % d'offres rares ou mieux`;
    default: return STAT[id].fmt(b); // pouvoirs (feu, souffle, éclairs, tourbillon) : la valeur obtenue
  }
}
