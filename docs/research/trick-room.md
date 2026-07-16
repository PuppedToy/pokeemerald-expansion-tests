# Trick Room — corpus analysis & build model (T-137)

Source: `research/corpus.json`. Conclusions **owner-validated 2026-07-14**; the design SSOT for the Trick
Room gimmick (T-137), mirroring `weather.md`. **Archetypes are read from the 6v6 corpus only** (owner's rule:
4v4 is good for individual synergies, NOT for archetypes). Room Service is Gen 8 (absent from the Gen 6-7
corpus) but exists in this game and IS included (owner-validated).

## Corpus findings — 6v6 (19 room-archetype teams: 13 FULL, 6 HALF; + 4 perish-trap splashes)

**Two distinct archetypes** (the corpus literally names them — "full room" vs "semi-room"/"tailroom"):

- **FULL ROOM (13 teams, DOU + all 5 singles):** the team is COMMITTED to TR — **2-4 setters (modal 3;
  redundancy so the mode survives losing one is a 6v6 signature) + ~3-4 slow-strong abusers**; the whole
  team operates under the room. E.g. Camerupt Trick Room (3 setters Stakataka/Diancie/Porygon2 + M-Camerupt/
  Tapu Bulu/Stakataka/Diancie); Trick Room God Squad (3 setters + A-Marowak/CB Bulu/Specs Vikavolt).
- **HALF ROOM (6 teams, DOU only):** ONE setter (a mon that earns its slot anyway — Cresselia/Jirachi/
  Stakataka/Hoopa-U) + TR as a **plan-B speed flip**, paired with a **fast mode OR another gimmick**. E.g.
  Hoopa-U TailRoom (Tailwind + TR); Stax Mega-Kanga SemiRoom (Prankster T-Wave/Taunt + TR); Charizard-Y Sun
  (sun + Tailwind + TR backup).
- **Discriminator = COMMITMENT, not setter count:** does the team carry a non-TR fallback mode / second
  gimmick (→ HALF) or is it all-slow built to operate under TR (→ FULL)? (Two outliers prove setter-count
  alone fails: a 1-setter/3-abuser "semi-room", a 3-setter/1-abuser balance.)
- **Singles TR ≈ always FULL** (uses priority moves — Extreme Speed/Aqua Jet/Sucker Punch/Shadow Sneak — as
  the "room is down" answer, not a half-room fast mode). HALF ROOM is a doubles trait.
- **Weather + Trick Room on one 6v6 team = confirmed** (Bulu/Sun TR: Torkoal Drought + Cresselia/Porygon2 TR
  power the SAME slow wallbreakers; Charizard-Y Sun; M-Abomasnow snow-TR) — a real but MINOR pattern (~2-3
  clean teams). Validates "TR can coexist with a gimmick → go HALF room."
- **Setter distribution (all 33 TR teams incl. 4v4):** 1 → 17, 2 → 8, 3 → 7, 4 → 1.

## Setter

The **move Trick Room** on a bulky SURVIVAL body — no ability sets TR. Setter tells (survive the setup turn):
Levitate (16) / Disguise (Mimikyu) / Shadow Shield / Prankster (priority TR) / Aroma Veil (anti-Taunt), +
Mental Herb / Safety Goggles. Move-retrofit like weather's `ensureMoveSetter`. **Full room = multiple setters
(2-3) for redundancy (6v6); half room = 1.**

## Abuser definition — `trickRoomAbuseScore(mon)`, abuser at threshold ≥ 2

TR inverts Speed, so the boosted-STAB analogue is **slow + strong stats**, not a type/ability:

- **+3 — slow-and-strong (potential-based):** base Speed ≤ ~55 AND max(base Atk, base SpA) ≥ ~100 (or a
  Choice/boost item pushing effective offense there). Corpus: M-Camerupt, A-Marowak, Conkeldurr, M-Mawile,
  Crawdaunt, Escavalier, Snorlax, Stakataka, Diancie.
- **+1 — Gyro Ball user** (TR-native; power scales inversely with Speed).
- **+1 — Room Service item** (drops Speed on TR entry; the game has it).

Reliability: **RELIABLE (hard-restrict)** = base Speed ceiling + attacking-stat floor (+3) and the setter's
survival ability. **SOFT (gated)** = the Trick Room move itself, Gyro Ball, Room Service.

## Build

- **FULL ROOM:** 2-3 setters + 2-4 slow abusers; the whole team slow. **Tate & Liza = forced full room, owner
  spec: 2 setters + 4 abusers.**
- **HALF ROOM:** 1 setter (earns its slot) + fewer abusers, alongside a fast mode / another gimmick.
- **Emergent** (T-136-style): a non-dedicated trainer that rolls a TR setter/slow-strong core builds full OR
  half by context — early/committed → full; splashed / combined with weather → half.
- **Multi-gimmick:** weather + room (half) is a valid combined build — the shared slow wallbreakers benefit
  from both.

## TR mechanics (apply once the tag holds)

- Inverts turn order (slower moves first) for 5 turns. Gyro Ball hits hardest at minimum Speed → min-Speed
  natures + 0 Speed IVs on abusers (the corpus norm).
