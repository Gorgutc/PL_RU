# Left Sidebar Expanded SVG Icons Handoff

Date: 2026-06-04

Branch: `codex/left-sidebar-expanded-svg-icons`

Status: WIP pushed for continuation. Do not treat this as final delivery until
the next session reruns the final ship gate and resolves any remaining findings.

## User Request

Implement the approved plan for the left sidebar:

- left rail starts collapsed for `map`, `bar`, and `tmi`;
- bottom collapse button toggles expanded / collapsed state;
- expanded widths match references: `map` 195px, `bar` 207px, `tmi` 170px;
- Drive SVG icons from `Иконки` replace Blueprint glyph icons only in the left
  rail;
- hover / active / keyboard focus states remain equivalent to the previous
  compact rail behavior;
- Header, top tabs, and panel tabs `sat`, `kick`, `stats` stay unchanged.

## Done

- Created branch `codex/left-sidebar-expanded-svg-icons`.
- Added all 18 Drive SVG assets under `public/left-rail-icons/`.
- Added typed SVG manifest in
  `src/components/AppNavigation/railIcons.ts`.
- Reworked `src/components/AppNavigation/navigation.ts` from Blueprint
  `IconName` to `RailItem.iconId`.
- Added React runtime-only rail expanded state in
  `src/components/AppShell/AppShell.tsx`; no `localStorage` or
  `sessionStorage`.
- Updated `LeftRail` to use Blueprint `Button` for behavior and custom SVG
  assets for icons.
- Added expanded rail styling and frozen width tokens.
- Added e2e coverage for default collapsed state, toggle open / close,
  tab-specific widths, SVG icon IDs, labels visible only in expanded state, and
  map layout adjustment.
- Added six visual references under `tests/visual-qa/left-rail/` and updated
  `tests/visual-qa/latest.json`.
- Updated `docs/agent/frozen-decisions.md`, `AGENTS.md`, `cspell.json`, and
  `verify-frozen.ts`.
- Fixed reviewer findings:
  - removed dead `RAIL_ICON_IDS` export;
  - removed unused `RailConfig.expandedWidth` split source;
  - added `usage: 'drive-inventory'` for retained but currently unused
    `button.svg`;
  - extended A13 guard for Drive icon manifest entries and physical SVG files.

## Current Verification State

Fresh passes before the last A13 guard cleanup:

- `pnpm.cmd verify`: 19/19 PASS.
- `pnpm.cmd check:visual`: PASS for six rail states.
- `pnpm.cmd test:e2e tests/e2e/workspace-shell.spec.ts`: 20/20 PASS.
- `pnpm.cmd test:browser`: 34/34 PASS after rerunning the one flaky smoke case.
- `pnpm.cmd check:spelling`: 0 issues.
- `pnpm.cmd check:dead`: PASS.

Fresh passes after the last A13 guard cleanup:

- `pnpm.cmd verify:static`: 13/13 PASS.
- `pnpm.cmd typecheck`: PASS.
- `pnpm.cmd check:dead`: PASS.

Last full `pnpm.cmd codex:ship` did not finish. It previously reached browser
tests and failed once on `tests/e2e/smoke.spec.ts` because
`page.waitForLoadState('networkidle')` timed out while the page was already
rendered. Targeted smoke rerun passed, and full `pnpm.cmd test:browser` then
passed 34/34. After that, the latest Raman reviewer findings were fixed, and
`verify:static`, `typecheck`, and `check:dead` passed again. The next session
must still rerun final verification from scratch before delivery.

## Visual QA Notes

- Reference cases:
  - `map-closed.reference.png` 50x1080;
  - `map-open.reference.png` 195x1080;
  - `routes-closed.reference.png` 50x1080;
  - `routes-open.reference.png` 207x1080;
  - `telemetry-closed.reference.png` 50x1080;
  - `telemetry-open.reference.png` 170x1080.
- The original routes / telemetry closed Drive exports were 51px wide; they were
  normalized to the frozen 50px rail because the extra pixel is exported edge.
- User explicitly accepted the bottom-corner browser `N` overlay as an external
  browser artifact that can be ignored.
- Actual and diff files are generated under ignored `reports/visual-qa/`.

## Agents

- Poincare visual QA: PASS.
- Sagan frozen / instruction drift: PASS.
- Raman code quality / reuse / deadwood: initially FAIL with three findings; all
  three findings were addressed in the current WIP, but Raman has not rechecked
  after those fixes.

## Next Session Checklist

1. Read `AGENTS.md`, this handoff, `docs/agent/frozen-decisions.md`, and
   `verify-frozen.ts`.
2. Run `git status --short` and confirm branch
   `codex/left-sidebar-expanded-svg-icons`.
3. Re-run focused checks after the latest A13 guard cleanup:
   - `pnpm.cmd exec prettier --write ...` only if formatting fails;
   - `pnpm.cmd verify:static`;
   - `pnpm.cmd typecheck`;
   - `pnpm.cmd check:dead`;
   - `pnpm.cmd test:e2e tests/e2e/workspace-shell.spec.ts`;
   - `pnpm.cmd check:visual`;
   - `pnpm.cmd test:browser`.
4. Re-ask code quality / reuse / deadwood reviewer to confirm the Raman
   findings are now resolved.
5. Run `pnpm.cmd codex:ship`.
6. If all gates pass, commit any follow-up fix, push, and open a draft PR.

## Known Risk

The smoke test still uses `page.waitForLoadState('networkidle')`, which can be
timing-sensitive with MapLibre / OSM tile requests and Next Dev Tools. It passed
on rerun, so no source change was made before this pause. If it repeats, debug
systematically and consider replacing that wait with a stable DOM/map-ready
condition.
