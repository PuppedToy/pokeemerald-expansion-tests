# Rating & meta decisions — owner-validated conclusions

This is the **SSOT for owner-validated meta conclusions**. The meta-analysis validation clause on the
Group 2 tasks (T-094/095/096/097/100/101/102/103/107/109/111/114) points here: only conclusions marked
**VALIDATED** are cleared for implementation. Research references live in the sibling `docs/research/`
files; this file records what we *decided*, not what the corpus *says*.

Legend: **VALIDATED** (owner-approved, implement) · **OPEN** (needs an owner decision) · **REJECTED**.

## Batch 1 — the 6v6-vs-4v4 lens (source: `6v6-vs-4v4-doubles.md`)

**VALIDATED — owner, 2026-07-10.** Our game is **6v6 doubles**, so we filter 4v4-specific VGC
conclusions. Validated take for our game:

- **Hazards are NOT dead in 6v6.** Stealth Rock + removal (Defog/Rapid Spin) have real, "singles-lite"
  value because 6v6 has frequent switching. Do **not** down-weight hazards for doubles. (Corrects the
  `rating-gaps.md` "hazards over-valued in doubles" finding, which was 4v4-biased.)
- **Switching/pivoting is first-class.** U-turn/Volt Switch, Intimidate re-application, Regenerator,
  trapping and hazards all gain value in 6v6. The engine/AI should reward momentum cores.
- **Reward depth & redundancy, not tight 4-mon packages.** Multiple independent closers, backup
  speed-control / Trick-Room setters, and dedicated support-only mons are correct in 6v6. (Foundational
  for the 2C teambuilding redesign — matches the "rules/preferences, not fixed slots" vision.)
- **Speed control is the backbone**, valued **redundant** (two layers) + **Choice Scarf revenge-killers**
  + multi-setter Trick Room.
- **Regenerator / bulky pivots are premium** in 6v6 (heal-on-switch scales with game length).
- **Weather is a full archetype:** duration rocks (Smooth/Damp), weather-Speed abilities (Swift Swim/
  Sand Rush) as speed control, protect/re-establish the setter.
- **Redirection** stays strong but **not as mandatory** as 4v4; ensure counterplay (Sub/spread/Taunt/
  switch).
- **Intimidate + Fake Out** cornerstones in both; **Intimidate + U-turn** (re-apply) especially strong.
- **Spread moves + Wide/Quick Guard**: a dedicated Wide Guard user is durable, repeatable support;
  model spread friendly-fire correctly.
- **Protect** is a staple but **not universal**; value Wide Guard/Sub/redirection as alternatives and
  allow AV/Choice sets without Protect.
- **Items:** longevity (Leftovers/AV/Eviolite) + Choice Scarf + weather-duration rocks gain value in
  6v6, alongside the VGC Sash/berry/Life Orb.
- **Attrition & sacking** matter: value recovery, chip, late-game win conditions.

## Batch 2 — the 17 rating gaps (source: `rating-gaps.md`)

**VALIDATED — owner, 2026-07-10.** Verdicts, filtered through the 6v6 lens:

**Implemented now** (doubles-only floors in `DOUBLES_SUPPORT_RATINGS`, i.e. `rateMoveDoubles` only —
singles untouched): **Taunt** 6.5 (doubles floor; singles base 5 untouched) · **Snarl/Fake Tears** 6,
**Struggle Bug** 5.5 (spread offensive stat-drop = doubles support, not a penalty) · **Icy Wind** 6 /
**Electroweb** 5.5 / **Bulldoze** 5 (spread speed control) · **Perish Song** 5.5.

**Verified already-handled (no change needed):**
- **Fake Out** — `rateMove` already scores it ~8.86 (first-turn bonus); the "under-rated" gap was
  wrong. No floor added.
