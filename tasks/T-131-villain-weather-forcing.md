---
id: T-131
title: Villain weather-forcing (per-team weather → general-weather fallback) + auditability
status: proposed
type: feature
created: 2026-07-13
updated: 2026-07-13
target-version: 0.8.0
links: [T-124, T-125, T-130, T-132]
blocked-by: [T-130]
---

# T-131 — Villain weather-forcing, and see WHY it does / doesn't happen

## Context

Review feedback on `tasks/assets/T-128/run-2585940843`. Several villain teams are meant to force a
specific weather (with a general-weather fallback when the specific one can't be built), but it's unclear
whether it's implemented and why weather often fails to appear. The old hardcoded weather-setter slots
were removed in T-128 (the T-124/T-125 seed system is supposed to drive weather now), so this needs
verifying end-to-end and — critically — making auditable in the decision log (depends on T-130).

Intended per-team weather (each falls back to "any weather" if its specific one can't be built):
- Aqua grunt museum 1 → **rain**
- Aqua grunt museum 2 → **snow**
- Tabitha → **sandstorm**
- Maxie → **sun**
- Matt → **snow**
- Archie → **rain**

## Plan

- Confirm whether the weather seed (T-124/T-125) actually targets these specific weathers per villain and
  falls back to general weather; wire it if missing.
- Make the decision log explain, per team: which weather was requested, whether a setter + abuser(s) were
  found, and if not, why it fell back / dropped (needs T-130's audit hooks).
- Verify against a fresh bundle that each villain gets its weather (or a logged, understood fallback).

Acceptance criteria:
- [ ] Each listed villain requests its specific weather with a documented general-weather fallback.
- [ ] The decision log shows the requested weather, the setter/abuser outcome, and the fallback/drop reason.
- [ ] A run demonstrates the weather materialising (or a clearly-logged reason it can't).
- [ ] `cd randomizer && npm test` green.

## Progress log

### 2026-07-13 — subtypes corrected + ability-level fallback; picker bottleneck found
- Fixed the weather subtypes in `trainerSeeds.js` to the owner's spec: Museum grunt 1 → rain, Museum
  grunt 2 → snow, Archie → rain, **Matt → snow (added; wasn't seeded)**, Maxie (all) → sun, Tabitha (all)
  → **sandstorm** (was sun). Added `WEATHER_SNOW`/`WEATHER_SAND` (subtypes already map to SNOW_WARNING /
  SAND_STREAM setters + Slush Rush / Sand Rush abusers in archetypeRefine).
- Added the **general-weather fallback** in `planMemberAbility` (T-131): when a themed setter can't be
  fielded by a mon and no weather is up yet, it establishes ANY weather the mon can set (better some
  weather than none). Tests added (`planMemberAbility.test.js`). Suite 968.
- **But the audit (T-130) shows most villains still DROP weather** (Museum 1/2, Matt, Tabitha) —
  Archie/Maxie get it only because a setter arrives as their favourite/ace. Root cause CONFIRMED: the
  archetype PICKER selects **zero weather-setter-capable mons** for the type-restricted villains, so there
  is no setter for the ability step (or the fallback) to work with.
- **Remaining work (picker-level):** make the archetype picker PREFER a weather-setter-capable mon (within
  the trainer's type restriction) for weather-seeded trainers, so the `weatherSetter` role is actually
  filled. This is an archetype-fit change → per the analysis-first rule, validate the approach with the
  owner before coding. Options to weigh: (a) boost the weatherSetter role's fit weight when weather is
  seeded; (b) hard-require one setter slot for weather-seeded trainers; (c) accept the themed drop when the
  type pool has no setter and only guarantee weather when a setter type is in-theme.

## Outcome
