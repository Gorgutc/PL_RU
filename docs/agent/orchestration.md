# PL_RU Agent Orchestration

This is the reproducible audit workflow for complex tasks. It is a runbook, not
a replacement for `AGENTS.md`.

## When To Orchestrate

Use orchestration for project-wide audits, architecture changes, quality-tooling
changes, instruction or skill rewrites, and broad refactors. For narrow fixes,
use the relevant skill and local checks directly.

Always raise the applicable PL_RU subagents for implementation or review work
when subagent tooling is available. UI/frontend changes must include visual QA,
code changes must include code-quality/readability/reusability/optimization
review, source/UI changes must include component-reuse review, source changes
must include duplicate/deadwood review, and frozen/docs/skills/hooks changes
must include frozen or instruction-drift review. Do not deliver while a required
subagent is failing or while any mismatch with the current task brief, frozen
contract, or reference screenshot remains unresolved.

For UI changes, visual QA must include pixel-level screenshot comparison against
the available reference PNGs plus DOM/CSS metric assertions. Record viewport
sizes, diff tolerance, and mismatched areas. If reference PNGs are inaccessible,
block delivery unless the current user request explicitly accepts a metric-only
fallback.

## Read-Only Audit Roles

- `code_deadwood_auditor`: dead code, duplicate code, oversized modules, and
  future cleanup candidates.
- `code_quality_guardian`: runtime bugs, unreadable code, spaghetti coupling,
  type holes, accessibility regressions, and performance traps.
- `component_reuse_guardian`: reuse of existing components, Blueprint
  primitives, tokens, helpers, and frozen UI contracts before new code is
  accepted.
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
- `frozen_decisions_guardian`: frozen project decisions, Header responsive
  contract, reusable UI contracts, memory rules, and `verify-frozen.ts` drift.
- `visual_qa_guardian`: pixel-level comparison against available PNG references
  plus DOM/CSS metric assertions and mismatch blocking.

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
Only move from implementation to delivery after every required role reports PASS
on the final diff.
