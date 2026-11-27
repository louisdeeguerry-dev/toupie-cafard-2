// Simulateur de duels SANS affichage : le vrai moteur (src/physics.js) tourne en boucle dans la page, sans attendre les images.
// Chaque build affronte tous les autres (pièces niveau 3 choisies pour ses stats + niveaux achetés en boutique),
// sur le bureau neutre et sur le terrain rebondissant. Sortie : taux de victoire, contacts et durée par build.
// Lancer d'abord : python3 -m http.server 8123   puis : node tests/duels-sim.js [duels par paire = 100] [niveaux achetés = 15]
const { chromium } = require('playwright');
const N = +(process.argv[2] || 100), ACHATS = +(process.argv[3] || 15);
const BUILDS = {
  defaut: [],
  elan: ['elan', 'rebond', 'glisse', 'poids'],
  elanMixte: ['elan', 'endurance', 'glisse', 'poids'], // Élan + Endurance achetée (joueur avisé)
  puissance: ['puissance', 'endurance', 'inertie', 'equilibre'],
  lames: ['lames', 'critique', 'diametre', 'poids'],
  endurance: ['endurance', 'equilibre', 'inertie', 'souffle'],
  critique: ['critique', 'lames', 'precision', 'feu'],
  agressivite: ['agressivite', 'lames', 'elan', 'poids'],
};
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 400, height: 300 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/'); await p.waitForTimeout(1500);
  const REGLAGES = JSON.parse(process.env.CHOC || '{}'), MARGE = !!process.env.MARGE, DIAG = process.env.DIAG || ''; // ex. CHOC='{"cuvette":0.4}' pour essayer des réglages sans toucher au code
  const res = await p.evaluate(async ({ BUILDS, N, ACHATS, REGLAGES, MARGE, DIAG }) => {
    __tc2.acceleration = 0; // le jeu affiché ne bouge plus pendant la simulation
    const ph = await import('./src/physics.js');
    Object.assign(ph.CHOC, REGLAGES);
    const { PIECES } = await import('./src/data/pieces.js');
    const { RAIL_XMAX, railZ } = await import('./src/config.js');
    const base = { ...__tc2.save().equipe };
    // Équipement et achats de chaque build
    const B = {};
    for (const [nom, veut] of Object.entries(BUILDS)) {
      const eq = { ...base }, score = pc => veut.reduce((x, id, i) => x + (pc.niveaux[id] || 0) * (4 - i), 0);
      for (const slot of Object.keys(eq)) {
        const best = PIECES.filter(pc => pc.slot === slot).sort((a, c) => score(c) - score(a))[0];
        if (best && score(best) > 0) eq[slot] = best.id;
      }
      const niv = Object.fromEntries(Object.values(eq).map(id => [id, 3]));
      // Achats : 60 % dans la 1re stat, 40 % dans la 2e (le build « défaut » répartit sur endurance et lames)
      const [s1 = 'endurance', s2 = 'lames'] = veut;
      B[nom] = { eq, niv, achats: { [s1]: Math.round(ACHATS * 0.6), [s2]: Math.round(ACHATS * 0.4) } };
    }
    const noms = Object.keys(B), stats = {};
    for (const n of noms) stats[n] = { v: 0, d: 0, contacts: 0, duree: 0, chrono: 0, neutre: { v: 0, d: 0 }, rebond: { v: 0, d: 0 } };
    const rnd = (a, c) => a + Math.random() * (c - a);
    function duel(A, Bb, terrain) {
      ph.viderToupies(); ph.choisirTerrain(terrain); ph.modeDuel(true);
      const a = ph.creerToupieJeu(A.eq, A.achats, 'joueur', A.niv, { duel: true });
      const c = ph.creerToupieJeu(Bb.eq, Bb.achats, 'adverse', Bb.niv, { duel: true });
      // Chacun lance depuis son rail, vers le centre à peu près (comme les bots), puissance 0,75 à 1
      for (const [t, haut] of [[a, false], [c, true]]) {
        const x = rnd(-0.8, 0.8) * RAIL_XMAX, z = railZ(x, haut) * 0.92, ang = Math.atan2(-z, -x) + rnd(-0.35, 0.35);
        ph.lancerToupie(t, x, z, Math.cos(ang), Math.sin(ang), rnd(0.75, 1));
      }
      let contacts = 0, temps = 0, chocsA = 0, chocsC = 0;
      const cb = { choc: (att, cible, perte) => { contacts++; if (cible === a) chocsA += perte / a.rotationMax; else chocsC += perte / c.rotationMax; } };
      const dt = 1 / 60;
      while (temps < 25) {
        ph.majToupies(dt, cb); temps += dt;
        if (!ph.enJeu(a) || !ph.enJeu(c)) break;
      }
      // Arbitrage comme src/match.js : la première arrêtée perd ; au chrono, la plus forte rotation relative gagne
      let gagneA;
      if (!ph.enJeu(a) && !ph.enJeu(c)) gagneA = a.rotation / a.rotationMax >= c.rotation / c.rotationMax;
      else if (!ph.enJeu(a) || !ph.enJeu(c)) gagneA = ph.enJeu(a);
      else gagneA = a.rotation / a.rotationMax >= c.rotation / c.rotationMax;
      const egalite = Math.abs(a.rotation / a.rotationMax - c.rotation / c.rotationMax) < 1e-6;
      const fin = temps >= 25 ? 'chrono' : !ph.enJeu(a) && !ph.enJeu(c) ? 'les deux' : !ph.enJeu(a) ? 'A tombe' : 'B tombe';
      return { gagneA, egalite, contacts: contacts / 2, temps, chrono: temps >= 25, fin, chocsA, chocsC, finA: a.rotation / a.rotationMax, finC: c.rotation / c.rotationMax };
    }
    // Mode DIAG (ex. DIAG=elan:defaut:neutre) : pourquoi A gagne ou perd contre B
    if (DIAG) {
      const [na, nb, tr] = DIAG.split(':'), terrain = tr === 'rebond' ? 'rebond' : null, r = { v: 0, fins: {}, contacts: 0, temps: 0, chocsA: 0, chocsC: 0, finA: 0, finC: 0 };
      for (let k = 0; k < N; k++) {
        const d = duel(B[na], B[nb], terrain);
        r.v += d.gagneA ? 1 : 0; r.fins[d.fin] = (r.fins[d.fin] || 0) + 1;
        for (const x of ['contacts', 'temps', 'chocsA', 'chocsC', 'finA', 'finC']) r[x] += d[x] / N;
      }
      ph.viderToupies(); ph.choisirTerrain(null); ph.modeDuel(false);
      return { diag: r, stats: {}, equipes: {}, marges: {} };
    }
    for (const terrain of [null, 'rebond']) for (let i = 0; i < noms.length; i++) for (let j = 0; j < noms.length; j++) {
      if (i === j) continue;
      for (let k = 0; k < N / 2; k++) {
        const r = duel(B[noms[i]], B[noms[j]], terrain);
        for (const [n, g] of [[noms[i], r.gagneA], [noms[j], !r.gagneA]]) {
          const s = stats[n], t = terrain ? s.rebond : s.neutre;
          if (g) { s.v++; t.v++; } else { s.d++; t.d++; }
          s.contacts += r.contacts; s.duree += r.temps; s.chrono += r.chrono ? 1 : 0;
        }
      }
    }
    // Mode MARGE : valeur d'un niveau de chaque stat en duel (+6 puis −6 niveaux contre une toupie standard)
    const marges = {};
    if (MARGE) for (const st of ['endurance', 'diametre', 'poids', 'glisse', 'lames', 'inertie', 'equilibre', 'rebond', 'agressivite', 'critique', 'puissance', 'elan', 'precision']) {
      const r = [];
      for (const d of [2, -2]) {
        let v = 0;
        const A = { eq: base, niv: {}, achats: { [st]: d } }, Z = { eq: base, niv: {}, achats: {} };
        // côtés alternés ; une égalité parfaite (même rotation restante) compte pour moitié
        for (const terrain of [null, 'rebond']) for (let k = 0; k < N; k++) {
          const r1 = k % 2 ? duel(A, Z, terrain) : duel(Z, A, terrain), gA = k % 2 ? r1.gagneA : !r1.gagneA;
          v += r1.egalite ? 0.5 : gA ? 1 : 0;
        }
        r.push(Math.round((100 * v) / (2 * N)));
      }
      marges[st] = r;
    }
    ph.viderToupies(); ph.choisirTerrain(null); ph.modeDuel(false);
    return { marges, stats, equipes: Object.fromEntries(noms.map(n => [n, B[n].eq])) };
  }, { BUILDS, N, ACHATS, REGLAGES, MARGE, DIAG });
  if (res.diag) { const d = res.diag; console.log(`DIAG ${DIAG} : A gagne ${Math.round(100 * d.v / N)} % · fins ${JSON.stringify(d.fins)} · contacts ${d.contacts.toFixed(1)} · durée ${d.temps.toFixed(1)} s · pertes par chocs A ${(100 * d.chocsA).toFixed(0)} % / B ${(100 * d.chocsC).toFixed(0)} % · rotation finale A ${(100 * d.finA).toFixed(0)} % / B ${(100 * d.finC).toFixed(0)} %`); await b.close(); return; }
  console.log(`| Build | Victoires | Bureau neutre | Terrain rebondissant | Contacts / duel | Durée moy. (s) | Fin au chrono |`);
  console.log('|---|---|---|---|---|---|---|');
  for (const [n, s] of Object.entries(res.stats)) {
    const tot = s.v + s.d, pc = o => Math.round((100 * o.v) / Math.max(1, o.v + o.d)) + ' %';
    console.log(`| ${n} | ${pc(s)} | ${pc(s.neutre)} | ${pc(s.rebond)} | ${(s.contacts / tot).toFixed(1)} | ${(s.duree / tot).toFixed(1)} | ${Math.round((100 * s.chrono) / tot)} % |`);
  }
  if (MARGE) for (const [st, [plus, moins]] of Object.entries(res.marges)) console.log(`MARGE ${st.padEnd(12)} +2 niv : ${plus} % · −2 niv : ${moins} %`);
  if (process.env.EQUIPES) console.log(JSON.stringify(res.equipes));
  console.log('ERREURS', JSON.stringify(errs));
  await b.close();
})();
