# Electric terrain — corpus analysis & build model (T-137)

Source: `research/corpus.json` (23 of 145 teams run electric terrain). Conclusions **owner-validated
2026-07-14**; the design SSOT for the electric-terrain gimmick (T-137), mirroring `weather.md`.

**Era caveat:** the corpus is Gen 6-7, so Surge Surfer / Quark Drive / Hadron Engine / Rising Voltage /
Terrain Pulse are ABSENT from it — but they exist in this expansion game and ARE included as real
abusers/setters (owner-validated: "incluir las piezas modernas"). The corpus grounds the STRUCTURE; the
modern pieces fill the ability/move roles the Gen 6-7 sample couldn't show.

## Corpus findings (23 teams — DOU-6v6 10, VGC-4v4 7, singles-6v6 6)

- **Setter:** Electric Surge (Tapu Koko) = 23/23 (100%). The only corpus setter (one species). No hand-set
  terrain move; Hadron Engine/Pincurchin/Miraidon absent (post-Gen-7).
- **Two modes:** (a) **SUPPORT LAYER** (~16/23) — the setter self-abuses (fast Electric-STAB pivot); terrain
  is a passive benefit (+ blocks sleep on grounded mons). Direct analogue of weather's 0-dedicated-abuser
  support teams. (b) **OFFENSIVE HO** (~4) — Tapu Koko + **Electric Seed → Unburden Hawlucha** SD sweep.
- **Corpus speed abuser = Unburden (Electric Seed)**, NOT Surge Surfer (which is absent).
- **Composition** (setter counted as abuser): 1 abuser → 15, 2 → 4, 3 → 3, 0 → 1.

## Abuser definition — `electricTerrainAbuseScore(mon)`, abuser at threshold ≥ 2

- **+3 — terrain speed/power ability:** Surge Surfer (×2 Speed — the Swift-Swim analogue), Quark Drive
  (Paradox best-stat boost; **dual-value — also triggers off Booster Energy, so score whenever present**),
  Unburden (the corpus-attested speed engine, via Electric Seed).
- **+2 — Electric-type attacker with a decent attacking stat:** grounded Electric STAB ×1.3 in terrain
  (Rising Voltage → 140 BP on grounded targets). The boosted-STAB analogue of weather #3 — what makes the
  setter-only support teams work (Tapu Koko scores here).
- **+1 — Electric Seed item:** +1 Def on entry / triggers Unburden.
- **+1 — synergy move:** Rising Voltage, Terrain Pulse (electric-typed / terrain-doubled).

Reliability: **RELIABLE (hard-restrict)** = the ability (+3) and Electric typing + attacking stat (+2).
**SOFT (TM/item-gated)** = Electric Seed and synergy moves.

## Setter

Electric Surge / Hadron Engine (abilities) + the move Electric Terrain (retrofit when the pool has no
ability-setter, exactly like weather's `ensureMoveSetter`). The setter usually ALSO scores +2 as an Electric
attacker, so "setter + 2 abusers" is often met by setter-abuser + one more.

## Build (mirror weather)

Tentative terrain tag → setter → 2 abusers (setter may count) → complete the archetype → rollback/drop if the
condition fails. **Emergent** (T-136-style): a non-dedicated trainer at soph ≥ gate that rolls an
electric-terrain setter tries to build it or drops it (logged). Support-layer (setter self-abusing) is a
valid build, like weather's 0-dedicated-abuser support.

## Terrain mechanics (apply once the tag holds, to GROUNDED mons)

- Electric moves ×1.3 to grounded targets; Rising Voltage ×2 (140 BP) on grounded targets.
- Blocks sleep on grounded mons; Electric Seed → +1 Def (and Unburden trigger).
- (Airborne / Levitate / Flying mons are unaffected — reflect in scoring.)
