// Le déroulement d'une partie : salon de 8 joueurs (toi + bots), étapes de 3 LANCERS contre les cafards + 1 duel,
// économie entre les manches, vies, éliminations, classement final.
// La toupie choisie avant la partie est VERROUILLÉE jusqu'à la fin : en partie, on n'achète que des niveaux.
import { PARTIE, CAFARDS, ECONOMIE, BOUTIQUE, RAIL_XMAX, railZ, tirerRarete } from './config.js';
import { terrainDuel } from './data/terrains.js';
import { AMELIO, STAT_ACHATS, NOMS_BOTS, MANCHE_PRIORITE, paquet, SANS_RARETE } from './data/boutique.js';
import { statsToupie } from './stats.js';
import { ajouterCafard, viderCafards, cafards, majCafards } from './bugs.js';
import { especesVague, compositionEtape, nouveauxTypes, TYPES } from './data/cafards.js';
import { creerToupieJeu, viderToupies, retirerToupie, lancerToupie, majToupies, enJeu, toupies, choisirTerrain, modeDuel } from './physics.js';
import { creerBot, jouerLancerBot, finMancheBot, lancerDuelBot, duelSimule } from './bots.js';
import { lanceur } from './launcher.js';
import { railAdverse, decorTerrain } from './scene.js';
import { popup, tache, viderTaches, etincelles, geler, ralentir } from './fx.js';
import { secouer } from './scene.js';
import { son } from './audio.js';

export const partie = { active: false };
let ui = {}; // rappels vers l'interface (posés par main.js)
export function brancherInterface(u) { ui = u; }

const melanger = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

// ---------------------------------------------------------------- Début de partie
// Tout ce qui est choisi à l'atelier (pièces, niveaux de pièces, terrain) est gelé jusqu'à la fin de la partie
export function nouvellePartie(equipe, { pseudo = 'Toi', mode = 'normale', nivPieces = {}, terrain = 'aucun' } = {}) {
  const noms = melanger([...NOMS_BOTS]);
  const nivEquipe = Object.fromEntries(Object.values(equipe).map(id => [id, nivPieces[id] || 1]));
  const joueurs = [{ nom: pseudo, bot: false, vies: PARTIE.vies, equipe: Object.freeze({ ...equipe }), nivPieces: Object.freeze(nivEquipe),
    terrain, niveaux: {}, achats: {}, elimine: false, place: 0 }];
  for (let i = 1; i < PARTIE.joueurs; i++) joueurs.push(creerBot(noms[i]));
  const avecTerrain = terrain && terrain !== 'aucun';
  Object.assign(partie, {
    active: true, mode, joueurs, moi: joueurs[0], manche: 0, lancerCafards: 0,
    argent: avecTerrain ? PARTIE.argentAvecTerrain : PARTIE.argentSansTerrain,
    phase: 'attente', type: null, lancers: 0, tues: 0,
    adversaire: null, mesToupies: [], sesToupies: [], attenteRelance: 0, resultat: null, chrono: 0, gainsManche: 0,
    combo: 0, dernierKill: -9, renfortT: 0, tempsJeu: 0, contacts: 0,
  });
  return partie;
}

export const etape = () => Math.floor(partie.manche / PARTIE.cycle.length) + 1;
export const typeManche = (m = partie.manche) => PARTIE.cycle[m % PARTIE.cycle.length];
// Numéro du lancer dans l'étape (1 à 3) pour une manche de cafards
export const lancerDansEtape = (m = partie.manche) => (m % PARTIE.cycle.length) + 1;
export const vivants = () => partie.joueurs.filter(j => !j.elimine);
export const mesStats = () => statsToupie(partie.moi.equipe, partie.moi.niveaux, partie.moi.nivPieces);
const niv = id => partie.moi.niveaux[id] || 0;
const ach = id => partie.moi.achats?.[id] || 0; // nombre d'achats (prix et plafond)
export const capacite = () => Math.max(4, CAFARDS.capacite + mesStats().nid);
const chanceDore = () => mesStats().chanceDore;
// Adversaire du prochain duel : jamais deux fois de suite le même (s'il y a le choix)
function choisirAdversaire() {
  const bots = vivants().filter(j => j.bot);
  const autres = bots.filter(b => b !== partie.dernierAdversaire);
  return melanger(autres.length ? autres : bots)[0];
}

