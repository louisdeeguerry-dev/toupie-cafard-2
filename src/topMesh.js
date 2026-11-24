// Fabrique le modèle 3D d'une toupie à partir de ses 4 pièces. Tout est dessiné en code (comme le jeu 1).
import * as THREE from 'three';
import { PIECE } from './data/pieces.js';

const mat = (couleur, o = {}) => new THREE.MeshStandardMaterial({ color: couleur, roughness: 0.35, metalness: 0.55, ...o });

function pointe(p) {
  const g = new THREE.Group(), m = mat(p.couleur);
  let h = 0.018;
  switch (p.forme) {
    case 'clou': {
      h = 0.022;
      const tige = new THREE.Mesh(new THREE.CylinderGeometry(0.0035, 0.0035, 0.016, 12), m);
      tige.position.y = 0.012;
      const bout = new THREE.Mesh(new THREE.ConeGeometry(0.0035, 0.006, 12), m);
      bout.rotation.x = Math.PI; bout.position.y = 0.003;
      const tete = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.009, 0.002, 20), m);
      tete.position.y = 0.021;
      g.add(tige, bout, tete);
      break;
    }
    case 'foreuse': {
      const cone = new THREE.Mesh(new THREE.ConeGeometry(0.016, 0.018, 24), m);
      cone.rotation.x = Math.PI; cone.position.y = 0.009;
      g.add(cone);
      for (let i = 0; i < 4; i++) { // filets de la foreuse
        const r = 0.004 + i * 0.003;
        const t = new THREE.Mesh(new THREE.TorusGeometry(r, 0.0012, 6, 20), mat(0x6e5206));
        t.rotation.x = Math.PI / 2; t.position.y = 0.003 + i * 0.004;
        g.add(t);
      }
      break;
    }
    case 'diamant': {
      const d = new THREE.Mesh(new THREE.OctahedronGeometry(0.008, 0), mat(p.couleur, { metalness: 0.2, roughness: 0.05, emissive: 0x2a5a6a, emissiveIntensity: 0.4 }));
      d.scale.y = 1.3; d.position.y = 0.0104;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.006, 20), mat(0xd4af37));
      col.position.y = 0.017;
      g.add(d, col);
      h = 0.02;
      break;
    }
    case 'bille': {
      const b = new THREE.Mesh(new THREE.SphereGeometry(0.007, 20, 14), mat(p.couleur, { metalness: 0.9, roughness: 0.1 }));
      b.position.y = 0.007;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.009, 0.006, 0.01, 20), mat(0x7f8c8d));
      col.position.y = 0.014;
      g.add(b, col);
      break;
    }
    case 'ventouse': {
      const v = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.012, 0.005, 24), mat(p.couleur, { metalness: 0.1, roughness: 0.7 }));
      v.position.y = 0.0025;
      const col = new THREE.Mesh(new THREE.CylinderGeometry(0.01, 0.006, 0.013, 20), mat(0x7f8c8d));
      col.position.y = 0.011;
      g.add(v, col);
      break;
    }
    default: {
      const c = new THREE.Mesh(new THREE.ConeGeometry(0.011, 0.018, 20), m);
      c.rotation.x = Math.PI; c.position.y = 0.009;
      g.add(c);
    }
  }
  return { g, h };
}

