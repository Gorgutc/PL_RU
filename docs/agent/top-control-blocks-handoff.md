# Хэндофф: Верхние блоки управления по табам (TabTopControls)

> Живой документ: ТЗ + журнал прогресса. Обновлять после каждого чекпойнта/таба.
> Любая сессия (Claude или Codex) может продолжить работу отсюда.
> Полный план: `C:\Users\Maxim\.claude\plans\keen-roaming-tome.md` (вне репо).

## Статус

- Ветка: `claude/clever-yonath-905880` (отдельная feature-ветка).
- Текущий этап: **Этап 6 — гейты/доставка**. Готово: обвязка, примитивы, интеграция, блоки `bar/stats/kick/tmi/sat`, Codex-ревью №1 + фиксы, A15/A16, e2e 6/6. Осталось: `map` иконки (ждём SVG), pixel visual-QA, `codex:ship`, push + draft PR.
- Коммиты Этапа 0: `b4576b0` (обвязка), `e6d0db0` (handoff).
- Последнее обновление: 2026-06-07.

## ТЗ (бриф задачи)

Сделать для **каждого таба** свой **верхний блок управления** — горизонтальную
панель управления над картой. Функциональность берём из **Blueprint**, внешний
вид и логику — из **нашего дизайна в Figma**. Не нарушать ни одного frozen-решения.
Дополнительно (просьба пользователя): проверять, что блоки **корректно сжимаются**
при открытом/закрытом левом боковом меню.

## Подтверждённые решения

1. **Размещение**: верхняя панель внутри правой (карточной) колонки, над картой;
   левый рейл/панель сохраняют полную высоту; «Тип данных» закреплён справа;
   переполнение → горизонтальный скролл внутри панели. Меняется только высота
   карты (обрабатывает существующий ResizeObserver).
2. **Поведение**: презентационное + локальное UI-состояние (без бэкенда данных).
3. **Claude-обвязка**: полное дублирование — два равноценных канона (Claude `.claude/`
   - `CLAUDE.md` и Codex `.codex/`/`plugins`/`AGENTS.md`); синхронность держит
     parity-guard A16.
4. **Референс**: per-tab PNG как пиксельные референсы (копировать нужные в
   `tests/visual-qa/top-control/`); полноэкранный «эталон общего вида» отложен
   (Drive 1ulYHds… недоступен, connector 403).

## Источники истины

- **Figma PNG + code.md**: `C:\Users\Maxim\Desktop\Work\Верхние блоки управления\`
  (локально синхронизировано; в репо НЕ коммитить сырьё — только нужные референсы
  в `tests/visual-qa/top-control/`).
- **Blueprints**: `plugins/pl-ru-codex/skills/blueprint-design/` (README + colors_and_type.css).
  Ссылка `api.anthropic.com/v1/design/h/…` отдаёт 404 — используем вшитую копию.
- **Frozen**: `docs/agent/frozen-decisions.md`, `verify-frozen.ts`, `src/styles/_tokens.scss`.
- **App**: `src/components/{Header,AppShell,TabSidePanel,WorkspaceMap,AppNavigation}`.
- **Drive connector**: сейчас 403 (не авторизован). Per-tab контент доступен локально.

## Карта табов и блоков (id из `src/components/Header/Header.tsx`)

| id      | подпись           | Figma-файлы            | контент блока                                                                                                                |
| ------- | ----------------- | ---------------------- | ---------------------------------------------------------------------------------------------------------------------------- |
| `map`   | Оперативная карта | `Оперативная карта_*`  | дата/время • группы иконок (Инфраструктура/Наложения/Борты/Слои карты + 2 тумблера) • Тип данных (Оперативная/Анализ данных) |
| `bar`   | Маршруты          | `маршруты_*`           | поиск • дата/время • Погодные параметры (3 сег.) • Тип данных (Цели/Маршруты/Имитация)                                       |
| `tmi`   | Телеметрия        | `Телеметрия_*`         | дата/время + «Загрузить маршруты» • 6 дропдаунов • Тип данных (Телеметрия/Полетные задания)                                  |
| `sat`   | Зондирование      | `Зондирование_*`       | Временной диапазон • Источники данных (свитчи) • «Создать анимацию…» • Тип данных (2D/3D/Гистограмма)                        |
| `kick`  | Введение пусков   | `введение пусков_*`    | поиск • Фильтры • Пользователи ▾ • Итог есть ▾ • дата/время • Тип данных (Шаблоны/Активные(3)/История)                       |
| `stats` | Статистика        | `статистика_таблица_*` | поиск • Фильтры • Пользователи ▾ • Активность Борща ▾ • дата/время • Тип данных (Таблица/Статистика/Анализ данных)           |

Размеры из Figma уже совпадают с frozen-токенами: карточка-секция `#171d20` /
рамка `#727677` / радиус `2px` / паддинг `16px`; инпут `30px` / радиус `3px` /
рамка `#666`; сегмент активный `#2970ff` / `24px`; заголовок `12px`(=0.75rem).

