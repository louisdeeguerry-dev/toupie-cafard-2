// Le déroulement d'une partie : salon de 8 joueurs (toi + bots), étapes de 3 LANCERS contre les cafards + 1 duel,
// économie entre les manches, vies, éliminations, classement final.
// La toupie choisie avant la partie est VERROUILLÉE jusqu'à la fin : en partie, on n'achète que des niveaux.
import { PARTIE, CAFARDS, ECONOMIE, BOUTIQUE, RAIL_XMAX, railZ, tirerRarete, ARENE_R } from './config.js';
import { terrainDuel } from './data/terrains.js';
import { AMELIO, STAT_ACHATS, NOMS_BOTS, MANCHE_PRIORITE, paquet, tirerOffresPour } from './data/boutique.js';
import { statsToupie } from './stats.js';
import { ajouterCafard, viderCafards, cafards, majCafards } from './bugs.js';
import { especesVague, compositionEtape, nouveauxTypes, TYPES } from './data/cafards.js';
import { creerToupieJeu, viderToupies, retirerToupie, lancerToupie, majToupies, enJeu, toupies, choisirTerrain, modeDuel } from './physics.js';
import { creerBot, jouerLancerBot, finMancheBot, lancerDuelBot, duelSimule } from './bots.js';
import { lanceur, lancerDirect, valeurJauge } from './launcher.js';
import { railAdverse, decorTerrain } from './scene.js';
import { popup, tache, viderTaches, etincelles, geler, ralentir, pieceVolante } from './fx.js';
import { secouer } from './scene.js';
import { son, sfx, baisserMusique } from './audio.js';

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
    active: true, mode, joueurs, moi: joueurs[0], manche: 0, lancerCafards: 0, ami: null, entrainement: null,
    argent: avecTerrain ? PARTIE.argentAvecTerrain : PARTIE.argentSansTerrain,
    phase: 'attente', type: null, lancers: 0, tues: 0,
    adversaire: null, mesToupies: [], sesToupies: [], attenteRelance: 0, resultat: null, chrono: 0, gainsManche: 0,
    combo: 0, dernierKill: -9, renfortT: 0, tempsJeu: 0, contacts: 0,
  });
  return partie;
}

export const etape = () => Math.floor(partie.manche / PARTIE.cycle.length) + 1;
export const typeManche = (m = partie.manche) => partie.entrainement ? 'cafards' : PARTIE.cycle[m % PARTIE.cycle.length];
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
  if (partie.entrainement) return mancheEntrainement();
  // Défi entre amis : chacun joue ses cafards de son côté ; au duel, on s'attend (les deux doivent être prêts)
  if (partie.ami && partie.type === 'duel' && !partie.ami.go) return attendreDuelAmi();
  if (partie.ami) partie.ami.go = false;
  Object.assign(partie, { gainsManche: 0, resultat: null, chrono: 0, combo: 0, renfortT: 0, tues: 0, contacts: 0, attenteRelance: 0,
    tempsLancer: 0, depuisLancer: 0, acceleration: 1, horloge: null, lanceEnvoye: false,
    monLancer: null, sonLancer: null, lachees: false });
  if (partie.ami) { partie.ami.fantomes.clear(); partie.ami.etat = null; }
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
    partie.adversaire = partie.ami ? partie.ami.joueur : partie.prochainAdversaire && !partie.prochainAdversaire.elimine ? partie.prochainAdversaire : choisirAdversaire();
    partie.dernierAdversaire = partie.adversaire;
    partie.prochainAdversaire = null;
    partie.terrainDuel = terrainDuel(partie.moi, partie.adversaire);
    choisirTerrain(partie.terrainDuel.terrain);
    decorTerrain(partie.terrainDuel.terrain);
    modeDuel(true);
    railAdverse.visible = true;
    partie.botLance = false;
    partie.botLanceDans = partie.ami ? 0 : 1 + Math.random() * 4; // le bot choisit son lancer pendant tes 7 s
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
  if (partie.phase !== 'jeu' || partie.lancers <= 0 || partie.mesToupies.some(enJeu) || partie.monLancer) return;
  partie.lancers--; lanceur.actif = false;
  sfx.lancer(puiss);
  if (parfait) { popup('PARFAIT !', x, z - 0.06, 'parfait'); sfx.parfait(); }
  ui.lance?.();
  const l = { x, z, dx, dz, puiss: Math.min(1.08, puiss) };
  if (partie.type === 'duel') {
    // Duel : le lancer est GARDÉ EN MÉMOIRE (angle, puissance) ; les deux toupies partent ensemble quand l'adversaire a lancé
    partie.monLancer = l;
    if (partie.ami && !partie.ami.hote) partie.ami.envoyer({ type: 'lancer', ...l }); // invité : c'est l'hôte qui lâche les toupies
    else tenterLacher();
    ui.hud?.();
    return;
  }
  partie.mesToupies = lancerGroupe(partie.moi, 'joueur', x, z, dx, dz, l.puiss);
  ui.hud?.();
}

