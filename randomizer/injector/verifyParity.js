#!/usr/bin/env node
'use strict';

/**
 * verifyParity.js — the INV-BYTES check, on demand (T-238).
 *
 * Phase 3's invariant is `inject(base, bundle) == compile(bundle)` byte-for-byte. `verify-corpus`
 * answers "do the hashes match?"; this answers the next question — **which bytes, and whose symbol**:
 *
 *   node randomizer/injector/verifyParity.js --a=compiled.gba --b=injected.gba --map=pokeemerald.map
 *
 * Exit 0 = byte-identical. Exit 1 = differences, listed as `offset  length  symbol+delta`.
 */

const fs = require('fs');
const { diffRegions, attributeDiff, formatDiff } = require('./parity');
const { loadOffsetMap } = require('./symbolMap');

function compareRoms({ a, b, offsetMap = null, mergeGap = 4, maxRegions = 200 }) {
    const regions = diffRegions(a, b, { mergeGap, maxRegions });
    const attributed = offsetMap ? attributeDiff(offsetMap, regions) : regions.map(r => ({ ...r, symbol: null, delta: null }));
    return { identical: regions.length === 0, regions: attributed, truncated: !!regions.truncated };
}

function main(argv = process.argv.slice(2)) {
    const flag = (name) => {
        const hit = argv.find(x => x.startsWith(`--${name}=`));
        return hit ? hit.slice(name.length + 3) : null;
    };
    const aPath = flag('a');
    const bPath = flag('b');
    const mapPath = flag('map');
    if (!aPath || !bPath) {
        console.error('usage: node randomizer/injector/verifyParity.js --a=compiled.gba --b=injected.gba [--map=pokeemerald.map]');
        process.exit(2);
    }

    const result = compareRoms({
        a: fs.readFileSync(aPath),
        b: fs.readFileSync(bPath),
        offsetMap: mapPath ? loadOffsetMap(mapPath) : null,
    });

    if (result.identical) {
        console.log(`byte-identical — INV-BYTES holds (${aPath} == ${bPath})`);
        process.exit(0);
    }
    console.log(`${result.regions.length} differing region(s)${result.truncated ? ' (truncated)' : ''}:`);
    console.log(formatDiff(result.regions));
    process.exit(1);
}

if (require.main === module) main();

module.exports = { compareRoms, main };
