# Toupie Cafard 2 — concept (game design v0.1)

> Rédigé le 2026-11-24 à partir de la description de Louis. Les parties marquées **[proposition]** sont des choix
> faits pour le prototype : à valider ou à changer. Les questions ouvertes sont listées en fin de document.

## 1. En une phrase
Un **jeu de toupies en ligne en joueur contre joueur, façon auto-battler** (genre Teamfight Tactics) : on alterne
3 vagues de cafards et 1 duel contre un autre joueur. On construit sa toupie pièce par pièce, comme un deck,
à partir de pièces trouvées dans des **boîtes mystère**.

## 2. Lien avec le jeu 1
Même univers : le bureau en bois, les cafards, la toupie, le lanceur, l'argent qu'on gagne en écrasant des cafards,
le choix entre « améliorer le bureau » et « améliorer la toupie ». Le jeu 1 est solo et sans fin ;
le jeu 2 est **compétitif, en parties courtes, avec un salon de 8 joueurs**.

## 3. La boucle de jeu

```
Atelier (hors partie)                       Partie (8 joueurs, 5 vies chacun)
┌──────────────────────────┐                ┌───────────────────────────────────────────┐
│ Ouvrir des boîtes        │                │ Étape 1 : 🪳 🪳 🪳 ⚔️                       │
│ mystère → nouvelles      │   JOUER ▶      │ Étape 2 : 🪳 🪳 🪳 ⚔️   (dégâts des duels ↑) │
│ pièces                   │ ─────────────► │ …                                         │
│ Assembler sa toupie      │  matchmaking   │ Entre chaque manche : boutique            │
│ (4 emplacements)         │ (+ bots)       │ (bureau = économie / toupie = puissance)  │
└──────────────────────────┘                └─────────────────┬─────────────────────────┘
            ▲                                                 │ fin : classement 1er → 8e
            └──────────────── boîtes mystère gagnées ◄────────┘
```

## 4. La toupie : 4 pièces
| Emplacement | Rôle | Exemples |
|---|---|---|
| **Base** | Le centre de la toupie : poids, tenue | Base en plomb (lourde, lente), Base alu (légère, rapide), Base gyroscope (très stable) |
| **Couronne** | Ce qui fait le tour et **frappe** les cafards et les autres toupies | Couronne dentée (attaque ↑, endurance ↓), Couronne à lames (attaque ↑↑, équilibre ↓) |
| **Pointe** | Ce qui touche le plateau | **Pointe clou** : vitesse ↑↑, équilibre ↓↓ · **Pointe foreuse** : équilibre ↑↑, vitesse ↓ et endurance ↓ |
| **Âme** | Un signe sur le dessus de la toupie, qui donne un **passif** | Flamme (+50 % de dégâts à grande vitesse), Aimant, Ressort, Sangsue, Carapace |

**Règle d'or : chaque pièce a des avantages ET des inconvénients.** Pas de pièce strictement meilleure :
on construit selon son style de jeu, comme un deck.

### 4.1 Les 5 stats **[proposition]**
| Stat | Effet en jeu |
|---|---|
| ⚔️ Attaque | Dégâts sur les cafards et sur la rotation de la toupie adverse |
| 💨 Vitesse | Vitesse de lancer et de déplacement |
| 🔋 Endurance | Rotation de départ et lenteur de l'usure : combien de temps elle tourne |
| ⚖️ Équilibre | Résistance aux chocs ; une toupie instable perd beaucoup de rotation quand on la frappe, et tombe plus tôt |
| 🪨 Poids | Moins repoussée dans les collisions |

Chaque stat vaut 5 de base. Les pièces ajoutent ou retirent des points (−4 à +5), et les améliorations achetées en partie en ajoutent encore.

### 4.2 Raretés et boîte mystère **[proposition]**
- Commune 55 %, rare 30 %, épique 12 %, légendaire 3 %.
- La boîte ressemble à un **carton de jouet de supermarché** : on la touche, elle s'ouvre et révèle une pièce.
- **Premier lancement** : la toupie de base (4 pièces standard) et **1 boîte offerte**.
- **Fin de partie** : 1re place = 3 boîtes, 2e–4e = 2 boîtes, 5e–8e = 1 boîte.
- Les doublons sont gardés pour l'instant. Piste : les recycler pour améliorer une pièce.

## 5. Une partie
- **Matchmaking** : 8 joueurs. Tant qu'il n'y a pas assez de vrais joueurs (et pendant toute la phase de test),
  le salon est **complété par des bots**.
- **5 vies** par joueur.
- **Cycle** : 3 manches contre les cafards, puis 1 duel contre un joueur, et on recommence.
  Une étape = un cycle de 4 manches.

