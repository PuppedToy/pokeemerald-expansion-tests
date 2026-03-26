# Next Algorithm Iteration Proposal

This document captures structural changes and per-pokemon issues discovered during the Phase A second-review calibration pass. Items are grouped by type: **structural proposals** that require algorithm changes, and **learnset gaps** that explain why certain pokemon rate lower than their Smogon counterparts.

---

## Structural Proposals

### S1 — Terrain surge ability rating inflates the overall score

**Problem:** Terrain setters (Tapu Koko, Tapu Lele, etc.) receive the combo bonus from the SURGE system (+0.4 base + STAB bonus), AND the ability rating for the surge ability (scored very high in `abilities.h`) contributes `bestAbilityRating × 0.10` to `absoluteRating`. These two mechanisms stack, resulting in terrain setters rating 0.5–1.0 points higher than their Smogon tiers imply.

**Evidence:** Tapu Koko with a fresh rebalancer run lands at GOD (9.77) when it should be OU (PREMIUM ~8.0–8.9). The surge combo alone gives +0.7, and if the ability data rates ELECTRIC_SURGE near 10, that adds another +1.0 to the final score.

**Proposed fix:** Cap the ability rating contribution for surge abilities at a fixed value (e.g. 7.5) in `ratePokemon`, so it doesn't double-stack with the combo system bonus. Alternatively, reduce the per-surge combo bonus to reflect that the ability rating already captures the terrain effect.

---

### S2 — RAGE_FIST escalating power is not modeled

**Problem:** Rage Fist doubles in base power for each hit Annihilape has taken in the battle (uncapped). At +6 Rage Fist from Drain Punch + Bulk Up + Rest cycling it can reach 800+ BP equivalent. The current model gives `RAGE_FIST+setup +0.5` — correct direction, but the scalar reward doesn't capture that Rage Fist becomes an outlier move after a few turns of setup.

**Proposed fix:** In `computeComboBonus`, scale the RAGE_FIST+setup bonus with Annihilape's physical bulk. A bulkier attacker (higher defensePower) accumulates more hits and thus higher Rage Fist power. Proposed: `+0.5 base + 0.05 × defensePower`, floored at +0.5 and capped at +0.8.

---

### S3 — BLOOD_MOON single-use-per-turn not modeled; MINDS_EYE ability missing

**Problem:** Ursaluna Bloodmoon is rated as STRONG (7.5–7.9) but should be at least OU. Two things are not modeled:
1. **Blood Moon**: A 140 BP Normal move that cannot be used two turns in a row. This restricts its effective power — it's not as freely spammable as Hyper Voice or Boomburst.
2. **MINDS_EYE**: Ursaluna Bloodmoon's exclusive ability. It ignores changes to the opponent's evasiveness AND its own accuracy, and Normal+Fighting type moves hit Ghost types. This is a significant offensive niche (checks Ghost-types with Normal STAB).

**Proposed fix:**
- Model MINDS_EYE as a combo: `MINDS_EYE + strong_special_attack (+0.3)` — it turns Normal STAB into near-unresisted coverage.
- Add `BLOOD_MOON` to the set of "signature high-power" moves that receive a bonus when the pokemon has high SpA but don't inflate the combo cap the way always-crit or terrain moves do.

---

### S4 — FISHIOUS_REND double-power on first move is not modeled

**Problem:** Fishious Rend doubles in power when Dracovish moves before the opponent (base 85 BP → 170 BP effective). This is why Dracovish was Uber in gen 8 — it outspeeds most non-scarved threats and hits for enormous damage. The `STRONG_JAW+FISHIOUS_REND +1.3` combo captures the jaw boost but not the speed-dependent doubling.

**Proposed fix:** Add a speed check: if Dracovish's base speed is sufficient to outspeed a large portion of the tier (propose: baseSpeed >= 80 as a rough proxy), add an additional +0.5 to the `STRONG_JAW+FISHIOUS_REND` bonus. This requires making the combo context-sensitive to speed tier.

---

### S5 — Glass cannon GOD cap requires rawDefensePower check before flexibility adjustments

