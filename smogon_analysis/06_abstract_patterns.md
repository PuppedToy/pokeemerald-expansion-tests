# Abstract Patterns — Generalizable Signals for A6 Rating Bonuses

The purpose of this file: translate all research into PATTERNS detectable from our data
(move IDs, ability IDs, stat thresholds). These are the combos to implement in A6.

---

## PATTERN 1: Setup Move + Priority Move
**Signal:** Pokemon has a setup move (SD/DD/NP/CM/QD/BD/SS) AND a priority move (ExtremeSpeed/Bullet Punch/Mach Punch/Aqua Jet/Shadow Sneak/Sucker Punch/Grassy Glide)
**Why it's strong:** After setup, opponent can't revenge kill with faster mons — priority bypasses speed.
**Examples:** Scizor (SD+BP), Lucario (SD+ESpeed), Azumarill (BD+Aqua Jet), Kingambit (SD+Sucker Punch), Mimikyu (SD+Shadow Sneak)
**Proposed bonus:** +0.7 to movesRating
**Detection:** moveset contains any SETUP_MOVE AND any PRIORITY_MOVE

---

## PATTERN 2: Setup Move + High Base Speed
**Signal:** Pokemon has setup move AND base speed ≥ 90
**Why it's strong:** Fast enough to outspeed threats before needing to boost speed. One SD+fast = can't be revenge killed.
**Examples:** Volcarona (base 100 + QD), Thundurus (base 111 + NP), Greninja (base 122 + NP), Tapu Koko (base 130 + NP)
**Proposed bonus:** +0.5 to movesRating
**Detection:** any SETUP_MOVE AND baseSpe >= 90

---

## PATTERN 3: Substitute + Passive Healing Ability
**Signal:** Pokemon has Substitute AND has Poison Heal / Regenerator / Leech Seed in moveset OR ability provides HP regen
**Why it's strong:** Sub costs 25% HP. If the ability/move covers that cost within 2 turns, the Sub is free. Opponent can never break Sub without a supereffective or strong hit.
**Examples:** Gliscor (PH+Sub+Toxic), Breloom (PH+Sub+FocusPunch), Reuniclus (MagicGuard+Sub)
**Proposed bonus:** +0.6 to movesRating
**Detection:** Substitute in moveset AND (ability == POISON_HEAL OR ability == REGENERATOR OR LEECH_SEED in moveset)

---

## PATTERN 4: Substitute + Toxic/Will-O-Wisp + Recovery
**Signal:** Substitute AND (Toxic OR Will-O-Wisp) AND (Roost/Recover/Synthesis/Moonlight/Wish/Rest)
**Why it's strong:** Classic stall loop: set Sub, spread status behind it, recover when Sub breaks. Opponent gets poisoned/burned trying to break through.
**Examples:** Gliscor, Gengar (sub+wisp), Toxapex (no sub but wall variant), Clodsire
**Proposed bonus:** +0.6 to movesRating
**Detection:** Substitute AND STATUS_SPREAD_MOVE AND RECOVERY_MOVE

---

## PATTERN 5: Pivot Move + Recovery
**Signal:** U-turn or Volt Switch AND (Roost/Recover/Regenerator/Wish)
**Why it's strong:** Generate momentum for free, then recover HP. Repeated pivoting chips opponent while healing self.
**Examples:** Landorus-T (U-turn+Stealth Rock), Rotom-W (Volt Switch+Pain Split), Corviknight (U-turn+Roost)
**Proposed bonus:** +0.3 to movesRating
**Detection:** (U_TURN OR VOLT_SWITCH) AND (RECOVERY_MOVE OR ability == REGENERATOR)

---

