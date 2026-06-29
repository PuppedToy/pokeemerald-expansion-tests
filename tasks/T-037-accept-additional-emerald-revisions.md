---
id: T-037
title: Accept additional legal Emerald regional ROM revisions (JP/FR/DE/IT/ES …)
status: done
type: feature
created: 2026-06-29
updated: 2026-06-29
target-version: 0.4.0
links: [T-031]
blocked-by: []
---

# T-037 — Accept additional legal Emerald regional ROM revisions

## Context

ROM-ownership validation (`backend/build/bundleSchema.js` `KNOWN_EMERALD_SHA1`) currently accepts only
the USA/Europe Emerald SHA-1 (`f3ae088181bf583e55daf962a92bb46f4f1d07b7`). The owner wants to accept
**all legal Emerald regional revisions** (JP, FR, DE, IT, ES, …). Split out of [T-031](T-031-remaining-e2e-edge-checks-and-frontend-polish.md)
so that task could close — this is the one item that was blocked there.

## Blocked → resolved

Originally blocked on sourcing the No-Intro hashes. Resolved by fetching the authoritative **No-Intro
"Nintendo - Game Boy Advance" DAT** (libretro mirror) and extracting the six AGB-BPE* Emerald entries.
Trust chain: the DAT's `(USA, Europe)` SHA-1 matched the value the codebase already trusted, anchoring
the set; each regional SHA-1 was additionally cross-checked against the DAT's MD5 (which matched
independent web sources). No unverified hashes were guessed.

## Plan

- Obtain the No-Intro GBA DAT (or the ROMs) and extract the verified SHA-1 of each legal Emerald revision.
- Add them to `KNOWN_EMERALD_SHA1` with a comment naming each revision.
- Test: each added hash validates; an unknown hash still rejects (extend `bundleSchema`/rom-validate tests).

## Acceptance criteria
- [x] Verified SHA-1s (from the No-Intro DAT) for the accepted revisions are in `KNOWN_EMERALD_SHA1`.
- [x] Tests cover accept (each new revision) + reject (unknown), green.

## Progress log

- **2026-06-29** — Split from T-031 on close. Blocked on sourcing the No-Intro GBA DAT. Backlog.

- **2026-06-29** — Unblocked + shipped. Fetched the No-Intro GBA DAT (libretro mirror), confirmed its
  `(USA, Europe)` SHA-1 equals the codebase's existing anchor, and added the other five legal revisions
  to `KNOWN_EMERALD_SHA1` (Japan `BPEJ`, Germany `BPED`, France `BPEF`, Italy `BPEI`, Spain `BPES`),
  each SHA-1 cross-checked against the DAT's MD5. Test asserts all six accept + an unknown hash rejects
  + the set size is exactly six. backend 94/94.

## Outcome

- **2026-06-29** — Done. ROM-ownership verification now accepts every legal Pokémon Emerald revision,
  not just USA/Europe — JP/DE/FR/IT/ES owners can prove ownership and build. SHA-1s sourced + verified
  from the No-Intro DAT (no guessed hashes). Reaches production on the next backend deploy.
