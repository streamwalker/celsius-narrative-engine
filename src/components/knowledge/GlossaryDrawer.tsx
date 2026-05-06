import { createContext, useCallback, useContext, useState, type ReactNode } from 'react';
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetDescription } from '@/components/ui/sheet';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';
import { getEntry, categoryColors, categoryLabels, type KnowledgeEntry } from '@/lib/knowledge-glossary';
import { usePlainEnglish } from './PlainEnglishContext';

interface DrawerCtx {
  open: (idOrTerm: string) => void;
}

const Ctx = createContext<DrawerCtx>({ open: () => {} });

export function GlossaryDrawerProvider({ children }: { children: ReactNode }) {
  const [entry, setEntry] = useState<KnowledgeEntry | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const { plain } = usePlainEnglish();

  const open = useCallback((idOrTerm: string) => {
    const e = getEntry(idOrTerm);
    if (e) {
      setEntry(e);
      setIsOpen(true);
    }
  }, []);

  return (
    <Ctx.Provider value={{ open }}>
      {children}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md overflow-y-auto">
          {entry && (
            <>
              <SheetHeader className="text-left">
                <div className="flex items-center gap-2 mb-1">
                  <Badge variant="outline" className={`text-[10px] ${categoryColors[entry.category]}`}>
                    {categoryLabels[entry.category]}
                  </Badge>
                  {entry.icon && <span className="text-lg" aria-hidden>{entry.icon}</span>}
                </div>
                <SheetTitle className="text-2xl">{entry.term}</SheetTitle>
                <SheetDescription className="text-foreground/80 text-sm leading-relaxed">
                  {plain ? entry.plain : entry.short}
                </SheetDescription>
              </SheetHeader>

              <div className="mt-6 space-y-5 text-sm leading-relaxed">
                {entry.image && (
                  <img
                    src={entry.image}
                    alt={entry.term}
                    className="w-full rounded-md border border-border"
                  />
                )}

                <section>
                  <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-1.5">
                    Full explanation
                  </h3>
                  <p className="text-foreground/90">{plain ? entry.plain : entry.full}</p>
                </section>

                {entry.example && (
                  <section className="rounded-md border-l-2 border-accent bg-accent/5 px-3 py-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-accent mb-1">Example</h3>
                    <p className="italic text-foreground/85">{entry.example}</p>
                  </section>
                )}

                {entry.whyItMatters && (
                  <section className="rounded-md border-l-2 border-primary bg-primary/5 px-3 py-2">
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-1">
                      Why it matters
                    </h3>
                    <p className="text-foreground/85">{entry.whyItMatters}</p>
                  </section>
                )}

                {entry.related && entry.related.length > 0 && (
                  <section>
                    <h3 className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
                      Related
                    </h3>
                    <div className="flex flex-wrap gap-1.5">
                      {entry.related.map((rid) => {
                        const r = getEntry(rid);
                        if (!r) return null;
                        return (
                          <button
                            key={rid}
                            onClick={() => open(rid)}
                            className="inline-flex items-center gap-1 rounded-full border border-border bg-secondary px-2.5 py-1 text-xs hover:bg-secondary/70 hover:border-primary/50 transition-colors"
                          >
                            {r.icon && <span aria-hidden>{r.icon}</span>}
                            {r.term}
                          </button>
                        );
                      })}
                    </div>
                  </section>
                )}

                <div className="pt-2 flex items-center gap-2">
                  <Button asChild variant="outline" size="sm">
                    <Link to={`/glossary?term=${entry.id}`}>
                      Full glossary entry <ExternalLink className="ml-1 h-3 w-3" />
                    </Link>
                  </Button>
                </div>
              </div>
            </>
          )}
        </SheetContent>
      </Sheet>
    </Ctx.Provider>
  );
}

export function useGlossaryDrawer() {
  return useContext(Ctx);
}
