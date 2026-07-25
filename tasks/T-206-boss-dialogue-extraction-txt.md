---
id: T-206
title: Extract every boss's dialogue into an editable TXT (round-trip)
status: proposed        # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-149]
blocked-by: []
---

# T-206 — Extract every boss's dialogue into an editable TXT (round-trip)

## Context

The owner wants to review and rewrite the conversations around every boss in one convenient place. Go boss by
boss (each level-cap = a boss), find the boss in the map scripts, and extract its surrounding dialogue into
**four fields per boss**:
1. **pre-battle** conversation,
2. **in-battle intro** (presentation),
3. **on-defeat**,
4. **post-battle**.

Render it as a readable **script/screenplay** (who says what, in order across the whole scene) into a single
**TXT**, grouped by boss in cap order. Complex scenes (e.g. beating Archie — the cave sequence then the outside
sequence) should include **all** related text when in doubt. Deliverable flow: **(phase 1)** generate the TXT →
owner edits it freely → **(phase 2)** we read the edited TXT back and transform it into game text.

### Findings from the current code
- **Ordered boss/cap list (SSOT):** `src/caps.c:12-48` (`sLevelCapFlagMap`, 31 ordered `{FLAG, level}`
  entries, comments name each boss). A pre-joined boss→trainer bridge already exists:
  `frontend/data/bosscaps.json` + generator `randomizer/bossCaps.js:23+` (`BOSS_CAP_TRAINERS`, asserts 1:1 vs
  `caps.c`). Related: [T-149](T-149-trainer-levels-from-bosscaps.md).
- **Boss → script:** the boss's cap `flag` is `setflag`'d right after its `trainerbattle*` in that boss's
  `data/maps/**/scripts.inc`; the `TRAINER_*` id (from bosscaps) is what to grep for.
- **`trainerbattle` macro params** (`asm/macros/event.inc`): `:737` `trainerbattle_single trainer, intro_text,
  lose_text, event_script, music`; `:770` `trainerbattle_no_intro trainer, lose_text`. Mapping to the four
  buckets: **pre** = `msgbox` before the `trainerbattle*`; **intro** = the `intro_text` param (or the
  immediately-preceding `msgbox` for the `_no_intro` form); **defeat** = the `lose_text` param; **post** =
  `msgbox` after. Text bodies (`Label_Text_*: .string "…"`) sit at the bottom of each `scripts.inc`.
- **Examples:** Wattson `data/maps/MauvilleCity_Gym/scripts.inc:77`; Norman
  `data/maps/PetalburgCity_Gym/scripts.inc:371-372` (msgbox intro then `_no_intro` + `NormanDefeat`).

## Plan

Phase 1 (this task's deliverable): build a Node extractor (analysis tooling, no ROM build) that walks the boss
list in cap order, resolves each boss's `TRAINER_*`, locates its `trainerbattle*` in `data/maps/**/scripts.inc`,
collects the four buckets + the surrounding `msgbox`/`.string` chain (following the whole scene for complex
bosses), resolves `.string` bodies, and emits one screenplay-style TXT grouped by boss. Phase 2 (write-back)
happens **after** the owner edits the TXT — deferred until then (kept in this task or split out on owner request).

Acceptance criteria:
- [ ] A TXT is generated covering every boss in `caps.c` order, each with the four labelled fields, rendered as
      an ordered who-says-what dialogue.
- [ ] Complex/multi-stage boss scenes (e.g. Archie) include all related text, not just the trainerbattle params.
- [ ] The extractor is reproducible (a committed script), so the TXT can be regenerated after script changes.
- [ ] (Phase 2, later) a documented path to fold owner edits back into `data/maps/**/scripts.inc`.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Identified the boss SSOT (`caps.c:12-48`), the boss→trainer bridge
  (`bosscaps.json` / `bossCaps.js`), and the `trainerbattle` param→bucket mapping. Scoped as phase 1 (generate
  the editable TXT) with phase 2 (edit write-back) deferred until the owner returns the edited file.

## Outcome

<!-- Filled when closing. -->
