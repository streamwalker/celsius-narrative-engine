import { useState } from 'react';
import { MessageSquare, Cloud, Zap, VolumeX, Captions, Plus, Pencil } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import {
  createBubble,
  speakerIdFromName,
  SPEAKER_PALETTE,
  type BubbleKind,
  type PanelBubbleData,
  type Speaker,
} from '@/lib/comic-bubbles';

/**
 * Toolbar that sits above the panel editor. Provides:
 *   - One button per bubble kind (adds a new bubble of that kind)
 *   - Speaker roster management (add / rename / recolor)
 *
 * Speaker assignment for a specific bubble happens via the floating chrome
 * inside the editor (cycle-on-click); managing the roster itself lives here.
 */
export interface BubbleToolbarProps {
  /** Existing bubbles for the active panel — used to auto-place new ones. */
  bubbles: PanelBubbleData[];
  speakers: Speaker[];
  onAddBubble: (b: PanelBubbleData) => void;
  onSpeakersChange: (next: Speaker[]) => void;
  /** Optional names sourced from the parsed script — surfaced as quick-add chips. */
  suggestedSpeakers?: readonly string[];
  className?: string;
}

interface KindMeta {
  kind: BubbleKind;
  label: string;
  Icon: typeof MessageSquare;
}

const KINDS: readonly KindMeta[] = [
  { kind: 'speech', label: 'Speech', Icon: MessageSquare },
  { kind: 'thought', label: 'Thought', Icon: Cloud },
  { kind: 'shout', label: 'Shout', Icon: Zap },
  { kind: 'whisper', label: 'Whisper', Icon: VolumeX },
  { kind: 'caption', label: 'Caption', Icon: Captions },
];

