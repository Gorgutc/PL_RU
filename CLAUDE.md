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
verify-frozen.ts  >  user message in chat  >  CLAUDE.md  >  AGENTS.md  >  .claude/skill-*.md  ≈  .claude/skills/**/SKILL.md
```

`.claude/skill-*.md` (methodology guides) and `.claude/skills/<name>/SKILL.md` (design-system agent skills) sit at the bottom and lose every conflict with anything above. They are *resources*, not laws.

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
9. Desktop-first SCSS — app range **1240 → 4K**. Base = 1240px (no media query); fluid `clamp()` between locks at **1440 → 1920 → 2560 → 3840**. Use `@include m.media-up(lg|xl|xxl|uhd)` from `_mixins.scss` for reflow / pinned values. Root `font-size` stays fixed (Blueprint is px-based — global rem-scaling would desync it).
10. All `<img>` need `alt`. Use `next/image` for any image in the bundle. No `px` for `font-size` — `rem` / `clamp` only `(verify: A8)`.

## Reference folders (READ-ONLY)

Two reference folders live at the project root:

- `Blueprints_lib/` — Palantir Blueprint monorepo. **Use for**: looking up component APIs (`packages/core`, `packages/icons`), token names (`packages/colors`), the curated index in `Blueprints_lib/llms.txt`. **Before generating any component block, check whether Blueprint already exposes an equivalent**; if it does, import it from `@blueprintjs/core` / `@blueprintjs/icons` rather than rolling your own.
- `Osiris_ref/` — Next.js 16 OSINT dashboard. **Use for**: layout patterns, motion / animation choices, HUD-style information density, keyboard-shortcut UX. **Note**: Osiris uses plain CSS, not SCSS modules, and does **not** use Blueprint — so copy *structure and intent*, not stylesheets or class names. Translate every borrowed pattern into our tokens + Blueprint + SCSS modules stack.

**Hard rules**:
1. Both folders are **READ-ONLY**. Never `Edit`, `Write`, `rm`, or `mv` anything inside them. `.claude/settings.json` enforces this via `permissions.deny`.
2. Before generating a new component, run a quick check: does Blueprint already have it? does Osiris have a similar pattern worth adapting? If yes, cite the file you looked at in your intent block.
3. Reference-folder paths in chat / commits / docs use the on-disk layout: `./Blueprints_lib/...`, `./Osiris_ref/...`.
4. Drift is caught by the `Stop` hook (`scripts/verify-reference.js`). If it reports FAIL, revert with `git checkout -- Blueprints_lib Osiris_ref` before moving on.

## Design system skills (READ-ONLY)

Two **Agent Skills** live under `.claude/skills/`, installed from curated design-system ZIPs:

- `.claude/skills/osiris-design/` — OSIRIS Design System. *"Egyptian Mythology × Dark Ops × Glassmorphism"*. Brand atmosphere: void-black backgrounds (`#04040A`), gold (`#D4AF37`) + cyan (`#00E5FF`) accents, glass-panel surfaces with `backdrop-filter`, HUD-style uppercase-tracked typography, alert severity ramp (red/orange/gold/green/blue), pulse / scan-line motion. Invoke via `/osiris-design`. Best for: dashboard chrome, status panels, threat indicators, command bars.
- `.claude/skills/blueprint-design/` — Blueprint Design System (Palantir). Desktop-density vocabulary: 4px grid, 14px body, 30px controls, native-OS font stack, 4-intent palette, 5-step elevation, 100ms easing. Two fully-built UI kits (`foundry-console`, `gotham-intel`) recreate Palantir-style apps end-to-end. Invoke via `/blueprint-design`. Best for: layout fundamentals, density discipline, component composition, intent-driven color.

**How they coexist with the frozen rules** — pick atmosphere from the skills, implementation from our stack:

| Skill says | We do |
|---|---|
| OSIRIS: «use Lucide icons» | **Blueprint icons** via `<Icon icon="..." />` from `@blueprintjs/icons`. The Blueprint skill's `assets/icons/` provides the equivalent vocabulary; the OSIRIS skill's `Icon.jsx` is a Lucide curation we ignore. |
| OSIRIS: `@import url('fonts.googleapis.com/...')` | If we adopt JetBrains Mono / Inter, load via `next/font` in `layout.tsx`. **No `@import` from CDN in `src/`** — bundle locally. |
| OSIRIS: 50+ inline hex in `colors_and_type.css` | **Translate selectively into `src/styles/_tokens.scss`** as `$color-*` vars. Direct `<link>` to the skill's CSS would import inline hex into the project, violating A5. The skill CSS is a *reference*, not a stylesheet we ship. |
| Blueprint: «system font stack, never substitute a Google Font» | Acceptable to have Inter / JetBrains Mono in `$font-sans` / `$font-mono` if the design explicitly calls for them, but the fallback chain MUST include `system-ui, -apple-system, sans-serif`. Don't strip the native stack. |
| OSIRIS: `backdrop-filter: blur(24px) saturate(1.3)` | Allowed as a stylistic choice when the design calls for it. Apply only to dedicated `*-panel` / `*-overlay` classes, never to root or page-wide containers. |

**Hard rules**:
1. Both skill folders are **READ-ONLY** (same as `Blueprints_lib/` / `Osiris_ref/`). `.claude/settings.json` denies writes; the `Stop` hook (`scripts/verify-reference.js`) catches drift.
2. Skills are *resources*, not laws. Any conflict between a skill and CLAUDE.md or `verify-frozen.ts` is resolved by the authority order — CLAUDE.md wins.
3. When borrowing from a skill, cite the file in your `### Intent:` block: e.g. `osiris-design/preview/stat-counters.html` or `blueprint-design/ui_kits/foundry-console/Sidebar.jsx`.
4. Adding a new skill is zero-config: drop its folder under `.claude/skills/` and `sync-refs.sh` / `verify-reference.js` auto-discover it.

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
├── scripts/
│   ├── sync-refs.sh         # SessionStart: verify refs present, record baseline
│   └── verify-reference.js  # Stop: assert refs untouched (git status + sha)
├── Blueprints_lib/      # READ-ONLY — Palantir Blueprint monorepo (reference)
├── Osiris_ref/          # READ-ONLY — Next.js 16 OSINT dashboard (reference)
├── .claude/
│   ├── settings.json    # additionalDirectories, deny rules for refs, hooks
│   ├── agents/          # ts-spec-guardian, ts-quality-gate, ts-context-keeper
│   ├── commands/        # /ship
│   ├── skill-*.md       # methodology guides (legacy single-file skills)
│   └── skills/          # READ-ONLY — design-system agent skills
│       ├── osiris-design/      # /osiris-design — OSIRIS brand vocabulary
│       └── blueprint-design/   # /blueprint-design — Palantir Blueprint design system
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
