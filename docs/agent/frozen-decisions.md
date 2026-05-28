# PL_RU Frozen Decisions

This file records decisions that future sessions must preserve unless the
current user request explicitly asks to change a specific item. `verify-frozen.ts`
mirrors the highest-risk checks so drift is caught by `pnpm verify`.

## Session Memory

- Codex Memories are enabled through `[features] memories = true`.
- The repo mirror is `.codex/config.toml`; the real user-level Codex config is
  `~/.codex/config.toml`.
- `AGENTS.md` is static policy. Memories are dynamic session summaries created
  by Codex after work is completed.
- Every completed task should end with a concise handoff summary covering
  changes, preserved decisions, checks, branch, commit, PR, and known follow-up.
- Generated memory files are external state and must not be committed.

## Agent Orchestration And Visual QA

- Always raise the applicable PL_RU subagents for implementation or review work
  when subagent tooling is available.
- UI/frontend changes require visual QA. Code changes require
  code-quality/readability/reusability/optimization review. Source or UI changes
  require component-reuse review. Source changes require duplicate/deadwood
  review. Frozen-contract, memory, docs, skills, or hook changes require frozen
  or instruction-drift review.
- Do not deliver while a required subagent is failing. Fix findings and recheck,
  or explicitly report the unavailable-subagent fallback.
- A subagent PASS is valid only after exact alignment with the current task
  brief, frozen contracts, and available reference screenshots. Any meaningful
  spec or screenshot mismatch is a delivery blocker.
- Visual QA for UI work must include pixel-level screenshot comparison against
  available reference PNGs, including Google Drive Figma exports, plus DOM/CSS
  metric assertions.
- Visual QA must report viewport sizes, diff tolerance, and mismatched areas.
  If a reference PNG is inaccessible, delivery stays blocked unless the current
  user request explicitly accepts a metric-only fallback.
- The mandatory read-only role roster stays documented in `.codex/agents/`:
  `code_deadwood_auditor`, `code_quality_guardian`,
  `component_reuse_guardian`, `runtime_behavior_mapper`,
  `tech_stack_cartographer`, `instruction_drift_auditor`,
  `quality_tooling_architect`, `codex_infra_architect`,
  `frozen_decisions_guardian`, and `visual_qa_guardian`.

## Header Responsive Tabs

- Header height stays `48px`.
- Header horizontal padding stays `8px`.
- Header brand/actions side zones stay `330px`.
- At `1280px` and `1440px`, tabs are compact: six `80px` tab buttons with
  icons visible and text hidden visually.
- At `1920px`, `2560px`, and `3860px`, tab text is visible. The first two tabs
  are `154px`; the remaining four are `153px`.
- Active tab uses `#2970ff`; hover tab uses `#528bff`.
- Base tabs have transparent background and no persistent outline, border, or
  shadow. Keyboard `:focus-visible` remains.
- Header public API stays `activeTab`, `onTabChange`, optional `tabs`, and
  optional `className`.
- Compact tabs keep accessible names through `aria-label`.

## Header Action Buttons

- `Данные`, `База данных`, `Аккаунт`, and `Уведомления` keep the current
  Blueprint outlined-button visual contract from the Header iterations.
- Their height stays `30px`, radius stays `3px`, text size stays `14px`, rest
  text stays `#d3d3d3`, hover uses `#84adff`, and open/active dropdown actions
  use `#2970ff` with white foreground.
- Action button icons stay white in rest, hover, disabled, and open states.
- `Данные` and `База данных` keep their current non-functional/disabled
  behavior until a dedicated task adds their click behavior; this iteration only
  prepares the shared visual state contract for them.
- `Аккаунт` opens a Blueprint Popover/Menu profile dropdown with
  `Изменить профиль` and `Выйти из аккаунта`. The profile menu keeps `16px`
  vertical padding, `8px` horizontal padding, `8px` item gap, `1px` border,
  `2px` radius, white item icons, and menu items with rest/hover states but no
  selected/active item state.
- `Уведомления` opens a Blueprint Popover notification panel with default
  `All` filtering, `AI Info` and dynamic unread filtering, `Mark all as read`,
  `Last 7 days` and `Older` sections, and static placeholder data until a real
  notification source is added.
- Header action dropdown panels use `#171d20` surface, `#727677` border,
  `2px` radius, sit `4px` below their trigger buttons, and stay anchored to
  those triggers.
- Disabled opacity stays visually stable.
- These buttons are candidates for reuse outside Header. If another screen needs
  the same visual language, extract or reuse the current contract instead of
  duplicating a similar component with drift-prone styles.

## Quality Tooling

- `pnpm check:duplicates` must run `jscpd --config .jscpd.json --noTips .` so
  local Windows runs and Linux CI scan the same target set.
- Shared Playwright config lives in `playwright.shared.config.ts`; e2e and
  quality configs should extend it instead of duplicating the full config body.
- Reference manifest hashing lives in `scripts/lib/reference-manifest.mjs`;
  `scripts/sync-refs.mjs` and `scripts/verify-reference.js` should share it.
- Pa11y uses the Playwright Chromium executable from `playwright` so local runs
  and Linux CI use the same installed browser family.
- `pnpm check:visual` stays in the deep quality gate. It must require visual QA
  evidence for UI-surface changes detected in the base diff, unstaged worktree
  diff, staged diff, or untracked files.
- `pnpm check:visual` must validate reference sources, viewports, states,
  pixel-comparison PASS, tolerance, mismatched areas, and DOM/CSS metric PASS
  before delivery. The gate cannot accept only a self-reported manifest:
  `pixelComparison.cases` must list local `referencePath`, `actualPath`, and
  `diffPath` PNG artifacts, and the script must perform a real pixel comparison
  before reporting PASS.
- `pnpm check:visual` fails closed when the base ref is unavailable unless
  `VISUAL_QA_ALLOW_MISSING_BASE=1` is explicitly set for a known local fallback.
  Diff PNG output must stay in ignored visual-artifact directories such as
  `reports/visual-qa/` or `test-results/visual-qa/`, and must never overwrite a
  tracked source, config, or Git file.
