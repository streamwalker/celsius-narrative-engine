import React, { useState, useEffect, useCallback, forwardRef } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from "@/components/ui/collapsible";
import CharacterAppearanceEditor from "@/components/character-appearance-editor";
import { type CharacterAppearance, DEFAULT_APPEARANCE, buildAppearancePrompt } from "@/lib/character-appearance-data";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import { RotateCcw, Plus, X, Swords, Shield, Zap, RefreshCw, Loader2, Download, GitCompare, Paintbrush, ChevronDown } from "lucide-react";
import { supabase } from '@/integrations/supabase/client';
import { toast } from "sonner";
import {
  RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer, Legend,
} from "recharts";

/* ── types ── */
export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  willpower: number;
  charisma: number;
  psiPower: number;
}

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  species: string;
  classRole: string;
  abilities: string[];
  stats: CharacterStats;
  equipment: string[];
  backstory: string;
  alignmentLaw: number;
  alignmentMoral: number;
  image: string;
  appearance?: CharacterAppearance;
}

export interface StoryCharacterCreatorProps {
  storyTitle: string;
  storageKey: string;
  defaultCharacters: CharacterData[];
  speciesOptions: string[];
  classOptions: string[];
  portraitDescriptions?: Record<string, string>;
  headerImage?: string;
  profileImage?: string;
  characterCount: number;
  clothingCategories?: string[];
}

const STAT_LABELS: { key: keyof CharacterStats; label: string; icon: string }[] = [
  { key: "strength", label: "STR", icon: "💪" },
  { key: "agility", label: "AGI", icon: "⚡" },
  { key: "intelligence", label: "INT", icon: "🧠" },
  { key: "willpower", label: "WIL", icon: "🔥" },
  { key: "charisma", label: "CHA", icon: "✨" },
  { key: "psiPower", label: "PSI", icon: "🔮" },
];

/* ── tag input helper ── */
const TagInput = forwardRef<HTMLDivElement, {
  tags: string[];
  onChange: (t: string[]) => void;
  placeholder: string;
}>(({ tags, onChange, placeholder }, ref) => {
  const [input, setInput] = useState("");

  const add = () => {
    const v = input.trim();
    if (v && !tags.includes(v)) {
      onChange([...tags, v]);
      setInput("");
    }
  };

  return (
    <div ref={ref} className="space-y-2">
      <div className="flex flex-wrap gap-1.5">
        {tags.map((t) => (
          <Badge key={t} variant="secondary" className="gap-1 bg-accent/20 text-accent border-accent/30">
            {t}
            <button onClick={() => onChange(tags.filter((x) => x !== t))} className="ml-0.5 hover:text-destructive">
              <X className="w-3 h-3" />
            </button>
          </Badge>
        ))}
      </div>
      <div className="flex gap-2">
        <Input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), add())}
          placeholder={placeholder}
          className="bg-background/50 border-white/10 text-sm font-mono"
        />
        <Button type="button" size="sm" variant="outline" onClick={add} className="shrink-0">
          <Plus className="w-3 h-3" />
        </Button>
      </div>
    </div>
  );
});
TagInput.displayName = "TagInput";

/* ── alignment label helpers ── */
function lawLabel(v: number) {
  if (v < 33) return "Lawful";
  if (v < 67) return "Neutral";
  return "Chaotic";
}
function moralLabel(v: number) {
  if (v < 33) return "Good";
  if (v < 67) return "Neutral";
  return "Evil";
}

