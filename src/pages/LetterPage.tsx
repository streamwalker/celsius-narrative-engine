import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Wand2, Download, FileText, AlertCircle, Users, Layers, ChevronDown, MousePointerSquareDashed, Eye, Save, FolderOpen, Trash2, Plus, LogIn } from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Input } from '@/components/ui/input';
import { PanelBoxEditor, type PanelBox } from '@/components/PanelBoxEditor';
import { AuthModal } from '@/components/AuthModal';
import type { User } from '@supabase/supabase-js';
import {
  listLetteringProjects,
  loadLetteringProject,
  saveLetteringProject,
  deleteLetteringProject,
  type LetteringSummary,
} from '@/lib/lettering-library';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { toPng, toSvg } from 'html-to-image';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { PanelBubbleEditor } from '@/components/PanelBubbleEditor';
import { parseComicScript } from '@/lib/comic-panel-parser';
import {
  buildSpeakerRoster,
  createBubble,
  speakerIdFromName,
  type PanelBubbleData,
  type Speaker,
} from '@/lib/comic-bubbles';

interface DetectedPanel {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speakers: { name: string; x: number; y: number }[];
}

export default function LetterPage() {
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageDataUrl, setImageDataUrl] = useState<string | null>(null);
  const [scriptText, setScriptText] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [panels, setPanels] = useState<DetectedPanel[]>([]);
  const [bubblesByPanel, setBubblesByPanel] = useState<Record<string, PanelBubbleData[]>>({});
  const [speakers, setSpeakers] = useState<Speaker[]>([]);
  // script speaker (lowercased) → detected visible speaker name (as returned by AI)
  const [speakerMap, setSpeakerMap] = useState<Record<string, string>>({});

  const [editingPanels, setEditingPanels] = useState(false);

  // ---- Library / persistence ----
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);
  const [projectId, setProjectId] = useState<string | null>(null);
  const [title, setTitle] = useState('Untitled Lettering');
  const [savedImagePath, setSavedImagePath] = useState<string | null>(null);
  const [pendingImageDataUrl, setPendingImageDataUrl] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);
  const [library, setLibrary] = useState<LetteringSummary[]>([]);
  const [libraryOpen, setLibraryOpen] = useState(false);
  const [loadingProject, setLoadingProject] = useState(false);

  const exportRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (_e, session) => setUser(session?.user ?? null)
    );
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  const refreshLibrary = useCallback(async () => {
    if (!user) return;
    try {
      setLibrary(await listLetteringProjects(user.id));
    } catch (e) {
      console.error(e);
    }
  }, [user]);

  useEffect(() => { refreshLibrary(); }, [refreshLibrary]);

  // ---- Upload handler -------------------------------------------------------
  const onFile = (f: File | null) => {
    if (!f) return;
    if (!f.type.startsWith('image/')) {
      toast({ title: 'Please upload an image file.', variant: 'destructive' });
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      const url = reader.result as string;
      setImageDataUrl(url);
      setImageUrl(url);
      setPendingImageDataUrl(url);
      setSavedImagePath(null);
      // Reset prior analysis
      setPanels([]);
      setBubblesByPanel({});
      setError(null);
    };
    reader.readAsDataURL(f);
  };

  // ---- Auto-letter ----------------------------------------------------------
  const parsedPages = useMemo(() => parseComicScript(scriptText || ''), [scriptText]);
  const allParsedPanels = useMemo(
    () => parsedPages.flatMap((p) => p.panels),
    [parsedPages]
  );
  const characterRoster = useMemo(() => {
    const set = new Set<string>();
    for (const p of allParsedPanels) for (const c of p.characters) set.add(c);
    return Array.from(set);
  }, [allParsedPanels]);

  // All visible speaker names detected by the AI across the page
  const detectedSpeakerNames = useMemo(() => {
    const set = new Set<string>();
    for (const p of panels) for (const s of p.speakers) set.add(s.name.trim());
    return Array.from(set);
  }, [panels]);

  // Script speakers that don't directly match any detected speaker name (case-insensitive)
  const uncertainScriptSpeakers = useMemo(() => {
    if (panels.length === 0) return [];
    const detectedLower = new Set(detectedSpeakerNames.map((n) => n.toLowerCase()));
    return characterRoster.filter((c) => !detectedLower.has(c.trim().toLowerCase()));
  }, [characterRoster, detectedSpeakerNames, panels.length]);

  const placeBubbles = useCallback(
    (detected: DetectedPanel[], mapping: Record<string, string>) => {
      const newBubbles: Record<string, PanelBubbleData[]> = {};
      detected.forEach((dp, i) => {
        const parsed = allParsedPanels[i]; // 1:1 by index
        const out: PanelBubbleData[] = [];

        if (parsed?.narration?.trim()) {
          out.push(createBubble('caption', { text: parsed.narration.trim() }));
        }

        // Build a map of detectedName(lower) → head position relative to PANEL
        const headInPanel = new Map<string, { x: number; y: number }>();
        for (const s of dp.speakers) {
          const px = dp.w > 0 ? (s.x - dp.x) / dp.w : 0.5;
          const py = dp.h > 0 ? (s.y - dp.y) / dp.h : 0.5;
          headInPanel.set(s.name.trim().toLowerCase(), {
            x: Math.max(0, Math.min(1, px)),
            y: Math.max(0, Math.min(1, py)),
          });
        }

        const resolveHead = (scriptSpeaker: string) => {
          const key = scriptSpeaker.trim().toLowerCase();
          let head = headInPanel.get(key);
          if (head) return head;
          const mapped = mapping[key];
          if (mapped) head = headInPanel.get(mapped.trim().toLowerCase());
          return head;
        };

        const dialogueLines = parsed?.dialogues ?? [];

        // Estimate bubble height from text length so multiple lines fit nicely.
        const estimateHeight = (text: string) => {
          const charsPerLine = 22;
          const approxLines = Math.max(1, Math.ceil(text.length / charsPerLine));
          // 0.07 base + 0.045 per estimated text line, capped
          return Math.min(0.32, 0.07 + approxLines * 0.045);
        };

        // Reserve top room if narration caption was placed
        const topReserve = parsed?.narration?.trim() ? 0.18 : 0.04;
        let cursorY = topReserve;

        const totalHeight = dialogueLines.reduce(
          (acc, dl) => acc + estimateHeight(dl.text) + 0.02,
          0
        );
        // If too tall, shrink each height proportionally to fit roughly within remaining space
        const available = Math.max(0.2, 0.96 - cursorY);
        const heightScale = totalHeight > available ? available / totalHeight : 1;

        dialogueLines.forEach((dl, idx) => {
          const head = resolveHead(dl.speaker);
          const bw = Math.min(0.5, Math.max(0.28, dl.text.length / 70));
          const bh = estimateHeight(dl.text) * heightScale;
          // Horizontally bias bubble toward the speaker's side of the panel
          let bx: number;
          if (head) {
            const desired = head.x - bw / 2;
            bx = Math.max(0.03, Math.min(0.97 - bw, desired));
          } else {
            // Alternate left/right for unmapped lines so they don't overlap
            bx = idx % 2 === 0 ? 0.04 : Math.max(0.04, 0.96 - bw);
          }
          const by = Math.min(0.97 - bh, cursorY);
          const bubble: PanelBubbleData = {
            id: Math.random().toString(36).slice(2, 10),
            kind: dl.kind,
            text: dl.text,
            x: bx,
            y: by,
            w: bw,
            h: bh,
            tail: head ? { x: head.x, y: head.y } : undefined,
            speakerId: dl.speaker ? speakerIdFromName(dl.speaker) : undefined,
          };
          out.push(bubble);
          cursorY = by + bh + 0.02;
        });

        newBubbles[`p_${dp.index}`] = out;
      });
      setBubblesByPanel(newBubbles);
    },
    [allParsedPanels]
  );

  // Re-place bubbles whenever the user updates the speaker mapping
  useEffect(() => {
    if (panels.length > 0) placeBubbles(panels, speakerMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerMap]);

  // ---- Manual panel editing ------------------------------------------------
  const panelBoxes: PanelBox[] = useMemo(
    () => panels.map((p) => ({ index: p.index, x: p.x, y: p.y, w: p.w, h: p.h })),
    [panels]
  );

  const applyPanelBoxes = (boxes: PanelBox[]) => {
    // Preserve any existing speaker data per panel index when possible
    const oldByIndex = new Map(panels.map((p) => [p.index, p]));
    const next: DetectedPanel[] = boxes.map((b) => {
      const existing = oldByIndex.get(b.index);
      return {
        index: b.index,
        x: b.x,
        y: b.y,
        w: b.w,
        h: b.h,
        speakers: existing?.speakers ?? [],
      };
    });
    setPanels(next);
    placeBubbles(next, speakerMap);
  };

  const addManualPanel = () => {
    const idx = panels.length + 1;
    const newPanel: DetectedPanel = {
      index: idx,
      x: 0.1,
      y: 0.1,
      w: 0.3,
      h: 0.25,
      speakers: [],
    };
    const next = [...panels, newPanel];
    setPanels(next);
    placeBubbles(next, speakerMap);
    setEditingPanels(true);
  };

  const handleAutoLetter = async () => {
    if (!imageDataUrl) {
      toast({ title: 'Upload artwork first', variant: 'destructive' });
      return;
    }
    setAnalyzing(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('letter-page-analyze', {
        body: { imageDataUrl, characters: characterRoster },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      const detected: DetectedPanel[] = data?.panels ?? [];
      if (detected.length === 0) {
        throw new Error('No panels detected. Try a clearer page or higher resolution.');
      }
      setPanels(detected);
      setSpeakers(buildSpeakerRoster(characterRoster));
      setSpeakerMap({});
      placeBubbles(detected, {});
      toast({ title: `Detected ${detected.length} panels — drag bubbles to fine-tune.` });
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Analysis failed';
      setError(msg);
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setAnalyzing(false);
    }
  };

  // ---- Export ---------------------------------------------------------------
  const downloadDataUrl = (dataUrl: string, filename: string) => {
    const a = document.createElement('a');
    a.href = dataUrl;
    a.download = filename;
    a.click();
  };

  type ExportLayer = 'composite' | 'artwork' | 'bubbles';
  type ExportFormat = 'png' | 'svg';

  const renderLayer = async (layer: ExportLayer, format: ExportFormat) => {
    if (!exportRef.current) return null;
    // For artwork-only PNG we can just re-download the original data URL.
    if (layer === 'artwork' && format === 'png' && imageDataUrl) {
      return imageDataUrl;
    }
    const isArtworkNode = (node: HTMLElement) =>
      node.tagName === 'IMG' && node.getAttribute('alt') === 'Page artwork';
    const isOverlayNode = (node: HTMLElement) =>
      node.classList?.contains('lp-bubble-overlay');

    const filter = (node: HTMLElement) => {
      if (layer === 'artwork') return !isOverlayNode(node);
      if (layer === 'bubbles') return !isArtworkNode(node);
      return true;
    };

    const opts = {
      cacheBust: true,
      pixelRatio: 2,
      backgroundColor: layer === 'bubbles' ? undefined : '#ffffff',
      filter,
    } as const;

    return format === 'png'
      ? await toPng(exportRef.current, opts)
      : await toSvg(exportRef.current, opts);
  };

  const handleExport = async (layer: ExportLayer, format: ExportFormat) => {
    try {
      const dataUrl = await renderLayer(layer, format);
      if (!dataUrl) return;
      const ext = format === 'png' ? 'png' : 'svg';
      const name =
        layer === 'composite'
          ? `lettered-page.${ext}`
          : layer === 'artwork'
            ? `page-artwork.${ext}`
            : `page-bubbles.${ext}`;
      downloadDataUrl(dataUrl, name);
    } catch (err) {
      toast({
        title: 'Export failed',
        description: err instanceof Error ? err.message : 'Unknown error',
        variant: 'destructive',
      });
    }
  };

  // ---- Render ---------------------------------------------------------------
  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      <div className="flex items-center gap-3">
        <Button asChild variant="ghost" size="sm">
          <Link to="/">
            <ArrowLeft className="mr-1 h-4 w-4" />
            Home
          </Link>
        </Button>
        <h1 className="font-display text-2xl">Letter a Page</h1>
        <span className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
          Upload finished art + script → auto-place bubbles
        </span>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ---------------- Left: inputs ---------------- */}
        <div className="space-y-4">
          <Card>
            <CardContent className="space-y-3 p-4">
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                1. Page artwork
              </label>
              <label className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-md border-2 border-dashed border-border p-6 text-center hover:border-primary/40 hover:bg-accent/30">
                <Upload className="h-5 w-5 text-muted-foreground" />
                <span className="text-sm">
                  {imageUrl ? 'Replace image' : 'Click or drop a PNG/JPG'}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={(e) => onFile(e.target.files?.[0] ?? null)}
                />
              </label>
              {imageUrl && (
                <img
                  src={imageUrl}
                  alt="Uploaded page"
                  className="mt-2 max-h-40 w-full rounded border object-contain"
                />
              )}
            </CardContent>
          </Card>

          <Card>
            <CardContent className="space-y-3 p-4">
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                2. Script for this page
              </label>
              <Textarea
                value={scriptText}
                onChange={(e) => setScriptText(e.target.value)}
                placeholder={`PAGE 1
1 - Wide shot of the rooftop at dusk.
Reads: The day began like any other.
ZEUS: "It's quiet out there."

2 - Close-up on Astra.
ASTRA: "Too quiet."`}
                className="min-h-[180px] font-mono text-xs"
              />
              <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                <span>
                  Parsed: {allParsedPanels.length} panels · {characterRoster.length} speakers
                </span>
                {characterRoster.length > 0 && (
                  <span className="truncate">{characterRoster.slice(0, 4).join(', ')}</span>
                )}
              </div>
            </CardContent>
          </Card>

          <Button
            onClick={handleAutoLetter}
            disabled={analyzing || !imageDataUrl || allParsedPanels.length === 0}
            className="w-full"
          >
            {analyzing ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Analyzing page…
              </>
            ) : (
              <>
                <Wand2 className="mr-2 h-4 w-4" />
                Auto-letter this page
              </>
            )}
          </Button>

          {imageUrl && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    {editingPanels ? (
                      <MousePointerSquareDashed className="h-4 w-4 text-primary" />
                    ) : (
                      <Eye className="h-4 w-4 text-muted-foreground" />
                    )}
                    <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Edit panel boxes
                    </label>
                  </div>
                  <Switch checked={editingPanels} onCheckedChange={setEditingPanels} />
                </div>
                {editingPanels && (
                  <p className="text-[11px] text-muted-foreground">
                    Drag on empty artwork to draw a panel. Drag a panel to move it, the corner to
                    resize, or click ✕ to delete. Bubbles update automatically.
                  </p>
                )}
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={addManualPanel}>
                    + Add panel
                  </Button>
                  {panels.length > 0 && (
                    <Button
                      size="sm"
                      variant="ghost"
                      className="flex-1"
                      onClick={() => {
                        setPanels([]);
                        setBubblesByPanel({});
                      }}
                    >
                      Clear all
                    </Button>
                  )}
                </div>
                {panels.length > 0 && (
                  <p className="text-[11px] text-muted-foreground">
                    {panels.length} panel{panels.length === 1 ? '' : 's'} on page
                  </p>
                )}
              </CardContent>
            </Card>
          )}
          {panels.length > 0 && (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="secondary" className="w-full">
                  <Download className="mr-2 h-4 w-4" />
                  Export
                  <ChevronDown className="ml-2 h-4 w-4 opacity-70" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-56">
                <DropdownMenuLabel className="flex items-center gap-2 text-xs">
                  <Layers className="h-3 w-3" /> Composite (art + bubbles)
                </DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('composite', 'png')}>
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('composite', 'svg')}>
                  SVG
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Artwork layer only</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('artwork', 'png')}>
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('artwork', 'svg')}>
                  SVG
                </DropdownMenuItem>
                <DropdownMenuSeparator />
                <DropdownMenuLabel className="text-xs">Bubbles layer only (transparent)</DropdownMenuLabel>
                <DropdownMenuItem onClick={() => handleExport('bubbles', 'png')}>
                  PNG
                </DropdownMenuItem>
                <DropdownMenuItem onClick={() => handleExport('bubbles', 'svg')}>
                  SVG
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
          )}

          {panels.length > 0 && uncertainScriptSpeakers.length > 0 && (
            <Card>
              <CardContent className="space-y-3 p-4">
                <div className="flex items-center gap-2">
                  <Users className="h-4 w-4 text-primary" />
                  <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Map uncertain speakers
                  </label>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  These script speakers weren't matched to a visible character. Pick the closest one
                  on the page so tails point correctly.
                </p>
                <div className="space-y-2">
                  {uncertainScriptSpeakers.map((name) => {
                    const key = name.trim().toLowerCase();
                    return (
                      <div key={key} className="flex items-center gap-2">
                        <span className="w-24 shrink-0 truncate text-xs font-medium">{name}</span>
                        <span className="text-[11px] text-muted-foreground">→</span>
                        <Select
                          value={speakerMap[key] ?? '__none__'}
                          onValueChange={(v) =>
                            setSpeakerMap((prev) => {
                              const next = { ...prev };
                              if (v === '__none__') delete next[key];
                              else next[key] = v;
                              return next;
                            })
                          }
                        >
                          <SelectTrigger className="h-8 flex-1 text-xs">
                            <SelectValue placeholder="Unmapped" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__none__">Unmapped</SelectItem>
                            {detectedSpeakerNames.map((d) => (
                              <SelectItem key={d} value={d}>
                                {d}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      </div>
                    );
                  })}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="space-y-2 text-[11px] text-muted-foreground">
            <p className="font-mono uppercase tracking-widest">Tips</p>
            <ul className="list-disc space-y-1 pl-4">
              <li>Drag a bubble to reposition it.</li>
              <li>Drag the small dot to move the tail tip.</li>
              <li>Double-click a bubble to edit its text.</li>
              <li>Click the speaker dot in the toolbar to retarget.</li>
            </ul>
          </div>
        </div>

        {/* ---------------- Right: canvas ---------------- */}
        <div className="rounded-lg border bg-secondary/30 p-3">
          {!imageUrl ? (
            <div className="flex h-[600px] items-center justify-center text-sm text-muted-foreground">
              <FileText className="mr-2 h-5 w-5" />
              Upload a page to begin.
            </div>
          ) : (
            <div ref={exportRef} className="relative mx-auto" style={{ maxWidth: '900px' }}>
              <img
                src={imageUrl}
                alt="Page artwork"
                className="block w-full select-none"
                draggable={false}
              />
              {/* Bubble layer (hidden in edit mode for clarity) */}
              {!editingPanels &&
                panels.map((p) => {
                  const key = `p_${p.index}`;
                  const panelBubbles = bubblesByPanel[key] ?? [];
                  return (
                    <div
                      key={key}
                      className="lp-bubble-overlay absolute"
                      style={{
                        left: `${p.x * 100}%`,
                        top: `${p.y * 100}%`,
                        width: `${p.w * 100}%`,
                        height: `${p.h * 100}%`,
                      }}
                    >
                      <div className="pointer-events-none absolute inset-0 rounded-sm ring-1 ring-primary/30" />
                      <div className="absolute -top-5 left-0 font-mono text-[10px] text-primary/70">
                        Panel {p.index}
                      </div>
                      <PanelBubbleEditor
                        bubbles={panelBubbles}
                        speakers={speakers}
                        aspectRatio={p.w && p.h ? p.w / p.h : 1}
                        className="!h-full"
                        onChange={(next) =>
                          setBubblesByPanel((prev) => ({ ...prev, [key]: next }))
                        }
                      />
                    </div>
                  );
                })}
              {/* Manual panel-box editor overlay */}
              <PanelBoxEditor
                panels={panelBoxes}
                onChange={applyPanelBoxes}
                enabled={editingPanels}
              />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
