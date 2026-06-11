// Data module for the local designer reference PNGs (tabs pixel-fit task).
// The 24 files live OUTSIDE the repo (~120 MB, user decision: do not commit);
// the folder is resolved from DESIGNER_REFS_DIR with a machine-local default.
// File names are listed literally because they contain anomalies that must not
// be parsed: three 3840 files carry "закрытым _боковым" (stray underscore) and
// the tmi/1280/expanded shot is misnamed as "...с закрытым...1280px-1.png"
// (confirmed by the user as the expanded-sidebar variant).
// cspell:disable

import path from 'node:path';

export const DESIGNER_REFS_DIR_ENV = 'DESIGNER_REFS_DIR';

const DEFAULT_DESIGNER_REFS_DIR =
  'C:\\Users\\Junior\\Desktop\\Work\\Эталонные референсы  внешнего вида';

export function resolveDesignerRefsDir() {
  return process.env[DESIGNER_REFS_DIR_ENV] ?? DEFAULT_DESIGNER_REFS_DIR;
}

export function designerRefPath(ref) {
  return path.join(resolveDesignerRefsDir(), ref.file);
}

const SIZE_BY_WIDTH = new Map([
  [1280, 800],
  [1920, 1080],
  [2560, 1440],
  [3840, 2160],
]);

function ref(tab, width, sidebar, file) {
  return {
    file,
    height: SIZE_BY_WIDTH.get(width),
    id: `${tab}-${width}-${sidebar}`,
    sidebar,
    tab,
    width,
  };
}

export const DESIGNER_REFS = [
  ref('map', 1280, 'collapsed', 'Общий вид_Оперативная карта_с закрытым боковым меню_1280px.png'),
  ref('map', 1280, 'expanded', 'Общий вид_Оперативная карта_с раскрытым боковым меню_1280px.png'),
  ref('map', 1920, 'collapsed', 'Общий вид_Оперативная карта_с закрытым боковым меню_1920px.png'),
  ref('map', 1920, 'expanded', 'Общий вид_Оперативная карта_с раскрытым боковым меню_1920px.png'),
  ref('map', 2560, 'collapsed', 'Общий вид_Оперативная карта_с закрытым боковым меню_2560px.png'),
  ref('map', 2560, 'expanded', 'Общий вид_Оперативная карта_с раскрытым боковым меню_2560px.png'),
  ref('map', 3840, 'collapsed', 'Общий вид_Оперативная карта_с закрытым _боковым меню_3840px.png'),
  ref('map', 3840, 'expanded', 'Общий вид_Оперативная карта_с раскрытым боковым меню_3840px.png'),
  ref('bar', 1280, 'collapsed', 'Общий вид_маршруты_с закрытым боковым меню_1280px.png'),
  ref('bar', 1280, 'expanded', 'Общий вид_маршруты_с раскрытым боковым меню_1280px.png'),
  ref('bar', 1920, 'collapsed', 'Общий вид_маршруты_с закрытым боковым меню_1920px.png'),
  ref('bar', 1920, 'expanded', 'Общий вид_маршруты_с раскрытым боковым меню_1920px.png'),
  ref('bar', 2560, 'collapsed', 'Общий вид_маршруты_с закрытым боковым меню_2560px.png'),
  ref('bar', 2560, 'expanded', 'Общий вид_маршруты_с раскрытым боковым меню_2560px.png'),
  ref('bar', 3840, 'collapsed', 'Общий вид_маршруты_с закрытым _боковым меню_3840px.png'),
  ref('bar', 3840, 'expanded', 'Общий вид_маршруты_с раскрытым боковым меню_3840px.png'),
  ref('tmi', 1280, 'collapsed', 'Общий вид_Телеметрия_с закрытым боковым меню_1280px.png'),
  // Misnamed in the source folder: this is the EXPANDED 1280 telemetry shot.
  ref('tmi', 1280, 'expanded', 'Общий вид_Телеметрия_с закрытым боковым меню_1280px-1.png'),
  ref('tmi', 1920, 'collapsed', 'Общий вид_Телеметрия_с закрытым боковым меню_1920px.png'),
  ref('tmi', 1920, 'expanded', 'Общий вид_Телеметрия_с раскрытым боковым меню_1920px.png'),
  ref('tmi', 2560, 'collapsed', 'Общий вид_Телеметрия_с закрытым боковым меню_2560px.png'),
  ref('tmi', 2560, 'expanded', 'Общий вид_Телеметрия_с раскрытым боковым меню_2560px.png'),
  ref('tmi', 3840, 'collapsed', 'Общий вид_Телеметрия_с закрытым _боковым меню_3840px.png'),
  ref('tmi', 3840, 'expanded', 'Общий вид_Телеметрия_с раскрытым боковым меню_3840px.png'),
];

