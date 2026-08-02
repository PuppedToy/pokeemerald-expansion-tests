---
id: T-243
title: "Base+injection Phase 3 — inject data-driven rewards/items/settings + feature-toggle setvars"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-02
target-version: 0.7.0
links: [T-229, T-238, T-234, T-235, T-236, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-238, T-234, T-235, T-236]
---

# T-243 — Inject the Phase-2 data-driven outputs + toggles

## Context
Inject the outputs that Phase 2 turned into data (rewards T-235, item placement T-236, settings struct
T-234) plus the Group-D feature toggles (Run&Bun, Steven-tag — patch the `setvar` operands). See
[strategy Groups C/D](../docs/base-plus-injection-strategy.md#group-c--currently-map-script--define-must-be-redesigned-to-data-driven-in-the-base).

## Plan
Inject the reward/static/item-placement tables + settings struct; patch the setvar operands for the mode
toggles at their T-232 offsets. Verify INV-BYTES on the corpus after each.

**This is the module Phase 2 was built for.** T-234/T-235/T-236 turned five outputs from
script-and-macro edits into plain `const` tables read through runtime indices, precisely so Phase 3 could
overwrite them. So five of the six sub-writers are ordinary fixed-offset table writes; the sixth — the
Group-D toggles — is the only genuinely new mechanism left in the migration.

Writer audit:

| output | writer | shape |
|---|---|---|
| `gRandomizerSettings` | `moneyWriter` + `moveRelearnerPriceWriter` | four `u32`s patched in `randomizer_settings.c`; both writers clamp and default, so the injector runs them rather than re-deriving |
| `gGymRewards[11]` | `writer.js` | `{u16 species, u16 item}`; the item is a mega stone for indices 2/8/9 only, `r.megaStone` first and `resolveRewardMegaStone` as the fallback |
| `gStaticEncounters[7]` | `writer.js` | `{u16 species, u16 level}`; levels are fixed per encounter, species fall back to the vanilla ones |
| `gItemPicks[53]` | `itemRandomizer` | `u16 items[4]`; only the **29** locations in `PICK_TABLE` are emitted, so the rest of the table is regenerated as zeros |
| `gMegaTrainerHidden[21]` | `writer.js` + `megaHiddenWriter` | one byte per mega trainer; hidden when the sorted `foundMegaEvos` queue has nothing at or below that trainer's level — a decision embedded in writer.js's loop, mirrored here, no RNG |
| Run&Bun + Steven toggles | `runAndBunWriter` / `stevenTagWriter` | a `setvar` **immediate inside compiled script bytecode** — no symbol, no struct |

The toggles are the last unproven mechanism in Phase 3: `scriptPatch.js` (written in T-238) locates the
script by its **local** label in the `.sym` — map-script labels are not in the `.map` — and scans for the
`setvar` opcode with the right var id, refusing an ambiguous match. It has never run against a real base.

Everything else follows the pattern the previous three tasks converged on: run the writer's own pure
function, parse its C back into bytes, and byte-match the **committed** initializers against the base
before writing anything.

Acceptance criteria:
- [x] Rewards + static + item-placement tables injected; INV-BYTES green.
- [x] Settings struct (money, relearn price) injected; INV-BYTES green.
- [x] Run&Bun + Steven-tag toggles injected via setvar patch; INV-BYTES green.
      One run for all three: `parity.mjs --compile-each --by-symbol`, **ALL PASS — 12 pass / 0 fail**,
      2026-08-02, base `c144386ff4f3…`, **with the whole board migrated** (data equivalence per symbol —
      [[B-057]] still rules out image equality).

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-02** — Started. Branch `feature/T-243-inject-datadriven-and-toggles` off T-242's. Audit above
  written first. The only output whose decision is not already in a reusable function is
  `gMegaTrainerHidden`: writer.js decides it inline while assigning mega stones, from the level-sorted
  `foundMegaEvos` queue against each mega trainer's level — deterministic, so it can be mirrored, but it
  is the one place here where the injector re-implements a loop instead of calling one.

- **2026-08-02 — MODULE DONE (local): 1 new file, 25 new tests, suite 2117 + backend 214 green.**
  - **`modules/dataDrivenAndToggles.js`** — six sub-writers. Settings, rewards, static encounters, picks
    and mega-hidden flags are table writes verified against their committed initializers; the toggles go
    through `scriptPatch.patchSetvar` with `expectValue` pinned to the base's own immediate, so a wrong
    label or a moved script throws instead of writing into whatever bytes sit there.
  - `gameConstants` gained the Phase-2 headers (`constants/randomizer_picks.h`, `randomizer_rewards.h`),
    so `PICK_*`, `GYM_REWARD_*`, `STATIC_ENCOUNTER_*` and the counts come from the base like every other id.
  - **The board is complete**, so two guard tests had to change shape rather than disappear: "injectRom
    refuses while a module is pending" and its backend twin now drive an explicit pending module. The
    mechanism outlives the last `pending` entry, and deleting the tests with it would have been the wrong
    kind of green.

- **2026-08-02 — GATE-3: one RED, one real finding, then GREEN 12/12 — the migration's last gate.**
  - **BUG — `gItemPicks` is not entirely the writer's.** The run stopped on `gItemPicks does not hold what
    its committed initializer says`. 29 of its 53 entries are the randomizer's pick locations, between
    the `@ITEM_PICKS_*` anchors; the other **24 are the static TM picks**, declared *after* the end
    anchor and never regenerated. The module had assumed the writer owns the whole table and would have
    zeroed every TM pick location in the game. Fixed: the base check now parses the **whole array**
    (all 53 rows), and the write is **per row** for the 29 the writer emits. A named test pins that the
    static picks come through untouched, byte for byte, and that no write lands on them.
  - **GREEN: `ALL PASS — 12 pass / 0 fail`** with every module migrated. Across the corpus the module
    wrote the four settings (the `economy` bundle's 999 / 9999 / 12345 / 0 among them), 11 rewards,
    7 static encounters, 29 pick locations, 0–12 hidden mega trainers per ROM and 4 setvar immediates.
  - **The Group-D mechanism works on a real base.** `scriptPatch.js` had never run outside a fixture:
    both local script labels resolved from the `.sym`, the opcode scan found a unique `setvar` for each
    of the four vars, and every immediate matched the base's committed value before being overwritten.

- **2026-08-02 — FIRST FULLY INJECTED ROM.** With nothing pending, `injectRom()` emits without
  `allowPending`: `nicknames-on` produced a complete 33 MB randomized ROM in **16.0 s** (5 modules,
  434,181 bytes written), against ~55 s warm / ~230 s cold for the compile path — the whole point of
  ADR-022, measured end to end for the first time.
  ROM at `~/emerald-playtest/T-243-nicknames-on-injected.gba` (sha `0a124380e3b8…`) for the owner's
  play-test. What the gate cannot judge is INV-BEHAVIOR: that the ROM *runs*.

## Outcome
