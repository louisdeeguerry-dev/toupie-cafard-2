// Le lanceur : il suit la souris le long du bord bas du bureau. On clique : il se fige.
// Tant qu'on reste appuyé, on oriente la direction (et la jauge de puissance oscille). On relâche : la toupie part.
import * as THREE from 'three';
import { scene, camera, renderer } from './scene.js';
import { RAIL_XMAX, railZ } from './config.js';
import { creerLanceur, libererLanceur, animerLanceur } from './lanceurMesh.js';

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();
const jauge = document.getElementById('jauge'), jaugeRemplie = jauge.querySelector('.remplie'), zoneEl = jauge.querySelector('.zone');

export const lanceur = {
  actif: false,
  etat: 'libre', // libre | place (au doigt : on fait glisser le lanceur, sans tirer) | charge
  x: 0,
  dir: new THREE.Vector2(0, -1),
  t: 0,
  onLancer: null,
  zoneParfait: 0.1, // largeur de la zone PARFAIT (stat Précision)
};

// ---------------------------------------------------------------- Modèle 3D (src/lanceurMesh.js : engrenage et ressort du joueur)
const corps = new THREE.Group();
scene.add(corps);
let modele = null;
export function modeleLanceur(equipe) {
  if (modele) libererLanceur(modele);
  modele = creerLanceur(equipe);
  modele.racine.scale.setScalar(1.15);
  corps.add(modele.racine);
}
modeleLanceur({});

// Ligne de visée (pointillés au sol)
const pts = [];
for (let i = 0; i < 24; i++) pts.push(new THREE.Vector3(0, 0.002, -i * 0.025), new THREE.Vector3(0, 0.002, -i * 0.025 - 0.012));
const visee = new THREE.LineSegments(new THREE.BufferGeometry().setFromPoints(pts), new THREE.LineBasicMaterial({ color: 0xfff3c4, transparent: true, opacity: 0.8 }));
scene.add(visee);

// ---------------------------------------------------------------- Entrées
function versBureau(e) {
  const rect = renderer.domElement.getBoundingClientRect();
  ndc.set(((e.clientX - rect.left) / rect.width) * 2 - 1, -((e.clientY - rect.top) / rect.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  return ray.ray.intersectPlane(plan, hit) ? hit : null;
}
// Au doigt : bande de placement du lanceur, du rail jusqu'en bas de l'écran (en mètres de bureau au-dessus du rail)
const ZONE_PLACEMENT = 0.1;
const borneX = x => Math.max(-RAIL_XMAX, Math.min(RAIL_XMAX, x));
// Point de départ de la toupie : un peu à l'intérieur du rail, vers le centre
const depart = x => { const z = railZ(x), d = Math.hypot(x, z), k = (d - 0.04) / d; return { x: x * k, z: z * k }; };

function viser(h) {
  let dx = h.x - lanceur.x, dz = h.z - railZ(lanceur.x);
  if (Math.hypot(dx, dz) < 0.03) return; // trop près : on garde la visée
  if (dz > -0.02) { dx = -dx; dz = -dz; } // derrière le lanceur : lance-pierre (on tire vers soi)
  if (dz > -0.02) dz = -0.02;
  lanceur.dir.set(dx, dz).normalize();
}

const canvas = renderer.domElement;
canvas.addEventListener('pointermove', e => {
  const h = versBureau(e);
  if (!h) return;
  if (lanceur.etat === 'libre' && e.pointerType === 'mouse') lanceur.x = borneX(h.x);
  else if (lanceur.etat === 'place') lanceur.x = borneX(h.x);
  else if (lanceur.etat === 'charge') viser(h);
});
canvas.addEventListener('pointerdown', e => {
  if (!lanceur.actif || e.button > 0) return;
  const h = versBureau(e);
  canvas.setPointerCapture?.(e.pointerId);
  // Au doigt, en 2 temps : 1) on pose le doigt sur la bande du bas (sur le rail ou en dessous) et on le fait glisser :
  // le lanceur suit, rien ne part ; 2) on touche le plateau plus haut : on vise vers le doigt, la jauge oscille, on lève = tir.
  if (e.pointerType !== 'mouse' && h && h.z > railZ(h.x) - ZONE_PLACEMENT) {
    lanceur.etat = 'place';
    lanceur.x = borneX(h.x);
    return;
  }
  lanceur.etat = 'charge';
  lanceur.t = 0;
  lanceur.dir.set(0, -1);
  if (h && e.pointerType !== 'mouse') viser(h);
});
function relacher() {
  if (lanceur.etat === 'place') { lanceur.etat = 'libre'; return; } // lanceur placé : on attend le tir
  if (lanceur.etat !== 'charge') return;
  lanceur.etat = 'libre';
  if (!lanceur.actif) return;
  const g = valeurJauge();
  const parfait = g > 1 - lanceur.zoneParfait;
  const p = depart(lanceur.x);
  lanceur.onLancer?.({ x: p.x, z: p.z, dx: lanceur.dir.x, dz: lanceur.dir.y, puissance: parfait ? 1.08 : g, parfait });
}
canvas.addEventListener('pointerup', relacher);
canvas.addEventListener('pointercancel', () => { lanceur.etat = 'libre'; });

export function valeurJauge() { return 0.5 - 0.5 * Math.cos((lanceur.t / 1.1) * Math.PI * 2); }

// Pour les tests automatiques et les bots : lancer sans souris
export function lancerDirect(x, dx, dz, puissance) {
  lanceur.x = borneX(x);
  lanceur.dir.set(dx, dz).normalize();
  const p = depart(lanceur.x);
  lanceur.onLancer?.({ x: p.x, z: p.z, dx: lanceur.dir.x, dz: lanceur.dir.y, puissance, parfait: false });
}

export function majLanceur(dt) {
  corps.visible = lanceur.actif;
  visee.visible = lanceur.actif;
  jauge.classList.toggle('visible', lanceur.actif && lanceur.etat === 'charge');
  if (!lanceur.actif) return;
  if (lanceur.etat === 'charge') lanceur.t += dt;
  corps.position.set(lanceur.x, 0, railZ(lanceur.x));
  corps.rotation.y = Math.atan2(-lanceur.dir.x, -lanceur.dir.y);
  visee.position.copy(corps.position);
  visee.rotation.y = corps.rotation.y;
  const g = lanceur.etat === 'charge' ? valeurJauge() : 0.35;
  visee.scale.z = 0.4 + g * 0.9;
  visee.material.opacity = lanceur.etat === 'charge' ? 0.95 : 0.4;
  if (modele) animerLanceur(modele, dt, lanceur.etat === 'charge' ? valeurJauge() : 0, lanceur.etat === 'charge');
  jaugeRemplie.style.width = (valeurJauge() * 100).toFixed(1) + '%';
  jauge.classList.toggle('parfait', valeurJauge() > 1 - lanceur.zoneParfait);
  zoneEl.style.left = ((1 - lanceur.zoneParfait) * 100).toFixed(1) + '%';
}
