import type { StyleSpecification } from 'maplibre-gl';

// The map keeps the single light OSM raster style; the dark theme is a
// high-contrast CSS invert applied to the canvas in WorkspaceMap (see
// WorkspaceMap.module.scss), not a separate tile provider.
export type WorkspaceMapTheme = 'light' | 'dark';

const WORKSPACE_MAP_TILE_URL = 'https://tile.openstreetmap.org/{z}/{x}/{y}.png';
const WORKSPACE_MAP_ATTRIBUTION = '&copy; OpenStreetMap contributors';
export const WORKSPACE_MAP_CENTER: [number, number] = [83, 60];
export const WORKSPACE_MAP_ZOOM = 3.2;
export const WORKSPACE_MAP_MIN_ZOOM = 2;
export const WORKSPACE_MAP_MAX_ZOOM = 18;

export const WORKSPACE_MAP_STYLE: StyleSpecification = {
  version: 8,
  sources: {
    osm: {
      type: 'raster',
      tiles: [WORKSPACE_MAP_TILE_URL],
      tileSize: 256,
      attribution: WORKSPACE_MAP_ATTRIBUTION,
    },
  },
  layers: [
    {
      id: 'osm-raster',
      type: 'raster',
      source: 'osm',
    },
  ],
};
