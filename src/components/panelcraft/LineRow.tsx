import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { X } from 'lucide-react';
import type { PanelLine, LineTypeId, ToneTag } from '@/lib/panelcraft/types';
import { LINE_TYPES, TONE_TAGS } from '@/lib/panelcraft/constants';
import { cn } from '@/lib/utils';

interface Props {
  line: PanelLine;
  onChange: (line: PanelLine) => void;
  onDelete: () => void;
}

export function LineRow({ line, onChange, onDelete }: Props) {
  const update = (patch: Partial<PanelLine>) => onChange({ ...line, ...patch });
  const isSpeech = ['DIALOGUE', 'THOUGHT', 'WHISPER', 'SHOUT'].includes(line.type);

  return (
    <div className="grid gap-1.5 p-2 rounded bg-muted/30 items-center" style={{ gridTemplateColumns: '110px 1fr 130px 32px' }}>
      <Select value={line.type} onValueChange={(v) => update({ type: v as LineTypeId })}>
        <SelectTrigger className="h-8 font-mono text-[11px]">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {LINE_TYPES.map(t => (
            <SelectItem key={t.id} value={t.id} className="font-mono text-xs">{t.label.toUpperCase()}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <div className="flex gap-1.5">
        {isSpeech && (
          <Input
            value={line.character}
            onChange={(e) => update({ character: e.target.value })}
            placeholder="CHARACTER"
            className="h-8 font-mono text-[11px] uppercase text-accent w-32"
          />
        )}
        <Input
          value={line.text}
          onChange={(e) => update({ text: e.target.value })}
          placeholder={line.type === 'SFX' ? 'KRRRSH' : line.type === 'CAPTION' ? 'caption text…' : 'line of dialogue…'}
          className={cn('h-8 text-sm flex-1', line.type === 'SFX' && 'font-mono font-bold tracking-wider')}
        />
      </div>

      <Select value={line.tone || '__none'} onValueChange={(v) => update({ tone: (v === '__none' ? '' : v) as ToneTag })}>
        <SelectTrigger className={cn('h-8 font-mono text-[10px]', line.tone ? 'text-accent' : 'text-muted-foreground')}>
          <SelectValue placeholder="— tone —" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="__none" className="font-mono text-xs text-muted-foreground">— tone —</SelectItem>
          {TONE_TAGS.map(t => (
            <SelectItem key={t} value={t} className="font-mono text-xs">{t}</SelectItem>
          ))}
        </SelectContent>
      </Select>

      <Button
        variant="ghost"
        size="icon"
        onClick={onDelete}
        className="h-8 w-8 text-destructive opacity-50 hover:opacity-100"
        title="Delete line"
      >
        <X className="h-4 w-4" />
      </Button>
    </div>
  );
}
