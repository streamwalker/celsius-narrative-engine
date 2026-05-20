import { useCallback, useEffect, useRef, useState } from 'react';
import { AppLayout } from '@/components/AppLayout';
import { toast } from 'sonner';
import { makeIssue2 } from '@/lib/panelcraft/sample-issue';
import { generateBreakdown, type GeneratedIssue, type GenerateInput } from '@/lib/panelcraft2/generate';
import { IntakeView } from '@/components/panelcraft2/IntakeView';
import { EditorView } from '@/components/panelcraft2/EditorView';

const STORAGE_KEY = 'panelcraft2:state:v1';

type View = 'intake' | 'editor';

export default function Panelcraft2() {
  const [issue, setIssue] = useState<GeneratedIssue | null>(null);
  const [view, setView] = useState<View>('intake');
  const [loaded, setLoaded] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [genError, setGenError] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Load on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && Array.isArray(parsed.pages) && parsed.pages.length > 0) {
          setIssue(parsed);
          setView('editor');
        }
      }
    } catch {
      // ignore
    }
    setLoaded(true);
  }, []);

  // Persist on change
  useEffect(() => {
    if (!loaded || !issue) return;
    setSaveStatus('saving');
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(issue));
        setSaveStatus('saved');
        setTimeout(() => setSaveStatus('idle'), 1500);
      } catch {
        setSaveStatus('idle');
      }
    }, 600);
  }, [issue, loaded]);

  const handleGenerate = useCallback(async (input: GenerateInput) => {
    setIsGenerating(true);
    setGenError(null);
    try {
      const result = await generateBreakdown(input);
      setIssue(result);
      setView('editor');
      toast.success(`Generated ${result.pages.length} pages`);
    } catch (err) {
      setGenError(err instanceof Error ? err.message : 'Unknown error.');
    } finally {
      setIsGenerating(false);
    }
  }, []);

  const handleLoadExample = useCallback(() => {
    const ex = makeIssue2();
    setIssue({
      ...ex,
      treatment:
        '(Example loaded — Issue 2: "A warning of things to come." Original treatment not stored. Use this to explore the editor before generating from your own prose.)',
    });
    setView('editor');
    setGenError(null);
  }, []);

  const handleNewIssue = useCallback(() => {
    if (!confirm('Start a new issue? Your current Panelcraft 2 project will be cleared.')) return;
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
    setIssue(null);
    setView('intake');
    setGenError(null);
  }, []);

  if (!loaded) {
    return (
      <AppLayout>
        <div className="p-8 text-muted-foreground font-mono">loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      {view === 'intake' || !issue ? (
        <IntakeView
          onGenerate={handleGenerate}
          onLoadExample={handleLoadExample}
          isGenerating={isGenerating}
          error={genError}
        />
      ) : (
        <EditorView
          issue={issue}
          onChange={setIssue}
          onNewIssue={handleNewIssue}
          saveStatus={saveStatus}
        />
      )}
    </AppLayout>
  );
}
