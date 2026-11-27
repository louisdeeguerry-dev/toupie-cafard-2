// La boutique en 3D : un comptoir à côté de la vitrine, avec deux produits qu'on clique pour les acheter.
// - un petit paquet (1 pièce mystère) ;
// - un gros carton (5 pièces mystère).
// Les emballages reprennent le style de la boîte mystère (couleurs vives, aucune marque).
import * as THREE from 'three';
import { vitrine } from './scene.js';

export const PRODUITS = {
  paquet: { id: 'paquet', nom: 'Petit paquet', pieces: 1, prix: 100, desc: '1 pièce mystère' },
  carton: { id: 'carton', nom: 'Gros carton', pieces: 5, prix: 450, desc: '5 pièces mystère (une gratuite !)' },
};
export const POSITION_BOUTIQUE = new THREE.Vector3(1.6, 0, -0.3);

// Une face d'emballage dessinée (dégradé, lignes de vitesse, toupie arc-en-ciel, titre, nombre de pièces, prix)
function texture(produit, largeur, hauteur, face = true) {
  const c = document.createElement('canvas'); c.width = largeur; c.height = hauteur;
  const g = c.getContext('2d');
  const fond = g.createLinearGradient(0, 0, largeur, hauteur);
  fond.addColorStop(0, '#1b1464'); fond.addColorStop(0.4, '#3a0ca3'); fond.addColorStop(0.7, '#7209b7'); fond.addColorStop(1, '#f72585');
  g.fillStyle = fond; g.fillRect(0, 0, largeur, hauteur);
  g.strokeStyle = 'rgba(255,255,255,.13)'; g.lineWidth = 6;
  for (let x = -hauteur; x < largeur; x += 26) { g.beginPath(); g.moveTo(x, hauteur); g.lineTo(x + hauteur * 0.45, 0); g.stroke(); }
  if (!face) return fin(c);
  // Toupie arc-en-ciel
  const cx = largeur / 2, cy = hauteur * 0.36, r = Math.min(largeur, hauteur) * 0.24;
  const cols = ['#ffd23f', '#ff7b00', '#e8005a', '#7209b7', '#00e5ff'];
  cols.forEach((col, i) => { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, (i / cols.length) * Math.PI * 2, ((i + 1) / cols.length) * Math.PI * 2); g.fillStyle = col; g.fill(); });
  g.beginPath(); g.arc(cx, cy, r * 0.45, 0, Math.PI * 2); g.fillStyle = '#2b2f36'; g.fill();
  g.fillStyle = '#fff'; g.font = `900 ${Math.round(r * 0.7)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText('?', cx, cy + 2);
  // Titre
  g.font = `900 ${Math.round(largeur * 0.12)}px sans-serif`;
  g.lineWidth = 8; g.strokeStyle = '#e8005a'; g.strokeText('TOUPIE CAFARD 2', cx, hauteur * 0.68);
  g.fillStyle = '#fff'; g.fillText('TOUPIE CAFARD 2', cx, hauteur * 0.68);
  g.fillStyle = '#ffe066'; g.font = `900 ${Math.round(largeur * 0.1)}px sans-serif`;
  g.fillText(produit.pieces > 1 ? `${produit.pieces} PIÈCES MYSTÈRE` : '1 PIÈCE MYSTÈRE', cx, hauteur * 0.8);
  // Pastille de prix
  g.beginPath(); g.arc(largeur * 0.82, hauteur * 0.12, largeur * 0.12, 0, Math.PI * 2); g.fillStyle = '#ffd23f'; g.fill();
  g.lineWidth = 6; g.strokeStyle = '#c1121f'; g.stroke();
  g.fillStyle = '#c1121f'; g.font = `900 ${Math.round(largeur * 0.06)}px sans-serif`; g.fillText(`${produit.prix} 🔩`, largeur * 0.82, hauteur * 0.12);
  if (produit.pieces > 1) { g.fillStyle = '#00e5ff'; g.font = `900 ${Math.round(largeur * 0.14)}px sans-serif`; g.fillText('×5', largeur * 0.16, hauteur * 0.12); }
  return fin(c);
}
function fin(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

function boite(produit, l, h, p) {
  const face = new THREE.MeshStandardMaterial({ map: texture(produit, 512, Math.round(512 * h / l)), roughness: 0.45, metalness: 0.05 });
  const cote = new THREE.MeshStandardMaterial({ map: texture(produit, 256, 256, false), roughness: 0.5 });
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), [cote, cote, cote, cote, face, cote]);
  m.castShadow = true;
  m.userData.produit = produit.id;
  return m;
}

const groupe = new THREE.Group();
groupe.position.copy(POSITION_BOUTIQUE);
vitrine.add(groupe);
// Comptoir en bois, mur du fond, enseigne lumineuse
const bois = new THREE.MeshStandardMaterial({ color: 0x8a5a33, roughness: 0.6 });
const comptoir = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.06, 0.26), bois);
comptoir.position.y = 0.03; comptoir.receiveShadow = true; comptoir.castShadow = true;
groupe.add(comptoir);
const mur = new THREE.Mesh(new THREE.PlaneGeometry(1.2, 0.7), new THREE.MeshStandardMaterial({ color: 0x2a1a3d, roughness: 0.9 }));
mur.position.set(0, 0.35, -0.2); groupe.add(mur);
const enseigne = (() => {
  const c = document.createElement('canvas'); c.width = 512; c.height = 128;
  const g = c.getContext('2d'); g.font = '900 78px sans-serif'; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.shadowColor = '#ff2bd6'; g.shadowBlur = 24; g.fillStyle = '#ffe3ff'; g.fillText('BOUTIQUE', 256, 66);
  return new THREE.Mesh(new THREE.PlaneGeometry(0.5, 0.125), new THREE.MeshBasicMaterial({ map: fin(c), transparent: true }));
})();
enseigne.position.set(0, 0.46, -0.19); groupe.add(enseigne);
const neon = new THREE.PointLight(0xff4fd8, 1.2, 1.2); neon.position.set(0, 0.42, 0.05); groupe.add(neon);
const spot = new THREE.SpotLight(0xfff1dc, 5, 1.4, 0.7, 0.5); spot.position.set(0.1, 0.6, 0.45); spot.target = comptoir; groupe.add(spot);

const produits = [boite(PRODUITS.paquet, 0.11, 0.15, 0.04), boite(PRODUITS.carton, 0.2, 0.24, 0.1)];
produits[0].position.set(-0.14, 0.06 + 0.075, 0);
produits[1].position.set(0.13, 0.06 + 0.12, -0.02);
produits.forEach(p => { p.userData.y0 = p.position.y; groupe.add(p); });

let survol = null;
export function majMagasin(dt, t, actif) {
  groupe.visible = actif || groupe.visible; // reste visible pendant le trajet de la caméra
  produits.forEach((p, i) => {
    const vise = survol === p;
    p.rotation.y += ((vise ? 0.35 : -0.25 + i * 0.4) - p.rotation.y) * (1 - Math.exp(-6 * dt));
    p.position.y = p.userData.y0 + (vise ? 0.015 + Math.sin(t * 4) * 0.004 : 0);
    const s = vise ? 1.08 : 1; p.scale.setScalar(p.scale.x + (s - p.scale.x) * (1 - Math.exp(-10 * dt)));
  });
}
// Caméra de la boutique : face au comptoir
export const vueBoutique = () => ({
  pos: POSITION_BOUTIQUE.clone().add(new THREE.Vector3(-0.1, 0.32, 1.0)), // un peu à gauche : le panneau de gauche ne cache pas le petit paquet
  cible: POSITION_BOUTIQUE.clone().add(new THREE.Vector3(-0.1, 0.18, 0)),
});
// Quel produit est sous le pointeur (coordonnées écran normalisées -1…1) ?
const ray = new THREE.Raycaster();
export function produitSous(ndc, camera) {
  ray.setFromCamera(ndc, camera);
  const h = ray.intersectObjects(produits, false)[0];
  survol = h ? h.object : null;
  return survol?.userData.produit || null;
}
