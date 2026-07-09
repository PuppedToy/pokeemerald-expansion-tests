---
name: diagnostics-audit
description: Pull the live server's randomization diagnostics (warnings/errors from every run), classify them into distinct problem classes, and propose a fix for each. Use when the user wants to review what is going wrong in production randomizations (e.g. trainer teams coming back short).
---

# Audit live randomization diagnostics

Runs the deterministic collector (`backend/scripts/scan-diagnostics.mjs`), then reasons over the
grouped output to propose a concrete fix per problem class. The script pulls the box's SQLite DB
over SSH (same trust boundary as deploy — no new public surface) and buckets events by `code` +
normalized message signature. The catalog of codes and their root causes is
`docs/randomizer-diagnostics.md` — the reference for mapping each class to the code that emits it.

1. **Collect + classify.** From the repo root run:
   `cd backend && node scripts/scan-diagnostics.mjs --json`
   (add `--since 48` to scope to the last 48h — matches the server's retention window; use
   `--local <path/to/app.db>` if you already have a DB copy and want to skip SSH.)
   It rsyncs the live `app.db` using `deploy/.env.local` (`DEPLOY_HOST/USER/KEY/PATH`, same as
   `deploy/update.sh`). If it fails with a DEPLOY_* / SSH error, tell the user to set
   `deploy/.env.local` (or the env vars) — do NOT invent credentials.

2. **Read the result.** The JSON has `totalRuns`, `runsWithWarnings` (the denominator — how many
   runs were clean), and `groups[]`. Each group is one class of "the same error": `code`,
   `severity`, `events`, `runs`, `users`, `anonymousRuns`, `firstSeen`/`lastSeen`, `sampleMessage`,
   and up to 5 `sampleContexts`.

3. **Diagnose each class.** For every group, using `docs/randomizer-diagnostics.md` to map the
   `code` to its emission point and root cause:
   - Name the problem in one line and state its impact (how many runs/users, how often, since when).
   - Explain the likely root cause, citing the exact `file:line` that emits the code.
   - Propose a concrete fix (or, if it is the accepted degradation such as a short trainer team,
     say so explicitly and note it needs no fix — only monitoring).

4. **Present, ranked.** List the classes most-severe/most-frequent first. Keep it scannable: one
   short block per class (problem → impact → cause → proposed fix). End by offering to open a
   `bugs/B-NNN` (via `/bug-new`) or a `tasks/T-NNN` (via `/task-new`) for the classes the user
   wants to act on. Do not open them without the user's go-ahead.

Notes:
- Read-only: the script never writes to the box; it only pulls a copy of `app.db`.
- Diagnostics expire after 48h on the server, so this is a rolling window, not full history.
- Connecting to the live box is an outward action — only run step 1 when the user has asked for
  the audit (invoking this skill counts).
