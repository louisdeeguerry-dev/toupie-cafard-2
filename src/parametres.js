// Paramètres du joueur (image et son), gardés dans le navigateur
import { reglerGraphismes } from './scene.js';
import { reglerVolumes } from './audio.js';

const CLE = 'tc2-parametres';
const DEFAUT = { qualite: 'haute', ombres: true, halo: true, secousses: true, effets: 80, musique: 60 };
export const parametres = (() => { try { return { ...DEFAUT, ...JSON.parse(localStorage.getItem(CLE) || '{}') }; } catch { return { ...DEFAUT }; } })();

function appliquer() {
  reglerGraphismes(parametres);
  reglerVolumes(parametres.effets / 100, parametres.musique / 100);
  window.__tc2Secousses = parametres.secousses;
  try { localStorage.setItem(CLE, JSON.stringify(parametres)); } catch { /* stockage bloqué */ }
}

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
