---
id: T-163
title: Docs-visibility config section (per-element redaction of the generated docs)
status: in-progress     # proposed | in-progress | done | abandoned
type: feature           # feature | fix | refactor | docs | chore
created: 2026-07-19
updated: 2026-07-19
target-version: 0.6.0
links: [T-007, T-162]
blocked-by: []
---

# T-163 — Docs-visibility config section

## Context

Requested by the owner. Today the only docs-display option is `showExactPositions`, buried in the
**General** config category and applied at *data-generation* time in `randomizer/writerDocs.js`
(it bakes a redacted `displayTeam` order into the docs bundle; the viewer `frontend/template.html`
renders `trainer.displayTeam || trainer.team`). The owner wants a dedicated **Docs visibility**
category holding many per-element toggles, each of which redacts what the generated docs reveal
(trainer cards in the Trainers tab + the Encounters tab + the level-cap **Mail** inbox, T-007).

Redaction follows the existing `showExactPositions` precedent: **bake at generation time** (strip /
omit / replace the data in the docs bundle) so hidden information is genuinely absent from the
produced HTML, not merely hidden with CSS. The browser path is the one that produces the docs the
user sees (`config-form.js` → `app.js` worker → `randomizer-worker.cjs toModuleConfig` →
`generate.js` → `writerDocs.js`); the ROM-builder `out.html` twin (`writer.js`) is kept in sync
best-effort.

## Owner decisions (2026-07-19)

- **Hide some Pokémon:** hide the last X (display order) of **every** team (bosses + non-bosses),
  capped at `size − 1` (never the whole team). Collapse into one box `(and X other Pokémon)`; the box
  shows the *actual* hidden count.
- **Show legendary / non-legendary static = false:** hide the static species from the **Mail** inbox
  **and** hide the **whole card** in Encounters (achieved by omitting the entry from `wildPokes`,
  which both the Encounters cards and the Mail engine read).
- **Show rewards = false:** hide rewards **everywhere** — the reward on each trainer card **and** the
  reward cards in Encounters.
- **target-version:** 0.6.0 (same `[Unreleased]` cycle as T-162).

## Config schema (new)

Nested `docsVisibility` object (idiomatic — cf. `money`, `evoLevels`). `showExactPositions` migrates
into it; `setConfig` reads the legacy top-level key for back-compat with saved configs.

```
docsVisibility: {
  // Trainers group
  showTrainers: true,        showBosses: true,      showNonBosses: true,
  showHeldItems: true,       showNatures: true,     showMoves: true,       showAbility: true,
  showRewards: true,         showIVs: false,        showExactPositions: false,
  hidePokemon: false,        hidePokemonCount: 1,   // 1..5, revealed when hidePokemon
  // Wild encounters group
  showWildEncounters: true,
  showLegendaryStatic: true, showNonLegendaryStatic: true,
  showSuperRod: true,        showDive: true,        showSurf: true,
  showGoodRod: true,         showOldRod: true,      showGrass: true,
}
```

Every default reproduces today's behaviour (the one tightening: `showIVs:false` now **strips** the
`ivs` currently leaked-but-unrendered into the bundle — deliberate; see log).

## Effects table (generation-side redaction → viewer)

**Reward gate:** encounter reward cards visible ⟺ `showTrainers && showBosses && showRewards`.

| Key | Generation-side effect | Viewer effect |
|---|---|---|
| `showTrainers=false` | `trainersResultsSimplified = {}` | hide Trainers nav tab + section; reward cards gone (gate) |
| `showBosses=false` | drop `isBoss` trainers | boss cards gone; reward cards gone (gate) |
| `showNonBosses=false` | drop non-boss trainers | route/normal cards gone |
| `showHeldItems=false` | delete member `item` | no 🎒 row |
| `showNatures=false` | delete member `nature` | no nature row |
| `showMoves=false` | delete member `moves` | no move chips |
| `showAbility=false` | delete member `ability` | no ability row |
| `showRewards=false` | trainer `reward=[]` + omit reward cards | no 🎁 anywhere |
| `showIVs=true` | keep member `ivs` (else strip) | render a compact IV line (net-new) |
| `showExactPositions` | existing (`displayTeam`) | existing |
| `hidePokemon` + N | remove last N (display order) refs from `team`+`displayTeam`, set `hiddenCount` | show remaining + `(and N other Pokémon)` box |
| `showWildEncounters=false` | `wildPokes` → only `STARTERS`, `STARTER_EXTRA`, reward entries (gated) | Encounters tab restricted (tab stays) |
| `showLegendaryStatic=false` | omit `legendaryEncounter` entries | card + Mail static gone |
| `showNonLegendaryStatic=false` | omit `staticEncounter` entries | card + Mail static gone |
| `showSuperRod=false` | `super` → `{__hidden:'superNumbered', count:N}` | card shows "Super-Rod encounter 1…N" |
| `showGrass/Surf/Dive/GoodRod/OldRod=false` | `land/surf/underwater/good/old` → `{__hidden:'count', count:N}` | show only the count of distinct encounters |

