---
name: pl-ru-quality-gate
description: Use as the final PL_RU code-quality review for TypeScript, React, SCSS modules, Blueprint UI, accessibility, and performance before delivery or PR.
---

# PL_RU Quality Gate

Review the implemented diff. Do not edit files unless the user asks to apply the fixes. Apply `/pl-ru-frontend-rules` and inspect the changed code for runtime bugs, broken UX, accessibility problems, type holes, and performance traps.

Final delivery requires the applicable PL_RU subagents when subagent tooling is
available. Code changes need code-quality/readability/reusability/optimization
review. Source or UI changes need component-reuse review. Source changes need
duplicate/deadwood review. UI changes also need visual QA with pixel-level
screenshot comparison against available reference PNGs plus DOM/CSS metric
checks. Treat visual, reuse, duplicate/deadwood, or code-review FAIL output as a
blocker until fixed and rechecked. A PASS is valid only when the final diff
matches the task brief, frozen contracts, and available reference screenshots.

Closeout blockers:

- Explicit defers cannot override blockers.
- Frozen contract mismatch, missing required visual QA, failing required
  subagent/local role, unresolved task-brief mismatch, and missing
  `pnpm codex:ship` for finished delivery are blockers until fixed or
  explicitly accepted by the current user request.
- For delegated work, inspect the spawned subagent output contract. Required
  evidence must include PASS/FAIL, inspected files, verification evidence,
  blockers, and bounded explicit defers. Inline-only summaries are insufficient
  when explicit spawned agents were required.

Severity:

- block: bug, security issue, broken UX, accessibility violation, runtime error
- fix-before-merge: code smell, spaghetti coupling, duplicated logic or styles, missing reuse, missing type, missing alt text, missing accessible name, suboptimal selector
- nit: style, naming, or comment issue

Output shape:

```text
quality-gate: PASS
```

or:

```text
quality-gate: 2 findings

block (1)
- src/components/Foo/Foo.tsx:12: icon-only Button is missing aria-label.

fix-before-merge (1)
- src/app/page.tsx:8: bundled image should use next/image with dimensions.
```

> Claude mirror of the Codex skill plugins/pl-ru-codex/skills/pl-ru-quality-gate/SKILL.md - keep both canons in sync (parity guard A16).
