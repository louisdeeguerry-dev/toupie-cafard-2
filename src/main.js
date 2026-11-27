// Point d'entrée : relie l'atelier, la partie et la boucle de rendu.
import { renderer, scene, camera, vitrine, vitrineCam } from './scene.js';
import { majModeles, selection as selectionAtelier, majAtelier, terrainVitrine, initControles, controlesActifs } from './atelier3d.js';
import { charger, sauver, reinitialiser } from './save.js';
import { lanceur, majLanceur, lancerDirect, modeleLanceur } from './launcher.js';
import { lancerDansEtape, capacite } from './match.js';
import { partie, nouvellePartie, commencerManche, majPartie, brancherInterface, lancer, abandonner, acheter, _interne } from './match.js';
import { majFx, majBarres, majEtincelles, facteurTemps } from './fx.js';
import { majCamera, rendre } from './scene.js';
import { activerAudio, ronron, musique, basculerMusique, musiqueActive, sfx, baisserMusique } from './audio.js';
import * as UI from './ui.js';
import { VERSION } from './config.js';
import { initParametres } from './parametres.js';
import { creerDefi, rejoindreDefi } from './enligne.js';
import { demarrerAmi, messageAmi, quitterAmi, demarrerEntrainement } from './match.js';
import { recompenser } from './progression.js';
import { TERRAIN } from './data/terrains.js';
import { TYPES } from './data/cafards.js';

let save = charger();
const AIDE = window.matchMedia?.('(pointer: coarse)').matches
  ? 'Touche le bas du bureau pour placer le lanceur, garde le doigt pour viser, lève-le pour lancer'
  : 'Déplace le lanceur, clique et garde appuyé pour viser, relâche pour lancer';
let mode = 'atelier';
function majVitrine(slotChange = null) {
  majModeles(save.equipe, slotChange, save.niveauxPieces);
  terrainVitrine(save.terrain);
}

const atelier = UI.creerAtelier(save, {
  onChange() { sauver(save); },
  onEquipe(slot) { majVitrine(slot); },
  onSelection(onglet, slot) { selectionAtelier(onglet, slot); },
  onJouer: demarrer,
  onBoite: boite,
});
majVitrine();

// ---------------------------------------------------------------- Écrans hors partie : menu, atelier, boutique, collection
const ECRANS = ['menu', 'atelier', 'boutiqueMeta', 'collection', 'parametres', 'ami'];
initControles(renderer.domElement);
initParametres();
function allerA(ecran) {
  for (const e of ECRANS) UI.montrer(e, e === ecran);
  controlesActifs(ecran === 'atelier'); // dans l'atelier : glisser pour pivoter, molette pour zoomer
  if (ecran === 'collection') UI.rendreCollection(save);
  if (ecran !== 'atelier') selectionAtelier('toupie', null); // hors atelier : la toupie tourne, montée
  else { const et = atelier.etat(); selectionAtelier(et.onglet, et.slot); }
  atelier.rendre();
}
document.addEventListener('click', e => {
  const b = e.target.closest('[data-ecran]');
  if (!b || mode !== 'atelier') return;
  activerAudio();
  UI.son?.('choix', { volume: 0.5 });
  allerA(b.dataset.ecran);
});
allerA('menu');

function boite() {
  UI.ouvrirBoite(save, { onFini() { sauver(save); atelier.rendre(); majVitrine(); } });
}

function demarrer() {
  activerAudio();
  nouvellePartie({ ...save.equipe }, { mode: save.mode, nivPieces: { ...save.niveauxPieces }, terrain: save.terrain });
  modeleLanceur(save.equipe);
  for (const e of ECRANS) UI.montrer(e, false);
  controlesActifs(false);
  partie.lancesFaits = 0;
  UI.rechercher(partie.joueurs.map(j => j.nom), save.mode, () => {
    mode = 'partie';
    UI.montrer('hud');
    commencerManche();
  });
}

