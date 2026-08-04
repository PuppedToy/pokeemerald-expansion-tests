---
id: T-246
title: "Base+injection Phase 5 — frontend/delivery wiring + user acceptance"
status: in-progress
type: feature
created: 2026-07-27
updated: 2026-08-04
target-version: 0.7.0
links: [T-229, T-244, T-245, T-249, T-250, docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/base-rom-provisioning.md, docs/client-side-injector-evaluation.md, docs/base-plus-injection-strategy.md]
blocked-by: [T-244]
---

# T-246 — Frontend/delivery wiring + UAT

## Context
Wire the injector into delivery: server-side injection (seconds) and, as an option, a client-side/offline
injector (zero server compute, toolchain-free desktop app) — the payoff [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)
and [ADR-022](../docs/adr/ADR-022-base-plus-injection-architecture.md) anticipate. See
[strategy Phase 5](../docs/base-plus-injection-strategy.md#phased-task-map).

## Plan
Serve the static base BPS + run injection at apply time (server-side first); update the frontend
progress/ETA/download flow. Evaluate a client-side injector for offline. End with owner user-acceptance
testing across representative configs.

Acceptance criteria:
- [x] Server-side injection wired end-to-end; frontend flow updated (progress/ETA/download).
- [x] Client-side/offline injector evaluated (spike or follow-up task).
- [ ] Owner UAT across representative configs; sign-off. **← the only thing left; needs the deploy**

## Progress log
- **2026-07-27** — Created (Phase 5).

- **2026-08-04 — the blocker nobody had written down: the box has no base ROM.** Checked before writing any
  code: `/app/base` and `/opt/emerald/base` **do not exist**, and no `ROM_BUILD_MODE` is set in the
  container. Since [[T-244]] made injection the default, deploying that commit as-is would have taken
  production from "slow builds" to **no builds at all**. Two facts explain why it was never provisioned:
  the artifacts are gitignored (`*.gba`, `*.map`, `*.sym`), and the only base that exists on the box is the
  one inside the Phase-3 gate harness (`/opt/t239-gate3/base/`, built 2026-08-02), which production cannot
  see. So provisioning *is* this task's first deliverable, not a footnote.

  - **`deploy/build-base.sh`** — builds the base in the app container on the box (clean tree → `make -j` +
    `make syms` → install all three artifacts from *that* build → `buildOffsetMap.js` for the GATE-1 budget
    and the per-module readiness table → restart). `--fetch` copies them down for local gates; `--dry-run`
    prints. Rules and the same-build invariant: [base-rom-provisioning.md](../docs/base-rom-provisioning.md).
  - **`update.sh` now excludes `/base/`** — and this is the subtle one: the rsync runs with `--delete` and
    deliberately mirrors gitignored runtime assets, so *without* the exclude, the first deploy from any
    machine lacking a local `base/` would **delete the box's base** and break every build. The base is
    box-managed state, like `backend/data/` and `roms/`. `update.sh` also gained a preflight that reports
    whether the box's base is usable (warn, not abort — a docs-only deploy to a base-less box is fine).
  - **A boot check** (`backend/build/baseReadiness.js`, 6 tests): with real builds on, a missing or
    **zero-byte** (interrupted copy) artifact is named with its resolved path, the fix command is printed,
    and **the worker is not started** — so requests wait in the queue instead of marching to `failed` one
    at a time. Surfaced in the admin panel too (`⚠ no base ROM on the box — builds are held`), because
    "nothing is building" must be answerable without reading container logs.
  - `/base/` added to `.gitignore`: `*.gba`/`*.map`/`*.sym` already covered three of the files, but
    `base/base-offsets.json` was committable.

- **2026-08-04 — end-to-end, for real.** A throwaway harness drove a request through the **actual**
  scheduler + `buildRom` adapter with `fake:false` against the real base: `queued` → worker → spawn
  `make.js … --inject` → `ready (1/1)` in **8.6 s**, one run recorded, artifact `rom-0.bps` **31.8 MB**.
  So the wiring T-244 changed is exercised by the queue, not just by a CLI invocation. Also confirmed the
  box already has `pokeemerald-vanilla.gba` (16 MB), which BPS emission needs — otherwise every artifact
  would have silently become a full ROM.

- **2026-08-04 — frontend.** `etaText` was calibrated for the compile path: minutes, with everything under
  60 s collapsing into one *"Less than a minute remaining"* that never moved — which is now the entire
  visible range of a normal wait. It quotes seconds in 5 s steps below 90 s (`17 s → "About 15 seconds
  remaining"`), minutes above. Exported + 8 assertions pinning the boundary. Also removed a stale
  "slow/multi-ROM" comment left by [[T-245]]'s queue collapse. The state machinery needed **no** change:
  `categoryOf` never enumerated `queued_fast`/`queued_slow`, so the new single `queued` state renders as
  "queued" already.

- **2026-08-04 — client-side injector: evaluated, follow-up opened as [[T-249]]** (owner's call: evaluate +
  follow-up, not a spike inside this task). Full analysis in
  [client-side-injector-evaluation.md](../docs/client-side-injector-evaluation.md). Verdict: feasible and
  closer than it looks — the randomizer *already* runs in the browser and ADR-013 already ships a BPS
  patcher plus the user's vanilla ROM in IndexedDB, so only the **sink** is server-side. The base need never
  be shipped (`base = vanilla + a static base.bps`). The real work is that 14 injector files `readFileSync`
  ~5.8 MB of the base's own sources at inject time *by design*, so those inputs must be baked at
  base-build time and passed through the existing `sources` seam — a refactor, not a flag.

- **2026-08-04 — deployed, and a dead end in my own script.** Owner pushed and greenlit; verified
  `origin/master == local master == 67ce5cf` first, since `update.sh` deploys the *working tree*, not
  `origin`. Removed the stale `AVG_ROM_SECS=180` from the box's `deploy/.env` (backed up first — it is
  box-only state, not rsynced) so [[T-245]]'s measured 17 s default applies. Deploy green, `/api/me` 401.
  **The two new guards both worked on their first real run:** `update.sh`'s preflight warned
  `⚠ the box has no usable base ROM (missing)`, and the app booted with
  `build: injection — BASE MISSING, worker held`, naming all three absent artifacts and the fix command
  instead of failing user requests one at a time.

  Then `deploy/build-base.sh` **printed `base installed ✓` having built nothing.** Root cause:
  the remote script was piped into `bash -s`, and **`docker compose run` reads stdin** — so the first
  compose call (the `git checkout`) swallowed the remaining script and every later step was skipped
  silently; bash hit EOF and exited 0, so the local success line printed. Verified by looking rather than
  believing: no `base/` and no `pokeemerald.gba` on the box. Fixed three ways, because the failure mode was
  *silence*: the script is now copied to the box and run from a file (stdin is free), every compose call is
  `-T` + `</dev/null`, and the script **re-checks the three artifacts over SSH before printing success** —
  a run that installs nothing can no longer claim it did.

