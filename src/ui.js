// Interface : atelier, boîte mystère, recherche de partie, HUD, bilan + boutique, fin de partie.
import { SLOTS, STATS, PIECES, PIECE, RARETES, tirerPiece } from './data/pieces.js';
import { AMELIORATIONS } from './data/boutique.js';
import { PARTIE } from './config.js';
import { statsToupie } from './stats.js';
import { partie, etape, typeManche, prixAmelio, acheter } from './match.js';
import { son } from './audio.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
const STAT_MAX = 14;

export function montrer(id, oui = true) { $(id).classList.toggle('cache', !oui); }

function modsHtml(stats) {
  return Object.entries(stats).map(([k, v]) => {
    const st = STATS.find(s => s.id === k);
    return `<span class="mod ${v > 0 ? 'plus' : 'moins'}">${st.icone} ${st.nom} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('');
}

function carteHtml(p, extra = '') {
  const r = RARETES[p.rarete];
  return `<div class="rar" style="color:${r.couleur}">${r.nom}</div><div class="nom"><b>${esc(p.nom)}</b></div>
    <div class="desc">${esc(p.desc)}</div><div class="mods">${modsHtml(p.stats)}</div>${extra}`;
}

// ---------------------------------------------------------------- Atelier
export function creerAtelier(save, { onChange, onJouer, onBoite }) {
  let slotChoisi = 'pointe', apercu = null;

  function rendre() {
    const eq = save.equipe;
    $('slots').innerHTML = SLOTS.map(s => {
      const p = PIECE[eq[s.id]];
      return `<button class="slot ${s.id === slotChoisi ? 'choisi' : ''}" data-slot="${s.id}">
        <div class="lib">${s.icone} ${s.nom}</div><div class="nom" style="color:${RARETES[p.rarete].couleur}">${esc(p.nom)}</div></button>`;
    }).join('');
    const possedees = PIECES.filter(p => p.slot === slotChoisi && save.collection[p.id]);
    const slot = SLOTS.find(s => s.id === slotChoisi);
    $('choix').innerHTML = `<div class="petit">${esc(slot.desc)}</div>` + possedees.map(p =>
      `<button class="carte ${eq[slotChoisi] === p.id ? 'equipee' : ''}" data-piece="${p.id}">${carteHtml(p)}${save.collection[p.id] > 1 ? `<span class="nb">×${save.collection[p.id]}</span>` : ''}</button>`
    ).join('') + (possedees.length < PIECES.filter(p => p.slot === slotChoisi).length ? `<div class="petit">Ouvre des boîtes mystère pour trouver d'autres ${slot.nom.toLowerCase()}s.</div>` : '');
    rendreStats();
    const nbPieces = Object.keys(save.collection).length;
    $('bilanCollection').textContent = `${nbPieces}/${PIECES.length} pièces`;
    $('ouvrirBoite').textContent = `📦 Boîte mystère (${save.boites})`;
    $('ouvrirBoite').disabled = save.boites <= 0;
    $('profil').textContent = `Parties : ${save.parties} · Victoires : ${save.victoires}${save.meilleure ? ' · Meilleure place : ' + save.meilleure + 'e' : ''}`;
  }

  function rendreStats() {
    const s = statsToupie(save.equipe);
    const s2 = apercu ? statsToupie({ ...save.equipe, [PIECE[apercu].slot]: apercu }) : s;
    $('stats').innerHTML = STATS.map(st => {
      const a = s[st.id], b = s2[st.id], lo = Math.min(a, b), hi = Math.max(a, b);
      const diff = b !== a ? `<b class="${b > a ? 'plus' : 'moins'}" style="left:${(lo / STAT_MAX) * 100}%;width:${((hi - lo) / STAT_MAX) * 100}%"></b>` : '';
      return `<div class="stat" title="${esc(st.desc)}"><span>${st.icone} ${st.nom}</span><div class="barre"><i style="width:${(lo / STAT_MAX) * 100}%"></i>${diff}</div><span>${b}</span></div>`;
    }).join('');
    const ame = PIECE[apercu && PIECE[apercu].slot === 'ame' ? apercu : save.equipe.ame];
    $('passif').textContent = ame.passif ? `✴️ Passif — ${ame.nom} : ${ame.desc}` : '';
  }

  $('slots').addEventListener('click', e => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    slotChoisi = b.dataset.slot; apercu = null; son('choix', { volume: 0.5 }); rendre();
  });
  $('choix').addEventListener('click', e => {
    const b = e.target.closest('[data-piece]');
    if (!b) return;
    save.equipe[slotChoisi] = b.dataset.piece; apercu = null; son('achat', { volume: 0.5 });
    rendre(); onChange();
  });
  $('choix').addEventListener('pointerover', e => {
    const b = e.target.closest('[data-piece]');
    const id = b ? b.dataset.piece : null;
    if (id !== apercu) { apercu = id; rendreStats(); }
  });
  $('choix').addEventListener('pointerleave', () => { apercu = null; rendreStats(); });
  $('jouer').addEventListener('click', onJouer);
  $('ouvrirBoite').addEventListener('click', onBoite);
  rendre();
  return { rendre, montrerSlot(s) { slotChoisi = s; rendre(); } };
}