// Frozen chrome geometry (see docs/agent/frozen-decisions.md): 48px header,
// 50/240px rail, 96px toolbar band, 96px bottom panel band, 2560px content cap.
export const HEADER_HEIGHT = 48;
export const RAIL_WIDTH = { collapsed: 50, expanded: 240 };
export const TOP_CONTROLS_HEIGHT = 96;
export const BOTTOM_PANEL_HEIGHT = 96;
export const CONTENT_MAX_WIDTH = 2560;

// The map viewport itself is intentionally NOT a pixel region: the designer
// shots contain live OSM tiles. The map is covered by DOM/CSS metrics in e2e.
export function cropRegions(ref) {
  const railWidth = RAIL_WIDTH[ref.sidebar];
  const contentWidth = Math.min(ref.width - railWidth, CONTENT_MAX_WIDTH);

  return [
    { height: HEADER_HEIGHT, region: 'header', width: ref.width, x: 0, y: 0 },
    {
      height: ref.height - HEADER_HEIGHT,
      region: 'rail',
      width: railWidth,
      x: 0,
      y: HEADER_HEIGHT,
    },
    {
      height: TOP_CONTROLS_HEIGHT,
      region: 'top-controls',
      width: contentWidth,
      x: railWidth,
      y: HEADER_HEIGHT,
    },
    {
      height: BOTTOM_PANEL_HEIGHT,
      region: 'bottom-panel',
      width: contentWidth,
      x: railWidth,
      y: ref.height - BOTTOM_PANEL_HEIGHT,
    },
  ];
}

export function caseId(ref, region) {
  return `${ref.id}-${region}`;
}

export const DEFAULT_TOLERANCE = Object.freeze({ maxMismatchRatio: 0.065, pixelDelta: 32 });

// Per-case overrides keyed by `${ref.id}-${region}` (same semantics as the
// per-testCase tolerance in scripts/check-visual-evidence.mjs). Populated as
// calibration and the pixel-fit iterations discover text-antialiasing-heavy
// regions that need a wider mismatch budget.
export const PER_CASE_TOLERANCE = Object.freeze({});

export function toleranceFor(ref, region) {
  return { ...DEFAULT_TOLERANCE, ...(PER_CASE_TOLERANCE[caseId(ref, region)] ?? {}) };
}

// Shared CLI filtering for crop/compare scripts: --tab=map --width=1920
// --sidebar=collapsed --region=header. Flags are repeatable and accept comma
// or space separated lists (pnpm on Windows rewrites commas in passed-through
// args into spaces, so both forms must work).
export function parseFilters(argv) {
  const filters = { region: null, sidebar: null, tab: null, width: null };
  const flags = { reportOnly: false };

  for (const arg of argv) {
    if (arg === '--report-only') {
      flags.reportOnly = true;
      continue;
    }
    const match = /^--(tab|width|sidebar|region)=(.+)$/.exec(arg);
    if (match == null) {
      console.warn(`designer-refs: ignoring unrecognized argument "${arg}"`);
      continue;
    }
    const values = match[2].split(/[\s,]+/).filter(Boolean);
    filters[match[1]] = new Set([...(filters[match[1]] ?? []), ...values]);
  }

  return { filters, flags };
}

export function selectRefs(filters) {
  return DESIGNER_REFS.filter(
    (entry) =>
      (filters.tab == null || filters.tab.has(entry.tab)) &&
      (filters.width == null || filters.width.has(String(entry.width))) &&
      (filters.sidebar == null || filters.sidebar.has(entry.sidebar)),
  );
}

export function selectRegions(ref, filters) {
  return cropRegions(ref).filter(
    (entry) => filters.region == null || filters.region.has(entry.region),
  );
}

export const DESIGNER_CROPS_DIR = 'reports/visual-qa/designer-crops';
export const DESIGNER_LIVE_DIR = 'reports/visual-qa/designer-live';
export const DESIGNER_DIFF_DIR = 'reports/visual-qa/designer-diff';
export const DESIGNER_REPORT_PATH = 'reports/visual-qa/designer-compare.json';
