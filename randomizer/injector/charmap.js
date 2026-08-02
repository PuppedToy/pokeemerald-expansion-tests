'use strict';

/**
 * charmap — the game's own text encoding, for the names the randomizer bakes into the ROM (T-242).
 *
 * `_("Milos")` is not ASCII: the preprocessor maps every character through `charmap.txt` ('A' = 0xBB,
 * ' ' = 0x00, 'a' = 0xD5) and terminates the string with EOS. Writing `Buffer.from(name)` instead would
 * produce a ROM whose nicknames are garbage of exactly the right length — a difference no size check
 * would catch. So the table is read from `charmap.txt` itself, never re-typed here (ADR-012), and the
 * terminator comes from `include/constants/characters.h`.
 *
 * Only single-character entries are kept. charmap.txt also names multi-byte sequences and non-text
 * symbols (`SE_RG_SHOP = FF 00`), which are not characters and must not shadow one.
 */

const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..', '..');

// `'A'         = BB` — a quoted single character mapped to one byte. Anything else in the file
// (multi-byte sequences, symbolic names) is not a character mapping.
const CHAR_LINE = /^'(.)'\s*=\s*([0-9A-Fa-f]{2})\s*$/;
const EOS_DEFINE = /^\s*#define\s+EOS\s+(0[xX][0-9A-Fa-f]+|\d+)/m;

class Charmap {
    constructor(chars, eos) {
        this.chars = chars;
        this.eos = eos;
    }

    get(character) { return this.chars.get(character); }
    get size() { return this.chars.size; }
}

/** Parse `charmap.txt` + the EOS constant into a `Charmap`. */
function loadCharmap({ root = REPO_ROOT } = {}) {
    const text = fs.readFileSync(path.resolve(root, 'charmap.txt'), 'utf8');
    const chars = new Map();
    for (const line of text.split('\n')) {
        const match = line.replace(/@.*$/, '').match(CHAR_LINE);
        if (!match) continue;
        // First definition wins: charmap.txt maps some bytes twice (a control code reusing a glyph),
        // and the earlier entry is the one the preprocessor uses for that character.
        if (!chars.has(match[1])) chars.set(match[1], parseInt(match[2], 16));
    }
    if (chars.size === 0) throw new Error('injector/charmap: charmap.txt held no single-character mappings');

    const characters = fs.readFileSync(path.resolve(root, 'include', 'constants', 'characters.h'), 'utf8');
    const eos = characters.match(EOS_DEFINE);
    if (!eos) throw new Error('injector/charmap: EOS is not defined in include/constants/characters.h');

    return new Charmap(chars, Number(eos[1]));
}

/**
 * One fixed-width string field: the encoded characters, EOS, then zeros — exactly what the compiler
 * puts in a `u8 name[WIDTH]` initialised with `_("…")`.
 *
 * @param {Charmap} charmap
 * @param {string} text   already sanitized by the writer ([A-Za-z0-9 ], ≤ POKEMON_NAME_LENGTH)
 * @param {number} width  the field's size in bytes, terminator included
 */
function encodeString(charmap, text, width) {
    const value = String(text ?? '');
    const buffer = Buffer.alloc(width, 0);
    if (value.length + 1 > width) {
        throw new Error(
            `injector/charmap: "${value}" needs ${value.length + 1} bytes (with EOS) and does not fit a ` +
            `${width} byte field. The writer sanitizes names to fit; this one did not come through it.`);
    }
    [...value].forEach((character, i) => {
        const byte = charmap.get(character);
        if (byte === undefined) {
            throw new Error(
                `injector/charmap: '${character}' (in "${value}") is not in the charmap, so the compile ` +
                `path could not encode it either.`);
        }
        buffer.writeUInt8(byte, i);
    });
    buffer.writeUInt8(charmap.eos, value.length);
    return buffer;
}

module.exports = { loadCharmap, encodeString, Charmap, REPO_ROOT };
