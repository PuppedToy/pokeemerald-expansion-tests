'use strict';

/**
 * T-269 — the progression spine: what the player has REACHED by each boss milestone.
 *
 * `bossCaps` already owns the milestone ladder (which boss sets which cap flag, at which level, in
 * which order — src/caps.c is its SSOT). What it does not say is *where the player can be* at each
 * step. That relation — this milestone opens these wild-encounter maps, this one hands over that
 * fishing rod — is world design, and this table is its single home.
 *
 * It exists because the town traders (randomizer/docs/trades.md) offer a swap for "any wild mon you
 * could have caught by now": the trader at a milestone draws from every map opened up to and
 * including it, through every method unlocked by then. Deriving that from the table means a new
 * route or a moved rod changes one line here and every trader follows.
 *
 * Rules of the table:
 *   • One entry per caps.c milestone, in caps.c order (a test asserts both) — including the
 *     milestones that open nothing, so the ladder reads whole.
 *   • `maps` = the maps that become reachable BY DEFEATING that milestone's boss. A map the player
 *     only walks into as a consequence of that fight belongs to the NEXT milestone: Route 116 opens
 *     once Roxanne is beaten, so it is the Rusturf grunt's entry, not hers. That is what makes
 *     "everything up to Roxanne" exclude it, as the owner specified.
 *   • `unlocksMethods` = encounter methods that become usable from then on, RETROACTIVELY (a rod
 *     opens its slots on every map already reached).
 *   • Every map in `wild.js` is either in exactly one entry or in STATIC_MAPS.
 */

// The encounter methods wild.js keys its maps by, in display order. 'land' is the zone's grass (or,
// on the water routes, its land_mons slots), the other four are the two rods, Surf and the super rod.
const ALL_METHODS = ['land', 'old', 'good', 'surf', 'super'];

// The one-off static/legendary encounters (Regis, Rayquaza, New Mauville's Voltorb). They carry no
// method slots at all, so they can never enter a trade pool; bossCaps.STATIC_UNLOCKS owns when the
// player may reach them. Listed here so the "every map is classified" guard stays exhaustive.
const STATIC_MAPS = [
    'MAP_DESERT_RUINS', 'MAP_ISLAND_CAVE', 'MAP_NEW_MAUVILLE', 'MAP_ANCIENT_TOMB', 'MAP_SKY_PILLAR_TOP',
];

