---
id: T-013
title: Move-rating heuristics — two-turn moves w/o Power Herb, Belch w/o Berry, Sticky Web lead order
status: done
type: fix
created: 2026-06-20
updated: 2026-06-20
target-version: 0.1.0
links: []
blocked-by: []
---

# T-013 — Move-rating heuristics (random backlog of observed issues)

## Context

A batch of rating/ordering issues spotted in generated teams. All live in the rater
(`randomizer/rating.js`) and the team-order step (`randomizer/modules/trainerTeamOrder.js`).

Investigation (where each belongs):
- **A. Two-turn / charge moves without enabler.** `rateMoveForAPokemon(move, poke, ability, item, …)`
  already receives the held `item`, and the base `rateMove` applies a flat ×0.5 to
  `EFFECT_TWO_TURNS_ATTACK` and ×0.7 to `EFFECT_SEMI_INVULNERABLE` (Dig/Fly/Dive/Bounce/Phantom
  Force). But it ignores whether the holder can actually skip the charge turn (Power Herb), or whether
  Solar Beam / Solar Blade are in sun.
- **B. Belch without a Berry.** `MOVE_BELCH` (`.effect = EFFECT_BELCH`) requires the holder to have
  eaten a Berry; the rater has no Belch handling at all, so it can be assigned to a berryless mon.
- **C. Sticky Web team order.** Lead ordering is `applyLeadLogic` in
  `randomizer/modules/trainerTeamOrder.js`: Phase 1 leads a Stealth Rock / Toxic Debris setter (90%),
  Phase 2 a Spikes / Toxic Spikes setter (80%). Sticky Web is not considered a lead hazard.

## Plan

