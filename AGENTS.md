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

## Reference folders (READ-ONLY)

- `Blueprints_lib/` — Palantir Blueprint monorepo. Read-only reference for component APIs and tokens. Start with `Blueprints_lib/llms.txt` for the curated index.
- `Osiris_ref/` — Next.js 16 OSINT dashboard. Read-only reference for layout patterns and motion. Uses plain CSS, **not** SCSS modules or Blueprint — translate, don't copy.
- `.claude/skills/osiris-design/` — OSIRIS brand vocabulary (void black, gold + cyan, glass panels, HUD typography). Read-only design system. Read its `SKILL.md` + `README.md`.
- `.claude/skills/blueprint-design/` — Palantir Blueprint design system (4px grid, native font stack, 4 intents, 5-step elevation, two ready UI kits). Read-only design system.
- Never edit, move, or delete anything inside these folders. The Claude hook `scripts/verify-reference.js` flags drift; `.claude/settings.json` denies writes at the harness level.

## What NOT to do

- Don't add Tailwind even if a code suggestion mentions it.
- Don't switch from pnpm to npm or yarn — `package-lock.json` and `yarn.lock` are forbidden.
- Don't inline colors. Reach for `src/styles/_tokens.scss`.
- Don't import Blueprint internals (e.g. `@blueprintjs/core/lib/esm/...`). Use only the package root.
- Don't use `localStorage` / `sessionStorage`.
- Don't read or commit anything listed in `DO_NOT_PUSH.md`.
- Don't write to any read-only reference folder (`Blueprints_lib/`, `Osiris_ref/`, `.claude/skills/**`).
- Don't use Lucide icons even though `osiris-design` recommends them — Blueprint icons via `<Icon icon="..." />` only.
- Don't `@import` Google Fonts from a CDN inside `src/`. If a webfont is required, load via `next/font`.

## When in doubt

Read `CLAUDE.md`. If it's silent on something, ask the human.
