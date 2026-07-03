---
id: T-053
title: BPS patch delivery + client-side patching (IndexedDB)
status: in-progress
type: feature
created: 2026-07-03
updated: 2026-07-03
target-version: 0.6.0
links: [docs/adr/ADR-013-bps-patch-delivery-client-side.md, docs/adr/ADR-008-rom-delivery-full-rom-ownership-gate.md, T-054]
blocked-by: []
---

# T-053 — BPS patch delivery + client-side patching (IndexedDB)

## Context

Decision + full rationale (legal posture, full-decomp caveat, why a patch ≠ being a ROM host,
privacy, self-enforcing ownership gate): **[ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)**,
which supersedes [ADR-008](../docs/adr/ADR-008-rom-delivery-full-rom-ownership-gate.md). This task is
the implementation. Do not re-derive the rationale here — it lives in the ADR.

Today (Model A): `make.js` builds a full `.gba` (`buildOneRom`, [make.js:119](../make.js#L119)); the
backend queues builds, stores the ROM(s), zips them and serves a **single-use** download
([backend/produce/handlers.js](../backend/produce/handlers.js) `handleDownload` — `markDownloaded` +
`purge` on download); the user uploads their ROM once to `/api/rom/validate`
([backend/rom/routes.js](../backend/rom/routes.js)), which hashes-and-discards the bytes and flips
`owns_valid_rom` in SQLite ([backend/rom/validate.js](../backend/rom/validate.js)). The frontend
downloads the built ROM ([frontend/js/account.js](../frontend/js/account.js) `downloadRom`).
`localStorage` ([frontend/js/storage.js](../frontend/js/storage.js)) holds run state and is unusable
for a 16 MB ROM.

We switch delivery to a server-generated **BPS** that the **frontend applies to a vanilla ROM held in
IndexedDB**, HackDex-style. The build still *can* emit a full ROM behind an option, but **BPS becomes
the default and the frontend always expects a BPS**.

Future companion work: **[T-054](T-054-binary-injection-randomizer-viability.md)** (randomize a
prebuilt base by binary injection instead of compiling from scratch) — read it alongside this task; it
inherits most of this context.

## Plan

Concrete behaviour agreed with the owner:

- **Build:** `make.js` keeps a flag to emit a full `.gba` (debug/builder), but **defaults to a `.bps`**
  (vanilla→built delta). New isolated, TDD-tested patch-creation module (`randomizer/` or
  `backend/build/`). Requires a gitignored vanilla reference ROM on the builder. **Open decision:** base
  revision — single canonical (USA/Europe → gate narrows to 1 hash) vs. multi-region (6 patches from
  one build; client picks by hash).
- **Frontend / IndexedDB:** store the user's vanilla ROM in IndexedDB after one selection; hash it
  client-side (`crypto.subtle`) against the known-good Emerald set; apply the BPS in-browser (bundled
  patcher, e.g. rom-patcher-js) to produce the final ROM; download locally. ROM bytes never reach the
  server.
- **Ownership flag stays in SQLite** (cheap) but bytes live only in IndexedDB. Move validation
  client-side (send only the hash) — decide in implementation whether to keep the upload path behind a
  flag.
- **Decouple generation from ownership:** the user can generate + download the BPS without a ROM. UI:
  "BPS generated" → download the BPS *or* patch-with-stored-ROM if one is present.
- **Redefine single-use download → ephemeral BPS:** one BPS per user at a time, deleted on a TTL (~48h)
  or when the next randomization starts (replaces `markDownloaded`/purge-on-download in handlers.js and
  the "already downloaded" UI in account.js).

Base revision: **single canonical (USA/Europe, BPEE)** — owner decision 2026-07-03.

Acceptance criteria:
- [x] `make.js` produces a valid `.bps` by default; `--full-rom` still emits a `.gba`.
- [x] Patch-creation module unit-tested (round-trip: `apply(create(a,b), a) === b`) — `randomizer/bps.js`.
- [ ] Applying the generated BPS to the correct vanilla ROM yields a byte-identical ROM to the full
      build — **builder-only** (no toolchain/vanilla locally); round-trip proven in unit tests.
- [x] Backend delivers the patch (zip of `.bps`); no full ROM is stored or transmitted in the default flow.
- [x] Frontend stores the vanilla ROM in IndexedDB and applies the BPS client-side without re-uploading
      (`rom-store.js` + bundled codec; unit-tested). **End-to-end browser apply is a manual-test gate.**
- [x] Ownership validity persists in SQLite; ROM bytes are never persisted server-side (hash-only validate).
- [x] BPS can be generated and downloaded without a validated/stored ROM (produce gate decoupled;
      download falls back to the raw `.bps` zip when no ROM is stored).
- [x] Ephemeral-BPS lifecycle: one active BPS per user; re-downloadable; deleted on the 48h sweeper and
      on the next randomization (replace-on-produce); old single-use purge-on-download removed.
- [x] `cd randomizer && npm test`, backend `node --test`, frontend `node --test` all green; tracker consistent.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-03** — Task created. Decision recorded in [ADR-013](../docs/adr/ADR-013-bps-patch-delivery-client-side.md)
  (supersedes ADR-008). Spawned future analysis [T-054](T-054-binary-injection-randomizer-viability.md).
  Base-revision choice (single vs. multi-region) still open. Cheap experiment to run before/early:
  build one ROM, create its BPS against vanilla, measure the real `.bps` size (ADR-008 expects ≈ROM).
- **2026-07-03** — Owner decisions: **single canonical base (USA/Europe)** and **ephemeral,
  re-downloadable lifecycle with replace-on-new-produce** (no more single-use). Implemented server +
  backend + client (except the two verification gates below). All three suites green
  (randomizer 601, backend 108, frontend 42).
  - **Codec** `randomizer/bps.js` (create/apply/crc32; apply handles all 4 commands → flips-compatible) +
    **`randomizer/romArtifact.js`** `emitArtifact` (BPS default / `--full-rom` .gba). `make.js` wired
    (bundle + randomize + interactive), `VANILLA_ROM`/`pokeemerald-vanilla.gba` (gitignored), `*.bps` ignored.
  - **Backend:** `/api/rom/validate` is hash-only (`{ sha1 }`, JSON — no 16 MB upload); `/produce`
    dropped the `requireOwnsRom` gate and now **replaces** any active request (kill+purge) instead of 409;
    `/download` no longer purges (stays `ready`, re-downloadable) — the existing 48h sweeper is the TTL.
  - **Frontend:** `rom-store.js` (ROM in IndexedDB + client SHA-1); codec bundled to `frontend/js/bps.bundle.js`
    via `buildWorker.cjs`/`build.js`; `account.js` upload is hash-only + stores the ROM, gate decoupled,
    download unzips + applies the BPS locally (falls back to the raw `.bps` zip when no ROM is stored).
  - **Deliberate spec changes (tests updated to the new spec, per TDD rule 3):** `rom.test.js`
    (bytes→hash), `produce.test.js` (409→replace; purge-on-download→re-downloadable), `account.test.js`
    B-011 (ownership gate removed → restored run now builds). New tests: bps (27), romArtifact (5),
    bps-bundle (1), rom-store (2).
  - **Remaining before close:** (a) builder run — provide the gitignored vanilla, confirm the `.bps`
    applies byte-identical to the full build + measure its real size; (b) **owner manual browser test** of
    the full flow (upload ROM → generate → download → patched ROM boots); (c) `node build.js` now also
    emits `bps.bundle.js` (run on deploy — already part of `npm start`). Task stays in-progress pending (b).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
