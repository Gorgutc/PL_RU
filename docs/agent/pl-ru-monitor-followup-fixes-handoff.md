# PL_RU Monitor Follow-Up Fixes Handoff

Date: 2026-06-25
Branch: `codex/pl-ru-monitor-followup-fixes`
Base: `main` at `3f87957` (`Merge pull request #29 from Gorgutc/codex/pl-ru-monitor-findings`)
Initial implementation commit: `916138f` (`Fix monitor follow-up gates`)
Draft PR: https://github.com/Gorgutc/PL_RU/pull/30
PR labels: `codex`, `codex-automation`
Scope: follow-up implementation for the weekday monitor findings reported after
PR #29 merged.

## What Changed

- Stabilized the `workspace-shell.spec.ts` side-panel alignment checks by
  polling the actual DOM/CSS metric contract until the tab transition settles,
  instead of reading transient widths mid-animation.
- Applied the same condition-based fit check to the launch date-time text
  measurement, preserving the existing "text must fit" contract without
  weakening the assertion.
- Gave the longest responsive `top-controls.spec.ts` frozen viewport check an
  explicit `60_000` ms timeout, because the full parallel browser suite was
  spending about 28-30 seconds in that single test on Windows while the
  isolated case stayed green.
- Moved the production dependency audit gate into `quality:deep` so the command
  layer matches the documented quality-tooling contract.
- Removed the duplicate audit invocation from `quality:all`; it now inherits
  audit coverage through `quality:deep` and adds refs plus Lighthouse.
- Updated `docs/agent/quality-tooling.md` and both
  `pl-ru-quality-tooling/SKILL.md` mirrors to describe the command layering
  exactly.
- Hardened `verify-frozen.ts` A11 so drift in `check:audit --audit-level low`,
  `quality:deep` audit coverage, duplicate audit wiring, or the temporary
  `pnpm.overrides` review note is caught by `pnpm verify`.

## Why

The monitor found two follow-up blockers after PR #29 reached `main`:

- The targeted serial e2e run
  `pnpm.cmd test:e2e tests/e2e/top-controls.spec.ts tests/e2e/workspace-shell.spec.ts --workers=1`
  failed on the side-panel right-edge alignment check. DOM diagnostics showed
  the layout contract was correct after the existing tab transition, but the
  helper sampled during motion.
- `docs/agent/quality-tooling.md` and the `pl-ru-quality-tooling` skill mirrors
  said `quality:deep` included audit checks while `package.json` only ran
  `check:audit` in `quality:all`.

## Verification State

Fresh checks run for this handoff:

- `pnpm.cmd test:e2e tests/e2e/workspace-shell.spec.ts --grep "aligns side-panel controls" --workers=1`:
  PASS, `1 passed`.
- `pnpm.cmd test:e2e tests/e2e/workspace-shell.spec.ts --grep "fits the launch date-time" --workers=1`:
  PASS, `1 passed`.
- `pnpm.cmd test:e2e tests/e2e/top-controls.spec.ts tests/e2e/workspace-shell.spec.ts --workers=1`:
  PASS, `41 passed`.
- `pnpm.cmd verify:static`: PASS, `17/17 PASS, 0 FAIL`.
- `pnpm.cmd quality:fast`: PASS after formatting the touched files. Existing
  non-blocking `@next/next/no-img-element` warnings remain on the approved
  image/SVG surfaces.
- `pnpm.cmd check:visual`: PASS; refreshed ignored artifacts under
  `reports/visual-qa/`.
- `pnpm.cmd verify`: PASS, `23/23 PASS, 0 FAIL`.
- `pnpm.cmd codex:ship`: PASS. The full gate included `quality:all`,
  production `pnpm check:audit` with `No known vulnerabilities found`,
  `check:visual`, full Playwright `test:browser` with `55 passed`, axe plus
  pa11y accessibility checks, `verify` with `23/23 PASS, 0 FAIL`,
  `check:lighthouse`, and `refs:verify` with `8/8 PASS, 0 FAIL`.

## Subagent / Local Review Roles

Required roles for this follow-up:

- Frozen / instruction drift: PASS. A11 and Claude/Codex mirror parity are
  consistent after the quality-tooling changes.
- Code quality / reuse / deadwood: PASS. The e2e helper changes use bounded
  condition-based waits and do not introduce duplicate production code.
- Visual QA: PASS. Production UI is unchanged, `pnpm.cmd check:visual` passed,
  and no reference refresh was required.

## Frozen Decisions Preserved

- A11 now explicitly guards the production audit policy and temporary override
  documentation.
- A13 still owns side-panel alignment as a runtime contract; the e2e helper now
  waits for that contract after the frozen transition.
- A16 parity remains binding for the Codex and Claude quality-tooling skill
  mirrors.
- Visual artifacts remain under ignored `reports/visual-qa/`; tracked evidence
  remains `tests/visual-qa/latest.json`.

## Resume Notes

1. Start from `AGENTS.md`, this handoff,
   `docs/agent/pl-ru-monitor-findings-handoff.md`,
   `docs/agent/quality-tooling.md`, and `verify-frozen.ts`.
2. Confirm `git status --short --branch`; do not commit ignored `reports/` or
   `test-results/` artifacts from Playwright runs.
3. Before merge, preserve a clean `pnpm.cmd codex:ship` result or record any
   bounded external flake explicitly in the PR body.
