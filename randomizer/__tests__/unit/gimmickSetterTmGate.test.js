'use strict';

// B-036 / B-030 — the gimmick MOVE-setter retrofits must NOT fabricate a TM the trainer doesn't hold. A
// setter move (Trick Room / Electric Terrain — both TMs) may be injected only if the mon reaches it by
// level-up OR the trainer HOLDS its TM. (Brice lvl 32 got a Munchlax with Trick Room before the TR TM is
// obtainable at Nolan lvl 36 — this locks that down.)

const { ensureTrickRoomSetter, ensureElectricTerrainSetter } = require('../../modules/gimmickPlan');

// A fast (non-abuser) mon that can only TEACH the setter move (teachable, not level-up).
const teachableOnly = (move) => () => ([{
    pokemon: {
        id: 'SPECIES_X', parsedAbilities: ['RUN_AWAY'], parsedTypes: ['NORMAL'],
        baseHP: 90, baseAttack: 90, baseDefense: 90, baseSpAttack: 60, baseSpDefense: 90, baseSpeed: 90,
        learnset: [{ level: '1', move: 'MOVE_TACKLE' }], teachables: [move],
    },
    ability: 'RUN_AWAY', moves: ['MOVE_TACKLE', 'MOVE_BODY_SLAM', 'MOVE_REST', 'MOVE_YAWN'],
}]);

// A mon that learns the setter move by LEVEL-UP (needs no TM).
const levelUp = (move) => () => ([{
    pokemon: {
        id: 'SPECIES_Y', parsedAbilities: ['RUN_AWAY'], parsedTypes: ['NORMAL'],
        baseHP: 90, baseAttack: 90, baseDefense: 90, baseSpAttack: 60, baseSpDefense: 90, baseSpeed: 90,
        learnset: [{ level: '1', move }], teachables: [],
    },
    ability: 'RUN_AWAY', moves: ['MOVE_TACKLE', 'MOVE_BODY_SLAM', 'MOVE_REST', 'MOVE_YAWN'],
}]);

describe('B-036 — Trick Room retrofit respects the TM bag', () => {
    test('does NOT inject Trick Room when the trainer lacks the TM (teachable-only mon)', () => {
        const team = teachableOnly('MOVE_TRICK_ROOM')();
        expect(ensureTrickRoomSetter(team, 1, { tms: [], level: 50 })).toBe(false);
        expect(team[0].moves).not.toContain('MOVE_TRICK_ROOM');
    });
    test('DOES inject Trick Room when the trainer holds the TM', () => {
        const team = teachableOnly('MOVE_TRICK_ROOM')();
        expect(ensureTrickRoomSetter(team, 1, { tms: ['MOVE_TRICK_ROOM'], level: 50 })).toBe(true);
        expect(team[0].moves).toContain('MOVE_TRICK_ROOM');
    });
    test('a level-up learner gets Trick Room with no TM (level-up needs no TM)', () => {
        const team = levelUp('MOVE_TRICK_ROOM')();
        expect(ensureTrickRoomSetter(team, 1, { tms: [], level: 50 })).toBe(true);
        expect(team[0].moves).toContain('MOVE_TRICK_ROOM');
    });
});

describe('B-036 — Electric Terrain retrofit respects the TM bag', () => {
    test('does NOT inject Electric Terrain without the TM', () => {
        const team = teachableOnly('MOVE_ELECTRIC_TERRAIN')();
        expect(ensureElectricTerrainSetter(team, 1, { tms: [], level: 50 })).toBe(false);
        expect(team[0].moves).not.toContain('MOVE_ELECTRIC_TERRAIN');
    });
    test('DOES inject Electric Terrain when the trainer holds the TM', () => {
        const team = teachableOnly('MOVE_ELECTRIC_TERRAIN')();
        expect(ensureElectricTerrainSetter(team, 1, { tms: ['MOVE_ELECTRIC_TERRAIN'], level: 50 })).toBe(true);
        expect(team[0].moves).toContain('MOVE_ELECTRIC_TERRAIN');
    });
});
