// Les cafards : ils tombent du ciel sur le bureau et s'y promènent.
import * as THREE from 'three';
import { scene } from './scene.js';
import { DESK_X, DESK_Z } from './config.js';

export const cafards = [];

const corpsGeo = new THREE.SphereGeometry(1, 14, 10);
const patteGeo = new THREE.CylinderGeometry(0.06, 0.04, 1, 5);
patteGeo.translate(0, -0.5, 0);
const matCorps = new THREE.MeshStandardMaterial({ color: 0x5a3214, roughness: 0.35, metalness: 0.2 });
const matDore = new THREE.MeshStandardMaterial({ color: 0xffc531, roughness: 0.25, metalness: 0.9, emissive: 0x6b4a00, emissiveIntensity: 0.4 });
const matTete = new THREE.MeshStandardMaterial({ color: 0x2b170a, roughness: 0.5 });
const matPatte = new THREE.MeshStandardMaterial({ color: 0x1e1108, roughness: 0.8 });

function modele(r, dore) {
  const g = new THREE.Group();
  const corps = new THREE.Mesh(corpsGeo, dore ? matDore : matCorps);
  corps.scale.set(r * 0.75, r * 0.38, r);
  corps.position.y = r * 0.42;
  const tete = new THREE.Mesh(corpsGeo, matTete);
  tete.scale.setScalar(r * 0.32);
  tete.position.set(0, r * 0.4, r * 0.95);
  g.add(corps, tete);
  const pattes = [];
  for (let i = 0; i < 6; i++) {
    const cote = i < 3 ? -1 : 1, rang = i % 3;
    const p = new THREE.Mesh(patteGeo, matPatte);
    p.scale.set(r * 0.5, r * 0.7, r * 0.5);
    p.position.set(cote * r * 0.55, r * 0.4, (rang - 1) * r * 0.6);
    p.rotation.z = cote * 1.1;
    p.userData = { cote, phase: rang * 2.1 + (cote > 0 ? Math.PI : 0) };
    g.add(p);
    pattes.push(p);
  }
  // Antennes
  for (const c of [-1, 1]) {
    const a = new THREE.Mesh(patteGeo, matPatte);
    a.scale.set(r * 0.25, r * 1.3, r * 0.25);
    a.position.set(c * r * 0.12, r * 0.5, r * 1.15);
    a.rotation.set(-1.9, 0, c * 0.4);
    g.add(a);
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, pattes };
}

export function ajouterCafard({ vie, dore = false, delai = 0 }) {
  const r = 0.021 + Math.random() * 0.005;
  const { g, pattes } = modele(r, dore);
  const c = {
    x: (Math.random() * 2 - 1) * (DESK_X - 0.08),
    z: (Math.random() * 2 - 1) * (DESK_Z - 0.16) - 0.04,
    r, vie, vieMax: vie, dore,
    dir: Math.random() * Math.PI * 2,
    vitesse: 0.035 + Math.random() * 0.03,
    chute: 0.5 + delai, // hauteur restante avant d'atterrir (tombe du ciel)
    kx: 0, kz: 0, // poussée reçue
    coup: 0, // délai avant de pouvoir reprendre un coup
    flash: 0,
    mort: 0,
    g, pattes,
  };
  g.position.set(c.x, c.chute, c.z);
  scene.add(g);
  cafards.push(c);
  return c;
}

export function viderCafards() {
  for (const c of cafards) c.g.removeFromParent();
  cafards.length = 0;
}

export const vivants = () => cafards.filter(c => !c.mort && c.chute <= 0);

export function majCafards(dt, t) {
  for (let i = cafards.length - 1; i >= 0; i--) {
    const c = cafards[i];
    if (c.mort) { // aplati puis disparaît
      c.mort += dt;
      c.g.scale.y = Math.max(0.05, 1 - c.mort * 8);
      if (c.mort > 0.4) { c.g.removeFromParent(); cafards.splice(i, 1); }
      continue;
    }
    if (c.chute > 0) {
      c.chute = Math.max(0, c.chute - dt * 1.4);
      c.g.position.set(c.x, Math.min(c.chute, 0.5), c.z);
      continue;
    }
    c.coup = Math.max(0, c.coup - dt);
    c.dir += (Math.random() - 0.5) * 3 * dt;
    let vx = Math.sin(c.dir) * c.vitesse + c.kx, vz = Math.cos(c.dir) * c.vitesse + c.kz;
    c.kx *= Math.exp(-5 * dt); c.kz *= Math.exp(-5 * dt);
    c.x += vx * dt; c.z += vz * dt;
    const mx = DESK_X - c.r, mz = DESK_Z - c.r;
    if (Math.abs(c.x) > mx) { c.x = Math.sign(c.x) * mx; c.dir = -c.dir; c.kx *= -0.5; }
    if (Math.abs(c.z) > mz) { c.z = Math.sign(c.z) * mz; c.dir = Math.PI - c.dir; c.kz *= -0.5; }
    c.g.position.set(c.x, 0, c.z);
    c.g.rotation.y = c.dir;
    for (const p of c.pattes) p.rotation.x = Math.sin(t * 22 + p.userData.phase) * 0.5;
    c.flash = Math.max(0, c.flash - dt * 6);
    c.g.children[0].scale.x = c.r * 0.75 * (1 + c.flash * 0.25);
  }
}
