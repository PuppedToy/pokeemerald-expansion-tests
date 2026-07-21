# Changelog (Brooktec)

Project-version history for the Brooktec randomizer/analysis work in this repo.
This is **separate** from the upstream game changelog in `CHANGELOG.md`.

Format: [Keep a Changelog](https://keepachangelog.com/en/1.1.0/). Versioning: [SemVer 2.0](https://semver.org/). Each line references the task/bug that produced it.

## [Unreleased]

### Added

- **Greninja Battle Bond is now a proper standalone threat.** The Battle Bond form is treated as a
  solo Pokémon that can show up in the wild or on a trainer — but never alongside the normal Froakie
  line (if one appears, the other stays out of that run). It is rated as the powerful Ash-Greninja it
  transforms into (a 70% Ash / 30% Battle Bond blend), and a trainer that fields it builds its moves,
  item and nature around Ash's stats. Ash-Greninja itself is never handed out directly — it only
  exists as the form Battle Bond becomes in battle. (T-185)

- **The config screen warns before a big run goes to the slow build queue.** When your chosen number of
  ROMs (Nuzlocke count, or Soul-Link players × ROMs-per-player) exceeds the fast-queue limit of 2, an
  inline warning appears next to the ROM-count field telling you the build will be de-prioritised into
  the slow queue and may take longer. It updates live and hides again at or below the limit. (T-172)

- **The docs flag shiny Pokémon.** When "Show IVs" is on, any trainer Pokémon whose IV total is 150 or
  more now has its IVs tinted gold with a small ★ at the end — mirroring the game rule that a 150+ IV
  total makes a Pokémon shiny. (T-168)

- **The move relearner now charges money based on each Pokémon's move history.** Relearning a move
  the Pokémon has never actually had is free (`¥0`, shown in green); relearning a move it has had
  before — from its initial moveset when caught or from a level-up — costs `¥250` (shown in
  dark gray, or red and unselectable when you can't afford it). Each Pokémon remembers which
  level-up moves it has ever learned (preserved through the PC and remapped on evolution). The
  price is shown in the relearn screen, which is now reached from the Pokémon summary screen
  (START on the moves page); the Fallarbor move-tutor NPC no longer teaches moves. (T-167)

### Changed

- **Wonder Guard is now a real, earnable ability instead of a Shedinja-only quirk.** The "always 1 HP" rule
  is tied to the ability, not the species: any Pokémon that has Wonder Guard has 1 HP, and a Shedinja that
  ends up without it gets its real HP. Shedinja's base HP was raised to 221 so its stat total matches base
  Ninjask (relevant only if it loses Wonder Guard). The randomizer can now hand Wonder Guard to other
  Pokémon, and the rater understands it: a Wonder Guard Pokémon is graded on its typing (how few weaknesses
  it has and whether it dodges poison/burn/sandstorm chip), not its defenses, and is always rated at least
  UU. The ability's in-game description now reads "1 HP. Only supereffective hits." (T-184)

- **Shedinja is now caught the normal way — with a Dusk Stone.** Nincada is a branched evolution:
  level it up for Ninjask, or use a Dusk Stone (once it's high enough level) for Shedinja. This
  replaces the old hidden trick of needing a spare party slot and a spare Poké Ball. The Dusk Stone's
  required level, like every other stone evolution, is rolled per randomization. (T-183)

- **The intro is cleaner: no bogus "leveled up" message, and Professor Birch hands you your starting
  gear himself.** After you save Birch from the Zigzagoon, the game no longer flashes a "Your Pokémon
  have leveled up to 8!" fanfare — the intro was never a level-cap milestone (the cap is 8 from the
  very start), so your starter and its 9 companions now simply begin *at* the cap. And instead of the
  starting items silently appearing in your bag before the game even begins, Birch now gives them all
  to you on Route 101 right after your Pokémon — the Evolve Candy, the Balls, the rods, bikes and
  status berries — with a single "received …" message. Your bag starts empty until then. (T-182)

- **Trainers value move accuracy more aggressively.** A move's worth now scales with its hit chance
  (expected value) instead of losing a flat penalty per missing accuracy point, so a strong shaky move
  can beat a weaker reliable one: Fire Blast is now preferred over Flamethrower, and Focus Blast sits
  about level with Aura Sphere — while reliable high-power moves (e.g. Close Combat) still rank at the
  top. The old "never misses" bonus is much smaller now (it rarely mattered in practice). Trainers also
  avoid stacking shaky moves: the first inaccurate move is fine, but a second one is discouraged, so
  teams keep a mix of reliable and high-risk attacks. Accuracy-fixing abilities (No Guard, Compound
  Eyes, Victory Star) and rain/snow are taken into account, so those mons treat their shaky moves as
  reliable. (T-181)

- **Trainers place held items across the whole team optimally, not first-come-first-served.** Items used to
  be handed out one Pokémon at a time in team order, so an early Pokémon could grab an item a later teammate
  needed more. The selector now assigns items across the entire team at once to maximise the team's total
  item fit (respecting single copies and 3-choice packs), so the result no longer depends on the order the
  Pokémon are built in. (T-180)

- **Trainers use their held items much more sensibly.** The item selector now reasons about ~40 more items
  instead of equipping them almost at random: pinch berries land on attackers with a way to trigger them
  (Endure/Sturdy/Unburden), Cell Battery/Absorb Bulb/Snowball go to the right attacker and never to a mon
  immune to their trigger type, Wide/Zoom Lens go to mons with an imprecise move (Zoom Lens only on slow
  ones), Muscle Band/Wise Glasses respect the attacking stat, trapping items (Grip Claw/Binding Band) need a
  binding move, Trick-Room items (Room Service/Iron Ball) need a Trick Room team, Mental Herb goes to
  setup/hazard leads, and the flat/random handlers (Custap, Eject Button/Pack, Red Card, Mirror Herb,
  Adrenaline Orb, Kee/Maranga/Jaboca/Rowap berries) are re-derived to their actual archetype. (T-179)

- **Pickup no longer hands out free items after battles.** The ability keeps its in-battle effect —
  after a turn, a holder with no item may pick up an item a foe used up — but its out-of-battle item
  find (the random per-battle item faucet, including the Battle Pyramid variant) has been removed, so
  it can no longer be farmed for infinite money. Its in-game description now reads "Picks up items foes
  have used." (T-173)

- **Honey Gather now works in battle instead of handing out free Honey.** Previously it did nothing in
  combat and simply gave the holder a Honey after battles (a second money faucet). It now does exactly
  what Pickup does — at the end of a turn, a holder with no item picks up an item a foe used up — and
  shares Pickup's description ("Picks up items foes have used."). Its out-of-battle Honey find is
  removed. (T-174)

- **Pay Day (and Make It Rain / Gold Rush) no longer scale into a money printer.** Instead of scaling
  with the user's level and stacking every use, a coin-scattering move now pays a flat **¥125 in
  trainer battles only** and **¥0 in the wild**, regardless of level or how many times it is used. The
  in-battle "coins scattered" effect is unchanged. (T-175)

- **Trainer rematches are gone.** No trainer becomes available for a rematch anymore — not regular
  trainers (whether triggered by walking around or by a Match Call phone request) and not gym leaders
  after the Elite Four. This removes the last repeatable-prize-money source. (T-176)

- **Secret Base battles give no money.** Winning a Secret Base battle used to pay a level-scaled reward;
  it now pays ¥0, closing another repeatable money source. (T-177)

### Fixed

- **Heavy-Duty Boots are now actually valued when a trainer holds them.** A name mismatch (the bag delivers
  "Heavy Duty Boots" but the rater only matched "Heavy-Duty Boots") meant the item was never scored and was
  handed out essentially at random; it now gets its intended Rock-immunity-aware rating. (B-047)

- **Caught Pokémon are fully healed on capture.** A wild Pokémon caught with a status condition (e.g.
  paralysis) no longer keeps it — most visibly when the party is full and it is sent to the PC, where it
  previously stayed statused. On capture the Pokémon is now fully restored (HP, PP and status),
  regardless of whether it joins the party or goes to the box. (T-178)

- **Villain-grunt mascots no longer inherit their leader's perfect IVs.** The early Aqua/Magma grunts
  lead a devolved copy of their leader's signature mega (Archie's Mega Sharpedo → Carvanha, Maxie's Mega
  Camerupt → Numel). That mascot was silently getting the leader's perfect (all-31) IVs because it shared
  the leader's internal IV slot; it is now bred independently — same family, ordinary IVs. The leaders
  themselves keep their perfect favourites. (B-044)

- **Cosmetic-family representatives now show their base name in the docs.** After the cosmetic strip
  kept one form per family, the docs still displayed the surviving form's suffix — e.g. "Spewpa Icy
  Snow" (a Vivillon-only wing pattern that Spewpa never shows), "Furfrou Natural", "Alcremie Strawberry
  Vanilla Cream". They now render as plain "Spewpa", "Furfrou", "Alcremie", etc. (Scatterbug/Spewpa/
  Vivillon, Flabébé/Floette/Florges, Furfrou, Alcremie). (B-043)

