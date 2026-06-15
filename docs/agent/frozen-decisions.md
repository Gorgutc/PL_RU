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
- Medium, complex, delegated, docs-sensitive, instruction, hook, skill, and
  quality-tooling work must record a `Routing Decision` with `Documentation`,
  `Selected skills`, `Selected agents`, `Catalog candidates`, and `Reason`.
  This is traceability only and does not outrank `verify-frozen.ts`, the current
  user request, `AGENTS.md`, Superpowers, or repo-local PL_RU skills.
- Explicit spawned subagents must receive the PL_RU prompt/output contract:
  `Goal`, `Success Criteria`, `Documentation`, `Selected skills`, `Selected
agents`, ownership / write zone, `Verification`, `Stop Rules`, and
  `PASS/FAIL` evidence. Inline summaries are not a substitute for required
  spawned-agent evidence.
- External orchestration packs remain references, not authority. Do not adopt
  Beads as a canonical ledger, raw external shell/python scripts as repo policy,
  global startup hooks, or copied large external templates without
  license/provenance review.
- Explicit defers cannot override blockers. Frozen contract mismatch, missing
  required visual QA, failing required roles, unresolved task-brief mismatch,
  and missing `pnpm codex:ship` for finished delivery all block handoff until
  fixed or explicitly accepted by the current user request.

## App Layout Sizing Grid

- Layout and component dimensions / spacing across the whole app should stay on
  the shared `10px` / `8px` / `4px` sizing rhythm. Use `4px` as the minimum grid
  step; prefer `8px` and `10px` multiples for larger component and shell
  measurements when they fit the visual contract.
- Radii should follow the same rhythm unless a frozen visual contract explicitly
  requires a smaller hairline radius; the current `2px` map outer container
  radius is such a frozen exception.
- New raw spacing or sizing values must be added through `src/styles/_tokens.scss`
  and then consumed by SCSS modules, unless a browser or Blueprint API requires
  a local non-layout numeric value.

## Header Responsive Tabs

- Header height stays `48px`.
- Header horizontal padding stays `8px`.
- Header brand/actions side zones stay `330px`.
- At `1280px` and `1440px`, tabs are compact: six `80px` tab buttons with
  icons visible and text hidden visually.
- At `1920px`, `2560px`, and `3840px`, tab text is visible. The first two tabs
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

## Workspace Shell And Left Sidebar

- Header remains the only owner of the active top-level tab state; the workspace
  shell only reads that state through `activeTab`.
- The workspace shell starts below the frozen `48px` Header and uses
  `calc(100dvh - $header-height)` so the map and left side area fill the
  remaining viewport height without sliding underneath Header.
- The compact left rail is fixed at `50px` wide. It is contextual for
  `map`, `bar`, and `tmi`.
- The rail has a local React-only open / closed state. It starts collapsed on
  first page load and must not use `localStorage` or `sessionStorage`.
- The expanded left rail width is frozen to `240px` for `map`, `bar`, and
  `tmi`; the routes (`bar`) expanded reference is the canonical maximum width
  for every contextual rail. `51px` closed reference exports are treated as the
  same `50px` rail plus the exported edge.
- Rail open / close uses one soft `220ms` transition contract for the shell
  grid, left area, rail buttons, label reveal, and collapse icon rotation.
  `prefers-reduced-motion: reduce` removes meaningful rail motion.
- Left rail buttons keep Blueprint `Button` primitives for interaction, but
  their glyphs use custom SVG assets from the approved Google Drive `Иконки`
  folder. `RailItem.iconId` typed against the rail SVG manifest is the source of
  truth for mapping each tab/item to the correct SVG.
- The rail SVG manifest keeps the complete Drive `Иконки` inventory as local
  assets. `button.svg` is intentionally retained as a `drive-inventory` asset
  even though no current rail item maps to it.
- The collapse item is present on every rail tab and owns the open / close
  toggle. In collapsed state it is the expand affordance; in expanded state it
  collapses the menu.
- Wide side panels are fixed at `300px` wide. `kick` renders the launch-parameter
  form, `stats` renders table filters, and `sat` renders the `OsiDus` probing
  gallery: a `OsiDus` panel title, a `Визуализация` / `Сохранённые` / `Метки` tab
  row (presentational local state, `Визуализация` active by default), a
  `Снимки в выделенной области` row with a `Найдено N` counter, and a vertical
  list of snapshot cards (dark square thumbnail placeholder plus number, date-time,
  and status text). The probing map stays in the center slot alongside the gallery.
- Left-rail buttons preserve the shared visual state contract: transparent rest,
  `#528bff` hover, `#2970ff` active, white icon color, and one uniform button
  size. Active rail buttons must not keep a persistent outline, border, or
  shadow after pointer activation; keyboard `:focus-visible` remains available
  for active and non-active rail buttons.
