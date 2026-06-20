'use strict';

/**
 * tmLocations — parse the Location column of the TM table in randomizer/docs/tms.md (the SSOT for
 * "slot number, pool, in-world location") into a { tmNumber: locationString } map. The slot→location
 * relation is fixed by the romhack's world design (only the move that lands in each slot is
 * randomized), so the docs can tell the player where to get any TM (route + trainer). T-011.
 */

// Rows look like: `| TM01 | avgDmg | Gym reward — Roxanne (badge 1) |`
function parseTmLocations(tmsMdText) {
    const map = {};
    if (!tmsMdText) return map;
    const re = /^\|\s*TM(\d{2})\s*\|\s*[^|]*\|\s*([^|]*?)\s*\|\s*$/gm;
    let m;
    while ((m = re.exec(tmsMdText)) !== null) {
        map[parseInt(m[1], 10)] = m[2].trim();
    }
    return map;
}

module.exports = { parseTmLocations };
