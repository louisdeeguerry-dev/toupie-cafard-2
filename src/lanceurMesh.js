// Le lanceur en 3D, inspiré de celui de Toupie contre Cafards (jeu 1) : un boîtier rond
// à emblème en spirale, une roue dentée (= l'ENGRENAGE choisi) qui entraîne le pignon central monté sur le pied,
// et un manche rond à voyants entouré d'un ressort (= le RESSORT choisi). Chaque pièce est un groupe à part, pour la vue éclatée de l'atelier.
// Repère : le boîtier (là où part la toupie) est vers −z, la poignée vers +z.
import * as THREE from 'three';
import { modeleDetaille } from './topMesh.js';
import { PIECE } from './data/pieces.js';

const HY = 0.05; // hauteur du boîtier
const LZ = -0.03; // axe du boîtier (d'où part la toupie)
const NZ0 = LZ + 0.03, NZ1 = 0.075; // le manche

const M = (color, metal = 0.35, rough = 0.4, extra = {}) => new THREE.MeshStandardMaterial({ color, metalness: metal, roughness: rough, ...extra });
const lueur = c => new THREE.MeshBasicMaterial({ color: c, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending });

// Le dessus du boîtier : une spirale de toupie et une couronne de crans (dessinée une fois)
let faceTex = null;
function textureFace() {
  if (faceTex) return faceTex;
  const c = document.createElement('canvas');
  c.width = c.height = 256;
  const g = c.getContext('2d'), C = 128;
  const rg = g.createRadialGradient(C - 30, C - 30, 10, C, C, 130);
  rg.addColorStop(0, '#ff9a4a'); rg.addColorStop(0.7, '#d35400'); rg.addColorStop(1, '#7a2f00');
  g.fillStyle = rg; g.fillRect(0, 0, 256, 256);
  g.lineWidth = 14; g.strokeStyle = '#5a2300'; g.beginPath(); g.arc(C, C, 112, 0, Math.PI * 2); g.stroke();
  g.fillStyle = '#ffd36b';
  for (let i = 0; i < 24; i++) { g.save(); g.translate(C, C); g.rotate((i / 24) * Math.PI * 2); g.fillRect(-3, -119, 6, 12); g.restore(); }
  g.fillStyle = '#5a2300'; g.beginPath(); g.arc(C, C, 82, 0, Math.PI * 2); g.fill();
  g.fillStyle = '#d35400'; g.beginPath(); g.arc(C, C, 76, 0, Math.PI * 2); g.fill();
  g.strokeStyle = '#ffd36b'; g.lineWidth = 9; g.lineCap = 'round';
  for (let arm = 0; arm < 3; arm++) {
    g.beginPath();
    for (let k = 0; k <= 40; k++) { const a = arm * (Math.PI * 2 / 3) + k * 0.09, r = 10 + k * 1.6; const x = C + Math.cos(a) * r, y = C + Math.sin(a) * r; k ? g.lineTo(x, y) : g.moveTo(x, y); }
    g.stroke();
  }
  g.fillStyle = '#ffd36b'; g.beginPath(); g.arc(C, C, 12, 0, Math.PI * 2); g.fill();
  for (let i = 0; i < 4; i++) { // 4 vis
    const a = Math.PI / 4 + i * Math.PI / 2, x = C + Math.cos(a) * 96, y = C + Math.sin(a) * 96;
    g.fillStyle = '#e8e8e8'; g.beginPath(); g.arc(x, y, 6, 0, Math.PI * 2); g.fill();
    g.strokeStyle = '#555'; g.lineWidth = 2; g.beginPath(); g.moveTo(x - 4, y); g.lineTo(x + 4, y); g.stroke();
  }
  faceTex = new THREE.CanvasTexture(c);
  faceTex.colorSpace = THREE.SRGBColorSpace;
  return faceTex;
}

const ajouter = (parent, geo, mat, x = 0, y = 0, z = 0) => { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; parent.add(m); return m; };

