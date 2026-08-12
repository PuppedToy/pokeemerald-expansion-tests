'use strict';

// T-270 — where the 15 traders stand. The owner's rule is "the same position in every city's healing
// building", and the game cannot be built or walked locally, so this is the structural guard: for every
// trader in randomizer/trades.js there is exactly one NPC, in the map its row names, on a tile that is
// walkable in that map's layout, free of every other object, and not sitting on a warp. It also checks
// the tile is the SAME in all fourteen Pokémon Centers — the thing a human would notice as "wrong spot"
// but no other test would.

const fs = require('fs');
const path = require('path');

const { TRADERS } = require('../../trades');

const ROOT = path.resolve(__dirname, '../../..');
const MAPS_DIR = path.join(ROOT, 'data', 'maps');

const readJson = (file) => JSON.parse(fs.readFileSync(file, 'utf8'));
const layouts = readJson(path.join(ROOT, 'data', 'layouts', 'layouts.json')).layouts;

// Every map directory, keyed by its MAP_* constant.
const mapDirs = new Map(
    fs.readdirSync(MAPS_DIR)
        .filter(name => fs.existsSync(path.join(MAPS_DIR, name, 'map.json')))
        .map(name => [readJson(path.join(MAPS_DIR, name, 'map.json')).id, name]),
);

/**
 * The collision bit of every tile of a layout. Each block in a `map.bin` is a u16: metatile id in the
 * low 10 bits, collision in bits 10-11 (0 = walkable), elevation above that.
 */
function collisionGrid(layoutId) {
    const layout = layouts.find(l => l.id === layoutId);
    if (!layout) throw new Error(`townTraderPlacement: no layout ${layoutId}`);
    const raw = fs.readFileSync(path.join(ROOT, layout.blockdata_filepath));
    const grid = [];
    for (let y = 0; y < layout.height; y++) {
        const row = [];
        for (let x = 0; x < layout.width; x++) {
            row.push((raw.readUInt16LE((y * layout.width + x) * 2) >> 10) & 0x3);
        }
        grid.push(row);
    }
    return grid;
}

/**
 * The trader's script label, found by what the script DOES rather than by its name.
 *
 * T-270 derived it as `<MapDir>_EventScript_Trader`. B-075 forced that convention to break in exactly one
 * map: vanilla's Mauville Man decoration trader already owns that symbol in Mauville's Pokémon Center, and
 * two global labels with one name means the ROM does not assemble at all. So identify the NPC by the pair
 * that actually defines a town trader — it arms this town's trade id and jumps into the shared flow — which
 * is both immune to the naming and a stronger claim than the old one.
 */
function traderScriptLabel(dir, trader) {
    const text = fs.readFileSync(path.join(MAPS_DIR, dir, 'scripts.inc'), 'utf8');
    const armsThisTrade = new RegExp(`setvar\\s+VAR_0x8008,\\s*${trader.ingameTradeId}\\b`);
    const block = text
        .split(/^(?=[A-Za-z_]\w*::)/m)
        .find(b => armsThisTrade.test(b) && /goto\s+Common_EventScript_TownTrader\b/.test(b));
    return block ? /^([A-Za-z_]\w*)::/.exec(block)[1] : null;
}

const traderOf = (map, trader) => {
    const label = traderScriptLabel(mapDirs.get(trader.mapId), trader);
    return label ? (map.object_events || []).filter(o => o.script === label) : [];
};

describe('the 15 traders stand in their healing buildings', () => {
    test.each(TRADERS.map(t => [t.town, t]))('%s: exactly one trader NPC, in the map its row names', (_town, trader) => {
        const dir = mapDirs.get(trader.mapId);
        expect(dir).toBeDefined();
        const map = readJson(path.join(MAPS_DIR, dir, 'map.json'));
        expect(traderOf(map, trader)).toHaveLength(1);
    });

    test.each(TRADERS.map(t => [t.town, t]))('%s: stands on a walkable, unoccupied tile that is not a warp', (_town, trader) => {
        const dir = mapDirs.get(trader.mapId);
        const map = readJson(path.join(MAPS_DIR, dir, 'map.json'));
        const [npc] = traderOf(map, trader);
        const grid = collisionGrid(map.layout);

        expect(grid[npc.y][npc.x]).toBe(0);   // walkable — an NPC on a wall tile is unreachable
        const others = (map.object_events || []).filter(o => o !== npc);
        expect(others.filter(o => o.x === npc.x && o.y === npc.y)).toEqual([]);
        expect((map.warp_events || []).filter(w => w.x === npc.x && w.y === npc.y)).toEqual([]);
    });

    test('every Pokémon Center puts its trader on the very same tile', () => {
        const centers = TRADERS.filter(t => t.mapId.endsWith('POKEMON_CENTER_1F'));
        expect(centers).toHaveLength(14);   // the fifteenth is the League's own lobby
        const tiles = centers.map(trader => {
            const map = readJson(path.join(MAPS_DIR, mapDirs.get(trader.mapId), 'map.json'));
            const [npc] = traderOf(map, trader);
            return `${npc.x},${npc.y}`;
        });
        expect(new Set(tiles).size).toBe(1);
    });

    test('no trader NPC is left behind on a town map (they all moved indoors)', () => {
        for (const [mapId, dir] of mapDirs) {
            if (TRADERS.some(t => t.mapId === mapId)) continue;
            const map = readJson(path.join(MAPS_DIR, dir, 'map.json'));
            const strays = (map.object_events || []).filter(o => /_EventScript_Trader$/.test(o.script || ''));
            expect(strays).toEqual([]);
        }
    });
});
