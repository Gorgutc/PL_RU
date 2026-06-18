// cspell:disable
'use client';

import { Button, Icon, Popover, PopoverInteractionKind } from '@blueprintjs/core';
import { useState } from 'react';
import type { HeaderTabId } from '@/components/Header/Header';
import {
  ChipButton,
  ControlCard,
  ControlField,
  DateTimeRange,
  PrimaryActionButton,
  SelectField,
  SwitchToggle,
} from '@/components/TabTopControls/controls';
import { cx } from '@/lib/cx';
import styles from './TabBottomPanel.module.scss';

/**
 * Per-tab bottom panel dispatcher (sibling of MapBottomPanel).
 *
 * The map tab keeps its own frozen `MapBottomPanel` (A17). This component renders
 * the footer strips the reference shows on the OTHER tabs, reusing the same frozen
 * control-surface primitives (ControlCard / ControlField / SwitchToggle / ChipButton)
 * so every footer shares the dark card-surface contract. Presentational + local UI
 * state only (no backend), like TabTopControls. It only changes the map's available
 * height; the right-anchored map stage contract stays untouched.
 *
 * RainbowLegend mirrors the cloud-base legend look (shared `$gradient-cloud-legend`
 * token) for the "Высота по барометру" blocks; MapBottomPanel keeps its own inline
 * legend because it is frozen (A17) — a later task can migrate both onto this shared
 * RainbowLegend once that contract is re-opened.
 */

// Shared "Высота по барометру" / cloud-style rainbow legend (flexible middle block).
function RainbowLegend({
  title,
  unit,
  ticks,
  testId,
}: {
  title: string;
  unit?: string;
  ticks: readonly string[];
  testId?: string;
}) {
  return (
    <div className={styles.legend} data-testid={testId}>
      <div className={styles.legendHeader}>
        <span className={styles.legendTitle}>{title}</span>
        {unit ? <span className={styles.legendUnit}>{unit}</span> : null}
      </div>
      <div aria-hidden="true" className={styles.legendBar} />
      <div className={styles.legendTicks}>
        {ticks.map((tick) => (
          <span key={tick}>{tick}</span>
        ))}
      </div>
    </div>
  );
}

const BAROMETRIC_TICKS = ['0', '500', '1000', '1500', '2000', '3000', '4000', '5000'] as const;

// "Высота по барометру" legend card — shared by bar and tmi (identical content).
function BarometricLegendCard() {
  return (
    <ControlCard ariaLabel="Высота по барометру" flexible>
      <RainbowLegend
        testId="tab-bottom-panel-legend"
        ticks={BAROMETRIC_TICKS}
        title="Высота по барометру"
        unit="(м)"
      />
    </ControlCard>
  );
}

// ── bar: Маршруты ───────────────────────────────────────────────────────────────
const ROUTES_FILTERS = [
  'Включить угрозы',
  'РЭБ угрозы',
  'Карта ЛБС',
  'Пусковые точки',
  'Номера точек',
  'Номера',
] as const;
// Below 1920 only the first few toggles stay inline; the rest fold into the chevron.
const COMPACT_VISIBLE_FILTERS = 3;
// Table/sat footers keep at most 4 toggles inline even at 1920 (the 5th always
// folds into the chevron) so the data-management card never clips at the edge.
const WIDE_VISIBLE_FILTERS = 4;

// Overflow chevron: opens a Blueprint Popover holding the full filter set as
// real switches, so the toggles hidden inline (display:none below 1920, or the
// 5th toggle on wide table/sat footers) stay reachable by mouse, keyboard, and
// screen readers — the chevron is no longer a dead button.
function FilterOverflowMenu({
  filters,
  ariaLabel,
}: {
  filters: readonly string[];
  ariaLabel: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <Popover
      content={
        <div aria-label={`${ariaLabel} — все`} className={styles.filterMenu} role="group">
          {filters.map((label) => (
            <SwitchToggle defaultChecked key={label} label={label} />
          ))}
        </div>
      }
      interactionKind={PopoverInteractionKind.CLICK}
      isOpen={open}
      minimal
      onInteraction={setOpen}
      placement="bottom-end"
      popoverClassName={styles.filterMenuPopover}
    >
      <Button
        active={open}
        aria-expanded={open}
        aria-haspopup="menu"
        aria-label="Ещё фильтры"
        className={styles.overflowChevron}
        icon={<Icon icon="chevron-down" size={16} />}
        title="Ещё фильтры"
        type="button"
        variant="minimal"
      />
    </Popover>
  );
}

