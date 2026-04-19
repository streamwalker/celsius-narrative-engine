import { useEffect, useMemo, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { ArrowLeft, Wand2, Loader2, Download, AlertCircle, LogIn } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Card, CardContent } from '@/components/ui/card';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { AuthModal } from '@/components/AuthModal';
import { GraphicNovelPageLayout } from '@/components/GraphicNovelPageLayout';
import { parseComicScript, buildPanelPrompt, type ComicPanelData, type ComicPage } from '@/lib/comic-panel-parser';
import type { User } from '@supabase/supabase-js';

interface DraftRow {
  id: string;
  title: string;
  format: string;
  formatted_result: string | null;
}

export default function ComicPanels() {
  const { draftId } = useParams<{ draftId: string }>();
  const [user, setUser] = useState<User | null>(null);
  const [authOpen, setAuthOpen] = useState(false);

  const [draft, setDraft] = useState<DraftRow | null>(null);
  const [loadingDraft, setLoadingDraft] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);

  const [images, setImages] = useState<Record<string, string>>({});
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isBatchRunning, setIsBatchRunning] = useState(false);
  const [batchAborted, setBatchAborted] = useState(false);

  useEffect(() => {
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_e, session) => setUser(session?.user ?? null));
    supabase.auth.getSession().then(({ data: { session } }) => setUser(session?.user ?? null));
    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (!user || !draftId) {
      setLoadingDraft(false);
      return;
    }
    setLoadingDraft(true);
    supabase
      .from('script_drafts')
      .select('id,title,format,formatted_result')
      .eq('id', draftId)
      .eq('user_id', user.id)
      .single()
      .then(({ data, error }) => {
        if (error) {
          setLoadError(error.message);
        } else if (data) {
          setDraft(data as DraftRow);
        }
        setLoadingDraft(false);
      });
  }, [user, draftId]);

  const pages = useMemo<ComicPage[]>(() => {
    if (!draft?.formatted_result) return [];
    return parseComicScript(draft.formatted_result);
  }, [draft]);

  const allPanels: ComicPanelData[] = useMemo(() => pages.flatMap((p) => p.panels), [pages]);

  const completed = allPanels.filter((p) => images[p.panelKey]).length;
  const total = allPanels.length;
  const progress = total === 0 ? 0 : Math.round((completed / total) * 100);

  const generateOne = async (panel: ComicPanelData): Promise<boolean> => {
    setGenerating((g) => ({ ...g, [panel.panelKey]: true }));
    setErrors((e) => {
      const { [panel.panelKey]: _, ...rest } = e;
      return rest;
    });
    try {
      const { data, error } = await supabase.functions.invoke('generate-panel', {
        body: {
          prompt: buildPanelPrompt(panel),
          panelId: panel.panelKey,
        },
      });
      if (error) throw error;
      if (data?.error) throw new Error(data.error);
      const image: string | undefined = data?.image;
      if (!image) throw new Error('No image returned');
      setImages((prev) => ({ ...prev, [panel.panelKey]: image }));
      return true;
    } catch (e: any) {
      setErrors((prev) => ({ ...prev, [panel.panelKey]: e.message || 'Generation failed' }));
      return false;
    } finally {
      setGenerating((prev) => {
        const { [panel.panelKey]: _, ...rest } = prev;
        return rest;
      });
    }
  };

  const handleGenerateAll = async () => {
    if (!user) {
      setAuthOpen(true);
      return;
    }
    if (isBatchRunning) return;
    setIsBatchRunning(true);
    setBatchAborted(false);
    const pending = allPanels.filter((p) => !images[p.panelKey]);
    for (const panel of pending) {
      if (batchAborted) break;
      await generateOne(panel);
    }
    setIsBatchRunning(false);
    if (!batchAborted) {
      toast({ title: 'Panel generation complete', description: `${pending.length} panels rendered.` });
    }
  };

  const handleRegenerate = async (panelKey: string) => {
    const panel = allPanels.find((p) => p.panelKey === panelKey);
    if (!panel) return;
    setImages((prev) => {
      const { [panelKey]: _, ...rest } = prev;
      return rest;
    });
    await generateOne(panel);
  };

  const handleDownloadPanel = (panelKey: string) => {
    const url = images[panelKey];
    if (!url) return;
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft?.title || 'panel'}-${panelKey}.png`;
    a.click();
  };

  const handleExportHtml = () => {
    if (!draft) return;
    const html = buildExportHtml(draft.title, pages, images);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${draft.title || 'graphic-novel'}.html`;
    a.click();
    URL.revokeObjectURL(url);
    toast({
      title: 'Exported',
      description: 'Open the HTML file in your browser, then use Print → Save as PDF for a book-ready copy.',
    });
  };

  if (!user && !loadingDraft) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link to="/script-formatter">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">Sign in to access your draft and generate comic panels.</p>
              <Button onClick={() => setAuthOpen(true)}>
                <LogIn className="h-4 w-4 mr-1" /> Sign In
              </Button>
            </CardContent>
          </Card>
        </div>
        <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
      </div>
    );
  }

  if (loadingDraft) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    );
  }

  if (loadError || !draft) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link to="/script-formatter">
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <AlertCircle className="h-8 w-8 text-destructive mx-auto mb-3" />
              <p className="text-muted-foreground">{loadError || 'Draft not found.'}</p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (draft.format !== 'graphic-novel') {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link to={`/script-formatter/${draft.id}`}>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Script
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground">
                Comic panel generation requires a script in{' '}
                <span className="font-mono text-foreground">graphic-novel</span> format. This draft is formatted as{' '}
                <span className="font-mono text-foreground">{draft.format}</span>.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!draft.formatted_result || pages.length === 0) {
    return (
      <div className="min-h-screen bg-background">
        <div className="max-w-2xl mx-auto px-4 py-16">
          <Link to={`/script-formatter/${draft.id}`}>
            <Button variant="ghost" size="sm" className="mb-6">
              <ArrowLeft className="h-4 w-4 mr-1" /> Back to Script
            </Button>
          </Link>
          <Card>
            <CardContent className="py-12 text-center">
              <p className="text-muted-foreground mb-4">
                This draft has not been formatted yet, or no <span className="font-mono text-foreground">PAGE</span>{' '}
                markers were found in the output.
              </p>
              <Link to={`/script-formatter/${draft.id}`}>
                <Button>Return to Script Formatter</Button>
              </Link>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-6xl mx-auto px-4 py-8">
        <div className="flex flex-wrap items-start justify-between gap-4 mb-6">
          <div>
            <Link to={`/script-formatter/${draft.id}`}>
              <Button variant="ghost" size="sm" className="-ml-3 mb-2">
                <ArrowLeft className="h-4 w-4 mr-1" /> Back to Script
              </Button>
            </Link>
            <h1 className="font-display text-2xl md:text-3xl tracking-wider">{draft.title}</h1>
            <p className="text-xs text-muted-foreground font-mono uppercase tracking-widest mt-1">
              Graphic Novel · {pages.length} pages · {total} panels
            </p>
          </div>
          <div className="flex items-center gap-2">
            {isBatchRunning ? (
              <Button variant="outline" onClick={() => setBatchAborted(true)} size="lg">
                Stop
              </Button>
            ) : (
              <Button onClick={handleGenerateAll} size="lg" disabled={total === 0 || completed === total}>
                <Wand2 className="h-4 w-4 mr-1" />
                {completed === 0 ? 'Generate All Panels' : completed === total ? 'All Rendered' : 'Resume Generation'}
              </Button>
            )}
            {completed > 0 && (
              <Button variant="outline" size="lg" onClick={handleExportHtml}>
                <Download className="h-4 w-4 mr-1" /> Export
              </Button>
            )}
          </div>
        </div>

        {total > 0 && (
          <div className="mb-8 flex items-center gap-3">
            <Progress value={progress} className="h-1.5 flex-1" />
            <span className="font-mono text-xs text-muted-foreground tabular-nums">
              {completed} / {total}
            </span>
          </div>
        )}

        {pages.map((page) => (
          <GraphicNovelPageLayout
            key={page.pageNumber}
            page={page}
            images={images}
            generating={generating}
            errors={errors}
            onRegenerate={handleRegenerate}
            onDownloadPanel={handleDownloadPanel}
          />
        ))}
      </div>

      <AuthModal isOpen={authOpen} onClose={() => setAuthOpen(false)} />
    </div>
  );
}

