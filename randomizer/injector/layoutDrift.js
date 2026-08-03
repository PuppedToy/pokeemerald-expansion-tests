'use strict';

/**
 * layoutDrift — INV-LAYOUT, the tripwire B-057 left behind (T-248).
 *
 * A compiled ROM is not laid out like the base. One `const u16` element in `gStarterExtraMon` changing
 * value adds four bytes of generated code and moves 41,382 of 48,406 symbols — an LTO codegen decision
 * reacting to data ([[B-057]]). T-248 accepted that rather than fighting it: the gate compares each
 * table's **data** at each build's own address, and image equality was never required, only convenient.
 *
 * Accepting it costs us a check, so this restores a narrower one. The distinction that matters:
 *
 * | drift | why | verdict |
 * |---|---|---|
 * | a symbol MOVED, same size | `.text` grew somewhere earlier | **benign** — injection reads the base's own `.map`, and the base cannot react to data that does not exist yet |
 * | an **injectable** table RESIZED | its capacity depends on the data it carries | **fatal** — the whole fixed-capacity premise of T-237 is gone, and injection would write past a slot |
 * | an **injectable** table VANISHED | LTO folded a value and garbage-collected the table | **fatal** — the T-234/T-237 trap; injecting it becomes a silent no-op |
 * | a non-injectable symbol resized | ordinary codegen | noise, counted and ignored |
 *
 * So this is not a stability requirement. It is the alarm for the day the drift changes character, which
 * is the one variant nothing else in the harness would notice.
 */

/**
 * @param {object} args
 * @param {{get: Function, symbols: object}} args.baseMap      the base build's symbols
 * @param {{get: Function, symbols: object}} args.compiledMap   a compiled bundle's symbols
 * @param {string[]} args.injectable   the symbols a module writes into (registry-derived)
 */
function compareLayout({ baseMap, compiledMap, injectable = [] }) {
    const injectableSet = new Set(injectable);
    const dangerous = [];
    let compared = 0;
    let moved = 0;
    let resizedOther = 0;
    let firstMoved = null;

    for (const [name, base] of Object.entries(baseMap.symbols)) {
        const compiledSym = compiledMap.get(name);
        if (!compiledSym) {
            if (injectableSet.has(name)) dangerous.push({ name, kind: 'missing', baseSize: base.size });
            continue;
        }
        compared += 1;

        if (base.size !== compiledSym.size) {
            if (injectableSet.has(name)) {
                dangerous.push({ name, kind: 'resized', baseSize: base.size, compiledSize: compiledSym.size });
            } else {
                resizedOther += 1;
            }
        }

        if (base.romOffset !== compiledSym.romOffset) {
            moved += 1;
            if (!firstMoved) {
                firstMoved = {
                    name,
                    from: base.romOffset,
                    to: compiledSym.romOffset,
                    delta: compiledSym.romOffset - base.romOffset,
                };
            }
        }
    }

    return { compared, moved, resizedOther, dangerous, firstMoved, ok: dangerous.length === 0 };
}

/** One human-readable block for the gate's output. */
function formatLayoutDrift(drift) {
    const lines = [];
    const pct = drift.compared ? (100 * drift.moved / drift.compared).toFixed(1) : '0.0';
    lines.push(`INV-LAYOUT: ${drift.moved.toLocaleString()} of ${drift.compared.toLocaleString()} symbols moved (${pct} %)`
        + `${drift.firstMoved ? `, first ${drift.firstMoved.name} ${drift.firstMoved.delta >= 0 ? '+' : ''}${drift.firstMoved.delta} B` : ''}`);
    if (drift.resizedOther) lines.push(`  ${drift.resizedOther} non-injectable symbol(s) changed size — ordinary codegen, ignored`);

    if (drift.ok) {
        lines.push('  OK — no injectable table moved shape. A moved layout is expected and benign (B-057):');
        lines.push('       injection writes into the base at the base\'s own offsets, so drift in a *compiled*');
        lines.push('       ROM cannot affect it. Only a resized or vanished injectable table would.');
    } else {
        lines.push('  FAIL — INV-LAYOUT: an injectable table changed shape, which breaks injection itself:');
        for (const d of drift.dangerous) {
            lines.push(d.kind === 'missing'
                ? `       ${d.name} is GONE from the compiled build (was ${d.baseSize} B) — LTO garbage-collected it (cf. T-234/T-237)`
                : `       ${d.name} is ${d.compiledSize} B compiled vs ${d.baseSize} B in the base — its size depends on its data (T-237's premise is broken)`);
        }
    }
    return lines.join('\n');
}

module.exports = { compareLayout, formatLayoutDrift };
