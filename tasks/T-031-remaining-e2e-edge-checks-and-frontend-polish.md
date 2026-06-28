---
id: T-031
title: Remaining e2e edge checks + deferred frontend polish
status: in-progress
type: chore
created: 2026-06-28
updated: 2026-06-28
target-version: 0.4.0
links: [T-018, T-019, T-028, T-029]
blocked-by: []
---

# T-031 — Remaining e2e edge checks + deferred frontend polish

## Context

The core production happy path was validated in [T-029](T-029-full-flow-manual-test.md) (register →
verify → login → upload Emerald → Generate → download a real 32 MB ROM). This task collects the loose
ends that were **not** exhaustively re-checked on the live box (all unit-test-covered, none blocking)
plus the two **not-yet-built** frontend-polish items deferred from [T-028](T-028-frontend-account-generation-flow.md).

## Plan

**Manual edge checks on the live box (unit-test-covered; confirm in prod):**
- Forgot password → reset link → login with the new password; old password rejected.
- Run types: nuzlocke (N ROMs) and soul-link (players × ROMs) build + deliver; fast vs slow ordering/ETA.
- One-active-request-per-user enforced; reload mid-build recovers status; ready ROM still downloadable.
- Restart the backend mid-build → request re-queued, no dirty tree, completes.
- Retention: a ready ROM is removed after 48 h (verify via a shortened TTL or DB inspection).
- Errors: invalid/oversized upload, expired/invalid verify & reset tokens; auth rate-limit.

**Deferred frontend polish (build them — T-028):**
- Email-on-ready opt-in checkbox shown when the initial ETA ≥ 2 min (`canDeferEmail` is already returned).
- "Regenerate docs" from the IndexedDB/stored bundle on reload.

## Acceptance criteria
- [ ] The edge flows above are confirmed on the live box; any defect filed as `B-NNN` + regression test.
- [ ] The two deferred frontend features are implemented and covered (logic) by tests.

## Progress log

- **2026-06-28** — Created from the T-029 close to track non-happy-path verification + the T-028
  deferred polish, so nothing is lost. None of it blocks the live feature.

