---
id: T-087
title: Writer emits/rewrites the Double Battle header per trainer from the bundle battle type
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
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
- [ ] Written `.party` `Double Battle:` line matches each trainer's `battleType`.
- [ ] Trainers with/without an existing `Double Battle:` line are both handled correctly.
- [ ] The rest of the header block is preserved unchanged (test).
- [ ] Excluded/partner trainers are not modified.
- [ ] `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created.

## Outcome

<!-- Filled when closing. -->
