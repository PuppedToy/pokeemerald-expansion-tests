'use strict';

/**
 * gameConstants — the base's own `include/constants/*.h` as a name→number table (T-239).
 *
 * A bundle speaks names (`SPECIES_BULBASAUR`, `MOVE_POUND`, `ITEM_TM01`, `DAMAGE_CATEGORY_SPECIAL`);
 * the ROM speaks numbers. Those numbers have exactly one home — the headers the base was compiled
 * from — so they are read from there rather than re-typed into JS, for the same reason offsets come
 * from the build's `.map` (ADR-012: an upstream sync renumbers species, and a stale copy here would
 * write Ivysaur's stats onto Venusaur without ever failing).
 *
 * Two forms matter: `#define NAME value` (species / moves / items / abilities / types) and `enum { … }`
 * (move categories, evolution methods and conditions). Everything else — function-like macros,
 * multi-line macros, struct bodies — is deliberately ignored.
 *
 * Every lookup is either an exact number or an exception naming the constant: `get()` for "may be
 * absent", `require()` for "must exist". There is no fallback value, because a plausible-looking wrong
 * id is exactly the failure this table exists to prevent.
 */

const path = require('path');
const { CONSTANT_HEADERS, treeSources } = require('./sources');

/**
 * The headers that hold every id the migrated modules write. They live in `sources.js` with the rest of
 * the injector's source paths (T-249) and are re-exported here, where every caller already looks.
 */
const DEFAULT_HEADERS = CONSTANT_HEADERS;