// ---------------------------------------------------------------- Engrenages (vraies roues dentées, extrudées)
// Chaque engrenage a un rayon primitif et un pas de denture : le pignon central du pied a le même pas, donc ils engrènent.
const ROUES = {
  fin: { r: 0.036, pas: 0.0045 }, grand: { r: 0.047, pas: 0.0085 }, turbo: { r: 0.04, pas: 0.0065 },
  double: { r: 0.034, pas: 0.006 }, standard: { r: 0.038, pas: 0.006 },
};
const geoRoue = (r, pas, ep, { trou = 0.003, ajours = 0 } = {}) => {
  const n = Math.max(8, Math.round((Math.PI * 2 * r) / pas)), h = pas * 0.36, sh = new THREE.Shape();
  for (let i = 0; i < n; i++) {
    const a = (i / n) * Math.PI * 2, d = (Math.PI * 2) / n;
    const pts = [[a - d * 0.5, r - h], [a - d * 0.22, r - h], [a - d * 0.12, r + h], [a + d * 0.12, r + h], [a + d * 0.22, r - h]];
    for (const [ang, rr] of pts) (i || ang !== pts[0][0] ? sh.lineTo : sh.moveTo).call(sh, Math.cos(ang) * rr, Math.sin(ang) * rr);
  }
  sh.closePath();
  const t = new THREE.Path(); t.absarc(0, 0, trou, 0, Math.PI * 2, true); sh.holes.push(t);
  for (let i = 0; i < ajours; i++) { // ajours entre les rayons, pour l'allure mécanique
    const a0 = (i / ajours) * Math.PI * 2 + 0.22, a1 = ((i + 1) / ajours) * Math.PI * 2 - 0.22, r0 = r * 0.36, r1 = r * 0.74;
    const aj = new THREE.Path(); aj.absarc(0, 0, r1, a0, a1, false); aj.absarc(0, 0, r0, a1, a0, true); aj.closePath(); sh.holes.push(aj);
  }
  const g = new THREE.ExtrudeGeometry(sh, { depth: ep, bevelEnabled: true, bevelThickness: ep * 0.18, bevelSize: Math.min(0.0005, h * 0.3), bevelSegments: 2, curveSegments: 10 });
  g.translate(0, 0, -ep / 2); g.rotateX(-Math.PI / 2);
  return { g, n };
};
export function roueDentee(r, pas, mat, { ep = 0.0035, ajours = 0, moyeu = 0x2b2f36 } = {}) {
  const grp = new THREE.Group(), { g, n } = geoRoue(r, pas, ep, { ajours, trou: Math.min(0.004, r * 0.3) });
  ajouter(grp, g, mat);
  ajouter(grp, new THREE.CylinderGeometry(Math.min(0.007, r * 0.42), Math.min(0.007, r * 0.42), ep * 1.6, 24), M(moyeu, 0.6, 0.35));
  grp.userData = { roue: true, dents: n };
  return grp;
}
function engrenage(p) {
  const g = new THREE.Group(), mat = M(p.couleur, 0.85, 0.28), R = ROUES[p.forme] || ROUES.standard;
  const principale = roueDentee(R.r, R.pas, mat, { ajours: p.forme === 'fin' ? 6 : 5 });
  principale.userData.rapport = 1;
  g.add(principale);
  if (p.forme === 'turbo') {
    const halo = ajouter(g, new THREE.TorusGeometry(R.r + 0.004, 0.0018, 8, 64), lueur(0xff5a2a));
    halo.rotation.x = Math.PI / 2; halo.castShadow = false;
  }
  if (p.forme === 'double') for (const s of [-1, 1]) { // deux satellites qui engrènent sur la grande roue
    const rs = 0.02, sat = roueDentee(rs, R.pas, mat, { ajours: 3 });
    sat.position.x = s * (R.r + rs);
    sat.userData.rapport = -principale.userData.dents / sat.userData.dents;
    sat.rotation.y = Math.PI / sat.userData.dents;
    g.add(sat);
  }
  g.userData.R = R;
  return g;
}

