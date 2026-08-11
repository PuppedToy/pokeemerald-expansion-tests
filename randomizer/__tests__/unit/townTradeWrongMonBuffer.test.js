'use strict';

// B-051 — town trader "wrong mon" message shows "/<maxHP>" (e.g. "/314") instead of the requested
// species name.
//
// Both the offer text and the wrong-mon text print the requested species via {STR_VAR_1} = gStringVar1,
// buffered by `special BufferInGameTradeOffer`. The trader script buffers once near the top, then runs
// `special ChoosePartyMon` (the party menu) before the wrong-mon branch. The party menu clobbers
// gStringVar1 while drawing the HP bar (src/party_menu.c: StringCopy(gStringVar1, gText_Slash);
// StringAppend(gStringVar1, gStringVar2)  →  "/<maxHP>"). So the wrong-mon msgbox must RE-BUFFER before
// printing — the vanilla single-species scripts do exactly this (they re-buffer with
// `bufferspeciesname STR_VAR_1` before their wrong-mon message). T-194's data-driven town scripts
// omitted the re-buffer.
//
// T-269 — the four per-town copies of the flow became ONE shared script
// (data/scripts/town_traders.inc), which every trader's map stub jumps into, so this guard now watches
// that single block: the re-buffer can no longer be right in three towns and missing in the fourth.
//
// Structural guard (same approach as T-182 / B-039): the C engine + map scripts can't be built or run
// locally, so we assert the wrong-mon branch re-buffers the trade offer before its msgbox.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');
const TRADER_SCRIPT = 'data/scripts/town_traders.inc';

// Isolate the `Common_EventScript_TownTradeWrongMon::` block: from its label to the first `\n\tend`
// that follows (each branch ends with `release` / `end`).
function wrongMonBlock(content) {
    const label = 'Common_EventScript_TownTradeWrongMon::';
    const start = content.indexOf(label);
    if (start === -1) return null;
    const endIdx = content.indexOf('\n\tend', start);
    return content.slice(start, endIdx === -1 ? undefined : endIdx + '\n\tend'.length);
}

const script = () => fs.readFileSync(path.join(ROOT, TRADER_SCRIPT), 'utf8');

describe('B-051 — the town trade wrong-mon branch re-buffers the requested species name', () => {
    test('the wrong-mon branch exists and calls msgbox on its own text', () => {
        const block = wrongMonBlock(script());
        expect(block).not.toBeNull();
        expect(block).toMatch(/msgbox\s+Common_Text_TownTradeWrongMon\b/);
    });

    test('re-buffers gStringVar1 (BufferInGameTradeOffer) before the wrong-mon msgbox', () => {
        const block = wrongMonBlock(script());
        expect(block).not.toBeNull();

        const bufferIdx = block.search(/special\s+BufferInGameTradeOffer\b/);
        const msgboxIdx = block.search(/msgbox\s+Common_Text_TownTradeWrongMon\b/);

        // The re-buffer must be present AND precede the message that prints {STR_VAR_1}; otherwise the
        // message inherits the party menu's leftover "/<maxHP>" string in gStringVar1 (the B-051 symptom).
        expect(bufferIdx).toBeGreaterThanOrEqual(0);
        expect(msgboxIdx).toBeGreaterThanOrEqual(0);
        expect(bufferIdx).toBeLessThan(msgboxIdx);
    });

    test('every trader goes through that one flow — no town keeps its own copy', () => {
        const { TRADERS } = require('../../trades');
        const shared = script();
        expect(shared).toContain('Common_EventScript_TownTrader::');

        for (const trader of TRADERS) {
            // MAP_RUSTBORO_CITY_POKEMON_CENTER_1F → data/maps/RustboroCity_PokemonCenter_1F/scripts.inc
            const dir = fs.readdirSync(path.join(ROOT, 'data', 'maps'))
                .find(name => mapConstant(name) === trader.mapId);
            expect(dir).toBeDefined();
            const stub = fs.readFileSync(path.join(ROOT, 'data', 'maps', dir, 'scripts.inc'), 'utf8');
            expect(stub).toMatch(new RegExp(`setvar VAR_0x8008, ${trader.ingameTradeId}\\n\\tgoto Common_EventScript_TownTrader`));
            expect(stub).not.toMatch(/BufferInGameTradeOffer/);   // the flow lives in one place only
        }
    });
});

// `RustboroCity_PokemonCenter_1F` → `MAP_RUSTBORO_CITY_POKEMON_CENTER_1F` (the map.json id is the SSOT,
// but deriving it keeps this test from needing every map's JSON).
function mapConstant(dirName) {
    const file = path.join(ROOT, 'data', 'maps', dirName, 'map.json');
    if (!fs.existsSync(file)) return null;
    return JSON.parse(fs.readFileSync(file, 'utf8')).id;
}
