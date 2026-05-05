/**
 * Pure helpers used by the `letter-page-analyze` edge function to clean up
 * the AI's raw panel detections. Kept in `src/lib` (not under `supabase/`)
 * so the same logic can be unit-tested with Vitest in the browser bundle and
 * imported from the Deno edge function via a relative path.
 *
 * The cleanup pass is deliberately conservative:
 *   - clamp every coordinate to [0, 1];
 *   - drop boxes that are too small;
 *   - drop boxes with extreme aspect ratios (the "paper-thin strip" case
 *     that ruined the user's panel 2 / 3 detection);
 *   - drop boxes that are >80% covered by a larger sibling (overlap dedupe);
 *   - re-sort survivors into Western reading order and re-index from 1.
 */

export interface RawPanel {
  index?: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speakers?: { name: string; x: number; y: number }[];
}

export interface CleanPanel {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speakers: { name: string; x: number; y: number }[];
}

export const PANEL_MIN_SIZE = 0.05;
export const PANEL_MAX_ASPECT = 8;
export const PANEL_OVERLAP_DROP = 0.8;
export const PANEL_ROW_TOLERANCE = 0.05;

const clamp01 = (v: unknown) => Math.max(0, Math.min(1, Number(v) || 0));

/** Normalize a single raw panel: clamp coords + sanitize speakers. */
export function normalizePanel(p: RawPanel, fallbackIndex: number): CleanPanel {
  return {
    index: Number.isFinite(p?.index) ? Number(p.index) : fallbackIndex,
    x: clamp01(p?.x),
    y: clamp01(p?.y),
    w: clamp01(p?.w),
    h: clamp01(p?.h),
    speakers: Array.isArray(p?.speakers)
      ? p!.speakers!
          .map((s) => ({
            name: String(s?.name ?? '').trim(),
            x: clamp01(s?.x),
            y: clamp01(s?.y),
          }))
          .filter((s) => s.name)
      : [],
  };
}

/** True when a panel is large enough and not extreme aspect ratio. */
export function isSanePanel(p: CleanPanel): boolean {
  if (p.w < PANEL_MIN_SIZE || p.h < PANEL_MIN_SIZE) return false;
  const ratio = p.w / p.h;
  if (ratio > PANEL_MAX_ASPECT || ratio < 1 / PANEL_MAX_ASPECT) return false;
  return true;
}

/** Fraction of the smaller box's area that is covered by the intersection. */
export function overlapFractionOfSmaller(a: CleanPanel, b: CleanPanel): number {
  const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
  const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
  const inter = ix * iy;
  const minA = Math.min(a.w * a.h, b.w * b.h);
  return minA > 0 ? inter / minA : 0;
}

/** Sort panels into reading order (top→bottom rows, then left→right). */
export function readingOrder(panels: CleanPanel[]): CleanPanel[] {
  const sorted = [...panels].sort((a, b) => {
    if (Math.abs(a.y - b.y) > PANEL_ROW_TOLERANCE) return a.y - b.y;
    return a.x - b.x;
  });
  return sorted.map((p, i) => ({ ...p, index: i + 1 }));
}

/**
 * End-to-end cleanup: normalize → drop tiny / extreme aspect ratios → drop
 * boxes mostly covered by a larger sibling → re-sort into reading order.
 */
export function cleanPanels(raw: RawPanel[]): CleanPanel[] {
  const mapped = (Array.isArray(raw) ? raw : []).map((p, i) =>
    normalizePanel(p, i + 1)
  );
  const sane = mapped.filter(isSanePanel);
  // Process largest first so later (smaller) boxes are the ones dropped.
  sane.sort((a, b) => b.w * b.h - a.w * a.h);
  const kept: CleanPanel[] = [];
  for (const cand of sane) {
    const overlaps = kept.some(
      (k) => overlapFractionOfSmaller(k, cand) > PANEL_OVERLAP_DROP
    );
    if (!overlaps) kept.push(cand);
  }
  return readingOrder(kept);
}
