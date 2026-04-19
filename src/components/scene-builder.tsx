
import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { useUndoableState } from '@/hooks/useUndoableState';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Progress } from '@/components/ui/progress';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import {
  Film, Tv, Clapperboard, Theater, Loader2, Download, RefreshCw,
  ChevronLeft, ChevronRight, Pencil, Check, X, Thermometer,
  ArrowRight, Swords, Brain, MessageSquare, Eye, Zap, Copy, Printer,
  ListVideo, AlertTriangle, Undo2, Redo2, BookOpen
} from 'lucide-react';
import { Switch } from '@/components/ui/switch';
import { Slider } from '@/components/ui/slider';
import { LAYOUT_TEMPLATES, type LayoutTemplate } from '@/lib/scene-layout-analysis';
import SeasonOverviewPanel from '@/components/season-overview-panel';
import SeasonTensionChart from '@/components/season-tension-chart';
import type { Scene } from '@/lib/narrative/types';
import { getAllowedTiers, getClosestAllowedTier, getSceneViolations, fixAllViolations } from '@/lib/narrative/pacing';
import { generateScenes as apiGenerateScenes } from '@/lib/narrative/api';
import { copyScenesText, printScenesHtml } from '@/lib/narrative/formatting';

export type { Scene } from '@/lib/narrative/types';

interface SceneBuilderProps {
  storyData: Record<string, string>;
  medium: string;
  mediumConfig: Record<string, string>;
  projectId?: string | null;
  onScenesChange?: (scenes: Scene[]) => void;
  scenesOverride?: Scene[] | null;
}

const mediumOptions = [
  { value: 'film', label: 'Feature Film', icon: <Film className="h-3.5 w-3.5" /> },
  { value: 'tv_episode', label: 'TV Episode', icon: <Tv className="h-3.5 w-3.5" /> },
  { value: 'tv_series', label: 'TV Series', icon: <Tv className="h-3.5 w-3.5" /> },
  { value: 'comic', label: 'Comic Book', icon: <Clapperboard className="h-3.5 w-3.5" /> },
  { value: 'stage_play', label: 'Stage Play', icon: <Theater className="h-3.5 w-3.5" /> },
];

const actColors: Record<number, string> = {
  1: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
  2: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  3: 'bg-red-500/20 text-red-400 border-red-500/30',
  4: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
  5: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
};

const axisColors: Record<string, { bg: string; text: string; bar: string }> = {
  A: { bg: 'bg-blue-500/20', text: 'text-blue-400', bar: 'bg-blue-500' },
  B: { bg: 'bg-amber-500/20', text: 'text-amber-400', bar: 'bg-amber-500' },
  C: { bg: 'bg-red-500/20', text: 'text-red-400', bar: 'bg-red-500' },
};

const beatTierColors: Record<string, string> = {
  setup: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
  escalation: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
  midpoint: 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20',
  collapse: 'bg-red-500/10 text-red-400 border-red-500/20',
  resolution: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
};

const getEnergyColor = (level: number) => {
  if (level >= 80) return 'bg-red-500';
  if (level >= 60) return 'bg-orange-500';
  if (level >= 40) return 'bg-amber-500';
  if (level >= 20) return 'bg-blue-400';
  return 'bg-blue-300';
};

