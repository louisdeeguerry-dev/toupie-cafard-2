// Anti-cache : ajoute à chaque module une empreinte de son contenu (?v=…) via la carte d'imports de index.html.
// Ainsi, dès qu'un fichier change, le navigateur télécharge la nouvelle version (plus besoin de vider le cache).
// À lancer avant chaque publication : node outils/versionner.mjs
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { join, relative } from 'node:path';

const racine = new URL('..', import.meta.url).pathname;
const fichiers = [];
const parcourir = d => { for (const f of readdirSync(d)) { const p = join(d, f); if (statSync(p).isDirectory()) parcourir(p); else if (p.endsWith('.js')) fichiers.push(p); } };
parcourir(join(racine, 'src'));
parcourir(join(racine, 'vendor', 'jsm'));
const empreinte = p => createHash('md5').update(readFileSync(p)).digest('hex').slice(0, 8);
const imports = { three: './vendor/three.module.js?v=' + empreinte(join(racine, 'vendor', 'three.module.js')) };
for (const p of fichiers) { const r = './' + relative(racine, p); imports[r] = r + '?v=' + empreinte(p); }
const carte = `<script type="importmap">${JSON.stringify({ imports })}</script>`;
let html = readFileSync(join(racine, 'index.html'), 'utf8');
html = html.replace(/<script type="importmap">[\s\S]*?<\/script>/, carte);
html = html.replace(/<script type="module" src="src\/main\.js[^"]*"><\/script>/, `<script type="module" src="src/main.js?v=${empreinte(join(racine, 'src', 'main.js'))}"></script>`);
writeFileSync(join(racine, 'index.html'), html);
console.log(`${fichiers.length + 1} modules versionnés`);
