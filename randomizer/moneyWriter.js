'use strict';

// T-052 / T-234 — configurable trainer prize money. The engine reads the three tunable values
// (normal/boss/gym) from the runtime settings block `gRandomizerSettings` (src/randomizer_settings.c),
// which the engine consumes in GetTrainerMoneyToGive so a prebuilt ROM can be repatched without
// recompiling (ADR-022). This writer patches those struct initializers from the bundle config at
// ROM-build time (called from make.js buildOneRom), then make.js's restore() (git checkout -- src/)
// reverts the file.
//
// The museum grunts and Space-Center grunts derive from the boss value IN C
// (spaceMoney = round(boss*2/3), museum-2 = that + 50), so only three fields are patched.
// Elite Four ($10k) and Champion ($50k) are intentionally fixed (still #defines in the engine).

const fs = require('fs').promises;
const path = require('path');

const SETTINGS_FILE = path.resolve(__dirname, '..', 'src', 'randomizer_settings.c');

const MONEY_DEFAULTS = { normal: 250, boss: 3000, gym: 5000 };

function clampMoney(v, def) {
    if (typeof v !== 'number' || !Number.isFinite(v) || v < 0) return def;
    return Math.round(v);
}

/**
 * Patch the three trainer-money fields of gRandomizerSettings in the given C source text. Pure —
 * returns the new text.
 * @param {string} content - src/randomizer_settings.c source
 * @param {{normal?:number, boss?:number, gym?:number}} money
 * @returns {string}
 */
function patchMoneyInContent(content, money = {}) {
    const normal = clampMoney(money.normal, MONEY_DEFAULTS.normal);
    const boss = clampMoney(money.boss, MONEY_DEFAULTS.boss);
    const gym = clampMoney(money.gym, MONEY_DEFAULTS.gym);
    return content
        .replace(/(\.trainerMoneyNormal\s*=\s*)\d+/, `$1${normal}`)
        .replace(/(\.trainerMoneyBoss\s*=\s*)\d+/, `$1${boss}`)
        .replace(/(\.trainerMoneyGym\s*=\s*)\d+/, `$1${gym}`);
}

/**
 * Read the settings C file, patch the money fields from config, and write it back.
 * A no-op-equivalent when money is undefined (defaults reproduce the committed values).
 */
async function writeMoney(money, { file = SETTINGS_FILE } = {}) {
    const content = await fs.readFile(file, 'utf8');
    const patched = patchMoneyInContent(content, money || {});
    await fs.writeFile(file, patched, 'utf8');
}

module.exports = { writeMoney, patchMoneyInContent, clampMoney, MONEY_DEFAULTS, file: SETTINGS_FILE };
