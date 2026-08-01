# Base-ROM + data-injection — viability analysis (no per-user compile)

Deep viability analysis for replacing the current "recompile a ROM per user" model with **build the
base ROM once, then inject the randomized data into the prebuilt ROM** (binary patching, the way
Universal Pokémon Randomizer and every mainstream randomizer works). This is the second half of the
architecture named in [ADR-013](adr/ADR-013-bps-patch-delivery-client-side.md) and the analysis owned by
[T-054](../tasks/T-054-binary-injection-randomizer-viability.md). Build-time performance context (why the
current model is slow) lives in [rom-build-performance.md](rom-build-performance.md).

> Method: read-only audit of every randomizer writer module (three parallel audits, July 2026) plus the
> config surface. Every classification below cites the actual source structure. No code was changed.

## TL;DR — verdict

**Highly viable, and the combinatorial fear is unfounded.** Two headline findings:

1. **There are ≈ZERO irreducible "base-ROM axes."** The options you'd expect to force distinct base
   builds (Run & Bun mode, Steven-tag battle) are already **VAR-gated with both branches compiled into
   the base** — they flip by patching a single `setvar` operand, i.e. they are *injectable*, not a base
   variant. The only true build-baked values (prize money, relearn price) are two/three numbers that
   just need to become runtime-readable. **Net: one base ROM serves every configuration** (2^k where k =
   genuinely engine-forking features; k = 0 today). So your "Phase 1 — pre-build all base ROMs" collapses
   to **"build one base, once, and cache it forever."** No combinatorial explosion exists.

2. **~80% of the randomization payload is exactly what the community already injects** (fixed-size table
   overwrites + a few well-known variable-length repoints). The genuinely hard part is a **small, finite
   set of outputs we currently express as *map-script edits*** (gym/static rewards, the item-ball picker,
   mail) — those must be redesigned as **data tables in a patch-friendly base**. That base redesign, plus
   an injector driven by the build's symbol map, is the real project.

The blocker is **not** combinatorics and **not** "which randomizations are possible" — it's (a) one-time
base engineering to make the script-driven outputs data-driven, (b) a free-space/repointing injector, and
(c) the **32 MB ceiling** (the built ROM is already 32 MB — see Risks).

## The two-phase model, corrected

Your framing — **Phase 1 warmup** (pre-build base ROMs) + **Phase 2 inject** (pick base, inject data) — is
right in spirit. The correction the audit forces:

- **Phase 1 is not combinatorial.** Because no config option irreducibly forks the compiled engine (see
  the combinatorics section), there is **one** base ROM (plus, in future, one extra per any feature that
  truly can't be VAR-gated). "Warmup" = compile that one base once (the ~3-min build we already do), store
  it, done. Lazy/on-demand pre-building of "popular option combos" is unnecessary — there are no combos to
  pre-build; the base is config-independent.
- **Phase 2 is the whole game.** At apply time the server (or the client, offline) takes the single base
  and injects: fixed-size data overwrites + a handful of variable-length repoints + a few `setvar`-operand
  byte patches + a small settings block. No compilation. **Seconds, not minutes.**

## Combinatorics: how many base ROMs?

A "base axis" is a config option that must be **baked into compiled code/scripts** and **cannot** be
reduced to injected data or a runtime flag. Walking every build-time-touching option:

| Option | Today | Reducible to injection? | Base axis? |
|---|---|---|---|
| `leagueRunAndBun` (+`battleFormat==mixed`) | `setvar` defaults in a map script; **both branches already compiled** | Yes — patch the `setvar` operand byte(s) at a known offset | **No** |
| `disableStevenTagBattle` | `setvar VAR_DISABLE_STEVEN_TAG_BATTLE`; both battle branches compiled | Yes — patch the `setvar` operand | **No** |
| `wildEncounterType` (deterministic/classic) | changes *which species data* is generated; wild slots are fixed-size | Yes — it's just different species values in fixed slots | **No** |
| `battleFormat` (singles/doubles/mixed) | per-trainer `.party` "Double Battle" flag + Run&Bun | Yes — per-trainer data (already injected) | **No** |
| `money` {normal,boss,gym} | 3 C `#define`s → immediates inside `GetTrainerMoneyToGive` | Needs redesign → read from a settings block (small) | **No** (after redesign) |
| `moveRelearnPrice` | C `#define` → immediate in `GetMoveRelearnerMoveCost` | Needs redesign → runtime constant | **No** (after redesign) |
| `prices`, nickname tables, everything else | data | Yes — pure data | **No** |

**Result: 0 irreducible base axes → 1 base ROM.** The `money`/`moveRelearnPrice` `#define`s are the only
things not *already* injectable, and they're two trivial engine tweaks (expose the constants as a data
struct the code reads). The mode toggles are already runtime-flippable because the base compiles *both*
paths. Combinatorics are a non-issue.

