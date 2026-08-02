---
id: T-240
title: "Base+injection Phase 3 — inject level-up learnsets + teachable/TM-HM compatibility (Group B)"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-02
target-version: 0.7.0
links: [T-229, T-239, T-238, T-237, T-233, B-057, randomizer/docs/injection.md]
blocked-by: [T-239]
---

# T-240 — Inject learnsets + TM/tutor compatibility (Group B)

## Context
**Start by reading [T-239](T-239-base-injection-inject-group-a-fixed.md)'s progress log and
[injection.md](../randomizer/docs/injection.md).** The first migrated module paid for two rules this one
inherits — mirror the writer's *decision*, not just its values, and derive struct offsets/strides from the
base instead of declaring them — and it left the base, the offset map and the gate command in place.

First variable-length migration. Uses the T-237 fixed-capacity layout (B1) or repoint (B2). Teachable
learnsets ARE the TM/HM+tutor compatibility source (no per-species bitfield). See
[strategy Group B](../docs/base-plus-injection-strategy.md#group-b--variable-length-inject-via-reserved-capacityfree-space).

## Plan
Inject level-up learnsets and teachable learnsets into their reserved-capacity slots (or repoint). Run the
gate after each (the per-module checklist in [injection.md](../randomizer/docs/injection.md) has the
command; it is data equivalence per symbol, not sha256 — see [[B-057]] / [[T-248]]).

**No repoint is needed.** T-237 already made both families fixed-capacity
(`LEVEL_UP_LEARNSET_CAPACITY` 44 × 4 B = 176 B, `TEACHABLE_LEARNSET_CAPACITY` 80 × 2 B = 160 B) and
dropped their `static`, so all 1104 + 1101 arrays are exported, locatable **by their own name** in the
`.map`, and overwritten in place. This is a B1 module wearing a Group-B label: variable-length data in a
fixed-capacity slot.

Writer audit, done before coding (`randomizer/pokemonWriter.js`) — the *decision rules* to mirror:

| | `editLearnsetsFile` | `editTeachableLearnsets` |
|---|---|---|
| keyed by | array name, `pokemonList.find(p => p.levelUpLearnset === name)` | same, on `p.teachableLearnset` |
| the list | `pokedex.pokes` **minus `BANNED_SPECIES_FOR_PICKING`** (writer.js filters before `savePokemonData`) | same |
| first match wins | yes — every mega shares its base form's array id, and the base wins ([[T-062]]) | yes |
| unmatched array (`sNone*`, a form the run dropped) | left at the base's data | left at the base's data |
| **empty payload** | **rewritten** — the block becomes just `LEVEL_UP_END` | **skipped**, the base's list survives |
| terminator | `LEVEL_UP_END` = `{ .move = LEVEL_UP_MOVE_END, .level = 0 }` | `MOVE_UNAVAILABLE` |
| overflow | throws (payload + terminator > capacity) | throws |

Two things follow that are not in the writer's text but are in the ROM it produces:

- **The tail must be zeroed.** A compiled `[CAPACITY]` array with fewer initializers is zero-filled by C,
  so injecting a *shorter* learnset over a longer base one has to clear the rest of the slot or the
  leftover base entries survive past the terminator and the ROM differs from `compile()`.
- **Entry layout is `{ u16 move; u16 level; }`** — move first (include/pokemon.h), i.e. *not* the order
  `LEVEL_UP_MOVE(lvl, move)` reads in.

Design, following T-239's two inherited rules (mirror the decision, derive from the base):

1. **Capacity is derived, never declared.** Each slot's entry count comes from its own symbol size
   (`size / 4`, `size / 2`) and is cross-checked against `randomizer/layout.js` (which reads the C
   header — one home). A symbol whose size isn't the capacity throws.
2. **Every slot is proved before it is written**, the way `wildEncounters` proves its 165 tables:
   parse the base's `gen_9.h` / `teachable_learnsets.h` and byte-match each array against the base ROM.
   That single check pins the field order, the terminator values, the name→symbol mapping and
   "these sources and this ROM are the same build" — and it is the guard that fires if the base ever
   compiles a different `P_LVL_UP_LEARNSETS` gen file (all nine define the same array names).
3. Arrays the base does not export (an `#if P_FAMILY_*`-disabled family) are skipped — the compile path
   drops them too.

Acceptance criteria:
- [x] Level-up learnsets injected; the gate is green on the whole corpus. (`parity.mjs --compile-each
      --by-symbol`, **ALL PASS — 12 pass / 0 fail**, 2026-08-02, base `c144386ff4f3…`.)
- [x] Teachable/TM-HM+tutor compat injected; the gate is green. (Same run — both families ship in one
      registry entry and are covered by the same 12 ROMs.)

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-02** — Started. Branch `feature/T-240-inject-learnsets-tm-compat` off T-239's branch (the
  Phase-3 batch is manually tested together, and T-239 is not on master yet). Read T-239's log and both
  writers before coding; the audit table and the three design rules above are the result. Two findings
  worth calling out: the two writers **disagree on the empty payload** (level-up rewrites, teachable
  skips), and the fixed-capacity tail has to be zero-filled — neither is visible in the writer's output
  text, only in the ROM the compiler makes of it.

