---
name: pl-ru-audit-orchestrator
description: Use for broad PL_RU audits, instruction/tooling changes, and architecture reviews that benefit from read-only role separation.
---

# PL_RU Audit Orchestrator

Use this for project-wide audits and orchestration work. If subagents are
available, dispatch every applicable read-only role in parallel. If subagents
are unavailable, run the same roles locally and keep the same PASS/fix standard.

## Read-Only Roles

Use the canonical role roster from `docs/agent/orchestration.md`. This skill is
the dispatch wrapper: select every role whose focus matches the task, and add
the visual QA role for UI work, the reuse and duplicate/deadwood roles for
source work, and the frozen/instruction roles for rules or hooks.

## Rules

- Audit first, implement second.
- No required role may report PASS while code mismatches the task brief, frozen
  contract, or available reference screenshot.
- Do not edit production code during the first infrastructure PR unless the
  change is a safe comment/config correction.
- Do not edit read-only reference folders.
- Workers may edit only after the audit matrix is clear and write scopes are
  disjoint.

## Output

End with:

```text
keep:
fix:
remove:
archive:
needs user decision:
```