## Архитектура (план)

- `src/components/TabTopControls/TabTopControls.tsx` — диспетчер по `activeTab` +
  оболочка `role="toolbar"` (горизонтальный скролл, «Тип данных» справа).
- Примитивы (в той же папке): `LabeledGroup`, `SegmentedControl`,
  `DateTimeRangeField` (вынести/переиспользовать из `TabSidePanel`),
  `ControlSearchField`, `ControlSelect` (HTMLSelect), `SwitchRow`, action-кнопки.
- Блоки: `MapTopControls`, `RoutesTopControls`, `TelemetryTopControls`,
  `SatTopControls`, `KickTopControls`, `StatsTopControls`.
- Интеграция: `AppShell.tsx` — правая колонка `.workspaceColumn` (flex-column):
  `TabTopControls` над `WorkspaceMap` (карта `flex:1; min-height:0`).
- Токены: добавить только новое в `_tokens.scss` (`// Top control blocks`).

## Чек-лист

### Этап 0 — Claude-обвязка (два канона)

- [x] `.claude/skills/*` (15) — зеркало Codex SKILL.md, адаптировано под Claude
- [x] `.claude/agents/*` (10) — из `.codex/agents/*.toml`
- [x] `.claude/commands/*` (6): bootstrap, verify, visual-qa, orchestrate, ship, adversarial-review
- [x] `.claude/hooks/*` (3): README, session-start, user-prompt-submit
- [x] `CLAUDE.md` — полноценная конституция (co-canon)
- [x] `AGENTS.md` — authority order = два канона; добавлены A15/A16
- [x] `scripts/verify-claude-codex-parity.mjs` + правило A16 в `verify-frozen.ts`
- [x] parity-guard PASS (15 skills, 10 agents, hooks+constitutions)
- [~] `.claude/settings.json` — ПРОПУЩЕН (классификатор не дал расширять права; пользователь добавит сам через /update-config)
- [x] `pnpm verify:static` PASS — 15/15 (incl. A16)
- [x] коммит Этапа 0 (`b4576b0`) + handoff (`e6d0db0`)

### Этап 2 — примитивы + токены ✓

- [x] `controls.tsx`: ControlCard, ControlField, SegmentedControl, DateTimeRange/DateTimeField, SearchField, SelectField, SwitchToggle, PrimaryActionButton, ChipButton
- [x] новые токены в `_tokens.scss` + общий `src/lib/cx.ts`
- [x] presentational date/time (без `datetime-local` overlay панели) → нет дубля с TabSidePanel (jscpd threshold 1%)

### Этап 3 — интеграция AppShell + диспетчер ✓

- [x] `.workspaceColumn` (flex-column) + `TabTopControls` над картой; карта `flex:1`
- [x] метрики 1920: toolbar `x=50 / y=48 / h=98`, карта заполняет остаток; map resize-контракт не нарушен

### Этап 4 — блоки табов (от простого к сложному)

