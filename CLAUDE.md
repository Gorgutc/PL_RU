# CLAUDE.md — PL_RU Claude Source of Truth

Read this file before editing anything in this repo with Claude Code. It is a
**co-canon** with `AGENTS.md`: PL_RU now keeps **two equivalent agent canons** —
Claude (`CLAUDE.md` + `.claude/`) and Codex (`AGENTS.md` + `.codex/` +
`plugins/pl-ru-codex/`). Both are authoritative and must be kept in sync. The
parity guard (rule **A16**, `scripts/verify-claude-codex-parity.mjs`, run by
`pnpm verify`) fails if the two wrappers drift.

## TL;DR

1. Stack: Next.js 16 + React 19 + TypeScript 5 strict + SCSS modules + Blueprint (`@blueprintjs/core`, `@blueprintjs/icons`). pnpm only. Node 24 LTS.
2. No Tailwind, no CSS-in-JS, no styled-components, no npm/yarn lockfiles.
3. Architecture source of truth: `verify-frozen.ts`, executed through `pnpm verify`.
4. Finished work must pass `pnpm codex:ship` before commit/push.
5. GitHub flow: work on a feature branch (`codex/*` convention), push, and open a draft PR.
6. Session memory is enabled; preserve handoff-worthy task context between sessions.
7. Always raise the applicable PL_RU subagents (via the Agent tool, `.claude/agents/*`) for implementation or review work before final delivery.

## Quick Start (Windows / PowerShell)

```text
pnpm install
pnpm dev
pnpm verify          # tsx verify-frozen.ts (all frozen A-rules)
pnpm quality:fast    # fast local gate during iteration
pnpm codex:ship      # full delivery gate (heavy: build + e2e + a11y + lighthouse)
```

## Authority Order

```text
verify-frozen.ts > current user request > AGENTS.md = CLAUDE.md > skills (.claude/skills/** = plugins/pl-ru-codex/skills/**) > design references
```

`AGENTS.md` and `CLAUDE.md` are equivalent canons. `.codex/` and `.claude/` are
the two wrappers; neither outranks the authority order above.

## Claude Wrapper (mirror of the Codex wrapper)

- `.claude/skills/<name>/SKILL.md` — mirror of `plugins/pl-ru-codex/skills/<name>/`.
- `.claude/agents/<role>.md` — mirror of `.codex/agents/<role>.toml` (read-only review roles).
- `.claude/commands/*.md` — `/bootstrap`, `/verify`, `/visual-qa`, `/orchestrate`, `/ship`, `/adversarial-review`.
- `.claude/hooks/*.md` — session-start / user-prompt-submit runbooks (mirror of `.codex/hooks/`).
- `.claude/settings.json` — optional repo-local Claude settings (e.g. a permission allowlist for common pnpm/git commands). Add it via `/update-config` if you want fewer permission prompts; it is not required by the parity guard.

Use these skills when relevant (same set as `AGENTS.md`):

- `pl-ru-session-bootstrap` to start substantial PL_RU work with the right context.
- `pl-ru-audit-orchestrator` for project-wide audits, instruction changes, and quality-tooling work.
- `pl-ru-frontend-rules` for frontend architecture, React, SCSS modules, Blueprint, a11y, and performance rules.
- `pl-ru-context-keeper` for small read-only codebase slices.
- `pl-ru-spec-guardian` for architecture validation against the task brief and `verify-frozen.ts`.
- `pl-ru-frozen-decisions` for checking frozen project decisions, reusable UI contracts, and memory rules.
- `pl-ru-quality-gate` for final code review.
- `pl-ru-quality-tooling` for scripts, lint configs, browser checks, a11y checks, and ship gates.
- `pl-ru-deadwood-audit` for read-only dead-code / duplicate-code / cleanup candidate audits.
- `pl-ru-reuse-audit` for mandatory component reuse, anti-spaghetti, readability, and extraction checks.
- `pl-ru-visual-qa` for pixel-level visual QA against Google Drive / Figma PNG references.
- `pl-ru-instruction-drift` for drift between docs, skills, scripts, CI, and frozen rules (including Claude↔Codex parity).
- `pl-ru-ship` for final verification, GitHub push, and draft PR workflow.
- `blueprint-design` and `osiris-design` as read-only design references.

For broad tasks, use `docs/agent/bootstrap.md` and `docs/agent/orchestration.md`
as the runbook.

