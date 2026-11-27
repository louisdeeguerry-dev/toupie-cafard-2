// Interface : atelier, boîte mystère, recherche de partie, HUD, bilan + boutique, fin de partie.
import { SLOTS, PIECES, PIECE, RARETES, tirerBoite, niveauxPiece, multiplicateurNiveau, NIVEAU_PIECE_MAX, GARANTIE_LEGENDAIRE } from './data/pieces.js';
import { TERRAINS, TERRAIN } from './data/terrains.js';
import { STAT_ACHATS, PRIORITE, MANCHE_PRIORITE } from './data/boutique.js';
import { PARTIE } from './config.js';
import { STATS, STAT, GROUPES, niveauxToupie, calculer as calcul, tempsRotation, effet, BORNES } from './stats.js';
import { partie, etape, prixAmelio, acheter, prioriteDispo, lancerDansEtape, relancerOffres, prixRelance, bannir, peutBannir, interetsPrevus, niveauxAchat, mesStats as mesStatsUI } from './match.js';
import { ECONOMIE, RARETE_OFFRE, PARTIE as REGLES_PARTIE } from './config.js';
import { PIECE as PIECES_PAR_ID } from './data/pieces.js';
import { TYPES } from './data/cafards.js';
import { MODES, MONNAIE, PRIX_BOITE, rangDe, RANGS, xpPourNiveau, acheterBoite } from './progression.js';
import { son, sfx } from './audio.js';
import { inspecter } from './inspecteur.js';

