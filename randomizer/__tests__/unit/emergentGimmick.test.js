'use strict';

// B-035 — emergent Trick Room must fire only for a genuinely slow-OFFENSIVE team, not merely because two
// slow bodies exist and some member can learn the TR TM ("can-learn ⇒ build TR", which the owner rejects —
// ~half the dex teaches the TR TM). The seeded path (Tate & Liza) is separate and unaffected.

const { emergentGimmick } = require('../../modules/gimmickPlan');

const mon = (baseSpeed, offense, learnsTR = false) => ({
    pokemon: {
        id: 'SPECIES_X', parsedAbilities: ['RUN_AWAY'], parsedTypes: ['NORMAL'],
        baseHP: 90, baseAttack: offense, baseDefense: 90, baseSpAttack: 50, baseSpDefense: 90, baseSpeed,
        learnset: [], teachables: learnsTR ? ['MOVE_TRICK_ROOM'] : [],
    },
    ability: 'RUN_AWAY', moves: [],
});

const OPTS = { committedSeed: null, abusePartner: false, soph: 1 };

describe('B-035 — emergent Trick Room requires a genuinely slow-offensive core', () => {
    test('two SLOW-WEAK bodies + a TR-learner does NOT trigger emergent TR', () => {
        // Slow (≤60) but weak (offense 60) — walls, not TR abusers; one member can teach the TR TM.
        const team = [mon(40, 60), mon(45, 60), mon(50, 55, true), mon(110, 120), mon(105, 120), mon(100, 110)];
        const g = emergentGimmick({ ...OPTS, team });
        expect(g && g.gimmick).not.toBe('trick_room');
    });

    test('a genuine slow-STRONG core (≥3 slow hard-hitters) still triggers emergent TR', () => {
        const team = [mon(40, 120, true), mon(45, 125), mon(50, 130), mon(110, 100), mon(105, 90), mon(100, 80)];
        const g = emergentGimmick({ ...OPTS, team });
        expect(g && g.gimmick).toBe('trick_room');
        expect(g.roomStyle).toBe('half');
    });

    test('a fast team never triggers emergent TR', () => {
        const team = [mon(110, 120, true), mon(105, 120), mon(100, 110), mon(120, 100), mon(115, 90), mon(130, 80)];
        const g = emergentGimmick({ ...OPTS, team });
        expect(g && g.gimmick).not.toBe('trick_room');
    });
});
