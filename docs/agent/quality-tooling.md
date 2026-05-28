# PL_RU Quality Tooling

The quality layer is intentionally broad and local-first. It should catch drift
before CI and before a draft PR is opened.

## Tool Map

- ESLint: JavaScript, TypeScript, React, and Next.js linting.
- Prettier: formatting check.
- Stylelint: SCSS modules and token usage hygiene.
- HTMLHint: HTML artifacts when present.
- Markdownlint: Markdown docs.
- CSpell: spelling and project vocabulary.
- dependency-cruiser: dependency graph and circular import checks.
- Knip: unused files, exports, and dependencies.
- JSCPD: duplicate code detection.
- Visual QA evidence gate: blocks UI-surface changes without recorded
  pixel-comparison PASS, reference sources, checked states/viewports, tolerance,
  mismatched areas, and DOM/CSS metric PASS. It also fails closed when the base
  ref is unavailable, includes staged/unstaged/untracked UI files, compares
  local PNG pairs from `pixelComparison.cases`, and writes diff PNGs only to
  ignored artifact folders.
- Playwright: browser smoke tests.
- axe through Playwright: browser accessibility smoke.
- Pa11y: page-level accessibility check.
- Lighthouse CI: production-page quality budget.
- Lefthook: optional local pre-commit/pre-push hooks.

## Command Groups

- `quality:fast`: cheap local checks.
- `quality:deep`: audit checks, visual QA evidence, browser smoke, and a11y
  smoke.
- `quality:all`: full local ship gate, including audit and Lighthouse.
- `codex:ship`: required before commit and push.

Do not run broad auto-formatting as part of this PR. `format` and `lint:fix`
remain explicit commands.
