// Le lanceur en 3D, inspiré de celui de Toupie contre Cafards (jeu 1) : un plot de départ gradué, un boîtier rond
// à emblème en spirale, une couronne crantée (= l'ENGRENAGE choisi), un manche à voyants entouré d'un ressort
// (= le RESSORT choisi) et une poignée en T. Chaque pièce est un groupe à part, pour la vue éclatée de l'atelier.
// Repère : le plot (là où part la toupie) est vers −z, la poignée vers +z.
import * as THREE from 'three';
import { PIECE } from './data/pieces.js';

const HY = 0.05; // hauteur du boîtier
const LZ = -0.03; // position du plot
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

// ---------------------------------------------------------------- Engrenage (couronne crantée sous le boîtier)
function engrenage(p) {
  const g = new THREE.Group(), mat = M(p.couleur, 0.7, 0.3);
  const roue = (rayon, dents, epaisseur, x = 0) => {
    const r = new THREE.Group();
    r.position.x = x;
    ajouter(r, new THREE.TorusGeometry(rayon, epaisseur, 8, 48), mat).rotation.x = Math.PI / 2;
    ajouter(r, new THREE.CylinderGeometry(rayon * 0.35, rayon * 0.35, 0.004, 24), M(0x2b2f36, 0.5, 0.4));
    for (let i = 0; i < 4; i++) ajouter(r, new THREE.BoxGeometry(rayon * 1.6, 0.0025, 0.003), mat).rotation.y = (i * Math.PI) / 4;
    for (let i = 0; i < dents; i++) {
      const a = (i / dents) * Math.PI * 2, w = Math.min(0.006, ((Math.PI * 2 * rayon) / dents) * 0.55);
      ajouter(r, new THREE.BoxGeometry(0.006, 0.005, w), mat, Math.cos(a) * (rayon + 0.003), 0, Math.sin(a) * (rayon + 0.003)).rotation.y = -a;
    }
    r.userData.roue = true;
    g.add(r);
    return r;
  };
  switch (p.forme) {
    case 'fin': roue(0.036, 32, 0.0018); break;
    case 'grand': roue(0.047, 22, 0.0034); break;
    case 'turbo': {
      roue(0.04, 18, 0.003);
      const halo = ajouter(g, new THREE.TorusGeometry(0.044, 0.0022, 8, 48), lueur(0xff5a2a));
      halo.rotation.x = Math.PI / 2; halo.castShadow = false;
      break;
    }
    case 'double': roue(0.034, 16, 0.0026); roue(0.02, 11, 0.002, 0.058); roue(0.02, 11, 0.002, -0.058); break;
    default: roue(0.038, 16, 0.0028);
  }
  return g;
}

