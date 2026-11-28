// Écran d'inspection d'une pièce (collection et atelier) : la pièce grandit au centre de l'écran, le fond devient flou.
// On la fait pivoter (glisser) et on zoome (molette / pincement). Un panneau montre ses effets, niveau par niveau.
// Clic sur le fond ou « ← » : la pièce rapetisse et on revient où on était.
import * as THREE from 'three';
import { PIECE, RARETES, SLOTS, NIVEAU_PIECE_MAX, niveauxPiece, estDepart } from './data/pieces.js';
import { STAT, effet } from './stats.js';
import { creerPieceToupie } from './topMesh.js';
import { creerPieceLanceur } from './lanceurMesh.js';
import { son } from './audio.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const voile = $('inspecteur'), toile = $('inspecteurToile');

const renderer = new THREE.WebGLRenderer({ canvas: toile, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.toneMapping = THREE.ACESFilmicToneMapping;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(35, 1, 0.01, 20);
scene.add(new THREE.HemisphereLight(0xffffff, 0x403020, 1.3));
const cle = new THREE.DirectionalLight(0xfff0d8, 2.4); cle.position.set(1, 2, 2); scene.add(cle);
const contre = new THREE.DirectionalLight(0x8fc4ff, 1.6); contre.position.set(-2, 1, -2); scene.add(contre);
const pivot = new THREE.Group();
scene.add(pivot);

const st = { ouvert: false, t: 0, fermeture: 0, rotX: 0.35, rotY: 0, vitY: 0.6, zoom: 1, glisse: null, piece: null, niv: 1, ctx: null };

function taille() {
  const w = toile.clientWidth, h = toile.clientHeight;
  renderer.setSize(w, h, false);
  camera.aspect = w / h; camera.updateProjectionMatrix();
}

// ctx : { save, onEquiper(id, niv) } — onEquiper seulement dans l'atelier
// Le modèle 3D suit l'onglet de niveau : au niveau 3, la couronne de lames a 4 lames, etc.
function modelePiece() {
  const p = st.piece;
  pivot.clear();
  const m = p.slot === 'engrenage' || p.slot === 'ressort' ? creerPieceLanceur(p.id) : creerPieceToupie(p.id, st.niv);
  // On centre et on met à l'échelle pour que toutes les pièces aient la même taille à l'écran
  const boite = new THREE.Box3().setFromObject(m), c = boite.getCenter(new THREE.Vector3()), dim = boite.getSize(new THREE.Vector3());
  m.position.sub(c);
  const g = new THREE.Group(); g.add(m); g.scale.setScalar(1 / Math.max(dim.x, dim.y, dim.z, 0.001));
  pivot.add(g);
}
export function inspecter(id, ctx) {
  const p = PIECE[id];
  st.piece = p; st.ctx = ctx;
  st.niv = Math.max(1, Math.min(NIVEAU_PIECE_MAX, ctx.save.niveauxPieces?.[id] || 1));
  modelePiece();
  Object.assign(st, { ouvert: true, t: 0, fermeture: 0, rotX: 0.35, rotY: 0, vitY: 0.6, zoom: 1 });
  voile.classList.remove('cache', 'ferme');
  taille();
  panneau();
  son('choix', { volume: 0.5 }); son('toc', { volume: 0.4, hauteur: 1.5 });
  requestAnimationFrame(boucle);
}

function panneau() {
  const p = st.piece, r = RARETES[p.rarete], sl = SLOTS.find(s => s.id === p.slot);
  const n = st.ctx.save.collection[p.id] || 0, max = Math.min(NIVEAU_PIECE_MAX, n);
  const onglets = Array.from({ length: NIVEAU_PIECE_MAX }, (_, i) => i + 1).map(k =>
    `<button class="niv-onglet ${k === st.niv ? 'on' : ''} ${k > max ? 'verrou' : ''}" data-niv="${k}">${k > max ? '🔒 ' : ''}Niv ${k}</button>`).join('');
  const effets = Object.entries(niveauxPiece(p, st.niv)).map(([s, v]) =>
    `<div class="effet-ligne ${v > 0 ? 'plus' : 'moins'}"><span>${STAT[s].icone} ${STAT[s].nom}</span><b>${esc(effet(s, v))}</b></div>`).join('')
    || '<div class="petit">Aucun effet : une pièce neutre.</div>';
  const peut = st.ctx.onEquiper && st.niv <= max;
  $('inspecteurPanneau').innerHTML = `
    ${estDepart(p.id) ? '<div class="petit">Pièce de départ : elle n\'a pas de niveaux.</div>' : `<div class="niv-onglets">${onglets}</div>`}
    <div class="rar" style="color:${r.couleur}">${r.nom} · ${sl.icone} ${sl.nom}</div>
    <h2>${esc(p.nom)}</h2><div class="petit">${esc(p.desc)}</div>
    <div class="effets">${effets}</div>
    <div class="petit">${n ? `Tu en as ${n} exemplaire${n > 1 ? 's' : ''}${st.niv > max ? ` — il en faut ${st.niv} pour le niveau ${st.niv}` : ''}.` : 'Pas encore trouvée : ouvre des boîtes mystère !'}</div>
    ${st.ctx.onEquiper ? `<button class="btn" id="inspecteurEquiper" ${peut ? '' : 'disabled'}>Équiper (niveau ${st.niv})</button>` : ''}`;
  const eq = $('inspecteurEquiper');
  if (eq) eq.onclick = () => { st.ctx.onEquiper(p.id, st.niv); fermer(); };
}

$('inspecteurPanneau').addEventListener('click', e => {
  const b = e.target.closest('[data-niv]');
  if (!b) return;
  st.niv = +b.dataset.niv; son('toc', { volume: 0.4, hauteur: 1.2 + st.niv * 0.1 }); modelePiece(); panneau();
  st.t = Math.min(st.t, 0.25); // petit rebond de la pièce quand on change de niveau
});

export function fermer() {
  if (!st.ouvert || st.fermeture) return;
  st.fermeture = 0.001;
  voile.classList.add('ferme');
  son('toc', { volume: 0.35, hauteur: 0.8 });
}
$('inspecteurRetour').addEventListener('click', fermer);
voile.addEventListener('click', e => { if (e.target === voile) fermer(); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') fermer(); });

// Pivoter en glissant, zoomer à la molette ou en pinçant
const doigts = new Map();
toile.addEventListener('pointerdown', e => { doigts.set(e.pointerId, { x: e.clientX, y: e.clientY }); toile.setPointerCapture(e.pointerId); st.vitY = 0; });
toile.addEventListener('pointermove', e => {
  const a = doigts.get(e.pointerId);
  if (!a) return;
  if (doigts.size === 2) {
    const [p1, p2] = [...doigts.values()], d0 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
    a.x = e.clientX; a.y = e.clientY;
    const [q1, q2] = [...doigts.values()], d1 = Math.hypot(q1.x - q2.x, q1.y - q2.y);
    st.zoom = Math.max(0.5, Math.min(2.5, st.zoom * (d1 / Math.max(1, d0))));
    return;
  }
  st.rotY += (e.clientX - a.x) * 0.01; st.rotX = Math.max(-1.2, Math.min(1.2, st.rotX + (e.clientY - a.y) * 0.01));
  a.x = e.clientX; a.y = e.clientY;
});
const lacher = e => { doigts.delete(e.pointerId); if (!doigts.size) st.vitY = 0.6; };
toile.addEventListener('pointerup', lacher);
toile.addEventListener('pointercancel', lacher);
toile.addEventListener('wheel', e => { e.preventDefault(); st.zoom = Math.max(0.5, Math.min(2.5, st.zoom * Math.exp(-e.deltaY * 0.0015))); }, { passive: false });

const sortie = x => 1 + 2.7 * Math.pow(x - 1, 3) + 1.7 * Math.pow(x - 1, 2); // easeOutBack
let avant = 0;
function boucle(t) {
  if (!st.ouvert) return;
  const dt = Math.min(0.05, avant ? (t - avant) / 1000 : 0.016); avant = t;
  st.t += dt;
  let echelle = sortie(Math.min(1, st.t / 0.45));
  if (st.fermeture) {
    st.fermeture += dt;
    echelle = Math.max(0, 1 - st.fermeture / 0.3);
    if (st.fermeture > 0.3) { st.ouvert = false; avant = 0; voile.classList.add('cache'); voile.classList.remove('ferme'); return; }
  }
  st.rotY += st.vitY * dt;
  pivot.rotation.set(st.rotX, st.rotY, 0);
  pivot.scale.setScalar(Math.max(0.01, echelle));
  camera.position.set(0, 0, 2.6 / st.zoom);
  camera.lookAt(0, 0, 0);
  renderer.render(scene, camera);
  requestAnimationFrame(boucle);
}
window.addEventListener('resize', () => st.ouvert && taille());
