# AGENTS.md — PL_RU Codex Source of Truth

Read this file before editing anything in this repo. It is the canonical instruction file for Codex and other non-Claude coding agents.

## TL;DR

1. Stack: Next.js 16 + React 19 + TypeScript 5 strict + SCSS modules + Blueprint (`@blueprintjs/core`, `@blueprintjs/icons`). pnpm only. Node 24 LTS.
2. No Tailwind, no CSS-in-JS, no styled-components, no npm/yarn lockfiles.
3. Architecture source of truth: `verify-frozen.ts`, executed through `pnpm verify`.
4. Finished work must pass `pnpm codex:ship` before commit/push.
5. GitHub flow: work on `codex/*` branches, push to GitHub, and open a draft PR.
6. Codex Memories are enabled for this repo; preserve handoff-worthy task context between sessions.
7. Always raise the applicable PL_RU subagents for implementation or review work before final delivery.

## Quick Start

```bash
pnpm install
pnpm dev
pnpm verify
pnpm codex:ship
```

## Authority Order

```text
verify-frozen.ts > current user request > AGENTS.md = CLAUDE.md > skills (plugins/pl-ru-codex/skills/** = .claude/skills/**) > design references
```

`AGENTS.md` and `CLAUDE.md` are equivalent canons; `.codex/` and `.claude/` are
the two wrappers. Keep both in sync — the parity guard (rule A16,
`scripts/verify-claude-codex-parity.mjs`, via `pnpm verify`) fails on drift.

## Codex Plugin

Repo-local Codex skills live in `plugins/pl-ru-codex/skills/` and are listed through `.agents/plugins/marketplace.json`.

Use these skills when relevant:

- `$pl-ru-session-bootstrap` for starting substantial PL_RU work with the right context.
- `$pl-ru-audit-orchestrator` for project-wide audits, instruction changes, and quality-tooling work.
- `$pl-ru-frontend-rules` for frontend architecture, React, SCSS modules, Blueprint, a11y, and performance rules.
- `$pl-ru-context-keeper` for small read-only codebase slices.
- `$pl-ru-spec-guardian` for architecture validation.
- `$pl-ru-frozen-decisions` for checking frozen project decisions, reusable UI contracts, and session-memory rules.
- `$pl-ru-quality-gate` for final code review.
- `$pl-ru-quality-tooling` for scripts, lint configs, browser checks, a11y checks, and ship gates.
- `$pl-ru-deadwood-audit` for read-only dead-code, duplicate-code, and cleanup candidate audits.
- `$pl-ru-reuse-audit` for mandatory component reuse, anti-spaghetti, readability, and extraction checks.
- `$pl-ru-visual-qa` for pixel-level visual QA against Google Drive / Figma PNG references.
- `$pl-ru-instruction-drift` for checking drift between docs, skills, scripts, CI, and frozen rules.
- `$pl-ru-ship` for final verification, GitHub push, and draft PR workflow.
- `$blueprint-design` and `$osiris-design` as read-only design references.

For broad tasks, use `docs/agent/bootstrap.md` and `docs/agent/orchestration.md` as the runbook. `.codex/` mirrors this orchestration for tools that read repo-local Codex config, but it does not outrank the authority order above.

## Mandatory Agents And Visual QA

Always raise the applicable PL_RU subagents for implementation, review,
frontend, instruction, frozen-contract, or delivery work when subagent tooling is
available. At minimum:

- UI/frontend changes require a visual QA subagent.
- Code changes require a code-quality/readability/reusability/optimization
  subagent.
- Source or UI changes require a component-reuse subagent to prove existing
  components, Blueprint primitives, tokens, helpers, and local patterns were
  reused before adding new code.
- Source changes require a dead-code / duplicate-code subagent. Repeated logic,
  repeated SCSS structures, oversized modules, and spaghetti-style coupling are
  blockers until fixed or explicitly accepted by the current user request.
- Frozen-contract, memory, docs, skills, or hook changes require a
  frozen/instruction-drift subagent.

Do not deliver work until every required subagent reports PASS, or until every
finding is fixed and rechecked. If subagent tooling is unavailable, run the same
roles locally, state that fallback explicitly, and keep the same PASS/fix
standard.

Agents must check exact alignment with the current user request, any attached
task document, and any available reference screenshots. A PASS is valid only
when the code, tests, documentation, and rendered UI match that evidence. Any
meaningful mismatch with the task brief, frozen contract, or reference PNG is a
delivery blocker.