// Les deux lancers sont prêts : les deux toupies partent en même temps
function tenterLacher() {
  if (partie.lachees || !partie.monLancer || !partie.sonLancer || partie.phase !== 'jeu') return;
  partie.lachees = true;
  const m = partie.monLancer, s = partie.sonLancer;
  partie.mesToupies = lancerGroupe(partie.moi, 'joueur', m.x, m.z, m.dx, m.dz, m.puiss);
  partie.sesToupies = lancerGroupe(partie.adversaire, 'adverse', s.x, s.z, s.dx, s.dz, s.puiss);
  partie.botLance = true;
  sfx.lancer(Math.max(m.puiss, s.puiss));
  ui.minuteur?.('', false);
}
// Lancer par défaut de l'adversaire (en haut, tout droit) si son lancer n'arrive jamais
const lancerParDefaut = () => ({ x: 0, z: railZ(0, true) * 0.92, dx: 0, dz: 1, puiss: 0.55 });

function lancerBot() {
  const adv = partie.adversaire;
  const x = (Math.random() * 2 - 1) * RAIL_XMAX * 0.8;
  const z = railZ(x, true) * 0.92; // sur l'arc du haut, un peu vers l'intérieur
  const { tx, tz, puiss } = lancerDuelBot(adv, null); // il ne voit pas ton lancer : il vise le centre, avec son habileté
  partie.sonLancer = { x, z, dx: tx - x, dz: tz - z, puiss };
  tenterLacher();
}

// Le combo multiplie la prime ; au-delà de ×2, chaque cafard de la chaîne ajoute de moins en moins (dégressif, sans plafond)
const multCombo = x => (x <= 2 ? x : 2 * (1 + Math.log(x / 2)));
const rappels = {
  tue(c, t, crit) {
    if (t.camp !== 'joueur' || partie.type !== 'cafards') return;
    // Combo : plusieurs cafards à la suite rapportent de plus en plus
    const st = mesStats(), fenetre = st.comboFenetre, bonusCombo = st.comboBonus;
    partie.combo = partie.tempsJeu - partie.dernierKill < fenetre ? partie.combo + 1 : 1;
    partie.dernierKill = partie.tempsJeu;
    const brut = CAFARDS.prime * CAFARDS.primeEtape(etape()) * (c.t?.prime || 1) * st.prime * (c.dore ? 4 : 1) * multCombo(1 + bonusCombo * (partie.combo - 1));
    // On garde les centimes : une Prime ×1,2 finit vraiment par rapporter plus
    partie.reste = (partie.reste || 0) + brut;
    const gain = Math.floor(partie.reste);
    partie.reste -= gain;
    partie.argent += gain; partie.gainsManche += gain; partie.tues++;
    if (gain > 0) pieceVolante(c.x, c.z, gain > 3 ? 3 : 1);
    tache(c.x, c.z, c.r * 1.3, c.dore ? 0x8a6a10 : 0x3a2a12);
    etincelles(c.x, c.z, c.dore ? 14 : 7, c.dore ? 0xffd700 : 0xc9a46a, 0.6);
    secouer(c.dore ? 0.012 : 0.005);
    if (crit || c.t.vie >= 2) geler(35);
    popup((crit ? '💥 ' : '') + (gain ? '+' + gain + ' 💰' : '+' + brut.toFixed(1)) + (partie.combo > 2 ? ` · combo ×${partie.combo}` : ''), c.x, c.z, c.dore ? 'dore' : crit ? 'crit' : 'argent');
    son(c.dore ? 'piece' : c.t.vie >= 2 ? 'gros' : 'ecrase', { volume: 0.7, hauteur: 1 + Math.min(0.5, partie.combo * 0.04), pan: c.x / ARENE_R });
    ui.hud?.();
  },
  touche(c, t, degats, crit) {
    const E = partie.entrainement;
    if (E) { // entraînement : chaque coup affiche ses dégâts
      E.lancer += degats; E.coups++; E.meilleur = Math.max(E.meilleur, degats);
      popup(`${crit ? '💥 ' : ''}${degats.toFixed(1)}`, c.x, c.z, crit ? 'crit' : 'argent');
      sfx.metal(Math.min(1, degats / 4), c.x / ARENE_R); ui.entrainement?.(E);
      return;
    }
    if (crit) popup('💥 CRITIQUE', c.x, c.z, 'crit'); son('toc', { volume: 0.35, hauteur: 1.3 });
  },
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
      sfx.metal(Math.min(1, pct / 10), p.x / ARENE_R); // métal contre métal, placé à gauche ou à droite
      if (pct > 5) son('critique', { volume: 0.3, hauteur: 0.7, pan: p.x / ARENE_R });
    }
    popup(bloque ? '🛡️ Bloqué' : `${crit ? '💥 ' : ''}−${Math.max(1, Math.round(pct))} %`, b.x, b.z, b.camp === 'joueur' ? 'degat-moi' : 'degat');
    if (partie.ami) { const p = contact || { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 }; partie.ami.envoyer({ type: 'choc', x: p.x, z: p.z, bx: b.x, bz: b.z, pct, crit, bloque, cible: b.camp }); }
  },
  mur() { son('toc', { volume: 0.25, hauteur: 0.6 }); },
  chute() { son('chute', { volume: 0.6 }); },
};

