import { useState } from 'react';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { useGlossaryDrawer } from './GlossaryDrawer';
import { getEntry } from '@/lib/knowledge-glossary';

export interface AnnotationMarker {
  id: string;
  /** position as percentages 0–100 */
  x: number;
  y: number;
  label: string;
  description?: string;
  /** optional glossary term id; clicking "More" opens the drawer */
  termId?: string;
}

interface AnnotatedImageProps {
  src: string;
  alt: string;
  markers: AnnotationMarker[];
  className?: string;
}

export function AnnotatedImage({ src, alt, markers, className }: AnnotatedImageProps) {
  const { open } = useGlossaryDrawer();
  const [active, setActive] = useState<string | null>(null);

  return (
    <figure className={`relative inline-block w-full max-w-full ${className ?? ''}`}>
      <img src={src} alt={alt} className="w-full rounded-lg border border-border" />
      {markers.map((m, i) => (
        <Popover
          key={m.id}
          open={active === m.id}
          onOpenChange={(o) => setActive(o ? m.id : null)}
        >
          <PopoverTrigger asChild>
            <button
              type="button"
              aria-label={`Annotation: ${m.label}`}
              style={{ left: `${m.x}%`, top: `${m.y}%` }}
              className="absolute -translate-x-1/2 -translate-y-1/2 inline-flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground text-xs font-bold shadow-lg shadow-primary/40 ring-2 ring-background hover:scale-110 transition-transform"
            >
              {i + 1}
            </button>
          </PopoverTrigger>
          <PopoverContent side="top" className="w-72">
            <p className="text-sm font-semibold mb-1">{m.label}</p>
            {m.description && (
              <p className="text-xs text-muted-foreground leading-relaxed">{m.description}</p>
            )}
            {m.termId && getEntry(m.termId) && (
              <button
                onClick={() => {
                  setActive(null);
                  open(m.termId!);
                }}
                className="mt-2 text-xs text-primary hover:underline"
              >
                Open full entry →
              </button>
            )}
          </PopoverContent>
        </Popover>
      ))}
    </figure>
  );
}
