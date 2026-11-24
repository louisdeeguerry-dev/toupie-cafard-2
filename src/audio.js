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
