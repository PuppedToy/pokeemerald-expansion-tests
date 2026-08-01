'use strict';

// T-237 phase B — trainer and battle-partner parties are emitted at a FIXED capacity.
//
// A party is an anonymous compound literal inside gTrainers[], so the injector reaches it by reading
// the `.party` pointer out of the base ROM and writing the team there. That is only safe if every
// party owns room for a full team: a 2-mon trainer given a 6-mon team would otherwise spill into
// whatever the linker placed next. tools/trainerproc emits `(const struct TrainerMon[TRAINER_PARTY_CAPACITY])`
// for exactly that reason, and these tests keep the guarantee from being edited away.

const fs = require('fs');
const path = require('path');

const { TRAINER_PARTY_CAPACITY, readCapacity } = require('../../layout.js');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const TRAINERPROC = path.join(ROOT, 'tools', 'trainerproc', 'main.c');
const PARTY_FILES = [
    path.join(ROOT, 'src', 'data', 'trainers.party'),
    path.join(ROOT, 'src', 'data', 'battle_partners.party'),
];

// Count the mons in each `=== TRAINER_X ===` block: a mon is a paragraph whose first line is neither a
// trainer-level field (`Key: value` before the first blank line) nor one of the per-mon detail lines.
function partySizes(text) {
    const sizes = {};
    for (const block of text.split(/^=== /m).slice(1)) {
        const [header, ...rest] = block.split('\n');
        const id = header.replace(/\s*===\s*$/, '').trim();
        let mons = 0;
        for (const line of rest) {
            if (!line.trim()) continue;
            if (/^[A-Z][A-Za-z ]*:/.test(line)) continue;     // Name:, Level:, IVs:, Battle Type:, …
            if (/^- /.test(line)) continue;                   // a move
            if (/^\s/.test(line)) continue;                   // continuation
            mons++;                                           // "Species @ Item" line
        }
        sizes[id] = mons;
    }
    return sizes;
}

describe('fixed-capacity trainer parties (T-237)', () => {
    test('trainerproc emits the capacity, never a self-sized party array', () => {
        const source = fs.readFileSync(TRAINERPROC, 'utf8');
        expect(source).toContain('(const struct TrainerMon[TRAINER_PARTY_CAPACITY])');
        expect(source).not.toContain('(const struct TrainerMon[])');
        // both emission sites (with and without an explicit `Party Size:`) must be converted
        expect(source.match(/\(const struct TrainerMon\[TRAINER_PARTY_CAPACITY\]\)/g)).toHaveLength(2);
    });

    // trainer_rules.mk generates FOUR party headers (trainers.h, battle_partners.h, debug_trainers.h,
    // test/battle/trainer_control.h). Each is #included into a .c that must see TRAINER_PARTY_CAPACITY —
    // missing one only shows up as a compile error on the build box (that is how debug.c was caught).
    test('every .c that includes a generated party file can see the constant', () => {
        const includers = ['src/data.c', 'src/battle_tower.c', 'src/debug.c', 'test/battle/trainer_control.c'];
        const missing = includers.filter((file) =>
            !fs.readFileSync(path.join(ROOT, file), 'utf8').includes('#include "constants/randomizer_layout.h"'));
        expect(missing).toEqual([]);
    });

    test('the list above covers every generated party header', () => {
        const rules = fs.readFileSync(path.join(ROOT, 'trainer_rules.mk'), 'utf8');
        const generated = [...rules.matchAll(/^AUTO_GEN_TARGETS \+= (\S+\.h)$/gm)].map((m) => m[1]);
        expect(generated).toHaveLength(4);   // adding a fifth means adding its includer above
    });

    test('capacity is at least a full party (PARTY_SIZE)', () => {
        const global = fs.readFileSync(path.join(ROOT, 'include', 'constants', 'global.h'), 'utf8');
        const partySize = Number(global.match(/^#define PARTY_SIZE (\d+)/m)[1]);
        expect(TRAINER_PARTY_CAPACITY).toBe(readCapacity('TRAINER_PARTY_CAPACITY'));
        expect(TRAINER_PARTY_CAPACITY).toBeGreaterThanOrEqual(partySize);
    });

    test('no party in the committed base exceeds the capacity', () => {
        const over = [];
        for (const file of PARTY_FILES) {
            const sizes = partySizes(fs.readFileSync(file, 'utf8'));
            for (const [id, n] of Object.entries(sizes)) {
                if (n > TRAINER_PARTY_CAPACITY) over.push(`${id} (${n})`);
            }
        }
        expect(over).toEqual([]);
    });
});
