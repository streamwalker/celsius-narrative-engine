import { ComicPanel } from './ComicPanel';
import type { ComicPage } from '@/lib/comic-panel-parser';

interface GraphicNovelPageLayoutProps {
  page: ComicPage;
  images: Record<string, string>;
  generating: Record<string, boolean>;
  errors: Record<string, string>;
  onRegenerate: (panelKey: string) => void;
  onDownloadPanel: (panelKey: string) => void;
}

function gridClassForPanelCount(count: number): string {
  switch (count) {
    case 1:
      return 'grid-cols-1';
    case 2:
      return 'grid-cols-1 sm:grid-cols-2';
    case 3:
      return 'grid-cols-1 sm:grid-cols-2 lg:grid-cols-3';
    case 4:
      return 'grid-cols-2';
    case 5:
      return 'grid-cols-2 lg:grid-cols-3';
    default:
      return 'grid-cols-2 lg:grid-cols-3';
  }
}

export function GraphicNovelPageLayout({
  page,
  images,
  generating,
  errors,
  onRegenerate,
  onDownloadPanel,
}: GraphicNovelPageLayoutProps) {
  const spreadPosition = page.isOdd ? 'Right (Recto)' : 'Left (Verso)';

  return (
    <section className="mb-10">
      <div className="flex items-center gap-3 mb-4 pb-2 border-b border-border">
        <span className="font-display text-xl tracking-widest">PAGE {page.pageNumber}</span>
        <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground">
          {spreadPosition}
        </span>
        <span className="font-mono text-[10px] text-muted-foreground ml-auto">
          {page.panels.length} {page.panels.length === 1 ? 'panel' : 'panels'}
        </span>
      </div>

      {page.panels.length === 0 ? (
        <p className="text-sm text-muted-foreground italic">No panels parsed for this page.</p>
      ) : (
        <div className={`grid gap-3 ${gridClassForPanelCount(page.panels.length)}`}>
          {page.panels.map((panel, idx) => {
            const isLast = idx === page.panels.length - 1;
            const isFirst = idx === 0;
            const emphasis: 'cliffhanger' | 'reveal' | null =
              page.isOdd && isLast ? 'cliffhanger' : !page.isOdd && isFirst ? 'reveal' : null;

            return (
              <ComicPanel
                key={panel.panelKey}
                panel={panel}
                imageUrl={images[panel.panelKey]}
                isGenerating={generating[panel.panelKey]}
                error={errors[panel.panelKey]}
                emphasis={emphasis}
                onRegenerate={() => onRegenerate(panel.panelKey)}
                onDownload={images[panel.panelKey] ? () => onDownloadPanel(panel.panelKey) : undefined}
              />
            );
          })}
        </div>
      )}
    </section>
  );
}