// ---------------------------------------------------------------- Manches
export function commencerManche() {
  partie.mancheAffichee = null;
  partie.type = typeManche();
  Object.assign(partie, { gainsManche: 0, resultat: null, chrono: 0, combo: 0, renfortT: 0, tues: 0, contacts: 0, attenteRelance: 0 });
  // Le plateau : on retire les toupies ; les cafards survivants restent d'un lancer à l'autre dans une même étape
  const nouvelleEtape = partie.manche % PARTIE.cycle.length === 0;
  viderToupies(); partie.mesToupies = []; partie.sesToupies = [];
  if (partie.type === 'cafards') {
    if (nouvelleEtape) { viderCafards(); viderTaches(); }
    choisirTerrain(null); decorTerrain(null); modeDuel(false);
    railAdverse.visible = false;
    partie.adversaire = null; partie.terrainDuel = null;
    partie.lancerCafards++;
    partie.vieBase = CAFARDS.vieCafard(partie.lancerCafards, etape());
    // Le bureau est rempli jusqu'à sa capacité (10 + Nid)
    const presents = cafards.filter(c => !c.mort).length;
    const manque = Math.max(0, capacite() - presents);
    especesVague(manque, etape()).forEach((type, i) => ajouterCafard({ vieBase: partie.vieBase, type, dore: Math.random() < chanceDore(), delai: i * 0.05 }));
    partie.renfort = manque;
    partie.evolution = nouvelleEtape && etape() > 1 ? nouveauxTypes(etape()) : null;
    if (manque) son('chute', { volume: 0.4 });
  } else {
    viderCafards(); viderTaches();
    partie.adversaire = partie.prochainAdversaire && !partie.prochainAdversaire.elimine ? partie.prochainAdversaire : choisirAdversaire();
    partie.dernierAdversaire = partie.adversaire;
    partie.prochainAdversaire = null;
    partie.terrainDuel = terrainDuel(partie.moi, partie.adversaire);
    choisirTerrain(partie.terrainDuel.terrain);
    decorTerrain(partie.terrainDuel.terrain);
    modeDuel(true);
    railAdverse.visible = true;
    partie.botLance = false;
    partie.botLanceDans = 0;
  }
  partie.lancers = 1; // un seul lancer par manche
  partie.phase = 'jeu';
  lanceur.actif = true;
  lanceur.zoneParfait = mesStats().parfait;
  ui.manche?.();
}

// Lance les N toupies d'un joueur (Multi-lancer : en éventail, chacune plus faible)
function lancerGroupe(joueur, camp, x, z, dx, dz, puiss) {
  const n = statsToupie(joueur.equipe, joueur.niveaux, joueur.nivPieces).toupies, liste = [];
  const a0 = Math.atan2(dz, dx), affaibli = Math.pow(0.7, n - 1);
  for (let i = 0; i < n; i++) {
    const t = creerToupieJeu(joueur.equipe, joueur.niveaux, camp, joueur.nivPieces, { duel: partie.type === 'duel' });
    const a = a0 + (i - (n - 1) / 2) * 0.22;
    lancerToupie(t, x + (i - (n - 1) / 2) * 0.03, z, Math.cos(a), Math.sin(a), puiss);
    t.rotationMax *= affaibli; t.rotation = t.rotationMax;
    liste.push(t);
  }
  return liste;
}

// Appelé par le lanceur
export function lancer({ x, z, dx, dz, puissance: puiss, parfait }) {
  if (partie.phase !== 'jeu' || partie.lancers <= 0 || partie.mesToupies.some(enJeu)) return;
  partie.lancers--;
  partie.mesToupies = lancerGroupe(partie.moi, 'joueur', x, z, dx, dz, Math.min(1.08, puiss));
  lanceur.actif = false;
  son('toc', { hauteur: 0.8 });
  if (parfait) popup('PARFAIT !', x, z - 0.06, 'parfait');
  if (partie.type === 'duel') partie.botLanceDans = 0.25 + Math.random() * 0.3;
  ui.hud?.();
  ui.lance?.();
}

function lancerBot() {
  const adv = partie.adversaire, cible = partie.mesToupies.find(enJeu);
  const x = (Math.random() * 2 - 1) * RAIL_XMAX * 0.8;
  const z = railZ(x, true) * 0.92; // sur l'arc du haut, un peu vers l'intérieur
  const { tx, tz, puiss } = lancerDuelBot(adv, cible);
  partie.sesToupies = lancerGroupe(adv, 'adverse', x, z, tx - x, tz - z, puiss);
  partie.botLance = true;
  son('toc', { hauteur: 0.7 });
}

