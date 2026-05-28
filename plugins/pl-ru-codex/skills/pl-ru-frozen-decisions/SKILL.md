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
  - expanded labeled tabs at `1920px`, `2560px`, and `3860px`;
  - Figma active/hover colors;
  - no persistent base-tab outline;
  - keyboard focus remains visible.
- Header action buttons keep the current visual contract or are extracted for
  reuse without visual drift.
- Codex memory rules remain documented and repo mirror keeps
  `[features] memories = true`.
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
