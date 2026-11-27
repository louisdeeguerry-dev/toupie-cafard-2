// Les cafards : ils tombent du ciel sur le bureau et s'y promènent. Plusieurs espèces (voir src/data/cafards.js) :
// gros, blindés, coureurs qui fuient, araignées qui tissent des toiles.
import * as THREE from 'three';
import { scene } from './scene.js';
import { ARENE_R } from './config.js';
import { TYPES } from './data/cafards.js';

export const cafards = [];
export const toiles = [];

const corpsGeo = new THREE.SphereGeometry(1, 14, 10);
const patteGeo = new THREE.CylinderGeometry(0.06, 0.04, 1, 5);
patteGeo.translate(0, -0.5, 0);
const matDore = new THREE.MeshStandardMaterial({ color: 0xffc531, roughness: 0.25, metalness: 0.9, emissive: 0x6b4a00, emissiveIntensity: 0.4 });
const matTete = new THREE.MeshStandardMaterial({ color: 0x2b170a, roughness: 0.5 });
const matPatte = new THREE.MeshStandardMaterial({ color: 0x1e1108, roughness: 0.8 });
// Carapace de cafard (dessinée une fois) : fente entre les deux élytres sur le dos, nervures en long,
// anneaux de l'abdomen sur les flancs, bords plus sombres. Vernis brillant (clearcoat) = chitine.
let texCarapace = null;
function carapace() {
  if (texCarapace) return texCarapace;
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d');
  const fond = g.createLinearGradient(0, 0, 0, 256);
  fond.addColorStop(0, '#ffffff'); fond.addColorStop(0.45, '#e6e6e6'); fond.addColorStop(0.55, '#9a9a9a'); fond.addColorStop(1, '#6a6a6a');
  g.fillStyle = fond; g.fillRect(0, 0, 256, 256);
  g.strokeStyle = 'rgba(0,0,0,.75)'; g.lineWidth = 5; // fente des élytres (méridien du dos)
  for (const u of [64, 192]) { g.beginPath(); g.moveTo(u, 0); g.lineTo(u, 128); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.18)'; g.lineWidth = 2; // nervures
  for (let u = 8; u < 256; u += 16) { g.beginPath(); g.moveTo(u, 10); g.lineTo(u, 120); g.stroke(); }
  g.strokeStyle = 'rgba(0,0,0,.35)'; g.lineWidth = 3; // anneaux de l'abdomen
  for (let v = 140; v < 250; v += 18) { g.beginPath(); g.moveTo(0, v); g.lineTo(256, v); g.stroke(); }
  texCarapace = new THREE.CanvasTexture(c); texCarapace.colorSpace = THREE.SRGBColorSpace;
  return texCarapace;
}
const matsCorps = {};
const matCorps = t => matsCorps[t] ||= new THREE.MeshPhysicalMaterial({
  color: TYPES[t].couleur, map: carapace(), roughness: TYPES[t].metal ? 0.25 : 0.45, metalness: TYPES[t].metal ? 0.8 : 0.1,
  clearcoat: 0.8, clearcoatRoughness: 0.25,
});
const matPronotum = new THREE.MeshPhysicalMaterial({ color: 0x3a2412, roughness: 0.4, clearcoat: 0.9, clearcoatRoughness: 0.2 });
// Antenne courbe (fouet), géométrie partagée, mise à l'échelle par cafard
const antenneGeo = new THREE.TubeGeometry(new THREE.QuadraticBezierCurve3(
  new THREE.Vector3(0, 0, 0), new THREE.Vector3(0.25, 0.35, 0.9), new THREE.Vector3(0.9, 0.1, 1.6)), 12, 0.035, 4);

