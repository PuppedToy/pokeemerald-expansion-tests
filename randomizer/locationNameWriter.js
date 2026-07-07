'use strict';

const fs = require('fs').promises;
const path = require('path');

// T-070 — emit the per-ROM location→nickname/gender C table into src/location_nicknames.c, between the
// // @LOCATION_NICKNAMES_START / _END anchors. Reuses the T-068 sanitizers (last line of defence before
// untrusted names reach C: [A-Za-z0-9 ], ≤12) and COMPOUND_STRING for the inline string pointers (B-020).
// Feature-off = writer not invoked = committed sentinel table stays = every lookup NULL = vanilla.

const { sanitizeNickname, genderConst } = require('./starterNameWriter');

const START = '// @LOCATION_NICKNAMES_START';
const END = '// @LOCATION_NICKNAMES_END';
const SENTINEL = '    { 0xFF, 0xFF, MON_GENDERLESS, COMPOUND_STRING("") },';
const SAFE_MAP_KEY = /^MAP_[A-Z0-9_]+$/;

// Build the C rows (a string) for one ROM's location→naming map. Always non-empty (sentinel fallback) so
// the generated array can never be a -Werror zero-length array.
function buildLocationRows(locationNaming) {
    const keys = Object.keys(locationNaming || {}).filter((k) => SAFE_MAP_KEY.test(k)).sort();
    const rows = keys.map((k) => {
        const slot = locationNaming[k] || {};
        const name = sanitizeNickname(slot.nickname);
        return `    { MAP_GROUP(${k}), MAP_NUM(${k}), ${genderConst(slot.gender)}, COMPOUND_STRING("${name}") },`;
    });
    if (rows.length === 0) rows.push(SENTINEL);
    return rows.join('\n');
}

// Replace the whole anchored region (markers + body) with rebuilt markers + rows. Idempotent.
function applyLocationNames(fileContent, locationNaming) {
    const rows = buildLocationRows(locationNaming);
    const region = new RegExp(`[ \\t]*${START}[\\s\\S]*?${END}`);
    return fileContent.replace(region, `    ${START}\n${rows}\n    ${END}`);
}

const LOCATION_FILE = path.resolve(__dirname, '..', 'src', 'location_nicknames.c');

// Splice the per-ROM location table into src/location_nicknames.c (restored by make.js's restore()).
async function writeLocationNames(locationNaming) {
    if (!locationNaming) return;
    const content = await fs.readFile(LOCATION_FILE, 'utf8');
    await fs.writeFile(LOCATION_FILE, applyLocationNames(content, locationNaming), 'utf8');
}

module.exports = { buildLocationRows, applyLocationNames, writeLocationNames, START, END };
