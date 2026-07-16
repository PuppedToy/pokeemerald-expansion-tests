---
id: T-135
title: Weather abuser QUALITY — prefer real ability-abusers at high sophistication
status: done
type: feature
created: 2026-07-14
updated: 2026-07-14
target-version: 0.8.0
links: [T-132]
blocked-by: []
---

# T-135 — Weather abuser quality

## Context

Owner review (2026-07-14) of Tabitha Mossdeep (abuse-only sun): its abuser slots were plain Fire-types
(Iron Moth, Armarouge) instead of mons with strong sun abilities (Chlorophyll / Solar Power / Protosynthesis).
At endgame sophistication (0.73) there's no excuse to not field real ability-abusers for the abuser slots.

Root causes (verified in code):
1. **Protosynthesis missing** from `WEATHER_ABUSER_BY_SUBTYPE.sun` (`['CHLOROPHYLL','SOLAR_POWER']`), so a
   Protosynthesis mon never gets the +3 ability bonus in `weatherAbuseScore`.
2. **The picker's reliable-abuser hard-restrict weights by ARCHETYPE FIT, not abuse quality** — every mon
   with score ≥ threshold is equal, so a +2 type-only Fire-type beats a +3/+5 Chlorophyll mon on fit.
3. **Log bug:** an abuse-only tag partner (Tabitha Mossdeep) that legitimately abuses its ally's weather
   (no setter of its own) is mislabelled "gimmick dropped — setter not delivered" by teamAudit.

## Plan (pending owner validation of weights)

1. Add the missing sun ability-abusers to `WEATHER_ABUSER_BY_SUBTYPE.sun` (at least PROTOSYNTHESIS; review
   FLOWER_GIFT). Keep the score's meaning (an ability-abuser = the +3 "queen" bonus).
2. **Rank reliable abusers by abuse SCORE, scaled by sophistication** — within the hard-restrict, weight by
   the `weatherAbuseScore` (so +5/+3 ability-abusers strongly beat +2 type-only), the pull growing with
   soph. Early game unchanged (low soph → weak pull, still "a pile of mons").
3. Fix the abuse-only audit label: thread `abuseOnly` into `gimmickMaterialised`/`weatherHolds` so an
   ally-following partner reads as "abusing <ally>'s weather", not dropped.

Acceptance criteria:
- [x] At high soph, weather abuser slots prefer real ability-abusers (Chlorophyll/Solar Power/Protosynthesis)
      over plain boosted-type mons when available in the pool.
- [x] A Protosynthesis mon counts as a strong sun abuser.
- [x] Tabitha Mossdeep's log shows it abusing Maxie's weather (not "dropped").
- [x] Deterministic; `cd randomizer && npm test` + determinism/continuity gates green.

## Progress log

- **2026-07-14** — Task created from owner review; root causes 1–3 verified in code. Awaiting sign-off on
  the weighting approach before coding.
