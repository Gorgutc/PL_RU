// cspell:disable
'use client';

import type { HeaderTabId } from '@/components/Header/Header';
import {
  ChipButton,
  ControlCard,
  ControlField,
  DateTimeRange,
  MapLayerDropdown,
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

function RoutesBottomPanel() {
  return (
    <section
      aria-label="Нижняя панель: маршруты"
      className={styles.panel}
      data-testid="tab-bottom-panel"
    >
      <ControlCard ariaLabel="Фильтрация на карте">
        <ControlField title="Фильтрация на карте">
          {ROUTES_FILTERS.map((label, index) => (
            <span
              key={label}
              className={cx(index >= COMPACT_VISIBLE_FILTERS && styles.filterExtra)}
            >
              <SwitchToggle defaultChecked label={label} />
            </span>
          ))}
          <span className={styles.filterOverflow}>
            <MapLayerDropdown ariaLabel="Ещё фильтры" />
          </span>
        </ControlField>
      </ControlCard>

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
        <ControlField title="Управление данными">
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
        <ControlField title="Управление данными">
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
  tableActions: readonly { label: string; icon: 'th' | 'timeline-line-chart' }[];
  testLabel: string;
}) {
  return (
    <section aria-label={testLabel} className={styles.panel} data-testid="tab-bottom-panel">
      <ControlCard ariaLabel="Дополнительная фильтрация">
        <ControlField title="Дополнительная фильтрация">
          {filters.map((label) => (
            <SwitchToggle defaultChecked key={label} label={label} />
          ))}
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Настройки таблицы">
        <ControlField title="Настройки таблицы">
          {tableActions.map((action) => (
            <ChipButton icon={action.icon} key={action.label}>
              {action.label}
            </ChipButton>
          ))}
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Управление данными">
        <ControlField title="Управление данными">
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
  { label: 'Настройка колонок', icon: 'th' },
  { label: 'Тип данных', icon: 'th' },
  { label: 'Формат ячеек', icon: 'th' },
] as const;

const STATS_FILTERS = [
  'Дубликаты',
  'Удаленные',
  'Несоответствие данных',
  'Вкл. отсутствующие',
  'Только отредактированные',
] as const;
const STATS_TABLE_ACTIONS = [
  { label: 'Настройка колонок', icon: 'th' },
  { label: 'Тип данных', icon: 'th' },
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
      <ControlCard ariaLabel="Дополнительная фильтрация">
        <ControlField title="Дополнительная фильтрация">
          {SAT_FILTERS.map((label) => (
            <SwitchToggle defaultChecked key={label} label={label} />
          ))}
        </ControlField>
      </ControlCard>

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
        <ControlField title="Загрузить свои снимки">
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
