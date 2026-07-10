---
id: T-090
title: ROM E4 scripts — in-game singles/doubles prompt + remaining-choices counter + build-time VAR
status: in-progress
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
- [x] In Run & Bun, each E4 member prompts singles/doubles only while that quota remains, then forces
      the remaining type; counters decrement correctly. *(Logic implemented; behaviour confirmed on the
      builder/PRO at the T-092 checkpoint.)*
- [x] The choice launches the correct trainer id (base=singles, `_DOUBLES`=doubles).
- [x] Non-Run&Bun runs never prompt (mode gate = `VAR_RUNANDBUN_MODE` 0).
- [x] Champion is never prompted (Champion's room script untouched).
- [ ] Compiles in CI / on the builder; script logic reviewed (no local GBA toolchain).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-09** — Task created. Note: map-script/C change — verified via CI or the builder, not
  locally. Injection point confirmed at the per-member `EventScript_<Member>` labels.
- **2026-07-10** — Implemented on `feature/T-090-e4-battle-style`. Repurposed 3 unused persistent VARs
  in `include/constants/vars.h`: `VAR_RUNANDBUN_MODE` (0x409B), `VAR_RUNANDBUN_SINGLES_LEFT` (0x409D),
  `VAR_RUNANDBUN_DOUBLES_LEFT` (0x40A1) (persistent, not temp — temp vars reset on the per-room map
  change). Added the shared `PokemonLeague_EliteFour_EventScript_ChooseBattleStyle` helper +
  `..._Text_ChooseBattleStyle` to `data/scripts/elite_four.inc`: mode 0 → always singles (no prompt);
  else while a quota remains it `MSGBOX_YESNO`-asks and decrements, forcing the other type when one is
  exhausted; sets `VAR_RESULT` = 1 (doubles) / 0 (singles). Each of the 4 E4 rooms
  (`EverGrandeCity_{Sidneys,Phoebes,Glacias,Drakes}Room/scripts.inc`) now `call`s it after the intro and
  `goto_if_eq VAR_RESULT, 1` branches to a new `..._<Member>Doubles` label that runs
  `trainerbattle_no_intro TRAINER_<X>_DOUBLES` (doubles flag rides on the trainer data, so no
  `trainerbattle_double` needed). Sidney's `OnTransition` initialises the quotas once
  (`..._EventScript_InitRunAndBun`, guarded by `FLAG_DEFEATED_ELITE_4_SIDNEY` unset) with committed
  defaults **mode 0 / singles 4 / doubles 0** (so the base compiles + never prompts); the maker
  overwrites those `setvar` values per bundle (T-091). Champion room untouched. Verified `subvar`,
  `goto_if_eq`, `call_if_unset` macros + `YES` symbol exist. Blind-asm — compile validated on the
  builder/PRO. Kept `in-progress`. To merge to master next.

## Outcome

<!-- Filled when closing. -->
