'use client';

// cspell:disable
import { Card, Elevation } from '@blueprintjs/core';
import { useEffect, useRef } from 'react';
import maplibregl from 'maplibre-gl';
import {
  WORKSPACE_MAP_CENTER,
  WORKSPACE_MAP_MAX_ZOOM,
  WORKSPACE_MAP_MIN_ZOOM,
  WORKSPACE_MAP_STYLE,
  WORKSPACE_MAP_ZOOM,
} from './mapConfig';
import styles from './WorkspaceMap.module.scss';

function isExpectedOsmTileError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('https://tile.openstreetmap.org/') &&
    /AJAXError|Failed to fetch|Failed to load/i.test(message)
  );
}

export function WorkspaceMap() {
  const mapContainerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapContainer = mapContainerRef.current;

    if (!mapContainer) return;

    const map = new maplibregl.Map({
      attributionControl: false,
      center: WORKSPACE_MAP_CENTER,
      container: mapContainer,
      maxZoom: WORKSPACE_MAP_MAX_ZOOM,
      minZoom: WORKSPACE_MAP_MIN_ZOOM,
      style: WORKSPACE_MAP_STYLE,
      zoom: WORKSPACE_MAP_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
    map.on('error', (event) => {
      if (isExpectedOsmTileError(event.error)) return;

      throw event.error;
    });

    let resizeFrame = 0;
    const resizeMap = () => {
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => map.resize());
    };
    const resizeObserver = new ResizeObserver(resizeMap);
    resizeObserver.observe(mapContainer);
    map.once('load', resizeMap);

    return () => {
      resizeObserver.disconnect();
      window.cancelAnimationFrame(resizeFrame);
      map.remove();
    };
  }, []);

  return (
    <section className={styles.map} aria-label="Рабочая карта" data-testid="workspace-map">
      <Card className={styles.mapCard} data-testid="workspace-map-card" elevation={Elevation.ZERO}>
        <div
          ref={mapContainerRef}
          className={styles.mapCanvas}
          data-testid="workspace-map-canvas"
        />
      </Card>
    </section>
  );
}
