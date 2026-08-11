'use strict';

// T-269 — the world's progression spine: which wild-encounter maps and which encounter methods the
// player has reached by each boss milestone. The table is world design, so these tests are its
// guards: it must stay in lock-step with caps.c's milestone order and with wild.js's map list, and
// the pools it derives must match the owner's per-trader specification.

const fs = require('fs');
const path = require('path');

const {
    PROGRESSION,
    STATIC_MAPS,
    milestoneOrder,
    mapsAvailableAt,
    methodsAvailableAt,
    encounterPoolAt,
    tmLocationMilestone,
    tmNumbersAvailableAt,
    tmMovesAvailableAt,
    ALL_METHODS,
} = require('../../data/progression');
const { parseLevelCaps } = require('../../bossCaps');
const { parseTmLocations } = require('../../tmLocations');
const wildData = require('../../wild');

const tmLocations = parseTmLocations(
    fs.readFileSync(path.resolve(__dirname, '..', '..', 'docs', 'tms.md'), 'utf-8'));

const capsOrder = parseLevelCaps(fs.readFileSync(path.resolve(__dirname, '..', '..', '..', 'src', 'caps.c'), 'utf-8'));
const capLevel = (flag) => (capsOrder.find(c => c.flag === flag) || {}).level;

describe('progression — the milestone spine', () => {
    test('lists exactly the caps.c milestones, in the same order', () => {
        expect(PROGRESSION.map(p => p.flag)).toEqual(capsOrder.map(c => c.flag));
    });

    test('milestoneOrder follows the table and rejects an unknown flag', () => {
        expect(milestoneOrder('FLAG_DEFEATED_RIVAL_ROUTE103')).toBe(0);
        expect(milestoneOrder('FLAG_BADGE01_GET')).toBeGreaterThan(milestoneOrder('FLAG_DEFEATED_AQUA_WOODS'));
        expect(() => milestoneOrder('FLAG_NOT_A_MILESTONE')).toThrow(/FLAG_NOT_A_MILESTONE/);
    });
});

describe('progression — every wild map is classified exactly once', () => {
    const classified = [...PROGRESSION.flatMap(p => p.maps), ...STATIC_MAPS];

    test('no map is classified twice', () => {
        const dupes = classified.filter((m, i) => classified.indexOf(m) !== i);
        expect(dupes).toEqual([]);
    });

    test('every wild.js encounter map has a milestone (or is a declared static)', () => {
        const missing = wildData.maps.map(m => m.id).filter(id => !classified.includes(id));
        expect(missing).toEqual([]);
    });

    test('no classified map is absent from wild.js', () => {
        const known = new Set(wildData.maps.map(m => m.id));
        expect(classified.filter(id => !known.has(id))).toEqual([]);
    });

    test('a declared static contributes no catchable method', () => {
        for (const id of STATIC_MAPS) {
            const map = wildData.maps.find(m => m.id === id);
            expect(ALL_METHODS.filter(k => map[k])).toEqual([]);
        }
    });

    test("a map's encounter level never exceeds the cap of the milestone that opens it", () => {
        for (const step of PROGRESSION) {
            for (const id of step.maps) {
                const level = (wildData.maps.find(m => m.id === id) || {}).level;
                if (!Number.isFinite(level)) continue;   // most maps take the default band
                expect({ id, level, cap: capLevel(step.flag) })
                    .toEqual({ id, level, cap: expect.any(Number) });
                expect(level).toBeLessThanOrEqual(capLevel(step.flag));
            }
        }
    });
});