function mannequin(r) {
  // Un poteau en bois lesté, coiffé d'une cible rouge et blanche (immobile)
  const g = new THREE.Group(), bois = new THREE.MeshStandardMaterial({ color: 0xc8a165, roughness: 0.7 });
  const socle = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.95, r * 1.05, r * 0.35, 28), new THREE.MeshStandardMaterial({ color: 0x3a3f47, metalness: 0.6, roughness: 0.4 }));
  socle.position.y = r * 0.17;
  const poteau = new THREE.Mesh(new THREE.CylinderGeometry(r * 0.55, r * 0.62, r * 1.4, 24), bois);
  poteau.position.y = r * 1.05;
  g.add(socle, poteau);
  [[0.62, 0xd63a2a], [0.45, 0xf4efe6], [0.28, 0xd63a2a], [0.12, 0xf4efe6]].forEach(([k, c], i) => {
    const d = new THREE.Mesh(new THREE.CylinderGeometry(r * k, r * k, 0.002, 28), new THREE.MeshStandardMaterial({ color: c, roughness: 0.6 }));
    d.position.y = r * 1.76 + i * 0.0015; g.add(d);
  });
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, pattes: [] };
}
function modele(type, r, dore) {
  if (type === 'mannequin') return mannequin(r);
  const g = new THREE.Group(), araignee = type === 'araignee', larve = type === 'larve';
  const corps = new THREE.Mesh(corpsGeo, dore ? matDore : matCorps(type));
  corps.scale.set(r * (araignee ? 0.8 : 0.75), r * (larve ? 0.5 : 0.38), r * (araignee ? 0.8 : type === 'coureur' ? 1.15 : 1));
  corps.position.y = r * 0.42;
  const tete = new THREE.Mesh(corpsGeo, matTete);
  tete.scale.setScalar(r * 0.32);
  tete.position.set(0, r * 0.4, r * (araignee ? 0.75 : 0.95));
  g.add(corps, tete);
  if (type === 'blinde') { // plaques de carapace
    for (let i = 0; i < 3; i++) {
      const pl = new THREE.Mesh(new THREE.TorusGeometry(r * 0.55, r * 0.06, 6, 16, Math.PI), matCorps(type));
      pl.position.set(0, r * 0.45, (i - 1) * r * 0.45); pl.rotation.y = Math.PI / 2;
      g.add(pl);
    }
  }
  const pattes = [];
  const nb = larve ? 0 : araignee ? 8 : 6;
  for (let i = 0; i < nb; i++) {
    const cote = i < nb / 2 ? -1 : 1, rang = i % (nb / 2);
    const p = new THREE.Mesh(patteGeo, matPatte);
    p.scale.set(r * 0.5, r * (araignee ? 1.2 : 0.7), r * 0.5);
    p.position.set(cote * r * 0.55, r * 0.4, (rang - (nb / 2 - 1) / 2) * r * 0.5);
    p.rotation.z = cote * (araignee ? 0.8 : 1.1);
    p.userData = { cote, phase: rang * 2.1 + (cote > 0 ? Math.PI : 0) };
    g.add(p);
    pattes.push(p);
  }
  if (!araignee && !larve) {
    // Pronotum : le « bouclier » entre la tête et les ailes, typique du cafard
    const pr = new THREE.Mesh(corpsGeo, dore ? matDore : matPronotum);
    pr.scale.set(r * 0.62, r * 0.26, r * 0.4);
    pr.position.set(0, r * 0.5, r * 0.62);
    g.add(pr);
    for (const c of [-1, 1]) { // antennes courbes, longues comme le corps
      const a = new THREE.Mesh(antenneGeo, matPatte);
      a.scale.set(c * r, r, r);
      a.position.set(c * r * 0.1, r * 0.45, r * 1.15);
      a.userData.antenne = c;
      g.add(a);
    }
  }
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return { g, pattes };
}

// Un point au hasard dans le plateau rond (pas collé au bord ni sur le lanceur)
function pointAuHasard() {
  const a = Math.random() * Math.PI * 2, d = Math.sqrt(Math.random()) * (ARENE_R - 0.1);
  const x = Math.cos(a) * d, z = Math.sin(a) * d;
  return z > ARENE_R - 0.2 ? { x, z: z - 0.15 } : { x, z };
}

