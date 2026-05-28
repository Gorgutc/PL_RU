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
- `Данные` and `База данных` keep their current non-functional/disabled
  behavior until a dedicated task adds their click behavior; this iteration only
  prepares the shared visual state contract for them.
- `Аккаунт` opens a Blueprint Popover/Menu profile dropdown with
  `Изменить профиль` and `Выйти из аккаунта`. Profile menu items have rest and
  hover states, but no selected/active item state.
- `Уведомления` opens a Blueprint Popover notification panel with default
  `All` filtering, `AI Info` and dynamic unread filtering, `Mark all as read`,
  `Last 7 days` and `Older` sections, and static placeholder data until a real
  notification source is added.
- Header action dropdown panels use `#171d20` surface, `#727677` border,
  `2px` radius, and stay anchored to their trigger buttons.
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
