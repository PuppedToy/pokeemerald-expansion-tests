# Town traders

Fifteen traders, one per healing building along the progression. A trade is a **lateral swap**: the
player hands in a wild Pokémon they could have caught by that point and receives one of the **same
final quality**, already knowing a few TMs and with a few perfect IVs.

Owner rework of 2026-08-11 (T-269/T-270/T-271; the original four trades were T-194). The decision is
made once, at generate time, into `rom.artifacts.trades`, and every consumer reads that artifact —
the docs (`writerDocs.js`), the ROM writer (`tradeWriter.js`) and the injector — so the documentation
and the built ROM can never disagree.

## The traders

`randomizer/trades.js` → `TRADERS`. Each row is a town, its `INGAME_TRADE_*` slot, the map it stands
in, the **milestone** that gates it, and how much it gives away.

| # | Town | Milestone (boss) | TMs | 31-IVs | Quality |
|---|---|---|---|---|---|
| 1 | Rustboro | Roxanne | 1 | 1 | whatever the pool offers |
| 2 | Dewford | Brawly | 1 | 1 | " |
| 3 | Slateport | Oceanic Museum grunts | 1 | 2 | " |
| 4 | Mauville | Wally (Mauville) | 1 | 2 | " |
| 5 | Verdanturf | Wattson | 1 | 2 | " |
| 6 | Lavaridge | Flannery | 1 | 2 | " |
| 7 | Fallarbor | Flannery | 1 | 2 | " |
| 8 | Petalburg | Norman | 2 | 2 | " |
| 9 | Fortree | Winona | 2 | 2 | " |
| 10 | Lilycove | Wally (Lilycove) | 2 | 2 | **UU ↔ UU** |
| 11 | Mossdeep | Tate & Liza | 2 | 3 | **UU ↔ UU** |
| 12 | Pacifidlog | Archie | 2 | 3 | **UU ↔ UU** |
| 13 | Sootopolis | Juan | 3 | 3 | **UU ↔ UU** |
| 14 | Ever Grande | Wally (Victory Road) | 3 | 3 | **UU ↔ UU** |
| 15 | Pokémon League | the whole game | 3 | 4 | **OU ↔ OU** |

The milestone fixes everything else: the **level** of the gift is that milestone's level cap
(`caps.c` → `pokedex.capLevels`), the **encounters** the trader may ask for are the ones reachable by
then, and the **TMs** it may have taught the gift are the ones the player could hold by then.

Lavaridge and Fallarbor deliberately share Flannery's milestone — same pool, different roll.

## What a trader may ask for

