---
id: T-031
title: Remaining e2e edge checks + deferred frontend polish
status: proposed
type: chore
created: 2026-06-28
updated: 2026-06-28
target-version: 0.3.0
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

## Outcome
