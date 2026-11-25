// La vue 3D de l'atelier : une mini-arène ronde (le terrain de duel choisi) en fond, la toupie ou le lanceur dessus.
// Quand on choisit une pièce, l'objet s'ÉCLATE (toutes les pièces s'écartent) et la caméra ZOOME sur la pièce choisie,
// qui ressort un peu plus que les autres. On change de pièce : l'ancienne revient, la nouvelle sort.
import * as THREE from 'three';
import { vitrine, vitrineCam, supportVitrine } from './scene.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { creerLanceur, libererLanceur } from './lanceurMesh.js';

const R = 0.2; // rayon de la mini-arène

// ---------------------------------------------------------------- Mini-arène (couleur du rebord = terrain choisi)
const bois = new THREE.MeshStandardMaterial({ color: 0x8a5a32, roughness: 0.45 });
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
arene.add(disque, rebord, anneaux);
vitrine.add(arene);
// Cache l'ancien socle de la vitrine (remplacé par l'arène)
vitrine.children.forEach(o => { if (o.isMesh && o !== disque && o.geometry?.type === 'CylinderGeometry' && o.parent === vitrine) o.visible = false; });

export function terrainVitrine(id) {
  const c = id === 'rebond' ? [0x2f80ed, 0x0b3b8a] : id === 'collant' ? [0x7dbb3a, 0x1f3d05] : [0x3b2516, 0x000000];
  rebordMat.color.setHex(c[0]); rebordMat.emissive.setHex(c[1]);
  anneaux.visible = id === 'cuve';
}

// ---------------------------------------------------------------- Modèles et vue éclatée
const ECHELLE_T = 1.5, ECHELLE_L = 1.7;
// Écartement de la vue éclatée (repère du modèle, en mètres) ; la pièce choisie sort encore plus
const ECLATE_T = { pointe: [0, -0.03, 0], base: [0, 0, 0], couronne: [0, 0.022, 0], ame: [0, 0.048, 0] };
const SORTIE_T = { pointe: [0, -0.025, 0], base: [0, 0, 0], couronne: [0, 0.018, 0], ame: [0, 0.025, 0] };
const ECLATE_L = { plot: [0, -0.012, -0.02], corps: [0, 0, 0], engrenage: [0, -0.03, 0], ressort: [0, 0.035, 0], poignee: [0, 0, 0.035] };
const SORTIE_L = { engrenage: [0, -0.02, -0.02], ressort: [0, 0.025, 0.01] };

const etat = { onglet: 'toupie', slot: null, toupie: null, lanceur: null, rebond: 0, rotation: 0 };
const decal = {}; // décalages actuels, par pièce (pour garder la vue éclatée quand on reconstruit un modèle)

export function majModeles(equipe, slotChange = null) {
  if (etat.toupie) libererToupie(etat.toupie);
  if (etat.lanceur) libererLanceur(etat.lanceur);
  etat.toupie = creerToupie(equipe);
  etat.toupie.racine.scale.setScalar(ECHELLE_T);
  etat.toupie.racine.position.y = 0.003;
  etat.lanceur = creerLanceur(equipe);
  etat.lanceur.racine.scale.setScalar(ECHELLE_L);
  etat.lanceur.racine.position.set(0, 0, 0.02);
  supportVitrine.add(etat.toupie.racine, etat.lanceur.racine);
  for (const [k, p] of Object.entries(etat.toupie.parts)) if (decal['t' + k]) p.position.copy(decal['t' + k]);
  for (const [k, p] of Object.entries(etat.lanceur.parts)) if (decal['l' + k]) p.position.copy(decal['l' + k]);
  if (slotChange) etat.rebond = 1; // la pièce changée « saute »
  etat.slotChange = slotChange;
  appliquerVisibilite();
}

