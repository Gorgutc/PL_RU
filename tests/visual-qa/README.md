# PL_RU Visual QA Evidence

`pnpm check:visual` looks here for `latest.json` when UI-surface files change.
The file is a small evidence manifest that points to screenshot artifacts in
`reports/visual-qa/` or another ignored workspace path.

Required fields:

- `status: "PASS"`
- `taskScope`
- `references`: PNG reference sources, Drive IDs, local paths, or URLs
- `viewports`
- `states`
- `pixelComparison.status: "PASS"`
- `pixelComparison.tool`
- `pixelComparison.cases`: one entry per viewport/state PNG pair, each with
  `name`, `viewport`, `state`, `referencePath`, `actualPath`, and `diffPath`
- `tolerance`
- `mismatchedAreas`
- `domCssMetrics.status: "PASS"`

`pnpm check:visual` reads every listed `referencePath` and `actualPath`, compares
the PNGs through Playwright at pixel level, writes `diffPath`, and fails when the
dimensions or mismatch counts exceed `tolerance`. A self-reported PASS without
local PNG pairs is not valid evidence.

`diffPath` must live under `reports/visual-qa/` or `test-results/visual-qa/`.
Those directories are ignored artifacts; do not point diff output at source,
config, docs, `.git/`, or any tracked file.

Do not commit downloaded Google Drive PNGs unless the current user request
explicitly asks for that export and `DO_NOT_PUSH.md` allows it.
