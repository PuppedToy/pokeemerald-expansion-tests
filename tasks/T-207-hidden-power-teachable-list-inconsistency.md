---
id: T-207
title: Hidden Power absent from teachable TM list but universally learnable
status: in-progress     # proposed | in-progress | done | abandoned
type: fix               # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-26
target-version: 0.6.0
links: [B-054, T-152, T-011, T-187]
blocked-by: []
---

# T-207 — Hidden Power absent from teachable TM list but universally learnable

## Context

Owner observation: Hidden Power does **not** appear in a Pokémon's list of learnable TMs in the generated
docs, yet it looks like every Pokémon can learn it. Investigation confirms this is a **real data-model
inconsistency** (not just a display quirk) — so per the bugs policy this should be formalised as a `B-NNN` bug
with a regression test that fails before the fix and passes after. Related:
[T-152](T-152-expand-tm-pools-and-doubles-tms.md) (TM pools incl. Hidden Power),
[T-011](T-011-moves-surfacing-icon-polish-champion-mail.md) (`buildTeachablesList` docs rendering),
[T-187](T-187-move-mutation.md) (teachable-move coloring in the same list).

### Findings from the current code (root cause)
- **Universal moves are never parsed.** In `src/data/pokemon/teachable_learnsets.h:98-108` `MOVE_HIDDEN_POWER`
  is listed under the *"Near-universal moves found from `sUniversalMoves`"* comment block — **not** in any
  per-species `sXTeachableLearnset[]` array. The parser only reads the per-species arrays
  (`randomizer/parser.js:694-709`, `parseTeachableFile`), so the generated `teachable_learnsets.json` contains
  **0** occurrences of `MOVE_HIDDEN_POWER`, and `pokedexModule.js:95` populates `poke.teachables` from that
  map. The randomizer therefore has **no concept** that Hidden Power (or Return/Frustration/Substitute/etc.) is
  universally learnable.
- **But it's a TM, so it leaks in randomly.** `MOVE_HIDDEN_POWER` is a TM (`include/constants/tms_hms.h:8`),
  classified in `tms.js:10`. In `teachableExpander.js` a base form seeds from
  `originalTeachables.filter(m => tmPool.has(m))` (`:50`) — which can never include Hidden Power (it was never
  in `originalTeachables`) — yet it sits in `remaining` (`:54`) and can be **randomly rolled in** as a
  `newTeachable` (`:88-103`). So ~half the roster shows Hidden Power (rolled that run) and ~half doesn't.
- **Docs render verbatim:** `frontend/template.html` `buildTeachablesList` (`:2271-2310`) shows
  `poke.teachables` as-is — hence the inconsistent list.

### Fix direction
Inject the `sUniversalMoves` set (Hidden Power + the other universals) into every `poke.teachables` — either in
`pokedexModule`/`teachableExpander`, or by parsing the `sUniversalMoves` array so `parseTeachableFile` seeds
them per species. Decide whether universals should read as "old" (base, greyed) teachables vs "new".

## Plan

Register a `B-NNN` bug (symptom + repro), write a failing regression test that Hidden Power (and the other
universals) is present in `poke.teachables` for **every** species, then seed the universal set so it always
appears. Reconcile display class (old vs new). Rebuild the browser bundle.

Acceptance criteria:
- [x] `B-054` registered; regression test `randomizer/__tests__/unit/universalTeachables.test.js` fails before
      and passes after (annotated with the bug id).
- [x] Every species' `teachables` includes the `sUniversalMoves` set (that is in the run's TM pool — Hidden
      Power, Return, Frustration, Secret Power), consistently across runs — not dependent on random rolls, and
      never spuriously "starred" as newly-granted.
- [x] `cd randomizer && npm test` green (1697 passed); bundle rebuilt. *(Docs render `poke.teachables`, which now
      always carries Hidden Power → shows for all Pokémon.)*

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Root-caused: universal moves live in `sUniversalMoves`
  (`teachable_learnsets.h:98-108`), which `parseTeachableFile` (`parser.js:694-709`) never reads, so
  `teachable_learnsets.json` has 0 Hidden Power; it only appears when randomly rolled as a `newTeachable`
  (`teachableExpander.js:88-103`). Confirmed real inconsistency → needs a bug + regression test before closing.
- **2026-07-26** — **Implemented (in-progress), TDD Red→Green + B-054 registered.** Found the rater also reads
  `poke.teachables` (filtered by `tmPool`), so this isn't display-only — it also removes RNG noise from ratings
  for mons that didn't roll these moves. Blast radius is small in practice: the rater already de-values non-STAB
  Normal filler (Return/Frustration/Secret Power), so they rarely enter a rated moveset. New
  `parseUniversalMoves` (`parser.js`), threaded through `pokedexModule` → `expandAllTeachables` →
  `buildRunTeachables`, which folds universal moves **that are in the run's TM pool** into each mon's base
  teachables (never starred, never greyed; non-pool universals like Bide skipped). Updated the two `parser`
  mocks (`pokedexModule.test.js`, `moveMutationPipeline.test.js`) to expose the new fn. Full randomizer suite
  green (1697 passed). Rebuilt the browser bundle. **Note for the owner:** the real per-mon rating shift is only
  visible on a full `analyze.js`/build run — worth a spot-check, though expected to be minor.

## Outcome

<!-- Filled when closing. -->