function appliquerVisibilite() {
  etat.toupie.racine.visible = etat.onglet !== 'lanceur';
  etat.lanceur.racine.visible = etat.onglet === 'lanceur';
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
function cibleDe(parts, slot, echelle, decalVue, centre) {
  parts[slot].getWorldPosition(v);
  const cible = v.clone().lerp(centre, 0.45);
  return { cible, pos: cible.clone().add(new THREE.Vector3(...decalVue).multiplyScalar(echelle / 1.5)) };
}

export function majAtelier(dt, t) {
  const T = etat.toupie, L = etat.lanceur;
  if (!T || !L) return;
  const k = 1 - Math.exp(-8 * dt);
  const eclateT = etat.onglet === 'toupie' && etat.slot, eclateL = etat.onglet === 'lanceur' && etat.slot;
  // Toupie : vue éclatée et pièce sortie
  for (const [nom, p] of Object.entries(T.parts)) {
    const cible = new THREE.Vector3(...(eclateT ? ECLATE_T[nom] : [0, 0, 0]));
    if (eclateT && nom === etat.slot) cible.add(new THREE.Vector3(...SORTIE_T[nom]));
    p.position.lerp(cible, k);
    decal['t' + nom] = p.position.clone();
    const sc = (eclateT && nom === etat.slot ? 1.15 : 1) * (etat.slotChange === nom ? 1 + 0.35 * Math.sin(etat.rebond * Math.PI) : 1);
    p.scale.setScalar(p.scale.x + (sc - p.scale.x) * k);
  }
  // Lanceur
  for (const [nom, p] of Object.entries(L.parts)) {
    const cible = new THREE.Vector3(...(eclateL ? ECLATE_L[nom] : [0, 0, 0]));
    if (eclateL && nom === etat.slot && SORTIE_L[nom]) cible.add(new THREE.Vector3(...SORTIE_L[nom]));
    p.position.lerp(cible, k);
    decal['l' + nom] = p.position.clone();
  }
  // L'engrenage se redresse pour qu'on voie ses dents ; il tourne toujours un peu
  const eng = L.parts.engrenage;
  eng.rotation.x += ((eclateL && etat.slot === 'engrenage' ? 1.1 : eclateL ? 0.5 : 0) - eng.rotation.x) * k;
  for (const r of eng.children) if (r.userData.roue) r.rotation.y += dt * (etat.slot === 'engrenage' ? 1.5 : 0.4);
  etat.rebond = Math.max(0, etat.rebond - dt * 2.2);
  if (!etat.rebond) etat.slotChange = null;

  // La toupie tourne (plus lentement quand elle est éclatée, pour qu'on voie bien les pièces)
  T.rotor.rotation.y += dt * (eclateT ? 0.5 : 2.2);
  // Éclatée, la toupie flotte plus haut : toutes ses pièces restent au-dessus de l'arène
  T.racine.position.y += ((eclateT ? 0.1 : 0.003 + Math.sin(t * 1.5) * 0.003) - T.racine.position.y) * k;
  // Le lanceur pivote doucement sur lui-même (vue 3D), s'arrête de trois quarts quand on regarde une pièce
  if (eclateL) L.racine.rotation.y += (-0.6 - L.racine.rotation.y) * k;
  else L.racine.rotation.y += dt * 0.35;
  L.racine.position.y += ((eclateL ? 0.07 : 0) - L.racine.position.y) * k;

  // Caméra : vue d'ensemble, zoom sur la pièce choisie, ou vue large de l'arène (onglet Terrain)
  let pos, cible;
  if (etat.onglet === 'terrain') { pos = new THREE.Vector3(0, 0.34, 0.38); cible = new THREE.Vector3(0, 0, 0); }
  // Zoom : la pièce choisie au centre, mais assez de recul pour voir toute la vue éclatée
  else if (eclateT) ({ pos, cible } = cibleDe(T.parts, etat.slot, ECHELLE_T, [0.07, 0.08, 0.36], new THREE.Vector3(0, T.racine.position.y + 0.02, 0)));
  else if (eclateL) ({ pos, cible } = cibleDe(L.parts, etat.slot, ECHELLE_L, etat.slot === 'engrenage' ? [0.1, 0.2, 0.36] : [0.18, 0.14, 0.36],
    new THREE.Vector3(0, L.racine.position.y + 0.08, 0.02)));
  else if (etat.onglet === 'lanceur') { pos = new THREE.Vector3(0.2, 0.3, 0.58); cible = new THREE.Vector3(0, 0.06, 0); }
  else { pos = new THREE.Vector3(0, 0.12, 0.42); cible = new THREE.Vector3(0, 0.045, 0); }
  const kc = 1 - Math.exp(-4 * dt);
  camPos.lerp(pos, kc); camCible.lerp(cible, kc);
  vitrineCam.position.copy(camPos);
  vitrineCam.lookAt(camCible);
}
