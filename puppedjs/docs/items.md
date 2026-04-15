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

**Pool contents:** Black Sludge, Life Orb, Assault Vest, Weakness Policy, Air Balloon, Loaded Dice, Sitrus Berry, Shell Bell, Rocky Helmet, Booster Energy

| Location | Flag | Trainer that propagates it |
|----------|------|---------------------------|
| Route 116 item ball (near Devan) | `FLAG_ITEM_ROUTE_116_X_SPECIAL` | Devan (`TRAINER_DEVAN`) — also in `rusturfGruntBag` and all bags that build on it |

> **Adding a new goodItemPool location:** see `pick-list-howto.md` for the general pattern. For single items, use `genSingleItemScript` in `itemRandomizer.js` with a `RAND_*` anchor in the map's `scripts.inc`. Wire the returned display name into `trainers.js` via `itemAssignments.yourNewKey`.

---

### Pool: `averageItemPool` — Pick-3 utility items
Shuffled once per run. Used for the "item ball pick-3" locations where the player sees a multichoice menu and picks one of three items.

**Pool contents (50 items):** Eject Pack, Light Clay, stat-boosting berries (Apicot/Salac/Petaya/Liechi/Ganlon/Kee/Maranga/Jaboca/Rowap/Custap/Leppa/Lansat/Starf/Enigma/Figy), Throat Spray, Mirror Herb, Adrenaline Orb, Red Card, Expert Belt, Terrain Extender, Shed Shell, Power Herb, Safety Goggles, White Herb, Wide/Zoom Lens, Punching Glove, Big Root, Room Service, Iron Ball ×2, Heavy-Duty Boots, Absorb Bulb, Cell Battery, Luminous Moss, Snowball, Sticky Barb, Bright Powder, Quick Claw, Muscle Band, Wise Glasses, Metronome, Grip Claw, Float Stone, Binding Band, Protective Pads, Utility Umbrella, Clear Amulet, Covert Cloak, Focus Band, Mental Herb, Blunder Policy

**Pick-3 ball locations** (player chooses 1 of 3 from this pool):

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Route 102 | `FLAG_ITEM_ROUTE_102_POTION` | Early game bags |
| Route 109 | `FLAG_ITEM_ROUTE_109_POTION` | Slateport area bags |
| Route 110 | `FLAG_ITEM_ROUTE_110_SHEDSHELL` | Route 110 area bags |
| Route 111 A | `FLAG_ITEM_ROUTE_111_ELIXIR` | Route 111 area bags |
| Route 111 B | `FLAG_ITEM_ROUTE_111_POWERHERB` | Route 111 area bags |
| Route 111 C | `FLAG_ITEM_ROUTE_111_ADRENALINE` | Route 111 area bags |
| Route 112 | `FLAG_ITEM_ROUTE_112_WHITE` | Route 112 area bags |
| Route 114 A | `FLAG_ITEM_ROUTE_114_WIDE` | Route 114 area bags |
| Route 114 B | `FLAG_ITEM_ROUTE_114_ZOOM` | Route 114 area bags |
| Route 114 C | `FLAG_ITEM_ROUTE_114_ENERGY_POWDER` | Route 114 area bags |
| Route 115 | `FLAG_ITEM_ROUTE_115_GREAT_BALL` | Route 115 area bags |
| Route 116 | `FLAG_ITEM_ROUTE_TM_BRICK_BREAK` | `route116Ball` |
| Route 124 A | `FLAG_ITEM_ROUTE_124_YELLOW_SHARD` | Route 124 area bags |
| Route 124 B | `FLAG_ITEM_ROUTE_124_IRON_BALL` | Route 124 area bags |
| Route 125 | `FLAG_ITEM_ROUTE_116_KINGS_ROCK` | Route 125 area bags |

**Mixed pick-3 locations** (some slots random from this pool, others fixed):

