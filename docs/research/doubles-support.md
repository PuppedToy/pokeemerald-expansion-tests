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

## 2. Support RATING — QUALITY-tier, offensive-tier-penalised (owner round 4)

Support is its OWN doubles axis. `supportRating(mon)` = **Σ (each support tool's QUALITY-tier value) − an
offensive-tier penalty**, where:
- **Tool value = quality tier: elite 8 / good 5 / filler 2.** `SUPPORT_MOVE_POINTS` /
  `SUPPORT_ABILITY_POINTS` in rating.js assign each support move/ability one of three tiers, frequency-
  informed (the elite tools are the ones that recur across the 59 DOU 6v6 teams) then doubles-expert-
  corrected (redirection — Rage Powder / Follow Me — is elite though the Gen 6-7 corpus under-counts Follow
  Me). **Elite (8):** Fake Out, Trick Room, Tailwind, Rage Powder, Follow Me, Taunt, Spore, Will-o-Wisp,
  Thunder Wave, Perish Song; Intimidate, Prankster, Regenerator, the terrain surges, Friend Guard,
  Hospitality. **Good (5):** Helping Hand, the Guards, Icy Wind/Electroweb, Snarl, Encore, Parting Shot,
  cleric moves; redirection abilities, priority-block, ally healers. **Filler (2):** heals, screens,
  one-target utility, RNG sleep; incidental absorb typings. **Protect is EXCLUDED** — on 56% of ALL mons
  (attackers too), universal utility not a support discriminator.
- **Penalty by OFFENSIVE TIER, not raw stats.** A support with high UNUSED offence (Sinistcha — 121 SpA
  but offensively RU) keeps its full value; a genuine OU+ attacker is heavily discounted
  (`SUPPORT_PENALTY_BY_TIER`: UU 3, OU 10, Ubers 16, …). This is the owner's rule: *a good OU attacker is
  NOT a support just because it can learn a couple of support moves* — its offensive tier eats the points.

**Why quality tiers replaced the cap (round 4).** Round 3 valued tools by raw corpus frequency but CAPPED
each at 8; that flattened *every* tool to ≈8, so BREADTH won — Calyrex's six *filler* tools (Helping Hand,
Heal Pulse, Light Screen, Life Dew, Reflect, Skill Swap; zero elite) summed to 31 and out-scored
Amoonguss's three *elite* tools (Spore + Rage Powder + Regenerator, each capped down to 8). Owner:
*"el hecho de que pueda aprender ≥2 no lo hace support dedicado"* — only a real support COMBINATION counts.
The three quality tiers make the rating encode the owner's own rule exactly: **1 elite tool (8) < RU → a
half-support attacker; 2 elite (16) → UU; 3+ elite (24) → OU**; filler breadth (2 each) can't manufacture a
support (six filler ≈ 12).

`isDedicatedSupport(mon)` = earns a support tier (rating ≥ RU bar **and** clears the BST floor). Backs the
detector + the hard-pick + the flex.

## 3. Support tier + tag

`supportRating` maps to its OWN doubles tiers: **`SUPPORT_TIER_THRESHOLDS` = { OU 22, UU 15, RU 11 }**.
Plus a **BST viability floor** (`SUPPORT_TIER_MIN_BST` = { OU 440, UU 380, RU 320 }): a support must survive
to support, so a frail pre-evo (Smoliv) with a big kit is capped down or dropped — real OU supports clear
it (Whimsicott 480 / Amoonguss 464 / Sinistcha 508 / Cresselia 600). Support is a **new tier dimension**
(owner): a mon's effective `tierDoubles = max(offensive tier, support tier)`, and when the **support tier
strictly beats its offensive tier** the mon is flagged **`isSupportDoubles`** — the viewer shows a
**"Support" tag** on the doubles side (on top of the shared role + tier). So a Whimsicott reads
*Doubles: OU · Support*, while a Pheromosa (OU offense, only RU support) stays *Doubles: OU* untagged.

**Calibration (mutated run 2709645655).** Owner anchors all land: **Calyrex 15 → UU** (Helping Hand 5 +
five filler; ZERO elite — was wrongly OU under the cap), Whimsicott 34 → OU, Amoonguss 24 → OU, Farigiraf
21 → UU, Sinistcha OU +tag. Attackers fall out (offensive penalty): Tapu Bulu 23−3, Celebi 19−10,
Brute Bonnet 15−10. Corpus: ~29% of DOU teams field NO dedicated support → the up-front hyper roll (§8)
stays at 0.25.

**Audit.** `supportToolBreakdown(mon)` itemises the tools + their tier values + the penalty; the decision
log prints the full **support ranking** for each hard-pick (every eligible support scored, the pick marked
‹picked›), so *why THIS support and why OU/UU* is auditable (owner request, round 4).

**Earlier (superseded) models:** a signal-COUNT (≥2 dedicated), then a frequency-weighted **capped** sum.
Both are replaced by the quality-tier rating (the count/cap both let breadth of mediocre tools reach OU).

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
- **Support MOVESET (round 4)**: a fielded support must PLAY support. When the team wants support and the
  fielded mon is `isSupportDoubles` (its support tier beats its offense — the tagged supports), the resolver
  injects its best support moves — `topSupportMoves(mon)`, quality-ranked, up to 3 — as fixed moves before
  `chooseMoveset`, so the set is built AROUND them (a coverage move fills the last slot) rather than
  all-attacking. Reachable-move gated (B-030) like the role move. (Owner: Calyrex had been fielded with
  Leaf Storm / Psychic / Gyro Ball / Close Combat — a pure attacker labelled "support".)
- **Item ban (round 4)**: a dedicated support can't hold a STATUS-LOCKING item — **Assault Vest** (blocks
  all status moves) or a **Choice** item (locks into one move). The resolver skips the forward-Choice claim
  for a support, filters those items out of its bag-item pick, and clears any pre-set one. (Owner: the
  Calyrex "support" was holding Assault Vest.)
- These are doubles-only (the `dedicatedSupport` slot exists only in `doubles.json`), so singles stay
  byte-identical. `resolveIdentity`/`crystallize` are rng-free, so the selector's flex check doesn't
  perturb the per-slot RNG stream.
