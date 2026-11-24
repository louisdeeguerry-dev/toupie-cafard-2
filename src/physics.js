// Physique des toupies : déplacement, rebonds, chocs avec les cafards et entre toupies.
import { scene } from './scene.js';
import { DESK_X, DESK_Z } from './config.js';
import { statsToupie, passifToupie, physique } from './stats.js';
import { creerToupie, libererToupie } from './topMesh.js';
import { cafards } from './bugs.js';

export const toupies = [];

export function creerToupieJeu(equipe, niveaux, camp) {
  const stats = statsToupie(equipe, niveaux);
  const ph = physique(stats);
  const mesh = creerToupie(equipe);
  mesh.racine.visible = false;
  scene.add(mesh.racine);
  const t = {
    camp, equipe, stats, ph, passif: passifToupie(equipe), mesh,
    x: 0, z: 0, vx: 0, vz: 0, rotation: 0, rotationMax: 1, age: 0,
    errance: 0, erranceVit: 0, angle: 0, precession: 0,
    lancee: false, tombe: 0, carapace: passifToupie(equipe) === 'carapace',
    contacts: new Map(), // dernier coup par cible
  };
  toupies.push(t);
  return t;
}

export function retirerToupie(t) {
  libererToupie(t.mesh);
  const i = toupies.indexOf(t);
  if (i >= 0) toupies.splice(i, 1);
}

export function viderToupies() { while (toupies.length) retirerToupie(toupies[0]); }

export function lancerToupie(t, x, z, dx, dz, puissance) {
  const n = Math.hypot(dx, dz) || 1;
  const v = t.ph.vitesseLancer * (0.35 + 0.65 * puissance);
  Object.assign(t, {
    x, z, vx: (dx / n) * v, vz: (dz / n) * v,
    rotationMax: t.ph.rotation * (0.6 + 0.4 * puissance),
    age: 0, lancee: true, tombe: 0, errance: Math.atan2(dz, dx), erranceVit: 0,
  });
  t.rotation = t.rotationMax;
  t.contacts.clear();
  t.mesh.racine.visible = true;
  t.mesh.racine.position.set(x, 0, z);
  t.mesh.racine.scale.setScalar(1);
}

export const enJeu = t => t.lancee && !t.tombe;

