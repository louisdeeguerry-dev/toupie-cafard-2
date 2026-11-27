// La scène 3D : rendu, caméra, bureau de jeu, et la vitrine de l'atelier.
import * as THREE from 'three';
import { DESK_X, ARENE_R, RAIL_R, RAIL_ANGLE } from './config.js';
import { EffectComposer } from '../vendor/jsm/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/jsm/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/jsm/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/jsm/postprocessing/OutputPass.js';

export const conteneur = document.getElementById('jeu');
export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.debug.checkShaderErrors = false; // la vérification synchrone des shaders fige l'image à chaque compilation (saccades)
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
conteneur.appendChild(renderer.domElement);

// Post-traitement : un halo doux (bloom) autour de ce qui brille (voyants, étincelles, néons, lueurs des pièces).
// Un seul « composeur » pour le bureau et la vitrine : on change juste la scène et la caméra à chaque image.
const composeur = new EffectComposer(renderer);
const passeRendu = new RenderPass(new THREE.Scene(), new THREE.PerspectiveCamera());
const halo = new UnrealBloomPass(new THREE.Vector2(256, 256), 0.45, 0.5, 0.92);
composeur.addPass(passeRendu); composeur.addPass(halo); composeur.addPass(new OutputPass());
// Réglages graphiques (Paramètres) : qualité d'image (résolution), ombres, halo lumineux
const graph = { halo: true };
export function reglerGraphismes({ qualite = 'haute', ombres = true, halo = true } = {}) {
  const dpr = window.devicePixelRatio || 1;
  renderer.setPixelRatio(qualite === 'basse' ? Math.min(0.75, dpr) : qualite === 'moyenne' ? Math.min(1, dpr) : Math.min(2, dpr));
  renderer.shadowMap.enabled = ombres;
  scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { m.needsUpdate = true; }); });
  graph.halo = halo;
  cadrer();
}
export function rendre(sc, cam) {
  if (!graph.halo) { renderer.render(sc, cam); return; } // sans halo : rendu direct, plus léger
  passeRendu.scene = sc; passeRendu.camera = cam;
  // La vitrine est déjà très éclairée (projecteurs) : halo plus discret et réservé aux vraies sources de lumière
  const vit = sc === vitrine;
  halo.strength = vit ? 0.22 : 0.45; halo.threshold = vit ? 1.15 : 0.92;
  composeur.render();
}

// ---------------------------------------------------------------- Le bureau
export const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1d1712);
scene.fog = new THREE.Fog(0x1d1712, 2.5, 6);
export const camera = new THREE.PerspectiveCamera(42, 1, 0.01, 20);

scene.add(new THREE.HemisphereLight(0xfff1dc, 0x2a1d14, 0.75));
const lampe = new THREE.DirectionalLight(0xffe2b8, 2.2);
lampe.position.set(-0.6, 1.6, 0.5);
lampe.castShadow = true;
lampe.shadow.mapSize.set(2048, 2048);
Object.assign(lampe.shadow.camera, { left: -1, right: 1, top: 1, bottom: -1, near: 0.1, far: 4 });
lampe.shadow.bias = -0.0005;
scene.add(lampe);
const contre = new THREE.PointLight(0x7fa8ff, 0.6, 4);
contre.position.set(0.8, 0.6, -1);
scene.add(contre);