// Shared filter-toggle card: a titled row of switches that folds extras into an
// overflow chevron. `wide` (table/sat) keeps 4 inline at 1920 and always shows
// the chevron; the default (bar) shows all at >=1920 and folds to 3 below 1920.
function FilterToggleCard({
  title,
  ariaLabel,
  filters,
  wide = false,
}: {
  title: string;
  ariaLabel: string;
  filters: readonly string[];
  wide?: boolean;
}) {
  return (
    <ControlCard ariaLabel={ariaLabel}>
      <ControlField title={title}>
        {filters.map((label, index) => (
          <span
            key={label}
            className={cx(
              wide && index >= WIDE_VISIBLE_FILTERS && styles.filterWideExtra,
              wide
                ? index === WIDE_VISIBLE_FILTERS - 1 && styles.filterExtra
                : index >= COMPACT_VISIBLE_FILTERS && styles.filterExtra,
            )}
          >
            <SwitchToggle defaultChecked label={label} />
          </span>
        ))}
        <span className={wide ? styles.filterWideOverflow : styles.filterOverflow}>
          <FilterOverflowMenu ariaLabel={ariaLabel} filters={filters} />
        </span>
      </ControlField>
    </ControlCard>
  );
}

function RoutesBottomPanel() {
  return (
    <section
      aria-label="Нижняя панель: маршруты"
      className={styles.panel}
      data-testid="tab-bottom-panel"
    >
      <FilterToggleCard
        ariaLabel="Фильтрация на карте"
        filters={ROUTES_FILTERS}
        title="Фильтрация на карте"
      />

      <ControlCard ariaLabel="Настройки карты">
        <ControlField title="Настройки карты">
          <SelectField
            ariaLabel="Режим карты"
            options={['Контурность карты']}
            value="Контурность карты"
          />
        </ControlField>
      </ControlCard>

      <BarometricLegendCard />

      <ControlCard ariaLabel="Управление данными">
        <ControlField dense title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Загрузить свои цели
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Скачать все цели
          </ChipButton>
        </ControlField>
      </ControlCard>
    </section>
  );
}

// ── tmi: Телеметрия ──────────────────────────────────────────────────────────────
const TELEMETRY_ROUTE_DATA: readonly { term: string; value: string }[] = [
  { term: 'Борт:', value: 'ЫЫ 75560' },
  { term: 'Время сообщений:', value: 'с 2026-03-05 | 21:54:38   до 2026-03-05 | 22:02:37' },
  { term: 'Начало полета:', value: '21:49:47' },
  { term: 'Конец полета:', value: '22:02:15' },
  { term: 'Время полета:', value: '23:59:45' },
  { term: 'Дальность полета:', value: '-0.5 км' },
  { term: 'Вилка:', value: 'undefined' },
  { term: 'БЧ:', value: 'undefined' },
];

function TelemetryBottomPanel() {
  return (
    <section
      aria-label="Нижняя панель: телеметрия"
      className={styles.panel}
      data-testid="tab-bottom-panel"
    >
      <ControlCard ariaLabel="Данные маршрута" flexible>
        <div className={styles.routeData}>
          <span className={styles.routeDataTitle}>Данные маршрута: ЫЫ 75560</span>
          <dl className={styles.routeGrid}>
            {TELEMETRY_ROUTE_DATA.map((row) => (
              <div className={styles.routeRow} key={row.term}>
                <dt className={styles.routeTerm}>{row.term}</dt>
                <dd className={styles.routeValue}>{row.value}</dd>
              </div>
            ))}
          </dl>
        </div>
      </ControlCard>

      <ControlCard ariaLabel="Добавить данные">
        <ControlField title="Добавить данные">
          <PrimaryActionButton icon="flows">ПЗ</PrimaryActionButton>
        </ControlField>
      </ControlCard>

      <BarometricLegendCard />

      <ControlCard ariaLabel="Управление данными">
        <ControlField dense title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Загрузить данные
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Скачать PDF
          </ChipButton>
        </ControlField>
      </ControlCard>
    </section>
  );
}

