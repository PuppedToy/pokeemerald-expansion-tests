---
id: B-021
title: A killed build leaves the tree dirty and wedges every subsequent build
status: fixed           # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: 2026-07-07
updated: 2026-07-07
found-in: 0.5.0         # latent in the build pipeline; observed on PRO during 0.6.0 dev
fixed-in: 0.6.0
regression-test: backend/__tests__/buildRom.test.js
links: [T-068, B-020]
---

# B-021 — A killed build leaves the tree dirty and wedges every subsequent build

## Symptom

On the PRO box, a ROM build (`72aaed64…`) ended with `make.js exited with code null` — i.e. the build was
**killed** (SIGKILL) mid-run. The very next build (`102c40f6…`) then failed instantly:

```
ERROR: Uncommitted changes in data/ detected. Commit or stash them first:
 M data/maps/AncientTomb/scripts.inc
 … (54 data/ + 16 src/ + 1 include/ files)
=== build end: make.js exited with code 1 ===
```

and **every** subsequent build failed the same way until the backend was restarted (or the tree was
restored by hand). Not related to B-020 (that compile bug was already fixed).

## Root cause

`make.js` mutates game source during a build and reverts it in a `finally { restore() }`. **SIGKILL does
not run `finally`**, so a killed build leaves the randomizer-mutated files in place. `make.js`'s
`checkDataClean()` guard then aborts the next build (`git status --porcelain data/` is non-empty). The only
existing cleanup, `recovery.js runOnStartup()`, runs **only at backend startup** — so after a mid-session
kill the box stays wedged. Triggers: a user cancel, a queue preemption, an OOM, or a deploy that recreates
the app container while a build is in flight (the likely trigger here — the B-020 redeploy).

## Fix

`backend/build/buildRom.js` now restores the tree **before every real build** (reusing
`recovery.js` `defaultRestoreTree()` — `git checkout -- src/ include/ data/maps/`), so a dirty tree left by a
killed build can never block the next build; the box self-heals. Scoped to real mode only — under
`FAKE_BUILD` (local dev) it must never `git checkout` over a developer's uncommitted source (the same reason
`make.js` aborts instead of auto-restoring locally).

Regression test `backend/__tests__/buildRom.test.js`: "real build restores the working tree BEFORE spawning
make.js" (verified to FAIL before the fix — no restore happened — and PASS after) plus a guard that FAKE
builds never restore. The immediate PRO outage was cleared out-of-band by running the same `git checkout` in
the app container.
