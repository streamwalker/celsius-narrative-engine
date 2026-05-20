import { useEffect, useMemo, useRef, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppLayout } from '@/components/AppLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ArrowLeft, RotateCcw, FileText, LayoutGrid } from 'lucide-react';
import { toast } from 'sonner';
import type { PanelcraftIssue, Page } from '@/lib/panelcraft/types';
import { STORAGE_KEY } from '@/lib/panelcraft/constants';
import { makeIssue2 } from '@/lib/panelcraft/sample-issue';
import { checksForPage } from '@/lib/panelcraft/checks';
import { PageListItem } from '@/components/panelcraft/PageListItem';
import { PageEditor } from '@/components/panelcraft/PageEditor';
import { StoryArcGraph } from '@/components/panelcraft/StoryArcGraph';
import { CraftPanel } from '@/components/panelcraft/CraftPanel';
import { ExportDialog } from '@/components/panelcraft/ExportDialog';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';

export default function Panelcraft() {
  const navigate = useNavigate();
  const [issue, setIssue] = useState<PanelcraftIssue | null>(null);
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved'>('idle');
  const hasLoaded = useRef(false);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      setIssue(raw ? JSON.parse(raw) : makeIssue2());
    } catch {
      setIssue(makeIssue2());
    }
    hasLoaded.current = true;
  }, []);

  useEffect(() => {
    if (!hasLoaded.current || !issue) return;
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
  }, [issue]);

  const updatePage = useCallback((updated: Page) => {
    setIssue(prev => prev ? { ...prev, pages: prev.pages.map(p => p.number === updated.number ? updated : p) } : prev);
  }, []);

  const resetToDefaults = () => {
    if (!confirm('Reset to the default Issue 2 breakdown? Your current edits will be lost.')) return;
    setIssue(makeIssue2());
    setCurrentPageNumber(1);
    toast.success('Reset to default breakdown');
  };

  const currentPage = useMemo(
    () => issue?.pages.find(p => p.number === currentPageNumber) || issue?.pages[0],
    [issue, currentPageNumber]
  );
  const issues = useMemo(() => currentPage ? checksForPage(currentPage) : [], [currentPage]);

  if (!issue || !currentPage) {
    return (
      <AppLayout>
        <div className="p-8 text-muted-foreground font-mono">loading…</div>
      </AppLayout>
    );
  }

  return (
    <AppLayout>
      <div className="flex flex-col h-[calc(100vh-0px)] lg:h-screen">
        {/* HEADER */}
        <div className="flex items-center justify-between gap-3 px-4 lg:px-5 py-3 border-b border-border flex-wrap">
          <div className="flex items-baseline gap-3 flex-wrap">
            <Button variant="ghost" size="sm" onClick={() => navigate('/narrative-engine')}>
              <ArrowLeft className="h-4 w-4 mr-1" /> Engine
            </Button>
            <div className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] uppercase text-accent">
              <LayoutGrid className="h-3.5 w-3.5" /> Panelcraft
            </div>
            <Input
              value={issue.title}
              onChange={(e) => setIssue({ ...issue, title: e.target.value })}
              className="bg-transparent border-0 text-lg italic h-auto py-1 w-auto min-w-[8rem] focus-visible:ring-0"
            />
          </div>
          <div className="flex items-center gap-2">
            <span className={`font-mono text-[10px] uppercase tracking-widest ${
              saveStatus === 'saving' ? 'text-accent' : saveStatus === 'saved' ? 'text-emerald-400' : 'text-muted-foreground'
            }`}>
              {saveStatus === 'saving' ? '◌ saving' : saveStatus === 'saved' ? '✓ saved' : '◯ idle'}
            </span>
            <Button variant="outline" size="sm" onClick={resetToDefaults} title="Reset to Issue 2 breakdown">
              <RotateCcw className="h-3.5 w-3.5 mr-1" /> Reset
            </Button>
            <Button size="sm" onClick={() => setShowExport(true)}>
              <FileText className="h-3.5 w-3.5 mr-1" /> Export Script
            </Button>
          </div>
        </div>

        {/* BODY */}
        <div className="flex-1 overflow-hidden">
          {/* Mobile / small screens: stacked, no resizers */}
          <div className="md:hidden h-full overflow-y-auto p-4">
            <div className="mb-4 flex gap-2 overflow-x-auto pb-2">
              {issue.pages.map(p => (
                <button
                  key={p.number}
                  onClick={() => setCurrentPageNumber(p.number)}
                  className={`shrink-0 px-2 py-1 rounded font-mono text-xs ${
                    p.number === currentPageNumber ? 'bg-accent text-accent-foreground' : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {p.number}{p.side}{p.isCliffhanger ? '●' : ''}
                </button>
              ))}
            </div>
            <PageEditor page={currentPage} onChange={updatePage} />
          </div>

          {/* md/lg: resizable two-pane (pages + editor) */}
          <ResizablePanelGroup direction="horizontal" autoSaveId="panelcraft:layout:md" className="hidden md:flex lg:hidden">
            <ResizablePanel defaultSize={22} minSize={14} maxSize={40} className="bg-card/40">
              <div className="h-full overflow-y-auto">
                <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 bg-card/60 backdrop-blur border-b border-border z-10">
                  Pages · {issue.pages.length}
                </div>
                {issue.pages.map(p => (
                  <PageListItem key={p.number} page={p} active={p.number === currentPageNumber} onSelect={() => setCurrentPageNumber(p.number)} />
                ))}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={78} minSize={40}>
              <div className="h-full overflow-y-auto p-4 lg:p-6">
                <PageEditor page={currentPage} onChange={updatePage} />
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>

          {/* lg+: resizable three-pane */}
          <ResizablePanelGroup direction="horizontal" autoSaveId="panelcraft:layout:lg" className="hidden lg:flex">
            <ResizablePanel defaultSize={18} minSize={10} maxSize={35} className="bg-card/40">
              <div className="h-full overflow-y-auto">
                <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 bg-card/60 backdrop-blur border-b border-border z-10">
                  Pages · {issue.pages.length}
                </div>
                {issue.pages.map(p => (
                  <PageListItem key={p.number} page={p} active={p.number === currentPageNumber} onSelect={() => setCurrentPageNumber(p.number)} />
                ))}
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={56} minSize={30}>
              <div className="h-full overflow-y-auto p-4 lg:p-6 xl:p-8">
                <PageEditor page={currentPage} onChange={updatePage} />
              </div>
            </ResizablePanel>
            <ResizableHandle withHandle />
            <ResizablePanel defaultSize={26} minSize={15} maxSize={45} className="bg-card/40">
              <div className="h-full overflow-y-auto p-4 space-y-4">
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted-foreground">
                    Story Arc · Tension
                  </div>
                  <div className="rounded p-2 bg-background border border-border">
                    <StoryArcGraph pages={issue.pages} currentPage={currentPageNumber} onSelect={setCurrentPageNumber} />
                    <div className="flex justify-between mt-1 font-mono text-[9px] text-muted-foreground">
                      <span>p.1</span>
                      <span className="text-destructive">● cliffhanger</span>
                      <span>p.{issue.pages.length}</span>
                    </div>
                  </div>
                </div>
                <div>
                  <div className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted-foreground">
                    Craft Check · Page {currentPage.number}
                  </div>
                  <CraftPanel issues={issues} />
                </div>
              </div>
            </ResizablePanel>
          </ResizablePanelGroup>
        </div>
      </div>

      <ExportDialog open={showExport} onOpenChange={setShowExport} issue={issue} />
    </AppLayout>
  );
}