// vieBase : vie d'un cafard normal pour cette vague (les espèces multiplient)
export function ajouterCafard({ vieBase, type = 'cafard', dore = false, delai = 0, x, z }) {
  const t = TYPES[type];
  const r = (0.021 + Math.random() * 0.005) * t.taille;
  const { g, pattes } = modele(type, r, dore);
  const c = {
    type, t,
    ...(x != null ? { x, z } : pointAuHasard()),
    r, vie: vieBase * t.vie, vieMax: vieBase * t.vie, dore,
    armure: (t.armure || 0) * vieBase, // dégâts retirés à chaque coup
    masse: t.masse || 1,
    dir: Math.random() * Math.PI * 2,
    vitesse: (0.035 + Math.random() * 0.03) * t.vitesse,
    chute: x != null ? 0 : 0.5 + delai, // tombe du ciel (sauf les larves, pondues sur place)
    kx: 0, kz: 0, coup: 0, flash: 0, mort: 0,
    ponteT: 0, pontes: 0, toileT: 1 + Math.random() * 2, vieBase,
    g, pattes,
  };
  g.position.set(c.x, c.chute, c.z);
  scene.add(g);
  cafards.push(c);
  return c;
}

// ---------------------------------------------------------------- Toiles d'araignée
const toileGeo = new THREE.CircleGeometry(1, 10);
const toileMat = new THREE.MeshBasicMaterial({ color: 0xeeeeee, transparent: true, opacity: 0.35, depthWrite: false, wireframe: true });
function tisser(c) {
  const m = new THREE.Mesh(toileGeo, toileMat.clone());
  m.rotation.x = -Math.PI / 2;
  m.position.set(c.x, 0.002, c.z);
  m.scale.setScalar(0.05);
  scene.add(m);
  toiles.push({ x: c.x, z: c.z, r: 0.05, vie: 8, m });
}
export function detruireToile(w) { w.vie = 0; }

export function viderCafards() {
  for (const c of cafards) c.g.removeFromParent();
  cafards.length = 0;
  for (const w of toiles) { w.m.material.dispose(); w.m.removeFromParent(); }
  toiles.length = 0;
}

export const vivants = () => cafards.filter(c => !c.mort && c.chute <= 0);

// menaces : positions des toupies en jeu (les coureurs les fuient)
export function majCafards(dt, t, menaces = []) {
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
    if (c.t.fixe) { c.kx = c.kz = 0; c.g.position.set(c.x, 0, c.z); continue; } // mannequin : ne bouge jamais
    c.dir += (Math.random() - 0.5) * 3 * dt;
    // Coureur : fuit la toupie la plus proche
    if (c.t.fuite) for (const m of menaces) {
      const d = Math.hypot(c.x - m.x, c.z - m.z);
      if (d < 0.12) { c.dir = Math.atan2(c.x - m.x, c.z - m.z) + (Math.random() - 0.5) * 0.6; break; }
    }
    // Araignée : tisse une toile de temps en temps
    if (c.t.toile && (c.toileT -= dt) <= 0) { c.toileT = 3.5 + Math.random() * 2; tisser(c); }
    let vx = Math.sin(c.dir) * c.vitesse + c.kx, vz = Math.cos(c.dir) * c.vitesse + c.kz;
    c.kx *= Math.exp(-5 * dt); c.kz *= Math.exp(-5 * dt);
    c.x += vx * dt; c.z += vz * dt;
    const dc = Math.hypot(c.x, c.z), lim = ARENE_R - c.r;
    if (dc > lim) { // bord rond : il repart vers l'intérieur
      c.x *= lim / dc; c.z *= lim / dc;
      c.dir = Math.atan2(-c.x, -c.z) + (Math.random() - 0.5) * 1.2;
      c.kx *= -0.5; c.kz *= -0.5;
    }
    c.g.position.set(c.x, 0, c.z);
    c.g.rotation.y = c.dir;
    for (const p of c.pattes) p.rotation.x = Math.sin(t * (c.t.fuite ? 40 : 22) + p.userData.phase) * 0.5;
    c.flash = Math.max(0, c.flash - dt * 6);
    c.g.children[0].scale.x = c.r * 0.75 * (1 + c.flash * 0.25);
  }
  for (let i = toiles.length - 1; i >= 0; i--) {
    const w = toiles[i];
    w.vie -= dt;
    w.m.material.opacity = Math.min(0.35, w.vie * 0.2);
    if (w.vie <= 0) { w.m.material.dispose(); w.m.removeFromParent(); toiles.splice(i, 1); }
  }
}
