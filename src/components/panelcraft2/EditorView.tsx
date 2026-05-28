import { useCallback, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  ArrowLeft,
  FileText,
  LayoutGrid,
  ScrollText,
  PlusSquare,
  Focus,
  PanelLeftClose,
  PanelLeftOpen,
  PanelRightClose,
  PanelRightOpen,
} from 'lucide-react';
import { Toggle } from '@/components/ui/toggle';
import { ResizablePanelGroup, ResizablePanel, ResizableHandle } from '@/components/ui/resizable';
import { PageEditor } from '@/components/panelcraft/PageEditor';
import { StoryArcGraph } from '@/components/panelcraft/StoryArcGraph';
import { CraftPanel } from '@/components/panelcraft/CraftPanel';
import { ExportDialog } from '@/components/panelcraft/ExportDialog';
import { checksForPage, tensionForPage } from '@/lib/panelcraft/checks';
import type { Page } from '@/lib/panelcraft/types';
import { type GeneratedIssue, generatePanelsForPage, GenerateError } from '@/lib/panelcraft2/generate';
import { toast } from 'sonner';
import { PageListItemV2 } from './PageListItemV2';
import { FunctionLegend } from './FunctionLegend';
import { SourceDialog } from './SourceDialog';


interface Props {
  issue: GeneratedIssue;
  onChange: (issue: GeneratedIssue) => void;
  onNewIssue: () => void;
  saveStatus: 'idle' | 'saving' | 'saved';
}

