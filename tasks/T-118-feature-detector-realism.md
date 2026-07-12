---
id: T-118
title: Feature-detector realism — roles by analysed characteristics, not can-learn potential
status: in-progress
type: feature
created: 2026-07-11
updated: 2026-07-11
target-version: 0.8.0
links: [T-083, T-107, T-117]
priority: high
---

# T-118 — Feature-detector realism

## Context

The T-117 audit revealed the root cause of "teams feel the same": the T-107 feature detectors mark a
role from **"can LEARN the move" (potential)** — and Rain Dance / Light Screen / setup moves are
widely-learnable TMs — so almost every strong endgame mon "fills" ~6 roles at once. Effects: every team
crystallizes into `bulky_offense`; the fill bias has no signal to steer by; spurious gimmick tags fire
on everyone.

**Owner guidance (2026-07-11):**
- Screen setting and hazard setting are **NOT gimmicks** — they are common strategies; don't make them
  rare. But "can learn a screen" is **not enough** to grant the role.
- **We almost never analyse by species.** Mons mutate and their TM movepool is randomised; covering a
  role is a **tendency driven by analysed characteristics** (stats/ability/type), not a species trait.
  A hard species rule is allowed only when a **specific interaction** justifies it (Relic Song ↔
  Meloetta), never stuffed into a heuristic.
- So: detect roles from the **characteristics of the corpus mons that actually fill them**.

## Plan

- **Species-hardcoding audit (done 2026-07-11).** The role-detection engine (`featureDetectors`,
  `archetypeFit`, `archetypePicker`, `archetypeRefine`) is **species-clean**. Other hardcodes are
  justified (Meloetta/Relic Song; Rayquaza-Mega no-stone; Gholdengo/Lycanroc evo quirks). One flagged:
  `utils.js invalidMegas=[Froslass,Kleavor]` — a pre-existing family mega-leakage workaround (siblings
  of Glalie/Scizor); the clean fix is factor-based (per-mon mega ownership), tracked as separate tech
  debt — NOT a role heuristic.
- **Increment 1 (owner-validated direction, done):** `weatherSetter` → **ability only** (Drought /
  Drizzle / Sand Stream / Snow Warning / Orichalcum / primals), dropping the can-learn-a-weather-move
  branch — a Rain Dance learner is not a weather-team identity.
- **Increment 2+ (needs corpus analysis → owner validation before coding):** derive, from
  `docs/research/corpus.json`, the characteristics that distinguish real role-fillers for
  screens / hazards / setup-sweeper / cleric / pivot / redirection — e.g. a screen setter tends to be a
  fast/bulky utility mon, a hazard lead a bulky/defensive lead, a setup sweeper an offensive stat
  profile — so a role reflects the mon's **tendency**, not its full TM list. Present findings for
  validation, then implement. Measure before/after with the T-117 decision log.

> **Meta-analysis validation (owner-gated).** The role-characteristic thresholds are Pokémon-meta
> conclusions — analysed against the corpus and **validated by the owner before implementation**. Only
> the `weatherSetter`→ability direction is pre-validated (owner agreed 2026-07-11).

Acceptance criteria:
- [x] Species-hardcoding audit complete; engine role-detection confirmed species-clean.
- [x] `weatherSetter` detects by ability only (owner-validated).
- [x] Corpus-derived characteristics for the remaining move-based roles, owner-validated, implemented
      (screens/cleric profiles, setupSweeper offense ≥115, winCondition=setupSweeper, one-offensive-
      identity precedence, weak-setup TMs dropped). Recorded in `docs/research/rating-decisions.md` (Batch 4).
- [x] Decision log (T-117) shows realistic role coverage (roles/mon 6 → ~1-3); determinism green.
- [x] `cd randomizer && npm test` green (917).

## Progress log

- **2026-07-11** — Created from the T-117 finding. Did the species-hardcoding audit (engine clean;
  invalidMegas flagged). Implemented increment 1 (weatherSetter → ability only, owner-validated
  direction). Increment 2+ (screens/hazards/setup/etc. characteristics) needs the corpus analysis and
  owner validation — the next step ("seguimos analizando").
