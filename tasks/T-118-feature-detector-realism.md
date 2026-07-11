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
- [ ] Corpus-derived characteristics for the remaining move-based roles, owner-validated, implemented.
- [ ] Decision log (T-117) shows realistic role coverage (no mon filling ~6 roles); determinism green.
- [ ] `cd randomizer && npm test` green.

## Progress log

- **2026-07-11** — Created from the T-117 finding. Did the species-hardcoding audit (engine clean;
  invalidMegas flagged). Implemented increment 1 (weatherSetter → ability only, owner-validated
  direction). Increment 2+ (screens/hazards/setup/etc. characteristics) needs the corpus analysis and
  owner validation — the next step ("seguimos analizando").

## Outcome

<!-- Filled when closing. -->
