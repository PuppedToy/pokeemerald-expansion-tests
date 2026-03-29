#!/usr/bin/env node
/**
 * analyze.js — Run the puppedjs randomizer, then reset all source C/H files.
 * Leaves puppedjs/output/ (out.html, pokes.js, trainers.js, etc.) intact for analysis.
 *
 * Usage:
 *   node analyze.js           — normal run
 *   node analyze.js --debug   — passes --debug to index.js
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
        shell: process.platform === 'win32', // needed on Windows for git/node in PATH
        ...opts,
    });
    if (result.error) {
        console.error(`Failed to spawn: ${result.error.message}`);
        process.exit(1);
    }
    if (result.status !== 0) {
        console.error(`Command exited with code ${result.status}`);
        process.exit(result.status);
    }
}

// Step 0: Abort if data/ has uncommitted changes
checkDataClean();

// Step 1: Run the randomizer/rater
const indexArgs = [path.join('puppedjs', 'index.js')];
if (isDebug) indexArgs.push('--debug');
run('node', indexArgs);

// Step 2: Reset all mutated source files — leaves puppedjs/output/ untouched (it's git-ignored)
// Only restore data/maps/ — the pipeline only mutates that subdirectory; other data/ files are user-editable
run('git', ['restore', 'src/', 'include/', 'data/maps/']);

console.log('\nDone. Open puppedjs/output/out.html to review results.');
