---
name: task-close
description: Close a task — verify acceptance criteria, write the Outcome, update the changelog and regenerate indexes. Use when the work of a task is finished (or abandoned).
---

# Close a task

0. **User confirmation gate.** Never close a task autonomously. Ask the user to manually test the result and wait for their explicit confirmation that it is OK. Without that confirmation the task stays `in-progress` — stop here. (Closing as `abandoned` on the user's instruction is exempt.)
1. Open the task file. Verify every acceptance criterion is met and checked off; the project check command must be green. If a criterion is not met, the task does not close — log why and keep it `in-progress` (or close as `abandoned` with the reason in Outcome).
2. Fill the **Outcome** section: what shipped, deviations from the plan, follow-up tasks spawned (create them with /task-new and link their ids).
3. Append a final dated progress log entry.
4. Set `status: done` (or `abandoned`) and `updated` = today.
5. If the change is user-visible, add one line under the right heading (`Added`/`Changed`/`Fixed`/`Removed`) in `CHANGELOG.brooktec.md` `[Unreleased]`, referencing the task id.
6. Run `node scripts/check-tracker.mjs --write`.
7. Commit with a Conventional Commit message referencing the task id in the body.
8. If the task was developed on a git-flow feature branch, finish it: `git flow feature finish T-NNN-slug` (merges into `develop`). Skip in repos without git flow.