// ---------------------------------------------------------------- Temps limités
// 15 s pour lancer (sinon la toupie part toute seule, avec la jauge du moment) ; une fois lancée, si une toupie tourne
// encore après 10 s, le temps accélère progressivement (jusqu'à ×5) : personne n'attend le dernier.
// Les minuteurs suivent l'HORLOGE RÉELLE (pas le temps de jeu, qui ralentit sur un appareil lent) ; __tc2.acceleration pour les tests
function minuteurs(dt, lancees) {
  const now = performance.now(), d = Math.min(1, (now - (partie.horloge ?? now)) / 1000) * (window.__tc2?.acceleration ?? 1);
  partie.horloge = now;
  const duel = partie.type === 'duel', limite = duel ? PARTIE.tempsLancerDuel : PARTIE.tempsLancer;
  const pret = duel ? !!partie.monLancer : lancees; // j'ai fait mon lancer
  if (partie.entrainement && !pret) { ui.minuteur?.('🎯 Entraînement : lance quand tu veux', false); return; }
  const parti = duel ? !!partie.lachees : lancees; // les toupies sont parties
  if (!parti) partie.tempsLancer += d;
  if (!pret) {
    const reste = Math.ceil(limite - partie.tempsLancer);
    ui.minuteur?.(`⏱️ ${Math.max(0, reste)} s pour lancer`, reste <= 3);
    if (reste <= 3 && reste > 0 && reste !== partie.dernierTic) { partie.dernierTic = reste; sfx.tic(1 - reste / 3); }
    if (partie.tempsLancer >= limite && lanceur.actif) {
      const puiss = lanceur.etat === 'charge' ? valeurJauge() : 0.55;
      lanceur.etat = 'libre';
      lancerDirect(lanceur.x, lanceur.dir.x, lanceur.dir.y, puiss);
    }
    return;
  }
  if (!parti) { // duel : mon lancer est prêt, j'attends celui d'en face
    ui.minuteur?.(`⏳ Lancer prêt — en attente de ${partie.adversaire?.nom || 'l\'adversaire'}…`, false);
    if (partie.ami?.hote && !partie.sonLancer && partie.tempsLancer > limite + 3) { partie.sonLancer = lancerParDefaut(); tenterLacher(); }
    if (!partie.ami && !partie.sonLancer && partie.tempsLancer > limite) lancerBot(); // le bot ne traîne jamais plus que toi
    return;
  }
  partie.depuisLancer += d;
  const surplus = partie.depuisLancer - PARTIE.accelererApres;
  partie.acceleration = surplus > 0 && !partie.resultat ? Math.min(PARTIE.accelerationMax, 1 + surplus * 0.5) : 1;
  ui.minuteur?.(partie.acceleration > 1.05 ? `⏩ Accéléré ×${Math.round(partie.acceleration)}` : '', false);
}

