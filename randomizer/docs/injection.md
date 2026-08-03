# Injection — writing a run's data into the prebuilt base ROM

Phase 3 of the base+injection migration ([strategy](../../docs/base-plus-injection-strategy.md),
[ADR-022](../../docs/adr/ADR-022-base-plus-injection-architecture.md)). The randomizer's value logic is
untouched; only the **output sink** changes — from "edit C sources, then `make`" (minutes) to "write
bytes into a base ROM" (seconds).

This page is the design reference for `randomizer/injector/`. Task history lives in `tasks/`
(T-238 built the skeleton; T-239–T-243 migrate the outputs one by one).

## The switch — and which side of it delivers (T-244)

Phase 3 kept `compile` as the default so every migration step was reversible in one env var. **T-244
inverted it:** injection produces every ROM a player receives, and the compile path is retained for one
job only — being the reference GATE-3 measures injection against.

| | |
|---|---|
| *(nothing set)* | **inject** — `make.js` calls `injectOneRom()`; no source mutation, no `make`, no restore |
| `--compile` / `ROM_BUILD_MODE=compile` | the compile path: writers mutate `src/`, `make`, restore. **Verification only** |
| `--inject` | injection, overriding any env — what `backend/build/buildRom.js` passes |

Three properties hold this in place, and each has a test:

- **No absence of configuration selects compile.** `resolveBuildMode()` defaults to `inject`; an empty or
  unset `ROM_BUILD_MODE` is unset, not a fallback.
- **`compileOneRom()` refuses unless asked for by name** (`isCompileExplicitlyRequested()`, or an explicit
  `allowCompile` from an in-process harness). A programmatic caller cannot start a 4-minute `make` by
  accident.
- **The delivery path asks for injection explicitly.** `buildRom.js` spawns `make.js … --inject`, and the
  flag beats the env, so a stale `ROM_BUILD_MODE=compile` in a box env cannot regress production.

A full randomized `nicknames-on` takes **16 s** by injection against ~55 s warm / ~230 s cold by compile.
The interactive "randomize fresh, then compile" maker (`make.js --randomize`) went with T-244: ROMs come
from a bundle. `node analyze.js` covers analysis; `backend/build/golden-corpus/generate.mjs` mints a
bundle from a config spec.

### Why the compile path was quarantined instead of deleted

T-244's plan said to remove it. It stayed, by decision, because it is not only a generator:

- It is **GATE-3's reference**. `parity.mjs --compile-each` asks "does the injector produce the data
  `compile()` produces?" for every table in the corpus. Delete `compile()` and that question becomes
  unanswerable — for the next upstream sync ([ADR-012](../../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)),
  for the next writer, forever. The `verify-corpus` skill and the corpus `manifest.json` rest on the same
  foundation.
- The injector **imports the writers** (see *Deriving writes from the compile path* below):
  `writer.applyWildPlanToEncounters`, `itemPriceWriter.patchPricesInContent`,
  `pokemonWriter.editSpeciesFile`, `moneyWriter`, `runAndBunWriter`, `stevenTagWriter`, `megaHiddenWriter`,
  `tradeWriter`, `evoLevelWriter`, `starterNameWriter`, `locationNameWriter`, `tradeNameWriter`. Stripping
  the source-edit code out of them would delete the rule the injected bytes are derived *from*.

What T-244 did remove is every way of reaching the compile path **by omission** — which is the failure
mode that mattered: a box that quietly builds the slow way, or a caller that mutates `src/` in production.

## Where the base comes from

| File | Default | Env override |
|---|---|---|
| base ROM | `base/pokeemerald.gba` | `INJECT_BASE_ROM` |
| linker map | `base/pokeemerald.map` | `INJECT_BASE_MAP` |
| symbol table (`make syms`) | `base/pokeemerald.sym` | `INJECT_BASE_SYM` |

All three must come from **the same build**. Producing them on the build box:

```sh
git checkout src/ include/ data/maps/     # a clean base, never a randomized tree
make -j$(nproc) && make syms
node randomizer/injector/buildOffsetMap.js --map=pokeemerald.map --sym=pokeemerald.sym \
     --rom=pokeemerald.gba --out=base/base-offsets.json
```

`buildOffsetMap.js` prints the ROM budget against the 32 MB ceiling (GATE-1, recomputed) and a
per-module readiness table: which claimed symbols the base actually exports. **Run it after every base
change** — a missing symbol there is the T-234/T-237 trap (LTO folds a constant, then garbage-collects
the table nothing reads any more), and it is much cheaper to catch here than in a Phase-3 debug session.

