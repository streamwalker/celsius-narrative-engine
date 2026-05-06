import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react';

interface FootnoteRecord {
  id: string;
  number: number;
  content: ReactNode;
}

interface Ctx {
  register: (id: string, content: ReactNode) => number;
  list: () => FootnoteRecord[];
}

const C = createContext<Ctx | null>(null);

export function FootnotesProvider({ children }: { children: ReactNode }) {
  const [map, setMap] = useState<Map<string, FootnoteRecord>>(new Map());

  const register = useCallback((id: string, content: ReactNode) => {
    let assigned = 0;
    setMap((prev) => {
      if (prev.has(id)) {
        assigned = prev.get(id)!.number;
        return prev;
      }
      const number = prev.size + 1;
      assigned = number;
      const next = new Map(prev);
      next.set(id, { id, number, content });
      return next;
    });
    // For first render the state update is async; derive synchronously
    if (assigned === 0) {
      assigned = map.size + 1;
    }
    return assigned;
  }, [map]);

  const value = useMemo<Ctx>(
    () => ({
      register,
      list: () => Array.from(map.values()).sort((a, b) => a.number - b.number),
    }),
    [register, map],
  );

  return <C.Provider value={value}>{children}</C.Provider>;
}

export function useFootnotes() {
  const ctx = useContext(C);
  if (!ctx) throw new Error('useFootnotes must be used inside <FootnotesProvider>');
  return ctx;
}

export function FootnoteLink({ id, children }: { id: string; children: ReactNode }) {
  const { register } = useFootnotes();
  const number = register(id, children);
  return (
    <sup>
      <a
        id={`fnref-${id}`}
        href={`#fn-${id}`}
        className="text-primary hover:underline ml-0.5 text-[0.7em] font-semibold"
        aria-label={`Footnote ${number}`}
      >
        [{number}]
      </a>
    </sup>
  );
}

export function FootnotesList({ title = 'Notes' }: { title?: string }) {
  const { list } = useFootnotes();
  const items = list();
  if (items.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-6" aria-labelledby="footnotes-title">
      <h2 id="footnotes-title" className="text-sm font-semibold uppercase tracking-wider text-muted-foreground mb-3">
        {title}
      </h2>
      <ol className="space-y-2 text-xs text-foreground/80">
        {items.map((it) => (
          <li key={it.id} id={`fn-${it.id}`} className="leading-relaxed">
            <span className="text-primary font-semibold mr-1">[{it.number}]</span>
            {it.content}{' '}
            <a href={`#fnref-${it.id}`} className="text-muted-foreground hover:text-primary" aria-label="Back to text">
              ↩
            </a>
          </li>
        ))}
      </ol>
    </section>
  );
}
