'use strict';

const fs = require('fs').promises;
const path = require('path');

// T-070 — emit the per-ROM location→nickname/gender C table into src/location_nicknames.c, between the
// // @LOCATION_NICKNAMES_START / _END anchors. Reuses the T-068 sanitizers (last line of defence before
// untrusted names reach C: [A-Za-z0-9 ], ≤12) and COMPOUND_STRING for the inline string pointers (B-020).
// Feature-off = writer not invoked = committed sentinel table stays = every lookup NULL = vanilla.

const { sanitizeNickname, genderConst } = require('./starterNameWriter');
const { LOCATION_NICKNAME_CAPACITY } = require('./layout');

const START = '// @LOCATION_NICKNAMES_START';
const END = '// @LOCATION_NICKNAMES_END';
const COUNT_START = '// @LOCATION_NICKNAMES_COUNT_START';
const COUNT_END = '// @LOCATION_NICKNAMES_COUNT_END';
const SAFE_MAP_KEY = /^MAP_[A-Z0-9_]+$/;

function locationKeys(locationNaming) {
    return Object.keys(locationNaming || {}).filter((k) => SAFE_MAP_KEY.test(k)).sort();
}

// Build the C rows (a string) for one ROM's location→naming map. T-237: the table has a fixed capacity
// and the name is an inline `u8 [POKEMON_NAME_LENGTH + 1]`, so rows use `_("…")` (a string literal that
// initialises the array) rather than COMPOUND_STRING (a pointer), and an empty table is legal — the array
// is sized by LOCATION_NICKNAME_CAPACITY, not by its contents, so no zero-length-array (-Werror) risk.
function buildLocationRows(locationNaming) {
    return locationKeys(locationNaming).map((k) => {
        const slot = locationNaming[k] || {};
        const name = sanitizeNickname(slot.nickname);
        return `    { MAP_GROUP(${k}), MAP_NUM(${k}), ${genderConst(slot.gender)}, _("${name}") },`;
    }).join('\n');
}

// Replace the whole anchored region (markers + body) with rebuilt markers + rows, and the row count with
// it — the two must always agree, so they are written together. Idempotent.
function applyLocationNames(fileContent, locationNaming) {
    const keys = locationKeys(locationNaming);
    if (keys.length > LOCATION_NICKNAME_CAPACITY) {
        throw new Error(`locationNameWriter: ${keys.length} named locations exceed LOCATION_NICKNAME_CAPACITY `
            + `(${LOCATION_NICKNAME_CAPACITY}). Raise it in include/constants/randomizer_layout.h.`);
    }
    const rows = buildLocationRows(locationNaming);
    const region = new RegExp(`[ \\t]*${START}[\\s\\S]*?${END}`);
    const countRegion = new RegExp(`[ \\t]*${COUNT_START}[\\s\\S]*?${COUNT_END}`);
    return fileContent
        .replace(region, `    ${START}\n${rows}\n    ${END}`)
        .replace(countRegion, `    ${COUNT_START}\n    ${keys.length}\n    ${COUNT_END}`);
}

const LOCATION_FILE = path.resolve(__dirname, '..', 'src', 'location_nicknames.c');

// Splice the per-ROM location table into src/location_nicknames.c (restored by make.js's restore()).
async function writeLocationNames(locationNaming) {
    if (!locationNaming) return;
    const content = await fs.readFile(LOCATION_FILE, 'utf8');
    await fs.writeFile(LOCATION_FILE, applyLocationNames(content, locationNaming), 'utf8');
}

module.exports = { buildLocationRows, applyLocationNames, writeLocationNames, START, END, COUNT_START, COUNT_END };
