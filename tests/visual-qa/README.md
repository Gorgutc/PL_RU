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

When UI files changed in the base diff, CI-visible evidence must be committed at
`tests/visual-qa/latest.json`. The ignored `reports/visual-qa/latest.json` path
is accepted only through an explicit `VISUAL_QA_EVIDENCE` override for a local
run.

Cases may include `capture` metadata so the guard can start or reuse the local
app, take a fresh Playwright screenshot, write `actualPath`, and then compare it
with the committed reference PNG. Supported capture actions currently include
clicking selectors before the screenshot:

```json
{
  "capture": {
    "url": "/",
    "selector": "[data-testid=\"workspace-shell\"]",
    "viewport": { "width": 1920, "height": 1080 },
    "actions": [{ "type": "click", "selector": "#praios-header-tab-kick" }]
  }
}
```

Do not commit downloaded Google Drive PNGs unless the current user request
explicitly asks for that export and `DO_NOT_PUSH.md` allows it.