- **Classic wild encounters now show every species in the docs.** In Classic mode each zone holds
  several species per method, but the docs (Encounters tab + Pokédex "obtainable" filter) previously
  showed only one per zone. They now list all of them; each is independently trackable, and the
  Nuzlocke "one per route" capture picks which one you caught. Deterministic mode is unchanged. (B-041)

### Added

- **Start with a full stock of catch balls; balls removed from the world.** New games now begin with
  99 each of Ultra, Quick, and Timer Balls in the bag. Since those are no longer scarce, every
  non-Master Poké Ball has been removed as a world pickup (22 floor item balls + 5 hidden balls) and
  every free NPC ball gift now gives nothing (dialogue and progression flags — e.g. Wallace's
  Waterfall — are unchanged). Master Balls (hand-placed) are untouched, and paid/traded ball
  exchanges (Lava Cookie, Soda Pop, Shell Bell, Stern's Scanner, Cozmo's Meteorite) are preserved so
  the player never loses money or an item for nothing. Nature Mints have also been removed as floor
  pickups (24 slots across 18 maps); mints remain available to buy in Marts. (T-166)

- **Disable Steven tag battle (Trainers & bosses).** A new option, off by default, turns the Mossdeep
  Space Center tag battle (you + Steven vs Maxie + Tabitha) into a normal battle against Tabitha alone:
  Steven takes on Maxie while you face Tabitha as a regular boss (single or double, per your battle-format
  settings) that prefers a sandstorm team. The number of bosses and the story after the fight are
  unchanged, and the docs show it as a normal, non-tag boss. Off reproduces the vanilla tag battle
  exactly. (T-165)

- **Docs visibility settings.** A new config section controls what the generated documentation reveals
  — never the ROM itself, only the docs. For trainers: hide the whole Trainers tab, hide bosses or
  ordinary trainers, hide held items / natures / moves / ability / rewards, show IVs (off by default),
  show exact team positions (moved here), and "hide some Pokémon" (collapse the last 1–5 of every team
  into an "(and X other Pokémon)" box). For encounters: hide wild encounters (leaving only starters and
  rewards), hide legendary / non-legendary static encounters (also from the Mail inbox), and hide
  super-rod (shown as "Super-Rod encounter 1, 2, …") or grass / surf / dive / good-rod / old-rod
  encounters (shown as just a count). Hidden information is stripped from the docs, not merely hidden on
  screen. Every default reproduces today's docs. (T-163)

- **Wild encounter type: Deterministic or Classic.** A new option lets each zone hold either a single
  predictable Pokémon per method (**Deterministic**, the default — you can tell exactly what every
  route, cave and rod gives you) or several (**Classic**, with a "Pokémon per zone" count, default 5 —
  you never know which you'll meet, like the original games). Encounters are now generated in sweeps
  across all zones to keep duplication minimal and spread out, drawing from tier/evo pools that
  regenerate only when exhausted. The super rod (shared across zones) and static/legendary encounters
  are unaffected. (T-162)

- **Trainers that draw from wild encounters follow the new pools.** Route trainers whose team pulls
  "the Pokémon of this route" now get a random one of that zone's encounters (in Classic, one of the
  several); the rival, who fields the wild Pokémon obtainable so far, now considers **all** of them.
  As part of this, the rival's obtainable pool gained the **Surf** encounters (available once you beat
  Norman, like the Good Rod) and **Jagged Pass**, which were missing from earlier versions. (T-162)

- **Type: Null and Silvally are back**, with Silvally unified onto the same mechanic as Arceus: it now
  has Multitype and changes type with a held **Plate** (instead of RKS System + Memories), and its
  signature move Multi-Attack becomes the Plate's type. It gets the same trainer/rating treatment as
  Arceus; Type: Null is a plain Normal Pokémon. (The old Memory items are no longer needed.) (T-158)

- **Arceus is back in the randomizer** as its Normal form (its 17 type forms stay unavailable). Trainers
  understand its Multitype gimmick: a Multitype Arceus always carries Judgment, values any Plate it can
  hold (the Plate turns Judgment into that type, with a bonus for new coverage), and a type-restricted
  trainer counts Arceus toward its type theme when a matching Plate is already in that trainer's bag
  (T-156).

- **Burmy and Ogerpon are back in the randomizer.** Like Deerling, each of their forms (Burmy's three
  cloaks, Ogerpon's four masks) is treated as a distinct Pokémon that can randomize on its own, but only
  one form of each appears in the wild per run while trainers may field any. Burmy still evolves into
  Wormadam by level and into Mothim with a Dawn Stone. Ogerpon's battle-only Terastal forms are excluded
  (T-157).

- **Genesect and Minior are back in the randomizer.** Genesect appears as its base form (its Drive
  forms stay unavailable). Minior appears as its Meteor form; because Shields Down flips it to the
  offensive Core form at low HP, its rating is a weighted blend of both forms, so trainers value it as
  the fast sweeper it becomes (T-155).

- **Unown, Vivillon, Flabébé, Furfrou and Alcremie are back in the randomizer.** These families were
  previously dropped because their many purely-cosmetic forms (28 Unown letters, 20 Vivillon patterns,
  63 Alcremie decorations, …) could not be handled. They now appear as a single representative form
  each, so they can roll into wild encounters and trainer teams without cluttering the Pokédex with
  thousands of identical entries (T-153, T-154).

- **More moves can roll onto TMs, including doubles-only support TMs.** 39 more real Pokémon TM moves
  are now in the randomized TM pools — extra average/good/strong damage (Fire Spin, Dynamic Punch, Sky
  Attack, …), average status (Confuse Ray, Gravity, Imprison, Teleport, …), niche (Bide, Counter, Natural
  Gift, Nature Power) and more — so each run's TM set has more variety. Five doubles-support moves (Ally
  Switch, Coaching, Detect, Dragon Cheer, Helping Hand) are **doubles-only**: they only join the TM pool
  when the run's format is doubles or mixed, never in singles (T-152).

- **The Museum and Space Center grunt "gauntlets" now read as one back-to-back fight.** The 2 Slateport
  Museum grunts and the 3 Mossdeep Space Center grunts each count as a single unit when balancing the
  singles/doubles mix (so a gauntlet is all-singles or all-doubles, never split), and every one carries a
  "Gauntlet Battle N" badge (its number within the run — Museum 1-2, Space Center 1-3) in every format (T-145).

- **Mixed battles can now run "first half singles, second half doubles".** A new opt-in checkbox in the
  Mixed panel makes the early game single battles and the later game double battles, switching at a boss
  chosen by the singles % (a higher % pushes the switch later). Left off (the default), single and double
  battles stay interleaved across the whole game as before. Works alongside League Run & Bun (the Elite Four
  keep their in-game singles-or-doubles choice) (T-146).

- **Doubles now has its own tier list, shown next to singles in the docs.** Every Pokémon is rated
  twice — once for singles, once for doubles — with the doubles rating re-weighted for the 6v6 meta
  (bulk over raw speed, a premium on spread damage and support) on its own tier scale. Raw BST still
  paces both formats — a high-BST Pokémon can't drop below its BST-implied tier in doubles either, so
  the nuzlocke difficulty ramp holds — and the viewer now shows both tiers side by side on every
  Pokémon, *Singles │ Doubles*, with the shared role below (T-097, T-140, T-111).

- **Double-battle trainers now build doubles-shaped teams.** A double-battle trainer's power budget is
  measured on the doubles tier list, and its team is assembled from the doubles archetypes — so a doubles
  boss fields a genuinely different, format-appropriate team from the same trainer run as singles
  (Sidney's doubles team leans on redirection + Tailwind, Drake's on a dual-mode balance core). Singles
  trainers are completely unaffected (T-109).

