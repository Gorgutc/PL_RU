# PL_RU Code Review Guide

Use this guide for human and Codex review of implementation diffs.

## Review Order

1. Confirm the diff belongs to the current task and branch.
2. Check `AGENTS.md`, then the relevant repo-local skills.
3. Inspect changed files for runtime bugs, type gaps, a11y regressions, and
   Blueprint misuse.
4. Run the narrowest useful checks while iterating.
5. Run `pnpm codex:ship` before staging a finished PR.

## Findings

Use these severities:

- `block`: runtime error, security issue, broken UX, a11y violation, or frozen
  rule break.
- `fix-before-merge`: likely bug, missing test, type hole, drift from project
  conventions, or fragile config.
- `nit`: naming, wording, or low-risk cleanup.

## Project-Specific Checks

- No Tailwind, CSS-in-JS, styled-components, npm lockfiles, or yarn lockfiles.
- No `localStorage` or `sessionStorage` under `src/`.
- Blueprint imports only from package roots.
- Icon-only controls need accessible names.
- SCSS `font-size` values use `rem` or `clamp`, not `px`.
- Raw colors stay in allowed token/override files.
