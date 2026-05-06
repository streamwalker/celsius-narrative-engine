import type { ReactNode } from 'react';
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@/components/ui/hover-card';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { useIsMobile } from '@/hooks/use-mobile';
import { getEntry, categoryColors, categoryLabels } from '@/lib/knowledge-glossary';
import { usePlainEnglish } from './PlainEnglishContext';
import { useGlossaryDrawer } from './GlossaryDrawer';

interface HighlightedTermProps {
  /** Glossary id or term */
  termId: string;
  /** Display text — defaults to the entry's term */
  children?: ReactNode;
  /** 'tooltip' = short text only; 'card' = rich card; 'popover' = paragraphs + actions */
  variant?: 'tooltip' | 'card' | 'popover';
  className?: string;
}

export function HighlightedTerm({
  termId,
  children,
  variant = 'card',
  className,
}: HighlightedTermProps) {
  const entry = getEntry(termId);
  const { plain } = usePlainEnglish();
  const { open } = useGlossaryDrawer();
  const isMobile = useIsMobile();

  if (!entry) return <>{children ?? termId}</>;

  const label = children ?? entry.term;
  const text = plain ? entry.plain : entry.short;

  const triggerClass = `cursor-pointer underline decoration-dotted decoration-primary/60 underline-offset-4 hover:decoration-primary hover:text-primary transition-colors ${className ?? ''}`;

  // Mobile: always use Popover (click-driven), regardless of variant.
  if (isMobile || variant === 'popover') {
    return (
      <Popover>
        <PopoverTrigger asChild>
          <button type="button" className={triggerClass} aria-label={`Definition of ${entry.term}`}>
            {label}
          </button>
        </PopoverTrigger>
        <PopoverContent side="top" align="start" className="w-80 p-0">
          <Inner entry={entry} text={text} onOpen={() => open(entry.id)} />
        </PopoverContent>
      </Popover>
    );
  }

  if (variant === 'tooltip') {
    return (
      <HoverCard openDelay={120} closeDelay={80}>
        <HoverCardTrigger asChild>
          <button
            type="button"
            onClick={() => open(entry.id)}
            className={triggerClass}
            aria-label={`Definition of ${entry.term}`}
          >
            {label}
          </button>
        </HoverCardTrigger>
        <HoverCardContent side="top" align="start" className="w-64 text-xs leading-relaxed">
          <p className="font-semibold text-foreground mb-1">{entry.term}</p>
          <p className="text-muted-foreground">{text}</p>
        </HoverCardContent>
      </HoverCard>
    );
  }

  // Default: hover card with rich preview
  return (
    <HoverCard openDelay={120} closeDelay={80}>
      <HoverCardTrigger asChild>
        <button
          type="button"
          onClick={() => open(entry.id)}
          className={triggerClass}
          aria-label={`Definition of ${entry.term}`}
        >
          {label}
        </button>
      </HoverCardTrigger>
      <HoverCardContent side="top" align="start" className="w-80 p-0">
        <Inner entry={entry} text={text} onOpen={() => open(entry.id)} />
      </HoverCardContent>
    </HoverCard>
  );
}

function Inner({
  entry,
  text,
  onOpen,
}: {
  entry: ReturnType<typeof getEntry> & object;
  text: string;
  onOpen: () => void;
}) {
  return (
    <div>
      <div className="p-3 border-b border-border">
        <div className="flex items-center gap-2 mb-1">
          {entry.icon && <span aria-hidden>{entry.icon}</span>}
          <p className="text-sm font-semibold text-foreground">{entry.term}</p>
          <Badge variant="outline" className={`text-[9px] ml-auto ${categoryColors[entry.category]}`}>
            {categoryLabels[entry.category]}
          </Badge>
        </div>
        <p className="text-xs text-muted-foreground leading-relaxed">{text}</p>
      </div>
      <div className="p-2 flex items-center justify-end">
        <Button size="sm" variant="ghost" onClick={onOpen} className="text-xs h-7">
          More <ArrowRight className="ml-1 h-3 w-3" />
        </Button>
      </div>
    </div>
  );
}
