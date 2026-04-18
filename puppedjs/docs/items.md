# Item System Reference

All items in the game fall into one of several categories. The pipeline randomizes items from pools each run, so what the player finds at a given location changes every time.

---

## Item Categories

### Fixed Items
Items that are always the same regardless of the run. Never touched by the randomizer.

| Category | Items | Notes |
|----------|-------|-------|
| Starting bag | Old Rod, Mach Bike, Acro Bike, Cheri/Chesto/Pecha/Rawst/Aspear/Persim Berry | Given to player at new game |
| Orbs | Flame Orb, Toxic Orb, Sticky Barb | Route 116 orb pick (slots 0/1 fixed) |
| Premium | Choice Band, Choice Specs, Choice Scarf, Lum Berry, Leftovers, Eviolite, Focus Sash, Eject Button | `premiumItems` — not yet placed via pipeline |
| Locked | Toxic Orb, Flame Orb, Damp/Heat/Smooth/Icy Rock, Seeds ×4, Oran Berry | `otherLockedItems` — fixed where they appear |
| Drives | Douse/Shock/Burn/Chill Drive | Species-specific, not randomized |
| Specifics | Light Ball, Leek, Thick Club, etc. | Species-specific held items |
| HMs | Cut, Fly, Surf, Strength, Flash, Rock Smash, Waterfall, Dive | World locations fixed (see tms.md) |

---

### Pool: `goodItemPool` — Single-reward high-value items
Shuffled once per run. Each "good item" location in the world gets one item drawn from this pool (no choice menu — just a single item ball).

**Pool contents (10 items):** Black Sludge, Life Orb, Assault Vest, Weakness Policy, Air Balloon, Loaded Dice, Sitrus Berry, Shell Bell, Rocky Helmet, Booster Energy

**Consumed: 10 of 10** — pool is full.

| Location | Flag | Trainer that propagates it |
|----------|------|---------------------------|
| Route 106 item ball (near Ned) | `FLAG_ITEM_ROUTE_106_PROTEIN` | Ned (`TRAINER_NED`) bag/reward |
| Route 109 item ball (near Hailey) | `FLAG_ITEM_ROUTE_109_POTION` | Hailey (`TRAINER_HAILEY`) bag/reward; also in `slateportGruntsBag` |
| Route 110 item ball (near Timmy) | `FLAG_ITEM_ROUTE_110_SHEDSHELL` | Timmy (`TRAINER_TIMMY`) bag/reward; also in `rivalRoute110Bag` |
| Route 110 item ball (near Edwin) | `FLAG_ITEM_ROUTE_110_LUM` | Edwin (`TRAINER_EDWIN_1`) bag/reward |
| Route 117 item ball (near Maria) | `FLAG_ITEM_ROUTE_117_EARTHQUAKE` | Maria (`TRAINER_MARIA_1`) bag/reward |
| Route 116 item ball (near Devan) | `FLAG_ITEM_ROUTE_116_X_SPECIAL` | Devan (`TRAINER_DEVAN`) — also in `rusturfGruntBag` and all bags that build on it |
| Route 111 item ball (near Travis) | `FLAG_ITEM_ROUTE_111_HP_UP` | Travis (`TRAINER_TRAVIS`) bag/reward |
| Route 111 item ball (near Becky) | `FLAG_ITEM_ROUTE_111_GEM` | Becky (`TRAINER_BECKY`) bag/reward; also in `normanBag` and above |
| Route 118 item ball (near Barny) | `FLAG_ITEM_ROUTE_118_COBA` | Barny (`TRAINER_BARNY`) bag/reward |
| Route 120 item ball (near Angelica) | `FLAG_ITEM_ROUTE_119_ZINC` | Angelica (`TRAINER_ANGELICA`) bag/reward |

> **Adding a new goodItemPool location:** see `pick-list-howto.md` for the general pattern. For single items, use `genSingleItemScript` in `itemRandomizer.js` with a `RAND_*` anchor in the map's `scripts.inc`. Wire the returned display name into `trainers.js` via `itemAssignments.yourNewKey`.

---

### Pool: `averageItemPool` — Pick-3 utility items
Shuffled once per run. Used for the "item ball pick-3" locations where the player sees a multichoice menu and picks one of three items.

