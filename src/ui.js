// Interface : atelier, boîte mystère, recherche de partie, HUD, bilan + boutique, fin de partie.
import { SLOTS, PIECES, PIECE, RARETES, tirerBoite, niveauxPiece, multiplicateurNiveau, NIVEAU_PIECE_MAX, GARANTIE_LEGENDAIRE } from './data/pieces.js';
import { TERRAINS, TERRAIN } from './data/terrains.js';
import { STAT_ACHATS, PRIORITE, MANCHE_PRIORITE } from './data/boutique.js';
import { PARTIE } from './config.js';
import { STATS, STAT, GROUPES, niveauxToupie, calculer as calcul, tempsRotation } from './stats.js';
import { partie, etape, prixAmelio, acheter, prioriteDispo, lancerDansEtape, relancerOffres } from './match.js';
import { BOUTIQUE } from './config.js';
import { PIECE as PIECES_PAR_ID } from './data/pieces.js';
import { TYPES } from './data/cafards.js';
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

function carteHtml(p, k = 1) {
  const r = RARETES[p.rarete];
  return `<div class="rar" style="color:${r.couleur}">${r.nom}</div><div class="nom"><b>${esc(p.nom)}</b>${k > 1 ? ` <span class="niv-badge">niv ${k}</span>` : ''}</div>
    <div class="desc">${esc(p.desc)}</div><div class="mods">${modsHtml(niveauxPiece(p, k))}</div>`;
}