const PROGRESSION = [
    // ── Littleroot → Rustboro ────────────────────────────────────────────────
    { flag: 'FLAG_DEFEATED_RIVAL_ROUTE103',        maps: ['MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ROUTE103'], unlocksMethods: ['land', 'old'] },
    { flag: 'FLAG_DEFEATED_AQUA_WOODS',            maps: ['MAP_ROUTE104', 'MAP_PETALBURG_WOODS'] },
    { flag: 'FLAG_BADGE01_GET',                    maps: ['MAP_ROUTE115'] },
    // Route 116 is walled off until Roxanne falls (see docsMapOrder.js / T-268), and the grunt at the
    // far end of it is this milestone's boss.
    { flag: 'FLAG_RECOVERED_DEVON_GOODS',          maps: ['MAP_ROUTE116'] },
    { flag: 'FLAG_DEFEATED_RIVAL_RUSTBORO',        maps: [] },
    // ── Dewford → Slateport ──────────────────────────────────────────────────
    { flag: 'FLAG_BADGE02_GET',                    maps: ['MAP_ROUTE106'] },
    { flag: 'FLAG_DELIVERED_STEVEN_LETTER',        maps: ['MAP_GRANITE_CAVE'] },
    { flag: 'FLAG_DELIVERED_DEVON_GOODS',          maps: ['MAP_ROUTE109'] },
    { flag: 'FLAG_ROUTE110_RIVAL_DEFEATED',        maps: ['MAP_ROUTE110'] },
    { flag: 'FLAG_DEFEATED_WALLY_MAUVILLE',        maps: [] },
    // ── Mauville → Lavaridge ─────────────────────────────────────────────────
    { flag: 'FLAG_BADGE03_GET',                    maps: ['MAP_ROUTE117', 'MAP_ROUTE118'] },
    { flag: 'FLAG_DEFEATED_TABITHA_MT_CHIMNEY',    maps: ['MAP_ROUTE112', 'MAP_JAGGED_PASS', 'MAP_ROUTE113'] },
    // Route 111's desert needs the Go-Goggles (Fallarbor, past Mt Chimney) and Route 114 sits behind
    // Fallarbor; both are tuned to Flannery's cap.
    // The good rod is in the player's bag by the time they trade in Lavaridge (owner, 2026-08-11).
    { flag: 'FLAG_BADGE04_GET',                    maps: ['MAP_ROUTE111', 'MAP_ROUTE114'], unlocksMethods: ['good'] },
    // ── Petalburg → Fortree ──────────────────────────────────────────────────
    { flag: 'FLAG_BADGE05_GET',                    maps: [] },
    // Route 119 is the road out of Petalburg and the Weather Institute stands on it — so it is only
    // walked AFTER Norman's badge, which is why "everything up to Norman" (the Petalburg trader) still
    // excludes it.
    { flag: 'FLAG_DEFEATED_SHELLY_WEATHER_INST',   maps: ['MAP_ROUTE119'] },
    { flag: 'FLAG_ROUTE119_RIVAL_DEFEATED',        maps: [] },
    // Scorched Slab needs Surf, which the owner places at this trader (Fortree) — the first one that
    // may ask for a water encounter.
    { flag: 'FLAG_BADGE06_GET',                    maps: ['MAP_ROUTE120', 'MAP_SCORCHED_SLAB'], unlocksMethods: ['surf'] },
    // ── Lilycove → Mossdeep ──────────────────────────────────────────────────
    { flag: 'FLAG_MET_RIVAL_LILYCOVE',             maps: ['MAP_ROUTE121'] },
    { flag: 'FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT', maps: [] },
    { flag: 'FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE', maps: [] },
    // Mt Pyre (Route 122 + the exterior) is the Lilycove→Mossdeep story, Route 124 the crossing to
    // Mossdeep. The super rod is in hand by the time the player trades there (owner, 2026-08-11).
    { flag: 'FLAG_BADGE07_GET',                    maps: ['MAP_ROUTE122', 'MAP_MT_PYRE_EXTERIOR', 'MAP_ROUTE124'], unlocksMethods: ['super'] },
    { flag: 'FLAG_DEFEATED_MAGMA_SPACE_CENTER',    maps: ['MAP_ROUTE125', 'MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM', 'MAP_SHOAL_CAVE_HIGH_TIDE_ENTRANCE_ROOM'] },
    // ── The Pacifidlog stretch → Sootopolis ──────────────────────────────────
    // Everything the player surfs through on the way to (and around) Seafloor Cavern.
    { flag: 'FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN', maps: ['MAP_ROUTE123', 'MAP_ROUTE127', 'MAP_ROUTE126', 'MAP_ROUTE128', 'MAP_ROUTE129', 'MAP_ROUTE131', 'MAP_PACIFIDLOG_TOWN', 'MAP_ROUTE132'] },
    { flag: 'FLAG_BADGE08_GET',                    maps: [] },
    // ── Ever Grande ──────────────────────────────────────────────────────────
    // Ever Grande City is caught before entering Victory Road, where Wally waits; its inside is only
    // cleared afterwards, so B1F belongs to the next milestone (and only the League trader sees it).
    { flag: 'FLAG_DEFEATED_WALLY_VICTORY_ROAD',    maps: ['EVER_GRANDE_CITY'] },
    { flag: 'FLAG_DEFEATED_EVERGRANDE_RIVAL',      maps: ['MAP_VICTORY_ROAD_B1F'] },
    { flag: 'FLAG_FIRST_DEFEATED_ELITE_4_SIDNEY',  maps: [] },
    { flag: 'FLAG_FIRST_DEFEATED_ELITE_4_PHOEBE',  maps: [] },
    { flag: 'FLAG_FIRST_DEFEATED_ELITE_4_GLACIA',  maps: [] },
    { flag: 'FLAG_FIRST_DEFEATED_ELITE_4_DRAKE',   maps: [] },
    { flag: 'FLAG_IS_CHAMPION',                    maps: [] },
];

