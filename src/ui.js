// Interface : atelier, boîte mystère, recherche de partie, HUD, bilan + boutique, fin de partie.
import { SLOTS, PIECES, PIECE, RARETES, tirerPiece } from './data/pieces.js';
import { BUREAU, STAT_ACHATS } from './data/boutique.js';
import { PARTIE } from './config.js';
import { STATS, STAT, GROUPES, niveauxToupie, calculer as calcul } from './stats.js';
import { partie, etape, prixAmelio, acheter } from './match.js';
import { MODES, MONNAIE, PRIX_BOITE, rangDe, RANGS, xpPourNiveau, acheterBoite } from './progression.js';
import { son } from './audio.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function montrer(id, oui = true) { $(id).classList.toggle('cache', !oui); }

function modsHtml(niveaux) {
  return Object.entries(niveaux).map(([k, v]) => {
    const st = STAT[k];
    return `<span class="mod ${v > 0 ? 'plus' : 'moins'}">${st.icone} ${st.nom} ${v > 0 ? '+' : ''}${v}</span>`;
  }).join('');
}

function carteHtml(p) {
  const r = RARETES[p.rarete];
  return `<div class="rar" style="color:${r.couleur}">${r.nom}</div><div class="nom"><b>${esc(p.nom)}</b></div>
    <div class="desc">${esc(p.desc)}</div><div class="mods">${modsHtml(p.niveaux)}</div>`;
}

// Tableau de TOUTES les stats (celles du jeu 1), avec niveau et valeur réelle ; « apres » = aperçu d'un changement
export function tableauStats(niv, nivApres = null) {
  const v = calcul(niv), w = nivApres ? calcul(nivApres) : null;
  return GROUPES.map(g => `<div class="groupe"><h3>${g.icone} ${g.nom}</h3>` + STATS.filter(st => st.groupe === g.id).map(st => {
    const a = niv[st.id] || 0, b = nivApres ? nivApres[st.id] || 0 : a;
    const val = st.fmt(v), val2 = w ? st.fmt(w) : val;
    const change = b !== a;
    const vide = st.special && !a && !b;
    return `<div class="ls ${vide ? 'vide' : ''}" title="${esc(st.desc)}">
      <span class="ic">${st.icone}</span><span class="n">${st.nom}</span>
      <span class="lv ${change ? (b > a ? 'plus' : 'moins') : ''}">${b > 0 ? '+' : ''}${b}</span>
      <span class="v ${change ? (b > a ? 'plus' : 'moins') : ''}">${esc(change ? val2 : val)}</span></div>`;
  }).join('') + '</div>').join('');
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
    const total = PIECES.filter(p => p.slot === slotChoisi).length;
    $('choix').innerHTML = `<div class="petit">${esc(slot.desc)} — ${possedees.length}/${total} trouvées</div>` + possedees.map(p =>
      `<button class="carte ${eq[slotChoisi] === p.id ? 'equipee' : ''}" data-piece="${p.id}">${carteHtml(p)}${save.collection[p.id] > 1 ? `<span class="nb">×${save.collection[p.id]}</span>` : ''}</button>`
    ).join('');
    rendreStats();
    $('bilanCollection').textContent = `${Object.keys(save.collection).length}/${PIECES.length} pièces`;
    $('ouvrirBoite').textContent = `📦 Ouvrir (${save.boites})`;
    $('ouvrirBoite').disabled = save.boites <= 0;
    $('acheterBoite').textContent = `+1 📦 ${PRIX_BOITE} ${MONNAIE.icone}`;
    $('acheterBoite').disabled = save.ecrous < PRIX_BOITE;
    const rang = rangDe(save.rangPoints), suivant = RANGS[RANGS.indexOf(rang) + 1];
    const xpMax = xpPourNiveau(save.niveau);
    $('profil').innerHTML = `
      <div class="ligne"><span>⭐ Niveau <b>${save.niveau}</b></span><span>${MONNAIE.icone} <b>${save.ecrous}</b> ${MONNAIE.nom}</span></div>
      <div class="barre xp"><i style="width:${(save.xp / xpMax) * 100}%"></i></div><div class="petit">${save.xp}/${xpMax} XP — chaque niveau offre une boîte mystère</div>
      <div class="ligne"><span>${rang.icone} Rang <b>${rang.nom}</b> · ${save.rangPoints} pts</span><span class="petit">${suivant ? `${suivant.icone} ${suivant.nom} à ${suivant.min}` : 'rang maximum'}</span></div>
      <div class="petit">Parties : ${save.parties} · Victoires : ${save.victoires}${save.meilleure ? ' · Meilleure place : ' + save.meilleure + 'e' : ''}</div>`;
    $('modes').innerHTML = Object.entries(MODES).map(([id, m]) =>
      `<button class="mode ${save.mode === id ? 'choisi' : ''}" data-mode="${id}" title="${esc(m.desc)}">${m.icone} ${m.nom}</button>`).join('');
  }

  function rendreStats() {
    const niv = niveauxToupie(save.equipe);
    const apres = apercu ? niveauxToupie({ ...save.equipe, [PIECE[apercu].slot]: apercu }) : null;
    $('stats').innerHTML = $('statsGauche').innerHTML = tableauStats(niv, apres);
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
  $('modes').addEventListener('click', e => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    save.mode = b.dataset.mode; son('choix', { volume: 0.5 }); rendre(); onChange();
  });
  $('jouer').addEventListener('click', onJouer);
  $('ouvrirBoite').addEventListener('click', onBoite);
  $('acheterBoite').addEventListener('click', () => {
    if (acheterBoite(save)) { son('piece'); rendre(); onChange(); } else son('refus');
  });
  rendre();
  return { rendre };
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
      const r = RARETES[p.rarete], sl = SLOTS.find(s => s.id === p.slot);
      $('revelation').innerHTML = `<div class="panneau revelation" style="border-color:${r.couleur};box-shadow:0 0 40px ${r.couleur}66">
        <div class="petit">${sl.icone} ${sl.nom} ${neuve ? '· NOUVELLE !' : '· en double'}</div>
        <div class="rar" style="color:${r.couleur};font-weight:900">${r.nom}</div>
        <div class="grand">${esc(p.nom)}</div><div class="desc">${esc(p.desc)}</div>
        <div class="mods" style="justify-content:center">${modsHtml(p.niveaux)}</div>
        <div class="actions" style="margin-top:14px">
          <button class="btn second" id="boiteGarder">Garder</button><button class="btn" id="boiteEquiper">Équiper</button>
        </div></div>`;
      $('boiteGarder').onclick = () => { montrer('boite', false); onFini(p, false); };
      $('boiteEquiper').onclick = () => { save.equipe[p.slot] = p.id; montrer('boite', false); onFini(p, true); };
    }, 450);
  };
}

