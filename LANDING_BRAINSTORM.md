A customizable, randomized emerald romhack that skips most of the story to bring the most fair battles possible and focus on good progresion within the run.

1. What exactly is this?

A 2-in-1 experience:

It's a romhack that comes from pokeemerald-expansion (9 gen pokemon + megas). Lots of QoL to focus on fair progression, economy and battles. Most of the overworld is edited so every nonboss trainer is optional and protect a reward. Only boss trainers are required to advance the story. See the list of romhack features below.

It's also a balanced randomizer that comes with documentation for each run. And with balanced I mean a lot of things together, but the focus point is the randomization is to have a progression that feels good, pokemon that haven't lost their soul but enough changes to allow lots of replayability. We can call it VERY controlled chaos.

You can play it normally, you can nuzlocke it or you can soul-link it. Customizable difficulty. Play it however you want.

2. How does it work?

Try it yourself! -> [link]

(Mention hackdex future)

<Some screenshots>

3. Full feature list

3.1. Generic features

- Generated docs per run and nuzlocke tracker for your runs.
- Three ready-made presets — Default, Nuzlocke and Soul-Link.

3.2. ROM features

- Automatic leveling per cap, no exp management and no grinding.
- All non branch evolutions are level evolutions. Evolve candy and the evolution stones are key items. Branch evolutions require specific levels and a stone.
- Pokémon fully healed after each fight. Consumable items recovered after each fight.
- Removed EVs entirely.
- Removed most of non critical story events and simplified story line to not waste time. Reduced most of the texts to quick sentences.
- Only boss battles are needed to progress. Non boss battles are optional and provide resources or access to wild pokemon.
- Wild encounters are predictable. Each wild encounter zone has only 1 possible pokemon and is guarded by a trainer that has that pokemon in their team.
- Meaningful economy system to buy optimization items.
- Shiny untied from randomness. Any pokemon with IV sum of ar least 150 is shiny (0.4% aprox). Starter is guaranteed 150 or more IV and static encounters guarantee 3 perfect IVs.
- Every fight is a 6 vs 6.
- Start the game with 9 pokemon in your box. These are automatically balanced for progression.
- Every boss battle gives a reward (or more!) too.
- Multiple-choice rewards for items. Do you want a choice scarf, choice specs or choice band? Choose wisely for you can only have one. Don't worry, enemy trainers choose only one too.
- Easy relearning moves.
- HMs are not needed throughout most of the game.

3.3. Randomizer features

