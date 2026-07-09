---
id: T-090
title: ROM E4 scripts — in-game singles/doubles prompt + remaining-choices counter + build-time VAR
status: proposed
type: feature
created: 2026-07-09
updated: 2026-07-09
target-version: 0.7.0
links: [T-083, T-084, T-088]
blocked-by: [T-088]
---

# T-090 — ROM E4 scripts — in-game singles/doubles prompt + remaining-choices counter + build-time VAR

## Context

The in-game Run & Bun behaviour: at each Elite Four member, if the player still has doubles (or
singles) choices left, the game asks "singles or doubles?" and branches to the matching trainer id;
once a quota is exhausted, it goes straight to the forced type. The E4 rooms use a uniform script
pattern (`trainerbattle_no_intro` after the intro `msgbox`) with a clean injection point; spare VARs
exist (`include/constants/vars.h`), and the writer can preset a VAR at build time via token
replacement (precedent: `randomizer/writer.js:316-387`).

## Plan

- Reserve/alias two VARs: a **remaining doubles-choices** counter and a **remaining singles-choices**
  counter (or one counter + total), initialised at build time. Add a friendly `#define` alias like
  the temp-var pattern (`vars.h:315-322`), repurposing an `// Unused Var`.
- In each of the four E4 `EventScript_<Member>` labels
  (`data/maps/EverGrandeCity_{Sidneys,Phoebes,Glacias,Drakes}Room/scripts.inc`), inject before the
  `trainerbattle_no_intro` line: if Run & Bun mode is active and choices remain, `MSGBOX_YESNO`
  (or multichoice) → decrement the chosen counter → branch to the base (singles) or `_DOUBLES` id;
  otherwise fall through to the forced type. Consider a shared helper in
  `data/scripts/elite_four.inc` called from all four rooms.
- Champion is untouched by the prompt (always the majority type; single team).
- A mode gate VAR distinguishes "Run & Bun active" from plain mixed so non-Run&Bun runs never prompt.
- Placeholder tokens for all preset values so the maker (T-091) can substitute per build.

Acceptance criteria:
- [ ] In Run & Bun, each E4 member prompts singles/doubles only while that quota remains, then forces
      the remaining type; counters decrement correctly.
- [ ] The choice launches the correct trainer id (base=singles, `_DOUBLES`=doubles).
- [ ] Non-Run&Bun runs never prompt (mode gate honoured).
- [ ] Champion is never prompted.
- [ ] Compiles in CI / on the builder; script logic reviewed (no local GBA toolchain).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Note: map-script/C change — verified via CI or the builder, not
  locally. Injection point confirmed at the per-member `EventScript_<Member>` labels.

## Outcome

<!-- Filled when closing. -->
