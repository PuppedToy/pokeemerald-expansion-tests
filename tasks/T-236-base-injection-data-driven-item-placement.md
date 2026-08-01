---
id: T-236
title: "Base+injection Phase 2 — data-driven item placement (item-ball picker) + mega-NPC flag"
status: done
type: refactor
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-236 — Data-driven item placement (hardest refactor)

## Context
The item-ball picker rewrites ~15× `scripts.inc` by **generating per-item script handlers** (labels,
`case`s, `finditem` opcodes) + growing `script_menu.h` — structural bytecode growth, the single hardest
output. Also mega-trainer NPC **removal** deletes a `map.json` object_event. See
[strategy Group C](../docs/base-plus-injection-strategy.md#group-c--currently-map-script--define-must-be-redesigned-to-data-driven-in-the-base).

## Plan
Replace the generated handlers with a **generic picker** that reads an **item-placement table**
(fixed max picks per location) + builds its menu from the table. Replace mega-NPC deletion with a
**"hide NPC" flag** the map init reads. Repoint the writers to fill the table/flag. Verify via T-233.
(May be split into sub-tasks if the picker redesign is large.)

Acceptance criteria:
- [x] Item placement read from a table by a generic picker; no per-run script-code generation.
      (`gItemPicks[53]`: 29 writer-filled item locations + 24 static TM picks; 0 `RAND_*` anchors and
      0 writer-generated handlers left; `script_menu.h` no longer touched by any writer.)
- [x] Mega-NPC presence controlled by a flag, not object_event deletion (`gMegaTrainerHidden[21]` +
      `RandomizerIsHiddenMegaObject` at both spawn paths).
- [x] `make` compiles; both symbols live in the `.map` and are read via runtime indices → injectable.
      Final base offsets (post-B-055, in `manifest.json`): `gItemPicks` 0xbefe94,
      `gMegaTrainerHidden` 0xbefdd4. Randomizer suite green (1709).
- [x] Full-corpus re-snapshot (T-233): **12/12 ROMs, 0 BUILD_FAILED**, re-run after the B-055 fix and
      `manifest.json` re-captured on the final post-T236+B-055 base (`9c8266b5…`).
- [x] Owner play-tested a ROM built from their own bundle (item picks, TM picks, mega NPCs, docs
      cross-check) — one defect found and fixed ([[B-055]]), re-tested OK on 2026-08-01.

## Progress log
- **2026-07-27** — Created (Phase 2). Highest-risk refactor; consider sub-splitting.
- **2026-07-31** — **Full map of the current mechanism + design** (analysis before code, per plan).
  - **Current mechanism, three legs:**
    1. **Item picks (per-run script generation — the Group-C core):** `randomizer/itemRandomizer.js`
       `updateScripts()` regenerates, between `@ === RAND_*_START/END ===` anchors in ~12 maps'
       `scripts.inc`, **29 locations**: 19 menu picks (multichoice + switch + one `finditem ITEM_<random>;
       setflag FLAG_<loc>` handler per option; 3 or 4 options) and 10 single-item scripts
       (`finditem`+`setflag`). `updateScriptMenu()` rewrites the 19 `MultichoiceList_*` label arrays in
       `src/data/script_menu.h` (COMPOUND_STRING item display names).
    2. **TM picks (labels only):** the 24 `PICK_LISTS` in `randomizer/tmRandomizer.js` — the
       `scripts.inc` handlers are **static** (`finditem ITEM_TM08` — the TM *slot* is fixed; the move
       behind it comes from `tms_hms.h`), but `patchScriptMenu()` rewrites the 24 label lists
       ("TM <move>") in `script_menu.h` every run. Counts: 22×3, 1×4 (Angelina), 1×2 (screen pick).
    3. **Mega-trainer removal (structural map.json edit):** `writer.js removeMegaTrainer()` **deletes**
       two `object_events` (trainer NPC + mega-stone ball with `trainer_sight_or_berry_tree_id:
       "ITEM_MEGA_NN"` token) from the map.json of the 15 `MEGA_TRAINERS` and splices the trainer out of
       trainersData; `updateMegaTrainer()` substitutes the `ITEM_MEGA_NN` token with the real stone item.
  - **Design — same shape as T-235 (tables + runtime-index specials + dynmultipush), three deltas:**
    1. **`gItemPicks[PICK_COUNT]`** (`struct ItemPick { u16 items[4]; }`) in new
       `src/randomizer_picks.c`: 29 writer-regenerated entries between anchors (defaults ITEM_NONE) +
       24 **static** TM-pick entries after the anchors (`ITEM_TM05…` — never rewritten). Indices are
       `#define PICK_*` in `include/constants/randomizer_picks.h` (shared C/asm). Two specials, both
       runtime-indexed (no LTO folding, no noipa needed): `GetItemPickItem` (VAR_0x8004 loc,
       VAR_0x8005 slot → VAR_RESULT item) and `BufferItemPickName` (same in → gStringVar1 = item name,
       or `"TM " + GetMoveName(ItemIdToBattleMoveId(item))` for POCKET_TM_HM items — so TM labels track
       the injected `gTMHMItemMoveIds` automatically).
    2. **Shared scripts** (new `data/scripts/randomizer_picks.inc`): `Common_EventScript_ShowPickMenu{2,3,4}`
       (N× `special BufferItemPickName` + `dynmultipush` — SkyPillar T-235 precedent; expansion expands
       `{STR_VAR_1}` at push time and VarGets the push id — + `dynmultistack 0,0,FALSE,N,FALSE,0,NULL`)
       and `Common_EventScript_DoPick{3,4}` (= ShowPickMenu + on non-127 result `copyvar VAR_0x8005,
       VAR_RESULT; special GetItemPickItem; finditem VAR_RESULT` → VAR_RESULT 1 taken / 0 cancelled;
       `finditem` uses `setorcopyvar` so a var arg is safe). Per-location `scripts.inc` becomes a
       **static stub** (setvar PICK_*, call DoPickN, setflag FLAG_<loc> — flag stays a script constant;
       anchors deleted, writer never touches scripts.inc again). TM picks keep their static handlers;
       only the `multichoice` line becomes `setvar + call ShowPickMenuN` (labels now runtime).
       B-cancel semantics preserved (today: no case for 127 → falls to `end`).
    3. **Mega-NPCs — hide-at-spawn instead of deletion:** `u8 gMegaTrainerHidden[15]` (writer-anchored)
       + static const `{mapGroup, mapNum, trainerLocalId, ballLocalId}` table; one guard call in
       `TrySpawnObjectEventTemplate` (event_object_movement.c) skips spawning a hidden mega's two
       objects. LocalIds never shift (strictly safer than deletion), no flags consumed
       (box-mon/flag space is exhausted anyway), badge-flag + item-flag behavior of the two objects
       untouched. `ITEM_MEGA_NN` tokens in committed map.json are replaced by `ITEM_NONE` defaults
       (base becomes standalone-compilable); `updateMegaTrainer` locates the ball object by its `flag`
       field (new `ballFlag` in MEGA_TRAINERS) and writes the real stone item value (still Group A at
       inject time). trainersData splice kept (hidden trainer keeps base party — same as today).
  - **Writers:** `itemRandomizer.updateScripts/updateScriptMenu` → one `updateItemPicksTable()`
    regenerating the anchored `gItemPicks` block (both `randomizeItems()` and
    `writeItemFilesFromBundle()` paths); `tmRandomizer.patchScriptMenu` → no-op (labels are runtime);
    `writer.js` mega block → fills `gMegaTrainerHidden[]` + ball-item values instead of deleting.
    `buildAssignments()`/return shape (trainer/docs contract) unchanged. TDD: new unit tests for the
    table generator first; suite must stay green; browser bundle rebuilt at the end (worker embeds
    itemRandomizer).
  - **Verified engine facts (local source audit):** `bufferitemname`/`buffermovename` VarGet their args;
    `ScrCmd_dynmultipush` StringExpandPlaceholders-es into a per-entry alloc and VarGets the id;
    `MULTI_B_PRESSED = 127`; TM item names are "TM01"-style (so labels need the move-name build);
    `ItemIdToBattleMoveId` exists. Cosmetic delta to flag at play-test: menu labels will show real item
    names ("Heavy-Duty Boots") instead of the writer's de-constant names ("Heavy Duty Boots").
  - **Collateral finding (out of scope):** `MultichoiceList_GameCornerTMs` shows hardcoded
    "TM Swagger/Spite/…" + coin prices and **no writer rewrites it** (`GAME_CORNER_TMS` in
    tmRandomizer.js is dead code) — Game Corner labels don't match the randomized TM66–70. The dynamic
    BufferItemPickName path would fix it; consider a separate bug/task.
  - **Rollout order (PRO gate after each):** A) item picks (table+specials+stubs+writer, 29 locations);
    B) TM picks (static table section + menu-line conversion, 24); C) mega hide flag + de-tokenized
    map.json; then one full-corpus re-snapshot (INV-BEHAVIOR) + owner play-test.