## PATTERN 6: Hazard Setter + Recovery
**Signal:** Stealth Rock or Spikes AND recovery move
**Why it's strong:** Long-term win condition. Hazards deal ~25% to most things on entry. With recovery, the setter can stay healthy and threaten to keep hazards up indefinitely.
**Examples:** Ferrothorn (SR+Spikes+Leech Seed), Skarmory (SR+Spikes+Roost), Landorus-T (SR+Roost), Clefable (SR+Soft-Boiled)
**Proposed bonus:** +0.4 to movesRating
**Detection:** (STEALTH_ROCK OR SPIKES OR TOXIC_SPIKES OR STICKY_WEB) AND RECOVERY_MOVE

---

## PATTERN 7: Magic Guard or Poison Heal + Life Orb / Status
**Signal:** ability == MAGIC_GUARD OR ability == POISON_HEAL
**Why it's strong:** Magic Guard eliminates the main drawback of Life Orb (10% recoil per hit). Poison Heal turns the main drawback of Toxic Orb (progressive poison) into a benefit.
**Examples:** Reuniclus, Clefable (Magic Guard), Gliscor, Breloom (Poison Heal)
**Proposed bonus:** +0.5 to movesRating
**Detection:** ability == MAGIC_GUARD OR ability == POISON_HEAL

---

## PATTERN 8: Prankster + Status/Hazard Moves
**Signal:** ability == PRANKSTER AND any non-damaging move in set
**Why it's strong:** Status and hazard moves normally lose to faster foes. Prankster makes them +1 priority — they execute before ANY regular move including Choice Scarf users.
**Examples:** Thundurus (T-Wave), Whimsicott (Encore), Sableye (WoW+Taunt), Klefki (Spikes)
**Proposed bonus:** +0.5 to movesRating
**Detection:** ability == PRANKSTER AND moveset contains STATUS_MOVE

---

## PATTERN 9: Serene Grace + High-Flinch or High-Status Move
**Signal:** ability == SERENE_GRACE AND (Air Slash OR Iron Head OR Scald OR Thunder)
**Why it's strong:** 60% flinch rate on a faster Pokemon means opponent can't move ~60% of turns. Probabilistically, this wins most matchups over time.
**Examples:** Togekiss (Air Slash), Jirachi (Iron Head)
**Proposed bonus:** +0.5 to movesRating
**Detection:** ability == SERENE_GRACE AND (FLINCH_MOVE in moveset)

---

## PATTERN 10: Technician + Priority Move
**Signal:** ability == TECHNICIAN AND priority move with BP ≤ 60
**Why it's strong:** Priority moves are weak (Bullet Punch 40 BP) by design. Technician makes them strong (60 BP = 90 after STAB). Breaks the priority-power tradeoff.
**Examples:** Scizor (Bullet Punch), Breloom (Mach Punch)
**Proposed bonus:** +0.5 to movesRating
**Detection:** ability == TECHNICIAN AND PRIORITY_MOVE in moveset with bp <= 60

---

## PATTERN 11: Huge Power / Pure Power
**Signal:** ability == HUGE_POWER OR ability == PURE_POWER
**Why it's strong:** All physical moves are effectively twice as powerful. Makes even weak physical moves threatening.
**Proposed bonus:** +0.8 to movesRating (or implement as ×2 multiplier on physicalAttack component)
**Detection:** ability == HUGE_POWER OR ability == PURE_POWER

---

## PATTERN 12: Speed Boost + Protect
**Signal:** ability == SPEED_BOOST AND Protect in moveset
**Why it's strong:** Protect for free Speed boost every turn. After 2 turns: +2 Spe and no risk taken.
**Examples:** Blaziken, Ninjask, Yanmega (to a lesser degree)
**Proposed bonus:** +0.6 to movesRating
**Detection:** ability == SPEED_BOOST AND PROTECT in moveset

---

## PATTERN 13: Speed Boost + Setup Move (no Protect needed)
**Signal:** ability == SPEED_BOOST AND setup move (SD/NP/CM)
**Why it's strong:** Even without Protect, after 2-3 turns of Speed Boost + one setup turn → overwhelms.
**Proposed bonus:** +0.4 to movesRating (less than +Protect since riskier)
**Detection:** ability == SPEED_BOOST AND SETUP_MOVE in moveset

