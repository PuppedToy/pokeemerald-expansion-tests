const path = require("path");
const {
    EVO_TYPE_LC,
    TRAINER_POKE_STARTER_TREECKO,
    TRAINER_POKE_ENCOUNTER,
    TRAINER_RESTRICTION_NO_REPEATED_TYPE,
    TRAINER_RESTRICTION_ALLOW_ONLY_TYPES,
    TRAINER_POKE_STARTER_TORCHIC,
    TRAINER_POKE_STARTER_MUDKIP,
    TIER_MAGIKARP,
    TIER_ZU,
    TIER_PU,
    TIER_NU,
    TIER_OU,
    POKEMON_TYPE_WATER,
    POKEMON_TYPE_ICE,
    POKEMON_TYPE_BUG,
    POKEMON_TYPE_FAIRY,
    POKEMON_TYPE_GRASS,
    POKEMON_TYPE_FIGHTING,
    POKEMON_TYPE_PSYCHIC,
    POKEMON_TYPE_DARK,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_GROUND,
    POKEMON_TYPE_FLYING,
    POKEMON_TYPE_STEEL,
    TRAINER_REPEAT_ID,
    TIER_UU,
    TIER_RU,
    NATURES,
    POKEMON_TYPE_DRAGON,
    POKEMON_TYPE_ELECTRIC,
    TIER_UBERS,
    TIER_LEGEND,
    TRAINER_POKE_MEGA_FROM_STONE,
    POKEMON_TYPE_NORMAL,
    POKEMON_TYPE_GHOST,
    TIER_AG,
    POKEMON_TYPES,
    TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT,
    TRAINER_E4_KEEP_TYPE_AMOUNT,
    TRAINER_CHAMPION_TYPE_CHANGE_CHANCE,
    EVO_TYPE_NFE,
    EVO_TYPE_SOLO,
} = require("./constants");
const { maps: wildMaps } = require('./wild');
const { getBossPreset, getNonBossPreset, bossMega } = require('./presets');
const rng = require('./rng');

const trainersFile = path.resolve(__dirname, '..', 'src', 'data', 'trainers.party');
const partnersFile = path.resolve(__dirname, '..', 'src', 'data', 'battle_partners.party');

const stevenPokemon = [
    'SPECIES_BALTOY',
    'SPECIES_ARON',
    'SPECIES_KABUTO',
    'SPECIES_OMANYTE',
    'SPECIES_LILEEP',
    'SPECIES_ANORITH',
    'SPECIES_SHIELDON',
    'SPECIES_CRANIDOS',
    'SPECIES_TIRTOUGA',
    'SPECIES_AMAURA',
    'SPECIES_ARCHEN',
    'SPECIES_TYRUNT',
];

const rainAbilities = ['SWIFT_SWIM', 'RAIN_DISH', 'DRY_SKIN', 'HYDRATION'];
const sunAbilities = ['FLOWER_GIFT', 'CHLOROPHYLL', 'LEAF_GUARD', 'SOLAR_POWER', 'PROTOSYNTHESIS'];
const sandAbilities = ['SAND_FORCE', 'SAND_RUSH', 'SAND_VEIL'];
const snowAbilities = ['ICE_BODY', 'SNOW_CLOAK', 'SLUSH_RUSH'];

// T-052 — evil-team type themes are configurable via 5 ordered slots
// (main, secondary, other 1..3), each a specific type or the 'RANDOM' token. These historical
// arrays are the no-config fallback (byte-identical for CLI/determinism callers that pass no
// config); the frontend supplies its own defaults (slot 5 = RANDOM). `let` because getTrainersData
// re-resolves them from config on each call.
const AQUA_DEFAULT_TYPES = [
    POKEMON_TYPE_WATER,
    POKEMON_TYPE_DARK,
    POKEMON_TYPE_POISON,
    POKEMON_TYPE_ICE,
    POKEMON_TYPE_FLYING,
];

const MAGMA_DEFAULT_TYPES = [
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_GROUND,
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_GRASS,
    POKEMON_TYPE_FIGHTING,
];

let aquaTeamTypes = [...AQUA_DEFAULT_TYPES];
let magmaTeamTypes = [...MAGMA_DEFAULT_TYPES];

function sampleAndRemove(array) {
    const index = Math.floor(rng.random() * array.length);
    const item = array[index];
    array.splice(index, 1);
    return item;
}

// T-076 — draw one type from `pool` at random, excluding `exclude` (a changed boss's own canonical
// type, so "changed" always differs), remove it from the pool and return it. Consumes exactly one
// rng draw, like sampleAndRemove. With 18 types and at most 13 typed bosses there are always ≥5
// spare types, so at least one non-excluded entry is guaranteed when a changed boss draws.
function samplePoolExcluding(pool, exclude) {
    const candidates = [];
    for (let i = 0; i < pool.length; i++) {
        if (pool[i] !== exclude) candidates.push(i);
    }
    const chosen = candidates[Math.floor(rng.random() * candidates.length)];
    const type = pool[chosen];
    pool.splice(chosen, 1);
    return type;
}

/**
 * Resolve a team's 5 type slots from config. Each configured entry is either a valid POKEMON_TYPE
 * or the 'RANDOM' token (also: missing/invalid entries are treated as RANDOM). RANDOM slots draw —
 * in order, seed-deterministically via rng — from the pool of types not already chosen for this
 * team, so slots never collide. When `configTypes` is not an array, returns the historical defaults
 * WITHOUT consuming any rng (keeps no-config runs byte-identical).
 *
 * @param {Array<string>|undefined} configTypes
 * @param {Array<string>} defaults - length defines the number of slots
 * @returns {Array<string>}
 */
function resolveTeamTypes(configTypes, defaults) {
    if (!Array.isArray(configTypes)) return [...defaults];
    const valid = new Set(POKEMON_TYPES);
    const slots = [];
    for (let i = 0; i < defaults.length; i++) {
        const v = configTypes[i];
        slots.push(valid.has(v) ? v : 'RANDOM');
    }
    const used = new Set(slots.filter(s => s !== 'RANDOM'));
    const pool = POKEMON_TYPES.filter(t => !used.has(t));
    return slots.map(s => {
        if (s !== 'RANDOM') return s;
        if (pool.length === 0) return defaults[0];
        return sampleAndRemove(pool);
    });
}

const originalE4Types = [POKEMON_TYPE_DARK, POKEMON_TYPE_GHOST, POKEMON_TYPE_ICE, POKEMON_TYPE_DRAGON];
const originalGymTypes = [
    POKEMON_TYPE_ROCK,
    POKEMON_TYPE_FIGHTING,
    POKEMON_TYPE_ELECTRIC,
    POKEMON_TYPE_FIRE,
    POKEMON_TYPE_NORMAL,
    POKEMON_TYPE_FLYING,
    POKEMON_TYPE_PSYCHIC,
    POKEMON_TYPE_WATER,
];
// T-076 — the champion (Steven) is the 13th typed boss and shares the gym/E4 type pool.
const originalChampionType = POKEMON_TYPE_STEEL;

// New defs

// T-128 — the weather/terrain setter pokeDef* wrappers were removed: the gimmick seed (weather /
// electric terrain) now produces the setter + abusers + rock via the identity-aware ability logic
// (T-124) and the weather-rock / Electric-Seed item logic (T-125), materialising or dropping on its own.

const PROMISING_OU_UBERS_MEGA_LC = {
    megaTier: [TIER_OU, TIER_UBERS],
    contextualTier: [TIER_PU],
    evoType: [EVO_TYPE_LC],
};

// T-128 — Steven's authoritative legend slot (STEVEN_LEGEND). The other absolute-tier and mega POKEDEF
// helpers were removed once every boss moved to preset pools + the bossMega story-progression mega gate.
const ABSOLUTE_POKEDEF_LEGEND = { absoluteTier: [TIER_LEGEND], checkValidEvo: true };

// ── T-128 — Favourite Pokémon chains ─────────────────────────────────────────
// A favourite is an ordered SPECIES chain (priority high→low). resolveFavourites (modules/favouriteClaim)
// claims the pool slot of the species' exact tier — or the {isMega} slot, gated by the story-progression
// mega rule, if it is a mega — resolved FIRST; else it drops to the next rung, else the implicit
// restriction-bounded fallback. Every favourite (gym / villain / Steven / Wally / rival-starter) is one.

// villainFavourite('SPECIES_SHARPEDO_MEGA') → a villain leader's signature-mega chain: the signature
// mega ≫ any mega of the team's types (the { mega } rung) ≫ the implicit "any team-typed mon" fallback.
// The 5-type team theme is a TRAINER restriction (ALLOW_ONLY_TYPES + trainer.types), so it is applied to
// the signature, the { mega } rung and the final fallback alike — no per-rung type lists needed.
const villainFavourite = (aceMega) => [aceMega, { mega: true }];

// T-128 — a gym leader's favourite is EXCLUSIVELY its signature species. It claims a pool slot of that
// species' actual tier (or the {isMega} slot if it is a mega), else drops to the standard restriction-
// bounded fallback (implicit). The gym's rolled-type restriction lives at the trainer level.
// (Steven, Wally and Tate & Liza now express their favourites inline as species chains too.)
const gymFavourite = (signature) => [signature];

// ── T-106 — reverse-order continuity (authoritative-latest) ──────────────────
// ADR-016 §4: a recurring character's final, well-built roster must be decided BEFORE its earlier
// appearances, which then echo it devolved (Champion Metagross → Granite-Cave Metang). Rather than
// reverse the whole generation loop (which would break the 15 `copy:` rival trainers that must run
// after their target), we HOIST each character's authoritative (endgame) appearance to just before
// its earliest appearance. Per-slot reseed makes every non-recurring team order-independent, so this
// is output-neutral except for the intended recurring-character inversion. Pure; unit-tested.
function hoistAuthoritativeAppearances(trainersData, groups) {
    for (const { auth, members } of groups) {
        const authIdx = trainersData.findIndex(t => t.id === auth);
        if (authIdx === -1) continue;
        const idxs = members.map(id => trainersData.findIndex(t => t.id === id)).filter(i => i >= 0);
        const earliest = Math.min(authIdx, ...idxs);
        if (authIdx <= earliest) continue; // already generated first
        const [authTrainer] = trainersData.splice(authIdx, 1); // earliest < authIdx → index stays valid
        trainersData.splice(earliest, 0, authTrainer);
    }
    return trainersData;
}

// The recurring characters whose latest appearance is authoritative (endgame roster decided first, the
// earlier appearances echo it devolved). `auth` = the latest appearance; `members` = the earlier ones.
const CONTINUITY_GROUPS = [
    { auth: 'TRAINER_CHAMPION_STEVEN', members: ['TRAINER_STEVEN', 'PARTNER_STEVEN'] },
    { auth: 'TRAINER_WALLY_VR_1', members: ['TRAINER_WALLY_MAUVILLE', 'TRAINER_WALLY_LILYCOVE'] },
    // The rival: Ever Grande (lvl 70) is authoritative; its four earlier appearances echo it devolved.
    // One group per starter variant (only the player's runs, but all three are generated).
    ...['TREECKO', 'TORCHIC', 'MUDKIP'].map(s => ({
        auth: `TRAINER_MAY_EVERGRANDE_CITY_${s}`,
        members: [`TRAINER_MAY_ROUTE_103_${s}`, `TRAINER_MAY_RUSTBORO_${s}`, `TRAINER_MAY_ROUTE_110_${s}`, `TRAINER_MAY_ROUTE_119_${s}`],
    })),
];


const genericTrainerTeamPreRival         = () => getNonBossPreset('PRE_RIVAL');
const genericTrainerTeamPostRival        = () => getNonBossPreset('POST_RIVAL');
const genericTrainerTeamPostWoodsGrunt   = () => getNonBossPreset('PETALBURG_WOODS_GRUNT');
const genericTrainerTeamPostMuseumGrunts = () => getNonBossPreset('POST_MUSEUM_GRUNTS');

// ── Pre-Wattson (contextual tier, no mega) ────────────────────────────────────
const genericTrainerTeamPostRoxanne      = () => getNonBossPreset('ROXANNE');
const genericTrainerTeamPostRusturfGrunt = () => getNonBossPreset('RUSTURF_GRUNT');
const genericTrainerTeamPostBrawly       = () => getNonBossPreset('BRAWLY');

// ── PostWattson/PreFlannery (absolute tier, UU mega) ──────────────────────────
const genericTrainerTeamPostWattson      = () => getNonBossPreset('WATTSON',        TIER_UU, true);
const genericTrainerTeamPostMaxieChimney = () => getNonBossPreset('MAXIE_CHIMNEY',  TIER_UU, true);

// ── Post-Flannery era (absolute tier, OU mega) ────────────────────────────────
const genericTrainerTeamPostFlannery      = () => getNonBossPreset('FLANNERY',       TIER_OU, true);
const genericTrainerTeamPostNorman        = () => getNonBossPreset('NORMAN',         TIER_OU, true);
const genericTrainerTeamPostShelly        = () => getNonBossPreset('SHELLY_WEATHER', TIER_OU, true);
const genericTrainerTeamPostWinona        = () => getNonBossPreset('WINONA',         TIER_OU, true);
const genericTrainerTeamPostMaxieMagma    = () => getNonBossPreset('MAXIE_MAGMA',    TIER_OU, true);
const genericTrainerTeamPostMatt          = () => getNonBossPreset('MATT_AQUA',      TIER_OU, true);
const genericTrainerTeamPostTateAndLiza   = () => getNonBossPreset('TATE_AND_LIZA',  TIER_OU, true);
const genericTrainerTeamPostArchie        = () => getNonBossPreset('ARCHIE',         TIER_OU, true);

