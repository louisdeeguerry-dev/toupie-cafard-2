// La vue 3D de l'atelier : une mini-arène ronde (le terrain de duel choisi) en fond, la toupie ou le lanceur dessus.
// Quand on choisit une pièce, l'objet s'ÉCLATE (toutes les pièces s'écartent) et la caméra ZOOME sur la pièce choisie,
// qui ressort un peu plus que les autres. On change de pièce : l'ancienne revient, la nouvelle sort.
import * as THREE from 'three';
import { vitrine, vitrineCam, supportVitrine } from './scene.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { creerLanceur, libererLanceur, tournerEngrenages } from './lanceurMesh.js';
import { majMagasin, vueBoutique } from './magasin3d.js';
import { majOuverture, vueOuverture } from './ouverture3d.js';

const R = 0.2; // rayon de la mini-arène

// ---------------------------------------------------------------- Décor du menu : ciel dégradé, lumières colorées, poussières lumineuses
const ciel = new THREE.Mesh(new THREE.SphereGeometry(6, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false,
  uniforms: { haut: { value: new THREE.Color(0x2b1d5c) }, milieu: { value: new THREE.Color(0xb4532a) }, bas: { value: new THREE.Color(0x24130a) } },
  vertexShader: 'varying vec3 p; void main(){ p = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }',
  fragmentShader: 'uniform vec3 haut, milieu, bas; varying vec3 p; void main(){ float h = p.y; vec3 c = h > 0.0 ? mix(milieu, haut, smoothstep(0.0, 0.6, h)) : mix(milieu, bas, smoothstep(0.0, 0.35, -h)); gl_FragColor = vec4(c, 1.0); }',
}));
vitrine.add(ciel);
vitrine.background = null;
const projecteurs = [0xff8a3d, 0x3dc8ff, 0xff4fa3].map((c, i) => {
  const l = new THREE.PointLight(c, 0.4, 1.6); // projecteurs colorés discrets (ils brûlaient la toupie et rosissaient le plateau)
  l.userData.phase = (i / 3) * Math.PI * 2;
  vitrine.add(l);
  return l;
});
const poussieres = [];
const poussiereGeo = new THREE.SphereGeometry(1, 6, 4);
for (let i = 0; i < 70; i++) {
  const m = new THREE.Mesh(poussiereGeo, new THREE.MeshBasicMaterial({ color: [0xffd28a, 0x9fe0ff, 0xffa6d2][i % 3], transparent: true, opacity: 0.6, blending: THREE.AdditiveBlending, depthWrite: false }));
  m.scale.setScalar(0.002 + Math.random() * 0.004);
  m.position.set((Math.random() - 0.5) * 1.6, Math.random() * 0.8 - 0.1, (Math.random() - 0.5) * 1.2 - 0.2);
  m.userData.v = 0.01 + Math.random() * 0.03;
  vitrine.add(m);
  poussieres.push(m);
}
function majDecor(dt, t) {
  for (const l of projecteurs) {
    const a = t * 0.4 + l.userData.phase;
    l.position.set(Math.cos(a) * 0.45, 0.25 + Math.sin(t * 0.7 + l.userData.phase) * 0.08, Math.sin(a) * 0.45);
  }
  for (const m of poussieres) {
    m.position.y += m.userData.v * dt;
    m.position.x += Math.sin(t + m.userData.v * 100) * 0.002 * dt;
    if (m.position.y > 0.7) m.position.y = -0.1;
  }
}

// ---------------------------------------------------------------- Contrôles : glisser = pivoter, molette / pincement = zoomer
const vue = { yaw: 0, pitch: 0, zoom: 1, actif: false };
const doigts = new Map();
export function controlesActifs(oui) { vue.actif = oui; }
export function initControles(canvas) {
  canvas.addEventListener('pointerdown', e => { if (vue.actif) doigts.set(e.pointerId, { x: e.clientX, y: e.clientY }); });
  canvas.addEventListener('pointermove', e => {
    const a = doigts.get(e.pointerId);
    if (!a || !vue.actif) return;
    if (doigts.size === 2) {
      const [p1, p2] = [...doigts.values()], d0 = Math.hypot(p1.x - p2.x, p1.y - p2.y);
      a.x = e.clientX; a.y = e.clientY;
      const [q1, q2] = [...doigts.values()];
      vue.zoom = Math.max(0.45, Math.min(2.2, vue.zoom * Math.hypot(q1.x - q2.x, q1.y - q2.y) / Math.max(1, d0)));
      return;
    }
    vue.yaw -= (e.clientX - a.x) * 0.008;
    vue.pitch = Math.max(-0.5, Math.min(0.9, vue.pitch + (e.clientY - a.y) * 0.006));
    a.x = e.clientX; a.y = e.clientY;
  });
  const lacher = e => doigts.delete(e.pointerId);
  canvas.addEventListener('pointerup', lacher);
  canvas.addEventListener('pointercancel', lacher);
  canvas.addEventListener('wheel', e => { if (!vue.actif) return; e.preventDefault(); vue.zoom = Math.max(0.45, Math.min(2.2, vue.zoom * Math.exp(e.deltaY * 0.0012))); }, { passive: false });
}

