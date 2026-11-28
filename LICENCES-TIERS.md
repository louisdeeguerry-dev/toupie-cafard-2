# Code et assets tiers embarqués

| Fichier(s) | Origine | Licence |
|---|---|---|
| `vendor/three.module.js` | [Three.js](https://github.com/mrdoob/three.js) r160 (copié depuis le jeu 1) | MIT |
| `vendor/mqtt.min.js` | [MQTT.js](https://github.com/mqttjs/MQTT.js) 5.10.1 (relais du défi entre amis via des serveurs MQTT publics : EMQX, HiveMQ, Mosquitto) | MIT |
| `vendor/peerjs.min.js` | [PeerJS](https://github.com/peers/peerjs) 1.5.4 (connexion directe entre deux navigateurs, défi entre amis) ; serveur public de mise en relation 0.peerjs.com | MIT |
| `vendor/jsm/` | Post-traitement de Three.js r160 (EffectComposer, UnrealBloomPass, OutputPass…), paquet npm `three@0.160.0` | MIT |
| `sons/*.wav`, `sons/*.mp3` | Packs [Kenney](https://kenney.nl) (Impact, Interface, RPG Audio, Digital Audio), copiés depuis le jeu 1 — voir `sons/LICENCE.txt` | CC0 (domaine public) |

Tout le reste (code, modèles 3D construits en code, textures dessinées en code) est original.
| `vendor/jsm/loaders/GLTFLoader.js`, `BufferGeometryUtils.js` | [Three.js](https://github.com/mrdoob/three.js) r160 (copiés depuis le jeu 1) | MIT |
| `assets/modeles/*.glb` | Modèles créés pour le jeu avec Blender (`outils/blender/toupies.py`) ; Blender ([bpy](https://pypi.org/project/bpy/)) est un outil GPL, les modèles produits nous appartiennent | — |
| `vendor/jsm/loaders/RGBELoader.js` | [Three.js](https://github.com/mrdoob/three.js) r160 (paquet npm `three@0.160.0`) | MIT |
| `assets/hdri/studio_small_09_1k.hdr` | HDRI « Studio Small 09 », [Poly Haven](https://polyhaven.com/a/studio_small_09) | CC0 |
