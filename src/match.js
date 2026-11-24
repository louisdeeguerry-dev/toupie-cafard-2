// Le déroulement d'une partie : salon de 8 joueurs (toi + bots), cycles de 3 vagues de cafards + 1 duel,
// économie entre les manches, vies, éliminations, classement final.
// La toupie choisie avant la partie est VERROUILLÉE jusqu'à la fin : en partie, on n'achète que des niveaux.
import { PARTIE, VAGUE, ECONOMIE, RAIL_Z, DESK_X, RAIL_MARGIN } from './config.js';
import { PIECES, SLOTS, DEPART } from './data/pieces.js';
import { AMELIO, STAT_ACHATS, NOMS_BOTS } from './data/boutique.js';
import { statsToupie, puissance } from './stats.js';
import { ajouterCafard, viderCafards, cafards, majCafards } from './bugs.js';
import { creerToupieJeu, viderToupies, retirerToupie, lancerToupie, majToupies, enJeu, toupies } from './physics.js';
import { lanceur } from './launcher.js';
import { railAdverse } from './scene.js';
import { popup, tache, viderTaches } from './fx.js';
import { son } from './audio.js';

export const partie = { active: false };
let ui = {}; // rappels vers l'interface (posés par main.js)
export function brancherInterface(u) { ui = u; }

const hasard = a => a[Math.floor(Math.random() * a.length)];
const melanger = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };

function equipeBot() {
  const e = { ...DEPART };
  for (const s of SLOTS) if (Math.random() < 0.6) e[s.id] = hasard(PIECES.filter(p => p.slot === s.id)).id;
  return e;
}

// ---------------------------------------------------------------- Début de partie
export function nouvellePartie(equipe, { pseudo = 'Toi', mode = 'normale' } = {}) {
  const noms = melanger([...NOMS_BOTS]);
  const joueurs = [{ nom: pseudo, bot: false, vies: PARTIE.vies, equipe: Object.freeze({ ...equipe }), niveaux: {}, elimine: false, place: 0 }];
  for (let i = 1; i < PARTIE.joueurs; i++) joueurs.push({ nom: noms[i], bot: true, vies: PARTIE.vies, equipe: equipeBot(), niveaux: {}, elimine: false, place: 0 });
  Object.assign(partie, {
    active: true, mode, joueurs, moi: joueurs[0], manche: 0, vague: 0, argent: PARTIE.argentDepart,
    phase: 'attente', type: null, lancers: 0, tues: 0, objectif: 0, primeObjectif: false,
    adversaire: null, mesToupies: [], sesToupies: [], attenteRelance: 0, resultat: null, chrono: 0, gainsManche: 0,
    combo: 0, dernierKill: -9, renfortT: 0, tempsJeu: 0,
  });
  return partie;
}

export const etape = () => Math.floor(partie.manche / PARTIE.cycle.length) + 1;
export const typeManche = (m = partie.manche) => PARTIE.cycle[m % PARTIE.cycle.length];
export const vivants = () => partie.joueurs.filter(j => !j.elimine);
export const mesStats = () => statsToupie(partie.moi.equipe, partie.moi.niveaux);
const niv = id => partie.moi.niveaux[id] || 0;

// ---------------------------------------------------------------- Manches
export function commencerManche() {
  nettoyerPlateau();
  partie.type = typeManche();
  partie.gainsManche = 0;
  partie.resultat = null;
  partie.chrono = 0;
  partie.combo = 0;
  partie.renfortT = 0;
  if (partie.type === 'cafards') {
    partie.vague++;
    const n = partie.vague;
    const nb = VAGUE.nombre(n) + 2 * niv('nid');
    for (let i = 0; i < nb; i++) ajouterCafard({ vie: VAGUE.vieCafard(n), dore: Math.random() < chanceDore(), delai: i * 0.06 });
    partie.objectif = VAGUE.objectif(n);
    partie.tues = 0;
    partie.primeObjectif = false;
    partie.lancers = PARTIE.lancersParVague;
    son('chute', { volume: 0.4 });
  } else {
    partie.adversaire = melanger(vivants().filter(j => j.bot))[0];
    partie.lancers = 1;
    railAdverse.visible = true;
    partie.botLance = false;
    partie.botLanceDans = 0;
  }
  partie.phase = 'jeu';
  lanceur.actif = true;
  lanceur.zoneParfait = mesStats().parfait;
  ui.manche?.();
}