- Panel-level controls in `kick`, `stats`, and `sat` side panels align their
  right edge to the same right edge as the footer action row, within a `1px` tolerance.
  The shared `TabSidePanel` spacing contract owns this alignment.
- Launch-parameter selection fields use the shared simple dropdown control,
  extracted as the reusable `SelectControl` component
  (`src/components/controls/SelectControl/`):
  Blueprint `HTMLSelect` rendering a native `<select>` with a custom
  chevron-down overlay, matching the existing `stats` and `sat` side-panel
  visual contract and now reused by the per-tab top control toolbars so both
  share one dropdown contract. `kick`, `stats`, and `sat`
  selection fields must not use `InputGroup` plus `datalist`, `aria-autocomplete`,
  the native `list` attribute, or `kick-combobox-*` test IDs.
- Launch comments are editable `TextArea` controls. Launch date/time and the
  statistics `Начало отсчета` / `Окончание отсчета` period fields use editable
  visible text inputs in the reference format (`02.05.2026 | 16:31` for launch,
  `24-04-2025 | 00:00` for statistics) plus a native `datetime-local` calendar
  input kept inside the shared control for the calendar affordance.
- The probing (`sat`) `OsiDus` gallery must not inherit the launch-specific
  editable `kick-comment` selector or behavior; the gallery has no comment field.
  The legacy probing form (source/period/observation-layer/comment) was replaced
  by the gallery with explicit user approval on 2026-06-15.
- Launch checkbox rows keep a compact `16px` Blueprint indicator aligned to
  the same internal right inset as other controls and must not keep a
  pointer-click focus outline or shadow; keyboard focus remains visible on the
  indicator. Footer action focus uses an inset ring so button borders are not
  clipped by the panel edge.
- The center workspace is a Blueprint `Card` map surface inside a dynamic map
  container. The map area keeps a symmetric `10px` outer gutter, the Card keeps
  an `8px` inner inset before the MapLibre canvas, the outer container radius is
  `2px`, and the map canvas radius is `4px`.
- The map-bearing tabs (`map`/`bar`/`tmi`/`sat`) show the map in that center
  slot; the table tabs (`kick`/`stats`) render a presentational dark table
  container (`WorkspaceTableSurface`) there instead, reusing the same
  `10px`/`8px`/`2px`/`4px` geometry. A13 was re-opened 2026-06-15 with explicit
  user approval because the эталон shows a table, not a map, on those tabs;
  `AppShell.tsx` keeps the literal `<WorkspaceMap />` for the map-bearing tabs. The visible map canvas is a clipped
  mask over a stable right-anchored MapLibre stage sized to the collapsed-rail
  map width, so left-side rail and panel width changes crop or reveal the map
  instead of scaling, recentering, or resizing it. MapLibre `trackResize` stays disabled;
  the app-owned `ResizeObserver` observes the stable stage and calls
  `map.resize()` only when the stage itself changes, such as true viewport or
  height changes. MapLibre CSS is imported through `src/app/layout.tsx`.
- The default map provider is OpenStreetMap raster tiles from
  `https://tile.openstreetmap.org/{z}/{x}/{y}.png`, with expanded visible OSM
  attribution and MapLibre navigation controls. Do not add prefetching or
  offline tile downloads. Provider URL, attribution, center, zoom, and style
  settings stay centralized in `src/components/WorkspaceMap/mapConfig.ts` so a
  future provider swap is localized.
- Large panel controls reuse Blueprint primitives (`HTMLSelect`, `InputGroup`,
  `TextArea`, `Checkbox`, and `Button`) and take spacing, widths, colors, and
  sizes from `src/styles/_tokens.scss`.
- The Header visual contract is not part of this shell contract and must not be
  changed when extending the left side menu or real map.

## Top Control Blocks

- Each top-level tab renders its own per-tab top control block (`TabTopControls`)
  as a horizontal toolbar at the top of the workspace right column, above the
  `WorkspaceMap`. The left rail/panel keep their full height; only the map's
  available height changes, handled by the existing map `ResizeObserver`. The map
  contract (right-anchored stage, `trackResize: false`) is not weakened.
- Functionality comes from Blueprint primitives (`SegmentedControl`, `HTMLSelect`,
  `InputGroup`, `Switch`, `Button`, `Icon`); the look, layout, and copy come from
  the Figma design. The blocks are presentational with local UI state only (no
  data backend) until a dedicated task wires real data.
