// T-238 — Group-D toggles (Run & Bun mode + E4 quotas, Steven tag battle) are `setvar` immediates
// inside compiled map scripts: both branches are already in the base, one operand picks which runs.
// Locating that operand is the last T-232 leftover. It is found by scanning the script for its opcode,
// never by a hardcoded offset, and the var ids come from include/constants/vars.h (one home).
const path = require('path');
const { Rom } = require('../../injector/rom');
const {
    SCR_OP_SETVAR,
    findSetvarOperand,
    patchSetvar,
    varId,
    loadVarConstants,
    GROUP_D_VARS,
} = require('../../injector/scriptPatch');

const VARS_H = path.resolve(__dirname, '..', '..', '..', 'include', 'constants', 'vars.h');

// A fake compiled script: some filler, then `setvar VAR_DISABLE_STEVEN_TAG_BATTLE, 0`.
function romWithScript({ at = 0x100, id = 0x40a8, value = 0 } = {}) {
    const buf = Buffer.alloc(0x400, 0x00);
    buf.writeUInt8(0x6c, at);                    // some other command
    buf.writeUInt8(SCR_OP_SETVAR, at + 1);
    buf.writeUInt16LE(id, at + 2);
    buf.writeUInt16LE(value, at + 4);
    buf.writeUInt8(0x02, at + 6);                // end
    return Rom.fromBuffer(buf);
}

describe('the var-id SSOT (T-238)', () => {
    test('reads the real include/constants/vars.h instead of restating ids', () => {
        expect(varId('VAR_DISABLE_STEVEN_TAG_BATTLE')).toBe(0x40a8);
        expect(loadVarConstants(VARS_H).VAR_DISABLE_STEVEN_TAG_BATTLE).toBe(0x40a8);
    });

    test('every Group-D toggle var still exists in the header', () => {
        for (const name of GROUP_D_VARS) expect(typeof varId(name)).toBe('number');
    });

    test('an unknown var name throws instead of yielding undefined', () => {
        expect(() => varId('VAR_NOT_A_REAL_VAR')).toThrow(/VAR_NOT_A_REAL_VAR/);
    });
});

describe('findSetvarOperand (T-238)', () => {
    test('finds the immediate of the setvar for a given var', () => {
        const rom = romWithScript();
        expect(findSetvarOperand(rom, { at: 0x100, varId: 0x40a8 })).toBe(0x104);
    });

    test('accepts the var by name', () => {
        const rom = romWithScript();
        expect(findSetvarOperand(rom, { at: 0x100, var: 'VAR_DISABLE_STEVEN_TAG_BATTLE' })).toBe(0x104);
    });

    test('verifies the value the base currently holds — a mismatch means the wrong build', () => {
        const rom = romWithScript({ value: 0 });
        expect(() => findSetvarOperand(rom, { at: 0x100, varId: 0x40a8, expectValue: 1 }))
            .toThrow(/expected 1[\s\S]*found 0|value/i);
        expect(findSetvarOperand(rom, { at: 0x100, varId: 0x40a8, expectValue: 0 })).toBe(0x104);
    });

    test('not finding it inside the window is an error, not a silent no-op', () => {
        const rom = romWithScript();
        expect(() => findSetvarOperand(rom, { at: 0x100, varId: 0x40a9 })).toThrow(/0x40a9|not found/i);
        expect(() => findSetvarOperand(rom, { at: 0x100, varId: 0x40a8, limit: 2 })).toThrow(/not found/i);
    });

    test('two setvars for the same var in the window are ambiguous — refuse to guess', () => {
        const rom = romWithScript();
        rom.writeU8(0x120, SCR_OP_SETVAR, 'second');
        rom.writeU16(0x121, 0x40a8, 'second-var');
        expect(() => findSetvarOperand(rom, { at: 0x100, varId: 0x40a8 })).toThrow(/ambiguous|2 /i);
        // …unless the caller explicitly wants the first one.
        expect(findSetvarOperand(rom, { at: 0x100, varId: 0x40a8, requireUnique: false })).toBe(0x104);
    });
});

describe('patchSetvar (T-238)', () => {
    test('writes the new immediate and journals it', () => {
        const rom = romWithScript();
        const at = patchSetvar(rom, { at: 0x100, var: 'VAR_DISABLE_STEVEN_TAG_BATTLE', value: 1, tag: 'toggle:steven' });
        expect(at).toBe(0x104);
        expect(rom.readU16(0x104)).toBe(1);
        expect(rom.journal.at(-1)).toEqual({ offset: 0x104, length: 2, tag: 'toggle:steven' });
        // The var id itself must not have moved.
        expect(rom.readU16(0x102)).toBe(0x40a8);
    });

    test('a value that does not fit a u16 is rejected', () => {
        const rom = romWithScript();
        expect(() => patchSetvar(rom, { at: 0x100, varId: 0x40a8, value: 0x10000 })).toThrow(/range/i);
    });
});