const chanceDore = () => (niv('chance') ? 0.04 + 0.03 * niv('chance') : 0);

function nettoyerPlateau() {
  viderCafards();
  viderToupies();
  viderTaches();
  railAdverse.visible = false;
  partie.mesToupies = [];
  partie.sesToupies = [];
  partie.adversaire = null;
}

// Lance les N toupies d'un joueur (Multi-lancer : en éventail)
function lancerGroupe(joueur, camp, x, z, dx, dz, puiss) {
  const n = statsToupie(joueur.equipe, joueur.niveaux).toupies, liste = [];
  const a0 = Math.atan2(dz, dx);
  for (let i = 0; i < n; i++) {
    const t = creerToupieJeu(joueur.equipe, joueur.niveaux, camp);
    const a = a0 + (i - (n - 1) / 2) * 0.22;
    lancerToupie(t, x + (i - (n - 1) / 2) * 0.03, z, Math.cos(a), Math.sin(a), puiss);
    liste.push(t);
  }
  return liste;
}

// Appelé par le lanceur
export function lancer({ x, z, dx, dz, puissance: puiss, parfait }) {
  if (partie.phase !== 'jeu' || partie.lancers <= 0 || partie.mesToupies.some(enJeu)) return;
  partie.lancers--;
  for (const t of partie.mesToupies) retirerToupie(t);
  partie.mesToupies = lancerGroupe(partie.moi, 'joueur', x, z, dx, dz, Math.min(1.08, puiss));
  lanceur.actif = false;
  son('toc', { hauteur: 0.8 });
  if (parfait) popup('PARFAIT !', x, z - 0.06, 'parfait');
  if (partie.type === 'duel') partie.botLanceDans = 0.25 + Math.random() * 0.3;
  ui.hud?.();
}

function lancerBot() {
  const cible = partie.mesToupies.find(enJeu);
  const x = Math.max(-DESK_X + RAIL_MARGIN, Math.min(DESK_X - RAIL_MARGIN, (Math.random() * 2 - 1) * 0.4));
  const z = -RAIL_Z + 0.04;
  const tx = (cible ? cible.x : 0) + (Math.random() - 0.5) * 0.25, tz = (cible ? cible.z : 0.1) + (Math.random() - 0.5) * 0.2;
  partie.sesToupies = lancerGroupe(partie.adversaire, 'adverse', x, z, tx - x, tz - z, 0.55 + Math.random() * 0.45);
  partie.botLance = true;
  son('toc', { hauteur: 0.7 });
}

