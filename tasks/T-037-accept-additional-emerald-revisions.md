---
id: T-037
title: Accept additional legal Emerald regional ROM revisions (JP/FR/DE/IT/ES …)
status: proposed
type: feature
created: 2026-06-29
updated: 2026-06-29
target-version: 0.5.0
links: [T-031]
blocked-by: []
---

# T-037 — Accept additional legal Emerald regional ROM revisions

## Context

ROM-ownership validation (`backend/build/bundleSchema.js` `KNOWN_EMERALD_SHA1`) currently accepts only
the USA/Europe Emerald SHA-1 (`f3ae088181bf583e55daf962a92bb46f4f1d07b7`). The owner wants to accept
**all legal Emerald regional revisions** (JP, FR, DE, IT, ES, …). Split out of [T-031](T-031-remaining-e2e-edge-checks-and-frontend-polish.md)
so that task could close — this is the one item that was blocked there.

## Blocked

The other regions' SHA-1s are **not reliably web-sourceable**. We will **not** hardcode unverified
hashes. Need the authoritative **No-Intro GBA DAT** (or the ROM files themselves) to compute/verify the
real SHA-1s before adding them.

## Plan

- Obtain the No-Intro GBA DAT (or the ROMs) and extract the verified SHA-1 of each legal Emerald revision.
- Add them to `KNOWN_EMERALD_SHA1` with a comment naming each revision.
- Test: each added hash validates; an unknown hash still rejects (extend `bundleSchema`/rom-validate tests).

## Acceptance criteria
- [ ] Verified SHA-1s (from the No-Intro DAT) for the accepted revisions are in `KNOWN_EMERALD_SHA1`.
- [ ] Tests cover accept (each new revision) + reject (unknown), green.

## Progress log

- **2026-06-29** — Split from T-031 on close. Blocked on sourcing the No-Intro GBA DAT. Backlog.

## Outcome

<!-- Filled when closing. -->
