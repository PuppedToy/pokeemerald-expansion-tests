---
id: T-213
title: Unify & complete the config detail view (preset inspect + Review step)
status: in-progress     # proposed | in-progress | done | abandoned
type: refactor          # feature | fix | refactor | docs | chore
created: 2026-07-25
updated: 2026-07-25
target-version: 0.6.0
links: [T-192, T-196, T-035]
blocked-by: []
---

# T-213 — Unify & complete the config detail view (preset inspect + Review step)

## Context

The read-only configuration summary shown when **inspecting a preset** and at the **Review step** (before
generating the ROM) must be **complete** (show ALL config) and use the **same** component in both places (no
duplication). Related: [T-192](T-192-config-presets.md) (preset detail/inspect),
[T-196](T-196-preset-overwrite-safety.md) (preset modal), [T-035](T-035-generation-and-settings-ux-refinements.md)
(the shared run-summary/Review). See ADR-021.

### Findings from the current code — already shared; the gap is completeness
- **They already share one component:** `reviewRowsHtml(cfg)` (`frontend/js/app.js:535-604`), whose header
  comment (`:533-534`) calls it the single source for the step-2 Review and the step-3 Run-details disclosure
  "so they never drift". Review: `renderReview` (`app.js:606-629`) → `reviewRowsHtml` (`:624`); also step-3
  `renderRunDetails` (`:632-634`). Preset inspect: `presets.js:280` `renderConfigDetail(item.config)` (in
  `showDetail`, wired `:71/:316`, rendered `:292`), where `renderConfigDetail` is injected as
  `app.js:375` → `reviewRowsHtml`. **So no de-duplication is needed — the work is completeness.**
- **Completeness gaps (missing from `reviewRowsHtml`, hence from both views):** `disableStevenTagBattle`,
  `nicknames` (enable + options), `starterQuality` (only the extra-starter *count* is shown, `:594`),
  `prices`/shop prices and `moveRelearnPrice` (only normal/boss/gym money `:593`), `docsVisibility`,
  `universeSeed`, the battle-format settings; some difficulty knobs (team size `:561`, level modifier `:566`)
  only render when non-default. The full config is produced at `config-form.js:560`.

## Plan

Audit the config object produced by `config-form.js:560` against the keys rendered by `reviewRowsHtml`, then
extend `reviewRowsHtml` (the single place — both call sites pick it up) to render every field with sensible
labels/formatting. Add a drift-guard test asserting every config key the form produces appears in the summary,
so future config additions can't silently drop out of either view.

Acceptance criteria:
- [x] Both the preset-inspect detail and the Review step show the COMPLETE configuration (every field the form
      produces), via the same `reviewRowsHtml` component (a second test asserts both call sites delegate to it).
- [x] Previously-missing fields all shown: battle format (+ Run & Bun / mixed %), move mutation, main starter
      quality, shop prices, move relearn price, Steven tag, auto-nicknames, docs visibility, universe seed.
- [x] Drift-guard test (`frontend/__tests__/config-review-completeness.test.js`) fails if any `base` config key
      is not referenced in `reviewRowsHtml` (bar 5 explicitly-summarised granular knobs).
- [x] Frontend suite green (164 passed). No overflow: `.summary-val` is a shrinkable flex item with normal
      white-space → long values wrap; the settings screen already passed the shoot overflow check.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-25** — Task created (proposed). Found the two views already share `reviewRowsHtml`
  (`app.js:535-604`; preset inspect routes through `renderConfigDetail` = `app.js:375`), so this is a
  completeness task, not a de-dup. Listed the config keys currently omitted from the summary and the plan to
  extend `reviewRowsHtml` once + add a drift-guard test.
- **2026-07-26** — **Implemented (in-progress).** Enumerated `getConfig()`'s `base` object (the SSOT of produced
  keys) and added the missing rows to `reviewRowsHtml`: Battle format (+ Run & Bun / mixed % / sequential),
  Move mutation, Main starter quality, Shop prices, Move relearn price, Steven tag battle, Auto-nicknames, Docs
  visibility, Universe seed — with small `fmt*` helpers summarising the object-valued ones (prices, nicknames,
  docsVisibility). Added `frontend/__tests__/config-review-completeness.test.js`: a source-inspection drift-guard
  asserting every `base` key is referenced as `cfg.<key>` in `reviewRowsHtml` (5 granular knobs allowlisted as
  summarised), plus a guard that both call sites delegate to the one component. Frontend suite green (164).
  `app.js`/`config-form.js` are served directly → no bundle rebuild.

## Outcome

<!-- Filled when closing. -->