/* ── Export Character Sheet ── */
function exportCharacterSheet(characters: CharacterData[], getCharImage: (c: CharacterData) => string, storyTitle: string) {
  const statBar = (label: string, value: number) =>
    `<div style="display:flex;align-items:center;gap:8px;margin:2px 0">
      <span style="width:32px;font-size:11px;color:#d4a574;font-family:monospace">${label}</span>
      <div style="flex:1;height:8px;background:#1a1a2e;border-radius:4px;overflow:hidden">
        <div style="width:${value}%;height:100%;background:linear-gradient(90deg,#d97706,#f59e0b);border-radius:4px"></div>
      </div>
      <span style="width:24px;text-align:right;font-size:11px;color:#f59e0b;font-family:monospace">${value}</span>
    </div>`;

  const charCard = (c: CharacterData) =>
    `<div style="break-inside:avoid;background:#0f0f1a;border:1px solid rgba(255,255,255,0.08);border-radius:12px;padding:20px;margin-bottom:16px">
      <div style="display:flex;gap:16px">
        <img src="${getCharImage(c)}" style="width:120px;height:160px;object-fit:cover;border-radius:8px;border:1px solid rgba(255,255,255,0.1)" />
        <div style="flex:1">
          <h2 style="margin:0 0 4px;color:#f59e0b;font-size:18px;font-family:'Bangers',cursive,sans-serif;letter-spacing:2px">${c.name}</h2>
          <p style="margin:0 0 8px;color:#a0a0b0;font-size:12px">${c.title}</p>
          <p style="margin:0;color:#888;font-size:11px;font-family:monospace">${c.species} · ${c.classRole}</p>
          <div style="margin-top:12px">
            ${STAT_LABELS.map((s) => statBar(s.label, c.stats[s.key])).join("")}
          </div>
        </div>
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:12px">
        <div>
          <h4 style="margin:0 0 4px;color:#d4a574;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:2px">Abilities</h4>
          <div style="display:flex;flex-wrap:wrap;gap:4px">${c.abilities.map((a) => `<span style="background:rgba(217,119,6,0.15);color:#f59e0b;padding:2px 8px;border-radius:4px;font-size:11px;border:1px solid rgba(217,119,6,0.3)">${a}</span>`).join("")}</div>
        </div>
        <div>
          <h4 style="margin:0 0 4px;color:#d4a574;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:2px">Equipment</h4>
          <div style="display:flex;flex-wrap:wrap;gap:4px">${c.equipment.map((e) => `<span style="background:rgba(100,100,200,0.1);color:#9090d0;padding:2px 8px;border-radius:4px;font-size:11px;border:1px solid rgba(100,100,200,0.2)">${e}</span>`).join("")}</div>
        </div>
      </div>
      <div style="margin-top:12px">
        <h4 style="margin:0 0 4px;color:#d4a574;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:2px">Alignment</h4>
        <p style="margin:0;color:#888;font-size:11px;font-family:monospace">${lawLabel(c.alignmentLaw)} ${moralLabel(c.alignmentMoral)}</p>
      </div>
      <div style="margin-top:8px">
        <h4 style="margin:0 0 4px;color:#d4a574;font-size:11px;font-family:monospace;text-transform:uppercase;letter-spacing:2px">Backstory</h4>
        <p style="margin:0;color:#a0a0b0;font-size:11px;line-height:1.5">${c.backstory}</p>
      </div>
    </div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${storyTitle} — Character Sheets</title>
    <style>
      @import url('https://fonts.googleapis.com/css2?family=Bangers&display=swap');
      body{margin:0;padding:24px;background:#090912;color:#e0e0e0;font-family:system-ui,sans-serif}
      h1{text-align:center;color:#f59e0b;font-family:'Bangers',cursive;letter-spacing:4px;font-size:28px;margin-bottom:24px}
      .grid{columns:2;column-gap:16px}
      @media print{body{background:#090912;-webkit-print-color-adjust:exact;print-color-adjust:exact} .grid{columns:2}}
      @media(max-width:800px){.grid{columns:1}}
    </style></head><body>
    <h1>⚔️ ${storyTitle.toUpperCase()} — CHARACTER SHEETS</h1>
    <div class="grid">${characters.map(charCard).join("")}</div>
    </body></html>`;

  const w = window.open("", "_blank");
  if (w) {
    w.document.write(html);
    w.document.close();
    setTimeout(() => w.print(), 500);
  }
}

