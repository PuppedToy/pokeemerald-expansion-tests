---
name: decision-log
description: Download and show the team-building decision log for a specific bundle/run from the live server. The decision log is server-only (never shown to the end user); use this when the owner asks to review why a run built the teams it did — by seed or run id.
---

# Fetch a run's team-building decision log

The team-building decision log (T-117) is stored **server-side only** for 48h after each run
(T-210) — it is never downloadable in the UI. This skill pulls one run's log from the live box so
the owner can review the reasoning behind that run's teams.

It uses `backend/scripts/get-decision-log.mjs`, which rsyncs the live `app.db` over SSH (same trust
boundary as `deploy/update.sh` — no new public surface) and reads the `decision_logs` table.

1. **Identify the run.** Ask the owner for the **seed** (most common) or the exact **run id**
   (bundle `sessionId`). If they're not sure which run, list what's stored:
   `cd backend && node scripts/get-decision-log.mjs --list`
   (add `--local <path/to/app.db>` if you already have a DB copy and want to skip SSH.)
   It rsyncs the live DB using `deploy/.env.local` (`DEPLOY_HOST/USER/KEY/PATH`, same as
   `deploy/update.sh`). If it fails with a DEPLOY_* / SSH error, tell the owner to set
   `deploy/.env.local` (or the env vars) — do NOT invent credentials.

2. **Fetch the log.** Run whichever the owner gave:
   `cd backend && node scripts/get-decision-log.mjs --seed <SEED>`      (latest run for that seed)
   `cd backend && node scripts/get-decision-log.mjs --run-id <RUN_ID>`  (an exact run)
   The log text is written to **stdout**; a one-line provenance header (run id, seed, timestamp,
   account/anon) goes to stderr. To save just the log:
   `node scripts/get-decision-log.mjs --seed <SEED> > /tmp/decision-log-<SEED>.txt`

3. **Read + explain.** The decision log is `renderTeamAuditText`'s output (`randomizer/teamAudit.js`):
   a per-team, per-slot trace of the archetype/gimmick/tier/item reasoning. When the owner asks a
   question about a run, quote the relevant trainer/slot lines and explain what drove the decision.

Notes:
- Retention is **48h** (matches diagnostics/bundle retention), so old runs won't be found — say so
  plainly rather than guessing.
- A seed can be re-run; `--seed` returns the most recent. Use `--run-id` for an exact match.
- Read-only — this never writes to the live DB.
