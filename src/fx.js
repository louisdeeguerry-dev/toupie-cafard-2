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
  textes.push({ el, x: x + (Math.random() - 0.5) * 0.04, z: z + (Math.random() - 0.5) * 0.03, t: 0 });
}

// Pièce qui s'envole du cafard écrasé jusqu'au compteur d'argent (en haut à droite), qui « pulse » à l'arrivée
export function pieceVolante(x, z, n = 1) {
  const cible = document.getElementById('argent');
  if (!cible || document.hidden) return;
  const rect = renderer.domElement.getBoundingClientRect(), r = cible.getBoundingClientRect();
  v.set(x, 0.05, z).project(camera);
  const x0 = (v.x * 0.5 + 0.5) * rect.width, y0 = (-v.y * 0.5 + 0.5) * rect.height;
  for (let i = 0; i < Math.min(4, n); i++) {
    const el = document.createElement('div');
    el.className = 'piece-volante'; el.textContent = '🪙';
    calque.appendChild(el);
    const dx = (Math.random() - 0.5) * 40, haut = -30 - Math.random() * 30;
    const a = el.animate([
      { transform: `translate(${x0}px, ${y0}px) scale(.6)`, opacity: 0 },
      { transform: `translate(${x0 + dx}px, ${y0 + haut}px) scale(1.1)`, opacity: 1, offset: 0.25 },
      { transform: `translate(${r.left + r.width / 2}px, ${r.top + r.height / 2}px) scale(.7)`, opacity: 1 },
    ], { duration: 650 + i * 90, easing: 'cubic-bezier(.5,0,.8,.4)' });
    a.onfinish = () => { el.remove(); cible.classList.remove('pulse'); void cible.offsetWidth; cible.classList.add('pulse'); };
  }
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

// ---------------------------------------------------------------- Barres de vie (cafards) et de rotation (toupies)
const calqueBarres = document.getElementById('barres');
const reserve = [];
let utilisees = 0;
function barre() {
  let b = reserve[utilisees];
  if (!b) {
    b = document.createElement('div');
    b.className = 'barre-vie';
    b.innerHTML = '<i></i><span></span>';
    calqueBarres.appendChild(b);
    reserve.push(b);
  }
  utilisees++;
  b.style.display = '';
  return b;
}
function placer(b, x, y, z, frac, classe, texte = '') {
  const rect = renderer.domElement.getBoundingClientRect();
  v.set(x, y, z).project(camera);
  b.className = 'barre-vie ' + classe;
  b.style.transform = `translate(${(v.x * 0.5 + 0.5) * rect.width}px, ${(-v.y * 0.5 + 0.5) * rect.height}px) translate(-50%, -100%)`;
  b.firstChild.style.width = Math.max(0, Math.min(100, frac * 100)).toFixed(0) + '%';
  b.lastChild.textContent = texte;
}
// cafards : barre seulement s'ils sont blessés ; toupies : barre de rotation (la toupie s'arrête quand elle tombe sous son seuil)
// Sans argument (retour au menu) : toutes les barres sont cachées
export function majBarres(cafards = [], toupies = []) {
  utilisees = 0;
  for (const c of cafards) {
    if (c.mort || c.chute > 0 || c.vie >= c.vieMax || c.t?.fixe) continue;
    placer(barre(), c.x, c.r * 1.6 + 0.01, c.z, c.vie / c.vieMax, 'cafard');
  }
  for (const t of toupies) {
    if (!t.lancee || t.tombe) continue;
    // 100 % = rotation de départ, 0 % = seuil de chute
    const frac = (t.rotation / t.rotationMax - t.s.seuilChute) / (1 - t.s.seuilChute);
    placer(barre(), t.x, 0.075, t.z, frac, (t.camp === 'joueur' ? 'toupie moi' : 'toupie adv') + (frac < 0.25 ? ' alerte' : ''), frac < 0.5 ? `${Math.max(0, Math.round(frac * 100))} %` : ''); // le % seulement quand ça devient serré
  }
  for (let i = utilisees; i < reserve.length; i++) reserve[i].style.display = 'none';
}

// ---------------------------------------------------------------- Étincelles (chocs entre toupies, cafards écrasés)
const etincelleGeo = new THREE.SphereGeometry(1, 6, 4);
const etincelles = [];
export function etincelles_(x, z, n = 10, couleur = 0xffd27a, force = 1) {
  for (let i = 0; i < n; i++) {
    const m = new THREE.Mesh(etincelleGeo, new THREE.MeshBasicMaterial({ color: couleur, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
    m.scale.setScalar(0.0025 + Math.random() * 0.002);
    m.position.set(x, 0.02, z);
    scene.add(m);
    const a = Math.random() * Math.PI * 2, v = (0.3 + Math.random() * 0.6) * force;
    etincelles.push({ m, vx: Math.cos(a) * v, vy: 0.2 + Math.random() * 0.5 * force, vz: Math.sin(a) * v, t: 0, vie: 0.25 + Math.random() * 0.25 });
  }
}
export { etincelles_ as etincelles };
export function majEtincelles(dt) {
  for (let i = etincelles.length - 1; i >= 0; i--) {
    const e = etincelles[i];
    e.t += dt; e.vy -= 2.5 * dt;
    e.m.position.x += e.vx * dt; e.m.position.y = Math.max(0.002, e.m.position.y + e.vy * dt); e.m.position.z += e.vz * dt;
    e.m.material.opacity = 1 - e.t / e.vie;
    if (e.t > e.vie) { e.m.material.dispose(); e.m.removeFromParent(); etincelles.splice(i, 1); }
  }
}

// ---------------------------------------------------------------- Arrêt sur image et ralenti
// geler(ms) : le jeu se fige un instant (sensation d'impact). ralentir(facteur, s) : ralenti (coup final).
export const temps = { gel: 0, ralenti: 1, ralentiT: 0 };
export function geler(ms) { temps.gel = Math.max(temps.gel, ms / 1000); }
export function ralentir(facteur, duree) { temps.ralenti = facteur; temps.ralentiT = duree; }
// Renvoie le facteur à appliquer au temps de jeu pour cette image (dtReel en secondes)
export function facteurTemps(dtReel) {
  if (temps.gel > 0) { temps.gel -= dtReel; return 0; }
  if (temps.ralentiT > 0) { temps.ralentiT -= dtReel; return temps.ralenti; }
  return 1;
}
