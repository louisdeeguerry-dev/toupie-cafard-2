// Fabrique le modèle 3D d'une toupie à partir de ses 4 pièces. Tout est dessiné en code (comme le jeu 1).
import * as THREE from 'three';
import { PIECE } from './data/pieces.js';
import { GLTFLoader } from '../vendor/jsm/loaders/GLTFLoader.js';

// ---------------------------------------------------------------- Modèles détaillés (Blender : outils/blender/toupies.py)
// Chargés au démarrage ; tant qu'ils ne sont pas là (ou s'ils manquent), le jeu garde les formes simples.
// Chaque objet du modèle a un RÔLE (corps / acier / sombre) : on lui applique les matériaux du jeu (couleur de la pièce…).
export const MODELES_DISPO = ['standard', 'clou', 'foreuse', 'diamant', 'bille', 'ventouse'].map(f => 'pointe-' + f)
  .concat(['standard', 'lourde', 'legere', 'gyro', 'noyau', 'tresor'].map(f => 'base-' + f))
  .concat(['standard', 'large', 'dents', 'bouclier', 'lames', 'inertie'].map(f => 'couronne-' + f), ['lanceur-boitier'])
  .concat(['vide', 'oeil', 'aimant', 'ressort', 'flamme', 'sangsue', 'cyclone', 'fer', 'carapace'].map(f => 'ame-' + f));
export const modeleCharge = nom => !!MODELES[nom];
const MODELES = {};
const V = new URL(import.meta.url).searchParams.get('v') || '0'; // anti-cache : même empreinte que ce module (outils/versionner.mjs)
let chargement = null;
export function chargerModeles() {
  const l = new GLTFLoader();
  return (chargement ||= Promise.all(MODELES_DISPO.map(nom => l.loadAsync(`assets/modeles/${nom}.glb?v=${V}`).then(g => {
    const parts = [];
    g.scene.updateMatrixWorld(true);
    g.scene.traverse(o => { if (o.isMesh && !o.geometry.attributes.uv) uvCylindre(o.geometry); });
    g.scene.traverse(o => { if (o.isMesh) parts.push({ geo: o.geometry, role: ROLES.find(r => o.name.includes(r)) || 'corps', matrice: o.matrixWorld.clone() }); });
    MODELES[nom] = parts;
  }).catch(() => { /* modèle absent : formes simples */ }))));
}
let matAcierM = null, matSombreM = null, matBlancM = null;
const PIERRES_ROLES = ['rubis', 'saphir', 'emeraude', 'perle'];
const ROLES = ['acier', 'sombre', 'or', 'blanc', 'rubis', 'saphir', 'emeraude', 'perle'];
// Pierres et perles (base au trésor) : matériaux partagés, brillants
const PIERRES = {};
const pierre = role => (PIERRES[role] ||= new THREE.MeshPhysicalMaterial(role === 'perle'
  ? { color: 0xf6efe4, roughness: 0.25, metalness: 0, clearcoat: 1, clearcoatRoughness: 0.1, sheen: 1, sheenColor: 0xffe6f0 }
  : { color: { rubis: 0xd4102c, saphir: 0x1f4fe0, emeraude: 0x10a858 }[role], roughness: 0.05, metalness: 0.1, clearcoat: 1, emissive: { rubis: 0x4a0008, saphir: 0x08164a, emeraude: 0x053a1c }[role] }));
// Les modèles Blender n'ont pas de coordonnées de texture : projection cylindrique autour de l'axe (u = tour, v = hauteur),
// pour que les motifs du jeu (tourné, moleté, brossé, martelé) apparaissent sur les pièces
function uvCylindre(geo) {
  const p = geo.attributes.position, uv = new Float32Array(p.count * 2);
  for (let i = 0; i < p.count; i++) {
    const x = p.getX(i), y = p.getY(i), z = p.getZ(i), r = Math.hypot(x, z);
    uv[2 * i] = Math.atan2(z, x) / (2 * Math.PI) + 0.5;
    uv[2 * i + 1] = y * 40 + r * 25; // les faces planes (dessus) reçoivent aussi un motif, en anneaux
  }
  geo.setAttribute('uv', new THREE.BufferAttribute(uv, 2));
}
export const modeleDetaille = (nom, matCorps, y = 0) => modele(nom, matCorps, y);
function modele(nom, matCorps, y) {
  const parts = MODELES[nom];
  if (!parts) return null;
  matAcierM ||= new THREE.MeshStandardMaterial({ color: 0xc9d0d8, metalness: 0.95, roughness: 0.22 });
  matSombreM ||= new THREE.MeshStandardMaterial({ color: 0x23272e, metalness: 0.4, roughness: 0.45 });
  matBlancM ||= new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x555555, roughness: 0.3 });
  const g = new THREE.Group();
  g.position.y = y;
  for (const p of parts) {
    const m = new THREE.Mesh(p.geo, p.role === 'acier' ? matAcierM : p.role === 'sombre' ? matSombreM : p.role === 'or' ? matRivetOr : p.role === 'blanc' ? matBlancM : PIERRES_ROLES.includes(p.role) ? pierre(p.role) : matCorps);
    p.matrice.decompose(m.position, m.quaternion, m.scale);
    m.userData.geoPartagee = true; // géométrie partagée entre toutes les toupies : ne pas la détruire
    m.userData.matPartage = p.role !== 'corps';
    g.add(m);
  }
  return g;
}

