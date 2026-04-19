import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  ArrowLeft, Plus, Search, Download, Trash2, User as UserIcon, Eye, FileJson, AlertTriangle,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription,
} from '@/components/ui/dialog';
import { toast } from 'sonner';

const STORAGE_KEY = 'celsius-character-library';

interface SavedCharacter {
  id: string;
  name: string;
  title?: string;
  race?: string;
  classRole?: string;
  species?: string;
  archetype?: string;
  backstory?: string;
  imageUrl?: string;
  createdAt?: string;
  updatedAt?: string;
  [key: string]: unknown;
}

function readLibrary(): SavedCharacter[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeLibrary(characters: SavedCharacter[]) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(characters));
}

function formatRelative(iso?: string): string {
  if (!iso) return '';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const seconds = Math.floor((Date.now() - d.getTime()) / 1000);
  if (seconds < 60) return 'just now';
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function Characters() {
  const navigate = useNavigate();
  const [characters, setCharacters] = useState<SavedCharacter[]>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SavedCharacter | null>(null);

  useEffect(() => { setCharacters(readLibrary()); }, []);

  const filtered = useMemo(() => {
    if (!query.trim()) return characters;
    const q = query.toLowerCase();
    return characters.filter((c) =>
      [c.name, c.title, c.race, c.classRole, c.species, c.archetype, c.backstory]
        .filter(Boolean).join(' ').toLowerCase().includes(q)
    );
  }, [characters, query]);

  const handleDelete = (id: string) => {
    if (!confirm('Delete this character? This action cannot be undone.')) return;
    const next = characters.filter((c) => c.id !== id);
    setCharacters(next);
    writeLibrary(next);
    if (selected?.id === id) setSelected(null);
    toast.success('Character deleted');
  };

  const handleExportAll = () => {
    if (characters.length === 0) {
      toast.error('Nothing to export — your library is empty.');
      return;
    }
    const blob = new Blob([JSON.stringify(characters, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celsius-character-library-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success(`${characters.length} character(s) exported`);
  };

  const handleExportOne = (c: SavedCharacter) => {
    const blob = new Blob([JSON.stringify(c, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${c.name.replace(/[^a-z0-9]+/gi, '-').toLowerCase() || 'character'}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = async (file: File) => {
    try {
      const text = await file.text();
      const parsed = JSON.parse(text);
      const incoming: SavedCharacter[] = Array.isArray(parsed) ? parsed : [parsed];
      const existingIds = new Set(characters.map((c) => c.id));
      const merged = [...characters];
      let added = 0;
      for (const c of incoming) {
        if (!c || typeof c !== 'object') continue;
        const normalized: SavedCharacter = {
          ...c,
          id: c.id || `imported-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          name: String(c.name || 'Unnamed'),
        };
        if (existingIds.has(normalized.id)) continue;
        merged.push(normalized);
        existingIds.add(normalized.id);
        added += 1;
      }
      setCharacters(merged);
      writeLibrary(merged);
      toast.success(`${added} new character(s) added`);
    } catch (err: any) {
      toast.error(`Import failed: ${err.message}`);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <Link to="/">
              <Button variant="ghost" size="icon"><ArrowLeft className="h-5 w-5" /></Button>
            </Link>
            <div>
              <h1 className="font-display text-2xl tracking-wider">Character Library</h1>
              <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mt-1">
                {characters.length} {characters.length === 1 ? 'character' : 'characters'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <label className="cursor-pointer">
              <input type="file" accept=".json,application/json" className="hidden"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleImport(file);
                  e.target.value = '';
                }} />
              <Button variant="outline" size="sm" asChild>
                <span><FileJson className="h-4 w-4 mr-1" /> Import</span>
              </Button>
            </label>
            <Button variant="outline" size="sm" onClick={handleExportAll}>
              <Download className="h-4 w-4 mr-1" /> Export All
            </Button>
            <Button size="sm" onClick={() => navigate('/character-builder')}>
              <Plus className="h-4 w-4 mr-1" /> New Character
            </Button>
          </div>
        </div>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input value={query} onChange={(e) => setQuery(e.target.value)}
            placeholder="Search characters by name, race, class, or backstory…" className="pl-10" />
        </div>

        <div className="mb-6 rounded-md border border-amber-500/20 bg-amber-500/5 p-3 flex items-start gap-2">
          <AlertTriangle className="h-4 w-4 text-amber-500 shrink-0 mt-0.5" />
          <div className="text-xs text-muted-foreground">
            Lean Character Library (list / view / delete / import-export). Advanced features —
            relationship graph, pose gallery, consistency validator — queued for Phase 2b.2. The full Character Builder (
            <Link to="/character-builder" className="text-primary hover:underline">try it</Link>) is live and saves here.
          </div>
        </div>

        {characters.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <UserIcon className="h-10 w-10 text-muted-foreground mx-auto mb-3 opacity-50" />
              <p className="text-muted-foreground mb-4">Your library is empty.</p>
              <Button onClick={() => navigate('/character-builder')}>
                <Plus className="h-4 w-4 mr-1" /> Create your first character
              </Button>
            </CardContent>
          </Card>
        ) : filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center">
              <p className="text-muted-foreground">No characters match &ldquo;{query}&rdquo;.</p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {filtered.map((c) => (
              <Card key={c.id} className="group overflow-hidden hover:border-primary/50 transition-colors">
                <CardContent className="p-0">
                  <div className="flex gap-3 p-4">
                    <div className="w-16 h-16 shrink-0 rounded-md bg-muted overflow-hidden border border-border">
                      {c.imageUrl ? (
                        <img src={c.imageUrl} alt={c.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/30">
                          {c.name[0]?.toUpperCase() || '?'}
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold truncate">{c.name}</h3>
                      {c.title && <p className="text-xs text-muted-foreground truncate">{c.title}</p>}
                      <div className="flex flex-wrap gap-1 mt-1.5">
                        {c.race && <Badge variant="outline" className="text-[10px]">{c.race}</Badge>}
                        {c.classRole && <Badge variant="outline" className="text-[10px]">{c.classRole}</Badge>}
                        {c.species && !c.race && <Badge variant="outline" className="text-[10px]">{c.species}</Badge>}
                      </div>
                      {c.updatedAt && (
                        <p className="text-[10px] text-muted-foreground font-mono mt-1.5">
                          updated {formatRelative(c.updatedAt)}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center border-t border-border">
                    <Button variant="ghost" size="sm" onClick={() => setSelected(c)} className="flex-1 rounded-none justify-center">
                      <Eye className="h-3 w-3 mr-1" /> View
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleExportOne(c)}
                      className="rounded-none border-l border-border px-3" title="Export as JSON">
                      <Download className="h-3 w-3" />
                    </Button>
                    <Button variant="ghost" size="sm" onClick={() => handleDelete(c.id)}
                      className="rounded-none border-l border-border px-3 text-muted-foreground hover:text-destructive" title="Delete">
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      <Dialog open={selected !== null} onOpenChange={(open) => !open && setSelected(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          {selected && (
            <>
              <DialogHeader>
                <DialogTitle className="font-display tracking-wider text-2xl">{selected.name}</DialogTitle>
                {selected.title && <DialogDescription className="text-base">{selected.title}</DialogDescription>}
              </DialogHeader>
              {selected.imageUrl && (
                <img src={selected.imageUrl} alt={selected.name} className="w-full rounded-md border border-border" />
              )}
              <div className="flex flex-wrap gap-1.5">
                {selected.race && <Badge>{selected.race}</Badge>}
                {selected.classRole && <Badge variant="secondary">{selected.classRole}</Badge>}
                {selected.species && <Badge variant="outline">{selected.species}</Badge>}
                {selected.archetype && <Badge variant="outline">{selected.archetype}</Badge>}
              </div>
              {selected.backstory && (
                <div>
                  <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-1">Backstory</p>
                  <p className="text-sm leading-relaxed whitespace-pre-wrap">{selected.backstory}</p>
                </div>
              )}
              <details className="text-xs">
                <summary className="cursor-pointer text-muted-foreground hover:text-foreground font-mono uppercase tracking-widest">Raw data</summary>
                <pre className="mt-2 p-3 rounded bg-muted overflow-x-auto text-[10px]">{JSON.stringify(selected, null, 2)}</pre>
              </details>
              <div className="flex items-center justify-end gap-2 pt-2">
                <Button variant="outline" size="sm" onClick={() => handleExportOne(selected)}>
                  <Download className="h-3 w-3 mr-1" /> Export JSON
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleDelete(selected.id)} className="text-destructive">
                  <Trash2 className="h-3 w-3 mr-1" /> Delete
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}
