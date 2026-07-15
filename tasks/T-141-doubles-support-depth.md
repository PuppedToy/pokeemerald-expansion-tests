---
id: T-141
title: Doubles support depth — corpus re-analysis + refinement plan
status: done
type: research
created: 2026-07-15
updated: 2026-07-15
target-version: 0.8.0
links: [T-097, T-102, T-109, T-140]
---

# T-141 — Doubles support depth — corpus re-analysis + refinement plan

## Context

Owner feedback on a real doubles run: dedicated-support elements that define competitive doubles are
missing from generated doubles teams, while some are wrongly favoured in singles.

Concretely:
- **Support abilities** (Friend Guard, Hospitality, …) are not prioritised in doubles and appear on
  singles teams instead (should be the reverse). Sinistcha / Maushold are doubles staples *because* of
  these abilities.
- **Support moves** (Follow Me, Rage Powder, Helping Hand, Wide Guard, Encore, Fake Out, Parting Shot,
  Protect + Detect/Spiky Shield, redirection via Lightning Rod, …) don't surface, and there is no
  **dedicated-support role** in the archetypes. Tailwind dedicated slots DO work — that part is good.
- The owner suspects the 6v6 archetypes never encoded dedicated support as a fixed role, and that move /
  ability doubles-value analysis is incomplete.

Owner's example: a Sinistcha that is RU in singles should rise to ~OU in doubles off Hospitality +
Strength Sap + Rage Powder — the dedicated-support signature must lift doubles quality.

## Plan

Analysis-first (per feedback: validate conclusions with the owner BEFORE coding rating/archetype changes).

1. **Corpus re-analysis of archetypes** — dedicated support vs partial support. When is support a fixed
   role vs utility moves bolted onto a non-support attacker? Distinctive signatures of dedicated-support
   mons (low offense + support ability + support moveset) that should raise doubles quality.
2. **Move quality in doubles** — re-rate the doubles-staple moves; identify moves used far more in
   doubles than singles.
3. **Ability quality in doubles** — abilities used more in doubles (Friend Guard/Hospitality dedicated
   support; Defiant/Competitive as Intimidate punishers), and abilities that should DROP in singles.
4. **Refinement plan** — a concrete, owner-validated plan so doubles teams use more competitive-doubles
   elements. Rule (owner): **6v6** for archetype shape, but the **VGC corpus** is fair game for
   strategy/meta/moves/abilities.

Acceptance criteria:
- [ ] Current-state audit of doubles move + ability rating and the archetype/role engine (done, evidence).
- [ ] Corpus-grounded catalogue of dedicated-support signatures + doubles-skewed moves/abilities.
- [ ] A written refinement plan (phased, testable) presented to the owner and VALIDATED before any code.

## Progress log

<!-- Append-only. Never rewrite past entries. Record decisions, findings AND dead ends. -->

- **2026-07-15** — Task created from owner feedback on run-1645241506. Launched 4 parallel read-only
  audits: (1) doubles move ratings, (2) doubles ability ratings, (3) archetype/role engine + extension
  points, (4) research corpus for dedicated-support signatures & doubles-skewed moves/abilities.
