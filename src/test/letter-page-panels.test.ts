import { describe, it, expect } from 'vitest';
import {
  cleanPanels,
  isSanePanel,
  normalizePanel,
  overlapFractionOfSmaller,
  readingOrder,
  validatePanelsPayload,
  type CleanPanel,
} from '../../supabase/functions/_shared/letter-page-panels';

const panel = (
  x: number,
  y: number,
  w: number,
  h: number,
  speakers: CleanPanel['speakers'] = []
): CleanPanel => ({ index: 0, x, y, w, h, speakers });

describe('letter-page-panels.cleanPanels', () => {
  it('clamps and indexes a single well-formed panel', () => {
    const out = cleanPanels([{ x: -0.1, y: 0, w: 1.5, h: 0.5 }]);
    expect(out).toHaveLength(1);
    expect(out[0].x).toBe(0);
    expect(out[0].w).toBe(1);
    expect(out[0].index).toBe(1);
  });

  it('drops paper-thin horizontal strips', () => {
    // Strip < min size in height — exactly the regression that broke panels 2/3.
    const out = cleanPanels([
      { x: 0, y: 0.34, w: 1, h: 0.01 }, // strip
      { x: 0, y: 0.34, w: 1, h: 0.16 }, // real panel 2
    ]);
    expect(out).toHaveLength(1);
    expect(out[0].h).toBeCloseTo(0.16, 5);
  });

  it('drops boxes with extreme aspect ratios', () => {
    // 50:1 wide-thin sliver.
    expect(isSanePanel(panel(0, 0.5, 1, 0.01))).toBe(false);
    // 1:50 tall-thin sliver.
    expect(isSanePanel(panel(0.5, 0, 0.01, 1))).toBe(false);
    // Comfortable 4:3 panel.
    expect(isSanePanel(panel(0.1, 0.1, 0.4, 0.3))).toBe(true);
  });

  it('discards near-duplicate overlapping strips while keeping the larger panel', () => {
    const big = { x: 0, y: 0.5, w: 0.49, h: 0.49 }; // panel 3
    const dupStrip = { x: 0.01, y: 0.51, w: 0.47, h: 0.47 }; // ~92% covered by big
    const out = cleanPanels([dupStrip, big]);
    expect(out).toHaveLength(1);
    expect(out[0].w).toBeCloseTo(0.49, 5);
  });

  it('preserves clean panels 2 and 3 from the user regression fixture', () => {
    // Mirrors the AI response from the user's failing run, plus two
    // paper-thin overlapping strips that the previous filter let through.
    const fixture = [
      // Panel 1 — top half
      { x: 0, y: 0, w: 1, h: 0.328, speakers: [{ name: 'ZEUS', x: 0.42, y: 0.13 }] },
      // Bogus paper-thin strip overlapping panel 2
      { x: 0, y: 0.34, w: 1, h: 0.012 },
      // Real panel 2
      { x: 0, y: 0.339, w: 1, h: 0.155, speakers: [{ name: 'RHEA', x: 0.66, y: 0.42 }] },
      // Bogus duplicate of panel 3
      { x: 0.005, y: 0.51, w: 0.48, h: 0.49 },
      // Real panel 3
      { x: 0, y: 0.505, w: 0.49, h: 0.495 },
      // Real panel 4
      { x: 0.509, y: 0.505, w: 0.491, h: 0.495 },
    ];
    const out = cleanPanels(fixture);
    expect(out).toHaveLength(4);
    // Reading-order indexes
    expect(out.map((p) => p.index)).toEqual([1, 2, 3, 4]);
    // Panel 2 is the wide narrow band, not the paper-thin strip
    expect(out[1].h).toBeGreaterThan(0.05);
    expect(out[1].h).toBeLessThan(0.2);
    // Panel 3 is on the left half of the bottom row
    expect(out[2].x).toBeLessThan(0.1);
    expect(out[2].y).toBeGreaterThan(0.4);
    // Panel 4 is on the right half of the bottom row
    expect(out[3].x).toBeGreaterThan(0.4);
  });

  it('re-orders shuffled panels into Western reading order', () => {
    const shuffled = [
      { x: 0.5, y: 0.5, w: 0.4, h: 0.4 },
      { x: 0, y: 0, w: 0.4, h: 0.4 },
      { x: 0, y: 0.5, w: 0.4, h: 0.4 },
      { x: 0.5, y: 0, w: 0.4, h: 0.4 },
    ];
    const out = cleanPanels(shuffled);
    expect(out.map((p) => ({ x: p.x, y: p.y }))).toEqual([
      { x: 0, y: 0 },
      { x: 0.5, y: 0 },
      { x: 0, y: 0.5 },
      { x: 0.5, y: 0.5 },
    ]);
  });

  it('returns [] for non-array / empty input', () => {
    expect(cleanPanels([])).toEqual([]);
    expect(cleanPanels(null as unknown as never[])).toEqual([]);
    expect(cleanPanels(undefined as unknown as never[])).toEqual([]);
  });

  it('strips invalid speaker entries while keeping valid ones', () => {
    const out = cleanPanels([
      {
        x: 0,
        y: 0,
        w: 0.5,
        h: 0.5,
        speakers: [
          { name: 'ZEUS', x: 0.1, y: 0.2 },
          { name: '', x: 0.3, y: 0.3 } as any,
          { x: 0.4, y: 0.4 } as any,
        ],
      },
    ]);
    expect(out[0].speakers).toEqual([{ name: 'ZEUS', x: 0.1, y: 0.2 }]);
  });
});

describe('letter-page-panels helpers', () => {
  it('normalizePanel clamps and falls back to incoming index', () => {
    const n = normalizePanel({ x: 2, y: -1, w: 0.5, h: 0.5 } as any, 7);
    expect(n.index).toBe(7);
    expect(n.x).toBe(1);
    expect(n.y).toBe(0);
  });

  it('overlapFractionOfSmaller computes correct overlap ratio', () => {
    const a = panel(0, 0, 0.4, 0.4);
    const b = panel(0.2, 0.2, 0.4, 0.4); // intersection 0.04, smaller area 0.16
    expect(overlapFractionOfSmaller(a, b)).toBeCloseTo(0.25, 5);
  });

  it('readingOrder rows panels by y-tolerance then by x', () => {
    const ordered = readingOrder([
      panel(0.5, 0.01, 0.3, 0.3),
      panel(0.0, 0.0, 0.3, 0.3),
    ]);
    expect(ordered.map((p) => p.x)).toEqual([0.0, 0.5]);
    expect(ordered.map((p) => p.index)).toEqual([1, 2]);
  });
});