// ---------------------------------------------------------------- Textures d'usinage (dessinées une fois, partagées)
// Chaque motif raconte comment la pièce est fabriquée (règle 5) :
// - « tourne » : stries de tour (pièce usinée en tournant) ; « moletage » : losanges d'accroche des couronnes ;
// - « brosse » : métal brossé (pointes, lames) ; « martele » : métal martelé (pièces lourdes).
// Le même dessin sert de relief (bumpMap), de rugosité (roughnessMap) et de légère variation de teinte (map).
const motifs = {};
const alea = (() => { let s = 7; return () => ((s = (s * 16807) % 2147483647) / 2147483647); })();
function dessiner(nom) {
  const c = document.createElement('canvas'); c.width = c.height = 256;
  const g = c.getContext('2d'), img = g.createImageData(256, 256), d = img.data;
  const ecrire = f => { for (let y = 0; y < 256; y++) for (let x = 0; x < 256; x++) { const v = Math.max(0, Math.min(255, f(x, y) * 255)), i = (y * 256 + x) * 4; d[i] = d[i + 1] = d[i + 2] = v; d[i + 3] = 255; } };
  if (nom === 'tourne') { const l = Array.from({ length: 256 }, () => alea()); ecrire((x, y) => 0.72 + 0.18 * Math.sin(y * 1.6) * Math.sin(y * 0.23) + 0.1 * l[y]); }
  else if (nom === 'moletage') ecrire((x, y) => { const k = (Math.PI * 2 * 16) / 256, a = Math.abs(Math.sin(x * k + y * k)), b = Math.abs(Math.sin(x * k - y * k)); return 0.45 + 0.55 * Math.min(a, b) ** 0.6; });
  else if (nom === 'brosse') { const l = Array.from({ length: 256 }, () => alea()); ecrire((x, y) => 0.75 + 0.2 * l[y] + 0.05 * alea()); }
  else if (nom === 'martele') {
    ecrire(() => 0.85);
    g.putImageData(img, 0, 0);
    for (let i = 0; i < 70; i++) { // coups de marteau : petites cuvettes rondes
      const x = alea() * 256, y = alea() * 256, r = 8 + alea() * 14, rg = g.createRadialGradient(x, y, 0, x, y, r);
      rg.addColorStop(0, 'rgba(40,40,40,.55)'); rg.addColorStop(0.7, 'rgba(120,120,120,.2)'); rg.addColorStop(1, 'rgba(255,255,255,.15)');
      g.fillStyle = rg; g.beginPath(); g.arc(x, y, r, 0, Math.PI * 2); g.fill();
    }
    return c;
  }
  g.putImageData(img, 0, 0);
  return c;
}
const REPET = { tourne: [1, 1], moletage: [10, 1], brosse: [1, 1], martele: [2, 1] };
function textures(nom) {
  if (motifs[nom]) return motifs[nom];
  const c = dessiner(nom);
  const fab = srgb => { const t = new THREE.CanvasTexture(c); t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...REPET[nom]); t.anisotropy = 4; if (srgb) t.colorSpace = THREE.SRGBColorSpace; return t; };
  return (motifs[nom] = { map: fab(true), relief: fab(false) });
}
const mat = (couleur, o = {}, motif = null) => {
  // Matériau « vernis » : une couche de vernis brillante sur la peinture métallisée (reflets nets, détails lisibles)
  const m = new THREE.MeshPhysicalMaterial({ color: couleur, roughness: 0.35, metalness: 0.55, clearcoat: 0.6, clearcoatRoughness: 0.18, ...o });
  if (motif) {
    const t = textures(motif);
    Object.assign(m, { map: t.map, bumpMap: t.relief, bumpScale: motif === 'moletage' ? 0.0012 : 0.0006, roughnessMap: t.relief, roughness: Math.min(1, m.roughness * 1.4) });
  }
  return m;
};