// ── Post-Juan era (absolute tier, UBERS mega) ─────────────────────────────────
const genericTrainerTeamPostJuan     = () => getNonBossPreset('JUAN',            TIER_UBERS, true);

const sample = (array) => {
    return array[Math.floor(rng.random() * array.length)];
}

const getSampleItemsFromArray = (array, amount) => {
    const result = new Set();
    for (let i = 0; i < amount; i++) {
        result.add(sample(array));
    }
    return Array.from(result);
};

function getWildEncountersFromMap(mapId, encounterTypes) {
    const map = wildMaps.find(m => m.id === mapId);
    if (!map) {
        throw new Error('Map not found: ' + mapId);
    }

    const result = [];
    Object.entries(map).forEach(([encounterType, encounter]) => {
        if (encounterTypes.includes(encounterType)) {
            result.push(encounter);
        }
    });

    return result;
}

const rival101Encounters = getWildEncountersFromMap('MAP_ROUTE101', ['land', 'old']);
const rival102Encounters = getWildEncountersFromMap('MAP_ROUTE102', ['land', 'old']);
const rival103Encounters = getWildEncountersFromMap('MAP_ROUTE103', ['land', 'old']);
const rival104Encounters = getWildEncountersFromMap('MAP_ROUTE104', ['land', 'old']);

const rivalRustboroEncounters = [
    ...rival101Encounters,
    ...rival102Encounters,
    ...rival103Encounters,
    ...rival104Encounters,
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['land', 'old']),
];

const rival110Encounters = [
    ...rivalRustboroEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE106', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['land', 'old']),
    ...getWildEncountersFromMap('MAP_ROUTE110', ['land']),
];

const rivalGoodRodEncounters = [
    ...getWildEncountersFromMap('MAP_ROUTE101', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE102', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE103', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE104', ['good']),
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE106', ['good']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['good']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['good']),
];

const rival119Encounters = [
    ...rival110Encounters,
    ...rivalGoodRodEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE110', ['old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE117', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE118', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE111', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE112', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE113', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE114', ['land', 'old', 'good']),
    ...getWildEncountersFromMap('MAP_ROUTE119', ['land', 'old', 'good']),
];

const rivalSuperRodEncounters = [
    ...getWildEncountersFromMap('MAP_ROUTE101', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE102', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE103', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE104', ['super']),
    ...getWildEncountersFromMap('MAP_PETALBURG_WOODS', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE115', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE116', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE106', ['super']),
    ...getWildEncountersFromMap('MAP_GRANITE_CAVE', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE109', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE110', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE117', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE118', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE111', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE112', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE113', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE114', ['super']),
    ...getWildEncountersFromMap('MAP_ROUTE119', ['super']),
];

const rivalEvergrandeCityEncounters = [
    ...rival119Encounters,
    ...rivalSuperRodEncounters,
    ...getWildEncountersFromMap('MAP_ROUTE120', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SCORCHED_SLAB', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE121', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE122', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_MT_PYRE_EXTERIOR', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE123', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE124', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE125', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE127', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE126', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE128', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE129', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE131', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_PACIFIDLOG_TOWN', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_ROUTE132', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('EVER_GRANDE_CITY', ['land', 'old', 'good', 'super', 'underwater']),
    ...getWildEncountersFromMap('MAP_VICTORY_ROAD_B1F', ['land', 'old', 'good', 'super', 'underwater']),
];

// T-106 — reverse-order rival continuity. The rival's roster is now decided at EVER GRANDE (lvl 70,
// authoritative) and echoed DEVOLVED at the earlier appearances. The starter is the rival's favourite
// (the type-counter to the player's choice); this maps each May object's starter suffix to that special.
const RIVAL_STARTER_SPECIAL = {
    TREECKO: TRAINER_POKE_STARTER_TORCHIC, // player Treecko → rival Torchic-line
    TORCHIC: TRAINER_POKE_STARTER_MUDKIP,  // player Torchic → rival Mudkip-line
    MUDKIP:  TRAINER_POKE_STARTER_TREECKO, // player Mudkip  → rival Treecko-line
};

const rival103Template = (id) => [
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival101Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival102Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival103Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival102Encounters, ...rival103Encounters],
        tryEvolve: true,
        pickBest: true,
    },
    {
        // T-106 — echoes Ever Grande's authoritative mega, devolved to lvl 7 (its LC base).
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
];

const rivalRustboroTemplate = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        breedTier: 'perfect',
        devolveToLevel: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalRustboroEncounters],
        tryEvolve: true,
    },
    {
        // T-106 — echoes Ever Grande's authoritative premium ace, devolved to lvl 17.
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
];

const rivalRoute110Template = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        breedTier: 'perfect',
        devolveToLevel: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival110Encounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival110Encounters],
        pickBest: true,
        tryEvolve: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
    {
        // T-106 — echoes Ever Grande's authoritative premium ace, devolved to lvl 26.
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
];


// All four continuity aces echo Ever Grande devolved to lvl 44; the two encounters stay route flavour.
const rivalRoute119Template = (id) => [
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_STARTER_' + id,
        breedTier: 'perfect',
        devolveToLevel: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival119Encounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rival119Encounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
    {
        special: TRAINER_REPEAT_ID,
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        breedTier: 'good',
        devolveToLevel: true,
    },
];

// T-106 — Ever Grande is now the rival's AUTHORITATIVE appearance: it picks the strong endgame roster
// (mega + evolved starter favourite + two premium aces + legendary + route encounter); the earlier
// appearances echo it devolved. `id` is the starter suffix.
const rivalEvergrandeCityTemplate = (id) => [
    {
        // authoritative mega (was a repeat of Route 103's)
        id: 'RIVAL_MEGA_103_KEEP_' + id,
        breedTier: 'good',
        ...PROMISING_OU_UBERS_MEGA_LC,
        tryEvolve: true,
        tryMega: true,
    },
    {
        special: 'PLAYER_LEGEND_' + id,
        breedTier: 'good',
    },
    {
        // authoritative starter — the rival's favourite (type-counter to the player's), fully evolved
        id: 'RIVAL_STARTER_' + id,
        breedTier: 'perfect',
        special: RIVAL_STARTER_SPECIAL[id],
        tryEvolve: true,
    },
    {
        special: TRAINER_POKE_ENCOUNTER,
        encounterIds: [...rivalEvergrandeCityEncounters],
        pickBest: true,
        tryEvolve: true,
        tryMega: true,
    },
    {
        // authoritative premium ace (was a repeat)
        id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id,
        breedTier: 'good',
        evolutionTier: [TIER_OU],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [{ id: 'RIVAL_PREMIUM_RUSTBORO_KEEP_' + id, breedTier: 'good', evolutionTier: [TIER_UU], evoType: [EVO_TYPE_LC], tryEvolve: true }],
    },
    {
        // authoritative premium ace (was a repeat)
        id: 'RIVAL_PREMIUM_110_KEEP_' + id,
        breedTier: 'good',
        evolutionTier: [TIER_OU],
        evoType: [EVO_TYPE_LC],
        tryEvolve: true,
        fallback: [{ id: 'RIVAL_PREMIUM_110_KEEP_' + id, breedTier: 'good', evolutionTier: [TIER_UU], evoType: [EVO_TYPE_LC], tryEvolve: true }],
    },
];

