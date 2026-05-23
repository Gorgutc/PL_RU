# Skill: A11y + Performance

## A11y baseline
- Every `<img>` has `alt`. Decorative: `alt=""`. Meaningful: descriptive text.
- Every interactive control has an accessible name: visible text, `aria-label`, or `aria-labelledby`.
- Focus ring on every interactive control: never remove `:focus-visible` outline without replacing it (see `@mixin focus-ring` in `_mixins.scss`).
- Heading order: never skip levels (`<h1>` → `<h2>` → `<h3>`).
- Colour contrast: text ≥ 4.5:1 (AAA: 7:1). Validate with axe-core in dev or Playwright.
- Forms: every `<input>` has a `<label>` or `aria-label`.
- Live regions for async UI: `<div role="status" aria-live="polite">` for non-critical, `aria-live="assertive"` only for errors.
- Modals trap focus and restore on close — Blueprint `Dialog` handles this; custom overlays do not.

## Performance baseline
- Use `next/image` for any image > 100 px in either dimension. Always specify `width` and `height`.
- Lazy-load below the fold: `loading="lazy"`, `decoding="async"` (or `next/image` defaults).
- Hydration budget: keep Server Components by default; `'use client'` only where state / events / refs / browser APIs are needed.
- Bundle: check `pnpm build` output for any chunk > 200 KB gzipped. Investigate before merging.
- Avoid `next/dynamic` with `ssr: false` for above-the-fold content — it pushes LCP later.
- Fonts: preload the woff2 of the primary face if it's render-blocking; otherwise let the browser fetch on demand.

## What the quality-gate flags
- Missing `alt` → 🟥 block.
- Missing `aria-label` on icon-only button → 🟥 block.
- Focus ring removed without replacement → 🟥 block.
- Heading skip → 🟧 fix-before-merge.
- `next/image` not used for hero image → 🟧 fix-before-merge.
- `'use client'` on a leaf component that renders only static markup → 🟧 fix-before-merge.
- Inline event handler that captures unstable refs in a hot list → 🟨 nit (profile first).
