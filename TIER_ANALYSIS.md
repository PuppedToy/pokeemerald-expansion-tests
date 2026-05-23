# LEGEND Tier Threshold Analysis

Bundle: `debug/run-58482498`

## AG (non-mega)

| Pokémon | Rating |
|---|---|
| Naganadel | 10.409 |
| Regieleki | 10.062 |
| Calyrex Shadow | 10.029 |
| Rayquaza | 9.994 |
| Necrozma Ultra | 9.938 |
| Palafin Hero | 9.918 |
| Iron Hands | 9.722 |
| Eternatus Eternamax | 9.696 |
| Zygarde Complete | 9.694 |
| Zygarde 50 Power Construct | 9.681 |
| Greninja Ash | 9.644 |

## AG (mega)

| Pokémon | Rating |
|---|---|
| Rayquaza Mega | 9.994 |
| Diancie Mega | 9.952 |
| Kangaskhan Mega | 9.908 |
| Mewtwo Mega Y | 9.693 |
| Kyogre Primal | 9.692 |
| Mewtwo Mega X | 9.691 |
| Sceptile Mega | 9.675 |
| Lucario Mega | 9.640 |
| Medicham Mega | 9.635 |

## UBERS (mega)

| Pokémon | Rating |
|---|---|
| Gengar Mega | 9.290 |
| Blaziken Mega | 9.290 |
| Latios Mega | 9.290 |
| Lopunny Mega | 9.208 |
| Tyranitar Mega | 9.180 |
| Salamence Mega | 9.158 |
| Groudon Primal | 9.088 |
| Pinsir Mega | 9.044 |
| Glalie Mega | 9.011 |

## LEGEND (non-mega)

| Pokémon | Rating |
|---|---|
| Flutter Mane | 9.564 |
| Kyogre | 9.438 |
| Pheromosa | 9.404 |
| Shaymin Sky | 9.392 |
| Zacian Crowned | 9.392 |
| Groudon | 9.391 |
| Giratina Altered | 9.391 |
| Zamazenta Crowned | 9.391 |
| Eternatus | 9.391 |
| Mewtwo | 9.390 |
| Lunala | 9.390 |
| Giratina Origin | 9.389 |
| Terapagos Stellar | 9.389 |
| Kyurem White | 9.388 |
| Necrozma Dawn Wings | 9.388 |
| Calyrex Ice | 9.388 |
| Iron Valiant | 9.388 |
| Palkia Origin | 9.387 |
| Necrozma Dusk Mane | 9.387 |
| Lugia | 9.386 |
| Kyurem Black | 9.386 |
| Xerneas Neutral | 9.386 |
| Solgaleo | 9.386 |
| Miraidon | 9.386 |
| Ho-Oh | 9.385 |
| Xerneas Active | 9.385 |
| Dialga Origin | 9.384 |
| Reshiram | 9.384 |
| Dialga | 9.383 |
| Zacian Hero | 9.383 |
| Palkia | 9.381 |
| Zekrom | 9.381 |
| Kyurem | 9.381 |
| Hoopa Unbound | 9.381 |
| Zamazenta Hero | 9.381 |
| Koraidon | 9.359 |
| Meloetta Pirouette | 9.349 |
| Roaring Moon | 9.332 |
| Kartana | 9.315 |

## UBERS (non-mega)

| Pokémon | Rating |
|---|---|
| Blacephalon | 9.300 |
| Iron Boulder | 9.262 |
| Darmanitan Galar Zen | 9.206 |
| Dragapult | 9.187 |
| Tapu Lele | 9.078 |
| Marshadow | 9.077 |
| Yanmega | 9.075 |
| Urshifu Single Strike | 9.050 |
| Chien Pao | 9.050 |
| Chi-Yu | 9.050 |
| Gouging Fire | 9.050 |
| Raging Bolt | 9.029 |
| Guzzlord | 9.015 |

## Notes

Thresholds as of this analysis: `TIER_LEGEND_THRESHOLD = 9.5`, `TIER_AG_THRESHOLD = 9.75`, `LEGEND_BST_THRESHOLD = 670`, `MEGA_AG_BST_THRESHOLD = 770`.

### Why is Regieleki so high? (AG 10.06)
200 Speed is the highest in the game. The rating system multiplies Speed into `rawBST` via `abilitiesSpeedPowerMultiplier`, and TRANSISTOR gets a 1.3× SpA multiplier on top. Its best moveset is **Supercell Slam / Thrash / Outrage / Megahorn** — all strong moves that cover 6 types super-effectively. The `comboBonus` is capped at 1.6. Speed alone warps every scoring component upward.

### Why is Naganadel so high? (AG 10.41)
BEAST_BOOST applies a 1.3× multiplier to both Attack and SpA in the BST calculation, inflating `rawBST` well above 610. Its ability rating of 7 adds directly to the score, and its moveset (**Sludge Wave / Dragon Pulse / Overheat / Leaf Storm**) hits 9 types super-effectively with 0 walls — a perfect coverage score of 5.0. Highest-rated pokemon in this bundle.

### Why is Mega Sceptile so high? (AG 9.68)
GRASS/DRAGON typing is rare and hits 9 super-effective matchups. 145 SpA and 145 Speed are both elite. Its TM pool includes **Outrage / Solar Blade / Dual Wingbeat / U-Turn**, giving it 4-move perfect mixed coverage. comboBonus 1.45. The BST floor (630 < 670) doesn't apply — it earns this through pure scoring.

### Why is Iron Hands so high? (AG 9.72)
154 HP / 150 Atk / 138 Def is an unprecedented defensive-physical stat spread. QUARK_DRIVE boosts its Attack further via the 1.3× BEAST_BOOST multiplier path. Its best moveset (**Close Combat / Supercell Slam / Fake Out / Outrage**) covers 8 types with a comboBonus of 1.6 (capped). The BULKY role rating compounds defensive bulk with offensive output. Scores above almost all megas.

### Why is Mega Lucario so high? (AG 9.64)
ADAPTABILITY is the highest ability rating (8) among non-broken abilities — it directly adds ~0.8 to the final score. 145 Atk / 140 SpA combined with FIGHTING/STEEL typing means its STAB moves (**Close Combat / Aura Sphere**) deal boosted damage, and the TM pool adds **Draco Meteor / Extreme Speed / Overheat** for 8 super-effective matchups. comboBonus 1.35.

### Why is Mega Lopunny so high? (UBERS 9.21)
SCRAPPY (ability rating 6) lets Normal/Fighting moves hit Ghosts. High Jump Kick at 130 BP is among the strongest moves in the game and is its core STAB. 136 Atk / 135 Speed is a strong offensive spread. The moveset (**High Jump Kick / Mega Kick / Fire Punch / Swords Dance**) covers 7 types. At 9.21 it actually sits just above the new UBERS floor — consistent with its Smogon history.

### Why is Mega Pinsir so high? (UBERS 9.04)
AERILATE converts Normal moves into Flying-type with a 1.2× power boost. This makes **Dual Wingbeat** a 80×2 BP STAB Flying move. Combined with 155 Atk (highest physical Attack among the megas here) and access to **Outrage / Superpower / U-Turn**, it achieves 10 super-effective matchups — the best coverage score (5.56) in this list. Moves rating 7.15 is the highest of the 7 pokemon analyzed. The score is held back only by its 600 BST hitting the MEGA_UBERS_BST_THRESHOLD floor rather than AG.
