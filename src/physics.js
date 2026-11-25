// Physique des toupies : déplacement, rebonds, chocs avec les cafards et entre toupies,
// et les pouvoirs repris du jeu 1 (critique, feu, second souffle, éclairs, tourbillon, agressivité, trampolines).
import * as THREE from 'three';
import { scene } from './scene.js';
import { DESK_X, DESK_Z } from './config.js';
import { statsToupie, passifToupie } from './stats.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { cafards, toiles } from './bugs.js';

export const toupies = [];
const DEGATS_BASE = 2.6; // dégâts d'un coup avec des lames ×1

// Terrain de duel actif (null = bureau neutre). Contre les cafards, toujours neutre.
let terrain = null;
export function choisirTerrain(t) { terrain = t || null; }
// En duel, les toupies se cherchent un peu (pour qu'il y ait plusieurs contacts)
let duel = false;
export function modeDuel(oui) { duel = !!oui; }
// Réglages des chocs entre toupies : perte de rotation de la cible par contact, en part de sa rotation de départ.
// Visé : 6 à 12 contacts par duel, et l'arrêt d'une toupie après 8 à 20 s.
export const CHOC = { parLames: 0.007, parVitesse: 0.03, attraction: 0.7, poussee: 0.12, delai: 0.15, rebond: 0.5, usureDuel: 0.55 };

export function creerToupieJeu(equipe, achats, camp, nivPieces = {}, { duel = false } = {}) {
  const s = statsToupie(equipe, achats, nivPieces);
  if (duel) s.trampoline = 0; // les Bords trampolines du bureau ne servent que contre les cafards
  const mesh = creerToupie(equipe);
  const k = s.rayon / 0.042; // le diamètre se voit
  mesh.racine.scale.set(k, 1, k);
  mesh.racine.visible = false;
  scene.add(mesh.racine);
  const t = {
    camp, equipe, s, passif: passifToupie(equipe), mesh, echelle: k,
    x: 0, z: 0, vx: 0, vz: 0, rotation: 0, rotationMax: 1, age: 0,
    errance: 0, erranceVit: 0, angle: 0, precession: 0,
    lancee: false, tombe: 0, carapace: passifToupie(equipe) === 'carapace',
    souffleRendu: 0, dernierChoc: -9, flammeT: 0,
  };
  toupies.push(t);
  return t;
}

export function retirerToupie(t) {
  libererToupie(t.mesh);
  const i = toupies.indexOf(t);
  if (i >= 0) toupies.splice(i, 1);
}

export function viderToupies() {
  while (toupies.length) retirerToupie(toupies[0]);
  for (const f of flammes) f.mesh.visible = false;
  flammes.length = 0;
}

export function lancerToupie(t, x, z, dx, dz, puissance) {
  const n = Math.hypot(dx, dz) || 1;
  const v = t.s.vitesse * (0.35 + 0.65 * puissance);
  Object.assign(t, {
    x, z, vx: (dx / n) * v, vz: (dz / n) * v,
    rotationMax: t.s.tours * (0.6 + 0.4 * Math.min(1, puissance)) * (puissance > 1 ? puissance : 1),
    age: 0, lancee: true, tombe: 0, errance: Math.atan2(dz, dx), erranceVit: 0, souffleRendu: 0,
  });
  t.rotation = t.rotationMax;
  t.mesh.racine.visible = true;
  t.mesh.racine.position.set(x, 0, z);
  t.mesh.inclinaison.rotation.set(0, 0, 0);
}

export const enJeu = t => t.lancee && !t.tombe;

