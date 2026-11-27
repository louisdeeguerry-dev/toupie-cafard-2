// Synthèse des parties jouées par tests/lancer-strategies.sh : place moyenne, réussite des vagues par étape, etc.
import fs from 'node:fs';
import path from 'node:path';
const dir = process.argv[2] || './resultats-strategies';
const res = {};
for (const f of fs.readdirSync(dir).filter(f => f.endsWith('.log'))) {
  const l = fs.readFileSync(path.join(dir, f), 'utf8').split('\n').find(x => x.startsWith('RESULT '));
  if (!l) { console.log(`(pas de résultat : ${f})`); continue; }
  const r = JSON.parse(l.slice(7));
  (res[r.strat] ||= []).push(r);
}
const moy = a => a.reduce((x, y) => x + y, 0) / a.length;
console.log('| Stratégie | Parties | Places | Place moyenne | Top 4 | Manches jouées (moy.) | Cafards / lancer | Cafards / lancer, étapes 1 / 2 / 3 / 4+ | Duels gagnés | Argent max (moy.) | Erreurs |');
console.log('|---|---|---|---|---|---|---|---|---|---|---|');
for (const s of Object.keys(res)) {
  const a = res[s]; if (!a) continue;
  const fini = a.filter(r => r.place);
  const parEtape = e => {
    let ok = 0, tot = 0;
    for (const r of a) for (const [k, v] of Object.entries(r.totParEtape)) if (e === 4 ? +k >= 4 : +k === e) { tot += v; ok += r.okParEtape[k] || 0; }
    return tot ? (ok / tot).toFixed(1) : '—';
  };
  console.log(`| ${s} | ${a.length} | ${fini.map(r => r.place).sort((x, y) => x - y).join(', ')} | ${moy(fini.map(r => r.place)).toFixed(1)} | ${fini.filter(r => r.place <= 4).length}/${fini.length} | ${moy(a.map(r => r.manches)).toFixed(1)} | ${(a.reduce((x, r) => x + r.vaguesOk, 0) / Math.max(1, a.reduce((x, r) => x + r.vagues, 0))).toFixed(1)} | ${[1, 2, 3, 4].map(parEtape).join(' / ')} | ${a.reduce((x, r) => x + r.duelsGagnes, 0)}/${a.reduce((x, r) => x + r.duelsGagnes + r.duelsPerdus, 0)} | ${Math.round(moy(a.map(r => r.argentMax)))} | ${a.reduce((x, r) => x + r.erreurs, 0)} |`);
}