// ── TM reachability ───────────────────────────────────────────────────────────
//
// "One TM out of the bag Roxanne's boss fight leaves the player with" needs the same reachability
// question asked of TMs. It is answered from the TM table's Location column (randomizer/docs/tms.md,
// already the SSOT for where every TM slot lives, parsed by tmLocations.js and stamped on each move
// as `tmLocation`) joined with the map table above:
//
//   • "Gym reward — Roxanne (badge 1)"        → that badge's flag
//   • "Pick — Route 116 Clark pick (1 of 3)"  → the milestone that opens MAP_ROUTE116
//   • the handful of named places below       → an explicit milestone
//
// A location string that matches nothing THROWS: a new TM location must be classified, never
// silently dropped from every trader's pool.
//
// Owner decision (2026-08-11): a "choose 1 of 3" pick counts as all three options — the pipeline
// cannot know which one the player took, and a trade gift is not a duplicate.
const BADGE_FLAGS = [
    'FLAG_BADGE01_GET', 'FLAG_BADGE02_GET', 'FLAG_BADGE03_GET', 'FLAG_BADGE04_GET',
    'FLAG_BADGE05_GET', 'FLAG_BADGE06_GET', 'FLAG_BADGE07_GET', 'FLAG_BADGE08_GET',
];

// Places the TM table names that are not "Route NNN". Granite Cave is the map the Steven letter
// milestone opens; Victory Road **1F** is the floor the player walks the moment Wally is fought there
// (its wild encounters live one floor down, MAP_VICTORY_ROAD_B1F, cleared afterwards); the Ever Grande
// rival hands over his TM at his own milestone.
const TM_PLACE_MILESTONES = [
    { match: /Granite Cave/i,     flag: 'FLAG_DELIVERED_STEVEN_LETTER' },
    { match: /Victory Road/i,     flag: 'FLAG_DEFEATED_WALLY_VICTORY_ROAD' },
    { match: /EverGrande City/i,  flag: 'FLAG_DEFEATED_EVERGRANDE_RIVAL' },
];

/**
 * The milestone by which a TM's in-world location is reachable.
 * @param {string} location a `tmLocation` string (docs/tms.md Location column)
 * @returns {string} cap flag
 */
function tmLocationMilestone(location) {
    const text = String(location || '');
    const badge = text.match(/\(badge\s*(\d)\)/i);
    if (badge) return BADGE_FLAGS[Number(badge[1]) - 1];
    const route = text.match(/Route\s*(\d{3})/i);
    if (route) {
        const mapId = `MAP_ROUTE${route[1]}`;
        const step = PROGRESSION.find(p => p.maps.includes(mapId));
        if (step) return step.flag;
        throw new Error(`progression: TM location '${text}' names ${mapId}, which has no milestone`);
    }
    const place = TM_PLACE_MILESTONES.find(p => p.match.test(text));
    if (place) return place.flag;
    throw new Error(`progression: TM location '${text}' is not classified — add it to TM_PLACE_MILESTONES`);
}

/**
 * Every TM slot number the player can hold by `flag`.
 * @param {Object} tmLocations { [tmNumber]: locationString } (tmLocations.js / docs/tms.md)
 */
function tmNumbersAvailableAt(flag, tmLocations) {
    const upTo = milestoneOrder(flag);
    return Object.keys(tmLocations || {})
        .map(Number)
        .filter(n => milestoneOrder(tmLocationMilestone(tmLocations[n])) <= upTo)
        .sort((a, b) => a - b);
}

