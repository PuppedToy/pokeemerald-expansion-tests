const items = require('../../items');
const { updateScripts } = require('../../itemRandomizer');

describe('item pools', () => {
    test('Light Clay is not in averageItemPool (it has a fixed world location)', () => {
        expect(items.averageItemPool).not.toContain('ITEM_LIGHT_CLAY');
    });
});

describe('itemRandomizer exports', () => {
    test('updateScripts is exported and is a function', () => {
        expect(typeof updateScripts).toBe('function');
    });
});
