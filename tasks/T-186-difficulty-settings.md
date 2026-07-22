---
id: T-186
title: Difficulty settings — non-boss quality, boss/non-boss team size and level modifiers
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-22
updated: 2026-07-22
target-version: 1.1.0
links: [randomizer/docs/randomization-options.md]
blocked-by: []
---

# T-186 — Difficulty settings — non-boss quality, boss/non-boss team size and level modifiers

## Context

Owner request: expand the Difficulty panel with six settings. One (the general quality slider) already
exists; the other five are new knobs that flow to the pipeline, the ROM and the generated docs. The
non-boss quality "extra jump" already exists internally as a hardcoded `-2` (`presets.js` `easyTransform`);
it just needs to be wired to a setting.

All new behaviour is centred at the single seam `randomizer/modules/trainersModule.js` `runTrainersModule`
(where the difficulty transform already runs). Team slots resolve to concrete Pokémon later
(`resolveTrainerTeam.js` via the writers), so mutating `trainer.team` (slot specs) and `trainer.level` here
flows into both the ROM `.party` and the docs with no writer/docs data changes.

The six settings (frontend Difficulty panel):

| # | Setting | UI | Default | Config key |
|---|---|---|---|---|
| 1 | General quality modifier | slider 1–13 | 7 (fair) | `difficulty` (already wired) |
| 2 | Non-boss quality modifier | slider −6..0 | **−2** | `nonBossQuality` |
| 3 | Boss team size | slider 1–6 (advanced) | 6 | `bossTeamSize` |
| 4 | Non-boss team size | slider 1–6 (advanced) | 6 | `nonBossTeamSize` |
| 5 | Boss level modifier | int text (advanced) | 0 | `bossLevelModifier` |
| 6 | Non-boss level modifier | int text (advanced) | 0 | `nonBossLevelModifier` |

Owner decisions (2026-07-22):
- Non-boss quality slider range **−6 to 0** (default −2). −2 reproduces today's non-boss derivation.
- Level and team-size modifiers **apply to everyone, including the story trainers currently exempt from
  the difficulty transform** (rival / Wally / Granite-Cave Steven). Champion Steven is NOT exempt and is
  always a boss. Battle **partners/allies** (`isPartner`) are excluded (they aren't enemies).

Design defaults (not owner-gated):
- Non-boss quality offset = extra `applyTransform` on non-boss teams; `extraShift = nonBossQuality − (−2)`,
  so default `−2` ⇒ 0 shifts ⇒ byte-identical.
- Team-size trim removes the **weakest** slots (lowest `TIER_SEQ` index), ranking mega/evolutionTier/
  oneOf/specific/special slots as strongest so an ace is never trimmed before an ordinary mon; keeps the
  top N; never below 1. Runs before battle-type assignment so a team shrunk to 1 shows singles everywhere.
- Level modifier adds to `trainer.level` (bosses vs non-bosses); final level clamped to [1, 100]. Bosses
  above the player's cap is the intended behaviour (the docs' level-cap readout is the *player's* cap and
  stays unchanged).
- `copy:` trainers are skipped in all three loops (they inherit the modified target automatically).
- All defaults reproduce today's ROM/docs byte-for-byte (no extra RNG draws at defaults).

## Plan

Pure difficulty-math helpers live in `presets.js` (the difficulty-math SSOT); `trainersModule.js` wires
them; both `toModuleConfig`s + the frontend form + docs carry the keys. TDD throughout.

1. `presets.js`: add + export `slotTrimStrength(slot)`, `trimTeamToSize(team, size)`, and
   `getNonBossQualityShift(modifier)` → `{delta, direction, numShifts}`. Unit-tested in `presets.test.js`.
2. `trainersModule.js`: read the 5 new config keys; apply (a) non-boss quality offset, (b) team-size trim,
   (c) level modifier — all before battle-type assignment; skip `copy`/`isPartner`. Tested in
   `trainersModule.test.js`.
3. Thread keys through `frontend/js/randomizer-worker.cjs` + `backend/generator.js` `toModuleConfig`.
4. `frontend/js/config-form.js`: DEFAULTS, HTML (Difficulty panel: 2 main + 3–6 advanced), getConfig,
   _restore, live descriptions, wiring. Tested in `config-form.test.js` + `config-roundtrip.test.js`.
5. `frontend/js/app.js`: run-summary rows.
6. `randomizer/docs/randomization-options.md`: new "Difficulty" section.
7. `node build.js` to rebuild `frontend/js/randomizer.bundle.js`.
8. `CHANGELOG.brooktec.md` [Unreleased] line.

Acceptance criteria:
- [x] `nonBossQuality` slider (−6..0, default −2) shifts non-boss team quality; −2 = byte-identical.
- [x] `bossTeamSize` / `nonBossTeamSize` (1–6, default 6) trim the weakest slots of boss / non-boss teams; 6 = no trim.
- [x] `bossLevelModifier` / `nonBossLevelModifier` (default 0) add to boss / non-boss trainer levels, clamped [1,100]; 0 = no change; applied to exempt story trainers too, never to partners.
- [x] All five keys round-trip through Save/Load + `lastConfig` and both `toModuleConfig`s.
- [x] `cd randomizer && npm test` green; `node --test frontend/__tests__/*.test.js` green.
- [x] Browser bundle rebuilt (`node build.js`); docs + changelog updated.
- [ ] Owner manually tests the Difficulty panel + a generated ROM/docs and confirms OK (close gate).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created. Mapped the seams: difficulty transform + bag offset in `trainersModule.js`;
  non-boss `-2` is `easyTransform` in `presets.js`; per-member level = single `trainer.level` resolved from
  caps at `trainers.js:3710`; slot→species resolution in `resolveTrainerTeam.js` (post-module). Owner
  confirmed non-boss range −6..0 and that level/size modifiers apply to exempt story trainers.
- **2026-07-22** — Implemented (TDD, Red→Green). `presets.js`: added `getNonBossQualityShift`,
  `slotTrimStrength`, `trimTeamToSize` (+15 unit tests). `trainersModule.js`: three new operations
  (non-boss quality offset, team-size trim, level modifier) between the difficulty transform and battle-type
  assignment, skipping copy/partner trainers (+12 tests). Threaded the 5 keys through both `toModuleConfig`s.
  Frontend `config-form.js`: 2 main sliders + Advanced sub-panel (team sizes + level inputs), DEFAULTS,
  getConfig/_restore, live descriptions + value readouts, wiring (+2 structural tests + round-trip).
  Run-summary rows in `app.js`. Rebuilt the browser bundle (`node build.js`). Docs + changelog updated.
  Green: randomizer 1523, frontend 100, backend 133. Learned mid-way that `applyTransform`'s `numShifts`
  is a count of SLOTS shifted one tier each (not tiers-per-slot) — corrected two just-written test
  expectations to the real mechanism (same as the difficulty slider). Awaiting owner manual test to close.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
