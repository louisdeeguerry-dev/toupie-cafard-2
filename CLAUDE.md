# Règles du projet (à appliquer à CHAQUE échange)

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
