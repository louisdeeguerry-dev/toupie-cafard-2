// Point d'entrée : relie l'atelier, la partie et la boucle de rendu.
import { renderer, scene, camera, vitrine, vitrineCam } from './scene.js';
import { majModeles, selection as selectionAtelier, majAtelier, terrainVitrine, initControles, controlesActifs } from './atelier3d.js';
import { charger, sauver, reinitialiser } from './save.js';
import { lanceur, majLanceur, lancerDirect, modeleLanceur } from './launcher.js';
import { lancerDansEtape, capacite } from './match.js';
import { partie, nouvellePartie, commencerManche, majPartie, brancherInterface, lancer, abandonner, acheter, _interne } from './match.js';
import { majFx, majBarres, majEtincelles, facteurTemps } from './fx.js';
import { majCamera, rendre } from './scene.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { activerAudio, ronron, musique, basculerMusique, musiqueActive, sfx, baisserMusique } from './audio.js';
import * as UI from './ui.js';
import { VERSION } from './config.js';
import { initParametres } from './parametres.js';
import { demarrerOuverture, cliquerOuverture, finirOuverture, tournerPieces } from './ouverture3d.js';
import { RARETES, SLOTS } from './data/pieces.js';
import { creerDefi, rejoindreDefi } from './enligne.js';
import { demarrerAmi, messageAmi, quitterAmi, demarrerEntrainement } from './match.js';
import { recompenser } from './progression.js';
import { TERRAIN } from './data/terrains.js';
import { TYPES } from './data/cafards.js';

let save = charger();
const AIDE = window.matchMedia?.('(pointer: coarse)').matches
  ? 'Glisse le doigt en bas pour placer le lanceur, puis touche le plateau pour viser et lève le doigt pour lancer'
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
  onBoite: () => boite(),
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
  if (ecran === 'boutiqueMeta') selectionAtelier('boutique', null); // la caméra va au comptoir
  else if (ecran !== 'atelier') selectionAtelier('toupie', null); // hors atelier : la toupie tourne, montée
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

// Ouverture des boîtes en 3D (1 ou 5 à la fois, toutes ensemble) : voir src/ouverture3d.js
let ouverture = null;
function boite(n = Math.min(5, save.boites)) {
  if (save.boites <= 0) return;
  activerAudio();
  const lots = demarrerOuverture(save, n);
  sauver(save);
  ouverture = { lots, etape: 0 };
  UI.montrer('boutiqueMeta', false);
  selectionAtelier('ouverture', null);
  UI.montrer('ouverture');
  $('ouvertureLots').classList.add('cache');
  $('ouvertureAide').style.top = ''; $('ouvertureAide').style.bottom = '';
  $('ouvertureAide').textContent = lots.length > 1 ? `👆 Clique pour ouvrir les ${lots.length} boîtes` : '👆 Clique pour ouvrir la boîte';
  UI.son?.('choix');
}
function cliquerBoites() {
  if (!ouverture || ouverture.etape >= 4) return;
  const e = ouverture.etape = cliquerOuverture();
  UI.son?.('toc', { volume: 0.6, hauteur: 0.7 + e * 0.2 }); UI.son?.('choix', { volume: 0.4, hauteur: 0.8 + e * 0.15 });
  $('ouvertureAide').textContent = ['', 'Encore !', 'Ça s\'ouvre…', 'Dernier clic !', ''][e];
  if (e === 4) { sfx.legendaire(); UI.son?.('boite'); setTimeout(recapLots, 1700); setTimeout(() => { if (!ouverture) return; const a = $('ouvertureAide'); a.textContent = '↔ Glisse pour faire pivoter les pièces'; a.style.bottom = 'auto'; a.style.top = '24px'; }, 1800); }
}
function recapLots() {
  const R = id => RARETES[id] || RARETES.commune;
  const carte = (lot, i) => {
    const r = R(lot.rarete);
    if (lot.type === 'piece') {
      const p = lot.piece, sl = SLOTS.find(s => s.id === p.slot);
      return `<div class="lot" style="--rar:${r.couleur}"><div class="rar">${r.nom}</div><b>${sl.icone} ${p.nom}</b>
        <div class="petit">${lot.neuve ? 'NOUVELLE !' : `doublon : niveau ${Math.min(5, lot.exemplaires)} débloqué`}</div>
        <button class="btn second" data-equiper="${i}">Équiper</button></div>`;
    }
    if (lot.type === 'terrain') return `<div class="lot" style="--rar:${r.couleur}"><div class="rar">${r.nom}</div><b>${lot.terrain.icone} ${lot.terrain.nom}</b>
      <div class="petit">Terrain de duel · NOUVEAU !</div><button class="btn second" data-equiper="${i}">Choisir</button></div>`;
    return `<div class="lot" style="--rar:${r.couleur}"><div class="rar">${r.nom}</div><b>${lot.coffre.icone} ${lot.coffre.nom}</b><div class="petit">+${lot.coffre.ecrous} 🔩</div></div>`;
  };
  const el = $('ouvertureLots');
  el.innerHTML = `<div class="liste">${ouverture.lots.map(carte).join('')}</div><div class="actions"><button class="btn" id="finOuverture">Continuer</button></div>`;
  el.classList.remove('cache');
  $('ouvertureAide').textContent = '';
  el.querySelectorAll('[data-equiper]').forEach(b => b.onclick = () => {
    const lot = ouverture.lots[+b.dataset.equiper];
    if (lot.type === 'piece') save.equipe[lot.piece.slot] = lot.piece.id; else save.terrain = lot.terrain.id;
    b.textContent = '✔ Équipé'; b.disabled = true; sauver(save); UI.son?.('achat', { volume: 0.5 });
  });
  $('finOuverture').onclick = () => {
    finirOuverture(); ouverture = null;
    UI.montrer('ouverture', false);
    sauver(save); atelier.rendre(); majVitrine();
    allerA('boutiqueMeta');
  };
}