brancherInterface({
  manche() {
    UI.majHud();
    if (partie.type === 'duel') {
      const td = partie.terrainDuel, T = td.terrain ? TERRAIN[td.terrain] : null;
      const sous = T ? `Terrain : ${T.icone} ${T.nom} (${td.de === partie.moi ? 'le tien' : 'celui de ' + partie.adversaire.nom})`
        : td.egalite ? 'Égalité de priorité de terrain : bureau neutre' : 'Bureau neutre';
      UI.bandeau(`⚔️ DUEL contre ${partie.adversaire.nom}`, sous, 2600);
      UI.aide((partie.lancesFaits || 0) < 2 ? AIDE : ''); // l'aide disparaît après 2 lancers
    } else {
      if (partie.evolution?.length) UI.bandeau('🧬 Les cafards ont évolué !', 'Nouveaux : ' + partie.evolution.map(t => TYPES[t].icone + ' ' + TYPES[t].nom).join(', '), 2600);
      else UI.bandeau(`🪳 Lancer ${lancerDansEtape()}/3`, `${partie.renfort ? `+${partie.renfort} cafards : ` : ''}${capacite()} cafards sur le bureau`);
      UI.aide((partie.lancesFaits || 0) < 2 ? AIDE : ''); // l'aide disparaît après 2 lancers
    }
  },
  hud: UI.majHud,
  entrainement(E, fin) {
    UI.aide(`🎯 Ce lancer : ${E.lancer.toFixed(1)} dégâts (${E.coups} coup${E.coups > 1 ? 's' : ''}) · meilleur coup ${E.meilleur.toFixed(1)} · meilleur lancer ${E.meilleurLancer.toFixed(1)}`);
    if (fin) UI.majHud();
  },
  finAmi(r) {
    UI.verdict(r.gagne, `${r.score[0]} – ${r.score[1]} contre ${r.adversaire}`);
    if (r.fini) setTimeout(() => {
      UI.bandeau(r.gagne ? '🏆 Défi gagné !' : '💥 Défi perdu', `${r.score[0]} – ${r.score[1]} contre ${r.adversaire}`, 3500);
      setTimeout(retourAtelier, 3500);
    }, 2200);
  },
  minuteur: UI.minuteur,
  lance() { UI.aide(''); partie.lancesFaits = (partie.lancesFaits || 0) + 1; },
  finDuel(gagne) {
    baisserMusique(2); (gagne ? sfx.victoire : sfx.defaite)();
    UI.verdict(gagne, gagne ? 'La toupie adverse s\'est arrêtée la première' : 'Ta toupie s\'est arrêtée la première');
  },
  bilan(b) {
    UI.majHud();
    UI.aide(''); UI.minuteur('');
    setTimeout(() => UI.afficherBilan(b, () => commencerManche()), b.type === 'duel' ? 250 : 400);
  },
  fin(r) {
    UI.majHud();
    const gains = recompenser(save, r.place, r.mode);
    ronron(0); setTimeout(() => { baisserMusique(3); sfx.finPartie(r.place <= 4); }, 1400); // après le jingle du duel, pas en même temps
    sauver(save);
    setTimeout(() => UI.afficherFin(r, gains, retourAtelier), 600);
  },
});

function retourAtelier() {
  quitterAmi(); finirDefi();
  abandonner();
  majBarres(); // plus aucune barre de vie au menu
  ronron(0); // le ronronnement de la toupie s'arrête
  UI.aide('');
  mode = 'atelier';
  UI.montrer('hud', false);
  UI.montrer('panneauStats', false);
  UI.minuteur('');
  allerA('menu');
  majVitrine();
}

lanceur.onLancer = lancer;
document.getElementById('btnStats').addEventListener('click', UI.basculerStats);
document.getElementById('quitter').addEventListener('click', () => {
  if (confirmerQuitter()) retourAtelier();
});
function confirmerQuitter() { return window.__tc2?.sansConfirmation || window.confirm('Quitter la partie ? Elle sera perdue.'); }
document.addEventListener('pointerdown', () => { activerAudio(); musique(); }, { once: true });
// Mode test : toutes les pièces et tous les terrains au niveau max. La vraie sauvegarde est mise de côté et revient
// quand on quitte le mode test.
const CLE_AVANT_TEST = 'toupie-cafard-2-avant-test';
const btnTest = document.getElementById('btnTest');
const enTest = () => { try { return !!localStorage.getItem(CLE_AVANT_TEST); } catch { return false; } };
btnTest.textContent = enTest() ? '🧪 Quitter le mode test' : '🧪 Mode test (tout débloqué)';
btnTest.addEventListener('click', async e => {
  e.stopPropagation();
  try {
    if (enTest()) {
      save = JSON.parse(localStorage.getItem(CLE_AVANT_TEST));
      localStorage.removeItem(CLE_AVANT_TEST);
    } else {
      localStorage.setItem(CLE_AVANT_TEST, JSON.stringify(save));
      const { PIECES } = await import('./data/pieces.js');
      for (const p of PIECES) { save.collection[p.id] = 5; save.niveauxPieces[p.id] = 5; }
      save.terrains = Object.keys(TERRAIN).filter(t => t !== 'aucun');
    }
    sauver(save);
  } catch { /* stockage bloqué */ }
  location.reload();
});
const btnMusique = document.getElementById('btnMusique');
btnMusique.textContent = musiqueActive ? '🔊 Musique' : '🔇 Musique';
btnMusique.addEventListener('click', e => { e.stopPropagation(); activerAudio(); btnMusique.textContent = basculerMusique() ? '🔊 Musique' : '🔇 Musique'; });