| Location | Flag | Slot breakdown |
|----------|------|---------------|
| Route 111 items | `FLAG_ITEM_ROUTE_111_TM_SANDSTORM` | slots 0/1 = pool, slot 2 = Custap Berry (fixed) |
| Route 116 item pick | `FLAG_ITEM_ROUTE_116_PICK_ITEM` | slots 0/1 = pool, slot 2 = TM65 (TM randomizer owns it) |
| Route 118 items | `FLAG_ITEM_ROUTE_118_BERRY` | all 4 from pool (via `route118Items`) |
| Route 120 items | `FLAG_ITEM_ROUTE_120_NEST_BALL` | all 3 from pool |
| Route 125 items | `FLAG_ITEM_ROUTE_125_BIG_PEARL` | slots 0/1 = fixed (Weakness Policy, Eject Button), slot 2 = pool |

---

### Pool: `plates` — Type-boosting plates
17 plates shuffled per run. Drawn 4 at a time for each pick-4 plate location.

**Pick-4 plate locations** (Arceus plates, player chooses 1 of 4):

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Petalburg Woods | `FLAG_ITEM_PETALBURG_WOODS_PARALYZE_HEAL` | `woodsPlatesChoice` → early bags |

---

### Pool: `gems` — Type gems
18 gems shuffled per run. Drawn 4 at a time for gem pick locations.

**Pick-4 gem locations:**

| Location | Flag | Trainer pool |
|----------|------|-------------|
| Route 104 | `FLAG_ITEM_ROUTE_104_GEM` | `choice104Gem` → bags from Roxanne onward |
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
| Route 111 | `FLAG_ITEM_ROUTE_111_CHILAN` | `choiceMelinaBerries` → bags from Wattson onward |
| Route 117 | `FLAG_ITEM_ROUTE_117_WACAN` | bags from Norman onward |
| Route 121 | `FLAG_ITEM_ROUTE_121_PICK_BERRY` | `choiceCristinBerries` → bags from Tate & Liza onward |

---

### Pool: `fullItemPool` — General cycling pool (legacy)
~44 items cycling (wraps around). Used for most pick-3 and single items not covered by other pools. New locations should prefer `goodItemPool` for high-value singles; this pool is for medium-value utility items.

---

## Fixed Single-Item Locations

Items that appear as plain item balls with no randomization.

| Location | Item | Flag |
|----------|------|------|
| Route 116 | Ether | `FLAG_ITEM_ROUTE_116_ETHER` |
| Route 116 | Repel | `FLAG_ITEM_ROUTE_116_REPEL` |
| Route 116 | Potion | `FLAG_ITEM_ROUTE_116_POTION` |
| Route 116 | Mind Plate area | `FLAG_ITEM_ROUTE_116_MIND_PLATE` |
| Various | TM map items (TM20/21/22/41/42/59/60/71/72/88) | see `tms.md` |
| Various | HMs | see `tms.md` |

---

## Trainer Bag Cascade

Bag functions in `trainers.js` are cumulative — each gym adds its items on top of the previous one. Items from pools propagate to all trainers whose bag function includes that area's pool variable.

| Bag function | Adds |
|---|---|
| `rival103Bag` | Oran Berry, Route102 ball pick |
| `petalwoodGruntBag` | + Eviolite, Petalburg plate pick |
| `roxanneBag` | + Route104 gem pick, berry pick, TM05-07 pick, TM01 |
| `rusturfGruntBag` | + Route116 ball pick, **goodItemPool (route116XSpecial)** |
| `rivalRustboroBag` | + orb pick, Route116 item pick |
| `brawlyBag` | + Dewford TM picks, Life Orb, TM61 |
| `stevenBag` | + TM19 |
| `wattsonBag` | + barrier TMs, Melina berries, gem pick, Light Clay, Assault Vest, TM11 |
| `flanneryBag` | + Nob/Claude TMs, TM78, Strength HM, White/Power Herb, Shell Bell |
| `normanBag` | + Heidi items, Safety Goggles, TM31, Surf HM |
| `winonaBag` | + Clarissa items, TM32 |
| `tateAndLizaBag` | + choice items, Grace TMs, TM91 |
| `juanBag` | + Prestly items, TM51, Waterfall HM |
