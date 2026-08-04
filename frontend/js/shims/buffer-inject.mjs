// esbuild `inject` target for the Buffer shim (T-249).
//
// The injector's modules reference `Buffer` as a bare global (`Buffer.alloc`, `Buffer.from`), so the shim
// has to arrive as a substituted global rather than a require. esbuild's `inject` does that, but it
// substitutes only names a module EXPORTS — and it does not see the names inside a CommonJS
// `module.exports = { … }`, which is why this two-line ESM wrapper exists instead of injecting
// `buffer.cjs` directly. (Injecting the .cjs silently changes nothing, and the bundle then throws
// "Buffer is not defined" at the first write.)
import shim from './buffer.cjs';

export const Buffer = shim.Buffer;