- **Doubles teams now field dedicated support, like real competitive doubles.** The support Pokémon that
  define the meta — redirectors (Follow Me / Rage Powder / Lightning Rod), Fake Out / Wide Guard / Helping
  Hand users, Intimidate pillars, Friend Guard / Hospitality allies — are recognised as a distinct role,
  rated up for doubles (a support Sinistcha climbs from RU to OU off its Hospitality + Rage Powder kit),
  and most doubles archetypes now reserve a slot for one (plus a new redirection-support archetype).
  Support is scored by tool QUALITY, not breadth: each support move/ability is worth elite / good / filler
  points, so a real support COMBINATION (2 elite tools → UU, 3+ → OU) is rewarded while a pile of mediocre
  moves is not — and a strong offensive tier discounts the score, so a good attacker isn't mislabelled a
  support. A fielded support now also PLAYS support: it's built with its best support moves (not an
  all-attacking set) and is never handed a status-locking item (Assault Vest / Choice). The decision log
  prints the full support ranking behind each pick — every eligible support scored and itemised, the pick
  marked — so *why this support, and why OU/UU* is auditable. Support moves and abilities are valued for
  doubles (Encore, Prankster, Defiant/Competitive punishing the ubiquitous Intimidate). And ally-only
  abilities that do nothing in a 1v1 — Commander, Hospitality, Costar, Power Spot — no longer inflate a
  Pokémon's SINGLES rating (T-102, T-141, T-142).

- **Weather teams now field their BEST abusers, ranked by how well each exploits the weather.** Instead of
  any boosted-type mon, a sophisticated weather trainer prefers real ability-abusers (Chlorophyll / Solar
  Power / Protosynthesis in sun, Swift Swim in rain, Sand Rush in sand, …), each scored by the stat it
  scales, with sophistication pulling the pick toward the top of the ranking. The decision log shows the full
  eligible ranking + why each scored what it did (T-135).

- **Electric Terrain and Trick Room are real team archetypes now, like weather.** A trainer commits to the
  gimmick by building it — an Electric Terrain team gets a setter (Tapu Koko-style Electric Surge / Hadron
  Engine) plus abusers (Surge Surfer, Quark Drive, Unburden + Electric Seed, hard-hitting Electric-types),
  and a Trick Room team gets the Trick Room setter plus slow, hard-hitting abusers that move first under it.
  Wattson now builds Electric Terrain and Tate & Liza a full Trick Room. And, like weather, any sufficiently
  skilled trainer that happens to roll the pieces (a terrain setter, or a slow-strong core) builds the gimmick
  emergently or cleanly drops it — grounded in the competitive corpus (T-137).

- **Trainers recognise the perish-trap combo.** A Shadow Tag / Arena Trap trapper that can learn Perish
  Song (Gothitelle, Mega Gengar) now carries it — the trapped foe can't switch out of the 3-turn count —
  in both singles and doubles. In doubles, a support-leaning teammate of a trapper sings it too (the split
  version, e.g. a Wobbuffet partner). It's a lightweight move-combo, not a forced archetype. The
  non-electric terrains (Misty/Grassy/Psychic), by contrast, aren't forced as team gimmicks — the corpus
  shows they're a lone mon's tool, so a doubles team just leans into one it happens to have (a Grassy Surge
  team prefers Grassy Glide, a Psychic Surge team Expanding Force). Screens stay a light utility role
  (T-124).

- **Trainer items are meaningful picks now, not random noise.** At every world point where the player picks
  one item from a group (Choice Band/Specs/Scarf, the type plates, the type gems, the resist berries, the
  pick-3 TM lists…), trainers mirror it: a trainer holds the whole group and only "spends" the pick when one
  of its Pokémon actually equips/teaches an option — the alternatives are then dropped from that trainer's
  own bag, exactly as the player would forgo them at that spot. A strong attacker that can reach a Choice
  item now gets it up front and builds an all-attacking set (Choice Band for physical, Specs for special,
  Scarf for a fast revenge killer). Loose/buyable copies are spent before touching a pick-group (T-129, T-133).

- **Recurring bosses now have consistent teams across the game.** The rival (May/Brendan), Steven and
  Wally build their strong endgame roster first and their earlier appearances show the SAME Pokémon at a
  level-appropriate evolutionary stage (Champion Steven's Metagross ↔ Granite Cave Metang; the rival's
  Ever Grande starter ↔ its Route 103 baby). Steven's Granite Cave hard tier-cap is gone (he devolves his
  final roster until it's legal). The decision log spells out what is inherited and how it devolves (T-106).

- **"Favourite Pokémon" — every character trainer builds around a preferred ace.** Each gym leader
  (its signature, e.g. Roxanne→Nosepass, Brawly→Hariyama), the villains (Archie→Kyogre + Mega Sharpedo,
  Maxie→Groudon + Mega Camerupt, …), the Elite Four, Steven (Mega Metagross) and Wally (Mega Gardevoir/
  Gallade) resolve their favourite FIRST: it CLAIMS a slot from the difficulty-scaled preset pool of its
  exact tier — or the mega slot (gated by a game-wide story-progression rule that evaluates the base form)
  if it is a mega — and DROPS to the trainer's type-restricted fallback when it doesn't fit, never
  downgrading. Trainer types are now a single trainer-level restriction, not per-slot hardcoding (T-128).

- **Weather leads go first, and tag partners share weather.** A weather team sends its setter out first
  (95%, ahead of a Stealth Rock lead) so the weather is up turn 1. In the Mossdeep tag battle, Tabitha
  no longer runs her own sandstorm — she abuses whatever weather Maxie sets (his Groudon's sun), or builds
  a normal team if he sets none. Team Aqua/Magma leaders' signature legendaries (Kyogre, Groudon) are
  now "liked" mascots — strong but not perfect-IV (T-132).

- **Weather villains now actually build their weather.** The themed weather teams field a real
  setter + 2 abusers of their weather: Team Aqua rain (Museum grunt, Archie) and snow/hail (Museum grunt,
  Matt); Team Magma sun (Maxie) and sandstorm (Tabitha). The team is built under a tentative weather tag
  (the setter picked first, then abusers, with weather-synergy moves surfaced across the team) and, if the
  restricted roster can't support the setter + 2 abusers, it cleanly rolls back to another weather or a
  normal team — never a half-built gimmick. Sand and hail count Rock / Ice cores as abusers (their ×1.5
  SpDef / Def is the payoff), matching how rain/sun teams lean on boosted-STAB attackers (T-131, T-132).

- **Skilled trainers now build weather they stumble into — no longer just the themed villains.** A
  non-dedicated trainer that happens to roll a weather setter (a Kyogre, Politoed, Torkoal…) now builds
  that weather properly around it — setter + 2 abusers, chosen by the same ranking the villains use —
  instead of leaving the setter idle; if it can't gather two abusers it keeps a normal team. This only
  kicks in from mid-game skill upward. Flannery is no longer forced into sun: she runs it only when her
  Fire roster naturally rolls a setter, and stays a normal Fire team otherwise (T-136).

- **"Next boss" is a shortcut in the docs.** Clicking the top-bar *Next boss* stat jumps to the
  Trainers tab and scrolls that boss's card into view (with a brief highlight). Keyboard-accessible
  (T-082).

- **Item descriptions on hover in the generated docs.** Hovering a Pokémon's held item or a
  trainer's reward on the Trainers tab now shows the item's in-game description (parsed from
  `src/data/items.h`), matching the existing ability/move/nature tooltips. `TM <Move>` rewards
  show the taught move's description (T-078).

### Fixed

- **Always-crit moves are valued for their guaranteed critical hit.** Wicked Blow, Surging Strikes,
  Storm Throw, Frost Breath, Zippy Zap and Flower Trick always land a critical hit, but the rater scored
  them on raw power only — so Urshifu would pass over Wicked Blow. They now carry the ×1.5 crit damage
  plus a small bonus for a crit ignoring the target's defensive boosts and screens (Reflect / Light
  Screen / Aurora Veil), so trainers pick these signature moves as the strong options they are (T-160).

- **A Pokémon never runs two status-condition moves.** A target can only ever hold one non-volatile
  status, so combos like Toxic + Will-O-Wisp or Thunder Wave + Spore were pointless. A set now keeps at
  most one status-infliction move and fills the freed slot with something useful (T-159).