---

## PATTERN 14: Unburden + Consumable Item Move
**Signal:** ability == UNBURDEN AND (Flying Gem + Acrobatics OR Power Herb + charge move OR any Berry)
**Why it's strong:** One-time item consumption = permanent double speed. Effectively a setup move that also enables a strong attack simultaneously.
**Examples:** Hawlucha, Accelgor
**Proposed bonus:** +0.5 to movesRating
**Detection:** ability == UNBURDEN AND (ACROBATICS OR SKY_ATTACK in moveset, or berry item)

---

## PATTERN 15: Protean / Libero
**Signal:** ability == PROTEAN OR ability == LIBERO
**Why it's strong:** Every move gets STAB (1.5x). Equivalent to a permanent ~30% damage bonus across all 4 moves.
**Proposed bonus:** +0.4 to movesRating
**Detection:** ability == PROTEAN OR ability == LIBERO

---

## PATTERN 16: Skill Link + Multi-Hit Move
**Signal:** ability == SKILL_LINK AND (Icicle Spear OR Rock Blast OR Bullet Seed OR Tail Slap OR Pin Missile)
**Why it's strong:** Multi-hit moves always land 5 times. Icicle Spear (25 BP × 5 = 125 BP) beats Sash and Sub in one hit. Like having a reliable 125 BP move.
**Examples:** Cloyster (Icicle Spear+Rock Blast), Cinccino (Bullet Seed+Tail Slap)
**Proposed bonus:** +0.4 to movesRating
**Detection:** ability == SKILL_LINK AND MULTI_HIT_MOVE in moveset

---

## PATTERN 17: Contrary + Draining/Self-Lowering Move
**Signal:** ability == CONTRARY AND (Leaf Storm OR Overheat OR Superpower OR Draco Meteor)
**Why it's strong:** Leaf Storm normally drops SpA 2 stages (crippling). Contrary turns that drop into a +2 SpA boost. Spam Leaf Storm = +6 SpA in 3 turns with a strong STAB move.
**Examples:** Serperior (Leaf Storm), Malamar (Superpower)
**Proposed bonus:** +0.7 to movesRating
**Detection:** ability == CONTRARY AND (LEAF_STORM OR OVERHEAT OR SUPERPOWER OR DRACO_METEOR in moveset)

---

## PATTERN 18: Unaware + Recovery + Defensive Bulk
**Signal:** ability == UNAWARE AND recovery move AND (HP + Def + SpDef composite ≥ threshold)
**Why it's strong:** Ignores all opponent boosts defensively. Hard stop to any sweeper regardless of +6 boosts.
**Examples:** Clefable, Quagsire, Clodsire, Dondozo
**Proposed bonus:** +0.5 to movesRating (defensive utility, not offensive)
**Detection:** ability == UNAWARE AND RECOVERY_MOVE in moveset

---

## PATTERN 19: Magic Bounce
**Signal:** ability == MAGIC_BOUNCE
**Why it's strong:** Hazards are worth 25% HP across a game. Reflecting them is a huge tempo swing. Also reflects Taunt, Thunder Wave, etc.
**Proposed bonus:** +0.3 to movesRating
**Detection:** ability == MAGIC_BOUNCE

---

## PATTERN 20: Dragon Dance + Good Coverage
**Signal:** Dragon Dance in moveset AND physical coverage moves hit ≥ 3 different types super-effectively
**Why it's strong:** DD gives +1 Atk AND +1 Spe simultaneously. At +1, faster than most revenge killers. Good coverage means few safe switch-ins.
**Examples:** Gyarados, Dragonite, Haxorus, Salamence, Mega Charizard X
**Proposed bonus:** +0.5 to movesRating
**Detection:** DRAGON_DANCE in moveset AND coverageScore > threshold

---

