---
name: pl-ru-audit-orchestrator
description: Use for broad PL_RU audits, instruction/tooling changes, and architecture reviews that benefit from read-only role separation.
---

# PL_RU Audit Orchestrator

Use this for project-wide audits and orchestration work. If subagents are
available and the user explicitly authorized agent work, dispatch the read-only
roles in parallel. If subagents are unavailable, run the roles locally.

## Read-Only Roles

- `code_deadwood_auditor`: dead code, duplicate code, oversized modules, and
  future cleanup candidates.
- `runtime_behavior_mapper`: runtime invariants, browser behavior, and checks to
  preserve.
- `tech_stack_cartographer`: factual stack, configs, dependencies, and
  architecture decisions.
- `instruction_drift_auditor`: drift between docs, skills, scripts, CI, and
  frozen rules.
- `quality_tooling_architect`: quality tools, scripts, configs, and browser
  caveats.
- `codex_infra_architect`: future-session bootstrap, skill layout, docs, hooks,
  and handoff flow.

## Rules

- Audit first, implement second.
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
