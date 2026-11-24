// La scène 3D : rendu, caméra, bureau de jeu, et la vitrine de l'atelier.
import * as THREE from 'three';
import { DESK_X, DESK_Z, RAIL_Z, RAIL_MARGIN } from './config.js';

export const conteneur = document.getElementById('jeu');
export const renderer = new THREE.WebGLRenderer({ antialias: true, powerPreference: 'high-performance' });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.toneMappingExposure = 1.05;
conteneur.appendChild(renderer.domElement);

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
const plateau = new THREE.Mesh(new THREE.BoxGeometry(DESK_X * 2, 0.04, DESK_Z * 2), bois);
plateau.position.y = -0.02;
plateau.receiveShadow = true;
scene.add(plateau);

// Rebords (la toupie rebondit dessus)
const rebordMat = new THREE.MeshStandardMaterial({ color: 0x3b2516, roughness: 0.6 });
for (const [w, d, x, z] of [
  [DESK_X * 2 + 0.06, 0.03, 0, -DESK_Z - 0.015], [DESK_X * 2 + 0.06, 0.03, 0, DESK_Z + 0.015],
  [0.03, DESK_Z * 2, -DESK_X - 0.015, 0], [0.03, DESK_Z * 2, DESK_X + 0.015, 0],
]) {
  const m = new THREE.Mesh(new THREE.BoxGeometry(w, 0.035, d), rebordMat);
  m.position.set(x, 0.0175, z);
  m.castShadow = m.receiveShadow = true;
  scene.add(m);
}

// Table et sol autour
const table = new THREE.Mesh(new THREE.BoxGeometry(3.2, 0.06, 1.8), new THREE.MeshStandardMaterial({ color: 0x2a1c12, roughness: 0.8 }));
table.position.y = -0.07;
table.receiveShadow = true;
scene.add(table);

// Rail du lanceur (bas du bureau) et rail adverse (haut, pour les duels)
const railMat = new THREE.MeshStandardMaterial({ color: 0x8a6a45, roughness: 0.5, metalness: 0.3 });
function rail(z) {
  const m = new THREE.Mesh(new THREE.BoxGeometry((DESK_X - RAIL_MARGIN) * 2 + 0.04, 0.004, 0.012), railMat);
  m.position.set(0, 0.002, z);
  scene.add(m);
  return m;
}
rail(RAIL_Z);
export const railAdverse = rail(-RAIL_Z);
railAdverse.visible = false;

// ---------------------------------------------------------------- Caméra adaptée à l'écran
export function cadrer() {
  const w = conteneur.clientWidth || window.innerWidth, h = conteneur.clientHeight || window.innerHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h;
  const portrait = w / h < 1;
  camera.fov = portrait ? 58 : 40;
  const dist = portrait ? 1.9 : 1.45;
  camera.position.set(0, dist * 0.86, dist * 0.62);
  camera.lookAt(0, 0, 0.02);
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
