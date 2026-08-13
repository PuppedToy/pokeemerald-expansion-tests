/**
 * T-276 — the display side of the generation progress bar.
 *
 * The bar used to run its own animation that crawled up to 18 points ABOVE whatever the worker had
 * reported, to paper over the two long stalls in the old milestone model (0-20% for ~19 s, 80-100%
 * for ~9 s). The worker now reports honest, weighted, continuous progress, so the animation's only
 * remaining job is smoothing between reports — and it must never invent more than a hair of it.
 */

import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createProgressDisplay, CRAWL_LOOKAHEAD } from '../js/gen-progress.js';

// A display that records every frame it renders.
function display(opts = {}) {
    const frames = [];
    const d = createProgressDisplay({ render: (frame) => frames.push(frame), ...opts });
    return { d, frames, last: () => frames.at(-1), shown: () => frames.at(-1)?.pct ?? 0 };
}

// Crawl for `n` ticks (app.js drives this on an interval).
const crawl = (d, n) => { for (let i = 0; i < n; i++) d.tick(); };

test('what the worker reports is what the user sees', () => {
    const { d, last } = display();
    d.report(37, 'Generating Pokédex...');
    assert.equal(last().pct, 37);
    assert.equal(last().label, 'Generating Pokédex...');
});

test('smoothing never invents more than a couple of points of progress', () => {
    const { d, shown } = display();
    d.report(20, 'Generating Pokédex...');
    crawl(d, 1000);   // an eternity between reports
    assert.ok(shown() <= 20 + CRAWL_LOOKAHEAD, `showed ${shown()} on a report of 20`);
    assert.ok(CRAWL_LOOKAHEAD <= 3, 'the lookahead is smoothing, not invention');
});

test('smoothing does move: a long gap between reports is not a frozen bar', () => {
    const { d, shown } = display();
    d.report(20, 'Building docs...');
    crawl(d, 8);
    assert.ok(shown() > 20, 'the bar should ease forward between reports');
});

test('the bar never goes backwards', () => {
    const { d, frames, shown } = display();
    d.report(60, 'Building docs...');
    crawl(d, 4);
    d.report(30, 'Building docs...');   // a late/out-of-order report
    assert.ok(shown() >= 60);
    assert.deepEqual(frames.map(f => f.pct), [...frames.map(f => f.pct)].sort((a, b) => a - b));
});

test('crawling alone can never complete the bar', () => {
    const { d, shown } = display();
    d.report(97, 'Building docs...');
    crawl(d, 10_000);
    assert.ok(shown() < 100, `crawled to ${shown()}% without the run finishing`);
});

test('100% is reachable — when the run reports it', () => {
    const { d, shown } = display();
    d.report(100, 'Done');
    assert.equal(shown(), 100);
});

test('a new run starts from zero', () => {
    const { d, last } = display();
    d.report(80, 'Building docs...');
    d.reset('Starting…');
    assert.equal(last().pct, 0);
    assert.equal(last().label, 'Starting…');
});

test('nothing is re-rendered when nothing changed', () => {
    const { d, frames } = display();
    d.report(40, 'Building docs...');
    const after = frames.length;
    d.report(40, 'Building docs...');
    assert.equal(frames.length, after, 'the same percentage and label should not repaint');
});

test('a step label with no new percentage still reaches the user', () => {
    const { d, last } = display();
    d.report(68, 'Generating trainer teams...');
    d.report(68, 'Generating starters...');
    assert.equal(last().label, 'Generating starters...');
    assert.equal(last().pct, 68);
});
