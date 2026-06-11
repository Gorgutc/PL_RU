// cspell:disable
'use client';

import type { HeaderTabId } from '@/components/Header/Header';
import {
  ChipButton,
  ControlCard,
  ControlField,
  MapLayerDropdown,
  SelectField,
  SwitchToggle,
} from '@/components/TabTopControls/controls';
import { cx } from '@/lib/cx';
import styles from './TabBottomPanel.module.scss';

/**
 * Per-tab bottom panel: a presentational footer strip under the WorkspaceMap,
 * dispatched by the active tab (mirroring TabTopControls). Reuses the frozen
 * control-surface primitives (ControlCard / ControlField / SwitchToggle /
 * ChipButton) so every panel shares the frozen dark card-surface contract with
 * the top control blocks. Local UI state only (no backend). A panel only
 * changes the map's available height; the map's horizontal stage contract
 * (right-anchored, trackResize:false) is untouched.
 *
 * The map panel is the original MapBottomPanel content, unchanged. The bar
 * (Маршруты) and tmi (Телеметрия) panels arrive with the approved pixel-fit
 * iterations; until then those tabs render no panel, like sat/kick/stats.
 */

// In the compact band (< 1920) only the first few filter toggles stay inline;
// the rest fold into the overflow chevron, matching the 1280 reference.
const COMPACT_VISIBLE_FILTERS = 3;

// "Фильтрация на карте" toggles — all on by default, matching the reference.
const MAP_FILTER_TOGGLES = [
  'Включить угрозы',
  'РЭБ угрозы',
  'Карта ЛБС',
  'Пожары',
  'Рельеф',
  'Часовые пояса',
  'Сетка WGS84',
] as const;

// "Нижняя граница облаков" tick labels (metres) under the rainbow legend.
const CLOUD_LEGEND_TICKS = ['0', '500', '1000', '1500', '2000', '3000', '4000', '5000'] as const;

export function TabBottomPanel({ activeTab }: { activeTab: HeaderTabId }) {
  switch (activeTab) {
    case 'map':
      return <MapPanel />;
    case 'bar':
      return <RoutesPanel />;
    default:
      return null;
  }
}

// Shared <section> shell so every tab panel carries the same testid + data-tab.
function PanelShell({
  ariaLabel,
  children,
  tab,
}: {
  ariaLabel: string;
  children: React.ReactNode;
  tab: HeaderTabId;
}) {
  return (
    <section
      aria-label={ariaLabel}
      className={styles.panel}
      data-tab={tab}
      data-testid="tab-bottom-panel"
    >
      {children}
    </section>
  );
}

// Rainbow gradient legend (the flexible rubber middle block of a panel).
// `inlineUnit` keeps the unit right next to the title (the bar/tmi barometric
// legend); the map cloud legend keeps its split title…unit header.
function GradientLegend({
  ticks,
  title,
  unit,
  inlineUnit,
}: {
  ticks: readonly string[];
  title: string;
  unit: string;
  inlineUnit?: boolean;
}) {
  return (
    <div className={styles.legend} data-testid="tab-bottom-panel-legend">
      <div className={cx(styles.legendHeader, inlineUnit && styles.legendHeaderInline)}>
        <span className={styles.legendTitle}>{title}</span>
        <span className={styles.legendUnit}>{unit}</span>
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

// "Фильтрация на карте" toggles of the routes panel (1920 reference). The
// folding is space-driven in the reference: six switches at >= 1920, three at
// 1280 with the rail collapsed, two at 1280 with the rail expanded — the first
// tier folds with the compact band (filterExtra), the second by panel width
// (filterTier2 container query).
const BAR_FILTER_TOGGLES = [
  'Включить угрозы',
  'РЭБ угрозы',
  'Карта ЛБС',
  'Пусковые точки',
  'Номера точек',
  'Номера',
] as const;

// "Высота по барометру" tick labels (metres) — six ticks in the reference.
const BAR_LEGEND_TICKS = ['0', '1000', '2000', '3000', '4000', '5000'] as const;

function RoutesPanel() {
  return (
    <PanelShell ariaLabel="Нижняя панель маршрутов" tab="bar">
      <ControlCard ariaLabel="Фильтрация на карте">
        <ControlField title="Фильтрация на карте">
          {BAR_FILTER_TOGGLES.map((label, index) => (
            <span
              key={label}
              className={cx(
                index >= COMPACT_VISIBLE_FILTERS && styles.filterExtra,
                index >= 2 && styles.filterTier2,
              )}
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
            ariaLabel="Контурность карты"
            options={['Контурность карты']}
            value="Контурность карты"
          />
          <ChipButton>
            <span className={styles.yandexFull}>Яндекс карты Я</span>
            <span className={styles.yandexShort}>Я</span>
          </ChipButton>
        </ControlField>
      </ControlCard>

      <ControlCard ariaLabel="Высота по барометру" flexible>
        <GradientLegend
          inlineUnit
          ticks={BAR_LEGEND_TICKS}
          title="Высота по барометру"
          unit="(м)"
        />
      </ControlCard>

      <ControlCard ariaLabel="Управление данными">
        <ControlField title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            <span className={styles.fullLabel}>Загрузить свои цели</span>
            <span className={styles.shortLabel}>Загрузить</span>
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            <span className={styles.fullLabel}>Скачать все цели</span>
            <span className={styles.shortLabel}>Скачать цели</span>
          </ChipButton>
        </ControlField>
      </ControlCard>
    </PanelShell>
  );
}

function MapPanel() {
  return (
    <PanelShell ariaLabel="Нижняя панель карты" tab="map">
      <ControlCard ariaLabel="Фильтрация на карте">
        <ControlField title="Фильтрация на карте">
          {MAP_FILTER_TOGGLES.map((label, index) => (
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

      <ControlCard ariaLabel="Нижняя граница облаков" flexible>
        <GradientLegend ticks={CLOUD_LEGEND_TICKS} title="Нижняя граница облаков" unit="(м)" />
      </ControlCard>

      <ControlCard ariaLabel="Управление данными">
        <ControlField title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            <span className={styles.fullLabel}>Загрузить свои данные</span>
            <span className={styles.shortLabel}>Загрузить данные</span>
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Скачать отчет
          </ChipButton>
        </ControlField>
      </ControlCard>
    </PanelShell>
  );
}
