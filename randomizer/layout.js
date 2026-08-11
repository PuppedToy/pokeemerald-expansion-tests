'use strict';

// T-237 / ADR-022 — the fixed capacities of the tables the ROM maker rewrites.
//
// Their single home is the C header (include/constants/randomizer_layout.h): the compiler and the
// writers must agree, and the only way to guarantee that is to read the same number rather than
// restate it. Node-side only — these are ROM-maker concerns and never reach the browser bundle.

const fs = require('fs');
const path = require('path');

const LAYOUT_HEADER = path.resolve(__dirname, '..', 'include', 'constants', 'randomizer_layout.h');

function readCapacity(name) {
    const header = fs.readFileSync(LAYOUT_HEADER, 'utf8');
    const match = header.match(new RegExp(`^#define ${name}\\s+(\\d+)`, 'm'));
    if (!match) throw new Error(`randomizer/layout.js: ${name} not found in include/constants/randomizer_layout.h`);
    return Number(match[1]);
}

module.exports = {
    // Both learnset capacities INCLUDE the terminator entry, so a payload may be at most capacity - 1.
    LEVEL_UP_LEARNSET_CAPACITY: readCapacity('LEVEL_UP_LEARNSET_CAPACITY'),
    TEACHABLE_LEARNSET_CAPACITY: readCapacity('TEACHABLE_LEARNSET_CAPACITY'),
    // Parties have no terminator (`.partySize` bounds them), so the whole capacity is usable.
    TRAINER_PARTY_CAPACITY: readCapacity('TRAINER_PARTY_CAPACITY'),
    // Rows / entries; each table carries a writer-filled count of how many are real.
    LOCATION_NICKNAME_CAPACITY: readCapacity('LOCATION_NICKNAME_CAPACITY'),
    TRADE_NICKNAME_CAPACITY: readCapacity('TRADE_NICKNAME_CAPACITY'),
    STARTER_EXTRA_CAPACITY: readCapacity('STARTER_EXTRA_CAPACITY'),
    TRADE_SPECIES_LIST_CAPACITY: readCapacity('TRADE_SPECIES_LIST_CAPACITY'),
    // T-269 — the TM moves a traded mon arrives knowing.
    TRADE_MOVE_LIST_CAPACITY: readCapacity('TRADE_MOVE_LIST_CAPACITY'),
    LAYOUT_HEADER,
    readCapacity,
};
