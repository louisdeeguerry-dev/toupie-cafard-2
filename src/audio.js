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
let ctx = null, gain = null;
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
    gain = ctx.createGain();
    gain.gain.value = 0.5;
    gain.connect(ctx.destination);
    Object.keys(FICHIERS).forEach(charger);
  } catch { ctx = null; }
}

export function son(nom, { volume = 1, hauteur = 1 } = {}) {
  if (!ctx || !tampons[nom]?.length) return;
  const t = ctx.currentTime;
  if (dernier[nom] && t - dernier[nom] < 0.035) return; // pas d'empilement
  dernier[nom] = t;
  const src = ctx.createBufferSource();
  src.buffer = tampons[nom][Math.floor(Math.random() * tampons[nom].length)];
  src.playbackRate.value = hauteur * (0.94 + Math.random() * 0.12);
  const g = ctx.createGain();
  g.gain.value = volume;
  src.connect(g); g.connect(gain);
  src.start();
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
  if (!musGain) { musGain = ctx.createGain(); musGain.gain.value = 0; musGain.connect(gain); }
  musGain.gain.setTargetAtTime(oui ? 0.9 : 0, ctx.currentTime, 0.6);
  if (oui && !musTimer) { musProchain = ctx.currentTime + 0.1; musTimer = setInterval(planifier, 100); }
  if (!oui && musTimer) setTimeout(() => { if (!musiqueActive) { clearInterval(musTimer); musTimer = null; } }, 1500);
}
export function basculerMusique() {
  musiqueActive = !musiqueActive;
  try { localStorage.setItem('tc2-musique', musiqueActive ? 'oui' : 'non'); } catch { /* rien */ }
  musique(musiqueActive);
  return musiqueActive;
}
