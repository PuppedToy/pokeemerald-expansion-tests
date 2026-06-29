---
id: T-035
title: Generation + Settings UX refinements (cancel, delete account, run details, exact ETA, emphasis)
status: done
type: feature
created: 2026-06-29
updated: 2026-06-29
target-version: 0.4.0
links: [T-031, T-034]
---

# T-035 — Generation + Settings UX refinements

## Context

Owner feedback batch after T-034. Mix of frontend + a little backend (cancel a build, delete account, realistic ETA).

## Plan

1. The step-3 bottom button is **"Cancel"** before/while the ROM is generating (click → confirm
   "Are you sure? This is permanent" → cancels the run). It's **"Start over"** only once downloaded.
2. ROM generated but not downloaded → button is **"Start over"** but **disabled**, tooltip
   "Download your ROM to start over."
3. **Download ROM** button gets a distinctive emerald-green colour unused elsewhere in the kit.
4. A red **Delete account permanently** button in Settings, with an "are you sure? irreversible" confirm.
5. During the whole process, a **collapsed disclosure** at the bottom with the run details — the exact
   step-2 "Review" content, **reusing the same render** (no duplicated code).
6. The **"Building your ROM…"** state shows the **exact ETA** (minutes remaining), counting down.
7. The single-use warning needs **more emphasis** (it's too subtle now).

Backend: `POST /api/cancel` (cancel the active request), `DELETE /api/account` (delete user + cascade
their requests/runs/tokens, FKs are not ON DELETE CASCADE), and a realistic `AVG_ROM_SECS` default so
the ETA/bar are meaningful.

Acceptance criteria:
- [x] Bottom button: Cancel (+confirm) pre/at build; Start-over disabled (tooltip) when ready-not-downloaded; Start-over when downloaded.
- [x] Download ROM is emerald green.
- [x] Settings has a red delete-account button with an irreversible-confirm; the account + its data are removed.
- [x] A collapsed run-details disclosure shows the Review content (shared render) throughout step 3.
- [x] Building shows an ETA countdown in minutes.
- [x] The single-use warning is visually emphasised (amber — caution, not red/error).
- [x] randomizer + backend suites green; owner visual review.

## Progress log

- **2026-06-29** — Created from owner feedback batch. Implementing backend (cancel/delete/eta) first, then the 7 UI points.

- **2026-06-29** — All 7 implemented. **Backend:** `POST /api/cancel` (marks the active request
  `failed` + deletes its files; frees the slot — `requests.cancel`), `DELETE /api/account` (cascades
  requests+files/runs/tokens then the user, transactional — FKs aren't ON DELETE CASCADE), and
  `AVG_ROM_SECS` default bumped 15→270 s so ETA/bar are realistic. Tests: handleCancel ×2 +
  account-delete ×2 → **backend 90/90**. **Frontend:** (1/2) the gen-done bottom button is Cancel
  (+confirm) pre/at build, disabled "Start over" when ready-not-downloaded, "Start over" when
  delivered (`setStartOverBtn` + a wired handler + `clearRun` that drops the IndexedDB bundle &
  delivered flag; app.js `onStartOver` resets the wizard). (3) Download ROM is `.btn-emerald`. (4) red
  Delete-account button in Settings + confirm + `DELETE /api/account`. (5) a collapsed "Run details"
  `<details>` reusing `reviewRowsHtml` (shared with step-2 Review — no dup). (6) Building shows an ETA
  countdown driven by the same timer as the bar. (7) single-use warning is now an emphasised callout.
  JS syntax-validated; randomizer 470/470. **Not deployed** (owner-gated). Pending owner visual review.

- **2026-06-29** — Owner review questions → hardening + a colour tweak. (a) The single-use warning is
  now **amber** (`--obs-yellow`), not red — red read as error/danger, amber reads as caution. (b) The
  worker now **re-reads the request after each ROM build**: if it was cancelled (→`failed`) or its
  account deleted (row gone) mid-build, it drops cleanly (no run recorded, no illegal-transition
  throw, remaining ROMs skipped) and keeps serving the queue — `advanceOneRom` + a queue test
  (backend 92/92). **Known limitation (not changed):** the in-flight `make` child is NOT killed on
  cancel/delete — the ROM currently compiling runs to completion before the worker moves on (delivery
  is still prevented and the slot freed). Killing the build tree promptly is a possible follow-up.

- **2026-06-29** — Resolved the earlier "make not killed" limitation: cancel / account-deletion now
  **kill the in-flight build immediately**. Builds spawn `detached` (own process group); `buildRom`
  tracks the single active build and exports `killActiveBuild(id)`, which `process.kill(-pid)`s the
  whole tree (node make.js → make → gcc/as/ld …). `handleCancel` and `DELETE /api/account` call it, so
  the box is freed at once and the next queued build starts without waiting for the current ROM.
  `advanceOneRom`'s catch re-checks the row so a killed build drops cleanly (no spurious failure log).
  Test added (fake child) → backend 93/93.

- **2026-06-29** — Owner feedback: the **Download ROM** click now gives immediate feedback. On click it
  disables instantly (can't double-click) and shows a spinning gear + "Preparing your ROM…" while the
  server prepares + streams the zip; on success it moves to the downloaded state, on error it restores
  to the enabled button. `setRomDownload` clears the working indicator; `.btn.is-working` styles it as
  "busy" rather than dead-grey. Frontend-only.

## Outcome

- **2026-06-29** — Shipped + deployed; owner confirmed. All 7 points live, plus two improvements the
  review surfaced: cancel/account-deletion now **kill the in-flight `make` tree** immediately (frees the
  box for the next build), and the **Download ROM** click gives instant feedback (disable + spinner while
  the server delivers). Backend additions: `POST /api/cancel`, `DELETE /api/account` (cascade), realistic
  `AVG_ROM_SECS=270` default, `killActiveBuild`. Backend 93/93. **Known follow-up (not blocking):**
  `AVG_ROM_SECS=270` overestimates the ETA when warm-cache builds finish in ~20 s — calibrate the env var
  to the box's real build time (owner, one number, no code change).
