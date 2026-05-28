---
name: pl-ru-reuse-audit
description: Use for PL_RU source or UI changes to enforce component reuse, anti-spaghetti structure, readable coupling, duplicate-code cleanup, and extraction decisions before delivery.
---

# PL_RU Reuse Audit

Use this for every PL_RU implementation or review that touches `src/**`,
tests, scripts, shared UI contracts, or component-level styling.

## Required Checks

- Search for existing local components, Blueprint primitives, helpers, tokens,
  tests, and frozen contracts before accepting new code.
- Prefer reuse or extraction when a new component repeats an existing visual
  state, interaction, data mapping, or SCSS structure.
- Block spaghetti-style coupling: oversized components, unclear state flow,
  repeated conditionals, duplicated class combinations, and hidden side effects.
- Pair manual review with duplicate/dead-code tooling when the change scope
  touches shared code or introduces repeated structures.
- Require a clear reason in the handoff or PR body when new code intentionally
  does not reuse an existing contract.
- A PASS is valid only when the final code matches the current task brief,
  frozen contract, and any available reference screenshot.

## Output

Return:

```text
reuse-audit: PASS
```

or:

```text
reuse-audit: FAIL
- src/components/Foo/Foo.tsx: duplicated action-button contract; reuse or extract Header action-button behavior before delivery.
```
