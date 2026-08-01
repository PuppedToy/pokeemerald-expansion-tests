# Base-ROM + data-injection — execution strategy & task map

The **how** for the architecture whose **what/why** is in
[base-plus-injection-viability.md](base-plus-injection-viability.md) and whose decision is
[ADR-022](adr/ADR-022-base-plus-injection-architecture.md). This is the point-by-point migration plan:
per-output injection strategy, the base refactors needed to make each output inject-friendly, the
verification invariants, the go/no-go gates, and the phased task breakdown. Build-time context:
[rom-build-performance.md](rom-build-performance.md). Analysis task: [T-054](../tasks/T-054-binary-injection-randomizer-viability.md).

> Guiding principle: **the randomizer's value-computation logic never changes.** We only change the
> **output sink** — from "edit C/script source, then `make`" to "write bytes into a prebuilt base ROM."
> Same seed ⇒ same logical data ⇒ (for a migrated module) byte-identical result. That equality is the
> whole safety net.

## The two verification invariants (read first)

Everything hinges on being able to prove "nothing changed." There are **two** invariants, applied at
different phases — conflating them is the main foot-gun:

- **INV-BEHAVIOR (Phase 2 refactor):** moving rewards/prices/etc. from scripts/`#define`s into data
  tables **legitimately changes the ROM bytes**. The invariant is *behavioral/data equivalence*: the
  compiled game plays identically. Verified by data-region equivalence **+ owner manual in-game testing**
  — the compiled game must build *and* the owner must play the affected feature (e.g. a gym reward, a
  price, Run & Bun) and confirm it behaves as before. The automated harness cannot judge this, so the
  verification skill (T-233) **downloads the built `.gba` to the owner** for that. After Phase 2 we
  snapshot a **new golden master** (the post-refactor compiled ROMs).
- **INV-BYTES (Phase 3 injection):** the base is frozen; only *how the data gets in* changes. So for
  each migrated module the invariant is strong and automatable:
  **`inject(base, bundle)` == `compile(bundle)` byte-for-byte** (on the affected regions, ideally the
  whole ROM). This is what catches injector bugs instantly.

Prerequisite for both: **the build must be byte-reproducible** for a fixed bundle (no embedded
timestamp/build-id). If it is not, Phase 1 defines the canonical comparison (compare the data regions,
or strip the volatile bytes) — otherwise "exactly the same" is not measurable.

## Per-output injection strategy (the point-by-point list)

