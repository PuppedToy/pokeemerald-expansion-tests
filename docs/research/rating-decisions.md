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

## Open decisions

- **OPEN — Trapping (Shadow Tag / Arena Trap).** A distinctive 6v6 archetype (remove-the-counter →
  sweep), legal in Smogon DOU. Do we allow/balance it as a trainer archetype, or leave it out of the
  teambuilding design? To resolve when we design the doubles archetype model (T-102) / engine (2C).
- **OPEN — Aurora Veil.** Its `statusList` 0 is **correct** (combo-dependent: needs snow). Model its
  value via a **snow-combo bonus** (like weather abusers), not a base rating — future work, not a bug.
