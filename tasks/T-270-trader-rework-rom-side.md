---
id: T-270
title: Put the 15 traders in the game — engine fields, trade slots, Pokémon Center placement, injector
status: proposed        # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [T-269, T-271]
blocked-by: [T-269]
---

# T-270 — Put the 15 traders in the game — engine fields, trade slots, Pokémon Center placement, injector

## Context

[T-269](T-269-trader-rework-pipeline.md) decides the 15 trades and puts them in the bundle artifact
(offered species + level + accepted family + **N learned TM moves** + **M IVs at 31**). This task
makes the ROM carry them: the engine gains the two new per-trade facts, `gIngameTrades[]` grows from
4 to 15 entries, and each trader stands in **the same spot of its city's healing building**
(the owner's placement rule).

The base+injection pipeline (`randomizer/docs/injection.md`) means every change here is a **base-ROM
change**: `struct InGameTrade` grows, the table's length changes and 11 new map scripts/object events
appear, so the base must be rebuilt and its offsets re-derived. There is no GBA toolchain on the dev
machine — the build box / CI compiles it (see `docs/dev-deploy-workflow.md`).

## Plan

1. **Engine** (`src/trade.c`): add `u16 moves[TRADE_MOVE_LIST_CAPACITY]` + `u8 moveCount` to
   `struct InGameTrade`, and teach them in `CreateInGameTradePokemonInternal` after `CreateMon`
   (`GiveMoveToMon`, falling back to `DeleteFirstMoveAndGiveMoveToMon` when the four slots are full;
   skip a move the mon already knows). IVs need no engine change — the writer already fills
   `.ivs[]`, today with a flat 15.
2. **Slots & capacities**: 15 `INGAME_TRADE_*` ids in `include/constants/trade.h`;
   `TRADE_MOVE_LIST_CAPACITY` + `TRADE_NICKNAME_CAPACITY` (8 → 16) in
   `include/constants/randomizer_layout.h` (read through `randomizer/layout.js`, never restated).
3. **One trader script, 15 stubs**: a shared `Common_EventScript_Trader` (the T-194 flow: buffer the
   offer → `ChoosePartyMon` → `IsRequestedTradeMon` → trade → set the completed flag), driven by the
   trade id in `VAR_0x8008`, with the per-trade "already traded" flag resolved from the id by a small
   special so a new trader is one stub + one flag, not a 60-line copy. 15 unused flags from
   `include/constants/flags.h`, reusing the 3 existing `FLAG_*_NPC_TRADE_COMPLETED`.
4. **Placement**: a trader object event at the same free, walkable tile of every healing building —
   `(3, 3)`, verified against `LAYOUT_POKEMON_CENTER_1F` and
   `LAYOUT_LAVARIDGE_TOWN_POKEMON_CENTER_1F` collision data and free in all 15 maps. The 4 existing
   traders move from their town maps into their Pokémon Center (Dewford, Lavaridge, Fortree,
   Mossdeep), and the League trader goes in `EverGrandeCity_PokemonLeague_1F`.
5. **Writers**: `tradeWriter.js` emits the per-trade IV array and the move list + count (capacity
   guards, as with the species lists); the committed `src/data/trade.h` block gains its 15 zeroed
   entries (it is the injector's byte-match reference).
6. **Injector**: `structLayout.js` (new stride + field offsets) and
   `injector/modules/tradesStartersNicknames.js` (15 entries, new fields) — follow the INV-BYTES
   checklist in `randomizer/docs/injection.md`. The module's own byte-match against the committed
   block proves the layout.
7. **Base rebuild + corpus**: the owner rebuilds the base on the box; re-snapshot the golden-master
   corpus (`/verify-corpus`) because the layout change invalidates the hashes by design.

Acceptance criteria:
- [ ] A traded mon arrives knowing its TM moves and with the right IVs at 31 (owner play-test).
- [ ] All 15 traders stand at the same tile of their city's healing building and their trade
      completes once, then reports "thanks again".
- [ ] `INGAME_TRADES_COUNT === 15`; the injector's byte-match of the committed `gIngameTrades[]`
      passes (proves the new struct layout).
- [ ] The ROM builder writes 15 trades with no capacity overflow; `cd randomizer && npm test` green.
- [ ] Base rebuilt, corpus re-snapshotted, ROM boots and the 15 trades work.

## Progress log

- **2026-08-11** — Task created (planned together with T-269/T-271).

## Outcome

<!-- Filled when closing. -->
