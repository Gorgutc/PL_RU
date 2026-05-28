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
- Keep `diffPath` output under ignored visual-artifact directories such as
  `reports/visual-qa/` or `test-results/visual-qa/`; never point it at source,
  config, `.git/`, or any tracked file.
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
- artifacts: reports/visual-qa/... actual/reference/diff PNGs listed in latest.json
```

or:

```text
visual-qa: FAIL
- 1920 notifications-open differs from reference in filter row; fix and rerun.
```
