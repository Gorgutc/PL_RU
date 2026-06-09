// cspell:disable
/**
 * Map-tab top-control icon manifest.
 *
 * Glyphs are the user-supplied SVGs in `public/top-control-icons/` (mirrored from
 * the Google Drive "SVG" set). This is the map-tab equivalent of the left-rail
 * SVG manifest exception: production map control icons use these SVGs via <img>,
 * not Blueprint <Icon>.
 *
 * The "Слои карты" (map layers) group maps 1:1 to the MapLayers SVGs (providers).
 * The Инфраструктура / Наложения / Борты grouping follows the Figma block order
 * and the SVG names; the exact glyph<->button assignment in those three groups is
 * a best-effort match pending a pixel pass against the reference (the layer group
 * is exact). Adjust the arrays below to re-map without touching components.
 */

export type MapIconId =
  | 'radar'
  | 'points'
  | 'coord'
  | 'plane'
  | 'anchor'
  | 'flash'
  | 'rails'
  | 'road'
  | 'gex'
  | 'build'
  | 'barrel'
  | 'megafon'
  | 'cloud'
  | 'sun-calc'
  | 'danger-map'
  | 'conflict-off'
  | 'eye'
  | 'satellite-img'
  | 'globe'
  | 'satellite'
  | 'redis-boat'
  | 'important-object'
  | 'calendar'
  | 'osm'
  | 'google'
  | 'googlegibrid'
  | 'yandex'
  | 'yandex-plus'
  | 'esri'
  | 'otp'
  | 'hydromap'
  | 'clearmap';

const ICON_LABELS: Record<MapIconId, string> = {
  radar: 'Радары',
  points: 'Точки',
  coord: 'Координаты',
  plane: 'Авиация',
  anchor: 'Порты',
  flash: 'Энергетика',
  rails: 'Железные дороги',
  road: 'Дороги',
  gex: 'ГЭС',
  build: 'Застройка',
  barrel: 'Нефтебазы',
  megafon: 'Оповещения',
  cloud: 'Облачность',
  'sun-calc': 'Освещённость',
  'danger-map': 'Опасные зоны',
  'conflict-off': 'Конфликты',
  eye: 'Наблюдение',
  'satellite-img': 'Спутниковый снимок',
  globe: 'Гео-данные',
  satellite: 'Спутники',
  'redis-boat': 'Суда',
  'important-object': 'Важные объекты',
  calendar: 'Расписание',
  osm: 'OpenStreetMap',
  google: 'Google',
  googlegibrid: 'Google Гибрид',
  yandex: 'Яндекс',
  'yandex-plus': 'Яндекс Плюс',
  esri: 'Esri',
  otp: 'OTP',
  hydromap: 'Гидрография',
  clearmap: 'Чистая карта',
};

export function mapIconLabel(id: MapIconId): string {
  return ICON_LABELS[id];
}

export function mapIconSrc(id: MapIconId): string {
  return `/top-control-icons/${id}.svg`;
}

// A group of icon buttons. `dividerAfter` holds zero-based indices after which a
// vertical divider is rendered (mirrors the Figma block).
export type MapIconGroup = {
  title: string;
  items: readonly MapIconId[];
  dividerAfter?: readonly number[];
};

// Инфраструктура / Наложения / Борты — function groups (icon buttons only).
export const MAP_FUNCTION_GROUPS: readonly MapIconGroup[] = [
  {
    title: 'Инфраструктура',
    items: [
      'radar',
      'points',
      'coord',
      'plane',
      'anchor',
      'flash',
      'rails',
      'road',
      'gex',
      'build',
      'barrel',
    ],
    dividerAfter: [2],
  },
  {
    title: 'Наложения на карту',
    items: [
      'megafon',
      'cloud',
      'sun-calc',
      'danger-map',
      'conflict-off',
      'eye',
      'satellite-img',
      'globe',
    ],
  },
  {
    title: 'Борты',
    items: ['satellite', 'redis-boat', 'important-object', 'calendar'],
  },
];

// Слои карты — map layer providers (exact MapLayers mapping) + two map toggles.
export const MAP_LAYER_GROUP: MapIconGroup = {
  title: 'Слои карты',
  items: [
    'osm',
    'google',
    'googlegibrid',
    'yandex',
    'yandex-plus',
    'esri',
    'otp',
    'hydromap',
    'clearmap',
  ],
  dividerAfter: [0, 2],
};

export const MAP_LAYER_TOGGLES: readonly string[] = ['Подложка', 'Сетка'];
