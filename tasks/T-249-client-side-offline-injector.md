---
id: T-249
title: "Run the injector in the browser — zero-server-compute / offline artifact generation"
status: done
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
- [x] The injector runs in the browser and produces, for at least one corpus bundle, a ROM whose sha256
      equals the Node path's. — a real Chromium **and** WebKit Worker, `8c8d1c5f4e6d…` for `debug/run-m2`
      against the production base (`visual-tests/injector-browser-check.mjs`).
- [x] No 32 MB artifact is ever served: the base is reconstructed client-side from vanilla + a static BPS.
      — `base.bps` + IndexedDB, keyed by the base's sha256; exercised end to end through the shipped
      `client-inject.js`. (The patch is 31.8 MB / 16.5 MB gzipped — see the log; that is what is served
      *per ROM per run* today, and now it is fetched once.)
- [x] The Node/GATE-3 path still runs the same modules (no second implementation). — the browser bundles
      `randomizer/injector/`; the fs boundary is enforced by test.
- [~] Mobile-Safari memory ceiling measured (32 MB ROM + 19 MB bundle in a Worker) and either passed or
      documented as a supported-platform limit. — **measured on desktop**: 213 MB peak, +71 MB for the
      injection, and Safari's engine produces the same bytes. The real-device check is **deferred by the
      owner to after the beta** and carried by [T-253](T-253-client-injection-device-aptitude.md), together
      with a finding from this task's shipping analysis: that 213 MB is the *1-ROM* figure and the peak
      scales with ROM count. Shipping with the flag off is what makes deferring it safe.
- [x] Decided + recorded: what happens to per-run diagnostics/decision logs for a client-injected run. —
      unchanged (they are *generation* artifacts, already posted by the browser); what has no equivalent is
      the server build log. Recorded in `randomizer/docs/client-injection.md`.

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