/* ── Character Comparison View ── */
function CharacterComparisonView({ characters, getCharImage }: { characters: CharacterData[]; getCharImage: (c: CharacterData) => string }) {
  const [charA, setCharA] = useState(characters[0]?.id || "");
  const [charB, setCharB] = useState(characters[1]?.id || "");

  const a = characters.find((c) => c.id === charA);
  const b = characters.find((c) => c.id === charB);

  const radarData = STAT_LABELS.map((s) => ({
    stat: s.label,
    [a?.name || "A"]: a?.stats[s.key] || 0,
    [b?.name || "B"]: b?.stats[s.key] || 0,
  }));

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Character A</Label>
          <Select value={charA} onValueChange={setCharA}>
            <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {characters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-1.5">
          <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Character B</Label>
          <Select value={charB} onValueChange={setCharB}>
            <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {characters.map((c) => <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
      </div>

      {a && b && (
        <>
          <div className="w-full h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="stat" tick={{ fill: "#a0a0b0", fontSize: 11, fontFamily: "monospace" }} />
                <Radar name={a.name} dataKey={a.name} stroke="#f59e0b" fill="#f59e0b" fillOpacity={0.25} strokeWidth={2} />
                <Radar name={b.name} dataKey={b.name} stroke="#06b6d4" fill="#06b6d4" fillOpacity={0.25} strokeWidth={2} />
                <Legend wrapperStyle={{ fontSize: 12, fontFamily: "monospace" }} />
              </RadarChart>
            </ResponsiveContainer>
          </div>

          <div className="grid grid-cols-2 gap-4">
            {[a, b].map((char, i) => (
              <div key={char.id} className="space-y-3 p-3 rounded-lg border border-white/[0.06] bg-card/30">
                <div className="flex items-center gap-3">
                  <img src={getCharImage(char)} alt={char.name} className="w-10 h-10 rounded-lg object-cover border border-white/10" />
                  <div>
                    <p className="font-comic tracking-wider text-sm" style={{ color: i === 0 ? "#f59e0b" : "#06b6d4" }}>{char.name}</p>
                    <p className="text-[10px] text-muted-foreground">{char.title}</p>
                  </div>
                </div>
                {STAT_LABELS.map((s) => {
                  const val = char.stats[s.key];
                  const other = (i === 0 ? b : a).stats[s.key];
                  const diff = val - other;
                  return (
                    <div key={s.key} className="space-y-0.5">
                      <div className="flex justify-between text-[10px] font-mono">
                        <span className="text-muted-foreground">{s.label}</span>
                        <span className={diff > 0 ? "text-green-400" : diff < 0 ? "text-red-400" : "text-muted-foreground"}>
                          {val} {diff !== 0 && `(${diff > 0 ? "+" : ""}${diff})`}
                        </span>
                      </div>
                      <div className="h-1.5 rounded-full bg-white/[0.06] overflow-hidden">
                        <div
                          className="h-full rounded-full"
                          style={{
                            width: `${val}%`,
                            background: i === 0 ? "#f59e0b" : "#06b6d4",
                          }}
                        />
                      </div>
                    </div>
                  );
                })}
                <div>
                  <p className="text-[10px] font-mono text-muted-foreground uppercase tracking-wider mb-1">Abilities</p>
                  <div className="flex flex-wrap gap-1">
                    {char.abilities.map((a) => (
                      <span key={a} className="text-[10px] px-1.5 py-0.5 rounded bg-accent/10 text-accent border border-accent/20">{a}</span>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </div>
  );
}

/* ── main component ── */
export default function StoryCharacterCreator({
  storyTitle,
  storageKey,
  defaultCharacters,
  speciesOptions,
  classOptions,
  portraitDescriptions = {},
  headerImage,
  profileImage,
  characterCount,
  clothingCategories,
}: StoryCharacterCreatorProps) {
  function loadCharacters(): CharacterData[] {
    try {
      const raw = localStorage.getItem(storageKey);
      if (raw) {
        const parsed = JSON.parse(raw) as CharacterData[];
        // Ensure appearance field exists on loaded data
        return parsed.map((c) => ({ ...c, appearance: c.appearance || { ...DEFAULT_APPEARANCE } }));
      }
    } catch { /* ignore */ }
    return defaultCharacters.map((c) => ({ ...c, appearance: c.appearance || { ...DEFAULT_APPEARANCE } }));
  }

  const [characters, setCharacters] = useState<CharacterData[]>(loadCharacters);
  const [portraitUrls, setPortraitUrls] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [batchGenerating, setBatchGenerating] = useState(false);

  // Check storage for existing portraits on mount
  useEffect(() => {
    const checkExistingPortraits = async () => {
      const ids = Object.keys(portraitDescriptions);
      if (ids.length === 0) return;
      const urls: Record<string, string> = {};

      for (const id of ids) {
        const { data } = supabase.storage
          .from('character-portraits')
          .getPublicUrl(`${id}.png`);

        try {
          const res = await fetch(data.publicUrl, { method: 'HEAD' });
          if (res.ok) {
            urls[id] = data.publicUrl + '?t=' + Date.now();
          }
        } catch {
          // file doesn't exist yet
        }
      }

      if (Object.keys(urls).length > 0) {
        setPortraitUrls(urls);
      }
    };

    checkExistingPortraits();
  }, [portraitDescriptions]);

  // persist
  useEffect(() => {
    const toSave = characters.map(({ image, ...rest }) => rest);
    localStorage.setItem(storageKey, JSON.stringify(toSave));
  }, [characters, storageKey]);

  // on load, ensure images are resolved
  useEffect(() => {
    const imageMap: Record<string, string> = {};
    defaultCharacters.forEach((c) => (imageMap[c.id] = c.image));
    setCharacters((prev) =>
      prev.map((c) => ({ ...c, image: imageMap[c.id] || c.image }))
    );
  }, [defaultCharacters]);

  const getCharImage = useCallback((char: CharacterData) => {
    return portraitUrls[char.id] || char.image;
  }, [portraitUrls]);

  const generatePortrait = useCallback(async (characterId: string) => {
    const description = portraitDescriptions[characterId];
    const char = characters.find((c) => c.id === characterId);
    if (!char) return;

    // Build visual description from appearance if available, fall back to manual description
    const appearancePrompt = char.appearance ? buildAppearancePrompt(char.appearance) : "";
    const visualDescription = appearancePrompt
      ? `${appearancePrompt}. ${description || char.backstory}`
      : (description || char.backstory);

    setGenerating((prev) => ({ ...prev, [characterId]: true }));
    toast.info(`Generating portrait for ${char.name}...`);

    try {
      const { data, error } = await supabase.functions.invoke('generate-character-portrait', {
        body: {
          characterId,
          characterName: char.name,
          visualDescription,
        },
      });

      if (error) throw error;
      if (data?.error) throw new Error(data.error);

      if (data?.url) {
        setPortraitUrls((prev) => ({ ...prev, [characterId]: data.url }));
        toast.success(`Portrait generated for ${char.name}!`);
      }
    } catch (err: any) {
      console.error('Portrait generation failed:', err);
      toast.error(`Failed to generate portrait: ${err.message || 'Unknown error'}`);
    } finally {
      setGenerating((prev) => ({ ...prev, [characterId]: false }));
    }
  }, [characters, portraitDescriptions]);

  const generateAllMissingPortraits = useCallback(async () => {
    const ids = Object.keys(portraitDescriptions);
    const missing = ids.filter((id) => !portraitUrls[id]);
    if (missing.length === 0) {
      toast.info("All portraits already generated!");
      return;
    }

    setBatchGenerating(true);
    let success = 0;
    let failed = 0;

    for (let i = 0; i < missing.length; i++) {
      const id = missing[i];
      const char = characters.find((c) => c.id === id);
      if (!char) continue;

      toast.info(`Generating portrait ${i + 1}/${missing.length}: ${char.name}...`);
      setGenerating((prev) => ({ ...prev, [id]: true }));

      try {
        const { data, error } = await supabase.functions.invoke('generate-character-portrait', {
          body: {
            characterId: id,
            characterName: char.name,
            visualDescription: portraitDescriptions[id],
          },
        });

        if (error) throw error;
        if (data?.error) throw new Error(data.error);

        if (data?.url) {
          setPortraitUrls((prev) => ({ ...prev, [id]: data.url }));
          success++;
        }
      } catch (err: any) {
        console.error(`Portrait generation failed for ${char.name}:`, err);
        failed++;
      } finally {
        setGenerating((prev) => ({ ...prev, [id]: false }));
      }

      if (i < missing.length - 1) {
        await new Promise((r) => setTimeout(r, 2000));
      }
    }

    setBatchGenerating(false);
    if (failed === 0) {
      toast.success(`All ${success} portraits generated successfully!`);
    } else {
      toast.warning(`${success}/${success + failed} portraits generated. ${failed} failed.`);
    }
  }, [characters, portraitUrls, portraitDescriptions]);

  const updateChar = useCallback((id: string, patch: Partial<CharacterData>) => {
    setCharacters((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
  }, []);

  const resetChar = useCallback((id: string) => {
    const def = defaultCharacters.find((c) => c.id === id);
    if (def) setCharacters((prev) => prev.map((c) => (c.id === id ? { ...def } : c)));
  }, [defaultCharacters]);

  const needsPortrait = (id: string) => id in portraitDescriptions;
  const hasPortraitDescriptions = Object.keys(portraitDescriptions).length > 0;

  return (
    <div className="space-y-4">
      {/* Group shot header */}
      <div className="relative rounded-lg overflow-hidden mb-6">
        {headerImage ? (
          <img src={headerImage} alt={`${storyTitle} — Cast`} className="w-full h-48 sm:h-64 object-cover object-top opacity-60" />
        ) : (
          <div className="w-full h-32 sm:h-40 bg-gradient-to-b from-primary/10 to-transparent" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Swords className="w-6 h-6 text-primary" />
            <div>
              <h3 className="text-lg font-comic tracking-wider text-primary">Character Roster</h3>
              <p className="text-xs text-muted-foreground">{characterCount} playable characters · MMORPG-style attributes</p>
            </div>
          </div>
          <div className="flex gap-2 flex-wrap">
            {hasPortraitDescriptions && (
              <Button
                variant="outline"
                size="sm"
                className="text-xs"
                onClick={generateAllMissingPortraits}
                disabled={batchGenerating || Object.values(generating).some(Boolean)}
              >
                {batchGenerating ? (
                  <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating Portraits…</>
                ) : (
                  <><Zap className="w-3 h-3 mr-1" /> Generate All Portraits</>
                )}
              </Button>
            )}
            <Button
              variant="outline"
              size="sm"
              className="text-xs"
              onClick={() => exportCharacterSheet(characters, getCharImage, storyTitle)}
            >
              <Download className="w-3 h-3 mr-1" /> Export Sheet
            </Button>
            <Dialog>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm" className="text-xs">
                  <GitCompare className="w-3 h-3 mr-1" /> Compare
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
                <DialogHeader>
                  <DialogTitle className="font-comic tracking-wider text-primary">Compare Characters</DialogTitle>
                </DialogHeader>
                <CharacterComparisonView characters={characters} getCharImage={getCharImage} />
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </div>

      {/* Profile lineup (optional) */}
      {profileImage && (
        <div className="rounded-lg overflow-hidden border border-white/[0.06]">
          <img src={profileImage} alt="Character Profiles lineup" className="w-full object-contain bg-black/40" />
        </div>
      )}

      <Accordion type="multiple" className="space-y-3">
        {characters.map((char) => (
          <AccordionItem key={char.id} value={char.id} className="border border-white/[0.06] rounded-lg overflow-hidden bg-card/30 backdrop-blur-sm">
            <AccordionTrigger className="px-4 py-3 hover:no-underline hover:bg-white/[0.02]">
              <div className="flex items-center gap-4 text-left">
                <img src={getCharImage(char)} alt={char.name} className="w-12 h-12 rounded-lg object-cover border border-white/10" />
                <div>
                  <span className="font-comic tracking-wider text-accent text-sm">{char.name}</span>
                  <p className="text-xs text-muted-foreground">{char.title}</p>
                </div>
                <div className="hidden sm:flex gap-1 ml-auto mr-4">
                  {STAT_LABELS.map((s) => (
                    <span key={s.key} className="text-[10px] font-mono text-muted-foreground bg-white/[0.04] px-1.5 py-0.5 rounded">
                      {s.label} {char.stats[s.key]}
                    </span>
                  ))}
                </div>
              </div>
            </AccordionTrigger>
            <AccordionContent className="px-4 pb-6">
              <div className="grid grid-cols-1 lg:grid-cols-[280px_1fr] gap-6 pt-2">
                {/* Left — image */}
                <div className="space-y-3">
                  <img src={getCharImage(char)} alt={char.name} className="w-full rounded-lg border border-white/10 object-cover aspect-[3/4]" />
                  <div className="flex flex-col gap-2">
                    {needsPortrait(char.id) && (
                      <Button
                        variant="outline"
                        size="sm"
                        className="w-full text-xs"
                        onClick={() => generatePortrait(char.id)}
                        disabled={generating[char.id] || batchGenerating}
                      >
                        {generating[char.id] ? (
                          <><Loader2 className="w-3 h-3 mr-1 animate-spin" /> Generating…</>
                        ) : portraitUrls[char.id] ? (
                          <><RefreshCw className="w-3 h-3 mr-1" /> Regenerate Portrait</>
                        ) : (
                          <><Zap className="w-3 h-3 mr-1" /> Generate AI Portrait</>
                        )}
                      </Button>
                    )}
                    <Button variant="outline" size="sm" className="w-full text-xs" onClick={() => resetChar(char.id)}>
                      <RotateCcw className="w-3 h-3 mr-1" /> Reset to Defaults
                    </Button>
                  </div>

                  {/* Appearance Editor */}
                  <Collapsible>
                    <CollapsibleTrigger asChild>
                      <Button variant="ghost" size="sm" className="w-full justify-between text-xs text-muted-foreground hover:text-foreground">
                        <span className="flex items-center gap-1.5"><Paintbrush className="w-3 h-3" /> Appearance</span>
                        <ChevronDown className="w-3 h-3" />
                      </Button>
                    </CollapsibleTrigger>
                    <CollapsibleContent className="pt-2">
                      <CharacterAppearanceEditor
                        appearance={char.appearance || DEFAULT_APPEARANCE}
                        onChange={(a) => updateChar(char.id, { appearance: a })}
                        clothingCategories={clothingCategories}
                      />
                    </CollapsibleContent>
                  </Collapsible>
                </div>

                {/* Right — fields */}
                <div className="space-y-5">
                  {/* Identity */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Name</Label>
                      <Input value={char.name} onChange={(e) => updateChar(char.id, { name: e.target.value })} className="bg-background/50 border-white/10 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Title / Rank</Label>
                      <Input value={char.title} onChange={(e) => updateChar(char.id, { title: e.target.value })} className="bg-background/50 border-white/10 font-mono" />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Species / Origin</Label>
                      <Select value={char.species} onValueChange={(v) => updateChar(char.id, { species: v })}>
                        <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {speciesOptions.map((s) => <SelectItem key={s} value={s}>{s}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Class / Role</Label>
                      <Select value={char.classRole} onValueChange={(v) => updateChar(char.id, { classRole: v })}>
                        <SelectTrigger className="bg-background/50 border-white/10 font-mono text-sm">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {classOptions.map((c) => <SelectItem key={c} value={c}>{c}</SelectItem>)}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  {/* Stats */}
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <Shield className="w-4 h-4 text-primary" />
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Attributes</Label>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3">
                      {STAT_LABELS.map((s) => (
                        <div key={s.key} className="space-y-1">
                          <div className="flex justify-between text-xs font-mono">
                            <span className="text-muted-foreground">{s.icon} {s.label}</span>
                            <span className="text-accent font-semibold">{char.stats[s.key]}</span>
                          </div>
                          <Slider
                            value={[char.stats[s.key]]}
                            min={1}
                            max={100}
                            step={1}
                            onValueChange={([v]) =>
                              updateChar(char.id, { stats: { ...char.stats, [s.key]: v } })
                            }
                            className="[&_[role=slider]]:border-primary [&_[data-orientation=horizontal]>span:first-child>span]:bg-primary"
                          />
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Abilities */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Zap className="w-4 h-4 text-primary" />
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Abilities</Label>
                    </div>
                    <TagInput tags={char.abilities} onChange={(a) => updateChar(char.id, { abilities: a })} placeholder="Add ability…" />
                  </div>

                  {/* Equipment */}
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <Swords className="w-4 h-4 text-primary" />
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Equipment</Label>
                    </div>
                    <TagInput tags={char.equipment} onChange={(e) => updateChar(char.id, { equipment: e })} placeholder="Add equipment…" />
                  </div>

                  {/* Alignment */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                        Law ↔ Chaos: <span className="text-accent">{lawLabel(char.alignmentLaw)}</span>
                      </Label>
                      <Slider value={[char.alignmentLaw]} min={0} max={100} step={1} onValueChange={([v]) => updateChar(char.id, { alignmentLaw: v })} />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                        Good ↔ Evil: <span className="text-accent">{moralLabel(char.alignmentMoral)}</span>
                      </Label>
                      <Slider value={[char.alignmentMoral]} min={0} max={100} step={1} onValueChange={([v]) => updateChar(char.id, { alignmentMoral: v })} />
                    </div>
                  </div>

                  {/* Backstory */}
                  <div className="space-y-1.5">
                    <Label className="text-xs text-muted-foreground font-mono uppercase tracking-wider">Backstory</Label>
                    <Textarea
                      value={char.backstory}
                      onChange={(e) => updateChar(char.id, { backstory: e.target.value })}
                      rows={4}
                      className="bg-background/50 border-white/10 font-mono text-sm leading-relaxed"
                    />
                  </div>
                </div>
              </div>
            </AccordionContent>
          </AccordionItem>
        ))}
      </Accordion>
    </div>
  );
}