// ── Shared table-tab footer (kick / stats) ───────────────────────────────────
// "Дополнительная фильтрация" toggles + "Настройки таблицы" actions + "Управление
// данными". kick and stats differ only in the last filter label, the last table
// action, and the download label, so they share one presentational builder.
function TableBottomPanel({
  filters,
  tableActions,
  testLabel,
}: {
  filters: readonly string[];
  tableActions: readonly { label: string; icon: 'grid-view' | 'timeline-line-chart' }[];
  testLabel: string;
}) {
  return (
    <section aria-label={testLabel} className={styles.panel} data-testid="tab-bottom-panel">
      <FilterToggleCard
        ariaLabel="Дополнительная фильтрация"
        filters={filters}
        title="Дополнительная фильтрация"
        wide
      />

      <ControlCard ariaLabel="Настройки таблицы">
        <ControlField dense title="Настройки таблицы">
          {tableActions.map((action) => (
            <ChipButton icon={action.icon} key={action.label}>
              {action.label}
            </ChipButton>
          ))}
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Управление данными">
        <ControlField dense title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Загрузить свои данные
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Скачать Excel
          </ChipButton>
        </ControlField>
      </ControlCard>
    </section>
  );
}

const KICK_FILTERS = [
  'Дубликаты',
  'Удаленные',
  'Несоответствие данных',
  'Вкл. отсутствующие',
  'Включить только отредактированные',
] as const;
const KICK_TABLE_ACTIONS = [
  { label: 'Настройка колонок', icon: 'grid-view' },
  { label: 'Тип данных', icon: 'grid-view' },
  { label: 'Формат ячеек', icon: 'grid-view' },
] as const;

const STATS_FILTERS = [
  'Дубликаты',
  'Удаленные',
  'Несоответствие данных',
  'Вкл. отсутствующие',
  'Только отредактированные',
] as const;
const STATS_TABLE_ACTIONS = [
  { label: 'Настройка колонок', icon: 'grid-view' },
  { label: 'Тип данных', icon: 'grid-view' },
  { label: 'Включить график', icon: 'timeline-line-chart' },
] as const;

// ── sat: Зондирование ─────────────────────────────────────────────────────────
const SAT_FILTERS = [
  'Дубликаты',
  'Удаленные',
  'Несоответствие данных',
  'Вкл. отсутствующие',
  'Включить только отредактированные',
] as const;

function SatBottomPanel() {
  return (
    <section
      aria-label="Нижняя панель: зондирование"
      className={styles.panel}
      data-testid="tab-bottom-panel"
    >
      <FilterToggleCard
        ariaLabel="Дополнительная фильтрация"
        filters={SAT_FILTERS}
        title="Дополнительная фильтрация"
        wide
      />

      <ControlCard ariaLabel="Коллекция изображений">
        <ControlField title="Коллекция изображений">
          <SelectField
            ariaLabel="Коллекция изображений"
            options={['Введите название коллекции']}
            value="Введите название коллекции"
          />
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Тип канала">
        <ControlField title="Тип канала">
          <SelectField
            ariaLabel="Тип канала"
            options={['Активность Борща']}
            value="Активность Борща"
          />
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Дата и время от и до">
        <ControlField title="Дата и время от и до:">
          <DateTimeRange from="24-04-2025 | 00:00" to="24-04-2025 | 00:00" />
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Загрузить свои снимки">
        <ControlField dense title="Загрузить свои снимки">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Загрузить файлы
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Загрузить изображения
          </ChipButton>
        </ControlField>
      </ControlCard>
    </section>
  );
}

export function TabBottomPanel({ activeTab }: { activeTab: HeaderTabId }) {
  switch (activeTab) {
    case 'bar':
      return <RoutesBottomPanel />;
    case 'tmi':
      return <TelemetryBottomPanel />;
    case 'kick':
      return (
        <TableBottomPanel
          filters={KICK_FILTERS}
          tableActions={KICK_TABLE_ACTIONS}
          testLabel="Нижняя панель: введение пусков"
        />
      );
    case 'stats':
      return (
        <TableBottomPanel
          filters={STATS_FILTERS}
          tableActions={STATS_TABLE_ACTIONS}
          testLabel="Нижняя панель: статистика"
        />
      );
    case 'sat':
      return <SatBottomPanel />;
    default:
      return null;
  }
}
