// Vérifie la règle d'équilibrage : chaque pièce a autant de bonus que de malus (somme des niveaux = 0),
// à tous les niveaux de pièce (doublons). Lancer : node tests/equilibre.mjs
import { PIECES, niveauxPiece, NIVEAU_PIECE_MAX, POIDS_EQUILIBRAGE } from '../src/data/pieces.js';
import { terrainDuel } from '../src/data/terrains.js';
let erreurs = 0;
for (const p of PIECES) for (let k = 1; k <= NIVEAU_PIECE_MAX; k++) {
  const n = Object.entries(niveauxPiece(p, k)).map(([s, v]) => v * (POIDS_EQUILIBRAGE[s] || 1));
  const somme = n.reduce((a, v) => a + v, 0), bonus = n.filter(v => v > 0).reduce((a, v) => a + v, 0);
  // niveau 1 : équilibre exact ; niveaux suivants : seuls les arrondis peuvent créer un petit écart
  if (k === 1 ? somme !== 0 : Math.abs(somme) > Math.max(1, 0.25 * bonus)) { console.log(`✗ ${p.id} niv ${k} : somme ${somme}`); erreurs++; }
}
// Toutes les stats doivent être exploitables : chaque stat est un BONUS d'au moins une pièce
import { STATS } from '../src/stats.js';
for (const st of STATS) if (!PIECES.some(p => (p.niveaux[st.id] || 0) > 0)) { console.log(`✗ aucune pièce ne donne ${st.nom}`); erreurs++; }
// Priorité de terrain
const a = { terrain: 'rebond', niveaux: { priorite: 3 } }, b = { terrain: 'collant', niveaux: { priorite: 4 } }, c = { terrain: 'aucun', niveaux: {} };
const ok = (cond, msg) => { if (!cond) { console.log('✗ ' + msg); erreurs++; } };
ok(terrainDuel(a, b).terrain === 'collant', '4 points battent 3 points');
ok(terrainDuel({ ...a, niveaux: { priorite: 3 } }, { ...b, niveaux: { priorite: 2 } }).terrain === 'rebond', '3 points battent 2 points');
ok(terrainDuel(a, c).terrain === 'rebond', 'seul terrain choisi');
ok(terrainDuel(c, c).terrain === null, 'aucun terrain = bureau neutre');
ok(terrainDuel({ ...a, niveaux: { priorite: 2 } }, { ...b, niveaux: { priorite: 2 } }).terrain === null, 'égalité de priorité = bureau neutre');
// Boîtes : les terrains sortent seulement en rare+, jamais en double
import { tirerBoite, GARANTIE_LEGENDAIRE } from '../src/data/pieces.js';
const vus = {}, N = 200000;
for (let i = 0; i < N; i++) { const l = tirerBoite([]); if (l.type === 'terrain') vus[l.terrain.id] = (vus[l.terrain.id] || 0) + 1; }
ok(vus.rebond && vus.collant && vus.cuve && !vus.aucun, 'les 3 terrains sortent des boîtes');
const ch = Object.values(vus), ecart = (Math.max(...ch) - Math.min(...ch)) / (N / 200);
ok(ecart < 0.3, 'même chance pour chaque terrain : ' + JSON.stringify(vus));
for (let i = 0; i < 5000; i++) { const l = tirerBoite(['rebond', 'collant', 'cuve']); if (l.type === 'terrain') { ok(false, 'terrain en double'); break; } }
// Garantie : une boîte garantie est toujours légendaire, et peut donner autre chose qu'un terrain
const garanties = Array.from({ length: 2000 }, () => tirerBoite([], { garantie: true }));
ok(garanties.every(l => l.rarete === 'legendaire'), 'boîte garantie = toujours légendaire');
ok(garanties.some(l => l.type === 'piece') && garanties.some(l => l.type === 'coffre') && garanties.some(l => l.type === 'terrain'), 'lots légendaires variés (pièces, coffre, terrains)');
// Simulation joueur : boîtes ouvertes avant de trouver tous les terrains (avec la garantie de ${GARANTIE_LEGENDAIRE})
const essais = [];
for (let e = 0; e < 2000; e++) {
  let poss = [], sans = 0, n = 0;
  while (poss.length < 3) { n++; const l = tirerBoite(poss, { garantie: sans >= GARANTIE_LEGENDAIRE - 1 }); sans = l.rarete === 'legendaire' ? 0 : sans + 1; if (l.type === 'terrain') poss.push(l.terrain.id); }
  essais.push(n);
}
essais.sort((x, y) => x - y);
console.log(`Boîtes pour trouver les 3 terrains : médiane ${essais[1000]}, 90 % des joueurs en moins de ${essais[1800]}`);
console.log(erreurs ? `${erreurs} erreur(s)` : `OK : ${PIECES.length} pièces équilibrées sur ${NIVEAU_PIECE_MAX} niveaux, priorité de terrain correcte`);
process.exit(erreurs ? 1 : 0);
