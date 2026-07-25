---
id: T-210
title: Make the decision log server-only + a download-decision-log skill
status: proposed        # proposed | in-progress | done | abandoned
type: refactor          # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-117, T-130, T-075]
blocked-by: []
---

# T-210 — Make the decision log server-only + a download-decision-log skill

## Context

The team-building **decision log** ([T-117](T-117-team-decision-audit-log.md)) is an internal debugging
artifact, **not** for the end user. Treat it exactly like the generation warnings/diagnostics: store it on the
server **temporarily (48h)** so the owner can pull it on request, and make it **invisible** in the UI — remove
the download button and its inclusion in the docs download (and anywhere else). Add a **skill** to download a
particular bundle's decision log. Related: [T-130](T-130-decision-log-auditability.md),
[T-075](T-075-randomizer-diagnostics.md) (the 48h server-store pattern to mirror).

### Findings from the current code
- **User-facing surfaces to remove:** button `#btn-download-audit` ("⬇ Decision log")
  `frontend/index.html:245-246`; its handler `frontend/js/app.js:268-280` (downloads `decision-log-<seed>.txt`
  from in-memory `currentTeamAuditText`, declared `app.js:71`); and the docs-zip inclusion
  `zip.file('decision-log.txt', …)` at `app.js:301`. Text source: `randomizer/teamAudit.js:201`.
- **Not in the bundle/full download** — confirmed clean: `frontend/js/account.js` `zipRoms` (`:579-584`) /
  `deliverPatch` (`:590-617`) and backend `readOutput` (`backend/build/storage.js:45-50`) only zip the ROMs/
  patches; nothing to remove there.
- **48h server store to mirror (T-075):** `backend/db/diagnostics.js` (`purgeExpired` `:41`, 48h retention),
  `backend/diagnostics/routes.js` (`POST /api/diagnostics` `:19-24`), `backend/diagnostics/handlers.js:41-77`
  (sanitise + cap + idempotent by `runId`), swept by `backend/lifecycle/sweeper.js`.
- **Existing skill to sibling:** `.claude/skills/diagnostics-audit/SKILL.md` (pulls `app.db`, runs
  `backend/scripts/scan-diagnostics.mjs`). A new `.claude/skills/decision-log/` skill would fetch a bundle's
  stored decision log the same way.

## Plan

1. Remove the button (`index.html:245-246`), its handler (`app.js:268-280`) and the docs-zip line (`app.js:301`);
   drop/neutralise `currentTeamAuditText` client-side.
2. Add a server endpoint that stores the decision log keyed by run/bundle id with 48h retention, mirroring the
   diagnostics store + sweeper. Submit it from the pipeline like diagnostics are submitted.
3. Add a `.claude/skills/decision-log/` skill to download a given bundle's decision log for owner review.

Acceptance criteria:
- [ ] No decision-log download button; not present in the docs zip or any user download.
- [ ] Decision log is stored server-side per run, retained ~48h, and swept (mirrors diagnostics).
- [ ] A skill downloads a specific bundle's decision log; documented in the skill.
- [ ] Backend + frontend tests green; browser bundle rebuilt if the worker path changed.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Mapped the two user-facing surfaces (button `index.html:245-246` +
  handler `app.js:268-280`; docs-zip line `app.js:301`), confirmed the full/bundle download does NOT carry the
  log, and identified the diagnostics 48h store (`backend/db/diagnostics.js`, `diagnostics/*`, `sweeper.js`) +
  `.claude/skills/diagnostics-audit/` as the pattern to mirror for storage and a sibling skill.

## Outcome

<!-- Filled when closing. -->
