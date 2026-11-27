// Sons : échantillons Kenney (CC0, repris du jeu 1) joués via WebAudio. Silencieux si l'audio est indisponible.
const FICHIERS = {
  toc: ['toc0.wav', 'toc1.wav'],
  ecrase: ['ecrase0.wav', 'ecrase1.wav'],
  gros: ['ecraseGros0.wav'],
  piece: ['piece0.wav', 'piece1.wav'],
  chute: ['chute0.wav'],
  achat: ['achat0.wav'],
  choix: ['choix0.wav'],
  refus: ['refus0.wav'],
  boite: ['evolution0.mp3'],
  critique: ['critique0.wav'],
};
let ctx = null, gain = null, bus = null;
let volEffets = 1, volMusique = 1; // réglés dans les Paramètres (0 à 1)
const tampons = {};
const dernier = {};

async function charger(nom) {
  tampons[nom] = [];
  for (const f of FICHIERS[nom]) {
    try {
      const r = await fetch('sons/' + f);
      tampons[nom].push(await ctx.decodeAudioData(await r.arrayBuffer()));
    } catch { /* son manquant : on continue sans */ }
  }
}

// À appeler sur un geste du joueur (les navigateurs bloquent l'audio avant)
export function activerAudio() {
  if (ctx) { if (ctx.state === 'suspended') ctx.resume(); return; }
  try {
    ctx = new (window.AudioContext || window.webkitAudioContext)();
    // Bus de sortie : gain maître → compresseur (évite la saturation quand les sons s'empilent) → enceintes
    gain = ctx.createGain();
    gain.gain.value = 0.55 * volEffets;
    const comp = ctx.createDynamicsCompressor();
    comp.threshold.value = -14; comp.knee.value = 10; comp.ratio.value = 4; comp.attack.value = 0.004; comp.release.value = 0.18;
    gain.connect(comp); comp.connect(ctx.destination); bus = comp;
    Object.keys(FICHIERS).forEach(charger);
  } catch { ctx = null; }
}

// pan : −1 (gauche) … +1 (droite), d'après la position de l'impact sur le plateau
export function son(nom, { volume = 1, hauteur = 1, pan = 0 } = {}) {
  if (!ctx || !tampons[nom]?.length) return;
  const t = ctx.currentTime;
  if (dernier[nom] && t - dernier[nom] < 0.035) return; // pas d'empilement
  dernier[nom] = t;
  const src = ctx.createBufferSource();
  src.buffer = tampons[nom][Math.floor(Math.random() * tampons[nom].length)];
  src.playbackRate.value = hauteur * (0.94 + Math.random() * 0.12);
  const g = ctx.createGain();
  g.gain.value = volume;
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); src.connect(g); g.connect(p); p.connect(gain); }
  else { src.connect(g); g.connect(gain); }
  src.start();
}

