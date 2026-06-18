# Top Control 1920 Reference Handoff

Date: 2026-06-18
Branch: `codex/top-controls-1920-reference`
Scope: map-tab top controls at the 1920px reference viewport.

## What Changed

- The map `Дата и время` card now uses a frozen 320px Figma hug width via
  `styles.mapDateCard` and `$top-controls-map-date-card-width`.
- The map toolbar now uses `styles.mapToolbar` so the center `Функции карты`
  card stays packed to visible icon content at 1920px.
- The free horizontal space at 1920px is assigned to the pinned right-side
  `Тип данных` card. Its segmented control stretches to the full card width,
  and the two segment buttons flex equally.
- The four map function groups now keep a real visual 16px edge-to-edge gap:
  previous group's last button edge to next group's first button edge.
- The `Слои карты` row is capped at 1920px to `hydromap`, `google`,
  `yandex-plus`, and the rightmost chevron dropdown.
- Extra layer provider icons plus `Подложка` / `Сетка` fold into the rightmost
  layer dropdown at 1920px and below.
- `IconButtonGroup` now supports `compactVisibleCount` and keeps configured
  dividers when the next visible control is the overflow dropdown.

## Frozen Contract Updates

- `docs/agent/frozen-decisions.md` documents the map-toolbar 1920 contract:
  packed function groups, 320px date card, stretched data-type card, equal
  data-type segments, layer dropdown cap, and 16px edge-to-edge group gaps.
- `verify-frozen.ts` A15 now guards the relevant implementation and prose:
  `mapToolbar`, `mapDateCard`, `mapFunctionsCard`, `compactVisibleCount`,
  rightmost layer dropdown behavior, and the data-type stretch contract.
- `tests/e2e/top-controls.spec.ts` now asserts the behavior with DOM/CSS metrics:
  group button counts, hidden layer toggles at 1920px, layer icon ids, two layer
  dividers, 16px button-edge gaps, equal data-type segment widths, 32x30 icon
  button dimensions, and responsive fitting across target widths.

## Verification State

Fresh checks run for this iteration:

- `pnpm exec playwright test tests/e2e/top-controls.spec.ts`: 0 FAIL.
- `pnpm check:visual`: 0 FAIL. Fresh actuals were written under ignored
  `reports/visual-qa/`, including
  `reports/visual-qa/top-control/map-1920x1080.actual.png`.
- `pnpm verify:static`: 0 FAIL.
- `pnpm typecheck`: 0 FAIL.
- `pnpm check:css`: 0 FAIL.
- Targeted Prettier check for touched files: 0 FAIL.
- Targeted ESLint for touched TS/TSX/test/guard files: 0 errors.

Not completed:

- Full `pnpm verify` was not rerun to completion because the user-visible
  `next dev` server on `localhost:3000` conflicts with the runtime verifier,
  which starts another Next dev server on port `3100`.
- Full `pnpm codex:ship` was not run because it includes the same runtime path
  plus heavier quality gates that are known to hang in this Windows sandbox.
- `gh auth status` still reported an invalid token for `Gorgutc` during this
  handoff attempt. Use `git push` first; draft PR creation needs a working
  GitHub CLI session or the GitHub app connector.
- During push, the pre-push `quality:fast` gate initially failed because
  `pnpm check:format` and then `pnpm check:js` scanned local
  `.claude/worktrees/` reference copies. `.prettierignore` and
  `eslint.config.mjs` now exclude `.claude/worktrees/` so the global checks cover
  the real repository tree.

## Local Review Roles

- Visual QA: PASS with `pnpm check:visual`; artifacts stayed under ignored
  `reports/visual-qa/`.
- Component reuse: PASS. Reused `ControlCard`, Blueprint segmented/button
  primitives, `cx`, SCSS tokens, and existing `IconButtonGroup`.
- Code quality/readability: PASS for touched code after targeted ESLint and
  TypeScript checks.
- Deadwood/duplicate-code: PASS. No new component family was introduced; the
  change is scoped to the existing top-control primitives and map toolbar styles.
- Frozen/instruction drift: PASS via `pnpm verify:static`; A15 docs and guard
  were updated together.

## Resume Notes

If this branch is resumed later:

1. Start from `AGENTS.md`, this handoff, `docs/agent/frozen-decisions.md`, and
   `verify-frozen.ts`.
2. Recheck `git status --short --branch` and `gh auth status -h github.com`.
3. If the local `next dev` server is still running on `localhost:3000`, do not
   treat full `pnpm verify` runtime failure on port `3100` as a product
   regression until the server conflict is removed or verified separately.
4. Do not commit `reports/`, `test-results/`, `.next/`, or other files listed in
   `DO_NOT_PUSH.md`.
