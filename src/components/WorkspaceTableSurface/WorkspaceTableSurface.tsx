// cspell:disable
import styles from './WorkspaceTableSurface.module.scss';

/**
 * Center workspace surface for the table tabs (kick / stats).
 *
 * The эталон shows these tabs with a dark, empty table container in the center
 * instead of the MapLibre map (the table functionality itself lands in a later
 * iteration). It mirrors the WorkspaceMap container geometry — the frozen
 * 10px outer gutter, 8px inner inset, hairline inset border, and 2px/4px radii —
 * so the table surface lines up pixel-for-pixel with where the map sits on the
 * map/bar/tmi/sat tabs. Presentational only; no data backend yet.
 */
export function WorkspaceTableSurface() {
  return (
    <section aria-label="Таблица данных" className={styles.surface} data-testid="workspace-table">
      <div className={styles.surfaceCard} data-testid="workspace-table-card">
        <div className={styles.surfaceInner} data-testid="workspace-table-inner" />
      </div>
    </section>
  );
}
