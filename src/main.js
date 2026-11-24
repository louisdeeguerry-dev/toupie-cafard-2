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
import { recompenser } from './progression.js';
import { TERRAIN } from './data/terrains.js';

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
  nouvellePartie({ ...save.equipe }, { mode: save.mode, nivPieces: { ...save.niveauxPieces }, terrain: save.terrain });
  UI.montrer('atelier', false);
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
    const gains = recompenser(save, r.place, r.mode);
    sauver(save);
    setTimeout(() => UI.afficherFin(r, gains, retourAtelier), 600);
  },
});

function retourAtelier() {
  abandonner();
  mode = 'atelier';
  UI.montrer('hud', false);
  UI.montrer('panneauStats', false);
  UI.montrer('atelier');
  atelier.rendre();
  majVitrine();
}

lanceur.onLancer = lancer;
document.getElementById('btnStats').addEventListener('click', UI.basculerStats);
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
