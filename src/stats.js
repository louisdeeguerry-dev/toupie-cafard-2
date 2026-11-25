// Les stats de la toupie : TOUTES celles de Toupie contre Cafards (jeu 1), avec les mêmes noms et la même
// logique (des niveaux qui se convertissent en valeurs réelles : secondes, cm, grammes, tr/min…).
// Les pièces donnent des niveaux (+ ou −), la boutique en partie en ajoute.
import { PIECE, niveauxPiece } from './data/pieces.js';

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
  { id: 'eclair', groupe: 'toupie', nom: 'Éclairs en chaîne', icone: '⚡', special: true, desc: 'Quand la toupie frappe, un éclair peut rebondir sur un cafard voisin.',
    fmt: s => s.eclair ? `${Math.round(s.eclair * 100)} % de chance, ${Math.round(s.eclairDegats * 100)} % des dégâts, ${s.eclairRebonds} rebond${s.eclairRebonds > 1 ? 's' : ''}` : '—' },
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
  { id: 'nid', groupe: 'bureau', nom: 'Nid', icone: '🪺', desc: 'Plus de cafards à chaque vague (donc plus d\'argent… s\'ils meurent).',
    fmt: s => s.nid ? `${s.nid > 0 ? '+' : ''}${s.nid} cafards par vague` : 'nombre normal de cafards' },
  { id: 'prime', groupe: 'bureau', nom: 'Prime', icone: '💰', desc: 'Chaque cafard écrasé rapporte plus.',
    fmt: s => `×${s.prime.toFixed(2)} argent par cafard` },
  { id: 'chance', groupe: 'bureau', nom: 'Trèfle doré', icone: '🍀', special: true, desc: 'Des cafards dorés qui rapportent 4 fois plus.',
    fmt: s => s.chanceDore ? `${Math.round(s.chanceDore * 100)} % de cafards dorés` : '—' },
  { id: 'combo', groupe: 'bureau', nom: 'Combo', icone: '🔗', desc: 'Bonus quand on écrase plusieurs cafards à la suite.',
    fmt: s => `+${Math.round(s.comboBonus * 100)} % / cafard, ${s.comboFenetre.toFixed(1)} s` },
  { id: 'appat', groupe: 'bureau', nom: 'Appât', icone: '🧀', special: true, desc: 'Des cafards arrivent en renfort pendant la vague.',
    fmt: s => s.appat ? `1 renfort toutes les ${s.appat.toFixed(1)} s` : '—' },
  { id: 'trampoline', groupe: 'bureau', nom: 'Bords trampolines', icone: '🤸', special: true, desc: 'Contre les cafards, les bords relancent la toupie encore plus vite.',
    fmt: s => s.trampoline ? `rebond ×${s.trampoline.toFixed(2)}` : '—' },
  { id: 'tirelire', groupe: 'bureau', nom: 'Tirelire', icone: '🐷', desc: 'Plus d\'intérêts sur l\'argent gardé entre les manches.',
    fmt: s => `${s.interetMax} 💰 d'intérêts max` },
];
export const STAT = Object.fromEntries(STATS.map(s => [s.id, s]));

// Niveaux → valeurs réelles (mêmes formules que le jeu 1, recalées pour des parties courtes).
// Symétrie : +L niveaux multiplient par (1 + a×L), −L niveaux divisent par le même nombre. Un malus ne pèse donc
// jamais plus lourd que le bonus équivalent (important pour l'équilibre des pièces et de leurs niveaux).
const f = (a, L) => (L >= 0 ? 1 + a * L : 1 / (1 + a * -L));

export function calculer(niv) {
  const L = id => niv[id] || 0, P = id => Math.max(0, niv[id] || 0);
  return {
    rayon: 0.046 * f(0.07, L('diametre')),
    masse: 20 * f(0.15, L('poids')),
    inertie: 1 / f(0.12, L('inertie')),
    usure: 0.12 / f(0.15, L('endurance')),
    frottement: 0.32 / f(0.1, L('glisse')),
    derive: 0.14 * f(0.1, L('glisse')),
    lames: f(0.15, L('lames')),
    seuilChute: Math.min(0.6, 0.25 / f(0.06, L('equilibre'))),
    rebond: Math.max(0.2, Math.min(0.95, 0.6 + 0.04 * L('rebond'))),
    attraction: 0.12 * P('agressivite'),
    crit: Math.min(1, 0.04 * P('critique')),
    critMult: 3 * Math.max(1, 0.04 * P('critique')),
    feu: P('feu') ? 0.25 + 0.08 * P('feu') : 0,
    feuDuree: 1 + 0.08 * P('feu'),
    souffle: P('souffle') ? 0.03 + 0.012 * P('souffle') : 0,
    souffleMax: 0.25 + 0.03 * P('souffle'),
    eclair: Math.min(0.7, 0.07 * P('eclair')),
    eclairRebonds: 1 + Math.floor(P('eclair') / 6),
    eclairDegats: 0.5 + 0.03 * P('eclair'),
    tornade: P('tornade') ? 0.12 + 0.03 * P('tornade') : 0,
    tornadeRayon: 0.1 + 0.012 * P('tornade'),
    tours: 600 * f(0.18, L('puissance')),
    vitesse: 0.95 * f(0.1, L('elan')),
    parfait: Math.max(0.03, Math.min(0.4, 0.1 + 0.02 * L('precision'))),
    toupies: 1 + P('multi'),
    // Bureau
    nid: Math.max(-4, Math.round(2 * L('nid'))),
    prime: f(0.12, L('prime')),
    chanceDore: P('chance') ? 0.02 + 0.02 * P('chance') : 0,
    comboFenetre: Math.max(0.6, 1.0 + 0.15 * L('combo')),
    comboBonus: Math.max(0, 0.05 + 0.03 * L('combo')),
    appat: P('appat') ? 6 / (1 + 0.25 * (P('appat') - 1)) : 0,
    trampoline: P('trampoline') ? 1.1 + 0.05 * P('trampoline') : 0,
    trampolineMax: 1.2 + 0.1 * P('trampoline'),
    interetMax: Math.max(0, 3 + L('tirelire')),
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

export function statsToupie(equipe, achats = {}, nivPieces = {}) { return calculer(niveauxToupie(equipe, achats, nivPieces)); }

export function passifToupie(equipe) { return PIECE[equipe.ame]?.passif || null; }

// Puissance globale (pour simuler les duels entre bots) : somme pondérée des niveaux
export function puissance(equipe, achats = {}, nivPieces = {}) {
  const n = niveauxToupie(equipe, achats, nivPieces);
  return 40 + Object.entries(n).reduce((a, [k, v]) => a + v * (STAT[k]?.special ? 1.3 : 1), 0);
}
