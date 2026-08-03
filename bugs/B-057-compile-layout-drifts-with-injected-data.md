---
id: B-057
title: "A compiled ROM's layout drifts with the DATA the randomizer writes, so inject(base) can never equal compile(bundle)"
status: wont-fix
severity: major         # critical | major | minor
created: 2026-08-02
updated: 2026-08-03
found-in: 0.7.0
fixed-in:
regression-test: randomizer/__tests__/unit/injectorLayoutDrift.test.js
links: [T-248, T-237, T-239, docs/base-plus-injection-strategy.md, docs/adr/ADR-022-base-plus-injection-architecture.md]
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

Not proven, and deliberately left unproven — The build uses `-flto=auto -ffunction-sections -fdata-sections`; the working hypothesis
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

The decision, the measurement behind it and the regression check live in
[T-248](../tasks/T-248-base-layout-stability-under-injected-data.md), scheduled before T-244.

Whichever is chosen, the regression test is the same and mechanical: **compile one corpus bundle and
assert that every symbol in its `.map` sits where the base's `.map` puts it** (INV-LAYOUT). That check
belongs next to the parity harness and is what would have caught this in Phase 2.

## Resolution (2026-08-03) — `wont-fix`: accepted by decision

**Option 2 was chosen** (see [T-248](../tasks/T-248-base-layout-stability-under-injected-data.md) and
[ADR-023](../docs/adr/ADR-023-injection-verified-by-data-equivalence.md)). The drift is real and stays;
what changed is the invariant.

Why accepting it is safe rather than resigned: the drift **cannot affect injection**. The base is built
once and every offset comes from that build's own `.map` — a base cannot react to data that does not exist
yet. The drift only appears when compiling a *different* ROM from scratch, which is the path being
removed. Image equality was convenient, never required: the shipped artifact is the injected ROM.

`wont-fix` rather than `fixed` on purpose. Nothing about the compiler's behaviour was changed, and a
future reader must not conclude the layout is stable now — it is not.

**What was built instead**, so accepting it costs no coverage:

- **INV-LAYOUT** (`randomizer/injector/layoutDrift.js`, the `regression-test` above): the gate now
  classifies drift on every bundle. A symbol that *moved* is expected and reported; an **injectable table
  that resized or vanished** fails — that is T-237's fixed-capacity premise breaking or the T-234/T-237
  garbage-collection trap, i.e. the drift that would genuinely break injection. Measured on the corpus:
  41,566 of 48,406 symbols moved, **0** injectable tables changed shape.
- **The coverage rule** in `randomizer/docs/injection.md`: the gate proves what a module *wrote*, so what
  no module writes needs a different check. The compile path's write surface is measured (31 files) and
  mapped to modules. [[B-060]] is what that omission cost before the rule existed.

If a stable layout is ever wanted for other reasons, the ten-minute `LTO=0` experiment in the Fix section
above is still the way to find out whether it is even available. It was **not** run: with option 2 chosen
it would inform nothing.

