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

// Faces d'emballage dessinées, avec des marges : rien n'est coupé, le texte s'ajuste à la largeur
function fond(g, l, h) {
  const d = g.createLinearGradient(0, 0, l, h);
  d.addColorStop(0, '#1b1464'); d.addColorStop(0.4, '#3a0ca3'); d.addColorStop(0.7, '#7209b7'); d.addColorStop(1, '#f72585');
  g.fillStyle = d; g.fillRect(0, 0, l, h);
  const lueur = g.createRadialGradient(l * 0.7, h * 0.25, 0, l * 0.7, h * 0.25, l * 0.6);
  lueur.addColorStop(0, 'rgba(0,229,255,.45)'); lueur.addColorStop(1, 'rgba(0,229,255,0)');
  g.fillStyle = lueur; g.fillRect(0, 0, l, h);
  g.strokeStyle = 'rgba(255,255,255,.12)'; g.lineWidth = l * 0.012;
  for (let x = -h; x < l; x += l * 0.06) { g.beginPath(); g.moveTo(x, h); g.lineTo(x + h * 0.45, 0); g.stroke(); }
}
function texteAjuste(g, txt, x, y, largeurMax, taille, { remplir = '#fff', contour = null, epais = 0 } = {}) {
  let t = taille;
  g.font = `900 ${t}px sans-serif`;
  while (g.measureText(txt).width > largeurMax && t > 8) { t--; g.font = `900 ${t}px sans-serif`; }
  if (contour) { g.lineJoin = 'round'; g.lineWidth = epais || t * 0.18; g.strokeStyle = contour; g.strokeText(txt, x, y); }
  g.fillStyle = remplir; g.fillText(txt, x, y);
}
function cadre(g, l, h) { // liseré blanc intérieur, comme une boîte de jouet
  g.lineWidth = l * 0.025; g.strokeStyle = 'rgba(255,255,255,.55)';
  g.strokeRect(l * 0.03, l * 0.03, l - l * 0.06, h - l * 0.06);
}
function texture(produit, l, h, type = 'face') {
  const c = document.createElement('canvas'); c.width = l; c.height = h;
  const g = c.getContext('2d');
  fond(g, l, h);
  g.textAlign = 'center'; g.textBaseline = 'middle';
  const marge = l * 0.1, utile = l - 2 * marge, cx = l / 2;
  if (type === 'cote') { // bande verticale : « PIÈCE MYSTÈRE »
    g.save(); g.translate(cx, h / 2); g.rotate(-Math.PI / 2);
    texteAjuste(g, produit.pieces > 1 ? 'GROS CARTON · 5 PIÈCES' : 'PIÈCE MYSTÈRE', 0, 0, h * 0.86, l * 0.32, { remplir: '#ffe066', contour: '#3a0ca3' });
    g.restore(); cadre(g, l, h);
    return fin(c);
  }
  if (type === 'dessus') { cadre(g, l, h); return fin(c); }
  // Face avant
  cadre(g, l, h);
  const cy = h * 0.34, r = Math.min(utile * 0.42, h * 0.2);
  const cols = ['#ffd23f', '#ff7b00', '#e8005a', '#7209b7', '#00e5ff'];
  g.save(); g.shadowColor = 'rgba(0,229,255,.8)'; g.shadowBlur = r * 0.4;
  cols.forEach((col, i) => { g.beginPath(); g.moveTo(cx, cy); g.arc(cx, cy, r, (i / 5) * Math.PI * 2, ((i + 1) / 5) * Math.PI * 2); g.fillStyle = col; g.fill(); });
  g.restore();
  g.lineWidth = r * 0.1; g.strokeStyle = 'rgba(255,255,255,.6)'; g.setLineDash([r * 0.18, r * 0.12]);
  g.beginPath(); g.arc(cx, cy, r * 0.75, 0, Math.PI * 2); g.stroke(); g.setLineDash([]);
  g.beginPath(); g.arc(cx, cy, r * 0.4, 0, Math.PI * 2); g.fillStyle = '#2b2f36'; g.fill();
  texteAjuste(g, '?', cx, cy + r * 0.04, r * 0.6, r * 0.6);
  // Titre sur deux lignes, ajusté à la largeur utile
  texteAjuste(g, 'TOUPIE', cx, h * 0.63, utile, l * 0.2, { contour: '#e8005a' });
  texteAjuste(g, 'CAFARD 2', cx, h * 0.75, utile, l * 0.2, { contour: '#e8005a' });
  texteAjuste(g, produit.pieces > 1 ? '5 PIÈCES MYSTÈRE' : '1 PIÈCE MYSTÈRE', cx, h * 0.87, utile, l * 0.09, { remplir: '#ffe066' });
  // Pastille de prix (dans la marge, en haut à droite) : « 100 / ÉCROUS »
  const px = l - marge - l * 0.1, py = marge + l * 0.1, pr = l * 0.12;
  g.beginPath(); g.arc(px, py, pr, 0, Math.PI * 2); g.fillStyle = '#ffd23f'; g.fill();
  g.lineWidth = pr * 0.14; g.strokeStyle = '#c1121f'; g.stroke();
  texteAjuste(g, String(produit.prix), px, py - pr * 0.18, pr * 1.6, pr * 0.62, { remplir: '#c1121f' });
  texteAjuste(g, 'ÉCROUS', px, py + pr * 0.42, pr * 1.5, pr * 0.3, { remplir: '#c1121f' });
  if (produit.pieces > 1) texteAjuste(g, '×5', marge + l * 0.1, marge + l * 0.1, l * 0.25, l * 0.16, { remplir: '#00e5ff', contour: '#1b1464' });
  return fin(c);
}
function fin(c) { const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 4; return t; }

function boite(produit, l, h, p) {
  // Chaque face a sa propre texture, aux bonnes proportions (rien n'est étiré ni coupé)
  const mat = map => new THREE.MeshStandardMaterial({ map, roughness: 0.42, metalness: 0.05 });
  const face = mat(texture(produit, 512, Math.round(512 * h / l), 'face'));
  const cote = mat(texture(produit, Math.max(64, Math.round(512 * p / h)), 512, 'cote'));
  const dessus = mat(texture(produit, 256, Math.round(256 * p / l), 'dessus'));
  // Ordre des faces d'une BoxGeometry : +x, −x, +y, −y, +z (avant), −z
  const m = new THREE.Mesh(new THREE.BoxGeometry(l, h, p), [cote, cote, dessus, dessus, face, face]);
  m.castShadow = true;
  m.userData.produit = produit.id;
  // Carte de présentation trouée au-dessus (comme en magasin)
  const carte = new THREE.Mesh(new THREE.BoxGeometry(l * 0.7, h * 0.16, 0.004), new THREE.MeshStandardMaterial({ color: 0xff8a1f, roughness: 0.5 }));
  carte.position.set(0, h / 2 + h * 0.07, 0);
  const trou = new THREE.Mesh(new THREE.CylinderGeometry(l * 0.06, l * 0.06, 0.006, 16), new THREE.MeshBasicMaterial({ color: 0x14100c }));
  trou.rotation.x = Math.PI / 2; trou.scale.set(2.2, 1, 0.8); trou.position.set(0, h / 2 + h * 0.1, 0);
  m.add(carte, trou);
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
