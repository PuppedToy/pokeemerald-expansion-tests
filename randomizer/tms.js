// TM pool: all moves that were TMs in Gen 7 or later (SM onwards).
// Derived from official porymoves JSON data + game move category definitions.
// 305 total moves: 221 damage, 84 status.

const averageDamagePool = [
    "MOVE_ECHOED_VOICE",    // stacking gimmick
    "MOVE_WEATHER_BALL",    // 50→100, type changes with weather
    "MOVE_VACUUM_WAVE",     // 40, priority
    "MOVE_UPROAR",          // 90/50, locks user 2–3 turns
    "MOVE_HIDDEN_POWER",    // 60, type varies by IVs
    "MOVE_TAKE_DOWN",
    "MOVE_MEGA_PUNCH",
    "MOVE_ROUND",
    "MOVE_AERIAL_ACE",      // 60, never miss
    "MOVE_AIR_CUTTER",      // 60/55, high crit
    "MOVE_ASSURANCE",       // 60/50, doubles if target took damage
    "MOVE_BRINE",           // 65, doubles below 50% HP
    "MOVE_BRUTAL_SWING",    // 60, hits both sides
    "MOVE_BUG_BITE",        // 60, eats berry
    "MOVE_MAGICAL_LEAF",    // 60, never miss
    "MOVE_METAL_CLAW",      // 50, 95 acc, 10% +Atk
    "MOVE_PAYBACK",         // 50, doubles if slower
    "MOVE_PLUCK",           // 60, eats berry
    "MOVE_POISON_TAIL",     // 50, high crit, 12.5% poison
    "MOVE_PSYBEAM",         // 65, 20% confuse
    "MOVE_SHOCK_WAVE",      // 60, never miss
    "MOVE_STEEL_WING",      // 70, 90 acc, 10% +Def
    "MOVE_SWIFT",           // 60, never miss
    "MOVE_THIEF",           // 60/40, steals item
    "MOVE_UPPER_HAND",      // 65, priority vs priority
    "MOVE_WATER_PULSE",     // 60, 20% confuse
    "MOVE_DRAINING_KISS",   // 50, drain (weak but restores HP)
    "MOVE_ICY_WIND",        // 55, -1 Speed
    "MOVE_MUD_SHOT",        // 55, -1 Speed
    "MOVE_ROCK_TOMB",       // 60/50, -1 Speed
    "MOVE_CHILLING_WATER",  // 50, -1 Atk
    "MOVE_INFESTATION",
    "MOVE_ACID_SPRAY",      // 40, -2 SpDef
    "MOVE_BULLDOZE",        // 60, -1 Speed all
    "MOVE_DRAGON_TAIL",     // 60, forces switch (phazing)
    "MOVE_ELECTROWEB",      // 55, -1 Speed
    "MOVE_FLAME_CHARGE",    // 50, +1 Speed
    "MOVE_LOW_SWEEP",       // 65, -1 Speed
    "MOVE_SMACK_DOWN",      // 50, grounds flying types
    "MOVE_TRAILBLAZE",      // 50, +1 Speed
    "MOVE_BREAKING_SWIPE",  // 60, -1 Atk all targets
    "MOVE_SNARL",           // 55, -1 SpAtk
    "MOVE_STRUGGLE_BUG",    // 50/30, -1 SpAtk
];