- **2026-08-02 — MODULE DONE (local): 1 new module, 31 new tests, suite 2002 + backend 214 green.**
  RED first (the file failed on the missing module, then on each behaviour). What it does and why:
  - **`injector/modules/learnsets.js`** — one file for both families, because they are the same shape
    (name-keyed fixed-capacity array, terminator, zero tail) and differ only in the three rules the
    audit table above lists. Both are driven off the **base source**, not off the bundle: the module
    walks `gen_9.h` / `teachable_learnsets.h`, resolves each array name in the `.map`, and writes the
    slot the run claims. `structLayout` gained `LEVEL_UP_MOVE` (`{ u16 move; u16 level; }`, move first)
    and `TEACHABLE_MOVE`.
  - **Every slot is verified against the base source before anything is written** — one pass, then a
    write pass, so a build mismatch cannot leave a half-injected ROM. It is also the only thing that can
    prove the field order and the name→symbol mapping on a real base; a synthetic fixture cannot,
    because both sides of it come from the same constant (a test says so out loud).
  - **A run that claims arrays the base exports NONE of is refused.** Silent no-ops are how the
    T-234/T-237 trap ships base data inside a "randomized" ROM, and a learnset module that writes
    nothing looks exactly like a successful one.
  - Falsifiability was checked by breaking the implementation three ways (drop the zero-fill → 2 RED;
    swap the `{move, level}` order → 5 RED; treat an empty teachable list like an empty level-up one →
    1 RED), not just by watching the file go green.
  - **Dry run against a real production bundle** (`bundle-2653882998`, 1230 mons) before touching the
    box: 1102/1104 level-up and 1099/1101 teachable arrays written (`sNone*` and
    `sFloetteEternal*` are the two nobody claims), longest payloads 33/41 against capacities 44/80, no
    unknown move, no array the bundle names that the sources do not declare, **87 arrays claimed by more
    than one pokémon** (the first-match rule is load-bearing, not theoretical) — and exactly **one**
    array where the banned-species filter changes the winner (`sTerapagosLevelUpLearnset`:
    TERAPAGOS_NORMAL is banned, so TERASTAL writes it). Without the filter that one array would have
    failed GATE-3, the same way Castform did in T-239.
  - `parity.mjs` had to stop calling `attributeDiff` **once per journal entry** — it re-sorts all ~48k
    symbols per call, and this module takes the journal from ~40 writes to 2201. One call for the whole
    journal; same attribution, minutes → seconds.
  - Registry entry flipped to `migrated` (lazily required, as T-239's is). T-238's board test and the
    backend's pending-module test updated: the board advanced, which is a deliberate spec change.
  - No changelog line: internal infrastructure, nothing user-visible yet (same call as T-232/T-238/T-239).

- **2026-08-02 — GATE-3: RED first (11/12), one real bug, then GREEN 12/12.**
  Ran in T-239's isolated tree on the box (`/opt/t239-gate3`, never production) — **T-240 changes no C
  source**, so that tree's base ROM and its whole `.gate3-cache/` of compiled corpus ROMs were still
  valid references. Verified before syncing: every JS/C file I did not touch is byte-identical between
  the tree and this branch, so only four files went over. Cost: no rebuild, ~7 min of injection.
  - **BUG — the base anchors cannot be re-run once a module has written.** 11 of 12 ROMs failed with
    `SPECIES_BULBASAUR.baseAttack should be 49 but the base reads 59`: `applyLearnsets` built its own
    context, and by then `group-a-fixed` had already rebalanced `gSpeciesInfo` **in the same buffer**.
    The anchors are the *base's* data, so they only read back from a pristine ROM. Only `rebalance-off`
    passed — the one bundle that changes no stats — which is what made the diagnosis immediate.
    Fixed in `injector/context.js`: **one context per ROM** (WeakMap on the Rom instance), so the first
    module pays for the anchor check on the pristine base and later modules reuse it; asking for a
    *first* context on an already-written ROM now throws instead of reporting a fake layout mismatch.
    Two named tests. This is a T-239 file changed under T-240 because the second migrated module is the
    first thing that could ever have found it.
  - **GREEN after the fix: `ALL PASS — 12 pass / 0 fail`**, every injected table matching `compile()` by
    symbol across baseline, doubles, economy, mutate-moves, nicknames-on, nuzlocke-3 (×3),
    rebalance-off, runbun-mixed, steven-off and wild-classic — i.e. the 2201 learnset slots of each ROM
    plus everything Group A already covered, on the same base `c144386ff4f3…`.
  - **No re-snapshot needed**: the 12 fresh compile-path hashes the run printed are identical to the
    committed `manifest.json`, which is the expected consequence of an injector-only change and a
    second, independent check that nothing leaked into the compile path.
  - The gate stays "data equivalence per symbol", not image equality — [[B-057]] / [[T-248]].

## Outcome
