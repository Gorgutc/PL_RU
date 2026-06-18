// cspell:disable
'use client';

import {
  ChipButton,
  ControlCard,
  ControlField,
  MapLayerDropdown,
  SwitchToggle,
} from '@/components/TabTopControls/controls';
import { cx } from '@/lib/cx';
import styles from './MapBottomPanel.module.scss';

// In the compact band (< 1920) only the first few filter toggles stay inline;
// the rest fold into the overflow chevron, matching the 1280 reference.
const COMPACT_VISIBLE_FILTERS = 3;

/**
 * Map-tab bottom panel: a presentational footer strip under the WorkspaceMap.
 *
 * Reuses the frozen control-surface primitives (ControlCard / ControlField /
 * SwitchToggle / ChipButton) so it shares the frozen dark card-surface contract
 * with the top control blocks. Local UI state only (no backend), like TabTopControls.
 * It only changes the map's available height; the map's horizontal stage
 * contract (right-anchored, trackResize:false) is untouched.
 *
 * Three sub-blocks (left→right): map filters, cloud-base rainbow legend, and
 * data-management actions. The legend is the flexible (rubber) middle block.
 */

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

export function MapBottomPanel() {
  return (
    <section
      aria-label="Нижняя панель карты"
      className={styles.panel}
      data-testid="map-bottom-panel"
    >
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
        <div className={styles.legend} data-testid="map-bottom-panel-legend">
          <div className={styles.legendHeader}>
            <span className={styles.legendTitle}>Нижняя граница облаков</span>
            <span className={styles.legendUnit}>(м)</span>
          </div>
          <div aria-hidden="true" className={styles.legendBar} />
          <div className={styles.legendTicks}>
            {CLOUD_LEGEND_TICKS.map((tick) => (
              <span key={tick}>{tick}</span>
            ))}
          </div>
        </div>
      </ControlCard>

      <ControlCard ariaLabel="Управление данными">
        <ControlField dense title="Управление данными">
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            <span className={styles.fullLabel}>Загрузить свои данные</span>
            <span className={styles.shortLabel}>Загрузить данные</span>
          </ChipButton>
          <ChipButton leadingIcon="grid-view" leadingIconClassName={styles.actionIcon}>
            Скачать отчет
          </ChipButton>
        </ControlField>
      </ControlCard>
    </section>
  );
}
