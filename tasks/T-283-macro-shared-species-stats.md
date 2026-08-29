---
id: T-283
title: Macro-shared species keep vanilla stats in the ROM while the docs show mutated ones
status: proposed
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
- [ ] The six species' mutations reach the ROM.
- [ ] A test pins that every co-user of each touched macro is a removed species.
- [ ] Injection stays identical to compilation (the injector re-runs the writer, so this is a
      consequence, but the corpus must confirm it).
- [ ] Failing-first regression test.
- [ ] `cd randomizer && npm test` green.
- [ ] Fresh golden-master baseline — this changes ROM bytes by design.

## Progress log

- **2026-08-14** — Investigated and re-scoped; no code yet. Corrections to the audit's F10:
  · It is a **writer** limitation, not an injector bug. The injector mirrors the writer on purpose.
  · Scope is **6 live species**, not "macro-defined species" broadly.
  · The audit implied Mothim's stats were the Burmy problem. They are *a* problem, but the docs≠ROM
    half of the Mothim complaint is this task, not T-287.