Visual QA for UI work must include pixel-level screenshot comparison against
the available reference PNGs, including Google Drive Figma exports, before final
delivery. Use Playwright screenshots and a pixel-level comparison tool or
equivalent script, report viewport sizes, diff tolerance, and mismatched areas,
and pair the image diff with DOM/CSS metric assertions for spacing, sizes,
colors, and responsive behavior. Do not rely on eyeballing alone. If a reference
PNG is inaccessible, say so explicitly and block delivery unless the current
user request accepts a metric-only fallback. Visual diff output must stay in
ignored `reports/visual-qa/`; do not point it at `test-results/visual-qa/`,
source, config, docs, `.git/`, or tracked files. If visual artifacts are missing,
run `pnpm.cmd check:visual` once; if they are still missing or mismatched,
return FAIL with the paths and reason instead of entering a retry loop.

## Frozen Rules

Rules mirrored by `verify-frozen.ts` are binding:

- A1: no Tailwind.
- A2: no CSS-in-JS libraries.
- A3: pnpm only; never add `package-lock.json` or `yarn.lock`.
- A4: `src/styles/_tokens.scss` must exist.
- A5: no inline hex outside files explicitly allowed by `verify-frozen.ts`.
- A6: no `localStorage` or `sessionStorage` in `src/`.
- A7: Blueprint imports only from `@blueprintjs/core` and `@blueprintjs/icons` package roots.
- A8: no `px` for `font-size` in SCSS.
- A9: Codex Memories stay enabled and documented for future-session handoff.
- A10: Header responsive-tabs, action-button, and dropdown contracts stay frozen.
- A11: quality-tooling dedupe/shared-config contracts stay frozen.
- A12: mandatory PL_RU subagent orchestration, component reuse, duplicate-code,
  exact-spec, and pixel-level visual QA gates stay documented.
- A13: workspace shell, left sidebar, side-panel alignment, and real
  MapLibre/OSM map contract stay frozen.
- A14: app-wide layout sizing follows the `10px` / `8px` / `4px` rhythm, with
  `4px` as the minimum grid step and explicit frozen-radius exceptions allowed.
- A15: per-tab top control blocks (`TabTopControls`) stay on the frozen
  control-surface contract (reserved for the top-control-blocks task; see
  `docs/agent/frozen-decisions.md`).
- A16: the Claude (`.claude/` + `CLAUDE.md`) and Codex (`.codex/` +
  `plugins/pl-ru-codex/` + `AGENTS.md`) canons stay in parity
  (`scripts/verify-claude-codex-parity.mjs`).
- A17: per-tab chrome responsive adaptation (compact overflow-to-dropdown below
  `1920`, `2560` content max-width) and the per-tab bottom panels
  (`TabBottomPanel`) stay on their frozen contract (see
  `docs/agent/frozen-decisions.md`).

Additional project rules:

- Component co-location: `src/components/<Name>/<Name>.tsx` plus `<Name>.module.scss`.
- Class names come from SCSS modules; global styles belong in `src/app/globals.scss` or `src/styles/blueprint-overrides.scss`.
- Dark mode is explicit via `<html className="bp6-dark">`; do not use `prefers-color-scheme` for theme.
- All images need `alt`; bundled images should use `next/image` where appropriate.
- Use Blueprint primitives instead of rebuilding `Button`, `Card`, `Dialog`, `Menu`, or `Popover`.
- Layout and component dimensions / spacing across the whole app should stay on
  the shared `10px` / `8px` / `4px` sizing rhythm. Use `4px` as the minimum grid
  step, and prefer `8px` / `10px` multiples for larger component and shell
  measurements when they fit the visual contract. Radii follow the same rhythm
  unless a frozen visual contract explicitly requires a smaller hairline radius,
  such as the current `2px` map outer container.
- Use Blueprint icons through `<Icon icon="..." />`, not raw SVG in production UI.
  Exception: the left rail uses the approved `RailItem.iconId` SVG manifest for
  the custom Drive icon replacement task; keep that exception scoped to
  `LeftRail`.
- The Blueprint CSS imports in `src/app/layout.tsx` are the stylesheet exception to the package-root import rule.
- Before adding a component, helper, style contract, or visual state, search for
  an existing local component, Blueprint primitive, token, or frozen contract to
  reuse. If a new abstraction is still needed, document why the existing
  contracts were insufficient in the handoff or PR body.