// ---------------------------------------------------------------- Sons procéduraux (WebAudio, aucun fichier)
// Chacun colle à la mécanique : le ressort se détend, le métal frappe le métal, l'engrenage cliquette.
const bruit = (() => { let b = null; return () => { if (!b) { b = ctx.createBuffer(1, ctx.sampleRate, ctx.sampleRate); const d = b.getChannelData(0); for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1; } return b; }; })();
function sortie(pan = 0) {
  if (pan && ctx.createStereoPanner) { const p = ctx.createStereoPanner(); p.pan.value = Math.max(-1, Math.min(1, pan)); p.connect(gain); return p; }
  return gain;
}
function ton(f, t, duree, vol, type = 'sine', vers = sortie(), fin = null) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.setValueAtTime(f, t); if (fin) o.frequency.exponentialRampToValueAtTime(fin, t + duree);
  g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol, t + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g); g.connect(vers); o.start(t); o.stop(t + duree + 0.02);
}
function souffle(t, duree, vol, f0, f1, vers = sortie(), q = 1.2) {
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = bruit(); f.type = 'bandpass'; f.Q.value = q; f.frequency.setValueAtTime(f0, t); f.frequency.exponentialRampToValueAtTime(f1, t + duree);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  s.connect(f); f.connect(g); g.connect(vers); s.start(t); s.stop(t + duree + 0.02);
}
const dernierP = {};
const pret = (nom, ecart = 0.03) => { if (!ctx) return false; const t = ctx.currentTime; if (dernierP[nom] && t - dernierP[nom] < ecart) return false; dernierP[nom] = t; return true; };
export const sfx = {
  // Lancer : le ressort se détend (« fwoung » descendant) + le cliquetis de l'engrenage
  lancer(force = 0.7) {
    if (!pret('lancer')) return;
    const t = ctx.currentTime;
    souffle(t, 0.28, 0.35 + 0.3 * force, 2400, 300);
    ton(420 + 300 * force, t, 0.3, 0.12, 'triangle', sortie(), 90);
    for (let i = 0; i < 5; i++) souffle(t + i * 0.025, 0.02, 0.18, 5000, 4000, sortie(), 8);
  },
  // PARFAIT : « ding » métallique clair (deux partiels inharmoniques)
  parfait() {
    if (!pret('parfait')) return;
    const t = ctx.currentTime;
    ton(1568, t, 0.9, 0.16); ton(1568 * 2.76, t, 0.5, 0.05); ton(2349, t + 0.06, 0.7, 0.08);
  },
  // Choc de toupies : métal contre métal (partiels inharmoniques + claquement), plus grave et fort si le choc est violent
  metal(force = 0.5, pan = 0) {
    if (!pret('metal', 0.04)) return;
    const t = ctx.currentTime, f = 520 + Math.random() * 120 - force * 160, v = Math.min(0.5, 0.12 + force * 0.35), o = sortie(pan);
    for (const [k, a, d] of [[1, 1, 0.35], [2.32, 0.55, 0.22], [4.1, 0.35, 0.12], [6.8, 0.2, 0.07]]) ton(f * k, t, d + force * 0.2, v * a, 'sine', o);
    souffle(t, 0.05, v * 0.8, 6000, 2500, o, 0.8);
  },
  // Dernières secondes du minuteur : tic d'horloge, plus aigu à la fin
  tic(urgence = 0) { if (!pret('tic', 0.2)) return; const t = ctx.currentTime; souffle(t, 0.03, 0.25, 3000 + urgence * 1500, 2500, sortie(), 6); ton(1200 + urgence * 500, t, 0.05, 0.05, 'square'); },
  // Achat : petit « ding » + caisse
  achat() { if (!pret('achat')) return; const t = ctx.currentTime; ton(1046, t, 0.25, 0.12); ton(1568, t + 0.07, 0.35, 0.12); },
  // Offre légendaire qui apparaît : carillon scintillant
  legendaire() { if (!pret('legendaire', 0.5)) return; const t = ctx.currentTime; [1318, 1568, 1976, 2637].forEach((f, i) => ton(f, t + i * 0.07, 0.8, 0.07)); },
  // Jingles (accords de la musique d'ambiance) : victoire montante, défaite descendante, fin de partie
  victoire() { const t = ctx.currentTime; [523, 659, 784, 1046].forEach((f, i) => { ton(f, t + i * 0.09, 0.5, 0.13, 'triangle'); ton(f * 2, t + i * 0.09, 0.3, 0.03); }); ton(1046, t + 0.4, 1.1, 0.12, 'triangle'); },
  defaite() { const t = ctx.currentTime; [392, 349, 311, 262].forEach((f, i) => ton(f, t + i * 0.14, 0.5, 0.12, 'triangle')); ton(131, t + 0.56, 0.9, 0.15, 'sine'); },
  finPartie(bien = true) { const t = ctx.currentTime; (bien ? [523, 659, 784, 988, 1046, 1318] : [440, 392, 349, 330, 294, 262]).forEach((f, i) => ton(f, t + i * 0.12, 0.6, 0.11, 'triangle')); },
};
// Sans audio activé (avant le premier clic) ou en cas d'erreur WebAudio : silence, jamais de plantage
for (const k of Object.keys(sfx)) { const f = sfx[k]; sfx[k] = (...args) => { if (!ctx) return; try { f(...args); } catch { /* silence */ } }; }
// Volumes (Paramètres) : effets et musique séparés, de 0 à 1
export function reglerVolumes(effets, mus) {
  volEffets = effets; volMusique = mus;
  if (!ctx) return;
  gain.gain.setTargetAtTime(0.55 * volEffets, ctx.currentTime, 0.05);
  if (musGain && musiqueActive) musGain.gain.setTargetAtTime(0.5 * volMusique, ctx.currentTime, 0.1);
}
// La musique s'efface un instant pendant un jingle
export function baisserMusique(duree = 1.5) {
  if (!ctx || !musGain || !musiqueActive) return;
  const t = ctx.currentTime;
  musGain.gain.cancelScheduledValues(t); musGain.gain.setTargetAtTime(0.12 * volMusique, t, 0.05); musGain.gain.setTargetAtTime(0.5 * volMusique, t + duree, 0.5);
}

