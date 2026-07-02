---
name: pl-ru-frontend-rules
description: Use for any PL_RU frontend implementation or review that touches Next.js, React, TypeScript, SCSS modules, Blueprint components, accessibility, performance, or design-system references.
---

# PL_RU Frontend Rules

Use this skill before editing production code in `src/**`, `next.config.ts`, `tsconfig.json`, `playwright.config.ts`, `verify-frozen.ts`, or `package.json`.

## Source of Truth

Priority order:

1. `verify-frozen.ts`
2. The current user request
3. `AGENTS.md`
4. This skill and its reference files
5. Design-reference skills such as `$blueprint-design` and `$osiris-design`

Run `pnpm verify` whenever architecture rules may be affected. Run `pnpm codex:ship` before pushing a finished change.

## Core Rules

- Stack is Next.js 16, React 19, TypeScript strict, SCSS modules, Blueprint v6, pnpm, Node 24 LTS.
- Do not add Tailwind, CSS-in-JS, styled-components, npm lockfiles, yarn lockfiles, `localStorage`, or `sessionStorage` in `src/`.
- Raw colors, spacing, and typography values belong in `src/styles/_tokens.scss`; component SCSS consumes them through `@use`.
- Layout and component dimensions / spacing across the whole app should stay on
  the shared `10px` / `8px` / `4px` sizing rhythm. Use `4px` as the minimum grid
  step, with `8px` and `10px` multiples preferred for larger component and shell
  measurements when they fit the visual contract. Radii follow the same rhythm
  unless a frozen visual contract explicitly requires a smaller hairline radius,
  such as the current `2px` map outer container.
- Components are co-located as `src/components/<Name>/<Name>.tsx` and `<Name>.module.scss`.
- Blueprint imports come only from `@blueprintjs/core` and `@blueprintjs/icons` package roots.
- Use Blueprint icons through `<Icon icon="..." />`; icon-only controls need accessible names.
- All images need `alt`; bundled images larger than 100px should use `next/image` with dimensions.
- Google Drive materials must not be committed unless the user explicitly exports them and the result passes `DO_NOT_PUSH.md` checks.
- Before adding a component, helper, style contract, or visual state, prove that
  existing local components, Blueprint primitives, tokens, helpers, and frozen
  contracts cannot be reused or extracted cleanly.

## References

Read only the reference file that matches the task:

- `references/skill-typescript-frontend.md` for TS/React strictness and file organization.
- `references/skill-react-patterns.md` for state, effects, composition, forms, and performance.
- `references/skill-blueprint-usage.md` for Blueprint imports, theming, icons, and primitives.
- `references/skill-scss-modules.md` for component SCSS, tokens, and responsive styling.
- `references/skill-a11y-performance.md` for accessibility and frontend performance checks.
