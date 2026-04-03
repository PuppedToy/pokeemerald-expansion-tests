'use strict';
const fs = require('fs');
const path = require('path');
const items = require('./items.js');

const ROOT = path.resolve(__dirname, '..');
const SCRIPT_MENU_PATH = path.join(ROOT, 'src', 'data', 'script_menu.h');

// --- Utilities ---

function shuffle(arr) {
    const a = [...arr];
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
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
    const fullPool     = shuffle([...new Set(items.fullItemPool)]);

    let pI = 0, gI = 0, bI = 0, fI = 0;
    const plate  = (n = 1) => platesPool.slice(pI, (pI += n));
    const gem    = (n = 1) => gemsPool.slice(gI, (gI += n));
    const berry  = (n = 1) => berriesPool.slice(bI, (bI += n));
    // Cycling pool: wraps around if we exceed the pool size
    const pool   = (n = 1) => Array.from({ length: n }, () => fullPool[fI++ % fullPool.length]);

    return {
        petalburgPlates:  plate(4),
        route104Gems:     gem(4),
        route117Gems:     gem(4),
        route104Berries:  berry(4),
        route111Berries:  berry(4),
        route117Berries:  berry(4),
        route121Berries:  berry(4),
        // fullItemPool locations
        route111Items:    [...pool(2), 'ITEM_CUSTAP_BERRY'],        // slot 2 = fixed
        route116OrbItems: ['ITEM_FLAME_ORB', 'ITEM_TOXIC_ORB', 'ITEM_STICKY_BARB'],
        route116Items:    [...pool(2), 'ITEM_TM65'],                // slot 2 = TM (name from TM randomizer)
        route118Items:    pool(4),
        route120Items:    pool(3),
        route125Items:    ['ITEM_WEAKNESS_POLICY', 'ITEM_EJECT_BUTTON', pool(1)[0]], // slots 0,1 = fixed
        // Item ball pick-3 locations
        route102Ball:  pool(3),
        route109Ball:  pool(3),
        route110Ball:  pool(3),
        route111BallA: pool(3),
        route111BallB: pool(3),
        route111BallC: pool(3),
        route112Ball:  pool(3),
        route114BallA: pool(3),
        route114BallB: pool(3),
        route114BallC: pool(3),
        route115Ball:  pool(3),
        route116Ball:  pool(3),
        route124BallA: pool(3),
        route124BallB: pool(3),
        route125Ball:  pool(3),
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

    // Route116 orb (3, slots 0,1 = fixed orbs, slot 2 = pool)
    replaceAnchored(
        'data/maps/Route116/scripts.inc',
        'ROUTE116_ORB',
        genPickerSection({
            pickerLabel:  'Route116_EventScript_PickOrb',
            multiConst:   'MULTI_ROUTE116_PICK_ORB',
            flag:         'FLAG_ITEM_ROUTE_116_MIND_PLATE',
            pickedItems:  a.route116OrbItems,
            handlerPrefix:'Route116_EventScript_PickOrb',
        })
    );

    // Route116 item (3, slots 0,1 = pool, slot 2 = TM65)
    replaceAnchored(
        'data/maps/Route116/scripts.inc',
        'ROUTE116_ITEM',
        genPickerSection({
            pickerLabel:  'Route116_EventScript_PickItem',
            multiConst:   'MULTI_ROUTE116_PICK_ITEM',
            flag:         'FLAG_ITEM_ROUTE_116_PICK_ITEM',
            pickedItems:  a.route116Items,
            handlerPrefix:'Route116_EventScript_PickItem',
        })
    );

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

    // Route120 items (3 all from pool)
    replaceAnchored(
        'data/maps/Route120/scripts.inc',
        'ROUTE120_ITEMS',
        genPickerSection({
            pickerLabel:  'Route120_EventScript_PickItem',
            multiConst:   'MULTI_ROUTE120_PICK_ITEM',
            flag:         'FLAG_ITEM_ROUTE_120_NEST_BALL',
            pickedItems:  a.route120Items,
            handlerPrefix:'Route120_EventScript_PickItem',
        })
    );

    // Route125 items (3, slots 0,1 = fixed, slot 2 = pool)
    replaceAnchored(
        'data/maps/Route125/scripts.inc',
        'ROUTE125_ITEMS',
        genPickerSection({
            pickerLabel:  'Route125_EventScript_PickItem',
            multiConst:   'MULTI_ROUTE125_PICK_ITEM',
            flag:         'FLAG_ITEM_ROUTE_125_BIG_PEARL',
            pickedItems:  a.route125Items,
            handlerPrefix:'Route125_EventScript_PickItem',
        })
    );

    // Item ball pick-3 locations
    replaceAnchored('data/maps/Route102/scripts.inc', 'ROUTE102_BALL', genPickerSection({
        pickerLabel:   'Route102_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE102_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_102_POTION',
        pickedItems:   a.route102Ball,
        handlerPrefix: 'Route102_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route109/scripts.inc', 'ROUTE109_BALL', genPickerSection({
        pickerLabel:   'Route109_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE109_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_109_POTION',
        pickedItems:   a.route109Ball,
        handlerPrefix: 'Route109_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route110/scripts.inc', 'ROUTE110_BALL', genPickerSection({
        pickerLabel:   'Route110_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE110_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_110_SHEDSHELL',
        pickedItems:   a.route110Ball,
        handlerPrefix: 'Route110_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_BALL_A', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickBallA',
        multiConst:    'MULTI_ROUTE111_PICK_BALL_A',
        flag:          'FLAG_ITEM_ROUTE_111_ELIXIR',
        pickedItems:   a.route111BallA,
        handlerPrefix: 'Route111_EventScript_PickBallA',
    }));
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_BALL_B', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickBallB',
        multiConst:    'MULTI_ROUTE111_PICK_BALL_B',
        flag:          'FLAG_ITEM_ROUTE_111_POWERHERB',
        pickedItems:   a.route111BallB,
        handlerPrefix: 'Route111_EventScript_PickBallB',
    }));
    replaceAnchored('data/maps/Route111/scripts.inc', 'ROUTE111_BALL_C', genPickerSection({
        pickerLabel:   'Route111_EventScript_PickBallC',
        multiConst:    'MULTI_ROUTE111_PICK_BALL_C',
        flag:          'FLAG_ITEM_ROUTE_111_ADRENALINE',
        pickedItems:   a.route111BallC,
        handlerPrefix: 'Route111_EventScript_PickBallC',
    }));
    replaceAnchored('data/maps/Route112/scripts.inc', 'ROUTE112_BALL', genPickerSection({
        pickerLabel:   'Route112_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE112_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_112_WHITE',
        pickedItems:   a.route112Ball,
        handlerPrefix: 'Route112_EventScript_PickBall',
    }));
    replaceAnchored('data/maps/Route114/scripts.inc', 'ROUTE114_BALL_A', genPickerSection({
        pickerLabel:   'Route114_EventScript_PickBallA',
        multiConst:    'MULTI_ROUTE114_PICK_BALL_A',
        flag:          'FLAG_ITEM_ROUTE_114_WIDE',
        pickedItems:   a.route114BallA,
        handlerPrefix: 'Route114_EventScript_PickBallA',
    }));
    replaceAnchored('data/maps/Route114/scripts.inc', 'ROUTE114_BALL_B', genPickerSection({
        pickerLabel:   'Route114_EventScript_PickBallB',
        multiConst:    'MULTI_ROUTE114_PICK_BALL_B',
        flag:          'FLAG_ITEM_ROUTE_114_ZOOM',
        pickedItems:   a.route114BallB,
        handlerPrefix: 'Route114_EventScript_PickBallB',
    }));
    replaceAnchored('data/maps/Route114/scripts.inc', 'ROUTE114_BALL_C', genPickerSection({
        pickerLabel:   'Route114_EventScript_PickBallC',
        multiConst:    'MULTI_ROUTE114_PICK_BALL_C',
        flag:          'FLAG_ITEM_ROUTE_114_ENERGY_POWDER',
        pickedItems:   a.route114BallC,
        handlerPrefix: 'Route114_EventScript_PickBallC',
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
    replaceAnchored('data/maps/Route124/scripts.inc', 'ROUTE124_BALL_A', genPickerSection({
        pickerLabel:   'Route124_EventScript_PickBallA',
        multiConst:    'MULTI_ROUTE124_PICK_BALL_A',
        flag:          'FLAG_ITEM_ROUTE_124_YELLOW_SHARD',
        pickedItems:   a.route124BallA,
        handlerPrefix: 'Route124_EventScript_PickBallA',
    }));
    replaceAnchored('data/maps/Route124/scripts.inc', 'ROUTE124_BALL_B', genPickerSection({
        pickerLabel:   'Route124_EventScript_PickBallB',
        multiConst:    'MULTI_ROUTE124_PICK_BALL_B',
        flag:          'FLAG_ITEM_ROUTE_124_IRON_BALL',
        pickedItems:   a.route124BallB,
        handlerPrefix: 'Route124_EventScript_PickBallB',
    }));
    replaceAnchored('data/maps/Route125/scripts.inc', 'ROUTE125_BALL', genPickerSection({
        pickerLabel:   'Route125_EventScript_PickBall',
        multiConst:    'MULTI_ROUTE125_PICK_BALL',
        flag:          'FLAG_ITEM_ROUTE_116_KINGS_ROCK',
        pickedItems:   a.route125Ball,
        handlerPrefix: 'Route125_EventScript_PickBall',
    }));
}

// --- script_menu.h updater ---

function updateScriptMenu(a) {
    let src = fs.readFileSync(SCRIPT_MENU_PATH, 'utf8');

    // 4-choice lists (plates, gems, berries)
    src = replaceMenuList(src, 'MultichoiceList_PetalburgWoodsPick',
        a.petalburgPlates.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route104PickGem',
        a.route104Gems.map(itemDisplayName));

    src = replaceMenuList(src, 'MultichoiceList_Route104PickBerry',
        a.route104Berries.map(itemDisplayName));

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

    src = replaceMenuList(src, 'MultichoiceList_Route120PickItem',
        a.route120Items.map(itemDisplayName));

    // Mixed lists: only update item slots, leave fixed/TM slots
    // Route116 item: slots 0,1 = random, slot 2 = TM (tmRandomizer owns slot 2 — leave it)
    src = replaceMenuListSlots(src, 'MultichoiceList_Route116PickItem', {
        0: itemDisplayName(a.route116Items[0]),
        1: itemDisplayName(a.route116Items[1]),
    });

    // Route125: slots 0,1 fixed (Weakness Policy, Eject Button), slot 2 = random
    src = replaceMenuListSlots(src, 'MultichoiceList_Route125PickItem', {
        2: itemDisplayName(a.route125Items[2]),
    });

    // Item ball pick-3 lists
    src = replaceMenuList(src, 'MultichoiceList_Route102PickBall',  a.route102Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route109PickBall',  a.route109Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route110PickBall',  a.route110Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route111PickBallA', a.route111BallA.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route111PickBallB', a.route111BallB.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route111PickBallC', a.route111BallC.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route112PickBall',  a.route112Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route114PickBallA', a.route114BallA.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route114PickBallB', a.route114BallB.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route114PickBallC', a.route114BallC.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route115PickBall',  a.route115Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route116PickBall',  a.route116Ball.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route124PickBallA', a.route124BallA.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route124PickBallB', a.route124BallB.map(itemDisplayName));
    src = replaceMenuList(src, 'MultichoiceList_Route125PickBall',  a.route125Ball.map(itemDisplayName));

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
        route102Ball:      dn('route102Ball'),
        route109Ball:      dn('route109Ball'),
        petalburgPlates:   dn('petalburgPlates'),
        route104Gems:      dn('route104Gems'),
        route104Berries:   dn('route104Berries'),
        route111Items:     dn('route111Items'),
        route111Berries:   dn('route111Berries'),
        route116OrbItems:  dn('route116OrbItems'),
        route116Items:     dn('route116Items'),
        route116Ball:      dn('route116Ball'),
        route114BallC:     dn('route114BallC'),
        route117Gems:      dn('route117Gems'),
        route118Items:     dn('route118Items'),
        route120Items:     dn('route120Items'),
        route121Berries:   dn('route121Berries'),
        route125Items:     dn('route125Items'),
    };
}

module.exports = { randomizeItems };