const rappels = {
  tue(c, t, crit) {
    if (t.camp !== 'joueur' || partie.type !== 'cafards') return;
    // Combo : plusieurs cafards à la suite rapportent de plus en plus
    const fenetre = 1.2 + 0.2 * niv('combo'), bonusCombo = 0.1 + 0.05 * niv('combo');
    partie.combo = partie.tempsJeu - partie.dernierKill < fenetre ? partie.combo + 1 : 1;
    partie.dernierKill = partie.tempsJeu;
    const brut = VAGUE.prime * (1 + 0.2 * niv('prime')) * (c.dore ? 5 : 1) * (1 + bonusCombo * (partie.combo - 1));
    const gain = Math.max(1, Math.round(brut));
    partie.argent += gain; partie.gainsManche += gain; partie.tues++;
    tache(c.x, c.z, c.r * 1.3, c.dore ? 0x8a6a10 : 0x3a2a12);
    popup((crit ? '💥 ' : '') + '+' + gain + ' 💰' + (partie.combo > 2 ? ` · combo ×${partie.combo}` : ''), c.x, c.z, c.dore ? 'dore' : crit ? 'crit' : 'argent');
    son(c.dore ? 'piece' : 'ecrase', { volume: 0.7, hauteur: 1 + Math.min(0.5, partie.combo * 0.04) });
    if (!partie.primeObjectif && partie.tues >= partie.objectif) {
      partie.primeObjectif = true;
      const b = VAGUE.bonusObjectif(partie.vague);
      partie.argent += b; partie.gainsManche += b;
      popup('🎯 Objectif ! +' + b + ' 💰', 0, 0, 'objectif');
      son('critique');
    }
    ui.hud?.();
  },
  touche(c, t, degats, crit) { if (crit) popup('💥 CRITIQUE', c.x, c.z, 'crit'); son('toc', { volume: 0.35, hauteur: 1.3 }); },
  eclair() { son('critique', { volume: 0.35, hauteur: 1.6 }); },
  choc(a, b, perte, bloque, crit) {
    son(bloque ? 'refus' : 'gros', { volume: Math.min(1, 0.3 + perte / 400) });
    popup(bloque ? '🛡️ Bloqué' : `${crit ? '💥 ' : ''}−${Math.round(perte)} tr/min`, b.x, b.z, b.camp === 'joueur' ? 'degat-moi' : 'degat');
  },
  mur() { son('toc', { volume: 0.25, hauteur: 0.6 }); },
  chute() { son('chute', { volume: 0.6 }); },
};

// ---------------------------------------------------------------- Boucle
export function majPartie(dt, t) {
  if (!partie.active) return;
  partie.tempsJeu += dt;
  majCafards(dt, t);
  if (partie.phase !== 'jeu') { majToupies(dt, rappels); return; }
  if (partie.type === 'duel' && partie.botLanceDans > 0 && !partie.botLance) {
    partie.botLanceDans -= dt;
    if (partie.botLanceDans <= 0) lancerBot();
  }
  majToupies(dt, rappels);
  const mes = partie.mesToupies, lancees = mes.length > 0, toutesTombees = lancees && !mes.some(enJeu);

  if (partie.type === 'cafards') {
    // Appât : des renforts arrivent pendant que la toupie tourne
    if (niv('appat') && mes.some(enJeu)) {
      partie.renfortT += dt;
      if (partie.renfortT > 6 / (1 + 0.25 * (niv('appat') - 1))) {
        partie.renfortT = 0;
        ajouterCafard({ vie: VAGUE.vieCafard(partie.vague), dore: Math.random() < chanceDore() });
      }
    }
    if (!cafards.some(c => !c.mort)) return finVague();
    if (toutesTombees) {
      partie.attenteRelance += dt;
      if (partie.attenteRelance > 0.7) {
        partie.attenteRelance = 0;
        if (partie.lancers <= 0) return finVague();
        for (const t of mes) retirerToupie(t);
        partie.mesToupies = [];
        lanceur.actif = true;
      }
    }
  } else {
    const ses = partie.sesToupies, saTombe = ses.length > 0 && !ses.some(enJeu);
    if (lancees && ses.length) partie.chrono += dt;
    const force = l => l.reduce((a, x) => a + (enJeu(x) ? x.rotation / x.rotationMax : 0), 0);
    if ((toutesTombees || saTombe) && !partie.resultat) {
      // Le premier camp dont toutes les toupies sont tombées a perdu
      const gagne = toutesTombees && saTombe ? Math.random() < 0.5 : saTombe;
      partie.resultat = { gagne };
      partie.finDans = 1.2;
    } else if (partie.chrono > PARTIE.dureeMaxDuel && !partie.resultat) {
      partie.resultat = { gagne: force(mes) >= force(ses), tempsEcoule: true };
      partie.finDans = 0.8;
    }
    if (partie.resultat) {
      partie.finDans -= dt;
      if (partie.finDans <= 0) finDuel();
    }
  }
}