Grouped by how we will inject each output. Classification (a/b/c) and full structural detail are in the
[viability doc](base-plus-injection-viability.md#the-complete-one-by-one-list--every-randomizer-output);
here is the *action* for each, plus the refactor it needs.

### Group A — fixed-size overwrite, no base change (do first, lowest risk)
Write the new value at a known offset extracted from the `.map`. No repointing, no engine change.

| Output | Injection action | Base refactor needed |
|---|---|---|
| Base stats / types / abilities / wild held item (`gSpeciesInfo[]`) | overwrite scalar fields at `species*0xC4 + fieldOffset` | none |
| Move power/accuracy/type/category (`gMovesInfo[]`) | bit-level read-modify-write of the packed word | none |
| Evolution level / stone min-level (`Evolution.param`) | overwrite `u16` in the evolutions array | none |
| Wild encounter species (`WildPokemon[]`) | overwrite `u16` species in fixed slots (counts preserved) | none |
| Starter trio (`sStarterMon[3]`) | overwrite 3×`u16` | none |
| TM→move (`gTMHMItemMoveIds[]`) | overwrite the `moveId` fields (fixed-count table) | none (source is a macro, but the *baked table* is fixed) |
| Shop item prices (`gItems[].price`) | overwrite the `.price` field per item | none |
| Route field/mail items (`map.json` object_events) | overwrite the item `u16` in the compiled map event | none (locating the object_event is the work) |

### Group B — variable-length, inject via reserved capacity / free-space
These are sentinel-terminated arrays reached through a pointer in a struct. Two strategies; prefer B1.

- **B1 (preferred, needs base refactor):** in the base, **pad each such table to a fixed max capacity**
  (or route them through a reserved **free-space arena**), so at inject time we overwrite in place at a
  fixed offset — no pointer rewrite. Turns (b) into (a). Gated by the **32 MB free-space budget**.
- **B2 (fallback):** classic repoint — write the new array into free space and rewrite the pointer in
  the owning struct. Needed for any table B1 can't afford to pad.

| Output | Injection action | Base refactor needed |
|---|---|---|
| Level-up learnsets (`LevelUpMove[]` via `levelUpLearnset`) | B1: overwrite up to reserved max; else B2 repoint | pad to max learnset length (budget permitting) |
| Teachable/TM-HM+tutor compat (`u16[]` via `teachableLearnset`) | B1/B2 | pad to max teachable count |
| Trainer parties (`gTrainers[].party`, ×860, team size 1–6) | B1: reserve max party (6 mons, 4 moves) per trainer; else B2 | pad party arrays to max; the biggest space consumer |
| Battle partners (`gBattlePartners[]`) | same as parties | pad |
| In-game trades: `sTradeAccepted_*/sTradeBase_*` new arrays + pointers | B1 reserve max list; else B2 | reserve fixed-capacity accepted/base arrays |
| Extra starters `sStarterExtraMon[]` + nickname/gender arrays | B1 reserve `STARTER_EXTRA_COUNT` max | fix `STARTER_EXTRA_COUNT` to a max; reserve arrays |
| Location / trade / starter nickname strings | B1 reserve a fixed string-pool slot per entry | fixed-width nickname slots (12 chars) instead of packed COMPOUND_STRING pool |

### Group C — currently map-script / #define; must be redesigned to data-driven in the base
These are the real base engineering. After the refactor they become Group-A/B injections.

| Output | Refactor: make it data-driven | Injection action after refactor |
|---|---|---|
| Prize money (`#define`×3 in `battle_script_commands.c`) | read `normal/boss/gym` from a **runtime settings struct** | overwrite 3 values in the settings struct (Group A) |
| Move relearn price (`#define`) | read from the settings struct | overwrite 1 value (Group A) |
| Gym / museum / weather rewards (11× `scripts.inc`) | replace the in-script `givemon`/item with a **reward table** the reward script reads (indexed by gym) | overwrite the reward table entries (Group A) |
| Static legendaries (5× `scripts.inc` + `script_menu.h`) | read the species from a **static-encounter table**; names from a name table | overwrite table entries (Group A/B for names) |
| **Item-ball picker** (~15× `scripts.inc` + `script_menu.h`) — hardest | replace the generated per-item script handlers with a **generic picker that reads an item-placement table** (fixed max picks per location) + a menu built from the table | overwrite the placement table + menu strings (Group A/B) |
| Mega-trainer NPC removal (`map.json`) | replace deletion with a **"hide NPC" flag** the map init reads | set the flag (Group A) |

### Group D — feature toggles (already injectable, just document the offsets)
Both branches are compiled into the base; a `setvar` operand selects at runtime. No refactor — the
injector patches the `setvar` immediate at a `.map`-derived offset.

| Toggle | Where | Injection action |
|---|---|---|
| Run & Bun mode + E4 quotas | `EverGrandeCity_SidneysRoom/scripts.inc` setvars | patch `setvar` operands |
| Steven-tag battle | `MossdeepCity_SpaceCenter_2F/scripts.inc` setvar | patch `setvar` operand |
| Battle format (per trainer) | `.party` "Double Battle" flag → part of the trainer party inject | included in party inject |

## Go/no-go gates

- **GATE-1 (free-space, end of Phase 1):** does the base `.map` show enough free/padding space to pad the
  Group-B tables to max (B1)? If not → some tables fall back to B2 repoint, or the largest-growth features
  are scope-cut. This decides the Phase-2 refactor shape. The ADR stays *proposed* until this clears.
  → **CLEARED 2026-07-27 (GO):** base build ROM = 24.8 MB / 32 MB (73.98%) → **~8.33 MB free**; the B1
  padding budget (~1–1.5 MB) fits with wide margin (T-232). One refactor surfaced: the `static` tables
  (trades, nicknames, starters) aren't in the `.map` → must be **exported** in the base for the injector to
  locate them (learnsets are fine — pointer-reachable via `gSpeciesInfo`).
- **GATE-2 (determinism, early Phase 1):** is `compile(bundle)` byte-reproducible? If not → define the
  canonical comparison before any migration. → **CLEARED 2026-07-27 (best case):** four builds on PRO
  (incremental, relink, and two independent `make clean` rebuilds) gave the **identical sha256**
  (`fb34f4b9…`) → **canonical comparison = whole-ROM sha256**, no masking needed (T-231). LTO is
  deterministic on the builder. Caveat: guaranteed only on the same builder/toolchain/core-count → always
  build the golden master and verify on the same PRO box.
- **GATE-3 (per-module, throughout Phase 3):** each migrated module must satisfy INV-BYTES on the whole
  corpus before the next module starts. A failure halts and is localized to that module.

## Phased task map

Tasks are traceable; this section is the index, the task files hold the detail. Target version **0.7.0**
(the base+injection release). Epic analysis: [T-054](../tasks/T-054-binary-injection-randomizer-viability.md).

- **Phase 0 — documentation & planning (this):** [T-229] strategy doc + backlog + [ADR-022].
- **Phase 1 — audit tooling / golden-master harness:**
  - [T-230] golden-master **bundle corpus** (covers all 26 outputs) + reference-ROM capture.
  - [T-231] **build-determinism** audit → GATE-2 (canonical comparison if needed).
  - [T-232] **symbol-map + free-space** tool (`.map` → offsets + budget) → GATE-1.
  - [T-233] **PRO-build verification skill** (SSH → `make` corpus → diff vs golden master; **also fetches
    the built `.gba` to the owner** for manual play-testing). **PRO is the only build env — no CI capacity.**
- **Phase 2 — patch-friendly base refactor (INV-BEHAVIOR, verified via T-233):**
  - [T-234] runtime **settings struct** (money + relearn price).
  - [T-235] **data-driven rewards** (gym/museum/weather + static legendaries).
  - [T-236] **data-driven item placement** (item-ball picker — hardest; + mega-NPC hide flag).
  - [T-237] **fixed-capacity / free-space layout** for the Group-B tables (per GATE-1).
- **Phase 3 — injector + module-by-module migration (INV-BYTES per module, GATE-3):**
  - [T-238] **injector skeleton** + `.map` offset loader + **runtime compile-vs-inject switch** (rollback).
  - [T-239] inject **Group A** (fixed-size).
  - [T-240] inject **learnsets + TM/tutor compat** (Group B).
  - [T-241] inject **trainer parties + battle partners** (Group B, biggest).
  - [T-242] inject **trades + extra starters + nicknames** (Group B).
  - [T-243] inject the **Phase-2 data-driven outputs + settings + toggles** (Groups C/D).
- **Phase 4 — decommission old maker:**
  - [T-244] remove source-edit writers / old compile path; clean `make.js`/`writer.js`; corpus still
    identical via injection only.
- **Phase 5 — productionize:**
  - [T-245] recompute **ETAs** + simplify the two-tier queue ([ADR-005](adr/ADR-005-two-tier-preemptive-build-queue.md)) now that injection is seconds.
  - [T-246] **frontend wiring + delivery** (server-side inject; optional client-side/offline injector) + user acceptance.

Dependencies: Phase 2 blocked-by T-232/T-233; Phase 3 blocked-by its Phase-2 refactor + T-238; Phase 4
blocked-by Phase 3; Phase 5 blocked-by Phase 4.