// ---------------------------------------------------------------- Ressort (autour du manche)
function ressort(p) {
  const g = new THREE.Group(), mat = M(p.couleur, 0.8, 0.25);
  const helice = (spires, rayon, fil, x = 0) => {
    const pts = [], n = spires * 24, long = NZ1 - NZ0 - 0.006;
    for (let k = 0; k <= n; k++) { const a = (k / 24) * Math.PI * 2; pts.push(new THREE.Vector3(x + Math.cos(a) * rayon, HY + Math.sin(a) * rayon, NZ0 + 0.003 + (k / n) * long)); }
    ajouter(g, new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), n * 2, fil, 6), mat);
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
// equipe : { engrenage, ressort } ; renvoie { racine, parts: { plot, corps, engrenage, ressort, poignee }, voyants }
export function creerLanceur(equipe) {
  const racine = new THREE.Group();
  const sombre = M(0x23262c, 0.5, 0.4), acier = M(0xc9d1d8, 0.6, 0.25), coque = M(0xd35400, 0.3, 0.4), accent = M(0xffd36b, 0.4, 0.35);

  // Plot de départ gradué
  const plot = new THREE.Group();
  const anneau = ajouter(plot, new THREE.RingGeometry(0.03, 0.04, 48), M(0x3a3f47, 0.3, 0.3), 0, 0.0015, LZ);
  anneau.rotation.x = -Math.PI / 2; anneau.castShadow = false;
  for (let i = 0; i < 12; i++) {
    const a = (i / 12) * Math.PI * 2;
    const t = ajouter(plot, new THREE.BoxGeometry(i % 3 ? 0.004 : 0.007, 0.0012, 0.0016), accent, Math.cos(a) * 0.0445, 0.0016, LZ + Math.sin(a) * 0.0445);
    t.rotation.y = -a; t.castShadow = false;
  }
  racine.add(plot);

  // Corps : pied, boîtier à emblème, manche à voyants
  const corps = new THREE.Group();
  ajouter(corps, new THREE.CylinderGeometry(0.017, 0.02, 0.006, 24), sombre, 0, 0.003, 0.05);
  ajouter(corps, new THREE.CylinderGeometry(0.006, 0.007, HY, 12), acier, 0, HY / 2, 0.05);
  const dessus = M(0xffffff, 0.2, 0.4, { map: textureFace() });
  ajouter(corps, new THREE.CylinderGeometry(0.032, 0.034, 0.016, 48), [coque, dessus, sombre], 0, HY, LZ);
  ajouter(corps, new THREE.TorusGeometry(0.0325, 0.0022, 8, 48), accent, 0, HY + 0.008, LZ).rotation.x = Math.PI / 2;
  ajouter(corps, new THREE.CylinderGeometry(0.011, 0.014, 0.022, 20), acier, 0, HY - 0.019, LZ);
  const long = NZ1 - NZ0, NZ = (NZ0 + NZ1) / 2;
  ajouter(corps, new THREE.BoxGeometry(0.014, 0.01, long), coque, 0, HY, NZ);
  const voyants = [];
  for (let i = 0; i < 4; i++) {
    const v = ajouter(corps, new THREE.SphereGeometry(0.0026, 12, 8), M(0x3fcf6e, 0, 0.3, { emissive: 0x3fcf6e, emissiveIntensity: 0.1 }), 0, HY + 0.0065, NZ0 + 0.008 + i * ((long - 0.016) / 3));
    v.scale.y = 0.55;
    voyants.push(v.material);
  }
  racine.add(corps);

  // Engrenage : sous le boîtier
  const eng = engrenage(PIECE[equipe.engrenage] || PIECE['engrenage-standard']);
  eng.position.set(0, HY - 0.007, LZ);
  racine.add(eng);

  // Ressort : autour du manche (il se comprime quand on charge)
  const res = ressort(PIECE[equipe.ressort] || PIECE['ressort-standard']);
  racine.add(res);

  // Poignée en T
  const poignee = new THREE.Group();
  poignee.position.set(0, HY, NZ1);
  ajouter(poignee, new THREE.CylinderGeometry(0.0016, 0.0016, 0.018, 6), sombre, 0, 0, 0.009).rotation.x = Math.PI / 2;
  ajouter(poignee, new THREE.BoxGeometry(0.05, 0.007, 0.008), accent, 0, 0, 0.02);
  for (const s of [-1, 1]) ajouter(poignee, new THREE.CylinderGeometry(0.0062, 0.0062, 0.018, 12), sombre, s * 0.02, 0, 0.02).rotation.z = Math.PI / 2;
  racine.add(poignee);

  return { racine, parts: { plot, corps, engrenage: eng, ressort: res, poignee }, voyants, base: { engrenageZ: LZ, ressortZ0: NZ0 } };
}

export function libererLanceur(l) {
  l.racine.traverse(o => { if (o.isMesh) { o.geometry.dispose(); [].concat(o.material).forEach(m => { if (m.map !== faceTex) m.dispose(); }); } });
  l.racine.removeFromParent();
}

// Animation en partie : l'engrenage tourne pendant la charge, le ressort se comprime selon la jauge, les voyants s'allument
export function animerLanceur(l, dt, charge, actif) {
  for (const r of l.parts.engrenage.children) if (r.userData.roue) r.rotation.y += dt * (actif ? 2 + charge * 25 : 0.5);
  const k = 1 - 0.45 * charge;
  l.parts.ressort.scale.z = k;
  l.parts.ressort.position.z = NZ1 * (1 - k); // le ressort se tasse vers la poignée
  l.parts.poignee.position.z = NZ1 + 0.02 * charge;
  l.voyants.forEach((m, i) => { m.emissiveIntensity = charge > i / 4 ? 1.4 : 0.1; });
}

// Un engrenage ou un ressort seul (écran d'inspection)
export function creerPieceLanceur(id) {
  const p = PIECE[id];
  return p.slot === 'engrenage' ? engrenage(p) : ressort(p);
}
