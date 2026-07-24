---
id: B-051
title: Town trader "wrong mon" message shows "/<HP>" (e.g. "/314") instead of the requested species name
status: fixing          # open | fixing | fixed | wont-fix
severity: minor
created: 2026-07-24
updated: 2026-07-24
found-in: 0.6.0         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test: randomizer/__tests__/unit/townTradeWrongMonBuffer.test.js
links: [T-194]          # task that fixes it, related bugs/ADRs
---

# B-051 — Town trader "wrong mon" message shows "/<HP>" (e.g. "/314") instead of the requested species name

## Symptom

At any of the 4 randomized town traders (Dewford / Lavaridge / Fortree / Mossdeep, T-194), offer a
Pokémon that is **not** the one requested. The rejection message renders the species placeholder as
garbage — e.g.:

> Hmm, that's not what I asked for.
> I want **/314**.

Expected: `I want <requested species name>.` (the same species the offer message and the docs show
correctly).

Reproduction:
1. Build a ROM from master (0.6.0) with the town trades active.
2. Talk to a town trader; accept the trade prompt (the offer message shows the correct wanted species).
3. In the party menu, hand over a Pokémon that is **not** the requested species.
4. The rejection message shows `I want /<number>.` instead of the species name.

Scope: all four town traders. Functional trade logic is unaffected (the wrong mon is still correctly
rejected) and the *offer* message is correct — only the wrong-mon reminder text is garbled. The correct
hint is still visible earlier (offer message + docs), so impact is a confusing secondary message, not a
lost hint → **minor**, but high-visibility.

## Root cause

Both the offer text (`..._Text_TradeOffer`) and the wrong-mon text (`..._Text_TradeWrongMon`) print the
requested species via `{STR_VAR_1}` = `gStringVar1`, buffered by `special BufferInGameTradeOffer`
(`src/trade.c` — `StringCopy(gStringVar1, GetSpeciesName(requestedBaseForms[0]))`).

The town scripts buffer once near the top, then run `special ChoosePartyMon` (the party-selection menu)
**before** reaching the wrong-mon branch. The party menu overwrites `gStringVar1` while drawing each
mon's HP bar — `src/party_menu.c:2597-2598`:

```c
StringCopy(gStringVar1, gText_Slash);   // "/"
StringAppend(gStringVar1, gStringVar2); // + max-HP number  → e.g. "/314"
```

So by the time `..._EventScript_TradeWrongMon` runs its `msgbox`, `gStringVar1` no longer holds the
species name — it holds the party menu's leftover `"/<maxHP>"` string. The T-194 wrong-mon branches
`msgbox` directly **without re-buffering**. The vanilla single-species trade scripts avoid this exact
gotcha by re-buffering right before their wrong-mon message (see
`data/maps/RustboroCity_House1/scripts.inc` — `bufferspeciesname STR_VAR_1, VAR_0x8009` before the
`DoesntLookLikeMonToMe` msgbox); the new data-driven town scripts omitted that step. Regression
introduced with T-194.

At the wrong-mon label `VAR_0x8004` has already been restored to the trade index (the `copyvar
VAR_0x8004, VAR_0x8008` just before `IsRequestedTradeMon`), so a re-buffer there reads the correct slot.

## Fix

Added `special BufferInGameTradeOffer` as the first statement of each town's
`..._EventScript_TradeWrongMon` branch, before the `msgbox` — re-buffering `gStringVar1` (requested
species name) and `gStringVar2` (offered species name) from `sIngameTrades[gSpecialVar_0x8004]` after
the party menu clobbered them. `VAR_0x8004` is already the trade index at that point (restored just
before `IsRequestedTradeMon`), so the re-buffer reads the correct slot. Files:

- `data/maps/DewfordTown/scripts.inc` (`DewfordTown_EventScript_TradeWrongMon`)
- `data/maps/LavaridgeTown/scripts.inc` (`LavaridgeTown_EventScript_TradeWrongMon`)
- `data/maps/FortreeCity/scripts.inc` (`FortreeCity_EventScript_TradeWrongMon`)
- `data/maps/MossdeepCity/scripts.inc` (`MossdeepCity_EventScript_TradeWrongMon`)

Regression test `randomizer/__tests__/unit/townTradeWrongMonBuffer.test.js` (B-051) isolates each
town's wrong-mon block and asserts it re-buffers (`BufferInGameTradeOffer`) before the wrong-mon
`msgbox`. Verified FAIL before the fix (4 towns: `bufferIdx == -1`) and PASS after. It is a structural
guard because the C engine + map scripts cannot be built or run locally (only in CI / on the builder);
final confirmation is a ROM build + talking to a trader with the wrong mon.

`status: fixing` (not `fixed`) until the owner verifies the corrected message in a built ROM.
