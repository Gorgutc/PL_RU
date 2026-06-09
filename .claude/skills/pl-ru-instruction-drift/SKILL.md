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
- Do Routing Decision and subagent prompt/output contracts stay subordinate to
  `verify-frozen.ts`, the current user request, `AGENTS.md`, Superpowers, and
  repo-local PL_RU skills?
- Do external orchestration references remain reference-only, without adding
  Beads as a canonical ledger, raw external shell/python scripts as repo policy,
  global startup hooks, or copied large templates without license/provenance
  review?
- Do closeout rules preserve that explicit defers cannot override blockers such
  as frozen mismatch, required visual QA gaps, failing roles, task-brief
  mismatch, or missing `pnpm codex:ship` for finished delivery?

## Output

Return:

```text
instruction-drift: PASS
```

or list concrete findings with paths and replacement guidance.
