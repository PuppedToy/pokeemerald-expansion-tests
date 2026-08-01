---
id: B-055
title: "Dynamic multichoice menus auto-select option 1 when opened from an A-press (item-ball picks)"
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-08-01
updated: 2026-08-01
found-in: 0.7.0         # observed in the T-236 play-test ROM (owner)
fixed-in: 0.7.0
regression-test: randomizer/__tests__/unit/dynamicMultichoiceInputGuard.test.js
links: [T-236, T-235]
---

# B-055 — Dynamic multichoice auto-selects the first option

## Symptom

In the T-236 play-test ROM, opening any **item-ball pick** (talk to the ball → menu) shows the menu
and **immediately selects option 1**; the player never gets to choose. Reproduced by the owner on 3
balls (two pick-3 and one pick-4), so it is systematic, not data-dependent.

The Sky Pillar legendary pick (T-235) — the *same* `dynmultipush` + `dynmultistack` construct —
behaves correctly.

Expected: the cursor sits on option 1 and waits for the player. Actual: the menu flashes and the
first item is taken.

## Root cause

Not the menu data and not the picker scripts: **the A press that opened the item ball is read by the
menu on the very frame it is created.**

`ScriptContext_RunScript()` runs before `RunTasks()` in the overworld frame, so a script that opens a
menu creates the menu task *in the same frame as the input that started the script*. The engine
guards against this with `sProcessInputDelay` (`src/script_menu.c:43`), armed to 2 frames by both
static-multichoice initializers — `InitMultichoiceCheckWrap` (`:461`) and `InitMultichoiceNoWrap`
(`:1092`) — and honoured by `Task_HandleMultichoiceInput` (`:546`), which decrements it instead of
reading input.

The **dynamic** path never got that guard: `DrawMultichoiceMenuDynamic` does not arm
`sProcessInputDelay`, and `Task_HandleScrollingMultichoiceInput` calls `ListMenu_ProcessInput()` on
its first execution. `ListMenu_ProcessInput` returns the selected id on `JOY_NEW(A_BUTTON)`, which is
still set that frame → instant selection of row 0.

This is a **pre-existing asymmetry in the engine** (upstream `dynmultichoice` support), not something
T-236 introduced — but T-236 exposed it by being the first feature to open a dynamic multichoice
from an **object interaction**. It stayed invisible before because:
- the old item picks used static `multichoice`, which has the guard; and
- T-235's Sky Pillar menu is reached from a **coord trigger** (walking onto a tile), so no A press is
  pending when its menu opens.

## Fix

`src/script_menu.c` — give the dynamic path the same guard the static path already has:
1. `DrawMultichoiceMenuDynamic()` arms `sProcessInputDelay = 2` before creating its task.
2. `Task_HandleScrollingMultichoiceInput()` decrements the counter and returns early instead of
   calling `ListMenu_ProcessInput()` while it is non-zero.

Chosen over a script-side `delay` in `data/scripts/randomizer_picks.inc` because the defect is in the
engine, not in the picker: a script delay would fix only these menus and leave the next
`dynmultichoice` caller to rediscover the bug.

## Regression test

`randomizer/__tests__/unit/dynamicMultichoiceInputGuard.test.js` — **verified RED before the fix**
(the two guard assertions fail, and fail because the guard is absent, not from a parse error) and
**GREEN after** (4/4; full suite 1709 pass).

It is a **source-invariant** test, not a behavioural one, and the file says so. The behavioural route
was investigated and rejected on evidence, not assumed impossible:
- `tools/mgba/mgba-rom-test` is committed, so `make check` *can* run on the build box — the blocker
  is not the ability to run C tests.
- But a non-battle `TEST()` body runs inside a **single frame** (`STATE_RUN_TEST` in
  `test/test_runner.c`), so there is no frame-stepping to drive a menu task across the 3 frames this
  bug needs; and **no test in the suite creates a window or runs tasks** — they are all pure-function
  tests. Forcing one would mean initialising BG/window state inside the shared test ROM, where a bad
  `AddWindow` returns `WINDOW_NONE` and the next write lands out of bounds — risking the whole suite
  to test a bug the owner has already verified in-game.

What the test does buy: this fix lives in engine code inherited from pokeemerald-expansion, so the
realistic regression vector is an **upstream sync** silently restoring the old file. The test fails
the moment either half of the guard (arming, or honouring) disappears, and also pins the static
paths' guard so the two can't drift apart again.

Behavioural evidence: owner play-test on the rebuilt ROM (2026-08-01) — item-ball menus wait for a
choice, Sky Pillar menu still correct.
