// T-242 — the game's text encoding, read from charmap.txt.
//
// Every name the randomizer bakes into the ROM (`_("Milos")`) goes through the preprocessor's charmap,
// not ASCII: 'A' is 0xBB, ' ' is 0x00, and the string ends with EOS (0xFF). An injector that wrote
// Buffer.from(name) would produce a ROM full of garbled nicknames that still LOOKS right in a hex diff
// of the right length, so this is pinned against the real charmap.txt and the real EOS constant.
const path = require('path');
const { loadCharmap, encodeString } = require('../../injector/charmap');

const ROOT = path.resolve(__dirname, '..', '..', '..');
const charmap = loadCharmap({ root: ROOT });

describe('the charmap itself', () => {
    test('is read from charmap.txt, never re-typed here', () => {
        expect(charmap.get('A')).toBe(0xbb);
        expect(charmap.get('a')).toBe(0xd5);
        expect(charmap.get('0')).toBe(0xa1);
        expect(charmap.get(' ')).toBe(0x00);
        expect(charmap.eos).toBe(0xff);
    });

    test('covers every character the nickname sanitizer allows', () => {
        // sanitizeNickname keeps [A-Za-z0-9 ] — if any of those had no mapping, a legal nickname would
        // be unencodable at inject time only.
        const allowed = ' 0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
        for (const ch of allowed) expect(charmap.get(ch)).toBeDefined();
    });
});

describe('encoding a name into a fixed-width field', () => {
    test('is the characters, then EOS, then zeros to the field width', () => {
        const buffer = encodeString(charmap, 'AB', 13);
        expect(buffer).toHaveLength(13);
        expect([...buffer.subarray(0, 4)]).toEqual([0xbb, 0xbc, 0xff, 0x00]);
        expect(buffer.subarray(3).every(byte => byte === 0)).toBe(true);
    });

    test('an empty name is just the terminator — the committed default for every naming table', () => {
        expect([...encodeString(charmap, '', 13).subarray(0, 2)]).toEqual([0xff, 0x00]);
    });

    test('a name exactly filling the field still gets its terminator', () => {
        // POKEMON_NAME_LENGTH is 12 and the field is 13 bytes, so a 12-character name fits with EOS.
        const buffer = encodeString(charmap, 'ABCDEFGHIJKL', 13);
        expect(buffer[11]).toBe(charmap.get('L'));
        expect(buffer[12]).toBe(charmap.eos);
    });

    test('a name too long for its field is refused rather than truncated into the next one', () => {
        expect(() => encodeString(charmap, 'ABCDEFGHIJKLM', 13)).toThrow(/does not fit a 13 byte field/i);
    });

    test('a character the charmap has no entry for is refused, not silently dropped', () => {
        // '#' has no glyph in the game's font. (The sanitizer would never let one through — this is the
        // backstop for the day something reaches the encoder without being sanitized.)
        expect(() => encodeString(charmap, 'A#B', 13)).toThrow(/not in the charmap/i);
    });
});
