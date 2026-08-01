const items = require('../../items');
const { writeItemFilesFromBundle } = require('../../itemRandomizer');

describe('item pools', () => {
    test('Light Clay is not in averageItemPool (it has a fixed world location)', () => {
        expect(items.averageItemPool).not.toContain('ITEM_LIGHT_CLAY');
    });
});

// T-236 — the script-generation contract (updateScripts/updateScriptMenu) was deliberately replaced
// by the gItemPicks[] table sink; its behavior is specified in unit/itemPicksWriter.test.js.
describe('itemRandomizer exports', () => {
    test('writeItemFilesFromBundle is exported and is a function', () => {
        expect(typeof writeItemFilesFromBundle).toBe('function');
    });
});
