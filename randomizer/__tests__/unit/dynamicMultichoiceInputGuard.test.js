// B-055 — dynamic multichoice menus must not read the button press that opened them.
//
// Symptom: an item ball opened with A showed its menu and instantly selected option 1.
// Cause: scripts run before RunTasks() in the same frame, so the menu task's first execution saw
// JOY_NEW(A_BUTTON) still set. The STATIC multichoice paths defend against this with the
// sProcessInputDelay counter (armed in InitMultichoiceCheckWrap / InitMultichoiceNoWrap, honoured by
// Task_HandleMultichoiceInput); the DYNAMIC path (dynmultichoice/dynmultistack) never armed nor
// honoured it.
//
// Scope of this test — read this before trusting it:
// It is a SOURCE-INVARIANT test, not a behavioural one. The C harness (`make check`, test/) has no
// way to reproduce the real sequence: every existing test is a pure-function test, none creates a
// window or runs tasks, and a non-battle TEST() body executes inside a single frame, so there is no
// frame-stepping to drive a menu task through. Behavioural proof is the owner's in-game play-test
// (see bugs/B-055).
//
// What it does buy us: this fix lives in engine code inherited from pokeemerald-expansion, so the
// realistic way it disappears is an UPSTREAM SYNC silently restoring the old file. This test fails
// the moment either half of the guard is gone.
const fs = require('fs');
const path = require('path');

const SCRIPT_MENU_C = path.resolve(__dirname, '..', '..', '..', 'src', 'script_menu.c');

// Body of a C function, from its signature to the first line that starts with `}` at column 0.
function functionBody(src, signature) {
    const start = src.indexOf(signature + '\n{');
    if (start === -1) throw new Error(`function not found in script_menu.c: ${signature}`);
    const end = src.indexOf('\n}', start);
    if (end === -1) throw new Error(`unterminated function: ${signature}`);
    return src.slice(start, end);
}

describe('B-055 — dynamic multichoice input guard', () => {
    let src;
    beforeAll(() => { src = fs.readFileSync(SCRIPT_MENU_C, 'utf8'); });

    test('the guard counter still exists (the static paths rely on it too)', () => {
        expect(src).toMatch(/static EWRAM_DATA u8 sProcessInputDelay/);
    });

    test('DrawMultichoiceMenuDynamic arms the delay before creating its task', () => {
        const body = functionBody(src,
            'static void DrawMultichoiceMenuDynamic(u8 left, u8 top, u8 argc, struct ListMenuItem *items, bool8 ignoreBPress, u32 initialRow, u8 maxBeforeScroll, u32 callbackSet)');

        const armed = body.search(/sProcessInputDelay\s*=\s*[1-9]/);
        const createsTask = body.search(/CreateTask\(Task_HandleScrollingMultichoiceInput/);

        expect(armed).toBeGreaterThan(-1);
        expect(createsTask).toBeGreaterThan(-1);
        // Arming after the task exists would leave a frame unguarded.
        expect(armed).toBeLessThan(createsTask);
    });

    test('Task_HandleScrollingMultichoiceInput consumes the delay before reading input', () => {
        const body = functionBody(src, 'static void Task_HandleScrollingMultichoiceInput(u8 taskId)');

        const guard = body.search(/if\s*\(\s*sProcessInputDelay\s*\)/);
        const processesInput = body.search(/ListMenu_ProcessInput\s*\(/);

        expect(guard).toBeGreaterThan(-1);
        expect(body).toMatch(/sProcessInputDelay--/);
        // The read must be gated: the guard has to come first AND return early.
        expect(guard).toBeLessThan(processesInput);
        expect(body.slice(guard, processesInput)).toMatch(/return;/);
    });

    test('the static paths keep their own guard (no accidental symmetry break)', () => {
        for (const fn of [
            'static void InitMultichoiceCheckWrap(bool8 ignoreBPress, u8 count, u8 windowId, u8 multichoiceId)',
            'static void InitMultichoiceNoWrap(bool8 ignoreBPress, u8 unusedCount, u8 windowId, u8 multichoiceId)',
        ]) {
            expect(functionBody(src, fn)).toMatch(/sProcessInputDelay\s*=\s*[1-9]/);
        }
    });
});