const $ = id => document.getElementById(id);
const esc = s => String(s).replace(/[&<>"]/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));

export function montrer(id, oui = true) {
  $(id).classList.toggle('cache', !oui);
  if (id === 'hud') $('quitter').classList.toggle('cache', !oui); // le bouton Abandonner / Quitter suit le HUD
}
export { son };

// Effets d'une pièce en unités réelles (« 💥 +7 % de chance de critique »)
function modsHtml(niveaux) {
  return Object.entries(niveaux).map(([k, v]) => `<span class="mod ${v > 0 ? 'plus' : 'moins'}" title="${STAT[k].nom}">${STAT[k].icone} ${esc(effet(k, v))}</span>`).join('');
}

let aBannir = null; // bannissement en attente de confirmation (2e clic), hors de la boutique qui se redessine
function carteHtml(p, k = 1) {
  const r = RARETES[p.rarete];
  return `<div class="rar" style="color:${r.couleur}">${r.nom}</div><div class="nom"><b>${esc(p.nom)}</b>${k > 1 ? ` <span class="niv-badge">niv ${k}</span>` : ''}</div>
    <div class="desc">${esc(p.desc)}</div><div class="mods">${modsHtml(niveauxPiece(p, k))}</div>`;
}

// Tableau de TOUTES les stats (celles du jeu 1), avec niveau et valeur réelle ; « apres » = aperçu d'un changement
// Les stats en barres qui se remplissent (0 = vide, à fond = très haut). Survol : la valeur réelle et le niveau.
// Pouvoirs (stats spéciales) : vides tant qu'on ne les a pas.
// Barres : 1 % = le pire assortiment de pièces possible pour cette stat, 100 % = le meilleur assortiment au niveau max
// (calculés sur toutes les combinaisons, voir BORNES). Les pouvoirs (stats spéciales) sont vides tant qu'on ne les a pas.
const pctStat = (st, n) => {
  const { min, max } = BORNES[st.id];
  if (st.special) return max > 0 ? Math.max(0, Math.min(1, n / max)) : 0;
  return max > min ? Math.max(0.01, Math.min(1, 0.01 + 0.99 * (n - min) / (max - min))) : 0.5;
};
export function tableauStats(niv, nivApres = null) {
  const v = calcul(niv), w = nivApres ? calcul(nivApres) : null;
  const t = tempsRotation(w || v);
  const alerte = t < 4 ? `<div class="alerte">⚠️ Toupie très instable : ${t.toFixed(1)} s de rotation seulement.</div>` : '';
  return alerte + GROUPES.map(g => `<div class="groupe"><h3>${g.icone} ${g.nom}</h3>` + STATS.filter(st => st.groupe === g.id).map(st => {
    const a = niv[st.id] || 0, b = nivApres ? nivApres[st.id] || 0 : a;
    const pa = pctStat(st, a) * 100, pb = pctStat(st, b) * 100, lo = Math.min(pa, pb), hi = Math.max(pa, pb);
    const titre = `${st.nom} : ${st.fmt(w || v)} (niveau ${b > 0 ? '+' : ''}${b})\n${st.desc}`;
    return `<div class="sb ${st.special && !a && !b ? 'vide' : ''}" title="${esc(titre)}">
      <span class="ic">${st.icone}</span><span class="n">${st.nom}</span>
      <span class="barre-stat"><i style="width:${lo}%"></i>${hi > lo ? `<b class="${pb > pa ? 'plus' : 'moins'}" style="left:${lo}%;width:${hi - lo}%"></b>` : ''}</span></div>`;
  }).join('') + '</div>').join('');
}

// ---------------------------------------------------------------- Atelier
const nivMax = (save, id) => Math.min(NIVEAU_PIECE_MAX, save.collection[id] || 0);
const nivDe = (save, id) => Math.min(nivMax(save, id), save.niveauxPieces[id] || 1) || 1;

// onSelection(onglet, slot) : prévient la vue 3D (vue éclatée, zoom) ; onEquipe(slot) : une pièce vient de changer
export function creerAtelier(save, { onChange, onJouer, onBoite, onSelection = () => {}, onEquipe = () => {} }) {
  let onglet = 'toupie', slotChoisi = null, apercu = null; // apercu : { id, niv }

  function rendre() {
    const eq = save.equipe;
    document.querySelectorAll('#onglets [data-onglet]').forEach(b => b.classList.toggle('on', b.dataset.onglet === onglet));
    montrer('zonePieces', onglet !== 'terrain');
    montrer('zoneTerrain', onglet === 'terrain');
    $('consigne').textContent = onglet === 'terrain' ? 'Ton terrain pour les duels' : slotChoisi ? '' : 'Choisis une pièce à changer';
    // Une pièce ouverte : la liste des pièces remplace les emplacements, jusqu'au bouton Retour
    montrer('slots', !slotChoisi);
    montrer('onglets', !slotChoisi);
    $('slots').innerHTML = SLOTS.filter(s => s.groupe === onglet).map(s => {
        const p = PIECE[eq[s.id]], k = nivDe(save, p.id);
        return `<button class="slot ${s.id === slotChoisi ? 'choisi' : ''}" data-slot="${s.id}">
          <div class="lib">${s.icone} ${s.nom}</div><div class="nom" style="color:${RARETES[p.rarete].couleur}">${esc(p.nom)}${k > 1 ? ` <span class="niv-badge">niv ${k}</span>` : ''}</div></button>`;
      }).join('');
    const possedees = PIECES.filter(p => p.slot === slotChoisi && save.collection[p.id]);
    const slot = SLOTS.find(s => s.id === slotChoisi);
    const total = PIECES.filter(p => p.slot === slotChoisi).length;
    $('choix').innerHTML = !slot ? '' : `<button class="retour-menu retour-piece">← Retour</button>
      <h3>${slot.icone} ${slot.nom}</h3><div class="petit">${esc(slot.desc)} — ${possedees.length}/${total} trouvées</div>` + possedees.map(p => {
      const k = nivDe(save, p.id), max = nivMax(save, p.id);
      const chips = max > 1 ? `<div class="chips">Niveau : ${Array.from({ length: max }, (_, i) => i + 1).map(n =>
        `<span class="chip ${n === k ? 'on' : ''}" data-piece="${p.id}" data-niv="${n}" title="Tout ×${multiplicateurNiveau(n)}">${n}</span>`).join('')}
        <span class="petit">(${save.collection[p.id]} exemplaires — tout ×${multiplicateurNiveau(k)})</span></div>`
        : `<div class="petit">1 exemplaire — un doublon débloque le niveau 2</div>`;
      return `<div class="carte ${eq[slotChoisi] === p.id ? 'equipee' : ''}" data-piece="${p.id}" data-niv="${k}">${carteHtml(p, k)}${chips}
        <button class="loupe" data-inspecter="${p.id}" title="Voir la pièce en grand">🔍</button></div>`;
    }).join('');
    rendreStats();
    $('bilanCollection').textContent = `${Object.keys(save.collection).length}/${PIECES.length} pièces`;
    $('ouvrirBoite').textContent = `📦 Ouvrir (${save.boites})`;
    $('soldeEcrous').textContent = `${save.ecrous} ${MONNAIE.icone} ${MONNAIE.nom}`;
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
    const slot = PIECE[id].slot;
    save.equipe[slot] = id;
    if (k) save.niveauxPieces[id] = k;
    apercu = null;
    son('achat', { volume: 0.55 }); son('toc', { volume: 0.5, hauteur: 1.6 });
    rendre(); onChange(); onEquipe(slot);
  }

  $('onglets').addEventListener('click', e => {
    const b = e.target.closest('[data-onglet]');
    if (!b || b.dataset.onglet === onglet) return;
    onglet = b.dataset.onglet; slotChoisi = null; apercu = null;
    son('choix', { volume: 0.5 }); son('toc', { volume: 0.3, hauteur: 0.8 });
    rendre(); onSelection(onglet, null);
  });
  $('slots').addEventListener('click', e => {
    const b = e.target.closest('[data-slot]');
    if (!b) return;
    // Cliquer sur la pièce déjà ouverte la referme (retour à la vue d'ensemble)
    slotChoisi = slotChoisi === b.dataset.slot ? null : b.dataset.slot; apercu = null;
    son('choix', { volume: 0.5 }); son('toc', { volume: 0.45, hauteur: slotChoisi ? 1.25 : 0.9 });
    rendre(); onSelection(onglet, slotChoisi);
  });
  $('choix').addEventListener('click', e => {
    const loupe = e.target.closest('[data-inspecter]');
    if (loupe) return inspecter(loupe.dataset.inspecter, { save, onEquiper: (id, k) => equiper(id, k) });
    if (e.target.closest('.retour-piece')) { // on referme : la pièce revient, on revoit tous les emplacements
      slotChoisi = null; apercu = null;
      son('toc', { volume: 0.45, hauteur: 0.9 });
      rendre(); onSelection(onglet, null);
      return;
    }
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
    save.terrain = b.dataset.terrain; son('choix', { volume: 0.5 }); son('toc', { volume: 0.4, hauteur: 0.7 }); rendre(); onChange(); onEquipe('terrain');
  });
  $('jouer').addEventListener('click', onJouer);
  $('ouvrirBoite').addEventListener('click', onBoite);
  $('acheterBoite').addEventListener('click', () => {
    if (acheterBoite(save)) { son('piece'); rendre(); onChange(); } else son('refus');
  });
  rendre();
  return { rendre, etat: () => ({ onglet, slot: slotChoisi }) };
}

// ---------------------------------------------------------------- Collection : tout ce qu'on possède (et ce qui manque)
let collectionBranchee = false;
export function rendreCollection(save) {
  if (!collectionBranchee) {
    collectionBranchee = true;
    $('collectionContenu').addEventListener('click', e => {
      const c = e.target.closest('[data-inspecter]');
      if (c) inspecter(c.dataset.inspecter, { save });
    });
  }
  const possede = PIECES.filter(p => save.collection[p.id]).length;
  $('collectionTotal').textContent = `${possede}/${PIECES.length} pièces · ${save.terrains.length}/${TERRAINS.filter(t => t.rarete).length} terrains`;
  $('collectionContenu').innerHTML = SLOTS.map(sl => `<div class="col-groupe"><h3>${sl.icone} ${sl.nom}</h3><div class="col-grille">` +
    PIECES.filter(p => p.slot === sl.id).map(p => {
      const n = save.collection[p.id] || 0, r = RARETES[p.rarete];
      return `<div class="col-carte ${n ? '' : 'manque'}" ${n ? `data-inspecter="${p.id}"` : ''} title="${esc(p.desc)}" style="border-color:${n ? r.couleur + '88' : ''}">
        <span class="rar" style="color:${r.couleur}">${r.nom}</span><b>${n ? esc(p.nom) : '???'}</b>
        ${n ? `<span class="petit">×${n}${n > 1 ? ` · jusqu'au niveau ${Math.min(NIVEAU_PIECE_MAX, n)}` : ''}</span>` : '<span class="petit">à trouver</span>'}</div>`;
    }).join('') + '</div></div>').join('') +
    `<div class="col-groupe"><h3>🏟️ Terrains de duel</h3><div class="col-grille">` + TERRAINS.filter(t => t.rarete).map(t => {
      const ok = save.terrains.includes(t.id);
      return `<div class="col-carte ${ok ? '' : 'manque'}" title="${esc(t.desc)}"><span class="rar" style="color:${RARETES.legendaire.couleur}">Légendaire</span>
        <b>${ok ? t.icone + ' ' + esc(t.nom) : '???'}</b><span class="petit">${ok ? 'possédé' : 'à trouver'}</span></div>`;
    }).join('') + '</div></div>';
}

// ---------------------------------------------------------------- Boîte mystère
export function ouvrirBoite(save, { onFini }) {
  if (save.boites <= 0) return;
  montrer('boite');
  const carton = $('carton');
  carton.className = 'jouet secoue';
  carton.style.removeProperty('--lueur');
  $('pieceSortie').textContent = '';
  $('revelation').innerHTML = '';
  $('boiteAide').textContent = 'Clique sur la boîte pour l\'ouvrir (4 clics)';
  son('choix');
  // Le lot est tiré dès le départ : la couleur de la lumière (3e clic) annonce déjà sa rareté
  save.boites--;
  const lot = tirerBoite(save.terrains, { garantie: save.boitesSansLegendaire >= GARANTIE_LEGENDAIRE - 1 });
  save.boitesSansLegendaire = lot.rarete === 'legendaire' ? 0 : save.boitesSansLegendaire + 1;
  const rar = RARETES[lot.type === 'piece' ? lot.piece.rarete : lot.type === 'terrain' ? lot.terrain.rarete : 'legendaire'];
  const icone = lot.type === 'piece' ? SLOTS.find(s => s.id === lot.piece.slot).icone : lot.type === 'terrain' ? lot.terrain.icone : lot.coffre.icone;
  let clics = 0;
  const textes = ['Encore !', 'Ça s\'ouvre…', 'Dernier clic !'];
  carton.onclick = () => {
    clics++;
    carton.className = 'jouet ' + [1, 2, 3, 4].slice(0, clics).map(i => 'etape' + i).join(' '); // les étapes se cumulent
    if (clics === 3) carton.style.setProperty('--lueur', rar.couleur);
    if (clics < 4) { $('boiteAide').textContent = textes[clics - 1]; son('toc', { volume: 0.5, hauteur: 0.8 + clics * 0.2 }); son('choix', { volume: 0.4, hauteur: 0.8 + clics * 0.15 }); return; }
    carton.onclick = null;
    $('pieceSortie').textContent = icone;
    sfx.legendaire();
    revelerLot();
  };
  const revelerLot = () => {
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
      }, 1100);
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
      }, 1100);
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
    }, 1100);
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
// Verdict du duel : grand, plein écran, coloré ; il s'efface tout seul quand la boutique arrive
export function verdict(gagne, sous) {
  const v = $('verdict');
  v.className = gagne ? 'gagne' : 'perdu';
  v.innerHTML = `<b>${gagne ? '🏆 VICTOIRE' : '💥 DÉFAITE'}</b><small>${esc(sous)}</small>`;
  void v.offsetWidth; v.classList.add('visible');
  setTimeout(() => v.classList.remove('visible'), 2100);
}
export function bandeau(titre, sous = '', duree = 1800) {
  const b = $('bandeau');
  b.innerHTML = `${esc(titre)}${sous ? `<small>${esc(sous)}</small>` : ''}`;
  b.classList.add('visible');
  clearTimeout(bandeauT);
  bandeauT = setTimeout(() => b.classList.remove('visible'), duree);
}