- **2026-07-31 — PHASE A COMPLETE + verified on PRO.** Implemented: `include/constants/randomizer_picks.h`
  (PICK_* 0–28) + `include/randomizer_picks.h` + `src/randomizer_picks.c` (`gItemPicks[29]` between
  `@ITEM_PICKS_START/END` anchors + `GetItemPickItem`/`BufferItemPickName` specials, registered in
  `data/specials.inc`); shared scripts in `data/scripts/randomizer_picks.inc` (included from
  event_scripts.s); all 29 locations' `RAND_*` anchored sections replaced by static stubs (menu picks:
  `setvar PICK_*; call Common_EventScript_DoPick; setflag on taken` — singles: inline take-slot-0).
  `itemRandomizer.js`: `updateScripts`/`updateScriptMenu` (and all script-gen helpers) **deleted**,
  replaced by `genItemPicksSection`/`updateItemPicksTable` (same two entry points: `randomizeItems()` +
  `writeItemFilesFromBundle()`); TDD via new `unit/itemPicksWriter.test.js` (RED first);
  `unit/items.test.js` trimmed to the new contract (**deliberate spec change** — the script-generation
  contract is replaced by the table sink). Suite green (1701).
  - **Found & absorbed a pre-existing quirk:** the 18-berry pool is over-drawn (5 pick locations × 4 =
    20 draws) so **Route 121's berry pick has always been a pick-2** (old code generated a 2-option
    menu). First stub hardcoded DoPick4 → wrong; fixed by making the shared menu **skip ITEM_NONE
    slots** (one unified `Common_EventScript_DoPick`/`ShowPickMenu` for 2/3/4-item picks — also what
    Phase B TM picks need). Doc drift repaired in `randomizer/docs/items.md` (Route 121 row).
  - **On PRO:** baseline bundle build **exit 0**; `gItemPicks` (R, .rodata @ 0x08bf81f0),
    `GetItemPickItem`/`BufferItemPickName` (T) + SPECIAL ids in nm/map; ROM bytes at the .map offset
    show all 29 entries writer-filled (19 menu entries with 3–4 real items — route121 = 2 as expected —
    10 singles with slot 0 + NONE padding). Box commits `T-236 wip: phase A` + `unified DoPick`.
  - **Ops fix on the box:** rsync had left dirs owned by uid 504 (Mac user) → container user `node`
    (1000) couldn't unlink during `git checkout` restores (previously masked by `|| true` in
    build-and-hash.sh). Fixed with `chown -R 1000:1000 /opt/emerald`; future rsyncs use
    `--no-owner --no-group`.
  - **Cosmetic delta for play-test notes:** menu labels now come from `CopyItemName` (real names, e.g.
    "Heavy-Duty Boots") instead of de-constanted names ("Heavy Duty Boots").
