---
id: B-003
title: backend/build/ source modules excluded from git by the decomp's build/ ignore rule
status: fixed
severity: major
created: 2026-06-24
updated: 2026-06-24
found-in: 0.3.0
fixed-in: 0.3.0
regression-test: backend/__tests__/zip.test.js
links: [T-025, T-026, T-030, T-019]
---

# B-003 — backend/build/ source modules excluded from git by the decomp's build/ ignore rule

## Symptom

`git ls-files backend/build/` returned **nothing**: `zip.js`, `bundleSchema.js` and `storage.js`
(added in T-025/T-026) were never committed, despite their tasks being "done". The local test suite
passed only because the files exist on disk — **a fresh clone (e.g. the deploy box) would crash** on
missing imports (`build/zip.js`, `build/bundleSchema.js`, …). Caught while wiring T-030, when an
explicit `git add backend/build/buildRom.js` was refused as ignored.

## Root cause

`.gitignore` has `build/` (line 31) to exclude the GBA decomp's C build output. That pattern also
matches **`backend/build/`**, so every backend source module placed there was silently ignored by
`git add -A` (no error — ignored files are skipped quietly).

## Fix

Added a negation exception to `.gitignore` so the backend modules are tracked while the decomp's
`build/` output stays ignored:

```
!backend/build/
!backend/build/**
```

Re-tracked `backend/build/{zip,bundleSchema,storage,buildRom}.js`. Verification: before the fix
`git ls-files backend/build/` was empty; after, it lists all four. The structural guard is the
gitignore exception; the behavioural guard is the existing backend suite — `zip.test.js`,
`bundle.test.js` and `buildRom.test.js` import those modules, so a clone that lost them fails to import
(red) and passes once tracked (green).
