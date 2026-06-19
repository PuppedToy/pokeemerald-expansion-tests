---
id: B-NNN
title: Short description of the defect
status: open            # open | fixing | fixed | wont-fix
severity: major         # critical | major | minor
created: YYYY-MM-DD
updated: YYYY-MM-DD
found-in: X.Y.Z         # version where the bug was observed
fixed-in:               # version that ships the fix (set when fixed)
regression-test:        # REQUIRED to mark as fixed: path/to/test (named or annotated with this id)
links: []               # task that fixes it, related bugs/ADRs
---

# B-NNN — Short description of the defect

## Symptom

What happens, how to reproduce, expected vs actual.

## Root cause

<!-- Filled during the fix. The real cause, not the patch. -->

## Fix

<!-- What was changed and where (link commits/PR/task). The regression test reproduces the
     symptom: verified to FAIL before the fix and PASS after. No test, no `fixed` status. -->
