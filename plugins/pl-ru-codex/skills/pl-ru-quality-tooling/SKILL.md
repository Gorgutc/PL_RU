---
name: pl-ru-quality-tooling
description: Use when adding, reviewing, or fixing PL_RU quality scripts, lint configs, browser checks, a11y checks, or ship gates.
---

# PL_RU Quality Tooling

Use this for work on ESLint, Prettier, Stylelint, HTMLHint, Knip, JSCPD,
Playwright, axe, Pa11y, Lighthouse CI, Markdownlint, CSpell, Lefthook,
dependency-cruiser, and package scripts.

## Command Layers

- `pnpm quality:fast`: cheap local checks.
- `pnpm quality:deep`: audit checks, `pnpm check:visual`, browser/a11y smoke,
  and full frozen runtime.
- `pnpm quality:all`: full local gate, including refs and Lighthouse.
- `pnpm codex:ship`: required before commit and push.

## Rules

- Use pnpm only.
- Do not auto-format the whole repo unless the user asks.
- Keep read-only reference folders excluded from format/lint/audit tools unless
  the tool is explicitly checking reference integrity.
- Keep `pnpm check:visual` in the deep gate so UI-surface changes cannot ship
  without visual QA evidence.
- `pnpm check:visual` must fail closed when the base ref is unavailable, include
  staged/unstaged/untracked UI files, and perform real PNG comparison from
  `pixelComparison.cases` before PASS.
- For base-diff UI changes, the implicit CI manifest must be tracked at
  `tests/visual-qa/latest.json`; ignored `reports/visual-qa/latest.json` is only
  valid through an explicit `VISUAL_QA_EVIDENCE` override.
- Screenshot-backed cases may include `capture` metadata so the guard can start
  or reuse the app, capture a fresh `actualPath`, and compare it with the
  committed `referencePath`.
- Keep final visual actual/diff output constrained to ignored
  `reports/visual-qa/`. Do not use `test-results/visual-qa/` for tracked PR
  evidence because Playwright can clear it before handoff or subagent review.
- Browser checks may require approved execution outside a restricted Windows
  sandbox.