// ---------------------------------------------------------------- Boîte mystère
export function ouvrirBoite(save, { onFini }) {
  if (save.boites <= 0) return;
  montrer('boite');
  const carton = $('carton');
  carton.className = 'carton secoue';
  $('revelation').innerHTML = '';
  $('boiteAide').textContent = 'Touche la boîte pour l\'ouvrir';
  son('choix');
  carton.onclick = () => {
    carton.onclick = null;
    save.boites--;
    const p = tirerPiece();
    const neuve = !save.collection[p.id];
    save.collection[p.id] = (save.collection[p.id] || 0) + 1;
    carton.className = 'carton ouvert';
    son('boite');
    $('boiteAide').textContent = '';
    setTimeout(() => {
      const r = RARETES[p.rarete];
      $('revelation').innerHTML = `<div class="panneau revelation" style="border-color:${r.couleur};box-shadow:0 0 40px ${r.couleur}66">
        <div class="petit">${SLOTS.find(s => s.id === p.slot).icone} ${SLOTS.find(s => s.id === p.slot).nom} ${neuve ? '· NOUVELLE !' : '· en double'}</div>
        <div class="rar" style="color:${r.couleur};font-weight:900">${r.nom}</div>
        <div class="grand">${esc(p.nom)}</div><div class="desc">${esc(p.desc)}</div>
        <div class="mods" style="justify-content:center">${modsHtml(p.stats)}</div>
        <div class="actions" style="margin-top:14px">
          <button class="btn second" id="boiteGarder">Garder</button><button class="btn" id="boiteEquiper">Équiper</button>
        </div></div>`;
      $('boiteGarder').onclick = () => { montrer('boite', false); onFini(p, false); };
      $('boiteEquiper').onclick = () => { save.equipe[p.slot] = p.id; montrer('boite', false); onFini(p, true); };
    }, 450);
  };
}

// ---------------------------------------------------------------- Recherche de partie
export function rechercher(noms, onPret) {
  montrer('recherche');
  $('rechercheTitre').textContent = 'Recherche de joueurs…';
  const ol = $('rechercheListe');
  ol.innerHTML = '';
  let i = 0;
  const tick = () => {
    if (i < noms.length) {
      const li = document.createElement('li');
      li.textContent = noms[i] + (i === 0 ? ' (toi)' : ' 🤖');
      ol.appendChild(li);
      son('toc', { volume: 0.3, hauteur: 1.4 });
      i++;
      setTimeout(tick, 160 + Math.random() * 180);
    } else {
      $('rechercheTitre').textContent = 'Partie trouvée !';
      setTimeout(() => { montrer('recherche', false); onPret(); }, 600);
    }
  };
  setTimeout(tick, 300);
}

// ---------------------------------------------------------------- HUD
let bandeauT = null;
export function bandeau(titre, sous = '', duree = 1800) {
  const b = $('bandeau');
  b.innerHTML = `${esc(titre)}${sous ? `<small>${esc(sous)}</small>` : ''}`;
  b.classList.add('visible');
  clearTimeout(bandeauT);
  bandeauT = setTimeout(() => b.classList.remove('visible'), duree);
}

export function majHud() {
  if (!partie.joueurs) return;
  const moi = partie.moi;
  $('vies').textContent = window.innerWidth < 720 ? `❤️ ${Math.max(0, moi.vies)}`
    : '❤️'.repeat(Math.max(0, moi.vies)) + '🖤'.repeat(Math.max(0, PARTIE.vies - moi.vies));
  $('argent').textContent = `💰 ${partie.argent}`;
  const n = PARTIE.cycle.length, debut = (etape() - 1) * n;
  $('manches').innerHTML = `<span class="petit">${window.innerWidth < 720 ? 'É' : 'Étape '}${etape()}</span>` + PARTIE.cycle.map((t, i) => {
    const m = debut + i, cls = m < partie.manche ? 'fait' : m === partie.manche ? 'cours' : '';
    return `<i class="${cls}" title="${t === 'duel' ? 'Duel' : 'Cafards'}">${t === 'duel' ? '⚔️' : '🪳'}</i>`;
  }).join('');
  $('salon').innerHTML = [...partie.joueurs].sort((a, b) => (b.elimine ? -1 : b.vies) - (a.elimine ? -1 : a.vies)).map(j =>
    `<div class="${j === moi ? 'moi' : ''} ${j === partie.adversaire ? 'adv' : ''} ${j.elimine ? 'out' : ''}"><span>${esc(j.nom)}</span><span>${j.elimine ? j.place + 'e' : '❤️' + j.vies}</span></div>`
  ).join('');
  if (partie.type === 'cafards') {
    $('objectif').textContent = `🎯 ${Math.min(partie.tues, partie.objectif)}/${partie.objectif} cafards`;
    $('objectif').style.color = partie.tues >= partie.objectif ? 'var(--vert)' : '';
    $('lancers').textContent = '🌀'.repeat(partie.lancers) + '·'.repeat(PARTIE.lancersParVague - partie.lancers);
    $('lancers').classList.remove('cache');
  } else {
    $('objectif').textContent = `⚔️ Duel contre ${partie.adversaire ? partie.adversaire.nom : '?'}`;
    $('objectif').style.color = '';
    $('lancers').classList.add('cache');
  }
}

