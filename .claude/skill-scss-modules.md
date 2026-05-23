# Skill: SCSS modules

## File layout
- Component module: `src/components/<Name>/<Name>.module.scss`. Always co-located.
- Global SCSS: `src/app/globals.scss` only. Never import a module file globally.
- Partials (underscore-prefixed) live in `src/styles/` and are `@use`-d, not compiled standalone.

## Imports
- `@use 'styles/tokens' as t;` — never `@import` (deprecated in Sass).
- Always with `as` namespace. Avoid raw `@use ...;` without alias.
- The `includePaths` in `next.config.ts` resolves `'styles/...'` from `src/styles/`.

## Token usage
- Reach for `t.$space-4`, `t.$color-accent`, `t.$fs-h2` — never inline values.
- New value? Add to `_tokens.scss` first, then consume. `verify-frozen.ts` A5 enforces this.

## Class naming
- camelCase class names so they survive CSS-modules transformation: `.cardTitle`, not `.card-title` (JS side uses `styles.cardTitle`).
- Use `&__elem` BEM-style only if you really need nested-element clarity; otherwise flat.

## Responsive
- `@include m.media-up(md) { ... }` from `_mixins.scss`.
- Mobile-first: base styles for ≤ 375 px, opt-in for larger.

## Blueprint overrides
- Override Blueprint classes only inside `blueprint-overrides.scss` (global) — never inside a component module (specificity wars).
- Even there, prefer `--pt-*` CSS-custom-property override over `.bp6-button { background: ... }` rule.

## Specificity
- Keep selectors single-class where possible: `.card`, not `.parent .card .inner`.
- If you need to fight Blueprint specificity, increment with `:where()` to keep your selector at the same specificity level.
