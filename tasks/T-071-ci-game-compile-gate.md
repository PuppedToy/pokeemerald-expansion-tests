---
id: T-071
title: Gate deploys/CI on a real game compile (catch box-only C errors before PRO)
status: proposed        # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-07
target-version: 0.6.0
links: [B-020, B-022]
---

# T-071 — Gate deploys/CI on a real game compile

## Context

**B-020** and **B-022** are the same failure mode: GBA C that compiles only on the builder slipped through
to PRO and broke *all* ROM builds, because the deploy compiles the decomp **tools** (`make tools`) but never
the **game**, and local JS `npm test` can't compile C. Both were caught only by a manual post-deploy box
compile-verify. The randomizer/frontend features (T-068, T-070) add C hooks whose only compile check today
is "hope the box builds when a user requests a ROM."

## Plan

Add a **game-compile gate** so a non-compiling `src/` change can't reach PRO:
- Option A (preferred): in `deploy/update.sh`, after the tools rebuild and before flipping the app live,
  run a `make -j` (or at least compile the changed objects) in the app container; abort the deploy on
  failure (mirrors the existing "never deploy red tests" preflight).
- Option B: a CI workflow (`.github/workflows/`) that runs the full `make` on push to master.
- Ideally both. Keep it fast (warm `build/` cache; or compile just changed objects).

Acceptance criteria:
- [ ] A deliberately-broken `src/*.c` change fails the gate (deploy aborts / CI red) instead of reaching PRO.
- [ ] A clean change passes; deploy time stays acceptable (warm cache).

## Progress log

- **2026-07-07** — Spawned from B-022 (2nd occurrence of the box-only-C class). Proposed.

## Outcome

<!-- Filled when closing. -->
