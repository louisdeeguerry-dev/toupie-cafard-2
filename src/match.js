// Le déroulement d'une partie : salon de 8 joueurs (toi + bots), cycles de 3 vagues de cafards + 1 duel,
// économie entre les manches, vies, éliminations, classement final.
import { PARTIE, VAGUE, ECONOMIE, RAIL_Z, DESK_X, RAIL_MARGIN } from './config.js';
import { PIECES, SLOTS, DEPART } from './data/pieces.js';
import { AMELIORATIONS, AMELIO, NOMS_BOTS } from './data/boutique.js';
import { statsToupie, puissance } from './stats.js';
import { ajouterCafard, viderCafards, cafards, majCafards } from './bugs.js';
import { creerToupieJeu, viderToupies, lancerToupie, majToupies, enJeu, toupies } from './physics.js';
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
export function nouvellePartie(equipe, pseudo = 'Toi') {
  const noms = melanger([...NOMS_BOTS]);
  const joueurs = [{ nom: pseudo, bot: false, vies: PARTIE.vies, equipe, niveaux: {}, elimine: false, place: 0 }];
  for (let i = 1; i < PARTIE.joueurs; i++) joueurs.push({ nom: noms[i], bot: true, vies: PARTIE.vies, equipe: equipeBot(), niveaux: {}, elimine: false, place: 0 });
  Object.assign(partie, {
    active: true, joueurs, moi: joueurs[0], manche: 0, vague: 0, argent: PARTIE.argentDepart,
    phase: 'attente', type: null, lancers: 0, tues: 0, objectif: 0, primeObjectif: false,
    adversaire: null, maToupie: null, saToupie: null, attenteRelance: 0, resultat: null, chrono: 0, gainsManche: 0,
  });
  return partie;
}

export const etape = () => Math.floor(partie.manche / PARTIE.cycle.length) + 1;
export const typeManche = (m = partie.manche) => PARTIE.cycle[m % PARTIE.cycle.length];
export const vivants = () => partie.joueurs.filter(j => !j.elimine);

// ---------------------------------------------------------------- Manches
export function commencerManche() {
  nettoyerPlateau();
  partie.type = typeManche();
  partie.gainsManche = 0;
  partie.resultat = null;
  partie.chrono = 0;
  const moi = partie.moi;
  partie.maToupie = creerToupieJeu(moi.equipe, moi.niveaux, 'joueur');
  if (partie.type === 'cafards') {
    partie.vague++;
    const n = partie.vague;
    const nb = VAGUE.nombre(n) + 2 * (moi.niveaux.nid || 0);
    const chanceDore = 0.05 * (moi.niveaux.dore || 0);
    for (let i = 0; i < nb; i++) ajouterCafard({ vie: VAGUE.vieCafard(n), dore: Math.random() < chanceDore, delai: i * 0.06 });
    partie.objectif = VAGUE.objectif(n);
    partie.tues = 0;
    partie.primeObjectif = false;
    partie.lancers = PARTIE.lancersParVague;
    son('chute', { volume: 0.4 });
  } else {
    const adv = melanger(vivants().filter(j => j.bot))[0];
    partie.adversaire = adv;
    partie.saToupie = creerToupieJeu(adv.equipe, adv.niveaux, 'adverse');
    partie.lancers = 1;
    railAdverse.visible = true;
    partie.botLance = false;
  }
  partie.phase = 'jeu';
  lanceur.actif = true;
  ui.manche?.();
}

function nettoyerPlateau() {
  viderCafards();
  viderToupies();
  viderTaches();
  railAdverse.visible = false;
  partie.saToupie = null;
  partie.adversaire = null;
}

// Appelé par le lanceur
export function lancer({ x, z, dx, dz, puissance, parfait }) {
  if (partie.phase !== 'jeu' || partie.lancers <= 0) return;
  if (partie.maToupie && enJeu(partie.maToupie)) return;
  partie.lancers--;
  lancerToupie(partie.maToupie, x, z, dx, dz, Math.min(1.08, puissance));
  lanceur.actif = false;
  son('toc', { hauteur: 0.8 });
  if (parfait) popup('PARFAIT !', x, z - 0.06, 'parfait');
  if (partie.type === 'duel') partie.botLanceDans = 0.25 + Math.random() * 0.3;
  ui.hud?.();
}

function lancerBot() {
  const t = partie.saToupie, cible = partie.maToupie;
  const x = Math.max(-DESK_X + RAIL_MARGIN, Math.min(DESK_X - RAIL_MARGIN, (Math.random() * 2 - 1) * 0.4));
  const z = -RAIL_Z + 0.04;
  const tx = (cible ? cible.x : 0) + (Math.random() - 0.5) * 0.25, tz = (cible ? cible.z : 0.1) + (Math.random() - 0.5) * 0.2;
  lancerToupie(t, x, z, tx - x, tz - z, 0.55 + Math.random() * 0.45);
  partie.botLance = true;
  son('toc', { hauteur: 0.7 });
}

