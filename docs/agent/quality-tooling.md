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
- axe through Playwright: browser accessibility smoke. Known frozen-palette
  exception: the `color-contrast` rule is disabled because the Figma-frozen
  `#2970ff` accent with white text measures ~4.3:1 (below WCAG AA 4.5:1) by
  design; see `docs/agent/tabs-pixel-fit-handoff.md`.
- Pa11y: page-level accessibility check. Same frozen-palette exception: the
  `WCAG2AA...G18.Fail` text-contrast code is ignored; large-text contrast
  (G145) stays enforced.
- Lighthouse CI: production-page quality budget.
- Lefthook: optional local pre-commit/pre-push hooks.

## Audit Policy

`check:audit` runs `pnpm audit --prod --audit-level low` so low, moderate,
high, and critical production advisories all fail the local gate instead of
passing silently.

Temporary dependency overrides are allowed only when an upstream package update
does not yet resolve the advisory path. As of 2026-06-24, `next@16.2.9` still
resolves `next -> postcss@8.4.31` and `next -> styled-jsx -> @babel/core@7.29.0`,
so `package.json` pins `postcss@8.5.15` and `@babel/core@7.29.7` through
`pnpm.overrides`. Revisit these overrides when the next Next.js patch is adopted
or by 2026-07-24, whichever happens first; remove them once `pnpm audit --prod
--audit-level low` stays clean without overrides.

## Command Groups

- `quality:fast`: cheap local checks.
- `quality:deep`: production dependency audit, visual QA evidence, browser
  smoke, a11y smoke, and full frozen runtime.
- `quality:all`: full local ship gate, adding reference sync/verify and
  Lighthouse on top of `quality:deep`.
- `codex:ship`: required before commit and push.

Do not run broad auto-formatting as part of this PR. `format` and `lint:fix`
remain explicit commands.