// Plateau en bois avec lattes (texture dessinée)
function textureBois() {
  const c = document.createElement('canvas');
  c.width = 1024; c.height = 1024;
  const g = c.getContext('2d');
  const lattes = 8;
  for (let i = 0; i < lattes; i++) {
    const h = 26 + Math.random() * 8;
    g.fillStyle = `hsl(${h}, 45%, ${30 + Math.random() * 8}%)`;
    g.fillRect(0, (i * 1024) / lattes, 1024, 1024 / lattes);
    for (let k = 0; k < 60; k++) {
      g.strokeStyle = `hsla(${h}, 40%, ${20 + Math.random() * 25}%, 0.25)`;
      g.lineWidth = 1 + Math.random() * 2;
      const y = (i * 1024) / lattes + Math.random() * (1024 / lattes);
      g.beginPath(); g.moveTo(0, y);
      g.bezierCurveTo(300, y + Math.random() * 6 - 3, 700, y + Math.random() * 6 - 3, 1024, y);
      g.stroke();
    }
    g.fillStyle = 'rgba(0,0,0,0.45)';
    g.fillRect(0, (i * 1024) / lattes, 1024, 3);
  }
  const t = new THREE.CanvasTexture(c);
  t.colorSpace = THREE.SRGBColorSpace;
  t.anisotropy = 8;
  return t;
}

const bois = new THREE.MeshStandardMaterial({ map: textureBois(), roughness: 0.45, metalness: 0.05 });
const plateau = new THREE.Mesh(new THREE.CylinderGeometry(ARENE_R, ARENE_R, 0.04, 96), bois);
plateau.position.y = -0.02;
plateau.receiveShadow = true;
scene.add(plateau);

// Rebords (la toupie rebondit dessus)
const rebordMat = new THREE.MeshStandardMaterial({ color: 0x3b2516, roughness: 0.6 });
const REBORD_NEUTRE = { color: 0x3b2516, emissive: 0x000000, roughness: 0.6 };
const rebordRond = new THREE.Mesh(new THREE.TorusGeometry(ARENE_R + 0.014, 0.018, 16, 128), rebordMat);
rebordRond.rotation.x = Math.PI / 2;
rebordRond.position.y = 0.012;
rebordRond.castShadow = rebordRond.receiveShadow = true;
scene.add(rebordRond);
// Terrain rebondissant : plateau carré (côtés plats face aux lanceurs, demi-côté = ARENE_R),
// avec 4 bandes rebondissantes droites (comme des bandes de billard) ; voir les rebonds dans physics.js
const carre = new THREE.Group();
{
  const p = new THREE.Mesh(new THREE.BoxGeometry(2 * ARENE_R, 0.04, 2 * ARENE_R), bois);
  p.position.y = -0.019; p.receiveShadow = true;
  carre.add(p);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2;
    const b = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.018, 2 * ARENE_R + 0.064, 16), rebordMat);
    b.rotation.z = Math.PI / 2; b.rotation.y = -a + Math.PI / 2; // bande couchée, parallèle au côté
    b.position.set(Math.cos(a) * (ARENE_R + 0.014), 0.012, Math.sin(a) * (ARENE_R + 0.014));
    b.castShadow = b.receiveShadow = true;
    carre.add(b);
  }
  carre.visible = false;
  scene.add(carre);
}

// Table et sol autour
const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 1.8), new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.8 }));
table.position.y = -0.07;
table.receiveShadow = true;
scene.add(table);

// Rail du lanceur (bas du bureau) et rail adverse (haut, pour les duels)
const railMat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.5, metalness: 0.3 });
// Rails en arc de cercle (le lanceur glisse dessus)
function rail(haut) {
  const pts = [];
  for (let i = 0; i <= 40; i++) {
    const a = -RAIL_ANGLE - 0.06 + ((2 * RAIL_ANGLE + 0.12) * i) / 40;
    pts.push(new THREE.Vector3(Math.sin(a) * RAIL_R, 0.003, (haut ? -1 : 1) * Math.cos(a) * RAIL_R));
  }
  const m = new THREE.Mesh(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 60, 0.004, 6, false), railMat);
  scene.add(m);
  return m;
}
rail(false);
export const railAdverse = rail(true);
railAdverse.visible = false;