**Status: FIXED in this session.** The flexibility bonus (triggered when Def == SpDef) was inflating `defensePower` past the 3.5 threshold, preventing the cap from firing for Pheromosa. Fixed by capturing `rawDefensePower` before the flexibility adjustment is applied.

---

### S6 — HAZARD+RECOVERY with REST-only leads to Skarmory under-rating

**Problem:** The change to require `hasReliableRecovery` (excluding REST) for `HAZARD+RECOVERY` correctly prevents inflation from universal REST access, but it also removes the bonus from Skarmory and other genuine hazard-setters that rely on REST as their only recovery. Skarmory (no Roost in this game's learnset) drops to WEAK (5.39) which is too low.

**Proposed fix:** Introduce a two-tier HAZARD bonus:
- `HAZARD+RELIABLE_RECOVERY +0.4` (current, uses `hasReliableRecovery`)
- `HAZARD+REST_RECOVERY +0.2` (new, fires when the pokemon has `MOVE_REST` but no reliable recovery) — partial credit since REST + hazards is a real defensive loop, just less consistent.

---

### S7 — The rating-rebalancer feedback loop causes non-deterministic session output

**Problem:** `analyze.js` runs the rebalancer, which adjusts base stats targeting specific tier goals. Since the rebalancer uses the rater to evaluate pokemon, any change to the rating algorithm changes what stats the rebalancer assigns. This means:
1. Different sessions produce different rebalanced stats for the same pokemon.
2. After rating changes, the rebalancer may overcorrect (e.g. giving Tapu Koko 170 Speed to hit its target tier when the new combo bonuses already push it close).

**Proposed fix:** Add a `--no-rebalance` flag to `analyze.js` that runs the pipeline with original source stats (no rebalancer). This allows rating algorithm testing against stable base stats, decoupled from the rebalancer.

---

### S8 — Setup move + hazard + recovery stacking

**Problem:** Some pokemon (Lycanroc Dusk, Lycanroc Midday) receive both `SETUP+PRIORITY` and `HAZARD+RECOVERY` bonuses, pushing them above their actual competitive tier. Lycanroc has never been above OU in any tier list and shouldn't reach LEGEND or PREMIUM from these stacked bonuses alone.

**Proposed fix:** Apply a diminishing-returns cap per combo category: if a pokemon already has `SETUP+PRIORITY` (+0.7) and `SETUP+fast` (+0.3), the `HAZARD+RECOVERY` bonus should be halved (as the pokemon is already getting a large bonus). Alternatively: the existing `bonusCap` of 1.6 should be applied more aggressively — consider reducing it to 1.4 for non-Uber archetypes.

---

## Learnset / Move Availability Gaps

These pokemon rate lower than expected specifically because key competitive moves are not in this game's learnset or TM pool. They are correctly rated for this game — these are not algorithm bugs.

### L1 — Azumarill: no Belly Drum, no Aqua Jet

Azumarill's OU viability historically depended on **Belly Drum + Aqua Jet** — an instant +6 Atk with priority followup. Neither move is available in this game's learnset. HUGE_POWER already gives a 2× Attack multiplier, but without setup or priority the pokemon is just a bulky normal attacker. **Correct tier for this game: WEAK/NU.**

### L2 — Rillaboom: no Grassy Glide

Rillaboom's OU status depends on **Grassy Glide** (+1 priority in Grassy Terrain, becomes +2 priority on a GRASSY_SURGE setter). The move exists in the battle engine but is not in any pokemon's learnset in this game (`grep MOVE_GRASSY_GLIDE src/data/pokemon/` returns nothing). Without Grassy Glide, Rillaboom is a GRASSY_SURGE setter with Wood Hammer/Drum Beating — good, but not OU-defining. **Correct tier for this game: STRONG/UU.**

### L3 — Corviknight: no Roost, no U-turn

Corviknight's OU role is **Roost + Bulk Up + Body Press + U-turn** (pivot with reliable recovery + setup threat). This game's learnset has no Roost and likely no U-turn for Corviknight. Without these moves it's a pure defensive wall with no recovery and no pivoting — much less valuable. **Correct tier for this game: AVERAGE/RU.**

### L4 — Scizor: no Bullet Punch, no Roost

Classic OU Scizor relied on **TECHNICIAN + Bullet Punch** for priority revenge killing and **Roost** for longevity. Both are unavailable. The current STRONG (7.76) rating reflects its decent typing and TECHNICIAN, but the lack of Bullet Punch removes its defining competitive role. **Correct tier for this game: STRONG/UU at best.**

### L5 — Tapu Bulu: no Grassy Glide

Same as Rillaboom: Tapu Bulu benefits from the GRASSY_SURGE terrain but cannot use Grassy Glide. Pushes it to STRONG (7.77) instead of PREMIUM (OU). **Correct tier for this game: STRONG/UU.**

---

## Per-Pokemon Notes (second review, remaining issues)

| Pokemon | Current | Expected | Issue |
|---------|---------|----------|-------|
| Annihilape | STRONG ~7.5 | PREMIUM (OU) | RAGE_FIST+Bulk Up combo undervalued; lacks Drain Punch in learnset |
| Ursaluna Bloodmoon | STRONG ~7.8 | PREMIUM (OU) | MINDS_EYE + Blood Moon not modeled (S3) |
| Magnezone | AVERAGE/STRONG | STRONG (UU) | MAGNET_PULL niche trap ability not modeled; no combo for it |
| Hitmonlee/chan/top | STRONG/PREMIUM | AVERAGE/STRONG | Probably over-rated; Hitmonchan combo credit for IRON_FIST |
| Starmie | AVERAGE | STRONG (UU) | Natural Cure + Rapid Spin utility not captured; seems correctly lower without Gen5 power creep |
| Mienshao | PREMIUM ~8.7 | STRONG (UU) | REGENERATOR + SETUP+PRIORITY + PIVOT stacks too aggressively; REGENERATOR+recovery combo double-counts |
| Primarina | AVERAGE ~6.3 | STRONG (UU) | PIXILATE not modeled (has LIQUID_VOICE not PIXILATE); Sparkling Aria utility value missing |
| Decidueye | STRONG ~7.5 | AVERAGE (RU) | Long Reach + Spirit Shackle niche not strong enough to justify UU; Spirit Shackle not modeled |
| Lycanroc Dusk | STRONG ~7.9 | STRONG (UU) | Currently fine; combo previously inflated by HAZARD+REST fix |
| Tapu Fini | STRONG ~7.3 | PREMIUM (OU) | MISTY_SURGE combo present but may need +0.2 more; defensive + setup role undervalued |
| Urshifu Single Strike | PREMIUM 8.95 | LEGEND (Uber) | 0.05 below LEGEND threshold; UNSEEN_FIST+crit combo capped at 2.0 |
| Corviknight | AVERAGE ~6.0 | PREMIUM (OU) | No Roost/U-turn — correctly lower for this game (L3) |
| Dracovish | AVERAGE/STRONG | STRONG (UU) | FISHIOUS_REND doubling on first move not modeled (S4) |
| Regieleki | PREMIUM ~8.0 | LEGEND (Uber) | TRANSISTOR + SPEED_200+ should push to LEGEND; rebalancer stat variance may lower base score |
| Skarmory | WEAK ~5.4 | STRONG (UU) | HAZARD+RECOVERY lost due to no reliable recovery; propose L6 two-tier fix (S6) |
| Gigalith | STRONG ~7.1 | AVERAGE (RU) | SAND_STREAM + high Attack overvalued; no consistent combo but hits STRONG_BST_THRESHOLD floor |

---

## Priority Order

1. **S6 (HAZARD+REST)** — Fixes Skarmory under-rating without reintroducing the REST inflation problem.
2. **S1 (Surge ability double-counting)** — Fixes Tapu Koko GOD regression.
3. **S3 (MINDS_EYE + Blood Moon)** — Fixes Ursaluna Bloodmoon; small, targeted change.
4. **S2 (RAGE_FIST scaling)** — Fixes Annihilape; small, targeted change.
5. **S4 (FISHIOUS_REND first-move)** — Fixes Dracovish; requires speed-context in combo.
6. **S7 (no-rebalance flag)** — Foundational for reliable testing going forward.
7. **S8 (diminishing returns cap)** — Addresses general over-stacking; needs tuning.