// ---------------------------------------------------------------- Mini-arène (couleur du rebord = terrain choisi)
const bois = new THREE.MeshStandardMaterial({ color: 0x7a4e2b, roughness: 0.72, envMapIntensity: 0.35 }); // bois mat : il ne renvoie plus tout le studio (plateau saturé)
const arene = new THREE.Group();
const disque = new THREE.Mesh(new THREE.CylinderGeometry(R, R * 1.02, 0.016, 64), bois);
disque.position.y = -0.008; disque.receiveShadow = true;
const rebordMat = new THREE.MeshStandardMaterial({ color: 0x3b2516, roughness: 0.5 });
const rebord = new THREE.Mesh(new THREE.TorusGeometry(R + 0.006, 0.008, 12, 96), rebordMat);
rebord.rotation.x = Math.PI / 2; rebord.position.y = 0.002;
const anneaux = new THREE.Group();
for (const r of [0.05, 0.1, 0.15]) {
  const a = new THREE.Mesh(new THREE.RingGeometry(r - 0.002, r, 64), new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.25, depthWrite: false }));
  a.rotation.x = -Math.PI / 2; a.position.y = 0.0005;
  anneaux.add(a);
}
// Terrain rebondissant : arène carrée (comme en duel, voir scene.js), 4 bandes droites
const carre = new THREE.Group();
{
  const p = new THREE.Mesh(new THREE.BoxGeometry(2 * R, 0.016, 2 * R), bois);
  p.position.y = -0.008; p.receiveShadow = true; carre.add(p);
  for (let k = 0; k < 4; k++) {
    const a = (k * Math.PI) / 2, b = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 2 * R + 0.028, 12), rebordMat);
    b.rotation.z = Math.PI / 2; b.rotation.y = -a + Math.PI / 2;
    b.position.set(Math.cos(a) * (R + 0.006), 0.002, Math.sin(a) * (R + 0.006));
    carre.add(b);
  }
  carre.visible = false;
}
arene.add(disque, rebord, anneaux, carre);
vitrine.add(arene);
// Cache l'ancien socle de la vitrine (remplacé par l'arène)
vitrine.children.forEach(o => { if (o.isMesh && o !== disque && o.geometry?.type === 'CylinderGeometry' && o.parent === vitrine) o.visible = false; });

export function terrainVitrine(id) {
  const c = id === 'rebond' ? [0x2f80ed, 0x0b3b8a] : id === 'collant' ? [0x7dbb3a, 0x1f3d05] : [0x3b2516, 0x000000];
  rebordMat.color.setHex(c[0]); rebordMat.emissive.setHex(c[1]);
  anneaux.visible = id === 'cuve';
  carre.visible = id === 'rebond'; disque.visible = rebord.visible = id !== 'rebond';
}

// ---------------------------------------------------------------- Modèles et vue éclatée
const ECHELLE_T = 1.5, ECHELLE_L = 1.7;
// Écartement de la vue éclatée (repère du modèle, en mètres) ; la pièce choisie sort encore plus
// Seule la pièce choisie sort (les autres restent montées) : elle se « dévisse » en tournant, avec un petit rebond.
// La toupie s'arrête face à la caméra (+z) pendant ce temps, donc z = vers le joueur.
// Vue éclatée DANS L'AXE de la toupie : toutes les pièces s'écartent verticalement, dans l'ordre pointe → base → couronne → âme.
// L'écart est petit entre pièces voisines, et grand de part et d'autre de la pièce choisie.
const ORDRE_T = ['pointe', 'base', 'couronne', 'ame'];
const ECART = 0.018, ECART_CHOISI = 0.05;
function eclatementAxe(choisi) {
  const i0 = ORDRE_T.indexOf(choisi), gap = i => (i === i0 || i + 1 === i0 ? ECART_CHOISI : ECART); // écart entre i et i+1
  const y = { base: 0 };
  y.pointe = -gap(0);
  y.couronne = gap(1);
  y.ame = gap(1) + gap(2);
  return y;
}
// Lanceur éclaté : chaque pièce sort selon SON axe.
// - axe vertical (axe de rotation de l'engrenage) : corps → engrenage, vers le bas ;
// - axe du lanceur (z) : corps → ressort → poignée, vers l'arrière.
// Petit écart entre voisines, grand écart de part et d'autre de la pièce choisie.
const ECART_L = 0.02, ECART_L_CHOISI = 0.055;
// Le manche fait 7,5 cm (de z = 0 à z = 0,075) : choisi, le ressort glisse ENTIÈREMENT hors du manche, par l'arrière,
// et la poignée s'écarte encore plus loin pour le laisser passer.
const MANCHE = 0.075;
function eclatementAxeL(choisi) {
  const g = (a, b) => (a === choisi || b === choisi ? ECART_L_CHOISI : ECART_L);
  const yEng = -g('corps', 'engrenage');
  const zRes = choisi === 'ressort' ? MANCHE + 0.04 : g('corps', 'ressort') * 0.4; // il sort entièrement du manche
  return {
    corps: [0, 0, 0],
    engrenage: [0, yEng, 0],
    ressort: [0, 0, zRes],
  };
}

