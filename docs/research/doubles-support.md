# Doubles support — build model (T-141)

The consolidated model for **dedicated support** in doubles, the analogue of
[weather.md](weather.md) / [trick-room.md](trick-room.md). Owner-validated direction (2026-07-15);
this doc is the SSOT for the T-141 implementation.

**Rule (owner):** archetype SHAPE is **6v6** (Smogon DOU); strategy / meta / move / ability values may
draw on the **VGC (4v4) corpus**. See [6v6-vs-4v4-doubles.md](6v6-vs-4v4-doubles.md).

**Corpus caveat:** Friend Guard and Hospitality are Gen-8/9 and **absent from the Gen 6-7 corpus**;
their handling rests on ability mechanics + VGC principles, not corpus frequency.

## 1. Why (owner feedback, run-1645241506)

Generated doubles teams field almost no dedicated support, while some support mons/abilities are
mis-favoured in singles. The corpus disagrees sharply with the current output: doubles teams average
**3.6 support-flavoured mons** (modal 3); Protect appears on 96% of doubles teams (35% singles), Fake
Out 57% (8%), Rage Powder/Follow Me/Wide Guard/Helping Hand/Icy Wind ≈0% in singles. Support is a
**defining role** in nearly every corpus doubles archetype.

## 2. The dedicated-support SIGNATURE

A **dedicated support** = a low-offense mon whose kit is built to enable allies, as opposed to a
**partial-support attacker** (an attacker that happens to carry Intimidate/a spread debuff — e.g.
Landorus-T, Tapu Koko, M-Kangaskhan: 29/13/11 corpus appearances, always attacker-first).

`isDedicatedSupport(mon)` — **count-based** (owner round 2): a dedicated support is defined by its KIT,
not its stats. `supportSignals(mon)` counts the DISTINCT top-tier support categories the species can field
(redundant tools within a category — Follow Me vs Rage Powder — count once). A mon with **≥2 signals** is
a dedicated support; a mon with only ONE support tool (Tailwind + 3 attacks) is a half-support ATTACKER
and NEVER gets the role. **Offence is irrelevant** — Whimsicott (Prankster + Tailwind + Encore), Farigiraf
(Armor Tail + Trick Room + Helping Hand) and Amoonguss (Rage Powder + Regenerator + Spore) are all
dedicated support (3 signals) despite real stats. The same `isDedicatedSupport` backs both the rating and
the `dedicatedSupport` role detector (one definition, no drift).

Signal categories: redirection · Fake Out · Wide/Quick Guard · Tailwind · Trick Room · Helping Hand ·
disruption (Encore/Taunt/Parting Shot/Perish Song) · spread debuff (Icy Wind/Electroweb/Snarl) · sleep ·
Intimidate · Prankster · ally ability (Friend Guard/Hospitality/Healer) · Regenerator · priority-block
(Armor Tail/Dazzling/Queenly Majesty).

## 3. Support tier by signal count

Owner rule: **≥3 signals → OU floor; 2 → UU floor**, capped at the top of OU (a support ENABLES the team,
it isn't a raw Ubers threat — so a super-bulky support doesn't reach Ubers off support alone). Applied in
`ratePokemonDoubles` after the frailty/passive penalties, before the T-140 BST floor — which still
overrides for a genuinely huge-BST mon (BST paces the run). Result: Amoonguss/Whimsicott/Farigiraf/
Sinistcha → OU; a clean 2-signal support → at least UU.

**Phase-6 calibration on the base pokedex (seed 777) — result:**
- Owner anchor hit: **Sinistcha RU→OU** (rD 7.77). Also Hitmontop RU→OU, Cresselia UU→OU, Amoonguss/
  Indeedee-F/Maushold RU→UU, Politoed RU→UU.
- **T-097 anchors all hold** (none are dedicated → the lift never touched them): Incineroar RU→OU,
  Landorus-T OU→UBERS, Tyranitar OU→UBERS, Pheromosa UBERS→OU, Kartana LEGEND→OU, Regieleki UBERS→OU.
- Open meta calls for owner: Togekiss OU→UU (120 SpA + moderate kit ⇒ partial-support attacker → drops);
  Pachirisu NU (no Follow Me in its learnset here). Awaiting validation before final weight lock.

## 4. Ability & move rating corrections

### 4a. Doubles ability fixes (`DOUBLES_ABILITY_RATINGS` + `computeComboBonusDoubles`)
- **Hospitality** — add doubles floor (≈6, matching Friend Guard) + support-ability combo credit.
- **Prankster** — add a combo credit for Prankster + {Tailwind, Taunt, Thunder Wave, Encore, redirection}
  (flagged in rating-gaps.md, never implemented).
- **Defiant / Competitive** — raise the doubles floor (Intimidate is on 69% of doubles teams).

### 4b. Doubles move fixes (`DOUBLES_SUPPORT_RATINGS`)
- **Encore** — add doubles floor (premium disruption, esp. Prankster Encore).
- **Parting Shot** — add doubles floor (pivot + attack/sp.atk drop).
- (Fake Out already ~8.86 via singles first-turn + combo — leave; Spiky Shield/Baneful Bunker floors are
  intentional no-ops.)