// ---------------------------------------------------------------- Boucle
let avant = performance.now(), t = 0;
function boucle(maintenant) {
  const dtReel = Math.min(0.05, (maintenant - avant) / 1000);
  // acceleration : tests auto ; facteurTemps : arrêt sur image et ralenti des gros chocs
  const dt = dtReel * (window.__tc2?.acceleration ?? 1) * facteurTemps(dtReel) * (mode === 'partie' && partie.phase === 'jeu' ? partie.acceleration || 1 : 1);
  avant = maintenant;
  t += dt;
  if (mode === 'atelier') {
    majAtelier(dt, t);
    rendre(vitrine, vitrineCam);
  } else {
    // Sous-pas : physique stable même si une image prend du retard
    const n = Math.ceil(dt / 0.008);
    for (let i = 0; i < n; i++) majPartie(dt / n, t);
    majLanceur(dt);
    majFx(dt);
    majEtincelles(dt);
    majBarres(_interne.cafards, _interne.toupies);
    // Caméra : en duel, elle se rapproche des toupies une fois lancées
    const enJeuT = _interne.toupies.filter(x => x.lancee && !x.tombe);
    const duelEnCours = partie.type === 'duel' && partie.phase === 'jeu' && partie.botLance && enJeuT.length;
    let suivi = null;
    if (duelEnCours) {
      const xs = enJeuT.map(x => x.x), zs = enJeuT.map(x => x.z);
      suivi = { x: (Math.min(...xs) + Math.max(...xs)) / 2, z: (Math.min(...zs) + Math.max(...zs)) / 2,
        ecart: Math.hypot(Math.max(...xs) - Math.min(...xs), Math.max(...zs) - Math.min(...zs)) };
    }
    majCamera(dtReel, suivi);
    const mesT = (partie.mesToupies || []).filter(x => x.lancee && !x.tombe);
    ronron(mesT.length ? Math.max(...mesT.map(x => x.rotation / x.rotationMax)) : 0);
    rendre(scene, camera);
  }
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);

// Accès pour les tests automatiques (Playwright) et le débogage dans la console
window.__tc2 = { VERSION, partie, save: () => save, lancerDirect, acheter, interne: _interne,
  // Démarre directement une manche donnée (ex. 3 = premier duel) sans passer par l'atelier
  demarrerTest(manche = 3) {
    nouvellePartie({ ...save.equipe }, { mode: 'normale', nivPieces: { ...save.niveauxPieces }, terrain: save.terrain });
    modeleLanceur(save.equipe);
    partie.manche = manche;
    for (const e of ECRANS) UI.montrer(e, false);
    UI.montrer('hud');
    mode = 'partie';
    commencerManche();
  },
  reset() { save = reinitialiser(); location.reload(); } };