// ---------------------------------------------------------------- Boucle
export function majPartie(dt, t) {
  if (!partie.active) return;
  partie.tempsJeu += dt;
  majCafards(dt, t, partie.mesToupies.filter(enJeu));
  if (partie.ami && !partie.ami.hote && partie.type === 'duel') { majInvite(dt); return; }
  if (partie.phase !== 'jeu') { majToupies(dt, rappels); return; }
  if (partie.type === 'duel' && partie.botLanceDans > 0 && !partie.botLance) {
    partie.botLanceDans -= dt;
    if (partie.botLanceDans <= 0) lancerBot();
  }
  majToupies(dt, rappels);
  if (partie.ami && partie.type === 'duel') envoyerEtat();
  const mes = partie.mesToupies, lancees = mes.length > 0, toutesTombees = lancees && !mes.some(enJeu);
  minuteurs(dt, lancees);

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
      partie.finReel = performance.now() + 1800 / (window.__tc2?.acceleration ?? 1);
      ralentir(0.25, 0.6);
      ui.finDuel?.(gagne);
    } else if (partie.chrono > PARTIE.dureeMaxDuel && !partie.resultat) {
      partie.resultat = { gagne: force(mes) >= force(ses), tempsEcoule: true };
      partie.finReel = performance.now() + 1500 / (window.__tc2?.acceleration ?? 1);
      ui.finDuel?.(partie.resultat.gagne);
    }
    // Verdict rendu : on enchaîne vite, en temps RÉEL (le ralenti et un appareil lent n'allongent pas l'attente)
    if (partie.resultat && performance.now() >= partie.finReel) finDuel();
  }
}

// ---------------------------------------------------------------- Fins de manche
function finLancer() {
  if (partie.entrainement) return finLancerEntrainement();
  partie.phase = 'bilan';
  lanceur.actif = false;
  terminerManche({ type: 'cafards', tues: partie.tues, restants: cafards.filter(c => !c.mort).length, lancer: lancerDansEtape() });
}

