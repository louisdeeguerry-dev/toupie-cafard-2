// Compare des stratégies d'achat (eco, sacrifice, mixte, force) avec un robot qui vise comme un bon joueur.
// Lancer d'abord : python3 -m http.server 8123   puis : node tests/strategies.js <eco|sacrifice|mixte|force>
// (ou tests/lancer-strategies.sh pour plusieurs parties par stratégie, avec synthèse).
// eco : bureau d'abord, toupie à partir de l'étape 3 ; sacrifice : pareil + perd exprès les duels des étapes 1-2 ;
// force : toupie et lanceur seulement ; mixte : alterne. Dernière ligne affichée : RESULT {json}.
const { chromium } = require('playwright');
const STRAT = process.argv[2] || 'mixte';
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/');
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => { __tc2.acceleration = 100; __tc2.sansConfirmation = true; });
  await p.click('#jouer');
  const t0 = Date.now(), vagues = [];
  const R = { strat: STRAT, place: null, manches: 0, vagues: 0, vaguesOk: 0, okParEtape: {}, totParEtape: {}, duelsGagnes: 0, duelsPerdus: 0, argentMax: 0 };
  while (Date.now() - t0 < 1500000) {
    await p.waitForTimeout(200);
    const e = await p.evaluate(STRAT => {
      const P = __tc2.partie, { cafards } = __tc2.interne;
      const vis = id => !document.getElementById(id).classList.contains('cache');
      if (vis('fin')) return { fin: true, place: P.moi.place, manche: P.manche };
      if (vis('bilan')) {
        const etape = Math.floor(P.manche / 4) + 1;
        const BUREAU = ['nid', 'prime', 'combo', 'tirelire', 'chance'], TOUPIE = ['lames', 'endurance', 'elan', 'critique', 'diametre', 'puissance'];
        const veut = (STRAT === 'eco' || STRAT === 'sacrifice') ? (etape < 3 ? BUREAU : TOUPIE) : STRAT === 'force' ? TOUPIE : (P.manche % 2 ? BUREAU : TOUPIE);
        // achète le moins cher disponible dans la liste voulue
        const btns = [...document.querySelectorAll('#bilanContenu .offre:not([disabled])')].filter(x => veut.includes(x.dataset.a));
        btns.sort((a, c) => parseInt(a.querySelector('.px').textContent) - parseInt(c.querySelector('.px').textContent));
        if (btns.length) { btns[0].click(); return { achat: true }; }
        const res = document.querySelector('#bilanContenu .resume')?.textContent || '';
        document.getElementById('pret').click();
        return { bilan: true, res, manche: P.manche, etape: Math.floor((P.manche - 1) / 4) + 1, vies: P.moi.vies, argent: P.argent };
      }
      if (P.phase === 'jeu' && P.lancers > 0 && !P.mesToupies.some(t => t.lancee && !t.tombe)) {
        if (P.type === 'duel') {
          // « sacrifice » : perd exprès les duels des étapes 1 et 2 (lancer mou dans un coin)
          if (STRAT === 'sacrifice' && P.manche < 8) { __tc2.lancerDirect(0.5, 1, -0.3, 0.02); return {}; }
          __tc2.lancerDirect((Math.random() - .5) * .6, 0, -1, 0.95); return {};
        }
        // Visée « bon joueur » : la ligne (position du lanceur + angle) qui traverse le plus de cafards
        const c = cafards.filter(c => !c.mort && c.chute <= 0);
        if (c.length) {
          let best = null, bs = -1;
          for (let x = -0.55; x <= 0.55; x += 0.05) for (let a = -0.7; a <= 0.7; a += 0.1) {
            const dx = Math.sin(a), dz = -Math.cos(a), z0 = 0.44;
            let n = 0;
            for (const k of c) { const px = k.x - x, pz = k.z - z0, proj = px * dx + pz * dz; if (proj > 0 && Math.abs(px * dz - pz * dx) < 0.06) n++; }
            if (n > bs) { bs = n; best = [x, dx, dz]; }
          }
          __tc2.lancerDirect(best[0], best[1], best[2], 0.95);
        }
      }
      return {};
    }, STRAT);
    if (false) vagues.push(`É${e.etape} ${e.res.replace(/Vague (réussie|ratée) : /, (m, x) => x === 'réussie' ? '✓ ' : '✗ ')} 💰${e.argent} ❤️${e.vies}`);
    if (e.bilan) vagues.push(`É${e.etape} ${/Lancer/.test(e.res) ? e.res.slice(0, 40) : (/Victoire/.test(e.res) ? 'duel ✓' : 'duel ✗')} 💰${e.argent} ❤️${e.vies}`);
    if (e.bilan) {
      R.argentMax = Math.max(R.argentMax, e.argent);
      if (/Lancer/.test(e.res)) {
        // okParEtape = cafards écrasés cumulés, totParEtape = nombre de lancers (→ moyenne par lancer)
        const tues = +(e.res.match(/: (\d+) cafard/) || [0, 0])[1];
        R.vagues++; R.vaguesOk += tues;
        R.totParEtape[e.etape] = (R.totParEtape[e.etape] || 0) + 1;
        R.okParEtape[e.etape] = (R.okParEtape[e.etape] || 0) + tues;
      } else if (/Victoire/.test(e.res)) R.duelsGagnes++; else R.duelsPerdus++;
    }
    if (e.fin) { vagues.push(`FIN ${STRAT} : place ${e.place}, manches ${e.manche}`); R.place = e.place; R.manches = e.manche; break; }
  }
  console.log(vagues.join('\n')); console.log('ERREURS', JSON.stringify(errs));
  R.erreurs = errs.length;
  console.log('RESULT ' + JSON.stringify(R));
  await b.close();
})();
