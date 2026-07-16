# Perish-trap / trapping — corpus analysis & build model (T-124)

Source: `research/corpus.json`. Conclusions **owner-validated 2026-07-15**; the design SSOT for the
perish-trap **team-combo** (T-124). Unlike weather / Trick Room / electric-terrain (build-around gimmicks),
perish-trap is a lightweight moveset combo — see §2.

This doc also records the **terrain** and **screens** decisions from the same T-124 research pass (both
also concluded NOT to be build-around gimmicks).

## 1. Corpus findings — trapping is a real DOUBLES control gimmick

Trap-team scan (a member with Shadow Tag / Arena Trap / Magnet Pull), by format:

| Bucket | Teams with a trapper | Trapper | Also run Perish Song |
|---|---|---|---|
| DOU 6v6 | **13/59 (22%)** | Shadow Tag = 17 mons (Gothitelle, Gengar-Mega); teams stack 2-3 | **5/12** |
| Singles 6v6 | 6/62 (support; Magnezone/Dugtrio) | Magnet Pull / Arena Trap | — |
| VGC 4v4 | 4/24 | Shadow Tag (Gothitelle, Gengar-Mega) | some |

- In **doubles, trapping = Shadow Tag** (100% of DOU trap teams; no Arena Trap/Magnet Pull — those are
  singles steel/ground traps). Shadow Tag traps BOTH foes (they can't switch).
- The defining combo (owner: "modelar el Perish-trap") is **Shadow Tag + Perish Song**: the trapped foe
  can't escape the 3-turn Perish count → a guaranteed KO. **Protect/Detect + Substitute** stall the count.
  Gothitelle / Gengar-Mega learn Shadow Tag AND Perish Song themselves (one mon is both halves).
- In singles it's a *support* element (trap-and-remove a specific counter), not a build-around gimmick —
  covered by the `trapper` detector role, not this gimmick.

## 2. Build model — a moveset TEAM-COMBO, not a gimmick (owner, round 2)

**Owner decision (2026-07-15):** perish-trap is NOT a build-around gimmick or archetype — it's a **moveset
team-combo** (a 1-2 mon pairing), handled purely by prioritising the Perish Song MOVE. It does not reserve
team slots the way weather/Trick Room do. Implemented as `planPerishComboMove` (`archetypeRefine.js`), a
sibling of the terrain-synergy nudge. Two cases, with different format scope:

- **(1) SELF — the trapper carries it. BOTH formats.** A mon whose OWN ability is Shadow Tag / Arena Trap
  (the resolved battle ability, so a Mega Gengar counts) and that can learn Perish Song strongly prefers it
  in its own set. This is the all-in-one perish-trapper (Gothitelle, Mega Gengar). Fires regardless of
  offense. Applies in **singles too** (owner round 3: a singles Perish-Trap Gothitelle is a real set) — so
  this is a deliberate, authorised singles-output change for the handful of Shadow-Tag/Arena-Trap mons that
  learn Perish Song.
- **(2) TEAMMATE — a support partner carries it. DOUBLES only.** A **support-leaning** mon (offense ≤ 100)
  whose TEAMMATE has Shadow Tag / Arena Trap prefers Perish Song — the split perish-trap (a Wobbuffet-style
  trapper can't learn Perish Song, so a partner sings it). The offense gate keeps it off sweepers
  ("especially dedicated supports" — owner). In singles you don't split the combo across mons (owner), so
  this half is gated to doubles.

The move is injected as a fixed move (reachable-gated, B-030) so `chooseMoveset` builds around it. There is
NO `trapping` gimmick in `doubles.json`, no `GIMMICK_SPEC` entry, no crystallise/emergent path — it was
tried that way first (round 1) and the owner reframed it: *"no es un gimmick entero ni un arquetipo, es un
team combo."* The `trapper` / `perishSongUser` detectors remain (they identify the pieces) but drive no
archetype.

## 3. Terrains (misty / grassy / psychic) — NOT gimmicks (soft surger-awareness)

Same T-124 pass, per-format terrain-setter scan counting terrain-payoff pieces on the rest of the team:
**no terrain reaches a team-gimmick threshold in ANY format** — almost every terrain-setter team has 0-1
payoff pieces, essentially none 2+. Even ELECTRIC (which IS a gimmick, T-137) is lone-mon in the corpus
(DOU: 10 setters, 8 with zero abusers). Terrains are a lone mon's tool, not a build-around gimmick.

**Owner decision:** electric_terrain **stays a full gimmick** (it's the most abusable terrain outside the
Gen 6-7 corpus — Surge Surfer / Rising Voltage / Quark Drive); misty/grassy/psychic get a **SOFT
surger-aware** layer instead (`planTerrainSynergyMove`, doubles-only, soph-gated): when the team already
fields the matching Surge setter, a teammate that can run the terrain's signature payoff move prefers it
(grassy → Grassy Glide, psychic → Expanding Force, misty → Misty Explosion). A light nudge, not a forced
build — and doubles-only, so singles stays byte-identical.

## 4. Screens — a light role, not a gimmick

Screens are minor (singles 8/62 ≈13%, DOU 5/59 ≈8%, VGC 1/24) — a light HO-lead element. Kept as the
existing light `screenSetter` detector role (+ Light Clay via T-125); NOT given setter+abuser completion.
