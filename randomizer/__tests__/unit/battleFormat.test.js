'use strict';

// TDD: written BEFORE randomizer/battleFormat.js. Covers ADR-014's battle-format pool taxonomy
// and per-trainer battle-type assignment (T-086). Determinism uses an isolated PRNG seeded from the
// run seed, so it never perturbs the global rng stream.

const {
    assignBattleTypes, poolOf, isEligible, TATE_AND_LIZA_ID,
} = require('../../battleFormat');

const T = (id, isBoss, teamSize = 6) => ({ id, isBoss, teamSize });

const E4 = ['TRAINER_SIDNEY', 'TRAINER_PHOEBE', 'TRAINER_GLACIA', 'TRAINER_DRAKE'];
const GYMS = ['TRAINER_ROXANNE_1', 'TRAINER_BRAWLY_1', 'TRAINER_WATTSON_1', 'TRAINER_FLANNERY_1',
    'TRAINER_NORMAN_1', 'TRAINER_WINONA_1', 'TRAINER_TATE_AND_LIZA_1', 'TRAINER_JUAN_1'];

const countDoubles = (assignments, ids) => ids.filter(id => assignments.get(id) === 'doubles').length;

describe('battleFormat pools (ADR-014)', () => {
    test('poolOf classifies champion / e4 / gyms / boss / normal / excluded', () => {
        expect(poolOf(T('TRAINER_CHAMPION_STEVEN', true))).toBe('champion');
        expect(poolOf(T('TRAINER_SIDNEY', true))).toBe('e4');
        expect(poolOf(T('TRAINER_ROXANNE_1', true))).toBe('gymBosses');
        expect(poolOf(T('TRAINER_TATE_AND_LIZA_1', true))).toBe('gymBosses');
        expect(poolOf(T('TRAINER_MAXIE_MT_CHIMNEY', true))).toBe('bossTrainers');
        expect(poolOf(T('TRAINER_YOUNGSTER_JOEY', false))).toBe('normalTrainers');
        expect(poolOf(T('TRAINER_MAXIE_MOSSDEEP', true))).toBe('excluded');
        expect(poolOf(T('TRAINER_TABITHA_MOSSDEEP', true))).toBe('excluded');
    });

    test('isEligible requires teamSize>=2 and not excluded', () => {
        expect(isEligible(T('TRAINER_X', false, 2))).toBe(true);
        expect(isEligible(T('TRAINER_X', false, 1))).toBe(false);
        expect(isEligible(T('TRAINER_MAXIE_MOSSDEEP', true, 6))).toBe(false);
    });
});

describe('assignBattleTypes — pure formats', () => {
    const roster = [
        T('TRAINER_CHAMPION_STEVEN', true), ...E4.map(id => T(id, true)), ...GYMS.map(id => T(id, true)),
        T('TRAINER_GRUNT_A', false, 3), T('TRAINER_SOLO', false, 1),
        T('TRAINER_MAXIE_MOSSDEEP', true), T('TRAINER_TABITHA_MOSSDEEP', true),
    ];

    test('singles → everyone singles', () => {
        const { assignments } = assignBattleTypes(roster, { battleFormat: 'singles' });
        for (const t of roster) expect(assignments.get(t.id)).toBe('singles');
    });

    test('doubles → all eligible doubles; <2-team and excluded stay singles', () => {
        const { assignments } = assignBattleTypes(roster, { battleFormat: 'doubles' });
        expect(assignments.get('TRAINER_CHAMPION_STEVEN')).toBe('doubles');
        expect(assignments.get('TRAINER_GRUNT_A')).toBe('doubles');
        expect(assignments.get('TRAINER_SOLO')).toBe('singles');           // teamSize 1
        expect(assignments.get('TRAINER_MAXIE_MOSSDEEP')).toBe('singles'); // excluded tag battle
        expect(assignments.get('TRAINER_TABITHA_MOSSDEEP')).toBe('singles');
    });
});

describe('assignBattleTypes — mixed proportions', () => {
    const e4 = E4.map(id => T(id, true));

    test('E4 pool of 4 at 50% → 2 doubles / 2 singles', () => {
        const { assignments } = assignBattleTypes(e4, { battleFormat: 'mixed', singlesPercent: 50, seed: 1 });
        expect(countDoubles(assignments, E4)).toBe(2);
    });

    test('E4 at 100% singles → 0 doubles; at 0% → 4 doubles', () => {
        expect(countDoubles(assignBattleTypes(e4, { battleFormat: 'mixed', singlesPercent: 100, seed: 1 }).assignments, E4)).toBe(0);
        expect(countDoubles(assignBattleTypes(e4, { battleFormat: 'mixed', singlesPercent: 0, seed: 1 }).assignments, E4)).toBe(4);
    });

    test('champion majority: 60→singles, 40→doubles, 50→stable coin-flip', () => {
        const champ = [T('TRAINER_CHAMPION_STEVEN', true)];
        const get = (pct, seed) => assignBattleTypes(champ, { battleFormat: 'mixed', singlesPercent: pct, seed }).assignments.get('TRAINER_CHAMPION_STEVEN');
        expect(get(60, 1)).toBe('singles');
        expect(get(40, 1)).toBe('doubles');
        const a = get(50, 7), b = get(50, 7);
        expect(['singles', 'doubles']).toContain(a);
        expect(a).toBe(b); // deterministic coin-flip
    });

    test('Tate & Liza take the first gym doubles slot; single only at 100%', () => {
        const gyms = GYMS.map(id => T(id, true));
        const at90 = assignBattleTypes(gyms, { battleFormat: 'mixed', singlesPercent: 90, seed: 1 }).assignments;
        expect(at90.get(TATE_AND_LIZA_ID)).toBe('doubles');   // doublesCount = 8-round(7.2)=1 → only T&L
        expect(countDoubles(at90, GYMS)).toBe(1);
        const at100 = assignBattleTypes(gyms, { battleFormat: 'mixed', singlesPercent: 100, seed: 1 }).assignments;
        expect(at100.get(TATE_AND_LIZA_ID)).toBe('singles');  // 0 doubles budget
        expect(countDoubles(at100, GYMS)).toBe(0);
        const at60 = assignBattleTypes(gyms, { battleFormat: 'mixed', singlesPercent: 60, seed: 1 }).assignments;
        expect(at60.get(TATE_AND_LIZA_ID)).toBe('doubles');   // doublesCount = 8-round(4.8)=3
        expect(countDoubles(at60, GYMS)).toBe(3);
    });

    test('deterministic under seed; <2-team never doubles in mixed', () => {
        const roster = [...E4.map(id => T(id, true)), T('TRAINER_SOLO', false, 1), T('TRAINER_G', false, 4)];
        const r1 = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: 50, seed: 99 }).assignments;
        const r2 = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: 50, seed: 99 }).assignments;
        for (const t of roster) expect(r1.get(t.id)).toBe(r2.get(t.id));
        expect(r1.get('TRAINER_SOLO')).toBe('singles');
    });
});
