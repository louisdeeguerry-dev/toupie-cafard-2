# État du projet — Toupie Cafard 2

> À lire au début de chaque session, **à la place** des longs documents. À mettre à jour à la fin de chaque session.
> Dernière mise à jour : 2026-11-26.

## Le jeu en bref
- **Jeu de toupies en ligne façon auto-battler** (TFT) avec un côté **gacha / deck-building** (SPAM). Partie à **8 joueurs**
  (bots pour l'instant), **5 vies**, **plateau rond**.
- **Étape** = **3 lancers contre les cafards** (le bureau est rempli à 10 + Nid avant chaque lancer, les survivants restent),
  puis **1 duel**. La boutique est ouverte entre chaque manche. Un duel perdu coûte autant de vies que le numéro de l'étape ;
  un duel ne rapporte ni ne coûte d'argent.
- **Duel** : il n'y a pas de vie ; chaque choc fait perdre de la rotation, et **la première toupie arrêtée perd**.
  L'usure ne démarre qu'une fois les deux toupies lancées.
- **Cafards** : ils **évoluent après chaque duel** (vie plus haute, nouvelles espèces contrées par des stats précises).
- **Toupie choisie avant la partie, verrouillée pendant** : 4 pièces (base, couronne, pointe, âme) et 2 pièces de lanceur
  (engrenage, ressort).
  - **56 pièces**, chacune avec autant de bonus que de malus (vérifié par un test).
  - Les doublons débloquent des niveaux de pièce, qui amplifient bonus ET malus.
- **Stats** : celles du jeu 1 (toupie, lanceur) et le bureau (Nid, Prime, Trèfle, Combo, Tirelire).
- **Boutique** :
  - 6 offres au hasard, achetées par paquets de +3 niveaux ;
  - relance de plus en plus chère (2, 3, 5, 7… 💰) ;
  - intérêts : +1 💰 par tranche de 5 💰 gardés, plafonné par la Tirelire.
- **Terrains de duel** :
  - rebondissant, collant ou cuve ; ce sont des lots légendaires des boîtes, sans doublon ;
  - en choisir un coûte l'argent de départ ;
  - si les deux joueurs en ont un, la priorité de terrain (points secrets) départage, et à égalité le bureau est neutre.
- **Méta** :
  - boîtes mystère, avec un légendaire garanti toutes les 30 boîtes ;
  - écrous, XP et niveaux ;
  - parties normales ou classées, avec 8 rangs.
- **Hors partie** : **menu principal** (Jouer + mode, Atelier, Boutique de boîtes, Collection).
- **Atelier** :
  - onglets Toupie / Lanceur / Terrain ;
  - quand on clique sur une pièce, **la toupie s'éclate dans son axe** (toutes les pièces s'écartent verticalement, avec un écart plus grand autour de la pièce choisie) et la caméra zoome sur cette pièce ;
  - lanceur : vu de profil et surélevé ; le ressort sort entièrement du manche, le long de son axe, et l'engrenage descend sans pivoter ; la 3D est centrée entre les deux panneaux ;
  - la liste des pièces remplace les emplacements jusqu'au bouton « Retour » ;
  - les stats s'affichent en **barres qui se remplissent**, avec la valeur au survol ;
  - nouveau lanceur 3D inspiré du jeu 1 (engrenage et ressort visibles) ;
  - **glisser pour pivoter, molette ou pincement pour zoomer**, avec un zoom serré sur la pièce choisie ;
  - 🔍 sur chaque pièce ouvre l'**écran d'inspection**.
- **Écran d'inspection** (Collection et atelier) :
  - la pièce grandit au centre, le fond est flou, on peut la faire pivoter et zoomer ;
  - onglets Niv 1 à 5 avec les effets en unités réelles ; bouton « Équiper » dans l'atelier ;
  - on revient avec ← ou un clic sur le fond.
- **Ambiance des menus** : ciel dégradé, 3 projecteurs colorés qui tournent, poussières lumineuses,
  musique lo-fi générée à la volée (bouton 🔊 dans le menu).
- **Pièces adoucies** : niveaux ×0,6 (`FORCE_PIECES` dans `src/data/pieces.js`) ; les effets sont affichés en unités réelles
  (« +7 % de chance de critique », « −5 g »).

## Où est quoi
| Sujet | Fichier |
|---|---|
| Réglages d'équilibrage | `src/config.js`, `CHOC` dans `src/physics.js`, `src/data/*.js` |
| Déroulement d'une partie | `src/match.js` ; bots : `src/bots.js` |
| Atelier 3D / lanceur | `src/atelier3d.js`, `src/lanceurMesh.js`, `src/topMesh.js` |
| Interface | `src/ui.js`, `index.html` |
| Règles détaillées | `docs/CONCEPT.md` (à lire seulement si besoin) |
| Jeu 1 | `docs/ANALYSE-TOUPIE-1.md` (à lire seulement si besoin) |

## Outils
- `node tests/equilibre.mjs` : équilibrage des pièces, terrains et boîtes (rapide).
- `tests/lancer-strategies.sh 5 2` : 5 parties par stratégie jouées par un robot, avec synthèse (environ 45 min, en arrière-plan).
- Dans la console du jeu : `__tc2.demarrerTest(3)` lance directement un duel, `__tc2.demarrerTest(0)` un lancer contre les cafards,
  `__tc2.acceleration = 4` accélère le jeu.
- Publication : `git push origin main` **puis** `git push origin main:gh-pages`. Le jeu est sur https://louisdeeguerry-dev.github.io/toupie-cafard-2/

## Dernières mesures
- **Duels** : environ 13 contacts et 13 s ; à toupies identiques, 7 victoires sur 12 (équitable).
- **Cafards** : environ 3,6 écrasés par lancer (robot qui vise bien).
- **Équilibrage par stratégie** (25/11, 5 parties chacune, bots réalistes, plateau rond, boutique à offres) :

  | Stratégie | Places | Place moyenne | Top 4 | Cafards par lancer, étapes 1 / 2 / 3 / 4+ | Duels gagnés |
  |---|---|---|---|---|---|
  | Sacrifice (économie + duels perdus exprès) | 4, 5, 5, 6, 6 | 5,2 | 1/5 | 4,5 / 3,9 / 3,2 / 3,3 | 7/13 |
  | Économie d'abord | 4, 4, 4, 4, 7 | 4,6 | 4/5 | 4,1 / 2,6 / 3,1 / 3,3 | 8/14 |
  | Mixte | 2, 4, 4, 4, 5 | 3,8 | 4/5 | 4,3 / 4,0 / 3,9 / 4,3 | 14/18 |
  | Puissance | 3, 3, 3, 5, 6 | 4,0 | 3/5 | 4,8 / 4,0 / 3,9 / 3,8 | 13/17 |

  → **Le sacrifice est maintenant clairement puni**, et le mixte comme la puissance font mieux. Les bots sont plus coriaces
  (aucune 1re place pour le robot). Les cafards restent tuables à toutes les étapes (environ 4 par lancer).

## Prochaines étapes possibles
- Faire jouer Louis à l'atelier refait, puis affiner la vitesse et les zooms.
- Relire l'équilibrage avec les résultats ci-dessus (sacrifice, économie, mixte, puissance).
- Questions ouvertes :
  - le lien avec le jeu 1 ;
  - le vrai multijoueur, en temps réel ou en asynchrone ;
  - les montants de la progression ;
  - les saisons de rang.