function base(p, y) {
  const g = new THREE.Group(), m = mat(p.couleur);
  let r = 0.026, h = 0.014;
  switch (p.forme) {
    case 'lourde': r = 0.029; h = 0.017; break;
    case 'legere': {
      const anneau = new THREE.Mesh(new THREE.TorusGeometry(0.019, 0.005, 10, 32), m);
      anneau.rotation.x = Math.PI / 2; anneau.position.y = y + 0.007;
      const moyeu = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.014, 16), m);
      moyeu.position.y = y + 0.007;
      g.add(anneau, moyeu);
      for (let i = 0; i < 3; i++) {
        const bras = new THREE.Mesh(new THREE.BoxGeometry(0.02, 0.004, 0.004), m);
        bras.position.y = y + 0.007; bras.rotation.y = (i * Math.PI) / 3;
        g.add(bras);
      }
      return { g, top: y + 0.014 };
    }
    case 'gyro': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(0.017, 0.003, 8, 32), mat(0x9fe8d8, { emissive: 0x1f7a68, emissiveIntensity: 0.6 }));
      t.position.y = y + 0.008; t.rotation.x = Math.PI / 2.4;
      t.userData.gyro = true;
      g.add(t);
      break;
    }
    case 'noyau': {
      const n = new THREE.Mesh(new THREE.IcosahedronGeometry(0.02, 1), mat(p.couleur, { emissive: 0x4a1a7a, emissiveIntensity: 0.5, flatShading: true }));
      n.position.y = y + 0.01; n.scale.y = 0.7;
      g.add(n);
      return { g, top: y + 0.017 };
    }
  }
  const c = new THREE.Mesh(new THREE.CylinderGeometry(r, r * 0.8, h, 40), m);
  c.position.y = y + h / 2;
  g.add(c);
  return { g, top: y + h };
}

function couronne(p, y) {
  const g = new THREE.Group(), m = mat(p.couleur);
  const R = 0.034;
  switch (p.forme) {
    case 'dents': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.005, 10, 40), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
      for (let i = 0; i < 12; i++) {
        const d = new THREE.Mesh(new THREE.ConeGeometry(0.004, 0.009, 4), m);
        const a = (i / 12) * Math.PI * 2;
        d.position.set(Math.cos(a) * (R + 0.006), y, Math.sin(a) * (R + 0.006));
        d.rotation.z = -Math.PI / 2; d.rotation.y = -a;
        g.add(d);
      }
      break;
    }
    case 'bouclier': {
      const c = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.006, R + 0.008, 0.012, 48, 1, true), mat(p.couleur, { side: THREE.DoubleSide }));
      c.position.y = y;
      const bord = new THREE.Mesh(new THREE.TorusGeometry(R + 0.007, 0.002, 8, 48), mat(0xdfe6ee));
      bord.rotation.x = Math.PI / 2; bord.position.y = y + 0.006;
      g.add(c, bord);
      break;
    }
    case 'lames': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R - 0.006, 0.003, 8, 32), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
      for (let i = 0; i < 4; i++) {
        const l = new THREE.Mesh(new THREE.BoxGeometry(0.03, 0.003, 0.009), mat(p.couleur, { metalness: 0.95, roughness: 0.15 }));
        const a = (i / 4) * Math.PI * 2;
        l.position.set(Math.cos(a) * (R + 0.002), y, Math.sin(a) * (R + 0.002));
        l.rotation.y = -a + 0.9;
        g.add(l);
      }
      break;
    }
    case 'large': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.008, 0.007, 12, 48), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      const d2 = new THREE.Mesh(new THREE.CylinderGeometry(R + 0.008, R + 0.008, 0.003, 48), mat(0x2b2f36, { metalness: 0.3 }));
      d2.position.y = y;
      g.add(t, d2);
      break;
    }
    case 'inertie': {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R + 0.002, 0.008, 14, 48), mat(p.couleur, { metalness: 1, roughness: 0.2 }));
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
      break;
    }
    default: {
      const t = new THREE.Mesh(new THREE.TorusGeometry(R, 0.006, 12, 40), m);
      t.rotation.x = Math.PI / 2; t.position.y = y;
      g.add(t);
    }
  }
  // Disque qui relie la couronne à la base
  const disque = new THREE.Mesh(new THREE.CylinderGeometry(R, R, 0.003, 40), mat(0x2b2f36, { metalness: 0.3 }));
  disque.position.y = y;
  g.add(disque);
  return { g };
}