function buildExportHtml(title: string, pages: ComicPage[], images: Record<string, string>) {
  const escape = (s: string) =>
    s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));

  const pagesHtml = pages
    .map((page) => {
      const panelsHtml = page.panels
        .map((panel) => {
          const img = images[panel.panelKey];
          const imgTag = img
            ? `<img src="${img}" alt="${escape(panel.description)}" />`
            : '<div class="placeholder"></div>';
          const narration = panel.narration ? `<div class="narration">${escape(panel.narration)}</div>` : '';
          const dialogue = panel.dialogue ? `<div class="dialogue">${escape(panel.dialogue)}</div>` : '';
          return `
      <figure class="panel">
        ${imgTag}
        ${narration}
        ${dialogue}
      </figure>`;
        })
        .join('');
      return `
  <section class="page">
    <h2>PAGE ${page.pageNumber}</h2>
    <div class="panels count-${page.panels.length}">
      ${panelsHtml}
    </div>
  </section>`;
    })
    .join('');

  return `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8" />
<title>${escape(title)}</title>
<style>
  @page { size: A4 portrait; margin: 10mm; }
  body { font-family: 'Space Mono', monospace; background: #fff; color: #000; margin: 0; padding: 20px; }
  h1 { font-family: 'Orbitron', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; }
  h2 { font-family: 'Orbitron', sans-serif; letter-spacing: 0.1em; text-transform: uppercase; border-bottom: 1px solid #000; padding-bottom: 4px; }
  .page { page-break-after: always; margin-bottom: 40px; }
  .page:last-child { page-break-after: auto; }
  .panels { display: grid; gap: 8px; }
  .panels.count-1 { grid-template-columns: 1fr; }
  .panels.count-2 { grid-template-columns: repeat(2, 1fr); }
  .panels.count-3 { grid-template-columns: repeat(3, 1fr); }
  .panels.count-4 { grid-template-columns: repeat(2, 1fr); }
  .panels.count-5, .panels.count-6 { grid-template-columns: repeat(3, 1fr); }
  .panel { position: relative; border: 2px solid #000; overflow: hidden; margin: 0; page-break-inside: avoid; aspect-ratio: 4/3; }
  .panel img { width: 100%; height: 100%; object-fit: cover; display: block; }
  .placeholder { width: 100%; height: 100%; background: #eee; }
  .narration { position: absolute; top: 8px; left: 8px; right: 8px; background: #fef3c7; color: #000; padding: 4px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border: 1px solid #000; }
  .dialogue { position: absolute; bottom: 12px; left: 12px; right: 12px; background: #fff; color: #000; padding: 4px 8px; font-size: 10px; font-weight: 700; text-transform: uppercase; border: 1px solid #000; border-radius: 6px; }
</style>
</head>
<body>
<h1>${escape(title)}</h1>
${pagesHtml}
</body>
</html>`;
}
