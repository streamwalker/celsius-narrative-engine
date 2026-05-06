import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react';

interface FootnoteRecord {
  id: string;
  number: number;
  content: ReactNode;
}

interface Ctx {
  register: (id: string, content: ReactNode) => number;
}

const C = createContext<Ctx | null>(null);

export function FootnotesProvider({ children }: { children: ReactNode }) {
  // ref-based registry so registering during render does not trigger re-renders mid-render
  const registry = useRef<Map<string, FootnoteRecord>>(new Map());
  const [, force] = useState(0);

  const register = useCallback((id: string, content: ReactNode) => {
    const existing = registry.current.get(id);
    if (existing) return existing.number;
    const number = registry.current.size + 1;
    registry.current.set(id, { id, number, content });
    // schedule a re-render of the FootnotesList consumer asynchronously
    queueMicrotask(() => force((n) => n + 1));
    return number;
  }, []);

  return <C.Provider value={{ register }}>
    <RegistryContext.Provider value={registry}>{children}</RegistryContext.Provider>
  </C.Provider>;
}

const RegistryContext = createContext<React.MutableRefObject<Map<string, FootnoteRecord>> | null>(null);

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
  const reg = useContext(RegistryContext);
  const [tick, setTick] = useState(0);
  useEffect(() => {
    // re-render once after mount to capture any items registered during the same render
    const t = setTimeout(() => setTick((n) => n + 1), 0);
    return () => clearTimeout(t);
  }, []);
  if (!reg) return null;
  const items = Array.from(reg.current.values()).sort((a, b) => a.number - b.number);
  if (items.length === 0) return null;
  return (
    <section className="mt-12 border-t border-border pt-6" aria-labelledby="footnotes-title" data-tick={tick}>
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