const rappels = {
  tue(c, t) {
    if (t.camp !== 'joueur') return;
    const gain = Math.round(VAGUE.prime * (1 + 0.25 * (partie.moi.niveaux.dodus || 0)) * (c.dore ? 5 : 1));
    partie.argent += gain; partie.gainsManche += gain; partie.tues++;
    tache(c.x, c.z, c.r * 1.3, c.dore ? 0x8a6a10 : 0x3a2a12);
    popup('+' + gain + ' 💰', c.x, c.z, c.dore ? 'dore' : 'argent');
    son(c.dore ? 'piece' : 'ecrase', { volume: 0.7 });
    if (!partie.primeObjectif && partie.tues >= partie.objectif) {
      partie.primeObjectif = true;
      const b = VAGUE.bonusObjectif(partie.vague);
      partie.argent += b; partie.gainsManche += b;
      popup('🎯 Objectif ! +' + b + ' 💰', 0, 0, 'objectif');
      son('critique');
    }
    ui.hud?.();
  },
  touche(c) { son('toc', { volume: 0.35, hauteur: 1.3 }); },
  choc(a, b, degats, bloque) {
    son(bloque ? 'refus' : 'gros', { volume: Math.min(1, 0.3 + degats / 25) });
    popup(bloque ? '🛡️ Bloqué' : '-' + Math.round(degats), b.x, b.z, b.camp === 'joueur' ? 'degat-moi' : 'degat');
  },
  mur() { son('toc', { volume: 0.25, hauteur: 0.6 }); },
  chute(t) { son('chute', { volume: 0.6 }); },
};

// ---------------------------------------------------------------- Boucle
export function majPartie(dt, t) {
  if (!partie.active) return;
  partie.tempsJeu = (partie.tempsJeu || 0) + dt;
  majCafards(dt, t);
  if (partie.phase !== 'jeu') { majToupies(dt, rappels); return; }
  if (partie.type === 'duel' && partie.botLanceDans > 0 && !partie.botLance) {
    partie.botLanceDans -= dt;
    if (partie.botLanceDans <= 0) lancerBot();
  }
  majToupies(dt, rappels);
  const ma = partie.maToupie;

  if (partie.type === 'cafards') {
    const restants = cafards.filter(c => !c.mort).length;
    if (restants === 0) return finVague();
    if (ma.lancee && ma.tombe) {
      partie.attenteRelance += dt;
      if (partie.attenteRelance > 0.7) {
        partie.attenteRelance = 0;
        if (partie.lancers <= 0) return finVague();
        ma.lancee = false; ma.mesh.racine.visible = false;
        lanceur.actif = true;
      }
    }
  } else {
    const sa = partie.saToupie;
    if (ma.lancee && sa.lancee) partie.chrono += dt;
    const maTombe = ma.lancee && ma.tombe, saTombe = sa.lancee && sa.tombe;
    if ((maTombe || saTombe) && !partie.resultat) {
      // Qui est tombée la première ? Si les deux en même temps : la plus forte rotation restante gagne
      const gagne = maTombe && saTombe ? ma.rotation / ma.rotationMax > sa.rotation / sa.rotationMax : saTombe;
      partie.resultat = { gagne };
      partie.finDans = 1.2;
    } else if (partie.chrono > PARTIE.dureeMaxDuel && !partie.resultat) {
      partie.resultat = { gagne: ma.rotation / ma.rotationMax >= sa.rotation / sa.rotationMax, tempsEcoule: true };
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
  const bilan = { type: 'cafards', tues: partie.tues, objectif: partie.objectif, reussi: partie.tues >= partie.objectif };
  terminerManche(bilan);
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
      const pa = Math.pow(puissance(statsToupie(a.equipe, a.niveaux)), 3), pb = Math.pow(puissance(statsToupie(b.equipe, b.niveaux)), 3);
      (Math.random() < pa / (pa + pb) ? b : a).vies -= PARTIE.degatsDuel(etape());
    }
  }
  // Les bots s'améliorent comme un joueur moyen
  for (const b of vivants().filter(j => j.bot)) {
    if (Math.random() < 0.75) {
      const a = hasard(AMELIORATIONS.filter(x => x.stat));
      b.niveaux[a.id] = Math.min(a.max, (b.niveaux[a.id] || 0) + 1);
    }
  }
  // Revenus de fin de manche + intérêts
  const interets = Math.min(Math.floor(partie.argent / ECONOMIE.interetPour), ECONOMIE.interetMax + (partie.moi.niveaux.tirelire || 0));
  partie.argent += ECONOMIE.revenuManche + interets;
  bilan.revenu = ECONOMIE.revenuManche;
  bilan.interets = interets;
  bilan.gains = partie.gainsManche;
  // Éliminations (les joueurs éliminés en même temps se partagent la place la plus basse)
  const tombes = vivants().filter(j => j.vies <= 0);
  const place = vivants().length - tombes.length + 1;
  for (const j of tombes) { j.elimine = true; j.place = place; j.vies = 0; }
  bilan.elimines = tombes.filter(j => j.bot).map(j => j.nom);

  if (partie.moi.elimine) return finPartie(partie.moi.place, bilan);
  if (vivants().length === 1) { partie.moi.place = 1; return finPartie(1, bilan); }
  partie.manche++;
  bilan.prochaine = typeManche();
  ui.bilan?.(bilan);
}

function finPartie(place, bilan) {
  partie.phase = 'fin';
  partie.active = false;
  lanceur.actif = false;
  const boites = place === 1 ? 3 : place <= 4 ? 2 : 1;
  ui.fin?.({ place, boites, bilan });
}

// ---------------------------------------------------------------- Boutique
export function prixAmelio(id) {
  const a = AMELIO[id], n = partie.moi.niveaux[id] || 0;
  return n >= a.max ? null : a.prix(n);
}

export function acheter(id) {
  const prix = prixAmelio(id);
  if (prix == null || partie.argent < prix) { son('refus'); return false; }
  partie.argent -= prix;
  partie.moi.niveaux[id] = (partie.moi.niveaux[id] || 0) + 1;
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
