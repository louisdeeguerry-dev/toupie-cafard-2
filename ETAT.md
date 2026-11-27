# État du projet — Toupie Cafard 2

> À lire au début de chaque session, **à la place** des longs documents. À mettre à jour à la fin de chaque session.
> Dernière mise à jour : 2026-11-27.

## Le jeu en bref
- **Jeu de toupies en ligne façon auto-battler** (TFT) avec un côté **gacha / deck-building** (SPAM). Partie à **8 joueurs**
  (bots pour l'instant), **5 vies**, **plateau rond**.
- **Étape** = **3 lancers contre les cafards** (le bureau est rempli à 10 + Nid avant chaque lancer, les survivants restent),
  puis **1 duel**. La boutique est ouverte entre chaque manche. Un duel perdu coûte 1 vie (5 vies = 5 défaites possibles) ;
  un duel ne rapporte ni ne coûte d'argent.
- **Duels : lancers simultanés.** Chaque lancer (angle, puissance) est gardé en mémoire, et les deux toupies partent ensemble quand les deux ont lancé. On a 7 s pour lancer en duel (contre les bots comme contre un ami).
- **Temps limités** (jeu dynamique, en vue du jeu en ligne) : 15 s pour lancer contre les cafards, accélération jusqu'à ×5 si une toupie tourne encore 10 s après le lancer, 25 s de boutique ; réglages dans `PARTIE` (`src/config.js`).
- **Duel** : il n'y a pas de vie ; chaque choc fait perdre de la rotation, et **la première toupie arrêtée perd**.
  L'usure ne démarre qu'une fois les deux toupies lancées.
- **🤝 Défier un ami** (temps réel, `src/enligne.js` et la fin de `src/match.js`) :
  - code à 5 lettres ou lien `?ami=CODE` ;
  - par défaut, relais MQTT public (EMQX, puis HiveMQ, puis Mosquitto) : ça passe en 4G/5G et en Wi-Fi ; `?p2p` pour la connexion directe (PeerJS) ;
  - l'hôte calcule la physique, l'invité envoie son lancer et voit tout en miroir ;
  - 3 vies chacun, 1 vie par duel perdu ;
  - test local : `?local` (deux onglets).
- **Paramètres** (menu ⚙️) : qualité d'image, ombres, halo, secousses, plein écran, volumes ; `src/parametres.js`.
- **Améliorations sans plafond** (sauf Multi-lancer) ; une offre rare coûte plus cher, mais pas au prorata (rare ×1,25, épique ×1,5, légendaire ×2). Pondeuse et Éclairs en chaîne supprimés.
- **Cafards** : ils **évoluent après chaque duel** (vie plus haute, nouvelles espèces contrées par des stats précises).
- **Toupie choisie avant la partie, verrouillée pendant** : 4 pièces (base, couronne, pointe, âme) et 2 pièces de lanceur
  (engrenage, ressort).
  - **56 pièces** (l'âme d'orage a été retirée et le Fer à cheval ajouté), chacune avec autant de bonus que de malus (vérifié par un test).
  - Les doublons débloquent des niveaux de pièce, qui amplifient bonus ET malus.
- **Stats** : celles du jeu 1 (toupie, lanceur) et le bureau (Nid, Prime, Trèfle, Combo, Tirelire).
- **Boutique** :
  - 6 offres au hasard, achetées par paquets de +3 niveaux ;
  - 4 offres au hasard, avec une rareté (commune, rare ×1,5, épique ×2, légendaire ×3, même prix) que la stat Chance 🎲 améliore ; un achat relance les offres ;
  - relance de plus en plus chère (1, 2, 3, 5, 8… 💰) ;
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
  - lanceur 3D mécanique : l'engrenage choisi (vraie roue dentée) entraîne un pignon central monté sur le pied ; manche rond à voyants entouré du ressort ; plus de poignée en T ni de plot gradué au sol ; changer de pièce ou de terrain ne rejoue pas le démontage ; **règle 5 de CLAUDE.md : toujours une logique mécanique** ;
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

- **Retours** : verdict de duel plein écran, pièces qui volent vers le compteur, sons procéduraux (ressort, PARFAIT, métal, tic-tac, jingles) dans `sfx` (`src/audio.js`), halo au sol des toupies.
- **Rendu** : reflets « studio » sur tous les matériaux, halo lumineux (bloom, `vendor/jsm`) et vignettage ; réglages dans `src/scene.js` (`studio()`, `rendre()`).

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
- Menu → **🧪 Mode test** : toutes les pièces au niv 5 et tous les terrains ; la vraie sauvegarde est mise de côté et revient avec « Quitter le mode test ».
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

- **26/11, boutique à 4 offres avec raretés et Chance** (3 parties par stratégie, échantillon faible) : places moyennes
  sacrifice 5,3, économie 5,7, mixte 5,7, puissance 4,0 ; aucune erreur. Le robot fait moins bien qu'avant : les bots
  achètent encore librement (hors des 4 offres), à corriger.
- **26/11, bots soumis aux mêmes 4 offres** (5 parties par stratégie, robot ×100) : sacrifice 5,8, économie 4,6, mixte 4,6,
  puissance 4,2. Les trois stratégies actives sont à égalité et le sacrifice est puni. Le robot ne dépasse jamais la 3e place.
  Pistes à décider : coût d'un duel perdu plafonné, intérêts par tranche de 10, relances moins chères, cafards en fin de partie.
- **26/11, duel perdu au plus 3 vies et relances 1, 2, 3, 5, 8…** (5 parties par stratégie) : sacrifice 5,6, économie 6,0, mixte 4,2
  (top 4 : 4/5), puissance 4,2. Les parties sont plus longues. L'économie pure est en retrait (2 duels gagnés sur 11) : à surveiller.
- **26/11, duel perdu = 1 vie** (10 parties en économie, robot qui relance) : 5,8 de moyenne, 1 top 4 sur 10, 34 % de duels gagnés,
  environ 27 manches par partie. L'économie pure reste faible ; il faut comparer avec mixte et puissance sous la même règle.
  Comparaison faite : mixte 6,6 et puissance 5,2. Tout le monde recule, car les cafards deviennent trop résistants
  quand la partie atteint 7 étapes (environ 2 tués par lancer).
- **26/11, cafards à +6 %/étape après l'étape 3 et bots plafonnés** : sacrifice 6,8, économie 5,2, mixte 5,8, puissance 6,0.
  Les bots écrasent encore plus de cafards que le robot (4 à 6 contre 2 à 4,6 par lancer) : plafond à caler sur environ 3,5.
- **26/11, bots calés sur environ 3,5 cafards par lancer** : sacrifice 6,6, économie 4,8, mixte 5,8, puissance 4,8 ; parties de 22 à 33 manches.
  Économie et puissance sont à égalité, le sacrifice est puni ; le robot plafonne vers la 4e place (sa visée reste simple).
- **27/11, nouvelle économie** (sans pondeuse ni plafonds, rareté plus chère) : sacrifice 6,2, économie 5,6, mixte 5,4, puissance 6,0.
  Les stratégies sont groupées (écart de 0,8), l'argent ne s'emballe plus (10 à 18 💰 au maximum) ; le robot reste un peu sous les bots.

## Prochaines étapes possibles
- **Plan des agents critiques (27/11) : les 7 points sont faits** (fin de duel, téléphone, gains, sons, toupie lisible, cafards, atelier).
  Suite possible : vrais échantillons de chocs de métal (Kenney Impact, CC0) ; musique différente en partie ; décor autour du plateau.
- Faire jouer Louis à l'atelier refait, puis affiner la vitesse et les zooms.
- Relire l'équilibrage avec les résultats ci-dessus (sacrifice, économie, mixte, puissance).
- Questions ouvertes :
  - le lien avec le jeu 1 ;
  - le vrai multijoueur, en temps réel ou en asynchrone ;
  - les montants de la progression ;
  - les saisons de rang.
