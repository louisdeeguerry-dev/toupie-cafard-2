// Point d'entrée : relie l'atelier, la partie et la boucle de rendu.
import { renderer, scene, camera, vitrine, vitrineCam, supportVitrine } from './scene.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { charger, sauver, reinitialiser } from './save.js';
import { lanceur, majLanceur, lancerDirect } from './launcher.js';
import { partie, nouvellePartie, commencerManche, majPartie, brancherInterface, lancer, abandonner, acheter, _interne } from './match.js';
import { majFx } from './fx.js';
import { activerAudio } from './audio.js';
import * as UI from './ui.js';
import { VERSION } from './config.js';

let save = charger();
let mode = 'atelier';
let modele = null;

function majVitrine() {
  if (modele) libererToupie(modele);
  modele = creerToupie(save.equipe);
  modele.racine.scale.setScalar(1.25);
  supportVitrine.add(modele.racine);
}

const atelier = UI.creerAtelier(save, {
  onChange() { sauver(save); majVitrine(); },
  onJouer: demarrer,
  onBoite: boite,
});
majVitrine();

function boite() {
  UI.ouvrirBoite(save, { onFini() { sauver(save); atelier.rendre(); majVitrine(); } });
}

function demarrer() {
  activerAudio();
  nouvellePartie({ ...save.equipe });
  UI.montrer('atelier', false);
  UI.rechercher(partie.joueurs.map(j => j.nom), () => {
    mode = 'partie';
    UI.montrer('hud');
    commencerManche();
  });
}

brancherInterface({
  manche() {
    UI.majHud();
    if (partie.type === 'duel') {
      UI.bandeau(`⚔️ DUEL contre ${partie.adversaire.nom}`, 'La première toupie qui tombe a perdu');
      UI.aide('Déplace le lanceur, clique et garde appuyé pour viser, relâche pour lancer');
    } else {
      UI.bandeau(`🪳 Vague ${partie.vague}`, `Écrase ${partie.objectif} cafards en ${partie.lancers} lancers`);
      UI.aide('Déplace le lanceur, clique et garde appuyé pour viser, relâche pour lancer');
    }
  },
  hud: UI.majHud,
  bilan(b) {
    UI.majHud();
    UI.aide('');
    setTimeout(() => UI.afficherBilan(b, () => commencerManche()), 500);
  },
  fin(r) {
    UI.majHud();
    save.parties++;
    if (r.place === 1) save.victoires++;
    save.meilleure = save.meilleure ? Math.min(save.meilleure, r.place) : r.place;
    save.boites += r.boites;
    sauver(save);
    setTimeout(() => UI.afficherFin(r, retourAtelier), 600);
  },
});

function retourAtelier() {
  abandonner();
  mode = 'atelier';
  UI.montrer('hud', false);
  UI.montrer('atelier');
  atelier.rendre();
  majVitrine();
}

lanceur.onLancer = lancer;
document.getElementById('quitter').addEventListener('click', () => {
  if (confirmerQuitter()) retourAtelier();
});
function confirmerQuitter() { return window.__tc2?.sansConfirmation || window.confirm('Quitter la partie ? Elle sera perdue.'); }
document.addEventListener('pointerdown', activerAudio, { once: true });

// ---------------------------------------------------------------- Boucle
let avant = performance.now(), t = 0;
function boucle(maintenant) {
  const dt = Math.min(0.05, (maintenant - avant) / 1000) * (window.__tc2?.acceleration || 1); // acceleration : tests auto
  avant = maintenant;
  t += dt;
  if (mode === 'atelier') {
    if (modele) { modele.rotor.rotation.y += dt * 1.2; modele.racine.position.y = 0.004 + Math.sin(t * 1.5) * 0.003; }
    renderer.render(vitrine, vitrineCam);
  } else {
    // Sous-pas : physique stable même si une image prend du retard
    const n = Math.ceil(dt / 0.008);
    for (let i = 0; i < n; i++) majPartie(dt / n, t);
    majLanceur(dt);
    majFx(dt);
    renderer.render(scene, camera);
  }
  requestAnimationFrame(boucle);
}
requestAnimationFrame(boucle);

// Accès pour les tests automatiques (Playwright) et le débogage dans la console
window.__tc2 = { VERSION, partie, save: () => save, lancerDirect, acheter, interne: _interne,
  reset() { save = reinitialiser(); location.reload(); } };
