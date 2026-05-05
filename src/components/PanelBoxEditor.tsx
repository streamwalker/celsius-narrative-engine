import { useEffect, useRef, useState } from 'react';
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

/**
 * Overlay that lets the user draw, drag, resize, renumber, and delete
 * panel rectangles on top of the page artwork.
 */
export function PanelBoxEditor({ panels, onChange, enabled }: Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [drag, setDrag] = useState<DragMode>(null);
  const [draftRect, setDraftRect] = useState<PanelBox | null>(null);

  const localCoords = (e: React.MouseEvent | MouseEvent) => {
    const el = containerRef.current;
    if (!el) return { x: 0, y: 0 };
    const r = el.getBoundingClientRect();
    return {
      x: Math.max(0, Math.min(1, (e.clientX - r.left) / r.width)),
      y: Math.max(0, Math.min(1, (e.clientY - r.top) / r.height)),
    };
  };

  useEffect(() => {
    if (!drag) return;
    const onMove = (e: MouseEvent) => {
      const { x, y } = localCoords(e);
      if (drag.type === 'create') {
        const nx = Math.min(drag.startX, x);
        const ny = Math.min(drag.startY, y);
        const nw = Math.abs(x - drag.startX);
        const nh = Math.abs(y - drag.startY);
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
        const nx = Math.max(0, Math.min(1 - p.w, x - drag.offsetX));
        const ny = Math.max(0, Math.min(1 - p.h, y - drag.offsetY));
        next[drag.index] = { ...p, x: nx, y: ny };
        onChange(next);
      } else if (drag.type === 'resize') {
        const next = panels.slice();
        const p = next[drag.index];
        if (!p) return;
        const nx = Math.min(drag.anchorX, x);
        const ny = Math.min(drag.anchorY, y);
        const nw = Math.max(MIN_SIZE, Math.abs(x - drag.anchorX));
        const nh = Math.max(MIN_SIZE, Math.abs(y - drag.anchorY));
        next[drag.index] = { ...p, x: nx, y: ny, w: nw, h: nh };
        onChange(next);
      }
    };
    const onUp = () => {
      if (drag.type === 'create' && draftRect && draftRect.w > MIN_SIZE && draftRect.h > MIN_SIZE) {
        const merged = [...panels, draftRect].map((p, i) => ({ ...p, index: i + 1 }));
        onChange(merged);
      }
      setDrag(null);
      setDraftRect(null);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
    return () => {
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
  }, [drag, draftRect, panels, onChange]);

  const handleBackgroundDown = (e: React.MouseEvent) => {
    if (!enabled) return;
    if (e.button !== 0) return;
    // Only start a draw if the click was on the container itself
    if (e.target !== e.currentTarget) return;
    e.preventDefault();
    const { x, y } = localCoords(e);
    setDrag({ type: 'create', startX: x, startY: y });
    setDraftRect({ index: panels.length + 1, x, y, w: 0, h: 0 });
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

  return (
    <div
      ref={containerRef}
      className={`absolute inset-0 ${enabled ? 'cursor-crosshair' : 'pointer-events-none'}`}
      onMouseDown={handleBackgroundDown}
    >
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
    </div>
  );
}