// ---------------------------------------------------------------- Fins de manche
function finVague() {
  partie.phase = 'bilan';
  lanceur.actif = false;
  terminerManche({ type: 'cafards', tues: partie.tues, objectif: partie.objectif, reussi: partie.tues >= partie.objectif });
}

function finDuel() {
  partie.phase = 'bilan';
  lanceur.actif = false;
  const adv = partie.adversaire, deg = PARTIE.degatsDuel(etape());
  const gagne = partie.resultat.gagne;
  if (gagne) { adv.vies -= deg; partie.argent += ECONOMIE.victoireDuel; partie.gainsManche += ECONOMIE.victoireDuel; son('critique'); }
  else { partie.moi.vies -= deg; son('refus'); }
  terminerManche({ type: 'duel', gagne, adversaire: adv.nom, degats: deg, tempsEcoule: !!partie.resultat.tempsEcoule });
}

function terminerManche(bilan) {
  // Duels entre bots (simulés), pendant ce temps
  if (bilan.type === 'duel') {
    const bots = melanger(vivants().filter(j => j.bot && j !== partie.adversaire));
    for (let i = 0; i + 1 < bots.length; i += 2) {
      const a = bots[i], b = bots[i + 1];
      const pa = Math.pow(puissance(a.equipe, a.niveaux), 3), pb = Math.pow(puissance(b.equipe, b.niveaux), 3);
      (Math.random() < pa / (pa + pb) ? b : a).vies -= PARTIE.degatsDuel(etape());
    }
  }
  // Les bots s'améliorent comme un joueur moyen
  for (const b of vivants().filter(j => j.bot)) {
    if (Math.random() < 0.8) {
      const a = hasard(STAT_ACHATS.filter(x => !x.id.match(/multi/)));
      b.niveaux[a.id] = Math.min(a.max, (b.niveaux[a.id] || 0) + 1);
    }
  }
  // Revenus de fin de manche + intérêts
  const interets = Math.min(Math.floor(partie.argent / ECONOMIE.interetPour), ECONOMIE.interetMax + niv('tirelire'));
  partie.argent += ECONOMIE.revenuManche + interets;
  Object.assign(bilan, { revenu: ECONOMIE.revenuManche, interets, gains: partie.gainsManche });
  // Éliminations (les joueurs éliminés en même temps se partagent la place la plus basse)
  const tombes = vivants().filter(j => j.vies <= 0);
  const place = vivants().length - tombes.length + 1;
  for (const j of tombes) { j.elimine = true; j.place = place; j.vies = 0; }
  bilan.elimines = tombes.filter(j => j.bot).map(j => j.nom);

  if (partie.moi.elimine) return finPartie(partie.moi.place);
  if (vivants().length === 1) { partie.moi.place = 1; return finPartie(1); }
  partie.manche++;
  bilan.prochaine = typeManche();
  ui.bilan?.(bilan);
}

function finPartie(place) {
  // Les joueurs encore en vie se classent par vies restantes (on n'attend pas la fin de leur partie)
  const restants = melanger(vivants()).sort((a, b) => b.vies - a.vies);
  restants.forEach((j, i) => { j.place = i + 1; });
  partie.phase = 'fin';
  partie.active = false;
  lanceur.actif = false;
  ui.fin?.({ place, mode: partie.mode });
}

// ---------------------------------------------------------------- Boutique
export function prixAmelio(id) {
  const a = AMELIO[id], n = niv(id);
  return n >= a.max ? null : a.prix(n);
}

export function acheter(id) {
  const prix = prixAmelio(id);
  if (prix == null || partie.argent < prix) { son('refus'); return false; }
  partie.argent -= prix;
  partie.moi.niveaux[id] = niv(id) + 1;
  son('achat');
  return true;
}

export function abandonner() {
  nettoyerPlateau();
  partie.active = false;
  partie.phase = 'fin';
  lanceur.actif = false;
}

// Pour les tests automatiques
export const _interne = { cafards, toupies };
