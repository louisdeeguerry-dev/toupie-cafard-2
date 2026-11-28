// Physique des toupies : déplacement, rebonds, chocs avec les cafards et entre toupies,
// et les pouvoirs repris du jeu 1 (critique, feu, second souffle, éclairs, tourbillon, agressivité).
import * as THREE from 'three';
import { scene } from './scene.js';
import { ARENE_R } from './config.js';
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
// Pertes en tr/min ABSOLUS (référence : 600 tr/min) : une toupie qui tourne plus vite (Puissance) encaisse plus de chocs.
// parVitesse porte sur la vitesse d'approche de l'ATTAQUANT : celui qui charge fait plus mal.
// Mesures visées : ~4-6 % de barre par choc, plus de la moitié de la chute due aux chocs, 10-15 contacts, 10-20 s.
// cuvette : en duel, l'arène est légèrement creusée (pente vers le centre, en m/s² par m) : les toupies qui ralentissent
// finissent par se retrouver au milieu, comme dans une vraie arène de toupies (la Cuve est la version très creusée).
// partRelative : 0 = pertes en tr/min absolus, 1 = en part de la rotation de la cible ; entre les deux, moyenne géométrique.
// deriveDuel : part de la « danse » aléatoire gardée en duel (moins de danse = la toupie ralentie finit au fond de l'arène).
// tornadeToupie : force du Tourbillon sur une toupie adverse de 20 g (accélération en m/s² par point de tourbillon).
// glissant : coup glissant, une toupie qui file vite (au-delà de 0,5 m/s) encaisse moins (contact bref).
// recul : frapper une toupie stable (Inertie, Équilibre) fait perdre de la rotation à l'attaquant (comme cogner un mur).
// glissementDuel : 0 = frottement en traînée (la vitesse fond d'une même part chaque seconde) ; 1 = vrai frottement de
// glissement (freinage constant : une toupie lancée 3× plus vite file 3× plus longtemps, ce qui donne sa valeur à l'Élan).
// frottementDuel : part du frottement au sol gardée en duel (arène lisse : les toupies gardent leur élan plus longtemps).
// approcheMax : vitesse d'approche (m/s) au-delà de laquelle une charge ne fait pas plus mal (évite les coups qui tuent d'un coup).
// masseDuel : exposant du rapport de masses sur les pertes (1 = plein effet) ; seuilMaxDuel : seuil de chute maximal en duel.
// inertieDuel : exposant de l'Inertie de la cible sur les pertes (1 = plein effet, 0,5 = effet adouci).
// usureTassee : 0 = usure de duel selon l'Endurance seule ; 1 = même usure pour tous (les malus d'Endurance comptent moins).
const RAYON_STANDARD = 0.046; // rayon d'une toupie standard (stats.js)
export const CHOC = { ref: 600, base: 0.01, parLames: 0.0375, parVitesse: 0.12, attraction: 0.1, parAgressivite: 0.3, rebondBoost: 1.35, rebondPlafond: 1.9,
  // Réglages calés au simulateur (tests/duels-sim.js, 27/11, 2e passe) : Élan 46 % (77 % sur terrain rebondissant), Puissance 69 %
  cuvette: 1.1, partRelative: 0.85, usureTassee: 0.45, deriveDuel: 0.2, inertieDuel: 0.5, masseDuel: 0.5, seuilMaxDuel: 0.3, approcheMax: 99, frottementDuel: 1, glissementDuel: 0, glissant: 0, recul: 0.2, tornadeToupie: 0.5, poussee: 0.12, delai: 0.2, rebond: 0.5, usureDuel: 0.22 };

