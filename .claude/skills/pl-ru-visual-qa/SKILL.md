---
name: pl-ru-visual-qa
description: Use for PL_RU UI changes that require pixel-level screenshot comparison against available Google Drive / Figma PNG references plus DOM/CSS metric assertions.
---

# PL_RU Visual QA

Use this for every UI/frontend change before delivery.

## Required Checks

- Locate the relevant reference PNGs, including Google Drive Figma exports when
  available. For the Header, start with the `PL_RU_REF` Drive folder and its
  Header, button-state, profile-menu, and notification-panel subfolders.
- Capture Playwright screenshots for each required viewport and state.
- Compare screenshots at pixel level with an explicit diff tolerance and report
  mismatched areas. Do not rely on visual eyeballing.
- Record local `pixelComparison.cases` with `referencePath`, `actualPath`, and
  `diffPath` so `pnpm check:visual` can rerun the pixel comparison instead of
  trusting a self-reported manifest.
- For UI changes in a PR/base diff, commit CI-visible evidence at
  `tests/visual-qa/latest.json`; use ignored `reports/visual-qa/latest.json`
  only through an explicit `VISUAL_QA_EVIDENCE` local override.
- Prefer `capture` metadata for cases that should be reproducible in CI: record
  the app URL, selector, viewport, and click actions so `pnpm check:visual`
  captures a fresh `actualPath` before comparing it with the committed
  `referencePath`.
- Keep final `actualPath` and `diffPath` output under ignored
  `reports/visual-qa/`; never point it at `test-results/visual-qa/`, source,
  config, `.git/`, or any tracked file. Playwright clears `test-results/`, so it
  is not durable handoff evidence.
- If expected visual artifacts are absent in the working copy, run
  `pnpm.cmd check:visual` once and inspect `reports/visual-qa/`. If artifacts are
  still absent or mismatch after that one run, return FAIL with paths and reason
  instead of entering a retry loop.
- Workspace/map captures must wait for visible MapLibre canvas, attribution, and
  zoom controls. If the canvas is blank, one capture retry is allowed; a second
  blank capture is FAIL.
- Pair pixel comparison with DOM/CSS metric assertions for sizes, spacing,
  border radii, colors, offsets, responsive behavior, accessible states, focus,
  and keyboard dismissal.
- Treat any meaningful mismatch with the task brief, frozen contract, or
  reference PNG as FAIL until fixed and rechecked.
- If a reference PNG is inaccessible, block delivery unless the current user
  request explicitly accepts a metric-only fallback.

## Evidence

For UI work, provide a concise evidence record:

```text
visual-qa: PASS
- references: Google Drive PL_RU_REF / Header ...
- viewports: 1280, 1440, 1920
- states: closed, account-open, notifications-open
- tolerance: ...
- mismatched areas: none above tolerance
- DOM/CSS metrics: PASS
- artifacts: reports/visual-qa/... actual/diff PNGs listed in latest.json; references stay in committed or external referencePath sources
```

or:

```text
visual-qa: FAIL
- 1920 notifications-open differs from reference in filter row; fix and rerun.
```
