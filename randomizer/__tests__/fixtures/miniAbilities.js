'use strict';

// Minimal ability objects matching the shape of abilities.json.
const abilities = {
    ABILITY_NONE:       { name: '-------', rating: 0, breakable: false },
    ABILITY_OVERGROW:   { name: 'Overgrow', rating: 3, breakable: false },
    ABILITY_CHLOROPHYLL:{ name: 'Chlorophyll', rating: 4, breakable: false },
    ABILITY_BLAZE:      { name: 'Blaze', rating: 3, breakable: false },
    ABILITY_TORRENT:    { name: 'Torrent', rating: 3, breakable: false },
    ABILITY_SPEED_BOOST:{ name: 'Speed Boost', rating: 9, breakable: false },
    ABILITY_LEVITATE:   { name: 'Levitate', rating: 5, breakable: true },
    ABILITY_WATER_ABSORB:{ name: 'Water Absorb', rating: 6, breakable: true },
    ABILITY_INTIMIDATE: { name: 'Intimidate', rating: 7, breakable: false },
    ABILITY_THICK_FAT:  { name: 'Thick Fat', rating: 5, breakable: true },
    ABILITY_STURDY:     { name: 'Sturdy', rating: 5, breakable: true },
    ABILITY_INNER_FOCUS:{ name: 'Inner Focus', rating: 2, breakable: false },
    ABILITY_WONDER_GUARD:{ name: 'Wonder Guard', rating: 10, breakable: true },
    ABILITY_TRANSISTOR:  { name: 'Transistor', rating: 6, breakable: false },
    ABILITY_HUGE_POWER:  { name: 'Huge Power', rating: 10, breakable: true },
    ABILITY_SHED_SKIN:   { name: 'Shed Skin', rating: 7, breakable: false },
    ABILITY_ZERO_TO_HERO:{ name: 'Zero to Hero', rating: 10, breakable: false },
    // Weather abilities (T-065) — rated below Intimidate/Sturdy on purpose, so the generic
    // best-ability pick would (wrongly) prefer Intimidate/Sturdy over the weather ability.
    ABILITY_SWIFT_SWIM:  { name: 'Swift Swim', rating: 5, breakable: false },
    ABILITY_POISON_POINT:{ name: 'Poison Point', rating: 2, breakable: false },
    ABILITY_SAND_RUSH:   { name: 'Sand Rush', rating: 3, breakable: false },
};

module.exports = abilities;