// ---------------------------------------------------------------- Ressort (autour du manche)
function ressort(p) {
  const g = new THREE.Group(), mat = M(p.couleur, 0.8, 0.25);
  const helice = (spires, rayon, fil, x = 0) => {
    // Spires de bout jointives (comme un vrai ressort de compression : il appuie bien à plat), spires utiles au milieu
    const pts = [], n = spires * 24, long = NZ1 - NZ0 - 0.006, jointe = 2.2 * fil, utile = long - 2 * jointe;
    for (let k = 0; k <= n; k++) {
      const a = (k / 24) * Math.PI * 2, s = k / 24; // s = numéro de spire (0 → spires)
      const z = s < 1 ? s * jointe : s > spires - 1 ? jointe + utile + (s - spires + 1) * jointe : jointe + ((s - 1) / Math.max(1, spires - 2)) * utile;
      pts.push(new THREE.Vector3(x + Math.cos(a) * rayon, HY + Math.sin(a) * rayon, NZ0 + 0.003 + z));
    }
    ajouter(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, fil, 10), mat);
  };
  switch (p.forme) {
    case 'souple': helice(6, 0.0095, 0.0009); break;
    case 'renforce': helice(15, 0.0095, 0.0016); break;
    case 'catapulte': {
      helice(11, 0.0115, 0.0019);
      for (const s of [-1, 1]) ajouter(g, new THREE.BoxGeometry(0.004, 0.004, 0.05), M(0x5a2300, 0.3, 0.5), s * 0.018, HY, NZ1 - 0.02);
      break;
    }
    case 'detente': helice(9, 0.0058, 0.0012, -0.0125); helice(9, 0.0058, 0.0012, 0.0125); break;
    default: helice(10, 0.0095, 0.0012);
  }
  return g;
}

// ---------------------------------------------------------------- Le lanceur complet
// equipe : { engrenage, ressort } ; renvoie { racine, parts: { corps, engrenage, ressort }, voyants }
export function creerLanceur(equipe) {
  const racine = new THREE.Group();
  const sombre = M(0x23262c, 0.5, 0.4), acier = M(0x8f99a4, 0.9, 0.28), coque = M(0xd35400, 0.3, 0.4), accent = M(0xffd36b, 0.4, 0.35);


  // Engrenage choisi : sous le boîtier, sur l'axe de la toupie
  const eng = engrenage(PIECE[equipe.engrenage] || PIECE['engrenage-standard']);
  eng.position.set(0, HY - 0.012, LZ);
  const R = eng.userData.R;

  // Corps : boîtier à emblème, manche rond à voyants, et le PIED, qui porte le pignon central engrené sur l'engrenage
  const corps = new THREE.Group();
  const dessus = M(0xffffff, 0.2, 0.4, { map: textureFace() });
  const profil = [[0, -0.008], [0.03, -0.008], [0.034, -0.005], [0.034, 0.005], [0.031, 0.008], [0, 0.008]].map(([x, y]) => new THREE.Vector2(x, y));
  const boitier = modeleDetaille('lanceur-boitier', coque, HY); // modèle détaillé (Blender) : crans de prise, vis
  if (boitier) { boitier.position.z = LZ; corps.add(boitier); } else ajouter(corps, new THREE.LatheGeometry(profil, 64), coque, 0, HY, LZ);
  ajouter(corps, new THREE.CircleGeometry(0.0305, 64), dessus, 0, HY + 0.0081, LZ).rotation.x = -Math.PI / 2;
  ajouter(corps, new THREE.TorusGeometry(0.0325, 0.0018, 10, 64), accent, 0, HY + 0.0065, LZ).rotation.x = Math.PI / 2;
  if (!boitier) for (let i = 0; i < 8; i++) { // rivets sur la tranche (le modèle détaillé a ses propres vis)
    const a = (i / 8) * Math.PI * 2;
    ajouter(corps, new THREE.SphereGeometry(0.0016, 10, 6), acier, Math.cos(a) * 0.0342, HY, LZ + Math.sin(a) * 0.0342);
  }
  ajouter(corps, new THREE.CylinderGeometry(0.004, 0.004, 0.014, 16), acier, 0, HY - 0.014, LZ); // axe de la toupie
  // Pied : colonne verticale juste à côté de l'engrenage, avec le pignon central à la hauteur de l'engrenage
  const pignon = roueDentee(0.011, R.pas, acier, { ep: 0.0045, moyeu: 0xd35400 });
  const n = pignon.userData.dents;
  const rp = (n * R.pas) / (Math.PI * 2); // rayon exact du pignon pour ce pas
  pignon.position.set(0, HY - 0.012, LZ + R.r + rp);
  pignon.rotation.y = Math.PI / n; // ses dents tombent entre celles de l'engrenage
  pignon.userData.rapport = -eng.children[0].userData.dents / n;
  corps.add(pignon);
  const pz = pignon.position.z;
  ajouter(corps, new THREE.CylinderGeometry(0.018, 0.021, 0.005, 32), sombre, 0, 0.0025, pz);
  ajouter(corps, new THREE.TorusGeometry(0.0195, 0.0014, 8, 32), accent, 0, 0.005, pz).rotation.x = Math.PI / 2;
  ajouter(corps, new THREE.CylinderGeometry(0.0042, 0.0055, HY, 16), acier, 0, HY / 2, pz);
  ajouter(corps, new THREE.CylinderGeometry(0.0065, 0.0065, 0.006, 16), sombre, 0, HY, pz); // collier qui tient le manche
  // Manche : une tige ronde (le ressort l'entoure et peut en glisser), terminée par une butée
  const long = NZ1 - NZ0, NZ = (NZ0 + NZ1) / 2;
  ajouter(corps, new THREE.CylinderGeometry(0.0055, 0.0055, long, 20), coque, 0, HY, NZ).rotation.x = Math.PI / 2;
  ajouter(corps, new THREE.CylinderGeometry(0.0072, 0.0072, 0.004, 20), accent, 0, HY, NZ1 - 0.002).rotation.x = Math.PI / 2;
  const voyants = [];
  for (let i = 0; i < 4; i++) {
    const v = ajouter(corps, new THREE.SphereGeometry(0.0022, 12, 8), M(0x3fcf6e, 0, 0.3, { emissive: 0x3fcf6e, emissiveIntensity: 0.1 }), 0, HY + 0.0052, NZ0 + 0.012 + i * ((long - 0.024) / 3));
    v.scale.y = 0.6;
    voyants.push(v.material);
  }
  racine.add(corps);
  racine.add(eng);

  // Ressort : autour du manche (il se comprime quand on charge)
  const res = ressort(PIECE[equipe.ressort] || PIECE['ressort-standard']);
  racine.add(res);

  return { racine, parts: { corps, engrenage: eng, ressort: res }, voyants, base: { engrenageZ: LZ, ressortZ0: NZ0 } };
}