- Card sections reuse the frozen dropdown/control surface: `#171d20` background,
  `#727677` 1px outline, `2px` radius, `16px` padding, and `12px`/500 white
  titles. Controls are `30px` tall with `3px` radius and `#666` outline; the
  segmented `Тип данных` active pill uses `#2970ff`. All raw values live in
  `src/styles/_tokens.scss` (`$top-controls-*` plus reused tokens); no inline hex
  and no `px` font-size.
- The `Тип данных` group stays pinned to the right. At the target `1920px` with
  the rail collapsed, the cards flex to fill the full toolbar width with no
  internal horizontal scroll: the fixed cards (map functions, weather, data-type,
  animation) keep their intrinsic width, while the per-tab date/time card flexes
  (`cardFlexible`) and the date/time field shrinks to a min-width so everything
  fits. Cards stay `10px` apart and the data-type group is never clipped.
  Responsive reflow for narrower widths follows the Workspace Responsive
  Adaptation And Map Bottom Panel contract below.
- The `map` tab icon-button groups (Инфраструктура / Наложения на карту / Борты /
  Слои карты) use a dedicated SVG glyph manifest in `public/top-control-icons/`
  driven by `src/components/TabTopControls/mapIcons.ts`. This is the map-tab
  equivalent of the left-rail SVG exception: production map control icons use
  these SVGs via `<img>`, not Blueprint `<Icon>`. The glyph↔button order across
  the four groups is mapped to the reference (`Верхние блоки управления` block
  slices). The `Слои карты` group shows the map layer providers plus two map
  toggles (`Подложка` / `Сетка`); at narrow widths its icons overflow into a
  chevron "more" dropdown and the toggles fold away. The exact assignment stays
  adjustable in the manifest.
- Map icon glyphs render as block `<img>` centered in their `32x30` button, and
  the four `map` function groups sit `16px` apart (`cardTightGroups`).
- Toolbar action buttons follow a rest→active model. The `tmi` "Загрузить
  маршруты" primary action is a filled accent button (`PrimaryActionButton`,
  `#2970ff` surface). The `sat` "Создать анимацию…" control is a resting-outlined
  toggle (`ToggleActionButton`): transparent + `#666`/`$color-workspace-border`
  hairline at rest (the same outlined surface as the `Фильтры` chip), filling with
  the `#2970ff`/`$color-workspace-button-active` accent only when toggled on, with
  `aria-pressed`. Do not "restore" the animation toggle to the filled
  `PrimaryActionButton` — the resting-outlined look is intentional.
- Toolbar dropdowns reuse the shared `SelectControl` (same component as the side
  panels) in its `dense` 30px variant, so the per-tab toolbar height stays
  constant and the map stage never resizes on tab switches. The shared select's
  control surface comes from the `control-field` SCSS mixins
  (`src/styles/_control-field.scss`).
- Reuse before adding: new toolbar controls must reuse Blueprint primitives,
  the shared `SelectControl`, `src/styles/_tokens.scss`, the shared
  `src/lib/cx.ts`, and existing patterns rather than duplicating the side-panel
  controls.

## Workspace Responsive Adaptation And Map Bottom Panel

- Adaptation principle: fixed-chrome + rubber map. The per-tab chrome (top
  controls, map bottom panel) keeps fixed pixel control sizes on the `10px` /
  `8px` / `4px` rhythm; the map (and the bottom-panel cloud legend) absorb the
  free space. There is one workspace breakpoint, `$workspace-bp-compact` (`120rem`
  / `1920px`), mirroring the Header expanded threshold. At `>= 1920` the frozen
  `1920` layout is unchanged (date/time card flexes, the map-functions card keeps
  intrinsic width, all icons visible). It is not proportional zoom.
- Compact band (`< 1920`, the `1280` / `1440` references): the date/time card
  becomes intrinsic and the map-functions card becomes the flexible (shrinking)
  card. Each `map` function group shows as many icons as fit and collapses the
  rest into a chevron "more" dropdown (`MapLayerDropdown`), driven by a
  `ResizeObserver` on the icon row. A group never shrinks below its (nowrap)
  title; the icon row uses `contain: inline-size` so the icon count never forces
  the group wider than its title. The toolbar height stays constant (single row),
  so the map stage never resizes on reflow; there is no horizontal scroll and the
  `32x30` buttons are never shrunk. The `Слои карты` map toggles (`Подложка` /
  `Сетка`) fold away in the compact band. At `>= 1920` every group shows all its
  icons (no overflow chevron). Exact per-group icon counts in the compact band
  approximate the reference (they are width-driven, not byte-exact).
- Content max-width: the chrome caps at `$workspace-content-max` (`160rem` /
  `2560px`) and left-aligns beyond it, while the map and Header stay full-bleed.
  At `<= 2560` the chrome fills the width; at `3840` (the canonical maximum width)
  the top controls and bottom panel stop at `2560` and the map fills to the edge.
