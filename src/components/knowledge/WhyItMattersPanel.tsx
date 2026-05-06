import type { ReactNode } from 'react';
import { Sparkles } from 'lucide-react';

export function WhyItMattersPanel({
  title = 'Why this matters',
  children,
}: {
  title?: string;
  children: ReactNode;
}) {
  return (
    <aside
      className="relative overflow-hidden rounded-xl border border-primary/30 bg-gradient-to-br from-primary/10 via-card to-accent/10 p-5"
      role="note"
    >
      <div
        className="pointer-events-none absolute -right-16 -top-16 h-40 w-40 rounded-full bg-primary/20 blur-3xl"
        aria-hidden
      />
      <div className="relative">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="h-4 w-4 text-primary" aria-hidden />
          <h3 className="text-sm font-semibold uppercase tracking-wider text-primary">{title}</h3>
        </div>
        <div className="text-sm text-foreground/90 leading-relaxed">{children}</div>
      </div>
    </aside>
  );
}
