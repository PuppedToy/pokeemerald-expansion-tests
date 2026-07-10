---
id: T-116
title: Battle-type tag refinements — single/tag tags, Space Center tag battle, Run & Bun E4 labels, rival consistency
status: in-progress
type: feature
created: 2026-07-10
updated: 2026-07-10
target-version: 0.7.0
links: [T-083, T-087, T-115, docs/adr/ADR-014.md]
blocked-by: []
---

# T-116 — Battle-type tag refinements

## Context

Owner feedback after the PRO test of the T-115 battle-type badge, a coherent batch of refinements:

1. Drop the emoji and the uppercase styling from the Double Battle badge ("Double Battle").
2. Add a parallel **Single Battle** tag with its own colour.
3. Add a **Tag Battle** tag for the Mossdeep Space Center fight, applied to all **3** members
   (`TRAINER_MAXIE_MOSSDEEP`, `TRAINER_TABITHA_MOSSDEEP`, `PARTNER_STEVEN`) **even when the run is not
   mixed**.
4. In League Run & Bun, the E4 read as "Sidney Singles" / "Sidney Doubles" etc. — each with its
   appropriate single/double tag — plus a **Choice Battle** info box explaining you must fight X singles
   and Y doubles across the Elite Four (professionalised copy).
5. Rival consistency: every variant of a rival encounter (May's 3 starter variants + the Brendan
   copies) must share the same battle-type tag — generated together, and shared in the ROM too.

## Plan

- **battleFormat.js**: a new `tag` battle type for the Mossdeep trio (incl. `PARTNER_STEVEN`), assigned
  in every format; `unifyRivalBattleTypes` groups May's per-location starter variants to one type and
  makes `copy:`-linked trainers (Brendan) inherit their target's type.
- **trainersModule.js**: call `unifyRivalBattleTypes` after stamping; in Run & Bun set the E4
  `label`s ("Sidney Singles"/"Sidney Doubles") and a `choiceBattle {singles, doubles}` field.
- **writer.js / writerDocs.js**: the `copy:` block must carry `battleType` from its target (ROM +
  docs sharing for Brendan).
- **template.html**: render Single/Double/Tag tags (no emoji, title case, distinct colours) + the
  Choice Battle info box from `trainer.choiceBattle`.

Acceptance criteria:
- [x] Double Battle badge is title-case, no emoji; a distinct Single Battle badge exists.
- [x] The 3 Space Center members show a Tag Battle badge in every format (incl. non-mixed).
- [x] Run & Bun E4 read "<Member> Singles"/"<Member> Doubles" with the right tag + a Choice Battle box.
- [x] All variants of a rival encounter share one battle type (docs + ROM); Brendan inherits May.
- [x] `cd randomizer && npm test` + frontend `node --test` green. *(Visual render confirmed at T-092.)*

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-10** — Task created from owner PRO feedback (5 items).
- **2026-07-10** — Implemented on `feature/T-116-battle-tag-refinements`. **battleFormat.js**: renamed
  `EXCLUDED_IDS` → `TAG_BATTLE_IDS` and added `PARTNER_STEVEN`; a new `'tag'` battle type is assigned to
  the Mossdeep trio in *every* format (singles/doubles/mixed); added `unifyRivalBattleTypes` — groups
  `TRAINER_MAY_<loc>_<starter>` variants to one deterministic type and makes `copy:`-linked trainers
  (Brendan) inherit their target's type. **trainersModule.js**: calls `unifyRivalBattleTypes` after
  stamping; in Run & Bun sets each E4 base/clone `label` ("Sidney Singles"/"Sidney Doubles") and a
  `choiceBattle {singles, doubles}` from `runAndBunE4Split`. **writer.js/writerDocs.js**: the `copy:`
  block carries `battleType` (Brendan shares May's in the ROM), and the resolved objects carry `label`
  + `choiceBattle` so the docs/out.html show them. **template.html**: removed the emoji + uppercase;
  three distinct tags `.bt-single` (blue) / `.bt-double` (violet) / `.bt-tag` (teal), each rendered
  from `battleType`; a `.choice-battle` info box from `trainer.choiceBattle` on the Run & Bun E4 cards.
  Tests updated (spec change): battleFormat pool/format/tag/unify cases + the docs structural guards.
  Randomizer 811 pass / 1 skip; frontend 77 pass. Kept `in-progress` for the T-092 visual confirm.
  Merged to master.

## Outcome

<!-- Filled when closing. -->
