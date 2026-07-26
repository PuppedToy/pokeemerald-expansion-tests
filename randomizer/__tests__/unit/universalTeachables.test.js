'use strict';

// B-054 / T-207 — "near-universal" moves (sUniversalMoves in the ROM: Hidden Power, Return,
// Frustration, Secret Power, …) are learnable by EVERY species in-game, but make_teachables.py
// deliberately omits them from the per-species teachable arrays. The parser only reads those
// per-species arrays, so the randomizer never knew these moves were universal — they only appeared
// on a mon's teachable list when randomly rolled in from the TM pool (~half the roster per run).
// Fix: parse the sUniversalMoves block and treat those moves (when in the run's TM pool) as base
// teachables for every mon — so they show consistently and are never spuriously "starred".

const rng = require('../../rng');
const { expandAllTeachables } = require('../../teachableExpander');
const { parseUniversalMoves } = require('../../parser');

// ── parser: extract the sUniversalMoves comment block ──────────────────────────
describe('parseUniversalMoves (T-207)', () => {
    const SAMPLE = [
        '//',
        '// *************************************************** //',
        '// Tutor moves found from map scripts:                 //',
        '// - MOVE_MIMIC                                        //',
        '// *************************************************** //',
        '// Near-universal moves found from sUniversalMoves:    //',
        '// - MOVE_BIDE                                         //',
        '// - MOVE_HIDDEN_POWER                                 //',
        '// - MOVE_RETURN                                       //',
        '// *************************************************** //',
        '',
        'static const u16 sNoneTeachableLearnset[] = {',
        '    MOVE_UNAVAILABLE,',
        '};',
    ].join('\n');

    test('extracts only the sUniversalMoves block (not the tutor block)', () => {
        expect(parseUniversalMoves(SAMPLE)).toEqual(['MOVE_BIDE', 'MOVE_HIDDEN_POWER', 'MOVE_RETURN']);
    });

    test('includes MOVE_HIDDEN_POWER from the real teachable_learnsets.h', () => {
        const fs = require('fs');
        const path = require('path');
        const text = fs.readFileSync(
            path.resolve(__dirname, '..', '..', '..', 'src', 'data', 'pokemon', 'teachable_learnsets.h'), 'utf-8');
        expect(parseUniversalMoves(text)).toContain('MOVE_HIDDEN_POWER');
    });
});

// ── behaviour: universal moves are base teachables for every mon ────────────────
describe('expandAllTeachables — universal moves (T-207)', () => {
    function firePoke() {
        return {
            id: 'SPECIES_UTEST', family: 'P_FAMILY_UTEST',
            parsedTypes: ['FIRE'], parsedAbilities: ['BLAZE'],
            evolutionData: { isMega: false, type: 'EVO_TYPE_SOLO', isFinal: true, isLC: false, isNFE: false },
            evolutions: [],
            teachables: [],            // no universal moves in the mon's own learnset
            newTeachables: [], oldTeachables: [],
        };
    }
    // Hidden Power / Return are NORMAL — a different type from this FIRE mon, so pre-fix they only
    // roll in ~35% of the time (and get starred when they do).
    const moves = {
        MOVE_HIDDEN_POWER: { type: 'NORMAL' },
        MOVE_RETURN: { type: 'NORMAL' },
        MOVE_EMBER: { type: 'FIRE' },
    };
    const tmPool = new Set(['MOVE_HIDDEN_POWER', 'MOVE_RETURN', 'MOVE_EMBER']);
    const UNIVERSAL = ['MOVE_HIDDEN_POWER', 'MOVE_RETURN'];

    test('universal moves are present for every mon and every seed, never starred/greyed', () => {
        for (let s = 1; s <= 15; s++) {
            rng.seed(s);
            const p = firePoke();
            expandAllTeachables([p], tmPool, moves, UNIVERSAL);
            for (const u of UNIVERSAL) {
                expect(p.teachables).toContain(u);        // always learnable
                expect(p.newTeachables).not.toContain(u); // not a "new" (starred) move — it's universal
                expect(p.oldTeachables).not.toContain(u); // present this run, so not greyed
            }
        }
    });

    test('a universal move NOT in the run TM pool is not injected', () => {
        rng.seed(1);
        const p = firePoke();
        // MOVE_BIDE is universal in-engine but not a TM in this run → stays out.
        expandAllTeachables([p], tmPool, moves, ['MOVE_HIDDEN_POWER', 'MOVE_BIDE']);
        expect(p.teachables).toContain('MOVE_HIDDEN_POWER');
        expect(p.teachables).not.toContain('MOVE_BIDE');
    });
});