- Pokemon can be randomized by a mutating algorithm. This means pokemon are preserved as in original (updated) games in general but a % of them will have mutations on either stats, typing, learnsets and/or abilities. These mutations carry over evolutions. Customizable, by default a pokemon has 20% to be mutated.
- Mutations stay coherent across a family: changes propagate down the evolution line and gently decay, so an evolutionary line still feels like one line.
- The randomizer tries to give a tier for every pokemon. Sanity is kept between all the intertwining systems, focusing for max balance and progression. For example, if a pokemon gets mutated and gets a 20 attack, its expected quality gets evaluated based on that. Or if Roost TM is available in the run and a defensive mon like Skarmory can learn it, it will be considered more quality for all game purposes. The more the player progresses in the game, the more quality pokemon has access to and the more quality pokemon will be used for enemy trainers.
- A full 10-tier competitive ladder under the hood — MAGIKARP → ZU → PU → NU → RU → UU → OU → UBERS → LEGEND → AG — and each Pokémon is re-rated at every level cap, so "quality" always tracks exactly where you are in the run.
- Each run rebuilds every Pokémon's TM compatibility around that run's actual TM pool (same-type moves favoured), so the randomized TMs are always useful to someone.
- Item rewards are shuffled and balanced to help the progression. Including TMs based on TM quality.
- Enemy trainers make their teams only with pokemon of qualities that the player has access to. They also use items and TMs the user has access to. Only bosses are a little step ahead of user. The enemy trainers try to make their teams movesets and item choices as best as they can (mind them, they're an algorithm. But they really try).
- Enemy trainers are bound by the same rules as the player. They never use an evolution that can't be obtained at their level.
- Enemy trainers try to be real team-builders: no two Pokémon from the same family, gym-specific restrictions (mono-type, no repeated type, signature abilities), good movesets, hazard-setters led up front.
- Customizable difficulty to edit enemy pokemon quality. By default in fair difficulty - bosses have the expected pokemon quality the player has access tu by each point of the game. Non bosses have slightly worse teams than the expected team the player will have. Difficulty slider changes how many pokemon have an upgraded quality for the expected player state. Meaning that in a 13 difficulty (+6) every trainer has the intended team with a +1 quality. So if the team is supposed to be all RU pokemon, they will be all UU instead.
- Rival uses pokemon found in routes the player has visited and carries over + upgrades their team for the next encounter. Same as Wally. Other trainers that are encountered multiple times carry over the next fight some pokemon.
- Evolution levels are automatically adjusted based on pokemon quality. Removed non branching item evolutions.
- Every obtainable pokemon with a mega will have its mega stone somewhere in the world.
- Static encounters randomized at the 3 regi caves and new mauville. At sky pillar the player has access to a 3-choice of legendary-quality pokemon.
- 2 Gyms in game have a random type. 2 E4 trainers have a random type.
- Gym leaders try to use their favourite pokemon :)
- Your 3 starters always form a type triangle (each beats the next), and your 9-mon starting box is tier-curated for a smooth early game.
- Nuzlocke runs are group of ROMs within a same universe of mutations and trainers but with different encounters. When a ROM is lost, the player is expected to open the next ROM. This is customizable.
- In Soul-Link / shared runs, trainers and their rewards are deterministically identical across every player's ROM. This is customizable.
- Difficulty is a 13-step slider (not just easy/fair/hard) and it also scales how many items enemy trainers carry in their bag.

3.4. Generated docs features

- A single, self-contained file per ROM: works 100% offline with zero network requests, every sprite and font embedded (~5.5 MB).
- Seven tabs: Encounters, Trainers, PC, Mail, Pokédex, Moves and Abilities.
- Encounters: a route-by-route wild list with BOSS REWARD / STATIC / LEGENDARY badges and built-in nuzlocke controls — mark each encounter captured, delayed or fainted, with live colour states.
- Trainers: every trainer's full team with sprite, held item, ability, nature, moveset, level, location and rewards; boss trainers are badged; tick them off as you defeat them (and optionally view teams in true in-game battle order).
. PC: a scrollable grid of your caught Pokémon with an Available ↔ Fainted toggle (fainted mons shown in black-and-white).
- Mail: a level-cap-driven inbox — as you beat bosses it surfaces newly-unlocked static encounters, available evolutions, and newly learnable level-up / TM moves for the Pokémon in your box.
- Pokédex: every Pokémon with sprite, types, abilities (with tooltips) and a full stat block showing buffs/nerfs vs the original game, plus a tier badge and role; deep filtering by search, sort, scope (In Box / Obtainable / In Trainers / Fainted / All), evolution stage, change type, type and tier.
- Per-Pokémon detail: full learnset, this-run teachable TMs (new ones starred, plus a "no TM this run" note), evolution tree, and how that Pokémon relates to your box.
- Moves: every move with its in-game description, type/category, power/accuracy/PP, a TM## badge and exactly where to get that TM in the world (route + trainer), with a "TMs only" view sorted by TM number.
- Abilities: every ability with its description and mechanic flags (breakable, can't be copied / suppressed / swapped, etc.).
- Each run's doc keeps its own progress: nuzlocke state, filters and reading position are stored per-run (by seed + player + ROM), so multiple runs never collide in the same browser.

4. What's in the future?

- Hackdex support.
- Highly customizable settings. This will be my main focus, getting as many things in the randomzier as possible to be customizable, so people can create their own themes.
- Smarter rating, smarter teams. Polishing after more playthroughs.
- Community requests.