// Ronronnement de ta toupie : sa hauteur suit la rotation (on « entend » la toupie faiblir)
let osc = null, oscGain = null, filtre = null;
export function ronron(ratio) {
  if (!ctx) return;
  if (!osc) {
    osc = ctx.createOscillator(); osc.type = 'sawtooth';
    filtre = ctx.createBiquadFilter(); filtre.type = 'lowpass'; filtre.frequency.value = 500;
    oscGain = ctx.createGain(); oscGain.gain.value = 0;
    osc.connect(filtre); filtre.connect(oscGain); oscGain.connect(gain);
    osc.start();
  }
  const t = ctx.currentTime;
  osc.frequency.setTargetAtTime(70 + 170 * Math.max(0, ratio), t, 0.05);
  oscGain.gain.setTargetAtTime(ratio > 0 ? 0.035 + 0.03 * ratio : 0, t, 0.08);
}

// ---------------------------------------------------------------- Musique d'ambiance (lo-fi douce, générée à la volée)
// 4 accords jazzy au piano électrique, une basse ronde, un charleston feutré. Volume bas, coupable (bouton 🔊 du menu).
const ACCORDS = [[57, 60, 64, 67], [53, 57, 60, 64], [55, 59, 62, 65], [52, 55, 59, 62]]; // Am7, Fmaj7, G7, Em7
const hz = n => 440 * Math.pow(2, (n - 69) / 12);
let musGain = null, musTimer = null, musPas = 0, musProchain = 0;
export let musiqueActive = (() => { try { return localStorage.getItem('tc2-musique') !== 'non'; } catch { return true; } })();

function note(f, t, duree, vol, type = 'sine') {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, t + duree);
  o.connect(g); g.connect(musGain); o.start(t); o.stop(t + duree + 0.05);
}
function charleston(t, vol) {
  const b = ctx.createBuffer(1, ctx.sampleRate * 0.05, ctx.sampleRate), d = b.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const s = ctx.createBufferSource(), f = ctx.createBiquadFilter(), g = ctx.createGain();
  s.buffer = b; f.type = 'highpass'; f.frequency.value = 6000; g.gain.value = vol;
  s.connect(f); f.connect(g); g.connect(musGain); s.start(t);
}
function planifier() {
  const tempo = 0.36; // une croche ≈ 83 bpm, ambiance détente
  while (musProchain < ctx.currentTime + 0.4) {
    const t = musProchain, mesure = Math.floor(musPas / 8) % ACCORDS.length, acc = ACCORDS[mesure], pas = musPas % 8;
    if (pas === 0) acc.forEach((n, i) => { note(hz(n), t + i * 0.015, 2.6, 0.05, 'triangle'); note(hz(n + 12), t + i * 0.015, 1.2, 0.012); });
    if (pas === 0 || pas === 5) note(hz(acc[0] - 24), t, 0.9, 0.11);
    if (pas % 2 === 1) charleston(t, 0.025);
    if (pas === 3 || pas === 6) note(hz(acc[(musPas >> 3) % 4] + 12), t, 0.5, 0.02, 'sine'); // petite mélodie
    musPas++; musProchain += tempo * (pas % 2 ? 0.85 : 1.15); // swing
  }
}
export function musique(oui = musiqueActive) {
  if (!ctx) return;
  if (!musGain) { musGain = ctx.createGain(); musGain.gain.value = 0; musGain.connect(bus); }
  musGain.gain.setTargetAtTime(oui ? 0.5 * volMusique : 0, ctx.currentTime, 0.6);
  if (oui && !musTimer) { musProchain = ctx.currentTime + 0.1; musTimer = setInterval(planifier, 100); }
  if (!oui && musTimer) setTimeout(() => { if (!musiqueActive) { clearInterval(musTimer); musTimer = null; } }, 1500);
}
export function basculerMusique() {
  musiqueActive = !musiqueActive;
  try { localStorage.setItem('tc2-musique', musiqueActive ? 'oui' : 'non'); } catch { /* rien */ }
  musique(musiqueActive);
  return musiqueActive;
}