## The complete one-by-one list — every randomizer output

Injection class: **(a)** fixed-size overwrite at a known offset · **(b)** variable-length → needs
free-space + pointer relocation · **(c)** C-code / macro / map-script → not a data overwrite (needs base
redesign or bytecode surgery). "Community?" = does the mainstream community (UPR et al.) inject this
routinely on GBA Gen-3.

### Pokémon data — all DATA, mostly trivial

| # | Output | Source file | Compiled structure | Class | Community? |
|---|---|---|---|---|---|
| 1 | Base stats / types / abilities / wild held item | `src/data/pokemon/species_info/gen_{1..9}_families.h` | `gSpeciesInfo[]` — `struct SpeciesInfo` (0xC4), `u8`/`u16` scalar fields at fixed offsets | **(a)** | ✅ routine |
| 2 | Move power / accuracy / type / category | `src/data/moves_info.h` | `gMovesInfo[]` — bitfields (`power:9,acc:7,type:5,cat:2`) | **(a)** bit-level RMW | ✅ routine |
| 3 | Evolution level / stone min-level | `…/species_info/gen_{1..9}_families.h` | `Evolution.param` (`u16`), fixed entry count | **(a)** | ✅ routine |
| 4 | Level-up learnset | `…/level_up_learnsets/gen_9.h` (gen_9 only) | `LevelUpMove[]` (4 B/entry, `LEVEL_UP_END` sentinel), reached via `levelUpLearnset` **pointer** in SpeciesInfo | **(b)** repoint | ✅ routine |
| 5 | Teachable learnset = **TM/HM + tutor compatibility** | `src/data/pokemon/teachable_learnsets.h` | `u16[]` (`MOVE_UNAVAILABLE` sentinel), via `teachableLearnset` **pointer**. *No per-species TM bitfield exists — this array IS the compatibility source* (`CanLearnTeachableMove`) | **(b)** repoint | ✅ routine (concept; our structure differs) |

### TMs, moves, items

| # | Output | Source file | Compiled structure | Class | Community? |
|---|---|---|---|---|---|
| 6 | TM→move assignment | `include/constants/tms_hms.h` (`#define FOREACH_TM` macro) | Macro at source, but bakes to **`gTMHMItemMoveIds[]`** — a fixed-count `{item,move}` table → `moveId` fields are overwritable | **(c)** source / **(a)** baked table | ✅ routine ("TM moves") |
| 7 | TM menu display names | `src/data/script_menu.h` | `MenuAction[]` of `COMPOUND_STRING` pointers (variable-length strings) | **(c)/(b)** cosmetic | ➖ (cosmetic) |
| 8 | Shop item prices | `src/data/items.h` | `gItems[].price` field — fixed offset in a fixed-layout struct array | **(a)** cleanest | ✅ routine |
| 9 | Route mail / mint items | `data/maps/**/map.json` (26 maps) | item-ball `object_events[].trainer_sight_or_berry_tree_id` (`u16` item) in compiled map data | **(a)** (locating the object_event is the effort) | ✅ (field items) |

### Trainers & wild — the variable-length heart