function getTrainersData(itemAssignments, tmList, config = {}) {
    // Gym / E4 type randomization — seeded here so it respects rng.seed(config.seed).
    // T-052: the frontend exposes how many gyms / E4 CHANGE their type; internally we keep the
    // complement (keep = total − changed). Absent/invalid config falls back to the historical keep
    // constants so default runs stay byte-identical.
    const clampChanged = (value, total, defaultChanged) => {
        if (typeof value !== 'number' || !Number.isFinite(value)) return defaultChanged;
        return Math.max(0, Math.min(total, Math.round(value)));
    };
    const gymsChanged = clampChanged(config.gymsTypeChanged, originalGymTypes.length, originalGymTypes.length - TRAINER_GYM_LEADERS_KEEP_TYPE_AMOUNT);
    const e4Changed = clampChanged(config.e4TypeChanged, originalE4Types.length, originalE4Types.length - TRAINER_E4_KEEP_TYPE_AMOUNT);
    const gymLeadersKeepTypeAmount = originalGymTypes.length - gymsChanged;
    const e4KeepTypeAmount = originalE4Types.length - e4Changed;

    // T-052 — resolve the configurable Aqua/Magma type themes (RANDOM slots consume rng only when
    // present, so a no-config call is byte-identical). Done before gym/E4 selection.
    aquaTeamTypes = resolveTeamTypes(config.aquaTypes, AQUA_DEFAULT_TYPES);
    magmaTeamTypes = resolveTeamTypes(config.magmaTypes, MAGMA_DEFAULT_TYPES);

    // T-076 — probability the champion (Steven) is one of the "changed" bosses. Unlike the gym/E4
    // count knobs, the champion is a single boss, so it flips changed with this Bernoulli chance
    // (clamped to [0,1]; absent/invalid falls back to the historical constant, default 0.05).
    const championChangeChance = (typeof config.championTypeChangeChance === 'number' && Number.isFinite(config.championTypeChangeChance))
        ? Math.max(0, Math.min(1, config.championTypeChangeChance))
        : TRAINER_CHAMPION_TYPE_CHANGE_CHANCE;

    // T-076 — Unified fixed/changed type pool over the 13 typed bosses (8 gyms + 4 E4 + champion).
    // Step 1: mark each boss fixed/changed (gyms/E4 by count, champion by the Bernoulli above).
    // Step 2: fixed bosses claim their canonical type; the pool is every POKEMON_TYPE not claimed by
    //         a fixed boss. Step 3: changed bosses draw (and remove) from that shared pool, excluding
    //         their own canonical. So a type freed by a changed boss in one group (e.g. Roxanne's
    //         Rock, or the champion's Steel when it changes) is eligible for any other changed boss —
    //         gyms, E4 and champion share one type space instead of walled-off per-group pools.
    const coinsForE4Types = [0, 1, 2, 3];
    const coinsForGymTypes = [0, 1, 2, 3, 4, 5, 6, 7];
    const whoKeepsE4Type = [];
    const whoKeepsGymType = [];
    for (let i = 0; i < e4KeepTypeAmount; i++) {
        whoKeepsE4Type.push(sampleAndRemove(coinsForE4Types));
    }
    for (let i = 0; i < gymLeadersKeepTypeAmount; i++) {
        const chosenType = sampleAndRemove(coinsForGymTypes);
        whoKeepsGymType.push(chosenType);
    }
    const championChanged = rng.random() < championChangeChance;

    const gymMainTypes = new Array(originalGymTypes.length);
    const gymIsChangedType = new Array(originalGymTypes.length);
    const e4MainTypes = new Array(originalE4Types.length);
    let championMainType;

    // Step 2 — fixed bosses claim their canonical type and remove it from the shared pool.
    const typePool = [...POKEMON_TYPES];
    const claimType = (t) => {
        const i = typePool.indexOf(t);
        if (i !== -1) typePool.splice(i, 1);
    };
    for (let i = 0; i < originalGymTypes.length; i++) {
        if (whoKeepsGymType.includes(i)) {
            gymMainTypes[i] = originalGymTypes[i];
            gymIsChangedType[i] = false;
            claimType(originalGymTypes[i]);
        }
    }
    for (let i = 0; i < originalE4Types.length; i++) {
        if (whoKeepsE4Type.includes(i)) {
            e4MainTypes[i] = originalE4Types[i];
            claimType(originalE4Types[i]);
        }
    }
    if (!championChanged) {
        championMainType = originalChampionType;
        claimType(originalChampionType);
    }

    // Step 3 — changed bosses draw from the shared pool, excluding their own canonical type.
    for (let i = 0; i < originalGymTypes.length; i++) {
        if (!whoKeepsGymType.includes(i)) {
            gymMainTypes[i] = samplePoolExcluding(typePool, originalGymTypes[i]);
            gymIsChangedType[i] = true;
        }
    }
    for (let i = 0; i < originalE4Types.length; i++) {
        if (!whoKeepsE4Type.includes(i)) {
            e4MainTypes[i] = samplePoolExcluding(typePool, originalE4Types[i]);
        }
    }
    if (championChanged) {
        championMainType = samplePoolExcluding(typePool, originalChampionType);
    }

    const [e41MainType, e42MainType, e43MainType, e44MainType] = e4MainTypes;

    // Pool-derived item arrays (display names from itemRandomizer)
    const route102BallItems      = itemAssignments.route102Ball;
    const petalburgPlateItems    = itemAssignments.petalburgPlates;
    const route104GemItems       = itemAssignments.route104Gems;
    const route104BerryItems     = itemAssignments.route104Berries;
    const route111ItemItems      = itemAssignments.route111Items;
    const route111BerryItems     = itemAssignments.route111Berries;
    const route117BerryItems     = itemAssignments.route117Berries;
    const route106GoodItem       = itemAssignments.route106GoodItem;
    const route106BallItems      = itemAssignments.route106Ball;
    const route116XSpecialItem   = itemAssignments.route116XSpecial;
    const route116GemItems       = itemAssignments.route116Gems;
    const route116BerryItems     = itemAssignments.route116Berries;
    const route116BallItems      = itemAssignments.route116Ball;
    const route109GoodItem           = itemAssignments.route109GoodItem;
    const route110GoodItem           = itemAssignments.route110GoodItem;
    const route110LumGoodItem        = itemAssignments.route110LumGoodItem;
    const route117GoodItem           = itemAssignments.route117GoodItem;
    const route110ExtenderBallItems  = itemAssignments.route110ExtenderBall;
    const route117GemItems       = itemAssignments.route117Gems;
    const route117PlateItems     = itemAssignments.route117Plates;
    const route111HpUpGoodItem    = itemAssignments.route111HpUpGoodItem;
    const route111BallAItems      = itemAssignments.route111BallA;
    const route111BallCItems      = itemAssignments.route111BallC;
    const route114WyattGoodItem    = itemAssignments.route114WyattGoodItem;
    const route118BarnyGoodItem  = itemAssignments.route118BarnyGoodItem;
    const route118ItemItems      = itemAssignments.route118Items;
    const route120AngelicaGoodItem = itemAssignments.route120AngelicaGoodItem;
    const route121BerryItems     = itemAssignments.route121Berries;

    // TM helper: tmItem(n) → 'TM_MOVENAME' for TM slot n (1-based)
    const tmItem = (n) => `TM_${tmList[n - 1]}`;

    // Pool-derived choice arrays (replace old hardcoded versions below)
    const woodsPlatesChoice    = petalburgPlateItems;
    const choice104Berry       = route104BerryItems;
    const choice104Gem         = route104GemItems;
    const choice116Gem         = route116GemItems;
    const choice116Berry       = route116BerryItems;
    const choice116PickTMs     = [tmItem(65), tmItem(66), tmItem(67)];
    const choice104TMs         = [tmItem(5), tmItem(6), tmItem(7)];
    const choice104TMs2        = [tmItem(8), tmItem(9), tmItem(10)];
    const choicesDewfordTMs    = [tmItem(4), tmItem(3), tmItem(2)];
    const choice110TMs         = [tmItem(63), tmItem(64), tmItem(62)];
    const choiceMelinaBerries  = route117BerryItems;
    const choiceAishaGems      = route117GemItems;
    const choiceNobTMs         = [tmItem(80), tmItem(79), tmItem(81)];
    const choiceCharlotteTMs   = [tmItem(13), tmItem(15), tmItem(14)];
    const choiceChesterTMs     = [tmItem(34), tmItem(33), tmItem(35)];
    const choiceDeandreTMs     = [tmItem(20), tmItem(21), tmItem(22)];
    const choiceHectorTMs      = [tmItem(77), tmItem(76)];
    const choiceCarolTMs       = [tmItem(85), tmItem(86), tmItem(87)];
    const choiceBriceTMs       = [tmItem(23), tmItem(24), tmItem(25)];
    const choiceTammyTMs       = [tmItem(82), tmItem(83), tmItem(84)];
    const choiceRickyTMs       = [tmItem(16), tmItem(17), tmItem(18)];
    const choiceHueyTMs        = [tmItem(68), tmItem(69), tmItem(70)];
    const choiceGraceTMs       = [tmItem(36), tmItem(37), tmItem(38)];
    const choiceWiltonTMs      = [tmItem(26), tmItem(27), tmItem(28)];
    const choiceNolanTMs       = [tmItem(88), tmItem(89), tmItem(90)];
    const choiceAngelinaTMs    = [tmItem(57), tmItem(58), tmItem(59), tmItem(60)];
    const choiceBryanTMs       = [tmItem(12), tmItem(29), tmItem(30)];
    const rival103TM           = tmItem(71);
    const choiceHeidiItems     = [...route111ItemItems];
    const choiceWadeBerries    = route118ItemItems;
    const choiceRoseTMs        = [tmItem(39), tmItem(40), tmItem(41)];
    const choiceClarissaTMs    = [tmItem(42), tmItem(43), tmItem(44)];
    const choiceWalterTMs      = [tmItem(45), tmItem(46), tmItem(47)];
    const choiceCristinBerries = route121BerryItems;
    const choicePresleyTMs     = [tmItem(48), tmItem(49), tmItem(50)];
    const choiceJosephSeeds    = ['Electric Seed', 'Grassy Seed', 'Psychic Seed', 'Misty Seed'];
    const jessicaTM            = tmItem(52);
    const spencerTM            = tmItem(92);
    const rolandTM             = tmItem(53);
    const auronTM              = tmItem(54);
    const aidanTM              = tmItem(55);
    const athenaTM             = tmItem(93);
    const quincyTM             = tmItem(56);
    const katelynTM            = tmItem(94);

const rival103Bag = () => [
    'Oran Berry',
    rival103TM,
    sample([...route102BallItems]),
];

const petalwoodGruntBag = () => [
    ...rival103Bag(),
    'Eviolite',
    sample([...petalburgPlateItems]),
];

const roxanneBag = () => [
    ...petalwoodGruntBag(),
    sample([...choice104Gem]),
    sample([...choice104Berry]),
    sample([...choice104TMs]),
    tmItem(1),
];

const rusturfGruntBag = () => [
    ...roxanneBag(),
    sample([...route116BallItems]),
    sample([...choice116PickTMs]),
    route116XSpecialItem,
];

const rivalRustboroBag = () => [
    ...rusturfGruntBag(),
    sample(['Toxic Orb', 'Flame Orb']),
    sample([...choice116Gem]),
    sample([...choice116Berry]),
];

const brawlyBag = () => [
    ...rivalRustboroBag(),
    route106GoodItem,
    sample([...choicesDewfordTMs]),
    sample([...route106BallItems]),
    tmItem(61),
];

const stevenBag = () => [
    ...brawlyBag(),
    tmItem(19),  // Steven's TM
];

const slateportGruntsBag = () => [
    ...stevenBag(),
    route109GoodItem,
    sample([...choiceRickyTMs]),
    sample([...choiceHueyTMs]),
    // 'Damp Rock',
    // 'Heat Rock',
    // 'Smooth Rock',
    // 'Icy Rock',
];

const rivalRoute110Bag = () => [
    ...slateportGruntsBag(),
    sample([...choice110TMs]),
    route110GoodItem,
    'Lum Berry', // T-056: opponents start carrying Lum Berry from the Route 110 rival, not Rustboro
    sample([...route110ExtenderBallItems]),
    tmItem(2),
    tmItem(5),
    tmItem(8),
    tmItem(62),
    tmItem(65),
    tmItem(68),
];

const wallyBag = () => [
    ...rivalRoute110Bag(),
    route110LumGoodItem,
    sample([...choiceJosephSeeds]),
    sample([...choiceDeandreTMs]),
];

const wattsonBag = () => [
    ...wallyBag(),
    sample([...choiceHectorTMs]),
    sample([...choiceMelinaBerries]),
    sample(choiceAishaGems),
    route117GoodItem,
    'Light Clay',
    tmItem(11),   // Wattson's gym TM
    'TM_ROCK_SMASH',  // HM, not randomized
];

const magmaChimneyBag = () => [
    ...wattsonBag(),
    route111HpUpGoodItem,
    sample([...route111BallAItems]),
    sample([...choiceCarolTMs]),
    sample([...choiceBriceTMs]),
];

const flanneryBag = () => [
    ...magmaChimneyBag(),
    route114WyattGoodItem,
    sample(choiceNobTMs),
    sample([...choiceWiltonTMs]),
    sample([...choiceCharlotteTMs]),
    sample([...choiceNolanTMs]),
    sample([...choiceAngelinaTMs]),
    'Nugget',
    tmItem(78),   // Flannery's gym TM
    'TM_STRENGTH',  // HM, not randomized
];

const normanBag = () => [
    ...flanneryBag(),
    sample([...route111BerryItems]),
    sample([...route111BallCItems]),
    sample([...choiceNobTMs]),
    sample([...choiceBryanTMs]),
    sample([...choiceHeidiItems]),
    tmItem(31),   // Norman's gym TM
    'TM_SURF',    // HM, not randomized
];

const shellyBag = () => [
    ...normanBag(),
    route118BarnyGoodItem,
    sample([...choiceWadeBerries]),
    sample([...choiceRoseTMs]),
    sample([...choiceChesterTMs]),
    'Lum Berry',
];

const rival119Bag = () => [
    ...shellyBag(),
    'Leftovers',
];

const winonaBag = () => [
    ...rival119Bag(),
    route120AngelicaGoodItem,
    sample([...choiceClarissaTMs]),
    tmItem(32),   // Winona's gym TM
    tmItem(12),
    tmItem(13),
    tmItem(16),
    tmItem(20),
    tmItem(23),
    tmItem(26),
];

const wallyBag2 = () => [
    ...winonaBag(),
    'Focus Sash',
    sample([...choiceTammyTMs]),
    sample([...choiceCristinBerries]),
    sample([...choiceWalterTMs]),
    jessicaTM,
];

const choiceIsabellaItem = ['Choice Band', 'Choice Scarf', 'Choice Specs'];

const tateAndLizaBag = () => [
    ...wallyBag2(),
    sample([...choiceIsabellaItem]),
    sample([...choiceGraceTMs]),
    spencerTM,   // Spencer's route 124 TM
    rolandTM,   // Roland's route 124 TM
    tmItem(91),   // Tate & Liza's gym TM
];

const spaceCenterBag = () => [
    ...tateAndLizaBag(),
    sample([...choicePresleyTMs]),
    auronTM,   // Auron's route 125 TM
];

const archieBag = () => [
    ...spaceCenterBag(),
    aidanTM,   // Aidan's route 127 TM
    athenaTM,   // Athena's route 127 TM
    'Eject Button',   // route 127 static item
]

const juanBag = () => [
    ...archieBag(),
    tmItem(51),   // Juan's gym TM (randomized)
    'TM_WATERFALL',   // HM — not randomized
];

const endgameBag = () => [
    ...juanBag(),
    quincyTM,   // Quincy's victory road TM
    katelynTM,   // Katelynn's victory road TM
    tmItem(95),   // EverGrande rival TM
];

const leagueBag = () => [
    ...endgameBag(),
    tmItem(33),
    tmItem(36),
    tmItem(39),
    tmItem(42),
    tmItem(45),
    tmItem(48),
    tmItem(79),
    tmItem(82),
    tmItem(85),
    tmItem(88),
];

const trainersData = [
    // Route 101
    {
        id: 'TRAINER_CALVIN_1',
        location: 'Route 101',
        class: 'Youngster',
        reward: ['SPECIES_ZIGZAGOON'],
        level: 7,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ZIGZAGOON'] },
            ...genericTrainerTeamPreRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_ELIJAH',
        location: 'Route 101',
        class: 'Bird Keeper',
        bag: ['Oran Berry'],
        reward: ['Oran Berry'],
        level: 7,
        team: genericTrainerTeamPreRival(),
    },
    // Route 102
    {
        id: 'TRAINER_ALLEN',
        location: 'Route 102',
        class: 'Camper',
        reward: ['SPECIES_WURMPLE'],
        level: 7,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_WURMPLE'] },
            ...genericTrainerTeamPreRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_RICK',
        location: 'Route 102',
        class: 'Bug Catcher',
        reward: ['SPECIES_WINGULL'],
        level: 7,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_WINGULL'] },
            ...genericTrainerTeamPreRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_TIANA',
        location: 'Route 102',
        class: 'Lass',
        reward: [...route102BallItems],
        level: 7,
        bag: [...route102BallItems],
        team: genericTrainerTeamPreRival(),
    },
    // Route 103
    {
        id: 'TRAINER_SAWYER_1',
        location: 'Route 103',
        class: 'Hiker',
        reward: ['SPECIES_SMEARGLE'],
        level: 7,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SMEARGLE'] },
            ...genericTrainerTeamPreRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_CARTER',
        location: 'Route 103',
        class: 'Fisherman',
        reward: ['SPECIES_SURSKIT'],
        level: 7,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SURSKIT'] },
            ...genericTrainerTeamPreRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TREECKO',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        team: [
            {
                // T-106 — echoes Ever Grande's authoritative starter, devolved to lvl 7 (its baby form).
                special: TRAINER_REPEAT_ID,
                id: 'RIVAL_STARTER_TREECKO',
                breedTier: 'perfect',
                devolveToLevel: true,
            },
            ...rival103Template('TREECKO'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        team: [
            {
                special: TRAINER_REPEAT_ID,
                id: 'RIVAL_STARTER_TORCHIC',
                breedTier: 'perfect',
                devolveToLevel: true,
            },
            ...rival103Template('TORCHIC'),
        ]
    },
    {
        id: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        location: 'Route 103',
        class: 'May',
        reward: [rival103TM],
        bag: [...rival103Bag()],
        level: 7,
        isBoss: true,
        team: [
            {
                special: TRAINER_REPEAT_ID,
                id: 'RIVAL_STARTER_MUDKIP',
                breedTier: 'perfect',
                devolveToLevel: true,
            },
            ...rival103Template('MUDKIP'),
        ]
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TREECKO',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_TORCHIC',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_103_MUDKIP',
        location: 'Route 103',
        copy: 'TRAINER_MAY_ROUTE_103_MUDKIP',
        class: 'Brendan',
    },
    // Route 104
    {
        id: 'TRAINER_BILLY',
        location: 'Route 104',
        class: 'Youngster',
        reward: ['SPECIES_GEODUDE'],
        level: 10,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_GEODUDE'] },
            ...genericTrainerTeamPostRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_DARIAN',
        location: 'Route 104',
        class: 'Fisherman',
        reward: ['SPECIES_WEEDLE'],
        level: 10,
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_WEEDLE'] },
            ...genericTrainerTeamPostRival().slice(1),
        ],
    },
    {
        id: 'TRAINER_CINDY_1',
        location: 'Route 104',
        class: 'Lady',
        reward: ['Eviolite'],
        level: 10,
        bag: [...getSampleItemsFromArray(rival103Bag(), 1), 'Eviolite'],
        team: genericTrainerTeamPostRival(),
    },
    {
        id: 'TRAINER_KOICHI',
        location: 'Route 104',
        class: 'Black Belt',
        reward: [...choice104TMs2],
        level: 10,
        bag: [...choice104TMs2],
        team: genericTrainerTeamPostRival(),
    },
    // Petalburg Woods
    {
        id: 'TRAINER_LYLE',
        location: 'Petalburg Woods',
        class: 'Bug Catcher',
        reward: [...woodsPlatesChoice],
        level: 10,
        bag: [...woodsPlatesChoice],
        team: genericTrainerTeamPostRival(),
    },
    {
        id: 'TRAINER_GRUNT_PETALBURG_WOODS',
        location: 'Petalburg Woods',
        class: 'Aqua Grunt M',
        level: 10,
        reward: ['Ability Capsule'],
        isBoss: true,
        bag: [...petalwoodGruntBag()],
        // T-128 — aqua types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        team: getBossPreset('PETALBURG_WOODS_GRUNT').map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_JAMES_1',
        location: 'Petalburg Woods',
        class: 'Bug Catcher',
        reward: ['SPECIES_PATRAT'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_PATRAT'] },
            ...genericTrainerTeamPostWoodsGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_DAREJAN',
        location: 'Petalburg Woods',
        class: 'Fisherman',
        reward: ['SPECIES_CATERPIE'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_CATERPIE'] },
            ...genericTrainerTeamPostWoodsGrunt().slice(1),
        ],
    },
    // Route 104 again
    {
        id: 'TRAINER_HALEY_1',
        location: 'Route 104',
        class: 'Lass',
        reward: [...choice104TMs],
        level: 12,
        bag: [...choice104TMs],
        team: genericTrainerTeamPostWoodsGrunt(),
    },
    {
        id: 'TRAINER_WINSTON_1',
        location: 'Route 104',
        class: 'Rich Boy',
        reward: [...choice104Berry],
        level: 12,
        bag: [...choice104Berry],
        team: genericTrainerTeamPostWoodsGrunt(),
    },
    {
        id: 'TRAINER_IVAN',
        location: 'Route 104',
        class: 'Fisherman',
        reward: [...choice104Gem],
        level: 12,
        bag: [...choice104Gem],
        team: genericTrainerTeamPostWoodsGrunt(),
    },
    {
        id: 'TRAINER_ALIX',
        location: 'Route 115',
        class: 'Battle Girl',
        reward: ['SPECIES_SANDSHREW'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SANDSHREW'] },
            ...genericTrainerTeamPostWoodsGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_TIMOTHY_1',
        location: 'Route 115',
        class: 'Expert M',
        reward: ['SPECIES_DELIBIRD'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DELIBIRD'] },
            ...genericTrainerTeamPostWoodsGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_MARLENE',
        location: 'Route 115',
        class: 'Psychic F',
        reward: ['Nugget'],
        level: 12,
        bag: [...getSampleItemsFromArray(petalwoodGruntBag(), 2)],
        team: genericTrainerTeamPostWoodsGrunt(),
    },
    // Rustboro City
    {
        id: 'TRAINER_ROXANNE_1',
        location: 'Rustboro Gym',
        level: 12,
        class: 'Leader Roxanne',
        reward: ['GYM_REWARD_1', tmItem(1)],
        isBoss: true,
        bag: roxanneBag(),
        // T-128 — type is a trainer restriction (not per-slot); team is the full difficulty-scaled preset
        // pool; the favourite (Nosepass) CLAIMS a pool slot of its tier and is resolved first.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[0]],
        favourite: gymFavourite('SPECIES_NOSEPASS'),
        team: getBossPreset('ROXANNE').map(s => ({ ...s })),
    },
    // Route 116
    {
        id: 'TRAINER_JOSE',
        location: 'Route 116',
        level: 15,
        class: 'Bug Catcher',
        reward: ['SPECIES_DITTO'],
        bag: [...getSampleItemsFromArray(roxanneBag(), 4)],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DITTO'] },
            ...genericTrainerTeamPostRoxanne().slice(1),
        ],
    },
    {
        id: 'TRAINER_JOEY',
        location: 'Route 116',
        class: 'Youngster',
        reward: ['Nugget'],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 4)],
        team: genericTrainerTeamPostRoxanne(),
    },
    {
        id: 'TRAINER_JOHNSON',
        location: 'Route 116',
        class: 'Rich Boy',
        reward: [...route116BallItems],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), sample([...route116BallItems])],
        team: genericTrainerTeamPostRoxanne(),
    },
    {
        id: 'TRAINER_DEVAN',
        location: 'Route 116',
        class: 'Hiker',
        reward: [route116XSpecialItem],
        level: 15,
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), route116XSpecialItem],
        team: genericTrainerTeamPostRoxanne(),
    },
    {
        id: 'TRAINER_CLARK',
        location: 'Route 116',
        class: 'Pokemaniac',
        reward: [...choice116PickTMs],
        bag: [...getSampleItemsFromArray(roxanneBag(), 3), ...choice116PickTMs],
        level: 15,
        team: genericTrainerTeamPostRoxanne(),
    },
    // Rusturf Tunnel
    {
        id: 'TRAINER_GRUNT_RUSTURF_TUNNEL',
        location: 'Rusturf Tunnel',
        level: 15,
        class: 'Magma Grunt F',
        isBoss: true,
        bag: [...rusturfGruntBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('RUSTURF_GRUNT').map(s => ({ ...s })),
    },
    // Route 116 again
    {
        id: 'TRAINER_JANICE',
        location: 'Route 116',
        class: 'Lass',
        reward: ['SPECIES_SENTRET'],
        level: 17,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 4),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SENTRET'] },
            ...genericTrainerTeamPostRusturfGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_JERRY_1',
        location: 'Route 116',
        class: 'School Kid M',
        reward: ['Flame Orb', 'Toxic Orb'],
        level: 17,
        bag: getSampleItemsFromArray(rusturfGruntBag(), 2),
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    {
        id: 'TRAINER_SARAH',
        location: 'Route 116',
        class: 'Lady',
        reward: [...choice116Gem],
        level: 17,
        bag: [...choice116Gem, ...getSampleItemsFromArray(rusturfGruntBag(), 2)],
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    {
        id: 'TRAINER_KAREN_1',
        location: 'Route 116',
        class: 'School Kid F',
        reward: [...choice116Berry],
        level: 17,
        bag: [...choice116Berry, ...getSampleItemsFromArray(rusturfGruntBag(), 2)],
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    // Rustboro Rival
    {
        id: 'TRAINER_MAY_RUSTBORO_TREECKO',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Evolution Stones'],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Evolution Stones'],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        location: 'Rustboro City',
        class: 'May',
        isBoss: true,
        level: 17,
        reward: ['Evolution Stones'],
        bag: [...rivalRustboroBag()],
        team: [...rivalRustboroTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TREECKO',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_TORCHIC',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_RUSTBORO_MUDKIP',
        location: 'Rustboro City',
        copy: 'TRAINER_MAY_RUSTBORO_MUDKIP',
        class: 'Brendan',
    },
    // Route 106
    {
        id: 'TRAINER_KYLA',
        location: 'Route 106',
        class: 'Tuber F',
        reward: ['SPECIES_MACHOP'],
        level: 19,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_MACHOP'] },
            ...genericTrainerTeamPostRusturfGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_ELLIOT_1',
        location: 'Route 106',
        class: 'Fisherman',
        reward: ['SPECIES_CHARMANDER'],
        level: 19,
        bag: getSampleItemsFromArray(rivalRustboroBag(), 4),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_CHARMANDER'] },
            ...genericTrainerTeamPostRusturfGrunt().slice(1),
        ],
    },
    {
        id: 'TRAINER_JOSUE',
        location: 'Route 106',
        class: 'Bird Keeper',
        reward: [...choicesDewfordTMs],
        level: 19,
        bag: [...getSampleItemsFromArray(rivalRustboroBag(), 1), ...choicesDewfordTMs],
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    {
        id: 'TRAINER_NED',
        location: 'Route 106',
        class: 'Fisherman',
        reward: [route106GoodItem],
        level: 19,
        bag: [route106GoodItem, ...getSampleItemsFromArray(rivalRustboroBag(), 3)],
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    {
        id: 'TRAINER_ANDRES_1',
        location: 'Route 106',
        class: 'Ruin Maniac',
        reward: [...route106BallItems],
        level: 19,
        bag: [...route106BallItems, ...getSampleItemsFromArray(rivalRustboroBag(), 2)],
        team: genericTrainerTeamPostRusturfGrunt(),
    },
    // Dewford Gym
    {
        id: 'TRAINER_BRAWLY_1',
        location: 'Dewford Gym',
        class: 'Leader Brawly',
        level: 19,
        reward: ['GYM_REWARD_2', tmItem(61)],
        isBoss: true,
        bag: brawlyBag(),
        bannedItems: ['Flame Orb', 'Toxic Orb'],
        // T-128 — Fighting is a trainer restriction; team is the full preset pool; the favourite
        // (Hariyama) CLAIMS a pool slot of its actual tier, else the standard Fighting-restricted fallback.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[1]],
        favourite: gymFavourite('SPECIES_HARIYAMA'),
        team: getBossPreset('BRAWLY').map(s => ({ ...s })),
    },
    // Granite Cave
    {
        id: 'TRAINER_STEVEN',
        location: 'Granite Cave',
        class: 'Steven',
        level: 22,
        isBoss: true,
        reward: [tmItem(19)],
        bag: stevenBag(),
        // T-106 — Granite Cave Steven ECHOES the Champion's authoritative aces, DEVOLVED to a level-22-legal
        // stage (Champion Metagross → Metang). This REPLACES the old hard tier-cap (megaTier/contextualTier
        // on a fresh pick) with the owner's "remove the max-tier restriction; devolve until legal" rule.
        team: [
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_MEGA',
                breedTier: 'perfect',
                devolveToLevel: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_OU',
                breedTier: 'perfect',
                devolveToLevel: true,
            },
            {
                ...getBossPreset('GRANITE_CAVE_STEVEN')[0],
                type: [championMainType],
            },
            {
                ...getBossPreset('GRANITE_CAVE_STEVEN')[1],
                type: [championMainType],
            },
            {
                oneOf: stevenPokemon,
                tryEvolve: true,
            },
            {
                oneOf: stevenPokemon,
                tryEvolve: true,
            },
        ],
    },
    // Route 109
    {
        id: 'TRAINER_LOLA_1',
        location: 'Route 109',
        class: 'Tuber F',
        reward: ['SPECIES_BULBASAUR'],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_BULBASAUR'] },
            ...genericTrainerTeamPostBrawly().slice(1),
        ],
    },
    {
        id: 'TRAINER_EDMOND',
        location: 'Route 109',
        class: 'Sailor',
        reward: ['Nugget'],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 5),
        team: genericTrainerTeamPostBrawly(),
    },
    {
        id: 'TRAINER_RICKY_1',
        location: 'Route 109',
        class: 'Tuber M',
        reward: [...choiceRickyTMs],
        level: 24,
        bag: [...choiceRickyTMs, ...getSampleItemsFromArray(stevenBag(), 3)],
        team: genericTrainerTeamPostBrawly(),
    },
    {
        id: 'TRAINER_HUEY',
        location: 'Route 109',
        class: 'Pokefan M',
        reward: [...choiceHueyTMs],
        level: 24,
        bag: [...choiceHueyTMs, ...getSampleItemsFromArray(stevenBag(), 3)],
        team: genericTrainerTeamPostBrawly(),
    },
    {
        id: 'TRAINER_HAILEY',
        location: 'Route 109',
        class: 'Tuber F',
        reward: [route109GoodItem],
        level: 24,
        bag: [route109GoodItem, ...getSampleItemsFromArray(stevenBag(), 4)],
        team: genericTrainerTeamPostBrawly(),
    },
    {
        id: 'TRAINER_CHANDLER',
        location: 'Route 109',
        class: 'Youngster',
        reward: ['Heat Rock', 'Damp Rock', 'Smooth Rock', 'Icy Rock', tmItem(73), tmItem(72), tmItem(74), tmItem(75)],
        level: 24,
        bag: getSampleItemsFromArray(stevenBag(), 3),
        team: genericTrainerTeamPostBrawly(),
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_1',
        location: 'Slateport Museum',
        class: 'Aqua Grunt M',
        isBoss: true,
        reward: ['GYM_REWARD_9'],
        level: 24,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        // T-128 — aqua types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        team: getBossPreset('MUSEUM_GRUNT_1').map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_GRUNT_MUSEUM_2',
        location: 'Slateport Museum',
        class: 'Aqua Grunt M',
        isBoss: true,
        reward: ['GYM_REWARD_9'],
        level: 24,
        preventShuffle: true,
        bag: [...slateportGruntsBag()],
        // T-128 — aqua types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        team: getBossPreset('MUSEUM_GRUNT_2').map(s => ({ ...s })),
    },
    // Route 110
    {
        id: 'TRAINER_ISABEL_1',
        location: 'Route 110',
        class: 'Pokefan F',
        reward: [...choice110TMs],
        level: 26,
        bag: [...choice110TMs, ...getSampleItemsFromArray(slateportGruntsBag(), 4)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_KALEB',
        location: 'Route 110',
        class: 'Pokefan M',
        reward: [...route110ExtenderBallItems],
        level: 26,
        bag: [...route110ExtenderBallItems, ...getSampleItemsFromArray(slateportGruntsBag(), 5)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_TIMMY',
        location: 'Route 110',
        class: 'Youngster',
        reward: [route110GoodItem],
        level: 26,
        bag: [route110GoodItem, ...getSampleItemsFromArray(slateportGruntsBag(), 5)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_EDWARD',
        location: 'Route 110',
        class: 'Psychic M',
        reward: ['SPECIES_ELECTRIKE'],
        level: 26,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ELECTRIKE'] },
            ...genericTrainerTeamPostMuseumGrunts().slice(1),
        ],
    },
    {
        id: 'TRAINER_DALE',
        location: 'Route 110',
        class: 'Fisherman',
        reward: ['SPECIES_MANECTRIC'],
        level: 26,
        bag: getSampleItemsFromArray(slateportGruntsBag(), 6),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_MANECTRIC'] },
            ...genericTrainerTeamPostMuseumGrunts().slice(1),
        ],
    },
    // Route 110 Again
    {
        id: 'TRAINER_MAY_ROUTE_110_TREECKO',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        bag: [...rivalRoute110Bag()],
        reward: ['Lum Berry'],
        team: [...rivalRoute110Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        bag: [...rivalRoute110Bag()],
        reward: ['Lum Berry'],
        team: [...rivalRoute110Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        location: 'Route 110',
        class: 'May',
        isBoss: true,
        level: 26,
        bag: [...rivalRoute110Bag()],
        reward: ['Lum Berry'],
        team: [...rivalRoute110Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TREECKO',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_TORCHIC',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_110_MUDKIP',
        location: 'Route 110',
        copy: 'TRAINER_MAY_ROUTE_110_MUDKIP',
        class: 'Brendan',
    },
    // Route 110 after rival
    {
        id: 'TRAINER_EDWIN_1',
        location: 'Route 110',
        class: 'Collector',
        reward: [route110LumGoodItem],
        level: 28,
        bag: [route110LumGoodItem, ...getSampleItemsFromArray(rivalRoute110Bag(), 6)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_JOSEPH',
        location: 'Route 110',
        class: 'Guitarist',
        reward: [...choiceJosephSeeds],
        bag: [...getSampleItemsFromArray(rivalRoute110Bag(), 3)],
        level: 28,
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    // Route 118
    {
        id: 'TRAINER_DALTON_1',
        location: 'Route 118',
        class: 'Guitarist',
        reward: ['SPECIES_CARVANHA'],
        level: 28,
        bag: getSampleItemsFromArray(rivalRoute110Bag(), 7),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_CARVANHA'] },
            ...genericTrainerTeamPostMuseumGrunts().slice(1),
        ],
    },
    {
        id: 'TRAINER_DEANDRE',
        location: 'Route 118',
        class: 'Youngster',
        reward: [...choiceDeandreTMs],
        level: 28,
        bag: [...choiceDeandreTMs, ...getSampleItemsFromArray(rivalRoute110Bag(), 4)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    // Wally
    {
        id: 'TRAINER_WALLY_MAUVILLE',
        location: 'Route 110',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        level: 28,
        bag: [...wallyBag()],
        // T-106 — Mauville now ECHOES Wally's authoritative Victory Road roster, devolved to lvl 28.
        team: [
            { special: TRAINER_REPEAT_ID, id: 'WALLY_1', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_2', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_3', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_4', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_5', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_6', devolveToLevel: true },
        ],
    },
    // Route 117
    {
        id: 'TRAINER_BRANDI',
        location: 'Route 117',
        class: 'Psychic F',
        reward: ['SPECIES_ODDISH'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ODDISH'], tryEvolve: true },
            ...genericTrainerTeamPostMuseumGrunts().slice(1),
        ],
    },
    {
        id: 'TRAINER_ISAAC_1',
        location: 'Route 117',
        class: 'Pokemon Breeder M',
        reward: ['SPECIES_GLOOM'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_GLOOM'], tryEvolve: true },
            ...genericTrainerTeamPostMuseumGrunts().slice(1),
        ],
    },
    {
        id: 'TRAINER_HECTOR',
        location: 'Route 115',
        class: 'Expert M',
        reward: [...choiceHectorTMs, 'Light Clay'],
        level: 29,
        bag: [...getSampleItemsFromArray(wallyBag(), 5)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_MELINA',
        location: 'Route 117',
        class: 'Running Triathlete F',
        reward: [...choiceMelinaBerries],
        level: 29,
        bag: [...choiceMelinaBerries, ...getSampleItemsFromArray(wallyBag(), 6)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_AISHA',
        location: 'Route 117',
        class: 'Battle Girl',
        reward: [...choiceAishaGems],
        level: 29,
        bag: [...choiceAishaGems, ...getSampleItemsFromArray(wallyBag(), 6)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_MARIA_1',
        location: 'Route 117',
        class: 'Expert F',
        reward: [route117GoodItem],
        level: 29,
        bag: [route117GoodItem, ...getSampleItemsFromArray(wallyBag(), 7)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_LYDIA_1',
        location: 'Route 117',
        class: 'Pokemon Breeder F',
        reward: [...route117PlateItems],
        level: 29,
        bag: [...route117PlateItems, ...getSampleItemsFromArray(wallyBag(), 4)],
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    {
        id: 'TRAINER_DEREK',
        location: 'Route 117',
        class: 'Bug Maniac',
        reward: ['Nugget'],
        level: 29,
        bag: getSampleItemsFromArray(wallyBag(), 8),
        team: genericTrainerTeamPostMuseumGrunts(),
    },
    // Mauville Gym
    {
        id: 'TRAINER_WATTSON_1',
        location: 'Mauville Gym',
        class: 'Leader Wattson',
        isBoss: true,
        reward: ['GYM_REWARD_3', tmItem(11)],
        level: 29,
        bag: [...wattsonBag()],
        // T-128 — Electric type is a trainer restriction; team is the full preset pool; the favourite
        // (Mega Manectric) claims the {isMega} slot. The electricTerrain seed adds the terrain if it can.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[2]],
        favourite: gymFavourite('SPECIES_MANECTRIC_MEGA'),
        team: getBossPreset('WATTSON').map(s => ({ ...s })),
    },
    // Route 111
    {
        id: 'TRAINER_HAYDEN',
        location: 'Route 111',
        class: 'Kindler',
        reward: ['SPECIES_DROWZEE'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DROWZEE'], tryEvolve: true },
            ...genericTrainerTeamPostWattson().slice(1),
        ],
    },
    {
        id: 'TRAINER_TYRON',
        location: 'Route 111',
        class: 'Camper',
        reward: ['ITEM_MEGA_01'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 9),
        team: [
            ...genericTrainerTeamPostWattson().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_01' },
        ],
    },
    {
        id: 'TRAINER_IRENE',
        location: 'Route 111',
        class: 'Picnicker',
        reward: [...route111BallAItems],
        level: 32,
        bag: [...route111BallAItems, ...getSampleItemsFromArray(wattsonBag(), 8)],
        team: genericTrainerTeamPostWattson(),
    },
    {
        id: 'TRAINER_TRAVIS',
        location: 'Route 111',
        class: 'Pokemon Breeder M',
        reward: [route111HpUpGoodItem],
        level: 32,
        bag: [route111HpUpGoodItem, ...getSampleItemsFromArray(wattsonBag(), 8)],
        team: genericTrainerTeamPostWattson(),
    },
    // Route 112
    {
        id: 'TRAINER_BRYANT',
        location: 'Route 112',
        class: 'Kindler',
        reward: ['SPECIES_NUMEL'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_NUMEL'], tryEvolve: true },
            ...genericTrainerTeamPostWattson().slice(1),
        ],
    },
    {
        id: 'TRAINER_LARRY',
        location: 'Route 112',
        class: 'Fisherman',
        reward: ['SPECIES_TAILLOW'],
        level: 32,
        bag: getSampleItemsFromArray(wattsonBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_TAILLOW'], tryEvolve: true },
            ...genericTrainerTeamPostWattson().slice(1),
        ],
    },
    {
        id: 'TRAINER_CAROL',
        location: 'Route 112',
        class: 'Cycling Triathlete F',
        reward: [...choiceCarolTMs],
        level: 32,
        bag: [...choiceCarolTMs, ...getSampleItemsFromArray(wattsonBag(), 7)],
        team: genericTrainerTeamPostWattson(),
    },
    {
        id: 'TRAINER_BRICE',
        location: 'Route 112',
        class: 'Hiker',
        reward: [...choiceBriceTMs],
        level: 32,
        bag: [...choiceBriceTMs, ...getSampleItemsFromArray(wattsonBag(), 7)],
        team: genericTrainerTeamPostWattson(),
    },
    {
        id: 'TRAINER_TABITHA_MT_CHIMNEY',
        location: 'Mt. Chimney',
        class: 'Magma Admin',
        isBoss: true,
        level: 32,
        preventShuffle: true,
        bag: [...magmaChimneyBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool (no mega).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('TABITHA_CHIMNEY', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_MAXIE_MT_CHIMNEY',
        location: 'Mt. Chimney',
        class: 'Magma Leader Maxie',
        isBoss: true,
        reward: ['Good Rod'],
        level: 33,
        preventShuffle: true,
        bag: [...magmaChimneyBag()],
        // T-128 — the magma team types are a trainer restriction; team is the full preset pool. Maxie's
        // favourite is Mega Camerupt (claims the ≤OU mega slot, tagged MAXIE_MEGA for cross-appearance
        // continuity), else a themed mega, else the standard magma-typed fallback.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        favourite: villainFavourite('SPECIES_CAMERUPT_MEGA'),
        favouriteId: 'MAXIE_MEGA',
        team: getBossPreset('MAXIE_CHIMNEY', true).map(s => ({ ...s })),
    },
    // Jagged Pass
    {
        id: 'TRAINER_ERIC',
        location: 'Jagged Pass',
        class: 'Hiker',
        reward: ['SPECIES_NOIBAT'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_NOIBAT'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(1),
        ],
    },
    {
        id: 'TRAINER_JULIO',
        location: 'Jagged Pass',
        class: 'Cycling Triathlete M',
        reward: ['SPECIES_NOIVERN', 'SPECIES_WOOBAT'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_NOIVERN'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_WOOBAT'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(2),
        ],
    },
    {
        id: 'TRAINER_AUTUMN',
        location: 'Jagged Pass',
        class: 'Picnicker',
        reward: ['ITEM_MEGA_02'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            ...genericTrainerTeamPostMaxieChimney().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_02' },
        ],
    },
    // Route 113
    {
        id: 'TRAINER_LAWRENCE',
        location: 'Route 113',
        class: 'Camper',
        reward: ['SPECIES_SPINDA'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SPINDA'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(1),
        ],
    },
    {
        id: 'TRAINER_JAYLEN',
        location: 'Route 113',
        class: 'Youngster',
        reward: ['SPECIES_BIDOOF', 'SPECIES_BIBAREL'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 10),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_BIDOOF'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_BIBAREL'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(2),
        ],
    },
    // Route 114
    {
        id: 'TRAINER_STEVE_1',
        location: 'Route 114',
        class: 'Pokemaniac',
        reward: ['SPECIES_SWABLU'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SWABLU'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(1),
        ],
    },
    {
        id: 'TRAINER_CLAUDE',
        location: 'Route 114',
        class: 'Fisherman',
        reward: ['SPECIES_ALTARIA', 'SPECIES_SPOINK'],
        level: 36,
        bag: getSampleItemsFromArray(magmaChimneyBag(), 11),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ALTARIA'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SPOINK'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieChimney().slice(2),
        ],
    },
    {
        id: 'TRAINER_WILTON_1',
        location: 'Route 114',
        class: 'Cooltrainer M',
        reward: [...choiceWiltonTMs],
        level: 36,
        bag: [...choiceWiltonTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    {
        id: 'TRAINER_SHAYLA',
        location: 'Route 114',
        class: 'Aroma Lady',
        reward: ['Nugget'],
        level: 36,
        bag: ['Nugget', ...getSampleItemsFromArray(magmaChimneyBag(), 10)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    {
        id: 'TRAINER_CHARLOTTE',
        location: 'Route 114',
        class: 'Picnicker',
        reward: [...choiceCharlotteTMs],
        level: 36,
        bag: [...choiceCharlotteTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    {
        id: 'TRAINER_NOLAN',
        location: 'Route 114',
        class: 'Youngster',
        reward: [...choiceNolanTMs],
        level: 36,
        bag: [...choiceNolanTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    {
        id: 'TRAINER_ANGELINA',
        location: 'Route 114',
        class: 'Battle Girl',
        reward: [...choiceAngelinaTMs],
        level: 36,
        bag: [...choiceAngelinaTMs, ...getSampleItemsFromArray(magmaChimneyBag(), 9)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    {
        id: 'TRAINER_WYATT',
        location: 'Route 113',
        class: 'Pokemaniac',
        reward: [route114WyattGoodItem],
        level: 36,
        bag: [route114WyattGoodItem, ...getSampleItemsFromArray(magmaChimneyBag(), 10)],
        team: genericTrainerTeamPostMaxieChimney(),
    },
    // Flannery Gym
    {
        id: 'TRAINER_FLANNERY_1',
        location: 'Lavaridge Gym',
        class: 'Leader Flannery',
        level: 36,
        reward: ['GYM_REWARD_4', 'Access to Desert Ruins', tmItem(78)],
        isBoss: true,
        bag: flanneryBag(),
        // T-128 — Fire type is a trainer restriction; team is the full preset pool; the favourite (Torkoal)
        // claims a pool slot of its tier. The weather (sun) seed sets Drought/Heat Rock if it can.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[3]],
        favourite: gymFavourite('SPECIES_TORKOAL'),
        team: getBossPreset('FLANNERY', true).map(s => ({ ...s })),
    },
    // Route 111
    {
        id: 'TRAINER_CELIA',
        location: 'Route 111',
        class: 'Lass',
        reward: ['SPECIES_TRAPINCH'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_TRAPINCH'], tryEvolve: true },
            ...genericTrainerTeamPostFlannery().slice(1),
        ],
    },
    {
        id: 'TRAINER_BRANDEN',
        location: 'Route 111',
        class: 'Expert M',
        reward: ['Strong Pokemon'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_CELINA',
        location: 'Route 111',
        class: 'Aroma Lady',
        reward: ['ITEM_MEGA_03'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 12),
        team: [
            ...genericTrainerTeamPostFlannery().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_03' },
        ],
    },
    {
        id: 'TRAINER_BEAU',
        location: 'Route 111',
        class: 'Camper',
        reward: ['Master Ball'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 13),
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_DREW',
        location: 'Route 111',
        class: 'Guitarist',
        reward: [...route111BerryItems],
        level: 39,
        bag: [...route111BerryItems, ...getSampleItemsFromArray(flanneryBag(), 12)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_DUSTY_1',
        location: 'Route 111',
        class: 'Ruin Maniac',
        reward: [...route111BallCItems],
        level: 39,
        bag: [...route111BallCItems, ...getSampleItemsFromArray(flanneryBag(), 13)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_NOB_1',
        location: 'Route 111',
        class: 'Black Belt',
        reward: [...choiceNobTMs],
        level: 39,
        bag: [...choiceNobTMs, ...getSampleItemsFromArray(flanneryBag(), 11)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_BECKY',
        location: 'Route 111',
        class: 'Picnicker',
        reward: ['Nugget'],
        level: 39,
        bag: getSampleItemsFromArray(flanneryBag(), 12),
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_BRYAN',
        location: 'Route 111',
        class: 'Youngster',
        reward: [...choiceBryanTMs],
        level: 39,
        bag: [...choiceBryanTMs, ...getSampleItemsFromArray(flanneryBag(), 11)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_HEIDI',
        location: 'Route 111',
        class: 'Battle Girl',
        reward: [...choiceHeidiItems],
        level: 39,
        bag: [...choiceHeidiItems, ...getSampleItemsFromArray(flanneryBag(), 13)],
        team: genericTrainerTeamPostFlannery(),
    },
    {
        id: 'TRAINER_NORMAN_1',
        location: 'Petalburg Gym',
        class: 'Leader Norman',
        level: 39,
        isBoss: true,
        reward: ['GYM_REWARD_5', 'Access to Island Cave', 'Access to New Mauville', tmItem(31)],
        bag: normanBag(),
        // T-128 — Normal type is a trainer restriction; team is the full preset pool; the favourite
        // (Slaking) claims a pool slot of its tier. Norman picks his own items/abilities.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[4]],
        favourite: gymFavourite('SPECIES_SLAKING'),
        team: getBossPreset('NORMAN', true).map(s => ({ ...s })),
    },
    // Route 105 (Island Cave)
    {
        id: 'TRAINER_FOSTER',
        location: 'Route 105',
        class: 'Ruin Maniac',
        reward: ['Strong Pokemon'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_IMANI',
        location: 'Route 105',
        class: 'Tuber F',
        reward: ['Master Ball'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    // Route 110 (New Mauville)
    {
        id: 'TRAINER_ABIGAIL_1',
        location: 'Route 110',
        class: 'Cycling Triathlete F',
        reward: ['Strong Pokemon'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_JACLYN',
        location: 'Route 110',
        class: 'Psychic F',
        reward: ['Master Ball'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: genericTrainerTeamPostNorman(),
    },
    // Route 118
    {
        id: 'TRAINER_PERRY',
        location: 'Route 118',
        class: 'Bird Keeper',
        reward: ['SPECIES_DEDENNE'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DEDENNE'], tryEvolve: true },
            ...genericTrainerTeamPostNorman().slice(1),
        ],
    },
    {
        id: 'TRAINER_CHRIS',
        location: 'Route 118',
        class: 'Fisherman',
        reward: ['ITEM_MEGA_04'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 14),
        team: [
            ...genericTrainerTeamPostNorman().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_04' },
        ],
    },
    {
        id: 'TRAINER_WADE',
        location: 'Route 118',
        class: 'Camper',
        reward: [...choiceWadeBerries],
        level: 42,
        bag: [...choiceWadeBerries, ...getSampleItemsFromArray(normanBag(), 14)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_BARNY',
        location: 'Route 118',
        class: 'Pokemon Breeder M',
        reward: [route118BarnyGoodItem],
        level: 42,
        bag: [route118BarnyGoodItem, ...getSampleItemsFromArray(normanBag(), 14)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_ROSE_1',
        location: 'Route 118',
        class: 'Aroma Lady',
        reward: [...choiceRoseTMs],
        level: 42,
        bag: [...choiceRoseTMs, ...getSampleItemsFromArray(normanBag(), 13)],
        team: genericTrainerTeamPostNorman(),
    },
    {
        id: 'TRAINER_CHESTER',
        location: 'Route 118',
        class: 'Black Belt',
        reward: [...choiceChesterTMs],
        level: 42,
        bag: [...choiceChesterTMs, ...getSampleItemsFromArray(normanBag(), 13)],
        team: genericTrainerTeamPostNorman(),
    },
    // Route 119
    {
        id: 'TRAINER_KENT',
        location: 'Route 119',
        class: 'Bug Catcher',
        reward: ['SPECIES_LINOONE'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_LINOONE'], tryEvolve: true },
            ...genericTrainerTeamPostNorman().slice(1),
        ],
    },
    {
        id: 'TRAINER_BRENT',
        location: 'Route 119',
        class: 'Bug Maniac',
        reward: ['SPECIES_SERVINE', 'SPECIES_SNIVY'],
        level: 42,
        bag: getSampleItemsFromArray(normanBag(), 15),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SERVINE'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SNIVY'], tryEvolve: true },
            ...genericTrainerTeamPostNorman().slice(2),
        ],
    },
    // Weather Institute
    {
        id: 'TRAINER_SHELLY_WEATHER_INSTITUTE',
        location: 'Weather Institute',
        class: 'Aqua Admin F',
        level: 42,
        reward: ['GYM_REWARD_10'],
        isBoss: true,
        bag: [...shellyBag()],
        // T-128 — aqua types are a trainer restriction; team is the full preset pool (incl. its ≤OU mega
        // slot). No signature ace.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        team: getBossPreset('SHELLY_WEATHER', true).map(s => ({ ...s })),
    },
    // Route 119 Rival Battles
    {
        id: 'TRAINER_MAY_ROUTE_119_TREECKO',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        location: 'Route 119',
        class: 'May',
        isBoss: true,
        level: 44,
        reward: ['Leftovers'],
        bag: [...rival119Bag()],
        team: [...rivalRoute119Template('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TREECKO',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_TREECKO',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_TORCHIC',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_TORCHIC',
        class: 'May',
    },
    {
        id: 'TRAINER_BRENDAN_ROUTE_119_MUDKIP',
        location: 'Route 119',
        copy: 'TRAINER_MAY_ROUTE_119_MUDKIP',
        class: 'May',
    },
    // Route 119 continued
    {
        id: 'TRAINER_LEONEL',
        location: 'Route 120',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SANDILE'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SANDILE'], tryEvolve: true },
            ...genericTrainerTeamPostShelly().slice(1),
        ],
    },
    {
        id: 'TRAINER_COLIN',
        location: 'Route 120',
        class: 'Expert M',
        reward: ['SPECIES_KROKOROK', 'SPECIES_KROOKODILE', 'SPECIES_STUNFISK', 'SPECIES_RIBOMBEE', 'SPECIES_DUSKULL', 'SPECIES_DUSCLOPS', 'SPECIES_DUSKNOIR'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 17),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_RIBOMBEE'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DUSKULL'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DUSCLOPS'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DUSKNOIR'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_KROKOROK', 'SPECIES_KROOKODILE', 'SPECIES_STUNFISK'], pickBest: true, tryEvolve: true },
            ...genericTrainerTeamPostShelly().slice(5),
        ],
    },
    {
        id: 'TRAINER_ROBERT_1',
        location: 'Route 120',
        class: 'Bird Keeper',
        reward: ['ITEM_MEGA_05'],
        level: 46,
        bag: getSampleItemsFromArray(rival119Bag(), 16),
        team: [
            ...genericTrainerTeamPostShelly().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_05' },
        ],
    },
    {
        id: 'TRAINER_CLARISSA',
        location: 'Route 120',
        class: 'Aroma Lady',
        reward: [...choiceClarissaTMs],
        level: 46,
        bag: [...choiceClarissaTMs, ...getSampleItemsFromArray(rival119Bag(), 15)],
        team: genericTrainerTeamPostShelly(),
    },
    {
        id: 'TRAINER_ANGELICA',
        location: 'Route 120',
        class: 'Parasol Lady',
        reward: [route120AngelicaGoodItem],
        level: 46,
        bag: [route120AngelicaGoodItem, ...getSampleItemsFromArray(rival119Bag(), 16)],
        team: genericTrainerTeamPostShelly(),
    },
    {
        id: 'TRAINER_JACKSON_1',
        location: 'Route 120',
        class: 'Pokemon Ranger M',
        reward: ['Nugget'],
        level: 46,
        bag: ['Nugget', ...getSampleItemsFromArray(rival119Bag(), 16)],
        team: genericTrainerTeamPostShelly(),
    },
    // Fortree City Gym
    {
        id: 'TRAINER_WINONA_1',
        location: 'Fortree Gym',
        class: 'Leader Winona',
        level: 46,
        isBoss: true,
        reward: ['GYM_REWARD_6', 'Access to Ancient Tomb', tmItem(32)],
        bag: [...winonaBag(), 'Flying Gem'],
        // T-128 — Flying is a trainer restriction; team is the full preset pool (incl. its ≤OU mega slot).
        // Favourite chain: Mega Altaria ≫ Altaria ≫ a mega of the (rolled) type; then the standard typed
        // fallback. Mega Altaria (Dragon/Fairy) has no Flying, so while Winona keeps Flying it drops to
        // BASE Altaria (Dragon/Flying); if she rolls Dragon/Fairy, Mega Altaria claims the mega slot.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[5]],
        favourite: ['SPECIES_ALTARIA_MEGA', 'SPECIES_ALTARIA', { mega: true }],
        team: getBossPreset('WINONA', true).map(s => ({ ...s })),
    },
    // Route 120 After Gym
    {
        id: 'TRAINER_JEFFREY_1',
        location: 'Route 120',
        class: 'Bug Maniac',
        reward: ['Master Ball'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_CHIP',
        location: 'Route 120',
        class: 'Ruin Maniac',
        reward: ['Access to Premium Pokemon'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: genericTrainerTeamPostWinona(),
    },
    // Route 121
    {
        id: 'TRAINER_MARCEL',
        location: 'Route 121',
        class: 'Cooltrainer M',
        reward: ['SPECIES_SHUPPET'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SHUPPET'], tryEvolve: true },
            ...genericTrainerTeamPostWinona().slice(1),
        ],
    },
    {
        id: 'TRAINER_MYLES',
        location: 'Route 121',
        class: 'Fisherman',
        reward: ['SPECIES_METAPOD', 'SPECIES_HONEDGE', 'SPECIES_BANETTE'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 18),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_METAPOD'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_HONEDGE'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_BANETTE'], tryEvolve: true },
            ...genericTrainerTeamPostWinona().slice(3),
        ],
    },
    {
        id: 'TRAINER_BIANCA',
        location: 'Route 121',
        class: 'Camper',
        reward: ['ITEM_MEGA_06'],
        level: 49,
        bag: getSampleItemsFromArray(winonaBag(), 17),
        team: [
            ...genericTrainerTeamPostWinona().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_06' },
        ],
    },
    {
        id: 'TRAINER_CALE',
        location: 'Route 121',
        class: 'Bug Maniac',
        reward: ['Focus Sash'],
        level: 49,
        bag: ['Focus Sash', ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_TAMMY',
        location: 'Route 121',
        class: 'Hex Maniac',
        reward: [...choiceTammyTMs],
        level: 49,
        bag: [...choiceTammyTMs, ...getSampleItemsFromArray(winonaBag(), 16)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_WALTER_1',
        location: 'Route 121',
        class: 'Gentleman',
        reward: [...choiceWalterTMs],
        level: 49,
        bag: [...choiceWalterTMs, ...getSampleItemsFromArray(winonaBag(), 16)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_JESSICA_1',
        location: 'Route 121',
        class: 'Beauty',
        reward: [jessicaTM],
        level: 49,
        bag: [jessicaTM, ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    {
        id: 'TRAINER_CRISTIN_1',
        location: 'Route 121',
        class: 'Cooltrainer F',
        reward: [...choiceCristinBerries],
        level: 49,
        bag: [...choiceCristinBerries, ...getSampleItemsFromArray(winonaBag(), 17)],
        team: genericTrainerTeamPostWinona(),
    },
    // Lillycove Wally Rival
    {
        id: 'TRAINER_WALLY_LILYCOVE',
        location: 'Route 121',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        reward: ['GYM_REWARD_11'],
        level: 49,
        bag: [...wallyBag2()],
        // T-106 — Lilycove now ECHOES Wally's authoritative Victory Road roster, devolved to lvl 49.
        team: [
            { special: TRAINER_REPEAT_ID, id: 'WALLY_1', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_2', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_3', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_4', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_5', devolveToLevel: true },
            { special: TRAINER_REPEAT_ID, id: 'WALLY_6', devolveToLevel: true },
        ],
    },
    // Magma Hideout
    {
        id: 'TRAINER_MAXIE_MAGMA_HIDEOUT',
        location: 'Magma Hideout',
        class: 'Magma Leader Maxie',
        isBoss: true,
        level: 51,
        preventShuffle: true,
        bag: [...wallyBag2()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool. Maxie's favourite
        // Mega Camerupt (tagged MAXIE_MEGA) claims the ≤OU mega slot — the same signature as his other
        // appearances, so the continuity holds without an explicit REPEAT_ID.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        favourite: villainFavourite('SPECIES_CAMERUPT_MEGA'),
        favouriteId: 'MAXIE_MEGA',
        team: getBossPreset('MAXIE_MAGMA', true).map(s => ({ ...s })),
    },
    // Mt. Pyre
    {
        id: 'TRAINER_TAYLOR',
        location: 'Route 119',
        class: 'Collector',
        reward: ['SPECIES_PORYGON'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_PORYGON'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieMagma().slice(1),
        ],
    },
    {
        id: 'TRAINER_MARK',
        location: 'Mt. Pyre',
        class: 'Pokemaniac',
        reward: ['SPECIES_SPINARAK', 'SPECIES_ARIADOS', 'SPECIES_SPIDOPS', 'SPECIES_SPIRITOMB'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SPINARAK'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ARIADOS'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SPIDOPS'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SPIRITOMB'], tryEvolve: true },
            ...genericTrainerTeamPostMaxieMagma().slice(4),
        ],
    },
    {
        id: 'TRAINER_LEAH',
        location: 'Mt. Pyre',
        class: 'Hex Maniac',
        reward: ['ITEM_MEGA_07'],
        level: 54,
        bag: getSampleItemsFromArray(wallyBag2(), 19),
        team: [
            ...genericTrainerTeamPostMaxieMagma().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_07' },
        ],
    },
    // Aqua Hideout
    {
        id: 'TRAINER_MATT',
        location: 'Aqua Hideout',
        class: 'Aqua Admin M',
        isBoss: true,
        level: 54,
        preventShuffle: true,
        bag: [...wallyBag2()],
        // T-128 — aqua types are a trainer restriction; team is the full preset pool (incl. its ≤OU mega
        // slot). No signature ace; the old forced Snow Warning weather-mega is dropped (weather comes from
        // the seed now, not a hardcoded ability slot).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        team: getBossPreset('MATT_AQUA', true).map(s => ({ ...s })),
    },
    // Route 124
    {
        id: 'TRAINER_CHAD',
        location: 'Route 124',
        class: 'Sailor',
        reward: ['SPECIES_WO_CHIEN'],
        level: 56,
        bag: getSampleItemsFromArray(wallyBag2(), 20),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_WO_CHIEN'] },
            ...genericTrainerTeamPostMatt().slice(1),
        ],
    },
    {
        id: 'TRAINER_LILA_AND_ROY_1',
        location: 'Route 124',
        label: 'Lila',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_08'],
        level: 56,
        bag: getSampleItemsFromArray(wallyBag2(), 19),
        team: [
            ...genericTrainerTeamPostMatt().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_08' },
        ],
    },
    {
        id: 'TRAINER_ISABELLA',
        location: 'Route 124',
        class: 'Parasol Lady',
        reward: [...choiceIsabellaItem],
        level: 56,
        bag: [...choiceIsabellaItem, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_GRACE',
        location: 'Route 124',
        class: 'Expert F',
        reward: [...choiceGraceTMs],
        level: 56,
        bag: [...choiceGraceTMs, ...getSampleItemsFromArray(wallyBag2(), 17)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_SPENCER',
        location: 'Route 124',
        class: 'Fisherman',
        reward: [spencerTM],
        level: 56,
        bag: [spencerTM, ...getSampleItemsFromArray(wallyBag2(), 19)],
        team: genericTrainerTeamPostMatt(),
    },
    {
        id: 'TRAINER_ROLAND',
        location: 'Route 124',
        class: 'Expert M',
        reward: [rolandTM],
        level: 56,
        bag: [rolandTM, ...getSampleItemsFromArray(wallyBag2(), 19)],
        team: genericTrainerTeamPostMatt(),
    },
    // Gym Leader - Tate & Liza
    {
        id: 'TRAINER_TATE_AND_LIZA_1',
        location: 'Mossdeep Gym',
        class: 'Leader Tate And Liza',
        level: 56,
        isBoss: true,
        reward: ['GYM_REWARD_7', 'Access to Shoal Cave', tmItem(91)],
        preventShuffle: true,
        bag: [...tateAndLizaBag()],
        // T-128 — Psychic is a trainer restriction; team is the full preset pool (UBERS/UBERS/OU/UU/RU +
        // ≤UBERS mega). Two favourites (Solgaleo≫Solrock, Lunala≫Lunatone) claim slots first; being
        // legendary they normally exceed the UBERS budget and drop to Solrock/Lunatone (their actual
        // tiers). The old Trick Room / Focus Sash / screens gimmick is removed (owner-validated).
        bannedItems: ['Focus Sash', 'Room Service', 'Light Clay'],
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[6]],
        favourites: [
            ['SPECIES_SOLGALEO', 'SPECIES_SOLROCK'],
            ['SPECIES_LUNALA', 'SPECIES_LUNATONE'],
        ],
        team: getBossPreset('TATE_AND_LIZA', true).map(s => ({ ...s })),
    },
    // Route 125
    {
        id: 'TRAINER_ERNEST_1',
        location: 'Route 125',
        class: 'Sailor',
        reward: ['SPECIES_FROAKIE', 'SPECIES_FROGADIER'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_FROAKIE'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_FROGADIER'], tryEvolve: true },
            ...genericTrainerTeamPostTateAndLiza().slice(2),
        ],
    },
    {
        id: 'TRAINER_STAN',
        location: 'Route 125',
        class: 'Rich Boy',
        reward: ['SPECIES_CINDERACE'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_CINDERACE'], tryEvolve: true },
            ...genericTrainerTeamPostTateAndLiza().slice(1),
        ],
    },
    {
        id: 'TRAINER_TANYA',
        location: 'Route 125',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_09'],
        level: 59,
        bag: getSampleItemsFromArray(tateAndLizaBag(), 25),
        team: [
            ...genericTrainerTeamPostTateAndLiza().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_09' },
        ],
    },
    {
        id: 'TRAINER_PRESLEY',
        location: 'Route 125',
        class: 'Bird Keeper',
        reward: [...choicePresleyTMs],
        level: 59,
        bag: [...choicePresleyTMs, ...getSampleItemsFromArray(tateAndLizaBag(), 22)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_AURON',
        location: 'Route 125',
        class: 'Expert M',
        reward: [auronTM],
        level: 59,
        bag: [auronTM, ...getSampleItemsFromArray(tateAndLizaBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    // Mossdeep Space Center
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_5',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('SPACE_CENTER_GRUNT_5', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_6',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('SPACE_CENTER_GRUNT_6', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_GRUNT_SPACE_CENTER_7',
        location: 'Mossdeep Space Center',
        class: 'Magma Grunt M',
        isBoss: true,
        level: 59,
        bag: [...spaceCenterBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool (incl. its ≤OU mega).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('SPACE_CENTER_GRUNT_7', true).map(s => ({ ...s })),
    },
    {
        id: 'PARTNER_STEVEN',
        class: 'Steven',
        isPartner: true,
        breedTier: 'perfect',
        preventShuffle: true,
        level: 59,
        bag: [...spaceCenterBag()],
        // T-106 — the Mossdeep partner now ECHOES the Champion's authoritative roster, devolved to lvl 59.
        team: [
            {
                // echoes the Champion's legend (no devolve — legends are solo-evo)
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_LEGEND',
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_OU',
                devolveToLevel: true,
            },
            {
                special: TRAINER_REPEAT_ID,
                id: 'STEVEN_MEGA',
                devolveToLevel: true,
            },
        ],
    },
    {
        id: 'TRAINER_TABITHA_MOSSDEEP',
        location: 'Mossdeep Space Center',
        class: 'Magma Admin',
        isBoss: true,
        level: 59,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool (OU/UU + ≤OU mega).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        team: getBossPreset('TABITHA_MOSSDEEP', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_MAXIE_MOSSDEEP',
        location: 'Mossdeep Space Center',
        class: 'Magma Leader Maxie',
        isBoss: true,
        breedTier: 'perfect',
        level: 59,
        preventShuffle: true,
        bag: [...spaceCenterBag()],
        // T-128 — magma types are a trainer restriction; team is the full preset pool (LEGEND/OU/UBERS-
        // mega). Two favourites: Groudon (claims the LEGEND slot — weather now comes from the seed, not a
        // hardcoded Heat Rock) and Mega Camerupt (claims the mega slot, tagged MAXIE_MEGA for continuity).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...magmaTeamTypes],
        favourites: [
            ['SPECIES_GROUDON'],
            villainFavourite('SPECIES_CAMERUPT_MEGA'),
        ],
        favouriteIds: ['MAXIE_GROUDON', 'MAXIE_MEGA'],
        team: getBossPreset('MAXIE_MOSSDEEP', true).map(s => ({ ...s })),
    },
    // Route 127
    {
        id: 'TRAINER_DONNY',
        location: 'Route 127',
        class: 'Swimming Triathlete F',
        reward: ['SPECIES_SCREAM_TAIL'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SCREAM_TAIL'] },
            ...genericTrainerTeamPostTateAndLiza().slice(1),
        ],
    },
    {
        id: 'TRAINER_CAMDEN',
        location: 'Route 127',
        class: 'Swimming Triathlete M',
        reward: ['SPECIES_RELICANTH'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_RELICANTH'], tryEvolve: true },
            ...genericTrainerTeamPostTateAndLiza().slice(1),
        ],
    },
    {
        id: 'TRAINER_KOJI_1',
        location: 'Route 127',
        class: 'Black Belt',
        reward: ['ITEM_MEGA_10'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 24),
        team: [
            ...genericTrainerTeamPostTateAndLiza().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_10' },
        ],
    },
    {
        id: 'TRAINER_AIDAN',
        location: 'Route 127',
        class: 'Bird Keeper',
        reward: [aidanTM],
        level: 61,
        bag: [aidanTM, ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_ATHENA',
        location: 'Route 127',
        class: 'Cooltrainer F',
        reward: [athenaTM],
        level: 61,
        bag: [athenaTM, ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    {
        id: 'TRAINER_HENRY',
        location: 'Route 127',
        class: 'Fisherman',
        reward: ['Eject Button'],
        level: 61,
        bag: ['Eject Button', ...getSampleItemsFromArray(spaceCenterBag(), 24)],
        team: genericTrainerTeamPostTateAndLiza(),
    },
    // Route 126
    {
        id: 'TRAINER_BRENDA',
        location: 'Route 126',
        class: 'Swimmer F',
        reward: ['Random Defensive Mint', 'SPECIES_FLUTTER_MANE'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_FLUTTER_MANE'] },
            ...genericTrainerTeamPostTateAndLiza().slice(1),
        ],
    },
    {
        id: 'TRAINER_LEONARDO',
        location: 'Route 126',
        class: 'Swimmer M',
        reward: ['SPECIES_HUNTAIL'],
        level: 61,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_HUNTAIL'], tryEvolve: true },
            ...genericTrainerTeamPostTateAndLiza().slice(1),
        ],
    },
    // Seafloor Cavern
    {
        id: 'TRAINER_ARCHIE',
        location: 'Seafloor Cavern',
        class: 'Aqua Leader Archie',
        reward: ['Access to Sky Pillar'],
        isBoss: true,
        level: 61,
        bag: [...archieBag()],
        preventShuffle: true,
        // T-128 — aqua types are a trainer restriction; team is the full preset pool (LEGEND/OU/OU/UU/UU +
        // ≤OU mega). Two favourites: Kyogre (claims the LEGEND slot — weather now comes from the seed, not
        // a hardcoded Damp Rock) and Mega Sharpedo (claims the mega slot), else a themed mega, else the
        // standard aqua-typed fallback.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [...aquaTeamTypes],
        favourites: [
            ['SPECIES_KYOGRE'],
            villainFavourite('SPECIES_SHARPEDO_MEGA'),
        ],
        favouriteIds: ['ARCHIE_KYOGRE', 'ARCHIE_MEGA'],
        team: getBossPreset('ARCHIE', true).map(s => ({ ...s })),
    },
    // Route 129
    {
        id: 'TRAINER_CLARENCE',
        location: 'Route 129',
        class: 'Sailor',
        reward: ['SPECIES_DARKRAI'],
        level: 64,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_DARKRAI'] },
            ...genericTrainerTeamPostArchie().slice(1),
        ],
    },
    {
        id: 'TRAINER_ALLISON',
        location: 'Route 129',
        class: 'Tuber F',
        reward: ['ITEM_MEGA_11'],
        level: 64,
        bag: getSampleItemsFromArray(spaceCenterBag(), 25),
        team: [
            ...genericTrainerTeamPostArchie().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_11' },
        ],
    },
    // Sootopolis Gym
    {
        id: 'TRAINER_JUAN_1',
        location: 'Sootopolis Gym',
        class: 'Leader Juan',
        level: 64,
        isBoss: true,
        reward: ['GYM_REWARD_8', tmItem(51)],
        bag: [...juanBag()],
        // T-128 — Water type is a trainer restriction; team is the full preset pool; the favourite
        // (Kingdra) claims a pool slot of its tier.
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [gymMainTypes[7]],
        favourite: gymFavourite('SPECIES_KINGDRA'),
        team: getBossPreset('JUAN', true).map(s => ({ ...s })),
    },
    // Route 123
    {
        id: 'TRAINER_ED',
        location: 'Route 123',
        class: 'Collector',
        reward: ['SPECIES_AERODACTYL'],
        level: 67,
        bag: [...juanBag()],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_AERODACTYL'], tryEvolve: true },
            ...genericTrainerTeamPostJuan().slice(1),
        ],
    },
    {
        id: 'TRAINER_KINDRA',
        location: 'Route 123',
        class: 'Hex Maniac',
        reward: ['SPECIES_KABUTOPS', 'SPECIES_KADABRA', 'SPECIES_ALAKAZAM'],
        level: 67,
        bag: [...juanBag()],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_KABUTOPS'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_KADABRA'], tryEvolve: true },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ALAKAZAM'], tryEvolve: true },
            ...genericTrainerTeamPostJuan().slice(3),
        ],
    },
    {
        id: 'TRAINER_WENDY',
        location: 'Route 123',
        class: 'Cooltrainer F',
        reward: ['ITEM_MEGA_12'],
        level: 67,
        bag: [...juanBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_12' },
        ],
    },
    {
        id: 'TRAINER_ALBERTO',
        location: 'Route 123',
        class: 'Bird Keeper',
        reward: ['ITEM_MEGA_13'],
        level: 67,
        bag: [...juanBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_13' },
        ],
    },
    {
        id: 'TRAINER_CAMERON_1',
        location: 'Route 123',
        class: 'Psychic M',
        reward: ['ITEM_MEGA_14'],
        level: 67,
        bag: [...juanBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_14' },
        ],
    },
    {
        id: 'TRAINER_KAYLEY',
        location: 'Route 123',
        class: 'Parasol Lady',
        reward: ['ITEM_MEGA_15'],
        level: 67,
        bag: [...juanBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_15' },
        ],
    },
    {
        id: 'TRAINER_BRAXTON',
        location: 'Route 123',
        class: 'Cooltrainer M',
        reward: ['ITEM_MEGA_16'],
        level: 67,
        bag: [...juanBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_16' },
        ],
    },
    // Victory Road
    {
        id: 'TRAINER_WALLY_VR_1',
        location: 'Victory Road',
        class: 'Wally',
        isBoss: true,
        breedTier: 'good',
        level: 67,
        restrictions: [TRAINER_RESTRICTION_NO_REPEATED_TYPE],
        bag: [...juanBag()],
        // T-106/T-128 — Victory Road is Wally's AUTHORITATIVE endgame team: his favourite Mega Gardevoir
        // (≫ Mega Gallade ≫ any mega) CLAIMS the stage-3 mega slot (tagged WALLY_1, the continuity anchor)
        // + five OU/UU aces, all no-repeated-types (Wally-exclusive). Mauville/Lilycove echo it devolved.
        favourite: ['SPECIES_GARDEVOIR_MEGA', 'SPECIES_GALLADE_MEGA', { mega: true }],
        favouriteId: 'WALLY_1',
        team: [
            { id: 'WALLY_2', evolutionTier: [TIER_OU], evoType: [EVO_TYPE_LC], tryEvolve: true, checkValidEvo: true },
            { id: 'WALLY_3', evolutionTier: [TIER_OU], evoType: [EVO_TYPE_LC], tryEvolve: true, checkValidEvo: true },
            { id: 'WALLY_4', evolutionTier: [TIER_OU], evoType: [EVO_TYPE_LC], tryEvolve: true, checkValidEvo: true },
            { id: 'WALLY_5', evolutionTier: [TIER_UU], evoType: [EVO_TYPE_LC], tryEvolve: true, checkValidEvo: true },
            { id: 'WALLY_6', evolutionTier: [TIER_UU], evoType: [EVO_TYPE_LC], tryEvolve: true, checkValidEvo: true },
            bossMega(TIER_UBERS),
        ],
    },
    {
        id: 'TRAINER_HOPE',
        location: 'Victory Road',
        class: 'Expert F',
        breedTier: 'good',
        reward: ['SPECIES_SHEDINJA', 'SPECIES_MOLTRES', 'SPECIES_ARTICUNO', 'SPECIES_ZAPDOS', 'SPECIES_LUGIA'],
        level: 70,
        bag: [...juanBag()],
        team: [
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_SHEDINJA'] },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_MOLTRES'] },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ARTICUNO'] },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_ZAPDOS'] },
            { special: TRAINER_POKE_ENCOUNTER, encounterIds: ['SPECIES_LUGIA'] },
            ...genericTrainerTeamPostJuan().slice(5),
        ],
    },
    {
        id: 'TRAINER_QUINCY',
        location: 'Victory Road',
        class: 'Black Belt',
        breedTier: 'good',
        reward: [quincyTM],
        level: 70,
        bag: [quincyTM, ...getSampleItemsFromArray(juanBag(), 24)],
        team: genericTrainerTeamPostJuan(),
    },
    {
        id: 'TRAINER_KATELYNN',
        location: 'Victory Road',
        class: 'Cooltrainer F',
        breedTier: 'good',
        reward: [katelynTM],
        level: 70,
        bag: [katelynTM, ...getSampleItemsFromArray(juanBag(), 24)],
        team: genericTrainerTeamPostJuan(),
    },
    // Ever Grande Rival
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('TREECKO')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('TORCHIC')],
    },
    {
        id: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        location: 'Ever Grande City',
        class: 'May',
        isBoss: true,
        level: 70,
        reward: [tmItem(95)],
        bag: [...endgameBag()],
        team: [...rivalEvergrandeCityTemplate('MUDKIP')],
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TREECKO',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TREECKO',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_TORCHIC',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_TORCHIC',
        class: 'Brendan',
    },
    {
        id: 'TRAINER_BRENDAN_EVERGRANDE_MUDKIP',
        location: 'Ever Grande City',
        copy: 'TRAINER_MAY_EVERGRANDE_CITY_MUDKIP',
        class: 'Brendan',
    },
    // Last 123 mega trainers
    {
        id: 'TRAINER_VIOLET',
        location: 'Route 123',
        class: 'Aroma Lady',
        reward: ['ITEM_MEGA_17'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_17' },
        ],
    },
    {
        id: 'TRAINER_JACKI_1',
        location: 'Route 123',
        class: 'Psychic F',
        reward: ['ITEM_MEGA_18'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_18' },
        ],
    },
    {
        id: 'TRAINER_FREDRICK',
        location: 'Route 123',
        class: 'Expert M',
        reward: ['ITEM_MEGA_19'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_19' },
        ],
    },
    {
        id: 'TRAINER_DAVIS',
        location: 'Route 123',
        class: 'Youngster',
        reward: ['ITEM_MEGA_20'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_20' },
        ],
    },
    {
        id: 'TRAINER_JONAS',
        location: 'Route 123',
        class: 'Ninja Boy',
        reward: ['ITEM_MEGA_21'],
        level: 73,
        bag: [...endgameBag()],
        team: [
            ...genericTrainerTeamPostJuan().slice(0, 5),
            { special: TRAINER_POKE_MEGA_FROM_STONE, megaStone: 'ITEM_MEGA_21' },
        ],
    },
    // E4 & Champion
    {
        id: 'TRAINER_SIDNEY',
        location: 'Elite Four',
        class: 'Elite Four Sidney',
        isBoss: true,
        breedTier: 'good',
        level: 73,
        bag: [...leagueBag()],
        // T-128 — E4 type is a trainer restriction; the team is the full difficulty-scaled preset pool
        // (incl. its {isMega} slot). No favourite (E4 have no signature ace in this model).
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [e41MainType],
        team: getBossPreset('SIDNEY', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_PHOEBE',
        location: 'Elite Four',
        class: 'Elite Four Phoebe',
        isBoss: true,
        breedTier: 'good',
        level: 74,
        bag: [...leagueBag()],
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [e42MainType],
        team: getBossPreset('PHOEBE', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_GLACIA',
        location: 'Elite Four',
        class: 'Elite Four Glacia',
        isBoss: true,
        breedTier: 'good',
        level: 75,
        bag: [...leagueBag()],
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [e43MainType],
        team: getBossPreset('GLACIA', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_DRAKE',
        location: 'Elite Four',
        class: 'Elite Four Drake',
        isBoss: true,
        breedTier: 'good',
        level: 76,
        bag: [...leagueBag()],
        restrictions: [TRAINER_RESTRICTION_ALLOW_ONLY_TYPES],
        types: [e44MainType],
        team: getBossPreset('DRAKE', true).map(s => ({ ...s })),
    },
    {
        id: 'TRAINER_CHAMPION_STEVEN',
        location: 'Champion',
        class: 'Steven',
        isBoss: true,
        breedTier: 'perfect',
        level: 78,
        bag: [...leagueBag()],
        // T-106/T-128 — Champion Steven is the AUTHORITATIVE appearance: favourite Mega Metagross (≫ any
        // mega) claims the stage-3 mega slot (tagged STEVEN_MEGA), + legend + OU ace; his earlier
        // appearances (Granite Cave, Mossdeep partner) echo them DEVOLVED. Steven is EXCLUDED from the type
        // restriction — he goes by slots (his signature legend/OU aces stay championMainType-typed).
        favourite: ['SPECIES_METAGROSS_MEGA', { mega: true }],
        favouriteId: 'STEVEN_MEGA',
        team: [
            {
                ...getBossPreset('CHAMPION_STEVEN', true)[0],
                hasStat: ['baseBST', '<', '851'],
            },
            {
                // authoritative legend (was a repeat of the Mossdeep partner's — now the source of truth)
                id: 'STEVEN_LEGEND',
                ...ABSOLUTE_POKEDEF_LEGEND,
                type: [championMainType],
                fallback: [{ id: 'STEVEN_LEGEND', ...ABSOLUTE_POKEDEF_LEGEND }],
            },
            getBossPreset('CHAMPION_STEVEN', true)[1],
            {
                // authoritative OU ace at full strength (no early contextual tier cap). Its Granite-Cave
                // echo is the LC base of this line (may cross a regional-form family boundary, e.g.
                // Goodra-Hisui → shared Goomy — the same line, which the continuity test collapses).
                id: 'STEVEN_OU',
                breedTier: 'perfect',
                evolutionTier: [TIER_OU],
                evoType: [EVO_TYPE_LC],
                tryEvolve: true,
                checkValidEvo: true,
                type: [championMainType],
                fallback: [{
                    id: 'STEVEN_OU',
                    breedTier: 'perfect',
                    evolutionTier: [TIER_UU],
                    evoType: [EVO_TYPE_LC],
                    tryEvolve: true,
                    checkValidEvo: true,
                    type: [championMainType],
                }],
            },
            getBossPreset('CHAMPION_STEVEN', true)[2],
            // T-128 — CHAMPION_STEVEN has no mega slot in its preset; add the stage-3 gated mega slot for
            // the Mega Metagross favourite to CLAIM (no type — Steven is unrestricted).
            bossMega(TIER_UBERS),
        ],
    },
];

    // T-044/T-076 — tag typed bosses with the type they actually run this seed, so the docs
    // viewer can colour their cards. Gym leaders follow gymMainTypes[0..7] (Roxanne→Juan),
    // E4 follow e4NMainType (Sidney→Drake), Steven follows the resolved champion type (Steel unless
    // it changed this seed). Verified against the team-slot `type: [gymMainTypes[i]]` /
    // `[e4NMainType]` / `[championMainType]` references above. One pass covers every battle instance
    // (rematches, endgame) by class name.
    const themeTypeByClass = {
        'Leader Roxanne': gymMainTypes[0],
        'Leader Brawly': gymMainTypes[1],
        'Leader Wattson': gymMainTypes[2],
        'Leader Flannery': gymMainTypes[3],
        'Leader Norman': gymMainTypes[4],
        'Leader Winona': gymMainTypes[5],
        'Leader Tate And Liza': gymMainTypes[6],
        'Leader Juan': gymMainTypes[7],
        'Elite Four Sidney': e41MainType,
        'Elite Four Phoebe': e42MainType,
        'Elite Four Glacia': e43MainType,
        'Elite Four Drake': e44MainType,
        'Steven': championMainType,
    };
    for (const trainer of trainersData) {
        const themeType = themeTypeByClass[trainer.class];
        if (themeType) trainer.themeType = themeType;
        // T-052 — carry the resolved evil-team main/secondary so the docs card colours follow the
        // configured types (trainerColors.evilColors reads this; falls back to its static map).
        const cls = typeof trainer.class === 'string' ? trainer.class : '';
        if (cls.includes('Aqua')) trainer.evilThemeTypes = [aquaTeamTypes[0], aquaTeamTypes[1]];
        else if (cls.includes('Magma')) trainer.evilThemeTypes = [magmaTeamTypes[0], magmaTeamTypes[1]];
    }

    // T-106 — hoist each recurring character's authoritative (endgame) appearance ahead of its earlier
    // ones, so its roster is decided first and the earlier appearances echo it devolved (ADR-016 §4).
    hoistAuthoritativeAppearances(trainersData, CONTINUITY_GROUPS);

    return trainersData;
}

module.exports = {
    file: trainersFile,
    partnersFile,
    getTrainersData,
    // Exported for unit testing (T-052).
    resolveTeamTypes,
    AQUA_DEFAULT_TYPES,
    MAGMA_DEFAULT_TYPES,
    // Exported for unit testing (T-106).
    hoistAuthoritativeAppearances,
    villainFavourite,
};