- **Trainers no longer keep a charge move they can't actually use.** A two-turn move (Solar Beam, Fly,
  Sky Attack, Meteor Beam, …) could stay on a team member that never ended up holding the Power Herb it
  needs, because the pick was made on "a Herb is somewhere in the bag" rather than "this Pokémon holds
  one." The set is now re-checked once the held item is final and the orphaned charge move is swapped for
  a real one (T-159).

- **Weakness Policy is no longer handed to Pokémon that can't use it.** It only goes on a Pokémon whose
  set has a move that actually benefits from its Attack/Sp. Atk boost — never on a pure support/wall whose
  only moves are status (or fixed/reactive damage) (T-159).

- **Belch is no longer taught to a Pokémon without a Berry.** It needs a consumed Berry to work at all,
  so a berryless Pokémon never receives it, and it is dropped in the final move-check if the held item
  turns out not to be a Berry (T-159).

- **The player does the little hop again when stepping out of the truck.** The intro change that skips
  going home (so you head straight to save Birch) had also skipped the hop off the truck. The hop is
  back — and only the hop; the go-straight-to-Birch flow is unchanged (B-039).

- **The Wally Lilycove battle no longer plays the level-up fanfare twice.** Beating Wally at Lilycove
  fired a stray, message-less level-cap fanfare right after the battle, then the real one with the
  "leveled up to N" message moments later. The redundant jingle is gone; the encounter now plays a
  single, message-paired fanfare like every other milestone (B-038).

- **The "Your Pokémon have leveled up to N!" messages now always show the real cap.** Every level-cap
  fanfare message used to hard-code its number, so it drifted whenever a cap changed (and was already
  wrong at Mt Chimney after Maxie's fight was removed). Each message now reads the level straight from
  the caps SSOT (`src/caps.c`) — it prints exactly the level your party was raised to — so it can never
  desync again, for any cap configuration (T-151).

- **Villain leaders now pick a signature mega that fits their team's actual types, and their grunts
  foreshadow it faithfully.** Archie/Maxie used to force Mega Sharpedo / Mega Camerupt as long as the mega
  shared *any* one of the faction's five types — so a reconfigured Aqua/Magma theme fielded an off-theme
  mega, and the grunt's baby "mascot" (the leader's mega devolved) inherited the mismatch. The signature is
  now used only when it genuinely fits (its types are the faction's primary + secondary, or at least the
  primary); otherwise the leader picks the best on-theme mega — preferring one whose pre-evolution stays
  on-type so the grunt's devolved mascot reads correctly — and, in the rare case nothing fits, drops the
  mega slot with a warning instead of forcing a bad pick. Each grunt now also has its own fallback (a mon of
  both faction types, then the primary, then any) when the leader commits no mega. With the default themes
  Archie still leads Mega Sharpedo → Carvanha and Maxie Mega Camerupt → Numel, exactly as before (T-144).

- **Wally's Victory Road team regains its legendary + ubers ace.** His endgame roster had silently lost its
  two ultimate aces (a legend + an ubers) in the backwards-generation rework — Victory Road was fielding six
  ordinary continuity mons instead. It now correctly fields his four signature Pokémon (which follow him,
  devolved, all the way back to Mauville) plus a legendary and an ubers ace brought out only for the final
  battle. Lilycove keeps the four VR signatures + two of its own UU mons (which also appear devolved at
  Mauville), so the three encounters tell one continuous story (B-033).

- **Doubles Trick Room trainers keep their full team recipe.** Tate & Liza (and any Trick-Room-seeded
  doubles trainer) referenced a base-archetype id that exists only in the singles model, so in a doubles
  run their base recipe was silently dropped and only the Trick Room gimmick steered the team. The seed
  base now resolves to the doubles model, restoring the full recipe (B-032).

- **Wattson's Mega Manectric ace now devolves properly.** When Mega Manectric can't be placed (its
  progression gate isn't met that run), Wattson keeps his signature line — Mega Manectric → Manectric →
  Electrike → any eligible Electric mon — instead of jumping straight to a random Electric Pokémon (B-031).
- **No more Choice items on the wrong Pokémon.** A Choice item (Band/Specs/Scarf) locks its holder into
  one move, so it is no longer assigned to a Pokémon whose set carries a move it must not be locked into —
  any status/hazard/setup move, or a reactive move (Counter/Mirror Coat/Metal Burst). Champion Steven's
  Solgaleo no longer runs Choice Specs alongside Stealth Rock / Metal Burst; it gets a non-locking item
  instead. Damaging pivots (U-turn/Volt Switch) still pair with Choice, as they should (T-129).

- **Trainers can no longer teach a TM the player hasn't reached yet.** An archetype role move (or a
  team's `tryToHaveMove`) could inject a teachable move regardless of TM access — e.g. Wattson's Oricorio
  running Volt Switch, whose TM only appears much later (Auron / Mossdeep Space Center). Injected moves now
  respect the incremental TM bag, exactly like the normal moveset selection (B-030).

- **Recurring bosses show in the right order in the docs again.** Building each recurring character's
  team back-to-front no longer reorders how they're LISTED: the docs show them in story order (May Route
  103 → … → Ever Grande; Granite Cave Steven → Champion; Wally Mauville → Victory Road) (B-029).

- **Wally / rival "no repeated types" now actually holds.** The restriction that keeps these trainers
  from stacking same-typed Pokémon read the type list off the wrong object and never fired; their teams
  now genuinely avoid repeated types (B-027).

- **ROM build no longer aborts on form-species held items.** The writer strips wild held items by
  rewriting `.itemCommon`/`.itemRare` lines, but dropped the trailing `\` on the two such fields that
  live inside multi-line `#define ..._SPECIES_INFO`/`..._MISC_INFO` macros (Mothim, Minior). That broke
  the macro and corrupted `gSpeciesInfo[]`, failing the `make` compile with `-Werror`. The continuation
  is now preserved (B-025).

- **Docs viewer: evolution mails now fire for low-level evolutions.** Evolutions available at or below
  the first level cap (e.g. a run with all evolutions at level 5, or any level-0/immediate evo) never
  produced a Mail notification, because the mail windows started at the first cap. They're now surfaced
  with the first boss defeat (B-024).

- **Docs viewer: clicking an evolved encounter opens the evolved species.** In the Encounters tab,
  a captured encounter marked as evolved shows the evolved species in green; clicking it now opens
  that evolved species' detail modal instead of the captured base form (B-023).

### Changed

- **The Lavaridge Town egg woman no longer gifts a Wynaut egg.** Because the town's gym leader already
  hands out a gym-reward Pokémon, the egg was a duplicate encounter. She now keeps an egg-themed line
  (reminiscing about hatching eggs in the hot sand) but gives nothing (T-161).

- **Very defensive Pokémon can now be built as pure stall.** When a Pokémon's offence is far below what
  its tier is built on and it can assemble a real stall kit (reliable recovery + status/chip/trap +
  Protect + attack-independent damage like Seismic Toss), trainers now build it as a dedicated staller —
  a recovery engine plus disruption, keeping at most one attack — instead of forcing a token attacking
  move it can't use well (think Blissey, Chansey, Toxapex). This is deliberately conservative: it only
  triggers for Pokémon whose offence really doesn't pay off and that can actually complete the kit, so
  teams aren't flooded with stall. Applies to singles and doubles (T-159).

- **Better move values for the stall toolkit.** Fixed-damage moves (Seismic Toss, Night Shade) are now
  rated on their reliable, Attack-independent chip rather than as near-useless 1-power moves, so a weak
  attacker can lean on them; partial-trap moves (Whirlpool, Sand Tomb, Infestation, Salt Cure) are worth
  more to defensive Pokémon that want to pin a foe while residual damage ticks; and Sticky Web is now
  valued just below Stealth Rock (above Spikes / Toxic Spikes) both as a move and for lead ordering (T-159).

- **Two-turn / charge moves are judged more realistically.** Without their enabler (Power Herb, or the
  right weather for Solar Beam / Electro Shot) they now sit at ~40% of a normal move's value instead of
  being written off almost entirely, and all of them consistently recognise a Power Herb whether it's
  held or still in the bag. Meteor Beam (Power-Herb-only), Electro Shot (rain or Herb) and Solar Beam
  (sun or Herb) keep their distinct conditions (T-159).

