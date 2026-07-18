# TM Reference

All 95 TMs and 8 HMs. Pool determines which move is randomly assigned to each slot each pipeline run.

## Pool Ranges

| Pool | Slots | Description |
|------|-------|-------------|
| avgDmg | TM01–TM10 | Average-power damage moves |
| goodDmg | TM11–TM30 | Good-power damage moves |
| strongDmg | TM31–TM50 | Strong-power damage moves |
| godlikeDmg | TM51–TM56 | Top-tier damage moves |
| niche | TM57–TM60 | Niche / situational moves |
| avgStatus | TM61–TM71 | Average-utility status moves |
| weather | TM72–TM75 | Fixed weather TMs (Rain Dance / Sunny Day / Sandstorm / Hail) |
| barriers | TM76–TM77 | Screen / hazard moves |
| goodStatus | TM78–TM90 | High-utility status moves |
| godlikeStatus | TM91–TM95 | Top-tier status moves |

### Doubles-only status TMs (T-152)

A few status moves are **doubles-relevant support** (Ally Switch, Coaching, Detect, Dragon Cheer →
goodStatus; Helping Hand → godlikeStatus). They live in `goodStatusMovesDoubles` /
`godlikeStatusMovesDoubles` in `tms.js` and are folded into their tier's pool **only when the run's
battle format is `doubles` or `mixed`** (`tmRandomizer.tmRanges(includeDoubles)`). A `singles` run never
assigns them. The pool *tier* of each slot is unchanged, so TM pricing (T-073) is format-independent.

---

## TM Table

