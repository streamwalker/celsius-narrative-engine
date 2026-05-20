import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus } from 'lucide-react';
import type { Panel, PanelLine, LineTypeId, PanelFunctionId } from '@/lib/panelcraft/types';
import { PANEL_FUNCTIONS, FUNCTION_MAP, LINE_TYPES, uid, wordCount } from '@/lib/panelcraft/constants';
import { LineRow } from './LineRow';
import { cn } from '@/lib/utils';

interface Props {
  panel: Panel;
  index: number;
  onChange: (panel: Panel) => void;
  onDelete: () => void;
}

export function PanelCard({ panel, index, onChange, onDelete }: Props) {
  const update = (patch: Partial<Panel>) => onChange({ ...panel, ...patch });
  const fn = FUNCTION_MAP[panel.function];
  const totalWords = panel.lines.reduce((s, l) => s + wordCount(l.text), 0);

  const addLine = (type: LineTypeId) => {
    update({ lines: [...panel.lines, { id: uid(), type, character: '', tone: '', text: '' }] });
  };
  const updateLine = (lineId: string, newLine: PanelLine) => {
    update({ lines: panel.lines.map(l => l.id === lineId ? newLine : l) });
  };
  const deleteLine = (lineId: string) => {
    update({ lines: panel.lines.filter(l => l.id !== lineId) });
  };

  return (
    <div
      className="rounded-lg p-4 bg-card border border-border"
      style={{ borderLeft: `3px solid ${fn?.color || 'hsl(var(--muted-foreground))'}` }}
    >
      <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
        <div className="flex items-baseline gap-3">
          <div className="text-lg font-semibold text-accent">Panel {index + 1}</div>
          <Select value={panel.function} onValueChange={(v) => update({ function: v as PanelFunctionId })}>
            <SelectTrigger
              className="h-7 font-mono text-[10px] tracking-wider w-auto gap-2"
              style={{ color: fn?.color, borderColor: fn?.color }}
              title={fn?.desc}
            >
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {PANEL_FUNCTIONS.map(f => (
                <SelectItem key={f.id} value={f.id} className="font-mono text-xs">
                  {f.label.toUpperCase()}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className={cn('text-[10px] font-mono', totalWords > 25 ? 'text-destructive' : 'text-muted-foreground')}>
            {totalWords}w
          </span>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onDelete}
          className="text-destructive opacity-50 hover:opacity-100 h-7"
          title="Delete panel"
        >
          <Trash2 className="h-3.5 w-3.5 mr-1" /> remove
        </Button>
      </div>

      <Textarea
        value={panel.description}
        onChange={(e) => update({ description: e.target.value })}
        placeholder="Visual description: what we see in this panel — composition, action, light, camera."
        rows={2}
        className="text-sm mb-3 resize-none"
      />

      <div className="space-y-1.5">
        {panel.lines.map(line => (
          <LineRow
            key={line.id}
            line={line}
            onChange={(newLine) => updateLine(line.id, newLine)}
            onDelete={() => deleteLine(line.id)}
          />
        ))}
      </div>

      <div className="flex flex-wrap gap-1.5 mt-3">
        {LINE_TYPES.map(t => (
          <Button
            key={t.id}
            variant="outline"
            size="sm"
            onClick={() => addLine(t.id)}
            className="h-7 font-mono text-[10px] opacity-70 hover:opacity-100"
          >
            <Plus className="h-3 w-3 mr-1" />{t.label.toUpperCase()}
          </Button>
        ))}
      </div>
    </div>
  );
}
