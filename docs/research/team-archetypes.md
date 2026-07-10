# Team archetypes (singles & doubles) — research notes

<!-- GENERATED from docs/research/corpus.json (T-098/099/100 research workflow, adversarially
verified). Regenerate: node scripts/gen-research-docs.cjs. Competitive references, not game rules —
cite these when tuning ratings/archetypes; do not hand-edit (edit corpus.json instead). -->

Descriptive archetypes distilled from the corpus. Seed for the machine-actionable archetype JSONs
(T-101 singles / T-102 doubles) used by the redesigned team generator (Group 2C).

## Singles archetypes (5)

### Balance
A defensive pivot core (usually Regenerator users) that soaks hits and generates momentum for one or two elite Choice wallbreakers, tilts the hazard game in its favor, and closes with a setup/Z-move win condition. Trades the all-in speed of hyper offense for resilience and staying power.

- **Structure:** 2-3 bulky/Regenerator pivots (e.g. Toxapex, Tornadus-T, Celesteela) + 1 Stealth Rock setter + 1 Defog hazard-remover + 1-2 Choice wallbreakers (Specs/Band) + 1 setup or Z-move win condition; VoltTurn/U-turn momentum feeds the breakers in safely, with a one-sided hazard game (own Spikes/SR up, opponent's Defogged away).
- **Examples:** Ash-Greninja Balance (Finchinator)

### Bulky Offense
An offensively slanted team that keeps a small defensive backbone (a wall or two plus Intimidate/pivots) so its wallbreakers and a Choice-Scarf revenge killer can apply relentless pressure. Frequently pairs a Pursuit trapper to delete the specific walls that answer the main breaker, then closes with a setup or priority sweeper.

- **Structure:** 1-2 defensive anchors/pivots (bulky Water, Steel, Intimidate Landorus-T) + Stealth Rock setter + Choice-Scarf revenge killer/pivot + 1-2 wallbreakers (Choice item or Mega) + optional Pursuit trapper (Tyranitar) to open the breaker's path + a setup/priority win condition. Sand (Tyranitar Sand Stream) may be added incidentally for bulk and Pursuit chip rather than as a true weather engine.
- **Examples:** KeldTar Bulky Offense; Mega Medicham Offense; Swords Dance Mega Mawile Bulky Offense (Sand)

### Hyper Offense
Maximum aggression with little or no defensive backbone: a Focus-Sash suicide lead lays hazards and Taunts the opposing lead, then a stack of speed-boosting setup sweepers (or terrain-enabled sweepers) each cover one another's checks and race to win before the opponent stabilizes.

- **Structure:** 1 (sometimes 2) Focus-Sash suicide hazard leads (Spikes + Stealth Rock, Taunt) + 3-4 speed-boosting setup sweepers (Dragon Dance / Shift Gear / Calm Mind / Unburden) + priority and/or VoltTurn momentum. A common variant is built around a terrain setter (Tapu Koko Electric Terrain) that triggers a Seed/Unburden sweeper (Hawlucha) for the win condition.
- **Examples:** Speed-Boosting Blacephalon Hyper Offense; Kokolucha Hyper Offense (Electric-Terrain sweep); Mega Charizard X Hyper Offense

### Full Stall (Defensive)
A near-passive defensive wall of a team that splits the physical/special defensive load across dedicated walls, denies the opponent's win conditions (Unaware vs setup, Magic Bounce vs hazards/status), and grinds foes down with Toxic/Toxic Spikes/Will-O-Wisp + Seismic Toss while sustaining itself with Wish, Recover, Regenerator and clerics.

- **Structure:** 1 dedicated physical wall + 1 special wall (Eviolite Chansey) + 1 Unaware setup-check (Clefable) + 1 cleric/Wish passer + hazard control (Defog, sometimes doubled) + Stealth Rock setter + a status/residual-damage win condition. Keystone is a bounce/immunity ability: Magic Bounce (Mega Sableye) or Filter (Mega Aggron).
- **Examples:** Mega Sableye Stall; Mega Aggron Stall

### Rain (Weather) Offense
A weather team built around Drizzle: the setter turns on rain to double a Swift Swim sweeper's Speed, power up largely unresisted Water attacks (Choice Specs), and give 100%-accurate Hurricanes, while a rain-independent setup sweeper and a Grass/Steel defensive glue keep the plan alive after rain lapses. The clearest singles 'gimmick/weather' archetype in the corpus.

- **Structure:** 1 Drizzle setter (Pelipper, Damp Rock for 8 turns) + 1 Swift Swim sweeper (Mega Swampert) + 1 rain-boosted special nuke (Choice Specs Ash-Greninja) + 1 rain-independent win condition (Manaphy / Magearna) + 1 defensive glue covering Grass/Electric (Ferrothorn) + a Defog/Regenerator pivot (Tornadus-T). Hazard stacking (Spikes) supports the Water spam.
- **Examples:** Manaphy Rain (Ske Rain); Rain Offense (Pelipper + Mega Swampert + Ash-Greninja)

## Doubles archetypes (8)

### Bulky Offense (Intimidate/Fake Out core)
The default VGC framework: a support core built on Intimidate and Fake Out (Incineroar, Landorus-T, Mega Salamence) blunts the opponent's damage to open a safe turn for a setup sweeper or spread attackers to take over, with Tailwind (or a Trick Room backup) as speed control. Offensively slanted but carries real bulk and a clear win condition.

- **Structure:** 1-2 Intimidate/Fake Out support (Incineroar, Landorus-T, Mega Salamence) + 2 spread/attacking mons + 1 setup win condition (Belly Drum Snorlax, Dragon Dance Salamence, Geomancy Xerneas) + speed control (Tailwind) + a defensive pivot. In restricted formats this collapses onto a synergistic restricted core (e.g. XernDon = Xerneas + Primal Groudon).
- **Examples:** Paul Ruiz's 2018 World Champion team (Soaring Higher); Zheyuan Huang's 2019 XernDon; Ryota Otsubo's 2017 World Champion team

### Balance / Dual-Mode Goodstuffs
A flexible, matchup-adaptive team of individually strong Pokémon that carries two win conditions and two speed-control modes (a fast Tailwind/terrain mode and a slow Trick Room mode) over a bulky Intimidate/redirection backbone. The pilot reads Team Preview and commits to the mode that beats the opponent rather than to a single fixed plan.

- **Structure:** Fake Out/Intimidate support (Incineroar / Mega Kangaskhan) + 2 flexible attackers + a fast-mode speed setter (Tailwind or terrain Tapu) + a slow-mode Trick Room setter (Cresselia) + a terrain/weather setter or redirector; a bulky backbone (Assault Vest, Regenerator) so the team can safely pivot into whichever mode wins.
- **Examples:** Shoma Honami's 2015 World Champion team (shadeVIERA); Tomohiro Seki's 2018 Top 8 team; AFK / FAKEPG core

### Hyper Offense / Goodstuffs
An all-out damage race with minimal defensive investment (the famous 'no Protect' builds): a lead pair applies unavoidable spread damage, or a Fake Out + Follow Me support guarantees a setup sweeper's boost turn, backed by a priority 'win button' and Tailwind so the team KOs faster than the opponent can stabilize.

- **Structure:** Fast spread-damage lead pair (or Fake Out + Follow Me support enabling a one-turn setup sweeper such as Geomancy Xerneas) + 1-2 hard-hitting attackers/Mega + a Gale Wings priority attacker (Talonflame) as the win button + Tailwind speed control; Choice/offensive items favored over Protect to maximize output.
- **Examples:** The 'Big 6'; Alex Ogloza's What's Protect? (2014 US Nationals champion); James Baek's 2019 TornOgre rain offense

### Weather Offense (Sun / Rain)
Built around a weather setter that both powers its own side and cripples the opponent's: Drizzle/Primal rain doubles Swift Swim Speed and boosts Water nukes; Drought/Primal sun powers Fire and doubles Chlorophyll Speed. A redirector or support core shields the fragile setter, and a weather-independent backup win condition covers weather wars.

- **Structure:** 1 weather setter (Politoed/Primal Kyogre for rain; Torkoal/Charizard-Y/Primal Groudon for sun) + 1-2 weather abusers (Swift Swim or Chlorophyll sweeper, or a weather-boosted spread nuke like Water Spout/Eruption) + support to protect the setter (Fake Out, redirection, Intimidate) + speed control (Tailwind) + a weather-independent backup attacker.
- **Examples:** Alex Ogloza's What's Protect? (rain); Dancing in the Sun — Torkoal/Lilligant (sun); Wolfe Glick's 2016 World Champion Primal Kyogre team

### Trick Room
Inverts the speed order for a few turns so deliberately slow, high-power attackers move first. Runs one or (for reliability against Taunt/pressure) two Trick Room setters plus slow wallbreakers that abuse it, with redirection/protection to survive the setup turn; the strongest builds also carry a non-TR (Tailwind) fallback mode.

- **Structure:** 1-2 Trick Room setters (Cresselia, Bronzong, Lunala, Stakataka, or Disguise-guaranteed Mimikyu) + 2-3 slow high-Attack/SpA abusers (Aegislash, Volcarona, Primal Groudon, Stakataka) + redirection/protection support (Amoonguss Rage Powder, Wide Guard) + often a fast Tailwind backup mode. Ability-manipulation tech (Skill Swap, Ally Switch) commonly rides on the setters.
- **Examples:** Naoto Mizobuchi's 2019 World Champion team (Primal Groudon / Lunala); Aaron Traylor's 2016 Top 8 (dual-setter TR Xerneas/Groudon); Hideyuki Taida's 2015 Runner-up (Weakness Policy TR setup)

### Redirection Support Offense
A support Pokémon soaks the opponent's attacks off a fragile win condition using Follow Me / Rage Powder or an absorbing ability (Lightning Rod, Storm Drain), buying free turns for a setup sweeper or a glass-cannon nuke, while chip/paralysis support softens targets for the clean-up.

- **Structure:** 1 redirector (Follow Me Pachirisu, Rage Powder Amoonguss, Lightning Rod Raichu/Manectric, Storm Drain Gastrodon) + 1-2 win conditions it shelters (Dragon Dance Mega Gyarados, Geomancy Xerneas, Primal Kyogre) + chip/status support (Nuzzle, Super Fang, Fake Out, paralysis) + speed control + a protective pivot. The absorbing-ability version also patches the sweeper's type weakness (e.g. Lightning Rod covering a Water/Flying's Electric weakness).
- **Examples:** Se Jun Park's 2014 World Champion Follow Me team; Wolfe Glick's 2016 World Champion team (Lightning Rod Raichu)

