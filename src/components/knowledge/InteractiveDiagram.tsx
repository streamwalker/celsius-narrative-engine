import { useState } from 'react';
import { useGlossaryDrawer } from './GlossaryDrawer';
import { getEntry } from '@/lib/knowledge-glossary';

export interface DiagramNode {
  id: string;
  label: string;
  /** position as percentages 0–100 */
  x: number;
  y: number;
  description?: string;
  termId?: string;
}

export interface DiagramEdge {
  from: string; // node id
  to: string;
  label?: string;
}

interface InteractiveDiagramProps {
  nodes: DiagramNode[];
  edges?: DiagramEdge[];
  height?: number;
  caption?: string;
}

export function InteractiveDiagram({
  nodes,
  edges = [],
  height = 380,
  caption,
}: InteractiveDiagramProps) {
  const { open } = useGlossaryDrawer();
  const [active, setActive] = useState<string | null>(null);

  const byId = new Map(nodes.map((n) => [n.id, n]));

  return (
    <figure className="rounded-xl border border-border bg-card/60 p-3">
      <div className="relative w-full" style={{ height }}>
        <svg
          className="absolute inset-0 h-full w-full"
          viewBox="0 0 100 100"
          preserveAspectRatio="none"
          aria-hidden
        >
          {edges.map((e, i) => {
            const a = byId.get(e.from);
            const b = byId.get(e.to);
            if (!a || !b) return null;
            return (
              <line
                key={i}
                x1={a.x}
                y1={a.y}
                x2={b.x}
                y2={b.y}
                stroke="hsl(var(--border))"
                strokeWidth={0.4}
                vectorEffect="non-scaling-stroke"
              />
            );
          })}
        </svg>
        {nodes.map((n) => {
          const isActive = active === n.id;
          return (
            <div
              key={n.id}
              style={{ left: `${n.x}%`, top: `${n.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2"
            >
              <button
                type="button"
                onClick={() => setActive((v) => (v === n.id ? null : n.id))}
                className={`px-3 py-1.5 rounded-full border text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/40 scale-105'
                    : 'bg-card border-border hover:border-primary/60 hover:text-primary'
                }`}
                aria-expanded={isActive}
              >
                {n.label}
              </button>
              {isActive && (n.description || n.termId) && (
                <div className="absolute left-1/2 top-full mt-2 w-56 -translate-x-1/2 rounded-md border border-border bg-popover p-3 text-xs shadow-lg z-10">
                  {n.description && (
                    <p className="text-muted-foreground leading-relaxed">{n.description}</p>
                  )}
                  {n.termId && getEntry(n.termId) && (
                    <button
                      onClick={() => open(n.termId!)}
                      className="mt-2 text-primary hover:underline"
                    >
                      Open full entry →
                    </button>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {caption && (
        <figcaption className="mt-2 text-xs text-muted-foreground text-center">{caption}</figcaption>
      )}
    </figure>
  );
}
