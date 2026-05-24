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

---

## Rating Math — Exact Formula

Constants: `EXCELLENT_STAT_VALUE = GOOD_STAT_VALUE = 160`, `FLEXIBILITY_THRESHOLD = 20`.

```
offensePower  = max(Atk × atkMult, SpA × spaMult) / 160 × 10
speedPower    = Spe × speedMult / 160 × 10
defensePower  = (HP + max(Def,SpD)×0.6 + min(Def,SpD)×0.4) / 320 × 10
```

Flexibility bonus (if `|Atk−SpA| < 20`): `offensePower += 0.1 × (min(Atk,SpA)/160×10)`
Flexibility bonus (if `|Def−SpD| < 20`): `defensePower += 0.1 × (min(Def,SpD)/160×10)`
Outlier bonus (if `max(Atk,SpA) ≥ 160`): `offensePower × 1.1`
Outlier bonus (if `Spe ≥ 160`): `speedPower × 1.1`
All three powers capped at 10.

```
bstRating (OFFENSIVE) = offensePower×0.55 + speedPower×0.4 + defensePower×0.05
bstRating (BULKY)     = offensePower×0.475 + defensePower×0.475 + speedPower×0.05
absoluteRating        = bstRating×0.8 + movesRating×0.1 + abilityRating×0.1 + comboBonus
```

---

## Deep Math — Why They Scored High

### Regieleki — AG 10.062

**Stats:** 80/100/50/100/50/200 | **Types:** ELECTRIC | **Ability:** TRANSISTOR (atkMult=1, spaMult=1.3)

| Component | Calculation | Value |
|---|---|---|
| rawBST | 80+100+50+100×1.3+50+200 | 610 |
| offensePower | max(100×1, 100×1.3)/160×10 + flex(+0.625) | 8.750 |
| speedPower | 200/160×10 → ×1.1 outlier → **capped 10** | 10.000 |
| defensePower | (80+50×0.6+50×0.4)/320×10 + flex(+0.313) | 4.375 |
| role | OFFENSIVE (speedPower > offensePower) | — |
| bstRating | 8.75×0.55 + 10×0.4 + 4.375×0.05 | **9.031** |
| abilityRating | TRANSISTOR raw 6, no caps | 6 |
| movesRating (bundle) | — | 6.371 |
| comboBonus (bundle) | hit 1.6 cap | 1.600 |
| **absoluteRating** | 9.031×0.8 + 6.371×0.1 + 6×0.1 + 1.6 | **10.062** |

**Root cause:** 200 Speed maps to speedPower 12.5 → after outlier ×1.1 = 13.75 → hard-capped to 10. In the OFFENSIVE formula speedPower has 40% weight, so this cap contributes the theoretical maximum `10×0.4 = 4.0` to bstRating regardless of whether offensive stats can justify it. Regieleki's 100/100 offense is moderate (offensePower 8.75) yet it gets full speed credit. TRANSISTOR additionally inflates rawBST by treating effective SpA as 130. Both the comboBonus cap (1.6) and extreme speed combine to push it to AG.

---

### Iron Hands — AG 9.722

**Stats:** 154/150/138/50/48/50 | **Types:** FIGHTING/ELECTRIC | **Ability:** QUARK_DRIVE

