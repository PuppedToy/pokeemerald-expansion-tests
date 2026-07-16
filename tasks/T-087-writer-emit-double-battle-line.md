---
id: T-087
title: Writer emits/rewrites the Double Battle header per trainer from the bundle battle type
status: done
type: feature
created: 2026-07-09
updated: 2026-07-15
target-version: 0.7.0
links: [T-083, T-086]
blocked-by: [T-086]
---

# T-087 — Writer emits/rewrites the Double Battle header per trainer from the bundle battle type

## Context

Today `randomizer/writer.js` rewrites only a trainer's team members and preserves the whole
`=== TRAINER_X ===` header block verbatim (regex at `writer.js:836-867`), so the base
`.party`'s `Double Battle: No` is inherited unchanged. To honour the randomizer's per-trainer
battle type ([T-086](T-086-randomizer-assign-battle-type.md)) the writer must set the
`Double Battle:` line. The `.party` parser (`tools/trainerproc`) and the C `battleType` struct
already fully support doubles — no C change needed here.

## Plan

- Extend the writer's per-trainer rewrite so the emitted header carries
  `Double Battle: Yes|No` matching `battleType` from the resolved team data — either by widening the
  header-preserving regex to also capture/replace the `Double Battle:` line, or by injecting/updating
  it during header reconstruction. Handle trainers whose base entry has no `Double Battle:` line.
- Apply the same logic in the docs-building path so `docs.trainersResultsSimplified` and the written
  `.party` agree (avoid the historical `writer.js`/`writerDocs.js` drift).
- Leave `battle_partners.party` and the excluded tag-battle trainers untouched.
- Regression tests: given a bundle marking a trainer doubles, the written `.party` shows
  `Double Battle: Yes`; a singles trainer shows `No`; the header is otherwise byte-identical.

Acceptance criteria:
- [x] Written `.party` `Double Battle:` line matches each trainer's `battleType` (helper + writer
      wiring unit-tested; the built `.party` file is confirmed end-to-end at the T-092 checkpoint).
- [x] Trainers with/without an existing `Double Battle:` line are both handled correctly.
- [x] The rest of the header block is preserved unchanged (test).
- [x] Excluded/partner trainers are not modified.
- [x] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.
- **2026-07-09** — Implemented on `feature/T-087-writer-double-battle` (TDD, red→green). Two pure
  exported helpers in `writer.js`: `applyDoubleBattleHeader(headerBlock, battleType)` replaces the
  header's `Double Battle:` line (or inserts it before `AI:` when absent), and leaves the header
  untouched for undefined/unknown battleType (back-compat with pre-field bundles);
  `effectiveBattleType(battleType, teamLength)` is the ≥2-mon safety net (doubles with <2 written mons
  → singles). The `.party` write loop now uses a function replacer that rewrites group-1 (the header)
  via these helpers for non-partner trainers, keyed off the actually-written `shuffledTeam.length`.
  Propagated `battleType` into the resolved objects so it reaches the docs SSOT and the ROM: `writer.js`
  `buildTrainersResultsFromDocs` + the randomize-mode builder, and `writerDocs.js` both the normal and
  the `copy:` (Brendan↔May) builders (defaulting to `'singles'`). `buildTrainersResultsSimplified`
  spreads `{...trainerData}`, so `docs.trainersResultsSimplified` now carries `battleType`
  automatically. Tests: `__tests__/unit/battleTypeWriter.test.js` (7 cases). Full suite green
  (790 pass / 1 skip; +7). Note: the `node analyze.js` (non-bundle) randomize copy path keeps a copy
  trainer's base `Double Battle` line when battleType is absent — harmless (production is docs-driven).
  Kept `in-progress` for the T-092 checkpoint. Merged to master.

## Outcome

Writer emits/rewrites the `Double Battle:` header per trainer from the bundle battle type (docs-driven production path). battleTypeWriter.test.js (7). Suite green. Owner-validated 2026-07-15. Closed.