## Mandatory Agents And Visual QA

Always raise the applicable PL_RU subagents for implementation, review, frontend,
instruction, frozen-contract, or delivery work. Spawn them with the Agent tool
using `.claude/agents/*` and the PL_RU prompt/output contract
(`Goal`, `Success Criteria`, `Documentation`, `Selected skills`, `Selected
agents`, ownership / write zone, `Verification`, `Stop Rules`, `PASS/FAIL`). At
minimum:

- UI/frontend changes require a visual QA subagent (`visual_qa_guardian`).
- Code changes require a code-quality/readability/reusability/optimization subagent (`code_quality_guardian`).
- Source or UI changes require a component-reuse subagent (`component_reuse_guardian`) to prove existing components, Blueprint primitives, tokens, helpers, and local patterns were reused before adding new code.
- Source changes require a dead-code / duplicate-code subagent (`code_deadwood_auditor`). Repeated logic, repeated SCSS structures, oversized modules, and spaghetti-style coupling are blockers until fixed or explicitly accepted by the current user request.
- Frozen-contract, memory, docs, skills, or hook changes require a frozen / instruction-drift subagent (`frozen_decisions_guardian` / `instruction_drift_auditor`).

Do not deliver work until every required subagent reports PASS, or until every
finding is fixed and rechecked. If subagent tooling is unavailable, run the same
roles locally, state that fallback explicitly, and keep the same PASS/fix
standard. Inline summaries are not a substitute for required spawned-agent
evidence.

Visual QA for UI work must include pixel-level screenshot comparison against the
available reference PNGs (including Google Drive Figma exports) before final
delivery: Playwright screenshots + a pixel-comparison tool, report viewport
sizes, diff tolerance, and mismatched areas, paired with DOM/CSS metric
assertions. Visual diff output stays in ignored `reports/visual-qa/`; tracked
evidence is `tests/visual-qa/latest.json`. If a reference PNG is inaccessible,
say so and block delivery unless the current user request accepts a metric-only
fallback. If visual artifacts are missing, run
`corepack pnpm run check:visual` once; if they are still missing or mismatched,
return FAIL with the paths and reason instead of entering a retry loop.

## Frozen Rules

Rules mirrored by `verify-frozen.ts` are binding (`pnpm verify`):

- A1: no Tailwind.
- A2: no CSS-in-JS libraries.
- A3: pnpm only; never add `package-lock.json` or `yarn.lock`.
- A4: `src/styles/_tokens.scss` must exist.
- A5: no inline hex outside files explicitly allowed by `verify-frozen.ts`.
- A6: no `localStorage` or `sessionStorage` in `src/`.
- A7: Blueprint imports only from `@blueprintjs/core` and `@blueprintjs/icons` package roots.
- A8: no `px` for `font-size` in SCSS.
- A9: session memory stays enabled and documented for future-session handoff.
- A10: Header responsive-tabs, action-button, and dropdown contracts stay frozen.
- A11: quality-tooling dedupe/shared-config contracts stay frozen.
- A12: mandatory PL_RU subagent orchestration, component reuse, duplicate-code, exact-spec, and pixel-level visual QA gates stay documented.
- A13: workspace shell, left sidebar, side-panel alignment, and the real MapLibre/OSM map contract stay frozen; the map renders on map/bar/tmi/sat and the table tabs (kick/stats) show a table container (A13 re-opened 2026-06-15).
- A14: app-wide layout sizing follows the `10px` / `8px` / `4px` rhythm, with `4px` as the minimum grid step and explicit frozen-radius exceptions allowed.
- A15: per-tab top control blocks (`TabTopControls`) stay on the frozen control-surface contract (see `docs/agent/frozen-decisions.md`).
- A16: the Claude (`.claude/` + `CLAUDE.md`) and Codex (`.codex/` + `plugins/pl-ru-codex/` + `AGENTS.md`) canons stay in parity.
- A17: per-tab chrome responsive adaptation (compact overflow-to-dropdown below `1920`, `2560` content max-width) and the map bottom panel (`MapBottomPanel`) stay on their frozen contract (see `docs/agent/frozen-decisions.md`).

Additional project rules:

