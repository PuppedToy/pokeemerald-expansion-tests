---
name: bug-close
description: Mark a bug as fixed — enforces the regression-test iron rule (test exists, failed before the fix, passes after). Use when a bug's fix is implemented and verified.
---

# Close a bug

**Iron rule: no regression test, no fixed bug.** The validator enforces it; do not work around it.

1. Confirm the regression test exists: it reproduces the symptom, is named or annotated with the bug id, was seen to FAIL before the fix and PASSES after, alongside the whole suite.
2. In the bug file: fill **Root cause** (the real cause, not the patch) and **Fix** (what changed, linking commits/task); set `regression-test:` to the test path, `fixed-in:` to the target version, `status: fixed`, `updated` = today.
3. Add a `Fixed` line in `CHANGELOG.brooktec.md` `[Unreleased]` referencing the bug id.
4. Run `node scripts/check-tracker.mjs --write` — it fails if the regression-test field is empty or the path does not exist.
5. Commit (`fix: …`) referencing the bug id in the body.