// Compile à l'avance (en arrière-plan) les shaders de la partie et de la toupie : sinon le 1er lancer fige l'image
function precompiler(equipe, niv) {
  const t = creerToupie(equipe, niv);
  scene.add(t.racine);
  renderer.compileAsync?.(scene, camera).catch(() => {}).finally(() => { t.racine.removeFromParent(); libererToupie(t); });
  if (!renderer.compileAsync) { t.racine.removeFromParent(); libererToupie(t); }
}
function demarrer() {
  activerAudio();
  nouvellePartie({ ...save.equipe }, { mode: save.mode, nivPieces: { ...save.niveauxPieces }, terrain: save.terrain });
  modeleLanceur(save.equipe);
  precompiler(save.equipe, save.niveauxPieces);
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
    if (partie.ami) { // défi entre amis : pas de récompense, juste le résultat
      ronron(0);
      const gagne = r.place === 1, nom = partie.ami.joueur.nom;
      setTimeout(() => { baisserMusique(3); sfx.finPartie(gagne); UI.bandeau(gagne ? '🏆 Tu as gagné le défi !' : `💥 ${nom} a gagné le défi`, '', 4000); }, 1400);
      UI.montrer('quitter', false); UI.montrer('pause', false);
      setTimeout(retourAtelier, 5000);
      return;
    }
    const gains = recompenser(save, r.place, r.mode);
    ronron(0); setTimeout(() => { baisserMusique(3); sfx.finPartie(r.place <= 4); }, 1400); // après le jingle du duel, pas en même temps
    sauver(save);
    UI.montrer('quitter', false); UI.montrer('pause', false);
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
  UI.montrer('hud', false); UI.montrer('pause', false);
  UI.montrer('panneauStats', false);
  UI.minuteur('');
  allerA('menu');
  majVitrine();
}