// Une lame de faucille : dos épais et courbe, fil tranchant brillant, talon riveté sur l'anneau.
// Elle est inclinée vers l'avant dans le sens de rotation (elle « fauche »).
let geoLame = null, geoFil = null;
function lame(matLame, matFil) {
  if (!geoLame) {
    const sh = new THREE.Shape();
    sh.moveTo(0, -0.0035); sh.lineTo(0.004, -0.004);
    sh.quadraticCurveTo(0.017, -0.004, 0.026, 0.006); // tranchant extérieur, courbe
    sh.quadraticCurveTo(0.014, 0.0015, 0.004, 0.0035); // dos
    sh.lineTo(0, 0.0035); sh.closePath();
    geoLame = new THREE.ExtrudeGeometry(sh, { depth: 0.0016, bevelEnabled: true, bevelThickness: 0.0005, bevelSize: 0.0004, bevelSegments: 2, curveSegments: 10 });
    geoLame.translate(0, 0, -0.0008); geoLame.rotateX(Math.PI / 2);
    const fil = new THREE.CurvePath();
    fil.add(new THREE.QuadraticBezierCurve3(new THREE.Vector3(0.005, 0, -0.0042), new THREE.Vector3(0.017, 0, -0.0042), new THREE.Vector3(0.026, 0, 0.006)));
    geoFil = new THREE.TubeGeometry(fil, 12, 0.0006, 4);
  }
  const g = new THREE.Group();
  g.add(new THREE.Mesh(geoLame, matLame), new THREE.Mesh(geoFil, matFil));
  const rivet = new THREE.Mesh(new THREE.CylinderGeometry(0.0018, 0.0018, 0.0034, 10), mat(0x2b2f36, { metalness: 0.9, roughness: 0.3 }));
  rivet.position.set(0.0025, 0, 0);
  g.add(rivet);
  g.rotation.order = 'YXZ';
  return g;
}
// Rivets dorés : un par niveau au-delà du premier (on voit d'un coup d'œil qu'une pièce est montée en niveau)
const matRivetOr = new THREE.MeshStandardMaterial({ color: 0xffc531, metalness: 0.9, roughness: 0.25, emissive: 0x4a3000, emissiveIntensity: 0.3 });
function rivetsNiveau(g, k, rayon, y) {
  for (let i = 0; i < k - 1; i++) {
    const a = (i / Math.max(1, k - 1)) * Math.PI * 2 + 0.3;
    const r = new THREE.Mesh(new THREE.SphereGeometry(0.0022, 10, 8), matRivetOr);
    r.position.set(Math.cos(a) * rayon, y, Math.sin(a) * rayon); r.scale.y = 0.6;
    g.add(r);
  }
}

