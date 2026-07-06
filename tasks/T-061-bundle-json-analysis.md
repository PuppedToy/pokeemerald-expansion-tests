---
id: T-061
title: Analyze bundle.json and spawn per-issue tasks
status: done            # proposed | in-progress | done | abandoned
type: chore             # feature | fix | refactor | docs | chore
created: 2026-07-06
updated: 2026-07-06
target-version: 0.6.0
links: [T-062, T-063, T-064, T-065, T-066, T-067]
blocked-by: []
---

# T-061 — Analyze bundle.json and spawn per-issue tasks

## Context

Meta / investigation task. Analyze `tasks/assets/T-061/bundle.json` (a full randomizer session output: 6 ROMs, `runType: soullink`, `difficulty: 7`) against 5 reported issues, then spawn one self-contained follow-up task per issue so each fix can be implemented independently later. This task closes once all follow-up tasks exist.

The 5 issues to investigate (from the user):

1. **Mega type mutation → base-form STAB gap.** When the randomizer mutates/adds a type to a *mega* evolution but not to its base form (e.g. Garchomp Dragon/Ground → Mega Garchomp Dragon/Steel; Aggron Steel/Rock → Mega Aggron Steel/Fighting), it alters the *mega's* learnset — which is meaningless (a mega can't learn moves; it evolves in-battle). The base form never gains the new-type STAB. Fix: when a mega mutates/gains a type its base lacks, guarantee the **base form** learns AT LEAST ONE damaging move of that type (2nd/3rd with decreasing probability, like elsewhere), as **extra** moves (not replacements), so the mega can use proper STAB.

2. **Multi-form species not limited to 1 encounter per run per family.** rom-0 yields a Pumpkaboo-Super (Route 106) AND a Pumpkaboo-Average (Brawly reward). All alternate forms of the same species family (Pumpkaboo, Shellos, Deerling, etc.) should be limited to 1 encounter per run per family. Investigate which cases aren't limited and why (is it the Brawly-reward path specifically?) and fix.

3. **Meloetta-Pirouette leaking as an obtainable mon.** rom-0 has a Meloetta-Pirouette wild encounter. Pirouette is a battle-only form; Meloetta should always be base Meloetta. Fix: Pirouette must NEVER appear (wild/reward/trainer/anything), but must be accounted for: (a) tiering uses the weighted average of Meloetta and Meloetta-Pirouette (0.55 base / 0.45 Pirouette); (b) trainer movesets always pick base Meloetta and strongly prioritize Relic Song (scaled by SpA etc., with a high priority boost when the user is Meloetta).

4. **Weather-setter fallback picks wrong ability.** rom-0 grunt (museum) uses Qwilfish-Hisui with Intimidate; it should be a Drizzle mon, and since no Drizzle mon of the tier exists it falls back to a rain-dancer with a rain ability — but picked Intimidate instead of Swift Swim. Find why and fix. Check the same for Drought / Sand / Snow and fix all at once: the fallback must not pick an ability ignoring that the slot was a weather setter — it must pick the correct weather-abuser ability.

5. **Evo-level delay by stage-2 power tier.** Base games evolve 3-stage lines into strong mons (e.g. Salamence) later. We already evolve earlier when stage-0 is weak. Add an EXTRA stage0→stage1 delay when the final stage-2 is strong: OU (light, +0.01–0.1), Uber (0.11–0.2), Legendary (0.21–0.3), AG (0.31–0.5). Always guarantee at least 2 levels between stage0→1 and stage1→2. Review branching evolutions carefully (more confusing there).

## Plan

For each issue: investigate methodically against BOTH the bundle and the code, find the root cause + relevant `file:line` refs, then create a self-contained follow-up task (`tasks/T-NNN-*.md`) carrying all context needed to implement it later. Surface any genuine decisions to the user before finalizing a task.

