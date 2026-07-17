---
id: T-147
title: Doubles support rating — relative-to-max scaling + tool tuning; offensive doubles item valuation
status: done
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

## Acceptance criteria

- [x] Support tiers are relative-to-max with a ≥10-OU floor; OU count drops to a sensible set; Zangoose is
      no longer OU; a fresh bundle audited. (97 → ~11 OU; Zangoose OU → UU.)
- [x] Tool/ability tuning values applied, each justified against the corpus (documented in the task log).
- [x] Prankster ×1.5, Ruin +4, Friend Guard/Hospitality 16, redirection/Fake Out/Tailwind/Spore 12,
      Wide Guard 10 (owner), Encore combos bonus — tool cap raised 8 → 16.
- [x] Safety Goggles / Covert Cloak valued on offensive doubles mons.
- [x] A dedicated support must be support-dominant (support tier ≥ offence) — the role never fields an
      offence-dominant mon (owner review fix).
- [x] `cd randomizer && npm test` green (support-rating + item-rating unit tests updated); determinism intact.

## Progress log

- **2026-07-17** — Task created from owner feedback + the Zangoose audit. Preliminary corpus/bundle check
  done (97 → 22 OU under the relative model; Zangoose 27 → UU). Not started (extra session).
- **2026-07-17** — Started (owner: "empiézala"). Step 1 = corpus validation (analysis-first). Counted the
  145-team / 870-member doubles corpus (docs/research/corpus.json) for every tool the owner proposed to
  re-weight (% of teams fielding ≥1):
  - **Moves:** Protect 70% (excluded — universal), **Fake Out 36%**, **Taunt 30%**, Will-O-Wisp 24%,
    **Tailwind 22%**, Thunder Wave 21%, **Spore 14%**, **Rage Powder 11%**, Helping Hand 9%,
    **Wide Guard 8%**, Icy Wind 8%, Quick Guard 6%, **Follow Me 5%** (corpus under-counts it — the doc's
    note), Encore 5%, Perish Song 4%.
  - **Abilities:** **Intimidate 52%**, Regenerator 29%, **Prankster 12%**, Storm Drain 5%, Lightning Rod 4%.
    **Friend Guard / Hospitality / the Ruin abilities = 0%** (all Gen 8/9 — absent from the Gen 6-7 corpus;
    their value is a mechanics/meta call, not frequency, per doubles-support.md §Corpus-caveat).
  - **Items:** Choice 47%, Assault Vest 23%, **Safety Goggles 8%** (real corpus presence on offensive mons
    — validates Part 3), **Covert Cloak 0%** (Gen 9 item — mechanics call).
  - Verdict per proposal (see the owner message): Fake Out→12 (36% — strong), Tailwind→12 (22% — strong),
    Rage Powder/Follow Me→12 (archetype-defining redirection, doc-flagged under-count — ok), Spore→12 (14%
    hard-disable — ok), Wide Guard→12 (only 8% — FLAG: maybe 8-10, not 12). Friend Guard/Hospitality 16 &
    Ruin +4 & Covert Cloak: no corpus data → mechanics calls (accept on owner's judgement). Prankster ×1.5
    (12%): synergy-correct (its value is conditional on carrying status moves). Awaiting owner sign-off on
    the final value table before coding.
- **2026-07-17** — Owner sign-off on the two open points: **Wide Guard → 10** (not 12 — its 8% corpus
  presence); **keep the BST-total viability gate** (the percentile alone drops Zangoose to UU). FINAL SPEC:
  - Move points: Follow Me 12, Rage Powder 12, Fake Out 12, Tailwind 12, Spore 12; Wide Guard 10;
    Taunt/Thunder Wave/Will-O-Wisp/Trick Room/Perish Song stay 8; Quick Guard stays 5. Raise
    `SUPPORT_TOOL_CAP` 8 → 16 so >8 values take effect.
  - Ability points: Friend Guard 16, Hospitality 16; Ruin abilities (Beads/Sword/Tablets/Vessel of Ruin)
    +4 each; Intimidate/Regenerator/surges stay 8. **Prankster** becomes a **×1.5 multiplier on the whole
    support total** (no longer a flat +8). Combo: Encore+Prankster / Encore+Tailwind → small extra.
  - Relative tiers (two-pass): OU ≥ 0.75·max, UU ≥ 0.50·max, RU ≥ 0.25·max (max = dex-wide highest support
    rating); OU floored so ≥10 mons reach OU (`min(0.75·max, 10th-best)`); keep the BST viability floor.
  - Items: Safety Goggles + Covert Cloak valued up on offensive doubles mons.
- **2026-07-17** — Implemented Part 1 + Part 2 (TDD, `rating.js` + `pokedexModule.js`):
  - New tool values (premium 12 / elite 8 / Wide Guard 10 / good 5 / filler 2; Friend Guard & Hospitality
    16; Ruin +4), `SUPPORT_TOOL_CAP` 8→16, Prankster ×1.5 multiplier, Encore+{Prankster,Tailwind} +4 combos.
  - `computeSupportScale(pokes)` (OU 0.75·max / UU 0.5·max / RU 0.25·max, ≥10-OU floor) +
    `assignSupportTiersDoubles(pokes)` (second pass, wired into `pokedexModule` after rebalance);
    `supportTierDoubles` gained a `scale` param (absolute recalibrated to {30,20,13} as the isolated
    fallback); `isDedicatedSupport` reads the stored relative tier. New unit tests (T-147 block, 6) +
    updated the T-141 value/breakdown assertions for the new spec. Full suite 1196 pass.
  - **E2E (fresh gen, seed 42, rebalance 0.4):** OU support **97 → 10** (≥10 floor bound; max 61.5), UU 46,
    RU 328; **Zangoose OU → UU** (rating 32); OU pool = genuine supports (Maushold, Hitmontop, Gallade,
    Meowstic, Mr Mime, Volbeat…). Owner's "máximo no coja un Zangoose" satisfied.
  - REMAINING: Part 3 (Safety Goggles / Covert Cloak item valuation on offensive doubles mons); a
    calibration pass + owner review of a regenerated mixed run (task plan step 6); browser-bundle rebuild.
- **2026-07-17** — Owner refinement: **exclude the Prankster ×1.5 from the scale's MAX** (a Prankster
  outlier was compressing the OU band to the floor). `computeSupportScale` now takes `baseMax` =
  highest rating with `applyPranksterMult:false` (Prankster mons still clear OU via their mult-on rating);
  the ≥10 floor uses actual ratings. Re-checked (seed 42): OU 11, UU 65 (band no longer floor-bound).
