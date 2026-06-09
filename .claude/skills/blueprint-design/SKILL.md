---
name: blueprint-design
description: Use this skill to generate well-branded interfaces and assets for Blueprint (Palantir's open-source React UI toolkit) — either for production code or throwaway prototypes / mocks. Contains essential design guidelines, colors, type, fonts, assets, and UI kit components for prototyping data-dense desktop apps in the Foundry / Gotham / AIP aesthetic.
user-invocable: true
---

# Blueprint Design — agent skill

> Claude mirror of the Codex skill `plugins/pl-ru-codex/skills/blueprint-design/SKILL.md` — keep both canons in sync (parity guard A16). The asset bundle (README.md, colors_and_type.css, assets/, ui_kits/, preview/) lives only at the canonical path `plugins/pl-ru-codex/skills/blueprint-design/`; resolve every relative file reference below against that folder. This folder is a read-only design reference — never edit it.

Read `plugins/pl-ru-codex/skills/blueprint-design/README.md` for the full system context (content tone, visual foundations, iconography). The most-used files (all under `plugins/pl-ru-codex/skills/blueprint-design/`):

- `colors_and_type.css` — all design tokens as CSS custom properties (grays, intents, extended palette, type scale, spacing, elevation, motion). Drop this into any HTML artifact via `<link rel="stylesheet" href="colors_and_type.css">`.
- `assets/icons/16px/`, `assets/icons/20px/` — 85+ Blueprint SVG icons. Use them by `<img src=…>` for monocolor inheritance, or render through a CSS `mask-image` for intent tinting.
- `assets/palantir.svg`, `assets/blueprint-hero.png` — official logos. Both designed for dark surfaces.
- `ui_kits/foundry-console/` — pixel-faithful recreation of a Foundry-style data console, with modular Navbar / Sidebar / Atoms / View components and an interactive click-through (sign-in → datasets → detail → run dialog).
- `preview/` — 30 small specimen cards covering every token, type style, and component (these are also visible in the Design System tab).

## When to use this skill

If asked to design **any** desktop-class data product (analytics console, ops dashboard, ontology browser, pipeline tool, observability UI), Blueprint is the right foundation. It is **not** the right foundation for marketing pages, consumer-facing mobile UIs, or emoji-heavy social products.

## Workflow

When creating visual artifacts (slides, mocks, throwaway prototypes), copy the assets you need out of this skill and emit a static HTML file the user can view. When working on production code, copy the SCSS tokens out of `colors_and_type.css`, point to the canonical npm packages (`@blueprintjs/core`, `@blueprintjs/icons`, etc.), and reference the upstream source for component implementations:
https://github.com/palantir/blueprint

If the user invokes this skill with no concrete brief, ask them what they want to build (Foundry-style analytics? Apollo-style ops? a one-off mock?), what surfaces matter (which screens, which interactions), and what fidelity they need (wireframe, hi-fi, click-through). Then act as an expert Blueprint designer and ship either HTML artifacts or production code, depending on the need.

## Cardinal rules

1. **System font stack.** Never substitute a Google Font for body text. Blueprint reads native on every OS.
2. **Sentence case.** Buttons say `Save changes`, not `Save Changes`.
3. **No emoji, no marketing fluff.** Honest, declarative copy. Intents (`primary`, `success`, `warning`, `danger`) carry the affect.
4. **Density is a feature.** 30px buttons, 30px input height, 50px navbar, 14px body. Don't soften it.
5. **4px grid, 4px radii, 100ms motion.** One scale, one easing, one duration.
6. **Solid surfaces, no gradients on chrome.** Cards are `#fff` or `$dark-gray3` with the proper shadow.
7. **When in doubt, read the source.** `packages/core/src/components/` in `palantir/blueprint` has the canonical answer.
