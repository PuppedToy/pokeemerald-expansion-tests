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
    MOVE_THUNDERBOLT: { ...base, id: 'MOVE_THUNDERBOLT', name: 'Thunderbolt', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ELECTRIC', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_FLAMETHROWER: { ...base, id: 'MOVE_FLAMETHROWER', name: 'Flamethrower', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'FIRE', power: 90, accuracy: 100, effect: 'EFFECT_HIT' },
    MOVE_SOLAR_BEAM: { ...base, id: 'MOVE_SOLAR_BEAM', name: 'Solar Beam', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'GRASS', power: 120, accuracy: 100, effect: 'EFFECT_SOLAR_BEAM' },
    MOVE_BLIZZARD: { ...base, id: 'MOVE_BLIZZARD', name: 'Blizzard', category: 'DAMAGE_CATEGORY_SPECIAL', type: 'ICE', power: 110, accuracy: 70, effect: 'EFFECT_HIT' },

    // --- Status moves in statusList (must return specific values) ---
    MOVE_THUNDER_WAVE: { ...base, id: 'MOVE_THUNDER_WAVE', name: 'Thunder Wave', category: 'DAMAGE_CATEGORY_STATUS', type: 'ELECTRIC', power: 0, accuracy: 90, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_WILL_O_WISP: { ...base, id: 'MOVE_WILL_O_WISP', name: 'Will-O-Wisp', category: 'DAMAGE_CATEGORY_STATUS', type: 'FIRE', power: 0, accuracy: 85, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_TOXIC: { ...base, id: 'MOVE_TOXIC', name: 'Toxic', category: 'DAMAGE_CATEGORY_STATUS', type: 'POISON', power: 0, accuracy: 90, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_SING: { ...base, id: 'MOVE_SING', name: 'Sing', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 55, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_HYPNOSIS: { ...base, id: 'MOVE_HYPNOSIS', name: 'Hypnosis', category: 'DAMAGE_CATEGORY_STATUS', type: 'PSYCHIC', power: 0, accuracy: 60, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_STUN_SPORE: { ...base, id: 'MOVE_STUN_SPORE', name: 'Stun Spore', category: 'DAMAGE_CATEGORY_STATUS', type: 'GRASS', power: 0, accuracy: 75, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_POISON_POWDER: { ...base, id: 'MOVE_POISON_POWDER', name: 'PoisonPowder', category: 'DAMAGE_CATEGORY_STATUS', type: 'POISON', power: 0, accuracy: 75, effect: 'EFFECT_NON_VOLATILE_STATUS' },
    MOVE_SWORDS_DANCE: { ...base, id: 'MOVE_SWORDS_DANCE', name: 'Swords Dance', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_ATTACK_UP_2' },
    MOVE_DRAGON_DANCE: { ...base, id: 'MOVE_DRAGON_DANCE', name: 'Dragon Dance', category: 'DAMAGE_CATEGORY_STATUS', type: 'DRAGON', power: 0, accuracy: 0, effect: 'EFFECT_DRAGON_DANCE' },
    MOVE_TAIL_WHIP: { ...base, id: 'MOVE_TAIL_WHIP', name: 'Tail Whip', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 100, effect: 'EFFECT_DEFENSE_DOWN' },
    MOVE_PROTECT: { ...base, id: 'MOVE_PROTECT', name: 'Protect', category: 'DAMAGE_CATEGORY_STATUS', type: 'NORMAL', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' },

    // --- Force-switch phazing moves (priority -6, EFFECT_HIT_SWITCH_TARGET) ---
    MOVE_CIRCLE_THROW: { ...base, id: 'MOVE_CIRCLE_THROW', name: 'Circle Throw', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'FIGHTING', power: 60, accuracy: 90, effect: 'EFFECT_HIT_SWITCH_TARGET', priority: -6 },
    MOVE_DRAGON_TAIL:  { ...base, id: 'MOVE_DRAGON_TAIL',  name: 'Dragon Tail',  category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'DRAGON',   power: 60, accuracy: 90, effect: 'EFFECT_HIT_SWITCH_TARGET', priority: -6 },

    // --- Normal physical (for comparison) ---
    MOVE_MEGA_PUNCH: { ...base, id: 'MOVE_MEGA_PUNCH', name: 'Mega Punch', category: 'DAMAGE_CATEGORY_PHYSICAL', type: 'NORMAL', power: 80, accuracy: 85, effect: 'EFFECT_HIT' },

    // --- Doubles-only status (useless in singles) ---
    MOVE_WIDE_GUARD: { ...base, id: 'MOVE_WIDE_GUARD', name: 'Wide Guard', category: 'DAMAGE_CATEGORY_STATUS', type: 'ROCK', power: 0, accuracy: 0, effect: 'EFFECT_PROTECT' },
};

module.exports = moves;
