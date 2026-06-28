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

## Outcome
