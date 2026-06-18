// cspell:disable
import type { HeaderTabId } from '@/components/Header/Header';
import type { RailIconId } from '@/components/AppNavigation/railIcons';

export type WorkspaceSidebarMode = 'rail' | 'panel';
export type WorkspaceRailState = 'collapsed' | 'expanded';
export type RailTabId = Extract<HeaderTabId, 'map' | 'bar' | 'tmi'>;

export type RailItem = {
  id: string;
  label: string;
  iconId: RailIconId;
  dividerBefore?: boolean;
  primary?: boolean;
};

export type RailConfig = {
  top: readonly RailItem[];
  bottom: readonly RailItem[];
};

const SIDEBAR_PANEL_TABS = new Set<HeaderTabId>(['sat', 'kick', 'stats']);

const SHARED_BOTTOM_RAIL_ITEMS = [
  { id: 'information', label: 'Информация', iconId: 'file-outline' },
  { id: 'support', label: 'Поддержка', iconId: 'transition-to-queries' },
  // The map basemap light/dark toggle. LeftRail renders this item's visible and
  // accessible label dynamically (getThemeRailLabel: "Тёмная тема" while light,
  // "Светлая тема" while dark), so this static label is only a config fallback.
  { id: 'theme', label: 'Светлая тема', iconId: 'moon-outline', dividerBefore: true },
  {
    id: 'collapse',
    label: 'Свернуть',
    iconId: 'double-upper-right-outline',
    dividerBefore: true,
  },
  { id: 'settings', label: 'Настройки', iconId: 'setting-outline', dividerBefore: true },
] as const satisfies readonly RailItem[];

export function getWorkspaceSidebarMode(tab: HeaderTabId): WorkspaceSidebarMode {
  return SIDEBAR_PANEL_TABS.has(tab) ? 'panel' : 'rail';
}

export const RAIL_BY_TAB: Record<RailTabId, RailConfig> = {
  map: {
    top: [
      { id: 'primary', label: 'Слои', iconId: 'flag-outline', primary: true },
      { id: 'documents', label: 'События', iconId: 'file-text' },
      {
        id: 'objects',
        label: 'Военная инфраструктура',
        iconId: 'vector',
        dividerBefore: true,
      },
      { id: 'tools', label: 'Инструменты', iconId: 'mother-tool-outline', dividerBefore: true },
      { id: 'search', label: 'Поиск', iconId: 'search-outline', dividerBefore: true },
    ],
    bottom: SHARED_BOTTOM_RAIL_ITEMS,
  },
  bar: {
    top: [
      { id: 'primary', label: 'Линейка', iconId: 'ruler-outline', primary: true },
      {
        id: 'timeline',
        label: 'Редактирование точек',
        iconId: 'zerolinetool-outline',
        dividerBefore: true,
      },
      {
        id: 'converter',
        label: 'Конвертер координат',
        iconId: 'globe-outline',
        dividerBefore: true,
      },
      { id: 'weather', label: 'Погода', iconId: 'weather', dividerBefore: true },
      { id: 'search', label: 'Поиск', iconId: 'search-outline', dividerBefore: true },
    ],
    bottom: SHARED_BOTTOM_RAIL_ITEMS,
  },
  tmi: {
    top: [
      { id: 'primary', label: 'Линейка', iconId: 'ruler-outline', primary: true },
      { id: 'area', label: 'Область', iconId: 'buffer-outline' },
      { id: 'circle', label: 'Круг', iconId: 'square-outline', dividerBefore: true },
      { id: 'polygon', label: 'Полигон', iconId: 'object-outline', dividerBefore: true },
      { id: 'mark', label: 'Метка', iconId: 'flag-outline', dividerBefore: true },
      { id: 'search', label: 'Поиск', iconId: 'search-outline', dividerBefore: true },
    ],
    bottom: SHARED_BOTTOM_RAIL_ITEMS,
  },
};
