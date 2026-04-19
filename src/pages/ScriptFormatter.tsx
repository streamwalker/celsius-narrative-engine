import { useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { ArrowLeft, Loader2, FileText, LogIn, FilePlus, Target, Keyboard } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Label } from '@/components/ui/label';
import { Progress } from '@/components/ui/progress';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AutoSaveIndicator } from '@/components/AutoSaveIndicator';
import { FormattedScriptViewer } from '@/components/FormattedScriptViewer';
import { AuthModal } from '@/components/AuthModal';
import {
  useScriptFormatterShortcuts,
  SCRIPT_FORMATTER_SHORTCUTS,
} from '@/hooks/useScriptFormatterShortcuts';
import type { User } from '@supabase/supabase-js';

const FORMATS = [
  {
    value: 'graphic-novel',
    label: 'Graphic Novel Script',
    desc: 'PAGE markers, numbered panels, dialogue with colons, narration blocks',
  },
  {
    value: 'television',
    label: 'Television Screenplay',
    desc: 'INT./EXT. headings, act breaks, centered character cues',
  },
  {
    value: 'feature-film',
    label: 'Feature Film Screenplay',
    desc: 'Fountain/Final Draft format with scene headings & dialogue blocks',
  },
  {
    value: 'stage-play',
    label: 'Stage Play',
    desc: 'Act/Scene divisions, caps character names, bracketed stage directions',
  },
];

interface DraftState {
  title: string;
  versionLabel: string;
  content: string;
  format: string;
  formattedResult: string;
}

