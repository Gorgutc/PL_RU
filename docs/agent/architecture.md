# PL_RU Architecture Notes

This document summarizes the current architecture so future Codex sessions do not
have to rediscover the baseline from scratch. It is descriptive, not higher
authority than `verify-frozen.ts`, the current user request, or `AGENTS.md`.

## Stack

- Next.js 16 App Router with React 19.
- TypeScript 5 in strict mode.
- SCSS modules for component styles.
- Shared SCSS tokens in `src/styles/_tokens.scss`.
- Blueprint v6 from `@blueprintjs/core` and `@blueprintjs/icons`.
- framer-motion is available for future UI motion but is not required by the
  starter screen.
- pnpm is the only package manager.
- Node 22 LTS is the supported runtime.

## Runtime Shape

- `src/app/layout.tsx` imports Blueprint CSS, project Blueprint overrides, and
  global SCSS.
- Dark mode is explicit through `<html className="bp6-dark">`.
- `src/app/page.tsx` renders the starter page and `ExampleCard`.
- Client-only Blueprint usage belongs in client components such as
  `src/components/ExampleCard/ExampleCard.tsx`.
- Component styles are colocated as `Component.module.scss`.

## Guardrails

- `verify-frozen.ts` owns frozen architecture checks.
- `pnpm verify:static` runs static frozen checks without a browser.
- `pnpm verify` starts a Next dev server and validates runtime invariants with
  Playwright.
- Reference folders are read-only: `Blueprints_lib/`, `Osiris_ref/`,
  `plugins/pl-ru-codex/skills/blueprint-design/`, and
  `plugins/pl-ru-codex/skills/osiris-design/`.
