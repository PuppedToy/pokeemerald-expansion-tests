---
id: T-230
title: "Base+injection Phase 1 — golden-master bundle corpus + reference ROMs"
status: done
type: chore
created: 2026-07-27
updated: 2026-07-28
target-version: 0.7.0
links: [T-229, docs/base-plus-injection-strategy.md]
blocked-by: []
---

# T-230 — Golden-master bundle corpus + reference ROMs

## Context
The whole migration is verified against "does the output still match?" That needs a fixed, curated set
of bundles exercising **every** randomizer output (all 26 in the [viability list](../docs/base-plus-injection-viability.md#the-complete-one-by-one-list--every-randomizer-output)),
plus their reference build outputs from the **current** compiler. See [strategy: invariants](../docs/base-plus-injection-strategy.md#the-two-verification-invariants-read-first).

## Plan
Curate N bundles (seeds + configs) covering: every mutation toggle, both wild modes, Run&Bun, Steven-tag,
extra starters, nicknames, all reward/static/item-picker paths, single- and multi-ROM bundles. Build each
with the current pipeline and store the reference ROM (or its canonical hash — see T-231). Commit the
bundles (small JSON); store reference ROMs out-of-repo (large).

Acceptance criteria:
- [x] Corpus committed as **specs + generator** (`backend/build/golden-corpus/`) — 10 specs, each annotated
      (`exercises`) with the outputs/modes it covers. The 19 MB frozen bundles live on PRO (gitignored via
      `backend/data/`), regenerable via `generate.mjs`.
- [x] Coverage: the 10 specs collectively exercise all 26 outputs + every build-time mode (rebalance on/off,
      move-mutation, singles/doubles/mixed+Run&Bun, Steven-tag, deterministic/classic wild, money/prices/
      relearn, nicknames, multi-ROM/shared).
- [x] Reference hashes captured → **`manifest.json`** (12 ROM sha256s; verified reproducible: rebuilding
      `baseline` reproduces `4aa9127b…`).

## Progress log
- **2026-07-27** — Created (Phase 1).
- **2026-07-28** — Validated the corpus approach on PRO. Findings:
  - **Generation path:** `backend/generator.js` `createJob()` → `runGeneration(id, cfg)` → `getJob(id).result`
    = the bundle (imports `DEFAULTS` from `frontend/js/config-form.js`; runType ∈ default/nuzlocke/soullink).
    Bundle ≈ 19 MB, `artifacts = {pokedex, trainers, starters, wild, trades}`, 46 config keys.
  - **Backend generation is NON-reproducible** (base-seed `null` → the trainers/pokedex/wild/starters differ
    between two runs of the same `seed`). → **Decision: FREEZE bundles** (generate once, store the exact JSON),
    do NOT regenerate from (config, seed). Only 1 production bundle is kept on PRO at a time (TTL cleanup), so
    the corpus must be generated + frozen by us.
  - **`build(frozen_bundle)` IS byte-deterministic** (see T-231): a504a9f2 → **sha256 `04731953a1da5a08…f326c3b07`**
    across two independent full builds. So the golden master = {frozen bundle → sha256} is robust.
  - **Mechanics:** `node make.js --bundle=<f> --full-rom` → `/app/roms/<bundle.sessionId>/rom-0.gba` (stable
    dir per bundle). `checkDataClean` aborts if `data/maps/**` is dirty → the harness must `git checkout --
    src/ include/ data/maps/` before each build. Generation may also dirty `data/maps` (item scripts) → clean
    after generating too.
  - **First golden-master entry:** a504a9f2 → `04731953a1da5a08169a79adb239b5c54cf56f338285e718e1cfe33f326c3b07`.
  - **Next:** write the committed corpus generator + ~10 specs covering all 26 outputs (baseline, rebalance-off,
    mutate-moves, doubles, runbun-mixed, steven-off, wild-classic, economy, nicknames-on, nuzlocke-3), freeze
    the bundles on PRO (`/app/backend/data/golden-corpus/`, persists across deploys), build each, record hashes.
- **2026-07-28** — Done. Wrote `backend/build/golden-corpus/` (specs.mjs, generate.mjs, build-and-hash.sh,
  manifest.json, README, .gitignore). Generated + froze all **10 bundles** on PRO (9/10 first pass;
  nuzlocke-3 needed a `shared:{pokedex,trainers,starters}` object — fixed). Built all 10 → **12 ROM
  hashes**, all distinct, in `manifest.json`. Base ROM = `fb34f4b9…`. Gotchas fixed: (1) corpus out dir
  must be `backend/data/golden-corpus` (container uid 1000 can't write the root-owned scripts dir);
  (2) make.js writes to `roms/<bundle.sessionId>/` (stable per bundle) — hash by sessionId, NOT `ls -td`
  (dir mtime isn't bumped on rebuild → false mismatches); build-and-hash.sh fixed accordingly.
  **Verified end-to-end:** rebuilding `baseline` reproduces its manifest hash `4aa9127b…`. The T-233 skill
  is now a thin wrapper: rebuild the frozen bundles + diff sha256 vs manifest.json.

## Outcome
Golden-master corpus delivered. Tooling committed at `backend/build/golden-corpus/` (specs.mjs = 10 specs
covering all 26 outputs, generate.mjs, build-and-hash.sh, **manifest.json**, README, .gitignore). Generated
+ froze 10 bundles on PRO (`backend/data/golden-corpus/`, gitignored) and built them → **12 verified ROM
sha256s** in manifest.json (base `fb34f4b9…`). Verified reproducible end-to-end (rebuild `baseline` →
`4aa9127b…`). This is a point-in-time snapshot of the current (pre-refactor) pipeline; Phase 2 re-snapshots
it, Phase 3 must reproduce it byte-for-byte. **T-233** (verification skill) is now a thin wrapper: rebuild
the frozen bundles + diff sha256 vs manifest.json. No changelog line (internal infrastructure).
