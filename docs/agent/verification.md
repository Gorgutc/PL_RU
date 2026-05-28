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

## Agent Review Gate

For implementation or review work, raise the applicable PL_RU subagents before
delivery. UI/frontend work needs visual QA, source changes need code
quality/readability/reusability/optimization review, and frozen/docs/skills/hooks
work needs frozen or instruction-drift review. Treat subagent FAIL output as a
fix-before-delivery blocker.

If subagent tooling is unavailable, run the same roles locally and say that the
subagent fallback was used.

## Pixel-Level Visual QA

UI changes must be checked with pixel-level screenshot comparison against the
available reference PNGs, including Google Drive Figma exports. Use Playwright
screenshots plus a pixel comparison tool or equivalent script, and report the
viewports, diff tolerance, and any mismatched areas.

For Header work, include at least `1280`, `1440`, and `1920` widths unless the
current user request narrows that scope. Pair the pixel diff with DOM/CSS metric
assertions for spacing, sizes, border radii, colors, accessible states, and
responsive behavior. Do not rely on visual eyeballing alone.

If a reference PNG is inaccessible, block delivery unless the current user
request explicitly accepts a metric-only fallback. Do not commit downloaded or
exported Drive references unless the user explicitly asks for that export.

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