`data/progression.js` is the single home of "what has the player reached by milestone X": one entry
per `caps.c` milestone, in its order, declaring the wild-encounter maps that open at it and the
encounter methods it unlocks. `encounterPoolAt(flag, …)` turns that into the species of **this run**
(through the wild artifact's `wildPlan` / `replacementLog`, so it follows the randomization).

Two rules make the table read the way the world plays:

- A map the player only walks into **as a consequence** of a fight belongs to the **next** milestone.
  Route 116 opens once Roxanne falls, so it is the Rusturf grunt's entry — which is why "everything up
  to Roxanne" excludes it. Same for Route 119 (after Norman) and Victory Road B1F (after Wally).
- A method unlock is **retroactive**: the good rod (Flannery), Surf (Winona) and the super rod
  (Tate & Liza) open their slots on every map already reached, not just on new ones.

Static/legendary maps (the Regis, Rayquaza, New Mauville) are never in a pool — they carry no method
slots at all, and `bossCaps.STATIC_UNLOCKS` owns when the player may reach them.

No two traders ask for the same **family**, and the family the player hands over is spent — no later
trader gives it back.

### The late-game floor (T-272)

The pool is **cumulative**, so left alone a late trader keeps rolling an early-game RU mon and handing
an RU one back — a level-67 trade over a Route 102 catch. From **Lilycove** on, a trader's `wantedTier`
pins the roll to families that peak at **UU**, and the **League's** to **OU**. Both sides always share
the tier, so pinning what is asked for pins the gift too. The first nine traders stay unpinned: early
pools are thin and forcing a tier there would only produce fallbacks.

When the demanded tier runs out the trade bends before it breaks, loudly
(`TRADE_WANTED_POOL_EMPTY`): first it repeats a family **at that tier**, and only if the run's reachable
pool holds no such family at all does it ask for another tier.

## What a trader gives

Same **final** quality, never the same current stage: `offered.rating.bestEvoTier ===
wanted.rating.bestEvoTier`. An early trader will happily hand over an LC mon — the player is buying
into the same ceiling, not the same stat line.

Three constraints keep that honest:

1. **The form itself must carry the tier.** Reading the tier off the *family* was wrong: a family can
   peak through a mega (Slowpoke's ceiling is Mega Slowbro, UU) whose ordinary form is a tier lower, so
   a "UU for UU" swap handed over an RU Slowbro. A mega form is never handed over either — the player
   evolves into it with the stone the run places.
2. **The stage must be legally ownable at the trade's level** (`checkValidEvo`), and of the stages that
   are, the trader gives the most evolved one.
3. **The family must be unused** — B-073. Starters, extra starters, gym rewards, statics and wild
   encounters all draw from one without-replacement pool of families
   (`wild.alreadyChosenFamilies`); the traders draw from the same pool and add what they take, so a
   gift never duplicates a family the player already has a claim on, nor another trade's.

When a tier is exhausted the trade **repeats a family rather than disappearing** (diagnostic
`TRADE_OFFER_POOL_EMPTY`), but never the family it is asking for.

### Mega stones

A traded family generates its mega stone exactly like a wild one: `addTradeMegaEvos` folds the gifts
into the run's `foundMegaEvos` right after the trades are decided, so `megaAssignment.js` hands the
stone to a trainer as usual. Trade Scyther, get a Scizorite in the world.

## What the gift arrives with

**TMs.** `tmMovesAvailableAt(flag, moves)` is every TM the player can hold by that milestone, derived
from the TM table's Location column (`docs/tms.md` — the SSOT for where each slot lives, reaching the
pipeline as each move's `tmLocation`) joined with the map table: a gym reward resolves to its badge, a
pick or item ball to the milestone that opens its route, and three named places (Granite Cave, Victory
Road 1F, Ever Grande City) resolve explicitly. An unclassified location **throws** — a new TM location
must be classified, never silently dropped from every pool.

Out of that pool the trader teaches moves the gift can **actually learn** and does not already know by
level-up at its level. A "choose 1 of 3" pick counts as **all three** options: the pipeline cannot know
which one the player took, and a gift is not a duplicate (owner's call). HMs are never taught — they
carry no TM slot, so they drop out on their own.

*Known divergence:* the trainer bag cascade in `trainers.js` (`roxanneBag()`, `brawlyBag()`, …) hands
the Route 118 picks (TM20-22) to trainers one milestone before Route 118 opens, so the Mauville trader
does not offer them while a Mauville-era trainer might hold them. The reachability answer above is the
one the traders use. Everywhere else the two agree — Roxanne's derived pool is exactly
`[TM01, TM05-10, TM71]`, the TMs `roxanneBag()` holds.

**IVs.** `perfectIvs` randomly-chosen stats at 31; the rest keep the flat 15 that T-194 handed out.
The array is rolled at generate time and written into `gIngameTrades[].ivs`, so the docs and the ROM
show the same mon.

## Where they stand

Every trader stands at the **same tile of its city's healing building**: `(3, 3)` of
`LAYOUT_POKEMON_CENTER_1F` (and of Lavaridge's own copy of it), which is walkable in both layouts and
free of NPCs in all fifteen maps. The League's trader stands in the Pokémon League lobby
(`MAP_EVER_GRANDE_CITY_POKEMON_LEAGUE_1F`), its own healing counter.

## In the ROM

Everything that varies per run lives in **`gIngameTrades[]`** (`src/data/trade.h`, rewritten by
`tradeWriter.js` on the compile path and injected in place by
`injector/modules/tradesStartersNicknames.js`); the scripts are static and committed.

| Piece | Where |
|---|---|
| The 15 trade slots | `enum InGameTradeID` (`include/constants/trade.h`) — **in `TRADERS` order and contiguous** |
| The flow | `Common_EventScript_TownTrader` (`data/scripts/town_traders.inc`); each map's script is a 3-line stub that sets `VAR_0x8008` and jumps in |
| "Already traded with this one" | `FLAG_TRADE_COMPLETED_*`, contiguous in the same order, resolved from the trade id by the `IsTownTradeDone` / `SetTownTradeDone` specials — that is why a trader is a stub plus a flag, not a copy of the flow |
| The learned TMs | `struct InGameTrade.moves[TRADE_MOVE_LIST_CAPACITY]` + `.moveCount`; `CreateInGameTradePokemonInternal` teaches them over the level-up moveset (a move it already knows is skipped; a full moveset loses its oldest slot, like a TM the player uses) |
| The IVs | `struct InGameTrade.ivs` — already existed, per trade now |

Adding a trader touches four places: a row in `TRADERS`, an `INGAME_TRADE_*` id, a
`FLAG_TRADE_COMPLETED_*` flag, and a stub + NPC in its map. `__tests__/unit/townTraderPlacement.test.js`
checks the NPC side (one per trader, walkable tile, same tile everywhere, none left outdoors) since the
game cannot be walked locally.

## The artifact

One entry per trader, in `TRADERS` order:

| Field | What it is |
|---|---|
| `town`, `ingameTradeId`, `mapId`, `flag` | which trader this is |
| `tier` | the final quality both sides share |
| `level` | the milestone's level cap — the level the gift arrives at |
| `offeredSpecies`, `offeredMoves`, `ivs`, `perfectIvs` | the gift |
| `wantedSpecies`, `acceptedSpecies`, `acceptedBaseForms` | what it asks for (the whole family is accepted; the base forms are what the message names) |
| `wantedMapId`, `wantedMethod` | where the wanted mon is caught — the docs render the trade on that encounter |

Selection is deterministic per ROM seed through a local mulberry32 seeded from
`deriveSeed(seed, traderIndex)`, so it consumes no shared RNG and never shifts when the pipeline's
order changes.
