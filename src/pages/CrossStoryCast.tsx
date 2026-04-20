import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Search, Users, Rocket } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { type CharacterData } from "@/components/story-character-creator";
import { DEFAULT_CHARACTERS as COA_CHARS } from "@/components/storyplans/CoACharacterCreator";
import { DEFAULT_CHARACTERS as BA_CHARS } from "@/components/storyplans/BACharacterCreator";
import { DEFAULT_CHARACTERS as DA_CHARS } from "@/components/storyplans/DACharacterCreator";
import { DEFAULT_CHARACTERS as EP7_CHARS } from "@/components/storyplans/EP7CharacterCreator";

interface CrossCharacter extends CharacterData {
  storyId: string;
  storyTitle: string;
  storyHref: string;
  storyAccent: string;
}

const STORIES: {
  id: string;
  title: string;
  href: string;
  storageKey: string;
  accent: string;
  defaults: CharacterData[];
}[] = [
  {
    id: "coa",
    title: "Children of Aquarius",
    href: "/astralnaut-studios/children-of-aquarius",
    storageKey: "coa-character-creator",
    accent: "bg-blue-500/15 text-blue-400 border-blue-500/30",
    defaults: COA_CHARS,
  },
  {
    id: "ba",
    title: "Battlefield: Atlantis",
    href: "/astralnaut-studios/battlefield-atlantis",
    storageKey: "ba-character-creator",
    accent: "bg-cyan-500/15 text-cyan-400 border-cyan-500/30",
    defaults: BA_CHARS,
  },
  {
    id: "da",
    title: "Darker Ages",
    href: "/astralnaut-studios/darker-ages",
    storageKey: "da-character-creator",
    accent: "bg-amber-500/15 text-amber-400 border-amber-500/30",
    defaults: DA_CHARS,
  },
  {
    id: "ep7",
    title: "Episode 7",
    href: "/astralnaut-studios/episode-7",
    storageKey: "ep7-character-creator",
    accent: "bg-violet-500/15 text-violet-400 border-violet-500/30",
    defaults: EP7_CHARS,
  },
];

function loadStoryCharacters(storageKey: string, defaults: CharacterData[]): CharacterData[] {
  try {
    const raw = localStorage.getItem(storageKey);
    if (!raw) return defaults;
    const parsed = JSON.parse(raw);
    if (Array.isArray(parsed) && parsed.length > 0) return parsed as CharacterData[];
    return defaults;
  } catch {
    return defaults;
  }
}