## Never hardcode an offset

Randomization and any source edit move every table (T-232 measured `gSpeciesInfo` drifting between two
builds), and an upstream sync moves them again ([ADR-012](../../docs/adr/ADR-012-upstream-bugfix-cherry-pick-sync.md)).
So offsets come from the build's own `.map`/`.sym`, and injection targets **the fixed base only** —
never a randomized build.

- **`.map`** — global symbols with their sections and sizes.
- **`.sym`** (`make syms`, i.e. `objdump -t`) — also **local** symbols. Map-script labels are local, so
  every Group-D setvar site is here and nowhere else. `offsetMap.merge(symMap)` folds them in.

## The modules

| File | What it is |
|---|---|
| `injector/index.js` | orchestrator + the **module registry** (the migration's progress board) |
| `injector/rom.js` | bounds/range-checked, journalled writes over the base bytes |
| `injector/symbolMap.js` | `.map`/`.sym`/`.json` → `{ name: { addr, romOffset, size } }` |
| `injector/scriptPatch.js` | Group-D toggles: find a `setvar` immediate inside a compiled script |
| `injector/freeSpace.js` | B2 fallback: free-run scan, arena allocator, repointer |
| `injector/parity.js` + `verifyParity.js` | INV-BYTES diagnostics: which bytes differ, and whose symbol |
| `injector/buildOffsetMap.js` | the extraction + readiness CLI above |
| `injector/mode.js` | the compile-vs-inject switch |
| `injector/gameConstants.js` | the base's `include/constants/*.h` as a name→number table (`#define` + `enum`) |
| `injector/partyFile.js` | the parts of `tools/trainerproc` that decide bytes: `.party` parsing, the name→constant transform, `struct TrainerMon` encoding (T-241) |
| `injector/charmap.js` | `charmap.txt` + EOS as a name→bytes encoder — the ROM stores text in the game's charset, not ASCII (T-242) |
| `injector/structLayout.js` | struct field offsets + the **base anchors** that prove them (below) |
| `injector/context.js` | builds constants + layout **once per ROM** and runs the anchor check (cached: the anchors are the base's own data, so only the first module can read them back — T-240) |
| `injector/modules/*.js` | one file per output, plus a `group*.js` that a registry entry points at |

### Ids and struct offsets

A bundle speaks names (`SPECIES_BULBASAUR`, `MOVE_POUND`, `DAMAGE_CATEGORY_SPECIAL`); the ROM speaks
numbers, and a field's place inside a struct is in neither the `.map` nor the `.sym` (the base is built
without debug info — `DINFO=1` also changes `-O`, so it is not the golden base).

- **Ids** come from the base's own `include/constants/*.h`, never from a copy in JS: an upstream sync
  renumbers species, and a stale table here would write Ivysaur's stats onto Venusaur without failing.
- **Offsets** are declared in `structLayout.js` from `include/pokemon.h` / `move.h` / `item.h` and then
  **verified against the base's own data** before any module writes: Bulbasaur must read back
  45/49/49/45/65/65 GRASS/POISON, a late species (Miraidon) too — that is what proves the *stride* —
  Pound 40/100/NORMAL/PHYSICAL, a Poké Ball 200. A mismatch throws and nothing is written.
- **Strides** are derived (`symbol size / entry count`), which needs the `.sym`. Adding a struct's
  fields up is not a substitute: ARM rounds a struct's size up to a multiple of 4, so
  `struct TradeNickname`'s 1 + 13 bytes occupy **16** (T-242), while `struct LocationNickname`'s
  3 + 13 needed no padding — the same reasoning gave the right answer for one table and the wrong one
  for its neighbour.
- `SpeciesInfo.evolutions` sits past the config `#if`s, so it is *found*: the only pointer in the anchor
  species' struct whose target decodes as the base's own evolution.

### Deriving writes from the compile path

Where a writer's rule is narrower than it looks, the module runs **the writer's own function** over the
base source and injects the diff, instead of re-deriving the rule:

| module | runs | why |
|---|---|---|
| `itemPrices` | `itemPriceWriter.patchPricesInContent` over `src/data/items.h` | only blocks whose `.price` is a plain number are patched (Serious Mint's `(I_PRICE >= GEN_9) ? …` never is) |
| `wildEncounters` | `writer.applyWildPlanToEncounters` / `substituteWildSpecies` over `src/data/wild_encounters.json` | the sweep plan's slot distribution has one home (T-162) |

Reading base sources at inject time is safe — inject mode never mutates the tree — and they are the same
sources the ids come from. A harness can pass them in instead (`sources` on the group module).

Two writers are **log-driven** for the same reason: `pokemonWriter`/`moveWriter` only rewrite a field
whose rebalance/mutation `log` names it, so injecting a "correct-looking" value the writer would have left
alone breaks INV-BYTES.

### Fixed-capacity families (the learnsets)

The 1104 + 1101 learnset arrays are one symbol each (T-237 dropped their `static` and padded them to a
fixed capacity), so the module walks the **base source** and writes name-keyed slots. Three rules that
are not visible in the writer's output text but decide the bytes:

- **Write the whole slot.** A compiled `[CAPACITY]` array is zero past its initializers, so a shorter
  learnset must clear the tail — otherwise the base's surplus entries survive behind the terminator.
- **Mirror each writer separately.** They disagree: an empty level-up list is written (a block holding
  only `LEVEL_UP_END`), an empty teachable list is *skipped* and the base's list stays.
- **Prove every slot first.** Each array the base exports is byte-matched against the source it was
  compiled from before anything is written — that is what pins `struct LevelUpMove`'s field order, the
  name→symbol mapping, and "these sources and this ROM are the same build". A run that claims arrays the
  base exports **none** of is refused, since silent no-ops are how the T-234/T-237 trap ships base data
  in a "randomized" ROM.

### The write journal

Every write is recorded (`offset`, `length`, `tag`) and **bit-granular ownership** is tracked: two
modules writing the same bits throws, naming both tags. Packed fields legitimately share a word (that is
what `writeBits` is for), so ownership is per bit, not per byte. This is what keeps INV-BYTES honest —
a byte may only change because a module meant to change it.

A write into **anonymous data** — a trainer party, an evolution array: memory the ROM reaches through a
pointer rather than a symbol — also records `via: { symbol, at }`, the pointer it was found through.
`compile()` puts that data at a different address than the base does (B-057), so a parity check must
follow *each build's own* pointer; without `via` it compares at a fixed delta and reads the neighbour's
bytes (T-241, where every party looked 8 B wrong).

### The registry

```js
{ id: 'learnsets', task: 'T-240', status: 'migrated',
  apply: (args) => require('./modules/learnsets').applyLearnsets(args),
  symbols: [], symbolPatterns: [/^s\w*LevelUpLearnset$/, /^s\w*TeachableLearnset$/] }
```

Where the migration stands — the registry itself is the source of truth, this is the map of it:

| entry | task | writes |
|---|---|---|
| `group-a-fixed` | T-239 | species stats/types/abilities + the T-077 held-item strip, move power/accuracy/type/category, evolution levels (+ stone `IF_MIN_LEVEL`), wild-encounter species, `gItemsInfo[].price`, `gTMHMItemMoveIds[].moveId` |
| `learnsets` | T-240 | level-up + teachable learnsets |
| `trainer-parties` | T-241 | trainer parties + battle partners (through `gTrainers[].party`), `partySize` and the battle-format flag |
| `trades-starters-nicknames` | T-242 | in-game trades, the starter trio + extra starters, the location/trade nickname tables and their counts — everything made of **text**, encoded through `charmap.js` |
| `data-driven-and-toggles` | T-243 | the Phase-2 tables (settings, rewards, static encounters, item picks, hidden megas) + the Group-D setvars. `gItemPicks` is written **per row**: 24 of its 53 entries are static TM picks the writer never regenerates |

Two Group-A rows of the strategy table are not in `group-a-fixed`: the **starter trio** belongs to
T-242's entry, and **route/mail items** stopped being a map-data edit when T-236 moved item placement
into `gItemPicks` (T-243) — writer.js's mail-mint loop matches nothing in `data/maps/**` any more.

`injectRom()` refuses to emit a ROM while any module is `pending` (nothing is, since T-243 — the guard
is now exercised by tests that pass an explicit pending module) — an injected ROM would ship **base**
data for the un-migrated outputs, i.e. a "randomized" ROM that isn't randomized. Parity harnesses and
work-in-progress pass `allowPending: true` explicitly. A test asserts that every symbol the
golden-master `manifest.json` tracks is claimed by exactly one module, so an export can't be added in
Phase 2 and then forgotten in Phase 3.

## Migrating a module (T-239 … T-243)

1. Write the module's `apply({ rom, offsetMap, data, log })`; take every offset from `offsetMap`, tag
   every write, and let the capacity guards from T-237 keep payloads inside their slots.
2. Flip its registry entry to `status: 'migrated'`.
3. Prove **GATE-3** on the whole corpus — every table the module wrote must equal the compiled ROM's:

   ```sh
   INJECT_BASE_ROM=base/pokeemerald.gba INJECT_BASE_MAP=base/pokeemerald.map \
   INJECT_BASE_SYM=base/pokeemerald.sym \
     node backend/build/golden-corpus/parity.mjs --compile-each --by-symbol --reuse-compiled
   ```

   Not a sha256 comparison, **by decision**: a compiled ROM's layout drifts with its own data
   ([B-057](../../bugs/B-057-compile-layout-drifts-with-injected-data.md), accepted in
   [ADR-023](../../docs/adr/ADR-023-injection-verified-by-data-equivalence.md)), so the two images differ
   while every byte of data agrees. Image equality was convenient, never required — the artifact players
   receive is the injected one. `--by-symbol` reads each table at each build's own address;
   `--reuse-compiled` caches the corpus compiles in `.gate3-cache/`, so a second attempt costs seconds.
   For a raw region-by-region view of two ROMs there is still
   `node randomizer/injector/verifyParity.js --a=… --b=… --map=…`.
4. Only then start the next module — a failure must stay localised to one module.

## Coverage: what the compile path writes, and who claims it

Equivalence is not coverage. GATE-3 compares the bytes a module **wrote** against `compile()`'s, so an
output no module writes is invisible to it — which is exactly how [B-060](../../bugs/B-060-mega-stone-map-items-never-injected.md)
shipped a ROM handing out `????????` mega stones. The write surface below was **measured** (2026-08-02):
a copy of the tree ran everything `compileOneRom` does before `make`, hashing `src/`, `data/`,
`include/` and `graphics/` before and after. **31 files.**

| what the compile path mutates | claimed by |
|---|---|
| `src/data/pokemon/species_info/gen_1..9_families.h` (9) | `group-a-fixed` — species + evolutions |
| `src/data/wild_encounters.json` | `group-a-fixed` — wild slots |
| `src/data/items.h` | `group-a-fixed` — prices |
| `include/constants/tms_hms.h` | `group-a-fixed` — TM→move |
| `src/data/pokemon/level_up_learnsets/gen_9.h`, `teachable_learnsets.h` | `learnsets` |
| `src/data/trainers.party`, `battle_partners.party` | `trainer-parties` |
| `src/data/trade.h`, `src/starter_choose.c`, `src/location_nicknames.c`, `src/trade_nicknames.c` | `trades-starters-nicknames` |
| `src/randomizer_picks.c`, `src/randomizer_rewards.c` | `data-driven-and-toggles` |
| `data/maps/EverGrandeCity_SidneysRoom/scripts.inc`, `MossdeepCity_SpaceCenter_2F/scripts.inc` | `data-driven-and-toggles` — the Group-D setvars |
| `data/maps/*/map.json` (8, the `ITEM_MEGA_nn` balls) | `data-driven-and-toggles` — `megaMapItems` (added by B-060) |
| `src/randomizer_settings.c`, `src/data/moves_info.h` | `data-driven-and-toggles` / `group-a-fixed` — did not change for the measured bundle (its config matched the committed defaults), so the measurement cannot confirm them |
| `src/data/script_menu.h` | nobody — dead since T-247 removed the multichoice loops |

**Re-measure after adding a writer.** A new output that nothing claims will not fail a gate; it will fail
a play-test, days later, as a corrupt item.

### INV-LAYOUT — the tripwire

Accepting the layout drift (ADR-023) costs a check, so `injector/layoutDrift.js` restores a narrower one,
run by the gate on every bundle. It draws the only line that matters:

| drift | verdict |
|---|---|
| a symbol **moved**, same size | expected — injection reads the base's own `.map`, and a base cannot react to data that does not exist yet. Reported, never failed. |
| an **injectable table resized** | **FAIL** — its capacity depends on its data, so T-237's fixed-capacity premise is gone and a write would spill past its slot |
| an **injectable table vanished** | **FAIL** — LTO folded a value and garbage-collected the table (the T-234/T-237 trap); injecting it becomes a silent no-op |
| any other symbol resized | noise, counted and ignored — `.text` is allowed to grow |

Measured on the corpus (base `af0dff6c92ef…`): 41,566 of 48,406 symbols moved, **0** injectable tables
changed shape. That is now asserted on every run instead of remembered.

## The B2 caveat

`freeSpace.js` exists for a payload that outgrows its slot. After T-237 every table the randomizer
rewrites is **B1** (fixed capacity, overwritten in place), so nothing should reach for it. Repointing
puts data where the compiler wouldn't have, so a repointed module **can no longer be verified by hash
equality** — say so in its task before using it.