describe('progression — method unlocks', () => {
    test('land and the old rod are available from the first milestone', () => {
        expect(methodsAvailableAt('FLAG_DEFEATED_RIVAL_ROUTE103')).toEqual(['land', 'old']);
    });

    test('the good rod enters at Flannery, Surf at Winona, the super rod at Tate & Liza', () => {
        expect(methodsAvailableAt('FLAG_BADGE03_GET')).toEqual(['land', 'old']);
        expect(methodsAvailableAt('FLAG_BADGE04_GET')).toEqual(['land', 'old', 'good']);
        expect(methodsAvailableAt('FLAG_BADGE05_GET')).toEqual(['land', 'old', 'good']);
        expect(methodsAvailableAt('FLAG_BADGE06_GET')).toEqual(['land', 'old', 'good', 'surf']);
        expect(methodsAvailableAt('FLAG_BADGE07_GET')).toEqual(['land', 'old', 'good', 'surf', 'super']);
    });

    test('every unlocked method is one wild.js knows', () => {
        const unlocked = PROGRESSION.flatMap(p => p.unlocksMethods || []);
        expect(unlocked.filter(m => !ALL_METHODS.includes(m))).toEqual([]);
    });
});

describe('progression — the pools the owner specified per trader', () => {
    test('Roxanne: routes 101-104, Petalburg Woods and Route 115 — Route 116 not yet', () => {
        expect(mapsAvailableAt('FLAG_BADGE01_GET')).toEqual([
            'MAP_ROUTE101', 'MAP_ROUTE102', 'MAP_ROUTE103', 'MAP_ROUTE104', 'MAP_PETALBURG_WOODS', 'MAP_ROUTE115',
        ]);
    });

    test('Brawly: adds Route 116 and Route 106', () => {
        const added = mapsAvailableAt('FLAG_BADGE02_GET').filter(m => !mapsAvailableAt('FLAG_BADGE01_GET').includes(m));
        expect(added).toEqual(['MAP_ROUTE116', 'MAP_ROUTE106']);
    });

    test('the museum grunts: adds Granite Cave and Route 109', () => {
        const added = mapsAvailableAt('FLAG_DELIVERED_DEVON_GOODS').filter(m => !mapsAvailableAt('FLAG_BADGE02_GET').includes(m));
        expect(added).toEqual(['MAP_GRANITE_CAVE', 'MAP_ROUTE109']);
    });

    test('Wally in Mauville: Route 110 is in, the Verdanturf/Mauville routes are not', () => {
        const pool = mapsAvailableAt('FLAG_DEFEATED_WALLY_MAUVILLE');
        expect(pool).toContain('MAP_ROUTE110');
        expect(pool).not.toContain('MAP_ROUTE117');
        expect(pool).not.toContain('MAP_ROUTE118');
    });

    test('Wattson: adds routes 117 and 118', () => {
        const added = mapsAvailableAt('FLAG_BADGE03_GET').filter(m => !mapsAvailableAt('FLAG_DEFEATED_WALLY_MAUVILLE').includes(m));
        expect(added).toEqual(['MAP_ROUTE117', 'MAP_ROUTE118']);
    });

    test('Flannery: the Mt Chimney block and the Fallarbor routes are in, Route 119 is not', () => {
        const pool = mapsAvailableAt('FLAG_BADGE04_GET');
        for (const id of ['MAP_ROUTE112', 'MAP_JAGGED_PASS', 'MAP_ROUTE113', 'MAP_ROUTE111', 'MAP_ROUTE114']) {
            expect(pool).toContain(id);
        }
        expect(pool).not.toContain('MAP_ROUTE119');
    });

    test('Norman adds nothing new — Route 119 waits for the Weather Institute', () => {
        expect(mapsAvailableAt('FLAG_BADGE05_GET')).toEqual(mapsAvailableAt('FLAG_BADGE04_GET'));
        expect(mapsAvailableAt('FLAG_DEFEATED_SHELLY_WEATHER_INST')).toContain('MAP_ROUTE119');
    });

    test('Winona: adds Route 120 and Scorched Slab (Jagged Pass already in)', () => {
        const added = mapsAvailableAt('FLAG_BADGE06_GET').filter(m => !mapsAvailableAt('FLAG_BADGE05_GET').includes(m));
        expect(added).toEqual(['MAP_ROUTE119', 'MAP_ROUTE120', 'MAP_SCORCHED_SLAB']);
        expect(mapsAvailableAt('FLAG_BADGE06_GET')).toContain('MAP_JAGGED_PASS');
    });

    test('Wally in Lilycove: adds Route 121', () => {
        const added = mapsAvailableAt('FLAG_MET_RIVAL_LILYCOVE').filter(m => !mapsAvailableAt('FLAG_BADGE06_GET').includes(m));
        expect(added).toEqual(['MAP_ROUTE121']);
    });

    test('Tate & Liza: adds Mt Pyre, Route 122 and Route 124', () => {
        const added = mapsAvailableAt('FLAG_BADGE07_GET').filter(m => !mapsAvailableAt('FLAG_MET_RIVAL_LILYCOVE').includes(m));
        expect(added).toEqual(['MAP_ROUTE122', 'MAP_MT_PYRE_EXTERIOR', 'MAP_ROUTE124']);
    });

    test('Archie: the whole Pacifidlog stretch is in', () => {
        const pool = mapsAvailableAt('FLAG_KYOGRE_ESCAPED_SEAFLOOR_CAVERN');
        for (const id of ['MAP_ROUTE125', 'MAP_SHOAL_CAVE_LOW_TIDE_ENTRANCE_ROOM', 'MAP_ROUTE123',
            'MAP_ROUTE126', 'MAP_ROUTE127', 'MAP_ROUTE128', 'MAP_ROUTE131', 'MAP_PACIFIDLOG_TOWN', 'MAP_ROUTE132']) {
            expect(pool).toContain(id);
        }
        expect(pool).not.toContain('EVER_GRANDE_CITY');
    });

    test('Wally in Victory Road: Ever Grande is in, Victory Road B1F is only for the League', () => {
        expect(mapsAvailableAt('FLAG_DEFEATED_WALLY_VICTORY_ROAD')).toContain('EVER_GRANDE_CITY');
        expect(mapsAvailableAt('FLAG_DEFEATED_WALLY_VICTORY_ROAD')).not.toContain('MAP_VICTORY_ROAD_B1F');
        expect(mapsAvailableAt('FLAG_IS_CHAMPION')).toContain('MAP_VICTORY_ROAD_B1F');
    });

    test('the champion sees every non-static map', () => {
        const statics = new Set(STATIC_MAPS);
        const expected = wildData.maps.map(m => m.id).filter(id => !statics.has(id));
        expect([...mapsAvailableAt('FLAG_IS_CHAMPION')].sort()).toEqual(expected.sort());
    });
});

