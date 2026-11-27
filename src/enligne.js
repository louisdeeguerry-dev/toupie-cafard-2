// Défier un ami en temps réel : connexion directe entre les deux navigateurs (WebRTC via PeerJS, MIT).
// Le serveur public de PeerJS ne sert qu'à se trouver (échange d'adresses) ; ensuite tout passe en direct.
// Pour les tests sur une seule machine : ?local dans l'adresse (BroadcastChannel entre deux onglets).
const PREFIXE = 'toupiecafard2-';
const params = new URLSearchParams(location.search);
const local = params.has('local');
// ?serveur=hote:port : un serveur de mise en relation à nous (tests, ou si le serveur public est en panne)
// Sur réseau mobile (4G/5G), la connexion directe est souvent bloquée par l'opérateur : il faut un relais (TURN).
// On en propose plusieurs, gratuits ; le navigateur prend le premier qui marche.
const ICE = { iceServers: [
  { urls: ['stun:stun.l.google.com:19302', 'stun:stun.cloudflare.com:3478'] },
  { urls: ['turn:eu-0.turn.peerjs.com:3478', 'turn:us-0.turn.peerjs.com:3478'], username: 'peerjs', credential: 'peerjsp' },
  { urls: ['turn:openrelay.metered.ca:80', 'turn:openrelay.metered.ca:443', 'turns:openrelay.metered.ca:443?transport=tcp'], username: 'openrelayproject', credential: 'openrelayproject' },
] };
const optionsPeer = () => {
  const s = params.get('serveur');
  if (!s) return { debug: 1, config: ICE };
  const [host, port] = s.split(':');
  return { host, port: +port || 443, path: '/', secure: location.protocol === 'https:' && !/^(localhost|127\.)/.test(host), debug: 1, config: ICE };
};
const DELAI = 15000; // au-delà, on explique ce qui bloque

function chargerPeer() {
  if (window.Peer) return Promise.resolve();
  return new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = 'vendor/peerjs.min.js'; s.onload = ok; s.onerror = () => ko(new Error('PeerJS introuvable'));
    document.head.appendChild(s);
  });
}
const codeAuHasard = () => Array.from({ length: 5 }, () => 'ABCDEFGHJKMNPQRSTUVWXYZ23456789'[Math.floor(Math.random() * 31)]).join('');

// Canal local (tests) : même interface qu'une connexion PeerJS
function canalLocal(code, role) {
  const bc = new BroadcastChannel('tc2-' + code), ecoute = { data: [], close: [], open: [] };
  const c = {
    open: false,
    send: d => bc.postMessage({ de: role, d }),
    on: (ev, f) => ecoute[ev].push(f),
    close: () => { bc.postMessage({ de: role, bye: true }); bc.close(); },
  };
  bc.onmessage = e => {
    if (e.data.de === role) return;
    if (e.data.bye) return ecoute.close.forEach(f => f());
    if (e.data.hello && role === 'hote') { bc.postMessage({ de: role, hello: true }); c.open = true; ecoute.open.forEach(f => f()); return; }
    if (e.data.hello) { c.open = true; ecoute.open.forEach(f => f()); return; }
    ecoute.data.forEach(f => f(e.data.d));
  };
  if (role === 'invite') setTimeout(() => bc.postMessage({ de: role, hello: true }), 100);
  return c;
}

// Crée un défi (hôte) : rappels.code(code) dès que le code est prêt, rappels.connecte(conn) quand l'ami arrive
export async function creerDefi(rappels) {
  const code = codeAuHasard();
  if (local) { rappels.code(code); const c = canalLocal(code, 'hote'); rappels.connecte(c); return { fermer: () => c.close() }; }
  await chargerPeer();
  const peer = new window.Peer(PREFIXE + code, optionsPeer());
  const t = setTimeout(() => rappels.erreur?.('Le serveur de mise en relation ne répond pas. Vérifie ta connexion internet et réessaie.'), DELAI);
  peer.on('open', () => { clearTimeout(t); rappels.code(code); });
  peer.on('connection', c => rappels.connecte(c));
  peer.on('error', e => { clearTimeout(t); rappels.erreur?.(e.type === 'unavailable-id' ? 'Code déjà pris, réessaie.' : 'Connexion impossible (' + e.type + ').'); });
  peer.on('disconnected', () => { if (!peer.destroyed) peer.reconnect(); }); // le serveur coupe parfois : on se réinscrit
  return { fermer: () => peer.destroy() };
}

// Rejoint le défi d'un ami avec son code (invité)
export async function rejoindreDefi(code, rappels) {
  code = code.trim().toUpperCase();
  if (local) { const c = canalLocal(code, 'invite'); rappels.connecte(c); return { fermer: () => c.close() }; }
  await chargerPeer();
  const peer = new window.Peer(optionsPeer());
  const t = setTimeout(() => rappels.erreur?.('Impossible de joindre ton ami. Le code est-il le bon ? Son écran « Défier un ami » doit rester ouvert.'), DELAI);
  peer.on('open', () => {
    const c = peer.connect(PREFIXE + code, { reliable: true });
    c.on('open', () => clearTimeout(t));
    rappels.connecte(c);
  });
  peer.on('error', e => { clearTimeout(t); rappels.erreur?.(e.type === 'peer-unavailable' ? 'Aucun défi avec ce code (vérifie le code, et que ton ami est toujours sur l\'écran du défi).' : 'Connexion impossible (' + e.type + ').'); });
  return { fermer: () => peer.destroy() };
}