function pointe(p, k = 1) {
  const g = new THREE.Group(), m = mat(p.couleur, {}, 'brosse');
  let h = 0.018;
  // Modèle détaillé (Blender) s'il est chargé, avec le matériau propre à la forme
  const matM = p.forme === 'diamant' ? mat(p.couleur, { metalness: 0.2, roughness: 0.05, emissive: 0x2a5a6a, emissiveIntensity: 0.4 })
    : p.forme === 'bille' ? mat(p.couleur, { metalness: 0.9, roughness: 0.1 })
    : p.forme === 'ventouse' ? mat(p.couleur, { metalness: 0.1, roughness: 0.7 }) : m;
  const md = modele('pointe-' + p.forme, matM, 0);
  if (md) { g.add(md); return { g, h: p.forme === 'clou' ? 0.022 : p.forme === 'diamant' ? 0.02 : 0.018 }; }
  if (matM !== m) matM.dispose();
  switch (p.forme) {
    case 'clou': {
      h = 0.022;
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 12), m);
      tige.position.y = 0.012;
      const bout = new THREE.Mesh(new THREE.ConeGeometry(0.0035, 0.006, 12), m);
      bout.rotation.x = Math.PI; bout.position.y = 0.003;
      const tete = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 20), m);
      tete.position.y = 0.021;
      g.add(tige, bout, tete);
      break;
    }
    case 'foreuse': {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.018, 24), m);
      cone.rotation.x = Math.PI; cone.position.y = 0.009;
      g.add(cone);
      for (let i = 0; i < 4; i++) { // filets de la foreuse
        const r = 0.004 + i * 0.003;
        const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0012, 6, 20), mat(0x6e5206));
        t.rotation.x = Math.PI / 2; t.position.y = 0.003 + i * 0.004;
        g.add(t);
      }
      break;
    }
    case 'diamant': {
      const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.008, 0), mat(p.couleur, { metalness: 0.2, roughness: 0.05, emissive: 0x2a5a6a, emissiveIntensity: 0.4 }));
      d.scale.y = 1.3; d.position.y = 0.0104;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.006, 20), mat(0xd4af37));
      col.position.y = 0.017;
      g.add(d, col);
      h = 0.02;
      break;
    }
    case 'bille': {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.007, 20, 14), mat(p.couleur, { metalness: 0.9, roughness: 0.1 }));
      b.position.y = 0.007;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.01, 20), mat(0x7f8c8d));
      col.position.y = 0.014;
      g.add(b, col);
      break;
    }
    case 'ventouse': {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.005, 24), mat(p.couleur, { metalness: 0.1, roughness: 0.7 }));
      v.position.y = 0.0025;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.006, 0.013, 20), mat(0x7f8c8d));
      col.position.y = 0.011;
      g.add(v, col);
      break;
    }
    default: {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.018, 20), m);
      c.rotation.x = Math.PI; c.position.y = 0.009;
      g.add(c);
    }
  }
  return { g, h };
}

function base(p, y, k = 1) {
  const g = new THREE.Group(), m = mat(p.couleur, {}, p.forme === 'lourde' ? 'martele' : 'tourne');
  let r = 0.026, h = 0.014;
  const matN = p.forme === 'noyau' ? mat(p.couleur, { emissive: 0x4a1a7a, emissiveIntensity: 0.5, flatShading: true }) : m;
  const md = modele('base-' + p.forme, matN, y);
  if (md) {
    g.add(md);
    if (p.forme === 'gyro') { // le gyroscope reste animé par le jeu (il tourne dans sa fenêtre)
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.003, 8, 32), mat(0x9fe8d8, { emissive: 0x1f7a68, emissiveIntensity: 0.6 }));
      t.position.y = y + 0.008; t.rotation.x = Math.PI / 2.4; t.userData.gyro = true;
      g.add(t);
    }
    if (p.forme === 'legere') return { g, top: y + 0.014 };
    if (p.forme === 'noyau' || p.forme === 'tresor') return { g, top: y + 0.017 };
    if (p.forme === 'lourde') { r = 0.029; h = 0.017; }
    rivetsNiveau(g, k, r * 0.78, y + h + 0.0006);
    return { g, top: y + h };
  }
  if (matN !== m) matN.dispose();
  switch (p.forme) {
    case 'lourde': r = 0.029; h = 0.017; break;
    case 'legere': {
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.005, 10, 32), m);
      anneau.rotation.x = Math.PI / 2; anneau.position.y = y + 0.007;
      const moyeu = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 16), m);
      moyeu.position.y = y + 0.007;
      g.add(anneau, moyeu);
      for (let i = 0; i < 3; i++) {
        const bras = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.004, 0.004), m);
        bras.position.y = y + 0.007; bras.rotation.y = (i * Math.PI) / 3;
        g.add(bras);
      }
      return { g, top: y + 0.014 };
    }
    case 'gyro': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.003, 8, 32), mat(0x9fe8d8, { emissive: 0x1f7a68, emissiveIntensity: 0.6 }));
      t.position.y = y + 0.008; t.rotation.x = Math.PI / 2.4;
      t.userData.gyro = true;
      g.add(t);
      break;
    }
    case 'noyau': {
      const n = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 1), mat(p.couleur, { emissive: 0x4a1a7a, emissiveIntensity: 0.5, flatShading: true }));
      n.position.y = y + 0.01; n.scale.y = 0.7;
      g.add(n);
      return { g, top: y + 0.017 };
    }
  }
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 40), m);
  c.position.y = y + h / 2;
  g.add(c);
  rivetsNiveau(g, k, r * 0.78, y + h + 0.0006);
  return { g, top: y + h };
}

