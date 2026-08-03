# ADR-023: Injection is verified by data equivalence per symbol, not by image equality (amends ADR-022)

- **Status:** accepted
- **Date:** 2026-08-03
- **Task:** T-248 (bug: B-057)

## Context

[ADR-022](ADR-022-base-plus-injection-architecture.md) chose a **byte-identical golden master** as the
verification for base+injection, precisely because it needs no judgement: build a bundle both ways,
compare the two sha256s, done.

That check turned out to be unavailable. [B-057](../../bugs/B-057-compile-layout-drifts-with-injected-data.md),
found by T-239's first GATE-3 run on a clean base: **a compiled ROM is not laid out like the base**. One
`const u16` element of `gStarterExtraMon` changing value adds four bytes of generated code and moves
41,382 of 48,406 symbols. Bisected to a single value in a single slot — the same species one slot over
moves nothing — which is the signature of an LTO codegen decision reacting to data, not of a table whose
size depends on its contents (the failure mode T-237 already fixed; every array involved is
fixed-capacity and unchanged in size, only `.text` grows).

`inject(base, bundle)` writes **into the base's layout**. `compile(bundle)` produces **its own**. The two
images therefore cannot be identical, however correct the injector is, and every corpus bundle failed the
whole-ROM comparison before any injector question was reached.

Two facts made the choice below easy:

- The drift cannot affect injection. The base is built **once**, and every offset is read from that
  build's own `.map`; a base cannot react to data that does not exist yet. The drift only appears when
  compiling a *different* ROM from scratch, which is the thing we are removing.
- Image equality was **convenient, never required**. The artifact shipped to players is the injected ROM.
  What has to be true of it is that it carries the right data — not that some other build of it would
  have landed at the same addresses.

## Decision

**GATE-3 is data equivalence per symbol.** For every table a module writes, compare its bytes in the
injected ROM against the same table in a compiled ROM, each located through its own build's `.map`
(`backend/build/golden-corpus/parity.mjs --compile-each --by-symbol`). Image equality is not required of
an injected ROM and is not asserted.

The golden-master corpus keeps its original value as the **compile path's** regression net — same bundle,
same hash — and stops being the injection reference.

Because that check only looks where the injector wrote, it cannot answer *"was anything left
unwritten?"*. Two things cover that gap, and both are consequences of this decision rather than
afterthoughts:

1. **Coverage, not equivalence.** Every file the compile path mutates must be claimed by a module. The
   write surface is measured empirically (31 files today) and mapped to modules in
   `randomizer/docs/injection.md`. This is what [B-060](../../bugs/B-060-mega-stone-map-items-never-injected.md)
   cost us: a forgotten output writes no bytes, so no byte comparison can see it.
2. **INV-LAYOUT, as a tripwire.** `randomizer/injector/layoutDrift.js`, run by the gate on every bundle:
   a symbol that *moved* is expected and reported; an **injectable table that resized or vanished** fails
   the gate. That is the drift that would break injection — T-237's fixed-capacity premise gone, or the
   T-234/T-237 garbage-collection trap — and nothing else in the harness would notice it.

## Alternatives considered

- **Stabilise the layout with `LTO=0`** so hash equality returns. Not adopted: it pays ROM size and build
  time for a check we no longer need, and the experiment (does `LTO=0` even stabilise it?) was left
  unrun for the same reason — it only matters to someone who wants this option. B-057 records how to
  measure it in ten minutes if that day comes.
- **Isolate the injectable tables in their own translation unit/section** so codegen cannot react to
  them. Same verdict: real work, and the only prize is a more convenient comparison.
- **Compare every symbol's content** between injected and compiled ROMs, not just the written ones —
  a stronger version of this decision that would also close the coverage gap by machine. Rejected *for
  now* because pointer fields legitimately differ by address and would need a tolerance model; the
  coverage table is the cheaper answer. Worth revisiting at T-244, when the compile path is removed.

## Consequences

- Phase 3 could proceed and did: 12/12 corpus ROMs, table by table, for all five modules.
- Anyone reading ADR-022's "byte-identical" wording must read this ADR with it. ADR-022 is not rewritten
  (ADRs are immutable); its verification clause is amended here.
- A weaker gate means the **play-test is not a formality**. Of the four defects the first play-test found,
  three were structurally invisible to every automated check: two were correct data the *code* never read
  (B-058), one was an output nobody wrote (B-060). Keep a human in the loop before flipping the switch.
- The corpus's `manifest.json` still tracks base sha + per-bundle hashes, and must be re-snapshotted on
  every base change — now as the compile path's own regression net, not as injection's reference.
