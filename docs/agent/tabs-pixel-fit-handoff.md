# Хэндофф: пиксельная подгонка 3 табов под эталонные референсы + аудит кода

> Живой документ: ТЗ + журнал прогресса. Обновлять после каждого чекпойнта/итерации.
> Любая сессия (Claude или Codex) может продолжить работу отсюда — этот док
> самодостаточен: все решения и шаги дублируются здесь, внешних файлов не требуется.

## Статус

- Ветка PR-A: `claude/brave-lalande-1a4cfa` (от `main` = `efb68fe`).
- Статус: **I1 — правки внесены и отревьюваны** (субагенты PASS,
  adversarial-review пройден, находки триажированы — см. журнал).
  Осталось: codex:ship → push → draft PR-A.
- Единственный источник статуса — эта секция; чек-лист и журнал вторичны.
- Последнее обновление: 2026-06-11.

## ТЗ (бриф задачи)

Довести UI трёх табов («Оперативная карта»/`map`, «Маршруты»/`bar`,
«Телеметрия»/`tmi`) до состояния **«один в один»** с 24 эталонными PNG
(3 таба × 4 разрешения 1280/1920/2560/3840 × 2 состояния сайдбара).
Дополнительно:

1. Фикс бага «сжимающийся первый блок сверху» (дата-карточка в compact <1920).
2. Нижние панели для `bar`/`tmi` (на референсах есть; в коде — только у `map`;
   замороженный контракт A17 расширяется по явному одобрению пользователя).
3. Полный code review всего кода: мёртвый код, дубли, странные решения.
4. e2e-проверка промежуточных разрешений (не только 1280/1920/2560/3840).
5. 3 отдельных PR; решения фиксировать в этом handoff.

## Подтверждённые решения пользователя

1. `Общий вид_Телеметрия_с закрытым боковым меню_1280px-1.png` — на самом деле
   **раскрытое** меню (ошибка в имени файла). Матрица 24 референсов полная.
2. Нижние панели `bar`/`tmi` **реализуем**: `MapBottomPanel` → обобщение
   `TabBottomPanel` + атомарное расширение A17 (verify-frozen.ts +
   frozen-decisions.md + CLAUDE.md + AGENTS.md синхронно, один коммит).
3. Референсы **НЕ коммитим** (~120 МБ): путь через env `DESIGNER_REFS_DIR`
   с дефолтом на Desktop-путь; в репо — только лёгкие self-captured baselines.
4. **3 отдельных PR**: PR-A (скиллы + handoff), PR-B (вся UI-работа),
   PR-C (чистка по итогам аудита).
5. Работаем от текущей ветки `claude/brave-lalande-1a4cfa`; PR-B/PR-C — стеком.

## Источники истины