function couronne(p, y, k = 1) {
  const g = new THREE.Group(), m = mat(p.couleur, {}, 'moletage');
  const R = 0.034;
  // Modèle détaillé (Blender) : il remplace l'anneau ; les dents et les lames (nombre selon le niveau) restent ajoutées ici
  const matC = p.forme === 'bouclier' ? mat(p.couleur, {}, 'brosse') : p.forme === 'inertie' ? mat(p.couleur, { metalness: 1, roughness: 0.2 }, 'tourne') : m;
  const md = modele('couronne-' + p.forme, matC, y);
  if (md) g.add(md); else if (matC !== m) matC.dispose();
  switch (md && !['dents', 'lames'].includes(p.forme) ? 'modele' : p.forme) {
    case 'modele': break;
    case 'dents': {
      if (!md) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.005, 10, 40), m);
        t.rotation.x = Math.PI / 2; t.position.y = y;
        g.add(t);
      }
      const nd = 6 + 3 * k; // niveau 1 : 9 dents … niveau 5 : 21 dents
      for (let i = 0; i < nd; i++) {
        const d = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.009, 4), m);
        const a = (i / nd) * Math.PI * 2;
        d.position.set(Math.cos(a) * (R + 0.006), y, Math.sin(a) * (R + 0.006));
        d.rotation.z = -Math.PI / 2; d.rotation.y = -a;
        g.add(d);
      }
      break;
    }
    case 'bouclier': {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.006, R + 0.008, 0.012, 48, 1, true), mat(p.couleur, { side: THREE.DoubleSide }, 'brosse'));
      c.position.y = y;
      const bord = new THREE.Mesh(new THREE.TorusGeometry(R + 0.007, 0.002, 8, 48), mat(0xdfe6ee));
      bord.rotation.x = Math.PI / 2; bord.position.y = y + 0.006;
      g.add(c, bord);
      break;
    }
    case 'lames': {
      if (!md) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(R - 0.006, 0.003, 8, 32), m);
        t.rotation.x = Math.PI / 2; t.position.y = y;
        g.add(t);
      }
      // Niveau 1 : 2 lames, puis une lame de plus par niveau (niv 5 : 6 lames)
      const n = 1 + k, matLame = mat(p.couleur, { metalness: 0.95, roughness: 0.18 }, 'brosse'), matFil = mat(0xf4f7fa, { metalness: 1, roughness: 0.08 });
      for (let i = 0; i < n; i++) {
        const a = (i / n) * Math.PI * 2, l = lame(matLame, matFil);
        l.position.set(Math.cos(a) * (R - 0.009), y, Math.sin(a) * (R - 0.009));
        l.rotation.y = -a;
        g.add(l);
      }
      break;
    }
    case 'large': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.008, 0.007, 12, 48), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      const d2 = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.008, R + 0.008, 0.003, 48), mat(0x2b2f36, { metalness: 0.3 }));
      d2.position.y = y;
      g.add(t, d2);
      break;
    }
    case 'inertie': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.002, 0.008, 14, 48), mat(p.couleur, { metalness: 1, roughness: 0.2 }, 'tourne'));
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
      break;
    }
    default: {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.006, 12, 40), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
    }
  }
  // Disque qui relie la couronne à la base
  const disque = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.003, 40), mat(0x2b2f36, { metalness: 0.3 }, 'tourne'));
  disque.position.y = y;
  g.add(disque);
  if (p.forme !== 'lames' && p.forme !== 'dents') rivetsNiveau(g, k, R - 0.006, y + 0.002);
  return { g };
}

