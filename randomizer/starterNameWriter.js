'use strict';

// T-068 — turn a bundle's per-ROM `starterNaming` into the four starter_choose.c code blocks and
// splice them in. This is the LAST line of defence before untrusted bundle data becomes C source, so
// every nickname is sanitized to [A-Za-z0-9 ] and capped at POKEMON_NAME_LENGTH (12). The genders map
// to the game's MON_MALE / MON_FEMALE / MON_GENDERLESS constants; the maker forces gender only where
// the species allows it (genderless/fixed-gender mons keep their real gender — handled in C).
//
// The committed src/starter_choose.c ships vanilla defaults (empty name, MON_GENDERLESS) so an
// un-rewritten build is unchanged. The DEFAULT_* / defaultExtra*() strings below MUST match those
// committed blocks byte-for-byte or the .replace() silently no-ops (same contract as writer.js's
// starterMonText / starterExtraMonText).

const MAX_NICKNAME = 12; // include/constants/global.h POKEMON_NAME_LENGTH
const DEFAULT_EXTRA_COUNT = 9; // committed STARTER_EXTRA_COUNT in src/starter_choose.c

function sanitizeNickname(name) {
    if (typeof name !== 'string') return '';
    return name.replace(/[^A-Za-z0-9 ]/g, '').trim().slice(0, MAX_NICKNAME);
}

function genderConst(gender) {
    if (gender === 'M') return 'MON_MALE';
    if (gender === 'F') return 'MON_FEMALE';
    return 'MON_GENDERLESS';
}

// ── Committed-default block text (byte-for-byte with src/starter_choose.c) ────
const DEFAULT_STARTER_NICKNAME = 'static const u8 sStarterNickname[] = _("");';
const DEFAULT_STARTER_GENDER = 'static const u8 sStarterGender = MON_GENDERLESS;';

function defaultExtraNicknames(count) {
    const lines = Array.from({ length: count }, () => '    COMPOUND_STRING(""),');
    return `static const u8 *const sStarterExtraNicknames[STARTER_EXTRA_COUNT] =\n{\n${lines.join('\n')}\n};`;
}
function defaultExtraGenders(count) {
    const lines = Array.from({ length: count }, () => '    MON_GENDERLESS,');
    return `static const u8 sStarterExtraGenders[STARTER_EXTRA_COUNT] =\n{\n${lines.join('\n')}\n};`;
}

// Build the four replacement blocks for one ROM's naming. `extraCount` = the ROM's actual number of
// extra starters (== STARTER_EXTRA_COUNT that writer.js writes); pad with defaults if `naming` is short.
function buildStarterNameCode(naming, extraCount) {
    const starter = naming && naming.starter;
    const extras = (naming && naming.extras) || [];

    const nickLines = [];
    const genderLines = [];
    for (let i = 0; i < extraCount; i++) {
        const e = extras[i];
        // Pointer-array element → COMPOUND_STRING compound literal, NOT a bare _() brace-list (B-020).
        nickLines.push(`    COMPOUND_STRING("${sanitizeNickname(e && e.nickname)}"),`);
        genderLines.push(`    ${genderConst(e && e.gender)},`);
    }

    return {
        starterNickname: `static const u8 sStarterNickname[] = _("${sanitizeNickname(starter && starter.nickname)}");`,
        starterGender: `static const u8 sStarterGender = ${genderConst(starter && starter.gender)};`,
        extraNicknames: `static const u8 *const sStarterExtraNicknames[STARTER_EXTRA_COUNT] =\n{\n${nickLines.join('\n')}\n};`,
        extraGenders: `static const u8 sStarterExtraGenders[STARTER_EXTRA_COUNT] =\n{\n${genderLines.join('\n')}\n};`,
    };
}

// Replace the four committed default blocks in `fileContent`. The default extra arrays always carry
// DEFAULT_EXTRA_COUNT entries in the committed source, so we match that regardless of the ROM's count.
function applyStarterNames(fileContent, naming, extraCount) {
    const code = buildStarterNameCode(naming, extraCount);
    return fileContent
        .replace(DEFAULT_STARTER_NICKNAME, code.starterNickname)
        .replace(DEFAULT_STARTER_GENDER, code.starterGender)
        .replace(defaultExtraNicknames(DEFAULT_EXTRA_COUNT), code.extraNicknames)
        .replace(defaultExtraGenders(DEFAULT_EXTRA_COUNT), code.extraGenders);
}

// B-049 — apply ALL per-ROM starter_choose.c edits at once: the extra-mon species array, the
// STARTER_EXTRA_COUNT #define, and the nickname/gender arrays. The count and every array MUST stay in
// lock-step or the C fails with "excess elements in array initializer". The nickname/gender arrays are
// ALWAYS resized to `extraStarters.length` (even when `starterNaming` is null → default-filled), which
// fixes the build break when a ROM's extra-starter count differs from the committed default (9) and no
// naming was attached. Pure string transform; `make.js` restores the file afterward.
function applyStarterChoose(fileContent, extraStarters, starterNaming) {
    const count = extraStarters.length;
    const monBlock = `static const u16 sStarterExtraMon[STARTER_EXTRA_COUNT] =\n{\n    ${extraStarters.join(',\n    ')},\n};`;
    let out = fileContent
        .replace(/static const u16 sStarterExtraMon\[STARTER_EXTRA_COUNT\] =\s*\{[\s\S]*?\n\};/, monBlock)
        .replace(/#define STARTER_EXTRA_COUNT \d+/, `#define STARTER_EXTRA_COUNT ${count}`);
    return applyStarterNames(out, starterNaming, count);
}

module.exports = {
    applyStarterChoose,
    sanitizeNickname,
    genderConst,
    buildStarterNameCode,
    applyStarterNames,
    DEFAULT_STARTER_NICKNAME,
    DEFAULT_STARTER_GENDER,
    defaultExtraNicknames,
    defaultExtraGenders,
    DEFAULT_EXTRA_COUNT,
    MAX_NICKNAME,
};
