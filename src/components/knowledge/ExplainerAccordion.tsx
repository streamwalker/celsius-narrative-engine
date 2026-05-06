import type { ReactNode } from 'react';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion';
import { Badge } from '@/components/ui/badge';

export interface ExplainerItem {
  id?: string;
  title: string;
  /** Optional category badge text (e.g. "Lore", "Technical", "Backstory") */
  tag?: string;
  /** Short one-liner shown next to the trigger */
  summary?: string;
  content: ReactNode;
}

interface ExplainerAccordionProps {
  items: ExplainerItem[];
  /** Allow multiple sections open at once */
  multiple?: boolean;
  className?: string;
}

export function ExplainerAccordion({ items, multiple = false, className }: ExplainerAccordionProps) {
  const common = {
    className: `w-full rounded-xl border border-border bg-card/40 px-2 sm:px-4 ${className ?? ''}`,
  };

  const renderItems = items.map((it, i) => {
    const value = it.id ?? `item-${i}`;
    return (
      <AccordionItem key={value} value={value} className="border-border">
        <AccordionTrigger className="text-left">
          <div className="flex flex-1 items-center gap-2 pr-2">
            {it.tag && (
              <Badge variant="outline" className="text-[9px] uppercase tracking-wider">
                {it.tag}
              </Badge>
            )}
            <span className="text-sm font-medium">{it.title}</span>
            {it.summary && (
              <span className="hidden sm:inline text-xs text-muted-foreground truncate ml-2">
                — {it.summary}
              </span>
            )}
          </div>
        </AccordionTrigger>
        <AccordionContent className="text-sm text-foreground/85 leading-relaxed">
          {it.content}
        </AccordionContent>
      </AccordionItem>
    );
  });

  return multiple ? (
    <Accordion type="multiple" {...common}>
      {renderItems}
    </Accordion>
  ) : (
    <Accordion type="single" collapsible {...common}>
      {renderItems}
    </Accordion>
  );
}