function ame(p, y, k = 1) {
  const g = new THREE.Group();
  // Modèle détaillé (Blender) : socle vissé + symbole, qui garde la couleur et la LUEUR de niveau de l'âme
  const matA = p.forme === 'vide' ? mat(p.couleur) : mat(p.couleur, { emissive: p.couleur, emissiveIntensity: 0.6 + 0.3 * k });
  const md = modele('ame-' + p.forme, matA, y);
  if (md) { g.add(md); return { g }; }
  matA.dispose();
  const pastille = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.004, 32), mat(0x1b1e23, { metalness: 0.2 }));
  pastille.position.y = y + 0.002;
  g.add(pastille);
  const lum = { emissive: p.couleur, emissiveIntensity: 0.6 + 0.3 * k }; // l'âme brille plus fort à chaque niveau
  const s = y + 0.006;
  let sym;
  switch (p.forme) {
    case 'flamme': sym = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.012, 10), mat(p.couleur, lum)); sym.position.y = s + 0.004; break;
    case 'fer': sym = new THREE.Mesh(new THREE.TorusGeometry(0.0055, 0.0016, 8, 20, Math.PI * 1.4), mat(p.couleur, lum)); sym.rotation.z = -Math.PI * 0.2; sym.position.y = s + 0.006; break;
    case 'aimant': sym = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0018, 8, 16, Math.PI), mat(p.couleur, lum)); sym.position.y = s + 0.002; break;
    case 'ressort': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0012, 6, 16), mat(p.couleur, lum));
        t.rotation.x = Math.PI / 2; t.position.y = s + i * 0.0025;
        sym.add(t);
      }
      break;
    }
    case 'sangsue': sym = new THREE.Mesh(new THREE.SphereGeometry(0.005, 14, 10), mat(p.couleur, lum)); sym.scale.y = 1.4; sym.position.y = s + 0.002; break;
    case 'oeil': {
      sym = new THREE.Group();
      const blanc = new THREE.Mesh(new THREE.SphereGeometry(0.006, 14, 10), mat(0xffffff, { emissive: 0x555555 }));
      const pupille = new THREE.Mesh(new THREE.SphereGeometry(0.003, 10, 8), mat(p.couleur, lum));
      blanc.scale.y = 0.6; pupille.position.y = 0.003; pupille.scale.y = 0.5;
      sym.add(blanc, pupille); sym.position.y = s;
      break;
    }
    case 'orage': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const z = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.0025, 0.007), mat(p.couleur, lum));
        z.position.set((i % 2 ? 1 : -1) * 0.0015, s + 0.001 + i * 0.002, (i - 1) * 0.004);
        z.rotation.y = i % 2 ? 0.6 : -0.6;
        sym.add(z);
      }
      break;
    }
    case 'cyclone': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.0065 - i * 0.0018, 0.0011, 6, 16), mat(p.couleur, lum));
        t.rotation.x = Math.PI / 2; t.position.y = s + i * 0.0022;
        sym.add(t);
      }
      break;
    }
    case 'carapace': sym = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 6), mat(p.couleur, lum)); sym.position.y = s; break;
    default: sym = new THREE.Mesh(new THREE.SphereGeometry(0.004, 12, 8), mat(p.couleur)); sym.position.y = s;
  }
  g.add(sym);
  return { g };
}

// Renvoie { racine, inclinaison, rotor } : racine = position sur le bureau, inclinaison = penche quand la toupie faiblit,
// rotor = ce qui tourne.
export function creerToupie(equipe, nivPieces = {}) {
  const racine = new THREE.Group(), inclinaison = new THREE.Group(), rotor = new THREE.Group();
  racine.add(inclinaison); inclinaison.add(rotor);
  const P = id => PIECE[id];
  const N = id => Math.max(1, nivPieces[id] || 1); // niveau de chaque pièce : il se voit (lames, dents, rivets, lueur)
  const pt = pointe(P(equipe.pointe), N(equipe.pointe));
  const bs = base(P(equipe.base), pt.h, N(equipe.base));
  const cr = couronne(P(equipe.couronne), pt.h + (bs.top - pt.h) * 0.45, N(equipe.couronne));
  const am = ame(P(equipe.ame), bs.top, N(equipe.ame));
  rotor.add(pt.g, bs.g, cr.g, am.g);
  racine.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  // parts : chaque pièce est un groupe à part (vue éclatée de l'atelier)
  return { racine, inclinaison, rotor, parts: { pointe: pt.g, base: bs.g, couronne: cr.g, ame: am.g } };
}

export function libererToupie(t) {
  t.racine.traverse(o => { if (o.isMesh) { if (!o.userData.geoPartagee) o.geometry.dispose(); if (!o.userData.matPartage) o.material.dispose(); } });
  t.racine.removeFromParent();
}

// Une seule pièce de toupie, centrée (écran d'inspection de la collection / de l'atelier)
export function creerPieceToupie(id, k = 1) {
  const p = PIECE[id], g = new THREE.Group();
  const part = p.slot === 'pointe' ? pointe(p, k).g : p.slot === 'base' ? base(p, 0, k).g : p.slot === 'couronne' ? couronne(p, 0, k).g : ame(p, 0, k).g;
  g.add(part);
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}
