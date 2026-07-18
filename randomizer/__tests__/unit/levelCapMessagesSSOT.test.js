'use strict';

// T-151 — every on-screen level-cap fanfare message must read the cap from the SSOT: it prints
// {STR_VAR_1}, buffered from GetCurrentLevelCap() by `special BufferLevelCap` right before the message
// (which equals what LevelUpAllPokemonToCap raises the party to). This guards against anyone
// reintroducing a hard-coded "leveled up to <number>" that would silently drift from caps.c.

const fs = require('fs');
const path = require('path');

const MAPS = path.resolve(__dirname, '../../../data/maps');

function allIncFiles(dir) {
    const out = [];
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, entry.name);
        if (entry.isDirectory()) out.push(...allIncFiles(p));
        else if (entry.name.endsWith('.inc')) out.push(p);
    }
    return out;
}

describe('T-151 — level-cap fanfare messages are SSOT (from caps.c, not hard-coded)', () => {
    const files = allIncFiles(MAPS);
    const texts = files.map((f) => [path.relative(MAPS, f), fs.readFileSync(f, 'utf8')]);

    test('no map script hard-codes "leveled up to <number>"', () => {
        const offenders = texts.filter(([, t]) => /leveled up to \d/.test(t)).map(([rel]) => rel);
        expect(offenders).toEqual([]);
    });

    // B-038 — a level-cap fanfare must always accompany a level-cap message, i.e. be immediately
    // preceded by `waitmessage`. The stray duplicate fanfare after the Wally Lilycove battle violated
    // this (it fired with no message). Any future stray/duplicate fanfare trips this too.
    test('B-038: every `call …PlayLevelCapFanfare` is immediately preceded by `waitmessage`', () => {
        const offenders = [];
        for (const [rel, t] of texts) {
            const lines = t.split('\n');
            lines.forEach((line, i) => {
                if (/^\tcall Common_EventScript_PlayLevelCapFanfare\b/.test(line)) {
                    if (!/^\twaitmessage\b/.test(lines[i - 1] || '')) offenders.push(`${rel}:${i + 1}`);
                }
            });
        }
        expect(offenders).toEqual([]);
    });

    test('every message → waitmessage → PlayLevelCapFanfare block is preceded by `special BufferLevelCap`', () => {
        const offenders = [];
        for (const [rel, t] of texts) {
            const re = /\tmessage \w+\n\twaitmessage\n\tcall Common_EventScript_PlayLevelCapFanfare/g;
            let m;
            while ((m = re.exec(t)) !== null) {
                if (!t.slice(0, m.index).endsWith('\tspecial BufferLevelCap\n')) {
                    offenders.push(`${rel} @ ${m.index}`);
                }
            }
        }
        expect(offenders).toEqual([]);
    });
});
