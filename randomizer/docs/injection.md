# Injection — writing a run's data into the prebuilt base ROM

Phase 3 of the base+injection migration ([strategy](../../docs/base-plus-injection-strategy.md),
[ADR-022](../../docs/adr/ADR-022-base-plus-injection-architecture.md)). The randomizer's value logic is
untouched; only the **output sink** changes — from "edit C sources, then `make`" (minutes) to "write
bytes into a base ROM" (seconds).

This page is the design reference for `randomizer/injector/`. Task history lives in `tasks/`
(T-238 built the skeleton; T-239–T-243 migrate the outputs one by one).

## The switch

| | |
|---|---|
| `ROM_BUILD_MODE=compile` (default) | the proven path: writers mutate `src/`, `make`, restore |
| `ROM_BUILD_MODE=inject` | `make.js` calls `injectOneRom()`; no source mutation, no `make`, no restore |
| `node make.js … --compile` / `--inject` | per-invocation override; the flag beats the env |

The backend spawns `node make.js …` and inherits the env, so flipping the box's env flips the whole
queue — and unsetting it rolls everything back. Default stays `compile` until INV-BYTES holds for every
module.

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

### The write journal

Every write is recorded (`offset`, `length`, `tag`) and **bit-granular ownership** is tracked: two
modules writing the same bits throws, naming both tags. Packed fields legitimately share a word (that is
what `writeBits` is for), so ownership is per bit, not per byte. This is what keeps INV-BYTES honest —
a byte may only change because a module meant to change it.

### The registry

```js
{ id: 'learnsets', task: 'T-240', status: 'pending', apply: null,
  symbols: [], symbolPatterns: [/LevelUpLearnset$/, /TeachableLearnset$/] }
```

`injectRom()` refuses to emit a ROM while any module is `pending` — an injected ROM would ship **base**
data for the un-migrated outputs, i.e. a "randomized" ROM that isn't randomized. Parity harnesses and
work-in-progress pass `allowPending: true` explicitly. A test asserts that every symbol the
golden-master `manifest.json` tracks is claimed by exactly one module, so an export can't be added in
Phase 2 and then forgotten in Phase 3.

## Migrating a module (T-239 … T-243)

1. Write the module's `apply({ rom, offsetMap, data, log })`; take every offset from `offsetMap`, tag
   every write, and let the capacity guards from T-237 keep payloads inside their slots.
2. Flip its registry entry to `status: 'migrated'`.
3. Prove **INV-BYTES** on the whole corpus (GATE-3): for each bundle, `compile()` and `inject()` must
   produce the same sha256. Localise a mismatch with
   `node randomizer/injector/verifyParity.js --a=compiled.gba --b=injected.gba --map=pokeemerald.map`,
   which prints `offset  length  symbol+delta` per differing region.
4. Only then start the next module — a failure must stay localised to one module.

## The B2 caveat

`freeSpace.js` exists for a payload that outgrows its slot. After T-237 every table the randomizer
rewrites is **B1** (fixed capacity, overwritten in place), so nothing should reach for it. Repointing
puts data where the compiler wouldn't have, so a repointed module **can no longer be verified by hash
equality** — say so in its task before using it.
