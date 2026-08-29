---
id: T-283
title: Macro-shared species keep vanilla stats in the ROM while the docs show mutated ones
status: in-progress
type: fix
created: 2026-08-14
updated: 2026-08-14
target-version: 0.9.0
links: [T-277, T-154, T-239, T-244, B-062, randomizer/docs/injection.md]
blocked-by: []
---

# T-283 — Macro-shared species keep vanilla stats in the ROM while the docs show mutated ones

## Context

Finding F10 of the T-277 audit, re-scoped after investigating it properly. **The audit's framing was
too broad and the injector is not at fault.**

`pokemonWriter.editSpeciesFile` walks the source line by line: it recognises a species block by
`    [SPECIES_X] =` and then rewrites the `.baseHP` / `.types` / `.abilities` lines that follow it,
consuming a matching rebalance-log entry each time. A species written as
`[SPECIES_X] = SOME_SPECIES_INFO,` owns none of those lines — its stats live in a `#define` body
shared with its sibling forms — so the writer has nothing to edit and the species keeps its base
stats, while the parser read the macro and the docs happily show the mutated ones. A docs≠ROM defect,
the same class as B-062.

`injector/modules/species.js` is **deliberately** identical here: it runs `editSpeciesFile` itself
over the base sources and injects exactly the lines that changed, precisely so injection stays
byte-identical to the compile path (T-239/T-244, guarded by the golden-master corpus). Its header
already names the hazard this task has to handle: *"the pathological case where an unconsumed log
entry rewrites a macro body and so moves every species that uses it"*.

**Measured scope: six species**, not the hundreds the raw count suggests. 57 species blocks have no
inline `.baseHP`, but 51 of them are removed or cosmetic-stripped and never reach the dex. The six
that do are exactly the survivors T-154 kept from each collapsed cosmetic family:

`MOTHIM_PLANT` · `VIVILLON_ICY_SNOW` · `FLABEBE_RED` · `FLOETTE_RED` · `FLORGES_RED` ·
`ALCREMIE_STRAWBERRY_VANILLA_CREAM`

## Plan

Teach `editSpeciesFile` to follow a bare macro reference to its `#define` body and apply the species'
log there. Because the injector re-runs the writer, the ROM follows for free.

The shared-macro semantics must be asserted, not assumed: writing the body moves **every** species
that invokes the macro. For all six, every co-user is a removed species, so the blast radius is
unreachable forms — but a test has to pin that, or a future re-enable silently moves 19 Vivillon at
once.

Open question for the owner (does not block starting): Mothim's macro is shared with `MOTHIM_SANDY`
and `MOTHIM_TRASH`, which the ROM still lists as the Sandy and Trash Burmy's evolution targets (the
injector writes evolution *levels*, never targets). Writing the macro therefore gives all three the
same randomized stats, which quietly resolves that mismatch — **or** T-287 points all three cloaks at
`SPECIES_MOTHIM_PLANT` in the source and the ROM has one Mothim. The second is cleaner; it needs a
base-ROM rebuild.

Acceptance criteria:
- [x] The six species' mutations reach the ROM.
- [x] A test pins that every co-user of each touched macro is a removed species.
- [x] The latent leak is closed: an unconsumed log entry can no longer rewrite a macro body.
- [x] Injection stays identical to compilation (the injector re-runs the writer).
- [x] Failing-first regression test.
- [x] `cd randomizer && npm test` green.
- [x] `CHANGELOG.brooktec.md` line added.
- [ ] Fresh golden-master baseline — this changes ROM bytes by design.

## Progress log

- **2026-08-14** — Investigated and re-scoped; no code yet. Corrections to the audit's F10:
  · It is a **writer** limitation, not an injector bug. The injector mirrors the writer on purpose.
  · Scope is **6 live species**, not "macro-defined species" broadly.
  · The audit implied Mothim's stats were the Burmy problem. They are *a* problem, but the docs≠ROM
    half of the Mothim complaint is this task, not T-287.
- **2026-08-14** — Implemented TDD; `__tests__/unit/macroSharedSpeciesWrite.test.js` (14) red first.
  It turned out to be **two** defects, not one:
  · The write itself, and
  · a **latent leak** the injector's header had predicted: nothing reset the current species at a
    `#define`, so an unconsumed log entry from whichever species block preceded it rewrote the macro
    body and moved every species using it. My first version of that test passed by accident — the
    fixture's leftover entry had no matching line in the macro. Sharpening it (a species block with no
    `.types` line, a macro body with one) made it fail, which is the real hazard.
  Three spellings of "my stats live in a macro" had to be handled, found one at a time by the six
  species failing in turn:
  · `[SPECIES_MOTHIM_PLANT] = MOTHIM_SPECIES_INFO,`
  · `[SPECIES_VIVILLON_ICY_SNOW] = { VIVILLON_MISC_INFO(IcySnow, …), .description = … }` — a real
    block whose stat lines simply are not in it
  · `[SPECIES_ALCREMIE_…] = ALCREMIE_REGULAR_SPECIES_INFO(…),` whose body invokes
    `ALCREMIE_MISC_INFO(color)` — the stats are one hop further in, so ownership propagates inward.
  The nesting exposed a bug in my own ownership scan: it did not reset the species scope at a
  `#define`, so `ALCREMIE_MISC_INFO` was claimed by whichever species header preceded the outer macro.
  Same class of mistake as the leak it was written to fix.
  Ownership is restricted to macros whose body actually declares stat lines, which keeps the scan off
  `SHADOW()`, `FOOTPRINT()`, `OVERWORLD()` and friends.
- **2026-08-14** — Spec change to `__tests__/unit/injectorSpecies.test.js`, logged per the TDD rule.
  Its `describe` was titled *"what the writer cannot reach, the injector must not write"* and two of
  its cases asserted `writes.stats === 0` for a macro-backed species — the pre-T-283 contract. The
  module's real contract is **parity with the writer**, and that is untouched: the injector re-runs
  `editSpeciesFile`, so both paths changed together. Retitled and rewritten to assert the new parity,
  including that every species sharing a body moves with it, which is what the ROM can express.
- **2026-08-14** — Full suite green: 2714 passed. **ROM bytes change by design** — the six species
  finally receive their mutations, so the golden-master corpus needs a fresh baseline.

## Outcome