const etat = { onglet: 'toupie', slot: null, toupie: null, lanceur: null, rebond: 0, rotation: 0 };
const decal = {}; // décalages actuels, par pièce (pour garder la vue éclatée quand on reconstruit un modèle)

// Ne reconstruit QUE le modèle concerné par la pièce changée, et reprend exactement l'état de l'ancien
// (pose, hauteur, rotation, vue éclatée, vitesses) : changer de pièce ne relance pas l'animation de démontage.
const SLOTS_LANCEUR = ['engrenage', 'ressort'];
function reprendreEtat(ancien, nouveau, objets) {
  if (!ancien) return;
  for (const k of objets) if (ancien[k] && nouveau[k]) {
    nouveau[k].position.copy(ancien[k].position); nouveau[k].rotation.copy(ancien[k].rotation); nouveau[k].scale.copy(ancien[k].scale);
  }
  for (const [k, p] of Object.entries(nouveau.parts)) {
    const q = ancien.parts[k];
    if (!q) continue;
    if (q.userData.vit) p.userData.vit = q.userData.vit.clone();
    p.scale.copy(q.scale); p.rotation.copy(q.rotation);
  }
}
export function majModeles(equipe, slotChange = null, nivPieces = {}) {
  if (slotChange === 'terrain') return;
  const refaireT = !slotChange || !SLOTS_LANCEUR.includes(slotChange);
  const refaireL = !slotChange || SLOTS_LANCEUR.includes(slotChange);
  if (refaireT) {
    const ancien = etat.toupie;
    etat.toupie = creerToupie(equipe, nivPieces);
    etat.toupie.racine.scale.setScalar(ECHELLE_T);
    etat.toupie.racine.position.y = 0.003;
    reprendreEtat(ancien, etat.toupie, ['racine', 'inclinaison', 'rotor']);
    for (const [k, p] of Object.entries(etat.toupie.parts)) if (decal['t' + k]) p.position.copy(decal['t' + k]);
    if (ancien) libererToupie(ancien);
    supportVitrine.add(etat.toupie.racine);
  }
  if (refaireL) {
    const ancien = etat.lanceur;
    etat.lanceur = creerLanceur(equipe);
    etat.lanceur.racine.scale.setScalar(ECHELLE_L);
    etat.lanceur.racine.position.set(0, 0, 0.02);
    reprendreEtat(ancien, etat.lanceur, ['racine']);
    // Les pièces du lanceur ont une position de montage (engrenage) : l'éclaté s'AJOUTE à cette position
    for (const [k, p] of Object.entries(etat.lanceur.parts)) {
      p.userData.base = p.position.clone();
      if (decal['l' + k]) p.position.add(decal['l' + k]);
    }
    if (ancien) libererLanceur(ancien);
    supportVitrine.add(etat.lanceur.racine);
  }
  if (slotChange) etat.rebond = 1; // la pièce changée « saute »
  etat.slotChange = slotChange;
  appliquerVisibilite();
}

function appliquerVisibilite() {
  // « ensemble » (aperçu d'un build) : la toupie ET le lanceur, côte à côte sur le bureau
  etat.toupie.racine.visible = etat.onglet !== 'lanceur';
  etat.lanceur.racine.visible = etat.onglet === 'lanceur' || etat.onglet === 'ensemble';
}

export function selection(onglet, slot) {
  etat.onglet = onglet; etat.slot = slot;
  appliquerVisibilite();
}

