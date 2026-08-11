---
id: T-272
title: Pin the late traders to UU, and the League's to OU
status: done            # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-08-11
updated: 2026-08-11
target-version: 0.9.0
links: [T-269]
blocked-by: []
---

# T-272 — Pin the late traders to UU, and the League's to OU

## Context

[T-269](T-269-trader-rework-pipeline.md) left every trader rolling freely from its milestone's pool.
That pool is **cumulative**, so the late traders kept asking for an early-game RU mon and handing an RU
one back — a level-67 trade over a Route 102 catch (flagged to the owner in T-269's log with the seed
20260811 run: the League's trade was Nidorina → Corsola-Galar at level 78).

Owner's call (2026-08-11): **from Lilycove on the swap is UU for UU, and the League's is OU for OU.**
The first nine traders stay as they are.

## Plan

A `wantedTier` on the six affected `TRADERS` rows, applied to the roll of what the trader ASKS FOR.
Both sides of a trade already share the family's final quality, so pinning the request pins the gift —
this is a filter on the pool, not a second pairing rule.

Fallback ladder, so a thin run bends instead of losing a trade (all `TRADE_WANTED_POOL_EMPTY`):
that tier + an unused family → **any wild mon + an unused family** → repeat a family (its tier first).
A fresh family outranks the tier (owner, 2026-08-11).

Acceptance criteria:
- [x] Lilycove, Mossdeep, Pacifidlog, Sootopolis and Ever Grande ask for and give **UU**; the League
      **OU**; the other nine are untouched.
- [x] Offered and wanted still share their tier for all 15 trades.
- [x] A run whose reachable pool holds no UU/OU still produces every trade, with a diagnostic.
- [x] A run whose UU pool runs SHORT asks for another tier rather than repeating a family; only a pool
      with nothing fresh left repeats one.
- [x] `randomizer/docs/trades.md` carries the rule; `cd randomizer && npm test` green.

## Progress log

- **2026-08-11** — Done; suite green (2444). Verified on the seed 20260811 run: Lilycove → Ever Grande
  are all UU ↔ UU (Seedot → Dudunsparce, Kabuto → Excadrill, Serperior → Moltres, Binacle → Snorlax,
  Gurdurr → Torkoal) and the League is Gholdengo → Celesteela, OU ↔ OU. No family collisions, no
  diagnostics.
  While writing the tests the trades fixture turned out too thin for the new constraint (five UU traders
  against three reachable UU families, so the fallback fired and hid the rule). Widened it — every
  synthetic map now carries `land`+`old` and the mid-game ones `good`+`surf` — rather than relaxing the
  assertion.

- **2026-08-11** — Owner validated and asked to close. Closing.

- **2026-08-11** — Owner asked what happens when there is not enough UU, and settled the order: it must
  fall back to **any wild Pokémon**. The first version preferred repeating a UU family over changing
  tier; inverted, so the ladder is now tier+fresh → any+fresh → repeat. Two tests cover it (a short UU
  pool changes tier and keeps every late family distinct; only an exhausted pool repeats).

## Outcome

**Shipped.** A `wantedTier` on six `TRADERS` rows: Lilycove, Mossdeep, Pacifidlog, Sootopolis and Ever
Grande ask for (and therefore give) **UU**; the League **OU**. The nine earlier traders keep taking
whatever their pool offers.

**Deviation from the plan.** The fallback order was inverted after the owner's question "what if there
is not enough UU?": a family nobody has asked for now outranks the tier, so a short pool produces a
*different* late trade rather than the same family twice. Uniqueness was the original rule; the floor
yields to it. Ladder: demanded tier + fresh family → any reachable wild mon + fresh family → repeat a
family (its tier first), the last two warning through `TRADE_WANTED_POOL_EMPTY`.

Verified on seed 20260811: the six late trades are UU ↔ UU and OU ↔ OU with no diagnostics, and the two
thin-pool cases are covered by tests.