`count N` = distinct species for that method's template from `wildPlan` (fallback 1). Per-method
markers apply only when `showWildEncounters=true`.

**UI nesting:** Show-trainers children grey out when Show trainers is off; Show-wild-encounters
children (per-method + super) grey out when it is off — **except** Show legendary/non-legendary
static, which also drive the Mail tab and stay active regardless.

## Plan

1. **Frontend** (`config-form.js`): new `data-cat="docs-visibility"` accordion category with two
   `section-title` sub-groups (Trainers / Wild encounters); move `showExactPositions` out of General.
   `DEFAULTS.docsVisibility`, `getConfig`, `setConfig` (+ legacy `showExactPositions` migration),
   `_syncUI` (grey-out + reveal the count input), `_wireEvents`.
2. **Threading:** forward `docsVisibility` through `randomizer-worker.cjs toModuleConfig`,
   `backend/generator.js toModuleConfig` (also fixes the pre-existing missing `showExactPositions`
   there), `generate.js` → `writerDocs` options. Back-compat shim in `writerDocs`:
   `showExactPositions = dv.showExactPositions ?? options.showExactPositions ?? false` (keeps existing
   tests green).
3. **Generation redaction:** trainer redaction in `buildTrainersResultsSimplified` (member strip, ivs,
   hidePokemon leak-free removal by object ref, reward strip, boss/non-boss filter, showTrainers empty);
   wild redaction helper for `wildPokes` (filter/omit/markers). Keep `writer.js` `out.html` twin in
   sync (best-effort).
4. **Viewer** (`template.html`): presence-guards for stripped fields; net-new IV line; hidePokemon
   box; hide Trainers tab when empty; render wild `__hidden` markers; Mail static handled
   automatically by the `wildPokes` omission.
5. **Bundle:** `node build.js` (worker bundle must rebuild for the browser).
6. **Docs:** `randomization-options.md`, `CHANGELOG.brooktec.md [Unreleased]`, CLAUDE.md if needed.

Acceptance criteria:
- [x] New "Docs visibility" category with all listed toggles; `showExactPositions` moved there and
      still working; count input revealed at 1–5; children grey out per the nesting rules.
- [x] Round-trips through Save/Load + `lastConfig`; legacy top-level `showExactPositions` migrates.
- [x] `docsVisibility` threads through both `toModuleConfig`s + `generate.js` → `writerDocs`.
- [x] `writerDocs` bakes each redaction per the effects table into a SEPARATE viewer copy (never the
      ROM-authoritative object); failing-first unit tests (`docsVisibility.test.js`,
      `writerDocsRedaction.test.js`) assert every branch; existing `writerDocsTeamOrder` + integration
      tests stay green (shape test updated for the new `viewerTrainers` field — documented spec change).
- [x] Defaults (all show-true, showIVs/hidePokemon/showExactPositions false) reproduce current docs.
- [x] Viewer renders redacted data (tab hide, IV line, hide-box, super-numbered, count-only) with
      responsive layout intact; Mail hides static per 2.1/2.2. (Headless Playwright over 3 fixtures.)
- [x] `cd randomizer && npm test` green (1359); frontend `node --test` green (86); backend green (132);
      `node build.js` rebuilds the bundle; headless visual check of the viewer.
