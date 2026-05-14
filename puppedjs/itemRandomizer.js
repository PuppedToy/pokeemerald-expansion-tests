'use strict';
const fs = require('fs');
const path = require('path');
const rng = require('./rng');
const items = require('./items.js');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_MENU_PATH = path.join(ROOT, 'src', 'data', 'script_menu.h');

// --- Utilities ---

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(rng.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
}

// ITEM_MEADOW_PLATE → "Meadow Plate"
function itemDisplayName(constant) {
    const ABBREVS = new Set(['PP', 'HP', 'TM', 'HM', 'EV']);
    return constant
        .replace(/^ITEM_/, '')
        .split('_')
        .map(w => ABBREVS.has(w.toUpperCase()) ? w.toUpperCase() : w[0].toUpperCase() + w.slice(1).toLowerCase())
        .join(' ');
}

// Replace everything between anchor comments in a file
function replaceAnchored(relPath, tag, newContent) {
    const absPath = path.join(ROOT, relPath);
    let content = fs.readFileSync(absPath, 'utf8');
    const startTag = `@ === RAND_${tag}_START ===`;
    const endTag   = `@ === RAND_${tag}_END ===`;
    const esc = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${esc(startTag)})[\\s\\S]*?(${esc(endTag)})`);
    content = content.replace(regex, `$1\n${newContent}\n$2`);
    fs.writeFileSync(absPath, content);
}

// Replace a MultichoiceList_* array wholesale in script_menu.h src
function replaceMenuList(src, listName, displayNames) {
    const newEntries = displayNames.map(n => `    {COMPOUND_STRING("${n}")},`).join('\n');
    return src.replace(
        new RegExp(
            `(static const struct MenuAction ${listName}\\[\\] =\\n\\{\\n)[\\s\\S]*?(\\n\\};)`
        ),
        `$1${newEntries}$2`
    );
}

// Replace only specific slots in a MenuAction list (for mixed fixed/random lists)
function replaceMenuListSlots(src, listName, slotMap) {
    // slotMap: { 0: "New Name", 2: "Another Name" }  (other slots untouched)
    const regex = new RegExp(
        `(static const struct MenuAction ${listName}\\[\\] =\\n\\{\\n)([\\s\\S]*?)(\\n\\};)`
    );
    return src.replace(regex, (match, start, body, end) => {
        const lines = body.split('\n');
        let slotIndex = 0;
        const updated = lines.map(line => {
            if (line.trim().startsWith('{COMPOUND_STRING(')) {
                const result = slotIndex in slotMap
                    ? `    {COMPOUND_STRING("${slotMap[slotIndex]}")},`
                    : line;
                slotIndex++;
                return result;
            }
            return line;
        });
        return `${start}${updated.join('\n')}${end}`;
    });
}

// Generate a single-item script (no multichoice — item is fixed per run from a pool)
function genSingleItemScript(cfg) {
    const { scriptLabel, item, flag } = cfg;
    return `${scriptLabel}::\n\tfinditem ${item}\n\tsetflag ${flag}\n\tend`;
}

// Generate a full picker section (multichoice + switch + individual handlers)
function genPickerSection(cfg) {
    // cfg: { pickerLabel, multiConst, flag, pickedItems, handlerPrefix, extraFindItems? }
    // extraFindItems: optional array of extra finditem calls per handler (for Route117 screen which gives TM+item)
    const { pickerLabel, multiConst, flag, pickedItems, handlerPrefix, extraFindItems } = cfg;
    const cases = pickedItems.map((_, i) => `\tcase ${i}, ${handlerPrefix}${i + 1}`).join('\n');
    const handlers = pickedItems.map((item, i) => {
        const extras = extraFindItems ? extraFindItems[i].map(e => `\tfinditem ${e}`).join('\n') + '\n' : '';
        return `\n${handlerPrefix}${i + 1}::\n\tfinditem ${item}\n${extras}\tsetflag ${flag}\n\tend`;
    }).join('\n');

    return `${pickerLabel}::\n\tmultichoice 0, 0, ${multiConst}, FALSE\n\tswitch VAR_RESULT\n${cases}\n\tend\n${handlers}`;
}

// --- Item assignment ---

function buildAssignments() {
    const platesPool   = shuffle([...new Set(Object.keys(items.plates))]);
    const gemsPool     = shuffle([...new Set(items.gems)]);
    const berriesPool  = shuffle([...new Set(Object.values(items.protectionBerries))]);
    const fullPool     = shuffle([...new Set(items.averageItemPool)]);
    const goodPool     = shuffle([...new Set(items.goodItemPool)]);

    let pI = 0, gI = 0, bI = 0, fI = 0, gpI = 0;
    const plate  = (n = 1) => platesPool.slice(pI, (pI += n));
    const gem    = (n = 1) => gemsPool.slice(gI, (gI += n));
    const berry  = (n = 1) => berriesPool.slice(bI, (bI += n));
    // Cycling pool: wraps around if we exceed the pool size
    const pool   = (n = 1) => Array.from({ length: n }, () => fullPool[fI++ % fullPool.length]);
    const good   = (n = 1) => Array.from({ length: n }, () => goodPool[gpI++ % goodPool.length]);

    return {
        petalburgPlates:  plate(4),
        route117Plates:   plate(4),
        route104Gems:     gem(4),
        route116Gems:     gem(4),
        route117Gems:     gem(4),
        route104Berries:  berry(4),
        route116Berries:  berry(4),
        route111Berries:  berry(4),
        route117Berries:  berry(4),
        route121Berries:  berry(4),
        // averageItemPool locations
        route111Items:    [...pool(2), 'ITEM_CUSTAP_BERRY'],        // slot 2 = fixed
        // goodItemPool single-item locations
        route106GoodItem:  good(1)[0],
        route109GoodItem:  good(1)[0],
        route110GoodItem:  good(1)[0],
        route110LumGoodItem: good(1)[0],
        route117GoodItem:    good(1)[0],
        route116XSpecial:  good(1)[0],
        route111HpUpGoodItem: good(1)[0],
        route111GemGoodItem:  good(1)[0],

        route118BarnyGoodItem: good(1)[0],
        route118Items:    pool(4),
        route120AngelicaGoodItem: good(1)[0],
        // Item ball pick-3 locations
        route106Ball:  pool(3),
        route102Ball:  pool(3),
        route110ExtenderBall: pool(3),
        route111BallA: pool(3),
        route111BallC: pool(3),
        route111ShaylaBall: pool(3),
        route114WyattGoodItem: good(1)[0],
        route115Ball:  pool(3),
        route116Ball:  pool(3),
    };
}

// --- Script section updaters ---

function updateScripts(a) {
    // PetalburgWoods plates (3→4)
    replaceAnchored(
        'data/maps/PetalburgWoods/scripts.inc',
        'PETALBURG_PLATES',
        genPickerSection({
            pickerLabel:  'PetalburgWoods_EventScript_PickPlate',
            multiConst:   'MULTI_PETALBURG_WOODS_PICK',
            flag:         'FLAG_ITEM_PETALBURG_WOODS_PARALYZE_HEAL',
            pickedItems:  a.petalburgPlates,
            handlerPrefix:'PetalburgWoods_EventScript_PickPlate',
        })
    );

    // Route104 gems (3→4)
    replaceAnchored(
        'data/maps/Route104/scripts.inc',
        'ROUTE104_GEMS',
        genPickerSection({
            pickerLabel:  'Route104_EventScript_PickGem',
            multiConst:   'MULTI_ROUTE104_PICK_GEM',
            flag:         'FLAG_ITEM_ROUTE_104_GEM',
            pickedItems:  a.route104Gems,
            handlerPrefix:'Route104_EventScript_PickGem',
        })
    );

    // Route104 berries (3→4)
    replaceAnchored(
        'data/maps/Route104/scripts.inc',
        'ROUTE104_BERRIES',
        genPickerSection({
            pickerLabel:  'Route104_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE104_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_104_X_ACCURACY',
            pickedItems:  a.route104Berries,
            handlerPrefix:'Route104_EventScript_PickBerry',
        })
    );

    // Route117 berries (3→4)
    replaceAnchored(
        'data/maps/Route117/scripts.inc',
        'ROUTE117_BERRIES',
        genPickerSection({
            pickerLabel:  'Route117_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE117_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_117_WACAN',
            pickedItems:  a.route117Berries,
            handlerPrefix:'Route117_EventScript_PickBerry',
        })
    );

    // Route117 gems (3→4)
    replaceAnchored(
        'data/maps/Route117/scripts.inc',
        'ROUTE117_GEMS',
        genPickerSection({
            pickerLabel:  'Route117_EventScript_PickGem',
            multiConst:   'MULTI_ROUTE117_PICK_GEM',
            flag:         'FLAG_ITEM_ROUTE_117_GROUNDGEM',
            pickedItems:  a.route117Gems,
            handlerPrefix:'Route117_EventScript_PickGem',
        })
    );

    // Route111 berries (3→4)
    replaceAnchored(
        'data/maps/Route111/scripts.inc',
        'ROUTE111_BERRIES',
        genPickerSection({
            pickerLabel:  'Route111_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE111_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_111_CHILAN',
            pickedItems:  a.route111Berries,
            handlerPrefix:'Route111_EventScript_PickBerry',
        })
    );

    // Route121 berries (3→4)
    replaceAnchored(
        'data/maps/Route121/scripts.inc',
        'ROUTE121_BERRIES',
        genPickerSection({
            pickerLabel:  'Route121_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE121_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_121_PICK_BERRY',
            pickedItems:  a.route121Berries,
            handlerPrefix:'Route121_EventScript_PickBerry',
        })
    );

    // Route111 gem (single goodItemPool item — Becky)
    replaceAnchored(
        'data/maps/Route111/scripts.inc',
        'ROUTE111_GEM',
        genSingleItemScript({
            scriptLabel: 'Route111_EventScript_GemGoodItem',
            item: a.route111GemGoodItem,
            flag: 'FLAG_ITEM_ROUTE_111_GEM',
        })
    );

    // Route111 items (3, items change — slot 2 = CUSTAP_BERRY fixed)
    replaceAnchored(
        'data/maps/Route111/scripts.inc',
        'ROUTE111_ITEMS',
        genPickerSection({
            pickerLabel:  'Route111_EventScript_PickItem',
            multiConst:   'MULTI_ROUTE111_PICK_ITEM',
            flag:         'FLAG_ITEM_ROUTE_111_TM_SANDSTORM',
            pickedItems:  a.route111Items,
            handlerPrefix:'Route111_EventScript_PickItem',
        })
    );

    // Route106 good item (single goodItemPool item)
    replaceAnchored(
        'data/maps/Route106/scripts.inc',
        'ROUTE106_GOOD_ITEM',
        genSingleItemScript({
            scriptLabel: 'Route106_EventScript_GoodItem',
            item: a.route106GoodItem,
            flag: 'FLAG_ITEM_ROUTE_106_PROTEIN',
        })
    );

    // Route116 X Special (single goodItemPool item)
    replaceAnchored(
        'data/maps/Route116/scripts.inc',
        'ROUTE116_X_SPECIAL',
        genSingleItemScript({
            scriptLabel: 'Route116_EventScript_XSpecial',
            item: a.route116XSpecial,
            flag: 'FLAG_ITEM_ROUTE_116_X_SPECIAL',
        })
    );

    // Route116 gem pick (4 gems — Sarah's item, FLAG_ITEM_ROUTE_116_ETHER)
    replaceAnchored(
        'data/maps/Route116/scripts.inc',
        'ROUTE116_GEM',
        genPickerSection({
            pickerLabel:  'Route116_EventScript_PickGem',
            multiConst:   'MULTI_ROUTE116_PICK_GEM',
            flag:         'FLAG_ITEM_ROUTE_116_ETHER',
            pickedItems:  a.route116Gems,
            handlerPrefix:'Route116_EventScript_PickGem',
        })
    );

    // Route116 berry pick (4 berries — Karen's item, FLAG_ITEM_ROUTE_116_POTION)
    replaceAnchored(
        'data/maps/Route116/scripts.inc',
        'ROUTE116_BERRY',
        genPickerSection({
            pickerLabel:  'Route116_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE116_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_116_POTION',
            pickedItems:  a.route116Berries,
            handlerPrefix:'Route116_EventScript_PickBerry',
        })
    );

    replaceAnchored('data/maps/Route118/scripts.inc', 'ROUTE118_BARNY_GOOD', genSingleItemScript({
        scriptLabel: 'Route118_EventScript_BarnyGoodItem',
        item:        a.route118BarnyGoodItem,
        flag:        'FLAG_ITEM_ROUTE_118_COBA',
    }));

    // Route118 items (4 all from pool)
    replaceAnchored(
        'data/maps/Route118/scripts.inc',
        'ROUTE118_ITEMS',
        genPickerSection({
            pickerLabel:  'Route118_EventScript_PickBerry',
            multiConst:   'MULTI_ROUTE118_PICK_BERRY',
            flag:         'FLAG_ITEM_ROUTE_118_BERRY',
            pickedItems:  a.route118Items,
            handlerPrefix:'Route118_EventScript_PickBerry',
        })
    );

    replaceAnchored('data/maps/Route120/scripts.inc', 'ROUTE120_ANGELICA_GOOD', genSingleItemScript({
        scriptLabel: 'Route120_EventScript_AngelicaGoodItem',
        item:        a.route120AngelicaGoodItem,
        flag:        'FLAG_ITEM_ROUTE_119_ZINC',
    }));

    // Item ball pick-3 locations
    replaceAnchored('data/maps/Route106/scripts.inc', 'ROUTE106_BALL', genPickerSection({
        pickerLabel:   'Route106_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE106_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_106_CAPSULE',
        pickedItems:   a.route106Ball,
        handlerPrefix: 'Route106_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route102/scripts.inc', 'ROUTE102_BALL', genPickerSection({
        pickerLabel:   'Route102_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE102_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_102_POTION',
        pickedItems:   a.route102Ball,
        handlerPrefix: 'Route102_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route109/scripts.inc', 'ROUTE109_BALL', genSingleItemScript({
        scriptLabel: 'Route109_EventScript_GoodItem',
        item: a.route109GoodItem,
        flag: 'FLAG_ITEM_ROUTE_109_POTION',
    }));
    replaceAnchored('data/maps/Route110/scripts.inc', 'ROUTE110_BALL', genSingleItemScript({
        scriptLabel: 'Route110_EventScript_GoodItem',
        item:        a.route110GoodItem,
        flag:        'FLAG_ITEM_ROUTE_110_SHEDSHELL',
    }));
    replaceAnchored('data/maps/Route110/scripts.inc', 'ROUTE110_LUM', genSingleItemScript({
        scriptLabel: 'Route110_EventScript_LumGoodItem',
        item:        a.route110LumGoodItem,
        flag:        'FLAG_ITEM_ROUTE_110_LUM',
    }));
    replaceAnchored('data/maps/Route117/scripts.inc', 'ROUTE117_EARTHQUAKE', genSingleItemScript({
        scriptLabel: 'Route117_EventScript_EarthquakeGoodItem',
        item:        a.route117GoodItem,
        flag:        'FLAG_ITEM_ROUTE_117_EARTHQUAKE',
    }));
    // Route117 plate pick (4 plates — Lydia's item, FLAG_ITEM_ROUTE_117_GREAT_BALL)
    // Route111 good item (single goodItemPool item — Travis)
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_HP_UP', genSingleItemScript({
        scriptLabel: 'Route111_EventScript_HpUpGoodItem',
        item:        a.route111HpUpGoodItem,
        flag:        'FLAG_ITEM_ROUTE_111_HP_UP',
    }));
    replaceAnchored('data/maps/Route117/scripts.inc', 'ROUTE117_PLATE', genPickerSection({
        pickerLabel:  'Route117_EventScript_PickPlate',
        multiConst:   'MULTI_ROUTE117_PICK_PLATE',
        flag:         'FLAG_ITEM_ROUTE_117_GREAT_BALL',
        pickedItems:  a.route117Plates,
        handlerPrefix:'Route117_EventScript_PickPlate',
    }));
    replaceAnchored('data/maps/Route110/scripts.inc', 'ROUTE110_EXTENDER', genPickerSection({
        pickerLabel:   'Route110_EventScript_PickExtender',
        multiConst:    'MULTI_ROUTE110_PICK_EXTENDER',
        flag:          'FLAG_ITEM_ROUTE_110_EXTENDER',
        pickedItems:   a.route110ExtenderBall,
        handlerPrefix: 'Route110_EventScript_PickExtender',
    }));
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_BALL_A', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickBallA',
        multiConst:    'MULTI_ROUTE111_PICK_BALL_A',
        flag:          'FLAG_ITEM_ROUTE_111_ELIXIR',
        pickedItems:   a.route111BallA,
        handlerPrefix: 'Route111_EventScript_PickBallA',
    }));
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_BALL_C', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickBallC',
        multiConst:    'MULTI_ROUTE111_PICK_BALL_C',
        flag:          'FLAG_ITEM_ROUTE_111_ADRENALINE',
        pickedItems:   a.route111BallC,
        handlerPrefix: 'Route111_EventScript_PickBallC',
    }));
    replaceAnchored('data/maps/Route114/scripts.inc', 'ROUTE114_SHAYLA_BALL', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickShayla',
        multiConst:    'MULTI_ROUTE112_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_112_WHITE',
        pickedItems:   a.route111ShaylaBall,
        handlerPrefix: 'Route111_EventScript_PickShayla',
    }));
    replaceAnchored('data/maps/Route114/scripts.inc', 'ROUTE114_WYATT_GOOD', genSingleItemScript({
        scriptLabel:   'Route114_EventScript_PickWyatt',
        item:          a.route114WyattGoodItem,
        flag:          'FLAG_ITEM_ROUTE_114_ENERGY_POWDER',
    }));
    replaceAnchored('data/maps/Route115/scripts.inc', 'ROUTE115_BALL', genPickerSection({
        pickerLabel:   'Route115_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE115_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_115_GREAT_BALL',
        pickedItems:   a.route115Ball,
        handlerPrefix: 'Route115_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route116/scripts.inc', 'ROUTE116_BALL', genPickerSection({
        pickerLabel:   'Route116_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE116_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_TM_BRICK_BREAK',
        pickedItems:   a.route116Ball,
        handlerPrefix: 'Route116_EventScript_PickBall',
    }));
}

// --- script_menu.h updater ---

function updateScriptMenu(a) {
    let src = fs.readFileSync(SCRIPT_MENU_PATH, 'utf8');

    // 4-choice lists (plates, gems, berries)
    src = replaceMenuList(src, 'MultichoiceList_PetalburgWoodsPick',
        a.petalburgPlates.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route117PickPlate',
        a.route117Plates.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route104PickGem',
        a.route104Gems.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route104PickBerry',
        a.route104Berries.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route116PickGem',
        a.route116Gems.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route116PickBerry',
        a.route116Berries.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route117PickBerry',
        a.route117Berries.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route117PickGem',
        a.route117Gems.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route111PickBerry',
        a.route111Berries.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route121PickBerry',
        a.route121Berries.map(itemDisplayName));

    // 3-choice lists where all items change
    src = replaceMenuList(src, 'MultichoiceList_Route111PickItem',
        a.route111Items.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route118PickBerry',
        a.route118Items.map(itemDisplayName));

    // Item ball pick-3 lists
    src = replaceMenuList(src, 'MultichoiceList_Route106PickBall',  a.route106Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route102PickBall',  a.route102Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route110PickExtender', a.route110ExtenderBall.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route111PickBallA', a.route111BallA.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route111PickBallC', a.route111BallC.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route112PickBall',  a.route111ShaylaBall.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route115PickBall',  a.route115Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route116PickBall',  a.route116Ball.map(itemDisplayName));

    fs.writeFileSync(SCRIPT_MENU_PATH, src);
    console.log('[Item Randomizer] Updated item names in script_menu.h');
}

// --- Entry point ---

function randomizeItems() {
    const a = buildAssignments();
    updateScripts(a);
    updateScriptMenu(a);
    console.log('[Item Randomizer] Done.');

    // Return display-name assignments for use in trainer generation
    const dn = (key) => a[key].map(itemDisplayName);
    return {
        route106GoodItem:  itemDisplayName(a.route106GoodItem),
        route109GoodItem:  itemDisplayName(a.route109GoodItem),
        route110GoodItem:     itemDisplayName(a.route110GoodItem),
        route110LumGoodItem:  itemDisplayName(a.route110LumGoodItem),
        route117GoodItem:     itemDisplayName(a.route117GoodItem),
        route116XSpecial:     itemDisplayName(a.route116XSpecial),
        route111HpUpGoodItem: itemDisplayName(a.route111HpUpGoodItem),
        route111GemGoodItem:  itemDisplayName(a.route111GemGoodItem),
        route111BallC:        dn('route111BallC'),
        route116Gems:      dn('route116Gems'),
        route116Berries:   dn('route116Berries'),
        route106Ball:          dn('route106Ball'),
        route102Ball:          dn('route102Ball'),
        route110ExtenderBall:  dn('route110ExtenderBall'),
        petalburgPlates:   dn('petalburgPlates'),
        route117Plates:    dn('route117Plates'),
        route104Gems:      dn('route104Gems'),
        route104Berries:   dn('route104Berries'),
        route111Items:     dn('route111Items'),
        route111Berries:   dn('route111Berries'),

        route111BallA:      dn('route111BallA'),
        route111ShaylaBall: dn('route111ShaylaBall'),
        route116Ball:      dn('route116Ball'),
        route114WyattGoodItem: itemDisplayName(a.route114WyattGoodItem),
        route117Berries:   dn('route117Berries'),
        route117Gems:      dn('route117Gems'),
        route118BarnyGoodItem: itemDisplayName(a.route118BarnyGoodItem),
        route118Items:     dn('route118Items'),
        route120AngelicaGoodItem: itemDisplayName(a.route120AngelicaGoodItem),
        route121Berries:   dn('route121Berries'),
    };
}

module.exports = { randomizeItems };
