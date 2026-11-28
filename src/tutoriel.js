// Tutoriel guidé (obligatoire avant les vraies parties) : une vraie partie contre des bots faciles, raccourcie à 2 étapes
// (6 lancers contre les cafards, 2 duels). Une bulle explique chaque étape et attend l'action du joueur.
// Les autres modules signalent les actions par window.__tuto?.(evenement) : 'debut', 'lance', 'bilan', 'achat', 'relance',
// 'bannir', 'pret', 'duel', 'bilanDuel'. À la fin : 3 pièces de toupie offertes, et les vraies parties se débloquent.

// attend : l'événement qui fait passer à l'étape suivante ; passer : l'étape est facultative (bouton « Passer »)
const ETAPES = [
  { attend: 'lance', texte: '🎓 <b>Bienvenue !</b> Des cafards envahissent le bureau. <b>Garde appuyé</b> sur le plateau pour viser : la jauge de puissance oscille. <b>Relâche</b> au bon moment pour lancer ta toupie. <span class="petit">(Au doigt : glisse d\'abord en bas de l\'écran pour placer le lanceur.)</span>' },
  { attend: 'bilan', texte: 'Ta toupie écrase les cafards : chacun rapporte des 💰. Elle s\'arrête quand elle n\'a plus assez de rotation.' },
  { attend: 'achat', texte: '🛒 <b>La boutique.</b> Entre deux manches, 4 offres améliorent ta toupie. <b>Clique une offre pour l\'acheter.</b> Plus elle est rare (couleur), plus elle donne de niveaux.' },
  { attend: 'relance', passer: true, texte: 'Bien joué ! 🎲 <b>Relancer</b> remplace les 4 offres (le prix augmente à chaque fois dans la manche). Essaie !' },
  { attend: 'bannir', passer: true, texte: '🚫 <b>Bannir</b> : clique <b>deux fois</b> sur le 🚫 d\'une offre que tu ne veux plus jamais voir. Une seule fois par partie : garde-le pour une stat qui ne sert pas ta toupie.' },
  { attend: 'pret', texte: 'Quand tu as fini tes achats, clique <b>« Prêt ▶ »</b>. Garder des 💰 rapporte des intérêts à chaque manche.' },
  { attend: 'duel', texte: 'Encore 2 lancers. Astuce : vise les <b>groupes</b> de cafards, et enchaîne-les vite pour le bonus de combo 🔗.' },
  { attend: 'bilanDuel', texte: '⚔️ <b>DUEL !</b> Les deux toupies partent <b>ensemble</b> quand vous avez lancé tous les deux. Chaque choc fait perdre de la rotation : <b>la première toupie arrêtée perd</b>, et une défaite coûte une ❤️. Vise l\'adversaire !' },
  { attend: 'pret', texte: 'Après chaque duel, les cafards <b>évoluent</b> et deviennent plus résistants : continue d\'améliorer ta toupie. Dernière étape : 3 lancers, puis un duel.' },
  { attend: 'bilanDuel', texte: null }, // dernier duel : pas de bulle, la fin du tutoriel s'affiche ensuite
];

const etat = { actif: false, i: 0, duels: 0 };
let bulle = null;
function afficher() {
  if (!bulle) {
    bulle = document.createElement('div');
    bulle.id = 'guide';
    document.body.appendChild(bulle);
  }
  const e = ETAPES[etat.i];
  bulle.classList.toggle('cache', !etat.actif || !e?.texte);
  if (!e?.texte) return;
  bulle.innerHTML = `<div class="guide-texte">${e.texte}</div>${e.passer ? '<button class="btn discret" id="guidePasser">Passer ▶</button>' : ''}
    <div class="guide-etape">Tutoriel · ${etat.i + 1}/${ETAPES.length}</div>`;
  bulle.querySelector('#guidePasser')?.addEventListener('click', suivante);
}
function suivante() { etat.i++; afficher(); }

export const tutoriel = {
  get actif() { return etat.actif; },
  get duels() { return etat.duels; },
  commencer() { Object.assign(etat, { actif: true, i: 0, duels: 0 }); afficher(); },
  arreter() { etat.actif = false; afficher(); },
  // Un événement de jeu : on passe à l'étape suivante si c'est celui qu'on attend
  evenement(nom) {
    if (!etat.actif) return;
    if (nom === 'bilanDuel') etat.duels++;
    if (ETAPES[etat.i]?.attend === nom) suivante();
  },
};
window.__tuto = nom => tutoriel.evenement(nom);