export function BubbleToolbar({
  bubbles,
  speakers,
  onAddBubble,
  onSpeakersChange,
  suggestedSpeakers = [],
  className,
}: BubbleToolbarProps) {
  const [newName, setNewName] = useState('');
  const [editingSpeakerId, setEditingSpeakerId] = useState<string | null>(null);

  const handleAdd = (kind: BubbleKind) => {
    onAddBubble(stagger(createBubble(kind), bubbles));
  };

  const addSpeaker = (name: string) => {
    const trimmed = name.trim();
    if (!trimmed) return;
    const id = speakerIdFromName(trimmed);
    if (speakers.some((s) => s.id === id)) return;
    const color = SPEAKER_PALETTE[speakers.length % SPEAKER_PALETTE.length];
    onSpeakersChange([...speakers, { id, name: trimmed, color }]);
    setNewName('');
  };

  const renameSpeaker = (id: string, name: string) => {
    onSpeakersChange(speakers.map((s) => (s.id === id ? { ...s, name } : s)));
  };

  const recolorSpeaker = (id: string, color: string) => {
    onSpeakersChange(speakers.map((s) => (s.id === id ? { ...s, color } : s)));
  };

  const removeSpeaker = (id: string) => {
    onSpeakersChange(speakers.filter((s) => s.id !== id));
  };

  const knownIds = new Set(speakers.map((s) => s.id));
  const suggestionChips = suggestedSpeakers
    .filter((n) => !knownIds.has(speakerIdFromName(n)))
    .slice(0, 8);

  return (
    <div className={cn('rounded-md border bg-card p-2 space-y-2', className)}>
      {/* Add-bubble row */}
      <div className="flex flex-wrap items-center gap-1">
        <span className="mr-1 font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Add
        </span>
        {KINDS.map(({ kind, label, Icon }) => (
          <Button
            key={kind}
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => handleAdd(kind)}
            title={`Add ${label.toLowerCase()} bubble`}
          >
            <Icon className="mr-1 h-3 w-3" /> {label}
          </Button>
        ))}
      </div>

      {/* Speaker roster row */}
      <div className="flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          Speakers
        </span>

        {speakers.length === 0 && (
          <span className="text-[10px] italic text-muted-foreground">
            None yet — add speakers to color-code bubbles.
          </span>
        )}

        {speakers.map((s) => (
          <div
            key={s.id}
            className="flex items-center gap-1 rounded border bg-background px-1.5 py-0.5"
          >
            <ColorSwatch color={s.color} onChange={(c) => recolorSpeaker(s.id, c)} />
            {editingSpeakerId === s.id ? (
              <Input
                autoFocus
                value={s.name}
                onChange={(e) => renameSpeaker(s.id, e.target.value)}
                onBlur={() => setEditingSpeakerId(null)}
                onKeyDown={(e) => e.key === 'Enter' && setEditingSpeakerId(null)}
                className="h-6 w-24 text-[11px]"
              />
            ) : (
              <button
                type="button"
                onClick={() => setEditingSpeakerId(s.id)}
                className="text-[11px] hover:underline"
                title="Click to rename"
              >
                {s.name}
              </button>
            )}
            <button
              type="button"
              onClick={() => setEditingSpeakerId(s.id)}
              className="text-muted-foreground hover:text-foreground"
              title="Rename"
            >
              <Pencil className="h-2.5 w-2.5" />
            </button>
            <button
              type="button"
              onClick={() => removeSpeaker(s.id)}
              className="text-[11px] leading-none text-muted-foreground hover:text-destructive"
              title="Remove speaker"
            >
              ×
            </button>
          </div>
        ))}

        {/* New speaker input */}
        <div className="flex items-center gap-1">
          <Input
            value={newName}
            onChange={(e) => setNewName(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && addSpeaker(newName)}
            placeholder="New speaker name"
            className="h-7 w-32 text-[11px]"
          />
          <Button
            type="button"
            variant="outline"
            size="sm"
            className="h-7 px-2 text-[11px]"
            onClick={() => addSpeaker(newName)}
            disabled={!newName.trim()}
          >
            <Plus className="h-3 w-3" />
          </Button>
        </div>

        {suggestionChips.length > 0 && (
          <div className="flex flex-wrap items-center gap-1 border-l pl-2">
            <span className="font-mono text-[9px] uppercase tracking-wider text-muted-foreground">
              From script:
            </span>
            {suggestionChips.map((name) => (
              <button
                key={name}
                type="button"
                onClick={() => addSpeaker(name)}
                className="rounded border border-dashed border-muted-foreground/40 px-1.5 py-0.5 text-[10px] hover:bg-muted"
              >
                + {name}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Internal helpers
// ---------------------------------------------------------------------------

/**
 * Slightly offset a new bubble's position to avoid landing exactly on top of
 * an existing one, so the user can see and grab it immediately.
 */
function stagger(b: PanelBubbleData, existing: PanelBubbleData[]): PanelBubbleData {
  const delta = 0.04;
  let x = b.x;
  let y = b.y;
  while (existing.some((o) => Math.abs(o.x - x) < delta / 2 && Math.abs(o.y - y) < delta / 2)) {
    x += delta;
    y += delta;
    if (x > 0.7 || y > 0.7) {
      x = 0.05;
      y = 0.05;
      break;
    }
  }
  return { ...b, x, y };
}

interface ColorSwatchProps {
  color: string;
  onChange: (color: string) => void;
}

function ColorSwatch({ color, onChange }: ColorSwatchProps) {
  const [open, setOpen] = useState(false);
  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="h-3 w-3 rounded-full border"
        style={{ background: color }}
        title="Change color"
      />
      {open && (
        <div
          className="absolute left-0 top-5 z-30 grid grid-cols-5 gap-1 rounded-md border bg-popover p-1.5 shadow-md"
          onMouseLeave={() => setOpen(false)}
        >
          {SPEAKER_PALETTE.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => {
                onChange(c);
                setOpen(false);
              }}
              className={cn(
                'h-4 w-4 rounded-full border',
                c === color && 'ring-2 ring-foreground ring-offset-1'
              )}
              style={{ background: c }}
            />
          ))}
        </div>
      )}
    </div>
  );
}