// ---------------------------------------------------------------- Animation et caméra
const camPos = new THREE.Vector3(0, 0.12, 0.42), camCible = new THREE.Vector3(0, 0.04, 0);
const v = new THREE.Vector3();
// La caméra vise entre la pièce choisie et le centre de l'objet : la pièce est au centre de l'écran,
// mais on garde toute la vue éclatée autour
const boiteVisee = new THREE.Box3();
function cibleDe(parts, slot, echelle, decalVue, centre, versCentre = 0.15) {
  boiteVisee.setFromObject(parts[slot]).getCenter(v); // le vrai centre de la pièce, pas l'origine de son groupe
  const cible = v.clone().lerp(centre, versCentre);
  return { cible, pos: cible.clone().add(new THREE.Vector3(...decalVue).multiplyScalar(echelle / 1.5)) };
}

// Lanceur éclaté : on vise le milieu de tout l'ensemble (un peu tiré vers la pièce choisie)
// et on recule assez pour qu'il tienne en largeur dans la zone libre entre les deux panneaux
const boiteL = new THREE.Box3(), tailleL = new THREE.Vector3(), DIR_L = new THREE.Vector3(0.02, 0.3, 1).normalize();
function cadrerLanceur(L, slot) {
  boiteL.setFromObject(L.racine);
  const centre = boiteL.getCenter(new THREE.Vector3());
  boiteL.getSize(tailleL);
  boiteVisee.setFromObject(L.parts[slot]).getCenter(v);
  const cible = centre.lerp(v, 0.25);
  const demi = Math.tan(THREE.MathUtils.degToRad(vitrineCam.fov / 2));
  const dLarg = (tailleL.x * 0.56) / (demi * vitrineCam.aspect * zoneLibre.part);
  const dHaut = (tailleL.y * 0.75) / demi;
  return { cible, pos: cible.clone().addScaledVector(DIR_L, Math.max(dLarg, dHaut, 0.12)) };
}

// Zone libre entre le panneau des stats (gauche) et celui des pièces (droite) : on y centre la 3D
const zoneLibre = { part: 0.5, minuteur: 0 };
function majZoneLibre(dt) {
  if ((zoneLibre.minuteur -= dt) > 0) return;
  zoneLibre.minuteur = 0.3;
  const w = innerWidth, h = innerHeight;
  const g = document.querySelector('#atelier .gauche')?.getBoundingClientRect();
  const d = document.querySelector('#atelier .cote')?.getBoundingClientRect();
  if (w <= 720 || !g?.width || !d?.width || d.left <= g.right) return; // portrait : réglage de scene.js
  zoneLibre.part = (d.left - g.right) / w;
  const decalage = w / 2 - (g.right + d.left) / 2;
  if (Math.abs(decalage - (zoneLibre.decalage ?? NaN)) > 1 || zoneLibre.w !== w) {
    zoneLibre.decalage = decalage; zoneLibre.w = w;
    vitrineCam.setViewOffset(w, h, decalage, 0, w, h);
    vitrineCam.updateProjectionMatrix();
  }
}