// Les toupies sont un peu étirées en hauteur pour être lisibles vues de haut (la hauteur ne compte pas dans la physique)
const HAUTEUR_VUE = 1.35;
export function creerToupieJeu(equipe, achats, camp, nivPieces = {}, { duel = false } = {}) {
  const s = statsToupie(equipe, achats, nivPieces);
  const mesh = creerToupie(equipe, nivPieces);
  const k = s.rayon / 0.042; // le diamètre se voit
  mesh.racine.scale.set(k, HAUTEUR_VUE, k);
  // Halo au sol de la couleur du camp (vert = toi, rouge = adversaire) : on repère sa toupie d'un coup d'œil.
  // Il épouse le vrai rayon de la toupie (sa zone de contact), donc il ne ment pas sur la taille.
  const halo = new THREE.Mesh(new THREE.RingGeometry(0.043, 0.058, 40), new THREE.MeshBasicMaterial({
    color: camp === 'joueur' ? 0x3fff8a : 0xff5040, transparent: true, opacity: 0.55, blending: THREE.AdditiveBlending, depthWrite: false }));
  halo.rotation.x = -Math.PI / 2; halo.position.y = 0.0015 / HAUTEUR_VUE; halo.userData.halo = true;
  mesh.racine.add(halo);
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
  // En duel, l'usure ne commence que quand les DEUX camps ont lancé : l'ordre de lancer ne décide pas du duel
  const usureActive = !duel || new Set(toupies.filter(t => t.lancee).map(t => t.camp)).size > 1;
  for (const t of toupies) {
    if (!t.lancee) continue;
    if (t.tombe) { animerChute(t, dt); continue; }
    const s = t.s, ratio = t.rotation / t.rotationMax;

    // Dérive : la toupie « danse »
    t.erranceVit = Math.max(-2.5, Math.min(2.5, t.erranceVit + (Math.random() - 0.5) * 10 * dt));
    t.errance += t.erranceVit * dt;
    const danse = s.derive * ratio * (duel ? CHOC.deriveDuel : 1);
    let ax = Math.cos(t.errance) * danse, az = Math.sin(t.errance) * danse;

    // Agressivité contre les cafards : attirée par le cafard le plus proche. Toute toupie a un petit flair de base
    // pour les cafards (moins de temps morts dans un coin). En duel, c'est le bloc suivant (plafonné) qui s'applique.
    if (!duel) {
      let best = null, bd = 0.5;
      for (const c of cafards) if (!c.mort && c.chute <= 0) { const d = Math.hypot(c.x - t.x, c.z - t.z); if (d < bd) { bd = d; best = c; } }
      for (const o of toupies) if (o.camp !== t.camp && enJeu(o)) { const d = Math.hypot(o.x - t.x, o.z - t.z); if (d < bd) { bd = d; best = o; } }
      const att = s.attraction + (duel ? 0 : 0.06);
      if (best) { ax += ((best.x - t.x) / bd) * att * ratio; az += ((best.z - t.z) / bd) * att * ratio; }
    }
    // Duel : attraction vers la toupie adverse la plus proche, SEULEMENT si la toupie a de l'Agressivité
    // (sans Agressivité, elle part tout droit et suit son élan : les toupies d'élan ne sont plus désavantagées)
    if (duel && s.attraction > 0) {
      let best = null, bd = 9;
      for (const o of toupies) if (o.camp !== t.camp && enJeu(o)) { const d = Math.hypot(o.x - t.x, o.z - t.z); if (d < bd) { bd = d; best = o; } }
      if (best && bd > 0.001) { const att = Math.min(CHOC.attraction, s.attraction * CHOC.parAgressivite); ax += ((best.x - t.x) / bd) * att * ratio; az += ((best.z - t.z) / bd) * att * ratio; }
    }
    // Terrain « cuve » : le plateau est creusé, les toupies glissent vers le centre ; en duel, l'arène l'est un peu partout
    if (terrain === 'cuve') { ax -= t.x * 1.1; az -= t.z * 1.1; }
    else if (duel && CHOC.cuvette) { ax -= t.x * CHOC.cuvette; az -= t.z * CHOC.cuvette; }
    t.vx += ax * dt; t.vz += az * dt;
    const frot = s.frottement * (duel ? CHOC.frottementDuel : 1), g = duel ? CHOC.glissementDuel : 0;
    const fr = Math.exp(-frot * (1 - g) * dt);
    t.vx *= fr; t.vz *= fr;
    if (g) { // part « glissement » : freinage constant (référence : 0,5 m/s, la vitesse d'une toupie standard en cours de duel)
      const v = Math.hypot(t.vx, t.vz), k = v > 1e-6 ? Math.max(0, v - frot * g * 0.5 * dt) / v : 0;
      t.vx *= k; t.vz *= k;
    }
    t.x += t.vx * dt; t.z += t.vz * dt;

    // Rebonds sur les bords (Rebond ; en duel, le terrain peut changer les bords)
    const r = s.rayon;
    const mur = () => {
      if (terrain === 'rebond') { // bords rebondissants : chaque bande ACCÉLÈRE la toupie (+35 %), sans perte de rotation.
        // Plafond proportionnel à sa vitesse de lancer (stat Élan) : une toupie d'élan va bien plus vite que les autres.
        const v = Math.max(Math.hypot(t.vx, t.vz), 1e-6), cible = Math.min(v * CHOC.rebondBoost, s.vitesse * CHOC.rebondPlafond);
        const k = Math.max(1, cible / v);
        t.vx *= k; t.vz *= k;
      } else if (terrain === 'collant') { // bords collants : la toupie s'englue
        t.vx *= 0.15; t.vz *= 0.15; t.rotation *= 0.96;
      } else { // bord ordinaire : un rebond élastique (stat Rebond) coûte moins de rotation qu'un choc mou
        t.vx *= s.rebond; t.vz *= s.rebond; t.rotation *= 1 - 0.015 * Math.max(0.1, (1 - s.rebond) / 0.4);
      }
      cb.mur?.(t);
    };
    // Terrain rebondissant : plateau CARRÉ (côtés plats face aux lanceurs, même distance au rail que le rond).
    // Dans un rond, une toupie qui va tout droit garde le même angle à chaque rebond et « orbite » sans jamais passer
    // au centre (24 % de duels sans contact en simulation) ; hexagone 7 %, losange 5 %, carré 2 %.
    if (duel && terrain === 'rebond') {
      for (let k = 0; k < 4; k++) {
        const nx = Math.round(Math.cos((k * Math.PI) / 2)), nz = Math.round(Math.sin((k * Math.PI) / 2));
        const d = t.x * nx + t.z * nz, lim = ARENE_R - r;
        if (d > lim) {
          t.x -= (d - lim) * nx; t.z -= (d - lim) * nz;
          const vn = t.vx * nx + t.vz * nz;
          if (vn > 0) { t.vx -= 2 * vn * nx; t.vz -= 2 * vn * nz; mur(); }
        }
      }
    }
    // Bord rond : on ramène la toupie dans le cercle et on la réfléchit sur la normale
    const dc = Math.hypot(t.x, t.z), lim = ARENE_R - r;
    if (dc > lim && !(duel && terrain === 'rebond')) {
      const nx = t.x / dc, nz = t.z / dc;
      t.x = nx * lim; t.z = nz * lim;
      const vn = t.vx * nx + t.vz * nz;
      if (vn > 0) { t.vx -= 2 * vn * nx; t.vz -= 2 * vn * nz; mur(); }
    }

    // Traînée de feu : une flamme tous les 3 cm parcourus
    if (s.feu) {
      t.flammeT += Math.hypot(t.vx, t.vz) * dt;
      if (t.flammeT > 0.03) { t.flammeT = 0; nouvelleFlamme(t.x, t.z, r * 0.75, s.feuDuree, s.feu * DEGATS_BASE * s.lames, t); }
    }

    // Tourbillon : portée mesurée depuis le BORD de la toupie (une toupie large attire aussi) ; la marge au-delà du bord
    // est celle d'une toupie standard (rayon 4,6 cm) : une toupie large ne gagne pas de portée en plus
    const portee = s.tornadeRayon - RAYON_STANDARD;
    if (s.tornade) for (const c of cafards) {
      if (c.mort || c.chute > 0) continue;
      const dx = t.x - c.x, dz = t.z - c.z, d = Math.hypot(dx, dz);
      if (d - r < portee && d > 0.001) { c.x += (dx / d) * s.tornade * ratio * dt; c.z += (dz / d) * s.tornade * ratio * dt; }
    }
    // En duel, il attire aussi la toupie adverse, comme une gravité : une ACCÉLÉRATION (elle garde son élan et sa trajectoire
    // se courbe), divisée par sa masse (une toupie légère est bien déviée, une lourde résiste), qui faiblit avec la distance
    if (s.tornade && duel) for (const o of toupies) {
      if (o.camp === t.camp || !enJeu(o)) continue;
      const dx = t.x - o.x, dz = t.z - o.z, d = Math.hypot(dx, dz), bord = d - r - o.s.rayon;
      if (bord < portee && d > 0.001) {
        const a = CHOC.tornadeToupie * s.tornade * ratio * (20 / o.s.masse) * (1 - Math.max(0, bord) / portee);
        o.vx += (dx / d) * a * dt; o.vz += (dz / d) * a * dt;
      }
    }

    // Chocs avec les cafards
    // Dégâts d'un impact sur un cafard = lames × élan RÉEL de la toupie (une toupie lancée fort frappe plus fort qu'une lente,
    // en absolu) × poids (une toupie lourde écrase mieux) × critique éventuel (dans frapperCafard)
    const vitesse = Math.hypot(t.vx, t.vz);
    // Élan : ×1 au minimum (toupie presque arrêtée), ×1,45 pour une toupie standard lancée à fond, jusqu'à ×2,1 très rapide
    const elan = 1 + 0.45 * Math.min(2.4, vitesse / 0.95);
    // Rotation : une toupie qui tourne à fond frappe plus fort qu'une toupie qui s'essouffle (×0,6 → ×1)
    const tourne = 0.6 + 0.4 * Math.max(0, t.rotation / t.rotationMax);
    const m = s.masse / 20, poids = Math.min(1.5, Math.max(0.7, Math.sqrt(m)));
    for (const c of cafards) {
      if (c.mort || c.chute > 0) continue;
      const dx = c.x - t.x, dz = c.z - t.z, d = Math.hypot(dx, dz), min = r + c.r * 0.85;
      if (d >= min + 0.004) continue;
      if (c.coup <= 0) {
        c.coup = 0.12;
        t.rotation -= CHOC.ref * 0.012 * s.inertie; // frapper coûte un peu de rotation, en tr/min absolus (moins avec l'Inertie)
        frapperCafard(t, c, DEGATS_BASE * s.lames * elan * poids * tourne * (0.9 + Math.random() * 0.2), cb);
      }
      if (d > 0 && d < min) { // on se sépare et on se repousse
        const nx = dx / d, nz = dz / d, chev = min - d, mc = 0.5 * c.masse;
        const fixe = c.t.fixe; // mannequin : c'est la toupie qui rebondit, entièrement
        t.x -= nx * chev * (fixe ? 1 : mc / (m + mc)); t.z -= nz * chev * (fixe ? 1 : mc / (m + mc));
        if (!fixe) { c.x += nx * chev * (m / (m + mc)); c.z += nz * chev * (m / (m + mc)); }
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
    if (usureActive) {
      t.age += dt;
      const usure = duel && CHOC.usureTassee ? 0.12 ** CHOC.usureTassee * s.usure ** (1 - CHOC.usureTassee) : s.usure;
      t.rotation -= t.rotation * usure * (duel ? CHOC.usureDuel : 1) * dt;
    }
    if (t.age > 25) t.rotation -= t.rotation * 0.08 * (t.age - 25) * dt;
    if (t.rotation < t.rotationMax * (duel ? Math.min(s.seuilChute, CHOC.seuilMaxDuel) : s.seuilChute)) { t.tombe = 0.001; cb.chute?.(t); }
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
    // Vitesses d'approche AVANT le rebond (après, l'attaquant repart en arrière et sa charge ne compterait plus)
    const approcheA = Math.max(0, a.vx * nx + a.vz * nz), approcheB = Math.max(0, -(b.vx * nx + b.vz * nz));
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
    const contact = { x: (a.x + b.x) / 2, z: (a.z + b.z) / 2 };
    frapperToupie(a, b, approcheA, cb, contact);
    frapperToupie(b, a, approcheB, cb, contact);
    a.flash = b.flash = 1;
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
    // Flash d'impact : la toupie « gonfle » un instant
    t.flash = Math.max(0, (t.flash || 0) - dt * 7);
    const g = 1 + 0.18 * t.flash;
    t.mesh.racine.scale.set(t.echelle * g, g * HAUTEUR_VUE, t.echelle * g);
  }
}

// Une toupie en frappe une autre : la cible perd de la rotation (moins avec l'Inertie, plus si l'attaquant est lourd)
// approche : vitesse à laquelle l'attaquant fonce sur la cible (m/s)
function frapperToupie(att, cible, approche, cb, contact) {
  const ref = CHOC.ref ** (1 - CHOC.partRelative) * cible.rotationMax ** CHOC.partRelative;
  let perte = ref * (CHOC.base + CHOC.parLames * att.s.lames + CHOC.parVitesse * Math.min(approche, CHOC.approcheMax))
    * (2 * att.s.masse / (att.s.masse + cible.s.masse)) ** CHOC.masseDuel * cible.s.inertie ** CHOC.inertieDuel * (0.5 + 0.5 * att.rotation / att.rotationMax);
  let crit = false;
  if (att.s.crit && Math.random() < att.s.crit * 0.5) { perte *= 1.5; crit = true; } // critiques moins forts en duel
  if (CHOC.glissant) perte /= 1 + CHOC.glissant * Math.max(0, Math.hypot(cible.vx, cible.vz) - 0.5);
  if (CHOC.recul) att.rotation -= (perte / cible.rotationMax) * att.rotationMax * CHOC.recul * Math.min(2, Math.max(0, att.s.seuilChute / cible.s.seuilChute - 1)); // une toupie plus stable que son attaquant ne bronche pas : c'est lui qui recule
  if (cible.carapace && perte / cible.rotationMax > 0.04) { cible.carapace = false; cb.choc?.(att, cible, 0, true, false, contact); return; }
  cible.rotation -= perte;
  cb.choc?.(att, cible, perte, false, crit, contact);
}

function animerChute(t, dt) {
  t.tombe += dt;
  const k = Math.min(1, t.tombe / 0.9); // chute plus longue : on la voit
  t.mesh.inclinaison.rotation.x = k * k * 1.45;
  t.mesh.racine.position.y = k * 0.01;
  t.vx *= 0.9; t.vz *= 0.9;
}