const goodDamagePool = [
    "MOVE_VENOSHOCK",       // 65, doubles if target poisoned
    "MOVE_REVENGE",         // 60, doubles if hit first
    "MOVE_DUAL_WINGBEAT",   // 40×2, 90 acc
    "MOVE_CROSS_POISON",    // 70, high crit, 10% poison
    "MOVE_AVALANCHE",       // 60, doubles if hit first
    "MOVE_PSYCHO_CUT",      // 70, high crit
    "MOVE_SMART_STRIKE",    // 70, never miss
    "MOVE_SHADOW_CLAW",     // 70, high crit
    "MOVE_HEADBUTT",        // 70, 30% flinch
    "MOVE_BURNING_JEALOUSY",// 70, burns if target boosted
    "MOVE_HEX",             // 65/50, doubles if target statused
    "MOVE_RETALIATE",       // situational after KO
    "MOVE_SKITTER_SMACK",   // 70, -1 SpAtk
    "MOVE_CHARGE_BEAM",     // 50, 70% +1 SpAtk
    "MOVE_IRON_TAIL",       // 100, 75 acc, only 50% -Def
    "MOVE_GRASSY_GLIDE",    // 55/70, priority only in Grassy Terrain
    "MOVE_ELECTRO_BALL",    // power scales with speed difference
    "MOVE_GYRO_BALL",       // power scales with speed (inverse)
    "MOVE_HEAT_CRASH",      // weight-based, worse than Heavy Slam usually
    "MOVE_HEAVY_SLAM",      // weight-based
    "MOVE_FACADE",          // 70→140 if user is statused
    "MOVE_ACROBATICS",
    "MOVE_BULLET_SEED",
    "MOVE_ICICLE_SPEAR",
    "MOVE_SCALE_SHOT",      // 25×5 hits, +1 Speed, -1 Def
    "MOVE_ROCK_BLAST",      // 25×2–5 hits, 90 acc
    "MOVE_PIN_MISSILE",     // 25×2–5 hits, 85 acc
    "MOVE_MEGA_KICK",
    "MOVE_FIRE_PLEDGE",
    "MOVE_GRASS_PLEDGE",
    "MOVE_WATER_PLEDGE",
    "MOVE_AIR_SLASH",       // 75, 95 acc, 30% flinch
    "MOVE_ALLURING_VOICE",  // 80, confuses if target boosted
    "MOVE_BLAZE_KICK",      // 85, 90 acc, high crit, 10% burn
    "MOVE_BODY_PRESS",      // 80, uses Defense stat
    "MOVE_BODY_SLAM",       // 85, 30% paralysis
    "MOVE_BRICK_BREAK",     // 75, breaks screens
    "MOVE_CRUNCH",          // 80, 20% -Def
    "MOVE_DARK_PULSE",      // 80, 20% flinch
    "MOVE_DAZZLING_GLEAM",  // 80, 100 acc
    "MOVE_DRAGON_CLAW",     // 80, 100 acc
    "MOVE_DRILL_RUN",       // 80, 95 acc, high crit
    "MOVE_EXPANDING_FORCE", // 80, 1.5× in psychic terrain
    "MOVE_FIRE_FANG",       // 65, 10% burn/flinch
    "MOVE_FIRE_PUNCH",      // 75, 10% burn
    "MOVE_FLASH_CANNON",    // 80, 10% -SpDef
    "MOVE_ICE_FANG",        // 65, 10% freeze/flinch
    "MOVE_ICE_PUNCH",       // 75, 10% freeze
    "MOVE_ICE_SPINNER",     // 80, removes terrain
    "MOVE_IRON_HEAD",       // 80, 30% flinch
    "MOVE_LASH_OUT",        // 75, 2× if stats lowered this turn
    "MOVE_LIQUIDATION",     // 85, 20% -Def
    "MOVE_LUNGE",           // 80, -1 Atk
    "MOVE_MYSTICAL_FIRE",   // 75/65, -1 SpAtk
    "MOVE_POISON_JAB",      // 80, 30% poison
    "MOVE_POWER_GEM",       // 80/70, 100 acc
    "MOVE_PSYCHIC_NOISE",   // 75, prevents healing
    "MOVE_PSYSHOCK",        // 80, targets Def (special move)
    "MOVE_RAZOR_SHELL",     // 75, 95 acc, 50% -Def
    "MOVE_ROCK_SLIDE",      // 75, 90 acc, 30% flinch
    "MOVE_SCORCHING_SANDS", // 70, 30% burn
    "MOVE_SEED_BOMB",       // 80, 100 acc
    "MOVE_SHADOW_BALL",     // 80, 20% -SpDef
    "MOVE_STOMPING_TANTRUM",// 75, 2× if last move failed
    "MOVE_STRENGTH",        // 80, reliable HM-tier
    "MOVE_TEMPER_FLARE",    // 75, 2× if last move failed
    "MOVE_TERA_BLAST",      // 80, type matches Tera type
    "MOVE_THROAT_CHOP",     // 80, prevents sound moves
    "MOVE_THUNDER_FANG",    // 65, 10% paralysis/flinch
    "MOVE_THUNDER_PUNCH",   // 75, 10% paralysis
    "MOVE_TRI_ATTACK",      // 80, 20% burn/freeze/para
    "MOVE_X_SCISSOR",       // 80, 100 acc
    "MOVE_ZEN_HEADBUTT",    // 80, 90 acc, 20% flinch
    "MOVE_NIGHT_SHADE",     // damage = user level
    "MOVE_SEISMIC_TOSS",    // damage = user level
    "MOVE_REVERSAL",        // power scales with user's low HP
    "MOVE_PLAY_ROUGH",      // 90, 90 acc, 10% -Atk
    "MOVE_GIGA_DRAIN",      // 75/60, drain 50%
    "MOVE_GRASS_KNOT",      // variable weight, hits heavy mons hard
    "MOVE_LOW_KICK",        // variable weight, hits heavy mons hard
    "MOVE_MUDDY_WATER",     // 90/95, 85 acc, 30% accuracy drop
    "MOVE_FUTURE_SIGHT",    // 120, delayed
    "MOVE_GIGA_IMPACT",     // 150, recharge
    "MOVE_BLAST_BURN",      // 150, recharge
    "MOVE_FRENZY_PLANT",    // 150, recharge
    "MOVE_HYDRO_CANNON",    // 150, recharge
    "MOVE_HYPER_BEAM",      // 150, recharge
];