- Component co-location: `src/components/<Name>/<Name>.tsx` plus `<Name>.module.scss`.
- Class names come from SCSS modules; global styles belong in `src/app/globals.scss` or `src/styles/blueprint-overrides.scss`.
- Dark mode is explicit via `<html className="bp6-dark">`; do not use `prefers-color-scheme` for theme.
- All images need `alt`; bundled images should use `next/image` where appropriate.
- Use Blueprint primitives instead of rebuilding `Button`, `Card`, `Dialog`, `Menu`, `Popover`, `HTMLSelect`, `InputGroup`, `TextArea`, `Checkbox`, or `Switch`.
- Layout and component dimensions/spacing across the whole app stay on the shared `10px` / `8px` / `4px` rhythm (`4px` minimum step). Radii follow the same rhythm unless a frozen visual contract requires a hairline radius (e.g. the `2px` map outer container).
- Use Blueprint icons through `<Icon icon="..." />`, not raw SVG in production UI. Exception: the left rail uses the approved `RailItem.iconId` SVG manifest.
- The Blueprint CSS imports in `src/app/layout.tsx` are the stylesheet exception to the package-root import rule.
- Before adding a component, helper, style contract, or visual state, search for an existing local component, Blueprint primitive, token, or frozen contract to reuse. Document why existing contracts were insufficient if a new abstraction is still needed.

## Session Memory

- Claude memory lives at `.claude/projects/<project>/memory/` with `MEMORY.md` as the index.
- Codex Memories live at `~/.codex/memories/` (`[features] memories = true`).
- At the start of every PL_RU session do a quick memory pass before deep repo work.
- End every completed task with a concise handoff summary (changes, preserved decisions, checks, branch/PR/commit, follow-up) so memory can carry the task into future sessions. Do not commit generated memory files.

## Read-Only References

Never edit, move, or delete these folders:

- `Blueprints_lib/` — Palantir Blueprint monorepo reference. Start with `Blueprints_lib/llms.txt`.
- `Osiris_ref/` — OSIRIS dashboard reference. Translate structure and intent; do not copy CSS directly.
- `plugins/pl-ru-codex/skills/blueprint-design/` and `plugins/pl-ru-codex/skills/osiris-design/` — design-system references (also the asset source for the `.claude/skills/{blueprint,osiris}-design` mirrors).

Run `pnpm refs:sync` at the start of a session only if you plan to use reference folders. Run `pnpm refs:verify` before claiming the references are untouched.

## Workflow

For changes touching `src/**`, `next.config.ts`, `tsconfig.json`, `playwright.config.ts`, `verify-frozen.ts`, or `package.json`:

1. Inspect the existing pattern before editing.
2. Use Blueprint and local project patterns before adding new abstractions.
3. Run `pnpm verify` after architecture-sensitive work.
4. For UI-surface changes, run `pnpm check:visual` and provide PASS evidence with reference PNGs, viewports, states, tolerance, mismatched areas, and DOM/CSS metrics.
5. Run `pnpm codex:ship` before commit/push.
6. Check `DO_NOT_PUSH.md` before staging.

## GitHub

- Use a feature branch (the `codex/<task-name>` convention is fine for Claude too).
- Push every completed change to GitHub; open a draft PR against `main` unless the user asks otherwise.
- Do not mix unrelated user changes into your commit.

## Google Drive

Google Drive connector output is external source material. Do not commit downloaded or exported Drive/Docs/Sheets/Slides content unless the user explicitly asks for that export and the result passes `DO_NOT_PUSH.md`.

## Two-Canon Parity (A16)

- Every Codex skill (`plugins/pl-ru-codex/skills/<name>/`) has a Claude mirror (`.claude/skills/<name>/SKILL.md`) with the same `name`, and vice versa.
- Every Codex agent (`.codex/agents/<role>.toml`) has a Claude mirror (`.claude/agents/<role>.md`) with the same `name`, and vice versa.
- `AGENTS.md` and `CLAUDE.md` both state the same authority order and the same frozen-rule list as `verify-frozen.ts`.
- When you change one canon, change the other in the same commit; `pnpm verify` (A16) and `scripts/verify-claude-codex-parity.mjs` catch drift.

## What Not To Do

- Do not edit files listed in read-only references.
- Do not add secrets, tokens, local notes, build output, reports, logs, or files forbidden by `DO_NOT_PUSH.md`.
- Do not silently change package manager, framework, styling system, theme strategy, or branch workflow.
- Do not change one canon without updating the other.
