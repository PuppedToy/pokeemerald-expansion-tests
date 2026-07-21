'use strict';

// Minimal move objects covering all categories and key effect branches used in rateMove.
// Shape matches the parsed moves.json output from index.js.

const base = {
    additionalEffects: [],
    pp: 10,
    target: 'MOVE_TARGET_SELECTED',
    priority: 0,
    makesContact: 'TRUE',
    strikeCount: '1',
};

const moves = {
    // --- Physical damage ---
    MOVE_TACKLE: { ...base, id: 'MOVE_TACKLE', name: 'Tackle', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 40, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_EARTHQUAKE: { ...base, id: 'MOVE_EARTHQUAKE', name: 'Earthquake', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'GROUND', power: 100, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_CLOSE_COMBAT: { ...base, id: 'MOVE_CLOSE_COMBAT', name: 'Close Combat', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 120, accuracy: 100, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_DEF_SPDEF_DOWN'] },
    MOVE_SELF_DESTRUCT: { ...base, id: 'MOVE_SELF_DESTRUCT', name: 'Self-Destruct', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 200, accuracy: 100, effect: 'EFFECT_EXPLOSION' },
    MOVE_ROLLOUT: { ...base, id: 'MOVE_ROLLOUT', name: 'Rollout', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'ROCK', power: 30, accuracy: 90, effect: 'EFFECT_ROLLOUT' },
    MOVE_FAKE_OUT: { ...base, id: 'MOVE_FAKE_OUT', name: 'Fake Out', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 40, accuracy: 100, effect: 'EFFECT_FIRST_TURN_ONLY', priority: 3 },
    MOVE_KNOCK_OFF: { ...base, id: 'MOVE_KNOCK_OFF', name: 'Knock Off', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'DARK', power: 65, accuracy: 100, effect: 'EFFECT_KNOCK_OFF' },
    MOVE_DOUBLE_EDGE: { ...base, id: 'MOVE_DOUBLE_EDGE', name: 'Double-Edge', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 120, accuracy: 100, effect: 'EFFECT_RECOIL_IF_NOT_GHOST' },
    MOVE_FLY: { ...base, id: 'MOVE_FLY', name: 'Fly', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FLYING', power: 90, accuracy: 95, effect: 'EFFECT_SEMI_INVULNERABLE' },
    MOVE_PIN_MISSILE: { ...base, id: 'MOVE_PIN_MISSILE', name: 'Pin Missile', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'BUG', power: 25, accuracy: 95, effect: 'EFFECT_MULTI_HIT' },

    // --- Special damage ---
    MOVE_SURF: { ...base, id: 'MOVE_SURF', name: 'Surf', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_THUNDERBOLT: { ...base, id: 'MOVE_THUNDERBOLT', name: 'Thunderbolt', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ELECTRIC', power: 90, accuracy: 100, effect: 'EFFECT_HIT', rating: 8 },
    MOVE_FLAMETHROWER: { ...base, id: 'MOVE_FLAMETHROWER', name: 'Flamethrower', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_SOLAR_BEAM: { ...base, id: 'MOVE_SOLAR_BEAM', name: 'Solar Beam', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'GRASS', power: 120, accuracy: 100, effect: 'EFFECT_SOLAR_BEAM' },
    MOVE_BLIZZARD: { ...base, id: 'MOVE_BLIZZARD', name: 'Blizzard', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ICE', power: 110, accuracy: 70, effect: 'EFFECT_HIT' },
    // T-181 — accuracy-model fixtures. Fire Blast/Flamethrower share the burn secondary so it cancels in
    // any comparison isolating accuracy; Aura Sphere uses accuracy 0 = never-miss (parser sentinel).
    MOVE_FIRE_BLAST: { ...base, id: 'MOVE_FIRE_BLAST', name: 'Fire Blast', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE', power: 110, accuracy: 85, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_BURN'] },
    MOVE_HYDRO_PUMP: { ...base, id: 'MOVE_HYDRO_PUMP', name: 'Hydro Pump', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'WATER', power: 110, accuracy: 80, effect: 'EFFECT_HIT' },
    MOVE_THUNDER: { ...base, id: 'MOVE_THUNDER', name: 'Thunder', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ELECTRIC', power: 110, accuracy: 70, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_PARALYSIS'] },
    MOVE_HURRICANE: { ...base, id: 'MOVE_HURRICANE', name: 'Hurricane', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FLYING', power: 110, accuracy: 70, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_CONFUSION'] },
    MOVE_AURA_SPHERE: { ...base, id: 'MOVE_AURA_SPHERE', name: 'Aura Sphere', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIGHTING', power: 80, accuracy: 0, effect: 'EFFECT_HIT' },
    MOVE_FOCUS_BLAST: { ...base, id: 'MOVE_FOCUS_BLAST', name: 'Focus Blast', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIGHTING', power: 120, accuracy: 70, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_SP_DEF_MINUS_1'] },
    MOVE_ICE_BEAM: { ...base, id: 'MOVE_ICE_BEAM', name: 'Ice Beam', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ICE', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_PSYCHIC: { ...base, id: 'MOVE_PSYCHIC', name: 'Psychic', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'PSYCHIC', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    // Meloetta's signature (T-064) — a modest-power Normal special move that toggles Aria<->Pirouette.
    MOVE_RELIC_SONG: { ...base, id: 'MOVE_RELIC_SONG', name: 'Relic Song', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'NORMAL', power: 75, accuracy: 100, effect: 'EFFECT_RELIC_SONG' },

    // --- Status moves in statusList (must return specific values) ---
    MOVE_THUNDER_WAVE: { ...base, id: 'MOVE_THUNDER_WAVE', name: 'Thunder Wave', category: 'DAMAGE_CATEGORY_STATUS', type: 'ELECTRIC', power: 0, accuracy: 90, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_WILL_O_WISP: { ...base, id: 'MOVE_WILL_O_WISP', name: 'Will-O-Wisp', category: 'DAMAGE_CATEGORY_STATUS', type: 'FIRE', power: 0, accuracy: 85, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_TOXIC: { ...base, id: 'MOVE_TOXIC', name: 'Toxic', category: 'DAMAGE_CATEGORY_STATUS', type: 'POISON', power: 0, accuracy: 90, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_SING: { ...base, id: 'MOVE_SING', name: 'Sing', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 55, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_HYPNOSIS: { ...base, id: 'MOVE_HYPNOSIS', name: 'Hypnosis', category: 'DAMAGE_CATEGORY_STATUS', type: 'PSYCHIC', power: 0, accuracy: 60, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_STUN_SPORE: { ...base, id: 'MOVE_STUN_SPORE', name: 'Stun Spore', category: 'DAMAGE_CATEGORY_STATUS', type: 'GRASS', power: 0, accuracy: 75, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_POISON_POWDER: { ...base, id: 'MOVE_POISON_POWDER', name: 'PoisonPowder', category: 'DAMAGE_CATEGORY_STATUS', type: 'POISON', power: 0, accuracy: 75, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_SWORDS_DANCE: { ...base, id: 'MOVE_SWORDS_DANCE', name: 'Swords Dance', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_ATTACK_UP_2' },
    MOVE_DRAGON_DANCE: { ...base, id: 'MOVE_DRAGON_DANCE', name: 'Dragon Dance', category: 'DAMAGE_CATEGORY_STATUS', type: 'DRAGON', power: 0, accuracy: 0, effect: 'EFFECT_DRAGON_DANCE', rating: 8 },
    MOVE_TAIL_WHIP: { ...base, id: 'MOVE_TAIL_WHIP', name: 'Tail Whip', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 100, effect: 'EFFECT_DEFENSE_DOWN' },
    MOVE_PROTECT: { ...base, id: 'MOVE_PROTECT', name: 'Protect', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' },

    // --- Force-switch phazing moves (priority -6, EFFECT_HIT_SWITCH_TARGET) ---
    MOVE_CIRCLE_THROW: { ...base, id: 'MOVE_CIRCLE_THROW', name: 'Circle Throw', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 60, accuracy: 90, effect: 'EFFECT_HIT_SWITCH_TARGET', priority: -6 },
    MOVE_DRAGON_TAIL:  { ...base, id: 'MOVE_DRAGON_TAIL',  name: 'Dragon Tail',  category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'DRAGON',   power: 60, accuracy: 90, effect: 'EFFECT_HIT_SWITCH_TARGET', priority: -6 },

    // --- Normal physical (for comparison) ---
    MOVE_MEGA_PUNCH: { ...base, id: 'MOVE_MEGA_PUNCH', name: 'Mega Punch', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 80, accuracy: 85, effect: 'EFFECT_HIT' },

    // --- Doubles-only status (useless in singles) ---
    MOVE_WIDE_GUARD: { ...base, id: 'MOVE_WIDE_GUARD', name: 'Wide Guard', category: 'DAMAGE_CATEGORY_STATUS', type: 'ROCK', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' },

    // --- Variable-power moves ---
    MOVE_LOW_KICK:  { ...base, id: 'MOVE_LOW_KICK',  name: 'Low Kick',  category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 1, accuracy: 100, effect: 'EFFECT_LOW_KICK' },
    MOVE_LOW_SWEEP: { ...base, id: 'MOVE_LOW_SWEEP', name: 'Low Sweep', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 65, accuracy: 100, effect: 'EFFECT_HIT', additionalEffects: ['MOVE_EFFECT_SPD_MINUS_1'] },

    // --- Conditional-power (EFFECT_REVENGE covers both Revenge and Avalanche) ---
    MOVE_REVENGE:   { ...base, id: 'MOVE_REVENGE',   name: 'Revenge',   category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 60, accuracy: 100, effect: 'EFFECT_REVENGE', priority: -4 },
    MOVE_AVALANCHE: { ...base, id: 'MOVE_AVALANCHE', name: 'Avalanche',  category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'ICE',      power: 60, accuracy: 100, effect: 'EFFECT_REVENGE', priority: -4 },

    // --- Draining move ---
    MOVE_DRAIN_PUNCH: { ...base, id: 'MOVE_DRAIN_PUNCH', name: 'Drain Punch', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 75, accuracy: 100, effect: 'EFFECT_DRAIN_HP', rating: 8 },

    // --- Priority moves for Fix 3 tests ---
    MOVE_QUICK_ATTACK: { ...base, id: 'MOVE_QUICK_ATTACK', name: 'Quick Attack', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 40, accuracy: 100, effect: 'EFFECT_HIT', priority: 1 },
    MOVE_FEINT:        { ...base, id: 'MOVE_FEINT',        name: 'Feint',        category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 30, accuracy: 100, effect: 'EFFECT_HIT', priority: 2 },

    // --- Focus Energy for Fix 5 tests ---
    MOVE_FOCUS_ENERGY: { ...base, id: 'MOVE_FOCUS_ENERGY', name: 'Focus Energy', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_FOCUS_ENERGY' },

    // --- Coverage / Counter fixtures for rateMoveForAPokemon tests ---
    MOVE_METAL_CLAW: { ...base, id: 'MOVE_METAL_CLAW', name: 'Metal Claw', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'STEEL', power: 50, accuracy: 95, effect: 'EFFECT_HIT' },
    MOVE_COUNTER:    { ...base, id: 'MOVE_COUNTER',    name: 'Counter',    category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 1, accuracy: 100, effect: 'EFFECT_COUNTER', priority: -5 },
    MOVE_ENDURE:     { ...base, id: 'MOVE_ENDURE',     name: 'Endure',     category: 'DAMAGE_CATEGORY_STATUS',   type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_ENDURE', priority: 4 },
    MOVE_FLAIL:      { ...base, id: 'MOVE_FLAIL',      name: 'Flail',      category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 1, accuracy: 100, effect: 'EFFECT_FLAIL' },
    MOVE_SAND_ATTACK: { ...base, id: 'MOVE_SAND_ATTACK', name: 'Sand Attack', category: 'DAMAGE_CATEGORY_STATUS', type: 'GROUND', power: 0, accuracy: 100, effect: 'EFFECT_ACCURACY_DOWN' },
    MOVE_WORK_UP:    { ...base, id: 'MOVE_WORK_UP',    name: 'Work Up',    category: 'DAMAGE_CATEGORY_STATUS',   type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_ATTACK_SPATK_UP' },

    // --- Fix 8: non-STAB Normal redundancy penalty ---
    MOVE_STRENGTH: { ...base, id: 'MOVE_STRENGTH', name: 'Strength', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 80, accuracy: 100, effect: 'EFFECT_HIT' },

    // --- Hazard and recovery moves for HAZARD+RECOVERY combo tests ---
    MOVE_STEALTH_ROCK: { ...base, id: 'MOVE_STEALTH_ROCK', name: 'Stealth Rock', category: 'DAMAGE_CATEGORY_STATUS', type: 'ROCK', power: 0, accuracy: 0, effect: 'EFFECT_STEALTH_ROCK' },
    MOVE_ROOST:        { ...base, id: 'MOVE_ROOST',        name: 'Roost',        category: 'DAMAGE_CATEGORY_STATUS', type: 'FLYING', power: 0, accuracy: 0, effect: 'EFFECT_ROOST' },

    // --- Fix 9: Dream Eater + sleep move combos ---
    MOVE_DREAM_EATER:  { ...base, id: 'MOVE_DREAM_EATER',  name: 'Dream Eater',  category: 'DAMAGE_CATEGORY_SPECIAL', type: 'PSYCHIC', power: 100, accuracy: 100, effect: 'EFFECT_DREAM_EATER' },
    MOVE_SLEEP_POWDER: { ...base, id: 'MOVE_SLEEP_POWDER', name: 'Sleep Powder', category: 'DAMAGE_CATEGORY_STATUS',  type: 'GRASS',   power: 0,   accuracy: 75,  effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_SPORE:        { ...base, id: 'MOVE_SPORE',        name: 'Spore',        category: 'DAMAGE_CATEGORY_STATUS',  type: 'GRASS',   power: 0,   accuracy: 100, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_YAWN:         { ...base, id: 'MOVE_YAWN',         name: 'Yawn',         category: 'DAMAGE_CATEGORY_STATUS',  type: 'NORMAL',  power: 0,   accuracy: 0,   effect: 'EFFECT_YAWN' },

    // --- Pivot / switch moves (EFFECT_HIT_ESCAPE) for Zero-to-Hero tests ---
    MOVE_FLIP_TURN:    { ...base, id: 'MOVE_FLIP_TURN',   name: 'Flip Turn',   category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'WATER',    power: 60, accuracy: 100, effect: 'EFFECT_HIT_ESCAPE' },
    MOVE_U_TURN:       { ...base, id: 'MOVE_U_TURN',      name: 'U-turn',      category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'BUG',      power: 70, accuracy: 100, effect: 'EFFECT_HIT_ESCAPE' },
    MOVE_VOLT_SWITCH:  { ...base, id: 'MOVE_VOLT_SWITCH', name: 'Volt Switch', category: 'DAMAGE_CATEGORY_SPECIAL',  type: 'ELECTRIC', power: 70, accuracy: 100, effect: 'EFFECT_HIT_ESCAPE' },
    // Strong same-type (Water) physical attacker — used to prove the forced pivot survives A3 dedup.
    MOVE_WAVE_CRASH:   { ...base, id: 'MOVE_WAVE_CRASH',  name: 'Wave Crash',  category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'WATER',    power: 120, accuracy: 100, effect: 'EFFECT_RECOIL' },
};

module.exports = moves;