// ---------------------------------------------------------------- Traînée de feu
const flammes = [];
const flammeGeo = new THREE.CircleGeometry(1, 12);
const reserveFlammes = [];
function nouvelleFlamme(x, z, r, duree, force, toupie) {
  let mesh = reserveFlammes.find(m => !m.visible);
  if (!mesh) {
    mesh = new THREE.Mesh(flammeGeo, new THREE.MeshBasicMaterial({ color: 0xff7a1a, transparent: true, opacity: 0.7, depthWrite: false, blending: THREE.AdditiveBlending }));
    mesh.rotation.x = -Math.PI / 2;
    scene.add(mesh);
    reserveFlammes.push(mesh);
  }
  mesh.visible = true;
  mesh.position.set(x, 0.0015, z);
  mesh.scale.setScalar(r);
  flammes.push({ x, z, r, t: 0, duree, force, toupie, mesh });
}

// ---------------------------------------------------------------- Éclairs (visuels)
const eclairs = [];
const eclairMat = new THREE.LineBasicMaterial({ color: 0xbfe8ff, transparent: true });
function dessinerEclair(a, b) {
  const pts = [];
  const n = 6;
  for (let i = 0; i <= n; i++) {
    const k = i / n, j = i === 0 || i === n ? 0 : 0.012;
    pts.push(new THREE.Vector3(a.x + (b.x - a.x) * k + (Math.random() - 0.5) * j, 0.02, a.z + (b.z - a.z) * k + (Math.random() - 0.5) * j));
  }
  const l = new THREE.Line(new THREE.BufferGeometry().setFromPoints(pts), eclairMat.clone());
  scene.add(l);
  eclairs.push({ l, t: 0 });
}

// ---------------------------------------------------------------- Coups sur les cafards
function frapperCafard(t, c, degats, cb, depuisEclair = false) {
  let crit = false;
  if (!depuisEclair && t.s.crit && Math.random() < t.s.crit) { degats *= t.s.critMult; crit = true; }
  if (c.armure) degats = Math.max(degats * 0.15, degats - c.armure); // cafard blindé : il faut frapper fort
  c.vie -= degats; c.flash = 1;
  if (c.vie <= 0 && !c.mort) {
    c.mort = 0.001;
    if (t.s.souffle) { // Second souffle
      const gain = Math.min(t.s.souffle * t.rotationMax, t.s.souffleMax * t.rotationMax - t.souffleRendu);
      if (gain > 0) { t.rotation = Math.min(t.rotationMax, t.rotation + gain); t.souffleRendu += gain; }
    }
    cb.tue?.(c, t, crit);
  } else if (c.vie > 0) cb.touche?.(c, t, degats, crit);
  // Éclairs en chaîne
  if (!depuisEclair && t.s.eclair && Math.random() < t.s.eclair) {
    let de = c, deja = new Set([c]);
    for (let i = 0; i < t.s.eclairRebonds; i++) {
      let best = null, bd = 0.2;
      for (const o of cafards) if (!o.mort && o.chute <= 0 && !deja.has(o)) { const d = Math.hypot(o.x - de.x, o.z - de.z); if (d < bd) { bd = d; best = o; } }
      if (!best) break;
      dessinerEclair(de, best);
      deja.add(best);
      frapperCafard(t, best, degats * t.s.eclairDegats, cb, true);
      de = best;
    }
    cb.eclair?.(c);
  }
}

