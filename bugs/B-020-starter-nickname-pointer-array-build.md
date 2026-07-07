---
id: B-020
title: Starter-extra nickname array used _() in a pointer array — breaks the C build
status: fixed           # open | fixing | fixed | wont-fix
severity: critical      # critical | major | minor
created: 2026-07-07
updated: 2026-07-07
found-in: 0.6.0         # introduced by T-068 (unreleased), observed on the PRO box build
fixed-in: 0.6.0
regression-test: randomizer/__tests__/unit/starterNameWriter.test.js
links: [T-068]
---

# B-020 — Starter-extra nickname array used `_()` in a pointer array — breaks the C build

## Symptom

After deploying T-068, **every ROM build on the box failed to compile** (not only nickname-enabled ones —
the committed defaults are enough to break it). `make` aborts with `-Werror`:

```
src/starter_choose.c:… error: braces around scalar initializer
src/starter_choose.c:… error: initialization of 'const u8 * const' from 'int' makes pointer from integer without a cast
src/starter_choose.c:… error: excess elements in scalar initializer
cc1: all warnings being treated as errors
make: *** [build/modern/src/starter_choose.o] Error 1
```

Local Jest is green because the C only compiles on the builder/box (no local GBA toolchain) — the class
of failure CI/the box is meant to catch.

## Root cause

`sStarterExtraNicknames` is a **pointer array** (`const u8 *const []`). In pokeemerald, `_("text")`
expands (via `preproc`) to a **brace-enclosed byte list** `{ …, EOS }`, which is a valid initializer for a
`u8[]` element but NOT for a `const u8 *` element. So each `_("…")` entry became `{ … }` around a scalar
pointer slot → "braces around scalar initializer" + "int → pointer". Inline string pointers must use the
`COMPOUND_STRING(str)` macro (`include/metaprogram.h`: `(const u8[]) _(str)`), a compound literal that IS a
valid `const u8 *`.

## Fix

Use `COMPOUND_STRING("…")` for the extra-nickname entries in both homes (kept byte-identical so the writer's
`.replace()` still hits):
- committed defaults in `src/starter_choose.c` (`COMPOUND_STRING("")` ×9);
- the emitted code in `randomizer/starterNameWriter.js` (`buildStarterNameCode` + `defaultExtraNicknames`).

The main-starter `sStarterNickname[]` is a 1-D `u8[]` (not a pointer), so it keeps `_()` and was never
affected. Regression test `randomizer/__tests__/unit/starterNameWriter.test.js` (the `B-020` case plus the
emitted-code assertions) was verified to **FAIL** before the fix (writer emitted bare `_()`) and **PASS**
after; the box `make` build is re-verified on redeploy.
