'use strict';

jest.mock('fs', () => ({
    promises: {
        readFile:  jest.fn().mockResolvedValue(''),
        writeFile: jest.fn().mockResolvedValue(undefined),
    },
}));

const rng = require('../../rng');

describe('writeTMsFromList', () => {
    let buildTMList, writeTMsFromList, writeFile;

    beforeEach(() => {
        jest.clearAllMocks();
        rng.seed(42);
        // Re-require after clearing mocks so module picks up fresh mock state.
        jest.resetModules();
        ({ buildTMList, writeTMsFromList } = require('../../tmRandomizer'));
        ({ writeFile } = require('fs').promises);
    });

    test('writes tms_hms.h with correct header guard and macro', async () => {
        const tmList = buildTMList();
        await writeTMsFromList(tmList);

        const tmsCall = writeFile.mock.calls.find(([p]) => p.includes('tms_hms.h'));
        expect(tmsCall).toBeDefined();
        const content = tmsCall[1];
        expect(content).toContain('#ifndef GUARD_CONSTANTS_TMS_HMS_H');
        expect(content).toContain('#define FOREACH_TM(F)');
    });

    test('TM72 is always RAIN_DANCE (FIXED_TMS) and TM71 is not', async () => {
        const tmList = buildTMList();
        await writeTMsFromList(tmList);

        const content = writeFile.mock.calls.find(([p]) => p.includes('tms_hms.h'))[1];
        const tmLines = content.split('\n').filter(l => /F\([A-Z_]+\)/.test(l));
        // 0-indexed: tmLines[70] = TM71, tmLines[71] = TM72
        expect(tmLines[71]).toContain('RAIN_DANCE');
        expect(tmLines[70]).not.toContain('RAIN_DANCE');
    });

    test('SNOWSCAPE does not appear in written file (no longer a FIXED_TM)', async () => {
        const tmList = buildTMList();
        await writeTMsFromList(tmList);

        const content = writeFile.mock.calls.find(([p]) => p.includes('tms_hms.h'))[1];
        expect(content).not.toContain('SNOWSCAPE');
    });

    test('writeFile called exactly twice: tms_hms.h and script_menu.h', async () => {
        const tmList = buildTMList();
        await writeTMsFromList(tmList);

        const paths = writeFile.mock.calls.map(([p]) => p);
        expect(paths.length).toBe(2);
        expect(paths.some(p => p.includes('tms_hms.h'))).toBe(true);
        expect(paths.some(p => p.includes('script_menu.h'))).toBe(true);
    });

    test('randomizeTMs still works and returns a 95-entry tmList (no regression)', async () => {
        rng.seed(42);
        const { randomizeTMs } = require('../../tmRandomizer');
        const list = await randomizeTMs();
        expect(Array.isArray(list)).toBe(true);
        expect(list).toHaveLength(95);
        expect(list[71]).toBe('RAIN_DANCE'); // TM72 = index 71
    });
});
