'use strict';

// T-184 — Phase A data guards: Shedinja's base HP is set so its BST matches base Ninjask (456), and the
// Wonder Guard ability description states the 1-HP rule within the in-game single-line budget.

const fs = require('fs');
const path = require('path');
const { SPECIES_DIR } = require('../../constants');

const GEN3 = path.join(SPECIES_DIR, 'gen_3_families.h');
const ABILITIES = path.resolve(SPECIES_DIR, '..', '..', '..', 'data', 'abilities.h');

// Slice a `[SPECIES_X] = { ... }` block out of the source, up to the next species declaration.
function speciesBlock(src, id) {
    const start = src.indexOf(`[${id}] =`);
    if (start === -1) return '';
    const rest = src.slice(start + `[${id}] =`.length);
    const next = rest.search(/\[SPECIES_\w+\] =/);
    return rest.slice(0, next === -1 ? rest.length : next);
}

function bst(block) {
    const stat = name => {
        const m = block.match(new RegExp(`\\.${name}\\s*=\\s*(\\d+)`));
        return m ? Number(m[1]) : NaN;
    };
    return stat('baseHP') + stat('baseAttack') + stat('baseDefense')
        + stat('baseSpAttack') + stat('baseSpDefense') + stat('baseSpeed');
}

describe('T-184 — Shedinja base stats', () => {
    const src = fs.readFileSync(GEN3, 'utf8');
    const shedinja = speciesBlock(src, 'SPECIES_SHEDINJA');
    const ninjask = speciesBlock(src, 'SPECIES_NINJASK');

    test('Shedinja baseHP is 221 (no longer 1)', () => {
        expect(shedinja).toMatch(/\.baseHP\s*=\s*221\b/);
    });

    test("Shedinja's BST equals base Ninjask's BST (456)", () => {
        expect(bst(ninjask)).toBe(456);
        expect(bst(shedinja)).toBe(bst(ninjask));
    });
});

describe('T-184 — Wonder Guard description', () => {
    const abilities = fs.readFileSync(ABILITIES, 'utf8');
    const start = abilities.indexOf('[ABILITY_WONDER_GUARD] =');
    const block = abilities.slice(start, start + 400);
    const desc = (block.match(/\.description = COMPOUND_STRING\("([^"]*)"\)/) || [])[1];

    test('mentions the 1-HP rule', () => {
        expect(desc).toBeDefined();
        expect(desc).toMatch(/1 ?HP/i);
    });

    test('stays within the single-line budget (<= 31 chars, matching the longest existing description)', () => {
        expect(desc.length).toBeLessThanOrEqual(31);
    });
});
