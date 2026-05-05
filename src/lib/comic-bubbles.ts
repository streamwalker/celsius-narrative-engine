/**
 * Comic bubble model for the Celsius in-canvas bubble editor.
 *
 * Coordinate system:
 *   All x/y/w/h values are normalized 0..1 relative to the panel's rendered
 *   box. This keeps bubble positions resolution-independent so they survive
 *   image regeneration, panel resizing, and export at arbitrary scales.
 *
 * Persistence:
 *   Bubbles are persisted client-side in localStorage keyed by draftId, so
 *   the user's overlay work survives page reloads even before Supabase
 *   storage is wired up.
 */

export type BubbleKind = 'speech' | 'thought' | 'shout' | 'whisper' | 'caption';

export interface BubbleTail {
  /** Tail tip x, normalized 0..1 within the panel box (NOT the bubble box). */
  x: number;
  /** Tail tip y, normalized 0..1 within the panel box. */
  y: number;
}

export interface PanelBubbleData {
  id: string;
  kind: BubbleKind;
  text: string;
  /** Top-left of bubble box, normalized 0..1 within the panel. */
  x: number;
  y: number;
  /** Width / height of bubble box, normalized 0..1 within the panel. */
  w: number;
  h: number;
  /** Tail tip — undefined for captions, present for everything else. */
  tail?: BubbleTail;
  /** Optional speaker id for color-coding the bubble border. */
  speakerId?: string;
}

export interface Speaker {
  id: string;
  name: string;
  color: string;
}

/**
 * Default palette used when auto-assigning colors to speakers derived from
 * parsed dialogue cues. Picked to be distinguishable on both light and dark
 * panels.
 */
export const SPEAKER_PALETTE: readonly string[] = [
  '#ef4444', // red
  '#3b82f6', // blue
  '#10b981', // green
  '#f59e0b', // amber
  '#8b5cf6', // violet
  '#ec4899', // pink
  '#06b6d4', // cyan
  '#84cc16', // lime
  '#f97316', // orange
  '#a855f7', // purple
];

/**
 * Build a stable speaker id from a name. We use this so that the same name
 * always maps to the same color and we don't need to track ids separately.
 */
export function speakerIdFromName(name: string): string {
  return `s_${name.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-')}`;
}

/**
 * Auto-assign colors to a list of speaker names by hashing names against the
 * palette. Order-stable so re-renders don't reshuffle colors.
 */
export function buildSpeakerRoster(names: readonly string[]): Speaker[] {
  const seen = new Set<string>();
  const out: Speaker[] = [];
  for (const raw of names) {
    const name = raw.trim();
    if (!name) continue;
    const id = speakerIdFromName(name);
    if (seen.has(id)) continue;
    seen.add(id);
    out.push({
      id,
      name,
      color: SPEAKER_PALETTE[out.length % SPEAKER_PALETTE.length],
    });
  }
  return out;
}

/** Generate a short random id without pulling in nanoid as a dependency. */
function makeId(): string {
  return Math.random().toString(36).slice(2, 10);
}

/**
 * Construct a fresh bubble with sensible defaults for the requested kind.
 * The bubble is placed near the panel's top-left so it doesn't overlap the
 * subject by default.
 */
export function createBubble(kind: BubbleKind, opts: { text?: string; speakerId?: string } = {}): PanelBubbleData {
  const isCaption = kind === 'caption';
  const defaults: Record<BubbleKind, Partial<PanelBubbleData>> = {
    speech:  { x: 0.06, y: 0.08, w: 0.34, h: 0.18, tail: { x: 0.5, y: 0.7 } },
    thought: { x: 0.06, y: 0.08, w: 0.34, h: 0.18, tail: { x: 0.55, y: 0.75 } },
    shout:   { x: 0.55, y: 0.06, w: 0.36, h: 0.20, tail: { x: 0.5, y: 0.55 } },
    whisper: { x: 0.06, y: 0.72, w: 0.30, h: 0.16, tail: { x: 0.45, y: 0.85 } },
    caption: { x: 0.04, y: 0.04, w: 0.50, h: 0.10 },
  };
  const d = defaults[kind];
  return {
    id: makeId(),
    kind,
    text: opts.text ?? defaultTextForKind(kind),
    x: d.x ?? 0.05,
    y: d.y ?? 0.05,
    w: d.w ?? 0.3,
    h: d.h ?? 0.15,
    tail: isCaption ? undefined : d.tail,
    speakerId: opts.speakerId,
  };
}

function defaultTextForKind(kind: BubbleKind): string {
  switch (kind) {
    case 'speech':  return 'Say something…';
    case 'thought': return '…thinking…';
    case 'shout':   return 'WHAT?!';
    case 'whisper': return '(whisper)';
    case 'caption': return 'Meanwhile…';
  }
}

/**
 * Convert a parsed panel's narration + dialogue strings into seed bubbles so
 * existing scripts don't lose their text when we switch to the new editor.
 */
export function seedBubblesFromScript(args: {
  narration?: string;
  dialogue?: string;
  characters?: readonly string[];
}): PanelBubbleData[] {
  const { narration, dialogue, characters = [] } = args;
  const bubbles: PanelBubbleData[] = [];
  if (narration && narration.trim()) {
    bubbles.push(createBubble('caption', { text: narration.trim() }));
  }
  if (dialogue && dialogue.trim()) {
    const speakerName = characters[0];
    const speakerId = speakerName ? speakerIdFromName(speakerName) : undefined;
    bubbles.push(createBubble('speech', { text: dialogue.trim(), speakerId }));
  }
  return bubbles;
}

/** Clamp a normalized value into [0, 1]. */
export function clamp01(v: number): number {
  return Math.max(0, Math.min(1, v));
}

/** Clamp a bubble's box so it stays inside the panel. */
export function clampBubbleBox(b: PanelBubbleData): PanelBubbleData {
  const w = Math.max(0.06, Math.min(0.98, b.w));
  const h = Math.max(0.04, Math.min(0.98, b.h));
  const x = Math.max(0, Math.min(1 - w, b.x));
  const y = Math.max(0, Math.min(1 - h, b.y));
  const tail = b.tail
    ? { x: clamp01(b.tail.x), y: clamp01(b.tail.y) }
    : undefined;
  return { ...b, x, y, w, h, tail };
}

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const LS_PREFIX = 'celsius:bubbles:';

function lsKey(draftId: string): string {
  return `${LS_PREFIX}${draftId}`;
}

export type BubblesByPanel = Record<string, PanelBubbleData[]>;

/** Load all bubbles for a draft from localStorage. Returns {} on miss/error. */
export function loadBubblesForDraft(draftId: string): BubblesByPanel {
  if (typeof window === 'undefined') return {};
  try {
    const raw = window.localStorage.getItem(lsKey(draftId));
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (parsed && typeof parsed === 'object') return parsed as BubblesByPanel;
  } catch {
    /* ignore — corrupt storage shouldn't break the editor */
  }
  return {};
}

/** Save the entire bubble map for a draft. */
export function saveBubblesForDraft(draftId: string, bubbles: BubblesByPanel): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(lsKey(draftId), JSON.stringify(bubbles));
  } catch {
    /* quota exceeded or storage disabled — silently no-op */
  }
}