- **Early-game level caps raised by one, and trainer levels now track the caps automatically.** Every
  level cap from the first rival through Tabitha at Mt Chimney went up by 1 (rival 7→8, Aqua Grunt 10→11,
  Roxanne 12→13, … Tabitha 32→33); Flannery (36) and everything after are unchanged. Under the hood every
  trainer's level is now **derived from the caps** (`src/caps.c` is the single source) instead of being
  hard-coded, so a cap change flows to all the trainers tuned to it — no more silent desync. Team Maxie's
  Mt Chimney fight, already removed in the previous change, is now fully gone from the trainer data too
  (T-149).

- **Bosses can field Mega OU from the very first mega, for more variety.** The story-progression
  mega gate now differs by trainer kind: **bosses** (Wattson onward) may pick any mega up to OU from
  the start instead of being held to UU early, so early gym leaders and villains have a wider, more
  interesting mega pool. **Mega Ubers stays 100% restricted** until its existing (post-Tate & Liza)
  breakpoint — a boss can grab an OU mega early, never an Ubers one. **Normal trainers are unchanged**
  (UU early → OU mid → Ubers late) (T-150).

- **Mt Chimney's Maxie no longer battles or raises the level cap.** Reaching Maxie now skips straight
  into the existing Archie cutscene — Team Magma clears out, Archie steps in, thanks you, hands over the
  Good Rod and sets the story flags exactly as before — but there is no Maxie fight and no level-cap jump
  at Mt Chimney (the cap now runs Tabitha 32 → Flannery/Badge 4 36). The Maxie–Mt Chimney checkpoint is
  gone from both level-cap sources and from the in-app boss documentation; the underlying story flag is
  kept, so every later event it gates still unlocks (T-148).

- **Doubles support Pokémon are rated far more selectively.** With Taunt and Thunder Wave teachable to
  almost everything, the old fixed thresholds labelled ~97 Pokémon as "OU support" — including frail
  attackers that happen to learn a disruption move (e.g. Zangoose). Support tiers are now graded *relative*
  to the best support in the run (top quarter = OU, etc., with a floor so there are always at least ten OU
  options), the genuinely build-defining tools are worth more (redirection, Fake Out, Tailwind, Spore,
  Friend Guard/Hospitality; Prankster now multiplies a Pokémon's whole support kit), and a Pokémon only
  counts as a *dedicated* support if it's at least as good at supporting as it is at attacking — so a
  double-battle trainer's support slot always fields a real support (never an attacker with a spare
  disruption move). Offensive doubles Pokémon also value Safety Goggles and Covert Cloak much more (T-147).

- **Transparent, patch-first ROM delivery.** The green action button now reads "Download patch &
  apply to my ROM" (plural for nuzlocke / soul-link runs) and never speaks of downloading a ROM.
  Pressing it shows a live checklist of what actually happens — *downloading patch → applying patch
  to my ROM* — plus a third *generating zip* step for multi-ROM runs (which now download as a single
  zip of the finished games instead of one file at a time). All delivery/ready/queued copy is
  singular/plural by ROM count (T-079).

- **Randomization settings now validate their number fields.** Every numeric input clamps to its
  allowed range on blur — the gym type-change count to 0–8 and the Elite-Four count to 0–4, plus
  the champion %, reward money, shop prices, evolution levels, and the nuzlocke/soul-link ROM and
  player counts (now bounded in the config too). The seed can no longer be negative (T-081).

- **Gym / E4 / champion type randomization now shares one pool.** The 13 typed bosses (8 gyms,
  4 Elite Four, 1 champion) are marked *fixed* or *changed*; fixed bosses keep their canonical type
  and a shared pool is built from every type they do **not** claim; changed bosses draw from that
  pool (never their own canonical). A type freed by one changed boss is now eligible for any other
  changed boss — e.g. if Roxanne changes off Rock, another gym or an Elite Four can take Rock (the
  old algorithm walled Rock off entirely). Gyms, Elite Four and the champion no longer have separate
  type spaces (T-076).

### Removed

- **Server-side ROM ownership tracking.** "I have a ROM" is now a purely frontend fact: the ROM is
  validated in the browser against the known official Emerald dumps and its presence is read from the
  local store, so the `owns_valid_rom` column, the `POST /api/rom/validate` endpoint and the
  `ownsValidRom` field on `/api/me` are gone. The backend never tracks or gates on ROM ownership;
  Settings and the delivery screen show whether a ROM is saved in this browser, and every point that
  adds a ROM states it never leaves the device (T-080).

- **Wild Pokémon no longer hold items.** Every species' wild held items (`.itemCommon`/`.itemRare`)
  are zeroed at ROM-write time, so wild encounters (and the dexnav readout) never carry an item —
  no more Cherubi with a Miracle Seed or Luvdisc with a Heart Scale. Trainer, gift and static
  held items are unaffected (T-077).

### Added

- **Champion type-change chance.** The **Trainers & bosses** settings gained a **Champion
  type-change chance** knob (`championTypeChangeChance`, default 5%): the probability the champion
  (Steven) also gets a randomized type instead of Steel. When he changes, his freed Steel joins the
  shared boss type pool; when he stays Steel, Steel is reserved from gyms/Elite Four. All of Steven's
  battles (Granite Cave, Mossdeep partner, champion) run the resulting type (T-076).

- **Randomization diagnostics + audit.** Every randomization now records its warnings and errors
  (with rich context) — chiefly when a trainer team comes back short (a slot exhausted all its
  fallbacks). The browser reports each run's diagnostics to a new `POST /api/diagnostics` endpoint
  that stores them server-side for 48h (purged by the same retention sweeper as bundles). A local
  read-only tool (`backend/scripts/scan-diagnostics.mjs`) and the `/diagnostics-audit` skill pull the
  live data over SSH, classify the warnings into distinct problem classes, and propose a fix per
  class. See `docs/randomizer-diagnostics.md` (T-075).

- **Starter quality selector.** The **Starters** settings now have a single **Starter quality** tier
  selector (same tiers as the extra starters — LEGEND · UBERS · OU · UU · RU · NU · PU) that sets how
  strong the 3 normal starters' evolution lines end up. They stay early 3-stage (Little Cup) lines with
  a weak base; this only changes their peak. Default **UU** reproduces the previous behaviour. The extra
  starter list is now visually separated and shows a live count of how many are configured (T-072).

- **Configurable shop prices.** The **Rewards** settings gained a **Shop prices** section to set the
  buy price of every item sold in Marts: the 3 balls (Ultra/Quick/Timer), all 20 mints (each on its own),
  Ability Capsule, Ability Patch, and TMs priced by category (the randomizer's 10 move pools — average /
  good / strong / top-tier damage, niche, average / good / top-tier status, weather, screens). Defaults
  match the current game; the chosen prices are baked into each generated ROM (T-073).

- **Location nicknames (optional, off by default).** A new **Location nicknames** setting names every
  wild, gift and static Pokémon after **where** it's found — one name per route/area (e.g. every Pokémon
  caught on Route 102 is "Percy"). Names are drawn uniquely per run from an editable pool; an optional
  **lock gender per route** makes all of a route's encounters share a gender for coherence (genderless /
  fixed-gender species keep their own). For nuzlocke / soul-link you can keep the mapping consistent across
  a player's runs or share it between players (T-070).

- **Starter nicknames (optional, off by default).** A new **Starter nicknames** settings section can give
  the extra starters — and, optionally, your chosen starter — baked-in nicknames with matching genders. A
  50/50 coin picks each slot's gender (the maker applies it only where the species allows one; genderless
  Pokémon like Magnemite are unaffected) and a unique name is drawn from editable pools. Pools ship with 300
  male, 300 female and 50 unisex multilingual names; you can switch to a single shared pool, include/exclude
  the main starter, and (for nuzlocke / soul-link) keep names consistent across a player's runs or share them
  between players. Names never repeat within a game (T-068).

- The randomizer settings are now split into collapsible **categories** (Run type · Difficulty ·
  Pokémon mutations · Evolution levels · Trainers & bosses · Rewards · Starters · General), and a
  large batch of previously-hardcoded behaviours became **frontend options** — all of them save/load
  with your config and are remembered between visits (T-052):
  - **Trainers & bosses:** number of gyms (0–8) and Elite Four (0–4) whose type theme is randomized
    (default 2 each); and the five type slots for **Team Aqua** and **Team Magma** (each a fixed type
    or Random — the 5th slot now defaults to Random).
  - **Pokémon mutations:** independent **Mutate stats / abilities / types / learnsets** toggles, plus
    an **Advanced** panel exposing every mutation probability.
  - **Evolution levels:** an on/off toggle and tuning for the level each Pokémon evolves at
    (min/max/randomness/stage spacing, with the full per-tier tables under **Advanced**).
  - **Rewards:** configurable prize money for normal trainers ($250), bosses ($3000) and gym leaders
    ($5000); the museum and Space-Center grunts derive from the boss value (≈⅔, +$50 for the museum
    entry). Elite Four and Champion stay fixed. *(This is the only option here that affects the ROM build.)*
  - **Starters:** the list of **extra starters** is now an unlimited, editable list — each slot picks
    a Pokémon by category (best-evolution tier × evolving-line/standalone × line length). The default
    list reproduces the previous nine.
  - Full reference: [randomizer/docs/randomization-options.md](randomizer/docs/randomization-options.md).

