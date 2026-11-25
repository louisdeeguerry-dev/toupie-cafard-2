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
