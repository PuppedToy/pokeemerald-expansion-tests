// Browser stub for Node's 'path' module.
// path.resolve/__dirname values are only used for file I/O paths that are
// never read in the browser (guarded by IS_NODE checks or browser-only code paths).
'use strict';
const sep = '/';
const posix = {
    resolve: (...parts) => '/' + parts.filter(Boolean).join('/'),
    join: (...parts) => parts.filter(Boolean).join('/'),
    dirname: (p) => { const i = p.lastIndexOf('/'); return i > 0 ? p.slice(0, i) : '/'; },
    basename: (p, ext) => { const b = p.split('/').pop() || ''; return ext && b.endsWith(ext) ? b.slice(0, -ext.length) : b; },
    extname: (p) => { const b = p.split('/').pop() || ''; const i = b.lastIndexOf('.'); return i > 0 ? b.slice(i) : ''; },
    sep,
    delimiter: ':',
    isAbsolute: (p) => p.startsWith('/'),
};
module.exports = posix;