- **2026-07-15** — Audit results (current state).
  - **Moves** (`rateMoveDoubles`, rating.js:3508): only two transforms — spread ×1.35/×1.2 (damaging
    spread only) + a hand-kept `DOUBLES_SUPPORT_RATINGS` floor table (Follow Me 7, Rage Powder 7,
    Helping Hand 6, Wide Guard 5, Quick Guard 4, Protect/Detect 5.5, Trick Room 7, Taunt 6.5, Coaching
    4.5, Ally Switch 4, Icy Wind 6, Electroweb 5.5, Snarl 6, Tailwind 7.5=no-op). **Gaps:** Encore (6),
    Parting Shot (8) get NO doubles floor; Fake Out intentionally excluded (its value lives in the
    combo, ~8.86 already); Spiky Shield/Baneful Bunker floor is a no-op (singles 8 already higher).
  - **Abilities** (`rateAbilityDoubles`, rating.js:3534 — pure `max(singles, floor)`): Intimidate 7→9,
    Friend Guard 0→6, Lightning Rod/Storm Drain 7→8, Defiant/Competitive 5→6, Telepathy 0→5. **Gaps:**
    **Hospitality completely unhandled (5→5)**; Prankster no treatment (8→8, flagged in rating-gaps);
    Defiant/Competitive only +1 floor, not tied to Intimidate density; no combo credit for either.
  - **Engine** (doubles.json + featureDetectors + archetypeFit/Picker + gimmickPlan): bases
    bulky_offense / balance_dual_mode / hyper_offense. **NO `dedicatedSupport` role** — support is
    decomposed into redirector / fakeOutUser / wideGuardUser / screenSetter / cleric detectors. `cleric`
    (bulk≥285 & offense≤95 + recovery) is the closest dedicated-support profile but no recipe uses it.
    Only `weather` + `trick_room` (+ seeded electric_terrain) are wired end-to-end; **redirection /
    trapping / screens_tailwind are DATA-ONLY** (no GIMMICK_SPEC, no hold, no hard-pick — soft-bias
    only). Two bugs: TR seed uses `base:'balance'` (doesn't exist in doubles.json → falls back to
    gimmick-only structure); electric_terrain missing from doubles.json.
  - **Corpus** (145 teams: 24 VGC-4v4, 59 DOU-6v6, 62 singles-6v6): doubles teams average **3.6
    support-flavoured mons** (modal 3). Doubles-vs-singles %-of-teams: Protect 96/35, Fake Out 57/8,
    Trick Room 34/8, Tailwind 39/0, Rage Powder 19/0, Helping Hand 16/0, Icy Wind 14/0, Wide Guard 13/0,
    Perish Song 7/0, Follow Me 8/0; abilities Intimidate 69/29, Prankster 19/2. Dedicated-support
    exemplars: Pachirisu, Amoonguss, Cresselia, Incineroar, Togekiss, Hitmontop, Gothitelle, Klefki.
    Partial-support attackers (attacker-first despite a support ability): Landorus-T (29 apps), Tapu
    Koko, M-Kangaskhan. Distinction is stat-formalised (role = tendency: dedicated support = low
    offense ≤95 + support ability + support moveset). **`rating-decisions.md` already owner-validated:
    "dedicated support-only mons are correct in 6v6", "Intimidate+Fake Out cornerstones", "dedicated
    Wide Guard user is durable support".** **Caveat:** Friend Guard & Hospitality are ABSENT from the
    corpus (Gen 6-7 era) — the Sinistcha/Maushold cases rest on VGC mechanics knowledge, not corpus.
    **Gap:** no consolidated `doubles-support.md` build-model (the analogue of weather/trick-room.md),
    and the machine-actionable doubles archetype recipes are still "pending T-102 v2".
- **2026-07-15** — Owner validated the plan direction (AskUserQuestion): (1) **scalable support-signature
  bonus** (full kit ≈ +2 tiers, partial less); (2) singles — **only fix clear errors** (owner flagged
  Hospitality); (3) archetypes — **corpus-driven, agent decides**, new with/without-support variants OK.
  Consolidated everything into the build model **`docs/research/doubles-support.md`** (indexed). Key
  decisions locked there:
  - **Signature:** dedicated support = offense ≤ 95 AND supportScore ≥ min (vs partial-support attacker
    = attacker that merely carries Intimidate/a debuff, e.g. Landorus-T — stays an attacker).
  - **supportScore:** additive doubles-only bonus (redirection 0.9, Fake Out 0.5, Wide/Quick Guard 0.5,
    ally-heal ability 0.6, support-Intimidate 0.5, Helping Hand 0.35, speed-debuff 0.4, disruption 0.35,
    recovery+Protect 0.3, Prankster 0.4; capped ~2 tiers), applied before the T-140 BST floor.
  - **Singles clear-error fixes (ally-only abilities, dead in singles → 0):** Commander 10→0 (Tatsugiri),
    Hospitality 5→0 (Sinistcha), Costar 5→0 (Flamigo), Power Spot 2→0 (Stonjourner). Deliberate spec
    change; gates still hold (consistency, not stability).
  - **Doubles rating fixes:** Hospitality floor+combo, Prankster combo, Defiant/Competitive bump; Encore
    + Parting Shot move floors.
  - **Archetypes:** bulky_offense support min1 max2; balance_dual_mode min1 max1; hyper_offense min0 max1
    (with/without variant); NEW `redirection_support` base (support identity). + fix the TR seed
    `base:'balance'` bug.
  - Phasing = doubles-support.md §7. Awaiting owner go-ahead to start Phase 1 (rating fixes, TDD).
- **2026-07-15** — Owner: "Adelante. Acepto el plan." Implemented the rating layer (TDD red→green):
  - **Phase 1** (doubles rating fixes): `DOUBLES_ABILITY_RATINGS` + Hospitality 6, Defiant/Competitive
    6→7; `DOUBLES_SUPPORT_RATINGS` + Encore 6.5 (Parting Shot already 8 — skipped); combo credits for
    Hospitality (ally-support) and Prankster+support-move (`PRANKSTER_SUPPORT_MOVES`, weight 0.4).
  - **Phase 2** (singles clear-error): `rateAbilitySingles` + `SINGLES_ABILITY_CORRECTIONS` (Commander/
    Hospitality/Costar/Power Spot → 0), wired in pokedexModule before ratingDoubles. Doubles value
    preserved (Hospitality still floors to 6). Deliberate singles change for those 4 mons.
  - **Phase 3** (core): `supportScore(poke, moves)` — additive support-kit signature; in ratePokemonDoubles
    a LOW-OFFENSE mon (raw max(Atk,SpA) ≤ 95) with score ≥ 0.8 gets `combo = min(max(combo, score), 1.8)`
    — lifts dedicated support ~2 tiers WITHOUT double-counting the combo, attackers untouched (T-097
    preserved). Applied before the T-140 BST floor.
  - **Verified:** fast suite 1097 green (+10 T-141 tests); determinism gates 17/17 (singles + doubles
    teambuilding deterministic). Weights provisional — calibrated against corpus anchors in Phase 6.
  - Next: Phase 4 (dedicatedSupport detector + archetype slots + redirection_support base).
