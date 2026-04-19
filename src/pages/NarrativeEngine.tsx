import { useState, useCallback, useRef, useEffect } from 'react';
import { toast } from 'sonner';
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import type { User as SupabaseUser } from '@supabase/supabase-js';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { LegalFooter } from '@/components/LegalFooter';
import {
  ArrowLeft, ChevronDown, ChevronRight, Dna, Swords, Brain, Skull,
  Flame, Trophy, Sparkles, Save, Download, RotateCcw, Zap, Target,
  Shield, Eye, Heart, AlertTriangle, Crown, BookOpen, Wand2, Loader2,
  FolderOpen, Plus, Trash2, Pencil, Check, X, Film, Tv, Clapperboard, Settings2,
  FileText, Copy, Printer, Theater, LayoutGrid
} from 'lucide-react';
import SceneBuilder from '@/components/scene-builder';
import { FilmExampleTooltip, FullTemplatePicker } from '@/components/film-example-tooltip';
import { GlossaryTooltip } from '@/components/glossary-tooltip';
import { FilmCompareDialog } from '@/components/film-compare-dialog';
import { exportStoryAsPdf } from '@/lib/story-pdf-export';
import { printAllStoryData } from '@/lib/story-print-all';
import { SceneDiffDialog } from '@/components/scene-diff-dialog';
import { ActionableFixesPanel, parseAnalysisIntoFixes } from '@/components/actionable-fixes-panel';
import type { Scene, ParsedFix, StorySection, StoryField, StoryProject } from '@/lib/narrative/types';
import {
  coreDnaFields, sectionDefinitions, allFieldKeys as sharedAllFieldKeys,
  fieldGlossaryMap, sectionGlossaryMap,
} from '@/lib/narrative/fields';
import { streamAnalysis, implementFixes } from '@/lib/narrative/api';
import { printAnalysisHtml } from '@/lib/narrative/formatting';

/* ───────── Section Definitions (with icons — UI-specific layer over shared fields) ───────── */

const sections: (StorySection & { icon: React.ReactNode })[] = sectionDefinitions.map(s => {
  const iconMap: Record<string, React.ReactNode> = {
    a1: <Target className="h-4 w-4" />, b1: <Heart className="h-4 w-4" />, c1: <Skull className="h-4 w-4" />,
    a2: <Swords className="h-4 w-4" />, midpoint: <AlertTriangle className="h-4 w-4" />,
    b2: <Brain className="h-4 w-4" />, c2: <Eye className="h-4 w-4" />, lowpoint: <Flame className="h-4 w-4" />,
    b3: <Sparkles className="h-4 w-4" />, a3: <Trophy className="h-4 w-4" />, c3: <Shield className="h-4 w-4" />,
    denouement: <Crown className="h-4 w-4" />, franchise: <Zap className="h-4 w-4" />,
  };
  return { ...s, icon: iconMap[s.id] || <Zap className="h-4 w-4" /> };
});

const STORAGE_KEY = 'narrative-engine-data';

/* ───────── Component ───────── */