describe('TM reachability — from the docs table\'s Location column', () => {
    test('every row of the real TM table resolves to a milestone', () => {
        expect(Object.keys(tmLocations).length).toBe(95);
        const unresolved = [];
        for (const [n, loc] of Object.entries(tmLocations)) {
            try { tmLocationMilestone(loc); } catch (e) { unresolved.push(`TM${n}: ${loc}`); }
        }
        expect(unresolved).toEqual([]);
    });

    test('a gym reward resolves to its badge, a pick to its route', () => {
        expect(tmLocationMilestone('Gym reward — Roxanne (badge 1)')).toBe('FLAG_BADGE01_GET');
        expect(tmLocationMilestone('Gym reward — Wallace/Juan (badge 8)')).toBe('FLAG_BADGE08_GET');
        expect(tmLocationMilestone('Pick — Route 116 Clark pick (1 of 3)')).toBe('FLAG_RECOVERED_DEVON_GOODS');
        expect(tmLocationMilestone('Scripted — Rival Route 103 (defeat reward)')).toBe('FLAG_DEFEATED_RIVAL_ROUTE103');
        expect(tmLocationMilestone('Scripted — Granite Cave (Steven gives it)')).toBe('FLAG_DELIVERED_STEVEN_LETTER');
    });

    test('an unclassified location is a loud error, not an empty pool', () => {
        expect(() => tmLocationMilestone('Item — Some New Cave')).toThrow(/not classified/);
    });

    test("Roxanne's pool is her badge TM, the Route 104 picks and the Route 103 rival TM", () => {
        // Exactly what trainers.js's roxanneBag() holds — derived, not restated.
        expect(tmNumbersAvailableAt('FLAG_BADGE01_GET', tmLocations)).toEqual([1, 5, 6, 7, 8, 9, 10, 71]);
    });

    test("Brawly adds the Route 106 picks, his badge TM and Route 116's pick", () => {
        const added = tmNumbersAvailableAt('FLAG_BADGE02_GET', tmLocations)
            .filter(n => !tmNumbersAvailableAt('FLAG_BADGE01_GET', tmLocations).includes(n));
        expect(added).toEqual([2, 3, 4, 61, 65, 66, 67]);
    });

    test('the pool only grows along the ladder, and the champion holds all 95', () => {
        let previous = [];
        for (const step of PROGRESSION) {
            const pool = tmNumbersAvailableAt(step.flag, tmLocations);
            expect(pool).toEqual(expect.arrayContaining(previous));
            previous = pool;
        }
        expect(previous.length).toBe(95);
    });

    test('tmMovesAvailableAt reads the moves database and never yields an HM', () => {
        const moves = {
            MOVE_TACKLE: { tm: 1, tmLocation: 'Gym reward — Roxanne (badge 1)' },
            MOVE_EMBER: { tm: 32, tmLocation: 'Gym reward — Winona (badge 6)' },
            MOVE_SURF: {},   // an HM carries no TM slot
        };
        expect(tmMovesAvailableAt('FLAG_BADGE01_GET', moves)).toEqual(['MOVE_TACKLE']);
        expect(tmMovesAvailableAt('FLAG_BADGE06_GET', moves)).toEqual(['MOVE_TACKLE', 'MOVE_EMBER']);
        expect(tmMovesAvailableAt('FLAG_IS_CHAMPION', moves)).not.toContain('MOVE_SURF');
    });
});

