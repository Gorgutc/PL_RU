# TS Frontend Starter

Production-ready scaffold for **Next.js 16 + React 19 + TypeScript 5 strict + SCSS modules + Blueprint** dashboard / data-heavy apps.

## What's inside

- Next.js 16 App Router with React 19 and TypeScript 5 strict
- SCSS modules + design tokens system (no Tailwind, no CSS-in-JS)
- Blueprint v6 (`@blueprintjs/core`, `@blueprintjs/icons`) preconfigured
- framer-motion 12 for animations (optional, on standby)
- ESLint 9 + Prettier + Stylelint preconfigured
- Vitest (unit) + Playwright (e2e) test runners
- `verify-frozen.ts` architecture regression script
- AI agent guardrails: `CLAUDE.md`, `AGENTS.md`, `.claude/` agents and skills
- `DO_NOT_PUSH.md` checklist of files that must never be committed

## Prerequisites

- Node ≥ 22 (LTS) — run `node -v` to check
- pnpm ≥ 9 — `npm install -g pnpm@latest` if missing

## First run

```bash
pnpm install
pnpm exec playwright install chromium   # one-time, for `pnpm verify` and `pnpm test:e2e`
pnpm dev
```

Open <http://localhost:3000>.

> **Why the Playwright step?** Playwright is a devDependency, but its browser binaries are downloaded separately. Skip it and `pnpm verify` / `pnpm test:e2e` will fail with `Executable doesn't exist`. The `pnpm verify:static` script skips runtime tests if you don't want to install Chromium.

## Common commands

```bash
pnpm dev          # dev server
pnpm build        # production build
pnpm start        # serve the production build
pnpm lint         # ESLint
pnpm stylelint    # SCSS lint
pnpm typecheck    # tsc --noEmit
pnpm test         # vitest unit tests
pnpm test:e2e     # playwright e2e
pnpm verify       # frozen-rules regression (boots dev server)
pnpm verify:static # frozen-rules regression, static checks only
pnpm ship         # format-check + lint + stylelint + typecheck + test + verify
```

## Directory map

```
src/
  app/              Next.js App Router (layout, pages, global SCSS)
  components/       one folder per component, co-located *.module.scss
  styles/           _tokens.scss + _mixins.scss + blueprint-overrides.scss
  lib/              utils, hooks, server actions
tests/
  unit/             vitest
  e2e/              playwright
verify-frozen.ts    architecture regression
.claude/            AI agent guardrails (subagents + slash command + skills)
CLAUDE.md           rules for Claude Code
AGENTS.md           rules for other AI agents
DO_NOT_PUSH.md      checklist of secrets / locals / artifacts to never push
```

## Customising the starter

1. Rename `package.json#name` to your project.
2. Edit `src/styles/_tokens.scss` — this is the only place colors / spacing / type are allowed.
3. Edit `src/app/layout.tsx` metadata (title, description, theme-color).
4. Add your first feature under `src/components/<Name>/`.
5. Add a frozen rule? Update `verify-frozen.ts` and `CLAUDE.md` at the same time.

## Blueprint vs. React 19 compatibility note

Blueprint v6's published peer-dependency range still lists React 18 even though runtime React 19 support has landed. The starter pins React 19 and adds a `pnpm.peerDependencyRules.allowedVersions` override in `package.json` so `pnpm install` completes without erroring on the mismatch. If you see peer warnings (not errors), they are expected — track the Blueprint v6 changelog for an official peer-dep bump and remove the override when it lands.

The `verify-frozen.ts` runtime tests pin to `.bp6-*` selectors but accept `.bp5-*` as a fallback so the suite stays usable while you migrate.

## Next 16 gotchas worth knowing

- `params` and `searchParams` in dynamic route handlers and pages are now **Promises** — `await` them.
- `next/image` no longer accepts the legacy `layout` prop variants; use `fill` / `width+height`.
- `unstable_after` is GA and renamed to `after` — import from `next/server`.
- `next lint` was removed in Next 15; this starter calls `eslint .` directly.
- React 19 Server Components are the default in App Router. Components using state, refs, browser APIs, or third-party libraries that rely on hooks (Blueprint, framer-motion) must opt in with `'use client'` at the top of the file. The `ExampleCard.tsx` in this starter is already marked.

## License

MIT (or whichever you choose) — set in your own repo.
