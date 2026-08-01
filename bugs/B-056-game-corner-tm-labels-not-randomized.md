---
id: B-056
title: "Game Corner TM prize list shows vanilla move names, not the run's randomized TMs"
status: open            # open | fixing | fixed | wont-fix
severity: minor         # critical | major | minor
created: 2026-08-01
updated: 2026-08-01
found-in: 0.7.0         # pre-existing; spotted while auditing the pickers for T-236
fixed-in:
regression-test:
links: [T-236]
---

# B-056 — Game Corner TM labels don't match the randomized TMs

## Symptom

The Game Corner prize counter lists its TM prizes as **"TM Swagger / TM Spite / TM Skill Swap /
TM Pain Split / TM Rock Polish"** with their coin prices
(`MultichoiceList_GameCornerTMs` in `src/data/script_menu.h`). Those are the **vanilla** moves.

Every run randomizes what TM66–TM70 actually teach, so the menu advertises one move and the player
receives another. Only the labels are wrong — the TMs handed over are the correct (randomized) ones.

Not spotted in play-testing; found while mapping every pick menu for T-236.

## Root cause

`GAME_CORNER_TMS` exists in `randomizer/tmRandomizer.js` but **nothing ever reads it** — it is dead
code. `patchScriptMenu()` only rewrote the `PICK_LISTS` entries, never the Game Corner list, so that
array has always kept its hardcoded strings. (T-236 then removed `patchScriptMenu` altogether when
pick labels became runtime, which does not change this: the list was never covered.)

So this is **pre-existing and independent of T-236** — the same mismatch exists in every release so
far.

## Fix

Not attempted yet. The natural fix now that T-236 exists is to stop treating this as a string-patching
problem and make it a pick like the others: give the Game Corner list `PICK_*` entries in
`gItemPicks[]` (static, like the other TM picks — the slots don't change) and build its menu at
runtime with `BufferItemPickName`, which already renders `"TM <move>"` from the live TM table.

The wrinkle is the coin prices: the current strings embed `{CLEAR_TO 0x48}` + a price column, so the
menu text is `name + price`, not just the item name. Either extend the shared pick script with a
price-suffix variant, or keep a static price column and only make the name dynamic.

Also delete the dead `GAME_CORNER_TMS` constant once the real mechanism exists.

## Regression test

None yet. Unlike [[B-055]], this one is testable in the existing Jest suite: the check is that the
Game Corner labels are derived from the run's TM list rather than hardcoded, which is assertable at
the writer/table level without a GBA build.