- **2026-07-15** — Phases 4-6 (TDD red→green):
  - **Phase 4**: `dedicatedSupport` detector (featureDetectors.js) + `dedicatedSupport` slot added to
    bulky_offense (min1 max2), balance_dual_mode (min1 max1), hyper_offense (min0 max1 — the with/without
    variant), + NEW `redirection_support` base (support = identity). Model validates (archetypes.test.js).
  - **Phase 5**: B-032 fixed (regression test) — `resolveIdentity` now maps a seed base absent from the
    active model (`balance` → `balance_dual_mode` in doubles) so Tate & Liza's base recipe isn't dropped.
    Partial-support move layer already delivers the component roles (redirector/wideGuardUser/…) via the
    existing ROLE_MOVE_SETS — dedicatedSupport is composite, nothing to register.
  - **Phase 6 (calibration)**: caught a DESIGN flaw — an offense-only gate missed the owner's flagship
    Sinistcha (121 SpA, played as support). Redesigned: **`isDedicatedSupport`** = STRONG kit (≥1.4)
    regardless of offence, OR moderate kit (≥0.8) on a low-offense mon. **UNIFIED** the detector to
    delegate to the same predicate (no drift between role membership and the tier bonus). Tuned weights
    (redirection 1.0, ally-ability 0.8) + cap 1.8. Result on the base pokedex (seed 777):
    - Sinistcha **RU→OU** ✓ (rD 7.77, the owner's anchor); Hitmontop RU→OU; Cresselia UU→OU; Amoonguss
      RU→UU; Indeedee-F/Maushold RU→UU; Politoed RU→UU (weather).
    - T-097 anchors ALL hold (none dedicated → lift didn't touch them): Incineroar RU→OU, Landorus-T
      OU→UBERS, Tyranitar OU→UBERS, Pheromosa UBERS→OU, Kartana LEGEND→OU, Regieleki UBERS→OU.
    - **Open meta calls for owner validation**: Togekiss OU→UU (120 SpA + moderate kit → partial-support
      attacker by the rule — drops); Amoonguss/Indeedee/Maushold at UU (OU?); Pachirisu NU (no Follow Me
      in its learnset here → not detected as support).
  - **Verified**: fast suite 1104 green (+T-141/B-032 tests); no circular dep (featureDetectors → rating,
    one-way). Determinism gates re-running.
  - Weights/thresholds provisional — awaiting owner validation of the meta calls before final calibration.
- **2026-07-15 (owner round 2) — classification fix.** Owner (from run-2709645655): a complete support
  like Amoonguss (Rage Powder + Regenerator + Spore + bulk) must be **OU, not UU** — the supportScore
  under-valued it (only credited redirection). Added two credits: **Regenerator** (support-pivot
  longevity, +0.4) and **sleep control** (Spore/Sleep Powder/… +0.4 — removes a foe, premium doubles
  disruption). Result: Amoonguss RU→**OU** (rD 7.92), Sinistcha/Clefable/Hitmontop/Tangrowth/Toxapex all
  OU; T-097 anchors hold (Landorus-T/Tyranitar UBERS, Incineroar OU). Added a **support tier cap**: a
  dedicated support tops out at OU (UBERS−0.05) so a super-bulky support (Alomomola) doesn't reach Ubers
  off support alone — the T-140 BST floor still overrides for a genuinely huge-BST mon. +1 test; fast
  suite 1111 green. This also unblocks the Drake case: Amoonguss (now OU, Grass) fits his OU slots, so
  the T-142 hard-pick grabs it — no tier-flex needed for the common case.

- **2026-07-15 (owner round 3) — support becomes its own tier dimension (corpus-weighted rating).** Owner:
  the count model (≥2/≥3 signals) is crude — a good OU attacker that merely LEARNS 2 tools shouldn't be a
  support. Redesigned per the owner's spec:
  - **`supportRating`** = Σ (each support tool's corpus-repetition value, CAPPED at 8 so a ubiquitous tool
    like Intimidate can't dominate) − an **offensive-TIER penalty** (UU 3 / OU 10 / Ubers 16 / …). Penalty
    keys off the mon's OFFENSIVE tier, not raw stats — so a support with high UNUSED offence (Sinistcha,
    121 SpA but offensively RU) keeps its value, while a real OU+ attacker is discounted (owner's rule).
    Points ≈ corpus counts (`SUPPORT_MOVE_POINTS` / `SUPPORT_ABILITY_POINTS`); Protect excluded (universal).
  - **Support tiers** `{ OU 22, UU 15, RU 11 }` + a **BST viability floor** `{ OU 440, UU 380, RU 320 }` —
    a frail pre-evo (Smoliv) with a big kit can't be OU support (it dies first); real supports clear it
    (Whimsicott 480 / Amoonguss 464 / Sinistcha 508 / Cresselia 600).
  - **New tier DIMENSION + tag:** `tierDoubles = max(offensive, support)`; when support strictly beats the
    offensive tier, `isSupportDoubles` is set and the viewer shows a **"Support" tag** on the doubles side.
  - **Calibration (base pokedex):** Sinistcha/Whimsicott/Amoonguss/Farigiraf/Clefable → OU +tag; Cresselia
    → OU (offensively OU too, untagged); Pheromosa/Landorus-T/Kartana → not support. Corpus: ~29% of DOU
    teams field NO dedicated support → hyper roll stays 0.25.
  - Replaces `supportSignals`; the detector/hard-pick/flex/tag all read `isDedicatedSupport` =
    `supportTierDoubles != null`. Fast suite 1114 green; determinism gates re-running; bundle rebuilt.

- **2026-07-15 — round 4 (owner: Calyrex OU is wrong; supports need support movesets + no AV; add a support
  audit log).** Regenerated run 2709645655 myself and reproduced everything the owner flagged.
  - **Calyrex was OU support (should be UU).** Root cause: the round-3 CAP flattened every tool to ≈8, so
    BREADTH won — Calyrex's six FILLER tools (Helping Hand + Heal Pulse + Light Screen + Life Dew + Reflect
    + Skill Swap; zero elite) summed to 31 and beat Amoonguss's three ELITE tools (Spore + Rage Powder +
    Regenerator). Owner: only a real support COMBINATION counts.
  - **Fix — QUALITY tiers replace the cap.** `SUPPORT_MOVE_POINTS`/`SUPPORT_ABILITY_POINTS` now score each
    tool elite 8 / good 5 / filler 2 (frequency-informed + doubles-expert-corrected: redirection is elite).
    This encodes the owner's own rule: 1 elite (8) < RU → half-support; 2 elite (16) → UU; 3+ (24) → OU;
    filler breadth can't reach a tier. Thresholds/penalty/BST-floor unchanged. **Calyrex → UU** (15),
    Whimsicott 34 OU, Amoonguss 24 OU, Farigiraf 21 UU — all owner anchors land.
  - **Support MOVESET** (`resolveTrainerTeam`): when the team wants support and the mon is `isSupportDoubles`,
    inject its best support moves (`topSupportMoves`, quality-ranked, ≤3, reachable-gated) as fixed moves
    before `chooseMoveset`, so it plays support instead of an all-attacking set.
  - **Item ban:** a dedicated support never gets Assault Vest / Choice (status-locking) — forward-Choice
    skipped, bag pick filtered, pre-set cleared.
  - **Support audit log** (`archetypePicker` records `context.supportPicks`; `teamAudit` renders): the full
    ranked support pool per hard-pick, itemised (each tool + quality value + offensive penalty), pick marked
    ‹picked›. New helpers `supportToolBreakdown` / `topSupportMoves`; stored `poke.supportRatingDoubles`.
  - **Verified on run 2709645655:** Drake now fields Amoonguss (Rage Powder + Spore), Toedscruel (Spore +
    Thunder Wave + Pollen Puff), Rillaboom (Taunt + Electroweb) — all with real support moves, none holding
    AV/Choice (Black Sludge / Leftovers / Shell Bell). The pick ranking prints 8 eligible supports.
  - Fast suite 1121 green (updated `featureDetectors`/`ratePokemonDoubles`/`archetypePicker` tests for the
    quality model — count model superseded per owner; added quality-tier + breadth + moveset-helper tests).
    Determinism gates re-running; bundle rebuilt.

## Outcome

<!-- Filled when closing. -->
Doubles support is now a full rating + tier dimension (QUALITY-tier tools — elite/good/filler —
offensive-tier-penalised, BST-viable; round 4), tagged in the viewer, delivered on teams via the up-front
roll + hard-pick + 1-tier flex, with a support moveset + a status-locking-item ban and an itemised support
ranking in the decision log. Owner-validated on 2026-07-15 (batch with T-102/T-109/T-111/T-140/T-142) —
Calyrex reads UU, supports carry real support moves, none holds Assault Vest/Choice. Closed.