- A **Reset to defaults** button in the randomizer options restores every setting to its default in one
  click (T-055).

### Changed

- **Strong 3-stage lines now evolve later.** On top of the existing "weak first stage evolves early"
  rule, a 3-stage line whose FINAL Pokémon is powerful now gets an extra delay on its first
  evolution, scaled by the final's tier (OU a little, then Ubers, Legendary and AG progressively
  more) — so lines into powerhouses like Bagon→Shelgon→Salamence take longer to get going, like the
  official games. A safeguard keeps at least 2 levels between the first and second evolution, and
  branching lines (Wurmple, Ralts…) are delayed per branch by that branch's own final (T-066).
- **Branching evolutions are now standardized**: every Pokémon that can evolve into more than one
  species now takes its most neutral/default form via **Rare Candy (level-up)** and the alternates via
  **evolution stones**. Gender- and nature-locked splits (Espurr, Lechonk, Basculin, Toxel) become free
  player choices instead of being fixed by the Pokémon's gender/nature, and Milcery drops its 63
  cosmetic Alcremie forms down to a single base form. Eevee keeps its all-stones spread; Dunsparce and
  Tandemaus keep their rare 1/100 forms (T-060).
- Trainers now pick **strategic natures and abilities** (natures matched to each Pokémon's moveset and
  stats; abilities best-rated, hidden slot allowed) from **level 12 (Roxanne)** onward instead of only
  from level 28 — so gym-era teams have coherent natures and abilities much earlier. Below level 12 both
  stay random (T-057).
- Early-game rebalance: the **Rustboro** rival now rewards **Evolution Stones** (they arrive earlier) and
  the **Route 110** rival rewards a **Lum Berry**; opponents only start carrying Lum Berry in their bags
  from the Route 110 rival onward, not from Rustboro (T-056).
- **Wattson** now rewards a single **Ability Patch** for clearing New Mauville, instead of the two Kubfu
  scrolls (Scroll of Darkness + Scroll of Waters) (T-059).
- **The site now delivers a patch, not a full ROM — and your ROM never leaves your computer.** You add
  your Pokémon Emerald (USA/Europe) **once**; it's kept in your browser and is never uploaded (we only
  send its fingerprint to confirm ownership). Generating now produces a small **BPS patch** that your
  browser applies to your ROM in one click to build the finished game. You can even generate and download
  the patch *before* adding a ROM (you'll get the `.bps` to apply yourself). Patches stay re-downloadable
  for 48 hours, and starting a new randomization replaces the previous one (T-053, ADR-013).

### Fixed

- **Generated-docs responsive layout & resize smoothness.** In the Trainers view the Pokémon cards no
  longer waste half the screen at laptop widths (they now pack two columns), and the sprite/moves no
  longer overlap the text or get clipped as the window narrows — the card reflows fluidly at any size.
  Resizing the window is also smooth now instead of "chasing" for ~1s: off-screen cards are skipped
  during layout (`content-visibility`) across the heavy grids (Trainers, Pokédex, Moves, Abilities,
  Encounters), dropping a full reflow from ~400ms to sub-millisecond (T-074).
- In the generated docs, a trainer's **"Defeated"** toggle now sits directly under that trainer's reward
  instead of being pushed to the bottom of the card (T-055).
- Shared-trainer soul-link ROMs no longer diverge, and a trainer can no longer field an evolved
  Pokémon below its evolution level (e.g. a level-15 trainer with a Ludicolo). Evolution levels
  are now rolled **once per Pokédex** instead of being re-rolled per ROM during bundle generation,
  so every ROM's teams are resolved against — and match — the evolution data the bundle ships
  (B-017, T-042).
- **Brawly** no longer fields only 5 Pokémon. When his gym kept the Fighting type, his 6th slot
  (a Makuhita-specific pick) could resolve to nothing and be dropped silently; it now has a
  generic Fighting fallback so the team is always complete (B-019, T-058).
- When the randomizer changes a **Mega Evolution's type** to one its base form lacks (e.g. Mega
  Aggron gaining Fighting, Mega Garchomp gaining Steel), the base form now learns at least one
  damaging move of that new type — so the Mega actually gets usable STAB. Previously those moves
  were added to the Mega's own learnset, which a Mega can't use (it fights with the base's known
  moves) and which is discarded at build time anyway (T-062).
- A run can no longer hand you **two forms of the same cosmetic family**. All size/seasonal/sea
  variants — Pumpkaboo/Gourgeist (Small/Average/Large/Super), Shellos/Gastrodon (East/West),
  Deerling/Sawsbuck (seasons) and Sinistea/Poltergeist (Phony/Antique) — now count as a single
  family for the "one obtainable per family per run" rule, so you won't get e.g. a Pumpkaboo-Super
  in the wild *and* a Pumpkaboo-Average as a gym reward. Regional forms (Alola/Galar/Hisui/Paldea)
  stay separate — they're genuinely different Pokémon (T-063).
- **Meloetta-Pirouette** (a battle-only form reached with Relic Song) can no longer show up as a
  wild encounter, reward or trainer Pokémon — only base Meloetta is ever placed now. Meloetta is
  still rated as the strong Pokémon it is: its tier is a weighted blend of both forms (55% Aria /
  45% Pirouette), reflecting its in-battle access to Pirouette, and a trainer's Meloetta always
  carries **Relic Song** so it can actually make the switch (T-064).
- **Weather teams now keep their weather ability.** When a trainer's weather slot (rain/sun/sand/
  snow) can't find a real weather *setter* and falls back to a weather *abuser*, that mon now gets
  the matching weather ability (e.g. a Hisuian Qwilfish rain-abuser gets **Swift Swim**) instead of
  a random high-rated ability like **Intimidate**. The ability pick — previously duplicated and
  silently diverged between the two team resolvers — now lives in one shared helper (T-065).

### Added

- New **Feedback** page in the app (T-048). Logged-in users can send free-text feedback tagged as
  a **Feature request** (default), **Bug report** or **Other**; each submission is stored with the
  author and a timestamp, and confirmed with a "thanks for the feedback" message. Logged-out
  visitors see a non-interactive form explaining they must log in. The same page shows two curated,
  tabbed lists — **Most requested features** and **Known bugs** — currently empty with a
  "coming soon" placeholder, to be filled by hand. Submissions can be exported for manual analysis
  with `node scripts/export-feedback.mjs` (JSON, or `--csv`).
- Every **boss trainer card** in the docs viewer is now coloured by identity instead of the old
  uniform red (T-044). Gym leaders, Elite Four and the champion (always Steel for Steven) use the
  palette of the **type they actually run this seed**; Team Aqua mixes Water+Dark and Team Magma
  Fire+Ground; the rival gets emerald with red/blue accents and Wally emerald with white
  (Gardevoir-like). Each boss card gains a **top gradient bar**, a coloured title, a themed
  dossier-rail background and themed Pokémon-card backgrounds. Common trainers stay a neutral
  slate (no bar), kept distinct from Water/Ice. All four colours per type live in one home
  (`randomizer/trainerColors.js`); the viewer's move-chip colours are now derived from it too
  ([ADR-011](docs/adr/ADR-011-trainer-colour-ssot.md)).
- Cross-ROM boss-team determinism guarantee test (`npm run test:determinism`): generates a
  shared-trainer soul-link and fails if any boss battle without a per-ROM-dependent slot differs
  across ROMs — a standing net against unjustified inter-ROM nondeterminism (T-043).

## [0.5.0] - 2026-07-01

### Added

