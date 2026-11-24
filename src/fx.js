// Effets : textes flottants (HTML au-dessus de la 3D) et taches d'insectes écrasés.
import * as THREE from 'three';
import { camera, renderer, scene } from './scene.js';

const calque = document.getElementById('popups');
const v = new THREE.Vector3();
const textes = [];

export function popup(texte, x, z, classe = '') {
  const el = document.createElement('div');
  el.className = 'pop ' + classe;
  el.textContent = texte;
  calque.appendChild(el);
  textes.push({ el, x, z, t: 0 });
}

const tacheGeo = new THREE.CircleGeometry(1, 16);
const taches = [];
export function tache(x, z, r, couleur = 0x3a2a12) {
  const m = new THREE.Mesh(tacheGeo, new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.3, transparent: true, opacity: 0.85 }));
  m.rotation.x = -Math.PI / 2;
  m.position.set(x, 0.0008 + taches.length * 0.00001, z);
  m.scale.set(r * (1 + Math.random() * 0.4), r * (1 + Math.random() * 0.4), 1);
  scene.add(m);
  taches.push({ m, t: 0 });
}

export function viderTaches() {
  for (const s of taches) { s.m.material.dispose(); s.m.removeFromParent(); }
  taches.length = 0;
}

export function majFx(dt) {
  const rect = renderer.domElement.getBoundingClientRect();
  for (let i = textes.length - 1; i >= 0; i--) {
    const p = textes[i];
    p.t += dt;
    v.set(p.x, 0.06 + p.t * 0.08, p.z).project(camera);
    p.el.style.transform = `translate(${(v.x * 0.5 + 0.5) * rect.width}px, ${(-v.y * 0.5 + 0.5) * rect.height}px) translate(-50%, -50%)`;
    p.el.style.opacity = String(Math.max(0, 1 - Math.max(0, p.t - 0.5) / 0.5));
    if (p.t > 1) { p.el.remove(); textes.splice(i, 1); }
  }
  for (let i = taches.length - 1; i >= 0; i--) {
    const s = taches[i];
    s.t += dt;
    if (s.t > 8) { s.m.material.opacity = Math.max(0, 0.85 - (s.t - 8) / 2); }
    if (s.t > 10) { s.m.material.dispose(); s.m.removeFromParent(); taches.splice(i, 1); }
  }
}