export default function CrossStoryCast() {
  const [query, setQuery] = useState("");
  const [storyFilter, setStoryFilter] = useState<string>("all");
  const [classFilter, setClassFilter] = useState<string>("all");
  const [allCharacters, setAllCharacters] = useState<CrossCharacter[]>([]);

  useEffect(() => {
    const merged: CrossCharacter[] = STORIES.flatMap((s) =>
      loadStoryCharacters(s.storageKey, s.defaults).map((c) => ({
        ...c,
        storyId: s.id,
        storyTitle: s.title,
        storyHref: s.href,
        storyAccent: s.accent,
      })),
    );
    setAllCharacters(merged);
  }, []);

  const classOptions = useMemo(() => {
    const set = new Set<string>();
    allCharacters.forEach((c) => c.classRole && set.add(c.classRole));
    return Array.from(set).sort();
  }, [allCharacters]);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    return allCharacters.filter((c) => {
      if (storyFilter !== "all" && c.storyId !== storyFilter) return false;
      if (classFilter !== "all" && c.classRole !== classFilter) return false;
      if (!q) return true;
      const haystack = [
        c.name,
        c.title,
        c.species,
        c.classRole,
        c.backstory,
        ...(c.abilities || []),
        ...(c.equipment || []),
      ]
        .join(" ")
        .toLowerCase();
      return haystack.includes(q);
    });
  }, [allCharacters, query, storyFilter, classFilter]);

  const counts = useMemo(() => {
    const map: Record<string, number> = { all: allCharacters.length };
    STORIES.forEach((s) => {
      map[s.id] = allCharacters.filter((c) => c.storyId === s.id).length;
    });
    return map;
  }, [allCharacters]);

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <Link to="/astralnaut-studios">
            <Button variant="ghost" size="sm" className="-ml-3 mb-2">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Studios
            </Button>
          </Link>
          <div className="flex items-center gap-3 mb-2">
            <Users className="h-7 w-7 text-primary" />
            <h1 className="font-display text-3xl md:text-4xl tracking-wider">
              Cross-Story Cast
            </h1>
          </div>
          <p className="text-sm text-muted-foreground max-w-2xl">
            Every character from all four Astralnaut Studios storyplans in one searchable grid.
            Edits made inside each storyplan's Character Creator are reflected here.
          </p>
        </div>

        {/* Filters */}
        <div className="flex flex-col md:flex-row gap-3 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by name, ability, species, equipment, backstory…"
              className="pl-9"
            />
          </div>
          <Select value={storyFilter} onValueChange={setStoryFilter}>
            <SelectTrigger className="md:w-56">
              <SelectValue placeholder="All stories" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All stories ({counts.all})</SelectItem>
              {STORIES.map((s) => (
                <SelectItem key={s.id} value={s.id}>
                  {s.title} ({counts[s.id] ?? 0})
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={classFilter} onValueChange={setClassFilter}>
            <SelectTrigger className="md:w-48">
              <SelectValue placeholder="All classes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All classes</SelectItem>
              {classOptions.map((c) => (
                <SelectItem key={c} value={c}>
                  {c}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Result count */}
        <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mb-4">
          Showing {filtered.length} of {allCharacters.length} character{allCharacters.length === 1 ? "" : "s"}
        </p>

        {/* Grid */}
        {filtered.length === 0 ? (
          <Card>
            <CardContent className="py-16 text-center text-muted-foreground">
              No characters match the current filters.
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {filtered.map((c) => (
              <Card
                key={`${c.storyId}-${c.id}`}
                className="overflow-hidden hover:border-primary/50 transition-colors flex flex-col"
              >
                <CardHeader className="pb-2">
                  <div className="flex items-start justify-between gap-2">
                    <div className="min-w-0">
                      <CardTitle className="text-base truncate">{c.name}</CardTitle>
                      {c.title && (
                        <p className="text-xs text-muted-foreground line-clamp-2 mt-0.5">
                          {c.title}
                        </p>
                      )}
                    </div>
                  </div>
                  <Link to={c.storyHref} className="inline-block">
                    <Badge
                      variant="outline"
                      className={`text-[10px] font-mono mt-1 ${c.storyAccent}`}
                    >
                      <Rocket className="h-2.5 w-2.5 mr-1" />
                      {c.storyTitle}
                    </Badge>
                  </Link>
                </CardHeader>
                <CardContent className="space-y-2 pt-0 flex-1 flex flex-col">
                  {c.image ? (
                    <img
                      src={c.image}
                      alt={c.name}
                      className="w-full aspect-square object-cover rounded border border-border"
                    />
                  ) : (
                    <div className="w-full aspect-square rounded border border-border bg-secondary/40 flex items-center justify-center text-muted-foreground text-xs font-mono uppercase tracking-wider">
                      No portrait
                    </div>
                  )}

                  <div className="flex flex-wrap gap-1">
                    {c.species && (
                      <Badge variant="secondary" className="text-[10px]">
                        {c.species}
                      </Badge>
                    )}
                    {c.classRole && (
                      <Badge variant="outline" className="text-[10px]">
                        {c.classRole}
                      </Badge>
                    )}
                  </div>

                  {c.abilities?.length > 0 && (
                    <div>
                      <p className="text-[10px] font-mono uppercase tracking-wider text-muted-foreground mb-1">
                        Abilities
                      </p>
                      <div className="flex flex-wrap gap-1">
                        {c.abilities.slice(0, 4).map((a, i) => (
                          <Badge key={i} variant="outline" className="text-[10px]">
                            {a}
                          </Badge>
                        ))}
                        {c.abilities.length > 4 && (
                          <Badge variant="outline" className="text-[10px]">
                            +{c.abilities.length - 4}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}

                  {c.backstory && (
                    <p className="text-xs text-muted-foreground line-clamp-3 mt-auto">
                      {c.backstory}
                    </p>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
