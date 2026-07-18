'use strict';

/**
 * bossCaps — SSOT for the level-cap progression used by the docs' Mail feature (T-007).
 *
 * Two sources, joined at build time:
 *   1. src/caps.c `sLevelCapFlagMap` — the authoritative ordered [flag → level] list.
 *      Parsed here so a rebalance of caps.c flows through automatically.
 *   2. BOSS_CAP_TRAINERS (below) — the 1-to-1 map from each cap flag to the boss trainer(s)
 *      whose defeat sets that flag, plus a human label. This is the documented relation the
 *      game's scripts encode (the `setflag` sites in data/maps scripts); kept in code so it is
 *      auditable and never silently drifts.
 *
 * `buildBossCaps()` joins them and ASSERTS the relation is 1-to-1 (every caps.c flag is mapped
 * and every mapped flag exists in caps.c) — the build fails loudly if caps.c changes and this
 * map wasn't updated. Defeating ANY trainer in an entry's `trainers` set counts as that boss
 * (handles gender×starter rival variants and multi-grunt gauntlets).
 */

// Rival battles exist for both player genders × the three starters the rival counters.
const STARTERS = ['TREECKO', 'TORCHIC', 'MUDKIP'];
const rival = (loc) => STARTERS.flatMap((s) => [`TRAINER_BRENDAN_${loc}_${s}`, `TRAINER_MAY_${loc}_${s}`]);

const BOSS_CAP_TRAINERS = {
    FLAG_DEFEATED_RIVAL_ROUTE103:        { trainers: rival('ROUTE_103'),                 label: 'Rival – Route 103' },
    FLAG_DEFEATED_AQUA_WOODS:            { trainers: ['TRAINER_GRUNT_PETALBURG_WOODS'],  label: 'Aqua Grunt – Petalburg Woods' },
    FLAG_BADGE01_GET:                    { trainers: ['TRAINER_ROXANNE_1'],              label: 'Roxanne – Badge 1' },
    FLAG_RECOVERED_DEVON_GOODS:          { trainers: ['TRAINER_GRUNT_RUSTURF_TUNNEL'],   label: 'Grunt – Rusturf Tunnel' },
    FLAG_DEFEATED_RIVAL_RUSTBORO:        { trainers: rival('RUSTBORO'),                  label: 'Rival – Rustboro' },
    FLAG_BADGE02_GET:                    { trainers: ['TRAINER_BRAWLY_1'],               label: 'Brawly – Badge 2' },
    FLAG_DELIVERED_STEVEN_LETTER:        { trainers: ['TRAINER_STEVEN'],                 label: 'Steven – Granite Cave' },
    FLAG_DELIVERED_DEVON_GOODS:          { trainers: ['TRAINER_GRUNT_MUSEUM_1', 'TRAINER_GRUNT_MUSEUM_2'], label: 'Aqua Grunts – Oceanic Museum' },
    FLAG_ROUTE110_RIVAL_DEFEATED:        { trainers: rival('ROUTE_110'),                 label: 'Rival – Route 110' },
    FLAG_DEFEATED_WALLY_MAUVILLE:        { trainers: ['TRAINER_WALLY_MAUVILLE'],         label: 'Wally – Mauville' },
    FLAG_BADGE03_GET:                    { trainers: ['TRAINER_WATTSON_1'],              label: 'Wattson – Badge 3' },
    FLAG_DEFEATED_TABITHA_MT_CHIMNEY:    { trainers: ['TRAINER_TABITHA_MT_CHIMNEY'],     label: 'Tabitha – Mt Chimney' },
    // NOTE: FLAG_DEFEATED_EVIL_TEAM_MT_CHIMNEY (Maxie – Mt Chimney) was removed as a level-cap
    // boss (T-148). The flag lives on as a story-only flag (still set by the Mt Chimney script),
    // so it is intentionally NOT in caps.c nor here — keep them in lock-step (1-to-1 assertion).
    FLAG_BADGE04_GET:                    { trainers: ['TRAINER_FLANNERY_1'],             label: 'Flannery – Badge 4' },
    FLAG_BADGE05_GET:                    { trainers: ['TRAINER_NORMAN_1'],               label: 'Norman – Badge 5' },
    FLAG_DEFEATED_SHELLY_WEATHER_INST:   { trainers: ['TRAINER_SHELLY_WEATHER_INSTITUTE'], label: 'Shelly – Weather Institute' },
    FLAG_ROUTE119_RIVAL_DEFEATED:        { trainers: rival('ROUTE_119'),                 label: 'Rival – Route 119' },
    FLAG_BADGE06_GET:                    { trainers: ['TRAINER_WINONA_1'],               label: 'Winona – Badge 6' },
    // caps.c comment says "Boss (Wally)" and level 49 matches TRAINER_WALLY_LILYCOVE; the flag is
    // named MET_RIVAL_LILYCOVE. Include Wally (primary) — VERIFY against the Lilycove script if a
    // rival fight turns out to set this flag instead.
    FLAG_MET_RIVAL_LILYCOVE:             { trainers: ['TRAINER_WALLY_LILYCOVE'],         label: 'Wally – Lilycove' },
    FLAG_GROUDON_AWAKENED_MAGMA_HIDEOUT: { trainers: ['TRAINER_MAXIE_MAGMA_HIDEOUT'],    label: 'Maxie – Magma Hideout' },
    FLAG_TEAM_AQUA_ESCAPED_IN_SUBMARINE: { trainers: ['TRAINER_MATT'],                   label: 'Matt – Aqua Hideout' },
    FLAG_BADGE07_GET:                    { trainers: ['TRAINER_TATE_AND_LIZA_1'],        label: 'Tate & Liza – Badge 7' },
    FLAG_DEFEATED_MAGMA_SPACE_CENTER:    { trainers: ['TRAINER_MAXIE_MOSSDEEP', 'TRAINER_TABITHA_MOSSDEEP'], label: 'Maxie – Space Center' },
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN: { trainers: ['TRAINER_ARCHIE'],                 label: 'Archie – Seafloor Cavern' },
    FLAG_BADGE08_GET:                    { trainers: ['TRAINER_JUAN_1'],                 label: 'Juan – Badge 8' },
    FLAG_DEFEATED_WALLY_VICTORY_ROAD:    { trainers: ['TRAINER_WALLY_VR_1'],             label: 'Wally – Victory Road' },
    FLAG_DEFEATED_EVERGRANDE_RIVAL:      { trainers: rival('EVERGRANDE_CITY'),           label: 'Rival – Ever Grande' },
    FLAG_FIRST_DEFEATED_ELITE_4_SIDNEY:  { trainers: ['TRAINER_SIDNEY'],                 label: 'Elite Four – Sidney' },
    FLAG_FIRST_DEFEATED_ELITE_4_PHOEBE:  { trainers: ['TRAINER_PHOEBE'],                 label: 'Elite Four – Phoebe' },
    FLAG_FIRST_DEFEATED_ELITE_4_GLACIA:  { trainers: ['TRAINER_GLACIA'],                 label: 'Elite Four – Glacia' },
    FLAG_FIRST_DEFEATED_ELITE_4_DRAKE:   { trainers: ['TRAINER_DRAKE'],                  label: 'Elite Four – Drake' },
    FLAG_IS_CHAMPION:                    { trainers: ['TRAINER_CHAMPION_STEVEN'],        label: 'Champion – Steven' },
};

