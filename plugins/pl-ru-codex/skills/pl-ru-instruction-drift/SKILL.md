---
name: pl-ru-instruction-drift
description: Use to compare PL_RU instructions, skills, docs, scripts, CI, and verify-frozen.ts for drift.
---

# PL_RU Instruction Drift

Use this before changing `AGENTS.md`, README, `docs/agent/**`,
`.codex/**`, `plugins/pl-ru-codex/**`, package scripts, or CI.

## Check

- Does the file respect the authority order?
- Does it mention Claude-era files as canonical?
- Does it describe pnpm scripts that actually exist?
- Does it preserve read-only reference folders?
- Does it keep production rules aligned with `verify-frozen.ts`?
- Does it avoid promising automatic subagent behavior that the environment
  cannot guarantee?

## Output

Return:

```text
instruction-drift: PASS
```

or list concrete findings with paths and replacement guidance.