export function majAtelier(dt, t) {
  majZoneLibre(dt);
  const T = etat.toupie, L = etat.lanceur;
  if (!T || !L) return;
  const k = 1 - Math.exp(-8 * dt);
  const eclateT = etat.onglet === 'toupie' && etat.slot, eclateL = etat.onglet === 'lanceur' && etat.slot;
  // Toupie : vue éclatée et pièce sortie
  for (const [nom, p] of Object.entries(T.parts)) {
    const cible = new THREE.Vector3(0, eclateT ? eclatementAxe(etat.slot)[nom] : 0, 0);
    // Ressort amorti : mouvement mécanique avec un léger dépassement
    const vit = p.userData.vit ||= new THREE.Vector3();
    vit.add(cible.clone().sub(p.position).multiplyScalar(70 * dt)).multiplyScalar(Math.exp(-10 * dt));
    p.position.addScaledVector(vit, dt * 1.0);
    p.rotation.y = p.position.length() * 45; // elle se dévisse en sortant
    decal['t' + nom] = p.position.clone();
    const sc = (eclateT && nom === etat.slot ? 1.15 : 1) * (etat.slotChange === nom ? 1 + 0.35 * Math.sin(etat.rebond * Math.PI) : 1);
    p.scale.setScalar(p.scale.x + (sc - p.scale.x) * k);
  }
  // Lanceur
  for (const [nom, p] of Object.entries(L.parts)) {
    // Lanceur : seule la pièce choisie sort, avec le même mouvement à ressort
    const base = p.userData.base ||= p.position.clone();
    const cible = new THREE.Vector3(...(eclateL ? eclatementAxeL(etat.slot)[nom] : [0, 0, 0])).add(base);
    const vit = p.userData.vit ||= new THREE.Vector3();
    vit.add(cible.clone().sub(p.position).multiplyScalar(70 * dt)).multiplyScalar(Math.exp(-10 * dt));
    p.position.addScaledVector(vit, dt);
    decal['l' + nom] = p.position.clone().sub(base);
  }
  // L'engrenage se redresse pour qu'on voie ses dents ; il tourne toujours un peu
  const eng = L.parts.engrenage;
  eng.rotation.x += (0 - eng.rotation.x) * k; // l'engrenage reste dans l'axe
  if (!eclateL) tournerEngrenages(L, dt * 0.4); // l'engrenage entraîne le pignon du pied ; éclaté, tout s'arrête
  etat.rebond = Math.max(0, etat.rebond - dt * 2.2);
  if (!etat.rebond) etat.slotChange = null;

  // La toupie tourne (plus lentement quand elle est éclatée, pour qu'on voie bien les pièces)
  // Éclatée, la toupie s'arrête face à la caméra ; sinon elle tourne
  T.rotor.rotation.y += dt * (eclateT ? 0.4 : 2.2); // éclatée, elle tourne lentement sur son axe
  // Éclatée, la toupie flotte plus haut : toutes ses pièces restent au-dessus de l'arène
  T.racine.position.y += ((eclateT ? 0.09 : 0.003 + Math.sin(t * 1.5) * 0.003) - T.racine.position.y) * k;
  // Le lanceur pivote doucement sur lui-même (vue 3D), s'arrête de trois quarts quand on regarde une pièce
  if (eclateL) L.racine.rotation.y += (-Math.PI / 2 - L.racine.rotation.y) * k; // de profil : l'axe traverse l'écran
  else L.racine.rotation.y += dt * 0.35;
  L.racine.position.y += ((eclateL ? 0.15 : 0) - L.racine.position.y) * k; // surélevé : rien ne rentre dans le sol
  const ens = etat.onglet === 'ensemble';
  T.racine.position.x += ((ens ? -0.075 : 0) - T.racine.position.x) * k;
  L.racine.position.x += ((ens ? 0.1 : 0) - L.racine.position.x) * k;

  // Caméra : vue d'ensemble, zoom sur la pièce choisie, ou vue large de l'arène (onglet Terrain)
  let pos, cible;
  majMagasin(dt, t, etat.onglet === 'boutique');
  majOuverture(dt, t);
  if (etat.onglet === 'ouverture') ({ pos, cible } = vueOuverture()); // vue plongeante sur la table d'ouverture
  else if (etat.onglet === 'boutique') ({ pos, cible } = vueBoutique()); // la caméra glisse jusqu'au comptoir de la boutique
  else if (etat.onglet === 'terrain') { pos = new THREE.Vector3(0, 0.34, 0.38); cible = new THREE.Vector3(0, 0, 0); }
  // Zoom : la pièce choisie au centre, mais assez de recul pour voir toute la vue éclatée
  else if (eclateT) ({ pos, cible } = cibleDe(T.parts, etat.slot, ECHELLE_T, [0.05, 0.05, 0.32], new THREE.Vector3(0, T.racine.position.y + 0.02, 0)));
  else if (eclateL) ({ pos, cible } = cadrerLanceur(L, etat.slot)); // tout le lanceur éclaté tient entre les panneaux
  else if (etat.onglet === 'ensemble') { pos = new THREE.Vector3(0.02, 0.24, 0.66); cible = new THREE.Vector3(0.015, 0.035, 0); }
  else if (etat.onglet === 'lanceur') { pos = new THREE.Vector3(0.26, 0.36, 0.8); cible = new THREE.Vector3(0, 0.07, 0); }
  else { pos = new THREE.Vector3(0, 0.12, 0.42); cible = new THREE.Vector3(0, 0.045, 0); }
  const kc = 1 - Math.exp(-4 * dt);
  camPos.lerp(pos, kc); camCible.lerp(cible, kc);
  // Pivot et zoom choisis par le joueur, autour du point visé
  const rel = camPos.clone().sub(camCible).multiplyScalar(vue.zoom);
  rel.applyAxisAngle(new THREE.Vector3(0, 1, 0), vue.yaw);
  const axe = new THREE.Vector3(rel.z, 0, -rel.x).normalize();
  if (axe.lengthSq()) rel.applyAxisAngle(axe, -vue.pitch * 0.6);
  vitrineCam.position.copy(camCible).add(rel);
  vitrineCam.lookAt(camCible);
  majDecor(dt, t);
}