// ---------------------------------------------------------------- Défier un ami (temps réel)
let defi = null, conn = null;
function finirDefi() { const c = conn; conn = null; try { c?.close(); } catch { /* déjà fermé */ } try { defi?.fermer(); } catch { /* rien */ } defi = null; }
const $ = id => document.getElementById(id);
$('pseudo').value = save.pseudo || '';
$('pseudo').oninput = e => { save.pseudo = e.target.value.trim().slice(0, 16); sauver(save); };
const statut = t => { $('statutDefi').textContent = t; };
function brancher(c, hote) {
  conn = c;
  statut(hote ? 'En attente de ton ami…' : 'Connexion à ton ami…');
  const moi = { pseudo: save.pseudo || 'Joueur', equipe: { ...save.equipe }, nivPieces: { ...save.niveauxPieces }, terrain: save.terrain };
  let lance = false;
  // On écoute AVANT l'ouverture (sinon le « bonjour » de l'ami peut arriver avant qu'on écoute, et se perdre)
  c.on('data', m => {
    if (m.type === 'bonjour') {
      if (!m.reponse) c.send({ type: 'bonjour', joueur: moi, reponse: true }); // on répond : il a peut-être raté le nôtre
      if (lance) return;
      lance = true;
      statut('Connecté ! La partie commence…');
      demarrerAmi({ hote, envoyer: d => { try { c.send(d); } catch { /* coupé */ } }, moi, ami: m.joueur });
      modeleLanceur(save.equipe);
      for (const e of ECRANS) UI.montrer(e, false);
      controlesActifs(false);
      mode = 'partie';
      UI.montrer('hud');
      if (hote) setTimeout(() => { c.send({ type: 'manche', manche: 0 }); commencerManche(); }, 600);
    } else messageAmi(m);
  });
  c.on('close', () => {
    if (conn !== c) return;
    if (mode === 'partie') { UI.bandeau('🔌 Ton ami s\'est déconnecté', '', 2500); setTimeout(retourAtelier, 2500); }
    else statut('Connexion fermée.');
  });
  c.on('error', e => statut('Erreur de connexion : ' + (e?.type || e?.message || e)));
  // État de la connexion directe : on dit clairement si le réseau la bloque
  c.on('iceStateChanged', etat => {
    if (etat === 'checking') statut('Connexion directe en cours…');
    if (etat === 'failed') statut('La connexion directe a échoué : un des réseaux la bloque (souvent la 4G/5G ou un Wi-Fi d\'entreprise). Essayez tous les deux sur le même Wi-Fi, ou réessayez.');
    if (etat === 'disconnected' && mode !== 'partie') statut('Connexion perdue, nouvelle tentative…');
  });
  const direBonjour = () => c.send({ type: 'bonjour', joueur: moi });
  if (c.open) direBonjour(); else c.on('open', direBonjour);
}
$('creerDefi').onclick = async () => {
  activerAudio(); finirDefi(); statut('Création du défi…');
  try {
    defi = await creerDefi({
      code(code) {
        $('codeDefi').classList.remove('cache'); $('codeTexte').textContent = code;
        statut('En attente de ton ami…');
        const lien = location.origin + location.pathname + '?ami=' + code;
        $('copierLien').textContent = navigator.share ? '📤 Envoyer le lien' : '📋 Copier le lien';
        $('copierLien').onclick = () => {
          // Sur téléphone : la feuille de partage (SMS, WhatsApp…) ; sinon, copie dans le presse-papiers
          if (navigator.share) navigator.share({ title: 'Toupie Cafard 2', text: 'Je te défie à Toupie Cafard 2 ! Code : ' + code, url: lien }).catch(() => {});
          else navigator.clipboard?.writeText(lien).then(() => statut('Lien copié : ' + lien), () => statut(lien));
        };
      },
      connecte: c => brancher(c, true),
      erreur: statut, statut,
    });
  } catch (e) { statut('Impossible de créer le défi : ' + e.message); }
};
async function rejoindre(code) {
  activerAudio(); finirDefi(); statut('Connexion au défi ' + code + '…');
  try { defi = await rejoindreDefi(code, { connecte: c => brancher(c, false), erreur: statut, statut }); }
  catch (e) { statut('Impossible de rejoindre : ' + e.message); }
}
$('rejoindreDefi').onclick = () => { const c = $('codeAmi').value.trim(); if (c.length >= 4) rejoindre(c); else statut('Entre le code de ton ami.'); };
// Lien reçu d'un ami : …/?ami=CODE
const codeLien = new URLSearchParams(location.search).get('ami');
if (codeLien) { allerA('ami'); $('codeAmi').value = codeLien.toUpperCase(); rejoindre(codeLien); }

// ---------------------------------------------------------------- Entraînement (mannequin immobile, vie infinie)
document.getElementById('entrainement').addEventListener('click', () => {
  activerAudio();
  demarrerEntrainement({ ...save.equipe }, { ...save.niveauxPieces });
  modeleLanceur(save.equipe);
  for (const e of ECRANS) UI.montrer(e, false);
  controlesActifs(false);
  mode = 'partie';
  UI.montrer('hud');
  UI.majHud();
});
