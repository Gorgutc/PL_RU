import { describe, expect, it } from 'vitest';

type DesignerRefsModule = {
  DESIGNER_REFS: Array<{
    file: string;
    height: number;
    id: string;
    sidebar: 'collapsed' | 'expanded';
    tab: 'map' | 'bar' | 'tmi';
    width: number;
  }>;
  cropRegions: (ref: {
    height: number;
    sidebar: 'collapsed' | 'expanded';
    width: number;
  }) => Array<{
    height: number;
    region: string;
    width: number;
    x: number;
    y: number;
  }>;
  parseFilters: (argv: string[]) => {
    filters: { region: Set<string> | null; tab: Set<string> | null; width: Set<string> | null };
    flags: { reportOnly: boolean };
  };
  selectRefs: (filters: {
    region: Set<string> | null;
    sidebar: Set<string> | null;
    tab: Set<string> | null;
    width: Set<string> | null;
  }) => unknown[];
  toleranceFor: (
    ref: { id: string },
    region: string,
  ) => { maxMismatchRatio: number; pixelDelta: number };
};

async function designerRefs(): Promise<DesignerRefsModule> {
  // @ts-expect-error The designer-refs map is an ESM .mjs data module.
  return (await import('../../scripts/visual/designer-refs.map.mjs')) as DesignerRefsModule;
}

describe('designer-refs map', () => {
  it('lists the full 3 tabs x 4 widths x 2 sidebar states matrix with unique ids', async () => {
    const { DESIGNER_REFS } = await designerRefs();

    expect(DESIGNER_REFS).toHaveLength(24);
    expect(new Set(DESIGNER_REFS.map((ref) => ref.id)).size).toBe(24);
    for (const tab of ['map', 'bar', 'tmi']) {
      for (const width of [1280, 1920, 2560, 3840]) {
        expect(DESIGNER_REFS.filter((ref) => ref.tab === tab && ref.width === width)).toHaveLength(
          2,
        );
      }
    }
  });

  it('derives crop regions from the frozen chrome geometry', async () => {
    const { cropRegions } = await designerRefs();

    const regions = cropRegions({ height: 2160, sidebar: 'collapsed', width: 3840 });
    const byName = Object.fromEntries(regions.map((region) => [region.region, region]));

    expect(byName['header']).toEqual({ height: 48, region: 'header', width: 3840, x: 0, y: 0 });
    expect(byName['rail']).toEqual({ height: 2112, region: 'rail', width: 50, x: 0, y: 48 });
    // The 2560 content cap applies at 3840.
    expect(byName['top-controls']).toEqual({
      height: 96,
      region: 'top-controls',
      width: 2560,
      x: 50,
      y: 48,
    });
    expect(byName['bottom-panel']).toEqual({
      height: 96,
      region: 'bottom-panel',
      width: 2560,
      x: 50,
      y: 2064,
    });

    const expanded = cropRegions({ height: 800, sidebar: 'expanded', width: 1280 });
    const expandedTop = expanded.find((region) => region.region === 'top-controls');

    expect(expandedTop).toEqual({ height: 96, region: 'top-controls', width: 1040, x: 240, y: 48 });
  });

  it('merges repeatable filter flags and accepts comma or space separated lists', async () => {
    const { parseFilters, selectRefs } = await designerRefs();

    const { filters, flags } = parseFilters([
      '--tab=map',
      '--tab=bar',
      '--width=1920 1280',
      '--region=header,rail',
      '--report-only',
    ]);

    expect(flags.reportOnly).toBe(true);
    expect([...(filters.tab ?? [])].sort()).toEqual(['bar', 'map']);
    expect([...(filters.width ?? [])].sort()).toEqual(['1280', '1920']);
    expect([...(filters.region ?? [])].sort()).toEqual(['header', 'rail']);
    expect(selectRefs({ ...filters, sidebar: null })).toHaveLength(8);
  });

  it('falls back to the default tolerance for unknown cases', async () => {
    const { toleranceFor } = await designerRefs();

    expect(toleranceFor({ id: 'map-1920-collapsed' }, 'header')).toEqual({
      maxMismatchRatio: 0.065,
      pixelDelta: 32,
    });
  });
});
