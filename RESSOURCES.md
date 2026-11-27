# Catalogue de ressources

> Liste vivante : on **ajoute**, on ne supprime jamais (marquer `(obsolète)` si besoin).
> Existence des dépôts vérifiée le 2026-11-24. Toujours relire la licence avant intégration.
> ⭐ = recommandé en priorité pour la stack actuelle (Three.js + Capacitor + Electron/Steam).

---

## 0. Dépôts existants de l'utilisateur (à conserver tels quels)

> Récupérés automatiquement à chaque session à côté du projet (voir `CLAUDE.md`, règle 0).
> Analyse détaillée du jeu 1 : `docs/ANALYSE-TOUPIE-1.md`.

| Dépôt | Contenu |
|---|---|
| `toupie-cafards/toupie-cafards.github.io` | Jeu principal « Toupie contre Cafards » : Three.js, Capacitor (Android/iOS), build Steam & CrazyGames, kit presse, i18n |
| `louisdeeguerry-dev/toupie-cafards` | Ancienne adresse (page de redirection « a déménagé ») |
| `louisdeeguerry-dev/voxel-sword` | Prototype « Voxel Sword » |
| `louisdeeguerry-dev/github-dashboard` | Tableau de bord (privé) des stats de dépôts GitHub : étoiles, forks, abonnés, issues/PR, rafraîchi toutes les heures. Node ≥ 20 sans dépendance, source GitHub REST + secours ecosyste.ms, tests `node --test`. Réutilisable pour suivre la popularité de Toupie Cafard 2 (réglage `REPOS`). |

Briques déjà utilisées dans ces projets : `three.module.js`, `GLTFLoader.js`, `BufferGeometryUtils.js`,
Capacitor 8 (app, haptics, splash-screen, status-bar, assets), Electron + SteamPipe.

### 0.1 Inventaire des assets réutilisables (relevé le 2026-11-24, dernier commit `9775e38`)

Source : `toupie-cafards/toupie-cafards.github.io`. Les fichiers restent à leur place d'origine ;
on les copiera dans Toupie Cafard 2 au moment où on en aura besoin, avec leur licence.