- **2026-07-11 — increment 2 done (corpus-validated).** Analysed the singles corpus (284 mapped mons)
  role-by-role vs baseline (speed 84 / offense 119 / bulk 273); owner validated the profiles + the
  "1-2 primary roles" idea (recorded as Batch 4 in `docs/research/rating-decisions.md`). Implemented:
  **screenSetter** (screen move + non-attacker offense ≤95); **cleric** (cleric move + bulky ≥285 &
  low-offense ≤95); **setupSweeper** offense threshold 90→115 + dropped the weak/common setup TMs
  (Work Up/Hone Claws/Curse/Growth/Tidy Up); **winCondition** = setupSweeper (not any wallbreaker);
  **one offensive identity per mon** via precedence setupSweeper > choiceScarfRevengeKiller >
  wallbreaker (mutually exclusive). **Measured (decision log):** roles/mon 6 → ~1-3; teams begin to
  differentiate (balance / hyper_offense / bulky_offense / **none** now appear). Full suite 917 pass;
  `RUN_DETERMINISM=1` gate green. New observations for the next analysis: some strong piles now match
  no archetype ("none") → look at entry conditions; and `regeneratorPivot`'s bulky-recovery-pivot
  branch may still over-fire.
- **2026-07-11 — entry-condition tuning DEFERRED (owner, statistical rigour).** Analysed the archetype
  entry signatures, but the singles corpus has only **12 teams** (buckets of 2-5) — too thin to commit
  per-archetype `min` thresholds. Owner: expand the singles corpus first → **blocked-by T-121**. The
  derived entry proposal (hazards ubiquitous → not an entry feature; bulky_offense as the broad
  offensive default + a more-specific-wins priority; balance = offense+regen backbone; hyper =
  setupSweeper≥2; stall = walls+cleric) is recorded for re-validation on the larger sample. Separately,
  the owner flagged two engine gaps to fine-tune later (not in the current pipeline): role-driven tier
  **downgrade** within budget (**T-119**) and global **type coverage** for unrestricted trainers (**T-120**).

- **2026-07-11 — increment 3: crystallize-by-fit + slot RECIPES (owner-validated on the 62-team corpus).**
  With T-121's corpus (62 singles teams), went team-by-team defining each slot's objective and derived
  the per-archetype **slot recipes** (role · min/max/weight); owner validated the recipes + the model
  ("archetype = slot recipe on a defensive↔offensive spectrum + a gimmick engine, crystallise by
  structural fit"). Implemented: rewrote `data/archetypes/singles.json` `structure` as the recipes
  (balance = regen backbone + hazard game + wincon; bulky_offense = broad offensive default; hyper =
  2+ setup sweepers + hazard lead; stall = walls + unaware + cleric; gimmicks weather/screens/trick_room
  by engine); retired `focusSashLead` and the boolean `entry` fields (now OPTIONAL in the loader). Added
  `recipeFit` (weighted satisfaction of a recipe's REQUIRED roles; optional roles a small bonus) and
  switched `crystallize` to rank bases/gimmicks by fit; `resolveIdentity` now emerges on best fit ≥
  `IDENTITY_FIT` (0.5) and stacks gimmicks ≥ `GIMMICK_FIT` (0.6). Updated the fit/picker/refine/audit
  unit tests to recipe-satisfying teams. **Measured (decision log):** endgame teams now crystallise into
  DISTINCT, correct archetypes (balance / hyper_offense / bulky_offense / hyper_offense+trick_room) — the
  "everything = bulky_offense goodstuffs" collapse is gone. Full suite **921 pass**; `RUN_DETERMINISM=1`
  gate green (per-slot determinism preserved). Recorded as Batch 4 (recipes) in `rating-decisions.md`.

- **2026-07-11 — increment 4: gimmick over-stacking (from the full-game audit distribution).** The
  A-track sanity-check (audit over a whole 193-team generation) showed the singles engine HEALTHY
  (variety present; NONE 39%→13%→2%→0% as soph rises; no single-archetype collapse) but flagged
  gimmicks over-stacking: 73% of endgame teams carried a gimmick, some 2-3 incoherent at once
  (screens+trick_room+weather). Fix (owner-directed, incremental): (1) **cap emergent gimmicks to the
  single best-fitting engine** in `resolveIdentity` (seeds pass through uncapped) — killed the
  incoherent multi-stacks; (2) raised `GIMMICK_FIT` 0.6→0.7 (no effect) →0.8 (mid-tier gimmick rate
  61%→44%). **Finding:** the threshold cannot reduce the late/endgame rate (stuck ~73%) because those
  gimmicks fire at fit ~1.0 — almost all `+screens` on hyper teams, since `screenSetter` still detects
  by can-LEARN potential and every hyper team has 2+ setup sweepers (fully satisfying the screens
  recipe). That residual is deferred to the joint problem-2 analysis (archetype distribution / screens
  = a hyper sub-flavor vs a standalone gimmick). Suite 921 pass; the cap is output-affecting at high
  soph (determinism preserved — pure fn of the reseeded state).

## Outcome

<!-- Filled when closing. -->