| # | Output | Source file | Compiled structure | Class | Community? |
|---|---|---|---|---|---|
| 10 | **Trainer parties** (×860) | `src/data/trainers.party` | `gTrainers[]`: party **pointer + partySize**; **team size 1–6 varies**, moves ≤4 vary | **(b)** repoint — **biggest problem** | ✅ routine (UPR's hardest, but proven) |
| 11 | Battle partners | `src/data/battle_partners.party` | `gBattlePartners[]`, same as #10 | **(b)** repoint | ✅ |
| 12 | Wild encounters | `src/data/wild_encounters.json` → `wild_encounters.h` | `WildPokemon[]` fixed slots (land 12 / water 5 / …); **only the `u16` species is swapped, counts preserved** | **(a)** (not variable after all) | ✅ routine |
| 13 | Starter base trio | `src/starter_choose.c` `sStarterMon[3]` | 3×`u16`, fixed | **(a)** | ✅ routine |
| 14 | Extra starters + nicknames/genders | `src/starter_choose.c` `sStarterExtraMon[]`, `sStarterExtra*[]`, `#define STARTER_EXTRA_COUNT` | pointer arrays whose **count changes**; variable nickname text | **(b)** repoint | ➖ bespoke |

### Static encounters, trades, rewards — mostly map-script (hardest)

| # | Output | Source file | Compiled structure | Class | Community? |
|---|---|---|---|---|---|
| 15 | Gym / museum / weather rewards | 11× `data/maps/**/scripts.inc` | species/item operands **inside compiled script bytecode** + `GYM_REWARD_NAME` variable `.string` | **(c)** hard | ⚠ UPR reads vanilla tables, not scripts |
| 16 | Static legendaries | 5× `data/maps/**/scripts.inc` + `src/data/script_menu.h` | `setwildbattle`/`setvar` species operands in bytecode; names variable text | **(c)** | ⚠ UPR does statics via known offsets |
| 17 | **Item-ball picker randomizer** | ~15× `data/maps/**/scripts.inc` + `src/data/script_menu.h` | **adds/removes whole script labels, `case`s, `finditem` opcodes** per picked item + grows `MultichoiceList_*` | **(c)** — **hardest of all** | ❌ bespoke, structural bytecode growth |
| 18 | In-game trades | `src/data/trade.h` | `sIngameTrades[]` scalar fields **(a)**; but emits **new variable-length `sTradeAccepted_*/sTradeBase_*` arrays + pointers** **(b)** (relies on custom struct members already in the base) | **(a)+(b)** | ✅ (basic trades) |
| 19 | Mega-trainer NPCs | `data/maps/**/map.json` | item-swap = fixed field **(a)**; **NPC removal deletes an `object_events` element** → count/table shift **(b)** | **(a)/(b)** | ➖ bespoke |

### Nicknames & names — variable text

| # | Output | Source file | Compiled structure | Class | Community? |
|---|---|---|---|---|---|
| 20 | Location→nickname table | `src/location_nicknames.c` | variable-length `const struct[]` + inline `COMPOUND_STRING` literals (string pool) | **(b)** repoint + string pool | ✅ (name/text repoint) |
| 21 | Town-trade→nickname table | `src/trade_nicknames.c` | same as #20, keyed by `INGAME_TRADE_*` | **(b)** | ✅ |
| 22 | Starter nicknames | `src/starter_choose.c` | pointer array to variable-length strings | **(b)** | ✅ |

### Build-baked constants & mode toggles — the "not-data" tail

| # | Output | Source file | Mechanism | Class | Injectable path |
|---|---|---|---|---|---|
| 23 | Prize money (normal/boss/gym) | `src/battle_script_commands.c` | 3 `#define` → **immediates inside compiled `GetTrainerMoneyToGive`** | **(c)** | redesign: read from a settings struct → then **(a)** |
| 24 | Move relearn price | `src/move_relearner.c` | `#define` → immediate in `GetMoveRelearnerMoveCost` | **(c)** | same redesign → **(a)** |
| 25 | Run & Bun mode + E4 quotas | `data/maps/EverGrandeCity_SidneysRoom/scripts.inc` | `setvar` operands; **both branches compiled** | **(c)→ injectable** | patch the `setvar` operand byte(s) — **(a)-like** |
| 26 | Steven tag battle toggle | `data/maps/MossdeepCity_SpaceCenter_2F/scripts.inc` | `setvar VAR_DISABLE_STEVEN_TAG_BATTLE`; both battle branches compiled | **(c)→ injectable** | patch the `setvar` operand |

## Bucketed answer to your three questions

**What the community already knows how to inject (do it routinely):** #1 base stats/types/abilities, #2
move data, #3 evolutions, #4 level-up learnsets (repoint), #5 TM/tutor compatibility (repoint), #6 TM
moves, #8 item prices, #9 field items, #10–11 trainer parties (repoint — their hardest but proven), #12
wild, #13 starters, #18 basic trades, #20–22 names/nicknames (repoint). → **~80% of our payload.** These
are low-risk: the technique is standard; we only need *our* offsets.

**What is NOT injectable because it's literally a different ROM / engine:** *nothing irreducible.* The
mode toggles (#25 Run&Bun, #26 Steven tag) look like "different ROMs" but aren't — both branches are in
the base and a `setvar` operand selects at runtime. The only build-baked values are #23/#24 (two numbers)
which become injectable with a tiny engine tweak. **Your examples (Run & Bun, nicknames on/off) both turn
out to be injectable, not base variants.** True base variants would only appear if we add a feature that
forks the engine and *can't* be VAR-gated — none exist today.

**Seems injectable but is a real challenge (for us specifically):**
- **#15/#16/#17 map-script outputs** (gym rewards, static legendaries, the item-ball picker). These are
  compiled **script bytecode**, and #17 *grows the script* (new labels/opcodes) — the single hardest item.
  Fix: redesign them as **data tables the base engine reads** (a reward table, a placement table), so
  injection becomes a data overwrite. One-time base engineering.
- **Everything variable-length (#4,5,10,11,14,18,20,21,22)** is community-proven **but** our data is
  *expansion-format* — 1525 species, 860 trainers, bigger/different structs than vanilla — so the public
  UPR offset databases don't apply. We must **extract offsets from our own build's `.map`** and manage
  free-space ourselves. Mitigation (the "patch-friendly base" lever): since we own the base, **pad these
  tables to a max length / reserve a free-space arena**, converting most **(b)** repoints into **(a)**
  fixed-offset overwrites.
- **#19 mega-trainer NPC removal** shrinks a map's `object_events` array — prefer a "hide NPC" flag over
  deletion so it becomes a data toggle.

## Key risks & open questions

1. **32 MB ceiling (the biggest risk).** The built ROM is already **32 MB** — the GBA cartridge maximum.
   Padding variable tables to max-length and reserving a free-space arena needs headroom we may not have.
   **Phase-0 must audit the base `.map` for actual free/padding space** (GBA ROMs are power-of-2 padded, so
   the tail is often unused — the standard repoint target). If free space is insufficient, injection must
   repoint only into whatever slack exists (no blanket max-padding), or drop the largest-growth features.
2. **Upstream-sync offset drift.** Every pokeemerald-expansion update moves offsets. The injector must
   **regenerate its offset map from the build's `.map`/`.sym` automatically** (not hardcode), or a sync
   silently corrupts injections — the exact concern in [ADR-012](adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)
   and T-054's plan.
3. **Map-script → data-table redesign (#15–17).** Real engine work on the base; #17 (item picker) is the
   hardest because it currently *generates script code*. Scope this carefully; it may be the gate on
   go/no-go for full parity.
4. **Custom struct dependencies.** #18 trades already rely on custom `sIngameTrades[]` members
   (`requestedSpeciesList`, …) added by our engine — fine (they're in the base), but the injector must know
   their layout.
5. **Validation.** Need a harness: inject config X → boot in emulator (or headless) → diff against the
   *compiled* reference ROM for the same config, byte-for-byte on the affected tables. Without it, silent
   injection bugs ship.

## Recommended phased plan

- **Phase 0 — end-to-end spike (small, high signal).** Build the base once; extract offsets from `.map`;
  inject three outputs of increasing hardness — **#1 base stats (a)**, **#4 level-up learnset (b, repoint
  into tail free-space)**, **one #15 gym reward (c)** — and boot the result. Audit free-space headroom
  (Risk 1). Deliverable: proof the whole chain works + a go/no-go on the 32 MB budget.
- **Phase 1 — patch-friendly base (one-time engineering).** (i) Move #23/#24 constants to a settings
  struct; (ii) redesign #15/#16/#17 rewards & item placement as data tables the engine reads; (iii)
  reserve free-space / pad the variable tables (#4,5,10,11,14,18,20-22) as the free-space budget allows;
  (iv) keep feature toggles VAR-gated. Build this base **once**.
- **Phase 2 — the injector.** `.map`-driven offset extraction → an injector that writes every output to
  its offset (data overwrites + `setvar`-operand patches + settings block + free-space repoints). Replaces
  `make.js`'s per-user compile. Reuse the existing `writer.js` logic to *produce the values*, redirected
  from source-text edits to binary writes.
- **Phase 3 — delivery.** Server serves a static **base BPS + injector**; injection runs server-side
  (seconds, near-zero compute → the queue/ADR-005 dissolves) and/or **client-side** (zero server compute,
  offline desktop app with no toolchain) — the payoff ADR-013 and T-054 anticipate.

## Effort & verdict

- **Feasibility: high** for the ~80% data payload (standard technique, our offsets), **medium** for the
  variable-length repoints (proven, eased by owning the base), **hard but bounded** for the 5 map-script
  outputs (need data-driven base redesign) and gated by the **32 MB free-space** question.
- **Payoff: transformative** — minutes→seconds, no build queue, near-zero server compute, offline app,
  and the same legal posture (still a BPS over a base the user must own).
- **Recommended:** do **Phase 0** first. It is cheap, and it resolves the two things that decide the whole
  project — the 32 MB free-space budget and whether the `.map`-driven inject/boot chain works — before any
  large base-redesign commitment.