function finDuel() {
  partie.phase = 'bilan';
  lanceur.actif = false;
  if (partie.ami) { finDuelAmi(partie.resultat.gagne); return; }
  const adv = partie.adversaire, deg = PARTIE.degatsDuel(etape());
  const gagne = partie.resultat.gagne;
  if (gagne) adv.vies -= deg; else partie.moi.vies -= deg;
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
    partie.prochainAdversaire = partie.ami ? partie.ami.joueur : choisirAdversaire();
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
  partie.offres = tirerOffresPour(partie.moi.achats, mesStats().veine);
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

export function prixAmelio(id, rarete = 'commune') {
  const a = AMELIO[id], n = ach(id);
  if (id === 'priorite' && !prioriteDispo()) return null;
  return n >= a.max ? null : paquet(a, n, rarete).prix;
}
export const niveauxAchat = (id, rarete = 'commune') => (paquet(AMELIO[id], ach(id), rarete)?.niveaux || 0);

// Acheter une offre : les niveaux gagnés dépendent de sa rareté (même prix) ; ensuite les offres sont relancées (gratuit)
export function acheter(id, rarete = 'commune') {
  const prix = prixAmelio(id, rarete);
  if (prix == null || partie.argent < prix) { son('refus'); return false; }
  const pq = paquet(AMELIO[id], ach(id), rarete);
  partie.argent -= prix;
  partie.moi.niveaux[id] = niv(id) + pq.niveaux;
  partie.moi.achats = { ...(partie.moi.achats || {}), [id]: ach(id) + pq.achats };
  sfx.achat();
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

// ---------------------------------------------------------------- Défi entre amis (temps réel, pair à pair)
// L'HÔTE calcule toute la physique et envoie l'état ~20 fois par seconde ; l'INVITÉ envoie seulement son lancer et
// affiche des « fantômes » des toupies. Chacun se voit EN BAS du plateau : l'invité voit tout en miroir (x → −x, z → −z).
// Partie : comme une vraie partie à 2 (3 lancers contre ses cafards, boutique, puis duel), 5 vies, 1 vie par duel perdu.
export function demarrerAmi({ hote, envoyer, moi, ami }) {
  nouvellePartie(moi.equipe, { pseudo: moi.pseudo || 'Toi', nivPieces: moi.nivPieces, terrain: moi.terrain });
  const joueurAmi = { nom: ami.pseudo || 'Ton ami', bot: false, vies: PARTIE.vies, equipe: ami.equipe, nivPieces: ami.nivPieces,
    terrain: ami.terrain || 'aucun', niveaux: {}, achats: {}, elimine: false, place: 0 };
  partie.joueurs = [partie.moi, joueurAmi];
  partie.ami = { hote, envoyer, joueur: joueurAmi, dernierEnvoi: 0, fantomes: new Map(), etat: null, moiPret: false, luiPret: false, go: false };
  partie.mode = 'ami';
}
export function quitterAmi() { partie.ami = null; }

let tEnvoi = 0;
function envoyerEtat() {
  const now = performance.now();
  if (now - tEnvoi < 50) return;
  tEnvoi = now;
  const liste = [];
  for (const [camp, l] of [['joueur', partie.mesToupies], ['adverse', partie.sesToupies]]) l.forEach((t, i) => {
    if (t.lancee) liste.push([camp, i, +t.x.toFixed(4), +t.z.toFixed(4), +(t.rotation / t.rotationMax).toFixed(3), t.tombe ? 1 : 0,
      +t.mesh.inclinaison.rotation.x.toFixed(3), +t.mesh.inclinaison.rotation.z.toFixed(3)]);
  });
  partie.ami.envoyer({ type: 'etat', t: liste, phase: partie.phase });
}

// Messages reçus de l'ami
export function messageAmi(m) {
  const A = partie.ami;
  if (!A) return;
  if (A.hote && m.type === 'lancer' && partie.type === 'duel' && partie.phase === 'jeu' && !partie.sonLancer) {
    // Le lancer de l'invité arrive dans SON repère : on le retourne (il est en face de nous), et on attend le nôtre
    partie.sonLancer = { x: -m.x, z: -m.z, dx: -m.dx, dz: -m.dz, puiss: m.puiss };
    tenterLacher();
  } else if (A.hote && m.type === 'pret-duel') {
    A.joueur.niveaux = m.niveaux || {}; A.luiPret = true; tenterDuelAmi();
  } else if (!A.hote && m.type === 'go-duel') {
    A.joueur.niveaux = m.niveaux || {}; A.go = true; A.moiPret = false; commencerManche();
  } else if (!A.hote && m.type === 'etat') {
    A.etat = m;
  } else if (!A.hote && m.type === 'choc') {
    // Vu de l'invité : tout est en miroir, et « joueur » / « adverse » sont inversés
    const pct = m.pct, moiTouche = m.cible === 'adverse';
    etincelles(-m.x, -m.z, 8 + Math.round(pct), m.crit ? 0xfff27a : 0xffc46a, 0.8 + pct / 10);
    geler(Math.min(90, 30 + pct * 6)); secouer(Math.min(0.02, 0.004 + pct * 0.0015));
    sfx.metal(Math.min(1, pct / 10), -m.x / ARENE_R);
    popup(m.bloque ? '🛡️ Bloqué' : `${m.crit ? '💥 ' : ''}−${Math.max(1, Math.round(pct))} %`, -m.bx, -m.bz, moiTouche ? 'degat-moi' : 'degat');
  } else if (!A.hote && m.type === 'fin') {
    finDuelAmi(!m.gagneHote);
  }
}

// Invité : pas de physique, on suit l'état envoyé par l'hôte (fantômes lissés)
function majInvite(dt) {
  const A = partie.ami;
  if (partie.phase === 'jeu') minuteurs(dt, !!partie.lachees);
  const e = A.etat;
  if (!e) return;
  const vus = new Set();
  for (const [campHote, i, x, z, ratio, tombe, ix, iz] of e.t) {
    const camp = campHote === 'joueur' ? 'adverse' : 'joueur', cle = camp + i;
    vus.add(cle);
    let f = A.fantomes.get(cle);
    if (!f) {
      const j = camp === 'joueur' ? partie.moi : A.joueur;
      f = creerToupieJeu(j.equipe, j.niveaux, camp, j.nivPieces, { duel: true });
      lancerToupie(f, -x, -z, 0, -1, 0.5);
      A.fantomes.set(cle, f);
      partie.lachees = true; if (camp === 'adverse') partie.botLance = true; // la caméra suit le duel
      (camp === 'joueur' ? partie.mesToupies : partie.sesToupies).push(f);
    }
    const k = 1 - Math.exp(-18 * dt);
    f.x += (-x - f.x) * k; f.z += (-z - f.z) * k;
    f.rotation = ratio * f.rotationMax; f.tombe = tombe;
    f.mesh.racine.position.set(f.x, 0, f.z);
    f.mesh.racine.visible = !tombe;
    f.mesh.inclinaison.rotation.set(-ix, 0, -iz);
    f.mesh.rotor.rotation.y += dt * (6 + 30 * ratio);
  }
}

// Duel entre amis : on attend que les deux aient fini leurs lancers et leur boutique (les améliorations achetées
// sont échangées pour que chacun voie la vraie toupie de l'autre), puis l'hôte donne le départ
function attendreDuelAmi() {
  const A = partie.ami;
  partie.phase = 'attente'; lanceur.actif = false;
  viderToupies(); partie.mesToupies = []; partie.sesToupies = [];
  A.moiPret = true;
  A.envoyer({ type: 'pret-duel', niveaux: partie.moi.niveaux });
  ui.minuteur?.(`⏳ En attente de ${A.joueur.nom} (il finit ses lancers)…`, false);
  if (A.hote) tenterDuelAmi();
}
function tenterDuelAmi() {
  const A = partie.ami;
  if (!A?.hote || !A.moiPret || !A.luiPret || partie.phase !== 'attente') return;
  A.moiPret = A.luiPret = false; A.go = true;
  A.envoyer({ type: 'go-duel', niveaux: partie.moi.niveaux });
  commencerManche();
}

// Fin d'un duel entre amis (gagne : vu de CE joueur) : vies, puis bilan et boutique comme d'habitude
function finDuelAmi(gagne) {
  const A = partie.ami;
  if (partie.phase === 'bilan' && !A.hote) return;
  partie.phase = 'bilan'; lanceur.actif = false;
  if (A.hote) A.envoyer({ type: 'fin', gagneHote: gagne });
  else ui.finDuel?.(gagne);
  const deg = PARTIE.degatsDuel(etape());
  if (gagne) A.joueur.vies -= deg; else partie.moi.vies -= deg;
  terminerManche({ type: 'duel', gagne, adversaire: A.joueur.nom, degats: deg, contacts: partie.contacts, duree: partie.chrono });
}

// ---------------------------------------------------------------- Entraînement : un mannequin immobile à vie infinie
// On lance autant qu'on veut ; chaque coup affiche ses dégâts ; ni chrono, ni boutique, ni adversaire.
export function demarrerEntrainement(equipe, nivPieces) {
  nouvellePartie(equipe, { nivPieces });
  partie.mode = 'entrainement';
  partie.entrainement = { lancer: 0, coups: 0, meilleur: 0, meilleurLancer: 0, lancers: 0 };
  partie.joueurs = [partie.moi];
  commencerManche();
}
function mancheEntrainement() {
  Object.assign(partie, { resultat: null, chrono: 0, tues: 0, attenteRelance: 0, tempsLancer: 0, depuisLancer: 0, acceleration: 1, horloge: null,
    monLancer: null, sonLancer: null, lachees: false, type: 'cafards' });
  viderToupies(); partie.mesToupies = []; partie.sesToupies = [];
  choisirTerrain(null); decorTerrain(null); modeDuel(false); railAdverse.visible = false;
  if (!cafards.some(c => c.t.fixe)) { viderCafards(); viderTaches(); ajouterCafard({ vieBase: 1, type: 'mannequin', x: 0, z: -0.12 }); }
  partie.entrainement.lancer = 0; partie.entrainement.coups = 0;
  partie.lancers = 1; partie.phase = 'jeu';
  lanceur.actif = true; lanceur.zoneParfait = mesStats().parfait;
  ui.entrainement?.(partie.entrainement);
}
function finLancerEntrainement() {
  const E = partie.entrainement;
  E.lancers++; E.meilleurLancer = Math.max(E.meilleurLancer, E.lancer);
  ui.entrainement?.(E, true);
  partie.phase = 'bilan';
  setTimeout(() => { if (partie.entrainement === E && partie.active) commencerManche(); }, 900);
}
