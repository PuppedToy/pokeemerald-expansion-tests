# Randomizer diagnostics

How degraded outcomes and warnings from a randomization run are **captured, transported, stored
and audited** (T-075). The motivating case: a trainer team can come back short (e.g. 5 mons instead
of 6) when a slot exhausts every fallback. That degradation is *accepted*; this system makes it —
and every other pipeline warning — observable instead of a `console.error` lost in a Web Worker.

## Pipeline

```
 browser Web Worker                     server (Express)                 your machine
 ┌───────────────────┐  POST /api/      ┌───────────────────┐  rsync     ┌──────────────────┐
 │ runGeneration()   │  diagnostics     │ diagnostics table │  app.db    │ scan-diagnostics │
 │  → diag sink      │ ───────────────▶ │  (48h retention)  │ ─────────▶ │  → grouped JSON  │
 │ (sibling of the   │  (fire & forget) │  sweeper purges   │  over SSH  │ /diagnostics-    │
 │  bundle, not in it)│                 │  after 48h        │            │  audit skill     │
 └───────────────────┘                  └───────────────────┘            └──────────────────┘
```

Key design point: diagnostics travel **outside the bundle**. The worker returns them as a sibling
field in its `postMessage` (`{ type:'done', bundle, diagnostics, diagnosticsCounts }`), never inside
`bundle`, so the bundle shape — and the determinism tests and `validateBundle` — are untouched. The
durable home (SSOT) is the server's `diagnostics` table, not the bundle.

## The sink — `randomizer/diagnostics.js`

`createDiagnostics({ mirror = true, cap = 1000 })` → `{ warn, error, fatal, all, counts }`. Each event
is `{ seq, severity, code, message, context }`. `mirror` re-emits to `console` (default on) so the
Node pipeline and browser devtools keep today's visibility — this is purely additive.

It is threaded two ways:
- **Explicit** into `writerDocs` (the trainer team loop) via `options.diag`, wired from
  `generate.js` → `computeRomDocs`.
- **Ambient** for deep helpers that would otherwise need signature churn: `runGeneration` calls
  `setActiveDiagnostics(sink)` for the duration of one run (cleared in `finally`), and helpers call
  `activeDiagnostics().warn(...)`. Generation is single-run, so there is no interleaving; unset → a
  NOOP sink, so a helper called outside a run records nothing.

## Diagnostic codes

`DIAGNOSTIC_CODES` in `randomizer/diagnostics.js` is the single home of the codes. Add a code there
when you add an emission point, and document its context fields below.

| Code | Severity | Emitted at | Meaning | Context fields |
|------|----------|-----------|---------|----------------|
| `TRAINER_SLOT_DROPPED` | error | `randomizer/writerDocs.js` (slot loop) | A slot found no pokemon after every fallback → the slot is dropped | `trainerId, trainerName, class, level, slotIndex, definition` |
| `TRAINER_TEAM_SHORT` | warning | `randomizer/writerDocs.js` (after the loop) | Finished team is shorter than its definition (the "team of 5") | `trainerId, trainerName, class, level, expected, actual, dropped` |
| `STARTER_FALLBACK` | error | `randomizer/modules/startersModule.js` | No valid starter type-triangle in the pool → unconstrained fallback | `eligibleForTriangle` |
| `MEGA_NO_BASE_FORM` | warning | `randomizer/modules/utils.js` | Could not find a mega's base form while checking valid evolutions | `pokemon, trainerId` |
| `MULTIPLE_PRE_EVOLUTIONS` | warning | `randomizer/modules/utils.js` | Ambiguous pre-evolution during devolution | `pokemon, trainerId, preEvolutions` |
| `MOVE_NOT_FOUND` | warning | `randomizer/rating.js` | A move id was not found in the moves database | `move, pokemon` |
| `ROLE_UNKNOWN` | warning | `randomizer/rating.js` | Unknown battle role → balanced rating assigned | `role, pokemon` |

### Warnings NOT routed to the sink (Node-pipeline only)

These fire only in the `analyze.js` / `make.js` / ROM-build paths (never in the browser worker), so
they land in build logs, not in `/api/diagnostics`. Left as `console.warn` on purpose; listed here so
the audit is complete:

- `randomizer/rebalancer.js` — type-adjustment and move-replacement warnings (rebalance runs in the
  Node pipeline; the browser uses pre-rebalanced `base-data.json`).
- `randomizer/writer.js` — the ROM-write mirror of the trainer loop + mega + teachable-timestamp
  warnings (used by `make.js` on the builder, not the front).
- `randomizer/parser.js` — evo-structure warnings emitted while parsing game files (`console.log`).

## Transport + storage (server)

- `POST /api/diagnostics` — `backend/diagnostics/{routes,handlers}.js`. **Optional auth**
  (`optionalAuth` in `backend/auth/middleware.js`): a valid JWT attaches `user_id`, otherwise the run
  is stored anonymously (randomization needs no account). Per-IP rate limited, `2mb` JSON limit,
  events capped at 500 and messages at 2000 chars server-side.
- `diagnostics` table — `backend/db/index.js` (migration) + `backend/db/diagnostics.js` (repo). One
  row per run: `id` (runId = bundle `sessionId`), nullable `user_id`, `created_at` (TTL base),
  `generated_at`, `seed`, `run_type`, `app_version`, `user_agent`, `counts_json`, `events_json`.
- **48h retention** — `backend/lifecycle/sweeper.js` `purgeExpired(now - ttlMs)`, same 2-day window
  and 5-minute interval as the bundle/output retention. Account deletion clears a user's rows
  (`deleteForUser`, FK is not `ON DELETE CASCADE`).
- **Front** — `frontend/js/app.js` `reportDiagnostics()` fires fire-and-forget on every completed
  generation (even zero-event runs, to give the audit a denominator). Never blocks or fails the UI.

## Auditing — the local action

- **Script**: `backend/scripts/scan-diagnostics.mjs` (read-only, zero-dep, `node:sqlite`).
  - `--report` / `--json` (default) / `--since <hours>` / `--local <app.db>` / `--keep`.
  - Live mode rsyncs the box's `app.db` over SSH using `deploy/.env.local`
    (`DEPLOY_HOST/USER/KEY/PATH`) — same trust boundary as `deploy/update.sh`, no new HTTP surface.
  - Groups events by `code` + a normalized message signature (ids/numbers collapsed), with impact
    metrics (events, distinct runs, users, first/last seen) and sample contexts.
- **Skill**: `/diagnostics-audit` runs the script and proposes a concrete fix per class, mapping each
  `code` back to its emission point via this document.

Run it: `cd backend && node scripts/scan-diagnostics.mjs --json` (add `--since 48`).