// Tableau de TOUTES les stats (celles du jeu 1), avec niveau et valeur réelle ; « apres » = aperçu d'un changement
export function tableauStats(niv, nivApres = null) {
  const v = calcul(niv), w = nivApres ? calcul(nivApres) : null;
  const t = tempsRotation(w || v);
  const alerte = t < 4 ? `<div class="alerte">⚠️ Toupie très instable : ${t.toFixed(1)} s de rotation seulement. Les malus de tes pièces s'additionnent.</div>` : '';
  return alerte + GROUPES.map(g => `<div class="groupe"><h3>${g.icone} ${g.nom}</h3>` + STATS.filter(st => st.groupe === g.id).map(st => {
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
const nivMax = (save, id) => Math.min(NIVEAU_PIECE_MAX, save.collection[id] || 0);
const nivDe = (save, id) => Math.min(nivMax(save, id), save.niveauxPieces[id] || 1) || 1;

export function creerAtelier(save, { onChange, onJouer, onBoite }) {
  let slotChoisi = 'pointe', apercu = null; // apercu : { id, niv }

  function rendre() {
    const eq = save.equipe;
    $('slots').innerHTML = GROUPES.filter(g => SLOTS.some(s => s.groupe === g.id)).map(g => `<div class="lib-groupe">${g.icone} ${g.nom}</div>` +
      SLOTS.filter(s => s.groupe === g.id).map(s => {
        const p = PIECE[eq[s.id]], k = nivDe(save, p.id);
        return `<button class="slot ${s.id === slotChoisi ? 'choisi' : ''}" data-slot="${s.id}">
          <div class="lib">${s.icone} ${s.nom}</div><div class="nom" style="color:${RARETES[p.rarete].couleur}">${esc(p.nom)}${k > 1 ? ` <span class="niv-badge">niv ${k}</span>` : ''}</div></button>`;
      }).join('')).join('');
    const possedees = PIECES.filter(p => p.slot === slotChoisi && save.collection[p.id]);
    const slot = SLOTS.find(s => s.id === slotChoisi);
    const total = PIECES.filter(p => p.slot === slotChoisi).length;
    $('choix').innerHTML = `<div class="petit">${esc(slot.desc)} — ${possedees.length}/${total} trouvées</div>` + possedees.map(p => {
      const k = nivDe(save, p.id), max = nivMax(save, p.id);
      const chips = max > 1 ? `<div class="chips">Niveau : ${Array.from({ length: max }, (_, i) => i + 1).map(n =>
        `<span class="chip ${n === k ? 'on' : ''}" data-piece="${p.id}" data-niv="${n}" title="Tout ×${multiplicateurNiveau(n)}">${n}</span>`).join('')}
        <span class="petit">(${save.collection[p.id]} exemplaires — tout ×${multiplicateurNiveau(k)})</span></div>`
        : `<div class="petit">1 exemplaire — un doublon débloque le niveau 2</div>`;
      return `<div class="carte ${eq[slotChoisi] === p.id ? 'equipee' : ''}" data-piece="${p.id}" data-niv="${k}">${carteHtml(p, k)}${chips}</div>`;
    }).join('');
    rendreStats();
    $('bilanCollection').textContent = `${Object.keys(save.collection).length}/${PIECES.length} pièces`;
    $('ouvrirBoite').textContent = `📦 Ouvrir (${save.boites})`;
    const reste = GARANTIE_LEGENDAIRE - save.boitesSansLegendaire;
    $('garantie').innerHTML = `✨ Lot légendaire garanti ${reste <= 1 ? '<b>à la prochaine boîte</b>' : `dans <b>${reste}</b> boîtes au plus`}
      — pièce légendaire, coffre d'écrous ou terrain de duel (${TERRAINS.filter(t => t.rarete && !save.terrains.includes(t.id)).length} terrain(s) à trouver, même chance chacun).`;
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
    $('terrains').innerHTML = TERRAINS.map(t => {
      const verrou = t.rarete && !save.terrains.includes(t.id), r = t.rarete && RARETES[t.rarete];
      return `<button class="terrain ${save.terrain === t.id ? 'choisi' : ''}" data-terrain="${t.id}" ${verrou ? 'disabled' : ''} title="${esc(t.desc)}">
        <span class="ic">${t.icone}</span><span><b>${t.nom}</b>${r ? ` <span class="rar" style="color:${r.couleur}">${r.nom}</span>` : ''}<br>
        <span class="petit">${verrou ? '🔒 lot légendaire des boîtes mystère' : esc(t.desc)}</span></span></button>`;
    }).join('');
    const avec = save.terrain !== 'aucun';
    $('terrainInfo').innerHTML = `Contre les cafards, le bureau est toujours neutre. ${avec
      ? `<b>Avec un terrain, tu commences la partie à ${PARTIE.argentAvecTerrain} 💰</b> (au lieu de ${PARTIE.argentSansTerrain}).`
      : `<b>Sans terrain, tu commences avec ${PARTIE.argentSansTerrain} 💰.</b> Choisir un terrain coûte cet argent de départ.`}
      Si ton adversaire a aussi un terrain, c'est la <b>priorité de terrain</b> qui décide : des points achetés en partie à partir de la manche ${MANCHE_PRIORITE}, secrets pour l'adversaire. Le plus de points impose son terrain ; à égalité, bureau neutre. Les terrains sont des lots légendaires des boîtes mystère (même chance pour chacun, jamais en double).`;
  }

  function rendreStats() {
    const base = { ...save.equipe }, nivs = { ...save.niveauxPieces };
    const niv = niveauxToupie(base, {}, nivs);
    let apres = null;
    if (apercu) apres = niveauxToupie({ ...base, [PIECE[apercu.id].slot]: apercu.id }, {}, { ...nivs, [apercu.id]: apercu.niv });
    $('stats').innerHTML = $('statsGauche').innerHTML = tableauStats(niv, apres);
  }

  function equiper(id, k) {
    save.equipe[PIECE[id].slot] = id;
    if (k) save.niveauxPieces[id] = k;
    apercu = null; son('achat', { volume: 0.5 });
    rendre(); onChange();
  }

  $('slots').addEventListener('click', e => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    slotChoisi = b.dataset.slot; apercu = null; son('choix', { volume: 0.5 }); rendre();
  });
  $('choix').addEventListener('click', e => {
    const chip = e.target.closest('.chip');
    if (chip) return equiper(chip.dataset.piece, +chip.dataset.niv);
    const b = e.target.closest('.carte[data-piece]');
    if (b) equiper(b.dataset.piece);
  });
  $('choix').addEventListener('pointerover', e => {
    const b = e.target.closest('[data-niv]');
    const ap = b ? { id: b.dataset.piece, niv: +b.dataset.niv } : null;
    if (JSON.stringify(ap) !== JSON.stringify(apercu)) { apercu = ap; rendreStats(); }
  });
  $('choix').addEventListener('pointerleave', () => { apercu = null; rendreStats(); });
  $('modes').addEventListener('click', e => {
    const b = e.target.closest('[data-mode]');
    if (!b) return;
    save.mode = b.dataset.mode; son('choix', { volume: 0.5 }); rendre(); onChange();
  });
  $('terrains').addEventListener('click', e => {
    const b = e.target.closest('[data-terrain]');
    if (!b || b.disabled) return;
    save.terrain = b.dataset.terrain; son('choix', { volume: 0.5 }); rendre(); onChange();
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
    const lot = tirerBoite(save.terrains, { garantie: save.boitesSansLegendaire >= GARANTIE_LEGENDAIRE - 1 });
    save.boitesSansLegendaire = lot.rarete === 'legendaire' ? 0 : save.boitesSansLegendaire + 1;
    carton.className = 'carton ouvert';
    son('boite');
    $('boiteAide').textContent = '';
    if (lot.type === 'coffre') {
      const c = lot.coffre, r = RARETES.legendaire;
      save.ecrous += c.ecrous;
      return setTimeout(() => {
        $('revelation').innerHTML = `<div class="panneau revelation" style="border-color:${r.couleur};box-shadow:0 0 40px ${r.couleur}66">
          <div class="rar" style="color:${r.couleur};font-weight:900">${r.nom}</div>
          <div class="grand">${c.icone} ${esc(c.nom)}</div><div class="desc">+${c.ecrous} ${MONNAIE.icone} ${MONNAIE.nom} — ${esc(c.desc)}</div>
          <div class="actions" style="margin-top:14px"><button class="btn" id="boiteGarder">Super !</button></div></div>`;
        $('boiteGarder').onclick = () => { montrer('boite', false); onFini(c, false); };
      }, 450);
    }
    if (lot.type === 'terrain') {
      const t = lot.terrain, r = RARETES[t.rarete];
      save.terrains.push(t.id);
      return setTimeout(() => {
        $('revelation').innerHTML = `<div class="panneau revelation" style="border-color:${r.couleur};box-shadow:0 0 40px ${r.couleur}66">
          <div class="petit">🏟️ Terrain de duel · NOUVEAU !</div>
          <div class="rar" style="color:${r.couleur};font-weight:900">${r.nom}</div>
          <div class="grand">${t.icone} ${esc(t.nom)}</div><div class="desc">${esc(t.desc)}</div>
          <div class="petit" style="margin-top:6px">Choisir un terrain coûte ton argent de départ en partie.</div>
          <div class="actions" style="margin-top:14px">
            <button class="btn second" id="boiteGarder">Garder</button><button class="btn" id="boiteEquiper">Choisir ce terrain</button>
          </div></div>`;
        $('boiteGarder').onclick = () => { montrer('boite', false); onFini(t, false); };
        $('boiteEquiper').onclick = () => { save.terrain = t.id; montrer('boite', false); onFini(t, true); };
      }, 450);
    }
    const p = lot.piece;
    const neuve = !save.collection[p.id];
    save.collection[p.id] = (save.collection[p.id] || 0) + 1;
    setTimeout(() => {
      const r = RARETES[p.rarete], sl = SLOTS.find(s => s.id === p.slot);
      $('revelation').innerHTML = `<div class="panneau revelation" style="border-color:${r.couleur};box-shadow:0 0 40px ${r.couleur}66">
        <div class="petit">${sl.icone} ${sl.nom} ${neuve ? '· NOUVELLE !' : `· doublon : niveau ${Math.min(NIVEAU_PIECE_MAX, save.collection[p.id])} débloqué !`}</div>
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
  const n = PARTIE.cycle.length, mm = partie.mancheAffichee ?? partie.manche, et = Math.floor(mm / n) + 1, debut = (et - 1) * n;
  $('manches').innerHTML = `<span class="petit">${etroit ? 'É' : 'Étape '}${et}</span>` + PARTIE.cycle.map((t, i) => {
    const m = debut + i, cls = m < mm ? 'fait' : m === mm ? 'cours' : '';
    return `<i class="${cls}" title="${t === 'duel' ? 'Duel' : 'Cafards'}">${t === 'duel' ? '⚔️' : '🪳'}</i>`;
  }).join('');
  $('salon').innerHTML = [...partie.joueurs].sort((a, b) => (b.elimine ? -1 : b.vies) - (a.elimine ? -1 : a.vies)).map(j =>
    `<div class="${j === moi ? 'moi' : ''} ${j === partie.adversaire ? 'adv' : ''} ${j.elimine ? 'out' : ''}"><span>${esc(j.nom)}</span><span>${j.elimine ? j.place + 'e' : '❤️' + j.vies}</span></div>`
  ).join('');
  if (partie.type === 'cafards') {
    $('objectif').textContent = `🪳 Lancer ${lancerDansEtape()}/3 · ${partie.tues} écrasé${partie.tues > 1 ? 's' : ''}`;
    $('objectif').style.color = '';
    $('lancers').textContent = `💰 +${partie.gainsManche}`;
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
    <div class="petit">${SLOTS.map(s => `${s.icone} ${esc(PIECE[p.equipe[s.id]].nom)}${p.nivPieces[p.equipe[s.id]] > 1 ? ' niv ' + p.nivPieces[p.equipe[s.id]] : ''}`).join(' · ')} — verrouillée pour la partie</div>
    <div class="petit">🏟️ Terrain de duel : ${TERRAIN[p.terrain].icone} ${TERRAIN[p.terrain].nom}${p.terrain !== 'aucun' ? ` · priorité ${p.niveaux.priorite || 0} pt (secret)` : ''}</div>
    <div class="stats">${tableauStats(niveauxToupie(p.equipe, p.niveaux, p.nivPieces))}</div>`;
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
    titre = `<div class="resultat ${bilan.tues ? 'ok' : 'ko'}">🪳 Lancer ${bilan.lancer}/3 : ${bilan.tues} cafard${bilan.tues > 1 ? 's' : ''} écrasé${bilan.tues > 1 ? 's' : ''}</div>
      <div class="petit">${bilan.restants} survivant${bilan.restants > 1 ? 's' : ''} sur le bureau (ils gardent leurs blessures).</div>`;
  } else {
    const det = `${bilan.contacts} contact${bilan.contacts > 1 ? 's' : ''} en ${bilan.duree.toFixed(1)} s`;
    titre = bilan.gagne ? `<div class="resultat ok">⚔️ Victoire contre ${esc(bilan.adversaire)} !</div><div class="petit">Il perd ${bilan.degats} ❤️${bilan.tempsEcoule ? ' (temps écoulé : tu tournais plus fort)' : ''} · ${det}</div>`
      : `<div class="resultat ko">Défaite contre ${esc(bilan.adversaire)}</div><div class="petit">Tu perds ${bilan.degats} ❤️${bilan.tempsEcoule ? ' (temps écoulé : il tournait plus fort)' : ''} · ${det}</div>`;
  }
  const elim = bilan.elimines?.length ? `<div class="petit">💀 Éliminé${bilan.elimines.length > 1 ? 's' : ''} : ${bilan.elimines.map(esc).join(', ')}</div>` : '';
  const gains = `<div class="petit">Gains : ${bilan.gains} 💰 pendant la manche · +${bilan.revenu} 💰 de revenu · +${bilan.interets} 💰 d'intérêts${bilan.type === 'duel' ? ' (un duel ne rapporte ni ne coûte d\'argent)' : ''}</div>`;
  const prochaine = bilan.prochaine === 'duel' ? '⚔️ Duel' : '🪳 Cafards';
  const ap = bilan.apercu;
  const apercu = ap ? `<div class="apercu">
      <b>Prochain lancer (${ap.lancer}/3) :</b> le bureau sera rempli à ${ap.capacite} cafards${ap.restants ? ` (${ap.restants} survivants + ${Math.max(0, ap.capacite - ap.restants)} nouveaux)` : ''} · vie des nouveaux ${ap.vie.toFixed(1)} · ${ap.especes.map(t => `${TYPES[t].icone} ${TYPES[t].nom}`).join(', ')}
      <div class="petit">Plus de Nid = plus de cafards sur le bureau à chaque lancer.</div>
      ${ap.evolution?.length ? `<div class="evolution">🧬 <b>Les cafards ont évolué !</b> Ils sont plus résistants, et de nouvelles espèces arrivent :
        ${ap.evolution.map(t => `<div>${TYPES[t].icone} <b>${TYPES[t].nom}</b> — ${esc(TYPES[t].desc)} <span class="petit">Contré par : ${TYPES[t].contre.map(c => STAT[c].icone + ' ' + STAT[c].nom).join(', ')}</span></div>`).join('')}</div>` : ''}
    </div>` : `<div class="apercu"><b>Après le duel, les cafards évolueront</b> : plus résistants, et de nouvelles espèces.</div>`;

  const adv = bilan.adversaireSuivant;
  const annonceAdv = adv ? `<div class="apercu">⚔️ <b>Prochain duel contre ${esc(adv.nom)}</b> (❤️ ${adv.vies}) —
      ${SLOTS.map(sl => `${sl.icone} ${esc(PIECES_PAR_ID[adv.equipe[sl.id]].nom)}${adv.nivPieces[adv.equipe[sl.id]] > 1 ? ' niv ' + adv.nivPieces[adv.equipe[sl.id]] : ''}`).join(' · ')}</div>` : '';
  const ligne = (a, actuel, suivant) => {
    const prix = prixAmelio(a.id), n = partie.moi.niveaux[a.id] || 0;
    const conseil = (partie.conseils || []).includes(a.id);
    return `<button class="amelio ${conseil ? 'conseil' : ''}" data-a="${a.id}" ${prix == null || prix > partie.argent ? 'disabled' : ''} title="${esc(a.desc)}">
      <span class="ic">${a.icone}</span><span><b>${a.nom}</b> <span class="niv">+${n}</span>${conseil ? ' <span class="badge-conseil">conseillé</span>' : ''}<br>
      <span class="petit">${esc(actuel)}${suivant != null ? ` → <span class="plus">${esc(suivant)}</span>` : ''}</span></span>
      <span class="px">${prix == null ? 'MAX' : prix + ' 💰'}</span></button>`;
  };
  const rendre = () => {
    const p = partie.moi;
    const niv = niveauxToupie(p.equipe, p.niveaux, p.nivPieces);
    const s = calcul(niv);
    const offert = a => !partie.offres || partie.offres.includes(a.id);
    const colonneStats = groupe => STAT_ACHATS.filter(a => a.groupe === groupe && offert(a)).map(a => {
      const plus = calcul({ ...niv, [a.id]: (niv[a.id] || 0) + 1 });
      return ligne(a, STAT[a.id].fmt(s), prixAmelio(a.id) == null ? null : STAT[a.id].fmt(plus));
    }).join('');
    const colonneBureau = colonneStats('bureau');
    $('bilanContenu').innerHTML = `${titre}${elim}${gains}
      ${apercu}
      ${annonceAdv}
      <div class="ligne" style="margin-top:12px"><h2>Boutique</h2>
        <span>${partie.offres ? `<button class="btn second petit-btn" id="relancer" ${partie.argent < BOUTIQUE.relance ? 'disabled' : ''}>🎲 Relancer (${BOUTIQUE.relance} 💰)</button>` : ''}
        <span class="pastille">💰 ${partie.argent}</span></span></div>
      <div class="petit">${partie.offres ? `${partie.offres.length} offres tirées au hasard : choisis !` : ''} Le bureau rapporte plus d'argent plus tard ; la toupie et le lanceur rendent plus fort tout de suite. Les pièces ne changent pas pendant la partie.</div>
      <div class="branches">
        <div class="branche"><h3>🪑 Bureau<small>économie</small></h3>${colonneBureau}</div>
        <div class="branche"><h3>🌀 Toupie<small>puissance</small></h3>${colonneStats('toupie')}</div>
        <div class="branche"><h3>🚀 Lanceur<small>lancer</small></h3>${colonneStats('lanceur')}
          <h3 style="margin-top:12px">🏟️ Terrain<small>${esc(TERRAIN[p.terrain].icone + ' ' + TERRAIN[p.terrain].nom)}</small></h3>
          ${p.terrain === 'aucun' ? '<div class="petit">Pas de terrain choisi à l\'atelier : tu as commencé avec plus d\'argent.</div>'
            : prioriteDispo() ? ligne(PRIORITE, PRIORITE.fmt(p.niveaux.priorite || 0), prixAmelio('priorite') == null ? null : PRIORITE.fmt((p.niveaux.priorite || 0) + 1))
              + `<div class="petit">${esc(PRIORITE.desc)}</div>`
            : `<div class="petit">La priorité de terrain s'achète à partir de la manche ${MANCHE_PRIORITE}. ${esc(PRIORITE.desc)}</div>`}
        </div>
      </div>
      <div class="ligne pied"><span class="petit">Prochaine manche : <b>${prochaine}</b></span><button class="btn" id="pret">Prêt ▶</button></div>`;
    $('pret').onclick = () => { montrer('bilan', false); onPret(); };
    const rel = $('relancer');
    if (rel) rel.onclick = e => { e.stopPropagation(); if (relancerOffres()) { rendre(); majHud(); } };
  };
  $('bilanContenu').onclick = e => {
    const b = e.target.closest('[data-a]');
    if (b && acheter(b.dataset.a)) { rendre(); majHud(); }
  };
  rendre();
  montrer('bilan');
  $('bilan').firstElementChild.scrollTop = 0; // on commence toujours en haut (résultat de la manche)
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

