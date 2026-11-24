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
