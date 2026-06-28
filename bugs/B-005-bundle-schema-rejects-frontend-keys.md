---
id: B-005
title: Bundle schema rejects the frontend's formatVersion/generatedAt keys → every produce 400s
status: fixed
severity: critical
created: 2026-06-25
updated: 2026-06-25
found-in: 0.3.0
fixed-in: 0.3.0
regression-test: backend/__tests__/bundle.test.js
links: [T-026, T-025, T-019]
---

# B-005 — Bundle schema rejects the frontend's real top-level keys

## Symptom

`POST /api/produce` would reject **every** real bundle with HTTP 400 "unexpected top-level key:
formatVersion / generatedAt" — i.e. the entire ROM-generation feature would be unusable in
production. Found while validating the real build on the deployed box (T-019): a real frontend
bundle failed `validateBundle` before it could even reach the build.

## Root cause

The strict allow-list in `build/bundleSchema.js` (T-026) was `{roms, config, sharedData, sessionId,
version}` — guessed, not derived from the actual producer. The frontend
([frontend/js/randomizer-worker.js](../frontend/js/randomizer-worker.js)) actually emits
`formatVersion: 2` and `generatedAt` (and no `version`), so the strict schema rejected all real
bundles. The T-026 tests used a hand-made bundle shape, so they never caught the mismatch — only an
end-to-end check against a real bundle did.

## Fix

Aligned the allow-list to the real producer: `{roms, config, sharedData, sessionId, formatVersion,
generatedAt}` — [build/bundleSchema.js](../backend/build/bundleSchema.js). Regression test in
[backend/__tests__/bundle.test.js](../backend/__tests__/bundle.test.js) validates a realistic bundle
carrying `formatVersion` + `generatedAt`: FAIL before the fix, PASS after. Lesson: schema allow-lists
must be derived from (and tested against) the real producer's output, not assumed.
