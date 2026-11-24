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
