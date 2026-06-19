---
name: bug-new
description: Register a bug in bugs/ with the next free B-NNN id, symptom and reproduction. Use the moment any defect is found, before fixing anything.
---

# Register a bug

1. Find the next free id: list `bugs/B-*.md`, take the highest NNN and add 1 (zero-padded to 3 digits).
2. Copy `bugs/TEMPLATE.md` to `bugs/B-NNN-<kebab-slug>.md`.
3. Fill the frontmatter: id, title, `status: open`, severity, `created`/`updated` = today, `found-in` = the current released/working version (the version home is `CHANGELOG.brooktec.md`).
4. Write the **Symptom**: how to reproduce, expected vs actual. Be precise enough that the regression test can be derived from it.
5. Run `node scripts/check-tracker.mjs --write`.
6. If the bug will be fixed now, create the fixing task (/task-new) linking this bug, and start from the failing regression test (TDD rule).