// ---------------------------------------------------------------- Décor des terrains de duel
const cuve = new THREE.Group();
for (const r of [0.12, 0.24, 0.36, 0.48]) {
  const anneau = new THREE.Mesh(new THREE.RingGeometry(r - 0.004, r, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.08 + r * 0.25, depthWrite: false }));
  anneau.rotation.x = -Math.PI / 2;
  anneau.position.y = 0.0006;
  cuve.add(anneau);
}
cuve.visible = false;
scene.add(cuve);
// En duel, l'arène est légèrement creusée (pente douce vers le centre, CHOC.cuvette dans physics.js) : des cercles très
// légers le montrent (la Cuve, très creusée, a les siens, plus marqués)
const creux = new THREE.Group();
for (const r of [0.15, 0.3, 0.45]) {
  const anneau = new THREE.Mesh(new THREE.RingGeometry(r - 0.003, r, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.05 + r * 0.08, depthWrite: false }));
  anneau.rotation.x = -Math.PI / 2;
  anneau.position.y = 0.0006;
  creux.add(anneau);
}
creux.visible = false;
scene.add(creux);
export function decorTerrain(id, duel = false) {
  const c = id === 'rebond' ? { color: 0x2f80ed, emissive: 0x0b3b8a, roughness: 0.3 }
    : id === 'collant' ? { color: 0x7dbb3a, emissive: 0x1f3d05, roughness: 0.1 }
    : REBORD_NEUTRE;
  rebordMat.color.setHex(c.color); rebordMat.emissive.setHex(c.emissive); rebordMat.roughness = c.roughness;
  cuve.visible = id === 'cuve';
  creux.visible = duel && id !== 'cuve';
  carre.visible = id === 'rebond'; plateau.visible = rebordRond.visible = id !== 'rebond';
}

// ---------------------------------------------------------------- Caméra adaptée à l'écran
// Caméra : position de base (tout le bureau) ; en duel elle se rapproche des toupies ; secousse sur les gros chocs
const base = { pos: new THREE.Vector3(), cible: new THREE.Vector3(0, 0, 0.07) };
const cam = { pos: new THREE.Vector3(), cible: new THREE.Vector3(0, 0, 0.07), secousse: 0 };
export function secouer(force) { if (window.__tc2Secousses === false) return; cam.secousse = Math.max(cam.secousse, force); } // désactivable (Paramètres)
// suivi : null (vue normale) ou { x, z, ecart } (milieu des toupies et distance entre elles)
export function majCamera(dt, suivi) {
  let pos = base.pos, cible = base.cible;
  if (suivi) {
    const d = Math.min(1, Math.max(0.42, 0.42 + suivi.ecart * 0.9));
    cible = new THREE.Vector3(suivi.x * 0.85, 0, suivi.z * 0.85);
    pos = cible.clone().add(new THREE.Vector3(0, base.pos.y, base.pos.z - 0.02).normalize().multiplyScalar(base.pos.length() * d));
  }
  const k = 1 - Math.exp(-3 * dt);
  cam.pos.lerp(pos, k); cam.cible.lerp(cible, k);
  camera.position.copy(cam.pos);
  if (cam.secousse > 0) {
    camera.position.x += (Math.random() - 0.5) * cam.secousse;
    camera.position.y += (Math.random() - 0.5) * cam.secousse;
    cam.secousse = Math.max(0, cam.secousse - dt * 0.06);
  }
  camera.lookAt(cam.cible);
}

