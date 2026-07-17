'use strict';

// TDD: written BEFORE randomizer/battleFormat.js. Covers ADR-014's battle-format pool taxonomy
// and per-trainer battle-type assignment (T-086). Determinism uses an isolated PRNG seeded from the
// run seed, so it never perturbs the global rng stream.

const {
    assignBattleTypes, poolOf, isEligible, TATE_AND_LIZA_ID, runAndBunE4Split, unifyRivalBattleTypes,
    gauntletTagOf,
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
        expect(poolOf(T('TRAINER_SIDNEY_DOUBLES', true))).toBe('e4Doubles');   // Run & Bun clone
        expect(poolOf(T('TRAINER_MAXIE_MT_CHIMNEY', true))).toBe('bossTrainers');
        expect(poolOf(T('TRAINER_YOUNGSTER_JOEY', false))).toBe('normalTrainers');
        expect(poolOf(T('TRAINER_MAXIE_MOSSDEEP', true))).toBe('tag');
        expect(poolOf(T('TRAINER_TABITHA_MOSSDEEP', true))).toBe('tag');
        expect(poolOf(T('PARTNER_STEVEN', false))).toBe('tag');   // Space Center ally half
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

    test('singles → everyone singles, except the tag-battle trio', () => {
        const { assignments } = assignBattleTypes(roster, { battleFormat: 'singles' });
        for (const t of roster) {
            const expected = ['TRAINER_MAXIE_MOSSDEEP', 'TRAINER_TABITHA_MOSSDEEP'].includes(t.id) ? 'tag' : 'singles';
            expect(assignments.get(t.id)).toBe(expected);
        }
    });

    test('doubles → all eligible doubles; <2-team singles; tag trio stays tag', () => {
        const { assignments } = assignBattleTypes(roster, { battleFormat: 'doubles' });
        expect(assignments.get('TRAINER_CHAMPION_STEVEN')).toBe('doubles');
        expect(assignments.get('TRAINER_GRUNT_A')).toBe('doubles');
        expect(assignments.get('TRAINER_SOLO')).toBe('singles');        // teamSize 1
        expect(assignments.get('TRAINER_MAXIE_MOSSDEEP')).toBe('tag');  // tag battle, never converted
        expect(assignments.get('TRAINER_TABITHA_MOSSDEEP')).toBe('tag');
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

// T-145 (ADR-018 §1) — grunt gauntlets: the 2 Museum grunts + the 3 Space Center grunts each count as ONE
// unit in the bossTrainers proportion and share one singles/doubles type; all carry a "Gauntlet Battle N" tag.
describe('assignBattleTypes — grunt gauntlets (T-145)', () => {
    const MUSEUM = ['TRAINER_GRUNT_MUSEUM_1', 'TRAINER_GRUNT_MUSEUM_2'];
    const SPACE = ['TRAINER_GRUNT_SPACE_CENTER_5', 'TRAINER_GRUNT_SPACE_CENTER_6', 'TRAINER_GRUNT_SPACE_CENTER_7'];

    test('gauntletTagOf maps every member to its gauntlet tag (null otherwise)', () => {
        expect(gauntletTagOf('TRAINER_GRUNT_MUSEUM_1')).toBe('Gauntlet Battle 1');
        expect(gauntletTagOf('TRAINER_GRUNT_MUSEUM_2')).toBe('Gauntlet Battle 1');
        expect(gauntletTagOf('TRAINER_GRUNT_SPACE_CENTER_5')).toBe('Gauntlet Battle 2');
        expect(gauntletTagOf('TRAINER_GRUNT_SPACE_CENTER_7')).toBe('Gauntlet Battle 2');
        expect(gauntletTagOf('TRAINER_ROXANNE_1')).toBe(null);
    });

    test('gauntlet members share one type in mixed (grunt 1 singles ⟹ grunt 2 singles), at every %', () => {
        const roster = [...MUSEUM, ...SPACE, 'TRAINER_BOSS_A', 'TRAINER_BOSS_B'].map(id => T(id, true));
        for (const pct of [0, 30, 50, 60, 100]) {
            const { assignments } = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: pct, seed: 5 });
            expect(assignments.get(MUSEUM[0])).toBe(assignments.get(MUSEUM[1]));
            expect(assignments.get(SPACE[0])).toBe(assignments.get(SPACE[1]));
            expect(assignments.get(SPACE[1])).toBe(assignments.get(SPACE[2]));
        }
    });

    test('each gauntlet counts as ONE unit in the bossTrainers proportion', () => {
        // 4 boss units: {Museum}, {Space}, BOSS_A, BOSS_B. 50% → round(0.5×4)=2 singles units, 2 doubles units.
        const roster = [...MUSEUM, ...SPACE, 'TRAINER_BOSS_A', 'TRAINER_BOSS_B'].map(id => T(id, true));
        const { assignments } = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: 50, seed: 5 });
        const unitDoubles = [MUSEUM[0], SPACE[0], 'TRAINER_BOSS_A', 'TRAINER_BOSS_B']
            .filter(id => assignments.get(id) === 'doubles').length;
        expect(unitDoubles).toBe(2);
    });

    test('gauntlets at 0% singles → all members doubles; at 100% → all members singles', () => {
        const roster = [...MUSEUM, ...SPACE].map(id => T(id, true));
        const d = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: 0, seed: 5 }).assignments;
        for (const id of [...MUSEUM, ...SPACE]) expect(d.get(id)).toBe('doubles');
        const s = assignBattleTypes(roster, { battleFormat: 'mixed', singlesPercent: 100, seed: 5 }).assignments;
        for (const id of [...MUSEUM, ...SPACE]) expect(s.get(id)).toBe('singles');
    });
});

