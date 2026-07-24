'use strict';

// B-051 — town trader "wrong mon" message shows "/<maxHP>" (e.g. "/314") instead of the requested
// species name.
//
// Both the offer text and the wrong-mon text print the requested species via {STR_VAR_1} = gStringVar1,
// buffered by `special BufferInGameTradeOffer`. The town scripts buffer once near the top, then run
// `special ChoosePartyMon` (the party menu) before the wrong-mon branch. The party menu clobbers
// gStringVar1 while drawing the HP bar (src/party_menu.c: StringCopy(gStringVar1, gText_Slash);
// StringAppend(gStringVar1, gStringVar2)  →  "/<maxHP>"). So the wrong-mon msgbox must RE-BUFFER before
// printing — the vanilla single-species scripts do exactly this (RustboroCity_House1 re-buffers with
// `bufferspeciesname STR_VAR_1` before its wrong-mon message). T-194's data-driven town scripts omitted
// the re-buffer.
//
// Structural guard (same approach as T-182 / B-039): the C engine + map scripts can't be built or run
// locally, so we assert each town's wrong-mon branch re-buffers the trade offer before its msgbox.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '../../..');

const TOWNS = [
    { town: 'Dewford',   file: 'data/maps/DewfordTown/scripts.inc',   prefix: 'DewfordTown' },
    { town: 'Lavaridge', file: 'data/maps/LavaridgeTown/scripts.inc', prefix: 'LavaridgeTown' },
    { town: 'Fortree',   file: 'data/maps/FortreeCity/scripts.inc',   prefix: 'FortreeCity' },
    { town: 'Mossdeep',  file: 'data/maps/MossdeepCity/scripts.inc',  prefix: 'MossdeepCity' },
];

// Isolate the `<prefix>_EventScript_TradeWrongMon::` block: from its label to the first `\n\tend`
// that follows (each branch ends with `release` / `end`).
function wrongMonBlock(content, prefix) {
    const label = `${prefix}_EventScript_TradeWrongMon::`;
    const start = content.indexOf(label);
    if (start === -1) return null;
    const endIdx = content.indexOf('\n\tend', start);
    return content.slice(start, endIdx === -1 ? undefined : endIdx + '\n\tend'.length);
}

describe('B-051 — town trade wrong-mon branch re-buffers the requested species name', () => {
    test.each(TOWNS)('$town: wrong-mon branch exists and calls msgbox on its own text', ({ file, prefix }) => {
        const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
        const block = wrongMonBlock(content, prefix);
        expect(block).not.toBeNull();
        expect(block).toMatch(new RegExp(`msgbox\\s+${prefix}_Text_TradeWrongMon\\b`));
    });

    test.each(TOWNS)('$town: re-buffers gStringVar1 (BufferInGameTradeOffer) before the wrong-mon msgbox', ({ file, prefix }) => {
        const content = fs.readFileSync(path.join(ROOT, file), 'utf8');
        const block = wrongMonBlock(content, prefix);
        expect(block).not.toBeNull();

        const bufferIdx = block.search(/special\s+BufferInGameTradeOffer\b/);
        const msgboxIdx = block.search(new RegExp(`msgbox\\s+${prefix}_Text_TradeWrongMon\\b`));

        // The re-buffer must be present AND precede the message that prints {STR_VAR_1}; otherwise the
        // message inherits the party menu's leftover "/<maxHP>" string in gStringVar1 (the B-051 symptom).
        expect(bufferIdx).toBeGreaterThanOrEqual(0);
        expect(msgboxIdx).toBeGreaterThanOrEqual(0);
        expect(bufferIdx).toBeLessThan(msgboxIdx);
    });
});