export function cadrer() {
  const w = conteneur.clientWidth || window.innerWidth, h = conteneur.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  composeur.setPixelRatio(renderer.getPixelRatio()); composeur.setSize(w, h);
  halo.resolution.set(w / 2, h / 2);
  camera.aspect = w / h;
  const portrait = w / h < 1;
  camera.fov = portrait ? 58 : 40;
  // En portrait, on recule assez pour que tout le bureau tienne en largeur
  const demiLargeurVue = Math.atan(Math.tan((camera.fov * Math.PI) / 360) * (w / h));
  const distLargeur = (DESK_X + 0.08) / Math.tan(demiLargeurVue) / 1.06;
  // Portrait (téléphone) : vue plus plongeante, le plateau rond remplit toute la largeur de l'écran
  const dist = portrait ? distLargeur * 1.02 : 1.68;
  if (portrait) base.pos.set(0, dist * 0.96, dist * 0.28); else base.pos.set(0, dist * 0.86, dist * 0.62);
  if (!cam.pos.lengthSq()) cam.pos.copy(base.pos);
  camera.position.copy(cam.pos);
  camera.lookAt(cam.cible);
  camera.updateProjectionMatrix();
  vitrineCam.aspect = w / h;
  // La toupie s'affiche à côté du panneau de l'atelier (à droite en paysage, en bas en portrait)
  vitrineCam.fov = portrait ? 52 : 35;
  if (w > 720) vitrineCam.setViewOffset(w, h, Math.min(40, w * 0.03), 0, w, h); // entre les deux panneaux
  else vitrineCam.setViewOffset(w, h, 0, h * 0.25, w, h);
  vitrineCam.updateProjectionMatrix();
}

// ---------------------------------------------------------------- La vitrine de l'atelier
export const vitrine = new THREE.Scene();
vitrine.background = new THREE.Color(0x15110e);
export const vitrineCam = new THREE.PerspectiveCamera(35, 1, 0.01, 10);
vitrineCam.position.set(0, 0.1, 0.4);
vitrineCam.lookAt(0, 0.035, 0);
vitrine.add(new THREE.HemisphereLight(0xffffff, 0x302018, 1.0));
const spot = new THREE.SpotLight(0xffe7c4, 6, 2, 0.6, 0.5);
spot.position.set(0.15, 0.5, 0.25);
spot.castShadow = true;
vitrine.add(spot);
const socle = new THREE.Mesh(new THREE.CylinderGeometry(0.07, 0.078, 0.02, 48), new THREE.MeshStandardMaterial({ color: 0x6b4a30, roughness: 0.35, metalness: 0.1 }));
socle.position.y = -0.01;
socle.receiveShadow = true;
vitrine.add(socle);
const liseré = new THREE.DirectionalLight(0x9cc4ff, 1.4);
liseré.position.set(-0.3, 0.2, -0.4);
vitrine.add(liseré);
export const supportVitrine = new THREE.Group();
vitrine.add(supportVitrine);

window.addEventListener('resize', cadrer);
cadrer();

// ---------------------------------------------------------------- Reflets : un « studio » flou (plafonnier, néons chaud et froid)
// sert de carte d'environnement à tous les matériaux : les métaux (engrenages, ressorts, toupies) brillent enfin
function studio() {
  const pm = new THREE.PMREMGenerator(renderer), s = new THREE.Scene(), boite = new THREE.BoxGeometry(1, 1, 1);
  s.background = new THREE.Color(0x120c09);
  const panneau = (c, i, pos, taille) => {
    const m = new THREE.Mesh(boite, new THREE.MeshBasicMaterial({ color: new THREE.Color(c).multiplyScalar(i) }));
    m.position.set(...pos); m.scale.set(...taille); s.add(m);
  };
  panneau(0xfff1dc, 2.2, [0, 5, 0], [5, 0.1, 3]); // plafonnier
  panneau(0xffa860, 1.6, [-5, 1.5, 1], [0.1, 2, 4]); // néon chaud
  panneau(0x80aaff, 1.3, [5, 1.5, -1], [0.1, 2, 3]); // néon froid
  panneau(0xffffff, 0.7, [0, 1, 5], [3, 1.5, 0.1]); // fenêtre devant
  panneau(0x3a281c, 1, [0, -2, 0], [12, 0.1, 12]); // sol
  const tex = pm.fromScene(s, 0.035).texture;
  pm.dispose(); boite.dispose();
  return tex;
}
const reflets = studio();
scene.environment = reflets;
vitrine.environment = reflets;
