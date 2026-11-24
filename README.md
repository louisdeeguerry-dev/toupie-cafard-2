# Toupie Cafard 2

Suite de « Toupie contre Cafards » : un jeu de toupies en joueur contre joueur, façon auto-battler.
On alterne 3 vagues de cafards et 1 duel, avec 5 vies. On fabrique sa toupie pièce par pièce
(base, couronne, pointe, âme) grâce aux boîtes mystère.

## Jouer au prototype
- En ligne : https://louisdeeguerry-dev.github.io/toupie-cafard-2/ (si GitHub Pages est activé)
- En local, depuis ce dossier :
  ```
  python3 -m http.server 8000
  ```
  puis ouvrir http://localhost:8000

Pas d'installation ni d'étape de build : modules JavaScript natifs + Three.js dans `vendor/`.

## Organisation
| Chemin | Contenu |
|---|---|
| `index.html` | Page, interface et styles |
| `src/config.js` | Tous les réglages d'équilibrage (vies, cycle, vagues, économie) |
| `src/data/pieces.js` | Catalogue des pièces de toupie, raretés, tirage des boîtes mystère |
| `src/data/boutique.js` | Améliorations de la boutique, noms des bots |
| `src/stats.js` | Stats de la toupie → grandeurs physiques |
| `src/physics.js` | Toupies : mouvement, rebonds, chocs avec les cafards et entre toupies |
| `src/bugs.js` | Cafards |
| `src/launcher.js` | Lanceur (suivre, figer, viser, lancer) |
| `src/match.js` | Déroulement d'une partie (salon, manches, duels, économie, éliminations) |
| `src/topMesh.js` | Modèle 3D de la toupie selon ses pièces |
| `src/scene.js`, `src/fx.js`, `src/audio.js`, `src/ui.js`, `src/save.js`, `src/main.js` | Rendu, effets, sons, interface, sauvegarde, démarrage |
| `docs/CONCEPT.md` | Game design (concept, règles, questions ouvertes) |
| `docs/ANALYSE-TOUPIE-1.md` | Analyse du jeu 1 |
| `CLAUDE.md`, `PROMPTS.md`, `RESSOURCES.md` | Règles de travail, journal des prompts, catalogue de ressources |

## Tests
Dans la console du navigateur : `__tc2.acceleration = 4` accélère le jeu, `__tc2.reset()` efface la progression.
