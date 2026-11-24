// Le lanceur : il suit la souris le long du bord bas du bureau. On clique : il se fige.
// Tant qu'on reste appuyé, on oriente la direction (et la jauge de puissance oscille). On relâche : la toupie part.
import * as THREE from 'three';
import { scene, camera, renderer } from './scene.js';
import { DESK_X, RAIL_Z, RAIL_MARGIN } from './config.js';

const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plan = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
const hit = new THREE.Vector3();
const jauge = document.getElementById('jauge'), jaugeRemplie = jauge.querySelector('.remplie');

export const lanceur = {
  actif: false,
  etat: 'libre', // libre | charge
  x: 0,
  dir: new THREE.Vector2(0, -1),
  t: 0,
  onLancer: null,
};

// ---------------------------------------------------------------- Modèle 3D
const corps = new THREE.Group();
const boitier = new THREE.Mesh(new THREE.BoxGeometry(0.07, 0.03, 0.04), new THREE.MeshStandardMaterial({ color: 0xd35400, roughness: 0.4, metalness: 0.3 }));
boitier.position.y = 0.017;
const bec = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.016, 0.03, 16), new THREE.MeshStandardMaterial({ color: 0x2c3e50, metalness: 0.6, roughness: 0.3 }));
bec.rotation.x = Math.PI / 2;
bec.position.set(0, 0.017, -0.03);
const voyant = new THREE.Mesh(new THREE.SphereGeometry(0.006, 12, 8), new THREE.MeshStandardMaterial({ color: 0x2ecc71, emissive: 0x2ecc71, emissiveIntensity: 1 }));
voyant.position.set(0.022, 0.034, 0.008);
corps.add(boitier, bec, voyant);
corps.traverse(o => { if (o.isMesh) o.castShadow = true; });
scene.add(corps);

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
const borneX = x => Math.max(-DESK_X + RAIL_MARGIN, Math.min(DESK_X - RAIL_MARGIN, x));

function viser(h) {
  let dx = h.x - lanceur.x, dz = h.z - RAIL_Z;
  if (Math.hypot(dx, dz) < 0.03) return; // trop près : on garde la visée
  if (dz > -0.02) { dx = -dx; dz = -dz; } // derrière le lanceur : lance-pierre (on tire vers soi)
  if (dz > -0.02) dz = -0.02;
  lanceur.dir.set(dx, dz).normalize();
}

const canvas = renderer.domElement;
canvas.addEventListener('pointermove', e => {
  const h = versBureau(e);
  if (!h) return;
  if (lanceur.etat === 'libre') lanceur.x = borneX(h.x);
  else viser(h);
});
canvas.addEventListener('pointerdown', e => {
  if (!lanceur.actif || e.button > 0) return;
  const h = versBureau(e);
  if (h && e.pointerType !== 'mouse') lanceur.x = borneX(h.x); // au doigt : le lanceur vient sous le doigt
  lanceur.etat = 'charge';
  lanceur.t = 0;
  lanceur.dir.set(0, -1);
  canvas.setPointerCapture?.(e.pointerId);
});
function relacher() {
  if (lanceur.etat !== 'charge') return;
  lanceur.etat = 'libre';
  if (!lanceur.actif) return;
  const g = valeurJauge();
  const parfait = g > 0.9;
  lanceur.onLancer?.({ x: lanceur.x, z: RAIL_Z - 0.04, dx: lanceur.dir.x, dz: lanceur.dir.y, puissance: parfait ? 1.08 : g, parfait });
}
canvas.addEventListener('pointerup', relacher);
canvas.addEventListener('pointercancel', () => { lanceur.etat = 'libre'; });

export function valeurJauge() { return 0.5 - 0.5 * Math.cos((lanceur.t / 1.1) * Math.PI * 2); }

// Pour les tests automatiques et les bots : lancer sans souris
export function lancerDirect(x, dx, dz, puissance) {
  lanceur.x = borneX(x);
  lanceur.dir.set(dx, dz).normalize();
  lanceur.onLancer?.({ x: lanceur.x, z: RAIL_Z - 0.04, dx: lanceur.dir.x, dz: lanceur.dir.y, puissance, parfait: false });
}

export function majLanceur(dt) {
  corps.visible = lanceur.actif;
  visee.visible = lanceur.actif;
  jauge.classList.toggle('visible', lanceur.actif && lanceur.etat === 'charge');
  if (!lanceur.actif) return;
  if (lanceur.etat === 'charge') lanceur.t += dt;
  corps.position.set(lanceur.x, 0, RAIL_Z);
  corps.rotation.y = Math.atan2(-lanceur.dir.x, -lanceur.dir.y);
  visee.position.copy(corps.position);
  visee.rotation.y = corps.rotation.y;
  const g = lanceur.etat === 'charge' ? valeurJauge() : 0.35;
  visee.scale.z = 0.4 + g * 0.9;
  visee.material.opacity = lanceur.etat === 'charge' ? 0.95 : 0.4;
  jaugeRemplie.style.width = (valeurJauge() * 100).toFixed(1) + '%';
  jauge.classList.toggle('parfait', valeurJauge() > 0.9);
}
