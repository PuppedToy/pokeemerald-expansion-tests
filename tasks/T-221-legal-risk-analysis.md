---
id: T-221
title: Legal risk analysis for the public (non-commercial) site
status: in-progress     # proposed | in-progress | done | abandoned
type: docs              # feature | fix | refactor | docs | chore
created: 2026-07-26
updated: 2026-07-26
target-version: 0.7.0
links: [docs/legal-risk-analysis.md]
blocked-by: []
---

# T-221 — Legal risk analysis (non-commercial fan tool)

## Context

The site is public (beta live) and the owner wants a **realistic** legal risk read for a **non-commercial**
fan tool that generates BPS patches for a user-owned Pokémon Emerald ROM (ROM stays client-side), built on
the `pokeemerald-expansion` decompilation. Owner asked specifically about: the domain name containing
"pokemon", the on-page + generated-docs texts, the generation method, "building ROMs" vs "generating patch
files" wording, and any other realistic risks. **Informational only — not legal advice.**

## Plan

Produce a written risk assessment (not code) grounded in known copyright/trademark principles + Nintendo/TPC
enforcement patterns, scoped to this non-commercial/patch-based/EU case. Rank by *realistic* exposure and
give concrete, prioritised actions. Deliverable: [docs/legal-risk-analysis.md](../docs/legal-risk-analysis.md)
(linked from `docs/INDEX.md`).

Acceptance criteria:
- [x] Written assessment delivered as a doc, linked in `docs/INDEX.md`, clearly labelled **not legal advice**.
- [x] Answers the owner's five questions directly: domain/trademark, page+docs texts, generation method,
      wording ("patch files" not "ROMs"), and other realistic risks.
- [x] Flags the non-IP risk that's easy to miss: **GDPR** (EU data protection for the email/account system).
- [x] Ends with a prioritised action checklist (domain rename + GDPR first).
- [ ] Owner has read it and decided which actions to spin into their own follow-up tasks (e.g. domain rename,
      privacy policy, wording sweep, disclaimer/ToS).

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-26** — Wrote `docs/legal-risk-analysis.md`. Realistic-worst-case framing: a **takedown**, not a
  lawsuit (Nintendo litigates commercial/ROM-distribution cases). Top-2 highest-leverage moves surfaced:
  (1) get "pokemon"/"emerald" out of the **domain/brand** (cheap UDRP/registrar lever for TPC), (2) meet
  **GDPR** obligations (independent of Nintendo, likelier to bite a small non-commercial EU site). Confirmed
  the current posture is already lower-risk (non-commercial, patch-only, own-your-ROM, ROM client-side) and
  that the grey areas are the transient server ROM build + the decomp base. Endorsed the owner's "patch
  files, never ROMs" wording instinct as legally meaningful framing (not a magic phrase). NOT legal advice;
  recommended a short lawyer consult specifically for the GDPR items. Follow-up actions left for the owner to
  turn into their own tasks.

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
