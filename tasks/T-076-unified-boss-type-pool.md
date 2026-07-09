---
id: T-076
title: Unified fixed/changed type pool for gyms, E4 and champion
status: done
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: []
blocked-by: []
---

# T-076 — Unified fixed/changed type pool for gyms, E4 and champion

## Context

The gym / E4 type randomization is subtly wrong. Today each group draws from its own
walled-off pool that excludes *every* canonical type of the group (`gymAllowedTypes`,
`e4AllowedTypes` in `randomizer/trainers.js`), plus STEEL is reserved for the champion.
Consequences the owner flagged:

- A changed boss can only ever land on a type that was **never** a gym/E4 canonical type,
  so it always introduces types absent from the original game.
- If Roxanne (Rock) is *changed*, Rock becomes ineligible for **everyone** — even though it
  is now free. It should be claimable by another gym or E4.
- Gyms and E4 can never share the type space with each other or with the champion.

The champion (Steven) is currently hard-wired to STEEL everywhere and never participates in
the randomization.

## Plan

Replace the per-group pools with one unified algorithm over the 13 typed bosses
(8 gyms + 4 E4 + 1 champion):

- **Step 0 — config.** Add a champion knob: probability the champion's type is randomized,
  default **0.05** (`TRAINER_CHAMPION_TYPE_CHANGE_CHANCE` in `constants.js`; wired through
  `backend/generator.js`, the browser worker, and the config form as `championTypeChangeChance`).
  All of Steven's battles (Granite Cave `TRAINER_STEVEN`, `PARTNER_STEVEN`, champion
  `TRAINER_CHAMPION_STEVEN`) use the resolved champion type instead of hard-coded STEEL.
- **Step 1.** Mark each of the 13 bosses *fixed* or *changed*. Gyms/E4 keep their existing
  count knobs (`gymsTypeChanged` 0–8, `e4TypeChanged` 0–4); the champion flips *changed* with
  probability `championTypeChangeChance`.
- **Step 2.** Assign every *fixed* boss its canonical type and build a shared pool = all
  POKEMON_TYPES minus the canonical types claimed by fixed bosses.
- **Step 3.** Assign each *changed* boss a type drawn (and removed) from the shared pool,
  excluding that boss's **own** canonical type so "changed" always differs.

This makes freed types (e.g. Roxanne's Rock, or the champion's Steel when it changes) eligible
for any other changed boss, and lets gyms/E4/champion share one type space.

Acceptance criteria:
- [x] Fixed bosses keep their canonical type; changed bosses always differ from their own canonical.
- [x] A type freed by a changed boss in one group can be drawn by a changed boss in another group
      (gym↔E4↔champion), verified by test.
- [x] `gymsTypeChanged` / `e4TypeChanged` counts are honoured exactly (0–8 / 0–4, clamped).
- [x] Champion changes its type with probability `championTypeChangeChance` (default 0.05); when it
      does not change it stays STEEL, and all three Steven battles share the resolved champion type.
- [x] When the champion is fixed, STEEL is unavailable to gyms/E4; when it changes, STEEL joins the pool.
- [x] `championTypeChangeChance` round-trips through backend, browser worker and config form (default 0.05).
- [x] `cd randomizer && npm test` green; frontend `node --test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Audited the current algorithm (`getTrainersData` in
  `randomizer/trainers.js` ~L639–703) and its consumers: `gymMainTypes[]`/`gymIsChangedType[]`
  arrays are indexed across the gym trainer defs; `e41..e44MainType` feed the E4 defs; the three
  Steven battles hard-code `POKEMON_TYPE_STEEL`. Config flows frontend `config-form.js` →
  worker `randomizer-worker.cjs` / backend `generator.js` → `getTrainersData`. `randomizer.bundle.js`
  is an esbuild artifact (gitignored, rebuilt by `node build.js`) — never hand-edited. Decided the
  own-canonical exclusion for changed bosses (matches the "Roxanne no es tipo roca" intent and the
  existing `trainerTypeThemeCounts` count invariant); proved the shared-pool draw can never get stuck
  (≥6 types remain before the last of 13 draws).
- **2026-07-09** — Implemented. `constants.js`: new `TRAINER_CHAMPION_TYPE_CHANGE_CHANCE = 0.05`.
  `trainers.js`: replaced the two walled-off `gym/e4AllowedTypes` pools with the unified 3-step
  algorithm + `samplePoolExcluding` helper; champion is the 13th slot (Bernoulli on the chance); all
  Steven battles + `themeTypeByClass['Steven']` now use `championMainType` (dropped the hard-coded
  Steel/Rock in the partner legend cascade). Config wired through `backend/generator.js`, the browser
  worker, `config-form.js` (percent input `#champion-type-change-pct` → 0..1) and the `app.js`
  summary. Red→Green: new `bossTypePool.test.js` (12 cases) failed on the champion path, passes now.
  Updated the spec of `trainerColorsPipeline` (pins `championTypeChangeChance:0` for deterministic
  Steel) and the `trainerTypeThemeCounts` comment; added frontend control + roundtrip tests. Full
  suites green (randomizer 759 pass / 1 skip; frontend 50 pass); esbuild bundle rebuilds clean.
  Awaiting owner manual test before closing.
- **2026-07-09** — Owner manually tested the generated output and confirmed it works. Closing.

## Outcome

Shipped the unified fixed/changed type pool over the 13 typed bosses. The two walled-off per-group
pools in `getTrainersData` (`gymAllowedTypes`/`e4AllowedTypes`, which excluded every canonical type
of the group plus a reserved Steel) are gone; instead fixed bosses claim their canonical type, the
shared pool is every unclaimed type, and each changed boss draws from it excluding only its own
canonical (`samplePoolExcluding`). Types freed by a changed boss are now eligible for any other
changed boss across groups, and Steel reservation emerges naturally from whether the champion is
fixed. The champion is the 13th slot, flipped changed by the new `championTypeChangeChance`
(default 0.05); all three Steven battles (Granite Cave, Mossdeep partner, champion) run the resolved
champion type.

Deviations from the plan: dropped the hard-coded Rock tier in the partner Steven legend fallback
cascade (it would have been off-theme once the champion can be non-Steel) — cascade is now
`[champion type] → [any legend]`. No follow-ups spawned. ADR-011's illustrative "Steven→Steel"
mention was left untouched (ADRs are immutable); the live SSOT is the `themeTypeByClass` code.

Files: `randomizer/{constants,trainers}.js`, `backend/generator.js`,
`frontend/js/{config-form,app}.js`, `frontend/js/randomizer-worker.cjs`, tests
(`bossTypePool.test.js` new; `trainerColorsPipeline`, `trainerTypeThemeCounts`, frontend
`config-form`/`config-roundtrip` updated), docs (`randomization-options.md`, `CHANGELOG.brooktec.md`).