const strongDamagePool = [
    // 90–100 power with 95–100 acc
    "MOVE_DARKEST_LARIAT",  // 85, ignores stat changes
    "MOVE_FROST_BREATH",    // 60/40, always crits
    "MOVE_SOLAR_BEAM",      // 120, requires sun (2-turn otherwise)
    "MOVE_PSYCHIC_FANGS",   // 85, breaks screens
    "MOVE_SOLAR_BLADE",     // 125, requires sun (2-turn otherwise)
    "MOVE_DRAGON_PULSE",    // 85/90, 100 acc
    "MOVE_STEEL_BEAM",      // 140, 95 acc, halves user HP
    "MOVE_STORED_POWER",    // 20 base, scales with stat boosts
    "MOVE_METEOR_BEAM",     // 120, 2-turn, +1 SpAtk on charge
    "MOVE_TRIPLE_AXEL",     // 20/40/60 escalating, 90 acc
    "MOVE_AURA_SPHERE",     // 80/90, never miss
    "MOVE_BUG_BUZZ",        // 90, 10% -SpDef
    "MOVE_EARTH_POWER",     // 90, 10% -SpDef
    "MOVE_FOUL_PLAY",       // 95, uses target's Attack stat
    "MOVE_ENERGY_BALL",     // 90/80, 10% -SpDef
    "MOVE_FLAMETHROWER",    // 90/95, 10% burn
    "MOVE_HIGH_HORSEPOWER", // 95, 95 acc
    "MOVE_HYPER_VOICE",     // 90, 100 acc
    "MOVE_ICE_BEAM",        // 90/95, 10% freeze
    "MOVE_PETAL_BLIZZARD",  // 90, 100 acc
    "MOVE_POLLEN_PUFF",     // 90, heals ally in doubles
    "MOVE_PSYCHIC",         // 90, 10% -SpDef
    "MOVE_SLUDGE_BOMB",     // 90, 30% poison
    "MOVE_SLUDGE_WAVE",     // 95, 30% poison
    "MOVE_SUPERCELL_SLAM",  // 100, 95 acc, paralyzes user if miss
    "MOVE_THUNDERBOLT",     // 90/95, 10% paralysis
    "MOVE_HEAT_WAVE",       // 95/100, 90 acc, 10% burn
    // 101–120 with accuracy or drawback caveats
    "MOVE_BLIZZARD",        // 110/120, 70 acc
    "MOVE_DOUBLE_EDGE",     // 120, recoil
    "MOVE_FIRE_BLAST",      // 110/120, 85 acc
    "MOVE_FOCUS_BLAST",     // 120, 70 acc (only special Fighting)
    "MOVE_HURRICANE",       // 110/120, 70 acc
    "MOVE_HYDRO_PUMP",      // 110/120, 80 acc
    "MOVE_MEGAHORN",        // 120, 85 acc
    "MOVE_PHANTOM_FORCE",   // 90, ignores Protect (2-turn)
    "MOVE_POLTERGEIST",     // 110, 90 acc, fails without item
    "MOVE_POWER_WHIP",      // 120, 85 acc
    "MOVE_THUNDER",         // 110/120, 70 acc
    // Drains (user mentioned explicitly)
    "MOVE_DRAIN_PUNCH",     // 75/60, drain 50%
    "MOVE_LEECH_LIFE",      // 80/20, drain 50%
    // Notable effects
    "MOVE_KNOCK_OFF",       // 65/20 → effectively 97.5 BP with item, item removal
    "MOVE_SCALD",           // 80, 30% burn (huge effect)
    "MOVE_LEAF_BLADE",      // 90/70, high crit
    "MOVE_STONE_EDGE",      // 100, 80 acc, high crit — rock staple
    "MOVE_EARTHQUAKE",      // 100, 100 acc — universal coverage staple
    "MOVE_GUNK_SHOT",       // 120, 80/70 acc, 30% poison — poison nuke
    "MOVE_WILD_CHARGE",     // 90, recoil
];