### 5.1 Manches contre les cafards
- Les cafards tombent du ciel sur le bureau.
- On a **3 lancers** pour en écraser un nombre donné (objectif).
- Chaque cafard rapporte de l'argent (💰), et atteindre l'objectif donne une prime.
- **[proposition]** Rater l'objectif ne coûte **pas de vie**, seulement la prime : les vies se perdent en duel.

### 5.2 Duels
- Ma toupie part du bas du bureau, celle de l'adversaire du haut. **La première qui tombe a perdu.**
- **[proposition]** Le perdant perd autant de vies que le numéro de l'étape : 1 à l'étape 1, 2 à l'étape 2, etc.
  Les parties se resserrent ainsi vite. Simulation : environ 6 étapes (24 manches) pour départager 8 joueurs.
- Au bout de 30 s, la toupie qui tourne le plus fort gagne.
- Pendant ce temps, les autres joueurs s'affrontent entre eux. Pour les bots, le résultat est simulé selon la puissance de leur toupie.

### 5.3 Économie : capitaliser ou se renforcer
Entre chaque manche, une boutique propose deux branches :
- **🪑 Bureau (capitalisation)** : Nid de cafards (+2 cafards par vague), Cafards dodus (+25 % de 💰 par cafard),
  Tirelire (intérêts plus hauts), Cafard doré (cafards à ×5).
- **🌀 Toupie (puissance)** : +1 dans une des 5 stats.

Revenu fixe de 2 💰 par manche, plus des **intérêts** : +1 💰 par tranche de 10 💰 gardés, plafonné (comme dans
les auto-battlers). **Le dilemme** : tout miser sur l'argent fait une toupie trop faible pour les cafards et les
duels ; tout miser sur la toupie fait manquer d'argent plus tard.

### 5.4 Le lanceur
1. Le lanceur **suit la souris** le long du bord bas du bureau.
2. On **clique** : le lanceur se fige.
3. Tant qu'on **reste appuyé**, on oriente la direction de la toupie. La jauge de puissance oscille, avec une zone
   **PARFAIT** au sommet qui donne +8 % de puissance. Ce dernier point est une **[proposition]** reprise du jeu 1.
4. On **relâche** : la toupie part.

Au doigt, le lanceur vient se placer sous le doigt quand on touche l'écran.

## 6. Ce que fait le prototype v0.1 (dans ce dépôt)
- ✅ Atelier : 4 emplacements, 21 pièces (5 bases, 5 couronnes, 5 pointes, 6 âmes), stats et aperçu au survol, toupie 3D qui change selon les pièces
- ✅ Boîte mystère animée, tirage par rareté, collection sauvegardée
- ✅ Matchmaking simulé (salon de 8 complété par des bots)
- ✅ Cycle 3 vagues + 1 duel, 5 vies, dégâts croissants, éliminations, classement final, boîtes gagnées
- ✅ Lanceur : déplacement le long du bord, clic pour figer, appui pour viser, jauge PARFAIT
- ✅ Physique : stats → vitesse, rotation, usure, équilibre (chute et instabilité), poids (chocs), passifs
- ✅ Boutique entre les manches (bureau / toupie) avec intérêts
- ✅ Bots adverses en duel (visée sur ta toupie) et duels simulés entre bots
- ✅ Ordinateur et téléphone, sons Kenney (CC0) repris du jeu 1
- ❌ Pas encore : vrai multijoueur en ligne, comptes, classement, traductions, tutoriel, équilibrage fin

## 7. Questions ouvertes (à trancher ensemble)
1. **« Spam, le jeu de cartes »** : de quel jeu s'agit-il exactement ? *Slay the Spire* (deck-builder) ? *Marvel Snap* ?
   Ça change la façon de construire la toupie, par exemple un « deck » de plusieurs pièces de rechange pendant la partie.
2. **Rater une vague de cafards** doit-il coûter une vie, ou seulement de l'argent (choix actuel) ?
3. **Change-t-on de pièces pendant la partie** (boutique de pièces, comme les champions d'un auto-battler), ou seulement avant (choix actuel) ?
4. **Durée visée d'une partie** : environ 20 minutes aujourd'hui pour le vainqueur. Plus court ?
5. **Duel** : un seul lancer chacun (actuel) ou plusieurs manches de lancers ?
6. **Lien avec le jeu 1** : reprendre le pseudo ou la sauvegarde du jeu 1 pour offrir une boîte ? Même compte de classement ?
7. **Doublons** des boîtes mystère : recyclage, fusion pour améliorer une pièce, ou monnaie ?
8. **Multijoueur réel** : temps réel (les deux toupies lancées en même temps, il faut un serveur comme Colyseus ou Nakama)
   ou asynchrone (on affronte l'enregistrement de la toupie et de l'équipe d'un autre joueur, plus simple et sans serveur de jeu) ?