lanceur.onLancer = lancer;
document.getElementById('btnStats').addEventListener('click', UI.basculerStats);
// Bouton Abandonner / Quitter (toujours visible en partie, même sur la boutique) : son texte dépend du mode
const TEXTES_QUITTER = {
  entrainement: { bouton: '🚪 Quitter', titre: '' },
  ami: { bouton: '🚪 Quitter le défi', titre: 'Quitter le défi ?', texte: 'Ton ami sera prévenu et la partie s\'arrêtera pour vous deux.', ok: '🚪 Quitter' },
  partie: { bouton: '🏳️ Abandonner', titre: 'Abandonner la partie ?', texte: 'Elle sera perdue, sans récompense.', ok: '🏳️ Abandonner' },
};
const texteQuitter = () => TEXTES_QUITTER[partie.mode === 'ami' || partie.mode === 'entrainement' ? partie.mode : 'partie'];
const majBoutonQuitter = () => { document.getElementById('quitter').textContent = texteQuitter().bouton; };
new MutationObserver(majBoutonQuitter).observe(document.getElementById('quitter'), { attributes: true, attributeFilter: ['class'] });
document.getElementById('quitter').addEventListener('click', () => {
  const t = texteQuitter();
  if (partie.mode === 'entrainement' || window.__tc2?.sansConfirmation) return retourAtelier(); // l'entraînement ne perd rien : on sort direct
  document.getElementById('pauseTitre').textContent = t.titre;
  document.getElementById('pauseTexte').textContent = t.texte;
  document.getElementById('pauseQuitter').textContent = t.ok;
  UI.montrer('pause');
});
document.getElementById('pauseReprendre').addEventListener('click', () => UI.montrer('pause', false));
document.getElementById('pause').addEventListener('click', e => { if (e.target.id === 'pause') UI.montrer('pause', false); });
document.getElementById('pauseQuitter').addEventListener('click', () => { UI.montrer('pause', false); retourAtelier(); });
addEventListener('keydown', e => { if (e.key === 'Escape' && mode === 'partie' && !document.getElementById('quitter').classList.contains('cache')) document.getElementById(document.getElementById('pause').classList.contains('cache') ? 'quitter' : 'pauseReprendre').click(); });
document.addEventListener('pointerdown', () => { activerAudio(); musique(); }, { once: true });
// Mode test : toutes les pièces et tous les terrains au niveau max. La vraie sauvegarde est mise de côté et revient
// quand on quitte le mode test.
const CLE_AVANT_TEST = 'toupie-cafard-2-avant-test';
const btnTest = document.getElementById('btnTest');
const enTest = () => { try { return !!localStorage.getItem(CLE_AVANT_TEST); } catch { return false; } };
btnTest.textContent = enTest() ? '🧪 Quitter le mode test' : '🧪 Mode test (tout débloqué)';
document.body.classList.toggle('mode-test', enTest()); // bandeau « MODE TEST » bien visible (retour des testeurs)
if (enTest() && save.ecrous < 100000) { save.ecrous = 100000; sauver(save); atelier.rendre(); } // mode test : écrous toujours rechargés
// Bouton de test dans la boutique : des écrous à volonté (toujours disponible pendant le prototype)
document.getElementById('ecrousTest').addEventListener('click', () => { save.ecrous += 10000; sauver(save); atelier.rendre(); UI.son?.('piece'); });
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
      save.ecrous = 100000; // de quoi acheter des boîtes à volonté
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
      setTimeout(() => commencerManche(), 600); // chacun ses cafards ; on se retrouve au duel
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
// Chaque tentative (créer / rejoindre) a un numéro : les messages et erreurs d'une tentative abandonnée n'écrasent plus
// ceux de la nouvelle (retour des testeurs : « Rejoindre » après « Créer » affichait l'erreur de la création)
let essaiDefi = 0;
$('creerDefi').onclick = async () => {
  activerAudio(); finirDefi(); statut('Création du défi…');
  const n = ++essaiDefi, st = t => { if (n === essaiDefi) statut(t); };
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
      connecte: c => { if (n === essaiDefi) brancher(c, true); },
      erreur: st, statut: st,
    });
  } catch (e) { st('Impossible de créer le défi : ' + e.message); }
};
async function rejoindre(code) {
  activerAudio(); finirDefi(); statut('Connexion au défi ' + code + '…');
  const n = ++essaiDefi, st = t => { if (n === essaiDefi) statut(t); };
  try { defi = await rejoindreDefi(code, { connecte: c => { if (n === essaiDefi) brancher(c, false); }, erreur: st, statut: st }); }
  catch (e) { st('Impossible de rejoindre : ' + e.message); }
}
$('rejoindreDefi').onclick = () => { const c = $('codeAmi').value.trim(); if (c.length >= 4) rejoindre(c); else statut('Entre le code de ton ami.'); };
// Lien reçu d'un ami : …/?ami=CODE
const codeLien = new URLSearchParams(location.search).get('ami');
if (codeLien) { allerA('ami'); $('codeAmi').value = codeLien.toUpperCase(); rejoindre(codeLien); }