- **2026-07-31 — PHASE B COMPLETE + verified on PRO.** The 24 TM picks are data-driven: static
  `PICK_TM_*` entries 29–52 appended to `gItemPicks[]` (after the writer anchors — never rewritten;
  slot order extracted from each script's own case/finditem sequence and cross-checked against the old
  `PICK_LISTS`, 24/24 match). Each script's `multichoice 0,0,MULTI_*,FALSE` line became
  `setvar VAR_0x8004, PICK_TM_*; call Common_EventScript_ShowPickMenu` — the per-option `finditem
  ITEM_TMxx` handlers stay static; labels are runtime ("TM <move>" through `ItemIdToBattleMoveId` →
  follows the injected TM table). `tmRandomizer.js`: `patchScriptMenu`/`PICK_LISTS`/dead
  `GAME_CORNER_TMS` removed — it only writes `tms_hms.h` now (writeTMsFromList.test.js updated first,
  RED→GREEN — deliberate spec change). Dead `RAND_ROUTE109_HUEY_TM` anchors dropped. Out of scope by
  design: the 4 FIXED picks (Route124 choice items / Route110 seeds / Route109 rocks / Route116 orbs)
  keep classic multichoice — no writer ever touched them. Suite green (1701). On PRO: build exit 0,
  ROM dump of entries 29–52 confirms the static TM items (e.g. Route106 = TM04/TM03/TM02 descending,
  Angelina 4×TM57–60, screen pick 2 entries). `script_menu.h` is now fully static in the base.
  Box commit `T-236 wip: phase B`.

