#!/usr/bin/env node
/**
 * analyze_no_rebalance_all_tms.js — Run the pipeline with balance/mutations
 * disabled AND with all teachable moves treated as learnable (no TM filter).
 *
 * Use this to compare "what would tiers look like if every teachable move
 * were available via TM?" vs the default run which respects the actual TM pool.
 * Useful for identifying Phase C gaps — pokemon that need a specific TM added
 * to this game's TM list to reach their expected competitive tier.
 *
 * Usage:
 *   node analyze_no_rebalance_all_tms.js           — no-balance, all-tms run
 *   node analyze_no_rebalance_all_tms.js --debug   — passes --debug to index.js
 */

const { spawnSync } = require('child_process');
const path = require('path');

const root = __dirname;
const isDebug = process.argv.includes('--debug');

// Guard: abort if data/ has uncommitted changes that the pipeline would clobber
function checkDataClean() {
    const result = spawnSync('git', ['status', '--porcelain', 'data/'], {
        cwd: root,
        shell: process.platform === 'win32',
        encoding: 'utf8',
    });
    const dirty = (result.stdout || '').trim();
    if (dirty) {
        console.error('\nERROR: Uncommitted changes in data/ detected. Commit or stash them before running:\n' + dirty);
        process.exit(1);
    }
}

function run(cmd, args, opts = {}) {
    console.log(`\n> ${cmd} ${args.join(' ')}`);
    const result = spawnSync(cmd, args, {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
        ...opts,
    });
    if (result.error) throw new Error(`Failed to spawn: ${result.error.message}`);
    if (result.status !== 0) throw new Error(`Command exited with code ${result.status}`);
}

function restore() {
    console.log('\n> Restoring mutated source files...');
    spawnSync('git', ['restore', 'src/', 'include/', 'data/maps/'], {
        cwd: root,
        stdio: 'inherit',
        shell: process.platform === 'win32',
    });
}

// Step 0: Abort if data/ has uncommitted changes
checkDataClean();

// Step 1: Run without balance/mutations and with all TMs treated as available
const indexArgs = [path.join('puppedjs', 'index.js'), '--no-balance', '--all-tms'];
if (isDebug) indexArgs.push('--debug');
try {
    run('node', indexArgs);
} catch (err) {
    console.error(`\nPipeline failed: ${err.message}`);
    restore();
    process.exit(1);
}

// Step 2: Reset all mutated source files — leaves puppedjs/output/ untouched
// Only restore data/maps/ — the pipeline only mutates that subdirectory; other data/ files are user-editable
restore();

console.log('\nDone. Open puppedjs/output/out.html to review results (vanilla stats, all TMs available).');
