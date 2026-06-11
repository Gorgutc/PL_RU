# Хэндофф: пиксельная подгонка 3 табов под эталонные референсы + аудит кода

> Живой документ: ТЗ + журнал прогресса. Обновлять после каждого чекпойнта/итерации.
> Любая сессия (Claude или Codex) может продолжить работу отсюда.
> Полный план: `C:\Users\Junior\.claude\plans\pure-discovering-lerdorf.md` (вне репо).

## Статус

- Ветка PR-A: `claude/brave-lalande-1a4cfa` (от `main` = `efb68fe`).
- Статус: **I0 — handoff-док создан**. Далее I1 (фикс 4 строк скиллов) → draft PR-A.
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
- **Frozen**: `verify-frozen.ts` (A17 ≈ :1530–1689, A15 ≈ :1500–1528),
  `docs/agent/frozen-decisions.md` (Top Control Blocks :203–256, Workspace
  Responsive + Bottom Panel :258–301), `src/styles/_tokens.scss`.
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
   (handoff-док + фикс 4 строк скиллов). Мерж — за пользователем.
2. **PR-B** — `claude/tabs-pixel-fit` от головы PR-A → draft PR с base =
   ветка PR-A. После мержа PR-A с удалением ветки GitHub авто-ретаргетит PR-B на
   `main`; при squash-мерже без удаления ветки — вручную: retarget PR-B на
   `main` + `git rebase --onto origin/main <старая-голова-PR-A> claude/tabs-pixel-fit`.
3. **PR-C** — `claude/repo-audit-cleanup` от головы PR-B, аналогично.

## Чек-лист итераций

Каждая итерация = чекпойнт: изменения → целевые субагенты → гейты → запись в
журнал → коммит. `pnpm verify` зелёный после каждого коммита; `pnpm codex:ship`
перед каждым push; полный проход 5 обязательных субагентов + adversarial-review
— на финализацию каждого PR.

### PR-A — инфра-фикс

- [x] **I0**: bootstrap + этот handoff-док. Гейты: verify, quality:fast.
- [ ] **I1**: фикс 4 строк скиллов (только Codex-сторона):
      `plugins/pl-ru-codex/skills/pl-ru-context-keeper/SKILL.md:17`,
      `pl-ru-quality-gate/SKILL.md:55`, `pl-ru-spec-guardian/SKILL.md:45`
      (битые ссылки на несуществующие `.claude/agents/ts-*.md`),
      `pl-ru-ship/SKILL.md:58` («replaces» → «mirrors», файл
      `.claude/commands/ship.md` существует). Claude-зеркала чистые. A9-различие
      канонов («session memory» vs «Codex Memories») — намеренное, не трогать.
      Субагенты: instruction_drift_auditor + frozen_decisions_guardian.
      Adversarial-review диффа. Гейты: verify (A16) → quality:fast → codex:ship →
      push → draft PR-A.

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
      `map-bottom-panel` → `tab-bottom-panel` + `data-tab`; `AppShell.tsx:65`;
      каталог MapBottomPanel удалить. Атомарно в том же коммите:
      `verify-frozen.ts:1555–1689` (пути, `<TabBottomPanel`, testid, негативная
      проверка отсутствия MapBottomPanel, сниппет в wsSpec-проверке, заголовок
      секции frozen-decisions, record-строка A17), `frozen-decisions.md:258–301`,
      A17-формулировка в `CLAUDE.md` + `AGENTS.md`, `workspace-shell.spec.ts`
      (:649, :859, :863, :883), упоминания в `latest.json`. Гард на ещё не
      существующий responsive-matrix.spec НЕ добавлять (добавит I8). Критерий:
      `check:visual` 0 mismatch по 7 существующим 1920-baselines.
      Субагенты: frozen_decisions_guardian + instruction_drift_auditor +
      code_quality_guardian.