### Perish Trap / Trapping Control
A control archetype that removes the opponent's escape and win options instead of out-damaging them: a Shadow Tag trapper locks a key Pokémon in place while double Perish Song, or trapping plus Encore/Taunt/Intimidate disruption, grinds the trapped mon to nothing; Substitute/Protect stall out the Perish count.

- **Structure:** 1 Shadow Tag trapper (Mega Gengar / Gothitelle) + a second Perish Song user (Politoed) or a removal/disruption partner + Fake Out/Intimidate/Encore/Icy Wind disruption support + Substitute/Protect to survive and stall the Perish count + a backup attacker for games where the trap plan is answered (e.g. Snarl/spread damage breaking the Substitute).
- **Examples:** Emilio Forbes's 2018 Runner-up Mega Gengar Perish Trap

### Screens & Tailwind / Field Speed Control
A gimmick built on temporary field advantage rather than raw damage: Aurora Veil (or Light Screen/Reflect) blunts incoming hits so stat-boosting sweepers set up safely behind it, while Tailwind or a Pledge-'swamp' terrain flips the speed war. Trades immediate power for a handful of protected turns that the win conditions snowball out of.

- **Structure:** 1 field-control setter (Aurora Veil Alolan Ninetales + Light Clay, or Water+Grass Pledge 'swamp', or a dedicated Tailwind user) + 2-3 setup sweepers that boost behind it (Swords Dance, Tail Glow, Calm Mind, Quiver Dance) + Intimidate/speed-control support + a priority/Taunt disruptor to protect the setup turns + a second speed-control layer (Tailwind) as backup.
- **Examples:** Sam Pandelis's 2017 Runner-up Aurora Veil team; The Power of Pledge — Serapis's swamp-terrain offense