// T-146 (ADR-018 §2) — mixed SEQUENTIAL split: first part of the game singles, the rest doubles. The
// breakpoint is the boss milestone at round(%×numBosses); before it → singles, it + after → doubles.
describe('assignBattleTypes — mixed sequential split (T-146)', () => {
    const TO = (id, isBoss, displayOrder, teamSize = 6) => ({ id, isBoss, teamSize, displayOrder });
    const seq = (roster, pct, extra = {}) => assignBattleTypes(roster,
        { battleFormat: 'mixed', mixedSequentialSplit: true, singlesPercent: pct, seed: 1, ...extra }).assignments;

    test('splits at the boss at round(%×numBosses); before→singles, breakpoint boss + after→doubles', () => {
        // 5 boss milestones (4 gyms + champion) + 3 normals. 60% → singlesCount=round(3)=3 → breakpoint =
        // milestones[3] = Flannery (order 40). Champion (order 100) is doubles → proves it follows POSITION,
        // not the ADR-014 majority rule (which at 60% singles would make the champion singles).
        const roster = [
            TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_N1', false, 15),
            TO('TRAINER_BRAWLY_1', true, 20), TO('TRAINER_WATTSON_1', true, 30),
            TO('TRAINER_N2', false, 35), TO('TRAINER_FLANNERY_1', true, 40),
            TO('TRAINER_N3', false, 90), TO('TRAINER_CHAMPION_STEVEN', true, 100),
        ];
        const a = seq(roster, 60);
        for (const id of ['TRAINER_ROXANNE_1', 'TRAINER_N1', 'TRAINER_BRAWLY_1', 'TRAINER_WATTSON_1', 'TRAINER_N2']) {
            expect(a.get(id)).toBe('singles');
        }
        for (const id of ['TRAINER_FLANNERY_1', 'TRAINER_N3', 'TRAINER_CHAMPION_STEVEN']) {
            expect(a.get(id)).toBe('doubles');
        }
    });

    test('100% singles → everyone singles; 0% singles → everyone doubles', () => {
        const roster = [TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_N1', false, 15), TO('TRAINER_CHAMPION_STEVEN', true, 100)];
        const all1 = seq(roster, 100); for (const t of roster) expect(all1.get(t.id)).toBe('singles');
        const all0 = seq(roster, 0); for (const t of roster) expect(all0.get(t.id)).toBe('doubles');
    });

    test('Tate & Liza is NOT forced to doubles — it follows its position', () => {
        // 5 milestones; 80% → singlesCount=round(4.0)=4 → breakpoint = milestones[4] = Champion (100).
        // T&L (order 20) < 100 → singles. The proportional mode would instead force T&L into the first doubles slot.
        const roster = [
            TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_TATE_AND_LIZA_1', true, 20),
            TO('TRAINER_WINONA_1', true, 30), TO('TRAINER_JUAN_1', true, 40), TO('TRAINER_CHAMPION_STEVEN', true, 100),
        ];
        expect(seq(roster, 80).get('TRAINER_TATE_AND_LIZA_1')).toBe('singles');
    });

    test('Run & Bun: base E4 singles + _DOUBLES clones doubles; E4 excluded from the boss count', () => {
        const E4o = E4.map((id, i) => TO(id, true, 50 + i));
        const E4d = E4.map((id, i) => TO(`${id}_DOUBLES`, true, 50 + i));
        const roster = [
            TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_BRAWLY_1', true, 20),
            ...E4o, ...E4d, TO('TRAINER_CHAMPION_STEVEN', true, 100),
        ];
        const a = seq(roster, 50, { leagueRunAndBun: true });
        for (const id of E4) expect(a.get(id)).toBe('singles');
        for (const id of E4.map(x => `${x}_DOUBLES`)) expect(a.get(id)).toBe('doubles');
        // numBosses excl. E4 = Roxanne, Brawly, Champion = 3. singlesCount=round(1.5)=2 → breakpoint = Champion(100).
        expect(a.get('TRAINER_ROXANNE_1')).toBe('singles');
        expect(a.get('TRAINER_BRAWLY_1')).toBe('singles');
        expect(a.get('TRAINER_CHAMPION_STEVEN')).toBe('doubles');
    });

    test('a <2-mon trainer past the breakpoint is still forced singles (eligibility gate)', () => {
        const roster = [TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_SOLO', false, 90, 1), TO('TRAINER_CHAMPION_STEVEN', true, 100)];
        const a = seq(roster, 0); // 0% → everyone doubles-eligible goes doubles
        expect(a.get('TRAINER_SOLO')).toBe('singles'); // teamSize 1 → never doubles
        expect(a.get('TRAINER_CHAMPION_STEVEN')).toBe('doubles');
    });

    test('the Mossdeep tag trio stays tag in sequential mode', () => {
        const roster = [TO('TRAINER_ROXANNE_1', true, 10), TO('TRAINER_MAXIE_MOSSDEEP', true, 80), TO('TRAINER_CHAMPION_STEVEN', true, 100)];
        expect(seq(roster, 50).get('TRAINER_MAXIE_MOSSDEEP')).toBe('tag');
    });
});

describe('runAndBunE4Split (ADR-014 clamp 1–3)', () => {
    test('rounds %singles×4 and clamps to 1–3 (always one of each), matching the frontend', () => {
        expect(runAndBunE4Split(50)).toEqual({ singles: 2, doubles: 2 });
        expect(runAndBunE4Split(60)).toEqual({ singles: 2, doubles: 2 });
        expect(runAndBunE4Split(90)).toEqual({ singles: 3, doubles: 1 });
        expect(runAndBunE4Split(100)).toEqual({ singles: 3, doubles: 1 });
        expect(runAndBunE4Split(0)).toEqual({ singles: 1, doubles: 3 });
        expect(runAndBunE4Split(75)).toEqual({ singles: 3, doubles: 1 });
    });
});

describe('assignBattleTypes — Run & Bun (mixed + leagueRunAndBun)', () => {
    const E4_D = E4.map(id => `${id}_DOUBLES`);
    const roster = [
        ...E4.map(id => T(id, true)),
        ...E4_D.map(id => T(id, true)),
        ...GYMS.map(id => T(id, true)),
        T('TRAINER_CHAMPION_STEVEN', true),
    ];

    test('base E4 are singles and the _DOUBLES clones are doubles, at every %', () => {
        for (const pct of [30, 60, 90]) {
            const { assignments } = assignBattleTypes(roster, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: pct, seed: 3 });
            for (const id of E4) expect(assignments.get(id)).toBe('singles');
            for (const id of E4_D) expect(assignments.get(id)).toBe('doubles');
        }
    });

    test('champion still follows the majority in Run & Bun', () => {
        const hi = assignBattleTypes(roster, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 90, seed: 3 }).assignments;
        expect(hi.get('TRAINER_CHAMPION_STEVEN')).toBe('singles');
        const lo = assignBattleTypes(roster, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 10, seed: 3 }).assignments;
        expect(lo.get('TRAINER_CHAMPION_STEVEN')).toBe('doubles');
    });
});

