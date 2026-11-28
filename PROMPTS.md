# Journal des prompts optimisés

Chaque échange sur le projet est consigné ici : prompt optimisé + ce qui a été réalisé.

---

## 2026-11-24 — Création du projet et des règles

**Prompt optimisé**
> Rôle : assistant de pilotage de projet de jeu vidéo.
> Objectif : initialiser un nouveau projet et y inscrire des règles permanentes.
> 1. Règle permanente : à chaque échange sur ce projet, reformuler ma demande en prompt
>    optimisé (affiché + archivé dans un journal), puis traiter la demande.
> 2. Règle permanente : s'appuyer sur des dépôts GitHub et des assets externes pour le
>    développement de jeux vidéo, la modélisation 3D et la communication ; en rechercher
>    de nouveaux pertinents et les cataloguer.
> 3. Conserver tous mes dépôts GitHub existants et leur contenu, sans rien supprimer.
> Livrables : fichier de règles lu automatiquement (`CLAUDE.md`), journal des prompts,
> catalogue de ressources vérifiées et classées.
> Critère de réussite : les règles s'appliquent automatiquement aux prochaines sessions.

**Réalisé**
- Création de `CLAUDE.md` (règles), `PROMPTS.md` (ce journal), `RESSOURCES.md` (catalogue).
- Analyse des dépôts existants (Toupie contre Cafards, Voxel Sword…) pour adapter les ressources
  à la stack Three.js / Capacitor / Electron-Steam.
- ~85 dépôts GitHub vérifiés (existence contrôlée le 2026-11-24) + sites d'assets.

---

## 2026-11-24 — Nom du projet et création du dépôt GitHub

**Prompt optimisé**
> Rôle : assistant de pilotage de projet.
> Objectif : nommer le projet « Toupie Cafard 2 » (suite de « Toupie contre Cafards ») et créer
> moi-même son dépôt GitHub, sans intervention de l'utilisateur, puis y pousser le projet.
> Livrables : projet renommé (README, règles), dépôt GitHub `toupie-cafard-2` contenant tout le projet.
> Critère de réussite : le projet est sauvegardé sur GitHub et les règles se rechargent aux prochaines sessions.