Acceptance criteria:
- [x] Issue 1 investigated → **T-062** created
- [x] Issue 2 investigated → **T-063** created
- [x] Issue 3 investigated → **T-064** created (+ **T-067** spun off for other battle-only forms)
- [x] Issue 4 investigated → **T-065** created
- [x] Issue 5 investigated → **T-066** created
- [x] Open questions raised with the user where needed (3 scope decisions resolved)

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-06** — Task created. Awaiting the user's specification of the bundle, the analysis questions, and the deliverable.
- **2026-07-06** — User specified the bundle (`tasks/assets/T-061/bundle.json`) and 5 issues (see Context). Set to in-progress. Starting methodical per-issue investigation against bundle + code.
- **2026-07-06** — Ran 5 parallel read-only investigations against bundle + code. All 5 follow-up tasks created:
  - **T-062** (issue 1) — Mega STAB gap. Found it's worse than reported: the mega's learnset is *discarded at write* (all 50 megas share the base's array), so 7 megas have no STAB of their new type (Steelix/Poison, Pinsir/Flying, Tyranitar/Water, Sceptile/Dragon, Aggron/Fighting, Latias/Flying, Garchomp/Steel).
  - **T-063** (issue 2) — Multi-form dedup. TWO independent defects: (A) `getFamilyGroup` (`utils.js:13-21`) only collapses Deerling; (B) the wild loop (`wildModule.js:560-575`) dedups by raw family. 29 collisions across 6 ROMs (6 cosmetic, 1 ANTIQUE, 22 regional).
  - **T-064** (issue 3) — Meloetta-Pirouette leak. Root cause: Pirouette missing from `BANNED_SPECIES_FOR_PICKING` (`wildModule.js:35-52`). + weighted-tier blend (9d hook in `pokedexModule.js`) + Relic Song force in `chooseMoveset`. Found 4 more battle-only forms with the same gap.
  - **T-065** (issue 4) — Weather-fallback ability. Root cause pinned: `writerDocs.js:322` uses `trainerMonDefinition.abilities` instead of `effectiveDef.abilities` (live resolver; SSOT divergence with the correct-but-dead `writer.js:656-657`). 3 mispicks (Qwilfish-Hisui/rain, Boldore/sand, Scrafty/sun). One fix covers rain/sun/sand/snow.
  - **T-066** (issue 5) — Evo delay by final tier. `bestEvoTier` already exists; per-branch `.evolutions[]` lookup needed for branching (Wurmple); ≥2-level safeguard is real (many stage1→2 pinned at max 65). Affected: OU 28, UBERS 3, LEGEND 3, AG 0 lines.
- **2026-07-06** — Each task carries an "Open decisions" section with recommendations. Raised the 3 scope-defining decisions with the user.
- **2026-07-06** — User resolved the 3 scope decisions: (1) T-063 = cosmetic forms only (regional forms stay separate); (2) T-064 = Meloetta only, other battle-only forms spun off to **T-067**; (3) T-062 = randomizer-mutated mega types only (canonical typings out). Folded into the respective tasks. All follow-ups exist → closing this meta task per the user's standing go-ahead.

## Outcome

Investigation complete. All 5 reported issues analyzed methodically against the bundle (`tasks/assets/T-061/bundle.json`) and the randomizer code via 5 parallel read-only investigations, each yielding a root-cause dossier with `file:line` refs, bundle evidence, a fix approach and a TDD test plan. Six self-contained follow-up tasks were spawned:

- **T-062** — Guarantee base form learns STAB of a mega's mutated type (issue 1). Key finding: the mega's learnset is *discarded at write* (all 50 megas share the base array), so 7 megas had no STAB of their new type; scoped by the user to the 5 **mutated-type** cases (Steelix, Tyranitar, Aggron, Latias, Garchomp).
- **T-063** — Limit multi-form families to one obtainable per run (issue 2). Two independent defects (`getFamilyGroup` doesn't collapse cosmetic forms; wild loop dedups by raw family). Scoped to **cosmetic forms only** (6 collisions); regional forms stay separate.
- **T-064** — Never place Meloetta-Pirouette; blend its tier (0.55/0.45) and force Relic Song (issue 3). Root cause: Pirouette missing from `BANNED_SPECIES_FOR_PICKING`. **Meloetta-only** per user.
- **T-065** — Weather-archetype fallback must keep the weather ability (issue 4). Root cause pinned to `writerDocs.js:322` using `trainerMonDefinition.abilities` instead of `effectiveDef.abilities` (live resolver; SSOT divergence with the correct-but-dead `writer.js`). One fix covers rain/sun/sand/snow.
- **T-066** — Delay stage0→1 evolution by the final stage-2 power tier (issue 5). Uses existing `bestEvoTier`; needs per-branch `.evolutions[]` lookup + a ≥2-level gap safeguard.
- **T-067** — Exclude the remaining battle-only forms (Zacian/Zamazenta-Crowned, Eternatus-Eternamax, Terapagos-Terastal); spun off from T-064's finding per user decision.

Deviation from plan: the plan assumed one task per issue (5); a 6th (T-067) was spawned when investigation of issue 3 surfaced four additional battle-only forms sharing the same leak gap, and the user chose to handle them separately. No code changed in this task (investigation/meta only) — implementation happens in the follow-ups.
