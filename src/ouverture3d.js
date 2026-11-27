// Ouverture des boîtes EN 3D : vue plongeante inclinée sur une table, 1 ou 5 boîtes ouvertes ENSEMBLE.
// Chaque clic ouvre un peu plus : 1 le scellé saute, 2 le couvercle s'entrouvre, 3 il s'ouvre et la lumière (couleur de la
// rareté) s'échappe, 4 la VRAIE pièce 3D sort de sa boîte en tournant et brille. Ensuite, le récapitulatif des lots.
import * as THREE from 'three';
import { vitrine } from './scene.js';
import { texture } from './magasin3d.js';
import { creerPieceToupie } from './topMesh.js';
import { creerPieceLanceur } from './lanceurMesh.js';
import { RARETES, tirerBoite, GARANTIE_LEGENDAIRE } from './data/pieces.js';

export const POSITION_OUVERTURE = new THREE.Vector3(-1.6, 0, 0.2);
const scene = new THREE.Group();
scene.position.copy(POSITION_OUVERTURE);
scene.visible = false;
vitrine.add(scene);
// Table et lumière
const table = new THREE.Mesh(new THREE.CylinderGeometry(0.42, 0.44, 0.04, 48), new THREE.MeshStandardMaterial({ color: 0x3a2a4f, roughness: 0.5, metalness: 0.2 }));
table.position.y = -0.02; table.receiveShadow = true; scene.add(table);
const spot = new THREE.SpotLight(0xfff1dc, 2.2, 1.6, 0.7, 0.6); spot.position.set(0, 0.9, 0.3); spot.target = table; scene.add(spot);

const PRODUIT_BOITE = { pieces: 1, prix: '' };
const etat = { boites: [], etape: 0, t: 0, actif: false };