// A `#define` of a plain constant: no `(` directly after the name (that is a function-like macro).
const DEFINE_RE = /^\s*#\s*define\s+([A-Za-z_]\w*)(?![\w(])\s*(.*)$/;
// `enum`, optionally `PACKED` / `: u8` / a tag, opening a body. `struct`/`union` bodies must not match.
const ENUM_OPEN_RE = /(^|[^\w])enum\b[^{;]*\{/;
// The same, with the brace on the NEXT line (the base's usual style). Parentheses exclude the other
// thing that opens a brace on the following line: a function returning an enum
// (`static inline enum TMHMIndex GetItemTMHMIndex(u16 item)`), whose body is not a list of constants.
const ENUM_DECL_RE = /(^|[^\w])enum\b[^;{()]*$/;

/** Strip block comments, then per-line `//` comments. Keeps line structure (continuations matter). */
function stripComments(text) {
    const noBlocks = text.replace(/\/\*[\s\S]*?\*\//g, ' ');
    return noBlocks.split('\n').map(line => line.replace(/\/\/.*$/, '')).join('\n');
}

/**
 * Parse one header's text into `Map<name, { raw, ambiguous }>`.
 *
 * `ambiguous` marks a name defined twice with *different* text — i.e. the two arms of an `#if`. This
 * parser deliberately does not evaluate the preprocessor, so it cannot know which arm the base
 * compiled; asking for such a name throws instead of silently taking the last one.
 */
function parseConstantHeader(text) {
    const defs = new Map();
    const clean = stripComments(text);

    const record = (name, raw) => {
        const value = String(raw).trim();
        if (!value) return;
        const prev = defs.get(name);
        if (prev && prev.raw !== value) prev.ambiguous = true;
        else if (!prev) defs.set(name, { raw: value, ambiguous: false });
    };

    const lines = clean.split('\n');
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];

        // A multi-line macro (trailing `\`) is never a constant — skip it and its continuations.
        if (/^\s*#\s*define\b/.test(line) && /\\\s*$/.test(line)) {
            while (i < lines.length && /\\\s*$/.test(lines[i])) i++;
            continue;
        }

        const define = line.match(DEFINE_RE);
        if (define) {
            record(define[1], define[2]);
            continue;
        }

        let openLine = line;
        if (!ENUM_OPEN_RE.test(line)) {
            if (!ENUM_DECL_RE.test(line)) continue;
            // `enum Foo` on one line, `{` on the next — find that brace, or this was not an enum body.
            let peek = i + 1;
            while (peek < lines.length && lines[peek].trim() === '') peek += 1;
            if (peek >= lines.length || !lines[peek].trim().startsWith('{')) continue;
            i = peek;
            openLine = lines[i];
        }

        // Collect the enum body up to its closing brace (bodies here are flat — no nesting).
        let body = openLine.slice(openLine.indexOf('{') + 1);
        while (!body.includes('}') && i + 1 < lines.length) body += `\n${lines[++i]}`;
        body = body.slice(0, body.indexOf('}'));

        let implicit = 0;
        for (const member of body.split(',')) {
            const m = member.match(/^\s*([A-Za-z_]\w*)\s*(?:=\s*(.+?))?\s*$/);
            if (!m) continue;
            if (m[2] === undefined) {
                record(m[1], String(implicit));
                implicit += 1;
            } else {
                record(m[1], m[2]);
                // The next implicit member counts on from this one; only a numeric value lets us
                // continue locally — otherwise the value is `<name> + 1` and stays symbolic.
                const asNumber = parseNumber(m[2].trim());
                implicit = asNumber !== undefined ? asNumber + 1 : NaN;
                if (Number.isNaN(implicit)) implicit = `${m[1]} + 1`;
            }
        }
    }
    return defs;
}

/** A C integer literal (decimal or hex, with an optional u/U/l/L suffix), or undefined. */
function parseNumber(token) {
    if (/^0[xX][0-9a-fA-F]+[uUlL]*$/.test(token)) return parseInt(token, 16);
    if (/^-?\d+[uUlL]*$/.test(token)) return parseInt(token, 10);
    return undefined;
}

/**
 * Tokens an id expression may contain. Anything else (`?`, `>=`, `*`, …) is not resolvable here.
 *
 * `|` and `<<` are here for the map ids (`#define MAP_ROUTE101 (16 | (0 << 8))`, T-242). They are still
 * pure integer arithmetic over literals and other constants — the thing this parser refuses is a value
 * that depends on build configuration, and adding two more operators does not weaken that.
 */
const TOKEN_RE = /\s*(0[xX][0-9a-fA-F]+[uUlL]*|\d+[uUlL]*|[A-Za-z_]\w*|<<|>>|[()+|-])/g;

function tokenize(expr) {
    const tokens = [];
    let index = 0;
    while (index < expr.length) {
        TOKEN_RE.lastIndex = index;
        const m = TOKEN_RE.exec(expr);
        if (!m || m.index !== index) return null;   // unsupported character → not a constant expression
        tokens.push(m[1]);
        index = TOKEN_RE.lastIndex;
    }
    return tokens;
}

class ConstantTable {
    /** @param {Map<string, {raw: string, ambiguous?: boolean}>} defs */
    constructor(defs = new Map()) {
        this.defs = defs;
        this.cache = new Map();
    }

    /** Fold another header's definitions in. A conflicting redefinition becomes ambiguous, not last-wins. */
    merge(other) {
        const defs = other instanceof ConstantTable ? other.defs : other;
        for (const [name, def] of defs) {
            const prev = this.defs.get(name);
            if (!prev) this.defs.set(name, { ...def });
            else if (prev.raw !== def.raw || def.ambiguous) prev.ambiguous = true;
        }
        this.cache.clear();
        return this;
    }

    has(name) {
        return this.get(name) !== undefined;
    }

    /** The number, or undefined when the constant is absent or not a resolvable integer expression. */
    get(name) {
        try {
            return this.resolve(name, new Set());
        } catch {
            return undefined;
        }
    }

    /** The number, or an Error naming the constant and why it could not be resolved. */
    require(name) {
        const value = this.resolve(name, new Set());
        if (value === undefined) throw new Error(`gameConstants: '${name}' is not defined in the base headers`);
        return value;
    }

    resolve(name, seen) {
        if (this.cache.has(name)) return this.cache.get(name);
        const def = this.defs.get(name);
        if (!def) return undefined;
        if (def.ambiguous) {
            throw new Error(
                `gameConstants: '${name}' is ambiguous — defined more than once with different values ` +
                `(a conditional #if arm). Resolve it from the build's own configuration, not from here.`);
        }
        if (seen.has(name)) throw new Error(`gameConstants: definition cycle resolving '${name}' (${[...seen].join(' → ')})`);
        seen.add(name);
        const value = this.evaluate(def.raw, seen, name);
        seen.delete(name);
        this.cache.set(name, value);
        return value;
    }

    evaluate(expr, seen, owner) {
        const tokens = tokenize(expr);
        if (!tokens) {
            throw new Error(`gameConstants: '${owner}' = "${expr}" is not a plain integer expression ` +
                `(it depends on build configuration) — read that value from the base build instead`);
        }
        let position = 0;
        const self = this;

        const primary = () => {
            const token = tokens[position];
            if (token === undefined) throw new Error(`gameConstants: '${owner}' = "${expr}" is incomplete`);
            position += 1;
            if (token === '(') {
                const inner = bitOr();
                if (tokens[position] !== ')') throw new Error(`gameConstants: '${owner}' = "${expr}" has unbalanced parentheses`);
                position += 1;
                return inner;
            }
            if (token === '-') return -primary();
            if (token === '+') return primary();
            const literal = parseNumber(token);
            if (literal !== undefined) return literal;
            const referenced = self.resolve(token, seen);
            if (referenced === undefined) {
                throw new Error(`gameConstants: '${owner}' = "${expr}" references unknown constant '${token}'`);
            }
            return referenced;
        };

        const sum = () => {
            let value = primary();
            while (tokens[position] === '+' || tokens[position] === '-') {
                const op = tokens[position++];
                const rhs = primary();
                value = op === '+' ? value + rhs : value - rhs;
            }
            return value;
        };

        // C precedence: `|` binds loosest, then the shifts, then `+`/`-`.
        const shift = () => {
            let value = sum();
            while (tokens[position] === '<<' || tokens[position] === '>>') {
                const op = tokens[position++];
                const rhs = sum();
                value = op === '<<' ? value << rhs : value >> rhs;
            }
            return value;
        };

        const bitOr = () => {
            let value = shift();
            while (tokens[position] === '|') {
                position += 1;
                value |= shift();
            }
            return value;
        };

        const result = bitOr();
        if (position !== tokens.length) {
            throw new Error(`gameConstants: '${owner}' = "${expr}" is not a plain integer expression`);
        }
        return result;
    }
}

/**
 * Load the constant headers of the tree the base was built from.
 *
 * @param {object}   [opts]
 * @param {string}   [opts.root]    repo root (defaults to this file's repo)
 * @param {string[]} [opts.headers] header paths relative to `root`
 * @param {import('./sources').BaseSources} [opts.sources]  read the headers from these instead of the
 *        disk (T-249) — how the browser gets them; `root` is then only a label.
 * @returns {ConstantTable}
 */
function loadGameConstants({ root = path.resolve(__dirname, '..', '..'), headers = DEFAULT_HEADERS, sources = null } = {}) {
    const table = new ConstantTable();
    const from = sources || treeSources({ root });
    for (const rel of headers) table.merge(parseConstantHeader(from.read(rel)));
    return table;
}

module.exports = {
    parseConstantHeader,
    ConstantTable,
    loadGameConstants,
    DEFAULT_HEADERS,
};