- **2026-08-04 — the first installed base was unusable: `make && make syms` links TWICE.** The base built
  and installed cleanly, the app started its worker — and then a smoke injection inside the deployed
  container refused:
  `structLayout: base anchor mismatch — SPECIES_BULBASAUR.baseHP should be 45 but the base reads 0`.

  Chased it properly rather than guessing, and every intermediate suspicion was wrong, which is worth
  recording: sources were **not** stale (box `include/pokemon.h` md5 `aabad5ad…` == local, deploy-snapshot
  commit present, `git status src/ include/` clean), the struct was **not** reordered (master declares
  `baseHP` at offset 0, and `structLayout.js` agrees), and the 765-of-897 stale objects in the warm
  `build/` cache were a red herring — `src/pokemon.o`, which defines `gSpeciesInfo`, *was* rebuilt.

  What the bytes said: `.map` and `.sym` agreed on `gSpeciesInfo`, the stride was a clean 260
  (Bulbasaur→Ivysaur→Venusaur, and 396,500 / 260 = 1,525 exactly), but the stats sat at **+292 = 260 + 32**,
  and the 48 bytes at the claimed array start decoded as `{10,40},{10,35},{10,30}…` — **`gStatStageRatios`**,
  a different symbol. So the symbol table did not describe this ROM. Mtimes closed it:

  | artifact | mtime |
  |---|---|
  | `pokeemerald.gba` | 05:15:35 |
  | `pokeemerald.elf` | 05:16:35 — **60 s later** |
  | `pokeemerald.map` / `.sym` | 05:16:35 / 05:16:36 |

  `make syms` **relinked**. `$(SYM): $(ELF)` should be a no-op after a build, but the Makefile is not
  idempotent (generated prerequisites come back newer than the ELF), so the second invocation links again:
  the ROM is link #1, the symbols describe link #2, ~32 B apart. My script broke the one invariant its own
  header states — all three artifacts from one build.

  Fixes, at the cause *and* at detection, since a symbol table that is merely *shifted* looks perfectly
  healthy:
  1. **One invocation, two goals:** `make -j"$(nproc)" all syms` — the ELF is linked once and both the ROM
     and the symbols derive from it.
  2. **An install-time refusal:** if `pokeemerald.elf` is newer than `pokeemerald.gba`, they are different
     links → do not install.
  3. **A smoke injection before the base is trusted.** This is the check that actually works:
     `buildOffsetMap.js` reported all five modules `READY` and all four B-058 accessors `OK` **against this
     broken base**, because every symbol did exist — at the wrong address. Only injecting runs
     structLayout's anchors, which read Bulbasaur's stats back out of the ROM. A base that fails the smoke
     test is moved aside and the run exits 1, so the app holds the queue rather than failing every request.

  Production was never exposed to a corrupt artifact: the anchor check is what caught this, and while
  diagnosing I moved the base aside so the worker held (a held queue drains; a failed request does not).
  Verified the DB had no waiting user requests at the time.

