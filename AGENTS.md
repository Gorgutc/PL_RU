# AGENTS.md — for non-Claude AI agents

If you are Cursor, GitHub Copilot Workspace, Codex CLI, or another AI coding agent: read this file before editing anything in this repo.

## TL;DR

1. **Stack**: Next.js 16 + React 19 + TypeScript 5 strict + SCSS modules + Blueprint (`@blueprintjs/core`, `@blueprintjs/icons`). pnpm only.
2. **No Tailwind**, no CSS-in-JS, no styled-components.
3. **Source of truth**: `pnpm verify`. Run it before claiming work is done.
4. **Full rules**: see `CLAUDE.md`.

## Quick start

```bash
pnpm install
pnpm dev          # http://localhost:3000
pnpm verify       # architecture regression
pnpm ship         # full quality gate: format + lint + stylelint + typecheck + test + verify
```

## What NOT to do

- Don't add Tailwind even if a code suggestion mentions it.
- Don't switch from pnpm to npm or yarn — `package-lock.json` and `yarn.lock` are forbidden.
- Don't inline colors. Reach for `src/styles/_tokens.scss`.
- Don't import Blueprint internals (e.g. `@blueprintjs/core/lib/esm/...`). Use only the package root.
- Don't use `localStorage` / `sessionStorage`.
- Don't read or commit anything listed in `DO_NOT_PUSH.md`.

## When in doubt

Read `CLAUDE.md`. If it's silent on something, ask the human.
