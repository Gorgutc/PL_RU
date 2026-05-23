# Skill: Blueprint usage

## Imports
- Only from `@blueprintjs/core` and `@blueprintjs/icons` package roots.
- Never from internal paths (`@blueprintjs/core/lib/esm/...`). They are not part of the public API and break on minor version bumps.

## Theming
- Dark mode: `bp6-dark` class on `<html>` in `layout.tsx`. Already wired in the starter.
- Customise theme via CSS custom properties in `src/styles/blueprint-overrides.scss`, not by overriding `.bp6-*` class internals.
- Blueprint compiles its own colors — your `_tokens.scss` is for everything OUTSIDE Blueprint. Don't try to make them match pixel-for-pixel; align by category (accent, surface) and accept Blueprint's neutrals.

## Icons
- Use the `<Icon icon="..." />` component, not raw SVG.
- Icon names: see https://blueprintjs.com/docs/#icons.
- Icon-only buttons MUST have `aria-label`. The component does not infer one.

## Anti-patterns
- ❌ Wrapping a Blueprint `Button` with a `<div>` only to add a class — pass `className` to the Button directly.
- ❌ Reimplementing `Card` / `Dialog` / `Menu` / `Popover` — use the Blueprint primitive and style via `className` + `.module.scss`.
- ❌ Mixing Blueprint `Dialog` with framer-motion enter animations — Blueprint already animates via CSS classes. If you need a different motion, drop to Blueprint's `Overlay` primitive.
- ❌ Using `intent="warning"` for errors — that's `intent="danger"`.

## Bundle size
- Blueprint core is ~300 KB gzipped if everything is imported. Tree-shaking handles per-component imports as long as you use named imports from the package root (which you should — see Imports).
- Don't lazy-load Blueprint chunks per route in the starter; do it in the dashboard project if a flame chart shows it matters.
