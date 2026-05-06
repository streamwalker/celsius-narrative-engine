import { useState, type ReactNode } from 'react';
import { ChevronDown } from 'lucide-react';
import { HighlightedTerm } from './HighlightedTerm';

export interface TimelineItem {
  date: string;
  title: string;
  short: string;
  full?: ReactNode;
  relatedTermIds?: string[];
}

export function TimelineModule({ items, title }: { items: TimelineItem[]; title?: string }) {
  return (
    <section className="space-y-4">
      {title && <h2 className="text-2xl font-semibold">{title}</h2>}
      <ol className="relative border-l-2 border-border pl-5 space-y-4">
        {items.map((it, i) => (
          <TimelineRow key={i} item={it} />
        ))}
      </ol>
    </section>
  );
}

function TimelineRow({ item }: { item: TimelineItem }) {
  const [open, setOpen] = useState(false);
  return (
    <li className="relative">
      <span
        className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full bg-primary ring-4 ring-background"
        aria-hidden
      />
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{item.date}</div>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="mt-0.5 inline-flex items-center gap-1 text-left font-semibold hover:text-primary transition-colors"
        aria-expanded={open}
      >
        {item.title}
        {item.full && (
          <ChevronDown className={`h-3.5 w-3.5 transition-transform ${open ? 'rotate-180' : ''}`} />
        )}
      </button>
      <p className="text-sm text-foreground/80 mt-1 leading-relaxed">{item.short}</p>
      {open && item.full && (
        <div className="mt-2 text-sm text-foreground/85 leading-relaxed animate-in fade-in-50">
          {item.full}
        </div>
      )}
      {item.relatedTermIds && item.relatedTermIds.length > 0 && (
        <div className="mt-2 flex flex-wrap gap-1.5">
          {item.relatedTermIds.map((id) => (
            <HighlightedTerm key={id} termId={id} variant="tooltip" className="text-xs" />
          ))}
        </div>
      )}
    </li>
  );
}