/**
 * Every TM **move** the player can hold by `flag`, from the run's move database (each TM move carries
 * `.tm` and `.tmLocation`). HMs are never TMs here — they carry no `.tm`, so they drop out on their own.
 * @param {Object} moves the pokedex artifact's `moves`
 * @returns {string[]} MOVE_* ids, in TM-slot order
 */
function tmMovesAvailableAt(flag, moves) {
    const upTo = milestoneOrder(flag);
    return Object.keys(moves || {})
        .filter(id => moves[id] && moves[id].tm && moves[id].tmLocation
            && milestoneOrder(tmLocationMilestone(moves[id].tmLocation)) <= upTo)
        .sort((a, b) => moves[a].tm - moves[b].tm);
}

/** The milestone's position on the ladder. Throws on an unknown flag — a typo must not read as "the start". */
function milestoneOrder(flag) {
    const idx = PROGRESSION.findIndex(p => p.flag === flag);
    if (idx === -1) throw new Error(`progression: '${flag}' is not a milestone (see PROGRESSION / src/caps.c)`);
    return idx;
}

/** Every wild-encounter map the player has reached by `flag`, in progression order. */
function mapsAvailableAt(flag) {
    const upTo = milestoneOrder(flag);
    return PROGRESSION.slice(0, upTo + 1).flatMap(p => p.maps);
}

/** Every encounter method usable by `flag`, in ALL_METHODS order. */
function methodsAvailableAt(flag) {
    const upTo = milestoneOrder(flag);
    const unlocked = new Set(PROGRESSION.slice(0, upTo + 1).flatMap(p => p.unlocksMethods || []));
    return ALL_METHODS.filter(m => unlocked.has(m));
}

/**
 * Every encounter the player could have caught by `flag`, in this run, WITH where it is caught.
 *
 * A map/method pair names an encounter TEMPLATE species (wild.js); the run's wild artifact says what
 * replaced it — `wildPlan` (several species per slot in `classic` mode), else `replacementLog` (one),
 * else the template itself for a caller that has neither (tests / a bundle-less path). A species that
 * lives in several places appears once per place (the super-rod bands are shared across whole map
 * groups), so callers that want a set take the first source, which is the earliest one.
 *
 * @param {string} flag        milestone
 * @param {Array}  wildMaps    wild.js `maps`
 * @param {Object} wildArtifact the run's wild artifact ({ wildPlan, replacementLog })
 * @returns {Array<{species: string, mapId: string, method: string}>} in map → method order
 */
function encounterSourcesAt(flag, wildMaps, wildArtifact) {
    const reachable = new Set(mapsAvailableAt(flag));
    const methods = methodsAvailableAt(flag);
    const wildPlan = (wildArtifact && wildArtifact.wildPlan) || {};
    const replacementLog = (wildArtifact && wildArtifact.replacementLog) || {};
    const out = [];
    for (const map of wildMaps || []) {
        if (!reachable.has(map.id)) continue;
        for (const method of methods) {
            const template = map[method];
            if (!template) continue;
            const picks = wildPlan[template];
            const species = (Array.isArray(picks) && picks.length) ? picks
                : replacementLog[template] ? [replacementLog[template]]
                : [template];
            for (const id of species) out.push({ species: id, mapId: map.id, method });
        }
    }
    return out;
}

/**
 * Every species the player could have caught by `flag`, in this run.
 * @returns {string[]} species ids, deduplicated, in map → method order
 */
function encounterPoolAt(flag, wildMaps, wildArtifact) {
    return [...new Set(encounterSourcesAt(flag, wildMaps, wildArtifact).map(e => e.species))];
}

module.exports = {
    PROGRESSION, STATIC_MAPS, ALL_METHODS,
    milestoneOrder, mapsAvailableAt, methodsAvailableAt, encounterPoolAt, encounterSourcesAt,
    tmLocationMilestone, tmNumbersAvailableAt, tmMovesAvailableAt,
};