- The whole web frontend **and** the generated documentation viewer are now **mobile-responsive**, while
  the desktop rendering stays exactly as it was (T-040). On phones (≤600px) the top navigation and the
  viewer's sidebar collapse into a **hamburger + off-canvas drawer**; the randomizer step indicator goes
  compact, tap targets are ≥44px, the viewer's content goes full width and its top-bar run-stats reflow.
  **iPad and desktop are untouched** (the desktop layout serves tablets; no horizontal overflow at 768/1024).
  The **Obsidian UI kit** gained a documented mobile layer (breakpoint scale + responsive component rules).
  Backed by a new **dev-only visual-regression harness** (`visual-tests/`, Playwright — [ADR-010](docs/adr/ADR-010-visual-regression-playwright-dev-tool.md)):
  it locks the desktop rendering pixel-for-pixel, asserts no mobile overflow, and screenshots every screen
  at every resolution; plus fast zero-dep structural guards under `node --test`.

### Changed

- The app's top-navigation brand title now matches the Home hero: **"Emerald Cut"** in brand green with
  the logo standing in for the **"C"** of "Cut", instead of plain-white text beside a separate square
  logo (T-041).
- Starter type-triangle selection is now **exhaustive**: it always finds a valid type triangle when one
  exists instead of sometimes taking the no-triangle fallback (T-032).

## [0.4.0] - 2026-07-01

### Changed

- Encounters-tab polish (T-039): fishing slots read "Old Rod" / "Good Rod" / "Super Rod" (shorter, with the rod icon beside the label); multi-slot locations fill left-to-right then top-to-bottom (reading order, still capped at 3 rows); and each encounter type has its own label colour — grass green, old rod light blue, good rod/surf/dive medium blue, super rod and special orange.
- Redesigned the generated documentation viewer (T-038). **Encounters** now shows a pixel icon per slot type (grass, fishing rods, surf/dive, static, legendary, reward, special) with larger, readable type labels, and lays slots out as a fixed-size matrix (≤3 rows, columns growing with the count) so they no longer get squished when the window resizes. **Trainers** were rebuilt as a "roster sheet" — a trainer dossier rail (portrait, level, location, rewards, defeated toggle) beside fixed-width team cards that show each Pokémon's ability, nature and held item on one line, with move power/accuracy/PP, ability text and the nature's stat spread on hover. **PC** gained Available/Fainted icons and bigger labels. A new sticky **top bar** shows the brand title plus live run stats — level cap, Pokémon in box, deaths and next boss, each with an icon — and can be pinned/unpinned; the collapsed sidebar is wider, its active marker centred, its Reset hidden, and its Mail unread count shown as a corner bubble. (T-038)
- Generation-screen polish (T-035): the **Download ROM** button is now emerald-green (a colour used nowhere else) so it stands out; the **Building** state shows an exact **ETA countdown** ("About N min remaining") and the tab-title build %; and the single-use download warning is now an emphasised **amber** callout (caution, not red/error) instead of a faint hint. (The ETA/progress are now driven by a realistic ~270 s/ROM default, calibratable via `AVG_ROM_SECS`.)
- Reworked the navigation and account UX. The browser tab title now reflects an in-flight build — `Building NN%` while compiling, `N ahead` while queued, `✓ ROM ready` when done — so progress is visible from a background tab. The home hero now reads **Pokémon Emerald Cut** with "Emerald Cut" in brand green and the brand icon standing in for the "C", and clicking the top-nav brand returns Home. The confusing "<email>" nav tab is gone: there's now a **Settings** page (email-verified + ROM-ownership status and the ROM upload), a top-right "Logged in as <email> · log out" (or a "Log in" link), and the login/register modal only appears when the app actually needs you to sign in — never from clicking your profile (T-034).
- Redesigned the "Generation complete" screen around a clear two-step checklist — **Documentation** (always ready, built in your browser) and your server-built **ROM** — each row turning green with a ✓ as it completes. The screen's title is honest about what's ready: **"Your documentation is ready"** (with a one-line status — "your ROM is queued/building below") while the ROM is still pending, becoming **"Your run is ready"** only once the ROM is done too. The ROM row shows distinct, clean states: **queued** ("There are N ROMs before yours (ETA ~X min)", with the optional "email me when it's ready" opt-in and a "download your docs meanwhile" hint shown only here); **building** (a spinning gear + a progress bar that advances with the ETA, so it's obvious work is happening); and **ready** (✓). The action buttons are reduced to **Download docs** and a single **Download ROM(s)** (it pluralizes for multi-ROM runs) that stays disabled until the ROM is ready, with a tooltip that always states the real reason (not ready / build failed / sign in first / already downloaded); the per-ROM doc buttons, "Export run", and the in-panel ready-button are gone, and the single-use warning appears at the moment the ROM is downloadable. The bundle 📦 emoji is replaced by the `reward.png` icon (T-031).

### Added

- ROM-ownership verification now accepts **every legal Pokémon Emerald revision** — Japan, Germany,
  France, Italy and Spain, in addition to USA/Europe — so non-English owners can prove ownership and
  build. SHA-1s are taken (and cross-verified) from the No-Intro GBA DAT (T-037).
- You can now **cancel a run** in progress: the step-3 button reads **Cancel** before/while the ROM is being built (with an "are you sure? permanent" confirm) and frees your queue slot server-side (`POST /api/cancel`); it only becomes **Start over** once the ROM is downloaded (and is a disabled "Start over" — "Download your ROM to start over" — while the ROM is ready but not yet downloaded). Cancelling mid-build (or deleting your account mid-build) **kills the in-flight build immediately** (the whole `make` process tree, not just the parent), so the box is freed and the next queued build starts right away; the request is dropped, any remaining ROMs of a multi-ROM run are skipped, and the build worker keeps serving the queue (T-035).
- A **Delete account permanently** button in Settings (red, with an "irreversible" confirm) removes your account and all its data — requests, run history, tokens and files (`DELETE /api/account`) (T-035).
- A collapsed **Run details** disclosure on the generation screen shows your run's settings (the same summary as the step-2 Review) throughout the process (T-035).
- ROM builds now write a persistent per-build log under `DATA_DIR/logs/` (in addition to the live container output), so a failed build's output survives the container recreate that `docker logs` does not — making post-mortems possible after a deploy (T-033).

### Fixed

- Trainer cards no longer over-expand on large monitors: they're capped at a two-Pokémon-column width and centred (splitting into two trainer columns only on very wide displays), instead of stretching edge-to-edge into a sparse three-column team (B-016).
- The doc-viewer top bar now stays pinned to the top while scrolling (unless you unpin it); it was sliding out of view because the flex body clamped its container to one screen height (B-015).
- Starter selection now **always forms a type triangle when one exists** in the eligible pool. The
  search was greedy (it committed to one random second starter and gave up on the first, hitting a
  no-constraint fallback on ~14% of seeds even when a valid triangle was available); it now enumerates
  every valid triangle and picks one at random, falling back only when the pool genuinely has none (T-032).
- Build progress and ETA are now **server-authoritative** and survive a reload (B-013). They were synthesised on the client (a local clock started when the page first showed the building view), so reloading restarted the bar/ETA from zero. The backend now derives progress + remaining time from durable build state (`GET /api/status` returns `progress`), and the frontend just renders it — consistent whether or not you reload, and fetched immediately on load (no zero-flash). This also closes the class of "the front shows X before asking the back" glitches.
- The delivery panel no longer flashes "Building your ROM" before the server confirms — the optimistic state on Generate is now a neutral "Submitting your run…" (B-012).
- A generated run is no longer lost on reload when no build is in flight — notably after the email-verification round-trip (generate logged-out → register → open the verification link → back to the site). The run's bundle was already saved in your browser, but the app only restored it on reload when a build was active; now it always restores, so clicking Randomizer shows your completed run (docs + ROM status) again. "Already downloaded" is remembered across reloads so a restored run isn't rebuilt (B-011).
- The "needs a ROM" prompt now reads **"Upload your Emerald ROM"** (with a clear explanation and an "Upload in Settings" button) instead of the confusing "Verify your Emerald" (T-034).
- ROM builds no longer fail when a Ralts- or Togepi-family Pokémon's type is rebalanced. Those families use a config-driven family-type macro (e.g. `RALTS_FAMILY_TYPE2`) as a type; the randomizer was prepending `TYPE_` to it and writing the undefined `TYPE_RALTS_FAMILY_TYPE2`, which broke `make`. The parser now resolves these macros to real types (also correcting those Pokémon's rating), the writer emits any unknown token verbatim as a safety net, and `update.sh` rebuilds the browser bundle on every deploy (B-010).
- A failed ROM build no longer takes the whole site down. Previously a `make` failure rejected out of the build worker's loop, crashed the Node process, and — because startup recovery re-ran the still-`building` request — crash-looped the backend into a 502. The worker now contains build failures: it marks the request `failed` (terminal, non-blocking) and keeps serving other jobs (B-008).
- The deploy no longer breaks ROM builds by shipping host-compiled tool binaries. `update.sh` rsyncs the working tree, which included the decomp tools (`tools/*/`) compiled for the developer's OS; on the Linux box `make` then died with "Exec format error". The deploy now rebuilds the Linux tools after the rsync (B-009).
- The starters type-triangle unit test is no longer flaky: it built the module with an isolated rng instance that `beforeEach`'s seed couldn't reach, so ~14% of runs took the no-triangle fallback and failed — randomly aborting deploys at the preflight gate. The test now uses the seeded module so it deterministically exercises a valid triangle (B-007). The deeper greedy-search weakness it exposed (the algorithm can fall back even when a triangle exists) is tracked separately (T-032).