export function libererLanceur(l) {
  l.racine.traverse(o => { if (o.isMesh) { if (!o.userData.geoPartagee) o.geometry.dispose(); if (!o.userData.matPartage) [].concat(o.material).forEach(m => { if (m.map !== faceTex) m.dispose(); }); } });
  l.racine.removeFromParent();
}

// Animation en partie : l'engrenage tourne pendant la charge, le ressort se comprime selon la jauge, les voyants s'allument
export function animerLanceur(l, dt, charge, actif) {
  tournerEngrenages(l, dt * (actif ? 2 + charge * 25 : 0.5));
  const k = 1 - 0.45 * charge;
  l.parts.ressort.scale.z = k;
  l.parts.ressort.position.z = NZ1 * (1 - k); // le ressort se tasse contre la butée
  l.voyants.forEach((m, i) => { m.emissiveIntensity = charge > i / 4 ? 1.4 : 0.1; });
}

// L'engrenage choisi entraîne le pignon central du pied (et ses satellites) : rapports de denture exacts
export function tournerEngrenages(l, da, avecPignon = true) {
  for (const r of l.parts.engrenage.children) if (r.userData.roue) r.rotation.y += da * r.userData.rapport;
  if (avecPignon) for (const r of l.parts.corps.children) if (r.userData.roue) r.rotation.y += da * r.userData.rapport;
}

// Un engrenage ou un ressort seul (écran d'inspection)
export function creerPieceLanceur(id) {
  const p = PIECE[id];
  return p.slot === 'engrenage' ? engrenage(p) : ressort(p);
}