**Réalisé**
- Projet renommé « Toupie Cafard 2 » dans `README.md` et `CLAUDE.md` (lien vers le jeu d'origine).
- Création automatique du dépôt impossible : la session cloud n'a pas le droit de créer un
  dépôt GitHub (accès limité aux dépôts déjà rattachés). L'utilisateur doit créer le dépôt vide,
  Claude le rattache ensuite et pousse le projet.

---

## 2026-11-24 — Vérification du formulaire GitHub dans Chrome

**Prompt optimisé**
> Rôle : assistant avec accès au navigateur Chrome de l'utilisateur.
> Objectif : contrôler dans Chrome le formulaire de création du dépôt `toupie-cafard-2`
> (propriétaire, nom, visibilité, dépôt vide) puis cliquer sur « Create repository » si tout est correct.
> Critère de réussite : dépôt vide créé avec les bons réglages, prêt à recevoir le projet.

**Réalisé**
- Impossible : aucune extension Claude in Chrome ni ordinateur de l'utilisateur relié à cette session cloud.
- Vérifié que `louisdeeguerry-dev/toupie-cafard-2` n'existe pas encore.
- Checklist de vérification fournie à l'utilisateur pour valider lui-même.

---

## 2026-11-24 — Reconnexion et autonomie

**Prompt optimisé**
> Rôle : assistant autonome de pilotage de projet.
> Objectif : utiliser la connexion rétablie pour finaliser seul la mise en ligne du projet
> (vérifier/créer le dépôt `toupie-cafard-2`, y pousser le projet) sans redemander de validation.
> Critère de réussite : le projet est sauvegardé sur GitHub.

**Réalisé**
- Contrôles : dépôt `toupie-cafard-2` introuvable (ni `louisdeeguerry-dev`, ni `toupie-cafards`),
  extension Chrome et ordinateur toujours non reliés à cette session cloud.
- Tentative de sauvegarde sur une branche séparée de `louisdeeguerry-dev/toupie-cafards` :
  refusée par les permissions de la session (rien n'a été modifié sur GitHub).
- Sauvegarde de secours fournie en téléchargement : archive `toupie-cafard-2.zip`.

---

## 2026-11-24 — Dépôt créé : envoi du projet

**Prompt optimisé**
> Rôle : assistant de pilotage de projet.
> Objectif : le dépôt GitHub `toupie-cafard-2` vient d'être créé par l'utilisateur ; le rattacher
> à la session et y pousser tout l'historique du projet.
> Critère de réussite : la branche `main` est en ligne et identique au projet local.

**Réalisé**
- Dépôt `louisdeeguerry-dev/toupie-cafard-2` (public) rattaché et vide au départ.
- Historique complet poussé sur `main`.

---

## 2026-11-24 — Contrôle des ressources et de la règle du prompt optimisé

**Prompt optimisé**
> Rôle : assistant de pilotage de projet, en mode vérification.
> Objectif : avant d'attaquer le concept du jeu, confirmer avec précision :
> 1. que tous mes dépôts et assets existants ont bien été récupérés / pris en compte ;
> 2. que de nouveaux dépôts et assets liés à la création de jeux, à la 3D et à la communication
>    ont bien été recherchés et ajoutés ;
> 3. que la règle « reformuler chaque échange en prompt optimisé » est bien active.
> Livrable : un état des lieux honnête (fait / pas fait) et la correction des manques.

**Réalisé**
- Constat : les dépôts existants étaient listés, mais leurs assets n'étaient pas inventoriés.
- Ajout dans `RESSOURCES.md` de l'inventaire détaillé des assets de Toupie contre Cafards et Voxel Sword
  (sons Kenney CC0, mains glb MIT, icônes, kit presse, outils capsules Steam / vidéo, scripts de build).
- 2 nouveaux dépôts vérifiés ajoutés : webxr-input-profiles, simplex-noise.js.
- Limite : dépôt privé `github-dashboard` et étoiles GitHub de l'utilisateur non lisibles depuis la session.

---

## 2026-11-24 — Accès au dépôt privé github-dashboard

**Prompt optimisé**
> Rôle : assistant de pilotage de projet.
> Objectif : m'expliquer comment redonner à Claude l'accès au dépôt privé
> `louisdeeguerry-dev/github-dashboard`, et l'intégrer au catalogue une fois accessible.
> Critère de réussite : contenu du dépôt lu et décrit dans `RESSOURCES.md`, sans le modifier.

**Réalisé**
- Accès obtenu directement (rattachement en lecture à la session) : aucune action requise de l'utilisateur.
- Dépôt lu (dernier commit `2127b1a`) et décrit dans `RESSOURCES.md`. Dépôt non modifié.

---

## 2026-11-24 — Rattachement automatique et analyse du jeu 1

**Prompt optimisé**
> Rôle : directeur technique / game designer qui prépare une suite.
> Contexte : Toupie Cafard 2 sera nettement plus complexe que Toupie contre Cafards, mais lié à lui.
> Objectifs :
> 1. Rendre automatique, à chaque session, l'accès à tous mes dépôts (dont `github-dashboard`) et à leurs
>    assets, pour travailler vite avec le maximum d'informations.
> 2. Étudier en profondeur le jeu 1 : son code, ses systèmes, son historique, comment on a progressé.
> Livrables : mécanisme de récupération automatique testé ; document d'analyse du jeu 1 (systèmes,
> chronologie, architecture, réutilisable, à faire autrement).
> Contrainte : ne rien modifier dans les dépôts existants ; ne pas inventer le concept du jeu 2.

**Réalisé**
- Hook de démarrage `.claude/hooks/recuperer-depots.sh` + `.claude/settings.json` : clone/mise à jour des
  4 dépôts liés à chaque session (testé : 4/4 récupérés). Règle 0 ajoutée dans `CLAUDE.md`
  (rattachement `add_repo` automatique si un dépôt privé manque).
- `docs/ANALYSE-TOUPIE-1.md` : jeu, chiffres clés, chronologie des 128 commits, architecture, carte du
  code, éléments réutilisables et pistes pour le jeu 2.
- `RESSOURCES.md` : ajout de vitejs/vite (vérifié).

---

## 2026-11-24 — Concept du jeu et premier prototype

**Prompt optimisé**
> Rôle : game designer + développeur gameplay Three.js.
> Contexte : Toupie Cafard 2, suite de Toupie contre Cafards, même univers (bureau, cafards, toupie, lanceur).
> Concept décrit par l'utilisateur :
> - Jeu en joueur contre joueur façon Teamfight Tactics (auto-battler), avec un côté deck-builder
>   (référence citée : « Spam, le jeu de cartes », à identifier : Slay the Spire ? Marvel Snap ?).
> - Partie courte, 5 vies. Cycle : 3 vagues contre les cafards, puis 1 manche contre un joueur, et on recommence.
> - Avant la partie, on fabrique sa toupie à partir de 4 pièces : base (centre), couronne (le tour, qui fait
>   les dégâts), pointe (qui touche le plateau), âme (signe sur le dessus, qui donne un passif).
>   Chaque pièce a des avantages et des inconvénients (ex. pointe clou : vitesse ↑↑ / équilibre ↓↓ ;
>   pointe foreuse : stabilité ↑↑ / vitesse et endurance ↓).
> - Au départ : toupie basique + une boîte mystère offerte (style carton de jouet de supermarché) contenant une pièce.
> - Matchmaking complété par des bots pendant toute la phase de test.
> - En partie : choisir entre investir dans le bureau et les cafards (capitaliser de l'argent) ou dans la
>   toupie (être assez fort pour tuer les cafards).
> - Lanceur : suit la souris le long du bord bas du bureau ; clic = lanceur figé ; tant qu'on reste appuyé,
>   on oriente la direction ; relâcher = lancer.
> Livrables : document de concept (règles, propositions marquées, questions ouvertes) ; prototype jouable de
> cette boucle, testé sur ordinateur et téléphone.
> Contraintes : réutiliser ce qui existe (Three.js, sons Kenney du jeu 1) ; code découpé en modules ;
> données d'équilibrage séparées du moteur ; ne pas copier de jeu existant (noms et visuels originaux).

**Réalisé**
- Prototype jouable (`index.html` + `src/`, 14 modules) : atelier à 4 emplacements (21 pièces), boîte mystère,
  matchmaking simulé (8 joueurs), cycle 3 vagues + 1 duel, 5 vies, dégâts croissants par étape, boutique
  bureau/toupie avec intérêts, lanceur souris/doigt avec jauge PARFAIT, duels physiques contre des bots,
  classement final et boîtes gagnées.
- Tests automatiques (Playwright) : parcours complet, partie entière jouée par un robot jusqu'à la fin,
  21 pièces construites sans erreur, tirage des raretés conforme, affichage téléphone. 0 erreur JavaScript.
- `docs/CONCEPT.md` (game design v0.1 + 8 questions ouvertes), `LICENCES-TIERS.md`, README.

---

## 2026-11-24 — Stats du jeu 1, toupie verrouillée, progression et modes de partie

**Prompt optimisé**
> Rôle : game designer + développeur gameplay.
> Contexte : la référence « Spam » est **SPAM** (Ticroco Entreprise, Steam, 7 oct. 2026), un deck-builder
> en 1 contre 1 au tour par tour. On ne garde de SPAM que le côté **gacha** (ouvertures aléatoires) et le **deck-building**.
> Décisions de l'utilisateur :
> 1. Reprendre **toutes les stats de toupie de Toupie contre Cafards** dans Toupie Cafard 2, et les **afficher toutes**.
> 2. **Interdiction de changer de pièce pendant une partie** : la toupie est choisie avant et verrouillée jusqu'à la fin.
> 3. Fin de partie : gagner de la **monnaie**, de l'**expérience** et un **rang** selon sa place ; il y aura des
>    **parties normales** et des **parties classées**.
> 4. Les propositions du prototype v0.1 sont validées.
> Livrables : système de stats du jeu 1 (mêmes noms et formules, valeurs réelles affichées partout) ; pièces
> réexprimées dans ces stats ; pouvoirs du jeu 1 fonctionnels ; progression hors partie (monnaie, XP, niveaux,
> rangs, modes) ; concept mis à jour ; tests.

**Réalisé**
- `src/stats.js` : les 18 stats de toupie et de lanceur du jeu 1 (Endurance, Diamètre, Poids, Glisse, Lames, Inertie, Équilibre,
  Rebond, Agressivité, Coup critique, Traînée de feu, Second souffle, Éclairs en chaîne, Tourbillon, Puissance,
  Élan, Précision, Multi-lancer), avec les formules et les unités du jeu 1.
- Pièces (25) réexprimées en niveaux de stats ; les âmes donnent les pouvoirs du jeu 1 (3 nouvelles : Orage, Cyclone, Œil de lynx).
- Physique : critique, feu, souffle, éclairs, tourbillon, agressivité, multi-lancer, trampolines ; bureau : Nid, Prime,
  Trèfle doré, Combo, Appât, Tirelire.
- Affichage de toutes les stats : panneau de l'atelier (avec aperçu), bouton 📊 en partie, boutique avant → après.
- `src/progression.js` : parties normales et classées, Écrous 🔩, XP et niveaux (1 boîte par niveau), 8 rangs, achat de boîtes.
- Toupie verrouillée en partie (gelée au lancement de la partie, aucun changement de pièce possible).
- Tests : partie complète par le robot sans erreur, 25 pièces construites, tirages conformes, téléphone OK.

---

## 2026-11-24 — Niveaux de pièces, lanceur personnalisable, terrains de duel

**Prompt optimisé**
> Rôle : game designer (équilibrage) + développeur gameplay.
> Objectifs, tous réglés **à l'atelier, avant la partie** (puis verrouillés) :
> 1. **Doublons = niveaux de pièce** : avec 2 pointes clou, on peut jouer la pointe clou niveau 1 ou 2. Le niveau
>    supérieur amplifie TOUT (plus de vitesse ET encore moins d'équilibre) : plus extrême, pas forcément meilleur.
> 2. **Lanceur personnalisable** : engrenage (vitesse de rotation) et ressort (élan), interchangeables.
>    Un ressort plus fort prend plus de place et enlève de la rotation, et inversement.
> 3. **Terrains de duel** (bureau neutre contre les cafards), si débloqués : bords rebondissants, bords collants,
>    cuve / arène. Choisir un terrain coûte l'argent de départ (ex. 50 $ sans terrain, 0 avec, à équilibrer).
>    Si les deux joueurs ont un terrain : **priorité de terrain**, achetable en partie après 3 manches ;
>    le plus de points impose son terrain ; points **cachés** à l'adversaire, mais règle **expliquée**.
> Contrainte permanente : **tout doit toujours être équilibré** et permettre de construire un « deck ».

**Réalisé**
- Catalogue rééquilibré (34 pièces) : chaque pièce a une somme de niveaux nulle (test automatique `tests/equilibre.mjs`).
- Formules de stats rendues symétriques (un malus ne pèse pas plus que le bonus équivalent) — corrigé après un test
  qui montrait une pointe clou niv 2 tombant en 1,5 s.
- Niveaux de pièce 1 à 5 selon le nombre d'exemplaires (×1,5 par niveau sur bonus ET malus), choix à l'atelier.
- Lanceur : emplacements Engrenage (5 pièces) et Ressort (4 pièces), dont l'engrenage double (2 toupies).
- Terrains : rebondissant, collant, cuve (physique + décor), débloqués aux niveaux 2/3/4 ; argent de départ 8 💰 sans
  terrain / 0 💰 avec ; priorité de terrain secrète (boutique, dès la manche 3) ; bots avec terrains et priorités.
- Alerte à l'atelier si une combinaison rend la toupie trop instable (< 4 s de rotation).
- Tests navigateur : parties complètes (dont classée avec terrain Cuve et engrenage double), 34 pièces, téléphone : 0 erreur.

---

## 2026-11-24 — Égalité de priorité et terrains dans les boîtes mystère

**Prompt optimisé**
> Rôle : game designer + développeur gameplay.
> Décisions :
> 1. En duel, si les deux joueurs ont la même priorité de terrain : **bureau neutre** (plus de tirage au sort).
> 2. Les terrains ne se débloquent plus par le niveau de joueur : ils se trouvent dans les **boîtes mystère**,
>    comme récompenses **rares à légendaires**, et **sans doublon** (pas de niveaux de terrain).
> Livrables : règle de priorité modifiée et testée ; tirage des boîtes incluant les terrains non possédés ;
> atelier (terrains verrouillés « à trouver »), révélation d'un terrain dans la boîte ; documents à jour.

**Réalisé**
- `terrainDuel` : égalité → bureau neutre ; même terrain des deux côtés → pas de conflit. Bandeau de duel adapté.
- Terrains : Bords rebondissants (rare), Bords collants (épique), Cuve (légendaire) ; tirés dans les boîtes avec les
  pièces de même rareté, jamais en double (≈ 2,4 %, 1,2 % et 0,6 % par boîte avant de les avoir).
- Sauvegarde : liste des terrains possédés ; un terrain non possédé ne peut pas être choisi.
- Tests : `tests/equilibre.mjs` (égalité neutre, terrains sans doublon), atelier et partie complète dans le navigateur : 0 erreur.

---

## 2026-11-24 — Garantie toutes les 30 boîtes, lots légendaires variés, terrains à chance égale

**Prompt optimisé**
> Rôle : game designer (économie du gacha) + développeur.
> Objectifs :
> 1. Ajouter une **garantie** : un lot légendaire assuré toutes les 30 boîtes.
> 2. Les lots légendaires ne doivent **pas être uniquement des terrains** : prévoir d'autres récompenses légendaires.
> 3. **Tous les terrains ont la même chance** de sortir (plus de terrain rare / épique / légendaire).
> Contraintes : terrains toujours sans doublon ; nouvelles pièces équilibrées (somme des niveaux nulle).

**Réalisé**
- Terrains : tous légendaires, chance égale entre eux (vérifiée par test), jamais en double.
- Lot légendaire : 50 % terrain (s'il en reste), sinon pièce légendaire ou **Coffre d'écrous** (+300 🔩).
- 2 nouvelles pièces légendaires équilibrées : **Pointe diamant** et **Ressort à double détente** (36 pièces au total).
- **Garantie** : la 30e boîte d'affilée sans légendaire est légendaire ; compteur sauvegardé et affiché à l'atelier.
- Tests : équilibrage, égalité des terrains, garantie toujours légendaire avec des lots variés ; 6 boîtes garanties
  ouvertes dans le navigateur (pièces, terrains, doublon) ; 0 erreur. Médiane : 1er terrain en ~30 boîtes, les 3 en ~110.

---

## 2026-11-24 — Grand équilibrage : pièces pour toutes les stats et évolution des cafards

**Prompt optimisé**
> Rôle : game designer (équilibrage, économie) + développeur gameplay.
> Objectifs :
> 1. **Beaucoup plus de pièces**, dont des pièces d'**économie** (moins de stats de combat, mais plus d'argent par
>    cafard tué). **Toutes les stats exploitables** (coups critiques, etc.), mais **toujours équilibré**.
> 2. **Équilibrage des cafards** : **10 cafards** au début. Entre les manches, on améliore le bureau (cafards),
>    le lanceur ou la toupie. **Après chaque combat contre un joueur, les cafards évoluent** et deviennent de plus en plus
>    durs, pour empêcher la stratégie « farmer l'argent au début, sacrifier ses premières vies, puis tout améliorer ».
>    Les choix doivent être difficiles et stratégiques.
> Livrables : catalogue étendu et testé ; économie intégrée aux pièces ; espèces de cafards et évolution par étape ;
> simulation de stratégies pour vérifier que l'abus ne marche pas.

**Réalisé**
- Le bureau (Nid, Prime, Trèfle doré, Combo, Appât, Bords trampolines, Tirelire) devient un groupe de stats : les pièces
  peuvent en donner ou en retirer ; affiché à l'atelier, en partie et dans la boutique.
- 20 nouvelles pièces (56 au total), dont des pièces d'économie ; test : chaque stat est le bonus d'au moins une pièce.
- Cafards : 10 au départ ; 6 espèces (gros, blindé, coureur qui fuit, araignée et ses toiles, pondeuse et ses larves),
  chacune contrée par des stats ; évolution à chaque étape (vie, nouvelles espèces), primes croissantes ;
  aperçu de la prochaine vague et annonce de l'évolution dans la boutique.
- Robot de simulation (visée « bon joueur ») comparant 3 stratégies d'achat : « tout économie » s'effondre après
  l'évolution (7e), « puissance » gagne. Difficulté recalibrée en 3 passes d'après ces mesures.
- 2e passe d'équilibrage (mesurée) : la stratégie économie accumulait 500 💰 et gagnait → multiplicateurs d'argent
  réduits (Prime, Trèfle, Combo, primes d'évolution), prix en n², bots qui achètent 1 + étape/2 niveaux de combat par manche.
  Résultat : « sacrifice » (économie + duels perdus exprès) 7e, mixte 4e, puissance 3e. Outil : `tests/strategies.js`.

---

## 2026-11-25 — Confirmer l'équilibrage sur plusieurs parties, publier le jeu et envoyer le lien par mail

**Prompt optimisé**
> Rôle : testeur d'équilibrage + responsable de publication.
> Objectifs :
> 1. Jouer **plusieurs parties par stratégie** d'achat (sacrifice, économie, mixte, puissance) pour confirmer
>    l'équilibrage, et me **donner les résultats** une fois fini.
> 2. **Publier le jeu en public** (comme Toupie contre Cafards) pour que je puisse y jouer au travail.
> 3. M'**envoyer le lien par e-mail**, à moi-même (louisdeeguerry@gmail.com).

**Réalisé**
- `tests/strategies.js` produit un résultat structuré ; `tests/lancer-strategies.sh N P` joue N parties par
  stratégie en parallèle ; `tests/synthese-strategies.mjs` fait le tableau de synthèse. 20 parties lancées (5 × 4).
- Jeu publié sur GitHub Pages via la branche `gh-pages` (l'API des réglages Pages est bloquée depuis la session) :
  https://louisdeeguerry-dev.github.io/toupie-cafard-2/ — déploiement GitHub réussi.
- E-mail envoyé avec le lien et un mode d'emploi ; règle ajoutée dans `CLAUDE.md` pour garder `gh-pages` à jour.
- Résultats des 20 parties (5 par stratégie) : sacrifice 3,4 de place moyenne (top 4 : 3/5), économie 3,4 (4/5),
  mixte 2,8 (4/5), puissance 2,8 (5/5). L'abus ne gagne plus mais n'est que modérément puni ; vagues quasi impossibles
  dès l'étape 3 pour tous ; bots trop faibles en duel. Résultats envoyés par e-mail, corrections proposées.

---

## 2026-11-25 — Retours de Louis après avoir joué : bots, duels, 3 lancers, multi, cafards, agents testeurs

**Prompt optimisé**
> Rôle : game designer + développeur gameplay + responsable des tests.
> Retours de Louis après avoir essayé le jeu :
> 1. **Bots** trop simples : ils doivent simuler une vraie partie (toupies et pièces aléatoires, jeu un peu aléatoire,
>    forts ou faibles).
> 2. **Duels** : pas de « vie » pour les toupies ; elles s'entrechoquent, chaque choc ralentit l'autre (plus de dégâts =
>    plus de ralentissement) ; la première arrêtée perd. Calculer des coefficients pour **plusieurs contacts par duel**
>    et des combats satisfaisants.
> 3. Créer des **agents testeurs critiques** qui jouent et disent à quel point c'est satisfaisant.
> 4. **Multi-toupie** : bonne idée, mais **beaucoup plus cher** (trop fort).
> 5. **Évolution des cafards plus douce** (trop forts) ; éventuellement des **barres de vie**.
> 6. Correction de règle : une étape = **3 LANCERS** (pas 3 manches de 3 lancers) puis un duel ; **à chaque lancer, le
>    bureau revient au maximum du Nid** (d'où l'intérêt du Nid).
> 7. Un duel perdu **ne coûte pas** d'argent, et un duel gagné **n'en rapporte pas**.

**Réalisé**
- Étapes de 3 lancers ; bureau rempli jusqu'à 10 + Nid avant chaque lancer (survivants gardés) ; plus d'objectif.
- Duels : réglages `CHOC` (attraction, rebond amorti, perte par choc, usure ralentie) → 9 contacts / 11 s en moyenne
  (1,5 contact avant) ; barres de rotation des toupies et barres de vie des cafards.
- Bots (`src/bots.js`) : pièces au hasard avec niveaux, habileté, 4 styles d'achat, économie simulée et vrais achats.
- Multi-lancer : 35 puis 70 💰, engrenage double plus pénalisant, −20 % de rotation par toupie en plus.
- Cafards adoucis (vie par étape ×1,12, par lancer +3 %, armure et vies d'espèces réduites).
- Duel sans argent ; 3 agents testeurs critiques lancés (joueur occasionnel, joueur compétitif, game feel).
- **Retours des 3 agents testeurs** :
  - **Game feel** : duels 4/10, cafards 4/10. Les chocs ne décidaient que 2 duels sur 12 (78 % de la chute venait de
    l'usure), aucun impact visible, toupies minuscules.
  - **Joueur occasionnel** : bilan ouvert défilé, boutique trop chargée, téléphone mal cadré, duel indépendant du joueur.
  - **Joueur compétitif** : **l'ordre de lancer décidait le duel** (3 victoires sur 40 à toupies égales), Puissance
    inutile, Multi dominant, Prime inutile (arrondi), pièces d'économie pièges, bots incohérents.
  → Tout a été corrigé (voir le commit « Retours des 3 testeurs »). Mesures : duels miroirs 7/12, 12,8 contacts, 13 s,
    3,6 cafards par lancer.

---

## 2026-11-25 — Plateau rond, boutique épurée, relance croissante, paquets d'améliorations

**Prompt optimisé**
> Rôle : game designer + développeur gameplay/UI.
> Demandes :
> 1. **Plateau rond** pour tous les terrains (contre les cafards comme en duel).
> 2. **Retirer les Bords trampolines** de la boutique (c'est un choix de terrain, pas une amélioration), et **retirer l'Appât**.
> 3. Le choix aléatoire entre les manches est validé, mais la boutique est trop chargée : **épurer** → juste
>    **6 améliorations en grandes cartes** avec leurs stats, et à côté l'argent, le prix de la relance, etc.
> 4. **La relance doit devenir de plus en plus chère** (pas toujours 2 💰).
> 5. **Expliquer la Tirelire et les intérêts.**
> 6. (Message suivant) Des **améliorations plus chères mais avec plus d'impact** (le Diamètre ne se voit pas assez),
>    et **moins de clics** quand on a beaucoup d'argent.

**Réalisé**
- Plateau rond (bois, rebord, rails en arc), collisions et cafards dans un cercle ; caméra recadrée (PC et téléphone).
- Stats Bords trampolines et Appât supprimées (pièces concernées réexprimées, toujours équilibrées).
- Boutique : 6 grandes cartes, panneau latéral (argent, intérêts prévus, relance, Prêt), une ligne de contexte ;
  barre collante sur téléphone ; l'offre achetée disparaît.
- Relance : 2, 3, 5, 7, 10 💰… dans une même boutique, remise à 2 à la manche suivante.
- Achats par paquets de +3 niveaux (−15 %), Diamètre plus visible (9,2 → 11,4 cm en un achat), bots alignés.
- Explication des intérêts / Tirelire donnée à Louis et affichée dans la boutique.

---

## 2026-11-25 — Refonte de l'atelier : onglets, vue éclatée, zooms, nouveau lanceur

**Prompt optimisé**
> Rôle : développeur 3D / interface (Three.js) + sound design léger.
> Objectifs pour l'atelier (hors partie) :
> 1. **Séquencer** l'atelier en **Toupie / Lanceur / Terrain de duel** (le terrain peut servir de fond).
> 2. Quand on clique sur une pièce (ex. Pointe), la **toupie s'éclate en 3D** et la caméra **zoome sur cette pièce**,
>    tout en laissant voir toute la vue éclatée ; quand on change de pièce, on **voit le changement** ; quand on passe
>    à la Couronne, la pointe se remet et c'est la couronne qui sort. Gros zooms, très visuel, **petits bruitages** aux clics.
> 3. **Refaire le lanceur** (trop moche), en s'inspirant de celui de Toupie contre Cafards ; même logique d'éclaté :
>    changer l'**engrenage** ou le **ressort** se voit immédiatement.

**Réalisé**
- Atelier en 3 onglets (🌀 Toupie, 🚀 Lanceur, 🏟️ Terrain) ; une mini-arène ronde en fond prend la couleur du terrain choisi.
- `src/atelier3d.js` : vue éclatée animée (toutes les pièces s'écartent, la pièce choisie sort et grossit), caméra qui
  zoome sur la pièce en gardant l'éclaté visible ; la pièce changée « saute » ; re-cliquer referme la vue.
- `src/lanceurMesh.js` : nouveau lanceur inspiré du jeu 1 (plot gradué, boîtier à spirale, couronne crantée = engrenage,
  ressort hélicoïdal autour du manche, voyants, poignée en T) ; 5 engrenages et 5 formes de ressort différents.
  En partie : l'engrenage tourne et le ressort se comprime avec la jauge, les voyants s'allument.
- Bruitages aux clics (onglets, pièces, équipement, terrain) ; jauge de puissance déplacée en haut.

---

## 2026-11-25 — Question : qu'est-ce qui consomme autant de tokens ?

**Prompt optimisé**
> Rôle : assistant transparent sur son fonctionnement. Objectif : expliquer ce qui consomme le plus de tokens dans
> cette session et comment réduire la consommation.

**Réalisé** : explication (historique très long relu à chaque étape, captures d'écran, 3 agents testeurs ≈ 500 k tokens,
notifications de parties) et conseils (nouvelle session par gros chantier, moins de captures et d'agents).

---

## 2026-11-25 — Bilan des agents testeurs et réduction de la consommation

**Prompt optimisé**
> Rôle : assistant transparent. Objectifs : 1) dire concrètement ce que les 3 agents testeurs ont apporté, pour décider
> si on les garde ; 2) proposer des moyens de réduire la consommation liée à la longueur de la conversation.

**Réalisé** : bilan chiffré des apports des agents et recommandations (sessions courtes par chantier, fichier d'état
du projet, règles d'économie dans CLAUDE.md, agents ponctuels et moins chers).

---

## 2026-11-25 — Créer ETAT.md et des règles d'économie de tokens

**Prompt optimisé** : créer un fichier d'état court lu au démarrage à la place des longs documents, et ajouter dans
CLAUDE.md des règles pour réduire la consommation de tokens.
**Réalisé** : `ETAT.md` (1 page) ; CLAUDE.md : démarrage = ETAT.md seulement, règle 4 « Économiser les tokens ».

---

## 2026-11-25 — Menu principal, vue éclatée corrigée, stats en barres

**Prompt optimisé** : (1) quand on passe d'une pièce à l'autre, la précédente revient et seule la nouvelle s'éclate ;
éclatement plus mécanique ; (2) stats moins encombrantes, en barres qui se remplissent (valeur au survol) ;
(3) un menu principal Jouer / Boutique / Atelier / Collection (plus de Jouer dans l'atelier) ; (4) dans l'atelier,
cliquer sur une pièce ouvre ses choix, et seul « Retour » ramène aux autres emplacements.
**Réalisé** : sortie d'une seule pièce (mouvement à ressort, elle se dévisse, toupie arrêtée face caméra) ; barres de
stats compactes ; écrans Menu, Boutique (boîtes), Collection (pièces et terrains, manquants en « ??? ») ; liste des pièces
avec bouton Retour. Testé (3 captures, 0 erreur).

---

## 2026-11-25 — Ambiance des menus, atelier pivotable, pièces adoucies, inspection des pièces

**Prompt optimisé** : menus agréables (fond, lumières vives, musique d'ambiance) ; atelier avec zoom plus serré, pivot et
zoom libres ; pièces moins radicales au niveau 1 ; effets en unités réelles (%, g…) ; collection : une pièce cliquée grandit
au centre (pivot, zoom), fond flou, panneau d'effets avec onglets de niveau, retour par ← ou clic sur le fond ; même
panneau dans l'atelier.
**Réalisé** : décor animé (ciel, projecteurs, poussières) + musique lo-fi générée (🔊) ; contrôles glisser/molette/pincement ;
`FORCE_PIECES` 0,6 ; `effet()` en unités réelles ; `src/inspecteur.js` (collection + 🔍 dans l'atelier, bouton Équiper).
Testé : 0 erreur.

---

## 2026-11-26 — Vue éclatée dans l'axe de la toupie

**Prompt optimisé** : dans l'atelier, toutes les pièces s'éclatent en restant dans l'axe de la toupie ; l'écart est plus
grand autour de la pièce choisie ; en changeant de pièce, les autres restent éclatées mais se resserrent, et les voisines de
la nouvelle pièce s'éloignent ; la caméra zoome sur la pièce concernée.
**Réalisé** : `eclatementAxe()` (écart 1,8 cm entre voisines, 5 cm autour de la pièce choisie, animation à ressort) ; caméra
visant le vrai centre de la pièce. Testé (2 captures, 0 erreur).

---

## 2026-11-26 — Lanceur éclaté dans l'axe

**Prompt optimisé** : même principe que la toupie pour le lanceur : toutes ses pièces s'éclatent dans son axe, avec un écart
plus grand autour de la pièce choisie, et la caméra zoome dessus.
**Réalisé** : `eclatementAxeL()` le long de l'axe de lancer (plot → engrenage → corps → ressort → poignée ; 2 cm entre
voisines, 5,5 cm autour de la pièce choisie), lanceur tourné de profil pendant l'éclaté, engrenage qui reste dans l'axe.
Testé (0 erreur).

---

## 2026-11-26 — Lanceur : chaque pièce éclatée dans son propre axe

**Prompt optimisé** : éclater chaque pièce du lanceur dans son axe : le ressort le long de l'axe du lanceur, l'engrenage
selon son axe sans pivoter ; surélever le lanceur pour mieux voir.
**Réalisé** : axe vertical (corps → engrenage → plot) et axe du lanceur (corps → ressort → poignée), écarts agrandis autour
de la pièce choisie ; engrenage à plat et immobile ; lanceur surélevé de 15 cm ; cadrage montrant d'où sort la pièce. Testé.

---

## 2026-11-26 — Lanceur : le ressort sort du manche (schéma de Louis) + agent de contrôle

**Prompt optimisé** : (rôle : dev 3D Three.js) refaire l'éclaté du lanceur selon le schéma : le ressort glisse le long
du manche horizontal jusqu'à en sortir, dans le sens de la flèche ; l'engrenage descend sans pivoter ; faire contrôler
le résultat par un agent.
**Réalisé** : correction du bug de fond, l'éclaté écrasait la position de montage de l'engrenage et de la poignée
(engrenage au sol, poignée au pied). Les décalages s'ajoutent maintenant à cette position. Le ressort sort entièrement
du manche, avec la poignée juste derrière. La caméra cadre tout le lanceur éclaté et la 3D est centrée dans la zone libre
entre les deux panneaux. L'agent de contrôle (Sonnet) a signalé la poignée hors écran et le cadrage trop serré : corrigé.

---

## 2026-11-26 — Lanceur mécanique (pignon central sur le pied) + gros travail visuel

**Prompt optimisé** : (rôle : dev 3D / artiste technique Three.js)
- éloigner un peu plus le ressort dans l'éclaté ;
- retirer la poignée en T ;
- rendre le lanceur mécaniquement logique : l'engrenage choisi engrène sur un pignon central monté sur le pied ;
- puis améliorer nettement les visuels et les graphismes.

L'agent de contrôle n'est plus utilisé.
**Réalisé** :
- vraies roues dentées extrudées (dents, ajours, moyeu), avec un pas par modèle d'engrenage ;
- pignon central sur la colonne du pied, à l'entraxe exact ; il tourne avec le bon rapport de denture, comme les satellites du « double » ;
- poignée supprimée ;
- manche rond avec butée, boîtier tourné avec rivets ;
- ressort sorti à 4 cm du manche ;
- carte de reflets « studio » pour tous les métaux ;
- halo lumineux (bloom, Three.js r160 MIT, dans `vendor/jsm`) et vignettage ;
- vue d'ensemble du lanceur élargie.

---

## 2026-11-26 — Atelier : changer de pièce ne relance plus le démontage

**Prompt optimisé** : (rôle : dev Three.js) dans l'atelier, une fois une partie ouverte (engrenage, pointe…), équiper une autre
pièce doit remplacer uniquement cette pièce dans la vue éclatée, sans rejouer toute l'animation de démontage. Valable pour la
toupie comme pour le lanceur.
**Réalisé** : `majModeles` ne reconstruit plus que le modèle concerné (toupie ou lanceur), et le nouveau modèle reprend
exactement l'état de l'ancien : pose, hauteur, rotation, décalages de l'éclaté, vitesses. Seule la pièce changée fait un
petit rebond. Vérifié avec l'engrenage et la pointe, aucune erreur.

---

## 2026-11-26 — Onglet terrain, plot retiré, règle « logique mécanique », mode test

**Prompt optimisé** : (rôle : dev Three.js / game designer)
- dans l'onglet Terrain, changer de terrain ne doit pas rejouer l'animation ;
- retirer le plot gradué au sol sous le lanceur, inutile ;
- inscrire dans les règles du projet qu'on garde toujours une logique mécanique (ex. un engrenage plus petit donne moins de rotation) ;
- préparer une partie test avec toutes les pièces débloquées au maximum.

**Réalisé** :
- un changement de terrain ne reconstruit plus aucun modèle ;
- plot retiré (modèle 3D et vue éclatée) ;
- règle 5 ajoutée à `CLAUDE.md` ;
- bouton « 🧪 Mode test » dans le menu : les 56 pièces au niv 5 et les 3 terrains ; la sauvegarde est mise de côté puis restaurée.

Testé : passage en mode test et partie lancée, aucune erreur.

---

## 2026-11-26 — Lien du test

**Prompt optimisé** : envoyer à Louis le lien de la version en ligne pour jouer la partie test (mode test).
**Réalisé** : lien de GitHub Pages et marche à suivre envoyés.

---

## 2026-11-26 — Ressort en titane illogique, barre d'élan

**Prompt optimisé** : (rôle : game designer, règle 5 « logique mécanique ») une pièce de lanceur ne doit modifier que le lancer :
le ressort en titane ne peut pas alléger la toupie. Corriger aussi la barre d'élan, qui ne réagit pas.
**Réalisé** :
- ressort en titane : élan +7, puissance −4, précision −3 (plus de poids ni d'endurance) ;
- règle appliquée aux autres pièces : ressort de matelas sans rebond, engrenage horloger sans critique ;
- barre d'élan : les barres saturaient au-delà de ±10 niveaux, fréquent avec les pièces niv 5 du mode test, et tous les gros
  ressorts affichaient une barre pleine ; l'échelle est maintenant douce et ne sature jamais.

La jauge de lancer en partie a été vérifiée : elle fonctionne.

---

## 2026-11-26 — Barres de stats de 1 % (pire assortiment) à 100 % (meilleur au niveau max)

**Prompt optimisé** : (rôle : dev UI / game designer) une barre de stat ne doit jamais paraître négative ou vide.
- Le pire assortiment de pièces possible pour cette stat donne environ 1 %.
- Le meilleur assortiment, avec les pièces au niveau max, donne 100 %.
- Les bornes sont calculées sur toutes les combinaisons de pièces, pour que remplir une barre soit un vrai objectif pour le joueur.

**Réalisé** :
- `BORNES` dans `src/stats.js` : minimum et maximum de chaque stat sur tous les assortiments (une pièce par emplacement, niveaux 1 à 5). C'est exact, car les niveaux s'additionnent emplacement par emplacement.
- Les barres vont de 1 % à 100 % ; les pouvoirs vont de 0 au maximum.
- Les achats en partie peuvent faire déborder la barre, qui reste alors pleine.

---

## 2026-11-26 — Stat Chance, rareté des améliorations, boutique à 4 offres, priorité toujours achetable

**Prompt optimisé** : (rôle : game designer / dev gameplay)
- Ajouter une stat **Chance** (🎲), achetable en partie.
- Les améliorations de la boutique ont une **rareté**, à prix égal : commune, rare (effet ×1,5), épique (×2), légendaire (×3). La Chance augmente la probabilité des raretés hautes.
- Afficher la rareté sur chaque carte par un code couleur et une étiquette.
- La boutique passe à **4 offres complètement aléatoires** (toupie, lanceur ou bureau, dans n'importe quelle proportion). Chaque achat relance les offres.
- Rendre la **priorité de terrain achetable à tout moment**, avec un petit bouton sous Relancer et Prêt.
- Surveiller l'équilibrage.

**Réalisé** :
- Raretés et Chance dans `config.js` (`RARETES_OFFRE`, `tirerRarete`).
- Stat `veine` affichée « Chance », sur 5 achats maximum. L'id `chance` reste le Trèfle doré.
- Prix et plafond comptés en achats (`achats`), et effet en niveaux multipliés par la rareté.
- Les bots tirent les mêmes raretés selon leur propre Chance.
- Nouvelle âme « Fer à cheval » (Chance +5, endurance et lames en baisse), pour que chaque stat soit le bonus d'au moins une pièce.
- Intérêts max arrondis à l'entier inférieur.
- Repères mesurés : multiplicateur moyen ×1,16 sans Chance, ×1,29 après un achat, ×1,54 vers 10 niveaux.

---

## 2026-11-26 — Résultats d'équilibrage (raretés + Chance)

**Prompt optimisé** : envoyer la synthèse des 12 parties robot (3 par stratégie) quand elles sont finies.
**Réalisé** : places moyennes : sacrifice 5,3, économie 5,7, mixte 5,7, puissance 4,0. Elles sont en baisse par rapport à
l'ancienne boutique. Cause probable : le joueur est limité à 4 offres au hasard, alors que les bots achètent encore librement
n'importe quelle stat. Proposition : soumettre les bots aux mêmes 4 offres.

---

## 2026-11-26 — Bots à la même boutique, 20 parties ×100, retour des robots

**Prompt optimisé** : faire acheter les bots avec les mêmes règles de boutique que le joueur, rejouer 5 parties par stratégie
en vitesse ×100 et envoyer les résultats, puis faire rédiger par un agent léger un retour des robots sur ce qui pourrait être
amélioré.
**Réalisé** :
- `tirerOffresPour` est partagé par le joueur et les bots ; les bots prennent la meilleure affaire et relancent 4 fois au maximum.
- Places moyennes : sacrifice 5,8, économie 4,6, mixte 4,6, puissance 4,2, aucune erreur.
- Retour de l'agent :
  - parties courtes, et le robot ne dépasse jamais la 3e place ;
  - l'argent dort ;
  - les relances sont peu rentables ;
  - les cafards rapportent peu aux étapes tardives.

Des pistes chiffrées ont été proposées à Louis, sans être appliquées.

---

## 2026-11-26 — Points 1 et 3 appliqués (duel perdu au plus 3 vies, relances 1, 2, 3, 5, 8…) et nouveaux tests

**Prompt optimisé** : appliquer les pistes 1 et 3 du retour des robots, rejouer 5 parties par stratégie (×100) et envoyer les résultats.
**Réalisé** :
- Les deux réglages sont dans `src/config.js`.
- Places moyennes : sacrifice 5,6, économie 6,0, mixte 4,2 (4/5 dans le top 4), puissance 4,2 ; aucune erreur.
- Les parties durent plus longtemps : 17 à 18 manches pour mixte et puissance.

---

## 2026-11-26 — Duel perdu = 1 vie ; parties en stratégie économie

**Prompt optimisé** : un duel perdu coûte toujours 1 vie (5 vies = 5 défaites possibles) ; rejouer des parties en stratégie
économie.
**Réalisé** :
- `degatsDuel = 1`.
- 1re série de 10 parties : 6,1 de place moyenne, mais le robot gardait 116 💰 sans s'en servir, faute de relancer.
- Le robot de test relance maintenant quand aucune offre ne lui convient.
- 2e série de 10 parties : 5,8 de place moyenne, 21 duels gagnés sur 61, environ 27 manches par partie, et l'argent est bien dépensé.

---

## 2026-11-26 — Comparaison mixte et puissance (duel perdu = 1 vie)

**Prompt optimisé** : jouer 5 parties de mixte et 5 de puissance avec la règle « 1 vie par duel perdu », pour les comparer à l'économie (5,8).
**Réalisé** : mixte 6,6 (0 top 4 sur 5), puissance 5,2 (2 sur 5), économie 5,8. Toutes les stratégies du robot reculent
sur les parties longues, et les cafards tués par lancer tombent à environ 2 à partir de l'étape 4. Cause probable : la vie des cafards
(+12 % par étape) devient trop forte quand les parties durent 7 étapes.

---

## 2026-11-26 — Temps limités : lancer, accélération, boutique

**Prompt optimisé** : (rôle : dev gameplay, jeu en ligne à venir) rendre le jeu dynamique pour que personne n'attende.
- Un temps limité pour lancer, 15 s par exemple ; à la fin du temps, la toupie part toute seule.
- Après le lancer, on attend que la dernière toupie s'arrête ; si c'est trop long, le temps accélère.
- Un temps limité pour la boutique ; quand tout le monde est prêt, on passe directement à la suite.

Durées au choix de Claude.
**Réalisé** :
- Réglages dans `PARTIE` (`src/config.js`) :
  - 15 s pour lancer ; au bout du temps, la toupie part avec la jauge du moment, ou à 55 % ;
  - accélération progressive à partir de 10 s après le lancer, jusqu'à ×5 ;
  - 25 s de boutique, avec un compte à rebours sur « Prêt » et une barre de temps ; au bout du temps, on passe à la suite.
- Minuteur affiché sous l'aide ; il clignote en rouge sous 5 s.
- Les minuteurs suivent l'horloge réelle.

Testé : lancer automatique, accélération ×2 puis ×5, boutique chronométrée ; aucune erreur.

---

## 2026-11-26 — Résultats après cafards adoucis et bots recalibrés

**Réalisé** (5 parties par stratégie) : sacrifice 6,8, économie 5,2, mixte 5,8, puissance 6,0 ; parties d'environ 26 à 29 manches.
Le robot écrase 2 à 4,6 cafards par lancer, les bots simulés 4 à 6 : ils restent un peu plus riches. Proposition : caler leur
plafond sur la mesure réelle, environ 3,5 par lancer.

---

## 2026-11-26 — Calage des bots sur environ 3,5 cafards par lancer

**Prompt optimisé** : caler le plafond des cafards écrasés par les bots sur la mesure réelle du robot (environ 3,5 par lancer) et rejouer 5 parties par stratégie.
**Réalisé** : plafond 3,4 × couverture (couverture plafonnée à 1,3) ; les bots passent de 3,4 cafards par lancer à l'étape 1 à 4,2 à l'étape 7. Tests relancés.
Résultats (5 parties par stratégie) : sacrifice 6,6, économie 4,8, mixte 5,8, puissance 4,8 ; aucune erreur.

---

## 2026-11-27 — Agents critiques : graphismes, sons, ressenti de jeu

**Prompt optimisé** : (rôle : directeur artistique, sound designer, game designer) lancer des agents critiques pour lister ce qui peut encore être amélioré, surtout les graphismes, les bruitages et les visuels. 3 agents ciblés (Sonnet), 5 captures maximum chacun, rapport de 400 mots maximum, aucune modification de fichier.

---

## 2026-11-27 — Textures des toupies

**Prompt optimisé** : (rôle : artiste 3D technique) ajouter de la texture sur les pièces des toupies (couronnes, bases, pointes…), en restant cohérent avec la fabrication de chaque pièce (règle 5).
**Réalisé** : textures d'usinage procédurales partagées dans `src/topMesh.js`, utilisées en relief, en rugosité et en teinte :
- moletage (losanges d'accroche) sur les couronnes ;
- stries de tour sur les bases et le disque ;
- métal martelé sur la base lourde ;
- métal brossé sur les pointes, les lames et le bouclier.
**Synthèse des 3 agents** (environ 230 000 jetons au total), priorités retenues :
1. Fin de duel plus rapide, avec un verdict plein écran.
2. Lisibilité sur téléphone.
3. Récompense visible des gains et des achats ; boutique plus claire (prix manquant, « 0 % → 18 % »).
4. Sons : mixage, lancer, jauge PARFAIT, minuteur, vrais chocs de métal, jingles.
5. Toupie plus lisible en partie.
6. Cafards plus détaillés et animés.
7. Stats de l'atelier allégées.

---

## 2026-11-27 — Points 1 à 7 des agents critiques, un par un

**Prompt optimisé** : appliquer un par un les 7 points du plan des agents critiques.
- 1 : fin de duel ;
- 2 : téléphone ;
- 3 : gains, achats et boutique ;
- 4 : sons ;
- 5 : toupie lisible ;
- 6 : cafards ;
- 7 : stats de l'atelier.

Un commit et une publication par point.
**Réalisé** :
- Point 1 : verdict plein écran (VICTOIRE ou DÉFAITE) et passage à la boutique 2,5 s après, en temps réel ; durée maximale d'un duel 25 s.
- Point 2 : vue plongeante sur téléphone (plateau sur toute la largeur), aide sur une ligne et masquée après 2 lancers.
- Point 3 : pièces qui volent vers le compteur, compteur qui défile, confirmation d'achat, « il manque X 💰 », « pas encore ».
- Point 4 : sons :
  - compresseur de sortie et panoramique ;
  - sons procéduraux : ressort au lancer, ding PARFAIT, choc de métal, tic-tac du minuteur, achat, carillon légendaire ;
  - jingles victoire, défaite et fin de partie, avec la musique baissée pendant le jingle.
- Point 5 : halo au sol par camp (vert pour toi, rouge pour l'adversaire), toupies un peu plus hautes, % affiché seulement sous 50 %.
- Point 6 : cafards à carapace texturée et vernie, avec pronotum et antennes courbes.
- Point 7 : atelier, les pouvoirs qu'on ne possède pas sont masqués et le panneau tient en entier.

---

## 2026-11-27 — Lames sculptées, visuels par niveau, dégâts selon poids et vitesse

**Prompt optimisé** : (rôle : artiste 3D technique et dev gameplay)
- Donner plus de personnalité aux pièces de la toupie, et rendre esthétiques les lames de la couronne à lames (de simples rectangles jusqu'ici).
- Faire évoluer le visuel d'une pièce avec son niveau (par exemple : 2 lames au niveau 1, puis de plus en plus).
- Vérifier, puis garantir, que les dégâts d'un impact dépendent du poids, des lames, du critique et de la vitesse réelle de la toupie.

**Réalisé** :
- Lames de faucille extrudées, avec fil brillant et rivet, au nombre de 1 + niveau.
- Dents de couronne : 6 + 3 × niveau.
- Rivets dorés de niveau sur les bases et les autres couronnes ; lueur de l'âme selon le niveau.
- L'atelier, la partie et l'écran d'inspection (onglets de niveau) suivent le niveau.
- Dégâts sur les cafards : lames × élan absolu × poids × critique ; la toupie standard lancée à fond fait les mêmes dégâts qu'avant.
- En duel, c'était déjà le cas : lames, vitesse d'approche, rapport des masses, critique.

---

## 2026-11-27 — Pondeuse et éclairs retirés, améliorations sans plafond, prix selon la rareté, Paramètres

**Prompt optimisé** : (rôle : game designer et dev gameplay)
- Retirer la pondeuse : elle pousse à attendre pour farmer les œufs, ce qui donnait un argent démesuré (68 000 💰 à l'étape 9).
- Supprimer le plafond des améliorations : plus jamais de boutique vide.
- Retirer les Éclairs en chaîne, trop forts.
- Dégâts : une toupie à 0 d'élan fait au minimum ×1 ; la rotation compte aussi.
- Une amélioration plus rare coûte plus cher, mais pas au prorata (effet ×2 → prix ×1,5).
- Ajouter un menu Paramètres pour régler l'image et le son.

**Réalisé** :
- Pondeuse, larves, stat et âme d'orage supprimées (56 pièces).
- Plus de plafond, sauf pour le Multi-lancer (2 toupies en plus, la place du lanceur) ; Trèfle doré et Tourbillon bornés à 60 %.
- Surcoût de rareté 1 + (effet − 1) × 0,5 : rare ×1,25, épique ×1,5, légendaire ×2.
- Dégâts sur les cafards : élan de ×1 à ×2,1, rotation de ×0,6 à ×1.
- Écran Paramètres : qualité d'image, ombres, halo, secousses, plein écran, volume des effets et de la musique (sauvegardés).

---

## 2026-11-27 — Tests après la nouvelle économie

**Prompt optimisé** : jouer 5 parties robot par stratégie (×100) après le retrait de la pondeuse, la fin des plafonds et le surcoût de rareté.
**Réalisé** : sacrifice 6,2, économie 5,6, mixte 5,4, puissance 6,0 ; argent max moyen 10 à 18 💰 (plus d'argent démesuré) ; parties de 25 à 30 manches ; aucune erreur.

---

## 2026-11-27 — Défier un ami en temps réel

**Prompt optimisé** : (rôle : dev réseau temps réel, jeu web statique sur GitHub Pages sans serveur à soi) permettre de
défier un ami en duel en temps réel : créer un défi (code ou lien), l'ami le rejoint, chacun joue avec la toupie de son
atelier.
**Réalisé** :
- Connexion directe WebRTC via PeerJS (MIT), dont le serveur public ne sert qu'à la mise en relation.
- L'hôte fait foi : il calcule la physique et envoie l'état 20 fois par seconde.
- L'invité envoie son lancer et voit des toupies fantômes lissées, en miroir, chacun ayant son lanceur en bas.
- Chocs relayés (étincelles, sons, %) ; 3 vies chacun ; score dans le HUD ; gestion de la déconnexion ; lien `?ami=CODE`.
- Testé entre deux onglets avec `?local` : connexion, lancers, fantômes, fin de duel et duel suivant, aucune erreur.
- Le serveur public PeerJS n'est pas joignable depuis l'environnement de test.

---

## 2026-11-27 — Le défi entre amis ne se connecte pas : test sur deux navigateurs séparés

**Prompt optimisé** : (rôle : dev réseau, testeur) « Défier un ami » ne fonctionne pas chez Louis. Faire se connecter deux
navigateurs différents, trouver la cause et corriger.
**Réalisé** :
- Les agents ne peuvent pas joindre 0.peerjs.com depuis l'environnement (nom de domaine introuvable).
- Test fait sur deux processus Chromium séparés, avec un vrai serveur PeerJS local (`?serveur=127.0.0.1:9000`).
- Bug corrigé : chacun écoutait les messages de l'autre seulement après l'ouverture. Le « bonjour » envoyé trop tôt se
  perdait, et la partie ne démarrait jamais. Maintenant, on écoute dès la création de la connexion et on répond au « bonjour ».
- Ajouts :
  - délais de 15 s avec des messages clairs ;
  - reconnexion au serveur s'il coupe ;
  - paramètre `?serveur=` pour un autre serveur de mise en relation.
- Résultat : connexion, lancers, fantômes, fin de duel et vies cohérentes des deux côtés, aucune erreur.

---

## 2026-11-27 — Défi entre amis : ça ne marche pas sur téléphone

**Prompt optimisé** : (rôle : dev réseau mobile) le défi entre amis échoue sur téléphone ; trouver la cause probable et la corriger.
**Réalisé** :
- L'interface sur téléphone a été vérifiée (émulation iPhone 13) : elle fonctionne.
- Cause probable : un réseau mobile (4G/5G) qui bloque la connexion directe. Ajout de relais TURN gratuits (PeerJS,
  Open Relay) et de serveurs STUN Google et Cloudflare.
- Diagnostic affiché à l'écran : connexion en cours, échec à cause du réseau, connexion perdue.
- Bouton « Envoyer le lien » avec la feuille de partage du téléphone.
- Le test sur deux navigateurs séparés passe toujours.

---

## 2026-11-27 — « Erreur de connexion » : pouvoir se connecter à tout moment

**Prompt optimisé** : (rôle : dev réseau) le défi entre amis affiche « erreur de connexion » ; il doit fonctionner à tout moment,
quel que soit le réseau.
**Réalisé** :
- Le transport par défaut devient un relais MQTT public sur WebSocket sécurisé (port HTTPS standard, qui passe partout).
- Trois relais gratuits essayés à la suite.
- Canal de jeu avec poignée de main, battement de cœur toutes les secondes et détection de coupure au-delà de 12 s.
- La connexion directe PeerJS reste disponible avec `?p2p`.
- Testé avec deux navigateurs séparés via un relais local (aedes) : partie lancée, duel joué, vies cohérentes, aucune erreur.

---

## 2026-11-27 — Duels : lancers gardés en mémoire, départ simultané, 7 s pour lancer

**Prompt optimisé** : (rôle : dev gameplay) en duel, contre un bot comme contre un ami, le lancer (angle et puissance) est
gardé en mémoire : la toupie ne part pas tant que l'adversaire n'a pas lancé. Les deux toupies partent ensemble quand les
deux joueurs ont lancé. On a 7 s pour lancer, sinon le lancer part tout seul.
**Réalisé** :
- `monLancer`, `sonLancer` et `tenterLacher()` dans `src/match.js` ; `tempsLancerDuel = 7`.
- Le bot choisit son lancer entre 1 et 5 s, sans voir le tien.
- Message « ⏳ Lancer prêt — en attente de … ».
- Contre un ami, l'hôte lâche les deux toupies ; si le lancer de l'invité n'arrive pas, lancer par défaut au bout de 10 s.

Testé : contre un bot (départ ensemble, lancer automatique à 7 s) et entre deux navigateurs (relais local) ; aucune erreur.

---

## 2026-11-27 — Sons en fin de partie, barres au menu, mode Entraînement, vérification du diamètre

**Prompt optimisé** : (rôle : dev gameplay)
- Corriger les problèmes de sons en fin de partie.
- Corriger les barres de vie qui restent affichées au menu.
- Créer un mode Entraînement : on tire sur un mannequin immobile à vie infinie.
- Vérifier si le diamètre augmente l'inertie et les dégâts.

**Réalisé** :
- Au retour au menu : le ronronnement de la toupie est coupé (il pouvait continuer sans fin), les barres et l'aide sont effacées.
- Le jingle de fin de partie est décalé après celui du duel (ils se superposaient).
- Mode 🎯 Entraînement depuis le menu :
  - mannequin poteau-cible au centre, immobile (la toupie rebondit dessus) et à vie infinie ;
  - dégâts de chaque coup affichés, avec le total du lancer, le meilleur coup et le meilleur lancer ;
  - lancers illimités, sans chrono ni boutique.
- Diamètre vérifié dans le code : il ne change que la taille (zone de contact), ni l'inertie ni les dégâts d'un coup ; une toupie plus large touche simplement plus souvent.

---

## 2026-11-27 — Défi entre amis avec les vagues de cafards ; Nid et combo rééquilibrés ; engrenage double = 2 toupies

**Prompt optimisé** : (rôle : game designer et dev réseau)
- En 1 contre 1, garder les vagues de cafards : chacun joue ses 3 lancers et sa boutique, puis duel contre l'ami.
- Rendre le Nid bien moins efficace : environ +1 cafard en commune, +2 en rare et +3 au maximum en légendaire ; rentable en fin de partie, sans abus (on générait près d'un million par manche).
- L'engrenage double doit lancer 2 toupies, pas 3.

**Réalisé** :
- Défi = vraie partie à 2, 5 vies, 1 vie par duel perdu.
- Avant chaque duel, attente mutuelle (`pret-duel` puis `go-duel`), avec échange des améliorations achetées. Pas de récompense de fin.
- Nid : 1 cafard par niveau (plafond +15), acheté cafard par cafard (commune +1, rare +1,5, épique +2, légendaire +3), prix 5, 10, 17, 26, 37…
- Combo : multiplicateur plafonné à ×3, la vraie cause des sommes énormes.
- Calcul : +1 cafard rapporte environ 1,6 💰 par étape au début et 3,5 💰 vers l'étape 7 ; le 1er Nid est remboursé en 2 à 3 étapes, le 5e n'est plus rentable.
- Engrenage double : son effet est plafonné à exactement +1 toupie (bonus et malus ensemble) ; nombre de toupies arrondi.
- Code d'entraînement effacé par erreur pendant ce chantier, restauré.

Testé : défi complet entre deux navigateurs (3 lancers et boutique chacun, puis duel synchronisé, vies cohérentes), aucune erreur.

---

## 2026-11-27 — Nid : pas de rareté commune

**Prompt optimisé** : le Nid n'existe qu'en rare (+1 cafard), épique (+2) et légendaire (+3) ; pas de Nid commun.
**Réalisé** : une offre de Nid tire sa rareté sans commune ; +1, +2 ou +3 cafards ; prix ×1, ×1,5 ou ×2 ; étiquette « Rare · +1 cafard ».

---

## 2026-11-27 — Améliorations dégressives au lieu de plafonds

**Prompt optimisé** : ne pas plafonner les améliorations, mais les rendre dégressives : au-delà d'un palier, chaque niveau
apporte de moins en moins.
**Réalisé** :
- `degressif()` dans `src/stats.js` : linéaire jusqu'à 10 niveaux, logarithmique au-delà (15 → 14,1 ; 20 → 16,9 ; 50 → 26,1 ; 100 → 33), appliqué à toutes les stats.
- Plafonds retirés :
  - Nid : plus de +15 ;
  - Multi-lancer : sans maximum, chaque toupie en plus tourne 30 % moins fort ;
  - Tourbillon : plus de 60 % ;
  - combo : dégressif au-delà de ×2 ;
  - critique et Trèfle doré : se rapprochent de 100 % sans l'atteindre.

---

## 2026-11-27 — Coup critique jusqu'à 100 %, surplus en dégâts critiques

**Prompt optimisé** : le coup critique doit pouvoir atteindre 100 % ; tout ce qui dépasse 100 % augmente les dégâts critiques.
**Réalisé** : 4 % par niveau (niveaux dégressifs au-delà de 10) jusqu'à 100 % ; le surplus multiplie le coup critique (×3 de base, 125 % → ×3,75).

---

## 2026-11-27 — Boîte mystère façon boîte de jouet, ouverture en plusieurs clics

**Prompt optimisé** : (rôle : designer UI et motion) refaire la boîte mystère comme une boîte de toupie du commerce, sans
aucune marque, très colorée. Elle s'ouvre un peu plus à chaque clic ; une fois ouverte, la pièce sort de la boîte et brille.
**Réalisé** :
- Boîte en CSS : carte de présentation trouée, couvercle « OUVRIR ICI », façade dégradée avec lignes de vitesse, toupie
  arc-en-ciel qui tourne, titre en relief, pastille « NOUVEAU ! », scellé rouge.
- 4 clics, qui se cumulent :
  1. le scellé se déchire ;
  2. le couvercle s'entrouvre ;
  3. il s'ouvre et laisse passer des rayons de la couleur de la rareté (indice) ;
  4. la pièce sort en brillant, puis la carte du lot apparaît.

---

## 2026-11-27 — Boutique 3D : petit paquet (1 pièce, 100) et gros carton (5 pièces, 450)

**Prompt optimisé** : (rôle : dev 3D et designer UI) quand on va dans la boutique, la caméra se déplace jusqu'à un comptoir.
On y voit deux produits : un petit paquet d'1 pièce pour 100 écrous et un gros carton de 5 pièces pour 450. Cliquer sur un
produit propose l'achat.
**Réalisé** :
- `src/magasin3d.js` : comptoir en bois, mur violet, enseigne néon « BOUTIQUE », deux emballages texturés dans le style de la
  boîte mystère (×5, prix sur pastille).
- La caméra glisse vers le comptoir ; au survol, le produit se soulève et pivote ; un clic ouvre la confirmation (prix,
  solde, « il manque X »).
- Après l'achat, les boîtes s'ouvrent à la suite : 1 ou 5 révélations.
- `acheterProduit` dans `progression.js`.

---

## 2026-11-27 — Boutons de retour visibles et en surbrillance ; mode test avec beaucoup d'écrous

**Prompt optimisé** : (rôle : designer UI)
- Rendre les boutons de retour (menu, atelier, boutique…) bien plus visibles en couleur, avec une surbrillance au survol.
- Préparer une partie test avec beaucoup d'écrous pour acheter des boîtes.

**Réalisé** :
- `.retour-menu` en cyan vif avec bordure claire, et un halo au survol (atelier, boutique, collection, paramètres, défi, inspection).
- Surbrillance au survol sur tous les boutons, les cartes d'offre, les onglets et les emplacements ; ✖ Quitter en rouge.
- Mode test : 100 000 écrous, rechargés à chaque chargement tant que le mode test est actif.

---

## 2026-11-27 — Écrous du mode test, visuels des boîtes de la boutique refaits

**Prompt optimisé** : les écrous du mode test ne fonctionnent pas ; les boîtes de la boutique sont mal cadrées ; refaire leurs visuels.
**Réalisé** :
- Bouton « 🧪 +10 000 🔩 (test) » dans la boutique ; en mode test, les écrous sont rechargés et le solde est rafraîchi au chargement.
- Emballages redessinés : une texture par face aux bonnes proportions, marges et liseré blanc, texte ajusté à la largeur
  (« TOUPIE » / « CAFARD 2 » sur deux lignes), pastille « 100 / ÉCROUS », côtés illustrés, carte de présentation trouée au-dessus.

---

## 2026-11-27 — Boîtes toujours mal centrées, bouton d'écrous qui ne marche pas : version en cache

**Prompt optimisé** : les boîtes sont toujours mal centrées et le bouton d'écrous de test ne marche pas ; Louis se demande
s'il s'exprime mal.
**Réalisé** :
- Diagnostic : la capture de Louis montre l'ANCIENNE version. Son navigateur gardait les anciens modules JS en cache ; Ctrl+F5
  ne recharge que la page, pas les modules importés.
- Correctif durable : `outils/versionner.mjs` ajoute une empreinte `?v=` à chaque module via la carte d'imports, et un numéro de version s'affiche au menu.
- La règle de publication est ajoutée à CLAUDE.md.
- Testé : tous les modules sont versionnés ; le bouton +10 000 🔩 fonctionne (0 → 10 000).

---

## 2026-11-27 — Ouverture des boîtes en 3D, par 5, avec la vraie pièce qui sort

**Prompt optimisé** : (rôle : dev 3D Three.js, motion design) refaire l'ouverture des boîtes en vraie 3D, avec une vue
plongeante inclinée. Les boîtes s'ouvrent toutes ensemble (5 d'un coup). C'est le vrai modèle 3D de la pièce qui sort de sa
boîte, pas un émoji au milieu de l'écran.
**Réalisé** :
- `src/ouverture3d.js` : table ronde éclairée dans la vitrine, 1 à 5 boîtes 3D en arc de cercle (corps ouvert, couvercle à
  charnière, scellé, lumière intérieure et halo de la couleur de la rareté).
- 4 clics, sur toutes les boîtes à la fois :
  1. le scellé saute ;
  2. le couvercle s'entrouvre ;
  3. il s'ouvre et la lumière jaillit ;
  4. le vrai modèle de la pièce (topMesh ou lanceurMesh) monte hors de la boîte en tournant.
- Puis récapitulatif des lots, avec « Équiper » ou « Choisir » ; « Ouvrir » ouvre jusqu'à 5 boîtes ; un gros carton ouvre ses 5 boîtes ensemble.

---

## 2026-11-27 — Faire pivoter les pièces sorties des boîtes ; question sur les nouvelles sessions

**Prompt optimisé** : permettre de faire pivoter (glisser) les pièces une fois sorties de leurs boîtes. Expliquer si une nouvelle
session garde l'historique et ce qu'elle apporte.
**Réalisé** : glisser fait pivoter toutes les pièces sorties (la rotation automatique se met en pause) ; consigne « ↔ Glisse
pour faire pivoter les pièces ». Explication des sessions donnée à Louis.

---

## 2026-11-27 — Ouverture d'une nouvelle session

**Prompt optimisé** : ouvrir une nouvelle session sur le dépôt, configurée avec les règles du projet (CLAUDE.md, ETAT.md).
**Réalisé** : session « Toupie Cafard 2 — suite » créée. Elle doit appliquer la règle 0, lire CLAUDE.md et ETAT.md, résumer l'état du jeu et demander à Louis la suite.
## 2026-11-27 — Quitter la partie, Âme de miel, agressivité, bannir, plateau hexagonal
**Prompt optimisé** (dev gameplay Three.js) : 1) bouton clair et toujours visible pour abandonner une partie, quitter
l'entraînement ou un défi ; 2) Âme de miel limitée à +1 cafard par niveau (niv 1 = 1, niv 5 = 5) ; 3) expliquer les formules
rareté → effet et rareté → prix ; 4) en duel, seules les toupies avec Agressivité cherchent l'adversaire ; 5) bannir une
amélioration pour toute la partie (1 seule fois) ; 6) trouver une forme de terrain rebondissant qui favorise les contacts.
**Réalisé** : bouton 🏳️ Abandonner / 🚪 Quitter (bas gauche, au-dessus de la boutique, confirmation, Échap) ; Âme de miel
nid 2,8 (= 1 à 5 cafards) ; attraction de duel = Agressivité × 1,2 (0 sans Agressivité) ; 🚫 Bannir sur les offres
(2 clics, 1 par partie) ; simulation des formes → terrain rebondissant hexagonal (27 % de duels sans contact en rond, 6 %).

## 2026-11-27 — Terrain carré, élan sur les bandes, lancer au doigt
**Prompt optimisé** (dev gameplay) : terrain rebondissant carré (duel + atelier) ; ses bandes doivent vraiment booster
l'élan ; sur téléphone, pouvoir placer le lanceur d'abord, puis tirer.
**Réalisé** : losange simulé (5 %) puis carré retenu (2 % de duels sans contact) ; arène carrée en duel et dans l'atelier ;
chaque bande : +35 % de vitesse, plafond 1,9 × vitesse de lancer (Élan) ; au doigt : glisser sur la bande du bas = placer
(sans tirer), toucher le plateau = viser + jauge, lever = tir.

## 2026-11-27 — Agents testeurs critiques et équilibrage des builds
**Prompt optimisé** (directeur QA + game designer) : lancer plusieurs agents critiques qui explorent tous les menus et jouent
à tous les modes ; faire jouer toutes les stratégies de toupie (Élan, Puissance, Lames…) en ×100 ; appliquer les retours,
équilibrer, et dire s'il faut retirer la Combo ; faire un topo de tous les retours.
**Réalisé** : 3 agents (menus, parties, duels) ; robot par build (`tests/builds.js`) et simulateur de duels (`tests/duels-sim.js`) ;
bug de la charge corrigé, flair limité aux cafards, arène creusée, défense tassée, malus pondérés par impact (écart 3-93 % → 25-76 %) ;
corrections d'interface. Combo : le build Combo finit dernier, elle n'est pas trop forte. Décisions laissées à Louis (durée de partie…).

## 2026-11-27 — Décisions : 2 vies dès l'étape 6, Combo gardée
**Prompt optimisé** (dev gameplay) : un duel perdu coûte 2 vies à partir de l'étape 6 (au lieu de 1) pour raccourcir les
parties ; garder la stat Combo telle quelle ; mettre à jour textes, état et publication.
**Réalisé** : `degatsDuel` = 1 vie, puis 2 dès l'étape 6 ; la boutique annonce « défaite : −N ❤️ » avant chaque duel ; textes du
défi ami mis à jour ; 6 parties robot sans erreur ; Combo inchangée.

## 2026-11-27 — Défi entre amis : fin de duel bloquée
**Prompt optimisé** (dev réseau/gameplay) : en défi entre amis, après une victoire la toupie continue de tourner, sans
verdict ni suite. Trouver la cause, corriger, vérifier à deux onglets, publier.
**Réalisé** : l'invité dépendait d'un seul message « fin » de l'hôte (perdu sur le relais = blocage). Le résultat voyage
aussi dans l'état envoyé 20×/s, l'hôte renvoie « fin » 3 fois, l'invité conclut seul après 3 s. Testé à deux onglets avec
messages « fin » supprimés : verdicts, vies et manche suivante OK. Mode `?local` réparé (plantait à la création).

## 2026-11-27 — Améliorer l'Élan sans terrain et l'Endurance
**Prompt optimisé** (game designer) : remonter l'Élan sur le bureau rond (10 %) et l'Endurance pure (7 %) au-dessus de
25 % de duels gagnés, sans qu'aucun build dépasse 70 %, avec des mécanismes crédibles (règle 5).
**Réalisé** : poids d'impact Élan 0,35 / Rebond 0,3 / Glisse 0,5 (mesurés) ; « recul » : frapper une toupie plus stable que
soi fait perdre de la rotation (`CHOC.recul` 0,2) ; lames un peu plus tranchantes (`parLames` 0,04). Simulateur : 29 à 69 %
pour tous les builds (Endurance 29 %, Élan bureau rond 19 %, 27 % avec Endurance achetée). Coup glissant testé, sans effet.

## 2026-11-28 — Tableau des raretés, builds spécialisés malins, fluidité
**Prompt optimisé** (game designer + optimisation) : redonner le tableau rareté → niveaux/prix ; faire jouer des builds
très spécialisés (Nid, Élan…) avec un robot qui compense ses faiblesses (dégâts, survie) ; rendre le jeu plus fluide.
**Réalisé** : tableau redonné ; `tests/builds-malins.js` (10 builds × 3 parties) ; fluidité : taille du canvas en cache
pour les barres de vie, étincelles réutilisées, shaders précompilés, vérification synchrone des shaders coupée.

## 2026-11-28 — Passe d'équilibrage après les builds malins
**Prompt optimisé** (game designer) : corriger Lames dominantes, Puissance inutile contre les cafards, builds d'économie et
Feu faibles ; vérifier au simulateur puis en parties avec le robot malin ; publier.
**Réalisé** : pièces : si les bonus pèsent plus que les malus, on réduit les bonus (au lieu de tripler des malus d'Élan) ;
`parLames` 0,0375 ; robot malin : la compensation passe avant la spécialité. Simulateur : builds spécialisés de 31 à 60 %.

## 2026-11-28 — Économie, rythme, Multi-lancer mythique, pistes 3D
**Prompt optimisé** (game designer + DA technique) : trèfle doré moins rentable ; Nid nettement dégressif (≈ +0,5 cafard
pour un légendaire à haut niveau) ; 3 vies par duel perdu en fin de partie et 2 lancers au lieu de 3 à partir de l'étape 8 ;
Multi-lancer limité à 1 achat, rareté mythique très rare (Chance), très cher ; recherche pour une 3D plus détaillée.
**Réalisé** : doré ×4 → ×2 ; Nid = n jusqu'à 5 puis 5 + 5·ln(1+(n−5)/5) ; 2 vies dès l'étape 6, 3 dès l'étape 10 ; étapes
courtes (2 lancers) dès l'étape 8 ; Multi-lancer mythique 220 💰, 1 achat, ~6 % des boutiques (17 % avec Chance 8) ;
recommandation 3D : Blender (module Python dans le cloud) + glTF + HDRI Poly Haven, pas Unity (installation bloquée, à autoriser).

## 2026-11-28 — Installer Blender et commencer la 3D des toupies
**Prompt optimisé** (artiste technique 3D + dev Three.js) : installer Blender (`bpy`) dans le cloud, créer une chaîne
reproductible (script Blender → `.glb` → chargement dans le jeu avec repli), commencer par les pièces standard.
**Réalisé** : `bpy` 5.3 installé ; `outils/blender/toupies.py` (pièces par révolution de profils mécaniques : bille d'acier,
gorges, jonc serti, vis de fixation, crans de prise) ; `assets/modeles/` (3 modèles, 60-100 Ko) ; GLTFLoader (MIT) ;
matériaux du jeu appliqués par rôle ; anti-cache ; licences notées.

## 2026-11-28 — 3D : toutes les pièces et le lanceur
**Prompt optimisé** (artiste technique 3D + dev Three.js) : étendre la chaîne Blender à toutes les formes de pièces de toupie
et au lanceur, en gardant dimensions, logique mécanique, détails de niveau et repli.
**Réalisé** : 15 nouvelles fonctions Blender (pointes clou/foreuse à filet hélicoïdal/diamant serti/bille en cage/ventouse ;
bases lourde à masselottes/légère à rayons/gyro à pivots/noyau de météorite cerclé ; couronnes large vissée/dents/bouclier
nervuré/lames/volant d'inertie ; boîtier de lanceur cranté) ; branchement générique par forme ; ressorts à spires jointives.

## 2026-11-28 — 3D : âmes et rendu
**Prompt optimisé** (artiste technique 3D + rendu Three.js) : modéliser les 9 âmes (symbole lisible, lueur de niveau gardée)
et améliorer le rendu (halo moins envahissant, reflets de studio, matériaux plus fins) sans perdre en fluidité.
**Réalisé** : 9 âmes Blender (socle vissé ; œil à pupille fendue, aimant à pôles, ressort, flamme torsadée, sangsue annelée,
cyclone, fer à clous, carapace à écailles) ; matériaux vernis ; bandes de lumière de studio ; halo et éclairage de l'atelier adoucis.

## 2026-11-28 — Barre retirée, textures, base au trésor
**Prompt optimisé** (artiste 3D) : retirer la barre blanche (repère de rotation) ; faire apparaître les textures sur les pièces ;
redessiner le noyau de météorite et créer une vraie base au trésor (pièces de monnaie, bijoux, joyaux), symétriques et jolies.
**Réalisé** : repère supprimé ; coordonnées de texture cylindriques générées au chargement (motifs tourné, moleté… visibles) ;
noyau : roche facettée sertie de 4 griffes dans une coupelle ; trésor (forme `tresor`) : 8 piles de pièces, rubis, saphirs,
émeraudes, collier de 24 perles (symétrie d'ordre 8), matériaux de pierres et de perle.

## 2026-11-28 — Base au trésor : Équilibre au lieu de Poids
**Prompt optimisé** (game designer) : remplacer le malus de Poids de la Base au trésor par un malus d'Équilibre (même valeur),
cohérent avec son modèle chargé d'or et de joyaux (règle 5).
**Réalisé** : `poids: -4` → `equilibre: -4`, description mise à jour ; test d'équilibrage OK.

## 2026-11-28 — 3D : lanceur et cafards
**Prompt optimisé** (artiste technique 3D + dev Three.js) : modéliser le pied et le manche du lanceur (roues dentées calculées
gardées) et des cafards détaillés (espèces, marche et dorés conservés), sans perdre en fluidité.
**Réalisé** : modèles `lanceur-pied` (socle, jonc doré, colonne, collier) et `lanceur-manche` (75 mm, 6 bagues, butée) ;
`cafard` en pièces unité (abdomen annelé, tête à mandibules, pronotum à rebord, patte articulée épineuse en miroir).

## 2026-11-28 — 3D : décor et terrains
**Prompt optimisé** (artiste 3D + level designer) : habiller le bureau d'objets modélisés et rendre chaque terrain lisible et
mécaniquement crédible (ressorts du rebondissant, colle du collant, pente de la cuve), sans perdre en fluidité.
**Réalisé** : décor (tasse, pot à crayons, cahier, règle, écrous) et table en bois ; bandes rebondissantes à ressorts ;
coulures de colle ; pente de cuve au bois continu ; bug corrigé : le rôle « or » était trouvé dans « corps » (tout était doré).

## 2026-11-28 — 3D : boîtes mystère et éclairage HDRI
**Prompt optimisé** (artiste 3D + rendu) : détailler la boîte mystère (sans perdre ses faces illustrées ni son animation) et
passer à un vrai éclairage HDRI de studio (Poly Haven, CC0), avec repli et sans perte de fluidité.
**Réalisé** : quincaillerie Blender (coins rivetés, charnières sur l'axe du couvercle, fermoir) ; HDRI « Studio Small 09 » 1k
+ RGBELoader (MIT) ; exposition ajustée ; hôte dl.polyhaven.org autorisé dans l'environnement cloud ; licences notées.
