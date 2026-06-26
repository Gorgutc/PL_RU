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
visual QA evidence, browser smoke, Pa11y, and full frozen runtime checks.

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
quality/readability/reusability/optimization review, source/UI changes need
component-reuse review, source changes need duplicate/deadwood review, and
frozen/docs/skills/hooks work needs frozen or instruction-drift review. Treat
subagent FAIL output as a fix-before-delivery blocker. A PASS is valid only when
the final diff matches the current task brief, frozen contracts, and available
reference screenshots.

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

`pnpm check:visual` enforces the visual QA evidence contract. It passes
automatically only when no UI surface changed across the base diff, unstaged
worktree diff, staged diff, and untracked files. When UI code, browser tests, or
Playwright config changed, it requires a visual QA evidence JSON at
`tests/visual-qa/latest.json`, `reports/visual-qa/latest.json`, or the path in
`VISUAL_QA_EVIDENCE`.

For UI changes present in the base diff, the default CI evidence manifest must
be committed at `tests/visual-qa/latest.json`. The ignored
`reports/visual-qa/latest.json` path is only a local override when passed through
`VISUAL_QA_EVIDENCE`; it must not be the implicit evidence source for a PR.
When no UI surface changed, a clean CI run validates the selected manifest shape
and tracked `referencePath` artifacts only; ignored generated `actualPath` and
`diffPath` files are not required to pre-exist in a fresh checkout.

That evidence must record PASS pixel comparison, reference PNG sources,
viewports, states, tolerance, mismatched areas, and DOM/CSS metrics. A manifest
alone is not enough: `pixelComparison.cases` must list local PNG pairs with
`referencePath`, `actualPath`, and `diffPath`. The check loads those PNGs through
Playwright, compares pixels with the recorded tolerance, writes a diff PNG, and
fails if dimensions, mismatch counts, or mismatch ratios exceed the allowed
limits. Final `actualPath` and `diffPath` artifacts for tracked PR evidence,
handoff, and subagents must stay under ignored `reports/visual-qa/` and must not
overwrite a tracked file. Do not point tracked evidence at
`test-results/visual-qa/`; Playwright clears that directory during browser test
runs, so it is not durable enough for handoff.

Evidence cases may include `capture` metadata with `url`, `selector`,
`viewport`, and click `actions`. When present, `pnpm check:visual` starts or
reuses the app at `VISUAL_QA_BASE_URL` or `http://localhost:3000`, captures a
fresh Playwright screenshot to `actualPath`, and then performs the PNG
comparison against the committed `referencePath`. Workspace/map captures wait
for a visible MapLibre canvas, attribution, and zoom controls before
screenshotting. If the canvas is blank, the guard retries capture once and then
fails with the affected case name instead of retrying indefinitely.

If a visual QA agent or local reviewer cannot find the expected
`reports/visual-qa/` artifacts, run `pnpm.cmd check:visual` once. If artifacts
are still absent or mismatch after that run, return FAIL with the missing paths
and reason; do not loop.

The base diff fails closed: if `VISUAL_QA_BASE_REF` is unavailable, the command
fails instead of silently passing. Use `VISUAL_QA_ALLOW_MISSING_BASE=1` only for
an explicit local fallback where the missing base ref is understood and reported.

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