// ---------------------------------------------------------------- Entraînement (mannequin immobile, vie infinie)
document.getElementById('entrainement').addEventListener('click', () => {
  activerAudio();
  demarrerEntrainement({ ...save.equipe }, { ...save.niveauxPieces });
  UI.aide(AIDE); // comment lancer (retour des testeurs : rien ne l'indiquait à l'entraînement)
  modeleLanceur(save.equipe);
  for (const e of ECRANS) UI.montrer(e, false);
  controlesActifs(false);
  mode = 'partie';
  UI.montrer('hud');
  UI.majHud();
});

// ---------------------------------------------------------------- Boutique 3D : on clique sur un paquet du comptoir
import { PRODUITS, produitSous } from './magasin3d.js';
import { acheterProduit, MONNAIE } from './progression.js';
let glisse = null;
renderer.domElement.addEventListener('pointerdown', e => { if (!ouverture) return; cliquerBoites(); glisse = { x: e.clientX, y: e.clientY }; });
renderer.domElement.addEventListener('pointermove', e => { // pièces sorties : glisser pour les faire pivoter
  if (!ouverture || !glisse || ouverture.etape < 4) return;
  tournerPieces(e.clientX - glisse.x, e.clientY - glisse.y); glisse = { x: e.clientX, y: e.clientY };
});
addEventListener('pointerup', () => { glisse = null; });
const enBoutique = () => !document.getElementById('boutiqueMeta').classList.contains('cache') && mode === 'atelier';
const ndc = e => { const r = renderer.domElement.getBoundingClientRect(); return { x: ((e.clientX - r.left) / r.width) * 2 - 1, y: -((e.clientY - r.top) / r.height) * 2 + 1 }; };
renderer.domElement.addEventListener('pointermove', e => {
  if (!enBoutique()) return;
  renderer.domElement.style.cursor = produitSous(ndc(e), vitrineCam) ? 'pointer' : '';
});
renderer.domElement.addEventListener('click', e => {
  if (!enBoutique()) return;
  const id = produitSous(ndc(e), vitrineCam);
  if (!id) return;
  activerAudio(); UI.son?.('choix', { volume: 0.6 });
  const p = PRODUITS[id], ok = save.ecrous >= p.prix, el = $('achatPaquet');
  el.innerHTML = `<div class="grand">${p.pieces > 1 ? '📦📦' : '📦'} ${p.nom}</div><div>${p.desc}</div>
    <div class="petit" style="margin:6px 0">Prix : <b>${p.prix} ${MONNAIE.icone}</b> · tu as ${save.ecrous} ${MONNAIE.icone}</div>
    <div class="actions"><button class="btn second" id="annulerAchat">Annuler</button>
    <button class="btn" id="confirmerAchat" ${ok ? '' : 'disabled'}>${ok ? 'Acheter et ouvrir' : `Il manque ${p.prix - save.ecrous} ${MONNAIE.icone}`}</button></div>`;
  el.classList.remove('cache');
  $('annulerAchat').onclick = () => el.classList.add('cache');
  $('confirmerAchat').onclick = () => {
    if (!acheterProduit(save, p)) return;
    el.classList.add('cache'); sauver(save); atelier.rendre();
    UI.son?.('piece');
    boite(p.pieces);
  };
});

// Numéro de version affiché au menu (empreinte de main.js) : permet de vérifier qu'on a bien la dernière version en ligne
document.getElementById('versionJeu').textContent = 'Version ' + (new URL(import.meta.url).searchParams.get('v') || 'locale');
