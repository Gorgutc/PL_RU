// cspell:disable
import type { IconName } from '@blueprintjs/core';
import type { HeaderTabId } from '@/components/Header/Header';

export type WorkspaceSidebarMode = 'rail' | 'panel';

export type RailItem = {
  id: string;
  label: string;
  icon: IconName;
  dividerBefore?: boolean;
  primary?: boolean;
};

export type RailConfig = {
  top: readonly RailItem[];
  bottom: readonly RailItem[];
};

const SIDEBAR_PANEL_TABS = new Set<HeaderTabId>(['sat', 'kick', 'stats']);

export function getWorkspaceSidebarMode(tab: HeaderTabId): WorkspaceSidebarMode {
  return SIDEBAR_PANEL_TABS.has(tab) ? 'panel' : 'rail';
}

export const RAIL_BY_TAB: Record<'map' | 'bar' | 'tmi', RailConfig> = {
  map: {
    top: [
      { id: 'primary', label: 'Слои карты', icon: 'pin', primary: true },
      { id: 'documents', label: 'Документы карты', icon: 'document' },
      { id: 'objects', label: 'Объекты', icon: 'high-voltage-pole', dividerBefore: true },
      { id: 'focus', label: 'Фокус карты', icon: 'locate', dividerBefore: true },
      { id: 'search', label: 'Поиск', icon: 'search', dividerBefore: true },
    ],
    bottom: [
      { id: 'bookmarks', label: 'Документы', icon: 'document' },
      { id: 'messages', label: 'Сообщения', icon: 'comment' },
      { id: 'history', label: 'История', icon: 'history', dividerBefore: true },
      { id: 'collapse', label: 'Свернуть', icon: 'double-chevron-right', dividerBefore: true },
      { id: 'settings', label: 'Настройки', icon: 'cog', dividerBefore: true },
    ],
  },
  bar: {
    top: [
      { id: 'primary', label: 'Маршруты', icon: 'route', primary: true },
      { id: 'timeline', label: 'Лента маршрутов', icon: 'timeline-events' },
      { id: 'path', label: 'Поиск пути', icon: 'path-search', dividerBefore: true },
      { id: 'layers', label: 'Слои маршрутов', icon: 'layers', dividerBefore: true },
      { id: 'table', label: 'Таблица', icon: 'th-list', dividerBefore: true },
    ],
    bottom: [
      { id: 'filters', label: 'Фильтры', icon: 'filter' },
      { id: 'document', label: 'Документ', icon: 'document' },
      { id: 'export', label: 'Экспорт', icon: 'export', dividerBefore: true },
      { id: 'history', label: 'История', icon: 'history', dividerBefore: true },
      { id: 'settings', label: 'Настройки', icon: 'cog', dividerBefore: true },
    ],
  },
  tmi: {
    top: [
      { id: 'primary', label: 'Телеметрия', icon: 'antenna', primary: true },
      { id: 'signals', label: 'Сигналы', icon: 'pulse' },
      { id: 'charts', label: 'Графики', icon: 'timeline-line-chart', dividerBefore: true },
      { id: 'table', label: 'Таблица', icon: 'panel-table', dividerBefore: true },
      { id: 'search', label: 'Поиск', icon: 'search', dividerBefore: true },
    ],
    bottom: [
      { id: 'notifications', label: 'Уведомления', icon: 'notifications' },
      { id: 'document', label: 'Документ', icon: 'document' },
      { id: 'filters', label: 'Фильтры', icon: 'filter', dividerBefore: true },
      { id: 'history', label: 'История', icon: 'history', dividerBefore: true },
      { id: 'settings', label: 'Настройки', icon: 'cog', dividerBefore: true },
    ],
  },
};
