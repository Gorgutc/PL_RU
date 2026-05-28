# ADR 0002: Maximal Free Quality Tooling

## Status

Accepted.

## Context

The project needs a strong local quality layer for audits, instruction work, and
future refactors. Existing checks covered formatting, linting, typechecking,
unit tests, Playwright e2e, and frozen architecture rules.

## Decision

Add a broad free toolchain around the existing checks: HTMLHint, Knip, JSCPD,
axe, Pa11y, Lighthouse CI, Markdownlint, CSpell, Lefthook, and
dependency-cruiser. Add `check:visual` as a local visual QA evidence gate for
UI-surface changes, including staged/unstaged/untracked detection, fail-closed
base-ref handling, local PNG pair comparison, and ignored diff artifacts. Group
commands into `quality:fast`, `quality:deep`, and `quality:all`.

## Consequences

The full ship gate is heavier but more protective. Browser-based checks may need
approved execution outside restricted Windows sandboxes.