- **2026-07-17** — Implemented Part 3 (items): `rateItemForAPokemon` gained a `doubles` param; **Safety
  Goggles** 5 → 8.5 and **Covert Cloak** 2.5 → 7.5 on an offensive doubles mon (a dedicated support gets no
  bump); threaded `battleType` from `resolveTrainerTeam`. Tests added (rateItemForAPokemon, 3). Full suite
  1199 pass. Bundle rebuilt. Awaiting owner review of a regenerated mixed run (calibration step).

- **2026-07-17** — Owner review of a regenerated run (Champion Steven, doubles): the `dedicatedSupport`
  role was being filled by **offence-dominant** mons (Deoxys Attack, Spectrier — OU offence, only an RU
  support tier), so a "redirection_support" team fielded no real support. Root cause: `isDedicatedSupport`
  meant "has a support tier ≥ RU" (T-141), which admits attackers. Owner rule: "si tier normal > tier
  support NO ES SUPPORT". Fixed: `isDedicatedSupport` now requires **support tier ≥ offensive tier**
  (support-dominant, ties allowed) — the hard-pick/detector never fields an offence-dominant mon. Verified:
  Deoxys Attack / Spectrier → dedicated=false; Hitmontop / Amoonguss / (UU) Zangoose stay supports. Test
  added; npm test 1200 pass.

## Outcome

Shipped (owner-confirmed 2026-07-17, "ya va bien"). The doubles support rating was overhauled so the
universal TMs (Taunt + Thunder Wave, ~+16 to almost everyone) no longer manufacture supports:
- **Relative tiers** — support OU/UU/RU are scaled to the run's max support rating (OU ≥0.75·max, UU ≥0.5,
  RU ≥0.25) with a ≥10-OU floor, in a dex-wide second pass (`computeSupportScale` +
  `assignSupportTiersDoubles`, wired into `pokedexModule`). The max excludes the Prankster ×1.5 so an
  outlier can't compress the band. OU support dropped 97 → ~11; Zangoose OU → UU.
- **Tool tuning** (corpus-validated on 145 doubles teams + owner sign-off) — premium 12 (Fake Out/Tailwind/
  Rage Powder/Follow Me/Spore), Wide Guard 10, Friend Guard/Hospitality 16, Ruin +4, cap 16; Prankster is a
  ×1.5 multiplier; Encore+{Prankster,Tailwind} combos.
- **Support-dominance** — `isDedicatedSupport` now requires support tier ≥ offensive tier, so the support
  role never fields an offence-dominant mon (Deoxys Attack/Spectrier no longer count).
- **Items** — Safety Goggles / Covert Cloak valued up on offensive doubles mons (anti Rage Powder/Spore /
  Fake Out).

`rating.js` + `modules/pokedexModule.js` + `modules/resolveTrainerTeam.js`; 15 new/updated unit tests;
`npm test` 1200 pass; cross-ROM determinism gate green (singles byte-unaffected — doubles-only). Follow-up
calibration (e.g. a low-scoring Amoonguss on some seeds) can be revisited if the owner wants finer weights.
