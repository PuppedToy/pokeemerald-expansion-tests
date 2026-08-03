---
id: B-058
title: "A `noipa` accessor still folds its `const` global read, so four injectable scalars are dead in inject mode"
status: fixed
severity: critical
created: 2026-08-02
updated: 2026-08-02
found-in: 0.7.0
fixed-in: 0.7.0
regression-test: randomizer/__tests__/unit/injectableAccessors.test.js
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

Four accessors now force a real load — `return *(const volatile u8 *)&<global>;` — keeping `noipa`
(which still stops the caller assuming anything):
`GetLocationNicknameCount`, `GetTradeNicknameCount` (src/location_nicknames.c, src/trade_nicknames.c),
`GetExtraPokemonCount`, `GetStarterGender` (src/starter_choose.c). A `volatile` access cannot be folded
or elided by a conforming compiler.

**Scope was measured, not assumed**: a scan of the whole base for four-byte functions matching
`movs rN,#imm; bx lr` found 93, of which exactly these four are values the injector writes. The other 89
are unrelated stubs and config accessors (`IsSleepClauseEnabled`, `ScrCmd_nop`, …).

**The check now lives where it can see compiled code**: `buildOffsetMap.js`'s readiness report — which
the process already mandates after every base change — scans `INJECTABLE_SCALAR_ACCESSORS` and prints
`FOLDED <name> — compiled to \`return N\`, so injecting its value does NOTHING`. Verified on the rebuilt
base: **OK — all 4 compile to a real memory load**, and on the injected ROM itself: no folded accessors.

The data is now reachable, which is what the play-test could not see before: `gLocationNicknameCount`
reads 134 with its rows (Rostam / Liron / Lakshmi), `gTradeNicknameCount` 4 (the Seedot trade is
"Mandla"), `gStarterGender` MON_FEMALE instead of the folded MON_GENDERLESS.

Base rebuilt (`af0dff6c92ef…`, 75.12 %), corpus re-snapshotted, **GATE-3: ALL PASS — 12 pass / 0 fail**.

**Regression test**: `randomizer/__tests__/unit/injectableAccessors.test.js` — a source guard on all four
sites (volatile + noipa + the accessor list the build-box check uses) plus unit tests for the detector
itself (it must flag `movs+bx lr`, pass a real `ldr`, and report an accessor that vanished). The source
guard fails on the pre-fix sources; the detector failed on the pre-fix base.

Fixed by commit `86143121c7`.