// Une boîte : corps ouvert en haut + couvercle à charnière + scellé + lumière intérieure + pièce cachée dedans
function creerBoite(lot) {
  const L = 0.09, H = 0.11, P = 0.06;
  const g = new THREE.Group();
  const face = new THREE.MeshStandardMaterial({ map: texture({ pieces: 1, prix: '?' }, 256, Math.round(256 * H / L), 'face'), roughness: 0.45 });
  const cote = new THREE.MeshStandardMaterial({ map: texture(PRODUIT_BOITE, 128, 256, 'cote'), roughness: 0.45 });
  const dessous = new THREE.MeshStandardMaterial({ color: 0x1b1464 });
  const ep = 0.003;
  const paroi = (w, h, d, x, y, z, mat) => { const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat); m.position.set(x, y, z); m.castShadow = true; g.add(m); return m; };
  paroi(L, H, ep, 0, H / 2, P / 2, face);                // avant (illustrée)
  paroi(L, H, ep, 0, H / 2, -P / 2, cote);               // arrière
  paroi(ep, H, P, -L / 2, H / 2, 0, cote);               // gauche
  paroi(ep, H, P, L / 2, H / 2, 0, cote);                // droite
  paroi(L, ep, P, 0, ep / 2, 0, dessous);                // fond
  // Couvercle : charnière sur l'arête arrière du haut
  const charniere = new THREE.Group(); charniere.position.set(0, H, -P / 2); g.add(charniere);
  const couvercle = new THREE.Mesh(new THREE.BoxGeometry(L + 0.004, 0.004, P + 0.004),
    [cote, cote, new THREE.MeshStandardMaterial({ map: texture(PRODUIT_BOITE, 256, 180, 'dessus'), roughness: 0.4 }), dessous, cote, cote]);
  couvercle.position.set(0, 0.002, P / 2); couvercle.castShadow = true; charniere.add(couvercle);
  // Scellé rouge en travers
  const scelle = new THREE.Mesh(new THREE.BoxGeometry(0.014, 0.006, P + 0.01), new THREE.MeshStandardMaterial({ color: 0xe63946, roughness: 0.4 }));
  scelle.position.set(0, H + 0.003, 0); g.add(scelle);
  // Lumière intérieure (couleur de la rareté) et halo
  const r = RARETES[lot.rarete] || RARETES.commune, coul = new THREE.Color(r.couleur);
  const lumiere = new THREE.PointLight(coul, 0, 0.5); lumiere.position.set(0, H * 0.8, 0); g.add(lumiere);
  const halo = new THREE.Sprite(new THREE.SpriteMaterial({ map: textureHalo(), color: coul, transparent: true, opacity: 0, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.scale.setScalar(0.12); halo.position.set(0, H + 0.03, 0); g.add(halo);
  // La pièce, cachée au fond de la boîte
  const piece = modeleLot(lot, coul);
  piece.position.set(0, H * 0.35, 0); piece.visible = false; g.add(piece);
  return { g, charniere, scelle, lumiere, halo, piece, H, lot, sortie: 0 };
}
let texHalo = null;
function textureHalo() {
  if (texHalo) return texHalo;
  const c = document.createElement('canvas'); c.width = c.height = 128;
  const x = c.getContext('2d'), d = x.createRadialGradient(64, 64, 0, 64, 64, 64);
  d.addColorStop(0, 'rgba(255,255,255,1)'); d.addColorStop(0.3, 'rgba(255,255,255,.5)'); d.addColorStop(1, 'rgba(255,255,255,0)');
  x.fillStyle = d; x.fillRect(0, 0, 128, 128);
  return (texHalo = new THREE.CanvasTexture(c));
}
// Le vrai modèle 3D du lot (pièce de toupie ou de lanceur) ; terrain et coffre : un objet simple qui les évoque
function modeleLot(lot, coul) {
  let m;
  if (lot.type === 'piece') m = lot.piece.slot === 'engrenage' || lot.piece.slot === 'ressort' ? creerPieceLanceur(lot.piece.id) : creerPieceToupie(lot.piece.id);
  else if (lot.type === 'terrain') { m = new THREE.Mesh(new THREE.CylinderGeometry(0.05, 0.05, 0.008, 40), new THREE.MeshStandardMaterial({ color: 0xd9a35b, roughness: 0.5 })); const bord = new THREE.Mesh(new THREE.TorusGeometry(0.05, 0.005, 8, 40), new THREE.MeshStandardMaterial({ color: coul, emissive: coul, emissiveIntensity: 0.6 })); bord.rotation.x = Math.PI / 2; m.add(bord); }
  else { m = new THREE.Mesh(new THREE.BoxGeometry(0.06, 0.04, 0.04), new THREE.MeshStandardMaterial({ color: 0xffc531, metalness: 0.9, roughness: 0.25, emissive: 0x6b4a00, emissiveIntensity: 0.4 })); }
  // Mise à l'échelle : la pièce tient dans ~6 cm
  const b = new THREE.Box3().setFromObject(m), t = b.getSize(new THREE.Vector3()), c = b.getCenter(new THREE.Vector3());
  m.position.sub(c);
  const g = new THREE.Group(); g.add(m); g.scale.setScalar(0.06 / Math.max(t.x, t.y, t.z, 0.001));
  g.traverse(o => { if (o.isMesh) o.castShadow = true; });
  return g;
}

// Tire les lots (sauvegarde mise à jour) et installe les boîtes sur la table
export function demarrerOuverture(save, n) {
  for (const b of etat.boites) b.g.removeFromParent();
  etat.boites = [];
  const lots = [];
  for (let i = 0; i < n && save.boites > 0; i++) {
    save.boites--;
    const lot = tirerBoite(save.terrains, { garantie: save.boitesSansLegendaire >= GARANTIE_LEGENDAIRE - 1 });
    save.boitesSansLegendaire = lot.rarete === 'legendaire' ? 0 : save.boitesSansLegendaire + 1;
    if (lot.type === 'piece') { lot.neuve = !save.collection[lot.piece.id]; save.collection[lot.piece.id] = (save.collection[lot.piece.id] || 0) + 1; lot.exemplaires = save.collection[lot.piece.id]; }
    if (lot.type === 'terrain') save.terrains.push(lot.terrain.id);
    if (lot.type === 'coffre') save.ecrous += lot.coffre.ecrous;
    lots.push(lot);
  }
  lots.forEach((lot, i) => {
    const b = creerBoite(lot), k = lots.length, a = k === 1 ? 0 : (i / (k - 1) - 0.5);
    b.g.position.set(a * 0.42, 0, Math.abs(a) * 0.12 - 0.03); // en arc de cercle, face à la caméra
    b.g.rotation.y = -a * 0.6;
    scene.add(b.g);
    etat.boites.push(b);
  });
  Object.assign(etat, { etape: 0, t: 0, actif: true });
  scene.visible = true;
  return lots;
}
// Un clic : toutes les boîtes s'ouvrent un peu plus. Renvoie l'étape atteinte (4 = pièces sorties)
export function cliquerOuverture() {
  if (!etat.actif || etat.etape >= 4) return etat.etape;
  etat.etape++; etat.secousse = 1;
  if (etat.etape === 4) for (const b of etat.boites) b.piece.visible = true;
  return etat.etape;
}
// Une fois sorties, on fait pivoter les pièces en glissant (toutes ensemble)
export function tournerPieces(dx, dy) {
  if (etat.etape < 4) return;
  etat.manuel = 2.5; // la rotation automatique se met en pause un instant
  for (const b of etat.boites) { b.piece.rotation.y += dx * 0.012; b.piece.rotation.x = Math.max(-1.2, Math.min(1.2, b.piece.rotation.x + dy * 0.012)); }
}
export function finirOuverture() { etat.actif = false; scene.visible = false; for (const b of etat.boites) b.g.removeFromParent(); etat.boites = []; }

const ANGLE = [0, 0, -0.7, -1.9, -2.6]; // ouverture du couvercle à chaque étape
export function majOuverture(dt, t) {
  if (!scene.visible) return;
  const k = 1 - Math.exp(-7 * dt);
  etat.secousse = Math.max(0, (etat.secousse || 0) - dt * 3);
  etat.manuel = Math.max(0, (etat.manuel || 0) - dt);
  for (const [i, b] of etat.boites.entries()) {
    b.g.rotation.z = Math.sin(t * 40 + i) * 0.04 * etat.secousse * (etat.etape < 4 ? 1 : 0);
    b.charniere.rotation.x += (ANGLE[etat.etape] - b.charniere.rotation.x) * k;
    b.scelle.visible = etat.etape < 1;
    const lum = etat.etape >= 3 ? (etat.etape === 4 ? 0.7 : 0.4) : 0;
    b.lumiere.intensity += (lum - b.lumiere.intensity) * k;
    b.halo.material.opacity += ((etat.etape >= 3 ? (etat.etape === 4 ? 0.45 : 0.3) : 0) - b.halo.material.opacity) * k;
    if (etat.etape === 4) { // la pièce monte hors de la boîte, tourne et pulse
      b.sortie = Math.min(1, b.sortie + dt * 1.2);
      const e = 1 - (1 - b.sortie) ** 3;
      b.piece.position.y = b.H * 0.35 + e * 0.14;
      if (!(etat.manuel > 0)) b.piece.rotation.y += dt * 1.2;
      b.halo.position.y = b.piece.position.y; b.halo.scale.setScalar(0.13 + Math.sin(t * 5) * 0.02);
    }
  }
}
// Caméra : vue plongeante inclinée sur la table
export const vueOuverture = () => ({
  pos: POSITION_OUVERTURE.clone().add(new THREE.Vector3(0, 0.55, 0.5)),
  cible: POSITION_OUVERTURE.clone().add(new THREE.Vector3(0, 0.06, 0)),
});
