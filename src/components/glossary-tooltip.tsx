
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { HelpCircle } from 'lucide-react';
import { getGlossaryEntry } from '@/lib/narrative-glossary';
import { Badge } from '@/components/ui/badge';

interface GlossaryTooltipProps {
  term: string;
}

const categoryColors: Record<string, string> = {
  structure: 'border-blue-500/50 text-blue-400',
  character: 'border-amber-500/50 text-amber-400',
  proprietary: 'border-primary/50 text-primary',
  industry: 'border-emerald-500/50 text-emerald-400',
  medium: 'border-purple-500/50 text-purple-400',
};

const categoryLabels: Record<string, string> = {
  structure: 'Structure',
  character: 'Character',
  proprietary: 'Celsius™',
  industry: 'Industry',
  medium: 'Medium',
};

export const GlossaryTooltip = ({ term }: GlossaryTooltipProps) => {
  const entry = getGlossaryEntry(term);
  if (!entry) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-4 h-4 rounded-full bg-muted/60 hover:bg-muted text-muted-foreground hover:text-foreground transition-colors"
          aria-label={`Definition: ${entry.term}`}
        >
          <HelpCircle className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="top"
        align="start"
        className="w-72 p-0"
        sideOffset={6}
      >
        <div className="p-3 border-b border-border">
          <div className="flex items-center gap-2">
            <p className="text-xs font-semibold text-foreground">{entry.term}</p>
            <Badge variant="outline" className={`text-[8px] px-1.5 py-0 ${categoryColors[entry.category] || ''}`}>
              {categoryLabels[entry.category] || entry.category}
            </Badge>
          </div>
        </div>
        <div className="p-3">
          <p className="text-[11px] leading-relaxed text-muted-foreground">
            {entry.definition}
          </p>
        </div>
      </PopoverContent>
    </Popover>
  );
};