const godlikeDamagePool = [
    "MOVE_BRAVE_BIRD",      // 120, recoil — flying nuke
    "MOVE_CLOSE_COMBAT",    // 120, -1 Def/SpDef — premier fighting move
    "MOVE_DRACO_METEOR",    // 130/140, -2 SpAtk — dragon nuke
    "MOVE_FLARE_BLITZ",     // 120, recoil, 10% burn — fire nuke
    "MOVE_LEAF_STORM",      // 130/140, -2 SpAtk — grass nuke
    "MOVE_OVERHEAT",        // 130/140, -2 SpAtk — fire nuke
    "MOVE_SUPERPOWER",      // 120, -1 Atk/Def — physical fighting nuke
    "MOVE_OUTRAGE",         // 120/90, locks user
    "MOVE_U_TURN",          // 70, switch after hit
    "MOVE_VOLT_SWITCH",     // 70, switch after hit
    "MOVE_FLIP_TURN",       // 60, pivot (U-turn lite)
];

const nichePool = [
    "MOVE_BEAT_UP",         // damage scales with team size
    "MOVE_DREAM_EATER",     // 100 power, only vs sleeping targets
    "MOVE_ENDEAVOR",        // reduces target HP to match user's
    "MOVE_EXPLOSION",       // 250 power, user faints
    "MOVE_FLING",           // power depends on held item
    "MOVE_FOCUS_PUNCH",     // 150, fails if hit before moving
    "MOVE_HARD_PRESS",      // 100 → scales down with target HP
    "MOVE_MISTY_EXPLOSION", // 100, user faints, 1.5× in Misty Terrain
    "MOVE_SELF_DESTRUCT",   // 200, user faints
    "MOVE_SUPER_FANG",      // halves target HP
];

