import { Quote } from 'lucide-react';
import { getEntry } from '@/lib/knowledge-glossary';

interface ContextualExamplesProps {
  termId?: string;
  title?: string;
  examples?: string[];
}

export function ContextualExamples({ termId, title = 'In context', examples = [] }: ContextualExamplesProps) {
  const entry = termId ? getEntry(termId) : undefined;
  const all = [
    ...(entry?.example ? [entry.example] : []),
    ...examples,
  ];
  if (all.length === 0) return null;

  return (
    <aside className="my-6 rounded-lg border border-border bg-card/50 p-4">
      <header className="flex items-center gap-2 mb-3">
        <Quote className="h-4 w-4 text-primary" aria-hidden />
        <p className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">
          {title}
          {entry && <span className="ml-2 normal-case text-foreground/80">— {entry.term}</span>}
        </p>
      </header>
      <ul className="space-y-2">
        {all.map((ex, i) => (
          <li
            key={i}
            className="border-l-2 border-primary/60 pl-3 text-sm italic text-foreground/85 leading-relaxed"
          >
            {ex}
          </li>
        ))}
      </ul>
    </aside>
  );
}
