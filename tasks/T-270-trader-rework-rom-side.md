---
id: T-270
title: Put the 15 traders in the game — engine fields, trade slots, Pokémon Center placement, injector
status: in-progress     # proposed | in-progress | done | abandoned
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
- [x] `INGAME_TRADES_COUNT === 15`; the injector's byte-match of the committed `gIngameTrades[]`
      passes (proves the new struct layout).
- [x] The ROM builder writes 15 trades with no capacity overflow; `cd randomizer && npm test` green.
- [ ] Base rebuilt, corpus re-snapshotted, ROM boots and the 15 trades work.

## Progress log

- **2026-08-11** — Task created (planned together with T-269/T-271).

- **2026-08-11** — Everything but the base rebuild is in, suite green (2434):
  - **Engine**: `struct InGameTrade` grew `moves[TRADE_MOVE_LIST_CAPACITY]` + `moveCount`, taught in
    `CreateInGameTradePokemonInternal` (`GiveMoveToMon`, oldest slot makes way when full, a move it
    already knows is skipped). Two new specials, `IsTownTradeDone` / `SetTownTradeDone`, resolve a
    trade's flag from its id.
  - **Slots & flags**: 15 `INGAME_TRADE_*` ids replace the vanilla four; 15 contiguous
    `FLAG_TRADE_COMPLETED_*` out of the unused 0x22-0x30 block (verified unreferenced);
    `TRADE_MOVE_LIST_CAPACITY 4`.
  - **One flow, 15 stubs**: `data/scripts/town_traders.inc` holds the trade flow once; each map's
    script is `setvar VAR_0x8008, INGAME_TRADE_* / goto Common_EventScript_TownTrader`.
  - **Placement**: tile `(3, 3)` in all 14 Pokémon Centers (walkable in `LAYOUT_POKEMON_CENTER_1F` and
    in Lavaridge's own layout, free of NPCs and warps in every one — parsed the layouts' collision data
    to pick it) and `(3, 6)` in the League lobby. The 4 old traders left the town maps.
  - **Dead code removed**: the four orphaned vanilla trader scripts (Rustboro House 1, Fortree House 1,
    Pacifidlog House 3, Battle Frontier Lounge 6) named the removed `INGAME_TRADE_SEEDOT` &c. No object
    event has pointed at them since T-194, so they were deleted along with the texts only they used.
  - **Writer + injector**: `tradeWriter` emits `.ivs` / `.moves` / `.moveCount`; `structLayout`'s
    `INGAME_TRADE` stride 128 → **140** (moves at 128, moveCount at 136 — the u16 array realigns after
    `requestedBaseFormCount`, and the struct's u32s round 137 up to 140); the encoder writes both new
    fields and refuses an over-long move list. The committed `gIngameTrades[]` block was regenerated
    **through `renderTradeData()` itself**, so the injector's byte-match reference cannot drift from the
    writer's shape.
  - **B-051's guard** moved from four per-town copies to the one shared script, plus a new assertion
    that no town keeps its own copy of the flow. New `townTraderPlacement.test.js` (32 cases) guards the
    NPC side, which is otherwise unverifiable without a toolchain.
  - Note: the committed entries are zeroed (species `SPECIES_NONE`, level 0), as the randomizer fills
    them per run — a base ROM played without injection would show an empty trader.

- **2026-08-11** — Left for the owner (no GBA toolchain here): rebuild the base on the box, re-derive
  the offsets, and re-snapshot the golden-master corpus (the struct + table growth invalidates the
  hashes by design). Until then the ROM builder cannot build: the artifact names 15 trade ids the
  current base does not define.

## Outcome

<!-- Filled when closing. -->
