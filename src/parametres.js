// Paramètres du joueur (image et son), gardés dans le navigateur
import { reglerGraphismes } from './scene.js';
import { reglerVolumes } from './audio.js';

const CLE = 'tc2-parametres';
// Qualité « auto » (par défaut) : on part de « moyenne » sur téléphone, « haute » sur ordinateur, et on descend tout seul
// d'un cran si les images saccadent (moins de ~36 images/s pendant 3 s). Le cran atteint est retenu pour la fois suivante.
const CRANS = ['haute', 'moyenne', 'basse', 'minimale'];
const tactile = typeof matchMedia === 'function' && matchMedia('(pointer: coarse)').matches;
const DEFAUT = { qualite: 'auto', cranAuto: tactile ? 'moyenne' : 'haute', ombres: true, halo: true, secousses: true, effets: 80, musique: 60 };
export const parametres = (() => { try { return { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE) || '{}') }; } catch { return { ...DEFAUT }; } })();

function reglagesEffectifs() {
  if (parametres.qualite !== 'auto') return parametres;
  const c = parametres.cranAuto;
  return { qualite: c === 'minimale' ? 'basse' : c, ombres: parametres.ombres && c !== 'minimale', halo: parametres.halo && (c === 'haute' || c === 'moyenne') };
}
function appliquer() {
  reglerGraphismes(reglagesEffectifs());
  reglerVolumes(parametres.effets / 100, parametres.musique / 100);
  window.__tc2Secousses = parametres.secousses;
  try { localStorage.setItem(CLE, JSON.stringify(parametres)); } catch { /* stockage bloqué */ }
}

// Appelée à chaque image avec la durée réelle de l'image (ms)
const perf = { debut: performance.now(), total: 0, n: 0 };
export function surveillerPerf(ms) {
  if (parametres.qualite !== 'auto' || document.hidden || ms > 2000) return; // onglet caché ou retour d'arrière-plan : on ignore
  ms = Math.min(ms, 250);
  const maintenant = performance.now();
  if (maintenant - perf.debut < 4000) return; // laisser passer le chargement
  perf.total += ms; perf.n++;
  if (perf.total < 3000) return;
  const moy = perf.total / perf.n, i = CRANS.indexOf(parametres.cranAuto);
  perf.total = perf.n = 0;
  if (moy > 28 && i < CRANS.length - 1) {
    parametres.cranAuto = CRANS[i + 1]; appliquer();
    perf.debut = maintenant; // la nouvelle qualité a le temps de s'installer
    console.info('Qualité auto :', parametres.cranAuto, `(${Math.round(1000 / moy)} images/s)`);
  }
}
window.__tc2Perf = () => ({ ...parametres });

export function initParametres() {
  const $ = id => document.getElementById(id);
  $('pQualite').value = parametres.qualite;
  $('pOmbres').checked = parametres.ombres; $('pHalo').checked = parametres.halo; $('pSecousses').checked = parametres.secousses;
  $('pEffets').value = parametres.effets; $('pMusique').value = parametres.musique;
  $('pQualite').onchange = e => { parametres.qualite = e.target.value; appliquer(); };
  for (const [id, cle] of [['pOmbres', 'ombres'], ['pHalo', 'halo'], ['pSecousses', 'secousses']]) $(id).onchange = e => { parametres[cle] = e.target.checked; appliquer(); };
  $('pEffets').oninput = e => { parametres.effets = +e.target.value; appliquer(); };
  $('pMusique').oninput = e => { parametres.musique = +e.target.value; appliquer(); };
  $('pPleinEcran').onclick = () => { document.fullscreenElement ? document.exitFullscreen?.() : document.documentElement.requestFullscreen?.().catch(() => {}); };
  appliquer();
}
