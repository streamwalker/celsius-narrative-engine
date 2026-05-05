import { useEffect, useMemo, useRef, useState } from 'react';
import { X } from 'lucide-react';

export interface PanelBox {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
}

interface Props {
  /** Normalized panel boxes (0..1 relative to image) */
  panels: PanelBox[];
  onChange: (next: PanelBox[]) => void;
  /** When true, dragging on empty space draws a new panel. */
  enabled: boolean;
  /** Grid step in normalized units (0..1). 0 disables grid snapping. */
  gridSize?: number;
  /** Snap to other panels' edges within tolerance. */
  snapToEdges?: boolean;
  /** Snap tolerance in normalized units (default 0.01). */
  snapTolerance?: number;
}

type DragMode =
  | { type: 'create'; startX: number; startY: number }
  | { type: 'move'; index: number; offsetX: number; offsetY: number }
  | {
      type: 'resize';
      index: number;
      anchorX: number;
      anchorY: number;
    }
  | null;

const MIN_SIZE = 0.03;

interface SnapGuide {
  orientation: 'v' | 'h';
  /** Normalized 0..1 position */
  pos: number;
}

/**
 * Overlay that lets the user draw, drag, resize, renumber, and delete
 * panel rectangles on top of the page artwork.
 */
export function PanelBoxEditor({
  panels,
  onChange,
  enabled,
  gridSize = 0,
  snapToEdges = false,
  snapTolerance = 0.01,
}: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode>(null);
  const [draftRect, setDraftRect] = useState<PanelBox | null>(null);
  const [guides, setGuides] = useState<SnapGuide[]>([]);

  const localCoords = (e: React.MouseEvent | MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  };

  /**
   * Snap a single coordinate to the nearest grid line and/or candidate
   * targets (edges from other panels + page borders). Returns the new
   * value and an optional guide line to render.
   */
  const snapCoord = (value: number, candidates: number[], orientation: 'v' | 'h') => {
    let best = value;
    let bestGuide: SnapGuide | null = null;
    let bestDelta = Infinity;

    if (gridSize && gridSize > 0) {
      const snapped = Math.round(value / gridSize) * gridSize;
      const d = Math.abs(snapped - value);
      if (d <= snapTolerance && d < bestDelta) {
        best = snapped;
        bestGuide = { orientation, pos: snapped };
        bestDelta = d;
      }
    }
    if (snapToEdges) {
      for (const c of candidates) {
        const d = Math.abs(c - value);
        if (d <= snapTolerance && d < bestDelta) {
          best = c;
          bestGuide = { orientation, pos: c };
          bestDelta = d;
        }
      }
    }
    return { value: best, guide: bestGuide };
  };

  /** Build edge candidate lists from all panels except the one being edited. */
  const edgeCandidates = useMemo(() => {
    return (excludeIdx: number | null) => {
      const xs: number[] = [0, 1];
      const ys: number[] = [0, 1];
      panels.forEach((p, i) => {
        if (i === excludeIdx) return;
        xs.push(p.x, p.x + p.w);
        ys.push(p.y, p.y + p.h);
      });
      return { xs, ys };
    };
  }, [panels]);

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const { x: rawX, y: rawY } = localCoords(e);
      const collected: SnapGuide[] = [];

      if (drag.type === 'create') {
        const { xs, ys } = edgeCandidates(null);
        const sx = snapCoord(rawX, xs, 'v');
        const sy = snapCoord(rawY, ys, 'h');
        if (sx.guide) collected.push(sx.guide);
        if (sy.guide) collected.push(sy.guide);
        const nx = Math.min(drag.startX, sx.value);
        const ny = Math.min(drag.startY, sy.value);
        const nw = Math.abs(sx.value - drag.startX);
        const nh = Math.abs(sy.value - drag.startY);
        setDraftRect({
          index: panels.length + 1,
          x: nx,
          y: ny,
          w: nw,
          h: nh,
        });
      } else if (drag.type === 'move') {
        const next = panels.slice();
        const p = next[drag.index];
        if (!p) return;
        const { xs, ys } = edgeCandidates(drag.index);
        // Snap left edge; right edge follows from width.
        const targetX = rawX - drag.offsetX;
        const targetY = rawY - drag.offsetY;
        const sxLeft = snapCoord(targetX, xs, 'v');
        const sxRight = snapCoord(targetX + p.w, xs, 'v');
        let nx = sxLeft.value;
        if (sxRight.guide && (!sxLeft.guide || Math.abs(sxRight.value - (targetX + p.w)) < Math.abs(sxLeft.value - targetX))) {
          nx = sxRight.value - p.w;
          if (sxRight.guide) collected.push(sxRight.guide);
        } else if (sxLeft.guide) {
          collected.push(sxLeft.guide);
        }
        const syTop = snapCoord(targetY, ys, 'h');
        const syBot = snapCoord(targetY + p.h, ys, 'h');
        let ny = syTop.value;
        if (syBot.guide && (!syTop.guide || Math.abs(syBot.value - (targetY + p.h)) < Math.abs(syTop.value - targetY))) {
          ny = syBot.value - p.h;
          if (syBot.guide) collected.push(syBot.guide);
        } else if (syTop.guide) {
          collected.push(syTop.guide);
        }
        nx = Math.max(0, Math.min(1 - p.w, nx));
        ny = Math.max(0, Math.min(1 - p.h, ny));
        next[drag.index] = { ...p, x: nx, y: ny };
        onChange(next);
      } else if (drag.type === 'resize') {
        const next = panels.slice();
        const p = next[drag.index];
        if (!p) return;
        const { xs, ys } = edgeCandidates(drag.index);
        const sx = snapCoord(rawX, xs, 'v');
        const sy = snapCoord(rawY, ys, 'h');
        if (sx.guide) collected.push(sx.guide);
        if (sy.guide) collected.push(sy.guide);
        const nx = Math.min(drag.anchorX, sx.value);
        const ny = Math.min(drag.anchorY, sy.value);
        const nw = Math.max(MIN_SIZE, Math.abs(sx.value - drag.anchorX));
        const nh = Math.max(MIN_SIZE, Math.abs(sy.value - drag.anchorY));
        next[drag.index] = { ...p, x: nx, y: ny, w: nw, h: nh };
        onChange(next);
      }
      setGuides(collected);
    };
    const onUp = () => {
      if (drag.type === 'create' && draftRect && draftRect.w > MIN_SIZE && draftRect.h > MIN_SIZE) {
        const merged = [...panels, draftRect].map((p, i) => ({ ...p, index: i + 1 }));
        onChange(merged);
      }
      setDrag(null);
      setDraftRect(null);
      setGuides([]);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, draftRect, panels, onChange, gridSize, snapToEdges, snapTolerance, edgeCandidates]);

  const handleBackgroundDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    if (e.button !== 0) return;
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    const raw = localCoords(e);
    const { xs, ys } = edgeCandidates(null);
    const sx = snapCoord(raw.x, xs, 'v');
    const sy = snapCoord(raw.y, ys, 'h');
    setDrag({ type: 'create', startX: sx.value, startY: sy.value });
    setDraftRect({ index: panels.length + 1, x: sx.value, y: sy.value, w: 0, h: 0 });
  };

  const handlePanelDown = (e: React.MouseEvent, idx: number) => {
    if (!enabled) return;
    e.stopPropagation();
    e.preventDefault();
    const { x, y } = localCoords(e);
    const p = panels[idx];
    setDrag({ type: 'move', index: idx, offsetX: x - p.x, offsetY: y - p.y });
  };

  const handleResizeDown = (e: React.MouseEvent, idx: number) => {
    if (!enabled) return;
    e.stopPropagation();
    e.preventDefault();
    const p = panels[idx];
    setDrag({ type: 'resize', index: idx, anchorX: p.x, anchorY: p.y });
  };

  const removePanel = (idx: number) => {
    const next = panels.filter((_, i) => i !== idx).map((p, i) => ({ ...p, index: i + 1 }));
    onChange(next);
  };

  // Build static grid line positions for visual reference.
  const gridLines = useMemo(() => {
    if (!enabled || !gridSize || gridSize <= 0) return { v: [] as number[], h: [] as number[] };
    const v: number[] = [];
    const h: number[] = [];
    for (let p = gridSize; p < 1 - 1e-6; p += gridSize) {
      v.push(p);
      h.push(p);
    }
    return { v, h };
  }, [enabled, gridSize]);

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${enabled ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onMouseDown={handleBackgroundDown}
    >
      {/* Grid overlay */}
      {enabled && (gridLines.v.length > 0 || gridLines.h.length > 0) && (
        <div className="pointer-events-none absolute inset-0">
          {gridLines.v.map((p) => (
            <div
              key={`gv-${p}`}
              className="absolute top-0 bottom-0 w-px bg-primary/10"
              style={{ left: `${p * 100}%` }}
            />
          ))}
          {gridLines.h.map((p) => (
            <div
              key={`gh-${p}`}
              className="absolute left-0 right-0 h-px bg-primary/10"
              style={{ top: `${p * 100}%` }}
            />
          ))}
        </div>
      )}

      {panels.map((p, idx) => (
        <div
          key={idx}
          className="absolute border-2 border-primary/70 bg-primary/5"
          style={{
            left: `${p.x * 100}%`,
            top: `${p.y * 100}%`,
            width: `${p.w * 100}%`,
            height: `${p.h * 100}%`,
            cursor: enabled ? 'move' : 'default',
          }}
          onMouseDown={(e) => handlePanelDown(e, idx)}
        >
          <div className="absolute -top-3 -left-2 rounded-sm bg-primary px-1.5 py-0.5 font-mono text-[10px] font-bold text-primary-foreground shadow">
            {p.index}
          </div>
          {enabled && (
            <>
              <button
                type="button"
                aria-label="Delete panel"
                className="absolute -top-3 -right-2 flex h-5 w-5 items-center justify-center rounded-full bg-destructive text-destructive-foreground shadow hover:bg-destructive/90"
                onMouseDown={(e) => e.stopPropagation()}
                onClick={(e) => {
                  e.stopPropagation();
                  removePanel(idx);
                }}
              >
                <X className="h-3 w-3" />
              </button>
              <div
                className="absolute -bottom-1.5 -right-1.5 h-3 w-3 cursor-nwse-resize rounded-sm bg-primary shadow"
                onMouseDown={(e) => handleResizeDown(e, idx)}
              />
            </>
          )}
        </div>
      ))}
      {draftRect && (
        <div
          className="pointer-events-none absolute border-2 border-dashed border-primary bg-primary/10"
          style={{
            left: `${draftRect.x * 100}%`,
            top: `${draftRect.y * 100}%`,
            width: `${draftRect.w * 100}%`,
            height: `${draftRect.h * 100}%`,
          }}
        />
      )}
      {/* Active snap guides */}
      {guides.map((g, i) =>
        g.orientation === 'v' ? (
          <div
            key={`sg-${i}`}
            className="pointer-events-none absolute top-0 bottom-0 w-px bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
            style={{ left: `${g.pos * 100}%` }}
          />
        ) : (
          <div
            key={`sg-${i}`}
            className="pointer-events-none absolute left-0 right-0 h-px bg-amber-400 shadow-[0_0_4px_rgba(251,191,36,0.8)]"
            style={{ top: `${g.pos * 100}%` }}
          />
        )
      )}
    </div>
  );
}