**Pool contents (54 unique items):** Eject Pack, Light Clay, stat-boosting berries (Apicot/Salac/Petaya/Liechi/Ganlon/Kee/Maranga/Jaboca/Rowap/Custap/Leppa/Lansat/Starf/Enigma/Figy), Throat Spray, Mirror Herb, Adrenaline Orb, Red Card, Expert Belt, Terrain Extender, Shed Shell, Power Herb, Safety Goggles, White Herb, Wide/Zoom Lens, Punching Glove, Big Root, Room Service, Iron Ball, Heavy-Duty Boots, Absorb Bulb, Cell Battery, Luminous Moss, Snowball, Sticky Barb, Bright Powder, Quick Claw, Muscle Band, Wise Glasses, Metronome, Grip Claw, Float Stone, Binding Band, Protective Pads, Utility Umbrella, Clear Amulet, Covert Cloak, Focus Band, Mental Herb, Blunder Policy

**Consumed: 42 draws from 54 items** — 12 items go unused per run.

**Pick-3 ball locations** (player chooses 1 of 3 from this pool):

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Route 106 | `FLAG_ITEM_ROUTE_106_CAPSULE` | `route106BallItems` → Andres (`TRAINER_ANDRES_1`) bag/reward |
| Route 102 | `FLAG_ITEM_ROUTE_102_POTION` | Early game bags |
| Route 110 (EXTENDER) | `FLAG_ITEM_ROUTE_110_EXTENDER` | `route110ExtenderBallItems` → Kaleb (`TRAINER_KALEB`) bag/reward |
| Route 111 A | `FLAG_ITEM_ROUTE_111_ELIXIR` | Route 111 area bags |
| Route 111 B | `FLAG_ITEM_ROUTE_111_POWERHERB` | Route 111 area bags |
| Route 111 C | `FLAG_ITEM_ROUTE_111_ADRENALINE` | `route111BallCItems` → Dusty (`TRAINER_DUSTY_1`) bag/reward; `normanBag` and above |
| Route 112 | `FLAG_ITEM_ROUTE_112_WHITE` | Route 112 area bags |
| Route 114 A | `FLAG_ITEM_ROUTE_114_WIDE` | Route 114 area bags |
| Route 114 B | `FLAG_ITEM_ROUTE_114_ZOOM` | Route 114 area bags |
| Route 114 C | `FLAG_ITEM_ROUTE_114_ENERGY_POWDER` | Route 114 area bags |
| Route 115 | `FLAG_ITEM_ROUTE_115_GREAT_BALL` | Route 115 area bags |
| Route 116 | `FLAG_ITEM_ROUTE_TM_BRICK_BREAK` | `route116Ball` |

**Mixed pick-3 locations** (some slots random from this pool, others fixed):

| Location | Flag | Slot breakdown |
|----------|------|---------------|
| Route 111 items | `FLAG_ITEM_ROUTE_111_TM_SANDSTORM` | slots 0/1 = pool, slot 2 = Custap Berry (fixed) |
| Route 116 Clark pick | `FLAG_ITEM_ROUTE_116_PICK_ITEM` | all 3 = TM65/66/67 — TM randomizer owns all slots (see `tms.md`) |
| Route 118 items | `FLAG_ITEM_ROUTE_118_BERRY` | all 4 from pool (via `route118Items`) |

---

### Pool: `plates` — Type-boosting plates
17 plates shuffled per run. Drawn 4 at a time for each pick-4 plate location.

**Pick-4 plate locations** (Arceus plates, player chooses 1 of 4):

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Petalburg Woods | `FLAG_ITEM_PETALBURG_WOODS_PARALYZE_HEAL` | `woodsPlatesChoice` → early bags |
| Route 117 (near Lydia) | `FLAG_ITEM_ROUTE_117_GREAT_BALL` | `route117PlateItems` → Lydia (`TRAINER_LYDIA_1`) bag/reward |

---

### Pool: `gems` — Type gems
18 gems shuffled per run. Drawn 4 at a time for gem pick locations.

