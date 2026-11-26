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
| 🪑 Bureau (économie) | Nid, Prime, Trèfle doré, Combo, Appât, Bords trampolines, Tirelire | améliorables en partie **et donnés ou retirés par certaines pièces** |

Les **âmes** donnent les pouvoirs du jeu 1 : Flamme → Traînée de feu, Sangsue → Second souffle, Orage → Éclairs,
Cyclone → Tourbillon, Aimant → Agressivité, Œil de lynx → Précision + Critique, Ressort → Rebond.
L'âme Carapace annule le premier gros choc en duel.

### 4.1 bis — Toutes les stats sont exploitables
Chaque stat, économie comprise, est le **bonus d'au moins une pièce**, ce que vérifie un test automatique. On peut donc construire
des decks très différents : critique, feu, combo, toupie lourde, toupie rapide… et aussi des **toupies d'économie**,
qui sacrifient des stats de combat pour gagner plus d'argent par cafard :
- Base tirelire : Prime +5, mais Poids et Inertie en baisse ;
- Base au trésor : Trèfle, Prime et Combo, mais Lames et Endurance en baisse ;
- Couronne de pièces d'or, Âme avare, Âme trèfle, Âme de miel (Appât + Nid), Couronne à chaîne et Âme de meute (Combo).

Le catalogue compte **56 pièces** (dont 20 ajoutées pour l'économie et la spécialisation), toutes équilibrées.

### 4.2 Équilibrage des pièces (règle d'or, vérifiée par `tests/equilibre.mjs`)
- **Chaque pièce a autant de bonus que de malus** : la somme de ses niveaux vaut 0. Un niveau de Multi-lancer compte pour 10.
  Une pièce rare ou légendaire n'est donc **pas plus forte**, elle est **plus spécialisée** ou donne un pouvoir.
- **Formules symétriques** : −5 niveaux divisent une stat autant que +5 la multiplient. Un malus ne pèse jamais plus lourd que le bonus équivalent.
- Si les malus des pièces choisies s'additionnent trop (moins de 4 s de rotation), l'atelier affiche une alerte.

### 4.3 Doublons = niveaux de pièce
- Avoir **N exemplaires** d'une pièce débloque ses niveaux **1 à N** (5 au maximum). On choisit le niveau à l'atelier.
- Au niveau k, **tous les bonus ET tous les malus** sont multipliés par 1 + 0,5 × (k − 1) : ×1,5 au niveau 2, ×2 au niveau 3…
  La pièce est plus extrême, pas meilleure. Exemple avec la pointe clou :

  | Niveau | Élan | Balade | Tombe sous | Rotation |
  |---|---|---|---|---|
  | Pointe standard | 95 cm/s | 44 cm/s | 25 % | 11,6 s |
  | Clou niv 1 | 152 cm/s | 98 cm/s | 37 % | 5,7 s |
  | Clou niv 2 | 181 cm/s | 142 cm/s | 43 % | 4,0 s |
  | Clou niv 3 | 209 cm/s | 175 cm/s | 49 % | 3,1 s |

### 4.4 Le lanceur : engrenage + ressort
Deux emplacements de plus à l'atelier, avec des pièces tirées des mêmes boîtes mystère :
- **Engrenage** → vitesse de rotation (Puissance, en tr/min) ;
- **Ressort** → élan (vitesse de lancer).

Ils se partagent la place dans le lanceur : **un ressort plus fort donne plus d'élan mais moins de rotation, et inversement.**
Engrenages : fin (précision ↑, rotation ↓), grand (rotation ↑↑, élan ↓↓), turbo, double (2 toupies par lancer, chacune plus faible).
Ressorts : souple (rotation ↑, élan ↓), renforcé (élan ↑↑, rotation ↓↓), catapulte.

### 4.5 Terrains de duel
- **Contre les cafards, le bureau est toujours neutre.**
- En duel, on peut avoir choisi un **terrain** à l'atelier, si on l'a trouvé.
- **Les terrains se trouvent dans les boîtes mystère** : ce sont des **lots légendaires**, tous avec **la même chance**,
  et **jamais en double** (une fois trouvé, le terrain est à toi).
  - 🤸 **Bords rebondissants** : les bords relancent les toupies ;
  - 🍯 **Bords collants** : les bords engluent, la toupie perd sa vitesse et de la rotation ;
  - 🥣 **Cuve** : le plateau est creusé, les toupies glissent vers le centre et se percutent sans arrêt.
- **Le coût : l'argent de départ.** Sans terrain, on commence la partie avec 8 💰 ; avec un terrain, on commence à 0 💰.
  L'exemple donné était de 50 $ contre 0 ; les montants sont à équilibrer.
- **Si les deux duellistes ont un terrain**, c'est la **priorité de terrain** qui décide :
  - ce sont des points achetés dans la boutique **à partir de la 3e manche**, et seulement si on a choisi un terrain ;
  - le joueur qui a **le plus de points impose son terrain**, et **à égalité, le bureau est neutre** (validé) ;
  - si les deux ont le même terrain, il n'y a pas de conflit ;
  - **les points sont secrets** : on ne voit pas ceux de l'adversaire. La règle est expliquée à l'atelier et dans la boutique.
- Au début du duel, un bandeau annonce le terrain et à qui il appartient.

### 4.6 Raretés et boîte mystère
**Contenu d'une boîte** :
1. On tire une rareté : commune 55 %, rare 30 %, épique 12 %, légendaire 3 %.
2. Commune, rare, épique : une pièce de cette rareté. Les doublons débloquent un niveau de pièce.
3. **Légendaire** : la moitié du temps un **terrain de duel** (tant qu'il en reste à trouver, même chance pour chacun).
   Sinon, un autre lot légendaire : une **pièce légendaire** (base, couronne, pointe, âme, engrenage ou ressort) ou un **coffre d'écrous** (+300 🔩).
4. **Garantie : la 30e boîte d'affilée sans lot légendaire est forcément légendaire.** Un compteur est affiché à l'atelier.

Simulation : un joueur trouve son premier terrain en environ 30 boîtes (médiane) et les trois en environ 110.
 **[proposition]**
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
- **Le plateau est ROND**, contre les cafards comme en duel. Le lanceur glisse sur un arc en bas du plateau ; celui de l'adversaire est en haut.
- **Une étape = 3 LANCERS contre les cafards, puis 1 duel contre un joueur** (précisé par Louis le 25/11).
  Chaque lancer est une manche, avec la boutique entre chaque manche.
- **Avant chaque lancer, le bureau est rempli jusqu'à sa capacité** (10 cafards + Nid). Les survivants restent, avec leurs
  blessures, et on complète avec de nouveaux cafards. C'est tout l'intérêt du Nid : plus de cafards sur le bureau à chaque lancer.

### 6.0 L'évolution des cafards (anti-« je farme puis j'explose tout le monde »)
- **10 cafards sur le bureau** à chaque lancer (+ le Nid).
- **Après chaque duel contre un joueur, les cafards évoluent** (version adoucie du 25/11) :
  - le bureau est vidé et rempli de cafards évolués ;
  - leur vie est multipliée par 1,12 à chaque étape, avec une hausse de 3 % par lancer ;
  - **de nouvelles espèces arrivent**. Chaque espèce est contrée par des stats précises :

  | Étape | Nouvelle espèce | Particularité | Contrée par |
  |---|---|---|---|
  | 1 | 🪳 Cafard | — | — |
  | 2 | 🐛 Gros cafard | Vie ×2,2, lourd : repousse les toupies légères | Poids, Lames |
  | 3 | 🛡️ Cafard blindé | Carapace : chaque coup perd une partie de ses dégâts | Lames, Coup critique |
  | 3 | 💨 Cafard coureur | Très rapide, fuit la toupie | Diamètre, Agressivité, Tourbillon |
  | 4 | 🕷️ Araignée | Tisse des toiles qui engluent la toupie | Poids, Élan, Traînée de feu (brûle les toiles) |
  | 5 | 🥚 Pondeuse | Pond des larves tant qu'elle vit | Éclairs, Feu, Endurance |

- Les cafards évolués **rapportent plus** (+20 % par étape) : investir dans sa toupie reste rentable.
- La boutique montre la **prochaine vague** (nombre, vie, espèces) et annonce l'évolution avec les stats qui contrent
  chaque nouvelle espèce. Les choix sont donc stratégiques : il faut préparer sa toupie pour la suite.
- **Pourquoi ça bloque l'abus** : celui qui ne fait que de l'économie gagne plus au début, mais sa toupie ne tue plus
  rien une fois les cafards évolués, donc il ne gagne plus rien, et les dégâts des duels montent à chaque étape.
  Les multiplicateurs d'argent sont modérés, les prix montent de plus en plus vite (impossible de tout acheter
  d'un coup) et les bots se renforcent à chaque manche.
- **Mesures de l'ancienne version** (avant le passage à 3 lancers par étape ; 25/11, `tests/lancer-strategies.sh 5 3` : 5 parties par stratégie, robot qui vise comme un bon joueur, 8 joueurs) :

  | Stratégie | Places | Place moy. | Top 4 | Vagues réussies (étapes 1 / 2 / 3 / 4+) | Duels gagnés |
  |---|---|---|---|---|---|
  | Sacrifice (économie + duels perdus exprès aux étapes 1-2) | 2, 2, 3, 5, 5 | 3,4 | 3/5 | 100 / 7 / 0 / 0 % | 14/21 |
  | Économie d'abord | 1, 2, 3, 4, 7 | 3,4 | 4/5 | 67 / 7 / 7 / 0 % | 12/19 |
  | Mixte | 1, 2, 3, 3, 5 | 2,8 | 4/5 | 93 / 27 / 7 / 0 % | 20/22 |
  | Puissance | 2, 3, 3, 3, 3 | 2,8 | 5/5 | 100 / 73 / 7 / 3 % | 19/22 |

  **Lecture** :
  - L'abus « farmer puis tout acheter » **ne gagne plus**, mais il n'est que **modérément puni** (3,4 contre 2,8 de place moyenne).
  - Toutes les stratégies **réussissent presque aucune vague à partir de l'étape 3** : la fin de partie est trop dure.
  - Le robot gagne près de 90 % de ses duels contre les bots : **les bots sont trop faibles en duel**,
    donc le classement dépend surtout des duels simulés entre bots.
  - 5 parties par stratégie, cela reste peu : les écarts de moins d'une place sont dans le bruit.

### 6.1 Manches contre les cafards (un lancer)
- **Un seul lancer par manche.** Le lancer se termine quand la toupie s'arrête, ou quand il n'y a plus de cafards.
- Chaque cafard écrasé rapporte de l'argent (💰). Le combo, les cafards dorés et l'espèce multiplient le gain.
- **Il n'y a plus d'objectif** : on gagne de l'argent pour chaque cafard écrasé, et les vies ne se perdent qu'en duel.
- Les cafards blessés affichent une **barre de vie**. Comme ils survivent d'un lancer à l'autre, on peut les achever au lancer suivant.

### 6.2 Duels
- Ma toupie part du bas du bureau, celle de l'adversaire du haut.
- **Les toupies n'ont pas de vie** : chaque choc fait perdre de la rotation (tr/min), et **la première qui s'arrête a perdu**.
  Plus l'attaquant a de Lames, de vitesse et de poids, plus il ralentit l'autre ; l'Inertie de la cible réduit la perte.
  Une **barre de rotation** s'affiche au-dessus de chaque toupie.
- **Réglé pour des chocs nombreux ET décisifs** :
  - les toupies s'attirent légèrement et le rebond est amorti ;
  - la perte par choc se compte en tr/min absolus et dépend de la charge de l'attaquant : la Puissance compte, et celui qui fonce fait plus mal ;
  - l'usure naturelle est fortement réduite en duel ;
  - **l'usure ne démarre que quand les deux toupies sont lancées**. Avant, l'ordre de lancer décidait du duel :
    le testeur compétitif n'en gagnait que 3 sur 40 à toupies égales.
  - Mesures : **12,8 contacts et 13 s en moyenne** ; à toupies identiques, **7 victoires sur 12**, donc équitable.
    Les réglages sont dans l'objet `CHOC` de `src/physics.js`.
- **Sensations** (retours du testeur game feel) :
  - impacts visibles : étincelles, arrêt sur image et secousse proportionnels au choc, perte affichée en % ;
  - caméra rapprochée pendant le duel ;
  - barres d'énergie en % qui clignotent sous 25 % ;
  - ronronnement de la toupie qui faiblit avec sa rotation ;
  - coup final au ralenti, puis bandeau **VICTOIRE / K.O.** avant le bilan.
- Le perdant perd 1 vie (5 vies = 5 défaites possibles). **Un duel ne rapporte et ne coûte pas d'argent.**
- Au bout de 30 s, la toupie qui tourne le plus fort gagne.
- Les autres joueurs s'affrontent entre eux pendant ce temps. Entre bots, le duel est simulé selon leur toupie, leur habileté et le hasard.

### 6.2 bis Les bots (simulent de vrais joueurs)
- Chaque bot a une **toupie de pièces tirées au hasard**, avec les mêmes chances de rareté que les boîtes et parfois des niveaux de pièce 2 ou 3.
  Il a aussi parfois un terrain.
- Chaque bot a une **habileté** (de 0,2 à 0,95, la plupart moyens) et un **style d'achat** : économe, bagarreur, équilibré ou spécialiste.
- Pendant tes lancers, **ils jouent les leurs**. Leur argent dépend de leur toupie, de leur habileté et de la résistance des cafards,
  et ils **achètent vraiment** dans la boutique, aux mêmes prix que toi.
- En duel contre toi, leur visée et leur puissance dépendent de leur habileté. Les meilleurs touchent parfois PARFAIT.

### 6.2 ter Multi-lancer
- C'est une bonne idée, mais il était trop fort. **Il est maintenant très cher** : 60 💰 puis 110 💰 dans la boutique.
  L'engrenage double a de gros malus (Puissance −8, Élan −6).
- **Chaque toupie lancée en plus est plus faible** : −30 % de rotation par toupie supplémentaire.
  Comme les chocs sont maintenant comptés en tr/min absolus, ce malus joue vraiment.

### 6.2 quater Boutique à offres (validée par Louis, épurée le 25/11)
- À chaque manche, **6 améliorations tirées au hasard**, au moins une du bureau et une de la toupie. On choisit au lieu de tout cocher.
- **Affichage épuré** : 6 grandes cartes (icône, nom, valeur actuelle → après, prix). À côté : l'argent, les intérêts prévus,
  la relance et « Prêt ». Une seule ligne résume la manche et annonce la suivante.
- **Un achat = un paquet de +3 niveaux** : un effet bien visible (un achat de Diamètre fait 9,2 → 11,4 cm) et moins de clics.
  Il coûte 15 % de moins que 3 achats séparés. Le Multi-lancer et la Priorité de terrain s'achètent un par un.
- **La relance coûte de plus en plus cher** dans une même boutique (2, 3, 5, 7, 10 💰…), puis revient à 2 💰 à la manche suivante.
- L'offre achetée disparaît de la boutique.
- Les améliorations qui contrent les espèces du prochain lancer sont marquées **« conseillé »**.
- Le **prochain adversaire** est annoncé avec ses pièces ; on ne l'affronte jamais deux fois de suite.
- Réglage : `BOUTIQUE` dans `src/config.js` (`offres: 0` pour tout afficher).

### 6.3 Économie : capitaliser ou se renforcer
Entre chaque manche (chaque lancer), la boutique propose trois groupes :
- **🪑 Bureau (capitalisation)** : Nid, Prime, Trèfle doré, Combo, Tirelire. Les Bords trampolines et l'Appât ont été retirés :
  les bords sont un choix de terrain, pas une amélioration de partie ;
- **🌀 Toupie** et **🚀 Lanceur** (puissance) : +1 niveau dans une stat.

**Intérêts et Tirelire** : à la fin de chaque manche (chaque lancer et chaque duel), on reçoit +1 💰 par tranche de 5 💰
qu'on n'a pas dépensés, avec un plafond de 3 💰. La **Tirelire** relève ce plafond. Garder de l'argent rapporte donc,
mais c'est autant de puissance en moins tout de suite. Les intérêts prévus s'affichent dans la boutique.
Revenu fixe de 2 💰 par manche, plus ces **intérêts** : +1 💰 par tranche de 5 💰 gardés, plafonné par la Tirelire
(comme dans les auto-battlers). Prime de base : 1,5 💰 par cafard. **Les centimes sont conservés**, ce qui rend la Prime vraiment utile. **Le dilemme** : tout miser sur l'argent fait une toupie trop faible pour les cafards et les
duels ; tout miser sur la toupie fait manquer d'argent plus tard.

### 6.4 Le lanceur
1. Le lanceur **suit la souris** le long du bord bas du bureau.
2. On **clique** : le lanceur se fige.
3. Tant qu'on **reste appuyé**, on oriente la direction de la toupie. La jauge de puissance oscille, avec une zone
   **PARFAIT** au sommet qui donne +8 % de puissance. Ce dernier point est une **[proposition]** reprise du jeu 1.
4. On **relâche** : la toupie part.

Au doigt, le lanceur vient se placer sous le doigt quand on touche l'écran.

## 7. Ce que fait le prototype (dans ce dépôt)
- ✅ Atelier : toupie (4 emplacements) + lanceur (engrenage, ressort), 34 pièces équilibrées, niveaux de pièce par doublons, terrains de duel avec priorité secrète ;, **les 18 stats du jeu 1 affichées** avec l'aperçu au survol, toupie 3D qui change selon les pièces
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