- **2026-08-04 — base provisioned, and it landed on the gated bytes.** Third attempt (tidy → single-link
  make → install → smoke inject) passed: `✓ injection works against this base`, app restarted with
  `build: injection` and the worker running, site 200, `/api/me` 401.

  The base's sha256 is **`af0dff6c92ef48c0863c38dc67204ac180c0cea1089a177aa600c6c58ac93084`** — byte-identical
  to `baseRomSha256` in `backend/build/golden-corpus/manifest.json`, i.e. **the exact base T-243's 12/12
  by-symbol gate and T-248's INV-LAYOUT measurement were run against**. A clean build from master on the box
  reproduced the gated base bit for bit, which is [[T-231]]'s determinism holding across a different machine
  and a different day, and it means Phase 3's verification applies to what is now in production.

  Worth recording for the future: the base I had been testing against **locally** all day was
  `c144386ff4f3…` — the older Phase-3 harness base from `/opt/t239-gate3` — which is why its symbol
  addresses differed from the box's (`gSpeciesInfo` at 0x66c288 vs 0x66c2a8). My local `base/` has been
  replaced with production's, so a local run now exercises the same bytes users get.

- **2026-08-04 — found while measuring, registered not fixed: [[T-250]].** Parsing
  `base/pokeemerald.map` takes **4.1 s** of a ~7.7 s local injection (48,406 symbols) while the `.sym`
  parser does 87,908 symbols in **74 ms** — 56× faster for 1.8× the symbols. Cause: `parseMapFile`
  re-`slice().sort()`s each section's whole symbol list, and `findIndex`es itself in it, **once per
  symbol** — O(k² log k). On the box that is plausibly ~8 s of the measured 16.5 s. Deliberately not fixed
  in this batch: it is an injector change needing its own byte-identity proof, and T-245's ETA constant is
  correct for the code as shipped. It would cut the per-ROM time roughly in half, and the artifact it wants
  (`base-offsets.json`) is the same one T-249 needs.

## Outcome
