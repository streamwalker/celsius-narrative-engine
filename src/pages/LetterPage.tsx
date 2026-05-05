import { useCallback, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Wand2, Download, FileText, AlertCircle } from 'lucide-react';
import { toPng } from 'html-to-image';
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

  const exportRef = useRef<HTMLDivElement>(null);

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

  const placeBubbles = useCallback(
    (detected: DetectedPanel[]) => {
      const newBubbles: Record<string, PanelBubbleData[]> = {};
      detected.forEach((dp, i) => {
        const parsed = allParsedPanels[i]; // 1:1 by index
        const out: PanelBubbleData[] = [];

        if (parsed?.narration?.trim()) {
          out.push(createBubble('caption', { text: parsed.narration.trim() }));
        }

        // Build a map of speakerName(lower) → head position relative to PANEL (not page)
        const headInPanel = new Map<string, { x: number; y: number }>();
        for (const s of dp.speakers) {
          const px = dp.w > 0 ? (s.x - dp.x) / dp.w : 0.5;
          const py = dp.h > 0 ? (s.y - dp.y) / dp.h : 0.5;
          headInPanel.set(s.name.trim().toLowerCase(), {
            x: Math.max(0, Math.min(1, px)),
            y: Math.max(0, Math.min(1, py)),
          });
        }

        const dialogueLines: { speaker: string; text: string; kind: 'speech' | 'thought' | 'shout' | 'whisper' }[] = [];
        if (parsed?.dialogue) {
          const speaker = parsed.characters[0] ?? '';
          dialogueLines.push({ speaker, text: parsed.dialogue, kind: 'speech' });
        }

        // Stack bubbles vertically across top of panel
        let cursorY = 0.04;
        for (const dl of dialogueLines) {
          const head = headInPanel.get(dl.speaker.trim().toLowerCase());
          // Place bubble above head if possible, else top-left
          const bx = head ? Math.max(0.04, Math.min(0.55, head.x - 0.18)) : 0.06;
          const by = cursorY;
          const bw = 0.38;
          const bh = 0.18;
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
          cursorY += bh + 0.02;
        }

        newBubbles[`p_${dp.index}`] = out;
      });
      setBubblesByPanel(newBubbles);
    },
    [allParsedPanels]
  );

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
      placeBubbles(detected);
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
  const handleExport = async () => {
    if (!exportRef.current) return;
    try {
      const dataUrl = await toPng(exportRef.current, {
        cacheBust: true,
        pixelRatio: 2,
        backgroundColor: '#ffffff',
      });
      const a = document.createElement('a');
      a.href = dataUrl;
      a.download = 'lettered-page.png';
      a.click();
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

          {panels.length > 0 && (
            <Button onClick={handleExport} variant="secondary" className="w-full">
              <Download className="mr-2 h-4 w-4" />
              Export PNG
            </Button>
          )}

          {error && (
            <div className="flex items-start gap-2 rounded-md border border-destructive/30 bg-destructive/5 p-3 text-xs text-destructive">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
              <span>{error}</span>
            </div>
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
              {/* Overlay each detected panel with its bubble editor */}
              {panels.map((p) => {
                const key = `p_${p.index}`;
                const panelBubbles = bubblesByPanel[key] ?? [];
                return (
                  <div
                    key={key}
                    className="absolute"
                    style={{
                      left: `${p.x * 100}%`,
                      top: `${p.y * 100}%`,
                      width: `${p.w * 100}%`,
                      height: `${p.h * 100}%`,
                    }}
                  >
                    {/* Faint panel outline */}
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
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
