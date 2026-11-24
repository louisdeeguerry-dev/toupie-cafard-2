# Analyse de « Toupie contre Cafards » (jeu 1)

> Relevé le 2026-11-24 sur `toupie-cafards/toupie-cafards.github.io` (128 commits, du 2 octobre au 24 novembre 2026,
> dernière version `2026-11-24.3`). But : savoir précisément ce qui existe, comment on a avancé,
> et ce qu'on réutilise ou fait autrement pour Toupie Cafard 2.

---

## 1. Le jeu en bref

On lance une toupie sur un bureau pour écraser des insectes qui tombent du ciel.
- **Vagues à objectif** : X insectes en 5 lancers. Si on échoue, le bureau est envahi, on perd la partie et on repart de zéro.
- **Entre deux vagues** : on choisit un bonus parmi 3, façon roguelike. On les perd en cas de défaite.
- **Atelier** : améliorations achetées avec l'argent de la partie, en 3 arbres (Toupie, Lanceur, Bureau).
- **Carton à Jouets** : boutique permanente, payée en 🌊 (1 par vague repoussée). Ce qu'on y achète est gardé même après une défaite.
- **Mutations** : les insectes passent par plusieurs stades (cafards → mutants → araignées), avec 20 espèces.
- **Fin du jeu** : on paie 1 milliard pour trouver le nid, puis on affronte la **Reine du Nid**. Ce boss se joue avec des défis façon jeu de rythme (cercles numérotés, glissades, tourbillons, œufs). Ensuite viennent le générique et le mode sans fin (vagues spéciales et chefs après la vague 47).
- **À côté** : speedrun, défi du jour (le même bureau pour tout le monde), classements, podiums 3D sur le bureau, défis entre amis, succès, insectes dorés.

### Chiffres clés
| Élément | Quantité |
|---|---|
| Espèces d'insectes | 20 (+ la Reine, + les chefs) |
| Améliorations d'atelier | 29, en 3 arbres |
| Bonus de partie | 20 |
| Objets du Carton à Jouets | 13 |
| Skins (toupie + lanceur, pièce par pièce) | ~250, et 111 évolutions de toupie nommées |
| Langues | 4 (fr, en, es, de) |
| Plateformes | Web (GitHub Pages), Android/iOS (Capacitor), Steam (démo Windows Electron), CrazyGames |

---

## 2. Comment on a avancé (chronologie)

| Période | Commits | Ce qui a été fait |
|---|---|---|
| **2–5 oct** | ~70 | **Tout le cœur du jeu en 4 jours** : prototype, roguelike, vagues, atelier, Carton, la pièce 3D autour du bureau, mutations, sons, succès, sauvegarde et code de transfert, classement Firebase, Reine du Nid et ses défis de rythme, speedrun, générique, 12 évolutions du lanceur, 111 évolutions de toupie, catalogue de ~250 skins |
| **7–15 oct** | 7 | Tutoriel du premier lancer (montré à l'écran), cinématique du nid, **équilibrage par un « robot joueur parfait »**, puis recalage d'après de vrais joueurs |
| **19 oct** | 1 | **Applications Android et iPhone** (Capacitor), construites automatiquement par GitHub Actions |
| **6–8 nov** | 11 | **Diffusion** : pourboire Tipeee, retrait du mode Carnage, 4 langues, image d'aperçu au partage, **version CrazyGames** (SDK), kit presse, nouvelle adresse (avec reprise de la sauvegarde), défis entre amis, compteur anonyme de joueurs et page Confidentialité |
| **9–14 nov** | 10 | **Finition** : musique lo-fi générée par le code, icônes dessinées, intro raccourcie, atelier en arbre, défi du jour, vrais sons (Kenney CC0), rendu filmique du bureau, menu simplifié |
| **18–24 nov** | 22 | **Steam** : outils de captures et de capsules, démo Steam (Electron), outil de tournage de bandes-annonces, mains 3D et cinématique d'intro, vagues spéciales et chefs, podiums, filtre des pseudos, **fluidité ×7** et rendu HDR, sauvegarde fiabilisée |

**Rythme** : un très gros démarrage (le jeu complet en une semaine), puis une longue phase d'équilibrage, de
portage, de diffusion et de finition. Environ 45 % des commits concernent l'après-cœur du jeu (plateformes,
communication, finition).

---

## 3. Architecture technique