| TM | Pool | Location |
|----|------|----------|
| TM01 | avgDmg | Gym reward — Roxanne (badge 1) |
| TM02 | avgDmg | Pick — Route 106 (choose 1 of 3) |
| TM03 | avgDmg | Pick — Route 106 (choose 1 of 3) |
| TM04 | avgDmg | Pick — Route 106 (choose 1 of 3) |
| TM05 | avgDmg | Pick — Route 104 (choose 1 of 3) |
| TM06 | avgDmg | Pick — Route 104 (choose 1 of 3) |
| TM07 | avgDmg | Pick — Route 104 (choose 1 of 3) |
| TM08 | avgDmg | Pick — Route 104 (choose 1 of 3, item ball near Petalburg Woods) |
| TM09 | avgDmg | Pick — Route 104 (choose 1 of 3, item ball near Petalburg Woods) |
| TM10 | avgDmg | Pick — Route 104 (choose 1 of 3, item ball near Petalburg Woods) |
| TM11 | goodDmg | Gym reward — Wattson (badge 3) |
| TM12 | goodDmg | Pick — Route 111 Bryan (choose 1 of 3) |
| TM13 | goodDmg | Pick — Route 114 Charlotte (choose 1 of 3) |
| TM14 | goodDmg | Pick — Route 114 Charlotte (choose 1 of 3) |
| TM15 | goodDmg | Pick — Route 114 Charlotte (choose 1 of 3) |
| TM16 | goodDmg | Pick — Route 109 Ricky (choose 1 of 3) / Item — Route 109 |
| TM17 | goodDmg | Pick — Route 109 Ricky (choose 1 of 3) |
| TM18 | goodDmg | Pick — Route 109 Ricky (choose 1 of 3) |
| TM19 | goodDmg | Scripted — Granite Cave (Steven gives it) |
| TM20 | goodDmg | Pick — Route 118 Deandre (choose 1 of 3) |
| TM21 | goodDmg | Pick — Route 118 Deandre (choose 1 of 3) |
| TM22 | goodDmg | Pick — Route 118 Deandre (choose 1 of 3) |
| TM23 | goodDmg | Pick — Route 112 Brice (choose 1 of 3) |
| TM24 | goodDmg | Pick — Route 112 Brice (choose 1 of 3) |
| TM25 | goodDmg | Pick — Route 112 Brice (choose 1 of 3) |
| TM26 | goodDmg | Pick — Route 114 Wilton (choose 1 of 3) |
| TM27 | goodDmg | Pick — Route 114 Wilton (choose 1 of 3) |
| TM28 | goodDmg | Pick — Route 114 Wilton (choose 1 of 3) |
| TM29 | goodDmg | Pick — Route 111 Bryan (choose 1 of 3) |
| TM30 | goodDmg | Pick — Route 111 Bryan (choose 1 of 3) |
| TM31 | strongDmg | Gym reward — Norman (badge 5) |
| TM32 | strongDmg | Gym reward — Winona (badge 6) |
| TM33 | strongDmg | Pick — Route 118 (choose 1 of 3) |
| TM34 | strongDmg | Pick — Route 118 (choose 1 of 3) |
| TM35 | strongDmg | Pick — Route 118 (choose 1 of 3) |
| TM36 | strongDmg | Pick — Route 124 (choose 1 of 3) |
| TM37 | strongDmg | Pick — Route 124 (choose 1 of 3) |
| TM38 | strongDmg | Pick — Route 124 (choose 1 of 3) |
| TM39 | strongDmg | Pick — Route 118 Rose (choose 1 of 3) |
| TM40 | strongDmg | Pick — Route 118 Rose (choose 1 of 3) |
| TM41 | strongDmg | Pick — Route 118 Rose (choose 1 of 3) |
| TM42 | strongDmg | Pick — Route 120 Clarissa (choose 1 of 3) |
| TM43 | strongDmg | Pick — Route 120 Clarissa (choose 1 of 3) |
| TM44 | strongDmg | Pick — Route 120 Clarissa (choose 1 of 3) |
| TM45 | strongDmg | Pick — Route 121 Walter (choose 1 of 3) |
| TM46 | strongDmg | Pick — Route 121 Walter (choose 1 of 3) |
| TM47 | strongDmg | Pick — Route 121 Walter (choose 1 of 3) |
| TM48 | strongDmg | Pick — Route 125 Presley (choose 1 of 3) |
| TM49 | strongDmg | Pick — Route 125 Presley (choose 1 of 3) |
| TM50 | strongDmg | Pick — Route 125 Presley (choose 1 of 3) |
| TM51 | godlikeDmg | Gym reward — Wallace/Juan (badge 8) |
| TM52 | godlikeDmg | Item — Route 121 (item ball) |
| TM53 | godlikeDmg | Item — Route 124 (item ball, Roland) |
| TM54 | godlikeDmg | Item — Route 125 (item ball, Auron) |
| TM55 | godlikeDmg | Item — Route 127 (item ball, Aidan) |
| TM56 | godlikeDmg | Item — Victory Road 1F (item ball, Quincy) |
| TM57 | niche | Pick — Route 114 Angelina (choose 1 of 4) |
| TM58 | niche | Pick — Route 114 Angelina (choose 1 of 4) |
| TM59 | niche | Pick — Route 114 Angelina (choose 1 of 4) |
| TM60 | niche | Pick — Route 114 Angelina (choose 1 of 4) |
| TM61 | avgStatus | Gym reward — Brawly (badge 2) |
| TM62 | avgStatus | Pick — Route 110 (choose 1 of 3) |
| TM63 | avgStatus | Pick — Route 110 (choose 1 of 3) |
| TM64 | avgStatus | Pick — Route 110 (choose 1 of 3) |
| TM65 | avgStatus | Pick — Route 116 Clark pick (1 of 3) |
| TM66 | avgStatus | Pick — Route 116 Clark pick (1 of 3) |
| TM67 | avgStatus | Pick — Route 116 Clark pick (1 of 3) |
| TM68 | avgStatus | Pick — Route 109 Huey (choose 1 of 3) |
| TM69 | avgStatus | Pick — Route 109 Huey (choose 1 of 3) |
| TM70 | avgStatus | Pick — Route 109 Huey (choose 1 of 3) |
| TM71 | avgStatus | Scripted — Rival Route 103 (defeat reward) |
| TM72 | weather | Fixed: Rain Dance — Item — Route 109 Chandler (Damp Rock pick) |
| TM73 | weather | Fixed: Sunny Day — Item — Route 109 Chandler (Heat Rock pick) |
| TM74 | weather | Fixed: Sandstorm — Item — Route 109 Chandler (Smooth Rock pick) |
| TM75 | weather | Fixed: Hail — Item — Route 109 Chandler (Icy Rock pick) |
| TM76 | barriers | Pick — Route 117 (choose 1 of 2) |
| TM77 | barriers | Pick — Route 117 (choose 1 of 2) |
| TM78 | goodStatus | Gym reward — Flannery (badge 4) |
| TM79 | goodStatus | Pick — Route 111 Nob (choose 1 of 3) |
| TM80 | goodStatus | Pick — Route 111 Nob (choose 1 of 3) |
| TM81 | goodStatus | Pick — Route 111 Nob (choose 1 of 3) |
| TM82 | goodStatus | Pick — Route 121 (choose 1 of 3) |
| TM83 | goodStatus | Pick — Route 121 (choose 1 of 3) |
| TM84 | goodStatus | Pick — Route 121 (choose 1 of 3) |
| TM85 | goodStatus | Pick — Route 112 Carol (choose 1 of 3) |
| TM86 | goodStatus | Pick — Route 112 Carol (choose 1 of 3) |
| TM87 | goodStatus | Pick — Route 112 Carol (choose 1 of 3) |
| TM88 | goodStatus | Pick — Route 114 Nolan (choose 1 of 3) |
| TM89 | goodStatus | Pick — Route 114 Nolan (choose 1 of 3) |
| TM90 | goodStatus | Pick — Route 114 Nolan (choose 1 of 3) |
| TM91 | godlikeStatus | Gym reward — Tate & Liza (badge 7) |
| TM92 | godlikeStatus | Item — Route 124 (item ball, Spencer) |
| TM93 | godlikeStatus | Item — Route 127 (item ball, Athena) |
| TM94 | godlikeStatus | Item — Victory Road 1F (item ball, Katelynn) |
| TM95 | godlikeStatus | Scripted — EverGrande City (rival defeat reward) |

---

## HM Table

HMs are fixed moves — not randomized.

| HM | Move | Location |
|----|------|----------|
| HM01 | Cut | Rustboro City (after Roxanne) |
| HM02 | Fly | Route 119 |
| HM03 | Surf | Petalburg City / Wally's House |
| HM04 | Strength | Lavaridge Town / Rusturf Tunnel |
| HM05 | Flash | Dewford Town |
| HM06 | Rock Smash | Mauville City |
| HM07 | Waterfall | Sootopolis City |
| HM08 | Dive | Mossdeep City |

---

## Gym TM Reward Summary

Quick reference — which TM slot each gym gives, and which pool that slot pulls from.

| Badge | Leader | TM Slot | Pool |
|-------|--------|---------|------|
| 1 | Roxanne | TM01 | avgDmg |
| 2 | Brawly | TM61 | avgStatus |
| 3 | Wattson | TM11 | goodDmg |
| 4 | Flannery | TM78 | goodStatus |
| 5 | Norman | TM31 | strongDmg |
| 6 | Winona | TM32 | strongDmg |
| 7 | Tate & Liza | TM91 | godlikeStatus |
| 8 | Wallace / Juan | TM51 | godlikeDmg |
