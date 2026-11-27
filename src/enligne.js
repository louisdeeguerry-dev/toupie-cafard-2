// Défier un ami en temps réel.
// Par défaut : RELAIS MQTT public (connexion web classique, comme un site : passe en 4G/5G, en Wi-Fi d'entreprise…).
//   Les deux joueurs publient leurs messages sur un « sujet » propre au code du défi ; on essaie plusieurs relais gratuits.
// ?p2p : connexion directe WebRTC (PeerJS) — plus rapide, mais bloquée par certains réseaux mobiles.
// ?local : deux onglets du même navigateur (tests). ?relais=ws://hote:port : un relais à nous (tests).
const PREFIXE = 'toupiecafard2-';
const params = new URLSearchParams(location.search);
const local = params.has('local'), p2p = params.has('p2p');
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
    on: (ev, f) => ecoute[ev]?.push(f), // (error, iceStateChanged… : sans objet en local)
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

// ---------------------------------------------------------------- Relais MQTT (par défaut)
const RELAIS = params.get('relais') ? [params.get('relais')]
  : ['wss://broker.emqx.io:8084/mqtt', 'wss://broker.hivemq.com:8884/mqtt', 'wss://test.mosquitto.org:8081/mqtt'];
function chargerMqtt() {
  if (window.mqtt) return Promise.resolve();
  return new Promise((ok, ko) => {
    const s = document.createElement('script');
    s.src = 'vendor/mqtt.min.js'; s.onload = ok; s.onerror = () => ko(new Error('mqtt.js introuvable'));
    document.head.appendChild(s);
  });
}
// Se connecte au premier relais qui répond (6 s chacun)
async function relaisDisponible(statut) {
  await chargerMqtt();
  for (const url of RELAIS) {
    statut?.('Connexion au relais ' + new URL(url.replace(/^ws/, 'http')).hostname + '…');
    const client = await new Promise(ok => {
      const c = window.mqtt.connect(url, { connectTimeout: 6000, reconnectPeriod: 1500, clean: true, keepalive: 20 });
      const t = setTimeout(() => { c.end(true); ok(null); }, 6500);
      c.once('connect', () => { clearTimeout(t); ok(c); });
    });
    if (client) return client;
  }
  throw new Error('aucun relais ne répond (vérifie ta connexion internet)');
}
// Canal de jeu au-dessus du relais : même interface qu'une connexion PeerJS (send / on / open / close)
function canalRelais(client, code, role) {
  const autre = role === 'hote' ? 'invite' : 'hote', base = 'toupiecafard2/' + code + '/';
  const ecoute = { data: [], close: [], open: [], error: [], iceStateChanged: [] };
  let dernier = performance.now(), ferme = false;
  const pub = o => { if (!ferme) client.publish(base + role, JSON.stringify(o), { qos: 0 }); };
  const c = {
    open: false,
    send: d => pub({ d }),
    on: (ev, f) => ecoute[ev]?.push(f),
    close: () => { if (ferme) return; pub({ bye: 1 }); ferme = true; clearInterval(battement); setTimeout(() => client.end(true), 200); },
  };
  client.subscribe(base + autre, { qos: 0 });
  client.on('message', (topic, buf) => {
    if (topic !== base + autre || ferme) return;
    let m; try { m = JSON.parse(buf.toString()); } catch { return; }
    dernier = performance.now();
    if (m.bye) { ferme = true; clearInterval(battement); ecoute.close.forEach(f => f()); return; }
    if (m.h && !c.open) { c.open = true; pub({ h: 1 }); ecoute.open.forEach(f => f()); return; }
    if (m.d !== undefined) ecoute.data.forEach(f => f(m.d));
  });
  // « Coucou » toutes les secondes tant que l'autre n'a pas répondu, puis un battement de cœur toutes les 2 s
  const battement = setInterval(() => {
    if (!c.open) pub({ h: 1 });
    else {
      pub({ p: 1 });
      if (performance.now() - dernier > 12000) { ferme = true; clearInterval(battement); ecoute.close.forEach(f => f()); }
    }
  }, 1000);
  client.on('reconnect', () => ecoute.iceStateChanged.forEach(f => f('disconnected')));
  pub({ h: 1 });
  return c;
}

// Crée un défi (hôte) : rappels.code(code) dès que le code est prêt, rappels.connecte(conn) quand l'ami arrive
export async function creerDefi(rappels) {
  const code = codeAuHasard();
  if (local) { rappels.code(code); const c = canalLocal(code, 'hote'); rappels.connecte(c); return { fermer: () => c.close() }; }
  if (!p2p) {
    const client = await relaisDisponible(rappels.statut);
    rappels.code(code);
    const c = canalRelais(client, code, 'hote');
    rappels.connecte(c);
    return { fermer: () => { c.close(); } };
  }
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
  if (!p2p) {
    const client = await relaisDisponible(rappels.statut);
    const c = canalRelais(client, code, 'invite');
    const t = setTimeout(() => { if (!c.open) rappels.erreur?.('Ton ami ne répond pas : vérifie le code, et que son écran « Défier un ami » est toujours ouvert.'); }, DELAI);
    c.on('open', () => clearTimeout(t));
    rappels.connecte(c);
    return { fermer: () => { clearTimeout(t); c.close(); } };
  }
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
