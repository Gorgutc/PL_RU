# PL_RU Monitor Findings Handoff

Date: 2026-06-24
Branch: `codex/pl-ru-monitor-findings`
Scope: implementation of the weekday monitor findings for overflow controls,
visual-QA guard correctness, markdown/audit tooling, and bottom-panel SCSS
reuse.

## What Changed

- `MapLayerDropdown` is now a real Blueprint `Popover` + `Menu` overflow
  control instead of a decorative chevron button.
- Hidden map-layer icon items in the overflow menu keep local toggle state and
  expose `aria-pressed`, matching the visible `IconButton` contract.
- `TabTopControls` passes hidden map-layer icons plus layer switches into the
  overflow menu at compact widths.
- `MapBottomPanel` exposes only the filters hidden by the compact inline row in
  its overflow menu, avoiding duplicated uncontrolled switches.
- `scripts/check-visual-evidence.mjs` validates selected manifest artifact
  existence on the clean-diff path, so missing `referencePath`, `actualPath`, or
  `diffPath` can no longer produce a false clean PASS.
- `.markdownlint-cli2.jsonc` ignores `.claude/worktrees/**`, matching the
  existing generated-worktree exclusions used by other quality tools.
- The shared bottom-panel and legend SCSS was extracted into
  `src/styles/_bottom-panel.scss`, while `MapBottomPanel.module.scss` keeps the
  A17 token anchors that `verify-frozen.ts` intentionally checks.
- `next` and `eslint-config-next` were updated to `16.2.9`.
- `pnpm.overrides` temporarily pins `postcss@8.5.15` and `@babel/core@7.29.7`
  because the latest checked Next patch still resolves vulnerable transitive
  versions.
- `check:audit` now runs `pnpm audit --prod --audit-level low`.
- `docs/agent/quality-tooling.md` documents the override reason and the review
  window: revisit by 2026-07-24 or when the next Next.js patch is adopted,
  whichever happens first.

## Why

The monitor found that quality gates could report a clean state while important
contracts were not actually enforced:

- Compact map UI hid layer/filter controls behind chevrons that did not expose
  reachable controls.
- `check:visual` could skip a stale tracked manifest when no UI diff was
  detected, even if referenced actual/diff PNGs were missing.
- `check:markdown` scanned local `.claude/worktrees/**` output and timed out.
- `pnpm audit --prod --json` reported low/moderate production advisories that
  `check:audit --audit-level high` did not fail.
- Bottom-panel legend/panel SCSS was duplicated between map and tab panels.

The implementation makes those surfaces executable and reviewable instead of
leaving them as comments, stale artifacts, or non-blocking warnings.

## Verification State

Fresh checks run during this delivery:

- `pnpm.cmd quality:fast`: PASS. ESLint reports 4 existing
  `@next/next/no-img-element` warnings for approved SVG manifest usage.
- `pnpm.cmd verify`: PASS, `23/23 PASS, 0 FAIL`.
- `pnpm.cmd check:visual`: PASS. One run failed on a stale Next dev PID; a
  follow-up isolated run passed and regenerated ignored artifacts under
  `reports/visual-qa/`.
- `pnpm.cmd check:markdown`: PASS, `82 file(s)`, `0 error(s)`.
- `pnpm.cmd check:duplicates`: exit 0; `scss: 0 clones`. Remaining clones are
  the known AGENTS/CLAUDE parity and `tests/visual-qa/latest.json` similarity.
- `pnpm.cmd check:audit`: PASS with `--audit-level low`,
  `No known vulnerabilities found`.
- `pnpm.cmd test:e2e tests/e2e/top-controls.spec.ts --grep "moves extra map layer"`:
  PASS.
- `pnpm.cmd test:e2e tests/e2e/workspace-shell.spec.ts --grep "folds the bottom-panel filters"`:
  PASS.
- `pnpm.cmd test:e2e tests/e2e/top-controls.spec.ts tests/e2e/workspace-shell.spec.ts`:
  40/41 PASS under 8 workers; one existing viewport-width test timed out on
  `collapseToggle.click()`.
- `pnpm.cmd test:e2e tests/e2e/top-controls.spec.ts --grep "keeps the map toolbar fitting"`:
  PASS in isolation after the full-run timeout.
- `git diff --check`: clean.

Not completed before this handoff:

- A clean full two-file Playwright run under 8 workers is not available yet due
  to the isolated timeout above. Treat this as a known verification risk and
  rerun serially or under CI before merge if needed.
- `pnpm.cmd codex:ship` was attempted before commit/push. It reached
  `check:visual` and failed once on
  `workspace-shell-map-collapsed-1920x1080` with `mismatchRatio=0.415164 >
maxMismatchRatio=0.065`. An immediate isolated `pnpm.cmd check:visual` retry
  passed, including the same case at `mismatchRatio=0.000000`, so this is
  recorded as a visual-capture flake rather than a confirmed product
  regression.

## Subagent Review

- Frozen/instruction drift: PASS. `verify` stayed green and no
  AGENTS/CLAUDE/.codex/.claude/plugin/hook drift was introduced.
- Visual QA: PASS. The reviewer found no blocker in overflow behavior or
  artifact handling.
- Code/reuse/deadwood review initially FAILED on passive hidden map `MenuItem`s
  and duplicated map-bottom filter switches. Both findings were fixed:
  `OverflowIconMenuItem` now has state/`aria-pressed`, and `MapBottomPanel`
  passes only hidden filters.
- Dependency/tooling review initially FAILED on undocumented overrides and
  high-only audit policy. Both findings were fixed in `package.json` and
  `docs/agent/quality-tooling.md`.

## Frozen Decisions Preserved

- A13/A14/A15/A17 remain explicit and `verify-frozen.ts` passes.
- Visual artifacts stay under ignored `reports/visual-qa/`; tracked manifest
  remains `tests/visual-qa/latest.json`.
- No files forbidden by `DO_NOT_PUSH.md` are part of the tracked change set.
- The new SCSS partial reuses existing tokens and does not weaken the A17
  `MapBottomPanel` token anchors.

## Resume Notes

1. Start from `AGENTS.md`, this handoff,
   `docs/agent/frozen-decisions.md`, `docs/agent/quality-tooling.md`, and
   `verify-frozen.ts`.
2. Check `git status --short --branch`; ignored `reports/` and `test-results/`
   may exist from visual/e2e runs and must not be committed.
3. Re-run `pnpm.cmd check:visual` if visual artifacts are questioned.
4. Re-run the full two-file e2e command serially or in CI if the 8-worker
   viewport timeout needs final closure.
5. Revisit `pnpm.overrides` by 2026-07-24 or on the next Next.js patch; remove
   them once `pnpm audit --prod --audit-level low` is clean without overrides.
