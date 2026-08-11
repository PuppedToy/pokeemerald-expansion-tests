'use strict';

/**
 * T-268 — the docs' encounter-map order (single home for both writer paths).
 *
 * `wild.js` lists maps in data order; the docs list them in the order the PLAYER reaches them,
 * with the boss-reward entries and the repositioned static/legendary encounters spliced in.
 * `writer.js` (analyze path → out.html) and `writerDocs.js` (bundle path → the served docs)
 * must emit the identical sequence, so the table lives here and nowhere else.
 */

/**
 * Reorders `maps` in place (and returns it) into docs/progression order.
 *
 * @param {Array<{id: string}>} maps                   encounter entries in wild.js data order
 * @param {Array<{id: string}>} pokeRewardReplacements the boss-reward species, by boss index
 */
function applyDocMapOrder(maps, pokeRewardReplacements) {
    // Extract the entries that are repositioned geographically (statics, legendaries, and the
    // routes whose data order does not match the player's route).
    // Object.assign mutates and returns the extracted entry so we can add props inline.
    const extractMap = (id, extra = {}) => {
        const idx = maps.findIndex(m => m.id === id);
        return idx !== -1 ? Object.assign(maps.splice(idx, 1)[0], extra) : null;
    };
    const desertRuinsEntry = extractMap('MAP_DESERT_RUINS',   { label: 'Desert Ruins',   staticEncounter: true });
    const islandCaveEntry  = extractMap('MAP_ISLAND_CAVE',    { label: 'Island Cave',    staticEncounter: true });
    const newMauvilleEntry = extractMap('MAP_NEW_MAUVILLE',   { label: 'New Mauville',   staticEncounter: true });
    const ancientTombEntry = extractMap('MAP_ANCIENT_TOMB',   { label: 'Ancient Tomb',   staticEncounter: true });
    const skyPillarEntry   = extractMap('MAP_SKY_PILLAR_TOP', { label: 'Sky Pillar Top', legendaryEncounter: true });
    const route123Entry    = extractMap('MAP_ROUTE123');

    // Insertions: groups sharing the same afterMap are listed in REVERSE desired order so
    // repeated splices at idx+1 yield the correct final sequence.
    const insertions = [
        // Route 115 → Roxanne → Route 116: the route only opens once Roxanne is beaten, and it
        // already follows Route 115 in wild.js's order, so anchoring her here puts her between
        // the two (T-268 — this used to anchor on MAP_ROUTE116, listing the route too early).
        { afterMap: 'MAP_ROUTE115', entry: { id: 'BOSS_ROXANNE_REWARD',          label: 'Roxanne Reward',          boss: true, special1: pokeRewardReplacements[0].id } },
        // Route 106 → Brawly (before Granite Cave)
        { afterMap: 'MAP_ROUTE106', entry: { id: 'BOSS_BRAWLY_REWARD',           label: 'Brawly Reward',           boss: true, special1: pokeRewardReplacements[1].id } },
        // Route 109 → Slateport Grunts
        { afterMap: 'MAP_ROUTE109', entry: { id: 'BOSS_SLATEPORT_GRUNTS_REWARD', label: 'Slateport Grunts Reward', boss: true, special1: pokeRewardReplacements[8].id } },
        // Route 118 → Wattson
        { afterMap: 'MAP_ROUTE118', entry: { id: 'BOSS_WATTSON_REWARD',          label: 'Wattson Reward',          boss: true, special1: pokeRewardReplacements[2].id } },
        // Route 114 group (reverse order → final: Flannery, Desert Ruins, Norman, Island Cave)
        { afterMap: 'MAP_ROUTE114', entry: islandCaveEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_NORMAN_REWARD',           label: 'Norman Reward',           boss: true, special1: pokeRewardReplacements[4].id } },
        { afterMap: 'MAP_ROUTE114', entry: desertRuinsEntry },
        { afterMap: 'MAP_ROUTE114', entry: { id: 'BOSS_FLANNERY_REWARD',         label: 'Flannery Reward',         boss: true, special1: pokeRewardReplacements[3].id } },
        // Island Cave → New Mauville (processed after Island Cave is placed)
        { afterMap: 'MAP_ISLAND_CAVE', entry: newMauvilleEntry },
        // Route 119 → Shelly
        { afterMap: 'MAP_ROUTE119', entry: { id: 'BOSS_SHELLY_REWARD',           label: 'Shelly Reward',           boss: true, special1: pokeRewardReplacements[9].id } },
        // Route 120 group (reverse order → final: Winona, Ancient Tomb)
        { afterMap: 'MAP_ROUTE120', entry: ancientTombEntry },
        { afterMap: 'MAP_ROUTE120', entry: { id: 'BOSS_WINONA_REWARD',           label: 'Winona Reward',           boss: true, special1: pokeRewardReplacements[5].id } },
        // Route 121 → Wally Lilycove
        { afterMap: 'MAP_ROUTE121', entry: { id: 'BOSS_WALLY_LILYCOVE',          label: 'Wally Lilycove Reward',   boss: true, special1: pokeRewardReplacements[10].id } },
        // Route 124 → Tate & Liza (before Route 125)
        { afterMap: 'MAP_ROUTE124', entry: { id: 'BOSS_TATE_LIZA_REWARD',        label: 'Tate & Liza Reward',      boss: true, special1: pokeRewardReplacements[6].id } },
        // Route 129 group (reverse order → final: Sky Pillar, Juan, Route 123)
        { afterMap: 'MAP_ROUTE129', entry: route123Entry },
        { afterMap: 'MAP_ROUTE129', entry: { id: 'BOSS_JUAN_REWARD',             label: 'Juan Reward',             boss: true, special1: pokeRewardReplacements[7].id } },
        { afterMap: 'MAP_ROUTE129', entry: skyPillarEntry },
    ];
    for (const { afterMap, entry } of insertions) {
        if (!entry) continue;   // a map missing from wild.js leaves no hole in the docs
        const idx = maps.findIndex(m => m.id === afterMap);
        if (idx !== -1) maps.splice(idx + 1, 0, entry);
        else maps.push(entry);
    }
    return maps;
}

module.exports = { applyDocMapOrder };
