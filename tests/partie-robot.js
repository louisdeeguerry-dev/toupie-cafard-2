// Partie complète jouée par un robot (Playwright). Lancer d'abord : python3 -m http.server 8123
// Puis : node tests/partie-robot.js <dossier-captures>
// Partie complète jouée par un robot : vérifie qu'une partie va jusqu'au bout sans erreur
const { chromium } = require('playwright');
const OUT = process.argv[2], W = +process.argv[3] || 1280, H = +process.argv[4] || 760;
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: W, height: H } });
  const errs = [];
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push('PAGEERROR ' + e.message));
  await p.goto('http://localhost:8123/');
  await p.evaluate(() => localStorage.clear());
  await p.reload(); await p.waitForTimeout(800);
  await p.screenshot({ path: OUT + '/a-atelier.png' });
  await p.evaluate(() => { __tc2.acceleration = 8; __tc2.sansConfirmation = true; });
  await p.click('#jouer');
  const t0 = Date.now(); let duelShot = false, shopShot = false; const journal = [];
  while (Date.now() - t0 < 420000) {
    await p.waitForTimeout(250);
    const e = await p.evaluate(() => {
      const P = __tc2.partie, { cafards, toupies } = __tc2.interne;
      const vis = id => !document.getElementById(id).classList.contains('cache');
      if (vis('fin')) return { fin: true, place: P.moi.place, manche: P.manche, vague: P.vague };
      if (vis('bilan')) {
        // achats : alterne bureau / toupie
        const btns = [...document.querySelectorAll('#bilanContenu .amelio:not([disabled])')];
        if (btns.length) btns[Math.floor(Math.random() * btns.length)].click();
        if (Math.random() < 0.6 || !document.querySelectorAll('#bilanContenu .amelio:not([disabled])').length) { document.getElementById('pret').click(); return { bilan: true, manche: P.manche, vies: P.moi.vies, argent: P.argent, t: Math.round(P.tempsJeu), bots: P.joueurs.filter(j=>j.bot&&!j.elimine).length }; }
        return { achat: true };
      }
      if (P.phase === 'jeu') {
        const moi = toupies.find(t => t.camp === 'joueur');
        if (moi && (!moi.lancee || moi.tombe) && P.lancers > 0) {
          if (P.type === 'duel') { __tc2.lancerDirect((Math.random() - .5) * .6, 0, -1, 0.85 + Math.random() * .2); return { lance: 'duel' }; }
          const c = cafards.filter(c => !c.mort && c.chute <= 0);
          if (c.length) { const k = c[Math.floor(Math.random() * c.length)]; __tc2.lancerDirect(k.x, 0.0001, -1, 0.9); return { lance: 'cafards' }; }
        }
      }
      return { type: P.type, phase: P.phase };
    });
    if (e.bilan) journal.push(`manche ${e.manche} vies ${e.vies} argent ${e.argent} tempsJeu ${e.t}s bots ${e.bots}`);
    if (e.achat && !shopShot) { shopShot = true; await p.screenshot({ path: OUT + '/c-boutique.png' }); }
    if (e.lance === 'duel' && !duelShot) { duelShot = true; await p.waitForTimeout(500); await p.screenshot({ path: OUT + '/b-duel.png' }); }
    if (e.fin) { journal.push(`FIN place ${e.place}, manches ${e.manche}, vagues ${e.vague}, ${(Date.now() - t0) / 1000}s réelles (x4)`); await p.waitForTimeout(800); await p.screenshot({ path: OUT + '/d-fin.png' }); break; }
  }
  console.log(journal.join('\n'));
  console.log('ERREURS', JSON.stringify(errs));
  await b.close();
})();
