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
const WORKSPACE_SHELL_MOTION_DURATION_MS = 220;

function cssTimeToMs(value: string) {
  const normalized = value.trim();

  if (normalized.endsWith('ms')) return Number.parseFloat(normalized);
  if (normalized.endsWith('s')) return Number.parseFloat(normalized) * 1000;

  return Number.parseFloat(normalized);
}

function maxCssDurationToMs(value: string) {
  return Math.max(...value.split(',').map(cssTimeToMs));
}

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
      trackResize: false,
      zoom: WORKSPACE_MAP_ZOOM,
    });

    map.addControl(new maplibregl.NavigationControl({ visualizePitch: true }), 'top-right');
    map.addControl(new maplibregl.AttributionControl({ compact: false }), 'bottom-right');
    map.on('error', (event) => {
      if (isExpectedOsmTileError(event.error)) return;

      throw event.error;
    });

    const tabPanel = mapContainer.closest('#praios-tab-panel');
    const leftArea = tabPanel?.querySelector('[data-testid="workspace-left-area"]');
    let isShellTransitioning = false;
    let resizeFrame = 0;
    let shellTransitionTimeout = 0;
    let resizeTimeout = 0;
    const getSidebarLayoutSignature = () =>
      leftArea
        ? [
            leftArea.getAttribute('data-sidebar-mode'),
            leftArea.getAttribute('data-sidebar-state'),
            leftArea.getAttribute('data-tab'),
          ].join('|')
        : '';
    let sidebarLayoutSignature = getSidebarLayoutSignature();
    const resizeMap = () => {
      if (leftArea && getSidebarLayoutSignature() !== sidebarLayoutSignature) {
        scheduleResizeAfterShellTransition();
        return;
      }

      window.clearTimeout(resizeTimeout);
      window.cancelAnimationFrame(resizeFrame);
      resizeFrame = window.requestAnimationFrame(() => map.resize());
    };
    const resizeMapAfterLayoutSettles = () => {
      window.clearTimeout(resizeTimeout);
      if (isShellTransitioning) return;

      resizeTimeout = window.setTimeout(resizeMap, MAP_RESIZE_SETTLE_DELAY_MS);
    };
    const getShellTransitionSettleDelay = () => {
      if (!tabPanel || window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        return MAP_RESIZE_SETTLE_DELAY_MS;
      }

      return (
        Math.max(
          WORKSPACE_SHELL_MOTION_DURATION_MS,
          maxCssDurationToMs(window.getComputedStyle(tabPanel).transitionDuration),
        ) + MAP_RESIZE_SETTLE_DELAY_MS
      );
    };
    const scheduleResizeAfterShellTransition = () => {
      sidebarLayoutSignature = getSidebarLayoutSignature();
      isShellTransitioning = true;
      window.clearTimeout(resizeTimeout);
      window.clearTimeout(shellTransitionTimeout);
      shellTransitionTimeout = window.setTimeout(() => {
        isShellTransitioning = false;
        resizeMap();
      }, getShellTransitionSettleDelay());
    };
    const resizeObserver = new ResizeObserver(resizeMapAfterLayoutSettles);
    resizeObserver.observe(mapContainer);
    map.once('load', () => {
      if (isShellTransitioning) return;

      resizeMap();
    });

    const railStateObserver = new MutationObserver((records) => {
      if (
        records.some((record) =>
          ['data-sidebar-mode', 'data-sidebar-state', 'data-tab'].includes(
            record.attributeName ?? '',
          ),
        )
      ) {
        scheduleResizeAfterShellTransition();
      }
    });
    if (leftArea) {
      railStateObserver.observe(leftArea, {
        attributeFilter: ['data-sidebar-mode', 'data-sidebar-state', 'data-tab'],
        attributes: true,
      });
    }

    return () => {
      railStateObserver.disconnect();
      resizeObserver.disconnect();
      window.clearTimeout(shellTransitionTimeout);
      window.clearTimeout(resizeTimeout);
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