| Dossier | Contenu | Licence |
|---|---|---|
| `sons/` (30 fichiers, 328 Ko) | Bruitages : écrasement (normal/gros), toc, pièces, achat, chute, critique, choix, refus, éclairs, évolution | CC0 — packs Kenney (Impact, Interface, RPG Audio, Digital Audio) |
| `modeles/` | `main-gauche.glb`, `main-droite.glb` (mains « generic-hand ») | MIT — [immersive-web/webxr-input-profiles](https://github.com/immersive-web/webxr-input-profiles) |
| `vendor/` | `three.module.js`, `GLTFLoader.js`, `BufferGeometryUtils.js` | MIT (Three.js) |
| `app-assets/` + `assets/` | Icônes (192 → 1024, maskable), splash, image de partage | créations de l'utilisateur |
| `presse/` (17 Mo) | Logo 1024, captures carré/paysage/portrait, bande-annonce, vidéo verticale, page presse | créations de l'utilisateur |
| `tools/steam/` | Génération automatique des capsules Steam et captures via Chrome (CDP) | code de l'utilisateur |
| `tools/video/` | Tournage automatique de bandes-annonces à partir de plans scriptés (`films.mjs`, `tourner.mjs`) | code de l'utilisateur |
| `tools/i18n/`, `tools/main/` | Vérification des textes non traduits, banc de test des mains | code de l'utilisateur |
| `scripts/` | Builds web, Steam, CrazyGames, compteur | code de l'utilisateur |
| `i18n.js`, `mains.js`, `steam-app/`, `android/`, `ios/` | Traductions, logique des mains, appli Steam Electron, projets mobiles | code de l'utilisateur |

Source : `louisdeeguerry-dev/voxel-sword` — prototype en un seul `index.html`, utilise Three.js 0.160
et [jwagner/simplex-noise.js](https://github.com/jwagner/simplex-noise.js) (bruit pour génération de terrain, MIT).

---

## 1. Développement de jeux vidéo

### 1.1 Moteurs & frameworks web 3D
- ⭐ [mrdoob/three.js](https://github.com/mrdoob/three.js) — moteur actuel (MIT)
- [pmndrs/react-three-fiber](https://github.com/pmndrs/react-three-fiber) + [pmndrs/drei](https://github.com/pmndrs/drei) — Three.js en React, si le projet grossit
- [BabylonJS/Babylon.js](https://github.com/BabylonJS/Babylon.js) — moteur 3D web complet (éditeur, physique, XR)
- [playcanvas/engine](https://github.com/playcanvas/engine) — moteur WebGL/WebGPU très optimisé mobile
- [yandeu/enable3d](https://github.com/yandeu/enable3d) — Three.js + physique Ammo prêts à l'emploi
- ⭐ [vitejs/vite](https://github.com/vitejs/vite) — outil de build léger : code découpé en modules, rechargement instantané (piste pour sortir du fichier unique du jeu 1)

### 1.2 Moteurs & frameworks web 2D / jeux légers
- [phaserjs/phaser](https://github.com/phaserjs/phaser) · exemples : [phaserjs/examples](https://github.com/phaserjs/examples)
- [pixijs/pixijs](https://github.com/pixijs/pixijs) — rendu 2D ultra-rapide
- [kaplayjs/kaplay](https://github.com/kaplayjs/kaplay) — jeux 2D rapides à prototyper (ex-Kaboom)
- [KilledByAPixel/LittleJS](https://github.com/KilledByAPixel/LittleJS) — micro-moteur, idéal game jams
- [excaliburjs/Excalibur](https://github.com/excaliburjs/Excalibur) · [melonjs/melonJS](https://github.com/melonjs/melonJS)

### 1.3 Moteurs natifs (si besoin hors navigateur)
- [godotengine/godot](https://github.com/godotengine/godot) — export web/mobile/desktop, open source
- [bevyengine/bevy](https://github.com/bevyengine/bevy) (Rust) · [raysan5/raylib](https://github.com/raysan5/raylib) (C)
- [defold/defold](https://github.com/defold/defold) · [stride3d/stride](https://github.com/stride3d/stride) · [o3de/o3de](https://github.com/o3de/o3de)

### 1.4 Physique, collisions, IA de déplacement
- ⭐ [dimforge/rapier.js](https://github.com/dimforge/rapier.js) — physique WASM rapide et déterministe
- [pmndrs/cannon-es](https://github.com/pmndrs/cannon-es) — physique JS simple
- [kripken/ammo.js](https://github.com/kripken/ammo.js) — Bullet en WASM
- [liabru/matter-js](https://github.com/liabru/matter-js) — physique 2D
- ⭐ [gkjohnson/three-mesh-bvh](https://github.com/gkjohnson/three-mesh-bvh) — raycast/collisions ultra-rapides sur maillages
- [gkjohnson/three-bvh-csg](https://github.com/gkjohnson/three-bvh-csg) — opérations booléennes (découpe, trous)
- [isaac-mason/recast-navigation-js](https://github.com/isaac-mason/recast-navigation-js) — navmesh pour ennemis (Recast en WASM)
- [donmccurdy/three-pathfinding](https://github.com/donmccurdy/three-pathfinding) · [recastnavigation/recastnavigation](https://github.com/recastnavigation/recastnavigation)
- [mxgmn/WaveFunctionCollapse](https://github.com/mxgmn/WaveFunctionCollapse) — génération procédurale de niveaux

### 1.5 Rendu, effets, UI 3D
- ⭐ [pmndrs/postprocessing](https://github.com/pmndrs/postprocessing) — bloom, DOF, vignette…
- [N8python/n8ao](https://github.com/N8python/n8ao) — occlusion ambiante de qualité
- [0beqz/realism-effects](https://github.com/0beqz/realism-effects) — SSGI, réflexions, TRAA
- [FarazzShaikh/THREE-CustomShaderMaterial](https://github.com/FarazzShaikh/THREE-CustomShaderMaterial) — étendre les matériaux standards avec ses shaders
- [gkjohnson/three-gpu-pathtracer](https://github.com/gkjohnson/three-gpu-pathtracer) — rendus photoréalistes (visuels promo)
- [protectwise/troika](https://github.com/protectwise/troika) — texte 3D net (troika-three-text)
- [felixmariotto/three-mesh-ui](https://github.com/felixmariotto/three-mesh-ui) · [pmndrs/uikit](https://github.com/pmndrs/uikit) — interfaces dans la scène 3D
- [mkkellogg/GaussianSplats3D](https://github.com/mkkellogg/GaussianSplats3D) · [sparkjsdev/spark](https://github.com/sparkjsdev/spark) — Gaussian splats dans Three.js

### 1.6 Audio
- ⭐ [goldfire/howler.js](https://github.com/goldfire/howler.js) — lecture audio fiable mobile/desktop
- [Tonejs/Tone.js](https://github.com/Tonejs/Tone.js) — musique procédurale / synthé
- [KilledByAPixel/ZzFX](https://github.com/KilledByAPixel/ZzFX) · [grumdrig/jsfxr](https://github.com/grumdrig/jsfxr) — génération de bruitages rétro

### 1.7 Debug, réglages, état
- [mrdoob/stats.js](https://github.com/mrdoob/stats.js) — FPS
- ⭐ [georgealways/lil-gui](https://github.com/georgealways/lil-gui) — panneau de réglages (successeur de [dataarts/dat.gui](https://github.com/dataarts/dat.gui))
- [pmndrs/leva](https://github.com/pmndrs/leva) — panneau de réglages (React)
- [pmndrs/zustand](https://github.com/pmndrs/zustand) — gestion d'état minimaliste

### 1.8 Multijoueur & backend
- [colyseus/colyseus](https://github.com/colyseus/colyseus) — serveur multijoueur Node avec salons
- [geckosio/geckos.io](https://github.com/geckosio/geckos.io) — UDP/WebRTC temps réel
- [socketio/socket.io](https://github.com/socketio/socket.io) — temps réel simple
- [heroiclabs/nakama](https://github.com/heroiclabs/nakama) — comptes, classements, matchmaking, chat

### 1.9 Publication multi-plateforme
- ⭐ [ionic-team/capacitor](https://github.com/ionic-team/capacitor) — mobile (déjà utilisé)
- ⭐ [electron/electron](https://github.com/electron/electron) — desktop/Steam (déjà utilisé)
- ⭐ [ceifa/steamworks.js](https://github.com/ceifa/steamworks.js) — succès, cloud saves, overlay Steam (moderne)
- [greenheartgames/greenworks](https://github.com/greenheartgames/greenworks) — alternative historique Steamworks
- [tauri-apps/tauri](https://github.com/tauri-apps/tauri) — desktop plus léger qu'Electron
- SDK portails web : CrazyGames SDK (docs.crazygames.com), Poki SDK (sdk.poki.com)

### 1.10 Listes de référence (à fouiller régulièrement)
- [ellisonleao/magictools](https://github.com/ellisonleao/magictools) — immense liste de ressources gamedev
- [Kavex/GameDev-Resources](https://github.com/Kavex/GameDev-Resources)
- [mbrukman/awesome-gamedev](https://github.com/mbrukman/awesome-gamedev) · [Calinou/awesome-gamedev](https://github.com/Calinou/awesome-gamedev)
- [AxiomeCG/awesome-threejs](https://github.com/AxiomeCG/awesome-threejs)
- [terkelg/awesome-creative-coding](https://github.com/terkelg/awesome-creative-coding)

---

### Multijoueur en temps réel (ajouté le 27/11)
- **PeerJS** : https://github.com/peers/peerjs (MIT). WebRTC simplifié, avec un serveur de mise en relation public et gratuit (0.peerjs.com). **Utilisé** pour « Défier un ami » (`vendor/peerjs.min.js`).
- **PeerServer** : https://github.com/peers/peerjs-server (MIT). Pour héberger notre propre serveur de mise en relation si le serveur public ne suffit plus.

## 2. Modélisation 3D & assets graphiques

### 2.1 Logiciels de création
- ⭐ [blender/blender](https://github.com/blender/blender) — modélisation, animation, rendu · exporteur [KhronosGroup/glTF-Blender-IO](https://github.com/KhronosGroup/glTF-Blender-IO)
- [agmmnn/awesome-blender](https://github.com/agmmnn/awesome-blender) — add-ons et ressources Blender
- [ephtracy/ephtracy.github.io](https://github.com/ephtracy/ephtracy.github.io) — MagicaVoxel (idéal pour Voxel Sword)
- [mikelovesrobots/mmmm](https://github.com/mikelovesrobots/mmmm) — modèles voxel MagicaVoxel gratuits
- [armory3d/armorpaint](https://github.com/armory3d/armorpaint) — peinture de textures PBR sur modèle 3D
- [RodZill4/material-maker](https://github.com/RodZill4/material-maker) — matériaux procéduraux (type Substance Designer)
- [aseprite/aseprite](https://github.com/aseprite/aseprite) · [LibreSprite/LibreSprite](https://github.com/LibreSprite/LibreSprite) · [Orama-Interactive/Pixelorama](https://github.com/Orama-Interactive/Pixelorama) — pixel art
- [mapeditor/tiled](https://github.com/mapeditor/tiled) · [deepnight/ldtk](https://github.com/deepnight/ldtk) — éditeurs de niveaux 2D
- [FreeCAD/FreeCAD](https://github.com/FreeCAD/FreeCAD) — modélisation technique · [Ultimaker/Cura](https://github.com/Ultimaker/Cura) — impression 3D (goodies)

### 2.2 Pipeline glTF / optimisation (poids des jeux web & mobile)
- ⭐ [donmccurdy/glTF-Transform](https://github.com/donmccurdy/glTF-Transform) — compresser/optimiser les `.glb` en une commande
- [zeux/meshoptimizer](https://github.com/zeux/meshoptimizer) — compression maillage (gltfpack)
- [google/draco](https://github.com/google/draco) — compression géométrie
- [BinomialLLC/basis_universal](https://github.com/BinomialLLC/basis_universal) · [KhronosGroup/KTX-Software](https://github.com/KhronosGroup/KTX-Software) — textures GPU compressées (KTX2)
- [CesiumGS/gltf-pipeline](https://github.com/CesiumGS/gltf-pipeline)
- [pmndrs/gltfjsx](https://github.com/pmndrs/gltfjsx) — glb → composants React
- [KhronosGroup/glTF-Sample-Assets](https://github.com/KhronosGroup/glTF-Sample-Assets) — modèles de test

### 2.3 Génération 3D par IA (prototypage rapide — vérifier les licences !)
- [microsoft/TRELLIS](https://github.com/microsoft/TRELLIS) — image/texte → 3D de haute qualité
- [Tencent-Hunyuan/Hunyuan3D-2](https://github.com/Tencent-Hunyuan/Hunyuan3D-2) — image → 3D texturé
- [Stability-AI/stable-fast-3d](https://github.com/Stability-AI/stable-fast-3d) · [VAST-AI-Research/TripoSR](https://github.com/VAST-AI-Research/TripoSR) · [TencentARC/InstantMesh](https://github.com/TencentARC/InstantMesh)
- [comfyanonymous/ComfyUI](https://github.com/comfyanonymous/ComfyUI) — pipelines d'images (concept art, textures)
- [graphdeco-inria/gaussian-splatting](https://github.com/graphdeco-inria/gaussian-splatting) · [playcanvas/supersplat](https://github.com/playcanvas/supersplat) — capture et édition de scènes réelles

### 2.4 Banques d'assets gratuites (sites)
| Site | Contenu | Licence |
|---|---|---|
| ⭐ kenney.nl | Milliers d'assets 2D/3D/audio cohérents | CC0 |
| ⭐ quaternius.com | Packs low-poly animés (personnages, armes, nature) | CC0 |
| polyhaven.com | HDRI, textures PBR, modèles | CC0 |
| ambientcg.com | Textures et matériaux PBR | CC0 |
| kaylousberg.itch.io (KayKit) | Packs low-poly stylisés | CC0 |
| poly.pizza | Modèles low-poly indexés | CC0 / CC-BY |
| sketchfab.com (filtre « Downloadable ») | Modèles variés | variable |
| mixamo.com | Rigging et animations de personnages | gratuit (compte Adobe) |
| opengameart.org | Sprites, modèles, musiques, sons | variable |
| itch.io/game-assets/free | Packs d'indés | variable |
| freesound.org | Bruitages | CC0 / CC-BY |
| sonniss.com (GDC bundle) | Gros packs de sons pro | libre de droits |
| fonts.google.com | Polices | OFL |
| game-icons.net | Icônes de jeu vectorielles | CC-BY |

---

## 3. Communication, marketing & communauté

### 3.1 Vidéo, bandes-annonces, captures
- ⭐ [obsproject/obs-studio](https://github.com/obsproject/obs-studio) — capture de gameplay / streaming
- [KDE/kdenlive](https://github.com/KDE/kdenlive) · [mltframework/shotcut](https://github.com/mltframework/shotcut) · [OpenShot/openshot-qt](https://github.com/OpenShot/openshot-qt) — montage
- [FFmpeg/FFmpeg](https://github.com/FFmpeg/FFmpeg) · builds : [BtbN/FFmpeg-Builds](https://github.com/BtbN/FFmpeg-Builds) — conversions (vertical TikTok/Shorts, GIF, compression)
- ⭐ [remotion-dev/remotion](https://github.com/remotion-dev/remotion) — vidéos promo générées en code (React)
- [motion-canvas/motion-canvas](https://github.com/motion-canvas/motion-canvas) — animations explicatives en code
- [microsoft/playwright](https://github.com/microsoft/playwright) · [puppeteer/puppeteer](https://github.com/puppeteer/puppeteer) — captures d'écran / vidéos automatiques du jeu web dans tous les formats stores
- [mattdesl/canvas-sketch](https://github.com/mattdesl/canvas-sketch) — visuels génératifs, export haute résolution

### 3.2 Design graphique & maquettes
- [penpot/penpot](https://github.com/penpot/penpot) — alternative open source à Figma (affiches, capsules Steam, UI)
- [excalidraw/excalidraw](https://github.com/excalidraw/excalidraw) — schémas, game design, storyboards

### 3.3 Site, presse, analytics
- [withastro/astro](https://github.com/withastro/astro) — site vitrine / devlog statique rapide (GitHub Pages)
- [umami-software/umami](https://github.com/umami-software/umami) · [plausible/analytics](https://github.com/plausible/analytics) — statistiques respectueuses de la vie privée
- [PostHog/posthog](https://github.com/PostHog/posthog) — analytics produit (funnels, rétention joueurs)
- [getsentry/sentry-javascript](https://github.com/getsentry/sentry-javascript) — remontée des plantages joueurs
- Kit presse : presskit() / dopresskit.com, impress.games

### 3.4 Communauté & localisation
- [discordjs/discord.js](https://github.com/discordjs/discord.js) · [Rapptz/discord.py](https://github.com/Rapptz/discord.py) — bots Discord (annonces de mises à jour, classements)
- [i18next/i18next](https://github.com/i18next/i18next) — internationalisation (si on dépasse le `i18n.js` maison)
- [crowdin/crowdin-cli](https://github.com/crowdin/crowdin-cli) — traductions communautaires

---

## 4. Idées à explorer plus tard
- Ajouter des succès Steam via steamworks.js dans les builds Electron.
- Pipeline automatique : `gltf-transform optimize` sur tous les `.glb` avant build.
- Générer automatiquement captures et vidéos verticales des stores avec Playwright + FFmpeg.