export function aide(texte) { $('aide').textContent = texte; }

// ---------------------------------------------------------------- Bilan + boutique
export function afficherBilan(bilan, onPret) {
  let titre;
  if (bilan.type === 'cafards') {
    titre = bilan.reussi ? `<div class="resultat ok">🎯 Vague réussie : ${bilan.tues}/${bilan.objectif}</div>`
      : `<div class="resultat ko">Vague ratée : ${bilan.tues}/${bilan.objectif}</div><div class="petit">Pas de prime d'objectif cette fois.</div>`;
  } else {
    titre = bilan.gagne ? `<div class="resultat ok">⚔️ Victoire contre ${esc(bilan.adversaire)} !</div><div class="petit">Il perd ${bilan.degats} ❤️${bilan.tempsEcoule ? ' (temps écoulé : tu tournais plus fort)' : ''}</div>`
      : `<div class="resultat ko">Défaite contre ${esc(bilan.adversaire)}</div><div class="petit">Tu perds ${bilan.degats} ❤️${bilan.tempsEcoule ? ' (temps écoulé : il tournait plus fort)' : ''}</div>`;
  }
  const elim = bilan.elimines?.length ? `<div class="petit">💀 Éliminé${bilan.elimines.length > 1 ? 's' : ''} : ${bilan.elimines.map(esc).join(', ')}</div>` : '';
  const gains = `<div class="petit">Gains : ${bilan.gains} 💰 pendant la manche · +${bilan.revenu} 💰 de revenu · +${bilan.interets} 💰 d'intérêts</div>`;
  const prochaine = bilan.prochaine === 'duel' ? '⚔️ Duel' : '🪳 Cafards';

  const rendre = () => {
    const branche = (id, nom, sous) => `<div class="branche"><h3>${nom}<small>${sous}</small></h3>` + AMELIORATIONS.filter(a => a.branche === id).map(a => {
      const prix = prixAmelio(a.id), niv = partie.moi.niveaux[a.id] || 0;
      return `<button class="amelio" data-a="${a.id}" ${prix == null || prix > partie.argent ? 'disabled' : ''}>
        <span class="ic">${a.icone}</span><span><b>${a.nom}</b> <span class="niv">niv. ${niv}/${a.max}</span><br><span class="petit">${a.desc}</span></span>
        <span class="px">${prix == null ? 'MAX' : prix + ' 💰'}</span></button>`;
    }).join('') + '</div>';
    $('bilanContenu').innerHTML = `${titre}${elim}${gains}
      <div class="ligne" style="margin-top:12px"><h2>Boutique</h2><div class="pastille">💰 ${partie.argent}</div></div>
      <div class="petit">Investir dans le bureau rapporte plus d'argent plus tard ; investir dans la toupie la rend plus forte tout de suite.</div>
      <div class="branches">${branche('bureau', '🪑 Bureau', 'économie : plus de cafards, plus de 💰')}${branche('toupie', '🌀 Toupie', 'puissance : pour gagner vagues et duels')}</div>
      <div class="ligne"><span class="petit">Prochaine manche : <b>${prochaine}</b></span><button class="btn" id="pret">Prêt ▶</button></div>`;
    $('pret').onclick = () => { montrer('bilan', false); onPret(); };
  };
  $('bilanContenu').onclick = e => {
    const b = e.target.closest('[data-a]');
    if (b && acheter(b.dataset.a)) { rendre(); majHud(); }
  };
  rendre();
  montrer('bilan');
}

// ---------------------------------------------------------------- Fin
export function afficherFin({ place, boites }, onRetour) {
  const titre = place === 1 ? '🏆 VICTOIRE !' : place <= 4 ? `Top ${place} !` : `${place}e place`;
  $('finContenu').innerHTML = `<h1>${titre}</h1>
    <div class="petit">Classement final : ${[...partie.joueurs].sort((a, b) => (a.place || 1) - (b.place || 1)).map(j => `${j.place || 1}. ${esc(j.nom)}`).join(' · ')}</div>
    <p>Tu gagnes <b>${boites} boîte${boites > 1 ? 's' : ''} mystère</b> 📦 pour améliorer ta collection.</p>
    <div class="actions"><button class="btn" id="retour">Retour à l'atelier</button></div>`;
  $('retour').onclick = () => { montrer('fin', false); onRetour(); };
  montrer('fin');
}