- **2026-08-01 — PHASE C COMPLETE (mega-NPC) + verified on PRO.** Mega trainers with no stone to give
  are now **hidden, not deleted**. Implemented: `gMegaTrainerHidden[21]` (`u8`, anchors
  `@MEGA_HIDDEN_START/END`) + `sMegaTrainerObjects[21]` (`{trainerScript, ballFlag}`) +
  `RandomizerIsHiddenMegaObject(template)` in `src/randomizer_picks.c`; the engine skips a hidden
  mega's two objects at both natural spawn paths in `src/event_object_movement.c` (the camera spawn
  loop and the localId/`InitObjectEventStateFromTemplate` path — `TrySpawnObjectEvent(localId)` is
  only reachable from an explicit script `addobject`, which these NPCs never use).
  `randomizer/megaHiddenWriter.js` (new, TDD — 4 tests written RED first) regenerates the array;
  `writer.js removeMegaTrainer()` no longer filters `object_events`, it records the index and the
  trainersData splice is unchanged (hidden trainer still gets no party). `constants.js` MEGA_TRAINERS
  gained `ballFlag` ×21.
  - **Design correction vs the 2026-07-31 plan:** de-tokenizing `ITEM_MEGA_NN` in map.json turned out
    to be unnecessary — `include/constants/items.h` already `#define`s them to `ITEM_NONE`, so the
    base compiles standalone and the stone value stays a plain `u16` in the compiled map event
    (Group A). `updateMegaTrainer` keeps locating the ball by that token; `ballFlag` is only needed
    C-side to identify the ball object. **No map.json base change at all** — less churn than planned.
  - **Why matching by script pointer + template flag:** localIds are not stable to reason about
    (some maps declare them explicitly, others are positional) and no map.json edit is needed. Every
    mega ball's `flag` was verified unique across all maps (21/21, no duplicates) before wiring.
    LocalIds never shift (strictly safer than deletion) and no new flags are consumed.
  - **On PRO:** baseline build **exit 0**; `gMegaTrainerHidden` (R, .rodata @ 0x08bf8270) +
    `RandomizerIsHiddenMegaObject` (T) in nm/map; the writer hid 7 megas (ids 15–21, all Route123) and
    the ROM bytes read `[0×14, 1×7]` — exactly those indices. Injectable ✓. Box commit
    `T-236 wip: phase C`.
  - **Ops:** `backend/build/golden-corpus/build-and-hash.sh` was mode 644 → the skill's documented
    invocation died with `Permission denied` (and `mf.done` still appeared, so it *looked* finished
    with an empty manifest). `chmod +x` applied locally **and** on the box.
  - Suite green (**1705** = 1701 + the 4 new mega tests). Browser bundle rebuilt (`node build.js`):
    the worker bundle carries `genItemPicksSection` and no longer the old script-generation code.
    Docs repaired: `randomizer/docs/pick-list-howto.md` rewritten for the data-driven mechanism (it
    described the now-deleted `MULTI_*`/`MultichoiceList_*` flow) + `items.md` mechanism note.
  - **Deferred cleanup (deliberate, do NOT do it inside this snapshot):** the migration orphaned **50**
    `MULTI_*`/`MultichoiceList_*` pairs in `script_menu.h` (161 dead `COMPOUND_STRING`s) — dead weight
    but harmless, and the base is frozen while the re-snapshot runs, so deleting them would invalidate
    the hashes being captured. Same call as T-235's `MultichoiceList_SkypillarTopLegend`. Sweep them
    (plus that one, plus the dead legacy token `.replace` loops in `writer.js`) in one pass at the end
    of Phase 2 / start of T-237, followed by its own re-snapshot. 33 further orphans are pre-existing
    vanilla (`MULTI_UNUSED_*`, shards) and out of scope.

