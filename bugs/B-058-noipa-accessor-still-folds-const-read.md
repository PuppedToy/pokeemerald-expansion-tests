---
id: B-058
title: "A `noipa` accessor still folds its `const` global read, so four injectable scalars are dead in inject mode"
status: open
severity: critical
created: 2026-08-02
updated: 2026-08-02
found-in: 0.7.0
fixed-in:
regression-test:
links: [T-234, T-237, T-243, T-070, T-202, T-068, ADR-022]
---

# B-058 — A `noipa` accessor still folds its `const` global read

## Symptom

Found by the owner's first play-test of an **injected** ROM (bundle `2653882998`, 2026-08-02):

- Route auto-nicknames (T-070) never appear on a caught wild Pokémon, on any of the 134 named maps.
- The Gym-1 reward (a static/legendary gift, same code path) has no nickname either.
- Town-trade auto-nicknames (T-202) never appear; the traded mon keeps its species name.
- Starter and extra-starter nicknames **do** work, which is what made the pattern visible.

The data is in the ROM. `gLocationNicknameCount` = 134, `gTradeNicknameCount` = 4 and all the rows are
present and correct — verified by reading the injected ROM back and diffing against the bundle's own
docs (26/26 checks matched). GATE-3 is green on the whole corpus for these tables, because
`inject(base, bundle)` really does carry the same bytes `compile(bundle)` would have.

The bug is that the **code** never reads them.

## Root cause

`__attribute__((noipa))` stops the compiler propagating a function's return value into its *callers*.
It does **not** stop the compiler constant-folding a read of a `const` global *inside the function's own
body* — there is nothing interprocedural about that fold. T-234/T-237 adopted the accessor pattern after
seeing the table garbage-collected, and verified the fix by checking the symbols were back in the `.map`.
They are: the table survives because the (never-executed) lookup loop still references it. Only the
*count* was folded, and a symbol being present says nothing about it being read.

Disassembling the four-byte accessors in the base proves it — `movs rN, #imm; bx lr`:

| accessor | compiles to | consequence when injected |
|---|---|---|
| `GetLocationNicknameCount` | `return 0` | the lookup loop runs zero times → every route/static nickname is NULL |
| `GetTradeNicknameCount` | `return 0` | every trade nickname is NULL |
| `GetExtraPokemonCount` | `return 9` | correct only by coincidence — 9 is the committed base's count; any bundle with a different number of extra starters gets the wrong count |
| `GetStarterGender` | `return 255` | `MON_GENDERLESS`, so the starter's forced gender is silently ignored |

The accessors that work do so because there is nothing foldable in them: `GetStarterNickname` and
`GetRandomizerSettings` return an **address**, and `GetGymReward` / `GetItemPickItem` /
`GetExtraPokemon` / `GetExtraStarterNickname` / `GetExtraStarterGender` index an array with a **runtime**
argument. Every broken one returns a scalar copied out of a `const` global.

**The compile path is unaffected**, which is why this survived every gate: the writers rewrite the count
in the *source*, so the compiler folds in the correct value. The defect exists only when the value is
supposed to arrive after the build — i.e. only in inject mode. No byte comparison between an injected and
a compiled ROM can ever see it: the injected bytes are right, and the injector does not touch code.

## Fix

<!-- Filled during the fix. Planned: force a real load at the four sites —
     `return *(const volatile u8 *)&gLocationNicknameCount;` — since a volatile access cannot be folded
     or elided. `noipa` stays (it keeps the caller honest). This changes the base, so the golden base and
     the corpus manifest must be rebuilt and re-snapshotted (owner-gated, as in T-239).

     Regression test: a detector in buildOffsetMap.js's readiness report — any accessor the injector
     depends on whose compiled body is `movs rN,#imm; bx lr` is a folded read. Must FAIL on the current
     base and PASS after. That is the only place the check can live: it needs a built ROM, so it belongs
     with the other post-build gates rather than in the Jest suite. -->
