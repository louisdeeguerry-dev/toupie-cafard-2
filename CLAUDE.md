# Toupie Cafard 2 — règles du projet (à appliquer à CHAQUE échange)

Projet : **Toupie Cafard 2**, suite du jeu « Toupie contre Cafards »
(dépôt d'origine : `toupie-cafards/toupie-cafards.github.io`, à consulter pour réutiliser code et assets).

## Règle 0 — Démarrage de chaque session : tout avoir sous la main
- Le hook `.claude/hooks/recuperer-depots.sh` (lancé automatiquement au démarrage) clone ou met à jour,
  à côté de ce projet, tous les dépôts liés : jeu 1 (`../toupie-cafards.github.io`), `../voxel-sword`,
  `../toupie-cafards-ancienne-adresse`, `../github-dashboard`. Lecture seule : on ne pousse jamais dedans.
- Si le hook signale un dépôt « non récupéré » (souvent `github-dashboard`, qui est privé) :
  le rattacher immédiatement avec l'outil `add_repo` (accès `read`), le cloner à l'emplacement indiqué
  par l'outil, sans demander à l'utilisateur.
- Lire `docs/ANALYSE-TOUPIE-1.md` pour connaître le jeu 1 (systèmes, architecture, réutilisable),
  et la mettre à jour si le jeu 1 a reçu de nouveaux commits depuis la date du relevé.

## Règle 0 bis — Le jeu publié reste à jour
- Le jeu est publié sur GitHub Pages depuis la branche `gh-pages` : https://louisdeeguerry-dev.github.io/toupie-cafard-2/
- Après chaque `git push origin main` qui touche le jeu, pousser aussi `git push origin main:gh-pages`
  (sinon la version en ligne reste l'ancienne).

## Règle 1 — Prompt optimisé avant chaque traitement
À chaque message de l'utilisateur concernant ce projet :
1. **Reformuler** d'abord la demande sous forme de *prompt optimisé*, affiché en tête de réponse
   dans un bloc intitulé `### 🎯 Prompt optimisé`. Le prompt doit :
   - préciser le **rôle** attendu (ex. dev gameplay Three.js, artiste 3D, chargé de com),
   - énoncer l'**objectif** et le **contexte** (projet, contraintes, fichiers concernés),
   - lister les **livrables** attendus et les **critères de réussite**,
   - corriger les ambiguïtés de la dictée vocale (transcription orale → texte clair),
   - rester fidèle à l'intention : ne rien inventer que l'utilisateur n'a pas demandé.
2. **Ajouter** ce prompt au journal `PROMPTS.md` (date, prompt optimisé, résumé de ce qui a été fait).
3. **Traiter** ensuite la demande en suivant ce prompt optimisé.

## Règle 2 — S'appuyer sur des ressources externes
- Avant de coder, modéliser ou produire de la communication, consulter `RESSOURCES.md`
  (dépôts GitHub, assets, outils) et privilégier une solution existante et éprouvée
  plutôt que tout réécrire.
- Chercher activement de **nouveaux** dépôts / assets pertinents (dev de jeux vidéo,
  modélisation 3D, communication / marketing) et les **ajouter** à `RESSOURCES.md`
  après avoir vérifié qu'ils existent et que leur licence permet l'usage prévu.
- Vérifier systématiquement la licence (MIT, Apache, CC0, CC-BY…) avant d'intégrer un asset
  ou du code, et la noter dans un fichier `LICENCES-TIERS.md` si on l'embarque.

## Règle 3 — Ne jamais rien supprimer de l'existant
- Conserver tous les dépôts GitHub existants de l'utilisateur et tout leur contenu
  (voir section « Dépôts existants » de `RESSOURCES.md`). On **ajoute**, on ne retire pas.
- Les listes de ressources ne font que s'enrichir : ne jamais retirer une entrée,
  la marquer `(obsolète)` si besoin.

## Contexte technique de l'utilisateur (déduit des projets existants)
- Jeux web en **Three.js** (modules ES, GLTFLoader, modèles `.glb`), HTML/JS sans framework lourd.
- Portage mobile via **Capacitor** (Android / iOS), desktop via **Electron + Steam** (SteamPipe),
  publication web (GitHub Pages, CrazyGames).
- Internationalisation maison (`i18n.js`), kit presse (captures, bande-annonce, logo).
- Langue de travail : **français**.