## Session Memory

Codex Memories are enabled in the repo mirror via:

```toml
[features]
memories = true
```

The user-level Codex config at `~/.codex/config.toml` should also keep the same
feature flag enabled so Codex can summarize prior sessions into
`~/.codex/memories/` and load them as future context.

Use `AGENTS.md` and Memories together:

- `AGENTS.md` is the static constitution: code style, architecture rules, test
  commands, workflow, and frozen decisions.
- Memories are the dynamic working notes Codex generates automatically from
  completed sessions: project facts, decisions, patterns, and handoff context.
- At the start of every PL_RU session, do a quick Memories pass before deep
  repo work: use the provided memory summary, search `~/.codex/memories/MEMORY.md`
  for PL_RU/task keywords, then open only the 1-2 directly relevant rollout
  summaries or skill notes.
- If the user explicitly asks to update Memories, write one small note under
  `~/.codex/memories/extensions/ad_hoc/notes/`. Never edit generated memory
  files directly, and never commit user-level memory files to this repo.

At the end of every completed task, include a concise final summary of what was
changed, what decisions were made or preserved, what checks passed, and what
branch/PR/commit state matters. This makes the session easy for Memories to
capture and carry into the next session. Do not commit generated memory files.

## Frozen Decisions

Frozen decisions live in `docs/agent/frozen-decisions.md` and are mirrored by
checks in `verify-frozen.ts`. Future iterations must preserve those decisions
unless the current user request explicitly asks to change a specific frozen
decision. Add new functionality by extending or reusing the current contract;
do not silently rewrite existing behavior.

When an approved task creates or changes a durable contract, update
`docs/agent/frozen-decisions.md` and the minimal matching guard in
`verify-frozen.ts` in the same change. Keep the guard focused on behavior and
public contracts, not placeholder implementation names that should remain easy
to replace later.

Header decisions from the responsive-tabs and dropdown iterations are frozen. In
particular, the Header layout, tab states, responsive tab widths, Figma colors,
lack of base-tab outlines, action-button state contract, and account /
notification dropdown contract are not to be changed unless explicitly
requested. If the Header action buttons need to appear elsewhere, extract or
reuse the same visual contract instead of creating a near-duplicate component.

## Read-Only References

Never edit, move, or delete these folders:

- `Blueprints_lib/` — Palantir Blueprint monorepo reference. Start with `Blueprints_lib/llms.txt`.
- `Osiris_ref/` — OSIRIS dashboard reference. Translate structure and intent; do not copy CSS directly.
- `plugins/pl-ru-codex/skills/blueprint-design/` — Blueprint design-system reference.
- `plugins/pl-ru-codex/skills/osiris-design/` — OSIRIS design-system reference.

Run `pnpm refs:sync` at the start of a Codex session if you plan to use reference folders. Run `pnpm refs:verify` before claiming the references are untouched.

## Workflow

For changes touching `src/**`, `next.config.ts`, `tsconfig.json`, `playwright.config.ts`, `verify-frozen.ts`, or `package.json`:

1. Inspect the existing pattern before editing.
2. Use Blueprint and local project patterns before adding new abstractions.
3. Run `pnpm verify` after architecture-sensitive work.
4. For UI-surface changes, run `pnpm check:visual` and provide PASS evidence
   with reference PNGs, viewports, states, tolerance, mismatched areas, and
   DOM/CSS metrics.
5. Run `pnpm codex:ship` before commit/push.
6. Check `DO_NOT_PUSH.md` before staging.

## GitHub

- Use a branch named `codex/<task-name>`.
- Push every completed change to GitHub.
- Open a draft PR against `main` unless the user explicitly asks for another base or a ready PR.
- Do not mix unrelated user changes into your commit.

## Google Drive

Google Drive connector output is external source material. Do not commit downloaded or exported Drive/Docs/Sheets/Slides content unless the user explicitly asks for that export and the result passes `DO_NOT_PUSH.md`.

## What Not To Do

- Do not edit files listed in read-only references.
- Do not add secrets, tokens, local notes, build output, reports, logs, or files forbidden by `DO_NOT_PUSH.md`.
- Do not silently change package manager, framework, styling system, theme strategy, or branch workflow.
