
import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Lightbulb, Film, Tv, ChevronRight } from 'lucide-react';
import { getExamplesForField, getFullTemplates } from '@/lib/film-examples';

interface FilmExampleTooltipProps {
  fieldKey: string;
  onApplyTemplate?: (fields: Record<string, string>) => void;
}

export const FilmExampleTooltip = ({ fieldKey }: FilmExampleTooltipProps) => {
  const examples = getExamplesForField(fieldKey);

  if (examples.length === 0) return null;

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          type="button"
          className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-primary/10 hover:bg-primary/20 text-primary transition-colors"
          aria-label="See examples from popular films"
        >
          <Lightbulb className="h-3 w-3" />
        </button>
      </PopoverTrigger>
      <PopoverContent
        side="right"
        align="start"
        className="w-80 p-0"
        sideOffset={8}
      >
        <div className="p-3 border-b border-border">
          <p className="text-xs font-semibold text-foreground flex items-center gap-1.5">
            <Lightbulb className="h-3.5 w-3.5 text-primary" />
            Examples from Popular Stories
          </p>
          <p className="text-[10px] text-muted-foreground mt-0.5">
            See how pros handle this beat
          </p>
        </div>
        <ScrollArea className="max-h-64">
          <div className="p-2 space-y-1.5">
            {examples.map((ex, i) => (
              <div
                key={i}
                className="rounded-md bg-muted/40 hover:bg-muted/60 p-2.5 transition-colors"
              >
                <div className="flex items-center gap-1.5 mb-1">
                  {ex.medium === 'tv' ? (
                    <Tv className="h-3 w-3 shrink-0 text-amber-400" />
                  ) : (
                    <Film className="h-3 w-3 shrink-0 text-blue-400" />
                  )}
                  <span className="text-xs font-semibold text-foreground truncate">
                    {ex.title}
                  </span>
                  <span className="text-[10px] text-muted-foreground">
                    ({ex.year})
                  </span>
                </div>
                <p className="text-[11px] leading-relaxed text-muted-foreground">
                  {ex.value}
                </p>
              </div>
            ))}
          </div>
        </ScrollArea>
      </PopoverContent>
    </Popover>
  );
};

interface FullTemplatePickerProps {
  onApply: (fields: Record<string, string>) => void;
}

export const FullTemplatePicker = ({ onApply }: FullTemplatePickerProps) => {
  const [expanded, setExpanded] = useState<string | null>(null);
  const [open, setOpen] = useState(false);
  const templates = getFullTemplates();

  const content = (
    <>
      <div className="p-3 border-b border-border">
        <p className="text-xs font-semibold text-foreground">
          🎬 Full Story DNA Templates
        </p>
        <p className="text-[10px] text-muted-foreground mt-0.5">
          Load a complete Core DNA from a popular film or show to study the structure
        </p>
      </div>
      <ScrollArea className="max-h-72">
        <div className="p-2 space-y-1">
          {templates.map((t, i) => (
            <div key={i} className="rounded-md bg-muted/40 hover:bg-muted/60 transition-colors">
              <button
                type="button"
                className="w-full flex items-center justify-between p-2.5 text-left"
                onClick={() => setExpanded(expanded === t.title ? null : t.title)}
              >
                <div className="flex items-center gap-2">
                  {t.medium === 'tv' ? (
                    <Badge variant="outline" className="text-[9px] border-amber-500/50 text-amber-400 px-1.5">TV</Badge>
                  ) : (
                    <Badge variant="outline" className="text-[9px] border-blue-500/50 text-blue-400 px-1.5">FILM</Badge>
                  )}
                  <span className="text-xs font-medium text-foreground">{t.title}</span>
                  <span className="text-[10px] text-muted-foreground">({t.year})</span>
                </div>
                <ChevronRight className={`h-3.5 w-3.5 text-muted-foreground transition-transform ${expanded === t.title ? 'rotate-90' : ''}`} />
              </button>
              {expanded === t.title && (
                <div className="px-2.5 pb-2.5 space-y-2">
                  <p className="text-[11px] text-muted-foreground italic">
                    "{t.fields.theme}"
                  </p>
                  <div className="flex gap-2 text-[10px] flex-wrap">
                    <span className="text-foreground"><strong>Hero:</strong> {t.fields.protag_name}</span>
                    <span className="text-foreground"><strong>Villain:</strong> {t.fields.antag_name}</span>
                  </div>
                  <Button
                    size="sm"
                    variant="secondary"
                    className="w-full text-xs h-7"
                    onClick={(e) => {
                      e.stopPropagation();
                      onApply(t.fields);
                      setOpen(false);
                    }}
                  >
                    Load This Template (Study Mode)
                  </Button>
                </div>
              )}
            </div>
          ))}
        </div>
      </ScrollArea>
    </>
  );

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button
          variant="outline"
          size="sm"
          className="text-xs gap-1.5 border-primary/30 text-primary hover:bg-primary/10"
        >
          <Film className="h-3.5 w-3.5" />
          Load Film Template
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-md p-0 gap-0">
        <DialogHeader className="sr-only">
          <DialogTitle>Film Templates</DialogTitle>
        </DialogHeader>
        {content}
      </DialogContent>
    </Dialog>
  );
};
