'use client';

import React from 'react';
import { ArrowUp } from 'lucide-react';

export function PageSection({ id, title, children }: { id: string; title: string; children: React.ReactNode }) {
  return (
    <div id={id} className="scroll-mt-20 glass-panel border-glow rounded-lg overflow-hidden">
      <div className="border-b border-white/[0.06] px-6 py-4">
        <h3 className="text-lg font-mono tracking-[0.15em] text-accent uppercase">{title}</h3>
      </div>
      <div className="px-6 py-4 space-y-4">{children}</div>
      <div className="px-6 pb-4 pt-1 flex justify-end">
        <button
          type="button"
          onClick={() => {
            const toc = document.getElementById('table-of-contents');
            if (toc) toc.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          className="inline-flex items-center gap-1 text-xs text-muted-foreground/60 hover:text-primary transition-colors"
        >
          <ArrowUp className="w-3 h-3" />
          Back to Table of Contents
        </button>
      </div>
    </div>
  );
}

export function Pre({ children }: { children: React.ReactNode }) {
  return (
    <pre className="whitespace-pre-wrap font-mono text-sm text-muted-foreground/90 leading-relaxed">{children}</pre>
  );
}

export function Heading({ children }: { children: React.ReactNode }) {
  return <h3 className="text-base font-semibold text-foreground font-mono mt-2">{children}</h3>;
}