- [ ] **I4**: фикс бага сжатия (только compact <1920): одеяльное
      `.toolbar .cardFlexible {flex:0 0 auto}` (:382–384) → адресный
      `.cardCompactIntrinsic` (проп `compactIntrinsic`, ставит только дата-карточка
      map); `.dateField` в compact = натуральные 112px
      (`$top-controls-datetime-min-width`); токен `-compact` (80px) удалить (не
      запинен — проверено); bar: резина = поиск (новый токен
      `$top-controls-search-min-width-compact`, не пинить в A17); tmi: дата
      остаётся flexible (фолд селектов — I6). Проза compact band в
      `frozen-decisions.md:267–278` (per-tab absorbers + natural-width date);
      A15-сниппеты сохраняются. Верификация кропами 1280/1440.
      Субагенты: visual_qa_guardian + frozen_decisions_guardian.
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
      ($workspace-bottom-panel-height запинен :1538). Перезахват
      `telemetry-rail-expanded-1920x1080.reference.png` + latest.json + e2e.
      Субагенты: visual_qa_guardian + component_reuse_guardian.
- [ ] **I7**: сверка map по 8 новым рефам (design:check chrome-регионы);
      map-baselines перезахват только при реальной дельте, отдельным коммитом.
      Субагент: visual_qa_guardian.
- [ ] **I8**: `tests/e2e/helpers/workspace.ts` + `responsive-matrix.spec.ts`
      (ширины `[1366,1440,1600,1680,1919,1920,2048,2559,2560,2561,2880,3200,3440]`
      × 3 таба × 2 rail; инварианты: геометрия chrome, карта full-bleed, «natural
      date width» (<1920 ровно 112px), нет h-скролла/клиппинга, граничное
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

- **Zero-visual-delta**: CI (`.github/workflows/ci.yml:43` → `pnpm quality:all`)
  гоняет check:visual на каждом PR; промежуточные коммиты не должны менять
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
- Натуральная ширина даты = 112px; если кроп 1280 покажет иное — значение с кропа.
- A9-различие канонов в аудите I9 не «чинится».

## Routing Decision

```text
Documentation: CLAUDE.md, AGENTS.md, docs/agent/{frozen-decisions,orchestration}.md, verify-frozen.ts
Selected skills: pl-ru-session-bootstrap, pl-ru-frontend-rules, pl-ru-frozen-decisions, pl-ru-visual-qa, pl-ru-instruction-drift, pl-ru-quality-gate, pl-ru-reuse-audit, pl-ru-deadwood-audit, pl-ru-ship
Selected agents: instruction_drift_auditor, frozen_decisions_guardian (PR-A); code_quality_guardian, component_reuse_guardian, visual_qa_guardian, code_deadwood_auditor (PR-B); все 5 + runtime_behavior_mapper (PR-C аудит)
Ownership / write zone: PR-A: docs/agent/, plugins/pl-ru-codex/skills/; PR-B: src/components/{TabTopControls,TabBottomPanel,AppShell}, src/styles/_tokens.scss, scripts/visual/, scripts/check-visual-evidence.mjs, tests/{e2e,visual-qa}, verify-frozen.ts, docs/agent/frozen-decisions.md, CLAUDE.md+AGENTS.md (A17), package.json (design:*); PR-C: по аудит-матрице после подтверждения
Reason: UI pixel-fit + расширение frozen A17 + instruction-фикс → обязательные visual-qa/frozen/instruction-роли; чистка — после полного read-only аудита
```

## Следующий шаг

I1: фикс 4 строк скиллов → субагенты → adversarial-review → гейты → push →
draft PR-A. Затем ветка `claude/tabs-pixel-fit` и I2.

## Журнал

- 2026-06-11: I0 — разведка (3 Explore-агента: обвязка/UI/visual-QA; 2
  Plan-агента: валидация итераций/дизайн артефактов), план одобрен
  пользователем. Подтверждено: parity A16 OK; битые строки в 4 Codex-скиллах;
  баг сжатия = одеяльное compact-правило `.toolbar .cardFlexible` без
  амортизатора на bar/tmi; A17 пинит MapBottomPanel (пути/testid/копирайт/96px);
  CI гоняет quality:all → zero-visual-delta обязателен; матрица 24 PNG полная
  (размеры проверены по заголовкам), «1280px-1» = tmi-1280-раскрытое. Создан
  этот handoff-док.