- **2026-08-04 — step 3: the injector bundles, and it produces the same ROM with no Node underneath it.**
  `node build.js` now emits `frontend/js/injector.bundle.js` (935 KB) from
  `frontend/js/injector-worker.cjs`, built with the config the randomizer worker already uses. `fs` was
  never the hard part — the blockers were the two things Node hands the injector for free:

  - **`Buffer`.** Used bare (`Buffer.alloc`, `Buffer.from`) by `rom.js` and every encoder, ~14 methods in
    total. Hand-written shim rather than a polyfill dependency (the repo has exactly one devDependency),
    pinned method-by-method against Node's Buffer in `browserShims.test.js`. The one that would have been
    a silent ROM corruption: Node's `slice()` returns a **view**, `Uint8Array.prototype.slice` **copies** —
    inheriting it would have thrown away writes the injector makes through slices. It is aliased to
    `subarray`, and a test writes through both.
  - **`crypto.createHash('sha256')`.** WebCrypto is async and `Rom.sha256()` is called synchronously
    everywhere, so the shim is the algorithm (FIPS 180-4, ~40 lines), checked against Node's on the
    padding edge cases (55/56/63/64/65 B) and on a megabyte.

  Two traps worth recording:

  1. **esbuild `inject` ignores CommonJS exports.** Injecting `buffer.cjs` bundled *fine* and then threw
     `Buffer is not defined` at the first write: `inject` substitutes only names a module *exports*, and it
     does not see them inside `module.exports = { … }`. Hence the two-line ESM wrapper
     `shims/buffer-inject.mjs`.
  2. **`randomizer/layout.js` reads its header at import time**, and five writers destructure the
     capacities the moment they are imported (T-237's SSOT) — there is no seam to thread through an
     `import`. So the `fs` shim stopped being a pure stub: the Worker registers the baked sources with it
     before requiring the graph, and it serves those load-time reads out of **the same artifact**, matching
     on the repo-relative tail of the shim-built path (the header joined the manifest: 53 files now). A path
     the artifact does not carry still throws, and now says which file to add.

  `injectorBrowserBundle.test.js` builds the bundle and runs it in a `vm` sandbox with **no Buffer, no
  require, no process, no fs**, injecting the synthetic base: same `bytesWritten`, same sha256 as
  `injectRom` in Node. Also proven on the real thing — the same bundle, same sandbox, the production base
  and `debug/run-m2` gave `8c8d1c5f4e6d…` in **2.0 s**.

  One more thing moved home on the way: `injectionDataFor` (which artifacts a ROM gets, under which seed)
  was inside `make.js`. The browser needs the same answer and the seed decides values the writers
  re-derive, so it is now `randomizer/injector/romData.js` and `make.js` calls it.

- **2026-08-04 — it runs in a real browser, in both engines, and produces the same bytes.**
  `visual-tests/injector-browser-check.mjs` (a harness, not a Playwright test — it needs the gitignored
  32 MB base, like verify-corpus needs the box) builds the two artifacts, injects the bundle in Node, then
  does it again in a real **Worker** created by a page, over HTTP, with the ROM transferred both ways.

  | | sha256 | inject |
  |---|---|---|
  | Node | `8c8d1c5f4e6d…` | 0.7 s |
  | Chromium Worker | `8c8d1c5f4e6d…` | 1.0 s |
  | **WebKit** (Safari's engine) Worker | `8c8d1c5f4e6d…` | 1.8 s |

  So **acceptance criterion 1 is met** for a real production bundle, and the shims' riskiest assumptions
  (transferables, DataView, TextEncoder inside a Worker) hold in Safari's engine too. Node's 0.7 s is worth
  noting on its own: it was ~7.7 s before, because loading `base-offsets.inject.json` skips the 4.1 s
  `.map` parse [[T-250]] measures.

  **Memory, measured** (Chromium, `--enable-precise-memory-info`; `performance.memory` does not exist inside
  a Worker, so this pass runs the same `injectOne` on the page thread):

  | | |
  |---|---|
  | inputs held before injecting | **142 MB** (32 MB base + a 15 MB bundle parsed to objects + 6.6 MB sources) |
  | peak | **213 MB** |
  | the injection itself | **+71 MB** |

  Read carefully, that says the bundle — which the browser *already* holds today, since the randomizer runs
  there — is the biggest single item, and client injection adds ~100 MB on top (32 MB base + 71 MB, of which
  32 MB is `Rom`'s byte-per-byte ownership map, the INV-BYTES guard). Two gratuitous 32 MB copies were
  removed on the way: the Worker now writes the transferred base **in place** and transfers `image.buffer`
  itself instead of `toBuffer()`-ing and re-slicing it.

  213 MB is comfortable on desktop and marginal on a phone, so the criterion's second half — a real iOS
  Safari tab — still needs a device; the engine half is done.

- **2026-08-04 — step 2: delivery, and the number the plan got wrong.**
  `randomizer/injector/buildClientArtifacts.js` produces the whole set for one base build —
  `base.bps` + `base-offsets.json` + `base-sources.json` + a `manifest.json` whose `buildId` is the base's
  own sha256 — and `deploy/build-base.sh` runs it right after installing the base (skipped, not fatal, on a
  box with no vanilla ROM). They live in `base/client/` (which `update.sh` does not carry, like the base
  itself) and are served at `/client/`: `manifest.json` `no-store`, everything else `immutable`.

  **`base.bps` is 31.8 MB, not the small file the plan implies.** The base is 32 MB where vanilla is 16 MB,
  so half of it is expansion content with nothing to delta against and BPS carries it literally (16.5 MB
  gzipped, which Caddy already does). This does not break the criterion, and it is worth being precise about
  why: what is delivered *today* is `createBps(vanilla, randomizedRom)` — the same ~32 MB, **per ROM, per
  run**. Now it is one immutable file, identical for every user and run, fetched once into IndexedDB. The
  ROM itself is still never served, and bytes-per-user go down.

  The browser side is `frontend/js/client-inject.js` (manifest → base from cache or vanilla+`base.bps` →
  offsets+sources → one Worker per ROM, base transferred in, ROM transferred back), with `putBase`/`getBase`
  added to `rom-store.js` keyed by `buildId` so only one base is ever stored. `account.js`'s `deliverPatch`
  takes the local path when the flag is on, producing the same `{ serverName, gbaBytes, bpsBytes }` the
  server path assembles — so T-211's full archive is built identically.

  **The flag is off by default and that is a product decision, not a limitation**: the request queue is
  where beta gating, quotas and the "your ROM is ready" email live. `?clientInject=1` sticks it in
  localStorage per browser, `?clientInject=0` clears it.

  Verified end to end in a real browser through the *shipped* module, not a hand-rolled harness: vanilla ROM
  in IndexedDB → fetch+apply `base.bps` (0.3 s) → **14 ms** from the cache on the second call → inject →
  `8c8d1c5f4e6d…`. Design reference: [randomizer/docs/client-injection.md](../randomizer/docs/client-injection.md).

- **2026-08-05 — shipping decision: merge with the flag OFF, defer the device work.** Asked to choose an
  aptitude criterion, the owner decided to keep the manual flag through the beta and do offline generation
  afterwards. Every build keeps going through the server; nothing changes for any user.

  The analysis behind that decision produced three things worth keeping:

  **The fleet is unmeasured, not measured-and-fine.** PRO holds 6 users and **2 distinct user-agents ever**
  (both Windows desktop), because `user_agent` only lives on `diagnostics`/`decision_logs` and those are
  purged at 48 h. There was no data to answer "are all devices apt" with. → [T-254](T-254-client-run-telemetry.md).

  **The published memory figure is the 1-ROM figure.** `injectBundleLocally` retains `gbaBytes` (32 MB) *and*
  `bpsBytes` (~32 MB) per ROM until the loop ends, and `bundle`/`sources` are structured-**cloned** into every
  Worker (the transfer list is `[base]` only). PRO's real request mix includes 2-, 4- and one 6-ROM run, and
  a 6-ROM run is ~384 MB of retained artifacts before the archive blob exists. Also: the 213 MB was measured
  with a 15 MB bundle, where production bundles are ~39 MB (measured locally: those parse to ~32 MB of
  objects, factor ×0.8 — so the bundle is *not* where it explodes; the accumulation is). → [T-253](T-253-client-injection-device-aptitude.md).

  **The beta gate was bypassable and is now closed.** The gate lives in `handleProduce`, and this path never
  reaches it — `deliverPatch` short-circuits with no request row — while `/client/` was `express.static` with
  no auth. So `?clientInject=1` was a way around invite-only building. Fixed here rather than deferred:
  `backend/beta/clientArtifactsGate.js` gates the artifacts on an accepted invite (BETA off ⇒ public), the
  four artifact fetches carry the caller's token, and `account.js` checks the manifest *before* committing so
  a refusal falls back to the server queue instead of failing the run. Honest limit, recorded in the module:
  it is a signal, not a lock — `base.bps` is identical for everyone, so one shared copy serves everyone.
  → [T-255](T-255-beta-gating-with-client-injection.md).

- **2026-08-05** — Merged `master` in to pick up the B-062 mega-stone fix, which landed after this branch was
  cut. `megaMapItems.js` conflicted on its import block and was resolved keeping **both** halves: master's
  shared `assignMegaStones` rule and this branch's `sources.js` seam. Re-verified after the merge: full
  randomizer suite green (2220) and 21/21 mega stones against the presentation bundle's own docs.

## Outcome

**Shipped, and deliberately not switched on.** The injector runs in the browser and produces byte-identical
ROMs to the Node path — verified in a real Chromium *and* WebKit Worker against the production base — with the
base reconstructed locally from the user's vanilla ROM plus one immutable `base.bps` cached in IndexedDB. All
four plan steps landed: the `sources` seam, the static base patch, the de-`fs`'d module graph, and the
same-sha256 proof. One implementation, not two, so GATE-3 still governs it (ADR-023).

**Deviation from the plan, on the owner's call:** the plan implied turning it on. It ships behind the manual
`?clientInject=1` flag with every build still going through the server, because the fleet is unmeasured and
the memory peak scales with ROM count — both detailed in the shipping-decision log entry above. The
capability is in place; enabling it is a separate, data-driven decision.

**Added beyond the plan:** the beta-invite gate on `/client/` (`backend/beta/clientArtifactsGate.js`, 8
tests). Without it this path was a way around invite-only building — the plan had not anticipated it because
it did not expect to ship into a live closed beta.

**Follow-ups spawned:**
- [T-254](T-254-client-run-telemetry.md) — measure the device fleet. Sequenced first; the others need it.
- [T-253](T-253-client-injection-device-aptitude.md) — flatten the memory peak, measure on a real device,
  pre-flight check, then turn it on. Carries this task's one deferred criterion.
- [T-255](T-255-beta-gating-with-client-injection.md) — what invite-only building means once building is local.
- [T-256](T-256-queue-redesign-after-client-injection.md) — rework the queue once most runs never reach it.

The design reference is `randomizer/docs/client-injection.md`; its "off by default is a product decision" note
is now also the beta's safety margin, and T-253 supersedes it.