// ---------------------------------------------------------------- Recherche de partie
export function rechercher(noms, mode, onPret) {
  montrer('recherche');
  $('rechercheTitre').textContent = `${MODES[mode].icone} ${MODES[mode].nom} — recherche de joueurs…`;
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
      $('rechercheTitre').textContent = 'Partie trouvée ! Ta toupie est verrouillée jusqu\'à la fin.';
      setTimeout(() => { montrer('recherche', false); onPret(); }, 900);
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
  const moi = partie.moi, etroit = window.innerWidth < 720;
  $('vies').textContent = etroit ? `❤️ ${Math.max(0, moi.vies)}` : '❤️'.repeat(Math.max(0, moi.vies)) + '🖤'.repeat(Math.max(0, PARTIE.vies - moi.vies));
  $('argent').textContent = `💰 ${partie.argent}`;
  const n = PARTIE.cycle.length, debut = (etape() - 1) * n;
  $('manches').innerHTML = `<span class="petit">${etroit ? 'É' : 'Étape '}${etape()}</span>` + PARTIE.cycle.map((t, i) => {
    const m = debut + i, cls = m < partie.manche ? 'fait' : m === partie.manche ? 'cours' : '';
    return `<i class="${cls}" title="${t === 'duel' ? 'Duel' : 'Cafards'}">${t === 'duel' ? '⚔️' : '🪳'}</i>`;
  }).join('');
  $('salon').innerHTML = [...partie.joueurs].sort((a, b) => (b.elimine ? -1 : b.vies) - (a.elimine ? -1 : a.vies)).map(j =>
    `<div class="${j === moi ? 'moi' : ''} ${j === partie.adversaire ? 'adv' : ''} ${j.elimine ? 'out' : ''}"><span>${esc(j.nom)}</span><span>${j.elimine ? j.place + 'e' : '❤️' + j.vies}</span></div>`
  ).join('');
  if (partie.type === 'cafards') {
    $('objectif').textContent = `🎯 ${Math.min(partie.tues, partie.objectif)}/${partie.objectif} cafards`;
    $('objectif').style.color = partie.tues >= partie.objectif ? 'var(--vert)' : '';
    $('lancers').textContent = '🌀'.repeat(partie.lancers) + '·'.repeat(Math.max(0, PARTIE.lancersParVague - partie.lancers));
    $('lancers').classList.remove('cache');
  } else {
    $('objectif').textContent = `⚔️ Duel contre ${partie.adversaire ? partie.adversaire.nom : '?'}`;
    $('objectif').style.color = '';
    $('lancers').classList.add('cache');
  }
  if (!$('panneauStats').classList.contains('cache')) rendrePanneauStats();
}

export function aide(texte) { $('aide').textContent = texte; }

