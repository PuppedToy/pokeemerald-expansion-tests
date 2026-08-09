---
id: B-024
title: Evolution mails never fire for evolutions available at or below the first level cap
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-09
updated: 2026-08-09
found-in: 0.6.0
fixed-in: 0.6.0
regression-test: visual-tests/interaction.spec.mjs  # B-024 describe block
links: []
---

# B-024 — Evolution mails never fire for evolutions available at or below the first level cap

## Symptom

In the generated docs' Mail tab, evolution notifications never appear for Pokémon whose evolution
level is at or below the first boss's level cap. Reported on run 3690642676, whose `evoLevels` config
was `min:5, max:5` → every evolution is level 5, and the first cap is 7, so **no** evolution mail ever
appears. More generally any evolution with level ≤ the first cap (or level 0 for immediate/stone evos)
is silently dropped, even in normal runs.

## Root cause

The Mail engine generates mails per **defeated** boss. `generateForBoss(i)` uses the window
`(prev = bossCaps[i].level, next = bossCaps[i+1].level]`. The union of all boss windows is
`(bossCaps[0].level, MAX_LEVEL]` — it never covers the initial band `(-∞, bossCaps[0].level]`. Those
evolutions are available from game start (the box auto-levels to the first cap), so no boss defeat ever
"unlocks" them, and the half-open lower bound (`lvl > prev`) also excludes an evolution whose level
equals the first cap. Result: any evolution reachable at/below the first cap produces no mail.

(Level-up-move and TM mails intentionally keep the `(prev, next]` band — a mon already knows its
≤cap moves at capture, so surfacing them would be noise. Only evolutions need the initial band.)

## Fix

In `frontend/template.html` `generateForBoss`, the EVOLUTION window's lower bound for the first boss
(`i === 0`) is `-Infinity` instead of `bossCaps[0].level`, so start-available evolutions (level ≤ first
cap, including level 0) are surfaced with the first boss defeat. Higher bosses keep `(prev, next]`, so
each evolution is still announced exactly once. Level-up-move / TM windows are unchanged.

Regression: `visual-tests/interaction.spec.mjs` (B-024) — defeats the first boss and asserts the
evolution mail for a box mon whose evo gate is ≤ the first cap now exists. Verified FAIL before the fix,
PASS after.

**Amended 2026-08-09 (T-260) — the guard was rewritten; it had stopped guarding.** The original version
*searched* the generated fixture for a box mon whose evolution gate was ≤ the first cap. That is luck:
measured across 8 seeds, only 1 produced such a box. It passed on 2026-07-09 because that fixture
happened to contain the case, and later failed on its own precondition (`expected` → null) once seed 42
rolled a box whose lowest gate was 18 against a first cap of 8 — red for weeks while proving nothing.
The fixture is gitignored and rebuilt from the current randomizer, so its content was never pinned.

It now **constructs** the scenario instead: three distinct box mons are given one known evolution each —
gated exactly at the first cap (the boundary `lvl > prev` dropped), gated at 0 (immediate/stone), and
gated above boss 0's upper bound as a negative control, which must *not* appear until the boss whose
window contains it is beaten. Seed-independent, so it holds on every fixture. Re-verified the same way:
the B-024 fix reverted to `evoPrev = prev`, fixture rebuilt, test fails on "an evolution gated exactly
at the first cap must be surfaced"; fix restored, test passes.
