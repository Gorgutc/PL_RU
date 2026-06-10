---
name: pl-ru-frozen-decisions
description: Use before changing frozen PL_RU decisions, Header responsive behavior, reusable UI contracts, Codex memory rules, or verify-frozen guards.
---

# PL_RU Frozen Decisions Guardian

Validate proposed or implemented changes against `docs/agent/frozen-decisions.md`
and `verify-frozen.ts`. Do not edit files when using this as a review skill.

## Check

- Read `AGENTS.md`, `docs/agent/frozen-decisions.md`, `verify-frozen.ts`, and
  the changed files.
- Confirm whether the current user request explicitly asks to change a frozen
  decision. If not, frozen behavior must remain intact.
- Header responsive-tab behavior remains fixed:
  - compact tabs at `1280px` and `1440px`;
  - expanded labeled tabs at `1920px`, `2560px`, and `3840px`;
  - Figma active/hover colors;
  - no persistent base-tab outline;
  - keyboard focus remains visible.
- Header action buttons keep the current visual contract, including dropdown
  active states for `Аккаунт` and `Уведомления`, or are extracted for reuse
  without visual drift.
- Header profile and notification dropdowns keep their documented Blueprint
  Popover/Menu contract unless the current user request explicitly changes it.
- Codex memory rules remain documented and repo mirror keeps
  `[features] memories = true`.
- Mandatory PL_RU subagent orchestration and pixel-level visual QA rules remain
  documented in `AGENTS.md`, `docs/agent/verification.md`, and the relevant
  skills/hooks.
- Component reuse, duplicate/deadwood review, anti-spaghetti review, and exact
  task brief / spec / reference screenshot alignment remain mandatory delivery
  gates.
- `.codex/agents/` keeps code-quality, component-reuse, duplicate/deadwood,
  frozen/instruction-drift, and visual QA roles.
- Routing Decision and spawned subagent prompt/output contracts remain
  documented for delegated/docs-sensitive/instruction/tooling work and stay
  subordinate to `verify-frozen.ts`, the current user request, `AGENTS.md`,
  Superpowers, and repo-local PL_RU skills.
- Inline summaries remain insufficient when explicit spawned-agent evidence is
  required.
- External orchestration references remain reference-only: no Beads canonical
  ledger, no raw external shell/python scripts as repo policy, no global startup
  hooks, and no copied large templates without license/provenance review.
- Explicit defers cannot override blockers such as frozen contract mismatch,
  missing required visual QA, failing required roles, task-brief mismatch, or
  missing `pnpm codex:ship` for finished delivery.
- `pnpm check:visual` stays in the deep quality gate and requires visual QA
  evidence for UI-surface changes. It must fail closed when the base ref is
  unavailable, include staged/unstaged/untracked UI files, perform real PNG
  comparison from `pixelComparison.cases`, and keep diff output under ignored
  visual-artifact folders.
- `verify-frozen.ts` keeps static guards for these decisions.

## Output

Return:

```text
frozen-decisions: PASS
```

or:

```text
frozen-decisions: FAIL
- Header expanded tab width changed without an explicit user request.
```
