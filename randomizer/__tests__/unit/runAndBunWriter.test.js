'use strict';

// TDD (T-091): the maker presets the League Run & Bun VARs in Sidney's room script from the bundle
// config — mode gate (1 only for mixed + leagueRunAndBun) + the E4 singles/doubles quotas.

const { patchRunAndBunInContent } = require('../../runAndBunWriter');

const SAMPLE = `EverGrandeCity_SidneysRoom_EventScript_InitRunAndBun::
	setvar VAR_RUNANDBUN_MODE, 0
	setvar VAR_RUNANDBUN_SINGLES_LEFT, 4
	setvar VAR_RUNANDBUN_DOUBLES_LEFT, 0
	return
`;

const modeOf = t => Number(t.match(/VAR_RUNANDBUN_MODE, (\d+)/)[1]);
const singlesOf = t => Number(t.match(/VAR_RUNANDBUN_SINGLES_LEFT, (\d+)/)[1]);
const doublesOf = t => Number(t.match(/VAR_RUNANDBUN_DOUBLES_LEFT, (\d+)/)[1]);

describe('patchRunAndBunInContent', () => {
    test('mixed + Run & Bun at 90% → mode 1, 3 singles / 1 doubles', () => {
        const out = patchRunAndBunInContent(SAMPLE, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 90 });
        expect(modeOf(out)).toBe(1);
        expect(singlesOf(out)).toBe(3);
        expect(doublesOf(out)).toBe(1);
    });

    test('mixed + Run & Bun at 50% → mode 1, 2 / 2', () => {
        const out = patchRunAndBunInContent(SAMPLE, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 50 });
        expect(modeOf(out)).toBe(1);
        expect(singlesOf(out)).toBe(2);
        expect(doublesOf(out)).toBe(2);
    });

    test('singles format → mode 0 (E4 never prompts)', () => {
        expect(modeOf(patchRunAndBunInContent(SAMPLE, { battleFormat: 'singles' }))).toBe(0);
    });

    test('mixed WITHOUT Run & Bun → mode 0', () => {
        expect(modeOf(patchRunAndBunInContent(SAMPLE, { battleFormat: 'mixed', leagueRunAndBun: false, singlesPercent: 60 }))).toBe(0);
    });

    test('leaves the rest of the script intact', () => {
        const out = patchRunAndBunInContent(SAMPLE, { battleFormat: 'mixed', leagueRunAndBun: true, singlesPercent: 60 });
        expect(out).toMatch(/EventScript_InitRunAndBun::/);
        expect(out).toMatch(/\treturn/);
    });
});
