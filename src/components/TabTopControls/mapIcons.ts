// cspell:disable
/**
 * Map-tab top-control icon manifest.
 *
 * Glyphs are the user-supplied SVGs in `public/top-control-icons/` (mirrored from
 * the Google Drive "SVG" set). This is the map-tab equivalent of the left-rail
 * SVG manifest exception: production map control icons use these SVGs via <img>,
 * not Blueprint <Icon>.
 *
 * Glyph<->button assignments are mapped to the reference (the
 * "Верхние блоки управления" block slices): the "Слои карты" group has nine
 * layer-provider glyphs plus two map toggles; the Инфраструктура / Наложения /
 * Борты groups follow the reference glyph order. At narrow widths each group's
 * icons overflow into a chevron "more" dropdown (handled by IconButtonGroup).
 * Adjust the arrays below to re-map without touching components.
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
// Glyph order mapped to the reference PNG.
export const MAP_FUNCTION_GROUPS: readonly MapIconGroup[] = [
  {
    title: 'Инфраструктура',
    items: [
      'important-object',
      'points',
      'radar',
      'plane',
      'barrel',
      'anchor',
      'flash',
      'rails',
      'road',
      'globe',
      'build',
    ],
    dividerAfter: [2],
  },
  {
    title: 'Наложения на карту',
    items: [
      'satellite-img',
      'megafon',
      'sun-calc',
      'cloud',
      'conflict-off',
      'satellite',
      'eye',
      'coord',
    ],
  },
  {
    title: 'Борты',
    items: ['danger-map', 'gex', 'calendar', 'redis-boat'],
  },
];

// Слои карты — map layer providers (9 glyphs, order mapped to the reference) plus
// the two map toggles (MAP_LAYER_TOGGLES). Dividers after the 1st and 3rd glyph
// per the Figma spec. At narrow widths the icons overflow into a chevron.
export const MAP_LAYER_GROUP: MapIconGroup = {
  title: 'Слои карты',
  items: [
    'hydromap',
    'google',
    'yandex-plus',
    'googlegibrid',
    'yandex',
    'esri',
    'otp',
    'osm',
    'clearmap',
  ],
  dividerAfter: [0, 2],
};

// Two map toggles trailing the layer providers ("Подложка" / "Сетка").
export const MAP_LAYER_TOGGLES: readonly string[] = ['Подложка', 'Сетка'];