- [x] `bar` (Маршруты) — метрики совпали с figma (card #171d20/2px/16px, search 256×30, segment 24/#2970ff)
- [x] `stats` (Статистика)
- [x] `kick` (Введение пусков)
- [x] `tmi` (Телеметрия)
- [x] `sat` (Зондирование) — свитчи источников данных
- [x] `map` (Оперативная карта) — datetime + Тип данных + 4 иконочные группы (Инфраструктура 11 / Наложения 8 / Борты 4 / Слои карты 9 + 2 тумблера) на SVG-манифесте `public/top-control-icons/` (`mapIcons.ts`), 32 SVG от пользователя; e2e map-группы PASS. Слои карты = MapLayers 1:1; распределение глифов в Инфра/Наложения/Борты уточнимо в манифесте.
- [~] visual-QA: DOM/CSS-метрики PASS на 1920, нет console errors; pixel-сравнение с PNG + состояния рейла — TODO

### Этап 5/6 — фиксация + гейты

- [x] раздел «Top Control Blocks» в frozen-decisions.md + активная проверка A15 в verify-frozen.ts (verify:static 16/16 PASS)
- [x] `tests/e2e/top-controls.spec.ts` — 6/6 PASS (наличие блока над картой, контролы по табам, сегмент radiogroup, сжатие при open/closed без page-scroll, panel-табы 300px, no console errors)
- [ ] pixel visual-QA: `tests/visual-qa/top-control/` референсы + кейсы в `latest.json` + `pnpm check:visual`
- [ ] `pnpm verify` / `pnpm codex:ship` (финальный гейт перед PR)

### Этап 7/8 — ревью и доставка

- [x] состязательное ревью №1 (Codex) — пройдено, находки исправлены (см. Журнал); финальное ревью — перед PR
- [ ] коммит / push / draft PR; финальное резюме

## Routing Decision (Этап 0)

```text
Documentation: AGENTS.md, CLAUDE.md, docs/agent/{orchestration,frozen-decisions}.md, .codex/{config.toml,agents,hooks}
Selected skills: pl-ru-instruction-drift, pl-ru-frozen-decisions, pl-ru-session-bootstrap (зеркалирование)
Selected agents: instruction_drift_auditor, codex_infra_architect, frozen_decisions_guardian (для финального ревью обвязки)
Catalog candidates: none — внутренняя инфраструктура обвязки
Reason: дублирование обвязки = instruction/skill/hook изменение → требует frozen/instruction-drift контроля; parity-guard A16 фиксирует синхронность двух канонов
```

## Следующий шаг

Все 6 блоков реализованы (map-иконки — на SVG-манифесте `public/top-control-icons/`,
а не Blueprint `<Icon>`). Codex-ревью №1 и №2 пройдены, находки исправлены.
Осталось:

1. Pixel visual-QA baseline для top-control: cases в `tests/visual-qa/latest.json` +
   референсы в `tests/visual-qa/top-control/` (capture скриншоты по табам/состояниям) →
   `pnpm check:visual`.
2. `pnpm codex:ship` (полный гейт) перед доставкой.
3. push + draft PR в `main` (после подтверждения пользователя).
4. Опц.: сверить распределение глифов в Инфра/Наложения/Борты с эталоном (правится в `mapIcons.ts`).

## Журнал

- 2026-06-07: Этап 0 — создана `.claude/` обвязка (15 skills, 10 agents, 6 commands, 3 hooks), CLAUDE.md-конституция, AGENTS.md обновлён (A15/A16), parity-guard A16 (PASS). settings.json пропущен по решению классификатора/пользователя.
- 2026-06-07: Этапы 2–4 (частично) — примитивы `controls.tsx` + токены + `src/lib/cx.ts`; интеграция `AppShell` (`.workspaceColumn`); блоки `bar/stats/kick/tmi/sat` готовы, `map` частично (без иконочных групп). typecheck/eslint/stylelint/`pnpm verify` (B1–B6 + A16) PASS; A5 фикс (hex в комментариях). DOM/CSS-метрики на 1920 совпадают с figma; нет console errors. Коммит `2e3acea`.
- 2026-06-07: `map` иконочные группы реализованы из присланных SVG (32 файла → `public/top-control-icons/`, манифест `mapIcons.ts`, примитивы IconButton/IconButtonGroup/LayerToggle). Структура совпала с figma (11/8/4/9+2 тумблера), все SVG загружены, e2e 7/7, verify:static 16/16. Drive-коннектор всё ещё 403 — SVG взяты из локальной синхронизации `Desktop\Work\...\SVG`.
- 2026-06-07: e2e `tests/e2e/top-controls.spec.ts` — 6/6 PASS (включая сжатие при открытом/закрытом меню; tab-switch race поправлен ожиданием 220ms motion). Коммит `5ff2dd4`.
- 2026-06-07: Codex adversarial review №1 — 3 blocker / 3 major / 2 minor. Исправлено: A15 enforced (verify-frozen + раздел frozen-decisions), parity-guard (commands check + fail-closed на пустых корнях), `.codex/config.toml` authority order (два канона), `SegmentedControl` → Blueprint (a11y radiogroup + reuse; стилизация под figma 30/24/#2970ff подтверждена метриками), raw sizing → токены (`$top-controls-card-gap`/`-inline-pad`), cx-дубль убран (`AppShell`/`TabSidePanel` → `@/lib/cx`), dead CSS убран. typecheck + verify:static 16/16 PASS. `map` icon-группы — accepted defer (ждём SVG от пользователя).
- 2026-06-07: Codex adversarial review №2 — 4 blocker / 5 major / 1 minor. Исправлено: регрессия `workspace-shell.spec` (карта теперь под тулбаром — высота относительно `tab-top-controls`); `IconButton` → Blueprint `Button` + локальный `pressed`/`aria-pressed`; скопированы подпапки skills (`agents/`+`references/`) для всех не-design канонов (frontend-rules references больше не битые); дубль `MapLayersField` свёрнут в `IconButtonGroup` с `trailing`; authority order в `session-bootstrap` обоих канонов; A15 усилен (mapIcons/public/Blueprint); e2e усилен (aria-label icon-кнопок + map compression); handoff актуализирован. typecheck/stylelint/lint PASS, verify:static 16/16, e2e 7/7 + workspace-shell PASS.