// Static-encounter unlocks (hardcoded per the romhack's design), keyed by the boss flag that
// unlocks them. Species are read live from wildPokes at mail-generation time (randomized).
const STATIC_UNLOCKS = {
    FLAG_BADGE04_GET: ['MAP_DESERT_RUINS'],                    // after Flannery
    FLAG_BADGE05_GET: ['MAP_ISLAND_CAVE', 'MAP_NEW_MAUVILLE'], // after Norman
    FLAG_BADGE06_GET: ['MAP_ANCIENT_TOMB'],                    // after Winona
    FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN: ['MAP_SKY_PILLAR_TOP'], // after Archie
};

// Parse src/caps.c text → ordered [{ flag, level }] from the sLevelCapFlagMap array only.
function parseLevelCaps(capsCText) {
    const start = capsCText.indexOf('sLevelCapFlagMap');
    if (start === -1) return [];
    const endRel = capsCText.slice(start).indexOf('};');
    const block = capsCText.slice(start, endRel === -1 ? undefined : start + endRel);
    const out = [];
    const re = /\{\s*(FLAG_\w+)\s*,\s*(\d+)\s*\}/g;
    let m;
    while ((m = re.exec(block)) !== null) out.push({ flag: m[1], level: parseInt(m[2], 10) });
    return out;
}

// T-149 — flag → level map parsed from caps.c, so the randomizer can derive trainer levels from the
// caps SSOT (a trainer's level tracks its segment's boss cap). Node builds it live; the browser gets it
// baked into base-data.json (via parseBaseData). Keyed by cap flag, e.g. { FLAG_BADGE01_GET: 12, … }.
function capLevelMap(capsCText) {
    const out = {};
    for (const { flag, level } of parseLevelCaps(capsCText)) out[flag] = level;
    return out;
}

// Join caps.c levels/order with the trainer/label map; assert the relation is exactly 1-to-1.
function buildBossCaps(capsCText, map = BOSS_CAP_TRAINERS) {
    const caps = parseLevelCaps(capsCText);
    const capFlags = new Set(caps.map((c) => c.flag));
    const missing = caps.filter((c) => !map[c.flag]).map((c) => c.flag);
    if (missing.length) throw new Error(`bossCaps: caps.c flags with no trainer mapping: ${missing.join(', ')}`);
    const extra = Object.keys(map).filter((f) => !capFlags.has(f));
    if (extra.length) throw new Error(`bossCaps: mapping flags not present in caps.c sLevelCapFlagMap: ${extra.join(', ')}`);
    return caps.map((c, i) => ({ order: i, flag: c.flag, level: c.level, trainers: map[c.flag].trainers, label: map[c.flag].label }));
}

module.exports = { parseLevelCaps, capLevelMap, buildBossCaps, BOSS_CAP_TRAINERS, STATIC_UNLOCKS };
