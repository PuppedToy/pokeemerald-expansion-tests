---
id: T-147
title: Doubles support rating — relative-to-max scaling + tool tuning; offensive doubles item valuation
status: proposed
type: feature
created: 2026-07-17
updated: 2026-07-17
target-version: 0.9.0
links: [T-095, T-141, T-142, ADR-015]
blocked-by: []
---

# T-147 — Doubles support rating rework (relative scaling + tool tuning) + offensive item valuation

## Context

Owner (2026-07-17), after auditing bundle `run-650820231`: the doubles **support** rating is **too
generous** — with **TM Taunt (8) + TM Thunder Wave (8)** teachable to almost everything, nearly every mon
gets a "+16 for free", so the absolute thresholds (`SUPPORT_TIER_THRESHOLDS = {OU:22, UU:15, RU:11}`,
[rating.js:3690](../randomizer/rating.js#L3690)) no longer separate real supports from filler. Diagnosis
worked through on Zangoose: Taunt(8)+Thunder Wave(8)+Quick Guard(5)+Disable/Feint/Light Screen(2·3) = **27**,
offensive-tier penalty **0** (its doubles offense is NU) → **OU support**, despite being a frail Normal
attacker. See the Zangoose write-up in the conversation.

**Measured on this bundle (max support rating = 46):**
- Current absolute model → **97 mons are OU support** (far too many).
- Proposed relative model (below) → **22 OU supports**, and **Zangoose drops 27 → UU**. The new OU set is
  genuine doubles support (Mr. Rime, Meowstic, Mr. Mime, Gallade, Maushold, Volbeat, Liepard/Purrloin &
  Grimmsnarl [Prankster], Clefairy, Sableye, Tapu Lele, Audino, Alomomola, …).

> Owner: this is a good batch of improvements for an **extra session**. Analyse the tuning against the
> corpus (`docs/research/`) before committing values.

## Plan (validate each value against the corpus first — analysis-first, ADR-015 / owner rule)

### Part 1 — Relative (percentile-of-max) support tiers

Replace the absolute `SUPPORT_TIER_THRESHOLDS` with tiers **relative to the run's max support rating**, so
the scale self-normalises to the run's TM pool (Taunt/Thunder Wave inflate everyone equally → the *max*
absorbs it):
- `max = highest supportRatingDoubles across the dex this run`.
- OU = `[0.75·max, max]`, UU = `[0.50·max, 0.75·max)`, RU = `[0.25·max, 0.50·max)`.
- **≥10-OU floor:** OU threshold = `min(0.75·max, ratingOfThe10thBestSupport)` so there are always ≥10 OU
  supports to pick from (matters when the support pool is small / max is low). Owner: "el mínimo entre eso
  y 10". Validated: on this bundle the floor doesn't bind (10th = 39 > 34.5).
- Keep the BST viability gate, but reconsider using **defensive bulk (HP+Def+SpD)** instead of total BST
  (Zangoose's 458 BST is dumped in Atk; a frail mon shouldn't clear the "viable support" bar). ⚠ validate.
- This is a two-pass rating change (need the whole dex's ratings before the max is known) — thread it
  through `modules/pokedexModule.js` (where `supportTierDoubles`/`isSupportDoubles` are stamped).

### Part 2 — Support tool value tuning (validate each vs corpus)

Current values: [rating.js:3655-3678](../randomizer/rating.js#L3655) (`SUPPORT_MOVE_POINTS` /
`SUPPORT_ABILITY_POINTS`; elite 8 / good 5 / filler 2). Owner-proposed adjustments:
- **Follow Me / Rage Powder → 12**, **Fake Out → 12**, **Tailwind → 12**, **Wide Guard → 12**, **Spore → 12**.
- **Friend Guard → 16**, **Hospitality → 16**.
- **Ruin abilities** (Beads/Sword/Tablets/Vessel of Ruin) → **+4** support value.
- **Prankster → ×1.5 the whole support rating** (multiplicative, not a flat add).
- **Combo bonuses:** Encore+Prankster and Encore+Tailwind are "god combos" → extra points.
- Implicit: raising the elite redirection/speed-control tools above the flat 8 (and Taunt/Thunder Wave
  staying at 8) widens the gap so the *max* is set by real supports, not by universal TMs.
- Note `SUPPORT_TOOL_CAP = 8` must be raised/removed for the >8 values to take effect.

### Part 3 — Offensive doubles item valuation

Offensive doubles mons should value defensive/anti-support items much more (they currently don't):
- **Safety Goggles** on offensive mons — immunity to Rage Powder redirection + Spore/powder. High value in
  doubles. (item rating: `rateItemForAPokemon` / doubles item logic.)
- **Covert Cloak** on offensive mons — blocks Fake Out (and other secondary effects). High value in doubles.

## Acceptance criteria (draft — refine at session start)

- [ ] Support tiers are relative-to-max with a ≥10-OU floor; OU count drops to a sensible set; Zangoose is
      no longer OU; a fresh bundle audited.
- [ ] Tool/ability tuning values applied, each justified against the corpus (documented in the task log).
- [ ] Prankster ×1.5, Ruin +4, Friend Guard/Hospitality 16, redirection/Fake Out/Tailwind/Wide Guard/Spore
      12, Encore combos bonus — with the tool cap raised accordingly.
- [ ] Safety Goggles / Covert Cloak valued on offensive doubles mons.
- [ ] `cd randomizer && npm test` green (support-rating + item-rating unit tests updated); determinism intact.

## Progress log

- **2026-07-17** — Task created from owner feedback + the Zangoose audit. Preliminary corpus/bundle check
  done (97 → 22 OU under the relative model; Zangoose 27 → UU). Not started (extra session).

## Outcome

_(pending)_