**Pick-4 gem locations:**

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Route 104 | `FLAG_ITEM_ROUTE_104_GEM` | `choice104Gem` → bags from Roxanne onward |
| Route 116 | `FLAG_ITEM_ROUTE_116_ETHER` | `choice116Gem` → Sarah (`TRAINER_SARAH`) bag/reward |
| Route 117 | `FLAG_ITEM_ROUTE_117_GROUNDGEM` | `choiceAishaGems` → bags from Wattson onward |

---

### Pool: `protectionBerries` — Type-resist berries
18 resist berries (one per type) shuffled per run. Drawn 4 at a time for berry pick locations.

**Berry assignment** (the 18 berries mapped to types):
Chilan (Normal), Occa (Fire), Passho (Water), Wacan (Electric), Rindo (Grass), Yache (Ice), Chople (Fighting), Kebia (Poison), Shuca (Ground), Coba (Flying), Payapa (Psychic), Tanga (Bug), Charti (Rock), Kasib (Ghost), Haban (Dragon), Colbur (Dark), Babiri (Steel), Roseli (Fairy)

**Pick-4 berry locations:**

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Route 104 | `FLAG_ITEM_ROUTE_104_X_ACCURACY` | `choice104Berry` → bags from Roxanne onward |
| Route 116 | `FLAG_ITEM_ROUTE_116_POTION` | `choice116Berry` → Karen (`TRAINER_KAREN_1`) bag/reward |
| Route 111 | `FLAG_ITEM_ROUTE_111_CHILAN` | `route111BerryItems` → Drew (`TRAINER_DREW`) bag/reward; `normanBag` and above |
| Route 117 | `FLAG_ITEM_ROUTE_117_WACAN` | bags from Norman onward |
| Route 121 | `FLAG_ITEM_ROUTE_121_PICK_BERRY` | `choiceCristinBerries` → bags from Tate & Liza onward |

---

## Fixed Single-Item Locations

Items that appear as plain item balls with no randomization.

| Location | Item | Flag |
|----------|------|------|
| Route 116 | Repel | `FLAG_ITEM_ROUTE_116_REPEL` |
| Route 116 | Mind Plate area | `FLAG_ITEM_ROUTE_116_MIND_PLATE` |
| Various | TM map items (TM41/42/59/60/88) | see `tms.md` |
| Various | HMs | see `tms.md` |

---

## Trainer Bag Cascade

Bag functions in `trainers.js` are cumulative — each gym adds its items on top of the previous one. Items from pools propagate to all trainers whose bag function includes that area's pool variable.

| Bag function | Adds |
|---|---|
| `rival103Bag` | Oran Berry, Route102 ball pick, TM71 (avgStatus scripted) |
| `petalwoodGruntBag` | + Eviolite, Petalburg plate pick |
| `roxanneBag` | + Route104 gem pick, berry pick, TM05-07 pick, TM01 |
| `rusturfGruntBag` | + Route116 ball pick, **goodItemPool (route116XSpecial)** |
| `rivalRustboroBag` | + orb pick, Route116 item pick |
| `brawlyBag` | + Dewford TM picks, Life Orb, TM61 |
| `slateportGruntsBag` | + **goodItemPool (route109GoodItem)** |
| `rivalRoute110Bag` | + Isabel TMs pick, **goodItemPool (route110GoodItem)**, Extender ball pick |
| `stevenBag` | + TM19 |
| `wattsonBag` | + barrier TMs, Melina berries, gem pick, Light Clay, Assault Vest, TM11 |
| `flanneryBag` | + Nob/Claude TMs, TM78, Strength HM, White/Power Herb, Shell Bell |
| `normanBag` | + Drew berries, Heidi items, Dusty ball, Becky good item, Bryan TM pick, TM31, Surf HM |
| `winonaBag` | + Clarissa strongDmg TM pick, TM32 |
| `tateAndLizaBag` | + Tammy TMs, Cristin berries, Walter strongDmg TM pick, Isabella choice items, Grace strongDmg TM pick, TM92 (Spencer), TM53 (Roland), TM91 |
| `spaceCenterBag` | + Presley strongDmg TM pick, TM54 (Auron) |
| `juanBag` | + TM55 (Aidan), TM93 (Athena), Eject Button (route 127), TM51, Waterfall HM |
