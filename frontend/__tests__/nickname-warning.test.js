/**
 * T-200 — live low-pool warning for auto-nicknames. The pure helper decides when the configured pools
 * can't cover every nameable Pokémon (names never repeat → the rest go unnamed). A drift-guard pins the
 * frontend's per-bucket counts to the randomizer SSOT (encounterLocations buckets + town trades).
 *
 * Per ADR-009 the DOM stub doesn't parse innerHTML, so we behaviourally test the pure exported helpers and
 * assert the banner + wiring structurally.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';

import { nicknamePoolWarning, nicknamePoolMessage, overlongPoolNames, overlongMessage } from '../js/config-form.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const src = fs.readFileSync(path.join(__dirname, '..', 'js', 'config-form.js'), 'utf8');

const require = createRequire(import.meta.url);
const { WILD_ROUTE_LOCATIONS, STATIC_LOCATIONS, GIFT_LOCATIONS } = require('../../randomizer/data/encounterLocations.js');
const { TOWN_TRADES } = require('../../randomizer/trades.js');
const LOC = WILD_ROUTE_LOCATIONS.length + STATIC_LOCATIONS.length; // autoLocation bucket
const TG = GIFT_LOCATIONS.length + TOWN_TRADES.length;             // autoTradesGifts bucket

const names = (n) => Array.from({ length: n }, (_, i) => `N${i}`);
const nick = (over = {}) => ({
    enabled: true, includeStarter: false, autoLocation: false, autoTradesGifts: false,
    differentPerGender: false, lockGenderPerRoute: false,
    pools: { both: [], female: [], male: [], single: [] }, ...over,
});

test('feature off / nothing to name → never warns', () => {
    assert.equal(nicknamePoolWarning(nick({ enabled: false }), 9).warn, false);
    assert.equal(nicknamePoolWarning(nick(), 0).warn, false); // no buckets on, no extras
});

test('single pool: warns exactly when the pool is smaller than the number to name', () => {
    assert.equal(nicknamePoolWarning(nick({ autoLocation: true, pools: { single: names(LOC) } }), 0).warn, false);
    assert.equal(nicknamePoolWarning(nick({ autoLocation: true, pools: { single: names(LOC - 1) } }), 0).warn, true);
});

test('extra starters count toward the total', () => {
    // 5 extras + 1 main starter, no location buckets → needs 6 names.
    const cfg = nick({ includeStarter: true, pools: { single: names(6) } });
    assert.equal(nicknamePoolWarning(cfg, 5).warn, false);
    assert.equal(nicknamePoolWarning(nick({ includeStarter: true, pools: { single: names(5) } }), 5).warn, true);
});

test('gendered + lock ON: each gender pool (∪ both) must cover the total', () => {
    // autoLocation on, lock on → LOC names, all could land on one gender.
    const enough = nick({ autoLocation: true, differentPerGender: true, lockGenderPerRoute: true,
        pools: { both: [], female: names(LOC), male: names(LOC) } });
    assert.equal(nicknamePoolWarning(enough, 0).warn, false);
    const short = nick({ autoLocation: true, differentPerGender: true, lockGenderPerRoute: true,
        pools: { both: [], female: names(LOC), male: names(LOC - 1) } });
    assert.equal(nicknamePoolWarning(short, 0).warn, true); // male side can't cover
});

test('gendered + lock OFF: the location buckets fall back to Both-only, so a small Both pool warns', () => {
    // Huge gendered pools but a tiny Both pool → still warns because lock-off uses Both only for locations.
    const cfg = nick({ autoLocation: true, differentPerGender: true, lockGenderPerRoute: false,
        pools: { both: names(3), female: names(999), male: names(999) } });
    assert.equal(nicknamePoolWarning(cfg, 0).warn, true);
    const ok = nick({ autoLocation: true, differentPerGender: true, lockGenderPerRoute: false,
        pools: { both: names(LOC), female: names(1), male: names(1) } });
    assert.equal(nicknamePoolWarning(ok, 0).warn, false);
});

test('drift-guard: frontend bucket counts match the randomizer SSOT', () => {
    // These pin NAMEABLE_LOCATION / NAMEABLE_TRADES_GIFTS to the randomizer data via behaviour.
    assert.equal(nicknamePoolWarning(nick({ autoLocation: true, pools: { single: names(LOC) } }), 0).warn, false);
    assert.equal(nicknamePoolWarning(nick({ autoLocation: true, pools: { single: names(LOC - 1) } }), 0).warn, true);
    assert.equal(nicknamePoolWarning(nick({ autoTradesGifts: true, pools: { single: names(TG) } }), 0).warn, false);
    assert.equal(nicknamePoolWarning(nick({ autoTradesGifts: true, pools: { single: names(TG - 1) } }), 0).warn, true);
});

test('message names the counts', () => {
    const msg = nicknamePoolMessage(124, 50);
    assert.match(msg, /50/);
    assert.match(msg, /124/);
});

test('low-pool count ignores over-length names (they are dropped by the randomizer)', () => {
    // A single pool whose only entry is 13 chars → 0 usable names → warns for 124 routes.
    const cfg = nick({ autoLocation: true, pools: { single: ['ThisNameIsTooLong'] } });
    assert.equal(nicknamePoolWarning(cfg, 0).available, 0);
    assert.equal(nicknamePoolWarning(cfg, 0).warn, true);
});

// ── over-length (>12 chars) warning ──────────────────────────────────────────
test('overlongPoolNames: lists >12-char names from the active pools, deduped; none when disabled', () => {
    assert.deepEqual(overlongPoolNames(nick({ enabled: false, pools: { single: ['WayTooLongName'] } })), []);
    // gendered mode reads both/female/male, not single
    const g = nick({ differentPerGender: true, pools: { both: ['Alexanderrrrr'], female: ['Bob'], male: ['Christopherrr'], single: ['IgnoredLongName'] } });
    assert.deepEqual(overlongPoolNames(g), ['Alexanderrrrr', 'Christopherrr']);
    // single mode reads only single
    const s = nick({ differentPerGender: false, pools: { single: ['Bob', 'Bartholomewww', 'bartholomewww'] } });
    assert.deepEqual(overlongPoolNames(s), ['Bartholomewww']); // 13 chars, deduped case-insensitively
});

test('overlongPoolNames: exactly 12 chars is allowed (not flagged)', () => {
    assert.deepEqual(overlongPoolNames(nick({ differentPerGender: false, pools: { single: ['Alexanderrrr'] } })), []); // 12
});

test('overlongMessage: lists the names and states they will be removed', () => {
    const msg = overlongMessage(['Alexanderrrrr', 'Christopherrr']);
    assert.match(msg, /Alexanderrrrr/);
    assert.match(msg, /Christopherrr/);
    assert.match(msg, /removed/);
    assert.match(msg, /12/);
});

test('structural: both banners live between the tabs and the textareas, one below the other', () => {
    assert.match(src, /id="nickname-pool-warning"/, 'low-pool banner element');
    assert.match(src, /id="nickname-length-warning"/, 'over-length banner element');
    // The warnings container sits AFTER the both|female|male tabs and BEFORE the first pool textarea.
    assert.match(src, /nick-tabs[\s\S]*?id="nickname-warnings"[\s\S]*?data-nick-panel="both"/,
        'warnings container is between the tabs and the pool panels');
    assert.match(src, /_syncNicknameWarning\(\)/, 'sync method called from _syncUI');
    assert.match(src, /export function nicknamePoolWarning/, 'low-pool helper exported');
    assert.match(src, /export function overlongPoolNames/, 'over-length helper exported');
});