## [0.3.0] - 2026-06-28

### Fixed

- Difficulty now scales trainers across the whole game. Previously the difficulty slider only affected trainers whose teams used contextual tiers, so from Flannery onward (gym leaders, Elite Four, Champion Steven, and their route trainers) it did nothing. The team-tier transform now shifts absolute-tier slots too — keeping mega slots and the rival/Wally/Steven "evolves-with-you" Pokémon fixed. This also corrects the baseline: late-game route trainers are now properly a step weaker than their gym leader (B-001, T-012).

### Changed

- The whole app now has a single identity: **Pokémon Emerald Cut**, with the `emeraldCut.png` logo and the slogan _"Your emerald cut for controlled chaos."_ Replaces the front-end's "Pokémon Emerald Randomizer" and the generated docs viewer's "PuppedJS"; the name, logo (front-end top-nav + favicon, docs header + embedded favicon) and slogan now match across the front-end app, the per-run docs, and the project READMEs (root README keeps the upstream RHH/pokeemerald-expansion attribution) (T-015).
- Smarter trainer move/team heuristics: two-turn/charge moves (Dig, Fly, Solar Beam, …) are now valued only when actually usable — Solar Beam/Blade in sun, the others with a held Power Herb — while Meteor Beam/Geomancy actively combo with an available Power Herb; weather-conditional moves (Weather Ball, Growth, Thunder, Blizzard, Electro Shot, Aurora Veil) scale with weather set by the Pokémon itself or an earlier teammate; Belch is no longer assigned to berryless Pokémon; and Sticky Web now acts as a lead hazard (ranked just below Stealth Rock) in team ordering (T-013).
- Moves tab in the generated docs now shows each move's in-game description on its card, a `TM{NN}` badge for TM moves with the in-world location it's obtained from (route + trainer), and a "TMs only" filter that orders results by TM number; hovering a move in the Pokédex modal shows its description. Move descriptions are parsed properly from `moves_info.h` (single-line, multi-line and shared-constant `.description`s), TM numbers are derived from the run's TM pool, and TM locations come from the `randomizer/docs/tms.md` SSOT (T-011).
- Docs icon polish: the "added/new" markers (new learnset move, new TM, added ability) and the LEGENDARY badge now use the `star.png` pixel icon instead of star/sparkle glyphs; the Encounters "captured" control is now a Poké Ball icon; and the captured/delayed/fainted controls have tooltips ("Mark as captured/delayed/fainted") (T-011).
- Generated docs now apply a per-section scroll position when you open a tab: Encounters jumps to your last captured route and Trainers to your last defeated trainer (your progress frontier), while Mail, Pokédex, Moves, Abilities and PC open at the top (T-010).
- Docs Obsidian polish: flattened the remaining rounded/gradient elements that the re-skin missed (tier badges, poke/flag cards, LEGENDARY badge), made tier badges a raised bordered/shadowed plaque distinct from type chips, enlarged + made trainer-team move names readable, and bigger menu icons. Added a reusable emoji→pixel-icon mechanism (`getIcon`/`data-icon` over `frontend/assets/*.png`, emoji fallback) so hand-drawn icons drop in incrementally; the generating gear now spins (T-006).
- Generated docs now isolate their `localStorage` per run: each doc bakes in a stable per-run namespace (seed + player + ROM) and suffixes every storage key with it, so opening docs from two different runs in the same browser/origin no longer makes them collapse onto each other's nuzlocke / filter / nav state. Un-generated template falls back to the legacy shared keys (T-005).
- Docs overhaul: the generated docs are now fully self-contained (fonts + assets embedded as base64; **zero** external network requests), re-skinned to the Obsidian UI kit to match the app, and ~65% smaller (15.8 → 5.5 MB) by dropping unrendered pipeline fields at injection time. Adds a reusable `frontend/assets/` embedding mechanism. Supersedes T-002 (T-004).
- Re-skinned the randomizer front-end app with the Obsidian UI kit (retro 8-bit / GBA-era: navy surfaces, ember-orange + cyan, Press Start 2P + VT323, hard edges, offset shadows). Re-authored `frontend/css/{base,components,layout}.css` keeping all class names; the docs are unaffected (T-003).

### Added

- **Online ROM generation at [pokemon-emerald-cut.com](https://pokemon-emerald-cut.com).** Create a verified account (email + password), prove you own Pokémon Emerald by hash (the file never leaves your machine's check — only the validated flag is kept), and the same **Generate** that builds your docs now also compiles your randomized ROM on the server — behind a fair two-tier (fast/slow) queue with a live ETA — and serves it from a 48-hour "my ROMs" area. Documentation generation stays free and anonymous. Backed by a new Node + SQLite backend (accounts/JWT, ROM-ownership validation, a persistent build queue with crash recovery, per-ROM real compile with bounded `make -j`, transactional email) deployed as a single Docker image behind Caddy with automatic HTTPS (T-018 epic — T-021…T-031; ADR-003…ADR-008).
- Front-end landing redesigned around the product pitch, plus a new **Features** top-nav menu item. The hero now leads with the "Pokémon Emerald Cut" title + slogan and a one-line description; the old feature cards are replaced by "What is this?" (the 2-in-1 pitch, with a CTA into Features) and "What's in the future?" boxes. The Features page has three subtabs — ROM, Randomizer and Generated docs — covering the full feature list (T-016).
- A max-priority "Congratulations — you beat the game!" victory mail (with a star badge) that appears in the docs' Mail tab when you mark Champion Steven defeated; it sorts above every other notification and has its own filter chip once earned (T-011).
- PC tab in the generated docs (between Trainers and Mail): a single scrollable, non-paginated grid of your box Pokémon, each clickable to open its detail modal, with an Available ↔ Fainted toggle (the Fainted view renders each Pokémon in black-and-white). Also makes the obtained Pokémon's evolution stage coherent everywhere — the Encounters tab now shows the evolved form, fainting freezes a Pokémon at the form it fainted at, and deselecting rolls it back to its base form (T-009).
- Box/evolution coherence in the docs: a live "Current level cap: N" header readout, and a Pokédex-modal "box" section (before Evolution) showing how any Pokémon relates to your box — IN BOX (with cap-gated Evolve actions, including stone+level evolutions like Hisuian forms), a family member in box, a fainted family member, or where a family member is obtainable. Mark-fainted / undo from the modal stays in sync with the Encounters tab; evolving removes only the non-chosen branches and shows brief feedback. Family grouping unites regional branches via the evolution graph (T-008).
- Mail notifications tab in the generated docs (between Trainers and Pokedex): a level-cap-driven inbox that, as you mark bosses defeated, surfaces static-encounter unlocks, available evolutions (with an Evolve action), and newly available level-up / TM moves for the Pokémon in your box. Per-type mute, mark-all-read, unread bubble, filters. Backed by a build-time boss↔level-cap↔flag SSOT (`randomizer/bossCaps.js`, parsed from `src/caps.c` with a 1-to-1 assertion) (T-007).


- Self-contained docs sprites: `build.js` now generates `frontend/data/sprites.json` (gitignored) — a base64 map of every Pokémon/trainer sprite, encoded as cropped 8-bit indexed PNGs with transparency (~3x smaller than RGBA). The frontend embeds them into each generated doc, so docs render images with zero external CDN dependency. New TDD-covered modules `randomizer/spriteMapper.js` (source parsing/mapping) and `randomizer/spriteImage.js` (crop + indexed-PNG encoder), plus the `randomizer/generateSprites.js` orchestrator (T-001).
