---
id: T-122
title: Decision-log accuracy — report DELIVERED roles, not species potential (fix B-026)
status: proposed
type: bug
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-107, T-117, T-118, B-026]
priority: low
---

# T-122 — Decision-log accuracy (report delivered roles)

## Context

Filed originally as "role moves are dropped" (critical). **Disproved:** direct resolver instrumentation
shows role moves ARE delivered — of 214 planned, 210 pushed, **209 survived** into the final moveset.
The "35/36 dropped" reading was a measurement artifact (audit build-order vs docs shuffle-order). See
**B-026**.

The genuine, low-severity defect: the decision log's `rolesFilled` is computed from
`detectFeatures(chosenMon)` = **species potential** (what the mon *could* do), not what its final
moveset/ability **delivers**. So a mon shows "fills hazardSetter" whenever it *can* set hazards — 82
potential tags at high soph vs 36 mons actually running a hazard. This makes the log untrustworthy
(and is what made role delivery look broken). Since the log is now our main validation instrument for
the whole teambuilding effort, it must be accurate.

## Plan

- Compute the audit's `rolesFilled` (and any delivered-role reporting) from the **resolved member**
  (actual moveset + chosen ability) via `resolvedDetectMon`, not the species potential — so "fills X"
  means the mon really delivers X.
- Optionally annotate potential-but-not-delivered leanings distinctly (e.g. "could set hazards") so the
  log still shows why a mon was picked without claiming a role it doesn't fill.
- **Closes B-026** (regression: an audit role tag ⇒ the member actually delivers that role).
- Observability only — no change to generated teams (determinism unaffected).

> Note: role-move DELIVERY itself works and needs no fix. The genuine *team* issue exposed here —
> redundant duplicate role-holders (2+ hazard setters) — is **T-123** (role-max dedup), not this task.

Acceptance criteria:
- [ ] `rolesFilled` reflects delivered roles (resolved moveset/ability), not species potential.
- [ ] B-026 regression green; the decision log no longer over-reports roles.
- [ ] `cd randomizer && npm test` green (no generation-output change).

## Progress log

- **2026-07-11** — Created as "role-aware move selection (critical)"; **re-scoped** after instrumentation
  proved role delivery works (209/210). Now the low-severity decision-log accuracy fix (report delivered
  roles). The real teambuilding fix (duplicate role-holders) moved to T-123.

## Outcome
