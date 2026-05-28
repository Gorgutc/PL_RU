# PL_RU Verification Guide

Use pnpm for every command in this repository.

## Fast Loop

```bash
pnpm verify:static
pnpm quality:fast
```

## Deep Loop

```bash
pnpm quality:deep
```

This adds markdown, spelling, dependency graph, dead-code, duplicate-code,
browser smoke, Pa11y, and full frozen runtime checks.

## Full Ship Gate

```bash
pnpm quality:all
pnpm codex:ship
```

`quality:all` syncs the reference baseline, runs the deep gate, production
dependency audit, Lighthouse CI, and verifies read-only references.

`codex:ship` is the same full local gate used before committing and pushing a
finished change.

## Frozen Decisions

`pnpm verify` also checks the repo-level memory and frozen-decision contracts.
When changing Header behavior, shared UI contracts, Codex instructions, or
quality tooling, update `docs/agent/frozen-decisions.md` and `verify-frozen.ts`
in the same change only when the current user request explicitly asks for that
frozen decision to change.

## Windows Notes

Browser checks may fail inside restricted sandboxes with Chromium spawn errors.
If that happens, rerun the same pnpm command outside the sandbox or with
approved escalation rather than changing the tests.