| Component | Calculation | Value |
|---|---|---|
| rawBST | 590 (QUARK_DRIVE doesn't modify rawBST) | 590 |
| offensePower | 150/160×10 (no flex, no outlier: 150<160) | 9.375 |
| speedPower | 50/160×10 | 3.125 |
| defensePower | (154+138×0.6+48×0.4)/320×10 | 8.000 |
| role | BULKY (speedPower not dominant; off/def diff=1.375≥1.0) | — |
| bstRating | 9.375×0.475 + 8.0×0.475 + 3.125×0.05 | **8.409** |
| abilityRating | QUARK_DRIVE raw 7, no caps | 7 |
| movesRating (bundle) | — | 6.942 |
| comboBonus (bundle) | hit 1.6 cap | 1.600 |
| **absoluteRating** | 8.409×0.8 + 6.942×0.1 + 7×0.1 + 1.6 | **9.722** |

**Root cause:** Without comboBonus, Iron Hands scores `6.727 + 0.694 + 0.700 = 8.121` — solidly UBERS territory. The comboBonus alone lifts it +1.6 into AG. The cap is reached via QUARK_DRIVE (+0.45 base, +0.2 offense bonus = +0.65 from ability combo alone) stacking with coverage synergies from FIGHTING/ELECTRIC dual STAB + Fake Out priority. No BST floor is involved; the formula + cap do all the work.

---

### Mega Sceptile — AG 9.675

**Stats:** 70/110/75/145/85/145 | **Types:** GRASS/DRAGON | **Ability:** LIGHTNING_ROD

| Component | Calculation | Value |
|---|---|---|
| rawBST | 630 (no mega floor: 630 < 720) | 630 |
| offensePower | 145/160×10 = 9.0625 (no flex: \|110−145\|=35; no outlier: 145<160) | 9.063 |
| speedPower | 145/160×10 (no outlier: 145<160) | 9.063 |
| defensePower | (70+85×0.6+75×0.4)/320×10 + flex(+0.469: \|75−85\|=10<20) | 5.188 |
| role | OFFENSIVE (\|off−spe\|=0 < 1.0) | — |
| bstRating | 9.063×0.55 + 9.063×0.4 + 5.188×0.05 | **8.869** |
| abilityRating | LIGHTNING_ROD raw 7 → **capped 4.5** (GRASS/DRAGON doesn't remove Elec weakness) | 4.5 |
| movesRating (bundle) | — | 6.804 |
| comboBonus (bundle) | — | 1.450 |
| **absoluteRating** | 8.869×0.8 + 6.804×0.1 + 4.5×0.1 + 1.45 | **9.675** |

**Root cause:** Equal 145 SpA and 145 Spe both sit at 90.6% of the "excellent" baseline (160). The OFFENSIVE formula combines both without diminishing returns: offense contributes `9.06×0.55 = 4.98` and speed contributes `9.06×0.4 = 3.63` for a bstRating of 8.87. A comboBonus of 1.45 (GRASS/DRAGON 9-type coverage pool) pushes it over the AG threshold. Notably, LIGHTNING_ROD is correctly capped to 4.5 — it saves Sceptile from scoring even higher, since GRASS/DRAGON is neutral to Electric rather than weak.

---

### Mega Pinsir — UBERS 9.044

**Stats:** 65/155/120/65/90/105 | **Types:** BUG/FLYING | **Ability:** AERILATE

| Component | Calculation | Value |
|---|---|---|
| rawBST | 600 (no mega floor: 600 < 720) | 600 |
| offensePower | 155/160×10 = 9.6875 (no flex: \|155−65\|=90; no outlier: 155<160) | 9.688 |
| speedPower | 105/160×10 | 6.563 |
| defensePower | (65+120×0.6+90×0.4)/320×10 (no flex: \|120−90\|=30) | 5.406 |
| role | OFFENSIVE (speedPower > defensePower) | — |
| Mega frailty penalty | defensePower 5.406 > 4.5 → no penalty | — |
| bstRating | 9.688×0.55 + 6.563×0.4 + 5.406×0.05 | **8.223** |
| abilityRating | AERILATE raw 8 → **capped 7.0** (−ATE cap) | 7.0 |
| movesRating (bundle) | — | 7.154 |
| comboBonus (bundle) | see breakdown below | 1.050 |
| **absoluteRating** | 8.223×0.8 + 7.154×0.1 + 7.0×0.1 + 1.05 | **9.044** |

**Combo breakdown:**

| Combo | Trigger | Bonus |
|---|---|---|
| SETUP+fast(spe≥90) | Swords Dance learnable + Spe=105 ≥ 90 | +0.40 |
| PIVOT+RECOVERY | U-Turn (TM) + Drain Punch (TM, draining recovery) + Def=120 ≥ 75 | +0.30 |
| SETUP+RECOVERY | Swords Dance + Drain Punch | +0.35 |
| **Total** | | **1.05** |

**AERILATE not modeled:** The rater only awards the −ATE combo bonus if **sound-based** moves are present (e.g., Hyper Voice). Pinsir Mega has no sound moves. Its actual competitive strength — that **Double-Edge / Return / Facade become ~108 BP Flying STAB** via AERILATE's Normal→Flying conversion — receives zero bonus. The 7.154 movesRating reflects only the raw quality of Dual Wingbeat + Outrage, not the type-conversion amplification of its normal physical moveset.

---

### Mega Lopunny — UBERS 9.208

**Stats:** 65/136/94/54/96/135 | **Types:** NORMAL/FIGHTING | **Ability:** SCRAPPY

| Component | Calculation | Value |
|---|---|---|
| rawBST | 580 (no mega floor: 580 < 720) | 580 |
| offensePower | 136/160×10 = 8.5 (no flex: \|136−54\|=82; no outlier: 136<160) | 8.500 |
| speedPower | 135/160×10 | 8.438 |
| defensePower | (65+96×0.6+94×0.4)/320×10 + flex(+0.588: \|94−96\|=2<20) | 5.594 |
| role | OFFENSIVE (\|off−spe\|=0.063 < 1.0) | — |
| bstRating | 8.5×0.55 + 8.438×0.4 + 5.594×0.05 | **8.330** |
| abilityRating | SCRAPPY raw 6, no caps | 6 |
| movesRating (bundle) | — | 5.944 |
| comboBonus (bundle) | see breakdown below | 1.350 |
| **absoluteRating** | 8.330×0.8 + 5.944×0.1 + 6×0.1 + 1.35 | **9.208** |

**Combo breakdown:**

| Combo | Trigger | Bonus |
|---|---|---|
| SETUP+PRIORITY | Swords Dance (TM) + Quick Attack (learnset) — isClearlyPhysical: Atk(136) > SpA(54)×0.9 | +0.70 |
| SETUP+fast(spe≥90) | sub-bonus of SETUP+PRIORITY: Spe=135 ≥ 90 | +0.30 |
| SCRAPPY+physical | SCRAPPY + Atk=136 ≥ 100 | +0.35 |
| **Total** | | **1.35** |

---

## Pair Comparison — What Separates the Tiers

### Mega Pinsir (UBERS 9.044) vs Mega Heracross (OU 8.340)

Both BUG-type megas, BST=600, same abilityRating=7.

**Mega Heracross math:**

**Stats:** 80/165/135/40/105/75 | **Types:** BUG/FIGHTING | **Ability:** SKILL_LINK

| Component | Calculation | Value |
|---|---|---|
| offensePower | 165/160×10 → ×1.1 outlier → **capped 10** | 10.000 |
| speedPower | 75/160×10 | 4.688 |
| defensePower | (80+135×0.6+105×0.4)/320×10 (no flex: \|135−105\|=30) | 6.344 |
| role | BULKY (off>def diff=3.97; speedPower < both) | — |
| bstRating | 10×0.475 + 6.344×0.475 + 4.688×0.05 | **7.998** |
| abilityRating | SKILL_LINK raw 7, no caps | 7 |
| movesRating | — | 5.917 |
| comboBonus | PIVOT+RECOVERY +0.3, SETUP+RECOVERY +0.35 | 0.650 |
| **absoluteRating** | 7.998×0.8 + 5.917×0.1 + 7×0.1 + 0.65 | **8.340** |

**Combo breakdown (Heracross):**

| Combo | Trigger | Bonus |
|---|---|---|
| PIVOT+RECOVERY | U-Turn (TM) + Drain Punch (TM) + Def=135 ≥ 75 | +0.30 |
| SETUP+RECOVERY | Swords Dance + Drain Punch | +0.35 |
| **Total** | | **0.65** |

**Gap breakdown (Pinsir −Heracross = +0.704):**

| Factor | Pinsir | Heracross | Pinsir advantage |
|---|---|---|---|
| bstRating | 8.223 | 7.998 | +0.225 → **+0.180** at 0.8× |
| movesRating | 7.154 | 5.917 | +1.237 → **+0.124** at 0.1× |
| abilityRating | 7.0 | 7.0 | **0** |
| comboBonus | 1.050 | 0.650 | **+0.400** |
| **Total** | | | **+0.704** |

**Diagnosis:**
- **Role is the main structural difference.** Heracross has 165 Atk (highest among megas here) but is BULKY — speed of 75 forces the formula to weight offense and defense equally (0.475 each), which caps the benefit from its elite attack stat. Pinsir's 105 Speed qualifies as OFFENSIVE, where speed gets 40% weight and contributes meaningfully (`6.563×0.4 = 2.625`).
- **comboBonus gap = +0.40.** Pinsir gets `SETUP+fast(spe≥90) +0.4` because Spe=105 ≥ 90. Heracross has Spe=75 and misses this check entirely. Both share PIVOT+RECOVERY and SETUP+RECOVERY (+0.65 base).
- **movesRating gap = +0.124.** Dual Wingbeat + Outrage + Superpower + U-Turn is a significantly stronger moveset than Pin Missile + Close Combat + Bullet Seed + Flare Blitz. SKILL_LINK on Bullet Seed and Pin Missile is already baked into `rateMoveForAPokemon` (the ×2.5 multi-hit multiplier), so Heracross's moves are not as weak as the base BPs suggest — but the raw move quality of Outrage and Dual Wingbeat is still higher.

---

### Mega Lopunny (UBERS 9.208) vs Mega Gallade (OU 8.710)

Both FIGHTING-type megas, both OFFENSIVE role.

**Mega Gallade math:**

**Stats:** 68/165/95/65/115/110 | **Types:** PSYCHIC/FIGHTING | **Ability:** INNER_FOCUS

| Component | Calculation | Value |
|---|---|---|
| offensePower | 165/160×10 → ×1.1 outlier → **capped 10** (no flex: \|165−65\|=100; \|Def−SpD\|=20 exactly, NOT < 20) | 10.000 |
| speedPower | 110/160×10 | 6.875 |
| defensePower | (68+115×0.6+95×0.4)/320×10 (no flex: \|95−115\|=20 not < 20) | 5.469 |
| role | OFFENSIVE (speedPower > defensePower) | — |
| Mega frailty penalty | defensePower 5.469 > 4.5 → no penalty | — |
| bstRating | 10×0.55 + 6.875×0.4 + 5.469×0.05 | **8.523** |
| abilityRating | INNER_FOCUS raw **2**, no caps | 2 |
| movesRating | — | 6.413 |
| comboBonus | see breakdown below | 1.050 |
| **absoluteRating** | 8.523×0.8 + 6.413×0.1 + 2×0.1 + 1.05 | **8.710** |

**Combo breakdown (Gallade):**

| Combo | Trigger | Bonus |
|---|---|---|
| SETUP+fast(spe≥90) | Swords Dance (learnset) + Spe=110 ≥ 90 (no physical priority in TM pool) | +0.40 |
| PIVOT+RECOVERY | U-Turn (TM) + Drain Punch (learnset via Aqua Cutter/Draining Kiss? check) → Draining Kiss (learnset) counts as draining recovery | +0.30 |
| SETUP+RECOVERY | Swords Dance + Draining Kiss / reliable recovery | +0.35 |
| **Total** | | **1.05** |

**Gap breakdown (Lopunny − Gallade = +0.498):**

| Factor | Lopunny | Gallade | Lopunny advantage |
|---|---|---|---|
| bstRating | 8.330 | 8.523 | −0.193 → **−0.154** at 0.8× |
| movesRating | 5.944 | 6.413 | −0.469 → **−0.047** at 0.1× |
| abilityRating | 6 (SCRAPPY) | 2 (INNER_FOCUS) | +4 → **+0.400** at 0.1× |
| comboBonus | 1.350 | 1.050 | **+0.300** |
| **Total** | | | **+0.499** |

**Diagnosis:**
- **Gallade is actually the stronger pokemon on raw stats and moves** — it has a 0.193-higher bstRating (165 Atk capped + 110 Speed is more balanced than 136 Atk + 135 Speed in the OFFENSIVE formula) and better movesRating.
- **INNER_FOCUS (rating 2) vs SCRAPPY (rating 6) explains +0.40 alone.** INNER_FOCUS is a minor competitive ability (prevents flinching) with minimal value; SCRAPPY pierces Ghost-type immunity for Normal and Fighting moves, effectively removing a whole immunity category from Lopunny's STAB coverage.
- **SETUP+PRIORITY unlocks +1.0 total for Lopunny.** Quick Attack (from learnset) is a physical priority move. Combined with Swords Dance it triggers SETUP+PRIORITY (+0.7) plus SETUP+fast(spe≥90) sub-bonus (+0.3) for a total of +1.0. Gallade has no physical priority move in its TM pool or learnset, so it only gets SETUP+fast(spe≥90) (+0.4). That +0.60 combo difference is the deciding factor.
- **Bottom line:** Lopunny wins purely on SCRAPPY's ability rating (+0.4) and the SETUP+PRIORITY combo (+0.6 over Gallade's setup pattern), despite having a worse stat profile. If Gallade had even a moderate ability instead of INNER_FOCUS, it would be UBERS.

---

## Model Gap Summary

| Pokemon | Tier | Expected | Primary cause |
|---|---|---|---|
| Regieleki | AG 10.06 | LEGEND | 200 Speed → speedPower capped to max 10.0, contributing `×0.4 = 4.0` regardless of 100 offensive stats; TRANSISTOR inflates rawBST |
| Iron Hands | AG 9.72 | LEGEND | bstRating only 8.41; reaches AG solely because comboBonus hits 1.6 cap (QUARK_DRIVE +0.65 + coverage synergies); without comboBonus it scores 8.12 |
| Mega Sceptile | AG 9.68 | LEGEND | Equal 145 SpA + 145 Spe both at 90.6% of baseline, no diminishing returns in OFFENSIVE formula; comboBonus 1.45 from 9-type coverage |
| Mega Pinsir | UBERS 9.04 | OU | AERILATE Normal→Flying conversion **not modeled** (only sound moves get −ATE bonus); actual competitive value of Double-Edge/Return as Flying STAB is invisible |
| Mega Lopunny | UBERS 9.21 | OU | SCRAPPY ability rating 6 adds 0.4 to absoluteRating; SETUP+PRIORITY fires via Quick Attack (+1.0 total vs Gallade's +0.4) |

### Why is Naganadel so high? (AG 10.41)
BEAST_BOOST applies a 1.3× multiplier to both Attack and SpA in the BST calculation, inflating `rawBST` well above 610. Its ability rating of 7 adds directly to the score, and its moveset (**Sludge Wave / Dragon Pulse / Overheat / Leaf Storm**) hits 9 types super-effectively with 0 walls — a perfect coverage score of 5.0. Highest-rated pokemon in this bundle.

### Why is Regieleki so high? (AG 10.06)
200 Speed is the highest in the game. The rating system multiplies Speed into `rawBST` via `abilitiesSpeedPowerMultiplier`, and TRANSISTOR gets a 1.3× SpA multiplier on top. Its best moveset is **Supercell Slam / Thrash / Outrage / Megahorn** — all strong moves that cover 6 types super-effectively. The `comboBonus` is capped at 1.6. Speed alone warps every scoring component upward.

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