describe('encounterPoolAt — species, through the run\'s wild plan', () => {
    const wildMaps = [
        { id: 'MAP_ROUTE101', land: 'T_LAND_101' },
        { id: 'MAP_ROUTE102', land: 'T_LAND_102', old: 'T_OLD_102', good: 'T_GOOD_102' },
        { id: 'MAP_ROUTE116', land: 'T_LAND_116' },
    ];
    const wildArtifact = {
        wildPlan: { T_LAND_102: ['SPECIES_A', 'SPECIES_B'], T_OLD_102: ['SPECIES_C'] },
        replacementLog: { T_LAND_101: 'SPECIES_D', T_GOOD_102: 'SPECIES_E', T_LAND_116: 'SPECIES_F' },
    };

    test('takes the plan when it has one, the replacement log otherwise', () => {
        expect(encounterPoolAt('FLAG_BADGE01_GET', wildMaps, wildArtifact).sort())
            .toEqual(['SPECIES_A', 'SPECIES_B', 'SPECIES_C', 'SPECIES_D'].sort());
    });

    test('a method that is not unlocked yet contributes nothing', () => {
        expect(encounterPoolAt('FLAG_BADGE01_GET', wildMaps, wildArtifact)).not.toContain('SPECIES_E');
        expect(encounterPoolAt('FLAG_BADGE04_GET', wildMaps, wildArtifact)).toContain('SPECIES_E');
    });

    test('a map that is not reachable yet contributes nothing', () => {
        expect(encounterPoolAt('FLAG_BADGE01_GET', wildMaps, wildArtifact)).not.toContain('SPECIES_F');
        expect(encounterPoolAt('FLAG_BADGE02_GET', wildMaps, wildArtifact)).toContain('SPECIES_F');
    });

    test('falls back to the template species when the run knows neither', () => {
        expect(encounterPoolAt('FLAG_BADGE01_GET', wildMaps, {})).toEqual(
            expect.arrayContaining(['T_LAND_101', 'T_LAND_102', 'T_OLD_102']));
    });

    test('is deduplicated and stable in map/method order', () => {
        const pool = encounterPoolAt('FLAG_IS_CHAMPION', wildMaps, wildArtifact);
        expect(new Set(pool).size).toBe(pool.length);
        expect(pool).toEqual(encounterPoolAt('FLAG_IS_CHAMPION', wildMaps, wildArtifact));
    });
});