// ─── STATUS MOVES ─────────────────────────────────────────────────────────────

const averageStatusMoves = [
    "MOVE_AGILITY",
    "MOVE_AMNESIA",
    "MOVE_ATTRACT",
    "MOVE_CHARGE",
    "MOVE_CHARM",
    "MOVE_CONFIDE",
    "MOVE_DOUBLE_TEAM",
    "MOVE_EERIE_IMPULSE",
    "MOVE_FAKE_TEARS",
    "MOVE_ENDURE",
    "MOVE_FOCUS_ENERGY",
    "MOVE_EMBARGO",
    "MOVE_FEATHER_DANCE",
    "MOVE_HAZE",
    "MOVE_IRON_DEFENSE",
    "MOVE_METRONOME",
    "MOVE_PAIN_SPLIT",
    "MOVE_PSYCH_UP",
    "MOVE_RECYCLE",
    "MOVE_ROAR",
    "MOVE_ROCK_POLISH",
    "MOVE_SAFEGUARD",
    "MOVE_SPEED_SWAP",
    "MOVE_SKILL_SWAP",
    "MOVE_SCARY_FACE",
    "MOVE_SCREECH",
    "MOVE_SLEEP_TALK",
    "MOVE_SPITE",
    "MOVE_SWAGGER",
    "MOVE_TORMENT",
    "MOVE_VENOM_DRENCH",
    "MOVE_WONDER_ROOM",
    "MOVE_WORK_UP",
];

const weatherMoves = [
    "MOVE_HAIL",
    "MOVE_RAIN_DANCE",
    "MOVE_SANDSTORM",
    "MOVE_SNOWSCAPE",
    "MOVE_SUNNY_DAY",
];

const barrierMoves = [
    "MOVE_LIGHT_SCREEN",
    "MOVE_REFLECT",
];

const goodStatusMoves = [
    "MOVE_BULK_UP",
    "MOVE_CALM_MIND",
    "MOVE_CURSE",
    "MOVE_DEFOG",
    "MOVE_ELECTRIC_TERRAIN",
    "MOVE_ENCORE",
    "MOVE_GRASSY_TERRAIN",
    "MOVE_PROTECT",
    "MOVE_PSYCHIC_TERRAIN",
    "MOVE_REST",
    "MOVE_MISTY_TERRAIN",
    "MOVE_SPIKES",
    "MOVE_THUNDER_WAVE",
    "MOVE_TOXIC_SPIKES",
    "MOVE_TRICK_ROOM",
    "MOVE_TRICK",
    "MOVE_TAUNT",
];

const godlikeStatusMoves = [
    "MOVE_AURORA_VEIL",
    "MOVE_BATON_PASS",
    "MOVE_COSMIC_POWER",
    "MOVE_DRAGON_DANCE",
    "MOVE_NASTY_PLOT",
    "MOVE_ROOST",
    "MOVE_STEALTH_ROCK",
    "MOVE_SUBSTITUTE",
    "MOVE_SWORDS_DANCE",
    "MOVE_TAILWIND",
    "MOVE_TOXIC",
    "MOVE_WILL_O_WISP",
];

const damageMoves = [
    ...averageDamagePool,
    ...goodDamagePool,
    ...strongDamagePool,
    ...godlikeDamagePool,
    ...nichePool,
];

const statusMoves = [
    ...averageStatusMoves,
    ...weatherMoves,
    ...barrierMoves,
    ...goodStatusMoves,
    ...godlikeStatusMoves,
];

const tmPool = [...damageMoves, ...statusMoves];

module.exports = {
    averageDamagePool,
    goodDamagePool,
    strongDamagePool,
    godlikeDamagePool,
    nichePool,
    averageStatusMoves,
    weatherMoves,
    barrierMoves,
    goodStatusMoves,
    godlikeStatusMoves,
    damageMoves,
    statusMoves,
    tmPool,
};
