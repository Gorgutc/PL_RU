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
- `pnpm quality:deep`: audit checks plus browser/a11y smoke and full frozen
  runtime.
- `pnpm quality:all`: full local gate, including refs and Lighthouse.
- `pnpm codex:ship`: required before commit and push.

## Rules

- Use pnpm only.
- Do not auto-format the whole repo unless the user asks.
- Keep read-only reference folders excluded from format/lint/audit tools unless
  the tool is explicitly checking reference integrity.
- Browser checks may require approved execution outside a restricted Windows
  sandbox.