- Map bottom panel (`MapBottomPanel`): a presentational footer strip rendered on
  the `map` tab as a sibling of the map in the workspace column. Local UI state
  only (no data backend), like `TabTopControls`. Fixed height
  (`$workspace-bottom-panel-height`, `96px` — `10px` gutter + `86px` card,
  mirroring the top controls), so it only changes the map's available height
  (handled by the existing map `ResizeObserver`); the map's horizontal stage
  contract (right-anchored stage, `trackResize: false`) is not weakened. Three
  sub-blocks left→right: `Фильтрация на карте` (a row of `SwitchToggle`s),
  `Нижняя граница облаков` (the flexible rubber middle block — a rainbow gradient
  legend with `(м)` unit and `0…5000` tick labels), and `Управление данными`
  (`Загрузить свои данные` / `Скачать отчет` outlined `ChipButton`s). It reuses
  the frozen `ControlCard` / `ControlField` / `SwitchToggle` / `ChipButton`
  primitives (the same `#171d20` card surface) and `src/styles/_tokens.scss`;
  no new card abstraction.
- Cloud-base legend gradient: the rainbow stop colors are sampled from the
  reference PNG and live only in `src/styles/_tokens.scss`
  (`$color-cloud-legend-*`), consumed through `$gradient-cloud-legend`. No inline
  hex and no `px` font-size in the module (A5 / A8).

## Quality Tooling

- Node 24 LTS is the supported runtime. The repo contract is mirrored by
  `.nvmrc`, `package.json` engines, `.github/workflows/ci.yml`,
  `.codex/config.toml`, root `@types/node`, and the frontend rules skill.
- `pnpm check:duplicates` must run `jscpd --config .jscpd.json --noTips .` so
  local Windows runs and Linux CI scan the same target set.
- Shared Playwright config lives in `playwright.shared.config.ts`; e2e and
  quality configs should extend it instead of duplicating the full config body.
- Every Playwright browser check (e2e, quality, pa11y, visual) runs Playwright's
  lockfile-pinned bundled Chromium, installed in CI via
  `pnpm exec playwright install --with-deps chromium`. The shared config sets no
  `channel`, so the runner's system Google Chrome is never used: the 2026-06
  runner image auto-bumped Chrome 148 -> 149 and its wider font metrics broke the
  top-controls fitting + visual gates with zero repo changes (user-approved
  unfreeze, 2026-06-12). Pinning browser checks to system Chrome — via
  `channel: 'chrome'` or by exporting `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` in
  GitHub Actions — is forbidden; `verify-frozen.ts` (A11) guards both halves.
- Reference manifest hashing lives in `scripts/lib/reference-manifest.mjs`;
  `scripts/sync-refs.mjs` and `scripts/verify-reference.js` should share it.
- Pa11y, `check:visual`, and the `verify-frozen.ts` runtime block launch that same
  bundled Chromium through `chromium.executablePath()` (with an optional
  `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` override for non-default install paths),
  so every browser family stays identical without a separate browser download.
- `pnpm check:visual` stays in the deep quality gate. It must require visual QA
  evidence for UI-surface changes detected in the base diff, unstaged worktree
  diff, staged diff, or untracked files.
- `pnpm check:visual` must validate reference sources, viewports, states,
  pixel-comparison PASS, tolerance, mismatched areas, and DOM/CSS metric PASS
  before delivery. The gate cannot accept only a self-reported manifest:
  `pixelComparison.cases` must list local `referencePath`, `actualPath`, and
  `diffPath` PNG artifacts, and the script must perform a real pixel comparison
  before reporting PASS.
- For base-diff UI changes, default CI evidence must be a tracked
  `tests/visual-qa/latest.json` manifest. Ignored `reports/visual-qa/latest.json`
  evidence is only valid when explicitly selected through `VISUAL_QA_EVIDENCE`
  for a local run.
- Visual evidence cases may include `capture` metadata. When they do, the guard
  must start or reuse the app, capture a fresh Playwright screenshot to
  `actualPath`, then compare that fresh PNG against the committed
  `referencePath`.
- `pnpm check:visual` fails closed when the base ref is unavailable unless
  `VISUAL_QA_ALLOW_MISSING_BASE=1` is explicitly set for a known local fallback.
  Final actual and diff PNG output for PR handoff and subagents must stay under
  ignored `reports/visual-qa/`. Tracked evidence must not point final artifacts
  at `test-results/visual-qa/` because Playwright clears that directory. Visual
  capture waits for visible MapLibre canvas, attribution, and zoom controls
  before screenshotting; if the canvas is blank, the guard retries capture once,
  then returns FAIL instead of looping.
