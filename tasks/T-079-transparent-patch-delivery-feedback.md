---
id: T-079
title: Transparent, patch-first ROM delivery feedback (3-step, singular/plural)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-09
updated: 2026-07-09
target-version: 0.6.0
links: [T-053, T-080]
blocked-by: [T-080]
---

# T-079 — Transparent, patch-first ROM delivery feedback (3-step, singular/plural)

## Context

The step-3 delivery UX (`frontend/js/account.js`) is inconsistent about what actually happens.
For legal reasons we must never speak of "downloading a ROM": the server delivers a **patch**;
the browser applies it locally to the user's own ROM (ADR-013, T-053). The action button says
"Download ROM(s)", and clicking it shows a single opaque "Preparing your ROM…" spinner. For
multi-ROM runs (nuzlocke/soul-link) each finished game is downloaded separately (no zip).

## Plan

All in `frontend/js/account.js` (+ `frontend/index.html` static button text):
1. Rename every action button / label away from "Download ROM" → **"Download patch & apply to
   my ROM"** (singular) / "…patches & apply to my ROMs" (plural, count-driven). No copy anywhere
   claims a ROM is downloaded from us.
2. On click, replace the single spinner with a live 3-step checklist:
   1. **Downloading patch(es)** — ticks when the patch zip is fetched.
   2. **Applying patch(es) to my ROM(s)** — ticks when applied locally.
   3. **Generating zip** — only shown when the run has >1 ROM; ticks when the zip is built.
   For multi-ROM runs, apply every patch then deliver a single zip of the finished `.gba`s
   (today they download one-by-one).
3. Make all delivery/ready/queued copy conditional on ROM count for correct singular/plural.

Acceptance criteria:
- [ ] No user-facing string says or implies "download a ROM"; all say patch(es) applied locally.
- [ ] Button label is singular for 1 ROM, plural for >1, everywhere it appears.
- [ ] Clicking delivery shows the 3-step checklist; step 3 appears only when count > 1.
- [ ] Multi-ROM delivery produces one zip of finished games (step 3), single-ROM downloads the
      one `.gba` directly (no step 3).
- [ ] `cd frontend && node --test` green (existing + new assertions on the copy/steps).
- [ ] Manual: single-ROM and multi-ROM delivery both show correct steps + wording.

## Progress log

<!-- Append-only. -->

- **2026-07-09** — Task created. Mapped the delivery flow in `account.js`
  (`deliverPatch`/`downloadRom`/`hydrateReadyRow`/`renderRom`) and the static button in
  `index.html`. Depends on T-080 (frontend-only ROM ownership) since both touch the same
  ready-row/settings code — will implement after T-080 merges.

## Outcome

<!-- Filled when closing. -->