export function EditorView({ issue, onChange, onNewIssue, saveStatus }: Props) {
  const navigate = useNavigate();
  const [currentPageNumber, setCurrentPageNumber] = useState(1);
  const [showExport, setShowExport] = useState(false);
  const [showSource, setShowSource] = useState(false);

  const [showPages, setShowPages] = useState<boolean>(() => {
    try { const v = localStorage.getItem('panelcraft2:ui:showPages'); return v === null ? true : v === '1'; } catch { return true; }
  });
  const [showRail, setShowRail] = useState<boolean>(() => {
    try { const v = localStorage.getItem('panelcraft2:ui:showRail'); return v === null ? true : v === '1'; } catch { return true; }
  });
  const focusMode = !showPages && !showRail;
  const toggleFocus = () => {
    if (focusMode) { setShowPages(true); setShowRail(true); }
    else { setShowPages(false); setShowRail(false); }
  };
  const persistShowPages = (v: boolean) => { setShowPages(v); try { localStorage.setItem('panelcraft2:ui:showPages', v ? '1' : '0'); } catch {} };
  const persistShowRail = (v: boolean) => { setShowRail(v); try { localStorage.setItem('panelcraft2:ui:showRail', v ? '1' : '0'); } catch {} };

  const updatePage = useCallback((updated: Page) => {
    onChange({ ...issue, pages: issue.pages.map(p => p.number === updated.number ? updated : p) });
  }, [issue, onChange]);

  const currentPage = useMemo(
    () => issue.pages.find(p => p.number === currentPageNumber) || issue.pages[0],
    [issue, currentPageNumber],
  );
  const craftIssues = useMemo(() => currentPage ? checksForPage(currentPage) : [], [currentPage]);

  if (!currentPage) return null;

  return (
    <div className="flex flex-col h-screen">
      {/* HEADER */}
      <div className="flex items-center justify-between gap-3 px-4 lg:px-5 py-3 border-b border-border flex-wrap">
        <div className="flex items-baseline gap-3 flex-wrap">
          <Button variant="ghost" size="sm" onClick={() => navigate('/narrative-engine')}>
            <ArrowLeft className="h-4 w-4 mr-1" /> Engine
          </Button>
          <div className="flex items-center gap-2 font-mono text-xs tracking-[0.3em] uppercase text-accent">
            <LayoutGrid className="h-3.5 w-3.5" /> Panelcraft 2
          </div>
          <Input
            value={issue.title}
            onChange={(e) => onChange({ ...issue, title: e.target.value })}
            className="bg-transparent border-0 text-lg italic h-auto py-1 w-auto min-w-[8rem] font-serif focus-visible:ring-0"
          />
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          <span className={`font-mono text-[10px] uppercase tracking-widest ${
            saveStatus === 'saving' ? 'text-accent' : saveStatus === 'saved' ? 'text-emerald-400' : 'text-muted-foreground'
          }`}>
            {saveStatus === 'saving' ? '◌ saving' : saveStatus === 'saved' ? '✓ saved' : '◯ idle'}
          </span>
          <div className="hidden md:flex items-center gap-1 mr-1">
            <Toggle size="sm" pressed={showPages} onPressedChange={persistShowPages} title="Toggle pages list">
              {showPages ? <PanelLeftClose className="h-4 w-4" /> : <PanelLeftOpen className="h-4 w-4" />}
            </Toggle>
            <Toggle size="sm" pressed={showRail} onPressedChange={persistShowRail} title="Toggle craft rail" className="hidden lg:inline-flex">
              {showRail ? <PanelRightClose className="h-4 w-4" /> : <PanelRightOpen className="h-4 w-4" />}
            </Toggle>
            <Toggle size="sm" pressed={focusMode} onPressedChange={toggleFocus} title="Focus mode">
              <Focus className="h-4 w-4" />
            </Toggle>
          </div>
          <Button variant="outline" size="sm" onClick={() => setShowSource(true)} title="View source treatment">
            <ScrollText className="h-3.5 w-3.5 mr-1" /> Source
          </Button>
          <Button variant="outline" size="sm" onClick={onNewIssue} title="Start a new issue">
            <PlusSquare className="h-3.5 w-3.5 mr-1" /> New
          </Button>
          <Button size="sm" onClick={() => setShowExport(true)}>
            <FileText className="h-3.5 w-3.5 mr-1" /> Export Script
          </Button>
        </div>
      </div>

      {/* BODY */}
      <div className="flex-1 overflow-hidden">
        {/* Mobile stacked */}
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

        {/* md only: pages + editor */}
        <ResizablePanelGroup
          key={`md-${showPages}`}
          direction="horizontal"
          autoSaveId="panelcraft2:layout:md:v1"
          className="hidden md:flex lg:hidden"
        >
          {showPages && (
            <>
              <ResizablePanel id="md-pages" order={1} defaultSize={22} minSize={14} maxSize={35} className="bg-card/40">
                <div className="h-full overflow-y-auto">
                  <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 bg-card/60 backdrop-blur border-b border-border z-10">
                    Pages · {issue.pages.length}
                  </div>
                  {issue.pages.map(p => (
                    <PageListItemV2
                      key={p.number}
                      page={p}
                      active={p.number === currentPageNumber}
                      onSelect={() => setCurrentPageNumber(p.number)}
                      tension={tensionForPage(p)}
                    />
                  ))}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel id="md-editor" order={2} defaultSize={showPages ? 78 : 100} minSize={50}>
            <div className="h-full overflow-y-auto p-4 lg:p-6">
              <PageEditor page={currentPage} onChange={updatePage} />
            </div>
          </ResizablePanel>
        </ResizablePanelGroup>

        {/* lg+: three-pane */}
        <ResizablePanelGroup
          key={`lg-${showPages}-${showRail}`}
          direction="horizontal"
          autoSaveId="panelcraft2:layout:lg:v1"
          className="hidden lg:flex"
        >
          {showPages && (
            <>
              <ResizablePanel id="lg-pages" order={1} defaultSize={18} minSize={10} maxSize={30} className="bg-card/40">
                <div className="h-full overflow-y-auto">
                  <div className="px-3 py-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground sticky top-0 bg-card/60 backdrop-blur border-b border-border z-10">
                    Pages · {issue.pages.length}
                  </div>
                  {issue.pages.map(p => (
                    <PageListItemV2
                      key={p.number}
                      page={p}
                      active={p.number === currentPageNumber}
                      onSelect={() => setCurrentPageNumber(p.number)}
                      tension={tensionForPage(p)}
                    />
                  ))}
                </div>
              </ResizablePanel>
              <ResizableHandle withHandle />
            </>
          )}
          <ResizablePanel
            id="lg-editor"
            order={2}
            defaultSize={focusMode ? 100 : showPages && showRail ? 56 : showPages ? 82 : showRail ? 74 : 100}
            minSize={45}
          >
            <div className={`h-full overflow-y-auto p-4 lg:p-6 xl:p-8 ${focusMode ? 'mx-auto max-w-4xl' : ''}`}>
              <PageEditor page={currentPage} onChange={updatePage} />
            </div>
          </ResizablePanel>
          {showRail && (
            <>
              <ResizableHandle withHandle />
              <ResizablePanel id="lg-rail" order={3} defaultSize={26} minSize={15} maxSize={40} className="bg-card/40">
                <div className="h-full overflow-y-auto p-4 space-y-4">
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted-foreground">
                      Story Arc · Tension
                    </div>
                    <div className="rounded p-2 bg-background border border-border">
                      <StoryArcGraph pages={issue.pages} currentPage={currentPageNumber} onSelect={setCurrentPageNumber} structure={issue.structure} />
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
                    <CraftPanel issues={craftIssues} />
                  </div>
                  <div>
                    <div className="font-mono text-[10px] uppercase tracking-widest mb-2 text-muted-foreground">
                      Function Legend
                    </div>
                    <FunctionLegend />
                  </div>
                </div>
              </ResizablePanel>
            </>
          )}
        </ResizablePanelGroup>
      </div>

      <ExportDialog open={showExport} onOpenChange={setShowExport} issue={issue} />
      <SourceDialog open={showSource} onOpenChange={setShowSource} treatment={issue.treatment || ''} />
    </div>
  );
}