// cb : { touche(cafard, toupie, degats), tue(cafard, toupie), choc(a, b, degatsSurB), mur(toupie), chute(toupie) }
export function majToupies(dt, cb) {
  for (const t of toupies) {
    if (!t.lancee) continue;
    if (t.tombe) { animerChute(t, dt); continue; }
    const ph = t.ph, ratio = t.rotation / t.rotationMax;

    // Dérive : la toupie « danse »
    t.erranceVit = Math.max(-2.5, Math.min(2.5, t.erranceVit + (Math.random() - 0.5) * 10 * dt));
    t.errance += t.erranceVit * dt;
    let ax = Math.cos(t.errance) * ph.derive * ratio, az = Math.sin(t.errance) * ph.derive * ratio;

    // Passif Aimant : attirée par la cible la plus proche
    if (t.passif === 'aimant') {
      let best = null, bd = 0.45;
      for (const c of cafards) if (!c.mort && c.chute <= 0) { const d = Math.hypot(c.x - t.x, c.z - t.z); if (d < bd) { bd = d; best = c; } }
      for (const o of toupies) if (o !== t && enJeu(o)) { const d = Math.hypot(o.x - t.x, o.z - t.z); if (d < bd) { bd = d; best = o; } }
      if (best) { ax += ((best.x - t.x) / bd) * 0.45 * ratio; az += ((best.z - t.z) / bd) * 0.45 * ratio; }
    }
    t.vx += ax * dt; t.vz += az * dt;
    const fr = Math.exp(-ph.frottement * dt);
    t.vx *= fr; t.vz *= fr;
    t.x += t.vx * dt; t.z += t.vz * dt;

    // Rebonds sur les bords
    const r = ph.rayon;
    const mur = (axe, signe) => {
      if (t.passif === 'ressort') {
        const v = Math.hypot(t.vx, t.vz), cap = ph.vitesseLancer * 0.9;
        const k = Math.min(1.15, cap / Math.max(v, 1e-6));
        t.vx *= k; t.vz *= k;
      } else { t.vx *= 0.7; t.vz *= 0.7; t.rotation *= 0.985; }
      cb.mur?.(t, axe, signe);
    };
    if (t.x < -DESK_X + r) { t.x = -DESK_X + r; t.vx = Math.abs(t.vx); mur('x', -1); }
    if (t.x > DESK_X - r) { t.x = DESK_X - r; t.vx = -Math.abs(t.vx); mur('x', 1); }
    if (t.z < -DESK_Z + r) { t.z = -DESK_Z + r; t.vz = Math.abs(t.vz); mur('z', -1); }
    if (t.z > DESK_Z - r) { t.z = DESK_Z - r; t.vz = -Math.abs(t.vz); mur('z', 1); }

    // Chocs avec les cafards
    const vitesse = Math.hypot(t.vx, t.vz);
    const elan = 0.6 + Math.min(1, vitesse / ph.vitesseLancer) * 0.8;
    const flamme = t.passif === 'flamme' && vitesse > ph.vitesseLancer * 0.45 ? 1.5 : 1;
    for (const c of cafards) {
      if (c.mort || c.chute > 0) continue;
      const dx = c.x - t.x, dz = c.z - t.z, d = Math.hypot(dx, dz), min = r + c.r * 0.85;
      if (d >= min + 0.004) continue;
      if (c.coup <= 0) {
        const degats = ph.degats * elan * flamme * (0.9 + Math.random() * 0.2);
        c.vie -= degats; c.coup = 0.12; c.flash = 1;
        t.rotation -= 0.35 * ph.instabilite; // frapper coûte un peu de rotation
        if (c.vie <= 0) {
          c.mort = 0.001;
          if (t.passif === 'sangsue') t.rotation = Math.min(t.rotationMax, t.rotation + t.rotationMax * 0.04);
          cb.tue?.(c, t);
        } else cb.touche?.(c, t, degats);
      }
      if (d > 0 && d < min) { // on se sépare et on se repousse
        const nx = dx / d, nz = dz / d, chev = min - d, mc = 0.5;
        t.x -= nx * chev * (mc / (ph.masse + mc)); t.z -= nz * chev * (mc / (ph.masse + mc));
        c.x += nx * chev * (ph.masse / (ph.masse + mc)); c.z += nz * chev * (ph.masse / (ph.masse + mc));
        const vn = t.vx * nx + t.vz * nz;
        if (vn > 0) { const k = 1.2 * vn * (1.6 / (ph.masse + 1.6)); t.vx -= k * nx; t.vz -= k * nz; }
        c.kx += nx * 0.12; c.kz += nz * 0.12;
      }
    }

    // Usure de la rotation (et fatigue au-delà de 25 s : un lancer ne traîne jamais)
    t.age += dt;
    t.rotation -= t.rotation * ph.usure * dt + 0.5 * dt;
    if (t.age > 25) t.rotation -= t.rotation * 0.08 * (t.age - 25) * dt;
    if (t.rotation < t.rotationMax * ph.seuilChute) { t.tombe = 0.001; cb.chute?.(t); }
  }

  // Chocs entre toupies (duels)
  for (let i = 0; i < toupies.length; i++) for (let j = i + 1; j < toupies.length; j++) {
    const a = toupies[i], b = toupies[j];
    if (!enJeu(a) || !enJeu(b)) continue;
    const dx = b.x - a.x, dz = b.z - a.z, d = Math.hypot(dx, dz), min = a.ph.rayon + b.ph.rayon;
    if (d >= min || d === 0) continue;
    const nx = dx / d, nz = dz / d, ma = a.ph.masse, mb = b.ph.masse, chev = min - d;
    a.x -= nx * chev * (mb / (ma + mb)); a.z -= nz * chev * (mb / (ma + mb));
    b.x += nx * chev * (ma / (ma + mb)); b.z += nz * chev * (ma / (ma + mb));
    const vrel = (b.vx - a.vx) * nx + (b.vz - a.vz) * nz;
    if (vrel < 0) {
      const j = -(1.85 * vrel) / (1 / ma + 1 / mb);
      a.vx -= (j / ma) * nx; a.vz -= (j / ma) * nz;
      b.vx += (j / mb) * nx; b.vz += (j / mb) * nz;
    }
    const cle = 'duel';
    const dernier = a.contacts.get(cle) || -9;
    if (a.age - dernier < 0.15) continue;
    a.contacts.set(cle, a.age);
    const impact = Math.abs(vrel) * 30;
    frapper(a, b, impact, cb);
    frapper(b, a, impact, cb);
  }

  // Affichage
  for (const t of toupies) {
    if (!t.lancee || t.tombe) continue;
    const ratio = Math.max(0, t.rotation / t.rotationMax);
    t.mesh.racine.position.set(t.x, 0, t.z);
    t.angle += (12 + 50 * ratio) * dt;
    t.mesh.rotor.rotation.y = t.angle;
    t.precession += (3 + 6 * (1 - ratio)) * dt;
    const penche = Math.min(0.5, (1 - ratio) * 0.22 * t.ph.instabilite);
    t.mesh.inclinaison.rotation.set(Math.cos(t.precession) * penche, 0, Math.sin(t.precession) * penche);
    t.mesh.rotor.traverse(o => { if (o.userData.gyro) o.rotation.z += dt * 9; });
  }
}

function frapper(attaquant, cible, impact, cb) {
  const fl = attaquant.passif === 'flamme' && Math.hypot(attaquant.vx, attaquant.vz) > attaquant.ph.vitesseLancer * 0.45 ? 1.5 : 1;
  let degats = (attaquant.ph.degats * 2.2 + impact) * fl * cible.ph.instabilite * (attaquant.rotation / attaquant.rotationMax * 0.5 + 0.5);
  if (cible.carapace && degats > 6) { cible.carapace = false; cb.choc?.(attaquant, cible, 0, true); return; }
  cible.rotation -= degats;
  cb.choc?.(attaquant, cible, degats, false);
}

function animerChute(t, dt) {
  t.tombe += dt;
  const k = Math.min(1, t.tombe / 0.5);
  t.mesh.inclinaison.rotation.x = k * 1.35;
  t.mesh.racine.position.y = k * 0.01;
  t.vx *= 0.9; t.vz *= 0.9;
}
