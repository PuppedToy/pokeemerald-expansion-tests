---
id: T-038
title: Documentation feedback review and improvements
status: in-progress
type: docs
created: 2026-06-29
updated: 2026-06-29
target-version: 0.3.1
links: []
blocked-by: []
---

# T-038 — Documentation feedback review and improvements

## Context

The user is reviewing the project documentation and will provide a list of feedback
items. This task collects that feedback, tracks the agreed changes, and records what
ships. Example material the user shares to illustrate the feedback lives in
[assets/T-038/](assets/T-038/) so we share a common reference.

Docs live under `docs/` (indexed by `docs/INDEX.md`), `randomizer/docs/`, ADRs in
`docs/adr/`, and `CLAUDE.md`. See the SSOT rules in `CLAUDE.md` — fixes go to each
fact's single home; drift is repaired, not propagated.

## Plan

1. Receive the user's feedback list (and any example assets dropped in
   [assets/T-038/](assets/T-038/)).
2. For each item, agree on the fix and its home (which doc / ADR / index).
3. Apply changes respecting SSOT (link, don't copy; derive, don't duplicate).

Acceptance criteria:
- [ ] Every feedback item is logged below with its resolution (done / deferred / rejected + why).
- [ ] Doc changes respect SSOT and `docs/INDEX.md` stays complete.
- [ ] No generated/derived files hand-edited.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-29** — Task created. Set up `assets/T-038/` for shared example material. Awaiting the feedback list.
- **2026-06-29** — First feedback batch: landing-page copy (`frontend/index.html`). Resolutions:
  - **Slogan** — dropped the trailing period ("…controlled chaos."→"…controlled chaos"). Applied in both homes: landing (`index.html`) and the docs-viewer header (`template.html`) for consistency. **done**
  - **"What is this?" two descriptions** — restructured the two paragraphs into a numbered `<ol class="info-2in1">` (the requested list indicator) so the "2-in-1" reads as items 1 & 2; led each with an orange `<strong>` term. New CSS in `frontend/css/layout.css` draws square ember number plaques (hard edges + offset shadow) to match the Obsidian pixel theme — `--radius:0`, so no rounded dots. Copy professionalised: romhack item ("Pokémon through Gen 9, plus Megas"; "cuts the story down to the essentials"), randomizer item (dropped "VERY controlled chaos"/"by balanced I mean…", ends "A randomizer for controlled chaos"). **done**
  - **Full feature list review** (ROM / Randomizer / Generated-docs subtabs + features header + landing subtitle) — polished grammar, parallelism and flow with no change to game facts. Kept Oxford spelling consistent with the existing copy (American `-ize`: "customizable/randomized"; British `-our`: "favoured/favourite/colour"). E.g. "6 vs 6"→"6-vs-6", "the most fair battles possible"→"the fairest battles possible", "Evolve candy"→"Evolution candy". **done**
  - Frontend test harness green (`cd frontend && npm test`, 4/4); no test asserts on this copy. No generated/derived files touched.
  - Awaiting the user's next feedback items (and any manual review of the landing) before closing.
- **2026-06-29** — Feedback: em dashes read as "very AI". Scoped (per user) to the Home and Features tabs only in `frontend/index.html`. Removed all 18 em dashes there (19 chars; L291 had a pair), each recast with a different construction rather than a single replacement: sentence splits, colons, parentheses, comma clauses, "For example,". Out-of-scope em dashes left untouched (auth modal L44; Generate tab L199/L215). Verified 0 em dashes remain in lines 68–118 and 244–333. Frontend tests green (4/4). **done**
- **2026-06-29** — Feedback: the nuzlocke tracker is important enough to surface in the core, not only the features list. Added it to core item 2 of the "What is this?" box: "…full documentation for every run, and those docs double as a built-in nuzlocke tracker." No em dash, Oxford spelling kept; the features-header highlight already mentioned it, so the two stay consistent. Frontend tests green (4/4). **done**

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned (link new task ids). -->
