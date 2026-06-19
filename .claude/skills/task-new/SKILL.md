---
name: task-new
description: Create a new task file in tasks/ with the next free T-NNN id, a plan and acceptance criteria. Use when starting any non-trivial piece of work that has no task yet.
---

# Create a new task

1. Find the next free id: list `tasks/T-*.md`, take the highest NNN and add 1 (zero-padded to 3 digits).
2. Copy `tasks/TEMPLATE.md` to `tasks/T-NNN-<kebab-slug>.md`.
3. Fill the frontmatter: id, title, `type`, `status: proposed` (or `in-progress` if work starts now), `created`/`updated` = today, `target-version` (ask the user if unclear which version this work aims at), `links` to related bugs/ADRs.
4. Write the **Context** (link sources of truth, never paste their content) and the **Plan** with verifiable acceptance criteria. If the plan is non-obvious, agree on it with the user before implementing.
5. Add the first progress log entry: `- **YYYY-MM-DD** — Task created.`
6. Run `node scripts/check-tracker.mjs --write` to validate and refresh the index.
7. If the repo uses git flow and work begins now, open the task's branch off `develop`: `git flow feature start T-NNN-slug` (same `T-NNN-slug` as the file). Skip this in repos without git flow.
