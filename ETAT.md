# État du projet — Toupie Cafard 2

> À lire au début de chaque session, **à la place** des longs documents. À mettre à jour à la fin de chaque session.
> Dernière mise à jour : 2026-11-28.

## Le jeu en bref
- **Jeu de toupies en ligne façon auto-battler** (TFT) avec un côté **gacha / deck-building** (SPAM). Partie à **8 joueurs**
  (bots pour l'instant), **5 vies**, **plateau rond**.
- **Étape** = **3 lancers contre les cafards** (le bureau est rempli à 10 + Nid avant chaque lancer, les survivants restent),
  puis **1 duel**. La boutique est ouverte entre chaque manche. Un duel perdu coûte 1 vie, puis **2 vies à partir de l'étape 6** (décision du 27/11, pour raccourcir les parties ; `degatsDuel` dans `src/config.js`) ;
  un duel ne rapporte ni ne coûte d'argent.
- **Duels : lancers simultanés.** Chaque lancer (angle, puissance) est gardé en mémoire, et les deux toupies partent ensemble quand les deux ont lancé. On a 7 s pour lancer en duel (contre les bots comme contre un ami).
- **Temps limités** (jeu dynamique, en vue du jeu en ligne) : 15 s pour lancer contre les cafards, accélération jusqu'à ×5 si une toupie tourne encore 10 s après le lancer, 25 s de boutique ; réglages dans `PARTIE` (`src/config.js`).
- **Duel** : il n'y a pas de vie ; chaque choc fait perdre de la rotation, et **la première toupie arrêtée perd**.
  L'usure ne démarre qu'une fois les deux toupies lancées.
- **📦 Boutique 3D** (`src/magasin3d.js`) : la caméra va à un comptoir ; petit paquet (1 pièce, 100 🔩) et gros carton (5 pièces, 450 🔩) à cliquer ; les boîtes s'ouvrent **en 3D** (`src/ouverture3d.js`) : vue plongeante sur une table, jusqu'à 5 boîtes ensemble, 4 clics, la vraie pièce 3D sort et brille, puis récapitulatif.
- **🎯 Entraînement** (menu) : mannequin immobile à vie infinie ; dégâts de chaque coup, meilleur coup et meilleur lancer ; sans chrono ni boutique.
- **🤝 Défier un ami** (temps réel, `src/enligne.js` et la fin de `src/match.js`) :
  - code à 5 lettres ou lien `?ami=CODE` ;
  - par défaut, relais MQTT public (EMQX, puis HiveMQ, puis Mosquitto) : ça passe en 4G/5G et en Wi-Fi ; `?p2p` pour la connexion directe (PeerJS) ;
  - l'hôte calcule la physique, l'invité envoie son lancer et voit tout en miroir ;
  - vraie partie à 2 : chacun ses cafards et sa boutique, on s'attend avant chaque duel ; 5 vies, 1 vie par duel perdu ;
  - test local : `?local` (deux onglets).
- **Quitter** : bouton 🏳️ Abandonner (partie), 🚪 Quitter (entraînement, sans confirmation) ou 🚪 Quitter le défi, en bas à gauche, toujours visible (même sur la boutique) ; Échap l'ouvre aussi.
- **Bannir** : 🚫 sur une offre de la boutique (2 clics) : la stat ne sort plus de la partie ; 1 bannissement par partie (`BANNISSEMENTS_MAX`, `src/match.js`).
- **Duels (refonte 27/11, calée au simulateur)** : seule l'Agressivité attire vers l'adversaire (plafond `CHOC.attraction` 0,4) ; sans elle, la toupie part tout droit. L'arène de duel est légèrement creusée (`CHOC.cuvette`, cercles légers au sol) et la « danse » réduite : une toupie ralentie finit au centre, d'où des contacts. La charge compte la vitesse AVANT le rebond (bug corrigé : l'Élan ne frappait pas plus fort). Défense tassée en duel (`partRelative`, `usureTassee`, `inertieDuel`, `masseDuel`, `seuilMaxDuel` dans `CHOC`, `src/physics.js`). Un rebond élastique (stat Rebond) coûte moins de rotation.
- **Malus des pièces pondérés par impact** (`IMPACT` dans `src/data/pieces.js`) : un niveau d'Endurance, de Lames, de Poids, d'Inertie ou d'Équilibre pèse plus qu'un niveau d'Élan, de Glisse ou de Rebond ; les malus sont recalculés pour que bonus et malus pèsent autant (test `tests/equilibre.mjs`).
- **Terrain rebondissant = arène carrée** (duel et atelier ; côtés plats face aux lanceurs). Simulation de billard (2 toupies tout droit) : rond 24 % de duels sans contact, hexagone 7 %, losange 5 %, carré 2 %. Chaque bande accélère de 35 %, jusqu'à 1,9 × la vitesse de lancer (Élan) : `CHOC.rebondBoost` et `CHOC.rebondPlafond`.
- **Lancer au doigt** (téléphone) : glisser sur la bande du bas place le lanceur sans tirer ; toucher le plateau vise et charge la jauge ; lever le doigt tire (`src/launcher.js`).
- **Paramètres** (menu ⚙️) : qualité d'image, ombres, halo, secousses, plein écran, volumes ; `src/parametres.js`.
- **Aucun plafond, rendements dégressifs** : au-delà de 10 niveaux, chaque niveau compte de moins en moins (`degressif` dans `src/stats.js`). Le Nid (rare +1, épique +2, légendaire +3 cafards) et le combo (au-delà de ×2) sont dégressifs eux aussi.
- **Améliorations sans plafond** (sauf Multi-lancer) ; une offre rare coûte plus cher, mais pas au prorata (rare ×1,25, épique ×1,5, légendaire ×2). Pondeuse et Éclairs en chaîne supprimés. Âme de miel : +1 cafard par niveau de pièce (1 à 5).
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
- **Rendu** : pièces modélisées dans Blender (`assets/modeles`), matériaux vernis, reflets « studio » sur tous les matériaux, halo lumineux (bloom, `vendor/jsm`) et vignettage ; réglages dans `src/scene.js` (`studio()`, `rendre()`).

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
- `node tests/duels-sim.js 100` (serveur `python3 -m http.server 8123` d'abord) : milliers de duels sans affichage, build contre build, en quelques secondes. `CHOC='{"cuvette":1.2}'` essaie un réglage sans toucher au code ; `MARGE=1` mesure la valeur de ±2 niveaux de chaque stat.
- Builds en partie complète : `STRATS="elan elanTerrain puissance lames endurance critique agressivite combo" SCRIPT=builds.js tests/lancer-strategies.sh 4 3 dossier` (environ 40 min).
- Dans la console du jeu : `__tc2.demarrerTest(3)` lance directement un duel, `__tc2.demarrerTest(0)` un lancer contre les cafards,
  `__tc2.acceleration = 4` accélère le jeu.
- Menu → **🧪 Mode test** : toutes les pièces au niv 5 et tous les terrains ; la vraie sauvegarde est mise de côté et revient avec « Quitter le mode test ».
- Publication : `node outils/versionner.mjs` (anti-cache), puis `git push origin main` **et** `git push origin main:gh-pages`. Le numéro de version s'affiche au menu. Le jeu est sur https://louisdeeguerry-dev.github.io/toupie-cafard-2/

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

- **27/11, duels au simulateur** (après refonte) : victoires Défaut 76 %, Puissance 74 %, Agressivité 67 %, Élan 37 % (8 % sur le bureau rond, 67 % sur le terrain rebondissant), Lames 36 %, Critique 35 %, Endurance 25 % ; 4 à 8 contacts par duel. Avant : de 3 % (Élan) à 93 % (Endurance), 1 contact.
- **27/11, parties complètes par build** (4 parties chacun, place moyenne sur 8) : Puissance 3,8, Agressivité 4,8, Élan + terrain rebondissant 5,0, Lames 5,5, Critique 6,3, Endurance 6,5, Élan sans terrain 7,0, Combo 7,8. Les duels décident presque tout ; le build Combo (économie) finit dernier : la Combo n'est pas trop forte.

- **27/11, 2e passe (Élan, Puissance)** : poids d'impact mesurés (`IMPACT`), usure de duel 0,22, guidage de l'Agressivité 0,1. Duels au simulateur : Élan 44 % (79 % sur terrain rebondissant), Puissance 69 %, Lames 50 %, Critique 47 %, Agressivité 65 %, Défaut 68 %, Endurance 7 %. Parties complètes (3 par build) : Élan + terrain 3,7, Puissance 4,3, Lames 4,7, Agressivité 4,7, Critique 5,7, Élan sans terrain 6,3, Endurance 6,7, Combo 7,3.

- **27/11, 3e passe (Élan sans terrain, Endurance)** : recul contre les toupies stables (`CHOC.recul` 0,2), `parLames` 0,04, poids Élan 0,35. Simulateur : tous les builds entre 29 et 69 % (Endurance 29 %, Élan bureau rond 19 %). Parties complètes (2 par build, échantillon faible) : Élan + terrain 4,0, Puissance 4,5, Élan 5,0, Critique 5,5, Endurance 6,0, Lames 6,5, Agressivité 6,5, Combo 8,0.

- **28/11, builds spécialisés avec robot malin** (`tests/builds-malins.js` : garde sa spécialité, achète des dégâts s'il écrase moins de 3 cafards par lancer, de la survie s'il perd ses duels ; 3 parties chacun) : Lames 2,0 (19/25 duels), Agressivité 4,0, Élan 5,3, Endurance 5,7, Critique 6,0, Puissance 6,0 (0,5 cafard par lancer), Nid 6,3, Combo 6,7, Feu 7,0, Chance 7,3. Les Lames dominent (les compensations achètent aussi des Lames) ; les builds d'économie (Nid, Combo, Chance) gagnent de l'argent mais perdent leurs duels.

- **28/11, après la passe d'équilibrage** (robot malin, 2 parties par build) : Lames 4,0, Agressivité 4,5, Endurance 4,5, Élan 5,0, Critique 5,5, Nid 6,0, Puissance 6,0, Combo 7,0, Feu 7,0, Chance 7,5.

- **28/11, nouvelles règles** (doré ×2, Nid dégressif, étapes courtes dès l'étape 8, 3 vies dès l'étape 10, Multi-lancer mythique ; robot malin, 2 parties) : Lames 4,0, Agressivité 4,0, Élan 4,5, Combo 5,5, Endurance 5,5, Critique 6,0, Puissance 6,0, Feu 6,5, Chance 7,0, Nid 7,5. Aucune erreur.

## Prochaines étapes possibles
- **Menus refaits (28/11)** : bandeau `#nav` (PC en haut, onglets + profil ⭐🔩📦 + JOUER ; en dessous de 1180 px, logo masqué ; en dessous de 1060 px, icônes seules sauf l'onglet actif) ; sur téléphone, barre d'onglets en bas. Accueil PC en 2 colonnes. La toupie de la vitrine se décale (`placerVitrine` dans `src/scene.js`) : à gauche sur PC, plus haut sur téléphone. **Tutoriel obligatoire** (`src/tutoriel.js`, 10 étapes, événements `window.__tuto`) : 6 lancers et 2 duels contre des bots faciles, 3 pièces offertes à la fin, `save.tutoFait`, bouton « Refaire le tutoriel » dans Réglages. Les robots de test mettent `tutoFait = true`. Pièces de départ sans niveaux (`estDepart`). Collection (onglets, filtres, stats des pièces), boutique (boutons d'achat, cadrage) et défi (Inviter / Rejoindre) refaits aussi.
- **Équilibrage** : série de 5 parties par build en cours le 28/11 (`builds-malins.js`, dossier `scratchpad/malins7`, perdu si la session cloud est fermée) ; à relancer si besoin avec `STRATS=… SCRIPT=builds-malins.js tests/lancer-strategies.sh 5 3 <dossier>`.
- **3D (commencée le 28/11)** : Blender en module Python (`python3 -m venv env && env/bin/pip install bpy`, à refaire à chaque nouvelle session cloud). Le script `outils/blender/toupies.py` génère `assets/modeles/*.glb` ; `src/topMesh.js` les charge (`chargerModeles`, repli sur les formes simples) et leur applique les matériaux du jeu selon le rôle de chaque objet (`corps`, `acier`, `sombre`). Faits : **toutes les formes** de pointes, bases et couronnes (17 modèles) et le **boîtier du lanceur** (environ 1,1 Mo en tout) ; les dents et les lames (nombre selon le niveau), le gyroscope animé et les rivets de niveau restent calculés par le jeu ; les roues dentées du lanceur restent calculées (engrènement exact) ; ressorts à spires de bout jointives. Les **9 âmes** aussi (socle vissé + symbole qui garde la lueur de niveau ; 27 modèles, 1,7 Mo). **Rendu** : matériaux vernis (`MeshPhysicalMaterial`, clearcoat), studio avec 2 bandes de lumière pour les reflets des métaux, halo et éclairage de l'atelier adoucis. **Lanceur** : boîtier, pied et manche modélisés (roues dentées et voyants calculés par le jeu). **Cafards** : pièces de taille unité (abdomen annelé à fente d'élytres, tête à mandibules, pronotum à rebord, patte articulée épineuse) adoptées par `src/bugs.js` (`adopterModeleCafard`) ; espèces, animation et dorés conservés. **Décor** : tasse, pot à crayons, cahier, règle et écrous sur un bureau en bois (`decor-bureau`, couleurs exportées de Blender, `modeleBrut`). **Terrains** (`habiller` dans `src/scene.js`) : bandes rebondissantes à boudin + 5 ressorts, coulures de colle sur le bord collant, pente douce de la cuve (bois continu). Rôle d'un objet = SUFFIXE de son nom (bug corrigé : « c-or-ps » rendait tout doré). **Boîte mystère** : coins de métal rivetés, charnières sur l'axe du couvercle, fermoir doré (`boite-ferrures`). **Éclairage HDRI** : Poly Haven « Studio Small 09 » (CC0, `assets/hdri`, 1,6 Mo) chargé en arrière-plan, repli sur le studio généré ; exposition 0,85. L'hôte `dl.polyhaven.org` est autorisé dans l'environnement cloud. 36 modèles, environ 2,5 Mo.
- **Décidé le 27/11** : 2 vies par duel perdu dès l'étape 6 (fait) ; la Combo est gardée.
- **À reprendre** : Chance, Feu et Combo restent derniers (0 à 1 duel gagné sur 8-9) : ce sont des stats sans effet en duel ; piste : leur donner un petit effet de duel, ou rendre les duels des étapes 1-2 moins décisifs. Puissance : 0,9 cafard par lancer. Piste écartée : frottement de glissement (`CHOC.glissementDuel`), il fige les toupies lentes.
- Retours des agents non traités : liste des pièces qui cache les emplacements dans l'atelier (choix de Louis), argent qui s'emballe en fin de longue partie, barres de stats vides sans explication, texte du terrain trop long, boîte coupée à gauche à l'ouverture (à vérifier).
- **À mesurer** : durée et nombre de contacts des duels depuis la fin de l'attraction forcée (bureau rond neutre surtout) ; si trop peu de contacts, passer aussi le bureau neutre en hexagone.
- **Plan des agents critiques (27/11) : les 7 points sont faits** (fin de duel, téléphone, gains, sons, toupie lisible, cafards, atelier).
  Suite possible : vrais échantillons de chocs de métal (Kenney Impact, CC0) ; musique différente en partie ; décor autour du plateau.
- Faire jouer Louis à l'atelier refait, puis affiner la vitesse et les zooms.
- Relire l'équilibrage avec les résultats ci-dessus (sacrifice, économie, mixte, puissance).
- Questions ouvertes :
  - le lien avec le jeu 1 ;
  - le vrai multijoueur, en temps réel ou en asynchrone ;
  - les montants de la progression ;
  - les saisons de rang.
