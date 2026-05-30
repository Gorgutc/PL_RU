// cspell:disable
import { Card, Elevation } from '@blueprintjs/core';
import styles from './WorkspaceMap.module.scss';

export function WorkspaceMap() {
  return (
    <section className={styles.map} aria-label="Рабочая карта" data-testid="workspace-map">
      <Card className={styles.mapCard} data-testid="workspace-map-card" elevation={Elevation.ZERO}>
        <div className={styles.mapSurface} aria-hidden="true">
          <span className={styles.routeMain} />
          <span className={styles.routeSecondary} />
          <span className={styles.marker} />
          <span className={styles.markerSecondary} />
        </div>
      </Card>
    </section>
  );
}
