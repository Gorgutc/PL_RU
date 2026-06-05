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

const MAP_RESIZE_SETTLE_DELAY_MS = 80;
const MAP_STAGE_RESIZE_TOLERANCE_PX = 1;

function isExpectedOsmTileError(error: unknown) {
  const message = error instanceof Error ? error.message : String(error);

  return (
    message.includes('https://tile.openstreetmap.org/') &&
    /AJAXError|Failed to fetch|Failed to load/i.test(message)
  );
}

export function WorkspaceMap() {
  const mapStageRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const mapStage = mapStageRef.current;

    if (!mapStage) return;

    const map = new maplibregl.Map({
      attributionControl: false,
      center: WORKSPACE_MAP_CENTER,
      container: mapStage,
      maxZoom: WORKSPACE_MAP_MAX_ZOOM,
      minZoom: WORKSPACE_MAP_MIN_ZOOM,
      style: WORKSPACE_MAP_STYLE,
      trackResize: false,
      zoom: WORKSPACE_MAP_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
    map.on('error', (event) => {
      if (isExpectedOsmTileError(event.error)) return;

      throw event.error;
    });

    let resizeFrame = 0;
    let resizeTimeout = 0;
    let lastStageSize = {
      height: mapStage.getBoundingClientRect().height,
      width: mapStage.getBoundingClientRect().width,
    };
    const readRoundedStageSize = () => {
      const stageBox = mapStage.getBoundingClientRect();

      return {
        height: Math.round(stageBox.height),
        width: Math.round(stageBox.width),
      };
    };
    const hasStageSizeChanged = () => {
      const nextStageBox = mapStage.getBoundingClientRect();
      const hasChanged =
        Math.abs(nextStageBox.width - lastStageSize.width) > MAP_STAGE_RESIZE_TOLERANCE_PX ||
        Math.abs(nextStageBox.height - lastStageSize.height) > MAP_STAGE_RESIZE_TOLERANCE_PX;

      if (hasChanged) {
        lastStageSize = {
          height: nextStageBox.height,
          width: nextStageBox.width,
        };
      }

      return hasChanged;
    };
    const shouldResizeMapCanvas = () => {
      const canvas = map.getCanvas();
      const stageSize = readRoundedStageSize();

      return (
        Math.abs(canvas.width - stageSize.width) > MAP_STAGE_RESIZE_TOLERANCE_PX ||
        Math.abs(canvas.height - stageSize.height) > MAP_STAGE_RESIZE_TOLERANCE_PX
      );
    };
    const resizeMap = () => {
      window.clearTimeout(resizeTimeout);
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => {
        if (shouldResizeMapCanvas()) map.resize();
      });
    };
    const resizeMapAfterLayoutSettles = () => {
      if (!hasStageSizeChanged()) return;

      window.clearTimeout(resizeTimeout);
      resizeTimeout = window.setTimeout(resizeMap, MAP_RESIZE_SETTLE_DELAY_MS);
    };
    const resizeObserver = new ResizeObserver(resizeMapAfterLayoutSettles);
    resizeObserver.observe(mapStage);
    map.once('load', resizeMap);

    return () => {
      resizeObserver.disconnect();
      window.clearTimeout(resizeTimeout);
      window.cancelAnimationFrame(resizeFrame);
      map.remove();
    };
  }, []);

  return (
    <section className={styles.map} aria-label="Рабочая карта" data-testid="workspace-map">
      <Card className={styles.mapCard} data-testid="workspace-map-card" elevation={Elevation.ZERO}>
        <div className={styles.mapCanvas} data-testid="workspace-map-canvas">
          <div ref={mapStageRef} className={styles.mapStage} data-testid="workspace-map-stage" />
        </div>
      </Card>
    </section>
  );
}
