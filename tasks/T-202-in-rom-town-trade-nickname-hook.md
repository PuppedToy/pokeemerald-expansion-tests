---
id: T-202
title: In-ROM town-trade nickname hook — apply tradeNaming to the received Pokémon in-game
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-200, T-194]
blocked-by: []
---

# T-202 — In-ROM town-trade nickname hook

## Context

[T-200](T-200-auto-nickname-pools-uniqueness-warnings.md) computes a globally-unique per-ROM `tradeNaming`
artifact (keyed by `ingameTradeId`) but **does not apply it in-game**: town trades ([T-194](T-194-randomized-town-trades.md))
are not map-keyed and the received Pokémon comes through the in-game trade give-path, which the existing
map-keyed `location_nicknames` C hooks (T-070) don't reach. Wild / static / gift mons ARE already named
in-ROM; **only the traded Pokémon isn't**. Owner decision (2026-07-25): ship trade names in the docs first
(T-200 + T-201), and build the in-ROM hook here as a separate sub-task because the C only compiles on the
builder (same unverifiable-locally risk class as B-020 / B-022).

## Plan (to be detailed when picked up)

Apply `rom.artifacts.tradeNaming[<ingameTradeId>]` to the Pokémon received from each town trade, in-game:

1. Find the trade give-path in the C engine (the `sIngameTrades[]` / `CreateMon` for the received mon) and
   add a nickname (and optional forced gender) application keyed by the trade slot — mirror the gift hook
   (`ScriptGiveMonParameterized`) pattern; set the nickname on the mon **before** it lands in the party/PC.
2. New writer (mirror `locationNameWriter.js`) emitting a committed C table keyed by trade id, empty default
   (feature-off = vanilla). Wire it into `make.js`.
3. Builder verify loop (compile on the box; owner confirms the traded mon carries the expected name in-game).

Acceptance criteria:
- [ ] The Pokémon received from each town trade carries its `tradeNaming` nickname in-game (owner-verified on a build).
- [ ] Feature-off / no-nickname bundle leaves the committed C table empty and the ROM unchanged; game compiles on the builder.
- [ ] `cd randomizer && npm test`, `cd backend && npm test`, `node build.js` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed), blocked by T-200. Spawned from T-200's deferred in-ROM trade
  sub-step per owner's "docs first" decision.
- **2026-07-25** — Implemented (T-200 landed → unblocked, in-progress on branch
  `feature/T-202-in-rom-town-trade-nickname-hook`). Mirrored the T-070 `location_nicknames` pattern exactly:
  • **C engine:** new committed `src/trade_nicknames.c` (a `sTradeNicknames[]` table keyed by the
    `INGAME_TRADE_*` index + `GetTradeNickname()` lookup; committed default = one `0xFF` sentinel = feature
    off = NULL = vanilla) + `include/trade_nicknames.h`. Hook in `CreateInGameTradePokemonInternal`
    ([src/trade.c:4581](../src/trade.c#L4581)): the auto-nickname overrides the vanilla trade nickname when
    present, else falls back to T-194's behaviour. Verified the 4 trade keys are real enum constants in
    `include/constants/trade.h` (so the writer-filled rows compile).
  • **Writer + wiring:** `randomizer/tradeNameWriter.js` (`buildTradeRows`/`applyTradeNames`/`writeTradeNames`,
    keyed by `INGAME_TRADE_*`, sanitised ≤12 [A-Za-z0-9 ], COMPOUND_STRING, empty-name entries dropped →
    vanilla, sentinel fallback), spliced into `src/trade_nicknames.c` between anchors; wired into `make.js`
    (`writeTradeNames(rom.artifacts.tradeNaming)`, restored by restore() after each build).
  • **Tests:** `randomizer/__tests__/unit/tradeNameWriter.test.js` (6) + a real-file splice smoke (idempotent,
    anchors preserved). Randomizer suite 1676 green.
  **NOT verifiable locally:** the C (table + hook) compiles only on the builder / CI (no GBA toolchain here,
  same risk class as B-020/B-022). Needs a ROM build to confirm it compiles + an owner in-game check that a
  traded mon carries its name. Gender is intentionally NOT forced for trades (the mon keeps its
  personality-derived gender); only the nickname is applied.

## Outcome

<!-- Filled when closing. -->
