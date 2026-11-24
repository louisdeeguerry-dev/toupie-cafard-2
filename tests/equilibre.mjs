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
// Priorité de terrain
const a = { terrain: 'rebond', niveaux: { priorite: 3 } }, b = { terrain: 'collant', niveaux: { priorite: 4 } }, c = { terrain: 'aucun', niveaux: {} };
const ok = (cond, msg) => { if (!cond) { console.log('✗ ' + msg); erreurs++; } };
ok(terrainDuel(a, b).terrain === 'collant', '4 points battent 3 points');
ok(terrainDuel({ ...a, niveaux: { priorite: 3 } }, { ...b, niveaux: { priorite: 2 } }).terrain === 'rebond', '3 points battent 2 points');
ok(terrainDuel(a, c).terrain === 'rebond', 'seul terrain choisi');
ok(terrainDuel(c, c).terrain === null, 'aucun terrain = bureau neutre');
ok(terrainDuel({ ...a, niveaux: { priorite: 2 } }, { ...b, niveaux: { priorite: 2 } }).terrain === null, 'égalité de priorité = bureau neutre');
// Boîtes : les terrains sortent seulement en rare+, jamais en double
import { tirerBoite } from '../src/data/pieces.js';
const vus = {};
for (let i = 0; i < 20000; i++) { const l = tirerBoite([]); if (l.type === 'terrain') vus[l.terrain.id] = (vus[l.terrain.id] || 0) + 1; }
ok(vus.rebond && vus.collant && vus.cuve && !vus.aucun, 'les 3 terrains sortent des boîtes : ' + JSON.stringify(vus));
for (let i = 0; i < 5000; i++) { const l = tirerBoite(['rebond', 'collant', 'cuve']); if (l.type === 'terrain') { ok(false, 'terrain en double'); break; } }
console.log(erreurs ? `${erreurs} erreur(s)` : `OK : ${PIECES.length} pièces équilibrées sur ${NIVEAU_PIECE_MAX} niveaux, priorité de terrain correcte`);
process.exit(erreurs ? 1 : 0);