- **2026-08-01 — RE-SNAPSHOT DONE → T-236 implementation complete.** Full corpus on the post-T236 base:
  **12/12 ROMs built, 0 BUILD_FAILED** (all 10 bundles: baseline, doubles, economy, mutate-moves,
  nicknames-on, nuzlocke-3 ×3, rebalance-off, runbun-mixed, steven-off, wild-classic) — the pick-table
  and mega-hide writers hold across every config shape. `manifest.json` re-captured: new
  `baseRomSha256` `f5038d38…` (clean `make`, exit 0) + the 12 bundle hashes + **five** injectable
  symbols with their base-build offsets (`gItemPicks` 0xbefe7c, `gMegaTrainerHidden` 0xbefdbc,
  `gGymRewards` 0xbf0024, `gStaticEncounters` 0xbf0050, `gRandomizerSettings` 0xbf006c — the T-234/235
  offsets moved because the base grew, so the manifest was corrected for all of them, not just the new
  two).
  - **End-to-end check of the delivered ROM** (decoded `gItemPicks[]` straight out of
    `T-236-picks.gba` by locating the static TM section as a byte needle): all 29 randomized entries
    carry real items — the 10 `goodItemPool` items appear exactly once each, plates/gems/berries never
    repeat across their locations, and Route 121 has its 2 berries. So the writer→C→ROM path is sound
    on real data, not just on unit fixtures.
  - Play-test ROM at `~/emerald-playtest/T-236-picks.gba` (sha `01633dc2…`, matches the manifest) with
    a MANIFEST row listing the exact expected menu contents so the check is falsifiable.
  - **Remaining to close: owner play-test only.** Nothing else is pending in T-236.

- **2026-08-01 — OWNER PLAY-TEST #1 → [[B-055]] found and fixed.** Owner built a bundle from the live
  site (`bundle-2653882998`, mixed/Run&Bun/difficulty 7) and I built it on PRO; **the bundle came from
  the pre-T236 randomizer and compiled untouched**, confirming in practice that the
  `itemAssignments` contract didn't change. Play-test verdict: docs match the game and everything
  works **except** the item-ball menus, which **auto-selected option 1** (3 balls tested, 2×pick-3 +
  1×pick-4). The Sky Pillar legend menu — same `dynmultipush`/`dynmultistack` construct — was fine.
  - **Root cause (engine, pre-existing — see B-055):** `ScriptContext_RunScript()` runs before
    `RunTasks()` in the frame, so a menu opened from an object interaction is created in the same
    frame as the A press. The static multichoice paths defend against this with `sProcessInputDelay`
    (armed in `InitMultichoiceCheckWrap`/`InitMultichoiceNoWrap`, honoured by
    `Task_HandleMultichoiceInput`); the **dynamic** path never armed nor honoured it, so
    `ListMenu_ProcessInput` saw `JOY_NEW(A_BUTTON)` on frame 1 and returned row 0. Sky Pillar escaped
    it because its menu comes from a **coord trigger** (no A press) — which is exactly why T-236 was
    the first thing to hit it.
  - **Fix:** armed + honoured the same guard in the dynamic path (`src/script_menu.c`,
    `DrawMultichoiceMenuDynamic` + `Task_HandleScrollingMultichoiceInput`). Engine-side rather than a
    `delay` in `randomizer_picks.inc`, so the next `dynmultichoice` caller doesn't rediscover it.
    Box commit `fix(B-055)`; owner's ROM rebuilt and overwritten (sha `723cdde9…`).
  - **⚠ manifest.json is now STALE** (flagged in the file itself): `script_menu.c` moved the base
    after the snapshot, so its 12 hashes + 5 offsets describe the pre-B-055 base and `verify.mjs`
    will report 12 mismatches. **Re-capture after the play-test signs off**, not before — another
    finding would invalidate it again.

