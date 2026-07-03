/**
 * Minimal, zero-dependency browser-environment stub for testing the frontend modules under
 * `node --test` (ADR-009). The frontend (account.js, app.js) is plain ESM that talks to a handful of
 * browser globals; rather than pull in jsdom/happy-dom (the repo's stance is zero new deps), we stub
 * exactly what the code touches:
 *   - document.getElementById → a cached fake element per id (so set-then-read is consistent). The code
 *     uses optional chaining (`$('x')?.addEventListener`) for dynamically-created children, so a fake
 *     that returns a stable element per id is enough — we never need real innerHTML→child parsing.
 *   - querySelector/querySelectorAll → null / [] (consumers guard with `?.` / forEach).
 *   - localStorage, a tiny in-memory IndexedDB (open/transaction/get/put), fetch (test-supplied), alert,
 *     URL.createObjectURL, and setInterval/clearInterval neutralised so polling never fires/hangs.
 *
 * install() returns an `env` handle: { els, idb, setFetch, alerts, restore }.
 */

function makeEl(id) {
  const listeners = {};
  const set = new Set();
  return {
    id, _html: '', textContent: '', value: '', title: '', hidden: false, disabled: false,
    style: {}, dataset: {},
    classList: {
      add: (c) => set.add(c), remove: (c) => set.delete(c), contains: (c) => set.has(c),
      toggle: (c, f) => { const on = f === undefined ? !set.has(c) : f; on ? set.add(c) : set.delete(c); },
    },
    get className() { return [...set].join(' '); },
    set className(v) { set.clear(); String(v).split(/\s+/).filter(Boolean).forEach((c) => set.add(c)); },
    get innerHTML() { return this._html; },
    set innerHTML(v) { this._html = String(v); },
    addEventListener(ev, fn) { (listeners[ev] ||= []).push(fn); },
    removeEventListener() {},
    appendChild() {}, removeChild() {},
    click() { (listeners.click || []).forEach((f) => f({})); },
    querySelector() { return null; },
    querySelectorAll() { return []; },
    _emit(ev, e = {}) { (listeners[ev] || []).forEach((f) => f(e)); },
  };
}

// In-memory IndexedDB matching account.js's idb()/idbGet/idbSet usage. Callbacks fire async
// (microtask) so the code can assign onsuccess/oncomplete after the call, like the real API.
function makeIndexedDB(store) {
  const soon = (fn) => queueMicrotask(fn);
  const db = {
    createObjectStore() {},
    transaction() {
      const tx = {};
      const os = {
        get(key) { const r = {}; soon(() => { r.result = store.has(key) ? store.get(key) : null; r.onsuccess?.(); }); return r; },
        put(val, key) { store.set(key, val); soon(() => tx.oncomplete?.()); return {}; },
        delete(key) { store.delete(key); soon(() => tx.oncomplete?.()); return {}; },
      };
      tx.objectStore = () => os;
      return tx;
    },
  };
  return {
    open() {
      const req = {};
      soon(() => { req.result = db; req.onupgradeneeded?.(); req.onsuccess?.(); });
      return req;
    },
  };
}

export function installDomEnv() {
  const els = new Map();
  const idb = new Map();
  const alerts = [];
  let fetchHandler = async () => { throw new Error('no fetch handler set — call env.setFetch()'); };

  const saved = {
    document: global.document, localStorage: global.localStorage, indexedDB: global.indexedDB,
    fetch: global.fetch, alert: global.alert, URL: global.URL,
    setInterval: global.setInterval, clearInterval: global.clearInterval,
  };

  const getEl = (id) => { if (!els.has(id)) els.set(id, makeEl(id)); return els.get(id); };

  global.document = {
    getElementById: getEl,
    querySelector: () => null,
    querySelectorAll: () => [],
    createElement: () => makeEl('_created'),
    addEventListener: () => {},
    body: makeEl('body'),
  };
  global.localStorage = {
    _m: new Map(),
    getItem(k) { return this._m.has(k) ? this._m.get(k) : null; },
    setItem(k, v) { this._m.set(k, String(v)); },
    removeItem(k) { this._m.delete(k); },
  };
  global.indexedDB = makeIndexedDB(idb);
  global.fetch = (path, opts) => fetchHandler(path, opts);
  global.alert = (m) => alerts.push(m);
  global.URL = { createObjectURL: () => 'blob:test', revokeObjectURL: () => {} };
  global.setInterval = () => 0;        // neutralise polling: capture nothing, never fire, never hang
  global.clearInterval = () => {};

  return {
    els, idb, alerts,
    getEl,
    setFetch(fn) { fetchHandler = fn; },
    restore() { Object.assign(global, saved); },
  };
}

// Let queued IndexedDB / fetch microtasks settle.
export const flush = () => new Promise((r) => setTimeout(r, 0));
