import { useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import { Trash2, MessageCircle, Lock, Unlock } from 'lucide-react';
import { cn } from '@/lib/utils';
import {
  clampBubbleBox,
  type PanelBubbleData,
  type Speaker,
} from '@/lib/comic-bubbles';
import { BubbleShape } from './BubbleShape';

/**
 * Interactive panel bubble editor — overlays a panel image with draggable,
 * resizable, in-place editable speech / thought / shout / whisper / caption
 * bubbles, and lets the user drag the tail tip to re-target a speaker.
 *
 * Coordinate model: every bubble's x/y/w/h and tail.x/tail.y are normalized
 * 0..1 against the panel container's measured size, so positions survive
 * resizes and exports.
 */
export interface PanelBubbleEditorProps {
  imageUrl?: string;
  bubbles: PanelBubbleData[];
  speakers: Speaker[];
  onChange: (next: PanelBubbleData[]) => void;
  /** Notify parent of the currently selected bubble (used by the toolbar). */
  onSelectionChange?: (bubbleId: string | null) => void;
  /** Render-only mode — disables drag, resize, edit, and selection chrome. */
  readOnly?: boolean;
  /** Optional placeholder when imageUrl is missing. */
  placeholder?: React.ReactNode;
  /** Aspect ratio of the panel container. Defaults to 4/3 to match ComicPanel. */
  aspectRatio?: number;
  className?: string;
}

type DragMode =
  | { kind: 'move'; bubbleId: string; startNX: number; startNY: number; b0: PanelBubbleData }
  | { kind: 'resize'; bubbleId: string; startNX: number; startNY: number; b0: PanelBubbleData }
  | { kind: 'tail'; bubbleId: string };

const DEFAULT_COLOR = '#111111';

export function PanelBubbleEditor({
  imageUrl,
  bubbles,
  speakers,
  onChange,
  onSelectionChange,
  readOnly,
  placeholder,
  aspectRatio = 4 / 3,
  className,
}: PanelBubbleEditorProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const dragRef = useRef<DragMode | null>(null);
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);

  useEffect(() => {
    onSelectionChange?.(selectedId);
  }, [selectedId, onSelectionChange]);

  const speakerById = useMemo(() => {
    const m = new Map<string, Speaker>();
    for (const s of speakers) m.set(s.id, s);
    return m;
  }, [speakers]);

  const colorFor = (b: PanelBubbleData) => {
    if (!b.speakerId) return DEFAULT_COLOR;
    return speakerById.get(b.speakerId)?.color ?? DEFAULT_COLOR;
  };

  const updateBubble = (id: string, patch: Partial<PanelBubbleData>) => {
    onChange(
      bubbles.map((b) => (b.id === id ? clampBubbleBox({ ...b, ...patch }) : b))
    );
  };

  const removeBubble = (id: string) => {
    onChange(bubbles.filter((b) => b.id !== id));
    if (selectedId === id) setSelectedId(null);
    if (editingId === id) setEditingId(null);
  };

  // ---- Pointer-position helpers ------------------------------------------------
  const pointerToNormalized = (clientX: number, clientY: number): [number, number] => {
    const el = containerRef.current;
    if (!el) return [0, 0];
    const r = el.getBoundingClientRect();
    return [(clientX - r.left) / r.width, (clientY - r.top) / r.height];
  };

  // ---- Drag handlers -----------------------------------------------------------
  const beginDrag = (
    e: ReactPointerEvent,
    mode: DragMode
  ) => {
    if (readOnly) return;
    e.preventDefault();
    e.stopPropagation();
    (e.currentTarget as Element).setPointerCapture(e.pointerId);
    dragRef.current = mode;
    setSelectedId(mode.bubbleId);
  };

  const handlePointerMove = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;
    const [nx, ny] = pointerToNormalized(e.clientX, e.clientY);
    if (drag.kind === 'move') {
      const dx = nx - drag.startNX;
      const dy = ny - drag.startNY;
      updateBubble(drag.bubbleId, {
        x: drag.b0.x + dx,
        y: drag.b0.y + dy,
      });
    } else if (drag.kind === 'resize') {
      const dx = nx - drag.startNX;
      const dy = ny - drag.startNY;
      updateBubble(drag.bubbleId, {
        w: drag.b0.w + dx,
        h: drag.b0.h + dy,
      });
    } else if (drag.kind === 'tail') {
      updateBubble(drag.bubbleId, { tail: { x: nx, y: ny } });
    }
  };

  const handlePointerUp = (e: ReactPointerEvent) => {
    const drag = dragRef.current;
    dragRef.current = null;
    if (drag && (e.currentTarget as Element).hasPointerCapture(e.pointerId)) {
      (e.currentTarget as Element).releasePointerCapture(e.pointerId);
    }
  };

  // Deselect on background click
  const handleBackgroundPointerDown = () => {
    if (readOnly) return;
    setSelectedId(null);
    setEditingId(null);
  };

  // Keyboard: delete to remove selected, escape to deselect
  useEffect(() => {
    if (readOnly) return;
    const onKey = (e: KeyboardEvent) => {
      if (editingId) return; // never intercept while editing text
      if (!selectedId) return;
      if (e.key === 'Delete' || e.key === 'Backspace') {
        e.preventDefault();
        removeBubble(selectedId);
      } else if (e.key === 'Escape') {
        setSelectedId(null);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedId, editingId, readOnly, bubbles]);

  // ---- Render -----------------------------------------------------------------
  // Render the selected bubble last so its interactive layer sits on top.
  const renderOrder = useMemo(() => {
    const arr = [...bubbles];
    arr.sort((a, b) => (a.id === selectedId ? 1 : 0) - (b.id === selectedId ? 1 : 0));
    return arr;
  }, [bubbles, selectedId]);

  return (
    <div
      ref={containerRef}
      className={cn('relative w-full select-none overflow-hidden', className)}
      style={{ aspectRatio: String(aspectRatio) }}
      onPointerDown={handleBackgroundPointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
    >
      {/* Background image / placeholder */}
      <div className="absolute inset-0 bg-gradient-to-br from-secondary to-muted">
        {imageUrl ? (
          <img
            src={imageUrl}
            alt=""
            className="h-full w-full object-cover"
            draggable={false}
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center p-3 text-center text-[10px] text-muted-foreground">
            {placeholder ?? 'No image yet — generate the panel first.'}
          </div>
        )}
      </div>

      {/* SVG shape layer — pointer events disabled so HTML overlays can receive them */}
      <svg
        className="pointer-events-none absolute inset-0 h-full w-full"
        viewBox="0 0 100 100"
        preserveAspectRatio="none"
        aria-hidden
      >
        {bubbles.map((b) => (
          <BubbleShape
            key={b.id}
            bubble={b}
            color={colorFor(b)}
            selected={!readOnly && b.id === selectedId}
          />
        ))}
      </svg>

      {/* HTML interactive layer */}
      {renderOrder.map((b) => (
        <InteractiveBubble
          key={b.id}
          bubble={b}
          color={colorFor(b)}
          selected={!readOnly && b.id === selectedId}
          editing={!readOnly && b.id === editingId}
          readOnly={Boolean(readOnly)}
          onPointerDownBody={(e) =>
            beginDrag(e, {
              kind: 'move',
              bubbleId: b.id,
              startNX: pointerToNormalized(e.clientX, e.clientY)[0],
              startNY: pointerToNormalized(e.clientX, e.clientY)[1],
              b0: b,
            })
          }
          onPointerDownResize={(e) =>
            beginDrag(e, {
              kind: 'resize',
              bubbleId: b.id,
              startNX: pointerToNormalized(e.clientX, e.clientY)[0],
              startNY: pointerToNormalized(e.clientX, e.clientY)[1],
              b0: b,
            })
          }
          onPointerDownTail={(e) =>
            beginDrag(e, { kind: 'tail', bubbleId: b.id })
          }
          onRequestEdit={() => setEditingId(b.id)}
          onCommitEdit={(text) => {
            updateBubble(b.id, { text });
            setEditingId(null);
          }}
          onRequestDelete={() => removeBubble(b.id)}
          onToggleLock={() => updateBubble(b.id, { locked: !b.locked })}
          onCycleSpeaker={() => {
            // Cycle: none → speaker 0 → speaker 1 → … → none
            if (speakers.length === 0) return;
            const current = b.speakerId
              ? speakers.findIndex((s) => s.id === b.speakerId)
              : -1;
            const nextIdx = current + 1;
            const nextId = nextIdx >= speakers.length ? undefined : speakers[nextIdx].id;
            updateBubble(b.id, { speakerId: nextId });
          }}
          speakerName={b.speakerId ? speakerById.get(b.speakerId)?.name : undefined}
        />
      ))}
    </div>
  );
}

// ---------------------------------------------------------------------------
// Per-bubble HTML overlay
// ---------------------------------------------------------------------------

interface InteractiveBubbleProps {
  bubble: PanelBubbleData;
  color: string;
  selected: boolean;
  editing: boolean;
  readOnly: boolean;
  onPointerDownBody: (e: ReactPointerEvent) => void;
  onPointerDownResize: (e: ReactPointerEvent) => void;
  onPointerDownTail: (e: ReactPointerEvent) => void;
  onRequestEdit: () => void;
  onCommitEdit: (text: string) => void;
  onRequestDelete: () => void;
  onToggleLock: () => void;
  onCycleSpeaker: () => void;
  speakerName?: string;
}

function InteractiveBubble({
  bubble,
  color,
  selected,
  editing,
  readOnly,
  onPointerDownBody,
  onPointerDownResize,
  onPointerDownTail,
  onRequestEdit,
  onCommitEdit,
  onRequestDelete,
  onCycleSpeaker,
  speakerName,
}: InteractiveBubbleProps) {
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const [draft, setDraft] = useState(bubble.text);

  useEffect(() => {
    setDraft(bubble.text);
  }, [bubble.text]);

  useEffect(() => {
    if (editing) {
      const ta = textareaRef.current;
      if (ta) {
        ta.focus();
        ta.select();
      }
    }
  }, [editing]);

  // Position styles (percent of container)
  const wrapperStyle: React.CSSProperties = {
    left: `${bubble.x * 100}%`,
    top: `${bubble.y * 100}%`,
    width: `${bubble.w * 100}%`,
    height: `${bubble.h * 100}%`,
  };

  const padding = bubble.kind === 'shout' ? '8% 12%' : '6% 9%';
  const fontStyle: React.CSSProperties = {
    fontFamily: '"Comic Neue", "Comic Sans MS", system-ui, sans-serif',
    fontWeight: bubble.kind === 'shout' ? 900 : 700,
    fontStyle: bubble.kind === 'thought' ? 'italic' : 'normal',
    fontSize: bubble.kind === 'shout' ? '1.05rem' : '0.78rem',
    lineHeight: 1.15,
    textAlign: 'center',
    color: '#111',
    textTransform: bubble.kind === 'shout' ? 'uppercase' : 'none',
    letterSpacing: bubble.kind === 'whisper' ? '0.04em' : 'normal',
  };

  const handleDoubleClick = (e: React.MouseEvent) => {
    if (readOnly) return;
    e.stopPropagation();
    onRequestEdit();
  };

  return (
    <>
      {/* Bubble body wrapper — drag area + text */}
      <div
        className={cn(
          'absolute flex items-center justify-center',
          readOnly ? 'pointer-events-none' : 'cursor-move',
          editing && 'cursor-text'
        )}
        style={wrapperStyle}
        onPointerDown={editing ? undefined : onPointerDownBody}
        onDoubleClick={handleDoubleClick}
      >
        {editing ? (
          <textarea
            ref={textareaRef}
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onBlur={() => onCommitEdit(draft)}
            onKeyDown={(e) => {
              if (e.key === 'Escape') {
                e.preventDefault();
                onCommitEdit(bubble.text); // discard
              } else if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
                e.preventDefault();
                onCommitEdit(draft);
              }
            }}
            onPointerDown={(e) => e.stopPropagation()}
            className="h-full w-full resize-none border-none bg-transparent text-center outline-none"
            style={{ ...fontStyle, padding }}
          />
        ) : (
          <div
            className="h-full w-full overflow-hidden"
            style={{ ...fontStyle, padding, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          >
            {bubble.text}
          </div>
        )}
      </div>

      {/* Selection chrome — only when selected and not editing */}
      {selected && !editing && (
        <>
          {/* Resize handle (bottom-right of bubble) */}
          <button
            type="button"
            aria-label="Resize bubble"
            onPointerDown={onPointerDownResize}
            className="absolute z-30 h-3 w-3 cursor-nwse-resize rounded-sm border border-white shadow"
            style={{
              left: `calc(${(bubble.x + bubble.w) * 100}% - 6px)`,
              top: `calc(${(bubble.y + bubble.h) * 100}% - 6px)`,
              background: color,
            }}
          />

          {/* Tail tip handle */}
          {bubble.tail && (
            <button
              type="button"
              aria-label="Move tail target"
              onPointerDown={onPointerDownTail}
              className="absolute z-30 h-3.5 w-3.5 cursor-grab rounded-full border-2 border-white shadow"
              style={{
                left: `calc(${bubble.tail.x * 100}% - 7px)`,
                top: `calc(${bubble.tail.y * 100}% - 7px)`,
                background: color,
              }}
            />
          )}

          {/* Toolbar floating just above the bubble */}
          <div
            className="absolute z-30 flex items-center gap-1 rounded-md border bg-background/95 px-1.5 py-1 shadow-sm backdrop-blur-sm"
            style={{
              left: `${bubble.x * 100}%`,
              top: `calc(${bubble.y * 100}% - 28px)`,
            }}
            onPointerDown={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={onCycleSpeaker}
              className="h-3 w-3 rounded-full border hover:scale-110 transition-transform"
              style={{ background: color }}
              title={speakerName ? `Speaker: ${speakerName} — click to cycle` : 'Assign speaker'}
            />
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              {bubble.kind}
              {speakerName ? ` · ${speakerName}` : ''}
            </span>
            <button
              type="button"
              onClick={onRequestEdit}
              className="rounded px-1 py-0.5 text-[10px] hover:bg-muted"
              title="Edit text"
            >
              <MessageCircle className="h-3 w-3" />
            </button>
            <button
              type="button"
              onClick={onRequestDelete}
              className="rounded px-1 py-0.5 text-[10px] text-destructive hover:bg-destructive/10"
              title="Delete bubble"
            >
              <Trash2 className="h-3 w-3" />
            </button>
          </div>
        </>
      )}
    </>
  );
}
