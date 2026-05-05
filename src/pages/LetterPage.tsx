import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowLeft, Upload, Loader2, Wand2, Download, FileText, AlertCircle, Users, Layers, ChevronDown, MousePointerSquareDashed, Eye, Save, FolderOpen, Trash2, Plus, LogIn, ZoomIn, ZoomOut, Maximize2, Hand } from 'lucide-react';
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
import { cn } from '@/lib/utils';
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
  // script speaker (lowercased) → one or more detected visible speaker names
  const [speakerMap, setSpeakerMap] = useState<Record<string, string | string[]>>({});

  const [editingPanels, setEditingPanels] = useState(false);
  const [snapToEdges, setSnapToEdges] = useState(true);
  const [gridDivisions, setGridDivisions] = useState(0); // 0 = off; e.g. 12 = 12-col grid
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [panMode, setPanMode] = useState(false);
  const viewportRef = useRef<HTMLDivElement>(null);
  // Region-constrained re-detection
  const [regionMode, setRegionMode] = useState(false);
  const [region, setRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [drawingRegion, setDrawingRegion] = useState<{ x: number; y: number; w: number; h: number } | null>(null);
  const [reanalyzingRegion, setReanalyzingRegion] = useState(false);

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

  // ---- Undo / redo for panel editing ----
  type EditSnapshot = {
    panels: DetectedPanel[];
    bubblesByPanel: Record<string, PanelBubbleData[]>;
  };
  const [undoStack, setUndoStack] = useState<EditSnapshot[]>([]);
  const [redoStack, setRedoStack] = useState<EditSnapshot[]>([]);
  const HISTORY_LIMIT = 50;
  const cloneSnap = (): EditSnapshot => ({
    panels: JSON.parse(JSON.stringify(panels)),
    bubblesByPanel: JSON.parse(JSON.stringify(bubblesByPanel)),
  });
  const pushHistory = useCallback(() => {
    setUndoStack((s) => {
      const snap: EditSnapshot = {
        panels: JSON.parse(JSON.stringify(panels)),
        bubblesByPanel: JSON.parse(JSON.stringify(bubblesByPanel)),
      };
      const next = [...s, snap];
      if (next.length > HISTORY_LIMIT) next.shift();
      return next;
    });
    setRedoStack([]);
  }, [panels, bubblesByPanel]);
  const handleUndo = useCallback(() => {
    setUndoStack((u) => {
      if (u.length === 0) return u;
      const prev = u[u.length - 1];
      setRedoStack((r) => {
        const cur: EditSnapshot = {
          panels: JSON.parse(JSON.stringify(panels)),
          bubblesByPanel: JSON.parse(JSON.stringify(bubblesByPanel)),
        };
        return [...r, cur];
      });
      setPanels(prev.panels);
      setBubblesByPanel(prev.bubblesByPanel);
      return u.slice(0, -1);
    });
  }, [panels, bubblesByPanel]);
  const handleRedo = useCallback(() => {
    setRedoStack((r) => {
      if (r.length === 0) return r;
      const next = r[r.length - 1];
      setUndoStack((u) => {
        const cur: EditSnapshot = {
          panels: JSON.parse(JSON.stringify(panels)),
          bubblesByPanel: JSON.parse(JSON.stringify(bubblesByPanel)),
        };
        return [...u, cur];
      });
      setPanels(next.panels);
      setBubblesByPanel(next.bubblesByPanel);
      return r.slice(0, -1);
    });
  }, [panels, bubblesByPanel]);

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

  const handleSave = async () => {
    if (!user) { setAuthOpen(true); return; }
    if (!imageUrl) {
      toast({ title: 'Upload artwork before saving.', variant: 'destructive' });
      return;
    }
    setSaving(true);
    try {
      const id = await saveLetteringProject({
        id: projectId,
        userId: user.id,
        title,
        scriptText,
        panels,
        bubblesByPanel,
        speakerMap,
        newImageDataUrl: pendingImageDataUrl,
        existingImagePath: savedImagePath,
      });
      setProjectId(id);
      setPendingImageDataUrl(null);
      const { row, imageUrl: signed } = await loadLetteringProject(id);
      setSavedImagePath(row.image_path);
      if (signed) setImageUrl(signed);
      await refreshLibrary();
      toast({ title: 'Saved to your library.' });
    } catch (e) {
      console.error(e);
      toast({ title: 'Save failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setSaving(false);
    }
  };

  const handleLoad = async (id: string) => {
    setLoadingProject(true);
    try {
      const { row, imageUrl: signed } = await loadLetteringProject(id);
      setProjectId(row.id);
      setTitle(row.title);
      setScriptText(row.script_text || '');
      setPanels(row.panels || []);
      setBubblesByPanel(row.bubbles_by_panel || {});
      // Backward-compat: legacy projects stored string values; coerce to arrays.
      const rawMap = (row.speaker_map || {}) as Record<string, string | string[]>;
      const normMap: Record<string, string[]> = {};
      for (const [k, v] of Object.entries(rawMap)) {
        normMap[k] = Array.isArray(v) ? v : [v];
      }
      setSpeakerMap(normMap);
      setSpeakers(buildSpeakerRoster(
        Array.from(new Set((row.panels || []).flatMap((p) => p.speakers.map((s) => s.name))))
      ));
      setSavedImagePath(row.image_path);
      setPendingImageDataUrl(null);
      setImageDataUrl(null);
      setImageUrl(signed);
      setLibraryOpen(false);
      toast({ title: `Loaded "${row.title}"` });
    } catch (e) {
      console.error(e);
      toast({ title: 'Load failed', description: (e as Error).message, variant: 'destructive' });
    } finally {
      setLoadingProject(false);
    }
  };

  const handleNew = () => {
    setProjectId(null);
    setTitle('Untitled Lettering');
    setScriptText('');
    setPanels([]);
    setBubblesByPanel({});
    setSpeakerMap({});
    setSpeakers([]);
    setImageUrl(null);
    setImageDataUrl(null);
    setPendingImageDataUrl(null);
    setSavedImagePath(null);
    setError(null);
  };

  const handleDeleteProject = async (id: string, imagePath: string | null) => {
    if (!confirm('Delete this lettering project?')) return;
    try {
      await deleteLetteringProject(id, imagePath);
      if (projectId === id) handleNew();
      await refreshLibrary();
      toast({ title: 'Deleted' });
    } catch (e) {
      toast({ title: 'Delete failed', description: (e as Error).message, variant: 'destructive' });
    }
  };


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
    (detected: DetectedPanel[], mapping: Record<string, string | string[]>) => {
      const newBubbles: Record<string, PanelBubbleData[]> = {};
      detected.forEach((dp, i) => {
        const parsed = allParsedPanels[i]; // 1:1 by index
        const panelKey = `p_${dp.index}`;
        const prev = bubblesByPanel[panelKey] ?? [];
        const lockedBubbles = prev.filter((b) => b.locked);
        const out: PanelBubbleData[] = [...lockedBubbles];

        const hasLockedCaption = lockedBubbles.some((b) => b.kind === 'caption');
        if (parsed?.narration?.trim() && !hasLockedCaption) {
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

        // Per-speaker rotation index so multi-mapped speakers cycle targets
        const speakerLineCounter = new Map<string, number>();
        const resolveHead = (scriptSpeaker: string, override?: string) => {
          if (override) {
            const h = headInPanel.get(override.trim().toLowerCase());
            if (h) return h;
          }
          const key = scriptSpeaker.trim().toLowerCase();
          let head = headInPanel.get(key);
          if (head) return head;
          const mapped = mapping[key];
          const targets = Array.isArray(mapped) ? mapped : mapped ? [mapped] : [];
          // Filter to those actually visible in this panel
          const visible = targets.filter((t) => headInPanel.has(t.trim().toLowerCase()));
          if (visible.length === 0) return undefined;
          const idx = speakerLineCounter.get(key) ?? 0;
          speakerLineCounter.set(key, idx + 1);
          return headInPanel.get(visible[idx % visible.length].trim().toLowerCase());
        };

        const dialogueLines = parsed?.dialogues ?? [];

        // Skip dialogue lines whose text already matches a locked bubble
        const lockedTexts = new Set(
          lockedBubbles.filter((b) => b.kind !== 'caption').map((b) => b.text.trim())
        );
        const remaining = dialogueLines.filter((dl) => !lockedTexts.has(dl.text.trim()));

        const estimateHeight = (text: string) => {
          const charsPerLine = 22;
          const approxLines = Math.max(1, Math.ceil(text.length / charsPerLine));
          return Math.min(0.32, 0.07 + approxLines * 0.045);
        };

        const topReserve = parsed?.narration?.trim() ? 0.18 : 0.04;
        let cursorY = topReserve;

        const totalHeight = remaining.reduce(
          (acc, dl) => acc + estimateHeight(dl.text) + 0.02,
          0
        );
        const available = Math.max(0.2, 0.96 - cursorY);
        const heightScale = totalHeight > available ? available / totalHeight : 1;

        remaining.forEach((dl, idx) => {
          const head = resolveHead(dl.speaker);
          const bw = Math.min(0.5, Math.max(0.28, dl.text.length / 70));
          const bh = estimateHeight(dl.text) * heightScale;
          let bx: number;
          if (head) {
            const desired = head.x - bw / 2;
            bx = Math.max(0.03, Math.min(0.97 - bw, desired));
          } else {
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

        newBubbles[panelKey] = out;
      });
      setBubblesByPanel(newBubbles);
    },
    [allParsedPanels, bubblesByPanel]
  );

  // Re-place bubbles whenever the user updates the speaker mapping
  useEffect(() => {
    if (panels.length > 0) placeBubbles(panels, speakerMap);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [speakerMap]);

  // Hold Space to temporarily enable pan mode
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' && !panMode) {
        const t = e.target as HTMLElement | null;
        if (t && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA' || t.isContentEditable)) return;
        e.preventDefault();
        setPanMode(true);
      }
    };
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.code === 'Space') setPanMode(false);
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('keyup', onKeyUp);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('keyup', onKeyUp);
    };
  }, [panMode]);

  // ---- Manual panel editing ------------------------------------------------
  const panelBoxes: PanelBox[] = useMemo(
    () => panels.map((p) => ({ index: p.index, x: p.x, y: p.y, w: p.w, h: p.h })),
    [panels]
  );

  /**
   * Sort panels into reading order (top→bottom rows, then left→right within
   * a row) and renumber index sequentially starting at 1.
   */
  const renumberInReadingOrder = (list: DetectedPanel[]): DetectedPanel[] => {
    if (list.length === 0) return list;
    const avgH = list.reduce((s, p) => s + p.h, 0) / list.length;
    const rowTol = Math.max(0.04, avgH * 0.5);
    // Sort top-to-bottom first
    const byTop = [...list].sort((a, b) => a.y - b.y);
    const rows: DetectedPanel[][] = [];
    for (const p of byTop) {
      const row = rows[rows.length - 1];
      if (row && Math.abs(p.y - row[0].y) <= rowTol) row.push(p);
      else rows.push([p]);
    }
    const ordered: DetectedPanel[] = [];
    rows.forEach((r) => {
      r.sort((a, b) => a.x - b.x).forEach((p) => ordered.push(p));
    });
    return ordered.map((p, i) => ({ ...p, index: i + 1 }));
  };

  /**
   * Merge panels that overlap heavily or are near-duplicates. Returns a new
   * array with merged bounding boxes and combined speaker lists.
   */
  const mergeOverlappingPanels = (list: DetectedPanel[]): DetectedPanel[] => {
    const OVERLAP_RATIO = 0.6; // intersection / smaller-area
    const remaining = list.map((p) => ({ ...p, speakers: [...p.speakers] }));
    let merged = true;
    while (merged) {
      merged = false;
      outer: for (let i = 0; i < remaining.length; i++) {
        for (let j = i + 1; j < remaining.length; j++) {
          const a = remaining[i];
          const b = remaining[j];
          const ix1 = Math.max(a.x, b.x);
          const iy1 = Math.max(a.y, b.y);
          const ix2 = Math.min(a.x + a.w, b.x + b.w);
          const iy2 = Math.min(a.y + a.h, b.y + b.h);
          const iw = ix2 - ix1;
          const ih = iy2 - iy1;
          if (iw <= 0 || ih <= 0) continue;
          const inter = iw * ih;
          const areaA = a.w * a.h;
          const areaB = b.w * b.h;
          const ratio = inter / Math.min(areaA, areaB);
          if (ratio >= OVERLAP_RATIO) {
            const nx = Math.min(a.x, b.x);
            const ny = Math.min(a.y, b.y);
            const nx2 = Math.max(a.x + a.w, b.x + b.w);
            const ny2 = Math.max(a.y + a.h, b.y + b.h);
            // De-duplicate speakers by name + rough position
            const speakers = [...a.speakers];
            for (const s of b.speakers) {
              const dup = speakers.some(
                (x) =>
                  x.name.trim().toLowerCase() === s.name.trim().toLowerCase() &&
                  Math.abs(x.x - s.x) < 0.05 &&
                  Math.abs(x.y - s.y) < 0.05
              );
              if (!dup) speakers.push(s);
            }
            remaining.splice(j, 1);
            remaining[i] = {
              ...a,
              x: nx,
              y: ny,
              w: nx2 - nx,
              h: ny2 - ny,
              speakers,
            };
            merged = true;
            break outer;
          }
        }
      }
    }
    return remaining;
  };

  const tidyPanels = (list: DetectedPanel[]) =>
    renumberInReadingOrder(mergeOverlappingPanels(list));

  const applyPanelBoxes = (boxes: PanelBox[]) => {
    pushHistory();
    // Preserve any existing speaker data per panel index when possible
    const oldByIndex = new Map(panels.map((p) => [p.index, p]));
    const mapped: DetectedPanel[] = boxes.map((b) => {
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
    const next = tidyPanels(mapped);
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
    const next = tidyPanels([...panels, newPanel]);
    setPanels(next);
    placeBubbles(next, speakerMap);
    setEditingPanels(true);
  };

  const handleTidyPanels = () => {
    if (panels.length === 0) return;
    const next = tidyPanels(panels);
    setPanels(next);
    placeBubbles(next, speakerMap);
    toast({
      title: 'Panels tidied',
      description: `Reordered into reading sequence; merged overlapping boxes.`,
    });
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

  // Merge newly detected panels with existing ones, preferring the manual edits
  // when boxes overlap by more than `overlapThresh` of either area.
  const mergePanels = (
    existing: DetectedPanel[],
    incoming: DetectedPanel[],
    overlapThresh = 0.4
  ): DetectedPanel[] => {
    const out = [...existing];
    const overlapFrac = (a: DetectedPanel, b: DetectedPanel) => {
      const ix = Math.max(0, Math.min(a.x + a.w, b.x + b.w) - Math.max(a.x, b.x));
      const iy = Math.max(0, Math.min(a.y + a.h, b.y + b.h) - Math.max(a.y, b.y));
      const inter = ix * iy;
      const aA = a.w * a.h;
      const aB = b.w * b.h;
      if (aA <= 0 || aB <= 0) return 0;
      return Math.max(inter / aA, inter / aB);
    };
    for (const cand of incoming) {
      const dup = out.some((p) => overlapFrac(p, cand) > overlapThresh);
      if (!dup) out.push({ ...cand, index: out.length + 1 });
    }
    return tidyPanels(out);
  };

  const handleReanalyzeRegion = async () => {
    if (!imageDataUrl) {
      toast({ title: 'Upload artwork first', variant: 'destructive' });
      return;
    }
    if (!region || region.w < 0.02 || region.h < 0.02) {
      toast({ title: 'Draw a region on the page first', variant: 'destructive' });
      return;
    }
    setReanalyzingRegion(true);
    setError(null);
    try {
      const { data, error: fnErr } = await supabase.functions.invoke('letter-page-analyze', {
        body: { imageDataUrl, characters: characterRoster, region },
      });
      if (fnErr) throw new Error(fnErr.message);
      if (data?.error) throw new Error(data.error);
      const detected: DetectedPanel[] = data?.panels ?? [];
      // Keep only detections whose center falls inside the requested region.
      const inRegion = detected.filter((p) => {
        const cx = p.x + p.w / 2;
        const cy = p.y + p.h / 2;
        return (
          cx >= region.x &&
          cx <= region.x + region.w &&
          cy >= region.y &&
          cy <= region.y + region.h
        );
      });
      if (inRegion.length === 0) {
        toast({ title: 'No new panels detected in that region.', variant: 'destructive' });
        return;
      }
      const merged = mergePanels(panels, inRegion);
      setPanels(merged);
      placeBubbles(merged, speakerMap);
      const added = merged.length - panels.length;
      toast({
        title: `Merged ${inRegion.length} detection${inRegion.length === 1 ? '' : 's'}`,
        description: `${added} new panel${added === 1 ? '' : 's'} added; ${
          inRegion.length - added
        } overlapped existing boxes and were skipped.`,
      });
      setRegionMode(false);
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Re-analysis failed';
      setError(msg);
      toast({ title: msg, variant: 'destructive' });
    } finally {
      setReanalyzingRegion(false);
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
        <div className="ml-auto flex items-center gap-2">
          <Button size="sm" variant="ghost" onClick={handleNew}>
            <Plus className="mr-1 h-4 w-4" />New
          </Button>
          <Button size="sm" variant="outline" onClick={() => {
            if (!user) { setAuthOpen(true); return; }
            setLibraryOpen((v) => !v);
          }}>
            <FolderOpen className="mr-1 h-4 w-4" />
            Library{library.length ? ` (${library.length})` : ''}
          </Button>
          <Button size="sm" onClick={handleSave} disabled={saving}>
            {saving ? <Loader2 className="mr-1 h-4 w-4 animate-spin" /> : <Save className="mr-1 h-4 w-4" />}
            {projectId ? 'Save' : 'Save to library'}
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-[360px_1fr]">
        {/* ---------------- Left: inputs ---------------- */}
        <div className="space-y-4">
          {!user && (
            <Card>
              <CardContent className="flex items-center justify-between gap-3 p-4">
                <p className="text-xs text-muted-foreground">
                  Sign in to save your work and access your library across devices.
                </p>
                <Button size="sm" variant="outline" onClick={() => setAuthOpen(true)}>
                  <LogIn className="mr-1 h-4 w-4" /> Sign in
                </Button>
              </CardContent>
            </Card>
          )}

          {user && libraryOpen && (
            <Card>
              <CardContent className="space-y-2 p-4">
                <div className="flex items-center justify-between">
                  <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                    Your lettering library
                  </label>
                  <Button size="sm" variant="ghost" onClick={() => setLibraryOpen(false)}>Close</Button>
                </div>
                {loadingProject && (
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <Loader2 className="h-3 w-3 animate-spin" /> Loading…
                  </div>
                )}
                {library.length === 0 ? (
                  <p className="text-xs text-muted-foreground">No saved projects yet.</p>
                ) : (
                  <ul className="max-h-72 space-y-1 overflow-auto">
                    {library.map((p) => (
                      <li key={p.id} className="flex items-center gap-2 rounded-sm border p-2 text-xs hover:bg-accent/30">
                        <button
                          type="button"
                          className="flex-1 text-left"
                          onClick={() => handleLoad(p.id)}
                        >
                          <div className="truncate font-medium">{p.title}</div>
                          <div className="text-[10px] text-muted-foreground">
                            {new Date(p.updated_at).toLocaleString()}
                          </div>
                        </button>
                        <button
                          type="button"
                          aria-label="Delete"
                          className="rounded p-1 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
                          onClick={() => handleDeleteProject(p.id, p.image_path)}
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      </li>
                    ))}
                  </ul>
                )}
              </CardContent>
            </Card>
          )}

          <Card>
            <CardContent className="space-y-2 p-4">
              <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                Project title
              </label>
              <Input
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Untitled Lettering"
              />
            </CardContent>
          </Card>

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

          {imageUrl && panels.length > 0 && (
            <Card>
              <CardContent className="space-y-2 p-3">
                <div className="flex items-center justify-between gap-2">
                  <div>
                    <div className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Re-detect in region
                    </div>
                    <p className="text-[11px] text-muted-foreground">
                      Draw a box on the page; AI re-runs only there and merges into your edits.
                    </p>
                  </div>
                  <Switch
                    checked={regionMode}
                    onCheckedChange={(v) => {
                      setRegionMode(v);
                      if (!v) {
                        setRegion(null);
                        setDrawingRegion(null);
                      } else {
                        setEditingPanels(false);
                      }
                    }}
                  />
                </div>
                {regionMode && (
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-mono text-[10px] text-muted-foreground">
                      {region
                        ? `${Math.round(region.w * 100)}% × ${Math.round(region.h * 100)}%`
                        : 'No region drawn yet'}
                    </span>
                    {region && (
                      <Button
                        size="sm"
                        variant="ghost"
                        className="h-7 px-2 text-[11px]"
                        onClick={() => setRegion(null)}
                      >
                        Clear
                      </Button>
                    )}
                    <Button
                      size="sm"
                      className="ml-auto h-7"
                      disabled={!region || reanalyzingRegion}
                      onClick={handleReanalyzeRegion}
                    >
                      {reanalyzingRegion ? (
                        <>
                          <Loader2 className="mr-1.5 h-3.5 w-3.5 animate-spin" />
                          Analyzing…
                        </>
                      ) : (
                        <>
                          <Wand2 className="mr-1.5 h-3.5 w-3.5" />
                          Re-detect & merge
                        </>
                      )}
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          )}

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
                  <>
                    <p className="text-[11px] text-muted-foreground">
                      Drag on empty artwork to draw a panel. Drag a panel to move it, the corner to
                      resize, or click ✕ to delete. Bubbles update automatically.
                    </p>
                    <div className="space-y-2 rounded-md border bg-muted/30 p-2">
                      <div className="flex items-center justify-between gap-2">
                        <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                          Snap to panel edges
                        </label>
                        <Switch checked={snapToEdges} onCheckedChange={setSnapToEdges} />
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between gap-2">
                          <label className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                            Grid
                          </label>
                          <span className="text-[10px] text-muted-foreground">
                            {gridDivisions === 0 ? 'Off' : `${gridDivisions} × ${gridDivisions}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {[0, 4, 6, 8, 12, 16].map((n) => (
                            <button
                              key={n}
                              type="button"
                              onClick={() => setGridDivisions(n)}
                              className={cn(
                                'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                                gridDivisions === n
                                  ? 'border-primary bg-primary/15 text-primary'
                                  : 'border-border bg-background hover:bg-muted'
                              )}
                            >
                              {n === 0 ? 'Off' : n}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  </>
                )}
                <div className="flex flex-wrap gap-2">
                  <Button size="sm" variant="outline" className="flex-1" onClick={addManualPanel}>
                    + Add panel
                  </Button>
                  {panels.length > 1 && (
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={handleTidyPanels}
                      title="Renumber in reading order and merge overlapping panels"
                    >
                      Tidy
                    </Button>
                  )}
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
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <Users className="h-4 w-4 text-primary" />
                    <label className="font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
                      Map uncertain speakers
                    </label>
                  </div>
                  <Button
                    type="button"
                    size="sm"
                    variant="outline"
                    className="h-7 text-[11px]"
                    onClick={() => {
                      const next: Record<string, string | string[]> = { ...speakerMap };
                      const norm = (s: string) =>
                        s.toLowerCase().replace(/[^a-z0-9]+/g, '');
                      const nameScore = (a: string, b: string) => {
                        const na = norm(a);
                        const nb = norm(b);
                        if (!na || !nb) return 0;
                        if (na === nb) return 1;
                        if (na.includes(nb) || nb.includes(na)) return 0.85;
                        const at = new Set(a.toLowerCase().split(/\s+/).filter(Boolean));
                        const bt = new Set(b.toLowerCase().split(/\s+/).filter(Boolean));
                        let shared = 0;
                        for (const t of at) if (bt.has(t)) shared++;
                        const tokenJ = shared / Math.max(1, at.size + bt.size - shared);
                        const setA = new Set(na);
                        let charShared = 0;
                        for (const c of nb) if (setA.has(c)) charShared++;
                        const charJ = charShared / Math.max(na.length, nb.length);
                        return Math.max(tokenJ, charJ * 0.6);
                      };
                      for (const scriptName of uncertainScriptSpeakers) {
                        const key = scriptName.trim().toLowerCase();
                        const panelIdxs: number[] = [];
                        allParsedPanels.forEach((p, i) => {
                          if (p.dialogues?.some((d) => d.speaker.trim().toLowerCase() === key)) {
                            panelIdxs.push(i);
                          }
                        });
                        let best: { name: string; score: number } | null = null;
                        for (const cand of detectedSpeakerNames) {
                          const candKey = cand.trim().toLowerCase();
                          const taken = Object.entries(next).some(([k, v]) => {
                            if (k === key) return false;
                            const arr = Array.isArray(v) ? v : [v];
                            return arr.some((x) => x.trim().toLowerCase() === candKey);
                          });
                          if (taken) continue;
                          const ns = nameScore(scriptName, cand);
                          let coPresent = 0;
                          for (const idx of panelIdxs) {
                            const dp = panels[idx];
                            if (dp?.speakers.some((s) => s.name.trim().toLowerCase() === candKey)) {
                              coPresent++;
                            }
                          }
                          const presence =
                            panelIdxs.length > 0 ? coPresent / panelIdxs.length : 0;
                          const score = ns * 0.65 + presence * 0.35;
                          if (!best || score > best.score) best = { name: cand, score };
                        }
                        if (best && best.score > 0.15) next[key] = [best.name];
                      }
                      setSpeakerMap(next);
                    }}
                  >
                    Auto-map
                  </Button>
                </div>
                <p className="text-[11px] text-muted-foreground">
                  These script speakers weren't matched to a visible character. Toggle one or more
                  detected characters below — multi-mapped speakers will rotate targets per line,
                  and you can override per dialogue line on each bubble.
                </p>
                <div className="space-y-3">
                  {uncertainScriptSpeakers.map((name) => {
                    const key = name.trim().toLowerCase();
                    const raw = speakerMap[key];
                    const selected = Array.isArray(raw) ? raw : raw ? [raw] : [];
                    const selectedSet = new Set(selected.map((s) => s.trim().toLowerCase()));
                    return (
                      <div key={key} className="space-y-1.5">
                        <div className="flex items-center gap-2">
                          <span className="w-24 shrink-0 truncate text-xs font-medium">{name}</span>
                          <span className="text-[11px] text-muted-foreground">
                            → {selected.length === 0 ? 'Unmapped' : `${selected.length} target${selected.length > 1 ? 's' : ''}`}
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {detectedSpeakerNames.map((d) => {
                            const isOn = selectedSet.has(d.trim().toLowerCase());
                            return (
                              <button
                                key={d}
                                type="button"
                                onClick={() =>
                                  setSpeakerMap((prev) => {
                                    const next = { ...prev };
                                    const cur = Array.isArray(next[key])
                                      ? [...(next[key] as string[])]
                                      : next[key]
                                      ? [next[key] as string]
                                      : [];
                                    const i = cur.findIndex(
                                      (x) => x.trim().toLowerCase() === d.trim().toLowerCase()
                                    );
                                    if (i >= 0) cur.splice(i, 1);
                                    else cur.push(d);
                                    if (cur.length === 0) delete next[key];
                                    else next[key] = cur;
                                    return next;
                                  })
                                }
                                className={cn(
                                  'rounded-full border px-2 py-0.5 text-[10px] transition-colors',
                                  isOn
                                    ? 'border-primary bg-primary/15 text-primary'
                                    : 'border-border bg-background hover:bg-muted'
                                )}
                              >
                                {d}
                              </button>
                            );
                          })}
                        </div>
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
            <>
              {/* Zoom / pan toolbar */}
              <div className="mb-2 flex flex-wrap items-center gap-1.5">
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => setZoom((z) => Math.max(0.25, +(z - 0.25).toFixed(2)))}
                  title="Zoom out"
                >
                  <ZoomOut className="h-3.5 w-3.5" />
                </Button>
                <input
                  type="range"
                  min={0.25}
                  max={4}
                  step={0.05}
                  value={zoom}
                  onChange={(e) => setZoom(parseFloat(e.target.value))}
                  className="h-1 w-32 accent-primary"
                />
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => setZoom((z) => Math.min(4, +(z + 0.25).toFixed(2)))}
                  title="Zoom in"
                >
                  <ZoomIn className="h-3.5 w-3.5" />
                </Button>
                <span className="ml-1 w-12 font-mono text-[11px] text-muted-foreground">
                  {Math.round(zoom * 100)}%
                </span>
                <Button
                  size="sm"
                  variant="outline"
                  className="h-8 px-2"
                  onClick={() => {
                    setZoom(1);
                    setPan({ x: 0, y: 0 });
                  }}
                  title="Reset zoom & pan (fit)"
                >
                  <Maximize2 className="h-3.5 w-3.5" />
                </Button>
                <Button
                  size="sm"
                  variant={panMode ? 'default' : 'outline'}
                  className="h-8 px-2"
                  onClick={() => setPanMode((v) => !v)}
                  title="Toggle pan mode (or hold Space / middle-click)"
                >
                  <Hand className="h-3.5 w-3.5" />
                </Button>
                <span className="ml-auto text-[10px] text-muted-foreground">
                  Wheel = zoom · Space / middle drag = pan
                </span>
              </div>

              <div
                ref={viewportRef}
                className="relative mx-auto overflow-hidden rounded-md bg-background"
                style={{ maxWidth: '900px', height: '70vh' }}
                onWheel={(e) => {
                  if (!e.ctrlKey && !e.metaKey && Math.abs(e.deltaY) < 1) return;
                  e.preventDefault();
                  const rect = viewportRef.current?.getBoundingClientRect();
                  if (!rect) return;
                  const cx = e.clientX - rect.left;
                  const cy = e.clientY - rect.top;
                  const factor = Math.exp(-e.deltaY * 0.0015);
                  setZoom((prev) => {
                    const next = Math.max(0.25, Math.min(4, prev * factor));
                    // Adjust pan so the point under cursor stays put
                    setPan((p) => ({
                      x: cx - ((cx - p.x) * next) / prev,
                      y: cy - ((cy - p.y) * next) / prev,
                    }));
                    return next;
                  });
                }}
                onPointerDown={(e) => {
                  const isPanGesture =
                    panMode ||
                    e.button === 1 ||
                    (e.button === 0 && (e.shiftKey || (e as any).altKey));
                  if (!isPanGesture) return;
                  e.preventDefault();
                  const start = { x: e.clientX, y: e.clientY };
                  const startPan = { ...pan };
                  const target = e.currentTarget;
                  target.setPointerCapture(e.pointerId);
                  const onMove = (ev: PointerEvent) => {
                    setPan({
                      x: startPan.x + (ev.clientX - start.x),
                      y: startPan.y + (ev.clientY - start.y),
                    });
                  };
                  const onUp = (ev: PointerEvent) => {
                    target.releasePointerCapture(ev.pointerId);
                    target.removeEventListener('pointermove', onMove);
                    target.removeEventListener('pointerup', onUp);
                    target.removeEventListener('pointercancel', onUp);
                  };
                  target.addEventListener('pointermove', onMove);
                  target.addEventListener('pointerup', onUp);
                  target.addEventListener('pointercancel', onUp);
                }}
              >
                <div
                  ref={exportRef}
                  className="relative origin-top-left"
                  style={{
                    transform: `translate(${pan.x}px, ${pan.y}px) scale(${zoom})`,
                    transformOrigin: '0 0',
                    width: '100%',
                    cursor: panMode ? 'grab' : undefined,
                  }}
                >
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
                            tailTargets={p.speakers.map((s) => ({
                              name: s.name,
                              x: p.w > 0 ? Math.max(0, Math.min(1, (s.x - p.x) / p.w)) : 0.5,
                              y: p.h > 0 ? Math.max(0, Math.min(1, (s.y - p.y) / p.h)) : 0.5,
                            }))}
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
                    enabled={editingPanels && !panMode}
                    gridSize={gridDivisions > 0 ? 1 / gridDivisions : 0}
                    snapToEdges={snapToEdges}
                    snapTolerance={0.012}
                  />
                  {/* Region selection overlay (for re-detect) */}
                  {regionMode && (
                    <div
                      className="absolute inset-0"
                      style={{ cursor: 'crosshair' }}
                      onPointerDown={(e) => {
                        if (e.button !== 0) return;
                        const host = e.currentTarget as HTMLDivElement;
                        const rect = host.getBoundingClientRect();
                        const sx = (e.clientX - rect.left) / rect.width;
                        const sy = (e.clientY - rect.top) / rect.height;
                        host.setPointerCapture(e.pointerId);
                        const start = { x: sx, y: sy };
                        setDrawingRegion({ x: sx, y: sy, w: 0, h: 0 });
                        const onMove = (ev: PointerEvent) => {
                          const cx = (ev.clientX - rect.left) / rect.width;
                          const cy = (ev.clientY - rect.top) / rect.height;
                          const x = Math.max(0, Math.min(1, Math.min(start.x, cx)));
                          const y = Math.max(0, Math.min(1, Math.min(start.y, cy)));
                          const x2 = Math.max(0, Math.min(1, Math.max(start.x, cx)));
                          const y2 = Math.max(0, Math.min(1, Math.max(start.y, cy)));
                          setDrawingRegion({ x, y, w: x2 - x, h: y2 - y });
                        };
                        const onUp = () => {
                          host.removeEventListener('pointermove', onMove);
                          host.removeEventListener('pointerup', onUp);
                          setDrawingRegion((r) => {
                            if (r && r.w > 0.01 && r.h > 0.01) setRegion(r);
                            return null;
                          });
                        };
                        host.addEventListener('pointermove', onMove);
                        host.addEventListener('pointerup', onUp);
                      }}
                    >
                      {(drawingRegion ?? region) && (
                        <div
                          className="pointer-events-none absolute border-2 border-amber-400 bg-amber-400/10"
                          style={{
                            left: `${(drawingRegion ?? region!).x * 100}%`,
                            top: `${(drawingRegion ?? region!).y * 100}%`,
                            width: `${(drawingRegion ?? region!).w * 100}%`,
                            height: `${(drawingRegion ?? region!).h * 100}%`,
                          }}
                        />
                      )}
                    </div>
                  )}
                </div>
              </div>
            </>
          )}
        </div>
      </div>
      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}