// Panneau « 📊 Stats » en partie : toutes les stats de ta toupie (pièces + améliorations achetées)
function rendrePanneauStats() {
  const p = partie.moi;
  $('panneauStatsContenu').innerHTML = `<div class="ligne"><h2>📊 Ta toupie</h2><button class="pastille" id="fermerStats">✖</button></div>
    <div class="petit">${SLOTS.map(s => `${s.icone} ${esc(PIECE[p.equipe[s.id]].nom)}`).join(' · ')} — verrouillée pour la partie</div>
    <div class="stats">${tableauStats(niveauxToupie(p.equipe, p.niveaux))}</div>
    <h3>🪑 Bureau</h3><div class="stats"><div class="groupe">${BUREAU.map(b => `<div class="ls ${p.niveaux[b.id] ? '' : 'vide'}"><span class="ic">${b.icone}</span><span class="n">${b.nom}</span><span class="lv">${p.niveaux[b.id] || 0}</span><span class="v">${esc(b.fmt(p.niveaux[b.id] || 0))}</span></div>`).join('')}</div></div>`;
  $('fermerStats').onclick = () => montrer('panneauStats', false);
}
export function basculerStats() {
  const ouvert = $('panneauStats').classList.contains('cache');
  montrer('panneauStats', ouvert);
  if (ouvert) rendrePanneauStats();
}

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

  const ligne = (a, actuel, suivant) => {
    const prix = prixAmelio(a.id), n = partie.moi.niveaux[a.id] || 0;
    return `<button class="amelio" data-a="${a.id}" ${prix == null || prix > partie.argent ? 'disabled' : ''} title="${esc(a.desc)}">
      <span class="ic">${a.icone}</span><span><b>${a.nom}</b> <span class="niv">+${n}</span><br>
      <span class="petit">${esc(actuel)}${suivant != null ? ` → <span class="plus">${esc(suivant)}</span>` : ''}</span></span>
      <span class="px">${prix == null ? 'MAX' : prix + ' 💰'}</span></button>`;
  };
  const rendre = () => {
    const p = partie.moi;
    const niv = niveauxToupie(p.equipe, p.niveaux);
    const s = calcul(niv);
    const colonneStats = groupe => STAT_ACHATS.filter(a => a.groupe === groupe).map(a => {
      const plus = calcul({ ...niv, [a.id]: (niv[a.id] || 0) + 1 });
      return ligne(a, STAT[a.id].fmt(s), prixAmelio(a.id) == null ? null : STAT[a.id].fmt(plus));
    }).join('');
    const colonneBureau = BUREAU.map(b => ligne(b, b.fmt(p.niveaux[b.id] || 0), prixAmelio(b.id) == null ? null : b.fmt((p.niveaux[b.id] || 0) + 1))).join('');
    $('bilanContenu').innerHTML = `${titre}${elim}${gains}
      <div class="ligne" style="margin-top:12px"><h2>Boutique</h2><div class="pastille">💰 ${partie.argent}</div></div>
      <div class="petit">Le bureau rapporte plus d'argent plus tard ; la toupie et le lanceur rendent plus fort tout de suite. Les pièces, elles, ne changent pas pendant la partie.</div>
      <div class="branches">
        <div class="branche"><h3>🪑 Bureau<small>économie</small></h3>${colonneBureau}</div>
        <div class="branche"><h3>🌀 Toupie<small>puissance</small></h3>${colonneStats('toupie')}</div>
        <div class="branche"><h3>🚀 Lanceur<small>lancer</small></h3>${colonneStats('lanceur')}</div>
      </div>
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
export function afficherFin({ place, mode }, r, onRetour) {
  const titre = place === 1 ? '🏆 VICTOIRE !' : place <= 4 ? `Top ${place} !` : `${place}e place`;
  const rang = mode === 'classee'
    ? `<div class="recomp">${r.rangApres.icone} Rang : <b>${r.points >= 0 ? '+' : ''}${r.points} pts</b> → ${r.rangApres.nom}${r.rangApres !== r.rangAvant ? (r.rangApres.min > r.rangAvant.min ? ' — PROMOTION !' : ' — rétrogradé') : ''}</div>`
    : `<div class="petit">Partie normale : ton rang ne change pas.</div>`;
  $('finContenu').innerHTML = `<h1>${titre}</h1><div class="petit">${MODES[mode].icone} ${MODES[mode].nom}</div>
    <div class="petit" style="margin:6px 0 10px">Classement : ${[...partie.joueurs].sort((a, b) => (a.place || 1) - (b.place || 1)).map(j => `${j.place || 1}. ${esc(j.nom)}`).join(' · ')}</div>
    <div class="recomp">${MONNAIE.icone} +${r.ecrous} ${MONNAIE.nom}</div>
    <div class="recomp">⭐ +${r.xp} XP${r.niveaux ? ` — <b>niveau supérieur !</b>` : ''}</div>
    ${r.boites ? `<div class="recomp">📦 +${r.boites} boîte${r.boites > 1 ? 's' : ''} mystère</div>` : ''}
    ${rang}
    <div class="actions" style="margin-top:14px"><button class="btn" id="retour">Retour à l'atelier</button></div>`;
  $('retour').onclick = () => { montrer('fin', false); onRetour(); };
  montrer('fin');
}

