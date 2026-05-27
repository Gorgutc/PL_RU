# PL_RU Frontend Starter

Production-ready scaffold for Next.js 16, React 19, TypeScript strict, SCSS
modules, and Blueprint dashboard or data-heavy apps.

## What's Inside

- Next.js 16 App Router with React 19 and TypeScript 5 strict.
- SCSS modules plus a token system in `src/styles/_tokens.scss`.
- Blueprint v6 through `@blueprintjs/core` and `@blueprintjs/icons`.
- ESLint, Prettier, Stylelint, Vitest, Playwright, and `verify-frozen.ts`.
- Expanded quality tooling: HTMLHint, Markdownlint, CSpell, dependency-cruiser,
  Knip, JSCPD, axe, Pa11y, Lighthouse CI, and Lefthook.
- Codex-native guardrails in `AGENTS.md`, `docs/agent/`, `.codex/`, and
  `plugins/pl-ru-codex/`.
- `DO_NOT_PUSH.md` checklist for files that must never be committed.

## Prerequisites

- Node 22.18 or newer.
- pnpm 9 or newer.

```bash
pnpm install
pnpm exec playwright install chromium
```

## First Run

```bash
pnpm dev
```

Open <http://localhost:3000>.

Playwright browser binaries are downloaded separately from package install. If
Chromium is missing, `pnpm verify`, `pnpm test:e2e`, and browser quality checks
will fail until `pnpm exec playwright install chromium` succeeds.

## Common Commands

```bash
pnpm dev              # dev server
pnpm build            # production build
pnpm start            # serve production build
pnpm verify:static    # frozen static rules only
pnpm verify           # frozen rules plus runtime checks
pnpm quality:fast     # format, lint, typecheck, unit, static frozen, plugin verify
pnpm quality:deep     # fast gate plus audit/browser/a11y checks
pnpm quality:all      # full local gate including audit, Lighthouse, refs
pnpm codex:ship       # required before commit/push
pnpm hooks:install    # optional local Lefthook install
```

## Directory Map

```text
src/
  app/              Next.js App Router layout, pages, and global SCSS
  components/       one folder per component with colocated *.module.scss
  styles/           _tokens.scss, _mixins.scss, and Blueprint overrides
tests/
  unit/             Vitest
  e2e/              Playwright smoke tests
  quality/          axe/browser quality tests
docs/agent/         Codex bootstrap, orchestration, verification, ADR docs
.codex/             repo-local orchestration mirror and hook runbooks
.agents/            local plugin marketplace metadata
plugins/pl-ru-codex/ repo-local Codex skills
verify-frozen.ts    architecture regression
DO_NOT_PUSH.md      files and artifacts that must never be committed
```

## Codex Workflow

`AGENTS.md` is the canonical instruction entrypoint. The authority order is:

```text
verify-frozen.ts > current user request > AGENTS.md > plugins/pl-ru-codex/skills/** > design references
```

For substantial work, start with `$pl-ru-session-bootstrap`. For broad audits,
instruction changes, or tooling changes, use `$pl-ru-audit-orchestrator` and
the read-only roles documented in `docs/agent/orchestration.md`.

Use `codex/*` branches. Finished changes must pass `pnpm codex:ship`, then be
pushed to GitHub with a draft PR against `main` unless the user requests a
different flow.

`CLAUDE.md` is a legacy pointer only.

## Quality Layers

- `quality:fast` is the regular edit loop.
- `quality:deep` is for audits, refactors, instruction changes, and larger
  feature work.
- `quality:all` is the full gate before large PRs or releases.
- `codex:ship` wraps the full gate and remains mandatory before commit/push.

Browser-based checks can fail in restricted Windows sandboxes with Chromium
spawn errors. Rerun the same command outside the sandbox or with approved
escalation rather than weakening the check.

## Architecture Notes

- Do not add Tailwind, CSS-in-JS, styled-components, npm lockfiles, or yarn
  lockfiles.
- Dark mode is explicit via `<html className="bp6-dark">`.
- Use Blueprint primitives and package-root imports for production UI.
- Blueprint CSS imports in `src/app/layout.tsx` are the allowed stylesheet
  exception to the package-root import rule.
- Raw style values belong in `src/styles/_tokens.scss`; component SCSS consumes
  them through relative `@use` imports.
- Bundled images need alt text and should use `next/image` when appropriate.

## Reference Folders

These folders are read-only:

- `Blueprints_lib/`
- `Osiris_ref/`
- `plugins/pl-ru-codex/skills/blueprint-design/`
- `plugins/pl-ru-codex/skills/osiris-design/`

Run `pnpm refs:sync` only when you need to use reference folders. Run
`pnpm refs:verify` before claiming they are untouched.

## License

Set the license for your own project before release.
