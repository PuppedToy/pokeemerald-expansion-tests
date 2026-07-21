---
id: T-181
title: Rework move-accuracy rating — expected-value model, attenuated never-miss, imprecise-stacking penalty
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-21
updated: 2026-07-21
target-version: 1.1.0
links: []
blocked-by: []
---

# T-181 — Rework move-accuracy rating

## Context

The move rater is too conservative with accuracy. Owner-reported goal: the AI should be **more
aggressive with accuracy** — a high-power imprecise move should be preferred over a weaker precise one
when the expected value favours it, while genuinely reliable high-power moves (Close Combat) stay top.

Analysis of the current behaviour (rated on a STAB special attacker, SpA 130, so the per-mon multiplier
is ×1.95 — see `rateMoveForAPokemon` [rating.js:1380-1401](../randomizer/rating.js#L1380-L1401)):

| Comparison | Current (flat penalty) | Owner wants |
|---|---|---|
| Flamethrower vs **Fire Blast** | 12.54 vs 12.40 → Flamethrower wins | Fire Blast preferred |
| **Aura Sphere** vs Focus Blast | 13.09 vs 10.86 → gap **2.23** | ≈ tie |

Root cause — the accuracy term in `rateMove` [rating.js:948-950](../randomizer/rating.js#L948-L950) is a
**flat** subtraction applied to the base *before* the STAB/stat multiplier:

```js
let accuracy = move.accuracy || 110;   // never-miss (acc stored 0) → 110
if (accuracy == 0) accuracy = 110;
rating -= (100 - accuracy) / 10;       // flat: -1.5 at 85%, -3.0 at 70%, +1.0 at never-miss
```

Two structural problems:

1. **Flat penalty is harsher than expected value** for any move with base power-rating < 10 (power < 140),
   by a factor of ~`10/base` ≈ 1.2–1.3× for typical moves. Because it is applied before the ×STAB×stat
   multiplier, on a strong attacker a 15%-accuracy loss costs ~2.9 final points while the matching power
   gain is ~2.8 → accuracy slightly outweighs power. That is the observed over-conservatism.
2. **Never-miss gets +1.0** (acc 110 → `-(100-110)/10 = +1`). Owner: this is "casi nunca relevante en
   niveles generales" — it should be attenuated a lot. It widens the Aura Sphere ↔ Focus Blast gap.

A pure **expected-value** model (`base × acc/100`) already delivers the desired ordering: Fire Blast 13.02
> Flamethrower 12.54, and Focus Blast 11.70 ≈ Aura Sphere 11.14 (gap 0.56). Because the whole chain is
multiplicative, an accuracy factor applied inside `rateMove` composes correctly with STAB/stat.

Third, separate goal: **movesets should not stack imprecise moves.** `chooseMoveset`
[rating.js:2345-2357](../randomizer/rating.js#L2345-L2357) is a pure greedy fill with same-*type* dedup
only — nothing looks at accuracy, so a mon can end up with 4 imprecise coverage moves (e.g. Fire Blast +
Focus Blast + Thunder + Hydro Pump, all different types). Owner: allow 1 imprecise move freely; the 2nd
should already give the AI pause. This must be evaluated **after** accuracy-affecting abilities
(No Guard, Compound Eyes, Victory Star, Hustle) and weather are applied — under No Guard nothing is
imprecise, so the rule must not fire.

## Plan

Three coordinated changes in `randomizer/rating.js`, TDD (Red → Green). New tunable module-level constants
near the top of the file; magnitudes below are the proposed defaults, to be confirmed against the corpus.

### 1 — Flat penalty → expected value (multiplicative)

Replace the flat term at [rating.js:948-950](../randomizer/rating.js#L948-L950):

```js
let accuracy = move.accuracy || 110;
if (accuracy == 0) accuracy = 110;          // never-miss sentinel
const accEff = Math.min(accuracy, 100);     // no reward beyond 100%
if (!isOhko) rating *= accEff / 100;         // expected-value scaling of the power component
if (accuracy > 100) rating += NEVER_MISS_BONUS;
```

- Applied at line 950, i.e. after the power/OHKO base but before the priority add — it scales only the
  damage component, and composes multiplicatively with STAB/stat downstream.
- **OHKO** kept out of the EV scaling (bespoke `rating = 12`); their in-game accuracy is level-derived, not
  the stored value. *(Open point: confirm on corpus; alternative is a fixed OHKO factor.)*

### 2 — Attenuate never-miss

`NEVER_MISS_BONUS = 0.2` (down from the effective +1.0). Under EV a never-miss move already keeps its full
value (×1.0); this residual is a small nod to guaranteed-hit reliability. Tunable — may be 0.

### 3 — Imprecise-stacking penalty (ability/weather aware)

New helper (effective accuracy after abilities + weather):

```js
function effectiveAccuracy(move, hasAbilityFn, ctx) {
  let acc = move.accuracy || 110;
  if (acc === 0) acc = 110;
  if (hasAbilityFn('NO_GUARD')) return 100;                                   // never misses
  if (ctx.rain && (move.id === 'MOVE_THUNDER' || move.id === 'MOVE_HURRICANE')) return 100;
  if (ctx.snow && move.id === 'MOVE_BLIZZARD') return 100;
  if (hasAbilityFn('COMPOUND_EYES')) acc *= 1.3;
  if (hasAbilityFn('VICTORY_STAR')) acc *= 1.1;
  if (hasAbilityFn('HUSTLE') && move.category === 'DAMAGE_CATEGORY_PHYSICAL') acc *= 0.8;
  return Math.min(acc, 100);
}
```

In `rateMoveForAPokemon`, inside the damaging-move branch
([rating.js:1396-1401](../randomizer/rating.js#L1396-L1401)):

**(a) Correct the EV factor for this mon's abilities/weather** — `rateMove` baked in the *raw* factor;
rescale to the effective one (valid because the chain is multiplicative):

```js
const rawAcc = Math.min(move.accuracy === 0 ? 110 : (move.accuracy || 110), 100);
const accEff = effectiveAccuracy(move, hasAbility, { rain: inRain, snow: inSnow });
rating *= accEff / rawAcc;   // No Guard on 70% → ×1.43 restores full; Compound Eyes boosts
```

This **replaces** the ad-hoc weather-undo lines at
[rating.js:1297-1301](../randomizer/rating.js#L1297-L1301) with one unified mechanism.

**(b) Stacking penalty** — imprecise = damaging move with `accEff < IMPRECISE_ACC`:

```js
if (accEff < IMPRECISE_ACC) {
  const impreciseInSet = currentMoves.filter(m =>
    m.category !== 'DAMAGE_CATEGORY_STATUS'
    && effectiveAccuracy(m, hasAbility, { rain: inRain, snow: inSnow }) < IMPRECISE_ACC
  ).length;
  if (impreciseInSet >= 1) {
    rating *= Math.max(IMPRECISE_MIN_FACTOR, 1 - IMPRECISE_STACK_PENALTY * impreciseInSet);
  }
}
```

Defaults: `IMPRECISE_ACC = 90` (85%-acc Fire Blast counts as imprecise; ≥90% does not),
`IMPRECISE_STACK_PENALTY = 0.2` (2nd imprecise ×0.8, 3rd ×0.6), `IMPRECISE_MIN_FACTOR = 0.4`.
Because the greedy fill grows `currentMoves` as it picks, the 1st imprecise move is free and each
additional one is taxed — nudging a precise coverage move into the 2nd/3rd slot. Under No Guard the count
is always 0, so the rule self-disables.

### Projected results (EV + never-miss 0.2, STAB SpA-130 attacker)

| Comparison | New | Result |
|---|---|---|
| Flamethrower vs Fire Blast | 12.54 vs 13.02 | **Fire Blast** ✓ |
| Aura Sphere vs Focus Blast | 11.53 vs 11.70 | ≈ tie (0.17) ✓ |
| Close Combat (120/100%) | 8.14 base | still dominates ✓ |

Acceptance criteria:
- [x] `rateMove(FIRE_BLAST) > rateMove(FLAMETHROWER)` (base level). — 6.679 > 6.429.
- [x] `|rateMove(FOCUS_BLAST) − rateMove(AURA_SPHERE)| < 0.5` (base level). — |6.0 − 5.914| = 0.086.
- [x] Never-miss bonus attenuated: a never-miss move rates within `NEVER_MISS_BONUS` of an equal-power
      100%-accurate move (no ~+1 jump). — diff = 0.2.
- [x] Close Combat still outrates Fire Blast / Focus Blast on an equal STAB physical/special attacker.
- [x] No Guard: an imprecise move on a No-Guard mon is rated as if 100% accurate (EV factor restored).
- [x] Compound Eyes: a 70% move rates strictly higher on a Compound-Eyes mon than on the same mon without.
- [x] Stacking: `rateMoveForAPokemon(2ndImprecise, currentMoves=[imprecise])` <
      `rateMoveForAPokemon(sameMove, currentMoves=[precise])`. (chooseMoveset end-to-end composition
      validated by the selection-principle unit test + corpus/manual — see log for why a brittle
      full-set assertion was not used.)
- [x] Full suite green (`cd randomizer && npm test`).
- [x] No regression in existing rating/integration snapshots that isn't a deliberate, logged spec change.
- [ ] Owner manual test OK (config run / corpus spot-check) before closing.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-21** — Task created. Root-caused the over-conservatism to the flat accuracy penalty in
  `rateMove` (line 950) applied before the ×STAB×stat multiplier, plus the +1 never-miss bonus. Verified
  with the real `rateMove` that the current model prefers Flamethrower>Fire Blast and Aura Sphere≫Focus
  Blast, while a pure expected-value model flips both to the owner's desired ordering. Proposal drafted:
  (1) EV multiplicative accuracy, (2) never-miss bonus 1.0→0.2, (3) ability/weather-aware
  imprecise-stacking penalty in `rateMoveForAPokemon`. Magnitudes are defaults pending corpus validation.

- **2026-07-21** — Implemented (TDD, branch `feature/T-181-move-accuracy-expected-value`).
  - Added T-181 constants (`NEVER_MISS_BONUS=0.2`, `IMPRECISE_ACC=90`, `IMPRECISE_STACK_PENALTY=0.2`,
    `IMPRECISE_MIN_FACTOR=0.4`) and the `effectiveAccuracy(move, hasAbilityFn, ctx)` helper (No Guard,
    Compound Eyes, Victory Star, Hustle, rain/snow) in `rating.js`.
  - `rateMove`: flat `rating -= (100-acc)/10` → `rating *= min(acc,100)/100` + `+NEVER_MISS_BONUS` for
    never-miss. Applied uniformly, **including OHKO** (deviation from the drafted "keep OHKO bespoke":
    OHKO now = 12 × acc/100 ≈ 3.6 at 30% acc, down from ~5 under the flat model — cleaner and less
    attractive, so kept). Data quirk noted: `MOVE_SHEER_COLD` isn't tagged `EFFECT_OHKO` in our data
    (power 1) so it rates ~0.02 — never auto-picked; pre-existing, out of scope.
  - `rateMoveForAPokemon`: removed the ad-hoc Thunder/Blizzard weather-undo (old lines ~1297-1301); the
    per-mon accuracy correction `rating *= accEff/rawAcc` (top of the damage branch, before STAB/coverage)
    now unifies abilities + weather. Stacking penalty added at the end of the damage branch.
  - New tests: `__tests__/unit/moveAccuracyExpectedValue.test.js` (15 tests) + fixtures (Fire Blast,
    Hydro Pump, Thunder, Hurricane, Aura Sphere, Focus Blast, Ice Beam, Psychic). Watched 7 fail (red)
    for the right reason, then pass (green).
  - Dead-end noted: a brittle end-to-end `chooseMoveset` "≤N imprecise moves" assertion could not be made
    reliably red→green — with EV already active, imprecise moves no longer dominate base ratings, so the
    stacking rule's marginal effect on final composition is small and pool-sensitive. Tested the exact
    selection principle at the `rateMoveForAPokemon` layer instead (precise move overtakes a higher-base
    imprecise one once the set holds an imprecise move).
  - Real-data check: Fire Blast 13.02 > Flamethrower 12.54; Focus Blast 11.70 ≈ Aura Sphere 11.53
    (gap 0.17); Close Combat 15.88 dominant. Full suite green: 1452 passed, 0 failing.
  - Magnitudes still provisional — awaiting owner manual test / corpus spot-check before closing.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
