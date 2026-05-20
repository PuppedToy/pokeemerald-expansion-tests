const items = require('../../items');

describe('item pools', () => {
    test('Light Clay is not in averageItemPool (it has a fixed world location)', () => {
        expect(items.averageItemPool).not.toContain('ITEM_LIGHT_CLAY');
    });
});
