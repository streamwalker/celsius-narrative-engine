import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Search, ChevronRight } from 'lucide-react';
import {
  getAllEntries,
  categoryLabels,
  categoryColors,
  type KnowledgeCategory,
} from '@/lib/knowledge-glossary';
import { useGlossaryDrawer, PlainEnglishToggle, usePlainEnglish } from '@/components/knowledge';

export default function Glossary() {
  const [params] = useSearchParams();
  const initialTerm = params.get('term') ?? '';
  const [q, setQ] = useState(initialTerm);
  const [active, setActive] = useState<KnowledgeCategory | 'all'>('all');
  const { open } = useGlossaryDrawer();
  const { plain } = usePlainEnglish();

  const all = useMemo(() => getAllEntries(), []);
  const cats = useMemo(() => {
    const s = new Set<KnowledgeCategory>();
    all.forEach((e) => s.add(e.category));
    return Array.from(s);
  }, [all]);

  const filtered = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return all.filter((e) => {
      if (active !== 'all' && e.category !== active) return false;
      if (!needle) return true;
      return (
        e.term.toLowerCase().includes(needle) ||
        e.id.toLowerCase().includes(needle) ||
        e.short.toLowerCase().includes(needle) ||
        e.full.toLowerCase().includes(needle)
      );
    });
  }, [all, q, active]);

  useEffect(() => {
    document.title = 'Glossary — Searchable knowledge base';
  }, []);

  return (
    <main className="min-h-screen px-4 sm:px-8 py-8 max-w-6xl mx-auto">


      <nav aria-label="Breadcrumb" className="text-xs text-muted-foreground mb-3">
        <Link to="/" className="hover:text-foreground">Home</Link>
        <ChevronRight className="inline h-3 w-3 mx-1" />
        <span className="text-foreground">Glossary</span>
      </nav>

      <header className="mb-6 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Glossary</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Search and filter every term used across the universe and the platform.
          </p>
        </div>
        <PlainEnglishToggle />
      </header>

      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" aria-hidden />
        <Input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search terms, definitions, ids…"
          className="pl-9 h-11"
          aria-label="Search glossary"
        />
      </div>

      <div className="flex flex-wrap gap-1.5 mb-6">
        <button
          onClick={() => setActive('all')}
          className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
            active === 'all'
              ? 'bg-primary text-primary-foreground border-primary'
              : 'bg-card border-border hover:border-primary/50'
          }`}
        >
          All ({all.length})
        </button>
        {cats.map((c) => {
          const count = all.filter((e) => e.category === c).length;
          return (
            <button
              key={c}
              onClick={() => setActive(c)}
              className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                active === c
                  ? 'bg-primary text-primary-foreground border-primary'
                  : 'bg-card border-border hover:border-primary/50'
              }`}
            >
              {categoryLabels[c]} ({count})
            </button>
          );
        })}
      </div>

      {filtered.length === 0 ? (
        <p className="text-sm text-muted-foreground">No entries match your search.</p>
      ) : (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {filtered.map((e) => (
            <li
              key={e.id}
              className="rounded-lg border border-border bg-card/60 p-4 hover:border-primary/50 transition-colors"
            >
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  {e.icon && <span aria-hidden>{e.icon}</span>}
                  <h2 className="text-sm font-semibold">{e.term}</h2>
                </div>
                <Badge variant="outline" className={`text-[9px] ${categoryColors[e.category]}`}>
                  {categoryLabels[e.category]}
                </Badge>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed line-clamp-3 mb-3">
                {plain ? e.plain : e.short}
              </p>
              <Button size="sm" variant="ghost" className="text-xs h-7 px-2" onClick={() => open(e.id)}>
                Open <ChevronRight className="ml-1 h-3 w-3" />
              </Button>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
