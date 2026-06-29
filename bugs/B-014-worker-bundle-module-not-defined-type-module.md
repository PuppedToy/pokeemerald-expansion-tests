---
id: B-014
title: Generation crashes with "module is not defined" — type:module made esbuild mis-bundle the CJS worker
status: fixed
severity: critical
created: 2026-06-29
updated: 2026-06-29
found-in: 0.4.0
fixed-in: 0.4.0
regression-test: frontend/__tests__/worker-bundle.test.js  # B-014: worker bundles as CJS + loads clean
links: [T-036, T-032]
---

# B-014 — Generation crashes with "module is not defined"

## Symptom

After the deploy that shipped T-032/T-036/T-037, clicking **Generate** failed immediately:

```
✗ Generation failed
Uncaught ReferenceError: module is not defined
```

Generation happens entirely in a Web Worker (`randomizer.bundle.js`), so the whole feature was down in
production.

## Root cause

T-036 added `frontend/package.json` with `"type": "module"` (so the ESM app/account modules and the
node:test frontend suite are treated as ESM). But the randomizer **Web Worker** and its Node-builtin
**shims** (`randomizer-worker.js`, `shims/fs.js`, `shims/path.js`, `shims/child_process.js`) are
**CommonJS** (`require` / `module.exports`). With `type: module`, esbuild (and Node) treat those `.js`
files as **ESM**, so esbuild wrapped them in its `__esm()` initializer instead of `__commonJS()` and
left `module`/`require` as undefined globals:

```
var init_fs = __esm({ "frontend/js/shims/fs.js"() { ... module.exports = {...}; } });  // module === undefined
```

In the browser worker `module` is not defined → the bundle throws on load. (esbuild even emits a
`commonjs-variable-in-esm` warning recommending the `.cjs` extension — it just isn't fatal, so the
broken bundle still shipped.) `randomizer/` and the repo root are `type: commonjs`, which is why only
the four files under `frontend/js/` broke.

## Fix

Rename the four CommonJS files to **`.cjs`** so esbuild always treats them as CommonJS regardless of
`type: module`: `randomizer-worker.cjs`, `shims/{fs,path,child_process}.cjs`. The esbuild config moved
to `buildWorker.cjs` (shared by `build.js` and the regression test) and points at the `.cjs` entry +
shim aliases. ESM stays ESM for `app.js`/`account.js` and the tests.

Regression test: `frontend/__tests__/worker-bundle.test.js` bundles the worker via the real config and
asserts the output has no `__esm({` wrapper and loads with no ReferenceError. Verified **FAIL** on the
pre-fix `.js` layout (esbuild warns + emits `__esm({`; load throws) and **PASS** after. Reaches prod on
the redeploy that follows.
