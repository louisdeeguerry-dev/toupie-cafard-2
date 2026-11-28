// ROBOT MALIN : chaque build garde sa spécialité, mais COMPENSE ses faiblesses comme un joueur réfléchi :
// s'il écrase trop peu de cafards (moins de 3 par lancer en moyenne), il achète des dégâts (Lames, Élan, Diamètre) ;
// s'il perd ses duels, il achète de quoi tenir (Endurance, Lames, Inertie). Sinon, il renforce sa spécialité.
// node tests/builds-malins.js <build>   ou   STRATS="nid elan …" SCRIPT=builds-malins.js tests/lancer-strategies.sh N P dossier
// (repris de tests/builds.js) Compare des BUILDS de toupie (élan, puissance, lames, endurance, critique, agressivité, combo) en x100.
// Chaque build équipe les pièces (niveau 3) qui donnent le plus de ses stats, puis n'achète que ses stats en boutique.
// Lancer d'abord : python3 -m http.server 8123   puis : node tests/builds.js <build>
// (ou STRATS="elan puissance …" SCRIPT=builds.js tests/lancer-strategies.sh N P dossier).
const BUILDS = {
  nid: ['nid', 'prime', 'tirelire'],
  elan: ['elan', 'glisse', 'rebond'],
  puissance: ['puissance', 'inertie', 'equilibre'],
  lames: ['lames', 'diametre', 'poids'],
  endurance: ['endurance', 'equilibre', 'inertie'],
  critique: ['critique', 'precision', 'lames'],
  agressivite: ['agressivite', 'lames', 'poids'],
  chance: ['veine', 'prime', 'combo'],
  combo: ['combo', 'prime', 'nid'],
  feu: ['feu', 'souffle', 'tornade'],
};
// eco : bureau d'abord, toupie à partir de l'étape 3 ; sacrifice : pareil + perd exprès les duels des étapes 1-2 ;
// force : toupie et lanceur seulement ; mixte : alterne. Dernière ligne affichée : RESULT {json}.
const { chromium } = require('playwright');
const STRAT = process.argv[2] || 'elan';
const VEUT = BUILDS[STRAT];
(async () => {
  const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader'] });
  const p = await b.newPage({ viewport: { width: 900, height: 600 } });
  const errs = []; p.on('pageerror', e => errs.push(e.message));
  await p.goto('http://localhost:8123/');
  await p.evaluate(() => localStorage.clear()); await p.reload(); await p.waitForTimeout(500);
  await p.evaluate(() => { __tc2.acceleration = 100; __tc2.sansConfirmation = true; const s = __tc2.save(); s.tutoFait = true; document.getElementById('jouer').textContent = 'JOUER ▶'; });
  // Pièces du build : pour chaque emplacement, la pièce qui donne le plus des stats voulues (pondérées par l'ordre)
  const equipe = await p.evaluate(async ([VEUT, STRAT]) => {
    const { PIECES } = await import('./src/data/pieces.js'), s = __tc2.save();
    const score = pc => VEUT.reduce((x, id, i) => x + (pc.niveaux[id] || 0) * (4 - i), 0);
    for (const slot of Object.keys(s.equipe)) {
      const best = PIECES.filter(pc => pc.slot === slot).sort((a, b) => score(b) - score(a))[0];
      if (best && score(best) > 0) { s.equipe[slot] = best.id; s.collection[best.id] = Math.max(3, s.collection[best.id] || 0); }
    }
    for (const id of Object.values(s.equipe)) s.niveauxPieces[id] = 3;
    
    return s.equipe;
  }, [VEUT, STRAT]);
  console.log('EQUIPE ' + JSON.stringify(equipe));
  await p.click('#jouer');
  const t0 = Date.now(), vagues = [];
  const R = { strat: STRAT, place: null, manches: 0, vagues: 0, vaguesOk: 0, okParEtape: {}, totParEtape: {}, duelsGagnes: 0, duelsPerdus: 0, argentMax: 0 };
  while (Date.now() - t0 < 1500000) {
    await p.waitForTimeout(200);
    const e = await p.evaluate(([STRAT, VEUT]) => {
      const P = __tc2.partie, { cafards } = __tc2.interne;
      const vis = id => !document.getElementById(id).classList.contains('cache');
      if (vis('fin')) return { fin: true, place: P.moi.place, manche: P.manche };
      if (vis('bilan')) {
        const etape = Math.floor(P.manche / 4) + 1;
        // Mémoire du robot : cafards écrasés aux derniers lancers, résultat des derniers duels (lus une fois par bilan)
        const M = (window.__robot ||= { tues: [], duels: [], vu: -1 });
        const resume = document.querySelector('#bilanContenu .resume')?.textContent || '';
        if (M.vu !== P.manche) {
          M.vu = P.manche;
          const k = resume.match(/Lancer \d\/\d : (\d+)/); if (k) M.tues.push(+k[1]);
          if (/Victoire/.test(resume)) M.duels.push(1); else if (/Défaite/.test(resume)) M.duels.push(0);
        }
        const moyTues = M.tues.length >= 3 ? M.tues.slice(-3).reduce((x, y) => x + y, 0) / 3 : 9;
        const perd = M.duels.slice(-2).includes(0);
        const DEGATS = ['lames', 'elan', 'diametre'], SURVIE = ['endurance', 'lames', 'inertie'];
        // Score de chaque offre : spécialité (1re stat 3, autres 2), compensation 3,5 si besoin (prioritaire : un joueur réfléchi change de cap), économie au début
        const score = id => (VEUT[0] === id ? 3 : VEUT.includes(id) ? 2 : 0)
          + (moyTues < 3 && DEGATS.includes(id) ? 3.5 : 0) + (perd && SURVIE.includes(id) ? 3.5 : 0)
          + (etape < 2 && ['prime', 'tirelire'].includes(id) ? 1 : 0);
        const btns = [...document.querySelectorAll('#bilanContenu .offre:not([disabled])')].filter(x => score(x.dataset.a) > 0);
        const px = x => parseInt(x.querySelector('.px').textContent);
        btns.sort((a, c) => score(c.dataset.a) - score(a.dataset.a) || px(a) - px(c));
        if (btns.length) { btns[0].click(); return { achat: true }; }
        // Rien d'intéressant : relance si l'argent le permet (en gardant de quoi toucher des intérêts au début pour l'éco)
        const rel = document.getElementById('relancer'), prixR = parseInt((rel?.textContent || '').replace(/\D+/g, ' ').trim().split(' ').pop());
        const garde = etape < 3 ? 5 : 0;
        if (rel && !rel.disabled && P.argent - prixR >= garde + 4 && (P.relancesRobot = (P.relancesRobot || 0) + 1) < 200) { rel.click(); return { relance: true }; }
        const res = document.querySelector('#bilanContenu .resume')?.textContent || '';
        document.getElementById('pret').click();
        return { bilan: true, res, manche: P.manche, etape: Math.floor((P.manche - 1) / 4) + 1, vies: P.moi.vies, argent: P.argent };
      }
      if (P.phase === 'jeu' && P.lancers > 0 && !P.mesToupies.some(t => t.lancee && !t.tombe)) {
        if (P.type === 'duel') {
          // « sacrifice » : perd exprès les duels des étapes 1 et 2 (lancer mou dans un coin)
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
    }, [STRAT, VEUT]);
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
