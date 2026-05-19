// Browser stub for Node's 'fs' module.
// All methods are guarded by IS_NODE checks in the randomizer — this stub
// is never called at runtime, it just satisfies the static require().
'use strict';
const noop = () => { throw new Error('fs is not available in the browser'); };
module.exports = {
    readFile:        noop,
    writeFile:       noop,
    readFileSync:    noop,
    writeFileSync:   noop,
    stat:            noop,
    statSync:        noop,
    mkdirSync:       noop,
    existsSync:      () => false,
    promises: {
        readFile:  noop,
        writeFile: noop,
        stat:      noop,
    },
};
