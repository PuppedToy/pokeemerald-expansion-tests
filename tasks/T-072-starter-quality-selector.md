---
id: T-072
title: Starter quality selector for the 3 main starters + extra-starter count & visual separation
status: done
type: feature            # feature | fix | refactor | docs | chore
created: 2026-07-07
updated: 2026-07-15
target-version: 0.6.0
links: [T-052]
blocked-by: []
---

# T-072 — Starter quality selector for the 3 main starters

## Context

The 3 main starters are currently generated with a **hardcoded** quality in
`randomizer/modules/startersModule.js`: a 3-stage Little-Cup line
(`EVO_TYPE_LC_OF_3 && isLC`) whose family's best evolution rates exactly **UU**,
with a sub-weak base form (`isSubWeakTier`). There is no way to configure it.

Meanwhile the **extra** starters already expose a per-slot tier selector
(`EXTRA_STARTER_TIER_OPTIONS = [LEGEND, UBERS, OU, UU, RU, NU, PU]`, see T-052,
`frontend/js/config-form.js` + `randomizer/modules/wildModule.js`).

This task adds a single **Starter quality** tier selector for the 3 main
starters (same tier vocabulary), shows the **extra-starter count**, and visually
separates the quality field from the extra-starter list. Default reproduces
today's behaviour (3-stage LC line peaking at **UU**).

Key simplifier: in `randomizer/constants.js` the `TIER_*` constants **are** the
same strings the UI uses (`TIER_UU === 'UU'`), so the selector value maps to the
rating tier with no translation.

## Plan

**Generation (`randomizer/modules/startersModule.js`)** — TDD:
- `runStartersModule(pokemonList, { quality } = {})`. `quality` defaults to `'UU'`.
  Validate against the allowed tier set (`LEGEND|UBERS|OU|UU|RU|NU|PU`); invalid
  → fall back to `'UU'`.
- Replace the hardcoded `bestEvoTier === TIER_UU` with `bestEvoTier === quality`.
  Keep the `EVO_TYPE_LC_OF_3 && isLC && isSubWeakTier` constraints and the
  existing type-triangle + fallback logic untouched.
- Thread `quality` from module config at every call site: `randomizer/generate.js`
  (6 sites), `make.js` `randomizeMode`, `randomizer/index.js`. Signature stays
  backward-compatible (default UU) so fixtures/legacy keep working.

**Config plumbing:**
- `frontend/js/config-form.js`: add `starterQuality: 'UU'` to `DEFAULTS`; render a
  single tier `<select>` (reusing `EXTRA_STARTER_TIER_OPTIONS`) at the **top** of the
  Starters section, above the extra-starter list; read it in `getConfig()`, write it
  in `setConfig()`, wire its `change` event.
- Add a live **"Extra starters: N"** count label next to the list (updates in
  `_renderStarterList()`), and a visual divider/subheading separating the quality
  field from the extra-starter list.
- `backend/generator.js` `toModuleConfig` **and** `frontend/js/randomizer-worker.cjs`
  `toModuleConfig` (the two mirrors): add `starterQuality: cfg.starterQuality`.

**Bundle:** `bundle.config` already spreads the whole frontend config verbatim
(`generate.js bundle()`), so `starterQuality` lands in the bundle automatically —
no schema change needed. It affects *generation* (starter picks are baked into the
`starters` artifact), so no ROM-maker change is required.

Acceptance criteria:
- [ ] `runStartersModule(list, { quality: 'OU' })` only picks starters whose
      `bestEvoTier === 'OU'` (and still LC-of-3 / sub-weak); default call reproduces
      today's UU behaviour (regression test proves byte-identical selection for a seed).
- [ ] Invalid/absent quality falls back to `'UU'`.
- [ ] Frontend: the Starters section shows a Starter-quality selector (default UU)
      above a visually separated extra-starter list with a live count.
- [ ] `starterQuality` round-trips through get→set→get and reaches `toModuleConfig`
      (both mirrors) and `bundle.config`.
- [ ] `cd randomizer && npm test` green; frontend config tests green.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-07** — Task created after mapping the starter config UI
  (`frontend/js/config-form.js`), generation (`startersModule.js`, hardcoded UU),
  the tier system (`constants.js` — tier constants are the UI strings) and the two
  `toModuleConfig` mirrors. Decision: single quality selector varies only the peak
  evolution tier; the 3-stage-LC + sub-weak-base constraint stays. Default `UU`.
- **2026-07-07** — Implemented (TDD). RED then GREEN in
  `__tests__/unit/startersModule.test.js` (quality "OU" only picks OU families;
  default & invalid → UU; explicit UU byte-identical to default). Engine:
  `runStartersModule(list, { quality })` with `resolveStarterQuality` (allowed set
  = LEGEND|UBERS|OU|UU|RU|NU|PU, fallback UU), replacing hardcoded `TIER_UU`.
  Threaded `{ quality: mcfg.starterQuality }` through all 6 `generate.js` sites +
  `make.js` randomizeMode. Both `toModuleConfig` mirrors forward `starterQuality`.
  Frontend: quality `<select>` at the top of the Starters section (reuses
  `EXTRA_STARTER_TIER_OPTIONS`), visual divider + "N extra starters" live count,
  `DEFAULTS.starterQuality='UU'`, get/set/event wiring. Tests: randomizer 722✓,
  frontend 48✓ (added structural + round-trip assertions). Signature stays
  backward-compatible (default UU) so `index.js`/fixtures are unaffected.

## Outcome

Starter quality selector for the 3 main starters (default UU) + extra-starter count & visual separation; get/set/event wiring, backward-compatible signature. randomizer 722 + frontend 48 green. Owner-validated 2026-07-15. Closed.
