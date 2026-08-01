---
id: T-238
title: "Base+injection Phase 3 — injector skeleton, .map offset loader, compile-vs-inject switch"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-01
target-version: 0.7.0
links: [T-229, T-232, T-233, docs/base-plus-injection-strategy.md]
blocked-by: [T-232, T-233]
---

# T-238 — Injector skeleton + runtime switch

## Context
The core of Phase 3: a module that loads the base ROM + the T-232 offset map and offers write-at-offset /
repoint primitives, plus a **runtime compile-vs-inject switch** so migration is staged and reversible.
See [strategy Phase 3](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Build `randomizer/injector` (base loader, offset-map loader, fixed-offset writer, bit-field writer,
free-space allocator + repointer). Add a config/env switch selecting compile vs inject per build (default
compile until parity). No output modules migrated yet — just the framework + a no-op pass verified against
compile.

Shape (decided 2026-08-01, before code):

| File | Responsibility |
|---|---|
| `randomizer/injector/symbolMap.js` | parse the base build's `.map` → `{ name: { addr, romOffset, size } }`; addr↔offset; `require()` lookups that throw with the symbol name; the T-232 leftover, made reusable |
| `randomizer/injector/rom.js` | `Rom` over the base `Buffer`: bounds-checked u8/u16/u32/bytes read+write, GBA pointer read/write, bit-field read-modify-write, sha256, save; a **write journal** so overlapping writes from two modules fail loudly |
| `randomizer/injector/freeSpace.js` | free-run scan + aligned allocator + `repoint()` (B2 fallback only — using it breaks byte-parity with `compile()`, so it stays unused while every table is B1) |
| `randomizer/injector/index.js` | orchestrator + **module registry** (one entry per T-239…T-243 module, `pending` until migrated); `injectRom()` refuses to emit a ROM while any module is `pending` unless explicitly told it is a partial/parity run |
| `randomizer/injector/mode.js` | `ROM_BUILD_MODE=compile\|inject` (+ `--inject`/`--compile`), default **compile**; one place to flip and to roll back |

Acceptance criteria:
- [ ] Injector loads base + offset map; write/repoint primitives unit-tested.
- [ ] compile-vs-inject switch wired (default compile); rollback trivial.
- [ ] No-op inject reproduces the base byte-for-byte (INV-BYTES baseline).

## Progress log
- **2026-07-27** — Created (Phase 3).
- **2026-08-01** — Started. Branch `feature/T-238-injector-skeleton-switch` off master (T-234…T-237 +
  T-247 are committed there, unpushed). Plan above; TDD per file, then validation against the real
  post-T237 base (`.map` + ROM `10f913694b2d…`) on the build box.

- **2026-08-01 — SKELETON DONE (local): 9 modules, 96 tests, suite 1842 green.**
  Every file written RED-first. What was built, and the decisions inside it:
  - **`symbolMap.js`** — GNU ld `.map` → `{ name: { addr, romOffset, size, section, object } }`, plus
    `.sym` (`make syms` / `objdump -t`) and a JSON export. Handles the wrapped long-section-name form,
    derives a symbol's size from the next symbol in its section, skips `*fill*` / `PROVIDE` / `. = ALIGN`
    / discarded sections, and translates **LMA-loaded** sections (EWRAM data has a RAM address but a ROM
    image). `require()` throws naming the symbol — the T-234/T-237 failure mode (symbol absent because
    LTO folded its reader) surfaces as a named error, not `undefined`.
    - **Why the `.sym` too:** a linker map has no **local** symbols, and every map-script label is local
      — so the Group-D setvar sites (T-232's other leftover) are only findable there. `merge()` folds a
      `.sym` into a `.map`, map entries winning.
  - **`rom.js`** — bounds-checked, range-checked, **journalled** writes (u8/u16/u32/bytes/pointer/bits).
    Ownership is tracked **per bit**, not per byte: packed fields (`gMovesInfo`) legitimately share a
    word, but the same field written twice throws naming both tags. That decision came out of a RED test
    — a byte-granular guard rejected the legitimate case. One `Uint8Array` of claimed-bit masks (25 MB
    for a 25 MB ROM); the previous owner is recovered from the journal in the error path only, so there
    is no second ownership array.
  - **`scriptPatch.js`** — Group-D toggles. `SCR_OP_SETVAR` = 0x16 (`asm/macros/event.inc`), operand
    found by **scanning the script** for opcode+var-id, never by a stored offset; `requireUnique`
    refuses to guess between two sites, and `expectValue` asserts what the base currently holds (a
    mismatch means the wrong build). Var ids are read out of `include/constants/vars.h` — one home, same
    discipline as T-237 reading capacities from `randomizer_layout.h`.
  - **`freeSpace.js`** — B2 fallback (scan / bump-allocate / repoint). Arena bounds must be **explicit**
    (no silent "grow the ROM"), and the allocator verifies the region really is padding before handing
    it out. Documented as parity-breaking by construction: after T-237 nothing should need it.
  - **`parity.js` + `verifyParity.js`** — INV-BYTES diagnostics. `diffRegions` (with gap-merging and a
    region cap) + `attributeDiff` name the **symbol** owning each differing region, so a Phase-3
    mismatch reads `0x64e1d8  2 bytes  gSpeciesInfo+0x4` instead of "hashes differ".
  - **`index.js`** — orchestrator + the **module registry**: one entry per T-239…T-243, each declaring
    the symbols (or name patterns) it will write. `injectRom()` **refuses to emit a ROM while any module
    is pending** (it would ship base data as if randomized) unless the caller passes `allowPending` —
    that is exactly what makes the no-op parity run expressible without a "trust me" flag in production.
    A test cross-checks the registry against `backend/build/golden-corpus/manifest.json`: **every one of
    the 20 injectable symbols Phase 2 exported is claimed by exactly one module**, so an export can't be
    added in Phase 2 and forgotten in Phase 3.
  - **`buildOffsetMap.js`** — the reusable extraction T-232 deferred: ROM budget vs the 32 MB ceiling +
    a per-module readiness table (`READY` / `MISSING <symbol>`), and `--out=` writes the JSON map.
  - **`mode.js` + `make.js`** — `ROM_BUILD_MODE=compile|inject` (default **compile**), `--compile` /
    `--inject` beating the env. `buildOneRom()` now dispatches: the old body became `compileOneRom()`,
    the new `injectOneRom()` loads `base/pokeemerald.{gba,map,sym}` (env-overridable), seeds the RNG
    **identically** to the compile path, injects, and emits the same artifact. `emitArtifact()` gained
    `builtRomBuffer` so an injected ROM never has to be written to disk before delivery.
  - Wiring is proved by `backend/__tests__/buildMode.test.js`: compile is the default, inject refuses
    while modules are pending, and a partial run over a synthetic base is **byte-identical to that
    base** — the INV-BYTES baseline, on synthetic data.
  - Docs: `randomizer/docs/injection.md` (+ its row in CLAUDE.md's design-reference table) — the switch,
    where the base comes from, the registry, and the per-module migration checklist for T-239+.
  - No changelog line: internal infrastructure, nothing user-visible yet (same call as T-232).
  - **Still open:** the parser is validated against a *synthetic* fixture map, and byte-parity against
    a *synthetic* base. Both need the real post-T237 base on the build box (`make` + `make syms`, then
    `buildOffsetMap.js`) before the acceptance criteria can be ticked.

## Outcome
