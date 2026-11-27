// Défier un ami en temps réel : connexion directe entre les deux navigateurs (WebRTC via PeerJS, MIT).
// Le serveur public de PeerJS ne sert qu'à se trouver (échange d'adresses) ; ensuite tout passe en direct.
// Pour les tests sur une seule machine : ?local dans l'adresse (BroadcastChannel entre deux onglets).
const PREFIXE = 'toupiecafard2-';
const local = new URLSearchParams(location.search).has('local');

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
    send: d => bc.postMessage({ de: role, d }),
    on: (ev, f) => ecoute[ev].push(f),
    close: () => { bc.postMessage({ de: role, bye: true }); bc.close(); },
  };
  bc.onmessage = e => {
    if (e.data.de === role) return;
    if (e.data.bye) return ecoute.close.forEach(f => f());
    if (e.data.hello && role === 'hote') { bc.postMessage({ de: role, hello: true }); ecoute.open.forEach(f => f()); return; }
    if (e.data.hello) { ecoute.open.forEach(f => f()); return; }
    ecoute.data.forEach(f => f(e.data.d));
  };
  if (role === 'invite') setTimeout(() => bc.postMessage({ de: role, hello: true }), 100);
  return c;
}

// Crée un défi (hôte) : rappels.code(code) dès que le code est prêt, rappels.connecte(conn) quand l'ami arrive
export async function creerDefi(rappels) {
  const code = codeAuHasard();
  if (local) { rappels.code(code); const c = canalLocal(code, 'hote'); c.on('open', () => rappels.connecte(c)); return { fermer: () => c.close() }; }
  await chargerPeer();
  const peer = new window.Peer(PREFIXE + code);
  peer.on('open', () => rappels.code(code));
  peer.on('connection', c => c.on('open', () => rappels.connecte(c)));
  peer.on('error', e => rappels.erreur?.(e.type === 'unavailable-id' ? 'Code déjà pris, réessaie.' : 'Connexion impossible (' + e.type + ').'));
  return { fermer: () => peer.destroy() };
}

// Rejoint le défi d'un ami avec son code (invité)
export async function rejoindreDefi(code, rappels) {
  code = code.trim().toUpperCase();
  if (local) { const c = canalLocal(code, 'invite'); c.on('open', () => rappels.connecte(c)); return { fermer: () => c.close() }; }
  await chargerPeer();
  const peer = new window.Peer();
  peer.on('open', () => {
    const c = peer.connect(PREFIXE + code, { reliable: true });
    c.on('open', () => rappels.connecte(c));
  });
  peer.on('error', e => rappels.erreur?.(e.type === 'peer-unavailable' ? 'Aucun défi avec ce code.' : 'Connexion impossible (' + e.type + ').'));
  return { fermer: () => peer.destroy() };
}