| Point | Comment c'est fait |
|---|---|
| Structure | **Un seul fichier `index.html`** de 11 549 lignes (700 Ko), avec un seul script module, environ 490 fonctions et un état global partagé. Organisé en ~40 sections commentées (voir la carte §3.1) |
| Moteur | Three.js copié dans `vendor/` (importmap, sans étape de build) |
| 3D | **Tout est construit dans le code** à partir de formes simples : la pièce, le bureau, les insectes, les toupies, la Reine, les podiums. Seules les mains sont un modèle `.glb` (WebXR generic-hand, MIT) |
| Performance | Les géométries sont fusionnées (`BufferGeometryUtils`) et les pattes animées dans le shader, d'où la fluidité ×7. Graphismes qui s'adaptent tout seuls (HDR, halo, vignette, résolution en paliers) |
| Son | Synthèse WebAudio (musique lo-fi générée à la volée), plus des échantillons Kenney CC0 |
| Textes | `i18n.js` (1 040 lignes, 4 langues), nombres formatés selon la langue, plus un outil de détection des textes non traduits |
| En ligne | Firebase Realtime Database appelée directement (REST, sans SDK), avec authentification anonyme. Classements Histoire, Speedrun et Défi du jour, compteur anonyme. Règles de sécurité dans `firebase-regles.json` |
| Sauvegarde | localStorage (un seul onglet enregistre, copie de secours), code de sauvegarde à copier/coller, reprise depuis l'ancienne adresse |
| Mises à jour | `version.json` comparé à la version du jeu : prévient quand une nouvelle version est en ligne |
| Plateformes | Indicateurs `window.PLATFORM` (crazygames, steam) posés par les scripts de build ; liens externes masqués selon la plateforme |
| Tests | Liens de test `?test=nid / boss / riche / max / chef` (sauvegarde séparée, retirés du jeu en ligne), robot joueur parfait pour l'équilibrage |
| Outils | `tools/steam` (Chrome sans fenêtre : captures 1920×1080 et capsules), `tools/video` (tournage scripté plan par plan, son du jeu, montage ffmpeg), `scripts/` (builds web, Steam, CrazyGames) |

### 3.1 Carte du fichier `index.html` (n° de ligne → section)
986 Plateforme · 1013 Langues · 1067 Réglages du monde · 1085 Style icônes · 1343 Insectes · 1418 Améliorations ·
1517 Filtre des pseudos · 1571 Bonus de partie · 1598 Carton à Jouets · 1703 Sauvegarde · 1984 Scène 3D · 2221 La pièce ·
3309 Toupies · 3389 Catalogue des skins · 3670 Toupie pièce par pièce · 4377 Cafards · 4473 Fluidité · 4921 Graphismes ·
5279 Reine du Nid · 5735 Taches et effets · 5913 Textes flottants · 6443 Combat · 6907 Physique · 7052 Assaut du nid ·
7202 Défis de la Reine · 7637 Générique · 7940 Vagues, bonus, défaite · 8256 Menu et intro · 8692 Classement ·
8697 Soutien · 8856 Compteur anonyme · 8968 Podiums · 9363 Défi du jour · 9834 Mises à jour · 9863 Contrôles ·
10022 Cinématique du nid · 10324 Tutoriel · 10424 Interface · 11102 Boucle de jeu

---

## 4. Ce qu'on peut réutiliser tel quel pour Toupie Cafard 2
- **Backend** : Firebase (classements, compteur, règles de sécurité), authentification anonyme, filtre des pseudos.
- **Système de langues** et les 4 traductions existantes, avec l'outil de vérification.
- **Chaîne de publication** : scripts de build web, Steam et CrazyGames, projet Capacitor, workflow Android.
- **Outils de communication** : générateur de capsules Steam, outil de tournage de bandes-annonces, kit presse.
- **Assets** : sons Kenney, mains 3D, icônes et visuels de marque.
- **Techniques** : fusion des géométries et pattes animées dans le shader, graphismes adaptatifs, détection des mises à jour, sauvegarde robuste, défi du jour, robot d'équilibrage.

## 5. Ce qu'il faudra faire autrement (le jeu 2 sera beaucoup plus gros)
1. **Découper le code en modules** (un fichier par système : physique, insectes, atelier, interface…).
   Le fichier unique de 11 500 lignes est déjà à la limite de ce qui reste maintenable. Il faudra probablement
   un outil de build léger ([vitejs/vite](https://github.com/vitejs/vite)) pour regrouper les modules, avec rechargement instantané pendant le développement.
2. **Séparer les données du code** : insectes, améliorations, bonus, skins et vagues dans des fichiers de données.
   On pourra alors équilibrer et ajouter du contenu sans toucher au moteur.
3. **Tests automatiques** : faire du robot joueur parfait et des liens `?test=` de vrais tests qui tournent tout seuls,
   pour ne pas casser l'équilibrage à chaque ajout.
4. **Pipeline d'assets** : si le jeu 2 utilise de vrais modèles 3D (Blender, packs CC0), prévoir dès le début
   la compression des modèles (glTF-Transform / KTX2) pour garder un jeu léger sur mobile.
5. **Lien entre les deux jeux** (à décider avec le concept) : par exemple reprendre la sauvegarde ou le pseudo
   du jeu 1 pour offrir un bonus, ou garder le même compte pour les classements.