- [x] `randomization-options.md` + `wild-encounters.md` + `CHANGELOG.brooktec.md [Unreleased]` updated.
- [ ] **User manual test** (toggle each option, regenerate, verify the docs) — closing gate.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-19** — Implemented (TDD, red→green throughout).
  - **Frontend** (`config-form.js`): new `data-cat="docs-visibility"` accordion with Trainers / Wild
    encounters sub-groups; `showExactPositions` moved out of General; `DOCS_VISIBILITY_DEFAULT` +
    `DOCS_VISIBILITY_TOGGLES`; `_readDocsVisibility`/`_setDocsVisibility` (legacy top-level
    `showExactPositions` migrates); `_syncUI` grey-out of children when a master is off (statics stay
    active — they drive Mail) + reveal of the hide-count input; `.dv-children` CSS. Tests in
    `config-form.test.js` (+ updated the "moved to General" test) and `config-roundtrip.test.js`.
  - **Threading:** `docsVisibility` forwarded raw through both `toModuleConfig`s (browser worker +
    `backend/generator.js`, which had never even forwarded `showExactPositions`) and `generate.js` →
    `writerDocs`, which normalizes with `randomizer/docsVisibility.js` (defaults + legacy shim).
  - **Redaction module** `randomizer/docsVisibility.js`: `normalizeDocsVisibility` + `redactWildPokes`
    (drops hidden statics/rewards/zones; a hidden method's species is DELETED and recorded under
    `hiddenMethods` — deleting the key keeps every other wildPokes consumer, incl. the Nuzlocke/Mail
    engines, working with zero guards). Unit-tested (`docsVisibility.test.js`).
  - **CRITICAL correction (ROM-safety):** `writer.js` builds the ROM's trainer parties VERBATIM from
    `docs.trainersResultsSimplified` (buildTrainersResultsFromDocs, bundle mode). My first cut redacted
    that shared object → would have stripped Pokémon/items/moves/IVs from the **actual game**. Fixed by
    calling `buildTrainersResultsSimplified` TWICE — full (no dv, ROM-authoritative) and redacted (with
    dv, `viewerTrainers`); the deterministic per-trainer shuffle makes both orders identical. `wildPokes`
    is docs-only (ROM wild data comes from `applyWildPlanToEncounters`) so it is redacted in place.
    Regression guards added to `diagnostics-degraded-team.test.js` (viewer redacted, full stays full)
    and `reverseOrderContinuity.test.js` (full keeps IVs; viewerTrainers exists).
  - **Viewer** (`template.html`): IV line (IVs are an OBJECT `{hp,atk,…}`, not an array — caught in
    headless verify), "(and N other Pokémon)" box, Trainers tab/section hidden when empty, wild
    placeholder tiles for `hiddenMethods` (count / super-numbered). Mail statics vanish automatically via
    the wildPokes omission (`if (!route) return` guard). `app.js` + the visual-tests fixture builder
    inject `viewerTrainers`; `writer.js` out.html injects `docs.viewerTrainers`/`docs.wildPokes` when a
    bundle's docs are present (analyze.js path = default visibility).
  - **Verify:** randomizer Jest 1359 ✓, frontend node:test 86 ✓, backend 132 ✓; `node build.js` rebuilt
    the worker bundle; headless Playwright over three fixtures (default / redacted / minimal) — 0 console
    errors, every redaction element renders/omits as expected. Docs: `randomization-options.md` (+ Docs
    visibility section), `wild-encounters.md` note, `CHANGELOG.brooktec.md [Unreleased]`.
  - **Documented behaviour:** `showWildEncounters=false` also removes statics from the Mail (they share
    `wildPokes`); a hidden method's species drops out of the Pokédex "obtainable" filter too (consistent
    hiding). Both acceptable for an opt-in docs-redaction feature. Awaiting user manual test to close.

- **2026-07-19** — Task created. Mapped the full pipeline: config plumbing
  (`config-form.js`→`app.js`→`randomizer-worker.cjs`/`backend/generator.js` `toModuleConfig`→
  `generate.js`→`writerDocs.js`), generation-side redaction precedent (`showExactPositions`→
  `displayTeam` in `buildTrainersResultsSimplified`), and the two viewer renderers + Mail engine in
  `template.html` (trainers 1555-1704, wild 1762-1857, Mail ~2151-2325). Findings: IVs are generated
  and carried in the bundle but never rendered; `wildPokes` assembly is duplicated in `writerDocs.js`
  and `writer.js`; `backend/generator.js` never threaded even `showExactPositions`. Owner answered the
  4 open design questions (recorded above).

## Outcome

<!-- Filled when closing: what shipped, deviations from the plan, follow-ups spawned. -->