export default function ScriptFormatter() {
  const { draftId: urlDraftId } = useParams<{ draftId?: string }>();
  const navigate = useNavigate();

  const [text, setText] = useState('');
  const [format, setFormat] = useState('graphic-novel');
  const [pageGoal, setPageGoal] = useState<number | null>(null);
  const PAGE_GOAL_PRESETS = [5, 10, 22, 44];

  const [result, setResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [title, setTitle] = useState('Untitled Script');
  const [versionLabel, setVersionLabel] = useState('v1');

  const [user, setUser] = useState<User | null>(null);
  const [draftId, setDraftId] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaveTime, setLastSaveTime] = useState<Date | null>(null);
  const [saveError, setSaveError] = useState<Error | null>(null);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [helpOpen, setHelpOpen] = useState(false);
  const [undoSnapshot, setUndoSnapshot] = useState<{ text: string; result: string } | null>(null);

  const lastSavedRef = useRef<string>('');
  const saveIntervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const getCurrentState = useCallback(
    (): DraftState => ({ title, versionLabel, content: text, format, formattedResult: result }),
    [title, versionLabel, text, format, result]
  );

  // Auth listener
  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  // Import from Astralnaut Studios via localStorage shuttle
  useEffect(() => {
    try {
      const importRaw = localStorage.getItem('script-formatter-import');
      if (!importRaw) return;
      const importData = JSON.parse(importRaw) as { title?: string; content?: string };
      localStorage.removeItem('script-formatter-import');

      if (importData.title) setTitle(importData.title);
      if (importData.content) setText(importData.content);
      setVersionLabel('v1');
      setResult('');

      toast({ title: 'Script imported!', description: `"${importData.title || 'Untitled'}" loaded into the editor.` });
    } catch {
      /* ignore parse errors */
    }
  }, []);

  // Load draft (by URL id or most recent)
  useEffect(() => {
    if (!user) {
      setDraftId(null);
      lastSavedRef.current = '';
      return;
    }

    const loadDraft = async () => {
      try {
        let draft: any = null;
        if (urlDraftId) {
          const { data, error } = await supabase
            .from('script_drafts')
            .select('*')
            .eq('id', urlDraftId)
            .eq('user_id', user.id)
            .single();
          if (!error && data) draft = data;
        } else {
          const { data, error } = await supabase
            .from('script_drafts')
            .select('*')
            .eq('user_id', user.id)
            .order('updated_at', { ascending: false })
            .limit(1);
          if (!error && data && data.length > 0) draft = data[0];
        }

        if (draft) {
          setDraftId(draft.id);
          setTitle(draft.title ?? 'Untitled Script');
          setVersionLabel(draft.version_label ?? 'v1');
          setText(draft.content ?? '');
          setFormat(draft.format ?? 'graphic-novel');
          setResult(draft.formatted_result ?? '');
          lastSavedRef.current = JSON.stringify({
            title: draft.title,
            versionLabel: draft.version_label,
            content: draft.content,
            format: draft.format,
            formattedResult: draft.formatted_result ?? '',
          });
          setLastSaveTime(new Date(draft.updated_at));
        }
      } catch {
        /* ignore load errors */
      }
    };

    loadDraft();
  }, [user, urlDraftId]);

  const handleNewScript = () => {
    setUndoSnapshot({ text, result });
    setDraftId(null);
    setTitle('Untitled Script');
    setVersionLabel('v1');
    setText('');
    setFormat('graphic-novel');
    setResult('');
    lastSavedRef.current = '';
    setLastSaveTime(null);
    setHasUnsavedChanges(false);
    navigate('/script-formatter');
  };

  const handleClearText = () => {
    if (!text.trim() && !result) return;
    setUndoSnapshot({ text, result });
    setText('');
    setResult('');
  };

  const handleUndoDestructive = () => {
    if (!undoSnapshot) return;
    setText(undoSnapshot.text);
    setResult(undoSnapshot.result);
    setUndoSnapshot(null);
    toast({ title: 'Restored', description: 'Your previous text has been recovered.' });
  };

  // Detect unsaved changes
  useEffect(() => {
    const current = JSON.stringify(getCurrentState());
    setHasUnsavedChanges(current !== lastSavedRef.current && lastSavedRef.current !== '');
  }, [title, versionLabel, text, format, result, getCurrentState]);

  // Save implementation
  const performSave = useCallback(
    async (manual = false) => {
      if (!user) return;
      const state = getCurrentState();
      const serialized = JSON.stringify(state);
      if (!manual && serialized === lastSavedRef.current) return;

      setIsSaving(true);
      setSaveError(null);

      try {
        const row = {
          user_id: user.id,
          title: state.title,
          version_label: state.versionLabel,
          content: state.content,
          format: state.format,
          formatted_result: state.formattedResult || null,
          updated_at: new Date().toISOString(),
        };

        if (draftId) {
          const { error } = await supabase.from('script_drafts').update(row).eq('id', draftId);
          if (error) throw error;
        } else {
          const { data, error } = await supabase
            .from('script_drafts')
            .insert(row)
            .select('id')
            .single();
          if (error) throw error;
          setDraftId(data.id);
        }

        lastSavedRef.current = serialized;
        setLastSaveTime(new Date());
        setHasUnsavedChanges(false);
      } catch (e: any) {
        setSaveError(e);
      } finally {
        setIsSaving(false);
      }
    },
    [user, getCurrentState, draftId]
  );

  // 20-second auto-save interval
  useEffect(() => {
    if (!user) return;
    if (!lastSavedRef.current) lastSavedRef.current = JSON.stringify(getCurrentState());
    saveIntervalRef.current = setInterval(() => performSave(false), 20000);
    return () => {
      if (saveIntervalRef.current) clearInterval(saveIntervalRef.current);
    };
  }, [user, performSave, getCurrentState]);

  const handleGenerate = async () => {
    if (!text.trim()) {
      toast({ title: 'Nothing to format', description: 'Write or paste some text first.', variant: 'destructive' });
      return;
    }
    setLoading(true);
    setResult('');
    try {
      const { data, error } = await supabase.functions.invoke('format-script', { body: { text, format } });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const formatted = data.formattedScript || '';
      setResult(formatted);
      toast({ title: 'Script formatted!' });
    } catch (e: any) {
      toast({ title: 'Formatting failed', description: e.message, variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(result);
    toast({ title: 'Copied to clipboard' });
  };

  const handleDownload = () => {
    const blob = new Blob([result], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title || 'formatted-script'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Keyboard shortcuts
  useScriptFormatterShortcuts({
    onSave: user ? () => performSave(true) : () => setAuthOpen(true),
    onFormat: () => {
      if (!loading && text.trim()) handleGenerate();
    },
    onNewScript: handleNewScript,
    onClearText: handleClearText,
    onShowHelp: () => setHelpOpen(true),
  });

  const wordCount = text.trim().split(/\s+/).filter(Boolean).length;
  const currentPages = Math.max(1, Math.round(wordCount / 250));
  const progress = pageGoal ? Math.min(100, Math.round((wordCount / (pageGoal * 250)) * 100)) : 0;

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center justify-between gap-4 mb-4">
          <div className="flex items-center gap-4">
            <Link to="/">
              <Button variant="ghost" size="icon">
                <ArrowLeft className="h-5 w-5" />
              </Button>
            </Link>
            <FileText className="h-6 w-6 text-primary" />
            <span className="text-sm text-muted-foreground hidden sm:inline">Script Formatter</span>
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setHelpOpen(true)}
              className="h-8 w-8"
              title="Keyboard shortcuts (?)"
            >
              <Keyboard className="h-4 w-4" />
            </Button>
            {user && (
              <Button variant="outline" size="sm" onClick={handleNewScript}>
                <FilePlus className="h-4 w-4 mr-1" /> New Script
              </Button>
            )}
            {user ? (
              <AutoSaveIndicator
                lastSaveTime={lastSaveTime}
                isSaving={isSaving}
                hasUnsavedChanges={hasUnsavedChanges}
                error={saveError}
                onSaveNow={() => performSave(true)}
              />
            ) : (
              <Button variant="outline" size="sm" onClick={() => setAuthOpen(true)}>
                <LogIn className="h-3 w-3 mr-1" /> Sign in to save
              </Button>
            )}
          </div>
        </div>

        {/* Title & Version */}
        <div className="flex items-end gap-3 mb-6">
          <div className="flex-1">
            <Label className="text-xs text-muted-foreground mb-1 block">Title</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Untitled Script"
              className="text-lg font-semibold border-none bg-transparent px-0 h-auto focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>
          <div className="w-24">
            <Label className="text-xs text-muted-foreground mb-1 block">Version</Label>
            <Input
              value={versionLabel}
              onChange={(e) => setVersionLabel(e.target.value)}
              placeholder="v1"
              className="text-sm font-mono"
            />
          </div>
        </div>

        {/* Format selector */}
        <div className="mb-6">
          <Label className="text-xs uppercase tracking-widest text-muted-foreground font-mono mb-3 block">
            Output Format
          </Label>
          <RadioGroup
            value={format}
            onValueChange={setFormat}
            className="grid grid-cols-1 sm:grid-cols-2 gap-3"
          >
            {FORMATS.map((f) => (
              <Label
                key={f.value}
                htmlFor={f.value}
                className={`flex items-start gap-3 rounded-lg border p-4 cursor-pointer transition-colors ${
                  format === f.value ? 'border-primary bg-primary/5' : 'border-border hover:border-muted-foreground/30'
                }`}
              >
                <RadioGroupItem value={f.value} id={f.value} className="mt-0.5" />
                <div>
                  <span className="font-medium text-sm">{f.label}</span>
                  <p className="text-xs text-muted-foreground mt-0.5">{f.desc}</p>
                </div>
              </Label>
            ))}
          </RadioGroup>
        </div>

        {/* Input */}
        <Textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Paste an existing script or start fresh. You can mix formatted script with freeform prose — just keep writing and we'll format everything to match."
          className="min-h-[50vh] text-base leading-relaxed mb-4 resize-y font-serif"
        />
        {text.trim().length < 20 && (
          <p className="text-xs text-muted-foreground -mt-3 mb-4 pl-1">
            Tip: Paste a partial script and keep typing below it. The formatter will continue where you left off.
          </p>
        )}

        <div className="flex items-center justify-between mb-8 flex-wrap gap-4">
          <div className="flex items-center gap-4 flex-wrap">
            <span className="text-xs text-muted-foreground font-mono">
              {wordCount} words · ~{currentPages} {currentPages === 1 ? 'page' : 'pages'}
            </span>
            <div className="flex items-center gap-1.5">
              <Target className="h-3.5 w-3.5 text-muted-foreground" />
              {PAGE_GOAL_PRESETS.map((g) => (
                <button
                  key={g}
                  onClick={() => setPageGoal(pageGoal === g ? null : g)}
                  className={`text-xs font-mono px-1.5 py-0.5 rounded transition-colors ${
                    pageGoal === g
                      ? 'bg-primary text-primary-foreground'
                      : 'text-muted-foreground hover:text-foreground hover:bg-accent'
                  }`}
                >
                  {g}p
                </button>
              ))}
            </div>
            {pageGoal && (
              <div className="flex items-center gap-2 min-w-[120px]">
                <Progress value={progress} className="h-1.5 flex-1" />
                <span
                  className={`text-xs font-mono ${progress >= 100 ? 'text-primary font-semibold' : 'text-muted-foreground'}`}
                >
                  {progress}%
                </span>
              </div>
            )}
          </div>
          <div className="flex items-center gap-2">
            {undoSnapshot && (
              <Button variant="outline" size="sm" onClick={handleUndoDestructive} title="Restore previous text">
                Undo
              </Button>
            )}
            {text.trim() && (
              <Button variant="outline" size="sm" onClick={handleClearText}>
                Clear
              </Button>
            )}
            <Button onClick={handleGenerate} disabled={loading || !text.trim()} size="lg">
              {loading ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" /> Formatting…
                </>
              ) : (
                'Format My Script'
              )}
            </Button>
          </div>
        </div>

        {/* Output */}
        {result && (
          <FormattedScriptViewer result={result} format={format} onCopy={handleCopy} onDownload={handleDownload} />
        )}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />

      <Dialog open={helpOpen} onOpenChange={setHelpOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="font-display tracking-wider">Keyboard Shortcuts</DialogTitle>
            <DialogDescription>Speed up your work in the Script Formatter.</DialogDescription>
          </DialogHeader>
          <div className="space-y-2 py-2">
            {SCRIPT_FORMATTER_SHORTCUTS.map((s) => (
              <div key={s.label} className="flex items-center justify-between text-sm">
                <span className="text-foreground/90">{s.label}</span>
                <div className="flex items-center gap-1">
                  {s.keys.map((k) => (
                    <kbd
                      key={k}
                      className="font-mono text-[10px] uppercase tracking-wider rounded border border-border bg-muted px-1.5 py-0.5 text-muted-foreground"
                    >
                      {k}
                    </kbd>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