- **2026-06-28** — Started. **Done:** `deploy/update.sh` rewritten as a one-command **rsync redeploy**
  (the method actually used for the live box — preserves `.git`/`backend/data`/`build/`; `--dry-run`
  supported; env-overridable; encodes the deploy gotchas) + `.env.local.example` aligned to Hetzner
  (root / `/opt/emerald` / `emerald_box`). Syntax-validated; rsync+recreate steps proven in the live deploy.
  **Blocked:** remaining Emerald regional hashes (JP/FR/DE/IT/ES) aren't reliably web-sourceable — need the
  **No-Intro GBA DAT** or the ROM files to compute real SHA-1s (won't hardcode unverified). **Still open:**
  the 2 UI-polish features, live edge-flow re-checks, DMARC (owner DNS).

- **2026-06-28** — Hardened the dev→deploy flow (owner's priority): `update.sh` now runs a **preflight**
  (randomizer + backend suites + `check-tracker`) and aborts if anything is red, then rsyncs + recreates +
  health-checks — proven end-to-end with a real deploy (preflight OK → health /api/me 401 → deployed; box
  fully synced). Added the canonical [dev-deploy-workflow.md](../docs/dev-deploy-workflow.md) (linked in
  INDEX). The deploy-pipeline part of this task is done; UI polish / edge re-checks / DMARC / hashes remain.

- **2026-06-28** — Email auth completed (DNS, owner). DMARC was already present (Brevo, `p=none`); DKIM
  was set during domain auth; **added apex SPF** `v=spf1 include:spf.brevo.com ~all` (verified: exactly
  one SPF record, correct value). SPF+DKIM+DMARC all green → the DMARC item of this task is done.
  Remaining: UI polish (owner feedback), live edge-flow re-checks, Emerald hashes (blocked on No-Intro DAT).

- **2026-06-28** — **email-on-ready opt-in built (TDD)** — one of the two deferred UI features:
  `requests.setEmailOnReady` + `finishBuild` fires the `ready` mail when opted-in (worker wired with
  mailer/users/baseUrl) + `POST /api/notify-on-ready` + a delivery-panel checkbox shown when ETA ≥ 2 min.
  5 tests; **backend 81/81**. **Not deployed** (owner-gated — awaits owner push + go-ahead). Remaining in
  this task: 'regenerate docs on reload' (frontend-only, no browser test harness → best done with browser
  verification / owner UI feedback); live edge re-checks (unit-covered); Emerald hashes (blocked on No-Intro DAT).

- **2026-06-28** — **Autonomous UI/UX pass (my own review, pending owner visual verification).** Frontend-only,
  zero backend change. (1) **Reload recovery** — real bug: on reload with an in-flight build, `initAccount`
  wrote the build status into `#delivery-panel`, which lives inside the hidden step-3 `#gen-done` while the
  user sat on the Home tab → status was invisible. Fix: `initAccount(opts)` now `await opts.onRecover?.()`
  before `showStatus`; `app.js` passes an `onRecover` that restores `currentBundle` from IndexedDB
  (`getStoredBundle`), jumps to the Randomizer tab + step 3, reveals `#gen-done`, and re-renders the docs
  buttons — so a refreshed user lands back on their build with docs intact. (2) `renderDocsButtons` gained a
  generic per-ROM fallback for restored bundles whose `config.runType` is absent. (3) **Esc closes the auth
  modal** (was click-outside / ✗ only). (4) Button label `Generate & download` → **`Generate`** (the click
  generates docs + starts the server build; download happens later from the delivery panel — old label
  implied an immediate download). ESM syntax-validated (`node --check`), randomizer 464/464. **Not deployed**
  (owner-gated). These are MY-UX-review changes → await owner visual review before close.

- **2026-06-28** — Owner gave the green light to deploy; push was already on origin (`9c5e377376`). The
  `update.sh` **preflight caught a pre-existing flaky test** and (correctly) aborted the deploy:
  `startersModule.test.js` "type-triangle" built the module via `jest.isolateModules`, so `beforeEach`'s
  `rng.seed(42)` never reached the module's own rng — ~14% of uncontrolled draws hit the no-triangle
  fallback (empirically 43/300 fixed seeds). Filed [B-007](../bugs/B-007-flaky-starters-type-triangle-test.md)
  and fixed it test-only (non-isolated require → seeded → deterministic FIRE>GRASS>WATER); verified green
  5/5 (file) + 3/3 (full suite, 464/464). Did **not** touch production starter logic — the greedy-search
  weakness it exposed is deferred to [T-032](T-032-exhaustive-starter-triangle-search.md). **Deploy still
  pending:** the B-007 fix is a new local commit, so per the owner-gated rule the owner must push it before
  I deploy (I never deploy un-pushed code) — awaiting owner push + re-greenlight.

- **2026-06-28** — Owner pushed + re-greenlit; deployed the UI pass live (preflight green, rsync,
  recreate, health 401; verified `Generate` label + `onRecover` + Esc serving on prod). **Then a
  production incident:** the site went 502 in a crash loop. Recovered the logs
  (`debug/20260628-crash-mapjson/app-crashloop.log`) — a real ROM build hit a host-compiled tool binary
  (`tools/mapjson` "Exec format error") and the failure crashed the whole backend, which startup recovery
  then crash-looped. **Restored by hand** (marked the stuck request `failed` in the prod DB, rebuilt the
  Linux tools, restarted → site back). Filed + fixed (TDD) the two root causes and the owner's log ask:
  [B-008](../bugs/B-008-build-failure-crashes-worker-crashloop.md) (worker now contains build failures →
  `failed`, never crashes), [B-009](../bugs/B-009-deploy-ships-host-tool-binaries.md) (`update.sh` rebuilds
  Linux tools post-rsync), [T-033](T-033-persistent-build-logs.md) (persistent per-build logs that survive
  recreate). Backend 85/85. **These fixes are committed but NOT deployed** — owner-gated: awaiting push +
  go-ahead before redeploy (the live box currently runs the still-unhardened worker).

- **2026-06-28** — **Generation-screen redesign from owner feedback (4 points).** Reworked the
  "Generation complete" screen into a 2-step status checklist (Documentation ✓ always; ROM row live).
  (1) Buttons reduced to **Download docs** (was "Download all (ZIP)") + a single **Download ROM**
  disabled w/ tooltip until ready; removed per-ROM doc buttons, "Export run", and the in-panel ready
  button; single-use warning moved next to the ROM download (shown when ready). (2) 📦 → `reward.png`.
  (3) ROM states: **queued** = clean "There are N ROMs before yours (ETA ~X min)" + email opt-in +
  "download docs meanwhile" (queue-only); **building** = spinning gear + ETA-driven progress bar (no
  queue text/email); **ready** = ✓. (4) The whole screen is now the checklist with ✓/gear/state colors.
  Backend: `/api/status` + `/api/produce` now expose `romsAhead` (queue position) via a new `romsAhead()`
  in eta.js (refactor; estimateEta unchanged). Also fixed two latent flow bugs: no auto-rebuild after a
  successful download (`delivered` guard), and a mid-build 404 now renders a "Build failed" row instead
  of silently stopping. Tests: produce.test.js (romsAhead) — backend 86/86; randomizer 464/464; JS
  syntax-validated. **Not deployed** (owner-gated). Pending owner visual review.

## Outcome
