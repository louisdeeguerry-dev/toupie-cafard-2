// Les cafards et leur ÉVOLUTION. Après chaque duel contre un joueur (= à chaque nouvelle étape), les cafards mutent :
// ils deviennent plus résistants ET de nouvelles espèces arrivent, chacune contrée par des stats différentes.
// But : empêcher la stratégie « je farme l'argent au début, je sacrifie mes vies, puis j'améliore tout d'un coup » —
// une toupie restée faible ne tue plus rien (donc ne gagne plus rien) quand les cafards ont évolué.

export const TYPES = {
  cafard: { nom: 'Cafard', icone: '🪳', vie: 1, taille: 1, vitesse: 1, prime: 1, couleur: 0x5a3214,
    desc: 'Le cafard de base.' },
  gros: { nom: 'Gros cafard', icone: '🐛', vie: 2.2, taille: 1.35, vitesse: 0.65, prime: 2, masse: 3, couleur: 0x3e2210,
    desc: 'Énorme et lourd : il repousse les toupies légères.', contre: ['poids', 'lames'] },
  blinde: { nom: 'Cafard blindé', icone: '🛡️', vie: 1.6, taille: 1.1, vitesse: 0.8, prime: 2, armure: 0.25, couleur: 0x56616d, metal: true,
    desc: 'Carapace : chaque coup perd une partie de ses dégâts. Il faut frapper fort.', contre: ['lames', 'critique'] },
  coureur: { nom: 'Cafard coureur', icone: '💨', vie: 0.8, taille: 0.9, vitesse: 3.2, prime: 2, fuite: true, couleur: 0xa5713a,
    desc: 'Très rapide, il fuit la toupie.', contre: ['diametre', 'agressivite', 'tornade'] },
  araignee: { nom: 'Araignée', icone: '🕷️', vie: 2, taille: 1.2, vitesse: 1.2, prime: 3, toile: true, couleur: 0x1d1d22,
    desc: 'Tisse des toiles qui engluent la toupie et la font ralentir.', contre: ['poids', 'elan', 'feu'] },
  pondeuse: { nom: 'Pondeuse', icone: '🥚', vie: 3.5, taille: 1.5, vitesse: 0.4, prime: 4, ponte: 4, couleur: 0x6b2f4e,
    desc: 'Pond des larves tant qu\'elle est en vie.', contre: ['eclair', 'feu', 'endurance'] },
  larve: { nom: 'Larve', icone: '🐛', vie: 0.4, taille: 0.6, vitesse: 0.8, prime: 0.5, couleur: 0xe8d8b0,
    desc: 'Pondue par la pondeuse.' },
};

// Proportions de chaque espèce selon l'étape (l'étape 5 et suivantes gardent le dernier mélange)
export const COMPOSITION = [
  { cafard: 1 },
  { cafard: 0.7, gros: 0.3 },
  { cafard: 0.45, gros: 0.2, blinde: 0.2, coureur: 0.15 },
  { cafard: 0.3, gros: 0.15, blinde: 0.2, coureur: 0.15, araignee: 0.2 },
  { cafard: 0.2, gros: 0.15, blinde: 0.2, coureur: 0.15, araignee: 0.2, pondeuse: 0.1 },
];
export const compositionEtape = etape => COMPOSITION[Math.min(COMPOSITION.length, etape) - 1];

// Espèces qui apparaissent pour la première fois à cette étape
export function nouveauxTypes(etape) {
  if (etape <= 1) return [];
  const avant = Object.keys(compositionEtape(etape - 1)), maintenant = Object.keys(compositionEtape(etape));
  return maintenant.filter(t => !avant.includes(t));
}

// Tirage d'une liste d'espèces pour une vague (répartition exacte, puis mélange)
export function especesVague(nombre, etape, rand = Math.random) {
  const comp = Object.entries(compositionEtape(etape)), liste = [];
  for (const [t, part] of comp) for (let i = 0; i < Math.round(part * nombre); i++) liste.push(t);
  while (liste.length < nombre) liste.push('cafard');
  liste.length = nombre;
  for (let i = liste.length - 1; i > 0; i--) { const j = Math.floor(rand() * (i + 1)); [liste[i], liste[j]] = [liste[j], liste[i]]; }
  return liste;
}