const SceneBuilder = ({ storyData, medium: initialMedium, mediumConfig, projectId, onScenesChange, scenesOverride }: SceneBuilderProps) => {
  const storageKey = `celsius-scenes-${projectId || 'local'}`;
  const [scenes, setScenes, { undo: undoScenes, redo: redoScenes, canUndo, canRedo }] = useUndoableState<Scene[]>(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved ? JSON.parse(saved) : [];
    } catch { return []; }
  });
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isGenerating, setIsGenerating] = useState(false);
  const [activeMedium, setActiveMedium] = useState(initialMedium || 'film');
  const [editingField, setEditingField] = useState<string | null>(null);
  const [editValue, setEditValue] = useState('');
  const [regeneratingIndex, setRegeneratingIndex] = useState<number | null>(null);
  const [activeEpisode, setActiveEpisode] = useState(1);
  const [batchGenerating, setBatchGenerating] = useState(false);
  const [batchProgress, setBatchProgress] = useState({ current: 0, total: 0 });

  const isTvSeries = activeMedium === 'tv_series';
  const isComic = activeMedium === 'comic';
  const isMultiUnit = isTvSeries || isComic;
  const unitLabel = isComic ? 'Issue' : 'Episode';
  const unitLabelShort = isComic ? 'Iss' : 'Ep';
  const unitLabelPlural = isComic ? 'Issues' : 'Episodes';
  const totalEpisodes = isTvSeries
    ? parseInt(mediumConfig?._tv_series_episodes || '10') || 10
    : isComic
      ? parseInt(mediumConfig?._comic_issues || '6') || 6
      : 1;

  // Filter scenes by active episode/issue for multi-unit mediums
  const displayScenes = useMemo(() => {
    if (!isMultiUnit) return scenes;
    return scenes.filter(s => s.episode === activeEpisode);
  }, [scenes, isMultiUnit, activeEpisode]);

  // Which episodes have scenes generated + axis balance per episode
  const episodesWithScenes = useMemo(() => {
    if (!isMultiUnit) return new Set<number>();
    const set = new Set<number>();
    scenes.forEach(s => { if (s.episode) set.add(s.episode); });
    return set;
  }, [scenes, isMultiUnit]);

  const axisBalance = useMemo(() => {
    const counts = { A: 0, B: 0, C: 0 };
    displayScenes.forEach(s => {
      if (s.primaryAxis && counts.hasOwnProperty(s.primaryAxis)) {
        counts[s.primaryAxis as keyof typeof counts]++;
      }
    });
    return counts;
  }, [displayScenes]);

  useEffect(() => {
    if (scenes.length > 0) {
      localStorage.setItem(storageKey, JSON.stringify(scenes));
      onScenesChange?.(scenes);
    }
  }, [scenes, storageKey]);

  // External scene injection (from "Implement Fixes")
  const lastOverrideRef = useRef<Scene[] | null>(null);
  useEffect(() => {
    if (scenesOverride && scenesOverride !== lastOverrideRef.current && scenesOverride.length > 0) {
      lastOverrideRef.current = scenesOverride;
      setScenes(scenesOverride);
      toast.success(`Applied ${scenesOverride.length} corrected scenes (Undo available)`);
    }
  }, [scenesOverride]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [activeEpisode]);

  const generateScenesForEpisode = async (episodeNum?: number, totalEps?: number): Promise<Scene[]> => {
    return apiGenerateScenes(storyData, activeMedium, mediumConfig, episodeNum, totalEps);
  };

  const generateScenes = async () => {
    setIsGenerating(true);
    try {
      if (isMultiUnit) {
        // Generate for active episode/issue only
        const epScenes = await generateScenesForEpisode(activeEpisode, totalEpisodes);
        const tagged = epScenes.map(s => ({ ...s, episode: activeEpisode }));
        setScenes(prev => {
          const other = prev.filter(s => s.episode !== activeEpisode);
          return [...other, ...tagged];
        });
        setSelectedIndex(0);
        toast.success(`Generated ${tagged.length} scenes for ${unitLabel} ${activeEpisode}`);
      } else {
        const newScenes = await generateScenesForEpisode();
        setScenes(newScenes);
        setSelectedIndex(0);
        toast.success(`Generated ${newScenes.length} scenes`);
      }
    } catch (e: any) {
      toast.error(e.message || 'Scene generation failed');
    } finally {
      setIsGenerating(false);
    }
  };

  const generateAllEpisodes = async () => {
    setBatchGenerating(true);
    setBatchProgress({ current: 0, total: totalEpisodes });
    let allScenes: Scene[] = [];
    try {
      for (let ep = 1; ep <= totalEpisodes; ep++) {
        setBatchProgress({ current: ep, total: totalEpisodes });
        toast.info(`Generating ${unitLabel} ${ep} of ${totalEpisodes}...`);
        const epScenes = await generateScenesForEpisode(ep, totalEpisodes);
        const tagged = epScenes.map(s => ({ ...s, episode: ep }));
        allScenes = [...allScenes, ...tagged];
      }
      setScenes(allScenes);
      setActiveEpisode(1);
      setSelectedIndex(0);
      toast.success(`Generated scenes for all ${totalEpisodes} ${unitLabelPlural.toLowerCase()}`);
    } catch (e: any) {
      if (allScenes.length > 0) {
        setScenes(allScenes);
        toast.warning(`Stopped at ${unitLabel} ${batchProgress.current}: ${e.message}. Partial results saved.`);
      } else {
        toast.error(e.message || 'Batch generation failed');
      }
    } finally {
      setBatchGenerating(false);
      setBatchProgress({ current: 0, total: 0 });
    }
  };

  const regenerateScene = async (index: number) => {
    const scene = displayScenes[index];
    setRegeneratingIndex(index);
    try {
      const resp = await fetch(
        `${process.env.NEXT_PUBLIC_SUPABASE_URL}/functions/v1/generate-scenes`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            storyData: {
              ...storyData,
              _regenerate_scene: scene.sceneNumber,
              _prev_scene: index > 0 ? JSON.stringify(displayScenes[index - 1]) : null,
              _next_scene: index < displayScenes.length - 1 ? JSON.stringify(displayScenes[index + 1]) : null,
            },
            medium: activeMedium,
            mediumConfig,
            ...(isMultiUnit && { episodeNumber: activeEpisode, totalEpisodes }),
          }),
        }
      );
      if (!resp.ok) throw new Error('Regeneration failed');
      const result = await resp.json();
      const newScenes = result.scenes || result;
      if (Array.isArray(newScenes) && newScenes.length > 0) {
        const replacement = { ...newScenes[0], sceneNumber: scene.sceneNumber, ...(isMultiUnit && { episode: activeEpisode }) };
          setScenes(prev => {
            const fullIndex = prev.findIndex(s =>
              s.sceneNumber === scene.sceneNumber && (!isMultiUnit || s.episode === activeEpisode)
            );
          if (fullIndex === -1) return prev;
          const updated = [...prev];
          updated[fullIndex] = replacement;
          return updated;
        });
        toast.success(`Scene ${scene.sceneNumber} regenerated`);
      }
    } catch {
      toast.error('Regeneration failed');
    } finally {
      setRegeneratingIndex(null);
    }
  };

  const updateSceneField = (index: number, field: string, value: string | number) => {
    const scene = displayScenes[index];
    setScenes(prev => {
      const fullIndex = prev.findIndex(s =>
        s.sceneNumber === scene.sceneNumber && (!isMultiUnit || s.episode === activeEpisode)
      );
      if (fullIndex === -1) return prev;
      const updated = [...prev];
      updated[fullIndex] = { ...updated[fullIndex], [field]: value };
      return updated;
    });
    setEditingField(null);
  };

  const exportScenes = () => {
    const blob = new Blob([JSON.stringify(scenes, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `celsius-scenes-${activeMedium}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success('Scenes exported');
  };

  const copyScenes = () => {
    const scenesToCopy = isMultiUnit ? displayScenes : scenes;
    const text = copyScenesText(scenesToCopy, activeMedium, isMultiUnit, activeEpisode, totalEpisodes, unitLabel, isComic);
    navigator.clipboard.writeText(text);
    toast.success(isMultiUnit ? `${unitLabel} ${activeEpisode} scenes copied` : 'All scenes copied to clipboard');
  };

  const printScenes = () => {
    printScenesHtml(scenes, activeMedium, isMultiUnit, totalEpisodes, unitLabel, unitLabelPlural, isComic);
  };

  const selected = displayScenes[selectedIndex];

  const startEdit = (field: string, currentValue: string | number) => {
    setEditingField(field);
    setEditValue(String(currentValue));
  };

  const renderEditableField = (label: string, field: string, value: string | number, icon?: React.ReactNode) => {
    const isEditing = editingField === field;
    return (
      <div className="space-y-1">
        <div className="flex items-center gap-1.5">
          {icon}
          <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground">{label}</span>
          {!isEditing && (
            <button onClick={() => startEdit(field, value)} className="ml-auto opacity-0 group-hover/field:opacity-100 transition-opacity">
              <Pencil className="h-3 w-3 text-muted-foreground hover:text-foreground" />
            </button>
          )}
        </div>
        {isEditing ? (
          <div className="flex gap-1">
            {typeof value === 'number' ? (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                type="number"
                className="h-7 text-xs"
                autoFocus
              />
            ) : String(value).length > 60 ? (
              <Textarea
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="text-xs min-h-[60px]"
                autoFocus
              />
            ) : (
              <Input
                value={editValue}
                onChange={e => setEditValue(e.target.value)}
                className="h-7 text-xs"
                autoFocus
              />
            )}
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => updateSceneField(selectedIndex, field, typeof value === 'number' ? parseInt(editValue) || 0 : editValue)}>
              <Check className="h-3 w-3" />
            </Button>
            <Button size="icon" variant="ghost" className="h-7 w-7 shrink-0" onClick={() => setEditingField(null)}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        ) : (
          <p className="text-sm text-foreground leading-relaxed">{value || '—'}</p>
        )}
      </div>
    );
  };

  const fixViolations = useCallback(() => {
    const { fixed, count } = fixAllViolations(scenes, totalEpisodes);
    if (count > 0) setScenes(fixed);
    return count;
  }, [scenes, totalEpisodes]);

  const moveScene = useCallback((sceneNumber: number, fromEpisode: number, toEpisode: number) => {
    setScenes(prev => {
      const idx = prev.findIndex(s => s.sceneNumber === sceneNumber && s.episode === fromEpisode);
      if (idx === -1) return prev;
      const updated = [...prev];
      updated[idx] = { ...updated[idx], episode: toEpisode };
      return updated;
    });
    toast.success(`Moved Scene ${sceneNumber} from ${unitLabelShort} ${fromEpisode} → ${unitLabelShort} ${toEpisode}`);
  }, []);

  return (
    <div className="space-y-4">
      {/* Medium Toggle */}
      <div className="flex flex-wrap gap-1.5">
        {mediumOptions.map(m => (
          <Button
            key={m.value}
            variant={activeMedium === m.value ? 'default' : 'outline'}
            size="sm"
            className="text-xs gap-1.5"
            onClick={() => setActiveMedium(m.value)}
          >
            {m.icon} {m.label}
          </Button>
        ))}
      </div>

      {/* Episode Tab Bar (TV Series only) */}
      {isMultiUnit && (
        <div className="space-y-2">
          <div className="flex items-center gap-1.5 mb-1">
            <ListVideo className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground">
              {isComic ? 'Series' : 'Season'} — {totalEpisodes} {unitLabelPlural}
            </span>
          </div>
          <div className="flex flex-wrap gap-1">
            {Array.from({ length: totalEpisodes }, (_, i) => i + 1).map(ep => {
              const hasScenes = episodesWithScenes.has(ep);
              const isActive = activeEpisode === ep;
              const epScenes = scenes.filter(s => s.episode === ep);
              const epAxis = { A: 0, B: 0, C: 0 };
              epScenes.forEach(s => { if (s.primaryAxis && epAxis.hasOwnProperty(s.primaryAxis)) epAxis[s.primaryAxis as keyof typeof epAxis]++; });
              return (
                <button
                  key={ep}
                  onClick={() => setActiveEpisode(ep)}
                  className={`px-2.5 py-1 text-xs rounded-md border transition-all font-medium ${
                    isActive
                      ? 'bg-primary text-primary-foreground border-primary'
                      : hasScenes
                        ? 'bg-primary/10 text-primary border-primary/30 hover:bg-primary/20'
                        : 'bg-muted/20 text-muted-foreground border-border hover:bg-muted/40'
                  }`}
                >
                  <span>{unitLabelShort} {ep}</span>
                  {hasScenes && (
                    <span className="ml-1 text-[8px] opacity-70">
                      {epAxis.A}/{epAxis.B}/{epAxis.C}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          {/* Axis Balance Legend */}
          {displayScenes.length > 0 && (
            <div className="flex items-center gap-3 text-[9px]">
              <span className="text-muted-foreground">Axis Balance:</span>
              <span className="text-blue-400 font-semibold">A:{axisBalance.A}</span>
              <span className="text-amber-400 font-semibold">B:{axisBalance.B}</span>
              <span className="text-red-400 font-semibold">C:{axisBalance.C}</span>
            </div>
          )}
        </div>
      )}

      {/* Season Overview Panel (TV Series only) */}
      {isMultiUnit && (
        <SeasonOverviewPanel
          scenes={scenes}
          totalEpisodes={totalEpisodes}
          onEpisodeClick={setActiveEpisode}
          activeEpisode={activeEpisode}
          onFixViolations={fixViolations}
          onMoveScene={moveScene}
        />
      )}

      {/* Season Tension Arc Chart (TV Series only) */}
      {isMultiUnit && (
        <SeasonTensionChart
          scenes={scenes}
          totalEpisodes={totalEpisodes}
          activeEpisode={activeEpisode}
          onEpisodeClick={setActiveEpisode}
        />
      )}

      {/* Generate / Actions Bar */}
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          onClick={generateScenes}
          disabled={isGenerating || batchGenerating}
          size="sm"
          className="gap-1.5"
        >
          {isGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Zap className="h-3.5 w-3.5" />}
          {isGenerating ? 'Generating...' : isMultiUnit
            ? (episodesWithScenes.has(activeEpisode) ? `Regenerate ${unitLabelShort} ${activeEpisode}` : `Build ${unitLabelShort} ${activeEpisode}`)
            : (scenes.length > 0 ? 'Regenerate All' : 'Build Scenes')}
        </Button>
        {isMultiUnit && (
          <Button
            onClick={generateAllEpisodes}
            disabled={isGenerating || batchGenerating}
            size="sm"
            variant="outline"
            className="gap-1.5"
          >
            {batchGenerating ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <ListVideo className="h-3.5 w-3.5" />}
            {batchGenerating ? `${unitLabel} ${batchProgress.current}/${batchProgress.total}` : `Generate All ${unitLabelPlural}`}
          </Button>
        )}
        {/* Undo/Redo */}
        {scenes.length > 0 && (
          <>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={undoScenes} disabled={!canUndo} title="Undo">
              <Undo2 className="h-3.5 w-3.5" />
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8" onClick={redoScenes} disabled={!canRedo} title="Redo">
              <Redo2 className="h-3.5 w-3.5" />
            </Button>
          </>
        )}
        {displayScenes.length > 0 && (
          <>
            <Button variant="outline" size="sm" onClick={copyScenes} className="gap-1.5">
              <Copy className="h-3.5 w-3.5" /> Copy
            </Button>
            <Button variant="outline" size="sm" onClick={printScenes} className="gap-1.5">
              <Printer className="h-3.5 w-3.5" /> Print / Save PDF
            </Button>
            <Button variant="outline" size="sm" onClick={exportScenes} className="gap-1.5">
              <Download className="h-3.5 w-3.5" /> Export JSON
            </Button>
            <Badge variant="secondary" className="text-xs">
              {isMultiUnit
                ? `${displayScenes.length} scenes — ${unitLabel} ${activeEpisode} of ${totalEpisodes}`
                : `${scenes.length} scenes across ${Math.max(...scenes.map(s => s.act))} acts`}
            </Badge>
            {isComic && displayScenes.length > 0 && (() => {
              const targetPages = parseInt(mediumConfig?._comic_pages || '22');
              const estimatedPages = displayScenes.reduce((sum, s) => sum + (s.isSplashPage ? 1 : Math.ceil((s.panelCount || 4) / 4)), 0);
              return (
                <Badge
                  variant="outline"
                  className={`text-xs ${estimatedPages > targetPages ? 'border-destructive text-destructive' : estimatedPages >= targetPages * 0.8 ? 'border-yellow-500 text-yellow-500' : 'border-green-500 text-green-500'}`}
                >
                  ~{estimatedPages} / {targetPages} pages
                </Badge>
              );
            })()}
          </>
        )}
      </div>

      {/* Batch Progress */}
      {batchGenerating && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            <span>Generating {unitLabel} {batchProgress.current} of {batchProgress.total}...</span>
            <span>{Math.round((batchProgress.current / batchProgress.total) * 100)}%</span>
          </div>
          <Progress value={(batchProgress.current / batchProgress.total) * 100} className="h-2" />
        </div>
      )}

      {/* Energy Timeline */}
      {displayScenes.length > 0 && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-1.5">
            <Thermometer className="h-3.5 w-3.5 text-primary" />
            <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground">
              Celsius Tension Index™{isMultiUnit ? ` — ${unitLabel} ${activeEpisode}` : ''}
            </span>
          </div>
          <div className="flex items-end gap-px h-12 bg-muted/20 rounded-md p-1 overflow-x-auto">
            {displayScenes.map((scene, i) => (
              <button
                key={i}
                className={`flex-1 min-w-[8px] rounded-t-sm transition-all hover:opacity-80 ${
                  scene.primaryAxis && axisColors[scene.primaryAxis] ? axisColors[scene.primaryAxis].bar : getEnergyColor(scene.energyLevel)
                } ${selectedIndex === i ? 'ring-1 ring-primary ring-offset-1 ring-offset-background' : ''}`}
                style={{ height: `${Math.max(scene.energyLevel, 5)}%` }}
                onClick={() => setSelectedIndex(i)}
                title={`Scene ${scene.sceneNumber}: ${scene.title} — ${scene.energyLevel}°C${scene.primaryAxis ? ` [${scene.primaryAxis}]` : ''}`}
              />
            ))}
          </div>
          <div className="flex justify-between text-[8px] text-muted-foreground px-1">
            <span>Scene 1</span>
            <span>Scene {displayScenes.length}</span>
          </div>
        </div>
      )}

      {/* Scene List + Detail */}
      {displayScenes.length > 0 && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          {/* Scene List - Left Panel */}
          <div className="lg:col-span-4">
            {/* Mobile dropdown */}
            <div className="lg:hidden mb-3">
              <Select value={String(selectedIndex)} onValueChange={v => setSelectedIndex(parseInt(v))}>
                <SelectTrigger className="text-xs">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {displayScenes.map((s, i) => (
                    <SelectItem key={i} value={String(i)} className="text-xs">
                      {s.sceneNumber}. {s.title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Desktop scrollable list */}
            <ScrollArea className="hidden lg:block h-[600px] pr-2">
              <div className="space-y-1.5">
                {displayScenes.map((scene, i) => (
                  <button
                    key={i}
                    onClick={() => setSelectedIndex(i)}
                    className={`w-full text-left rounded-lg p-2.5 transition-all border ${
                      selectedIndex === i
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-transparent hover:border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <span className="text-[10px] font-mono text-muted-foreground w-5">{String(scene.sceneNumber).padStart(2, '0')}</span>
                      {scene.primaryAxis && (
                        <span className={`text-[8px] font-bold px-1 py-0 rounded ${axisColors[scene.primaryAxis]?.bg || ''} ${axisColors[scene.primaryAxis]?.text || ''}`}>
                          {scene.primaryAxis}
                        </span>
                      )}
                      <Badge variant="outline" className={`text-[8px] px-1 py-0 ${actColors[scene.act] || ''}`}>
                        Act {scene.act}
                      </Badge>
                      {scene.beatTier && (
                        <Badge variant="outline" className={`text-[7px] px-1 py-0 ${beatTierColors[scene.beatTier] || ''}`}>
                          {scene.beatTier}
                        </Badge>
                      )}
                      {isComic && scene.panelCount && (
                        <Badge variant="outline" className="text-[7px] px-1 py-0 bg-purple-500/10 text-purple-400 border-purple-500/20">
                          {scene.panelCount}P{scene.isSplashPage ? ' 💥' : ''}
                        </Badge>
                      )}
                      {isMultiUnit && (() => {
                        const violation = getSceneViolations(scene, totalEpisodes);
                        return violation ? (
                          <TooltipProvider delayDuration={200}>
                            <Tooltip>
                              <TooltipTrigger asChild>
                                <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                              </TooltipTrigger>
                              <TooltipContent side="right" className="text-xs max-w-[220px]">
                                <p className="text-destructive font-medium">Beat Misplaced</p>
                                <p className="text-muted-foreground">{violation}</p>
                              </TooltipContent>
                            </Tooltip>
                          </TooltipProvider>
                        ) : null;
                      })()}
                      <span className="text-[9px] text-muted-foreground ml-auto">{scene.energyLevel}°C</span>
                    </div>
                    <p className="text-xs font-medium text-foreground truncate">{scene.title}</p>
                    <div className="mt-1.5 h-1 rounded-full bg-muted/30 overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all ${scene.primaryAxis && axisColors[scene.primaryAxis] ? axisColors[scene.primaryAxis].bar : getEnergyColor(scene.energyLevel)}`}
                        style={{ width: `${scene.energyLevel}%` }}
                      />
                    </div>
                  </button>
                ))}
              </div>
            </ScrollArea>
          </div>

          {/* Scene Detail - Center Panel */}
          <div className="lg:col-span-8">
            {selected && (
              <Card className="border-border">
                <CardContent className="p-5 space-y-4">
                  {/* Header */}
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        {isMultiUnit && (
                          <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">
                            {unitLabelShort} {activeEpisode}
                          </Badge>
                        )}
                        {selected.primaryAxis && (
                          <Badge variant="outline" className={`text-[9px] font-bold ${axisColors[selected.primaryAxis]?.bg || ''} ${axisColors[selected.primaryAxis]?.text || ''} border-0`}>
                            {selected.primaryAxis === 'A' ? 'A-Axis' : selected.primaryAxis === 'B' ? 'B-Axis' : 'C-Axis'}
                          </Badge>
                        )}
                        <Badge variant="outline" className={`text-[9px] ${actColors[selected.act] || ''}`}>
                          Act {selected.act}
                        </Badge>
                        <Badge variant="secondary" className="text-[9px]">{selected.sequence}</Badge>
                        <Badge variant="outline" className="text-[9px] border-primary/30 text-primary">{selected.keyFunction}</Badge>
                        {selected.beatTier && (
                          <Badge variant="outline" className={`text-[9px] ${beatTierColors[selected.beatTier] || ''}`}>
                            {selected.beatTier}
                          </Badge>
                        )}
                      </div>
                      {/* Beat placement violation warning */}
                      {isMultiUnit && (() => {
                        const violation = getSceneViolations(selected, totalEpisodes);
                        return violation ? (
                          <div className="flex items-center gap-1.5 mt-1 px-2 py-1 rounded-md bg-destructive/10 border border-destructive/20">
                            <AlertTriangle className="h-3 w-3 text-destructive shrink-0" />
                            <span className="text-[9px] text-destructive">{violation}</span>
                          </div>
                        ) : null;
                      })()}
                      <h3 className="text-lg font-semibold text-foreground">
                        Scene {String(selected.sceneNumber).padStart(2, '0')}: {selected.title}
                      </h3>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={selectedIndex === 0}
                        onClick={() => setSelectedIndex(i => i - 1)}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-7 w-7"
                        disabled={selectedIndex === displayScenes.length - 1}
                        onClick={() => setSelectedIndex(i => i + 1)}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>

                  {/* Celsius Tension Index™ */}
                  <div className="flex items-center gap-3 bg-muted/20 rounded-lg p-3">
                    <Thermometer className="h-5 w-5 text-primary shrink-0" />
                    <div className="flex-1">
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-[10px] font-['Orbitron'] text-muted-foreground">CELSIUS TENSION INDEX™</span>
                        <span className="text-sm font-bold text-foreground">{selected.energyLevel}°C</span>
                      </div>
                      <div className="h-2 rounded-full bg-muted/40 overflow-hidden">
                        <div
                          className={`h-full rounded-full transition-all ${getEnergyColor(selected.energyLevel)}`}
                          style={{ width: `${selected.energyLevel}%` }}
                        />
                      </div>
                    </div>
                  </div>

                  {/* Proprietary Metrics */}
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-muted/10 border border-border/30 rounded-lg p-3">
                      <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground block mb-1.5">Narrative Pressure Score™</span>
                      {(() => {
                        const conflictWeight = (selected.conflictInternal?.length > 20 ? 1 : 0) + (selected.conflictExternal?.length > 20 ? 1 : 0);
                        const dialogueWeight = selected.dialogueDensity === 'High' ? 2 : selected.dialogueDensity === 'Moderate' ? 1 : 0;
                        const causalWeight = (selected.buildsFrom?.length > 10 ? 1 : 0) + (selected.setsUp?.length > 10 ? 1 : 0);
                        const total = conflictWeight + dialogueWeight + causalWeight;
                        const label = total >= 5 ? 'Critical' : total >= 3 ? 'High' : total >= 2 ? 'Medium' : 'Low';
                        const color = total >= 5 ? 'text-red-400' : total >= 3 ? 'text-orange-400' : total >= 2 ? 'text-amber-400' : 'text-blue-400';
                        return <span className={`text-sm font-bold ${color}`}>{label}</span>;
                      })()}
                    </div>
                    <div className="bg-muted/10 border border-border/30 rounded-lg p-3">
                      <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground block mb-1.5">Axis Stability Rating™</span>
                      <div className="flex gap-1.5">
                        {[
                          { axis: 'A', active: !!(selected.conflictExternal?.length > 10 || selected.purpose?.length > 10), color: 'bg-blue-500' },
                          { axis: 'B', active: !!(selected.conflictInternal?.length > 10), color: 'bg-amber-500' },
                          { axis: 'C', active: !!(selected.conflictExternal?.length > 20 || selected.keyFunction?.includes('Opposition')), color: 'bg-red-500' },
                        ].map(a => (
                          <div key={a.axis} className={`flex items-center gap-1 px-2 py-0.5 rounded text-[9px] font-bold ${a.active ? `${a.color}/20 text-foreground` : 'bg-muted/20 text-muted-foreground/50'}`}>
                            {a.axis}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Causality Chain */}
                  <div className="bg-muted/10 border border-border/50 rounded-lg p-3">
                    <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground block mb-2">Causality Chain</span>
                    <div className="flex items-center gap-2 flex-wrap text-xs">
                      <span className="text-muted-foreground">Builds From:</span>
                      <span className="text-foreground">{selected.buildsFrom || '—'}</span>
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-primary font-semibold">Scene {selected.sceneNumber}</span>
                      <ArrowRight className="h-3 w-3 text-primary shrink-0" />
                      <span className="text-muted-foreground">Sets Up:</span>
                      <span className="text-foreground">{selected.setsUp || '—'}</span>
                    </div>
                  </div>

                  <Separator />

                  {/* Fields Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-3 group/field">
                      {renderEditableField('Purpose', 'purpose', selected.purpose, <Zap className="h-3 w-3 text-primary" />)}
                    </div>
                    <div className="space-y-3 group/field">
                      {renderEditableField('Summary', 'summary', selected.summary)}
                    </div>
                    <div className="space-y-3 group/field">
                      {renderEditableField('Tone', 'tone', selected.tone)}
                    </div>
                    <div className="space-y-3 group/field">
                      {renderEditableField('Visual Signature', 'visualSignature', selected.visualSignature, <Eye className="h-3 w-3 text-accent" />)}
                    </div>
                  </div>

                  <Separator />

                  {/* Conflict */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <Swords className="h-3 w-3" /> Conflict
                    </span>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <div className="group/field bg-muted/10 rounded-lg p-3 border border-border/30">
                        {renderEditableField('Internal (Self)', 'conflictInternal', selected.conflictInternal, <Brain className="h-3 w-3 text-amber-400" />)}
                      </div>
                      <div className="group/field bg-muted/10 rounded-lg p-3 border border-border/30">
                        {renderEditableField('External (Opposition)', 'conflictExternal', selected.conflictExternal, <Swords className="h-3 w-3 text-red-400" />)}
                      </div>
                    </div>
                  </div>

                  <Separator />

                  {/* Dialogue Intelligence */}
                  <div className="space-y-3">
                    <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                      <MessageSquare className="h-3 w-3" /> Dialogue Intelligence
                    </span>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="group/field">
                        {renderEditableField('Density', 'dialogueDensity', selected.dialogueDensity)}
                      </div>
                      <div className="group/field">
                        {renderEditableField('Est. Lines', 'estimatedDialogueLines', selected.estimatedDialogueLines)}
                      </div>
                    </div>
                  </div>

                  {/* Stage Play specific fields */}
                  {activeMedium === 'stage_play' && (selected.entrancesExits || selected.stageDirections) && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <Theater className="h-3 w-3" /> Stage Notes
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          {selected.entrancesExits && (
                            <div className="group/field">
                              {renderEditableField('Entrances / Exits', 'entrancesExits', selected.entrancesExits)}
                            </div>
                          )}
                          {selected.stageDirections && (
                            <div className="group/field">
                              {renderEditableField('Stage Directions', 'stageDirections', selected.stageDirections)}
                            </div>
                          )}
                        </div>
                      </div>
                    </>
                  )}

                  {/* Comic Layout fields */}
                  {isComic && (
                    <>
                      <Separator />
                      <div className="space-y-3">
                        <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
                          <BookOpen className="h-3 w-3" /> Comic Layout
                        </span>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          {/* Panel Count */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Panel Count</label>
                            <div className="flex items-center gap-2">
                              <Slider
                                value={[selected.panelCount || 4]}
                                min={1}
                                max={6}
                                step={1}
                                onValueChange={([v]) => updateSceneField(selectedIndex, 'panelCount', v)}
                                className="flex-1"
                              />
                              <span className="text-xs font-mono text-foreground w-4 text-center">{selected.panelCount || 4}</span>
                            </div>
                          </div>
                          {/* Page Layout */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Page Layout</label>
                            <Select
                              value={selected.pageLayout || 'standard-grid'}
                              onValueChange={v => updateSceneField(selectedIndex, 'pageLayout', v)}
                            >
                              <SelectTrigger className="h-8 text-xs">
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(LAYOUT_TEMPLATES) as LayoutTemplate[]).map(key => (
                                  <SelectItem key={key} value={key} className="text-xs">
                                    {LAYOUT_TEMPLATES[key].icon} {LAYOUT_TEMPLATES[key].name}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </div>
                          {/* Splash Page */}
                          <div className="space-y-1.5">
                            <label className="text-[9px] uppercase tracking-wider text-muted-foreground font-medium">Splash Page</label>
                            <div className="flex items-center gap-2 pt-1">
                              <Switch
                                checked={!!selected.isSplashPage}
                                onCheckedChange={checked => {
                                  const scene = displayScenes[selectedIndex];
                                  setScenes(prev => {
                                    const fullIndex = prev.findIndex(s =>
                                      s.sceneNumber === scene.sceneNumber && (!isMultiUnit || s.episode === activeEpisode)
                                    );
                                    if (fullIndex === -1) return prev;
                                    const updated = [...prev];
                                    updated[fullIndex] = {
                                      ...updated[fullIndex],
                                      isSplashPage: checked,
                                      ...(checked ? { panelCount: 1, pageLayout: 'splash-heavy' } : {}),
                                    };
                                    return updated;
                                  });
                                }}
                              />
                              <span className="text-xs text-muted-foreground">{selected.isSplashPage ? '💥 Full Splash' : 'Off'}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Regenerate button */}
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="gap-1.5 text-xs"
                      disabled={regeneratingIndex === selectedIndex}
                      onClick={() => regenerateScene(selectedIndex)}
                    >
                      {regeneratingIndex === selectedIndex ? (
                        <Loader2 className="h-3 w-3 animate-spin" />
                      ) : (
                        <RefreshCw className="h-3 w-3" />
                      )}
                      Regenerate This Scene
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      )}

      {/* Empty state */}
      {displayScenes.length === 0 && !isGenerating && !batchGenerating && (
        <div className="text-center py-8">
          <Thermometer className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">
            {isMultiUnit ? `No scenes generated for ${unitLabel} ${activeEpisode} yet.` : 'No scenes generated yet.'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">
            {isMultiUnit
              ? `Click "Build ${unitLabelShort} ${activeEpisode}" to generate scenes for this ${unitLabel.toLowerCase()}, or "Generate All ${unitLabelPlural}" for the full ${isComic ? 'series' : 'season'}.`
              : 'Select a medium and click "Build Scenes" to decompose your story.'}
          </p>
        </div>
      )}

      {isGenerating && !batchGenerating && (
        <div className="text-center py-12">
          <Loader2 className="h-8 w-8 text-primary mx-auto mb-3 animate-spin" />
          <p className="text-sm text-foreground font-medium">
            {isMultiUnit ? `Decomposing ${unitLabel} ${activeEpisode} into scenes...` : 'Decomposing narrative into scenes...'}
          </p>
          <p className="text-xs text-muted-foreground mt-1">Analyzing story structure, building causality chains, mapping energy levels.</p>
        </div>
      )}
    </div>
  );
};

export default SceneBuilder;
