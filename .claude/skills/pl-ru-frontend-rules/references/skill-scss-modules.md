# Skill: SCSS modules

## File layout

- Component module: `src/components/<Name>/<Name>.module.scss`. Always
  co-located.
- Global SCSS: `src/app/globals.scss` only. Never import a module file globally.
- Partials (underscore-prefixed) live in `src/styles/` and are `@use`-d, not
  compiled standalone.

## Imports

- Use relative paths such as `@use '../../styles/tokens' as t;` from component
  modules. Never use `@import` (deprecated in Sass).
- Always use an `as` namespace. Avoid raw `@use ...;` without alias.
- Keep import guidance aligned with `next.config.ts`; there is no Sass
  include-path shortcut configured today.

## Token usage

- Reach for `t.$space-4`, `t.$color-accent`, `t.$fs-h2`; never inline values.
- New value? Add to `_tokens.scss` first, then consume it. `verify-frozen.ts`
  A5 enforces this under `src/`.

## Class naming

- Use camelCase class names so they survive CSS-modules transformation:
  `.cardTitle`, not `.card-title`.
- Use `&__elem` BEM-style only if nested-element clarity is worth it.

## Responsive

- Use `@include m.media-up(md) { ... }` from `_mixins.scss`.
- Mobile-first: base styles for small screens, opt in for larger.

## Blueprint overrides

- Override Blueprint classes only inside `blueprint-overrides.scss` (global),
  never inside a component module.
- Even there, prefer Blueprint CSS custom-property overrides over direct
  `.bp6-*` selector styling.

## Specificity

- Keep selectors single-class where possible: `.card`, not
  `.parent .card .inner`.
- If you need to manage Blueprint specificity, prefer lower-specificity
  patterns such as `:where()`.