export default function NarrativeEngine() {
  const navigate = useNavigate();
  const [data, setData] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      return saved ? JSON.parse(saved) : {};
    } catch { return {}; }
  });
  const [openSections, setOpenSections] = useState<Record<string, boolean>>({ core: true });
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [aiAnalysis, setAiAnalysis] = useState('');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const abortRef = useRef<AbortController | null>(null);

  // Auth & project state
  const [user, setUser] = useState<SupabaseUser | null>(null);
  const [projects, setProjects] = useState<StoryProject[]>([]);
  const [currentProjectId, setCurrentProjectId] = useState<string | null>(null);
  const [showProjects, setShowProjects] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [renamingId, setRenamingId] = useState<string | null>(null);
  const [renameValue, setRenameValue] = useState('');
  const [engineScenes, setEngineScenes] = useState<Scene[]>([]);
  const [isImplementing, setIsImplementing] = useState(false);
  const [implementingElapsed, setImplementingElapsed] = useState(0);
  const implementingTimerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [scenesOverride, setScenesOverride] = useState<Scene[] | null>(null);
  const [pendingFixes, setPendingFixes] = useState<{ correctedScenes: Scene[]; changesSummary: string } | null>(null);
  const [showDiffDialog, setShowDiffDialog] = useState(false);
  const [applyingFixId, setApplyingFixId] = useState<string | null>(null);

  // Auth listener
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });
    return () => subscription.unsubscribe();
  }, []);

  // Import from Astralnaut Studios (via localStorage shuttle)
  useEffect(() => {
    try {
      const importRaw = localStorage.getItem('narrative-engine-import');
      if (!importRaw) return;
      const importData = JSON.parse(importRaw) as Record<string, string>;
      localStorage.removeItem('narrative-engine-import');

      setData(prev => {
        const merged = { ...prev, ...importData };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(merged));
        return merged;
      });

      // Auto-expand all sections that received data
      const allSectionIds = ['core', ...sections.map(s => s.id)];
      const expanded: Record<string, boolean> = {};
      for (const id of allSectionIds) {
        expanded[id] = true;
      }
      setOpenSections(expanded);

      toast.success('Story plan imported! All sections populated.');
    } catch { /* ignore parse errors */ }
  }, []);

  // Load projects when user changes
  useEffect(() => {
    if (!user) { setProjects([]); return; }
    loadProjects();
  }, [user]);

  const loadProjects = async () => {
    const { data: rows, error } = await supabase
      .from('story_projects')
      .select('*')
      .order('updated_at', { ascending: false });
    if (!error && rows) {
      setProjects(rows.map(r => {
        const sd = (r.story_data as Record<string, any>) || {};
        const { __scenes, ...storyFields } = sd;
        return {
          ...r,
          story_data: storyFields as Record<string, string>,
          scene_data: __scenes ?? null,
        };
      }) as any);
    }
  };

  const updateField = useCallback((key: string, value: string) => {
    setData(prev => {
      const next = { ...prev, [key]: value };
      localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
      return next;
    });
  }, []);

  const toggleSection = (id: string) => {
    setOpenSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleSave = async () => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    setLastSaved(new Date());

    if (!user) {
      toast.success('Saved locally');
      return;
    }

    setIsSaving(true);
    try {
      if (currentProjectId) {
        const { error } = await supabase
          .from('story_projects')
          .update({
            story_data: data as any,
            scene_data: engineScenes.length > 0 ? (engineScenes as any) : null,
            title: data.protag_name ? `${data.protag_name}'s Story` : 'Untitled Story',
          })
          .eq('id', currentProjectId);
        if (error) throw error;
        toast.success('Saved to cloud');
      } else {
        const title = data.protag_name ? `${data.protag_name}'s Story` : 'Untitled Story';
        const { data: row, error } = await supabase
          .from('story_projects')
          .insert({
            user_id: user.id,
            title,
            story_data: data as any,
            scene_data: engineScenes.length > 0 ? (engineScenes as any) : null,
          })
          .select()
          .single();
        if (error) throw error;
        setCurrentProjectId(row.id);
        toast.success('Saved to cloud');
      }
      await loadProjects();
    } catch (e: any) {
      toast.error(e.message || 'Save failed');
    } finally {
      setIsSaving(false);
    }
  };

  const handleLoadProject = (project: StoryProject) => {
    setData(project.story_data);
    setCurrentProjectId(project.id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(project.story_data));

    if (project.scene_data && Array.isArray(project.scene_data) && project.scene_data.length > 0) {
      const scenes = project.scene_data as Scene[];
      setScenesOverride(scenes);
      setEngineScenes(scenes);
      localStorage.setItem(`celsius-scenes-${project.id}`, JSON.stringify(scenes));
    } else {
      setScenesOverride(null);
      setEngineScenes([]);
      localStorage.removeItem(`celsius-scenes-${project.id}`);
    }

    setShowProjects(false);
    toast.success(`Loaded "${project.title}"`);
  };

  const handleNewProject = () => {
    if (currentProjectId) {
      localStorage.removeItem(`celsius-scenes-${currentProjectId}`);
    }
    localStorage.removeItem('celsius-scenes-local');
    setScenesOverride(null);
    setEngineScenes([]);

    setData({});
    setCurrentProjectId(null);
    localStorage.removeItem(STORAGE_KEY);
    setShowProjects(false);
    setAiAnalysis('');
    toast.success('New story started');
  };

  const handleDeleteProject = async (id: string) => {
    if (!confirm('Delete this project permanently?')) return;
    const { error } = await supabase.from('story_projects').delete().eq('id', id);
    if (error) { toast.error('Delete failed'); return; }
    if (currentProjectId === id) {
      setCurrentProjectId(null);
      setData({});
      localStorage.removeItem(STORAGE_KEY);
    }
    await loadProjects();
    toast.success('Project deleted');
  };

  const handleRenameProject = async (id: string) => {
    if (!renameValue.trim()) return;
    const { error } = await supabase
      .from('story_projects')
      .update({ title: renameValue.trim() })
      .eq('id', id);
    if (error) { toast.error('Rename failed'); return; }
    setRenamingId(null);
    await loadProjects();
  };

  const handleExport = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `narrative-engine-${(data.protag_name || 'untitled').toLowerCase().replace(/\s+/g, '-')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleImport = () => {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';
    input.onchange = (e) => {
      const file = (e.target as HTMLInputElement).files?.[0];
      if (!file) return;
      const reader = new FileReader();
      reader.onload = (ev) => {
        try {
          const imported = JSON.parse(ev.target?.result as string);
          setData(imported);
          setCurrentProjectId(null);
          localStorage.setItem(STORAGE_KEY, JSON.stringify(imported));
          toast.success('Imported successfully');
        } catch { toast.error('Invalid JSON file'); }
      };
      reader.readAsText(file);
    };
    input.click();
  };

  const handleReset = () => {
    if (confirm('Clear all fields? This cannot be undone.')) {
      setData({});
      setCurrentProjectId(null);
      localStorage.removeItem(STORAGE_KEY);
      setAiAnalysis('');
    }
  };

  // Calculate completion — use shared field keys
  const filledCount = sharedAllFieldKeys.filter(k => data[k]?.trim()).length;
  const completionPct = Math.round((filledCount / sharedAllFieldKeys.length) * 100);

  const renderField = (field: StoryField) => (
    <div key={field.key} className="space-y-1.5">
      <div className="flex items-center gap-1.5">
        <label className="text-sm font-medium text-foreground">{field.label}</label>
        <FilmExampleTooltip fieldKey={field.key} />
        {fieldGlossaryMap[field.key] && <GlossaryTooltip term={fieldGlossaryMap[field.key]} />}
      </div>
      {field.multiline ? (
        <Textarea
          value={data[field.key] || ''}
          onChange={e => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="min-h-[80px] bg-muted/50 border-border text-foreground placeholder:text-muted-foreground resize-y"
        />
      ) : (
        <Input
          value={data[field.key] || ''}
          onChange={e => updateField(field.key, e.target.value)}
          placeholder={field.placeholder}
          className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground"
        />
      )}
    </div>
  );

  const getThreadBadge = (id: string) => {
    if (id.startsWith('a')) return <Badge variant="outline" className="border-blue-500/50 text-blue-400 text-[10px]">A-AXIS</Badge>;
    if (id.startsWith('b')) return <Badge variant="outline" className="border-amber-500/50 text-amber-400 text-[10px]">B-AXIS</Badge>;
    if (id.startsWith('c')) return <Badge variant="outline" className="border-red-500/50 text-red-400 text-[10px]">C-AXIS</Badge>;
    if (id === 'midpoint' || id === 'lowpoint') return <Badge variant="outline" className="border-yellow-500/50 text-yellow-300 text-[10px]">TURNING POINT</Badge>;
    if (id === 'denouement') return <Badge variant="outline" className="border-emerald-500/50 text-emerald-400 text-[10px]">RESOLUTION</Badge>;
    if (id === 'franchise') return <Badge variant="outline" className="border-purple-500/50 text-purple-400 text-[10px]">EXTENSION</Badge>;
    return null;
  };

  const getSectionCompletion = (fields: StoryField[]) => {
    const filled = fields.filter(f => data[f.key]?.trim()).length;
    return { filled, total: fields.length };
  };

  const currentProject = projects.find(p => p.id === currentProjectId);

  /* ───── AI Analysis (uses shared streamAnalysis) ───── */
  const runAnalysis = useCallback(async (scenesForAnalysis?: Scene[]) => {
    setIsAnalyzing(true);
    setAiAnalysis('');
    abortRef.current = new AbortController();
    const scenesToUse = scenesForAnalysis || engineScenes;
    try {
      let result = '';
      for await (const chunk of streamAnalysis(
        data,
        scenesToUse.length > 0 ? scenesToUse : undefined,
        aiAnalysis || undefined,
        abortRef.current.signal,
      )) {
        result += chunk;
        setAiAnalysis(result);
      }
    } catch (e: any) {
      if (e.name !== 'AbortError') {
        toast.error(e.message || 'Analysis failed');
      }
    } finally {
      setIsAnalyzing(false);
    }
  }, [data, engineScenes, aiAnalysis]);

  /* ───── Implement All Fixes (uses shared implementFixes) ───── */
  const handleImplementAllFixes = useCallback(async () => {
    setIsImplementing(true);
    setImplementingElapsed(0);
    implementingTimerRef.current = setInterval(() => setImplementingElapsed(prev => prev + 1), 1000);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const result = await implementFixes(engineScenes, aiAnalysis, data, controller.signal);
      clearTimeout(timeoutId);
      setPendingFixes(result);
      setShowDiffDialog(true);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        toast.error('Request timed out. Try applying individual fixes instead.');
      } else {
        toast.error(e.message || 'Failed to implement fixes');
      }
      console.error(e);
    } finally {
      if (implementingTimerRef.current) { clearInterval(implementingTimerRef.current); implementingTimerRef.current = null; }
      setIsImplementing(false);
    }
  }, [engineScenes, aiAnalysis, data]);

  /* ───── Apply Single Fix (uses shared implementFixes) ───── */
  const handleApplyFix = useCallback(async (fix: ParsedFix) => {
    setApplyingFixId(fix.id);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 90000);
      const result = await implementFixes(
        engineScenes,
        `Apply ONLY this specific fix, leave everything else unchanged:\n\n${fix.title}: ${fix.description}`,
        data,
        controller.signal,
      );
      clearTimeout(timeoutId);
      setPendingFixes(result);
      setShowDiffDialog(true);
    } catch (e: any) {
      if (e.name === 'AbortError') {
        toast.error('Request timed out. Try a different individual fix.');
      } else {
        toast.error(e.message || 'Failed to apply fix');
      }
      console.error(e);
    } finally {
      setApplyingFixId(null);
    }
  }, [engineScenes, data]);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <div className="sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur-md">
        <div className="max-w-4xl mx-auto px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div>
              <h1 className="text-lg font-bold font-['Orbitron'] text-foreground flex items-center gap-2">
                <Dna className="h-5 w-5 text-primary" />
                Narrative Engine
              </h1>
              <p className="text-xs text-muted-foreground">
                {currentProject ? currentProject.title : 'A/B/C Multi-Thread Story System'}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground hidden sm:inline">
              {filledCount}/{sharedAllFieldKeys.length} fields
            </span>
            {user && (
              <Button variant="outline" size="sm" onClick={() => setShowProjects(!showProjects)}>
                <FolderOpen className="h-3.5 w-3.5 mr-1" /> Projects
              </Button>
            )}
            <Button variant="outline" size="sm" onClick={handleImport} className="hidden sm:flex">
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Import
            </Button>
            <Button variant="outline" size="sm" onClick={() => navigate('/narrative-engine/guide')} className="hidden sm:flex">
              <BookOpen className="h-3.5 w-3.5 mr-1" /> Guide
            </Button>
            <Button variant="outline" size="sm" onClick={handleExport}>
              <Download className="h-3.5 w-3.5 mr-1" /> JSON
            </Button>
            <Button variant="outline" size="sm" onClick={() => exportStoryAsPdf(data, currentProject?.title)}>
              <FileText className="h-3.5 w-3.5 mr-1" /> PDF
            </Button>
            <Button variant="outline" size="sm" onClick={() => printAllStoryData(data, engineScenes, aiAnalysis || null, currentProject?.title)} disabled={filledCount < 1}>
              <Printer className="h-3.5 w-3.5 mr-1" /> Print All
            </Button>
            <Button variant="default" size="sm" onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> : <Save className="h-3.5 w-3.5 mr-1" />}
              Save
            </Button>
          </div>
        </div>
        {/* Progress bar */}
        <div className="max-w-4xl mx-auto px-4 pb-2">
          <div className="flex items-center gap-3">
            <Progress value={completionPct} className="h-1.5 flex-1" />
            <span className="text-xs font-mono text-muted-foreground w-10 text-right">{completionPct}%</span>
          </div>
        </div>
      </div>

      <div className="max-w-4xl mx-auto px-4 py-8 space-y-6">
        {/* Projects Panel */}
        {showProjects && user && (
          <Card className="border-accent/30 bg-card">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-['Orbitron'] text-accent flex items-center gap-2">
                  <FolderOpen className="h-4 w-4" />
                  YOUR STORY PROJECTS
                </CardTitle>
                <Button size="sm" variant="outline" onClick={handleNewProject}>
                  <Plus className="h-3.5 w-3.5 mr-1" /> New
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-2 pt-0">
              {projects.length === 0 ? (
                <p className="text-xs text-muted-foreground py-4 text-center">
                  No saved projects yet. Fill in some fields and hit Save to create your first one.
                </p>
              ) : (
                projects.map(project => (
                  <div
                    key={project.id}
                    className={`flex items-center justify-between p-3 rounded-lg border transition-colors cursor-pointer ${
                      currentProjectId === project.id
                        ? 'border-primary/50 bg-primary/5'
                        : 'border-border hover:bg-muted/30'
                    }`}
                  >
                    <div className="flex-1 min-w-0" onClick={() => handleLoadProject(project)}>
                      {renamingId === project.id ? (
                        <div className="flex items-center gap-2">
                          <Input
                            value={renameValue}
                            onChange={e => setRenameValue(e.target.value)}
                            className="h-7 text-sm bg-muted/50"
                            onKeyDown={e => { if (e.key === 'Enter') handleRenameProject(project.id); if (e.key === 'Escape') setRenamingId(null); }}
                            autoFocus
                            onClick={e => e.stopPropagation()}
                          />
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); handleRenameProject(project.id); }}>
                            <Check className="h-3 w-3" />
                          </Button>
                          <Button size="icon" variant="ghost" className="h-6 w-6" onClick={(e) => { e.stopPropagation(); setRenamingId(null); }}>
                            <X className="h-3 w-3" />
                          </Button>
                        </div>
                      ) : (
                        <>
                          <div className="flex items-center gap-2">
                            <p className="text-sm font-medium text-foreground truncate">{project.title}</p>
                            {Array.isArray(project.scene_data) && (project.scene_data as unknown[]).length > 0 && (
                              <TooltipProvider>
                                <Tooltip>
                                  <TooltipTrigger asChild>
                                    <Badge variant="secondary" className="text-[10px] px-1.5 py-0 h-4 shrink-0 cursor-default">
                                      {(project.scene_data as unknown[]).length} ep{(project.scene_data as unknown[]).length !== 1 ? 's' : ''}
                                    </Badge>
                                  </TooltipTrigger>
                                  <TooltipContent side="bottom" className="max-w-[220px]">
                                    <p className="font-medium text-xs mb-1">Episodes</p>
                                    <ul className="text-[10px] space-y-0.5">
                                      {(project.scene_data as any[]).slice(0, 10).map((ep: any, i: number) => (
                                        <li key={i} className="truncate">
                                          {ep.sceneNumber ? `${ep.sceneNumber}. ` : ''}{ep.title || `Episode ${i + 1}`}
                                        </li>
                                      ))}
                                      {(project.scene_data as any[]).length > 10 && (
                                        <li className="text-muted-foreground">+{(project.scene_data as any[]).length - 10} more</li>
                                      )}
                                    </ul>
                                  </TooltipContent>
                                </Tooltip>
                              </TooltipProvider>
                            )}
                          </div>
                          <p className="text-xs text-muted-foreground">
                            Updated {new Date(project.updated_at).toLocaleDateString()}
                          </p>
                        </>
                      )}
                    </div>
                    {renamingId !== project.id && (
                      <div className="flex items-center gap-1 ml-2">
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); setRenamingId(project.id); setRenameValue(project.title); }}>
                          <Pencil className="h-3 w-3 text-muted-foreground" />
                        </Button>
                        <Button size="icon" variant="ghost" className="h-7 w-7" onClick={(e) => { e.stopPropagation(); handleDeleteProject(project.id); }}>
                          <Trash2 className="h-3 w-3 text-destructive" />
                        </Button>
                      </div>
                    )}
                  </div>
                ))
              )}
            </CardContent>
          </Card>
        )}

        {!user && (
          <Card className="border-accent/20 bg-card">
            <CardContent className="p-4">
              <p className="text-xs text-muted-foreground text-center">
                Sign in on the <button onClick={() => navigate('/')} className="text-primary hover:underline">homepage</button> to save projects to the cloud. Local saves still work.
              </p>
            </CardContent>
          </Card>
        )}

        {/* Intro Card */}
        <Card className="border-primary/20 bg-card overflow-hidden">
          <div className="absolute inset-0 bg-[var(--gradient-hero)] pointer-events-none" />
          <CardContent className="relative p-6 space-y-3">
            <p className="text-sm text-muted-foreground leading-relaxed">
              <span className="text-primary font-semibold">Celsius Narrative Triad™</span> <GlossaryTooltip term="narrative_triad" /> — A Tri-Axis Story Architecture for building character-driven, multi-threaded narratives.
              Fill the <span className="text-primary font-semibold">Core Story DNA</span> <GlossaryTooltip term="core_story_dna" /> first — if that's weak, everything fails.
              Then build your <span className="text-blue-400 font-semibold">A-AXIS</span> <GlossaryTooltip term="a_axis" />,
              <span className="text-amber-400 font-semibold"> B-AXIS</span> <GlossaryTooltip term="b_axis" />, and
              <span className="text-red-400 font-semibold"> C-AXIS</span> <GlossaryTooltip term="c_axis" /> across three acts.
            </p>
            <div className="flex gap-2 flex-wrap">
              <Badge variant="outline" className="border-blue-500/50 text-blue-400">🔷 A-AXIS = External Drive</Badge>
              <Badge variant="outline" className="border-amber-500/50 text-amber-400">🔶 B-AXIS = Internal Resistance</Badge>
              <Badge variant="outline" className="border-red-500/50 text-red-400">🔴 C-AXIS = Opposition Intelligence</Badge>
            </div>
          </CardContent>
        </Card>

        {/* Format & Pacing */}
        <Collapsible open={openSections['format'] === true} onOpenChange={() => toggleSection('format')}>
          <Card className="border-accent/30">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-['Orbitron'] flex items-center gap-2 text-accent">
                    <Settings2 className="h-4 w-4" />
                    FORMAT & PACING
                  </CardTitle>
                  <div className="flex items-center gap-2">
                    {data._medium && (
                      <Badge variant="outline" className="text-[10px] border-accent/50 text-accent">
                        {data._medium === 'comic' && <Clapperboard className="h-3 w-3 mr-1" />}
                        {data._medium === 'tv_episode' && <Tv className="h-3 w-3 mr-1" />}
                        {data._medium === 'tv_series' && <Tv className="h-3 w-3 mr-1" />}
                        {data._medium === 'film' && <Film className="h-3 w-3 mr-1" />}
                        {data._medium === 'stage_play' && <Theater className="h-3 w-3 mr-1" />}
                        {data._medium === 'comic' ? `${data._comic_pages || '?'}pg / ${data._comic_issues || '?'}-issue` :
                         data._medium === 'tv_episode' ? `TV Episode (${data._tv_ep_length || '?'} min)` :
                         data._medium === 'tv_series' ? `TV Series (${data._tv_series_episodes || '?'} eps)` :
                         data._medium === 'film' ? `Feature Film (${data._film_length || '?'} min)` :
                         data._medium === 'stage_play' ? `Stage Play (${data._stage_acts || '?'}-act, ${data._stage_runtime || '?'} min)` : ''}
                      </Badge>
                    )}
                    {openSections['format'] === true ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-left mt-1">Set your medium, page count, and series pacing.</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-5 pt-0">
                <Separator className="mb-4" />

                {/* Medium selector */}
                <div className="space-y-1.5">
                  <label className="text-sm font-medium text-foreground">Medium</label>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                    {[
                      { value: 'comic', label: 'Comic Book', icon: <Clapperboard className="h-4 w-4" /> },
                      { value: 'tv_episode', label: 'TV Episode', icon: <Tv className="h-4 w-4" /> },
                      { value: 'tv_series', label: 'TV Series', icon: <Tv className="h-4 w-4" /> },
                      { value: 'film', label: 'Feature Film', icon: <Film className="h-4 w-4" /> },
                      { value: 'stage_play', label: 'Stage Play', icon: <Theater className="h-4 w-4" /> },
                    ].map(m => (
                      <Button
                        key={m.value}
                        variant={data._medium === m.value ? 'default' : 'outline'}
                        size="sm"
                        className="justify-start gap-2"
                        onClick={() => updateField('_medium', m.value)}
                      >
                        {m.icon} {m.label}
                      </Button>
                    ))}
                  </div>
                </div>

                {/* Comic Book options */}
                {data._medium === 'comic' && (
                  <div className="space-y-4 pl-2 border-l-2 border-accent/20">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Pages Per Issue</label>
                      <div className="flex gap-2">
                        {['20', '32'].map(v => (
                          <Button
                            key={v}
                            variant={data._comic_pages === v ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_comic_pages', v)}
                          >
                            {v} Pages
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Series Format</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '4', label: '4-Issue Mini' },
                          { value: '6', label: '6-Issue Mini' },
                          { value: '8', label: '8-Issue Mini' },
                          { value: '12', label: '12-Issue Mini' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._comic_issues === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_comic_issues', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {data._comic_pages && data._comic_issues && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium text-foreground">Pacing Summary</p>
                        <p className="text-xs text-muted-foreground">
                          {data._comic_issues}-issue series × {data._comic_pages} pages = <span className="text-primary font-semibold">{parseInt(data._comic_issues) * parseInt(data._comic_pages)} total pages</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Act I: Issues 1–{Math.ceil(parseInt(data._comic_issues) * 0.25)} &nbsp;|&nbsp;
                          Act II: Issues {Math.ceil(parseInt(data._comic_issues) * 0.25) + 1}–{Math.ceil(parseInt(data._comic_issues) * 0.75)} &nbsp;|&nbsp;
                          Act III: Issues {Math.ceil(parseInt(data._comic_issues) * 0.75) + 1}–{data._comic_issues}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Midpoint lands around Issue {Math.ceil(parseInt(data._comic_issues) / 2)}, page ~{Math.round(parseInt(data._comic_pages) * parseInt(data._comic_issues) * 0.5)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* TV Episode options */}
                {data._medium === 'tv_episode' && (
                  <div className="space-y-4 pl-2 border-l-2 border-accent/20">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Episode Length</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '22', label: '22 min (Half-hour)' },
                          { value: '30', label: '30 min (Streaming)' },
                          { value: '44', label: '44 min (Hour Drama)' },
                          { value: '60', label: '60 min (Premium)' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._tv_ep_length === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_tv_ep_length', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {data._tv_ep_length && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium text-foreground">Pacing Summary</p>
                        <p className="text-xs text-muted-foreground">
                          ~{Math.round(parseInt(data._tv_ep_length) / 60)} script page per minute = <span className="text-primary font-semibold">~{data._tv_ep_length} script pages</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Act I: ~{Math.round(parseInt(data._tv_ep_length) * 0.25)} min &nbsp;|&nbsp;
                          Act II: ~{Math.round(parseInt(data._tv_ep_length) * 0.5)} min &nbsp;|&nbsp;
                          Act III: ~{Math.round(parseInt(data._tv_ep_length) * 0.25)} min
                        </p>
                        {parseInt(data._tv_ep_length) >= 44 && (
                          <p className="text-xs text-muted-foreground">
                            Teaser/Cold Open: First 2–3 min &nbsp;|&nbsp; Midpoint: ~{Math.round(parseInt(data._tv_ep_length) / 2)} min mark
                          </p>
                        )}
                      </div>
                    )}
                  </div>
                )}

                {/* TV Series options */}
                {data._medium === 'tv_series' && (
                  <div className="space-y-4 pl-2 border-l-2 border-accent/20">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Episode Length</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '22', label: '22 min' },
                          { value: '30', label: '30 min' },
                          { value: '44', label: '44 min' },
                          { value: '60', label: '60 min' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._tv_series_ep_length === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_tv_series_ep_length', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Episodes Per Season</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '6', label: '6 Episodes' },
                          { value: '8', label: '8 Episodes' },
                          { value: '10', label: '10 Episodes' },
                          { value: '13', label: '13 Episodes' },
                          { value: '22', label: '22 Episodes' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._tv_series_episodes === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_tv_series_episodes', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {data._tv_series_episodes && data._tv_series_ep_length && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium text-foreground">Season Pacing</p>
                        <p className="text-xs text-muted-foreground">
                          {data._tv_series_episodes} episodes × {data._tv_series_ep_length} min = <span className="text-primary font-semibold">{parseInt(data._tv_series_episodes) * parseInt(data._tv_series_ep_length)} total minutes</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Setup (Eps 1–{Math.ceil(parseInt(data._tv_series_episodes) * 0.25)}) &nbsp;|&nbsp;
                          Escalation (Eps {Math.ceil(parseInt(data._tv_series_episodes) * 0.25) + 1}–{Math.ceil(parseInt(data._tv_series_episodes) * 0.75)}) &nbsp;|&nbsp;
                          Resolution (Eps {Math.ceil(parseInt(data._tv_series_episodes) * 0.75) + 1}–{data._tv_series_episodes})
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Season Midpoint: Episode {Math.ceil(parseInt(data._tv_series_episodes) / 2)} &nbsp;|&nbsp;
                          Penultimate Crisis: Episode {parseInt(data._tv_series_episodes) - 1}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Feature Film options */}
                {data._medium === 'film' && (
                  <div className="space-y-4 pl-2 border-l-2 border-accent/20">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Runtime</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '90', label: '90 min (Tight)' },
                          { value: '105', label: '105 min (Standard)' },
                          { value: '120', label: '120 min (Standard+)' },
                          { value: '150', label: '150 min (Epic)' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._film_length === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_film_length', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {data._film_length && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium text-foreground">Script Pacing</p>
                        <p className="text-xs text-muted-foreground">
                          ~1 page/min = <span className="text-primary font-semibold">~{data._film_length} script pages</span>
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Act I: pp 1–{Math.round(parseInt(data._film_length) * 0.25)} &nbsp;|&nbsp;
                          Act II: pp {Math.round(parseInt(data._film_length) * 0.25) + 1}–{Math.round(parseInt(data._film_length) * 0.75)} &nbsp;|&nbsp;
                          Act III: pp {Math.round(parseInt(data._film_length) * 0.75) + 1}–{data._film_length}
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Inciting Incident: ~p{Math.round(parseInt(data._film_length) * 0.12)} &nbsp;|&nbsp;
                          Midpoint: ~p{Math.round(parseInt(data._film_length) * 0.5)} &nbsp;|&nbsp;
                          Low Point: ~p{Math.round(parseInt(data._film_length) * 0.75)} &nbsp;|&nbsp;
                          Climax: ~p{Math.round(parseInt(data._film_length) * 0.9)}
                        </p>
                      </div>
                    )}
                  </div>
                )}

                {/* Stage Play options */}
                {data._medium === 'stage_play' && (
                  <div className="space-y-4 pl-2 border-l-2 border-accent/20">
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Act Structure</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '1', label: '1-Act' },
                          { value: '2', label: '2-Act' },
                          { value: '3', label: '3-Act' },
                          { value: '5', label: '5-Act' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._stage_acts === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_stage_acts', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-sm font-medium text-foreground">Estimated Runtime</label>
                      <div className="flex gap-2 flex-wrap">
                        {[
                          { value: '60', label: '60 min (One-Act)' },
                          { value: '90', label: '90 min (Standard)' },
                          { value: '120', label: '120 min (Full Length)' },
                          { value: '150', label: '150 min (Epic)' },
                        ].map(v => (
                          <Button
                            key={v.value}
                            variant={data._stage_runtime === v.value ? 'default' : 'outline'}
                            size="sm"
                            onClick={() => updateField('_stage_runtime', v.value)}
                          >
                            {v.label}
                          </Button>
                        ))}
                      </div>
                    </div>
                    {data._stage_acts && data._stage_runtime && (
                      <div className="bg-muted/30 rounded-lg p-3 space-y-1">
                        <p className="text-xs font-medium text-foreground">Pacing Summary</p>
                        <p className="text-xs text-muted-foreground">
                          {data._stage_acts}-act play, ~{data._stage_runtime} min runtime
                        </p>
                        {parseInt(data._stage_acts) >= 2 && (
                          <p className="text-xs text-muted-foreground">
                            Intermission after Act {Math.ceil(parseInt(data._stage_acts) / 2)} (~{Math.round(parseInt(data._stage_runtime) * 0.5)} min mark)
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          ~{Math.round(parseInt(data._stage_runtime) / parseInt(data._stage_acts))} min per act &nbsp;|&nbsp;
                          Scene changes defined by character entrances/exits
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Reset button */}
        <div className="flex justify-between items-center">
          <FilmCompareDialog />
          <Button variant="ghost" size="sm" onClick={handleReset} className="text-destructive hover:text-destructive">
            <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset All
          </Button>
        </div>

        {/* Core DNA Section */}
        <Collapsible open={openSections['core'] !== false} onOpenChange={() => toggleSection('core')}>
          <Card id="section-core" className="border-primary/30 scroll-mt-24">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-base font-['Orbitron'] flex items-center gap-2 text-primary">
                    <Dna className="h-4 w-4" />
                    CORE STORY DNA
                    <Badge variant="secondary" className="text-[10px] ml-2">
                      {getSectionCompletion(coreDnaFields).filled}/{getSectionCompletion(coreDnaFields).total}
                    </Badge>
                  </CardTitle>
                  {openSections['core'] !== false ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground text-left mt-1">Fill this first or stop. Everything depends on this.</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="space-y-4 pt-0">
                <div className="flex items-center justify-between">
                  <Separator className="flex-1" />
                  <div className="px-3">
                    <FullTemplatePicker onApply={(fields) => {
                      setData(prev => ({ ...prev, ...fields }));
                      toast.success('Template loaded! Review and customize the fields.');
                    }} />
                  </div>
                </div>
                {coreDnaFields.map(renderField)}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Story Sections */}
        {sections.map(section => {
          const comp = getSectionCompletion(section.fields);
          const isOpen = openSections[section.id] === true;

          return (
            <Collapsible key={section.id} open={isOpen} onOpenChange={() => toggleSection(section.id)}>
              <Card id={`section-${section.id}`} className="border-border hover:border-border/80 transition-colors scroll-mt-24">
                <CollapsibleTrigger className="w-full">
                  <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                    <div className="flex items-center justify-between">
                      <CardTitle className={`text-sm font-['Orbitron'] flex items-center gap-2 ${section.color}`}>
                        {section.icon}
                        {section.title}
                        {sectionGlossaryMap[section.id] && <GlossaryTooltip term={sectionGlossaryMap[section.id]} />}
                        <Badge variant="secondary" className="text-[10px] ml-2">
                          {comp.filled}/{comp.total}
                        </Badge>
                      </CardTitle>
                      <div className="flex items-center gap-2">
                        {getThreadBadge(section.id)}
                        {isOpen ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                      </div>
                    </div>
                  </CardHeader>
                </CollapsibleTrigger>
                <CollapsibleContent>
                  <CardContent className="space-y-4 pt-0">
                    <Separator className="mb-4" />
                    {section.fields.map(renderField)}
                  </CardContent>
                </CollapsibleContent>
              </Card>
            </Collapsible>
          );
        })}

        {/* Visual Timeline */}
        <Collapsible open={openSections['timeline'] === true} onOpenChange={() => toggleSection('timeline')}>
          <Card className="border-border">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-['Orbitron'] flex items-center gap-2 text-foreground">
                    <Zap className="h-4 w-4 text-primary" />
                    STORY THREAD TIMELINE
                  </CardTitle>
                  {openSections['timeline'] === true ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground text-left mt-1">Visual map of A/B/C threads across your three-act structure.</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                {(() => {
                  // Map field keys to their section IDs for navigation
                  const fieldToSection: Record<string, string> = {};
                  for (const s of sections) {
                    for (const f of s.fields) {
                      fieldToSection[f.key] = s.id;
                    }
                  }
                  for (const f of coreDnaFields) {
                    fieldToSection[f.key] = 'core';
                  }

                  const scrollToSection = (fieldKey: string) => {
                    const sectionId = fieldToSection[fieldKey];
                    if (!sectionId) return;
                    setOpenSections(prev => ({ ...prev, [sectionId]: true }));
                    setTimeout(() => {
                      const el = document.getElementById(`section-${sectionId}`);
                      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                    }, 150);
                  };
                  const threads = [
                    {
                      label: 'A-AXIS',
                      sub: 'External Drive',
                      color: 'bg-blue-500',
                      textColor: 'text-blue-400',
                      borderColor: 'border-blue-500/40',
                      beats: [
                        { act: 0, key: 'a1_want', label: 'Want', pos: 0.1 },
                        { act: 0, key: 'a1_trigger', label: 'Trigger', pos: 0.3 },
                        { act: 0, key: 'a1_inciting', label: 'Inciting Incident', pos: 0.5 },
                        { act: 0, key: 'a1_ponr', label: 'Point of No Return', pos: 0.85 },
                        { act: 1, key: 'a2_plan', label: 'Plan', pos: 0.1 },
                        { act: 1, key: 'a2_win1', label: 'Win #1', pos: 0.25 },
                        { act: 1, key: 'a2_win2', label: 'Win #2', pos: 0.35 },
                        { act: 1, key: 'mid_choice', label: '⚠ Midpoint', pos: 0.5 },
                        { act: 1, key: 'a2_complication', label: 'Complication', pos: 0.65 },
                        { act: 1, key: 'low_external', label: '🔥 Low Point', pos: 0.9 },
                        { act: 2, key: 'a3_plan', label: 'New Plan', pos: 0.2 },
                        { act: 2, key: 'a3_confrontation', label: 'Climax', pos: 0.6 },
                        { act: 2, key: 'a3_sacrificed', label: 'Sacrifice', pos: 0.8 },
                      ],
                    },
                    {
                      label: 'B-AXIS',
                      sub: 'Internal Resistance',
                      color: 'bg-amber-500',
                      textColor: 'text-amber-400',
                      borderColor: 'border-amber-500/40',
                      beats: [
                        { act: 0, key: 'b1_flaws', label: 'Flaws Shown', pos: 0.3 },
                        { act: 0, key: 'b1_contradiction', label: 'Contradiction', pos: 0.6 },
                        { act: 0, key: 'b1_block', label: 'Internal Block', pos: 0.85 },
                        { act: 1, key: 'b2_warnings', label: 'Red Flags', pos: 0.2 },
                        { act: 1, key: 'b2_flaw_active', label: 'Flaw Active', pos: 0.5 },
                        { act: 1, key: 'b2_crisis', label: 'Crisis', pos: 0.75 },
                        { act: 1, key: 'low_internal', label: '🔥 Internal Collapse', pos: 0.9 },
                        { act: 2, key: 'b3_revelation', label: '✦ Revelation', pos: 0.2 },
                        { act: 2, key: 'b3_decision', label: 'New Decision', pos: 0.45 },
                      ],
                    },
                    {
                      label: 'C-AXIS',
                      sub: 'Opposition Intelligence',
                      color: 'bg-red-500',
                      textColor: 'text-red-400',
                      borderColor: 'border-red-500/40',
                      beats: [
                        { act: 0, key: 'c1_motivation', label: 'Motivation', pos: 0.2 },
                        { act: 0, key: 'c1_goal', label: 'Goal Set', pos: 0.7 },
                        { act: 1, key: 'c2_adapt', label: 'Adapts', pos: 0.3 },
                        { act: 1, key: 'c2_learns', label: 'Exploit Found', pos: 0.65 },
                        { act: 2, key: 'c3_flaw', label: 'Own Flaw Undoes', pos: 0.5 },
                        { act: 2, key: 'c3_mirror', label: 'Mirror', pos: 0.75 },
                      ],
                    },
                  ];
                  const acts = ['ACT I — Setup', 'ACT II — Confrontation', 'ACT III — Resolution'];

                  return (
                    <div className="space-y-4 overflow-x-auto">
                      {/* Act headers */}
                      <div className="flex min-w-[600px]">
                        <div className="w-24 shrink-0" />
                        {acts.map((act, i) => (
                          <div key={i} className="flex-1 text-center">
                            <span className="text-[10px] font-['Orbitron'] text-muted-foreground uppercase tracking-wider">{act}</span>
                          </div>
                        ))}
                      </div>

                      {/* Thread lanes */}
                      {threads.map(thread => (
                        <div key={thread.label} className="flex items-start min-w-[600px]">
                          <div className="w-24 shrink-0 pr-2 pt-1">
                            <p className={`text-[11px] font-['Orbitron'] font-bold ${thread.textColor}`}>{thread.label}</p>
                            <p className="text-[9px] text-muted-foreground">{thread.sub}</p>
                          </div>
                          <div className="flex-1 flex gap-1">
                            {acts.map((_, actIdx) => {
                              const actBeats = thread.beats.filter(b => b.act === actIdx);
                              return (
                                <div key={actIdx} className={`flex-1 relative rounded-md border ${thread.borderColor} bg-muted/20 h-16`}>
                                  {actBeats.map(beat => {
                                    const filled = !!data[beat.key]?.trim();
                                    return (
                                      <div
                                        key={beat.key}
                                        className="absolute top-1/2 -translate-y-1/2 flex flex-col items-center cursor-pointer group/beat"
                                        style={{ left: `${beat.pos * 100}%`, transform: `translateX(-50%) translateY(-50%)` }}
                                        title={filled ? `${beat.label}: ${data[beat.key]?.slice(0, 80)}...` : `${beat.label} (click to jump)`}
                                        onClick={() => scrollToSection(beat.key)}
                                      >
                                        <div className={`w-2.5 h-2.5 rounded-full border-2 transition-all group-hover/beat:scale-150 ${
                                          filled 
                                            ? `${thread.color} border-transparent shadow-sm shadow-current` 
                                            : 'bg-transparent border-muted-foreground/30 group-hover/beat:border-muted-foreground'
                                        }`} />
                                        <span className={`text-[7px] mt-0.5 whitespace-nowrap max-w-[50px] truncate transition-colors ${
                                          filled ? thread.textColor : 'text-muted-foreground/50 group-hover/beat:text-muted-foreground'
                                        }`}>
                                          {beat.label}
                                        </span>
                                      </div>
                                    );
                                  })}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      ))}

                      {/* Denouement bar */}
                      <div className="flex items-center min-w-[600px]">
                        <div className="w-24 shrink-0" />
                        <div className="flex-1 rounded-md border border-emerald-500/30 bg-emerald-500/5 p-2 flex items-center justify-center gap-3">
                          {[
                            { key: 'den_truth', label: 'Truth' },
                            { key: 'den_protag', label: 'Protagonist' },
                            { key: 'den_cost', label: 'Cost' },
                          ].map(d => (
                            <div key={d.key} className="flex items-center gap-1 cursor-pointer group/den" onClick={() => scrollToSection(d.key)}>
                              <div className={`w-2 h-2 rounded-full transition-transform group-hover/den:scale-150 ${data[d.key]?.trim() ? 'bg-emerald-500' : 'border border-muted-foreground/30'}`} />
                              <span className={`text-[9px] transition-colors ${data[d.key]?.trim() ? 'text-emerald-400' : 'text-muted-foreground/50 group-hover/den:text-muted-foreground'}`}>{d.label}</span>
                            </div>
                          ))}
                          <span className="text-[9px] font-['Orbitron'] text-emerald-400/60 ml-2">DENOUEMENT</span>
                        </div>
                      </div>

                      {/* Legend */}
                      <div className="flex items-center gap-4 pt-1 min-w-[600px]">
                        <div className="w-24 shrink-0" />
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full bg-primary" />
                          <span className="text-[9px] text-muted-foreground">Filled</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <div className="w-2.5 h-2.5 rounded-full border border-muted-foreground/30" />
                          <span className="text-[9px] text-muted-foreground">Empty</span>
                        </div>
                        <span className="text-[9px] text-muted-foreground ml-auto">Hover beats for preview</span>
                      </div>
                    </div>
                  );
                })()}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* Scene Engine */}
        <Collapsible open={openSections['scenes'] === true} onOpenChange={() => toggleSection('scenes')}>
          <Card className="border-primary/30">
            <CollapsibleTrigger className="w-full">
              <CardHeader className="cursor-pointer hover:bg-muted/30 transition-colors">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-sm font-['Orbitron'] flex items-center gap-2 text-primary">
                    <LayoutGrid className="h-4 w-4" />
                    SCENE ENGINE
                  </CardTitle>
                  {openSections['scenes'] === true ? <ChevronDown className="h-4 w-4 text-muted-foreground" /> : <ChevronRight className="h-4 w-4 text-muted-foreground" />}
                </div>
                <p className="text-xs text-muted-foreground text-left mt-1">Decompose your narrative into causally-linked scenes with energy tracking.</p>
              </CardHeader>
            </CollapsibleTrigger>
            <CollapsibleContent>
              <CardContent className="pt-0">
                <Separator className="mb-4" />
                {filledCount < 4 ? (
                  <div className="text-center py-6">
                    <p className="text-sm text-muted-foreground">Complete at least the Core Story DNA before building scenes.</p>
                    <p className="text-xs text-muted-foreground mt-1">{filledCount}/4 minimum fields filled.</p>
                  </div>
                ) : (
                  <SceneBuilder
                    key={currentProjectId || 'new'}
                    storyData={data}
                    medium={data._medium || 'film'}
                    mediumConfig={data}
                    projectId={currentProjectId}
                    onScenesChange={setEngineScenes}
                    scenesOverride={scenesOverride}
                  />
                )}
              </CardContent>
            </CollapsibleContent>
          </Card>
        </Collapsible>

        {/* AI Analysis Section */}
        <Card className="border-accent/30 bg-card">
          <CardContent className="p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-['Orbitron'] text-accent flex items-center gap-2">
                <Wand2 className="h-4 w-4" />
                AI STORY CONSULTANT
              </h3>
              <Button
                size="sm"
                variant="outline"
                disabled={isAnalyzing || filledCount === 0}
                onClick={() => runAnalysis()}
                className="border-accent/50 text-accent"
              >
                {isAnalyzing ? (
                  <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Analyzing...</>
                ) : (
                  <><Wand2 className="h-3.5 w-3.5 mr-1" /> Analyze Story</>
                )}
              </Button>
            </div>
            {filledCount === 0 && (
              <p className="text-xs text-muted-foreground">Fill in some story fields above to get AI-powered feedback.</p>
            )}
            {aiAnalysis && (
              <div className="space-y-3">
                <div className="prose prose-sm prose-invert max-w-none text-sm text-secondary-foreground leading-relaxed whitespace-pre-wrap">
                  {aiAnalysis}
                </div>
                <div className="flex gap-2 pt-2 border-t border-border/40">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      navigator.clipboard.writeText(aiAnalysis);
                      toast.success('Analysis copied to clipboard');
                    }}
                  >
                    <Copy className="h-3.5 w-3.5 mr-1" /> Copy
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const title = data.protag_name ? `${data.protag_name}'s Story` : 'Story';
                      printAnalysisHtml(aiAnalysis, title);
                    }}
                  >
                    <Printer className="h-3.5 w-3.5 mr-1" /> Print / Save PDF
                  </Button>
                  {engineScenes.length > 0 && (
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={isImplementing}
                      onClick={handleImplementAllFixes}
                      className="border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
                    >
                      {isImplementing ? (
                        <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Implementing… {implementingElapsed}s</>
                      ) : (
                        <><Zap className="h-3.5 w-3.5 mr-1" /> Implement All Fixes</>
                      )}
                    </Button>
                  )}
                </div>
                {/* Actionable Fixes Panel */}
                {engineScenes.length > 0 && (
                  <ActionableFixesPanel
                    fixes={parseAnalysisIntoFixes(aiAnalysis)}
                    applyingFixId={applyingFixId}
                    onApplyFix={handleApplyFix}
                  />
                )}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Diagnostic Card */}
        <Card className="border-destructive/30 bg-card">
          <CardContent className="p-6 space-y-3">
            <h3 className="text-sm font-['Orbitron'] text-destructive flex items-center gap-2">
              <AlertTriangle className="h-4 w-4" />
              FAILURE DIAGNOSTICS
            </h3>
            <p className="text-xs text-muted-foreground leading-relaxed">
              If a story built with this engine fails, it will fail for one of three reasons:
            </p>
            <ol className="text-xs text-muted-foreground space-y-1 list-decimal list-inside">
              <li className={data.a_goal?.trim() ? 'text-emerald-400 line-through' : 'text-destructive'}>The goal wasn't clear</li>
              <li className={data.protag_flaw?.trim() ? 'text-emerald-400 line-through' : 'text-destructive'}>The flaw didn't matter</li>
              <li className={data.antag_belief?.trim() ? 'text-emerald-400 line-through' : 'text-destructive'}>The antagonist wasn't right enough</li>
            </ol>
          </CardContent>
        </Card>

        {lastSaved && (
          <p className="text-xs text-muted-foreground text-center">
            Last saved: {lastSaved.toLocaleTimeString()}
          </p>
        )}
      </div>

      {/* Diff Preview Dialog */}
      {pendingFixes && (
        <SceneDiffDialog
          isOpen={showDiffDialog}
          onClose={() => { setShowDiffDialog(false); setPendingFixes(null); }}
          originalScenes={engineScenes}
          correctedScenes={pendingFixes.correctedScenes}
          changesSummary={pendingFixes.changesSummary}
          onConfirm={() => {
            const corrected = pendingFixes.correctedScenes;
            setScenesOverride(corrected);
            setEngineScenes(corrected);
            setShowDiffDialog(false);
            setPendingFixes(null);
            toast.success('Fixes applied! Re-analyzing story…');
            runAnalysis(corrected);
          }}
        />
      )}

      <LegalFooter />
    </div>
  );
};