## Outcome

- **2026-08-01 — CLOSED.** B-055 fixed and re-tested by the owner; corpus re-run on the final base
  (**12/12, 0 BUILD_FAILED**) and `manifest.json` re-captured (base `9c8266b5…`, 5 injectable symbols).
  Deferred work carved out into [T-247] (cleanup sweep) and [B-056] (Game Corner labels).

## Outcome

**Shipped:** the hardest Group-C output is data-driven. What used to be per-run **script-code
generation** — ~15 `scripts.inc` files getting freshly generated `multichoice` + `switch` +
one `finditem` handler per item, plus 43 rewritten `MultichoiceList_*` label arrays in
`script_menu.h` — is now a single table, `gItemPicks[53]`:
- indices 0–28: the randomizer-filled locations (19 menu picks + 10 single item balls), regenerated
  between anchors by `itemRandomizer.js`;
- indices 29–52: the 24 TM picks, **static** (the TM slot never changes; only the move behind it
  does, and the label resolves at runtime through `ItemIdToBattleMoveId`).

Every map script is now a static stub naming its `PICK_*` index; the menus are built at runtime by
the shared scripts in `data/scripts/randomizer_picks.inc` via `dynmultipush`. **No writer touches
`scripts.inc` or `script_menu.h` any more.** Mega trainers that get no stone are hidden by
`gMegaTrainerHidden[21]` + `RandomizerIsHiddenMegaObject` instead of having their two `object_events`
deleted from `map.json`. Net effect for Phase 3: three variable-shape outputs became fixed-size
Group-A overwrites.

**Deviations from the plan, and why:**
- *No `map.json` de-tokenizing.* The plan assumed `ITEM_MEGA_NN` had to be replaced with `ITEM_NONE`
  so the base would compile standalone. It already does — `items.h` defines those tokens as
  `ITEM_NONE` — so the base was left untouched and the stone item stays a plain `u16` in the compiled
  map event (still Group A). Less churn than designed.
- *One shared menu script instead of `ShowPickMenu{2,3,4}`.* Writing the stubs surfaced a
  pre-existing quirk: the 18-berry pool is over-drawn (5 locations × 4 = 20), so **Route 121's berry
  pick has always been a pick-2**. Hardcoding an option count would have silently changed it, so the
  shared script skips `ITEM_NONE` slots and serves 2/3/4-option picks alike. `items.md` corrected
  (it documented Route 121 as a pick-4).
- *Mega objects matched by script pointer + template flag*, not localId: localIds are declared
  inconsistently across maps, and every mega ball's flag was verified unique across all maps (21/21).

**Found along the way:** [[B-055]] — opening a **dynamic** multichoice from an A press made it read
that same press and self-select. Pre-existing engine asymmetry (the static path has an input-delay
guard, the dynamic one didn't); invisible until this task became the first feature to open one from
an object interaction. Fixed engine-side and covered by a regression test.

**Verification:** randomizer suite green (1709); corpus 12/12 across every config shape; the shipped
ROM's `gItemPicks[]` was decoded straight out of the binary as an end-to-end check (all 29 entries
real, `goodItemPool` items each appearing exactly once); owner play-test signed off.

**Follow-ups spawned:**
- **[T-247]** — the migration orphaned **50** `MULTI_*`/`MultichoiceList_*` pairs (161 dead
  `COMPOUND_STRING`s), and T-235 left dead legacy token `.replace` loops in `writer.js` plus
  `MultichoiceList_SkypillarTopLegend`. All dead weight, none load-bearing; swept in **one** pass
  with its own re-snapshot rather than churning the base twice.
- **[B-056]** — `MultichoiceList_GameCornerTMs` shows hardcoded TM names that no writer updates, so
  the Game Corner prize labels don't match the randomized TM66–70. Pre-existing and unrelated to this
  task; found while mapping the pickers.
