# Toupie Cafard 2 — concept (game design v0.1)

> Rédigé le 2026-11-24 à partir de la description de Louis. Les propositions du prototype v0.1 ont été **validées**
> (vague ratée sans perte de vie, dégâts de duel = numéro de l'étape, un lancer par duel, pièces choisies avant la partie).
> Les parties encore marquées **[proposition]** sont à valider. Questions ouvertes en fin de document.

## 1. En une phrase
Un **jeu de toupies en ligne en joueur contre joueur, façon auto-battler** (genre Teamfight Tactics) : on alterne
3 vagues de cafards et 1 duel contre un autre joueur. On construit sa toupie pièce par pièce, comme un deck,
à partir de pièces trouvées dans des **boîtes mystère**.

**Références** : Teamfight Tactics (le déroulement d'une partie à 8) et **SPAM** (Ticroco Entreprise, sorti le
7 octobre 2026 sur Steam : un deck-builder en 1 contre 1 au tour par tour). De SPAM, on garde seulement
**le côté gacha** (ouvrir des boîtes au contenu aléatoire) et **le deck-building** (composer sa toupie avant de jouer).

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

**Validé : la toupie est choisie AVANT la partie et reste verrouillée jusqu'à la fin.** On ne change jamais de pièce en
cours de partie. La boutique de partie ne vend que des niveaux de stats et des améliorations du bureau.

### 4.1 Les stats : toutes celles de Toupie contre Cafards
On reprend **toutes les stats du jeu 1**, avec les mêmes noms et les mêmes formules, recalées pour des parties courtes.
Elles sont **toutes affichées** avec leur valeur réelle : à l'atelier (avec l'aperçu de chaque pièce), en partie
(bouton 📊) et dans la boutique (valeur actuelle → valeur après l'achat).
Les pièces donnent des niveaux (+ ou −), et la boutique de partie en ajoute.

| Groupe | Stat | Affichage (exemple de base) |
|---|---|---|
| 🌀 Toupie | 🔋 Endurance | 11,6 s de rotation |
| | 📏 Diamètre | 8,0 cm |
| | 🪨 Poids | 20 g |
| | ⛸️ Glisse (ex-« Pointe » du jeu 1) | balade 44 cm/s |
| | ⚔️ Lames | ×1,00 dégâts |
| | 🛞 Inertie | perte de rotation au choc |
| | ⚖️ Équilibre | tombe sous 25 % |
| | 🏓 Rebond | 60 % conservé |
| | 😠 Agressivité *(pouvoir)* | attraction vers les cibles |
| | 💥 Coup critique *(pouvoir)* | % de chance, coups ×3 |
| | 🔥 Traînée de feu *(pouvoir)* | brûlure par seconde, durée |
| | 🌬️ Second souffle *(pouvoir)* | rotation rendue par cafard |
| | ⚡ Éclairs en chaîne *(pouvoir)* | chance, dégâts, rebonds |
| | 🌪️ Tourbillon *(pouvoir)* | rayon d'aspiration |
| 🚀 Lanceur | 🚀 Puissance | 600 tr/min (la « vie » en duel) |
| | 💨 Élan | 95 cm/s |
| | 🎯 Précision | zone PARFAIT de 10 % |
| | 🌀 Multi-lancer *(pouvoir)* | 1 toupie par lancer |
| 🪑 Bureau *(boutique de partie)* | Nid, Prime, Trèfle doré, Combo, Appât, Bords trampolines (+ Tirelire) | économie de la partie |

Les **âmes** donnent les pouvoirs du jeu 1 : Flamme → Traînée de feu, Sangsue → Second souffle, Orage → Éclairs,
Cyclone → Tourbillon, Aimant → Agressivité, Œil de lynx → Précision + Critique, Ressort → Rebond.
L'âme Carapace annule le premier gros choc en duel.

### 4.2 Raretés et boîte mystère **[proposition]**
- Commune 55 %, rare 30 %, épique 12 %, légendaire 3 %.
- La boîte ressemble à un **carton de jouet de supermarché** : on la touche, elle s'ouvre et révèle une pièce.
- **Premier lancement** : la toupie de base (4 pièces standard) et **1 boîte offerte**.
- On obtient des boîtes en montant de niveau, en gagnant une partie, ou en les achetant avec la monnaie (100 🔩).
- Les doublons sont gardés pour l'instant. Piste : les recycler pour améliorer une pièce.

## 5. Après la partie : progression **[proposition pour les montants]**
- **Deux modes** : **partie normale** (s'entraîner, tester une toupie) et **partie classée** (le rang monte ou descend).
- **Récompenses selon la place**, de la 1re à la 8e :
  - 🔩 Écrous (la monnaie) : 100 → 20 ;
  - ⭐ XP : 200 → 70. Chaque niveau de joueur offre une boîte mystère ;
  - la 1re place donne une boîte en plus.
- **Rang** (parties classées) : +40, +30, +20, +10, −10, −20, −30, −40 points selon la place.
  Paliers : 📦 Carton → 🪵 Bois → 🥉 Bronze → 🥈 Argent → 🥇 Or → 💠 Platine → 💎 Diamant → 👑 Maître de la Toupie.

## 6. Une partie
- **Matchmaking** : 8 joueurs. Tant qu'il n'y a pas assez de vrais joueurs (et pendant toute la phase de test),
  le salon est **complété par des bots**.
- **5 vies** par joueur.
- **Cycle** : 3 manches contre les cafards, puis 1 duel contre un joueur, et on recommence.
  Une étape = un cycle de 4 manches.

### 6.1 Manches contre les cafards
- Les cafards tombent du ciel sur le bureau.
- On a **3 lancers** pour en écraser un nombre donné (objectif).
- Chaque cafard rapporte de l'argent (💰), et atteindre l'objectif donne une prime.
- **[proposition]** Rater l'objectif ne coûte **pas de vie**, seulement la prime : les vies se perdent en duel.

### 6.2 Duels
- Ma toupie part du bas du bureau, celle de l'adversaire du haut. **La première qui tombe a perdu.**
- **[proposition]** Le perdant perd autant de vies que le numéro de l'étape : 1 à l'étape 1, 2 à l'étape 2, etc.
  Les parties se resserrent ainsi vite. Simulation : environ 6 étapes (24 manches) pour départager 8 joueurs.
- Au bout de 30 s, la toupie qui tourne le plus fort gagne.
- Pendant ce temps, les autres joueurs s'affrontent entre eux. Pour les bots, le résultat est simulé selon la puissance de leur toupie.

### 6.3 Économie : capitaliser ou se renforcer
Entre chaque manche, une boutique propose deux branches :
- **🪑 Bureau (capitalisation)** : Nid de cafards (+2 cafards par vague), Cafards dodus (+25 % de 💰 par cafard),
  Tirelire (intérêts plus hauts), Cafard doré (cafards à ×5).
- **🌀 Toupie (puissance)** : +1 dans une des 5 stats.

Revenu fixe de 2 💰 par manche, plus des **intérêts** : +1 💰 par tranche de 10 💰 gardés, plafonné (comme dans
les auto-battlers). **Le dilemme** : tout miser sur l'argent fait une toupie trop faible pour les cafards et les
duels ; tout miser sur la toupie fait manquer d'argent plus tard.

### 6.4 Le lanceur
1. Le lanceur **suit la souris** le long du bord bas du bureau.
2. On **clique** : le lanceur se fige.
3. Tant qu'on **reste appuyé**, on oriente la direction de la toupie. La jauge de puissance oscille, avec une zone
   **PARFAIT** au sommet qui donne +8 % de puissance. Ce dernier point est une **[proposition]** reprise du jeu 1.
4. On **relâche** : la toupie part.

Au doigt, le lanceur vient se placer sous le doigt quand on touche l'écran.

## 7. Ce que fait le prototype (dans ce dépôt)
- ✅ Atelier : 4 emplacements, 25 pièces (5 bases, 6 couronnes, 5 pointes, 9 âmes), **les 18 stats du jeu 1 affichées** avec l'aperçu au survol, toupie 3D qui change selon les pièces
- ✅ Pouvoirs du jeu 1 en jeu : critique, traînée de feu, second souffle, éclairs en chaîne, tourbillon, agressivité, multi-lancer, bords trampolines, combo, appât, trèfle doré
- ✅ Parties normales et classées, écrous, XP et niveaux, rang, achat de boîtes
- ✅ Boîte mystère animée, tirage par rareté, collection sauvegardée
- ✅ Matchmaking simulé (salon de 8 complété par des bots)
- ✅ Cycle 3 vagues + 1 duel, 5 vies, dégâts croissants, éliminations, classement final, boîtes gagnées
- ✅ Lanceur : déplacement le long du bord, clic pour figer, appui pour viser, jauge PARFAIT
- ✅ Physique : stats → vitesse, rotation, usure, équilibre (chute et instabilité), poids (chocs), passifs
- ✅ Boutique entre les manches (bureau / toupie / lanceur) avec intérêts, et la valeur avant → après chaque achat
- ✅ Bots adverses en duel (visée sur ta toupie) et duels simulés entre bots
- ✅ Ordinateur et téléphone, sons Kenney (CC0) repris du jeu 1
- ❌ Pas encore : vrai multijoueur en ligne, comptes, classement, traductions, tutoriel, équilibrage fin

## 8. Questions ouvertes (à trancher ensemble)
1. ~~« Spam, le jeu de cartes »~~ → **réglé** : SPAM (Ticroco), dont on garde le gacha et le deck-building.
2. ~~Rater une vague coûte-t-il une vie ?~~ → **validé** : non, seulement la prime.
3. ~~Changer de pièces pendant la partie ?~~ → **validé** : **jamais**, la toupie est verrouillée.
4. ~~Durée d'une partie~~ → **validé** : environ 20 minutes (dégâts de duel = numéro de l'étape).
5. ~~Duel en un lancer~~ → **validé**.
6. **Lien avec le jeu 1** : reprendre le pseudo ou la sauvegarde du jeu 1 pour offrir une boîte ? Même compte de classement ?
7. **Doublons** des boîtes mystère : recyclage en écrous, fusion pour améliorer une pièce, ou autre ?
8. **Multijoueur réel** : temps réel (les deux toupies lancées en même temps, il faut un serveur comme Colyseus ou Nakama)
   ou asynchrone (on affronte l'enregistrement de la toupie et de l'équipe d'un autre joueur, plus simple et sans serveur de jeu) ?
9. **Montants de progression** (écrous, XP, points de rang, prix des boîtes) : à équilibrer.
10. **Rang de saison** : remise à zéro périodique (saisons) ?
