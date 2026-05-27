# PL_RU Agent Orchestration

This is the reproducible audit workflow for complex tasks. It is a runbook, not
a replacement for `AGENTS.md`.

## When To Orchestrate

Use orchestration for project-wide audits, architecture changes, quality-tooling
changes, instruction or skill rewrites, and broad refactors. For narrow fixes,
use the relevant skill and local checks directly.

## Read-Only Audit Roles

- `code_deadwood_auditor`: dead code, duplicate code, oversized modules, and
  future cleanup candidates.
- `runtime_behavior_mapper`: runtime invariants, server/browser behavior, test
  coverage, and checks that must remain green.
- `tech_stack_cartographer`: factual stack, dependencies, config files, and
  architecture decisions.
- `instruction_drift_auditor`: drift between code, `AGENTS.md`, skills, docs,
  CI, scripts, and `verify-frozen.ts`.
- `quality_tooling_architect`: quality tools, scripts, config gaps, CI risks,
  and Windows/browser caveats.
- `codex_infra_architect`: future-session bootstrap, plugin layout, skills,
  hooks, and handoff docs.

## Audit Matrix

Every audit should end with this shape:

```text
keep:
fix:
remove:
archive:
needs user decision:
```

Only move from audit to implementation after the matrix separates safe changes
from risky cleanup. Production code cleanup should normally be a separate PR.
