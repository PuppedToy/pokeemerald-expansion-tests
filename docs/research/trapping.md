# Perish-trap / trapping — corpus analysis & build model (T-124)

Source: `research/corpus.json`. Conclusions **owner-validated 2026-07-15**; the design SSOT for the
`trapping` gimmick (T-124), mirroring `weather.md` / `trick-room.md` / `electric-terrain.md`.

This doc also records the **terrain** and **screens** decisions from the same T-124 research pass (both
concluded NOT to be build-around gimmicks).

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

## 2. Build model — `trapping` gimmick (doubles-only)

Mirrors the weather/room framework (`GIMMICK_SPEC.trapping`), with two differences the corpus dictates:

- **Setter = a Shadow Tag TRAPPER (ability).** Purely an ability — no move sets Shadow Tag — so the picker
  HARD-PICKS a Shadow Tag mon (`setterAbilities: ['SHADOW_TAG']`); there is no move-setter retrofit.
- **Core/abuser = a Perish Song user** (`perishTrapAbuseScore`, threshold ≥2): **+3** learns Perish Song
  (the win condition), **+1** a stall move (Protect/Detect), **+1** Substitute. A mon that can't learn
  Perish Song scores 0 — it is not the core.
- **`abuserTarget: 1`** — a SINGLE Perish Song core wins (unlike weather/room, which need 2 abusers).
- **HOLDS** (`trappingHolds`) = a Shadow Tag trapper AND an **actually-equipped** Perish Song move (like
  TR's holds checks the real move, not just potential). `ensureTrapCore` retrofits Perish Song onto the
  trapper (or a learner) if it's missing.
- **Entry** (`doubles.json` `trapping.entry`) requires BOTH `trapper` **and** `perishSongUser` (min 1) — a
  lone Shadow Tag mon is a support trapper, not a perish-trap TEAM, so trapping only crystallises on the
  real combo. Since Gothitelle/Gengar learn both, one pick satisfies both features.
- **Emergent** (`emergentGimmick`, DOUBLES-ONLY): a Shadow Tag mon + a Perish Song learner already on a
  non-dedicated team opportunistically builds the trap. Gated to doubles so it never touches singles
  (the gimmick lives only in `doubles.json`; letting it emerge in singles would hard-pick a trapper into a
  singles team and break byte-identical singles).

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
