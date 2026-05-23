# TS Frontend Starter — Claude Code session bootstrap

Read at every session start.

## Project in one paragraph

Next.js 16 (App Router) + React 19 + TypeScript 5 strict + SCSS modules + Blueprint (`@blueprintjs/core`, `@blueprintjs/icons`) as the component library. Animations via framer-motion. pnpm only. Node 22 LTS. Source of truth for architecture is `verify-frozen.ts` in the repo root.

## Source of truth

```bash
pnpm verify
```

Expected: `SUMMARY: <n>/<n> PASS, 0 FAIL`. Update `verify-frozen.ts` when adding new frozen rules — never silently work around it.

## Authority order on conflicts

```
verify-frozen.ts  >  user message in chat  >  CLAUDE.md  >  AGENTS.md  >  .claude/skill-*.md
```

## Frozen rules (top 10)

Each rule that maps to a `verify-frozen.ts` test is tagged `(verify: <id>)`.

1. Stack: **Next.js 16, React 19, TypeScript 5 strict, SCSS modules, Blueprint v6**. No Tailwind `(verify: A1)`. No CSS-in-JS `(verify: A2)`. No styled-components.
2. Package manager: **pnpm only**. Never commit a `package-lock.json` or `yarn.lock` `(verify: A3)`.
3. Colors / spacing / typography live in `src/styles/_tokens.scss` only `(verify: A4)`. Components consume via `@use '../../styles/tokens' as t`. No inline `#hex` or magic `1.25rem` in component SCSS `(verify: A5)`.
4. Component co-location: `src/components/<Name>/<Name>.tsx` + `<Name>.module.scss`. Always.
5. Class names from `.module.scss` files only. No global classes outside `globals.scss`.
6. Blueprint usage: import only from `@blueprintjs/core` / `@blueprintjs/icons` package roots `(verify: A7)`. Never from internal paths (`@blueprintjs/core/lib/esm/...`).
7. No `localStorage` / `sessionStorage` in `src/` `(verify: A6)`. State via React state, URL, or server.
8. No `prefers-color-scheme` for theme. Dark mode is set via `<html class="bp6-dark">` in `layout.tsx`.
9. Mobile-first SCSS: 375 → 768 → 1024 → 1280. Use `@include m.media-up(md)` from `_mixins.scss`.
10. All `<img>` need `alt`. Use `next/image` for any image in the bundle. No `px` for `font-size` — `rem` / `clamp` only `(verify: A8)`.

## Workflow

For any change to `src/**`, `next.config.ts`, `tsconfig.json`, `playwright.config.ts`, `verify-frozen.ts`, or `package.json`:

1. Generate the change.
2. **Spawn three subagents in parallel via the Agent tool in a single tool-turn**: `ts-context-keeper`, `ts-spec-guardian`, `ts-quality-gate`. Wait for all three.
   - Equivalent slash command (user-typed only): `/ship`.
3. If all gates PASS, write the file.
4. Run `pnpm verify`. If FAIL, revert and iterate.
5. Before commit: `pnpm ship` (= format-check + lint + stylelint + typecheck + unit + verify).

## Intent-confirm rule (anti-drift)

Before any Edit/Write that:
- changes UX behaviour (where a control lives, what it does)
- moves DOM elements between regions
- changes responsive layout semantics
- introduces or removes interactive elements
- pivots away from the approach the user articulated

— first output a single `### Intent:` block in chat, 2–4 sentences, naming the concrete files (`src/components/<X>/...`, `src/app/...`, `src/styles/...`) the change will touch and the resulting user-visible behaviour. Then wait for the user's one-word `ack` (`ok` / `да` / `поехали`) **or** a correction. Only after `ack` proceed to tool calls.

If during implementation a conflict surfaces with the stated intent (e.g. a frozen rule blocks the approach, or two requirements seem to contradict), **STOP and use `AskUserQuestion`**. Never silently pick a different approach.

Mechanical changes that do NOT need intent-confirm:
- bug fixes with a single obvious correction
- typo / copy edits
- adding a single i18n key that was discussed
- following an explicit "do X" from the user verbatim
- doc edits (README, CLAUDE.md, .claude/*.md) when the user asked for a specific change

When in doubt, **state the intent**. Cost of one extra round-trip is far below cost of building the wrong thing.

## File map

```
/
├── src/
│   ├── app/             # Next.js App Router
│   │   ├── layout.tsx   # imports blueprint.css + globals.scss; sets bp6-dark
│   │   ├── page.tsx
│   │   └── globals.scss
│   ├── components/      # one folder per component
│   │   └── ExampleCard/
│   │       ├── ExampleCard.tsx
│   │       └── ExampleCard.module.scss
│   ├── styles/
│   │   ├── _tokens.scss          # only place for raw values
│   │   ├── _mixins.scss          # breakpoints, focus ring
│   │   └── blueprint-overrides.scss
│   └── lib/             # utils, hooks, server actions
├── tests/
│   ├── unit/            # vitest
│   └── e2e/             # playwright
├── verify-frozen.ts     # architecture regression
├── .claude/
│   ├── agents/          # ts-spec-guardian, ts-quality-gate, ts-context-keeper
│   ├── commands/        # /ship
│   └── skill-*.md       # methodology guides
├── package.json
├── tsconfig.json
├── next.config.ts
├── playwright.config.ts
└── vitest.config.ts
```

## What this repo does NOT use

- Tailwind, Bootstrap, any utility-CSS framework
- styled-components, emotion, vanilla-extract, any CSS-in-JS
- npm or yarn (pnpm only)
- localStorage / sessionStorage / cookies for client state
- `prefers-color-scheme` for theme (theme is explicit)
- `defer` / `type="module"` script tags (Next bundles for us)

## Reminders

- `rem` and `clamp()` for font-size. Never `px` for typography.
- Every `<img>` needs `alt`, `width`, `height` (or use `next/image`).
- A11y first: every interactive element has a label, focus ring, role.
- Blueprint icons via `<Icon icon="..." />`, not raw SVG.
- English content only in the starter template — localise in your fork.

If you are uncertain about a rule, run `pnpm verify` and read what fails — the test is the truth.
