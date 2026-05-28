const items = require('../../items');
const { updateScripts, writeItemFilesFromBundle } = require('../../itemRandomizer');

describe('item pools', () => {
    test('Light Clay is not in averageItemPool (it has a fixed world location)', () => {
        expect(items.averageItemPool).not.toContain('ITEM_LIGHT_CLAY');
    });
});

describe('itemRandomizer exports', () => {
    test('updateScripts is exported and is a function', () => {
        expect(typeof updateScripts).toBe('function');
    });

    test('writeItemFilesFromBundle is exported and is a function', () => {
        expect(typeof writeItemFilesFromBundle).toBe('function');
    });

    test('writeItemFilesFromBundle converts display names to ITEM_* constants before writing', () => {
        // Provide a minimal fake assignments with just route102Ball to verify conversion.
        // Mock replaceAnchored so no real file I/O happens.
        const origReadFileSync  = require('fs').readFileSync;
        const origWriteFileSync = require('fs').writeFileSync;
        const written = {};
        require('fs').readFileSync  = () => '@ === RAND_ROUTE102_BALL_START ===\n@ === RAND_ROUTE102_BALL_END ===';
        require('fs').writeFileSync = (p, content) => { written[p] = content; };

        // All keys must be present; use single-item string for singles, array for arrays.
        const fakeAssignments = {
            petalburgPlates:         ['Meadow Plate', 'Flame Plate', 'Splash Plate', 'Zap Plate'],
            route117Plates:          ['Meadow Plate', 'Flame Plate', 'Splash Plate', 'Zap Plate'],
            route104Gems:            ['Fire Gem', 'Water Gem', 'Grass Gem', 'Electric Gem'],
            route116Gems:            ['Fire Gem', 'Water Gem', 'Grass Gem', 'Electric Gem'],
            route117Gems:            ['Fire Gem', 'Water Gem', 'Grass Gem', 'Electric Gem'],
            route104Berries:         ['Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry'],
            route116Berries:         ['Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry'],
            route111Berries:         ['Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry'],
            route117Berries:         ['Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry'],
            route121Berries:         ['Occa Berry', 'Passho Berry', 'Wacan Berry', 'Rindo Berry'],
            route111Items:           ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route106GoodItem:        'Life Orb',
            route109GoodItem:        'Life Orb',
            route110GoodItem:        'Life Orb',
            route110LumGoodItem:     'Life Orb',
            route117GoodItem:        'Life Orb',
            route116XSpecial:        'Life Orb',
            route111HpUpGoodItem:    'Life Orb',
            route118BarnyGoodItem:   'Life Orb',
            route120AngelicaGoodItem:'Life Orb',
            route114WyattGoodItem:   'Life Orb',
            route106Ball:            ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route102Ball:            ['Float Stone', 'Absorb Bulb', 'Heavy Duty Boots'],
            route110ExtenderBall:    ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route111BallA:           ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route111BallC:           ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route115Ball:            ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route116Ball:            ['Float Stone', 'Iron Ball', 'Absorb Bulb'],
            route118Items:           ['Float Stone', 'Iron Ball', 'Absorb Bulb', 'Blunder Policy'],
        };

        try {
            writeItemFilesFromBundle(fakeAssignments);
        } finally {
            require('fs').readFileSync  = origReadFileSync;
            require('fs').writeFileSync = origWriteFileSync;
        }

        // At least one scripts.inc write must have happened with ITEM_* constants, not display names
        const anyScriptContent = Object.values(written).find(c => c && c.includes('ITEM_FLOAT_STONE'));
        expect(anyScriptContent).toBeDefined();
        const anyDisplayName = Object.values(written).find(c => c && c.includes('finditem Float Stone'));
        expect(anyDisplayName).toBeUndefined();
    });
});
