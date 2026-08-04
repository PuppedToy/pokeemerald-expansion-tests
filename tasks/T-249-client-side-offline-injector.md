---
id: T-249
title: "Run the injector in the browser — zero-server-compute / offline artifact generation"
status: in-progress
type: feature
created: 2026-08-04
updated: 2026-08-04
target-version: 0.8.0
links: [T-246, T-250, docs/client-side-injector-evaluation.md, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-022-base-plus-injection-architecture.md, docs/adr/ADR-023-injection-verified-by-data-equivalence.md]
blocked-by: [T-246]
---

# T-249 — Client-side / offline injector

## Context

Carved out of [T-246](T-246-base-injection-frontend-delivery-uat.md), whose criterion was to *evaluate*
this. The evaluation is [docs/client-side-injector-evaluation.md](../docs/client-side-injector-evaluation.md)
— verdict: feasible, and the payoff ADR-013/ADR-022 anticipate (zero server compute per user, a
toolchain-free offline path), but a refactor rather than a flag. Do not restate the evaluation here.

## Plan

In the order that keeps each step independently useful:

1. **Bake the injector's source-derived inputs into an artifact** at base-build time (natural home:
   `buildOffsetMap.js`, which already emits `base-offsets.json`) and feed the modules through the existing
   `sources` seam instead of `readFileSync` — 14 files call it today.
2. **Ship the base as one static `base.bps`** (vanilla→base) applied by the patcher already in the browser
   (ADR-013), cached in IndexedDB next to the user's vanilla ROM; keyed by a base build id so a new base
   invalidates it.
3. **De-`fs` the injector module graph** so it bundles for the browser, and wire it into the Worker behind
   a flag.
4. **Prove it cannot fork from the Node path**: a test that injects one bundle through both and compares
   sha256 (the box and a Mac already agree byte-for-byte — T-244).

Acceptance criteria:
- [ ] The injector runs in the browser and produces, for at least one corpus bundle, a ROM whose sha256
      equals the Node path's.
- [ ] No 32 MB artifact is ever served: the base is reconstructed client-side from vanilla + a static BPS.
- [ ] The Node/GATE-3 path still runs the same modules (no second implementation).
- [ ] Mobile-Safari memory ceiling measured (32 MB ROM + 19 MB bundle in a Worker) and either passed or
      documented as a supported-platform limit.
- [ ] Decided + recorded: what happens to per-run diagnostics/decision logs for a client-injected run.

## Progress log

- **2026-08-04** — Created out of T-246's evaluation criterion.

- **2026-08-04 — started; step 1 scoped against the code.** Read every `fs` call site in
  `randomizer/injector/` (14 files) and settled the seam before writing any of it:

  **One provider keyed by repo-relative path, not per-module keys.** The existing per-module `sources`
  object (`{ encountersJson, speciesSources, tradeSource, … }`) stays exactly as it is — it is what the
  module tests pass — but its *fallback* stops being `fs.readFileSync(<abs path>)` and becomes
  `ctx.sources.read('<repo-relative path>')`. So one object carries every input, and the browser fills it
  from an artifact while Node keeps reading the tree.

  **The paths are relative literals, pinned by a test.** The modules resolve absolute paths today
  (`SPECIES_DIR`, `itemPriceWriter.file`, `wildData.file`) via `path.resolve(__dirname, …)`, which in a
  browser bundle resolves against the `path` shim and yields garbage — so an absolute key cannot survive
  bundling. `gameConstants.DEFAULT_HEADERS` already sets the precedent of relative literals. To keep
  ADR-012 honest, every literal is asserted equal to the constant the module actually reads, so a moved
  file fails a test instead of silently missing from the artifact.

  Also noted: the `path` shim (`frontend/js/shims/path.cjs`) has no `relative()`, which is the other
  reason not to derive relative paths at runtime.

- **2026-08-04 — step 1 done: the injector no longer reads the disk, and the base's sources are an
  artifact.** `randomizer/injector/sources.js` is the seam: a `BaseSources` keyed by repo-relative path,
  answering either from the tree (`treeSources()`, the Node default — unchanged behaviour) or from a baked
  artifact (`BaseSources.fromJSON`). `buildOffsetMap.js --sources=base-sources.json` emits it beside
  `base-offsets.json`, keyed by the base ROM's sha256 when `--rom` is given, so base and inputs can never
  be cached apart.

  The contract that makes step 3 possible is now **enforced by a test, not by discipline**: of the 15
  files under `randomizer/injector/`, only five may `require('fs')` — `sources.js`, `rom.js`,
  `symbolMap.js`, `buildOffsetMap.js`, `verifyParity.js`. Everything that runs *during* an injection is
  fs-free, including the five modules and `gameConstants` / `charmap` / `scriptPatch`, which now read
  through the seam and default to a tree provider instead of calling `readFileSync` themselves.

  One thing moved home: `DEFAULT_HEADERS` now lives in `sources.js` as `CONSTANT_HEADERS`
  (`gameConstants` re-exports it under the old name). It had to — `gameConstants` needs the seam and the
  seam needs the header list, and a require cycle between them would have left `DEFAULT_HEADERS`
  `undefined` depending on which file loaded first.

  **Measured** (52 files): 6.36 MB of source text, 6.61 MB as JSON — **650 KB gzipped, 440 KB brotli**,
  against the evaluation's ~1 MB guess. The three biggest files are `gen_9.h` (770 KB),
  `gen_1_families.h` (740 KB) and `teachable_learnsets.h` (700 KB). Baking takes ~6.7 s, once per base
  build.

  **Proven end-to-end, not just unit-tested.** Injecting `debug/run-m2/bundle.json`'s first ROM against
  the production base twice — once reading the tree, once from the round-tripped artifact — produced
  `8c8d1c5f4e6d3d6033bfd72597b756afbfd9691462b63c5cfef7eccfe35657af` both times. Same 420,081 bytes
  written, same five modules. `make.js`'s `injectOneRom` takes an optional `baseSources` for exactly this
  (null keeps today's behaviour). Suite: 2169 passing, 23 skipped.

- **2026-08-04 — the offset map is the artifact that needed trimming, not the sources.** Baking the local
  base's full map to JSON gave **21 MB / 87,988 symbols** — worse than the source text, and a heap no
  mobile Worker wants beside a 32 MB ROM. But injection can only *address* what the module registry names
  or matches: `filterOffsetMapForInjection` (derived from the registry, never hand-listed) cuts it to
  **2,819 symbols — 492 KB raw, 48 KB gzipped, 30 KB brotli**, emitted by
  `buildOffsetMap.js --inject-out=…`.

  The danger there is silence: `learnsets` reads a missing symbol as "the base does not export this array"
  and leaves the base's data in place, so an over-eager filter ships a plausible un-randomized ROM. Two
  things hold it down — the filter takes the registry's `symbols`, its `symbolPatterns` matches **and** a
  new `localLabels` (the two Group-D script labels, which are local and therefore in no linker map, so
  they could never have been in `symbols`) — and a test injects the same bundle through both maps and
  demands the same sha256.

  Re-ran the real-base check with all three input combinations against `debug/run-m2`'s first ROM:

  | inputs | sha256 |
  |---|---|
  | tree sources + full `.map`+`.sym` (today) | `8c8d1c5f4e6d…` |
  | baked sources + full map | `8c8d1c5f4e6d…` |
  | baked sources + filtered map (**what the browser gets**) | `8c8d1c5f4e6d…` |

  Worth noting for [[T-250]]: loading that JSON map costs nothing, so the client artifact also sidesteps
  the 4.1 s `.map` parse — the same artifact would speed the server up.

## Outcome