### A. Disincentivize two-turn / charge moves without their enabler — `rateMoveForAPokemon`
- For `move.effect ∈ { EFFECT_TWO_TURNS_ATTACK, EFFECT_SEMI_INVULNERABLE }`: apply a heavy extra
  penalty UNLESS `item === 'Power Herb'`. Exception: `MOVE_SOLAR_BEAM` / `MOVE_SOLAR_BLADE` are also
  exempt if the mon sets sun itself (`ability` is `DROUGHT` / `ORICHALCUM_PULSE`). (Teammate-set sun
  isn't visible at this point — known limitation; Power Herb still covers it.)
- "Much less value" → strong multiplier on top of the base (so these are near-last-resort without an
  enabler, but still selectable if nothing better exists).

### B. Disincentivize Belch without a Berry — `rateMoveForAPokemon`
- For `move.effect === 'EFFECT_BELCH'`: if the held `item` is not a Berry (display name ends in
  " Berry"), drop the rating to a near-zero floor so Belch is only ever chosen as a true last resort
  (when the mon has no other usable move) — never on a berryless mon otherwise.

### C. Sticky Web as a lead hazard, below Stealth Rock — `trainerTeamOrder.applyLeadLogic`
- Add a Sticky-Web lead phase BETWEEN the Stealth Rock phase and the Spikes phase, at the same ~90%
  lead chance ("works like Stealth Rock"). Because it runs after the Stealth Rock phase (which returns
  early on success), Stealth Rock keeps priority when a team has both.

## Acceptance criteria
- [x] A two-turn/charge move (e.g. Solar Beam, Fly) rates **much lower** for a mon NOT holding Power
      Herb than the same move/mon holding Power Herb; Solar Beam is exempt in sun. (unit tests.)
- [x] Belch rates near-zero for a berryless holder and normally for a Berry holder (unit test).
- [x] `applyLeadLogic` leads a Sticky Web setter when no Stealth Rock setter leads, and Stealth Rock
      still wins when both are present (unit tests, deterministic rngFn).
- [x] Weather-conditional moves change rating with self/earlier-teammate weather: Solar Beam/Blade,
      Electro Shot, Weather Ball, Growth, Thunder, Blizzard, Aurora Veil; Meteor Beam/Geomancy combo
      with an available Power Herb (unit tests).
- [x] `cd randomizer && npm test` green (464); `node scripts/check-tracker.mjs` green.
- [x] Magnitudes calibrated/confirmed by the user via manual test.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-06-20** — Task created and started. Investigated all three: A/B → `rateMoveForAPokemon`
  (already has `item`/`ability`; base `rateMove` does ×0.5 two-turn / ×0.7 semi-invuln); B → `MOVE_BELCH`
  is `EFFECT_BELCH`; C → `trainerTeamOrder.applyLeadLogic` (Stealth Rock 90% / Spikes 80% phases).
  Tests use behaviour assertions so penalty magnitudes stay user-tunable.
- **2026-06-20** — Implemented all three (TDD red→green).
  - **C** (`trainerTeamOrder.js`): added `isStickyWebSetter` + a Sticky-Web lead phase (90%) BETWEEN
    the Stealth Rock and Spikes phases, so SR keeps priority and Web outranks Spikes. The roll is
    consumed only when a web setter exists, so existing rng sequences are unaffected. +6 tests (24/24).
  - **A** (`rateMoveForAPokemon`): `EFFECT_TWO_TURNS_ATTACK` / `EFFECT_SEMI_INVULNERABLE` → `rating *=
    0.2` unless `item === 'Power Herb'`; Solar Beam/Blade also exempt if the mon has `DROUGHT`/
    `ORICHALCUM_PULSE`.
  - **B** (`rateMoveForAPokemon`): `EFFECT_BELCH` with a non-Berry item → `rating = min(rating, 0.05)`
    (last resort).
  - **Chosen magnitudes (0.2× / 0.05 floor) are provisional** — flagged for user calibration via
    manual test. Tests assert direction/ordering, not the exact numbers, so calibration won't break them.
  - **Verified:** `rateMoveForAPokemon` 35/35, `trainerTeamOrder` 24/24, full suite 452 (the lone
    intermittent failure is the pre-existing unrelated flaky `startersModule` test). check-tracker OK.
  - **Pending user manual test / magnitude calibration before closing.**
- **2026-06-20** — Item A sun refinement (user feedback: observe teammates, incl. Sunny Day; Desolate
  own-only). Decisions: two-pass (full team visibility) + Sunny Day counts only if already-chosen/forced.
  - **Done + tested:** completed OWN sun in `rateMoveForAPokemon` — Drought / Orichalcum Pulse /
    Desolate Land (own-only) / own Sunny Day (currentMoves). Threaded a `teamHasSun` flag through
    `rateMoveForAPokemon` → `chooseMoveset` / `adjustMoveset` (backward-compatible default false).
    Sun only rescues Solar Beam/Blade (not Fly/Dig — those still need Power Herb). +6 unit tests;
    suite 456 green.
  - **Determinism finding (blocks the naive two-pass):** the team build reseeds the RNG PER SLOT
    (`writerDocs.js` L241-244 — the trainer-determinism mechanism), and `rng.js` (mulberry32) exposes
    no state save/restore. A naive species+ability-first reorder would silently change every generated
    team. Plan: add `getState`/`setState` to `rng.js` (sequence-preserving) and capture/restore per-slot
    RNG state across the two passes, so existing outputs stay byte-identical and only teammate-sun
    changes Solar Beam choice. Primary path is `writerDocs.js` (the SSOT — the bundle ROM derives teams
    from docs via `buildTrainersResultsFromDocs`); the `writer.js` standalone loop mirrors it.
  - **Next:** implement the determinism-preserving two-pass (rng state + writerDocs + writer mirror)
    so `teamHasSun` is actually computed/passed. Pending before that part ships.
- **2026-06-20** — Scope decision (user): keep THIS task to the cheap, determinism-safe **partial**
  approach — value moves using only MY set + EARLIER teammates' sets (no two-pass, no RNG changes).
  The full two-pass ("the way that complicates everything") is documented as a future task
  [T-014](T-014-full-team-sun-twopass.md) so the investigation/plan isn't lost.
  - Implemented (no RNG/determinism changes — only reads the existing `team`/`bag` and passes flags):
    - `writerDocs.js` + `writer.js`: compute `teamHasSun` from EARLIER teammates (Drought /
      Orichalcum Pulse, or a Sunny Day already on their set) and `powerHerbAvailable` (held or in the
      trainer's bag); pass both to `chooseMoveset` / `adjustMoveset`.
    - `rateMoveForAPokemon`: **Dig/Fly/etc.** → ×0.2 unless Power Herb HELD (no combo incentive).
      **Solar Beam/Blade** → good only with sun (own Drought/Orichalcum/Desolate-own/own Sunny Day, or
      earlier-teammate sun via `teamHasSun`) or Power Herb held. **Meteor Beam** → ×1.3 combo when a
      Power Herb is available (held or bag), else ×0.2. **Geomancy** → same combo but gated to an
      Ubers+ ("special") mon.
  - Tests: +Meteor Beam combo, +own-sun (Desolate/own Sunny Day), +teamHasSun cases. Suite **458 green**.
  - End-to-end (writerDocs, seed 7): ran clean, 1232 members; Belch-without-berry = **0**; Solar
    Beam/Blade bounded to 14 carriers (only where sun exists). Determinism untouched (no RNG reorder).
  - **Magnitudes (×0.2 penalty, ×1.3 combo) provisional — pending user calibration/manual test.**
- **2026-06-20** — Extended item A to the full weather pattern (user request), same partial scope
  (self + EARLIER teammates; no determinism changes). Refactored the threaded signal into a single
  `ctx = { sun, rain, snow, sand, powerHerb }` object through `rateMoveForAPokemon` / `chooseMoveset`
  / `adjustMoveset`; `writerDocs.js` + `writer.js` build `selCtx` from earlier teammates' weather
  setters (Drought/Drizzle/Sand Stream/Snow Warning + Sunny Day/Rain Dance/Sandstorm/Hail/Snowscape
  on their set; primals Desolate Land / Primordial Sea are own-only, handled in the rater) and Power
  Herb availability (held or bag). Weather flags in the rater = own setter (ability/move) OR ctx.
  - Moves handled: **Electro Shot** (rain → instant, MUY PREMIUM ×3.0; else Meteor-Beam combo ×2.6/×0.2);
    **Solar Beam/Blade** (sun or held Power Herb → ×2.4, else ×0.2); **Meteor Beam** (Power Herb avail →
    ×2.6); **Geomancy** (Power Herb + special/Ubers+ → 9); **Weather Ball** (any weather → 100-BP typed,
    10.5 with STAB else 7); **Growth** (sun → 8 ≈ Swords Dance); **Thunder** (rain → +acc, 100%);
    **Blizzard** (snow → +acc); **Aurora Veil** (snow → exactly 10, else 0); Dig/Fly/etc. unchanged
    (×0.2 unless held Power Herb).
  - Tests: +6 weather-move cases (Electro Shot rain>herb>none, Weather Ball, Thunder, Blizzard, Growth,
    Aurora Veil 0/10). Suite **464 green**. End-to-end writerDocs (seed 7) clean, Belch-no-berry=0,
    weather moves bounded. Determinism untouched (ctx only reads existing team/bag; no RNG reorder).
  - **All magnitudes provisional — pending user calibration/manual test.** Full-team (later teammates +
    organic Sunny Day/weather) remains deferred to [T-014](T-014-full-team-sun-twopass.md).

## Outcome

Shipped a batch of move-rating/ordering heuristics in `randomizer/rating.js`,
`randomizer/modules/trainerTeamOrder.js`, `randomizer/writerDocs.js` and `randomizer/writer.js`,
all user-confirmed via manual test:
- **Sticky Web** is now a lead hazard ranked below Stealth Rock (`applyLeadLogic`).
- **Belch** without a Berry is a last resort (near-zero), never picked on a berryless mon otherwise.
- **Two-turn / charge moves** (Dig/Fly/etc.) are weak unless a Power Herb is held; **Meteor Beam**
  and **Geomancy** (special-only) stimulate a combo when a Power Herb is available (held or in the bag).
- **Weather-conditional moves** scale with weather set by the mon itself or an EARLIER teammate
  (`ctx = { sun, rain, snow, sand, powerHerb }` built in the writers, weather flags = own setter OR
  ctx in the rater): Solar Beam/Blade & **Electro Shot** (premium in rain), **Weather Ball** (100-BP
  typed), **Growth** (sun → Swords Dance tier), **Thunder**/**Blizzard** (100% acc), **Aurora Veil**
  (10 with snow / 0 without). Primals (Desolate Land / Primordial Sea) are own-only.

**Scope decision:** kept to the cheap, determinism-safe **partial** approach (self + earlier
teammates only; `ctx` only reads the already-built `team`/`bag`, no RNG reorder). The full-team
two-pass ("the way that complicates everything") is documented for the future in
[T-014](T-014-full-team-sun-twopass.md) (`proposed`).

**Magnitudes** (×0.2 penalty, ×2.0–3.0 enabler boosts, combo/override values) are intentionally
provisional — easy to retune; tests assert direction, not exact numbers. Suite 464 green; end-to-end
writerDocs spot-check clean (Belch-without-berry = 0). No follow-ups besides T-014.
