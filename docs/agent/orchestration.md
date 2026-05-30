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

## Routing Decision

Before spawning subagents for medium, complex, docs-sensitive, instruction,
hook, skill, or quality-tooling work, record a compact routing decision in the
working notes, plan, PR body, or handoff. It is a traceability contract, not a
new authority layer, and it must stay subordinate to `verify-frozen.ts`, the
current user request, `AGENTS.md`, Superpowers, and repo-local PL_RU skills.

Use this shape:

```text
Documentation: <docs/runbooks checked, or "No dependency documentation lookup needed">
Selected skills: <PL_RU or plugin skills selected, or "none - reason">
Selected agents: <.codex/agents roles selected, or "none - reason">
Catalog candidates: <external/reference orchestration candidates considered, or "none - reason">
Reason: <why this routing lowers delivery risk for the current task>
```

External orchestration packs may inform naming or prompt structure, but they are
reference material only. Do not introduce Beads as a canonical ledger, raw
external shell/python scripts as repo policy, global startup hooks, or copied
large external templates without license/provenance review.

## Subagent Prompt And Output Contract

Delegate through explicit spawned subagents when subagent tooling is available.
Inline summaries are not a substitute for required spawned-agent evidence.
Every prompt to a PL_RU subagent must include:

- `Goal`: the exact task the role owns.
- `Success Criteria`: the concrete PASS conditions for the role.
- `Documentation`: the source docs, frozen decisions, references, screenshots,
  or "no external docs required" note the role must use.
- `Selected skills` and `Selected agents`: the routing result the role should
  respect instead of rediscovering the whole repo.
- `Ownership / Write Zone`: read-only or exact files/directories the role may
  change. Most review roles are read-only.
- `Verification`: commands, screenshots, checks, or evidence the role must
  inspect before PASS.
- `Stop Rules`: blockers that require FAIL or escalation instead of guessing.

Every subagent output must include:

- `PASS/FAIL`: one clear status.
- Evidence: files inspected, checks run or reviewed, and relevant output.
- Findings or blockers: concrete paths and what must change.
- Explicit defers: bounded follow-up only, never a waiver for a blocker.

Explicit defers cannot override blockers. Frozen contract mismatch, missing
required visual QA, failing required roles, unresolved task-brief mismatch, and
missing `pnpm codex:ship` for finished delivery all block handoff until fixed or
explicitly accepted by the current user request.

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