function ame(p, y) {
  const g = new THREE.Group();
  const pastille = new THREE.Mesh(new THREE.CylinderGeometry(0.011, 0.012, 0.004, 32), mat(0x1b1e23, { metalness: 0.2 }));
  pastille.position.y = y + 0.002;
  g.add(pastille);
  const lum = { emissive: p.couleur, emissiveIntensity: 0.9 };
  const s = y + 0.006;
  let sym;
  switch (p.forme) {
    case 'flamme': sym = new THREE.Mesh(new THREE.ConeGeometry(0.005, 0.012, 10), mat(p.couleur, lum)); sym.position.y = s + 0.004; break;
    case 'aimant': sym = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0018, 8, 16, Math.PI), mat(p.couleur, lum)); sym.position.y = s + 0.002; break;
    case 'ressort': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.005, 0.0012, 6, 16), mat(p.couleur, lum));
        t.rotation.x = Math.PI / 2; t.position.y = s + i * 0.0025;
        sym.add(t);
      }
      break;
    }
    case 'sangsue': sym = new THREE.Mesh(new THREE.SphereGeometry(0.005, 14, 10), mat(p.couleur, lum)); sym.scale.y = 1.4; sym.position.y = s + 0.002; break;
    case 'oeil': {
      sym = new THREE.Group();
      const blanc = new THREE.Mesh(new THREE.SphereGeometry(0.006, 14, 10), mat(0xffffff, { emissive: 0x555555 }));
      const pupille = new THREE.Mesh(new THREE.SphereGeometry(0.003, 10, 8), mat(p.couleur, lum));
      blanc.scale.y = 0.6; pupille.position.y = 0.003; pupille.scale.y = 0.5;
      sym.add(blanc, pupille); sym.position.y = s;
      break;
    }
    case 'orage': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const z = new THREE.Mesh(new THREE.BoxGeometry(0.0025, 0.0025, 0.007), mat(p.couleur, lum));
        z.position.set((i % 2 ? 1 : -1) * 0.0015, s + 0.001 + i * 0.002, (i - 1) * 0.004);
        z.rotation.y = i % 2 ? 0.6 : -0.6;
        sym.add(z);
      }
      break;
    }
    case 'cyclone': {
      sym = new THREE.Group();
      for (let i = 0; i < 3; i++) {
        const t = new THREE.Mesh(new THREE.TorusGeometry(0.0065 - i * 0.0018, 0.0011, 6, 16), mat(p.couleur, lum));
        t.rotation.x = Math.PI / 2; t.position.y = s + i * 0.0022;
        sym.add(t);
      }
      break;
    }
    case 'carapace': sym = new THREE.Mesh(new THREE.CylinderGeometry(0.008, 0.008, 0.003, 6), mat(p.couleur, lum)); sym.position.y = s; break;
    default: sym = new THREE.Mesh(new THREE.SphereGeometry(0.004, 12, 8), mat(p.couleur)); sym.position.y = s;
  }
  g.add(sym);
  return { g };
}

// Renvoie { racine, inclinaison, rotor } : racine = position sur le bureau, inclinaison = penche quand la toupie faiblit,
// rotor = ce qui tourne.
export function creerToupie(equipe) {
  const racine = new THREE.Group(), inclinaison = new THREE.Group(), rotor = new THREE.Group();
  racine.add(inclinaison); inclinaison.add(rotor);
  const P = id => PIECE[id];
  const pt = pointe(P(equipe.pointe));
  const bs = base(P(equipe.base), pt.h);
  const cr = couronne(P(equipe.couronne), pt.h + (bs.top - pt.h) * 0.45);
  const am = ame(P(equipe.ame), bs.top);
  rotor.add(pt.g, bs.g, cr.g, am.g);
  // Un repère coloré pour qu'on voie la toupie tourner
  const repere = new THREE.Mesh(new THREE.BoxGeometry(0.004, 0.0025, 0.022), new THREE.MeshStandardMaterial({ color: 0xffffff, emissive: 0x666666 }));
  repere.position.set(0.012, bs.top + 0.001, 0);
  rotor.add(repere);
  racine.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
  return { racine, inclinaison, rotor };
}

export function libererToupie(t) {
  t.racine.traverse(o => { if (o.isMesh) { o.geometry.dispose(); o.material.dispose(); } });
  t.racine.removeFromParent();
}