// Le compteur d'argent défile jusqu'à sa nouvelle valeur (au lieu de sauter)
let argentAffiche = null, argentAnim = 0;
function compteurArgent(cible) {
  if (argentAffiche === null || Math.abs(cible - argentAffiche) > 200) argentAffiche = cible;
  cancelAnimationFrame(argentAnim);
  const depart = argentAffiche, t0 = performance.now();
  const pas = () => {
    const k = Math.min(1, (performance.now() - t0) / 450);
    argentAffiche = depart + (cible - depart) * (1 - (1 - k) ** 3);
    $('argent').textContent = `💰 ${Math.round(argentAffiche)}`;
    if (k < 1) argentAnim = requestAnimationFrame(pas); else argentAffiche = cible;
  };
  pas();
}
export function majHud() {
  if (!partie.joueurs) return;
  const moi = partie.moi, etroit = window.innerWidth < 720;
  const viesMax = PARTIE.vies;
  $('vies').textContent = etroit ? `❤️ ${Math.max(0, moi.vies)}` : '❤️'.repeat(Math.max(0, moi.vies)) + '🖤'.repeat(Math.max(0, viesMax - moi.vies));
  $('argent').style.display = partie.entrainement ? 'none' : '';
  $('vies').style.display = partie.entrainement ? 'none' : '';
  $('salon').style.display = partie.entrainement ? 'none' : '';
  if (partie.entrainement) $('manches').innerHTML = `<span>🎯 Entraînement · ${partie.entrainement.lancers} lancer${partie.entrainement.lancers > 1 ? 's' : ''}</span>`;
  compteurArgent(partie.argent);
  const n = PARTIE.cycle.length, mm = partie.mancheAffichee ?? partie.manche, et = Math.floor(mm / n) + 1, debut = (et - 1) * n;
  if (!partie.entrainement) $('manches').innerHTML = `<span class="petit">${etroit ? 'É' : 'Étape '}${et}</span>` + PARTIE.cycle.map((t, i) => {
    const m = debut + i, cls = m < mm ? 'fait' : m === mm ? 'cours' : '';
    return `<i class="${cls}" title="${t === 'duel' ? 'Duel' : 'Cafards'}">${t === 'duel' ? '⚔️' : '🪳'}</i>`;
  }).join('');
  $('salon').innerHTML = [...partie.joueurs].sort((a, b) => (b.elimine ? -1 : b.vies) - (a.elimine ? -1 : a.vies)).map(j =>
    `<div class="${j === moi ? 'moi' : ''} ${j === partie.adversaire ? 'adv' : ''} ${j.elimine ? 'out' : ''}"><span>${esc(j.nom)}</span><span>${j.elimine ? j.place + 'e' : '❤️' + j.vies}</span></div>`
  ).join('');
  if (partie.entrainement) {
    $('objectif').textContent = '🎯 Vise le mannequin : il ne bouge pas et ne meurt jamais';
    $('lancers').classList.add('cache');
  } else if (partie.type === 'cafards') {
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
let dernierMinuteur = null;
export function minuteur(texte, urgent = false) {
  const cle = texte + urgent;
  if (cle === dernierMinuteur) return;
  dernierMinuteur = cle;
  $('minuteur').textContent = texte;
  $('minuteur').classList.toggle('urgent', urgent);
}

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

// ---------------------------------------------------------------- Bilan + boutique (épurée)
// Une ligne de résultat, les 6 offres en grandes cartes, et à côté : argent, intérêts, relance, Prêt.
let dernieresOffres = null;
export function afficherBilan(bilan, onPret) {
  let resultat;
  if (bilan.type === 'cafards') {
    resultat = `🪳 Lancer ${bilan.lancer}/3 : <b>${bilan.tues}</b> cafard${bilan.tues > 1 ? 's' : ''} écrasé${bilan.tues > 1 ? 's' : ''} · +${bilan.gains} 💰`;
  } else {
    resultat = bilan.gagne ? `⚔️ <b class="plus">Victoire</b> contre ${esc(bilan.adversaire)} (−${bilan.degats} ❤️ pour lui)`
      : `⚔️ <b class="moins">Défaite</b> contre ${esc(bilan.adversaire)} (−${bilan.degats} ❤️)`;
  }
  if (bilan.elimines?.length) resultat += ` · 💀 ${bilan.elimines.map(esc).join(', ')}`;
  const ap = bilan.apercu, adv = bilan.adversaireSuivant;
  const suite = adv ? `Prochain : ⚔️ duel contre <b>${esc(adv.nom)}</b>`
    : ap ? `Prochain : 🪳 lancer ${ap.lancer}/3 · ${ap.capacite} cafards${ap.evolution?.length ? ` · 🧬 nouveaux : ${ap.evolution.map(t => TYPES[t].icone + ' ' + TYPES[t].nom).join(', ')}` : ''}` : '';

  const carte = o => {
    const { id, rarete = 'commune' } = typeof o === 'string' ? { id: o } : o;
    const a = STAT_ACHATS.find(x => x.id === id), R = RARETE_OFFRE[rarete];
    const p = partie.moi, prix = prixAmelio(id, rarete), k = niveauxAchat(id, rarete) || 1;
    const niv = niveauxToupie(p.equipe, p.niveaux, p.nivPieces);
    let avant = STAT[id].fmt(calcul(niv)); const apres = STAT[id].fmt(calcul({ ...niv, [id]: (niv[id] || 0) + k }));
    if (avant === '—') avant = 'pas encore';
    const manque = prix != null && prix > partie.argent ? prix - partie.argent : 0;
    const conseil = (partie.conseils || []).includes(id);
    const fmtK = String(k).replace('.', ',');
    return `<div class="offre-bloc"><button class="offre rarete-${rarete} ${conseil ? 'conseil' : ''}" style="--rar:${R.couleur}" data-a="${id}" data-r="${rarete}" ${prix == null || prix > partie.argent ? 'disabled' : ''} title="${esc(a.desc)}">
      <span class="badge-rarete">${R.nom}${id === 'nid' ? ` · +${k} cafard${k > 1 ? 's' : ''}` : R.mult > 1 ? ` · effet ×${String(R.mult).replace('.', ',')}` : ''}</span>
      ${conseil ? '<span class="badge-conseil">conseillé</span>' : ''}
      <span class="ic">${a.icone}</span><b>${esc(a.nom)}</b>${k > 1 ? `<span class="paquet">+${fmtK} niveaux</span>` : ''}
      <span class="effet">${esc(avant)}<br>→ <span class="plus">${esc(apres)}</span></span>
      <span class="px">${prix == null ? 'MAX' : prix + ' 💰'}</span>${manque ? `<span class="manque">il manque ${manque} 💰</span>` : ''}</button>${peutBannir() && partie.offres ? `<span class="bannir" data-bannir="${id}" role="button" title="Bannir ${esc(a.nom)} : cette amélioration ne sortira plus de toute la partie (1 seul bannissement par partie)">🚫</span>` : ''}</div>`;
  };

  const rendre = () => {
    const offres = partie.offres || STAT_ACHATS.map(a => a.id);
    if (offres.some(o => o.rarete === 'legendaire') && partie.offres !== dernieresOffres) sfx.legendaire();
    dernieresOffres = partie.offres;
    const prixR = prixRelance(), interets = interetsPrevus();
    $('bilanContenu').innerHTML = `
      <div class="resume">${resultat}</div>
      <div class="boutique">
        <div class="offres">${offres.map(carte).join('')}</div>
        <div class="cote-boutique">
          <div class="argent-gros">💰 ${partie.argent}</div>
          <div class="petit" title="À la fin de chaque manche : +1 💰 par tranche de ${ECONOMIE.interetPour} 💰 gardés, plafonné par la Tirelire">
            Intérêts : <b>+${interets} 💰</b> à la fin de la manche<br>(+1 par ${ECONOMIE.interetPour} 💰 gardés, max ${mesStatsUI().interetMax})</div>
          <button class="btn second" id="relancer" ${partie.argent < prixR ? 'disabled' : ''}>🎲 Relancer · ${prixR} 💰</button>
          <button class="btn" id="pret">Prêt ▶ <span id="chronoBoutique"></span></button>
          <div class="barre-temps"><i id="barreTempsBoutique"></i></div>
          ${partie.bannies?.length ? `<div class="petit">🚫 Banni pour la partie : ${partie.bannies.map(id => STAT_ACHATS.find(x => x.id === id)?.nom || id).join(', ')}</div>` : partie.offres ? '<div class="petit">🚫 sur une offre : la bannir pour toute la partie (1 fois)</div>' : ''}
          ${prioriteHtml()}
          <div class="petit">${suite}</div>
        </div>
      </div>`;
    $('pret').onclick = () => { if (fini) return; fini = true; clearInterval(chrono); montrer('bilan', false); onPret(); };
    majChrono();
    $('relancer').onclick = e => { e.stopPropagation(); if (relancerOffres()) { rendre(); majHud(); } };
    const bp = $('btnPriorite');
    if (bp) bp.onclick = e => { e.stopPropagation(); if (acheter('priorite')) { rendre(); majHud(); } };
  };
  // Priorité de terrain : toujours achetable (si on a un terrain), petit bouton sous Relancer / Prêt
  const prioriteHtml = () => {
    const n = partie.moi.niveaux.priorite || 0, prix = prixAmelio('priorite');
    const sansTerrain = partie.moi.terrain === 'aucun';
    if (sansTerrain) return ''; // pas de terrain de duel : le bouton ne servirait à rien
    return `<button class="btn second petit-btn" id="btnPriorite" ${sansTerrain || prix == null || prix > partie.argent ? 'disabled' : ''}
      title="${esc(PRIORITE.desc)}${sansTerrain ? ' (il faut avoir choisi un terrain de duel dans l\'atelier)' : ''}">
      🏟️ Priorité de terrain · ${prix == null ? 'MAX' : prix + ' 💰'}<br><span class="petit">${sansTerrain ? 'pas de terrain choisi' : PRIORITE.fmt(n)}</span></button>`;
  };
  $('bilanContenu').onclick = e => {
    // Bannir : 1er clic = demande de confirmation, 2e clic = banni pour toute la partie
    const ban = e.target.closest('[data-bannir]');
    if (ban) {
      // (état gardé en mémoire et pas dans le DOM : la boutique peut se redessiner entre les deux clics)
      const id = ban.dataset.bannir;
      if (aBannir?.id !== id || Date.now() - aBannir.t > 3000) {
        aBannir = { id, t: Date.now() };
        ban.classList.add('confirmer'); ban.textContent = '🚫 Bannir ?';
        setTimeout(() => { if (ban.isConnected) { ban.classList.remove('confirmer'); ban.textContent = '🚫'; } }, 3000);
        return;
      }
      aBannir = null;
      if (bannir(id)) rendre();
      return;
    }
    const b = e.target.closest('[data-a]');
    // Acheter relance automatiquement les offres (gratuit)
    if (b && acheter(b.dataset.a, b.dataset.r)) {
      const a = STAT_ACHATS.find(x => x.id === b.dataset.a);
      rendre(); majHud();
      // Confirmation visible de l'achat (les offres viennent d'être relancées)
      const t = document.createElement('div');
      t.className = 'achat-ok'; t.textContent = `✅ ${a.icone} ${a.nom} amélioré !`;
      $('bilanContenu').appendChild(t);
      setTimeout(() => t.remove(), 1300);
    }
  };
  // Temps limité pour la boutique : au bout du temps, on passe à la suite comme si on avait cliqué « Prêt »
  let fini = false, reste = REGLES_PARTIE.tempsBoutique;
  const majChrono = () => {
    const c = $('chronoBoutique'), b = $('barreTempsBoutique');
    if (c) c.textContent = `(${Math.ceil(reste)} s)`;
    if (b) { b.style.width = `${(reste / REGLES_PARTIE.tempsBoutique) * 100}%`; b.classList.toggle('urgent', reste <= 5); }
  };
  const chrono = setInterval(() => {
    if ($('bilan').classList.contains('cache') || !partie.active) { clearInterval(chrono); return; } // partie quittée
    reste -= 0.25;
    majChrono();
    if (reste <= 0) $('pret')?.click();
  }, 250);
  rendre();
  montrer('bilan');
  $('bilan').firstElementChild.scrollTop = 0;
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

