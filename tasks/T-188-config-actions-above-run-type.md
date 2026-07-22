---
id: T-188
title: Move Save/Load/Reset above Run type + bundle-aware config messages
status: in-progress
type: feature
created: 2026-07-22
updated: 2026-07-22
target-version: 0.6.0
links: []
blocked-by: []
---

# T-188 — Move Save/Load/Reset above Run type + bundle-aware config messages

## Context
Part of the config/seed/bundle standardization epic (siblings: T-189 two-seed model,
T-190 regenerate-from-bundle, T-191 versioning/migration). The Save/Load/Reset controls
(`.config-actions`) currently render at the very bottom of the config form, after the
"General" category (`frontend/js/config-form.js:1698-1707`). They should sit at the top —
just below the step indicator ("breadcrumbs", `frontend/index.html:135-151`) and above the
"Run type" section (`config-form.js:868`) — so they are reachable without scrolling the whole
form. The Load control already accepts a full `bundle.json` and extracts only its `config`
(`frontend/js/session.js:extractConfig`, ~line 49); this task also adds the explanatory copy
for that and reserves the wording later reused by T-190's "regenerate from bundle".

## Plan
- Relocate the `.config-actions` block from the bottom of `ConfigForm._build()`
  (`config-form.js:1698-1707`) to the top of the rendered form — before the accordion opens
  (`config-form.js:866`) — so it lands below the `index.html` step indicator and above Run type.
  Preserve the button ids (`#btn-save-config`, `#btn-reset-config`, `#upload-config`) so the
  `_bind()` wiring (`config-form.js:2086-2107`) is untouched.
- Restyle `.config-actions` (`frontend/css/layout.css:508-524`): today it is a bottom footer
  (`border-top: 3px dashed; margin-top`); make it a header block.
- Add explanatory copy: Load hint that a `bundle.json` is also accepted and only its `config`
  is applied (the rest ignored); a short note aligned with T-190's "regenerate rebuilds the
  bundle as-is, no re-randomization".
- Cover with the existing frontend structure/round-trip tests
  (`frontend/__tests__/config-form.test.js`, `config-roundtrip.test.js`; `node --test`, ADR-009).

Acceptance criteria:
- [ ] Save/Load/Reset render above Run type and below the step indicator, styled as a header (not a footer).
- [ ] Save, Load (config or bundle) and Reset still work (handlers bound by id; round-trip test green).
- [ ] Loading a full `bundle.json` applies only its `config` and shows the explanatory hint.
- [ ] Frontend `node --test` green and `cd randomizer && npm test` green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-22** — Task created; design locked in the standardization design discussion. Starting first (isolated, low risk).
- **2026-07-22** — Implemented: `.config-actions` moved to the top of `ConfigForm._build()` (before the accordion, below the step indicator) + a `bundle.json` hint line; `.config-actions` restyled from footer to header in `layout.css`. Added T-188 structural tests (order/top/ids/hint/CSS) — Red first, then Green. Frontend `node --test` 109/0, `randomizer npm test` 1557 passed. Merged to master (`merge: T-188`). Awaiting the batch manual-test before closing.

## Outcome

<!-- Filled when closing. -->
