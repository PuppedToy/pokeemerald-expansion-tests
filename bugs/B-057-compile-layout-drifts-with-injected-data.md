---
id: B-057
title: "A compiled ROM's layout drifts with the DATA the randomizer writes, so inject(base) can never equal compile(bundle)"
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-02
updated: 2026-08-02
found-in: 0.7.0
fixed-in:
regression-test:        # an INV-LAYOUT check (compiled .map vs base .map) — see Fix options
links: [T-237, T-239, docs/base-plus-injection-strategy.md, docs/adr/ADR-022-base-plus-injection-architecture.md]
---

# B-057 — compile()'s ROM layout drifts with injected data (breaks hash-equality INV-BYTES)

## Symptom

Found running GATE-3 for [T-239](../tasks/T-239-base-injection-inject-group-a-fixed.md) on a freshly
built clean base (`c144386ff4f3…`, 2026-08-02).

`compile(bundle)` does not place its symbols where the base does: **41,382 of 48,406 symbols move**,
everything from `src/starter_choose.o` onwards by 16 B. Since `inject(base, bundle)` writes *into the
base's* layout, the two images can never be byte-identical — which is what INV-BYTES / GATE-3 asks for
(ADR-022, [strategy](../docs/base-plus-injection-strategy.md)). Every corpus bundle fails the whole-ROM
comparison for this reason alone, before any injector correctness question is reached.

Reproduction (build box, clean tree, 2 vCPU container, `make -j2`):

```
git checkout -- src/                            # clean base tree
make -j2                                        # .text src/starter_choose.o = 2212
sed -i 's/    SPECIES_BAGON,/    SPECIES_FRIGIBAX,/' src/starter_choose.c   # ONE const u16 element
make -j2                                        # .text src/starter_choose.o = 2216  → 41,380 symbols move
```

That is a `const u16` **data** element changing four bytes of generated **code**.

What the bisection showed (each step = one clean rebuild, comparing every symbol address against the
base's `.map`):

| change | symbols moved |
|---|---|
| every writer applied **alone** (tms, item files, money, prices, relearn price, run&bun, steven tag, location/trade names, species data, evo levels, trades) | **0** |
| the full `writer()` | 41,382 (first: `GetExtraPokemonCount` +4) |
| …then restoring **only** `src/starter_choose.c` | **0** |
| `gStarterExtraMon` slot 0 → `SPECIES_FRIGIBAX` (1388) | 41,380 |
| `gStarterExtraMon` slot 0 → `SPECIES_PIKACHU` (25) | 0 |
| `gStarterExtraMon` slot 0 → `SPECIES_SNORUNT` (361) | 0 |
| `gStarterExtraMon` slot **1** → `SPECIES_FRIGIBAX` (the same species, one slot over) | 0 |
| `gStarterMon` slot 0 → `SPECIES_FRIGIBAX` | 41,382 (+8) |

So it is neither "slot 0 is special" nor "large ids are special" — it is a specific value in a specific
slot, which is the signature of a **codegen/LTO decision** reacting to the data, not of a table whose
size depends on its contents (the failure mode [T-237](../tasks/T-237-base-injection-fixed-capacity-layout.md)
fixed). Every array involved is fixed-capacity and unchanged in size; only `.text` grows, by 4 B.

## Root cause

<!-- Filled during the fix. -->

Not yet proven. The build uses `-flto=auto -ffunction-sections -fdata-sections`; the working hypothesis
is that an LTO codegen/partitioning decision in `starter_choose.o` reacts to the constant data (all six
starter arrays are `const` and read only through `noipa` accessors, so *value propagation into callers*
is already blocked — T-234/T-237 — but nothing stops the compiler from emitting different code inside
the object itself).

Worth measuring before choosing a fix: whether the drift survives `LTO=0` (see
[T-228](../tasks/T-228-analysis-rom-build-time-optimization.md), which already considers that flag).

## Fix

<!-- Options, for the owner to choose — this changes how Phase 3 is verified, so it is not a
     mechanical fix. -->

1. **Make the base's layout data-independent** (keeps hash-equality GATE-3): e.g. build with `LTO=0`, or
   move the injectable arrays into their own translation unit / `.rodata` section so no code can react to
   them. Cost: a base rebuild + a corpus re-snapshot, and possibly ROM size/perf changes from `LTO=0`.
2. **Redefine GATE-3 as data equivalence** (accepts the drift): compare each injected table against the
   compiled ROM *per symbol*, using each build's own `.map`, instead of comparing images.
   `backend/build/golden-corpus/parity.mjs --compile-each --by-symbol` already does this (T-239). The
   corpus keeps its value as a compile-path regression net (same bundle → same hash), but stops being the
   injection reference; the shipped ROM is the injected one, so image equality was never *required*,
   only convenient.
3. Both: (2) now so Phase 3 can proceed, (1) later if the layout is wanted stable for other reasons.

Whichever is chosen, the regression test is the same and mechanical: **compile one corpus bundle and
assert that every symbol in its `.map` sits where the base's `.map` puts it** (INV-LAYOUT). That check
belongs next to the parity harness and is what would have caught this in Phase 2.
