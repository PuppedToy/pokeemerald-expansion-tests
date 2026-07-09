---
id: B-024
title: Evolution mails never fire for evolutions available at or below the first level cap
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-09
updated: 2026-07-09
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

Regression: `visual-tests/interaction.spec.mjs` (B-024) — defeats the first boss in the seed-42
fixture and asserts the evolution mail for a box mon whose evo level ≤ first cap now exists. Verified
FAIL before the fix, PASS after.
