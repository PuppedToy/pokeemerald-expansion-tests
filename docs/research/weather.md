# Weather teams — corpus analysis & owner-validated build algorithm

Source: `research/corpus.json` (65 of 145 teams are weather). Conclusions **owner-validated 2026-07-13**;
this is the design SSOT for the weather team-building system (implemented by T-132).

## Corpus findings (65 weather teams: rain 24, sun 21, sand 13, snow 9)

**Abuser abilities** (freq): Swift Swim 27, Chlorophyll 7, Sand Rush 7, Hydration 6, Solar Power 3.
→ the "queen" speed/power abusers per subtype: **rain → Swift Swim** (+ Hydration), **sun → Chlorophyll**
(+ Solar Power), **sand → Sand Rush** (+ Sand Force), **snow → Slush Rush** (snow/sand small samples).

**Abuser moves** (exact): Hurricane 14, Solar Beam 13, Thunder 9, Aurora Veil 3, Growth 2, Blizzard 2.
→ **rain → Thunder + Hurricane** (100% accuracy under rain), **sun → Solar Beam/Solar Blade + Growth**
(Solar Beam = 1-turn in sun), **snow → Blizzard** (100% accuracy) **+ Aurora Veil**, **any → Weather Ball**
(becomes the weather's type, 100 BP). Also Electro Shot (rain, 1-turn charge).

**Composition (dedicated abusers per team)**: 1 → 22 teams, **0 → 19**, 2 → 12, 4 → 7, 3 → 5.
→ ~30% of successful weather teams carry NO dedicated (ability/move) abuser. These are mostly VGC
restricted teams (Primal Kyogre/Groudon, the "Big 6", Wolfe Glick 2016): weather is a **support layer**
— the setter itself abuses via ×1.5 boosted STAB and the team benefits passively.

## Abuser definition (owner-validated, BROAD — four ways)

A member is a weather ABUSER if ANY of:
1. **Ability** — a weather speed/power ability for the subtype: rain Swift Swim/Hydration/Dry Skin/Rain
   Dish; sun Chlorophyll/Solar Power; sand Sand Rush/Sand Force; snow Slush Rush/Ice Body.
2. **Move** — a weather-synergy move: rain Thunder/Hurricane (perfect accuracy); sun Solar Beam/Solar
   Blade/Growth; snow Blizzard (perfect accuracy)/Aurora Veil; any Weather Ball; rain Electro Shot.
3. **Boosted-STAB attacker** (rain/sun only) — a strong attacker of the offensively-boosted type
   (rain → Water, sun → Fire). This is what makes the 0-dedicated-abuser support teams work, so it counts.
4. **Boosted-DEF type** (sand/snow only) — a mon OF the defensively-boosted type: Rock in sand (×1.5
   SpDef), Ice in snow (×1.5 Def). The defensive analogue of (3). **Owner-approved 2026-07-13** after
   verifying, per trainer, that sand & snow genuinely have no other reliable path in THIS game: they have
   no boosted STAB; Weather Ball is not a TM at all; and the Blizzard/Aurora Veil TMs exist but the themed
   villains don't hold them (so the move path (2) is closed for them). A Rock core in sand / an Ice core in
   snow is exactly how these weathers "abuse" here — mirroring the boosted-STAB support teams of (3).

Reliability note (used by the picker): (1), (3) and (4) are **reliable** — post-resolution certain from the
species' ability/typing. (2) is a **soft** signal only — TM-gated, so a synergy-move *learner* isn't
guaranteed to end up carrying the move. The picker hard-restricts to reliable abusers to secure the count.

**Implementation (owner-designed 2026-07-13): a single `weatherAbuseScore(mon, subtype)` + threshold.** The
four ways above are scored — +3 ability, +2 boosted-STAB type *with a decent attacking stat*, +2
boosted-DEF type, +1 synergy move — and a mon is an abuser when the score reaches the threshold (≥2). This
ONE score (weights/threshold in `modules/weatherConstants.js`) is used identically by the picker, the
success condition (`weatherHolds`) and the decision-log labels, so they can never disagree. It is
POTENTIAL-based (typing/ability/movepool), not "did the final moveset carry a STAB move" — that earlier,
fragile reading made Water/Fire types register as non-abusers when their 4 chosen moves lacked the STAB.
A mon scores 0 for a subtype it doesn't fit, so a foreign-weather ability (Swift Swim on a sun team) is
never counted or labeled as an abuser.

**Setter — the move path is real for villains.** With `mutateAbilities` on, the setter ABILITIES are
scattered off a type-restricted pool, so a villain frequently has abusers but no ability-setter. When a
built weather attempt has no setter, the resolver retrofits a themed **move-setter** (`ensureMoveSetter`:
Sandstorm / Rain Dance / Sunny Day / Hail-Snowscape onto a non-abuser member). A weather attempt also BANS
the OTHER weathers' setter abilities, so no member establishes a conflicting weather.

**The setter can also count as an abuser** when it abuses its own weather (e.g. Kyogre = Drizzle setter
+ rain-boosted Water STAB; Abomasnow = Snow Warning setter + Ice defensive; Tyranitar = Sand Stream + Rock
defensive). So "setter + 2 abusers" is typically met by setter-abuser + one more.

## Build algorithm (owner-validated)

1. Set a **tentative** weather tag; all team-building runs WITH the tag until it's dropped.
2. **Setter** first. A setter is a mon with a setter ABILITY (optimal) or a setter MOVE (suboptimal but
   allowed when forcing; give a move-setter an abuser ability). No setter → fail.
3. Find **2 abusers** (broad definition above; the setter may be one). Fail → fail.
4. **Team condition = setter + 2 abusers.** If it fails, DON'T accept the tag: roll back the setter slot
   and redefine that pokemon, changing or dropping the weather tag.
5. **Complete the archetype** with non-abusers, but keep the tag in mind: a mon that can take an
   abuser move / synergy ability prefers it (e.g. Rain Dish over Damp under rain).
6. **Fallback**: if the themed weather fails, try the other weathers in random order until one satisfies
   setter+2-abusers. Final fallback: drop the weather tag → build a normal team.

## Weather-tag mechanics (apply per member once the tag holds)

- **Rain**: Water ×1.5, Fire ×0.5; Thunder & Hurricane 100% accuracy.
- **Sun**: Fire ×1.5, Water ×0.5; Solar Beam/Blade fire in 1 turn; Growth +2 Atk/SpA.
- **Sand**: Rock get ×1.5 SpDef; chip to non-{Rock, Ground, Steel}.
- **Snow**: Ice get ×1.5 Def; Blizzard 100% accuracy; Aurora Veil available.
- **Any**: Weather Ball becomes the weather's type at 100 BP.

(Investigate any further mechanics at implementation time and reflect them in the abuser/move scoring.)
