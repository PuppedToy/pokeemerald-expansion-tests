---
id: B-002
title: openDatabase fails ("unable to open database file") when the data dir doesn't exist
status: fixed
severity: major
created: 2026-06-24
updated: 2026-06-24
found-in: 0.3.0
fixed-in: 0.3.0
regression-test: backend/__tests__/db.test.js
links: [T-023, T-018]
---

# B-002 — openDatabase fails ("unable to open database file") when the data dir doesn't exist

## Symptom

Starting the backend on a fresh checkout crashes at boot:

```
Error: unable to open database file  (ERR_SQLITE_ERROR, errcode 14)
    at openDatabase (backend/db/index.js)
```

`server.js` opens the DB at `backend/data/app.db`, but `backend/data/` is gitignored and absent on a
fresh clone. `node:sqlite`'s `DatabaseSync` does **not** create the parent directory, so the open fails.
The unit tests missed it because they use `:memory:` or a pre-existing temp dir.

## Root cause

`openDatabase()` passed the filename straight to `new DatabaseSync(filename)` without ensuring the
parent directory existed. SQLite cannot create a database file inside a non-existent directory.

## Fix

`openDatabase()` now `fs.mkdirSync(path.dirname(filename), { recursive: true })` before opening
(skipped for `:memory:`) — [backend/db/index.js](../backend/db/index.js). Regression test
`openDatabase creates the parent directory if missing (B-002)` in
[backend/__tests__/db.test.js](../backend/__tests__/db.test.js) opens a DB in a freshly-removed nested
path: verified to FAIL before the fix (reproduced "unable to open database file") and PASS after.
Found during T-028 bring-up; the bug lived in unreleased 0.3.0 code (never shipped).