### 4c. Singles clear-error corrections (owner-authorised — ONLY unambiguous errors)
Ally-only abilities that do **nothing** in singles but are rated high — corrected to ~0 in singles:

| Ability | Singles now | → | Mon |
|---|---|---|---|
| Commander | 10 | 0 | Tatsugiri (needs a Dondozo ally) |
| Hospitality | 5 | 0 | Sinistcha / Poltchageist |
| Costar | 5 | 0 | Flamigo |
| Power Spot | 2 | 0 | Stonjourner |

These shift singles output for those mons (deliberate spec change; the determinism gates still hold —
they test cross-ROM consistency, not stability vs prior output).

## 5. Archetype structure (6v6, corpus-driven)

Support is a defining role in the corpus doubles archetypes, so it becomes a real slot. Hyper Offense
keeps the corpus's with/without-support split as two variants.

| Base | dedicatedSupport slot | Corpus basis |
|---|---|---|
| `bulky_offense` | **min1 max2** (fixed) | "1-2 Intimidate/Fake Out support" core |
| `balance_dual_mode` | **min1 max1** (fixed) | "Fake Out/Intimidate support + redirector" |
| `hyper_offense` | **min0 max1** (optional) | "What's Protect?" (no support) vs "Fake Out + Follow Me" |
| `redirection_support` (NEW) | **min1 max2** (identity) | corpus "Redirection Support Offense" |

Density target: **VGC-faithful ~1-2 dedicated support + partial support spread**, well under the
corpus's 3.6 (which counts every support-flavoured mon, most partial). Gimmick archetypes (weather /
trick_room) already pull a redirector/protector via their gimmick layer.

## 6. Engine wiring

- Add a **`dedicatedSupport` detector** (`featureDetectors.js`) = offense ≤ 95 AND supportScore ≥ min.
  Register in `MOVE_SETS`/`ROLE_MOVE_SETS` for the partial-support move layer (`archetypeRefine.js`).
- Add the slot to the bases above (`data/archetypes/doubles.json`) + the new `redirection_support` base.
- **Bug:** the Trick Room seed uses `base:'balance'` (`trainerSeeds.js`) — no such base in doubles.json
  (it's `balance_dual_mode`); the recipe silently degrades to gimmick-only. Fix the seed.
- Wire `redirection` / `screens_tailwind` properly OR let the `dedicatedSupport` role subsume redirection
  (decide in implementation — a fixed support slot may make the data-only redirection gimmick redundant).

## 7. Phasing (each TDD, singles byte-identical except §4c)

1. Doubles ability fixes (§4a) + move fixes (§4b).
2. Singles clear-error corrections (§4c).
3. `supportScore` + dedicated-support doubles bonus (§3) — the tier lift.
4. `dedicatedSupport` detector + archetype slots + `redirection_support` base (§5, §6).
5. Engine bug fixes + partial-support move layer wiring (§6).
6. Calibration pass against §3 anchors; regenerate a mixed run; owner review.

## 8. Delivery (T-142) — how a support actually reaches the team

Classifying a support correctly (§3) isn't enough; the engine must FIELD it, like the gimmick setters.
And the emergent identity resolves too LATE to secure one — an all-attacker partial team crystallises
`hyper_offense` (min0) before a support archetype can form, so the support is never forced (this is why
Drake fielded six attackers). The fix:
- **Up-front roll** (`resolveTrainerTeam` → `context.doublesWantsSupport`): each steered doubles team
  rolls, deterministically per trainer (a hash of the id + base seed — NO rng consumed, so per-slot RNG
  streams and other trainers are undisturbed), whether it's hyper-aggressive (a `DOUBLES_HYPER_CHANCE`
  minority — NO support) or support-using. This decides support intent BEFORE the attacker slots fill.
- **Hard-pick** (`archetypePicker`): when the roll wants support and the team lacks one, restrict the pick
  to `DETECTORS.dedicatedSupport` candidates (mirrors the gimmick setter hard-pick). The move-refine then
  injects the support move (Rage Powder / Follow Me / …).
- **Tier-flex — one tier down** (`trainerSelector`): doubles support is intentionally a tier below the
  attackers it enables (a UU/OU support on an Ubers team — the VGC norm). So when the team still wants a
  support and none sits in the boss's slot tier, the `absoluteTier` filter admits `dedicatedSupport` mons
  from **exactly one tier down**. Only the first (min) support flexes; a 2nd out-of-budget support drops.
  Owner-validated: 1 tier only, then drop.
- **Drop + log**: if no support fits even one tier down, the support role is dropped and the decision log
  says so (and notes when a support WAS flexed in) — mirroring the weather-drop transparency.
- These are doubles-only (the `dedicatedSupport` slot exists only in `doubles.json`), so singles stay
  byte-identical. `resolveIdentity`/`crystallize` are rng-free, so the selector's flex check doesn't
  perturb the per-slot RNG stream.