- **Priority / Regenerator / Unaware / Disguise / Triage abilities** — their `aiRating` is already high
  (Prankster 8, Regenerator 8, Disguise 8, Triage 7, Gale Wings 6, Unaware 6), so an ability-level
  doubles floor is a no-op. The real gap is how they feed the *Pokémon* tier + combos → T-097
  (`ratePokemonDoubles`) / `computeComboBonus`, not an ability floor.

**Rejected / already decided:** hazards "dead in doubles" (rejected — Batch 1: meaningful in 6v6);
Aurora Veil (not a bug — see Open decisions).

**Deferred — singles-affecting (own pass + regression test + separate owner OK on the exact values):**
- **Taunt base raise + fast/Prankster bonus** (only the doubles floor is done now).
- **Terrain-surge combos / cap** (`computeComboBonus`/`ratePokemon`; relevant to singles too).
- **Contrary + self-lowering STAB** (invert the self-drop penalty; resolve the flagged `rating.js` TODO) — inherently shared/singles.

**Deferred to their phase:** Trick-Room speed inversion · weather-pairing (setter+abuser) · spread-move
full multiplier when the ally is immune → **T-097** tiers. Context-aware item rating (AV/WP/Sash/Choice)
→ **2C** (item-selection consumption). Trapping abilities → tied to the Shadow Tag open decision.

## Batch 3 — archetype model (source: `team-archetypes.md`)

**VALIDATED — owner, 2026-07-10.**

- **Taxonomy validated.** The base archetype is exactly one of **Balanced · Offensive · Defensive**.
  The 13 corpus archetypes map onto these (Bulky/Hyper Offense → Offensive; Balance / Dual-Mode
  Goodstuffs → Balanced; Full Stall → Defensive). No additions/removals (owner: "todo bien").
- **Gimmick model (owner-delegated decision, decided from the corpus).** Gimmicks (weather, terrain,
  Trick Room, redirection, trapping, screens/field-control, ability-swap) are **NOT separate top-level
  archetypes** — they are a **separate layer of weighted tags** on top of the base archetype:
  - A team carries **zero, one, or several** gimmick tags. The corpus shows both archetype+gimmick and
    **multi-gimmick** teams (Dual-Mode Goodstuffs = Tailwind + Trick Room; Gothitelle Rain = weather +
    trapping; the Aqua grunt = offensive base + a light weather preference).
  - Each gimmick has a **commitment weight** on a spectrum: **supporting/extra** (a light preference,
    e.g. a Tailwind bolted onto an offense) ↔ **committed/defining** (the gimmick dictates structure —
    hard Trick Room wants slow abusers, rain wants Swift Swim + Water spam — and is effectively the
    team's identity).
  - So "is a gimmick an extra or a whole archetype?" → **the same mechanism**; "whole archetype" is
    just high commitment. This is the soft-preference model: the sophistication curve (2C) scales how
    hard the generator commits to the gimmick; nothing is forced.
- **Trapping / Perish Trap (Shadow Tag) — ALLOWED** as a valid gimmick (owner). Whether such a team
  pushes its rating toward Uber is a **move/Pokémon rating** concern (handled when we rate those), not
  a reason to exclude the strategy.

Implication for T-101/T-102: model each format's archetypes as
`{ base: balanced|offensive|defensive, gimmicks: [{ tag, commitmentWeight, structure }] }` with **entry
conditions** (what makes a team eligible for / prefer a gimmick — e.g. "a weather setter is available",
"the lead can set Trick Room") and a **preferred structure**, expressed as soft preferences, not slots.

## Open decisions

- **RESOLVED (owner, 2026-07-10) — Trapping (Shadow Tag / Arena Trap): ALLOWED** as a valid gimmick
  archetype for trainers (see Batch 3). Any Uber-pushing effect is handled by the move/Pokémon rating,
  not by excluding the strategy.
- **OPEN — Aurora Veil.** Its `statusList` 0 is **correct** (combo-dependent: needs snow). Model its
  value via a **snow-combo bonus** (like weather abusers), not a base rating — future work, not a bug.
