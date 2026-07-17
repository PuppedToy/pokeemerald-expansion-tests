# ADR-018: Mixed-format refinements — grunt "gauntlets" count as one unit, and an optional sequential (first-half singles / second-half doubles) split

- **Status:** accepted
- **Date:** 2026-07-17
- **Task:** T-145, T-146
- **Refines:** [ADR-014](ADR-014-battle-format-representation.md) (battle-format representation & per-trainer `battleType`)

## Context

Owner request (2026-07-17), two refinements to the `mixed` battle format defined in ADR-014:

1. The multi-grunt "gauntlets" — the **2 Slateport Museum grunts** (`TRAINER_GRUNT_MUSEUM_1/_2`) and the
   **3 Mossdeep Space Center grunts** (`TRAINER_GRUNT_SPACE_CENTER_5/_6/_7`) — are, narratively, one
   back-to-back fight, but ADR-014 counts each `isBoss` grunt independently in the `bossTrainers` pool's
   singles/doubles proportion. They should count as **one unit** for the mixed proportion and **share one
   singles/doubles decision**, and carry their own **"Gauntlet Battle N"** display tag in every format.

2. A new opt-in mixed sub-mode: instead of interleaving singles/doubles across the game, make the **first
   part of the game singles and the rest doubles**, with the switch happening at a **boss** whose position
   is derived from the singles %.

## Decision

### 1. Gauntlet grouping (T-145)

- `GAUNTLET_GROUPS` (battleFormat.js) names each gauntlet and its member ids, in progression order:
  `Gauntlet Battle 1` = the 2 Museum grunts; `Gauntlet Battle 2` = the 3 Space Center grunts.
- **Display tag.** Every member gains `trainer.gauntletTag = 'Gauntlet Battle N'`, stamped in all formats
  (singles/doubles/mixed) and surfaced as an **additional** viewer badge — orthogonal to `battleType`
  (a gauntlet member is still a normal singles/doubles battle mechanically; the ROM writer is unchanged).
- **Proportional accounting (mixed only).** In the proportional `mixed` assignment, each gauntlet collapses
  to **one unit** within the `bossTrainers` pool: it consumes one slot of the singles/doubles proportion,
  and the chosen type is **broadcast to all its members** (grunt 1 singles ⟹ grunt 2 singles). In `singles`
  / `doubles` runs every member is the same type anyway, so sharing is a no-op there.

### 2. Sequential split sub-mode (T-146)

- New config `mixedSequentialSplit: boolean` (default `false`), only meaningful when `battleFormat==='mixed'`.
  Off → the ADR-014 interleaved proportional assignment (unchanged). On → the sequential split below.
- **Boss spine & breakpoint.** Order the canonical progression **boss milestones** — the `bossCaps`
  `BOSS_CAP_TRAINERS` map, which already collapses rival gender×starter variants and multi-grunt gauntlets
  to one milestone each — by each milestone's representative `displayOrder`. `numBosses` = milestone count
  (**excluding the four Elite-Four milestones when Run & Bun is on**, since RB governs them). The breakpoint
  is the milestone at index `singlesCount = round(singlesFraction × numBosses)`: milestones before it are
  the singles half, that milestone and everything after are the doubles half.
- **Per-trainer assignment.** Every trainer with `displayOrder < breakpointOrder` → `singles`, else
  `doubles` (subject to the ADR-014 ≥2-mon eligibility gate). `breakpointOrder` = the breakpoint milestone
  representative's `displayOrder` (or +∞ at 100% singles → all singles). Gauntlet members are adjacent, so
  they land on the same side automatically (no special grouping needed here).
- **Champion.** Follows its sequential position (it is the last fight → doubles unless 100% singles). The
  ADR-014 "majority type" rule for the champion does **not** apply in this sub-mode.
- **Tate & Liza.** No forced-doubles priority in this sub-mode (the ADR-014 rule-8 "T&L first in the gym
  pool" ordering is proportional-only); T&L follows its sequential position like any boss.
- **Run & Bun coexistence.** `mixedSequentialSplit` and `leagueRunAndBun` may both be on. The four E4 keep
  their RB treatment (base singles + `_DOUBLES` clones + in-game choice) and are excluded from the
  sequential split and from `numBosses`. The tag battle (Mossdeep trio) stays `tag` as always.

## Consequences

- `assignBattleTypes` gains a sequential branch and a gauntlet-unit collapse; it now needs each trainer's
  `displayOrder` (already stamped by `hoistAuthoritativeAppearances`) — `trainersModule` passes it in.
- One new bundle/docs field (`gauntletTag`) + one new config field (`mixedSequentialSplit`), both additive.
- The viewer shows a "Gauntlet Battle N" badge; no ROM/writer change (gauntlet is display + accounting only).
- Determinism preserved: the sequential split is a pure function of `singlesPercent` + `displayOrder` (no
  RNG); the proportional gauntlet collapse reuses the existing seeded shuffle over units.
