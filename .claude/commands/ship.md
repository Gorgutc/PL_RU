---
description: Final quality gate. Runs ts-context-keeper + ts-spec-guardian + ts-quality-gate in parallel, then `pnpm verify`. Blocks output on any FAIL.
---

# /ship

Spawn three subagents in **parallel** in a single tool turn:

1. **ts-context-keeper** — read-only file slicer. Returns only the file slices needed.
2. **ts-spec-guardian** — validates the change against `CLAUDE.md` frozen rules and `verify-frozen.ts` static checks. PASS or FAIL with quoted rule violations.
3. **ts-quality-gate** — code review: bugs, a11y, performance, code smell. Severity-ranked findings.

Wait for all three. If any reports FAIL, do not write the file — surface the failure and iterate.

After write: run `pnpm verify` and confirm `SUMMARY: <n>/<n> PASS, 0 FAIL`.
