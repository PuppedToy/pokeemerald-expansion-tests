---
id: T-121
title: Expand the singles OU corpus for statistically-robust archetype entry conditions
status: in-progress
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
- [x] Verified singles OU teams in the corpus (12 → **62**; 50 added), balance 10 · bulky_offense 26 ·
      hyper_offense 14 · full_stall 12 (weather/screens/TR as gimmick layers on those bases).
- [x] Entry-signature analysis re-run on the larger sample (owner validation of the refreshed entries
      pending → unblocks the T-118 entry increment).
- [ ] Role profiles (T-118) re-checked against the larger sample (adjust only if they shift).

## Progress log

- **2026-07-11** — Created (owner-requested). Blocks the T-118 entry-condition tuning until the singles
  sample is large enough to be statistically meaningful.
- **2026-07-11** — Ran the `expand-singles-corpus` **research workflow** (owner opted into "usa un
  workflow"): 63 agents, 0 errors — discover (8 archetype angles) → adversarial verify (real +
  legal Gen 6-7 OU) → refill thin archetypes → synthesize. **50 verified teams merged** into
  `corpus.json` (documented Smogon RMT / sample-team / ladder teams — ABR, Kickasser, fade, Empo, …
  with sources). Corpus 50→100; **singles-OU 12→62**. Regenerated `docs/research/` (singles-ou-teams
  now 62). Re-ran the entry-signature analysis on 62 teams — the bigger sample **confirms** the
  proposal (buckets now 10-26): hazardSetter 100% in ALL (ubiquitous → not an entry feature);
  hyper_offense distinguished by setupSweeper (86%, avg 1.7); full_stall by walls+unaware+cleric
  (~90%); balance by wallbreaker+regeneratorPivot; bulky_offense the broad offensive default; weather
  by weatherSetter (94%). Presenting for the owner's final validation before implementing entries.

## Outcome