## PATTERN 21: Mold Breaker + Ground Move
**Signal:** ability == MOLD_BREAKER AND Earthquake/Earth Power in moveset
**Why it's strong:** Levitate is the most common defensive ability. Mold Breaker Earthquake hits all Levitate users (Rotom-W, Hydreigon, Bronzong, Gengar in some gens).
**Examples:** Haxorus (DD+EQ), Excadrill (SD+EQ), Mega Ampharos
**Proposed bonus:** +0.3 to movesRating
**Detection:** ability == MOLD_BREAKER AND (EARTHQUAKE OR EARTH_POWER in moveset)

---

## PATTERN 22: Quiver Dance
**Signal:** Quiver Dance in moveset
**Why it's strong:** Triple stat boost (+1 SpA, SpD, Spe) in one move. The best setup move in the game for special attackers. After one QD, virtually unstoppable.
**Examples:** Volcarona, Vivillon, Lilligant, Butterfree (fringe)
**Proposed bonus:** +0.6 to movesRating
**Detection:** QUIVER_DANCE in moveset

---

## PATTERN 23: Shell Smash
**Signal:** Shell Smash in moveset
**Why it's strong:** +2 Atk/SpA/Spe at -1 Def/SpDef. After Shell Smash, no defensive Pokemon survives. White Herb restores defense drops.
**Examples:** Cloyster, Barbaracle, Carracosta, Omastar
**Proposed bonus:** +0.6 to movesRating
**Detection:** SHELL_SMASH in moveset

---

## PATTERN 24: Nasty Plot + Good Special Coverage
**Signal:** Nasty Plot in moveset AND special coverage hits ≥ 3 types super-effectively
**Why it's strong:** +2 SpA in one turn. Combined with coverage, sweeps entire teams.
**Examples:** Gengar, Thundurus, Darkrai, Infernape, Gholdengo
**Proposed bonus:** +0.5 to movesRating
**Detection:** NASTY_PLOT in moveset AND coverageScore > threshold

---

## SUMMARY TABLE

| # | Pattern | Key Signal | Bonus |
|---|---------|-----------|-------|
| 1 | Setup + Priority | SETUP_MOVE + PRIORITY_MOVE | +0.7 |
| 2 | Setup + High Speed | SETUP_MOVE + baseSpe≥90 | +0.5 |
| 3 | Sub + Passive Healing | Substitute + PoisonHeal/Regen | +0.6 |
| 4 | Sub + Status + Recovery | Sub + Toxic/WoW + Recover | +0.6 |
| 5 | Pivot + Recovery | U-turn/VoltSwitch + Recover | +0.3 |
| 6 | Hazard + Recovery | SR/Spikes + Recover | +0.4 |
| 7 | Magic Guard or Poison Heal | ability check | +0.5 |
| 8 | Prankster + Status | ability + status move | +0.5 |
| 9 | Serene Grace + Flinch | ability + flinch move | +0.5 |
| 10 | Technician + Priority | ability + priority≤60BP | +0.5 |
| 11 | Huge/Pure Power | ability check | +0.8 |
| 12 | Speed Boost + Protect | ability + Protect | +0.6 |
| 13 | Speed Boost + Setup | ability + setup move | +0.4 |
| 14 | Unburden + Consumable | ability + acrobatics/berry | +0.5 |
| 15 | Protean / Libero | ability check | +0.4 |
| 16 | Skill Link + Multi-Hit | ability + multi-hit move | +0.4 |
| 17 | Contrary + Self-Lower | ability + leaf storm/overheat | +0.7 |
| 18 | Unaware + Bulk + Recover | ability + bulk + recovery | +0.5 |
| 19 | Magic Bounce | ability check | +0.3 |
| 20 | Dragon Dance + Coverage | DD + coverage score | +0.5 |
| 21 | Mold Breaker + EQ | ability + EQ | +0.3 |
| 22 | Quiver Dance | move check | +0.6 |
| 23 | Shell Smash | move check | +0.6 |
| 24 | Nasty Plot + Coverage | NP + coverage score | +0.5 |