describe('tag battle — the Mossdeep trio (T-116)', () => {
    const trio = [T('TRAINER_MAXIE_MOSSDEEP', true), T('TRAINER_TABITHA_MOSSDEEP', true), T('PARTNER_STEVEN', false)];
    for (const fmt of ['singles', 'doubles']) {
        test(`the trio is 'tag' in ${fmt} format`, () => {
            const { assignments } = assignBattleTypes(trio, { battleFormat: fmt });
            for (const t of trio) expect(assignments.get(t.id)).toBe('tag');
        });
    }
    test("the trio is 'tag' in mixed too", () => {
        const { assignments } = assignBattleTypes(trio, { battleFormat: 'mixed', singlesPercent: 50, seed: 1 });
        for (const t of trio) expect(assignments.get(t.id)).toBe('tag');
    });
});

describe('unifyRivalBattleTypes — rival family consistency (T-116)', () => {
    test("May's starter variants at a location share one battle type", () => {
        const may = [
            { id: 'TRAINER_MAY_ROUTE_103_TREECKO', battleType: 'doubles' },
            { id: 'TRAINER_MAY_ROUTE_103_TORCHIC', battleType: 'singles' },
            { id: 'TRAINER_MAY_ROUTE_103_MUDKIP', battleType: 'singles' },
        ];
        unifyRivalBattleTypes(may);
        expect(new Set(may.map(t => t.battleType)).size).toBe(1);
    });

    test('a copy-linked Brendan variant inherits its May target battle type', () => {
        const list = [
            { id: 'TRAINER_MAY_ROUTE_103_TREECKO', battleType: 'doubles' },
            { id: 'TRAINER_MAY_ROUTE_103_TORCHIC', battleType: 'doubles' },
            { id: 'TRAINER_MAY_ROUTE_103_MUDKIP', battleType: 'doubles' },
            { id: 'TRAINER_BRENDAN_ROUTE_103_TREECKO', battleType: 'singles', copy: 'TRAINER_MAY_ROUTE_103_TREECKO' },
        ];
        unifyRivalBattleTypes(list);
        expect(list.find(t => t.id === 'TRAINER_BRENDAN_ROUTE_103_TREECKO').battleType).toBe('doubles');
    });

    test('does not touch non-rival trainers', () => {
        const list = [{ id: 'TRAINER_ROXANNE_1', battleType: 'doubles' }, { id: 'TRAINER_YOUNGSTER_JOEY', battleType: 'singles' }];
        unifyRivalBattleTypes(list);
        expect(list[0].battleType).toBe('doubles');
        expect(list[1].battleType).toBe('singles');
    });
});
