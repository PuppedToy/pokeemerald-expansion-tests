'use strict';

// T-247 — guard against dead multichoice weight coming back.
//
// The T-235/T-236 migration made every randomizer-driven menu data-driven (gItemPicks[] + the shared
// scripts in data/scripts/randomizer_picks.inc), which orphaned 52 MULTI_* ids and their
// MultichoiceList_* label arrays. They were deleted; these tests keep the tables honest:
//   1. every MULTI_* id is used by a script or by C code (except upstream's own dead ids, listed below),
//   2. sMultichoiceLists[] has no row pointing at a missing list, and no list is defined for nobody.
//
// A failure here means either a genuinely unused menu was added, or a menu lost its last caller.

const fs = require('fs');
const path = require('path');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const CONSTANTS_FILE = path.join(ROOT, 'include', 'constants', 'script_menu.h');
const DATA_FILE = path.join(ROOT, 'src', 'data', 'script_menu.h');

// Upstream (pret / RHH) ships these unused — not ours to delete, and they must stay put so the
// remaining ids keep their numeric values.
const UPSTREAM_ORPHANS = new Set([
    'MULTI_UNUSED_9', 'MULTI_UNUSED_10', 'MULTI_UNUSED_15', 'MULTI_UNUSED_19', 'MULTI_UNUSED_21',
    'MULTI_UNUSED_22', 'MULTI_UNUSED_40', 'MULTI_UNUSED_41', 'MULTI_UNUSED_ASH_VENDOR', 'MULTI_UNUSED_51',
    'MULTI_UNUSED_SSTIDAL_1', 'MULTI_UNUSED_SSTIDAL_2', 'MULTI_UNUSED_SSTIDAL_3', 'MULTI_UNUSED_SSTIDAL_4',
    'MULTI_SHARDS_R', 'MULTI_SHARDS_Y', 'MULTI_SHARDS_RY', 'MULTI_SHARDS_B', 'MULTI_SHARDS_RB',
    'MULTI_SHARDS_YB', 'MULTI_SHARDS_RYB', 'MULTI_SHARDS_G', 'MULTI_SHARDS_RG', 'MULTI_SHARDS_YG',
    'MULTI_SHARDS_RYG', 'MULTI_SHARDS_BG', 'MULTI_SHARDS_RBG', 'MULTI_SHARDS_YBG', 'MULTI_SHARDS_RYBG',
]);

// Where a menu can legitimately be invoked from: map/common scripts and engine C code. The two
// script_menu tables themselves don't count as "use" — that is what makes an id an orphan.
const SEARCH_ROOTS = [
    { dir: path.join(ROOT, 'data'), exts: ['.inc', '.json', '.s'] },
    { dir: path.join(ROOT, 'src'), exts: ['.c'] },
];
const EXCLUDED_DIRS = new Set(['pokemon', 'maps_old']);

function collectReferences() {
    const found = new Set();
    const walk = (dir, exts) => {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) {
                if (!EXCLUDED_DIRS.has(entry.name)) walk(full, exts);
                continue;
            }
            if (!exts.includes(path.extname(entry.name))) continue;
            if (full === DATA_FILE) continue;
            const text = fs.readFileSync(full, 'utf8');
            if (!text.includes('MULTI_')) continue;
            for (const m of text.matchAll(/\bMULTI_[A-Z0-9_]+\b/g)) found.add(m[0]);
        }
    };
    for (const { dir, exts } of SEARCH_ROOTS) walk(dir, exts);
    return found;
}

describe('script_menu tables carry no dead weight (T-247)', () => {
    const constants = fs.readFileSync(CONSTANTS_FILE, 'utf8');
    const data = fs.readFileSync(DATA_FILE, 'utf8');

    const ids = [...constants.matchAll(/^#define (MULTI_[A-Z0-9_]+)\s+\d+/gm)].map((m) => m[1]);
    const rows = [...data.matchAll(/^\s*\[(MULTI_[A-Z0-9_]+)\]\s*=\s*MULTICHOICE\((\w+)\)/gm)]
        .map((m) => ({ id: m[1], list: m[2] }));
    const listDefs = [...data.matchAll(/^static const struct MenuAction (\w+)\[\]/gm)].map((m) => m[1]);

    test('every MULTI_* id is reachable from a script or from C code', () => {
        const referenced = collectReferences();
        const orphans = ids.filter((id) => !referenced.has(id) && !UPSTREAM_ORPHANS.has(id));
        expect(orphans).toEqual([]);
    });

    test('every sMultichoiceLists row names a defined MULTI_* id and an existing list', () => {
        expect(rows.length).toBeGreaterThan(0);
        const defined = new Set(ids);
        const lists = new Set(listDefs);
        expect(rows.filter((r) => !defined.has(r.id)).map((r) => r.id)).toEqual([]);
        expect(rows.filter((r) => !lists.has(r.list)).map((r) => r.list)).toEqual([]);
    });

    test('every MultichoiceList_* definition is used by at least one row or by C code', () => {
        const usedByRow = new Set(rows.map((r) => r.list));
        const scriptMenuC = fs.readFileSync(path.join(ROOT, 'src', 'script_menu.c'), 'utf8');
        const unused = listDefs.filter((name) => {
            if (usedByRow.has(name)) return false;
            // a list may also be referenced directly by the engine (dynamic menus)
            const body = new RegExp(`static const struct MenuAction ${name}\\[\\][\\s\\S]*?\\n\\};`);
            return !new RegExp(`\\b${name}\\b`).test(data.replace(body, '')) && !scriptMenuC.includes(name);
        });
        expect(unused).toEqual([]);
    });
});