const rappels = {
  tue(c, t, crit) {
    if (t.camp !== 'joueur' || partie.type !== 'cafards') return;
    // Combo : plusieurs cafards à la suite rapportent de plus en plus
    const st = mesStats(), fenetre = st.comboFenetre, bonusCombo = st.comboBonus;
    partie.combo = partie.tempsJeu - partie.dernierKill < fenetre ? partie.combo + 1 : 1;
    partie.dernierKill = partie.tempsJeu;
    const brut = CAFARDS.prime * CAFARDS.primeEtape(etape()) * (c.t?.prime || 1) * st.prime * (c.dore ? 4 : 1) * (1 + bonusCombo * (partie.combo - 1));
    // On garde les centimes : une Prime ×1,2 finit vraiment par rapporter plus
    partie.reste = (partie.reste || 0) + brut;
    const gain = Math.floor(partie.reste);
    partie.reste -= gain;
    partie.argent += gain; partie.gainsManche += gain; partie.tues++;
    tache(c.x, c.z, c.r * 1.3, c.dore ? 0x8a6a10 : 0x3a2a12);
    etincelles(c.x, c.z, c.dore ? 14 : 7, c.dore ? 0xffd700 : 0xc9a46a, 0.6);
    secouer(c.dore ? 0.012 : 0.005);
    if (crit || c.t.vie >= 2) geler(35);
    popup((crit ? '💥 ' : '') + (gain ? '+' + gain + ' 💰' : '+' + brut.toFixed(1)) + (partie.combo > 2 ? ` · combo ×${partie.combo}` : ''), c.x, c.z, c.dore ? 'dore' : crit ? 'crit' : 'argent');
    son(c.dore ? 'piece' : 'ecrase', { volume: 0.7, hauteur: 1 + Math.min(0.5, partie.combo * 0.04) });
    ui.hud?.();
  },
  touche(c, t, degats, crit) { if (crit) popup('💥 CRITIQUE', c.x, c.z, 'crit'); son('toc', { volume: 0.35, hauteur: 1.3 }); },
  eclair() { son('critique', { volume: 0.35, hauteur: 1.6 }); },
  choc(a, b, perte, bloque, crit, contact) {
    const pct = (100 * perte) / b.rotationMax;
    if (b.camp === 'adverse' || bloque) {
      partie.contacts++;
      // Impact : étincelles, arrêt sur image et secousse proportionnels à la force du choc
      const p = contact || { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
      etincelles(p.x, p.z, 8 + Math.round(pct), crit ? 0xfff27a : 0xffc46a, 0.8 + pct / 10);
      geler(Math.min(90, 30 + pct * 6));
      secouer(Math.min(0.02, 0.004 + pct * 0.0015));
      son('toc', { volume: Math.min(1, 0.45 + pct / 12), hauteur: 0.55 + Math.random() * 0.1 });
      if (pct > 5) son('critique', { volume: 0.3, hauteur: 0.7 });
    }
    popup(bloque ? '🛡️ Bloqué' : `${crit ? '💥 ' : ''}−${Math.max(1, Math.round(pct))} %`, b.x, b.z, b.camp === 'joueur' ? 'degat-moi' : 'degat');
  },
  mur() { son('toc', { volume: 0.25, hauteur: 0.6 }); },
  chute() { son('chute', { volume: 0.6 }); },
};

// ---------------------------------------------------------------- Boucle
export function majPartie(dt, t) {
  if (!partie.active) return;
  partie.tempsJeu += dt;
  majCafards(dt, t, partie.mesToupies.filter(enJeu));
  if (partie.phase !== 'jeu') { majToupies(dt, rappels); return; }
  if (partie.type === 'duel' && partie.botLanceDans > 0 && !partie.botLance) {
    partie.botLanceDans -= dt;
    if (partie.botLanceDans <= 0) lancerBot();
  }
  majToupies(dt, rappels);
  const mes = partie.mesToupies, lancees = mes.length > 0, toutesTombees = lancees && !mes.some(enJeu);

  if (partie.type === 'cafards') {
    // Le lancer est fini quand toutes mes toupies sont tombées (ou qu'il n'y a plus de cafards)
    if (lancees && (toutesTombees || !cafards.some(c => !c.mort))) {
      partie.attenteRelance += dt;
      if (partie.attenteRelance > 0.8) finLancer();
    }
  } else {
    const ses = partie.sesToupies, saTombe = ses.length > 0 && !ses.some(enJeu);
    if (lancees && ses.length) partie.chrono += dt;
    const force = (l, toutes = false) => l.reduce((a, x) => a + (toutes || enJeu(x) ? x.rotation / x.rotationMax : 0), 0);
    if ((toutesTombees || saTombe) && !partie.resultat) {
      // Le premier camp dont toutes les toupies se sont arrêtées a perdu
      const gagne = toutesTombees && saTombe ? force(mes, true) >= force(ses, true) : saTombe;
      partie.resultat = { gagne };
      partie.finDans = 2.2;
      ralentir(0.25, 0.6);
      ui.finDuel?.(gagne);
    } else if (partie.chrono > PARTIE.dureeMaxDuel && !partie.resultat) {
      partie.resultat = { gagne: force(mes) >= force(ses), tempsEcoule: true };
      partie.finDans = 2;
      ui.finDuel?.(partie.resultat.gagne);
    }
    if (partie.resultat) {
      partie.finDans -= dt;
      if (partie.finDans <= 0) finDuel();
    }
  }
}

// ---------------------------------------------------------------- Fins de manche
function finLancer() {
  partie.phase = 'bilan';
  lanceur.actif = false;
  terminerManche({ type: 'cafards', tues: partie.tues, restants: cafards.filter(c => !c.mort).length, lancer: lancerDansEtape() });
}

function finDuel() {
  partie.phase = 'bilan';
  lanceur.actif = false;
  const adv = partie.adversaire, deg = PARTIE.degatsDuel(etape());
  const gagne = partie.resultat.gagne;
  if (gagne) { adv.vies -= deg; son('critique'); } else { partie.moi.vies -= deg; son('refus'); }
  terminerManche({ type: 'duel', gagne, adversaire: adv.nom, degats: deg, tempsEcoule: !!partie.resultat.tempsEcoule,
    contacts: partie.contacts, duree: partie.chrono });
}

function terminerManche(bilan) {
  const e = etape();
  // Pendant ce temps, les bots jouent aussi : leur lancer contre les cafards, ou leurs duels entre eux (simulés)
  const bots = vivants().filter(j => j.bot);
  if (bilan.type === 'cafards') for (const b of bots) jouerLancerBot(b, partie.lancerCafards, e);
  else {
    const autres = melanger(bots.filter(b => b !== partie.adversaire));
    for (let i = 0; i + 1 < autres.length; i += 2) {
      const a = autres[i], b = autres[i + 1];
      (duelSimule(a, b) === a ? b : a).vies -= PARTIE.degatsDuel(e);
    }
  }
  for (const b of bots) finMancheBot(b, partie.manche + 1, e);
  // Revenus de fin de manche + intérêts
  const interets = Math.min(Math.floor(partie.argent / ECONOMIE.interetPour), mesStats().interetMax);
  partie.argent += ECONOMIE.revenuManche + interets;
  Object.assign(bilan, { revenu: ECONOMIE.revenuManche, interets, gains: partie.gainsManche });
  // Éliminations (les joueurs éliminés en même temps se partagent la place la plus basse)
  const tombes = vivants().filter(j => j.vies <= 0);
  const place = vivants().length - tombes.length + 1;
  for (const j of tombes) { j.elimine = true; j.place = place; j.vies = 0; }
  bilan.elimines = tombes.filter(j => j.bot).map(j => j.nom);

  if (partie.moi.elimine) return finPartie(partie.moi.place);
  if (vivants().length === 1) { partie.moi.place = 1; return finPartie(1); }
  partie.mancheAffichee = partie.manche;
  partie.manche++;
  bilan.prochaine = typeManche();
  // Aperçu du prochain lancer (et de l'évolution des cafards après un duel)
  if (bilan.prochaine === 'cafards') {
    const nouvelle = partie.manche % PARTIE.cycle.length === 0;
    bilan.apercu = {
      lancer: lancerDansEtape(),
      capacite: capacite(),
      restants: nouvelle ? 0 : cafards.filter(c => !c.mort).length,
      vie: CAFARDS.vieCafard(partie.lancerCafards + 1, etape()),
      especes: Object.keys(compositionEtape(etape())),
      evolution: nouvelle && etape() > 1 ? nouveauxTypes(etape()) : null,
    };
  }
  if (bilan.prochaine === 'duel') {
    partie.prochainAdversaire = choisirAdversaire();
    bilan.adversaireSuivant = partie.prochainAdversaire;
  }
  // Conseils : les stats qui contrent les espèces du prochain lancer
  partie.conseils = bilan.apercu ? [...new Set(bilan.apercu.especes.flatMap(t => TYPES[t].contre || []))] : [];
  partie.relances = 0;
  tirerOffres();
  ui.bilan?.(bilan);
}

function finPartie(place) {
  // Si tu es éliminé, les bots restants finissent leur partie (duels simulés) pour un vrai classement
  let e = etape();
  while (vivants().length > 1 && partie.moi.elimine) {
    e++;
    const v = melanger(vivants());
    for (let i = 0; i + 1 < v.length; i += 2) (duelSimule(v[i], v[i + 1]) === v[i] ? v[i + 1] : v[i]).vies -= PARTIE.degatsDuel(e);
    const tombes = vivants().filter(j => j.vies <= 0), pl = vivants().length - tombes.length + 1;
    for (const j of tombes) { j.elimine = true; j.place = pl; j.vies = 0; }
  }
  for (const j of vivants()) j.place = 1;
  partie.phase = 'fin';
  partie.active = false;
  lanceur.actif = false;
  ui.fin?.({ place, mode: partie.mode });
}

// ---------------------------------------------------------------- Boutique
// Offres tirées au hasard à chaque manche (comme une boutique d'auto-battler) : on choisit, on ne coche pas tout.
// 4 offres complètement au hasard (toupie, lanceur ou bureau), chacune avec une rareté tirée selon la Chance.
// La priorité de terrain n'est pas une offre : elle a son bouton à part.
export function tirerOffres() {
  if (!BOUTIQUE.offres) { partie.offres = null; return; }
  const dispo = STAT_ACHATS.filter(a => ach(a.id) < a.max);
  const poids = a => (a.id === 'multi' ? 0.3 : a.prix(0) >= 6 ? 0.6 : 1);
  const tirer = liste => {
    const tot = liste.reduce((x, a) => x + poids(a), 0);
    let r = Math.random() * tot;
    for (const a of liste) if ((r -= poids(a)) < 0) return a;
    return liste[0];
  };
  const offres = [], veine = mesStats().veine;
  while (offres.length < BOUTIQUE.offres && offres.length < dispo.length) {
    const l = dispo.filter(a => !offres.some(o => o.id === a.id));
    const a = tirer(l);
    offres.push({ id: a.id, rarete: SANS_RARETE(a.id) ? 'commune' : tirerRarete(veine) });
  }
  partie.offres = offres;
}

export const prixRelance = () => BOUTIQUE.relance(partie.relances || 0);
export function relancerOffres() {
  const prix = prixRelance();
  if (partie.argent < prix) { son('refus'); return false; }
  partie.argent -= prix;
  partie.relances = (partie.relances || 0) + 1;
  tirerOffres();
  son('choix');
  return true;
}

// La priorité de terrain n'est disponible qu'avec un terrain choisi, et à partir de la 3e manche
export const interetsPrevus = () => Math.min(Math.floor(partie.argent / ECONOMIE.interetPour), mesStats().interetMax);
export const prioriteDispo = () => partie.moi.terrain !== 'aucun' && partie.manche >= MANCHE_PRIORITE;

export function prixAmelio(id) {
  const a = AMELIO[id], n = ach(id);
  if (id === 'priorite' && !prioriteDispo()) return null;
  return n >= a.max ? null : paquet(a, n).prix;
}
export const niveauxAchat = (id, rarete = 'commune') => (paquet(AMELIO[id], ach(id), rarete)?.niveaux || 0);

// Acheter une offre : les niveaux gagnés dépendent de sa rareté (même prix) ; ensuite les offres sont relancées (gratuit)
export function acheter(id, rarete = 'commune') {
  const prix = prixAmelio(id);
  if (prix == null || partie.argent < prix) { son('refus'); return false; }
  const pq = paquet(AMELIO[id], ach(id), rarete);
  partie.argent -= prix;
  partie.moi.niveaux[id] = niv(id) + pq.niveaux;
  partie.moi.achats = { ...(partie.moi.achats || {}), [id]: ach(id) + pq.achats };
  son('achat');
  if (id !== 'priorite' && partie.offres) tirerOffres();
  return true;
}

export function abandonner() {
  viderCafards(); viderToupies(); viderTaches();
  choisirTerrain(null); decorTerrain(null); modeDuel(false);
  railAdverse.visible = false;
  partie.mesToupies = []; partie.sesToupies = []; partie.adversaire = null;
  partie.active = false;
  partie.phase = 'fin';
  lanceur.actif = false;
}

// Pour les tests automatiques
export const _interne = { cafards, toupies };
export { TYPES };
