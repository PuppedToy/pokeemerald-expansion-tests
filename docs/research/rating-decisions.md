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

## Batch 4 — feature-detector role characteristics (source: corpus role/moveset analysis, T-118)

**VALIDATED — owner, 2026-07-11.** The T-117 audit showed the T-107 detectors marked a role from
"can LEARN the move" (a widely-learnable TM) → almost every strong mon "filled" ~6 roles → everything
crystallised to `bulky_offense`. Fix: a role is a **tendency from analysed characteristics** (never a
species). Singles corpus baseline: speed 84, offense 119, bulk 273. Validated rules:

- **We almost never analyse by species.** Mons + their TM movepools are randomised; a hard species rule
  is allowed ONLY for a specific interaction (Relic Song ↔ Meloetta), never a heuristic. (Audit: the
  role-detection engine is species-clean.)
- **weatherSetter → by ABILITY only** (Drought/Drizzle/…), not by learning Rain Dance.
- **Screens & hazards are common strategies, NOT gimmicks** — don't make them rare; but "can learn the
  move" is not enough:
  - **screenSetter** = a screen move + a **non-attacker** profile (offense ≤ 95). Corpus: 1/284 in
    singles → rightly near-zero.
  - **cleric** = a Wish/Aromatherapy/Heal Bell + **bulky (bulk ≥ 285) & low-offense (≤ 95)** support.
    Corpus clerics: bulk ~304, offense 73, all run recovery.
- **setupSweeper** = a real sweeper boost (weak/common TMs — Work Up/Hone Claws/Curse/Growth/Tidy Up —
  dropped) + **offense ≥ 115** (corpus median 130; was 90, too loose).
- **winCondition** = a genuine closer (a setup sweeper), not "any wallbreaker".
- **One offensive identity per mon** (a mon runs one set): precedence **setupSweeper >
  choiceScarfRevengeKiller > wallbreaker**, mutually exclusive.
- **Result (measured via the decision log):** roles/mon 6 → ~1-3; teams begin to differentiate
  (balance / hyper_offense / bulky_offense / none appear, not universal bulky_offense). Follow-ups to
  analyse next: archetype **entry conditions** (some strong piles now match no archetype → "none") and
  per-trainer **seeds** for deliberate variety; watch `regeneratorPivot`'s bulky-recovery-pivot branch.

## Batch 5 — archetype slot recipes + crystallise-by-fit (source: 62-team singles corpus, T-121/T-118)

**VALIDATED — owner, 2026-07-11.** Team-by-team slot-objective analysis over the expanded corpus (62
singles teams). An **archetype = a slot RECIPE** on a defensive↔offensive spectrum; a **gimmick = a
defining engine** layered on a base. Crystallisation is by **structural fit** (score the team's role
counts against each base's recipe, take the best above a threshold; detect gimmick engines the same way
and stack), NOT boolean entry conditions. Owner-validated singles recipes (role · min/max/weight),
encoded in `randomizer/data/archetypes/singles.json`:

- **balance** — regeneratorPivot 1/2/.9 · wallbreaker 1/2/.8 · winCondition 1/1/.8 · hazardSetter 1/1/.6
  · hazardRemover 1/1/.6 · specialWall 0/1/.5  (defensive backbone + one-sided hazard game + wincon).
- **bulky_offense** — wallbreaker 1/3/1 · choiceScarfRevengeKiller 1/1/.8 · pivotUser 1/2/.7 ·
  hazardSetter 1/1/.6 · winCondition 0/1/.6 · specialWall 0/1/.4  (broad offensive default).
- **hyper_offense** — setupSweeper **2**/4/1 · hazardSetter 1/1/.7 · priorityUser 0/2/.5 · screenSetter 0/1/.4.
- **full_stall** — physicalWall 1/2/1 · specialWall 1/2/1 · unawareWall 1/1/.9 · cleric 1/2/.8 · hazardRemover 0/1/.5.
- **gimmicks** — weather (setter 1/1/1 · abuser 1/2/.9 · wincon 0/1/.5) · screens (setter 1/1/1 ·
  setupSweeper 2/3/1 · hazardSetter 0/1/.5) · trick_room (setter 1/2/1 · abuser 2/3/1).

Notes: `hazardSetter` is ubiquitous → a low-weight recipe slot, never a gate. `entry` conditions and
`focusSashLead` are retired. Thresholds `IDENTITY_FIT` 0.5 / `GIMMICK_FIT` 0.6 (provisional, tunable).
**Doubles recipes are pending** the DOU 6v6 corpus expansion (T-102 v2), same method.

## Open decisions

- **RESOLVED (owner, 2026-07-10) — Trapping (Shadow Tag / Arena Trap): ALLOWED** as a valid gimmick
  archetype for trainers (see Batch 3). Any Uber-pushing effect is handled by the move/Pokémon rating,
  not by excluding the strategy.
- **OPEN — Aurora Veil.** Its `statusList` 0 is **correct** (combo-dependent: needs snow). Model its
  value via a **snow-combo bonus** (like weather abusers), not a base rating — future work, not a bug.
