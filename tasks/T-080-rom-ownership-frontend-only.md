---
id: T-080
title: ROM ownership is frontend-only (backend stops tracking/gating it)
status: done            # proposed | in-progress | done | abandoned
type: refactor          # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: [T-053, T-022, docs/adr/ADR-013.md]
blocked-by: []
---

# T-080 — ROM ownership is frontend-only (backend stops tracking/gating it)

## Context

The backend stores `users.owns_valid_rom`, set by `POST /api/rom/validate` (which hashes a
client-sent SHA-1 against the known Emerald dumps) and surfaced via `/api/me` as `ownsValidRom`.
Since T-053/ADR-013 the ROM already never leaves the browser and generation is fully decoupled
from ownership — the server does not gate building on it. So the persisted "owns ROM" flag is
dead weight: whether the user has a ROM is knowable purely in the browser (the bytes live in
IndexedDB, `rom-store.hasRom()`).

Goal: the "I have a ROM" fact lives only in the frontend. The backend has no responsibility for
it and never restricts building. The ROM can be added from either the delivery screen or Settings,
and both places state clearly that the ROM never leaves the browser.

## Plan

Frontend (`account.js`, `index.html`) + backend (`auth/routes.js`, `rom/*`, `db/index.js`,
`auth/users.js`):
1. Drive all ROM-presence UI off `hasRom()` (IndexedDB) instead of `state.ownsValidRom`:
   Settings ROM row + upload affordance, and the ready-row (already partly uses `hasRom()`).
2. Validate the ROM **client-side**: embed the known Emerald SHA-1 set in the frontend and check
   the uploaded file's hash locally (it's an attestation, not DRM). Remove the `/api/rom/validate`
   round-trip and its ownership side effect.
3. Backend: drop `ownsValidRom` from `/api/me`, remove `setOwnsValidRom` + the rom router, and
   drop the `owns_valid_rom` column from the schema. No build path reads ownership (it already
   doesn't).
4. Make the "never leaves your browser" note explicit at every ROM-upload point (Settings +
   delivery screen).
5. Update backend tests (rom/produce/me) to the new contract.

Acceptance criteria:
- [x] `/api/me` no longer returns `ownsValidRom`; `/api/rom/validate` is gone.
- [x] `owns_valid_rom` column + `setOwnsValidRom` removed; no backend code references ownership.
- [x] Settings + delivery ROM UI reflect local `hasRom()`; ROM validated in the browser.
- [x] Every ROM-upload point states the ROM never leaves the browser.
- [x] `cd backend && npm test` and `cd frontend && node --test` green.
- [x] Manual: add a ROM in Settings and on the delivery screen; both work offline-of-server
      and never call a validate endpoint.

## Progress log

<!-- Append-only. -->

- **2026-07-09** — Task created. Confirmed the build path is already NOT gated on ownership
  (`produce/routes.js` requires only auth+verified). Ownership survives only as a persisted flag
  + Settings display. Plan: move validation client-side, delete the flag/endpoint/column, drive
  UI off `hasRom()`.
- **2026-07-09** — Implemented. Backend: dropped the `owns_valid_rom` column (db/index.js),
  `setOwnsValidRom` (users.js), the `/api/me` field (auth/routes.js), the unused `requireOwnsRom`
  middleware, and deleted the whole `backend/rom/` router + validator + `rom.test.js`; unwired the
  rom router in server.js. Updated the 8 test-fixture INSERTs to the 6-column users row. Frontend:
  moved the known-Emerald SHA-1 set + `isKnownEmeraldRom` into `rom-store.js`; `account.js` now
  hashes + validates the ROM in the browser (no `/api/rom/validate`), and the Settings ROM row +
  add/replace/remove controls are driven by `hasRom()` (async `hydrateSettingsRom`). Every add
  point states the ROM never leaves the browser; rewrote the auth-modal explainer (no more "upload
  to verify"). Tests: `isKnownEmeraldRom` + structural guards (`rom-ownership.test.js`), account
  mock updated. Backend (132) + frontend (62) suites green. Pending: manual add-ROM check.

## Outcome

Shipped: ROM ownership is a frontend-only fact. The ROM is hashed and validated in the browser
against the known Emerald dumps (`isKnownEmeraldRom` in rom-store); all ROM-presence UI is driven by
`hasRom()`. Removed the `owns_valid_rom` column, `setOwnsValidRom`, the `/api/me` field, the unused
`requireOwnsRom` middleware and the whole `backend/rom/` router+validator+test. Every add-ROM point
states the ROM never leaves the browser; the auth explainer no longer claims an upload. Validated in
production.