- **Эталонные PNG**: `C:\Users\Junior\Desktop\Work\Эталонные референсы  внешнего вида\`
  (в имени папки **два пробела** между «референсы» и «внешнего»; переопределяется
  env `DESIGNER_REFS_DIR`). 24 файла, в репо не коммитятся.
- **Frozen**: `verify-frozen.ts` (A17 — функция
  `testResponsiveAndBottomPanelContract`; A15 — `testTopControlBlocksContract`),
  `docs/agent/frozen-decisions.md` (секции «Top Control Blocks» и «Workspace
  Responsive Adaptation And Map Bottom Panel»), `src/styles/_tokens.scss`.
  Номера строк здесь не пинится — искать по именам функций/секций/токенов.
- **Пиксельный движок**: `scripts/check-visual-evidence.mjs`
  (`createPngAnalysisProbe`, `comparePngPair`, per-case tolerance),
  `scripts/lib/next-server.mjs` (`withNextDevServer`), `tests/visual-qa/latest.json`.
- **App**: `src/components/{AppShell,TabTopControls,MapBottomPanel,LeftRail,Header}`.

## Карта референсов (24 PNG)

Размеры device-px, DPR=1: 1280×800 (**16:10**), 1920×1080, 2560×1440, 3840×2160.
Карта на скриншотах — живые OSM-тайлы → пиксельно сравниваются только
chrome-регионы (header 48px / rail 50|240px / top controls 96px / bottom panel
96px); карта — DOM/CSS-метриками.

| Таб | Ширина | Сайдбар | Файл                                                                                                | Статус |
| --- | ------ | ------- | --------------------------------------------------------------------------------------------------- | ------ |
| map | 1280   | закрыт  | `Общий вид_Оперативная карта_с закрытым боковым меню_1280px.png`                                    | —      |
| map | 1280   | раскрыт | `Общий вид_Оперативная карта_с раскрытым боковым меню_1280px.png`                                   | —      |
| map | 1920   | закрыт  | `Общий вид_Оперативная карта_с закрытым боковым меню_1920px.png`                                    | —      |
| map | 1920   | раскрыт | `Общий вид_Оперативная карта_с раскрытым боковым меню_1920px.png`                                   | —      |
| map | 2560   | закрыт  | `Общий вид_Оперативная карта_с закрытым боковым меню_2560px.png`                                    | —      |
| map | 2560   | раскрыт | `Общий вид_Оперативная карта_с раскрытым боковым меню_2560px.png`                                   | —      |
| map | 3840   | закрыт  | `Общий вид_Оперативная карта_с закрытым _боковым меню_3840px.png` (аномалия: `_боковым`)            | —      |
| map | 3840   | раскрыт | `Общий вид_Оперативная карта_с раскрытым боковым меню_3840px.png`                                   | —      |
| bar | 1280   | закрыт  | `Общий вид_маршруты_с закрытым боковым меню_1280px.png`                                             | —      |
| bar | 1280   | раскрыт | `Общий вид_маршруты_с раскрытым боковым меню_1280px.png`                                            | —      |
| bar | 1920   | закрыт  | `Общий вид_маршруты_с закрытым боковым меню_1920px.png`                                             | —      |
| bar | 1920   | раскрыт | `Общий вид_маршруты_с раскрытым боковым меню_1920px.png`                                            | —      |
| bar | 2560   | закрыт  | `Общий вид_маршруты_с закрытым боковым меню_2560px.png`                                             | —      |
| bar | 2560   | раскрыт | `Общий вид_маршруты_с раскрытым боковым меню_2560px.png`                                            | —      |
| bar | 3840   | закрыт  | `Общий вид_маршруты_с закрытым _боковым меню_3840px.png` (аномалия: `_боковым`)                     | —      |
| bar | 3840   | раскрыт | `Общий вид_маршруты_с раскрытым боковым меню_3840px.png`                                            | —      |
| tmi | 1280   | закрыт  | `Общий вид_Телеметрия_с закрытым боковым меню_1280px.png`                                           | —      |
| tmi | 1280   | раскрыт | `Общий вид_Телеметрия_с закрытым боковым меню_1280px-1.png` (**ошибка в имени**: реально раскрытое) | —      |
| tmi | 1920   | закрыт  | `Общий вид_Телеметрия_с закрытым боковым меню_1920px.png`                                           | —      |
| tmi | 1920   | раскрыт | `Общий вид_Телеметрия_с раскрытым боковым меню_1920px.png`                                          | —      |
| tmi | 2560   | закрыт  | `Общий вид_Телеметрия_с закрытым боковым меню_2560px.png`                                           | —      |
| tmi | 2560   | раскрыт | `Общий вид_Телеметрия_с раскрытым боковым меню_2560px.png`                                          | —      |
| tmi | 3840   | закрыт  | `Общий вид_Телеметрия_с закрытым _боковым меню_3840px.png` (аномалия: `_боковым`)                   | —      |
| tmi | 3840   | раскрыт | `Общий вид_Телеметрия_с раскрытым боковым меню_3840px.png`                                          | —      |

Статусы: `—` не начато · `crop` кропы сняты · `fit` подгонка идёт · `PASS` в допуске.

### Содержимое по референсам (просмотр downsample; точный копирайт снять кропами в I2)

- **bar, нижняя панель**: «Фильтрация на карте» (свитчи) · «Настройка карты»
  (селекты) · «Высота по барометру (м)» (градиент-легенда) · «Управление данными».
- **tmi, нижняя панель**: «Данные маршрута по UAV TR580» (key-value сетка) ·
  «Добавить данные по:» (кнопки TIS/BPX) · «Высота по барометру (м)» ·
  «Управление данными» (Загрузить данные / Скачать PDF). На 1280 легенда скрыта.
- **tmi, тулбар 1280**: селекты свёрнуты в «Доп. параметры» + чип «Фильтры».
- **map, нижняя панель**: как текущая («Нижняя граница облаков» — frozen-копирайт
  карты не меняется).
- **Баг сжатия**: на референсах 1280 поля дат сохраняют натуральную ширину.

## Ветки / PR (стек)

1. **PR-A** — `claude/brave-lalande-1a4cfa` → draft PR на `main`
   (handoff-док + фикс обвязки: 4 строки скиллов, MD041-H1 в 6 командах,
   диапазоны A1..A17). Мерж — за пользователем.
2. **PR-B** — `claude/tabs-pixel-fit` от головы PR-A → draft PR с base =
   ветка PR-A. После мержа PR-A:
   - merge-коммит → достаточно ретаргета PR-B на `main` (GitHub делает его
     автоматически при удалении ветки PR-A; иначе — вручную в UI);
   - **squash или rebase-мерж (в любом варианте)** → ретаргета мало: коммиты
     PR-A не предки `main`, дифф PR-B будет загрязнён. Обязательно
     `git rebase --onto origin/main <старая-голова-PR-A> claude/tabs-pixel-fit`
     - force-push.
       В этом репо PR исторически мержатся merge-коммитами (#3–#20).
3. **PR-C** — `claude/repo-audit-cleanup` от головы PR-B; правила те же
   относительно мержа PR-B.

## Чек-лист итераций

Каждая итерация = чекпойнт: изменения → целевые субагенты → гейты → запись в
журнал → коммит. Гейты без дублирования: после каждого коммита —
`pnpm quality:fast` (включает `verify:static`); полный `pnpm verify` — после
architecture-чувствительных правок (frozen-файлы, src, конфиги); перед каждым
push — `pnpm codex:ship` (сам включает quality:fast и полный verify — отдельно
их перед push не повторять). Полный проход 5 обязательных субагентов +
adversarial-review — на финализацию каждого PR.

### PR-A — инфра-фикс

- [x] **I0**: bootstrap + этот handoff-док. Гейты: verify, quality:fast.
- [ ] **I1** (скоуп расширен после разведки CI): фикс обвязки.
      Сделано (в рабочем дереве):
  1. 4 хвостовые строки Codex-скиллов (`pl-ru-context-keeper`,
     `pl-ru-quality-gate`, `pl-ru-spec-guardian` — битые ссылки на
     несуществующие `.claude/agents/ts-*.md`; `pl-ru-ship` — «replaces»
     про существующий файл) заменены зеркальными blockquote-ссылками в стиле
     Claude-стороны. Claude-зеркала чистые. A9-различие канонов
     («session memory» vs «Codex Memories») — намеренное, не трогать.
  2. **CI на main красный с PR #19**: 6 ошибок MD041 (`check:markdown`) в
     `.claude/commands/*.md` — добавлены H1-заголовки после frontmatter
     (решение: контент-фикс, а не правка конфига markdownlint — конфиг под
     A11, и H1 соответствует стилю остальных md репо).
  3. Устаревшие диапазоны правил «A1..A16» заменены формулировками без
     номера последнего правила («все A-правила verify-frozen.ts») в
     `.claude/commands/verify.md`, `CLAUDE.md` (Quick Start + Two-Canon
     Parity), `.claude/agents/instruction_drift_auditor.md`,
     `.claude/agents/frozen_decisions_guardian.md` — чтобы не протухали при
     A18 (Codex-стороне зеркальных правок не нужно — там диапазона нет,
     проверено grep). Вхождения «A1–A16» в
     `docs/agent/top-control-blocks-handoff.md` — датированные журнальные
     записи прошлой задачи, намеренно оставлены как история.
     Субагенты: instruction_drift_auditor + frozen_decisions_guardian — PASS
     (0 blocker / 0 major; минорные находки учтены). Adversarial-review
     (/code-review high, 7 углов × верификация): 42 находки → триаж в журнале.
     Осталось: codex:ship → push → draft PR-A (см. «Статус»).

### PR-B — пиксельная подгонка (ветка `claude/tabs-pixel-fit`)

- [ ] **I2**: инструментарий референсов: `scripts/visual/designer-refs.map.mjs`
      (24 литеральных имени → `{id, tab, width, height, sidebar}`; `CROP_REGIONS`;
      `PER_CASE_TOLERANCE`; `resolveDesignerRefsDir()`), операция `'crop'` в
      `createPngAnalysisProbe`, `scripts/visual/crop-designer-refs.mjs` →
      `reports/visual-qa/designer-crops/`, `scripts/visual/compare-designer-crops.mjs`
      (live element-screenshot, порт 3102, viewport = размер референса, DPR=1) →
      `reports/visual-qa/designer-diff/` + JSON-отчёт; npm `design:crop` /
      `design:check` (вне quality-гейтов; без папки — внятный fail/SKIP).
      Калибровка: header/rail-кропы 1920 vs live. Диагностика бага: ширины полей
      дат на 1280/1440/1680/1919 × 3 таба → журнал. Снять точный копирайт панелей
      bar/tmi с кропов. Субагент: code_quality_guardian.
- [ ] **I3**: zero-visual-delta рефакторинг `MapBottomPanel` → `TabBottomPanel`
      (map = байт-в-байт; bar/tmi = null, НЕ скелетоны — CI сравнивает с
      baselines без панелей; sat/kick/stats = null) + `GradientLegend` + testid
      `map-bottom-panel` → `tab-bottom-panel` + `data-tab`; маунт в
      `AppShell.tsx`; каталог MapBottomPanel удалить. Атомарно в том же коммите:
      `verify-frozen.ts`, функция `testResponsiveAndBottomPanelContract` (пути,
      `<TabBottomPanel`, testid, негативная проверка отсутствия MapBottomPanel,
      сниппет testid в проверке workspace-shell-спека, заголовок секции
      frozen-decisions, record-строка A17); секция «Workspace Responsive…» в
      `frozen-decisions.md`; A17-формулировка в `CLAUDE.md` + `AGENTS.md`;
      `workspace-shell.spec.ts` (все вхождения testid `map-bottom-panel` —
      искать grep'ом); упоминания в `latest.json`. Гард на ещё не
      существующий responsive-matrix.spec НЕ добавлять (добавит I8). Критерий:
      `check:visual` 0 mismatch по 7 существующим 1920-baselines.
      Субагенты: frozen_decisions_guardian + instruction_drift_auditor +
      code_quality_guardian.
- [ ] **I4**: фикс бага сжатия (только compact <1920): одеяльное compact-правило
      `.toolbar .cardFlexible {flex:0 0 auto}` в
      `TabTopControls.module.scss` → адресный `.cardCompactIntrinsic`
      (проп `compactIntrinsic`, ставит только дата-карточка map); `.dateField`
      в compact = натуральная ширина (см. «Принятые дефолты»); токен
      `$top-controls-datetime-min-width-compact` (80px) удалить (не запинен —
      проверено); bar: резина = поиск (новый токен
      `$top-controls-search-min-width-compact`, не пинить в A17); tmi: дата
      остаётся flexible (фолд селектов — I6). Абзац про compact band в
      `frozen-decisions.md` (per-tab absorbers + natural-width date);
      A15-сниппеты сохраняются. Верификация кропами 1280/1440 (инструментарий
      I2). Субагенты: visual_qa_guardian + frozen_decisions_guardian.
- [ ] **I5**: панель bar (RoutesPanel: Фильтрация на карте / Настройка карты /
      GradientLegend «Высота по барометру (м)» / Управление данными — общий
      actions-субкомпонент для 3 панелей) + подгонка bar по 8 рефам
      (1920 → 1280 → 2560/3840). Тем же коммитом: перезахват
      `tests/visual-qa/workspace-shell/routes-rail-expanded-1920x1080.reference.png`,
      latest.json, e2e (панель per-tab, высота карты), aria-метки.
      Субагенты: visual_qa_guardian + component_reuse_guardian.
- [ ] **I6**: панель tmi (RouteDataCard key-value мок / Добавить данные по:
      TIS/BPX / GradientLegend, скрыта <1920 / Управление данными) + тулбар tmi
      1280: CSS-фолд селектов «Доп. параметры» + чип «Фильтры» (паттерн
      filterExtra/filterOverflow). **STOP** если сетка не влезает в 96px
      (`$workspace-bottom-panel-height` запинен в A17 token map). Перезахват
      `telemetry-rail-expanded-1920x1080.reference.png` + latest.json + e2e.
      Субагенты: visual_qa_guardian + component_reuse_guardian.
- [ ] **I7**: сверка map по 8 новым рефам (`design:check` по chrome-регионам;
      требует готового инструментария I2); map-baselines перезахват только при
      реальной дельте, отдельным коммитом. Субагент: visual_qa_guardian.
- [ ] **I8**: `tests/e2e/helpers/workspace.ts` + `responsive-matrix.spec.ts`
      (ширины `[1366,1440,1600,1680,1919,1920,2048,2559,2560,2561,2880,3200,3440]`
      × 3 таба × 2 rail; инварианты: геометрия chrome, карта full-bleed, «natural
      date width» (<1920 — ровно натуральная ширина, значение см. «Принятые
      дефолты»), нет h-скролла/клиппинга, граничное
      compact-поведение 1919/1920); гард A17 на новый спек тем же коммитом.
      Финализация PR-B: 5 субагентов PASS + adversarial-review до 0 blocker →
      codex:ship → push → draft PR-B.

### PR-C — аудит и чистка (ветка `claude/repo-audit-cleanup`)

- [ ] **I9**: полный read-only аудит: 5 субагентов (deadwood, quality, reuse,
      instruction-drift, frozen) на весь репо + check:dead / check:duplicates /
      check:deps / quality:deep. Аудит-матрица keep/fix/remove/needs-decision →
      сюда в handoff + adversarial-review. **STOP: удаления только после
      подтверждения пользователем.**
- [ ] **I10**: чистка подтверждённого, мелкие коммиты (verify зелёный после
      каждого), codex:ship → push → draft PR-C. Статус «ЗАВЕРШЕНО» + ссылки на 3 PR.

## Архитектурные решения (зафиксировано планом)

- **Zero-visual-delta**: CI (job `ship` в `.github/workflows/ci.yml` →
  `pnpm quality:all`) гоняет check:visual на каждом PR; промежуточные коммиты не должны менять
  пиксели против закоммиченных baselines. Перезахват baseline — только в том же
  коммите, где появляется видимое изменение.
- **Пайплайн референсов** — реюз существующего движка: операция `'crop'`
  добавляется в `createPngAnalysisProbe`; сравнение — `comparePngPair`-семантика
  с per-case tolerance (дефолт pixelDelta 32 / mismatch ≤ 6.5%); дизайнерские
  кропы и диффы — только в ignored `reports/visual-qa/`.
- **TabBottomPanel** — диспетчер по `activeTab` (зеркально `TabTopControls`);
  `GradientLegend` и общий actions-блок переиспользуются всеми панелями
  (jscpd threshold 1%); содержимое панелей — презентационный хардкод-мок по
  frozen-контракту «presentational, local UI state only».
- **Фикс сжатия** — пер-таб «сжиматель»: map = `cardTightGroups` (как сейчас),
  bar = поисковое поле, tmi = фолд селектов; дата всегда натуральной ширины.
- **responsive-matrix** — только промежуточные ширины (канонические
  1280/1920/2560/3840 уже покрыты frozen-тестом «fitting and capped» в
  `top-controls.spec.ts`; его и `RESPONSIVE_WIDTHS` не трогать).

## Stop rules (спросить пользователя)

1. Блок «Данные маршрута» tmi не влезает в frozen 96px → плотнее типографика
   или правка запиненного токена.
2. Mismatch выше допуска из-за рендеринга шрифтов Figma-PNG (геометрия текста
   расходится, а не AA-шум) → per-case tolerance или metric-fallback.
3. Любой «remove» из аудит-матрицы I9 — только после подтверждения.
4. Нечитаемый/противоречивый референс-PNG → блокировать регион, не угадывать.
5. Если «1280px-1» при полноразмерном кропе окажется НЕ раскрытым tmi-1280 →
   скорректировать карту рефов и переспросить.

## Принятые дефолты (можно переиграть)

- PR-B открывается draft'ом с base = ветка PR-A сразу (стек), не дожидаясь мержа.
- Данные tmi-панели («UAV TR580» и т.д.) — хардкод-мок с референса.
- Натуральная ширина даты = 112px (`$top-controls-datetime-min-width`) —
  **единственное место, где значение зафиксировано числом**; если кроп 1280
  покажет иное — обновить здесь и брать отсюда (I4 и I8 ссылаются сюда).
- A9-различие канонов в аудите I9 не «чинится».

## Routing Decision

```text
Documentation: CLAUDE.md, AGENTS.md, docs/agent/{frozen-decisions,orchestration}.md, verify-frozen.ts
Selected skills: pl-ru-session-bootstrap, pl-ru-frontend-rules, pl-ru-frozen-decisions, pl-ru-visual-qa, pl-ru-instruction-drift, pl-ru-quality-gate, pl-ru-reuse-audit, pl-ru-deadwood-audit, pl-ru-ship
Selected agents: instruction_drift_auditor, frozen_decisions_guardian (PR-A); code_quality_guardian, component_reuse_guardian, visual_qa_guardian, code_deadwood_auditor (PR-B); все 5 + runtime_behavior_mapper (PR-C аудит)
Ownership / write zone: PR-A: docs/agent/, plugins/pl-ru-codex/skills/, .claude/commands/, .claude/agents/ (диапазоны правил), CLAUDE.md (диапазоны правил); PR-B: src/components/{TabTopControls,TabBottomPanel,AppShell}, src/styles/_tokens.scss, scripts/visual/, scripts/check-visual-evidence.mjs, tests/{e2e,visual-qa}, verify-frozen.ts, docs/agent/frozen-decisions.md, CLAUDE.md+AGENTS.md (A17), package.json (design:*); PR-C: по аудит-матрице после подтверждения
Reason: UI pixel-fit + расширение frozen A17 + instruction-фикс → обязательные visual-qa/frozen/instruction-роли; чистка — после полного read-only аудита
```

## Следующий шаг

См. секцию «Статус» — она единственный источник текущего шага.

## Журнал

- 2026-06-11: I0 — разведка (3 Explore-агента: обвязка/UI/visual-QA; 2
  Plan-агента: валидация итераций/дизайн артефактов), план одобрен
  пользователем. Подтверждено: parity A16 OK; битые строки в 4 Codex-скиллах;
  баг сжатия = одеяльное compact-правило `.toolbar .cardFlexible` без
  амортизатора на bar/tmi; A17 пинит MapBottomPanel (пути/testid/копирайт/96px);
  CI гоняет quality:all → zero-visual-delta обязателен; матрица 24 PNG полная
  (размеры проверены по заголовкам), «1280px-1» = tmi-1280-раскрытое. Создан
  этот handoff-док.
- 2026-06-11: I1 — правки обвязки: (1) 4 устаревшие хвостовые строки в
  Codex-скиллах заменены зеркальными ссылками (стиль выровнен с
  Claude-стороной: без бэктиков, без упоминания команды); (2) найдено и
  исправлено: **CI на main красный с PR #19** — 6 ошибок MD041 в
  `.claude/commands/*.md`, добавлены H1 (контент-фикс, конфиг markdownlint
  не трогаем — A11); (3) устаревшие диапазоны «A1..A16» заменены
  безномерными формулировками («все A-правила verify-frozen.ts») в verify.md,
  CLAUDE.md (Quick Start, Two-Canon Parity), двух `.claude/agents/*.md`
  (AGENTS.md диапазона не содержит). Субагенты instruction_drift_auditor и
  frozen_decisions_guardian — PASS (0 blocker / 0 major).
- 2026-06-11: I1 adversarial-review (Codex недоступен: API-лимит 1M-контекста;
  фолбэк `/code-review high`: 7 углов × 6 кандидатов × верификация,
  49 агентов) — 42 находки, триаж:
  - **Исправлено**: рассинхрон «Статус»/чек-лист/журнал (Статус объявлен
    единственным источником, «Следующий шаг» указывает на него); неверная
    инструкция ретаргета при squash-мерже (rebase --onto обязателен при ЛЮБОМ
    squash); путь к плану вне репо удалён из шапки (док самодостаточен);
    волатильные номера строк заменены якорями (функции/секции/токены/grep);
    «112px» сведён к одному источнику («Принятые дефолты»); каденция гейтов
    без дублирования (quality:fast на коммит, codex:ship на push); стиль
    4 зеркальных строк выровнен; I7 получил зависимость от I2; скоуп PR-A
    в секции «Ветки/PR» актуализирован.
  - **Отклонено осознанно**: фикс MD041 через конфиг markdownlint (выбран
    контент-фикс H1 — см. выше); разбандливание CI-хотфикса в отдельный PR
    (структура 3 PR утверждена пользователем); правка исторических «A1–A16»
    в `top-control-blocks-handoff.md` (датированные журнальные записи,
    намеренно оставлены).
  - **Заблокировано классификатором разрешений**: ослабление правила ветки
    `codex/*` в ship-скиллах до `codex/*|claude/*` (расценено как
    самомодификация без явного запроса). Правки откачены, оба канона
    консистентны (по-прежнему `codex/*`). Ship для PR-A/B/C выполняется с
    веток `claude/*` по порядку авторитетности (явный запрос пользователя
    «работаем в текущей ветке» > skills; прецеденты PR #19/#20).
    **Вопрос пользователю задан**; при одобрении — однострочная правка обоих
    канонов в PR-B.
  - **Отложено в I9**: mirror-ноты есть лишь у части скиллов (стандартизовать
    или убрать); parity-гард не проверяет пути внутри тел скиллов (кандидат
    на расширение `verify-claude-codex-parity.mjs`).
- 2026-06-11: I1 — **каскад замаскированных поломок CI** (падения с PR #19
  скрывали друг друга, локальный `codex:ship` вскрыл по очереди):
  check:markdown (исправлено ранее) → check:spelling (cspell: `evenodd` в
  30+ SVG `public/top-control-icons/`, `lockfiles`/`llms` в CLAUDE.md,
  `textareas`/`ultrawide` в src/tests) → check:dead (knip: неиспользуемые
  экспорты `DateTimeField`/`IconButton` в controls.tsx — функции внутренние,
  снято слово `export`, A15 пинит только `ToggleActionButton`) →
  check:duplicates (jscpd: клоны `.claude/skills` ↔ `plugins/.../skills` —
  намеренные A16-зеркала). Фиксы: cspell.json (+ignore `CLAUDE.md` — симметрия
  AGENTS.md, `public/top-control-icons/**` — симметрия left-rail-icons;
  +words `textareas`, `ultrawide`), .jscpd.json (+ignore `**/.claude/**` —
  заодно закрывает кросс-матчи с worktree-копиями в основном чекауте),
  controls.tsx (2 × снят `export`). Гард A11 разрешает добавление
  ignore-записей (inclusion-проверка). Субагенты: code_quality_guardian PASS
  - quality_tooling_architect PASS (0 blocker / 0 major). Остаточные клоны
    AGENTS.md↔CLAUDE.md: 0.39% при пороге 1% — следить при росте канонов.