// cb : { touche(cafard, toupie, degats, crit), tue(cafard, toupie, crit), choc(a, b, perte, bloque), mur(toupie), chute(toupie), eclair(cafard) }
export function majToupies(dt, cb) {
  for (const t of toupies) {
    if (!t.lancee) continue;
    if (t.tombe) { animerChute(t, dt); continue; }
    const s = t.s, ratio = t.rotation / t.rotationMax;

    // Dérive : la toupie « danse »
    t.erranceVit = Math.max(-2.5, Math.min(2.5, t.erranceVit + (Math.random() - 0.5) * 10 * dt));
    t.errance += t.erranceVit * dt;
    let ax = Math.cos(t.errance) * s.derive * ratio, az = Math.sin(t.errance) * s.derive * ratio;

    // Agressivité : attirée par la cible la plus proche (cafard ou toupie adverse)
    if (s.attraction) {
      let best = null, bd = 0.5;
      for (const c of cafards) if (!c.mort && c.chute <= 0) { const d = Math.hypot(c.x - t.x, c.z - t.z); if (d < bd) { bd = d; best = c; } }
      for (const o of toupies) if (o.camp !== t.camp && enJeu(o)) { const d = Math.hypot(o.x - t.x, o.z - t.z); if (d < bd) { bd = d; best = o; } }
      if (best) { ax += ((best.x - t.x) / bd) * s.attraction * ratio; az += ((best.z - t.z) / bd) * s.attraction * ratio; }
    }
    // Duel : légère attraction vers la toupie adverse la plus proche
    if (duel) {
      let best = null, bd = 9;
      for (const o of toupies) if (o.camp !== t.camp && enJeu(o)) { const d = Math.hypot(o.x - t.x, o.z - t.z); if (d < bd) { bd = d; best = o; } }
      if (best && bd > 0.001) { ax += ((best.x - t.x) / bd) * CHOC.attraction * ratio; az += ((best.z - t.z) / bd) * CHOC.attraction * ratio; }
    }
    // Terrain « cuve » : le plateau est creusé, les toupies glissent vers le centre
    if (terrain === 'cuve') { ax -= t.x * 1.1; az -= t.z * 1.1; }
    t.vx += ax * dt; t.vz += az * dt;
    const fr = Math.exp(-s.frottement * dt);
    t.vx *= fr; t.vz *= fr;
    t.x += t.vx * dt; t.z += t.vz * dt;

    // Rebonds sur les bords (Rebond, et Bords trampolines du bureau)
    const r = s.rayon;
    const mur = () => {
      if (terrain === 'rebond') { // bords rebondissants : relancent la toupie (vitesse plafonnée)
        const v = Math.hypot(t.vx, t.vz), k = Math.min(1.25, (s.vitesse * 1.3) / Math.max(v, 1e-6));
        t.vx *= k; t.vz *= k;
      } else if (terrain === 'collant') { // bords collants : la toupie s'englue
        t.vx *= 0.15; t.vz *= 0.15; t.rotation *= 0.96;
      } else if (s.trampoline) {
        const v = Math.hypot(t.vx, t.vz), cap = s.vitesse * s.trampolineMax;
        const k = Math.max(s.rebond, Math.min(s.trampoline, cap / Math.max(v, 1e-6)));
        t.vx *= k; t.vz *= k;
      } else { t.vx *= s.rebond; t.vz *= s.rebond; t.rotation *= 0.985; }
      cb.mur?.(t);
    };
    if (t.x < -DESK_X + r) { t.x = -DESK_X + r; t.vx = Math.abs(t.vx); mur(); }
    if (t.x > DESK_X - r) { t.x = DESK_X - r; t.vx = -Math.abs(t.vx); mur(); }
    if (t.z < -DESK_Z + r) { t.z = -DESK_Z + r; t.vz = Math.abs(t.vz); mur(); }
    if (t.z > DESK_Z - r) { t.z = DESK_Z - r; t.vz = -Math.abs(t.vz); mur(); }

    // Traînée de feu : une flamme tous les 3 cm parcourus
    if (s.feu) {
      t.flammeT += Math.hypot(t.vx, t.vz) * dt;
      if (t.flammeT > 0.03) { t.flammeT = 0; nouvelleFlamme(t.x, t.z, r * 0.75, s.feuDuree, s.feu * DEGATS_BASE * s.lames, t); }
    }

    // Tourbillon : aspire les cafards proches
    if (s.tornade) for (const c of cafards) {
      if (c.mort || c.chute > 0) continue;
      const dx = t.x - c.x, dz = t.z - c.z, d = Math.hypot(dx, dz);
      if (d < s.tornadeRayon && d > 0.001) { c.x += (dx / d) * s.tornade * ratio * dt; c.z += (dz / d) * s.tornade * ratio * dt; }
    }

    // Chocs avec les cafards
    const vitesse = Math.hypot(t.vx, t.vz);
    const elan = 0.6 + Math.min(1, vitesse / s.vitesse) * 0.8;
    const m = s.masse / 20;
    for (const c of cafards) {
      if (c.mort || c.chute > 0) continue;
      const dx = c.x - t.x, dz = c.z - t.z, d = Math.hypot(dx, dz), min = r + c.r * 0.85;
      if (d >= min + 0.004) continue;
      if (c.coup <= 0) {
        c.coup = 0.12;
        t.rotation -= t.rotationMax * 0.004 * s.inertie * 3; // frapper coûte un peu de rotation (moins avec l'Inertie)
        frapperCafard(t, c, DEGATS_BASE * s.lames * elan * (0.9 + Math.random() * 0.2), cb);
      }
      if (d > 0 && d < min) { // on se sépare et on se repousse
        const nx = dx / d, nz = dz / d, chev = min - d, mc = 0.5 * c.masse;
        t.x -= nx * chev * (mc / (m + mc)); t.z -= nz * chev * (mc / (m + mc));
        c.x += nx * chev * (m / (m + mc)); c.z += nz * chev * (m / (m + mc));
        const vn = t.vx * nx + t.vz * nz;
        if (vn > 0) { const k = 1.2 * vn * (1.6 / (m + 1.6)); t.vx -= k * nx; t.vz -= k * nz; }
        c.kx += nx * 0.12 * Math.min(2, m); c.kz += nz * 0.12 * Math.min(2, m);
      }
    }

    // Toiles d'araignée : engluent la toupie (moins si elle est lourde) ; la Traînée de feu les brûle
    for (const w of toiles) {
      if (w.vie <= 0 || Math.hypot(t.x - w.x, t.z - w.z) > w.r + r * 0.5) continue;
      if (s.feu) { w.vie = 0; continue; }
      const k = Math.exp((-6 * dt) / Math.max(0.5, m));
      t.vx *= k; t.vz *= k;
      t.rotation -= t.rotation * 0.12 * dt;
    }

    // Usure de la rotation (Endurance) et fatigue au-delà de 25 s : un lancer ne traîne jamais
    t.age += dt;
    t.rotation -= t.rotation * s.usure * (duel ? CHOC.usureDuel : 1) * dt;
    if (t.age > 25) t.rotation -= t.rotation * 0.08 * (t.age - 25) * dt;
    if (t.rotation < t.rotationMax * s.seuilChute) { t.tombe = 0.001; cb.chute?.(t); }
  }

  // Les flammes brûlent les cafards qui marchent dedans
  for (let i = flammes.length - 1; i >= 0; i--) {
    const f = flammes[i];
    f.t += dt;
    f.mesh.material.opacity = 0.7 * (1 - f.t / f.duree);
    f.mesh.scale.setScalar(f.r * (1 + 0.3 * Math.sin(f.t * 20)));
    if (f.t > f.duree) { f.mesh.visible = false; flammes.splice(i, 1); continue; }
    for (const c of cafards) {
      if (c.mort || c.chute > 0 || Math.hypot(c.x - f.x, c.z - f.z) > f.r + c.r * 0.5) continue;
      c.brule = (c.brule || 0) + f.force * dt;
      if (c.brule > 0.5) { const b = c.brule; c.brule = 0; frapperCafard(f.toupie, c, b, cb, true); }
    }
  }
  for (let i = eclairs.length - 1; i >= 0; i--) {
    const e = eclairs[i];
    e.t += dt;
    e.l.material.opacity = 1 - e.t / 0.2;
    if (e.t > 0.2) { e.l.geometry.dispose(); e.l.material.dispose(); e.l.removeFromParent(); eclairs.splice(i, 1); }
  }

  // Chocs entre toupies (duels)
  for (let i = 0; i < toupies.length; i++) for (let j = i + 1; j < toupies.length; j++) {
    const a = toupies[i], b = toupies[j];
    if (!enJeu(a) || !enJeu(b)) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), min = a.s.rayon + b.s.rayon;
    if (d >= min || d === 0) continue;
    const nx = dx / d, nz = dz / d, ma = a.s.masse, mb = b.s.masse, chev = min - d;
    a.x -= nx * chev * (mb / (ma + mb)); a.z -= nz * chev * (mb / (ma + mb));
    b.x += nx * chev * (ma / (ma + mb)); b.z += nz * chev * (ma / (ma + mb));
    const vrel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
    if (vrel < 0) {
      // En duel, rebond amorti : les toupies restent proches et se percutent plusieurs fois
      const jj = -((1 + (duel && a.camp !== b.camp ? CHOC.rebond : 0.85)) * vrel) / (1 / ma + 1 / mb);
      a.vx -= (jj / ma) * nx; a.vz -= (jj / ma) * nz;
      b.vx += (jj / mb) * nx; b.vz += (jj / mb) * nz;
    }
    if (a.camp === b.camp) continue; // ses propres toupies (Multi-lancer) se bousculent sans se blesser
    if (a.age - a.dernierChoc < CHOC.delai) continue;
    a.dernierChoc = a.age;
    // Les deux toupies tournent dans le même sens : au contact, elles se repoussent sur le côté (ça « grince »)
    const k = CHOC.poussee * Math.min(a.rotation / a.rotationMax, b.rotation / b.rotationMax);
    a.vx += -nz * k; a.vz += nx * k; b.vx -= -nz * k; b.vz -= nx * k;
    frapperToupie(a, b, Math.abs(vrel), cb);
    frapperToupie(b, a, Math.abs(vrel), cb);
  }

  // Affichage
  for (const t of toupies) {
    if (!t.lancee || t.tombe) continue;
    const ratio = Math.max(0, t.rotation / t.rotationMax);
    t.mesh.racine.position.set(t.x, 0, t.z);
    t.angle += (12 + 50 * ratio) * dt;
    t.mesh.rotor.rotation.y = t.angle;
    t.precession += (3 + 6 * (1 - ratio)) * dt;
    const penche = Math.min(0.5, (1 - ratio) * 0.06 / t.s.seuilChute);
    t.mesh.inclinaison.rotation.set(Math.cos(t.precession) * penche, 0, Math.sin(t.precession) * penche);
    t.mesh.rotor.traverse(o => { if (o.userData.gyro) o.rotation.z += dt * 9; });
  }
}

// Une toupie en frappe une autre : la cible perd de la rotation (moins avec l'Inertie, plus si l'attaquant est lourd)
function frapperToupie(att, cible, vrel, cb) {
  let frac = (CHOC.parLames * att.s.lames + CHOC.parVitesse * vrel) * (2 * att.s.masse / (att.s.masse + cible.s.masse)) * cible.s.inertie
    * (0.5 + 0.5 * att.rotation / att.rotationMax);
  let crit = false;
  if (att.s.crit && Math.random() < att.s.crit * 0.5) { frac *= 1.5; crit = true; } // critiques moins forts en duel
  const perte = frac * cible.rotationMax;
  if (cible.carapace && frac > 0.04) { cible.carapace = false; cb.choc?.(att, cible, 0, true, false); return; }
  cible.rotation -= perte;
  cb.choc?.(att, cible, perte, false, crit);
}

function animerChute(t, dt) {
  t.tombe += dt;
  const k = Math.min(1, t.tombe / 0.5);
  t.mesh.inclinaison.rotation.x = k * 1.35;
  t.mesh.racine.position.y = k * 0.01;
  t.vx *= 0.9; t.vz *= 0.9;
}