- **2026-07-14** — Owner confirmed **Path 1** (detailed conditional rating + soph pull to the top). Implemented:
  - Added `PROTOSYNTHESIS` to `WEATHER_ABUSER_BY_SUBTYPE.sun` (now Chlorophyll/Solar Power/Protosynthesis).
  - **`weatherAbuseRating(mon, subtype)`** (gimmickPlan) — models each ability by the stat it exploits
    (Chlorophyll ∝ offence, Solar Power ∝ speed×SpA, Protosynthesis ∝ best stat, Sand Force ∝ offence), a
    flat **abilityFloor** so a real ability-abuser always beats a plain boosted-STAB attacker, plus
    boosted-STAB/DEF-type, synergy-move (extra when STAB, e.g. a Grass mon's Solar Beam), and a slice of the
    base rating. All weights in `weatherConstants.WX_ABUSE_RATING` (tunable).
  - **Picker** ranks the eligible reliable abusers by that rating with a **sophistication-sharpened** curve:
    `weight = (rating/max)^(soph × rankSharpness)` — endgame → top-rated abusers dominate; early game → near
    uniform. One rng draw → per-slot determinism intact.
  - **Log fix:** threaded `abuseOnly` into teamAudit → a tag partner (Tabitha Mossdeep) abusing its ally's
    weather now reads "+weather", not "gimmick dropped — setter not delivered".
  - **Verified** (seed 2920625670): Maxie Mossdeep OU slot → Leavanny (Chlorophyll); Tabitha Mossdeep OU slot
    → Sandy Shocks (Protosynthesis), log shows +weather. Maxie Chimney → Deerling (Chlorophyll). `npm test`
    1027; determinism + continuity gates 17/17.
  - KNOWN: Tabitha Mossdeep's UU slot still took a Fire-type (Pyroar) — likely that slot's candidate pool;
    to inspect after the owner's re-test. Tuning knobs isolated: `WX_ABUSE_RATING.*`, `rankSharpness`.
- **2026-07-14 (cont.) — auditability (owner request before regenerating).** The decision log now shows,
  per abuser slot: the number of ELIGIBLE abusers, the top few ranked by the weather-abuse rating with the
  ITEMISED score breakdown (base / ability / ability-floor / STAB / bulk / synergy / solar-STAB), the
  soph-pull exponent, and the PICKED mon marked (with its rank if it fell below the shown top). Wiring:
  `weatherAbuseBreakdown` (gimmickPlan) exposes the parts; the picker records each abuser slot's ranking on
  `context.weatherPicks`; teamAudit stores it and renders it (filtered to picks that landed on the final
  team, de-duped). npm test 1027; gates 17/17.
  - **The log immediately surfaced the tuning gap the owner suspected:** e.g. Tabitha Mossdeep sun pick #1 —
    16 eligible, top = Sawsbuck Spring 17.11 (Chlorophyll), but **#7 Sandy Shocks 11.04 ‹picked›**. The
    soph-pull (exp ~7.3) still lets a mid-ranked abuser win when ~16-36 are eligible. Candidate fix for the
    "miramos" pass: raise `rankSharpness`, or restrict the weighted draw to the top-K by rating. Deferred to
    the owner's review.
- **2026-07-14 (cont.) — owner: "Maxie doesn't use the list".** Root cause: Maxie's FAVOURITE (Camerupt) +
  SETTER (Torkoal) both count as abusers, so the team hit "2 abusers" before the ranked hard-restrict ever
  fired → its free slots were soft-biased (no ranking, no list). Fix: the ranked-abuser budget now counts
  only DEDICATED abusers — the forced favourite (`newTeamMember.__favourite`) and the setter are excluded —
  so every weather trainer ranks its 2 free abuser slots (and logs them), favourite/setter or not. Now Maxie
  Chimney picks Deerling Spring + Tangela (Chlorophyll) for its free slots, ranking shown. npm test 1027;
  determinism + continuity gates 17/17.

## Outcome

Shipped the detailed weather-abuse rating (Path 1): each abuser ability modelled by the stat it scales
(Chlorophyll ∝ offence, Solar Power ∝ speed×SpA, Protosynthesis/Quark-Drive ∝ best stat, speed-mult ∝
offence) + a flat ability-floor so a real ability-abuser outranks a plain boosted-STAB attacker, plus
boosted-STAB/DEF-type, synergy-move, and a slice of base rating (weights in `WX_ABUSE_RATING`). The picker
ranks eligible abusers with a sophistication-sharpened curve `(rating/max)^(soph×rankSharpness)`, and the
decision log surfaces the full ranking + itemised breakdown + soph-pull + the picked rank. Protosynthesis
added to the sun abusers; the abuse-only tag-partner log fix (Tabitha reads "+weather"). The ranked-abuser
budget counts only DEDICATED abusers (excludes the favourite ace + setter) so every weather trainer ranks its
free slots. Owner green-lit the close 2026-07-14 (the mid-ranked-pick soph-pull is acceptable as-is; the
knobs `WX_ABUSE_RATING.rankSharpness` / a top-K restriction remain available if ever wanted).

The rating/ranking + audit machinery this task built was the reusable base that T-137 generalized to electric
terrain and Trick Room. `npm test` green; determinism + continuity gates 17/17.
