---
id: T-121
title: Expand the singles OU corpus for statistically-robust archetype entry conditions
status: proposed
type: docs
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-099, T-118, T-107]
priority: high
blocks: [T-118 entry-condition tuning]
---

# T-121 — Expand the singles OU corpus

## Context

The T-118 role profiles came from ~284 mapped mons (robust). But the **archetype entry conditions**
are a team-level signature, and the current corpus has only **12 singles OU teams** — buckets of 2-5
per archetype (balance 2, full_stall 2, hyper_offense 3, bulky_offense 5). The qualitative direction is
sound (corpus + established competitive theory), but committing per-archetype `min` thresholds on
2-team buckets is not statistically rigorous (owner call, 2026-07-11: expand before finalising).

## Plan

- Research more **Smogon Singles OU (6v6) teams, Gen 6-7** (the megas era we target), adversarially
  verified like T-098/099, into `docs/research/corpus.json` — aim for **~8-10 teams per base archetype**
  (balance / bulky offense / hyper offense / full stall) + the singles gimmick lines (weather / screens /
  trick room), so ~30-40 singles teams total.
- Regenerate the research docs (`scripts/gen-research-docs.cjs`).
- **Re-run** the role-profile + entry-signature analyses on the larger sample; owner-validate the
  refreshed entry conditions (Batch-4 style), then T-118 implements them.

Acceptance criteria:
- [ ] ~30-40 verified singles OU teams in the corpus, ~8-10 per base archetype.
- [ ] Entry-signature analysis re-run + owner-validated on the larger sample.
- [ ] Role profiles (T-118) re-checked against the larger sample (adjust only if they shift).

## Progress log

- **2026-07-11** — Created (owner-requested). Blocks the T-118 entry-condition tuning until the singles
  sample is large enough to be statistically meaningful.

## Outcome
