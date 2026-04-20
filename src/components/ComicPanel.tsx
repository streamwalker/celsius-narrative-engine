import { useState } from 'react';
import { RefreshCw, Loader2, Download, ShieldCheck } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { ConsistencyCheckDialog } from '@/components/ConsistencyCheckDialog';
import type { ComicPanelData } from '@/lib/comic-panel-parser';

interface ComicPanelProps {
  panel: ComicPanelData;
  imageUrl?: string;
  isGenerating?: boolean;
  error?: string;
  onRegenerate?: () => void;
  onDownload?: () => void;
  className?: string;
  /** Flag the panel as the page-ending beat on odd pages (cliffhanger). */
  emphasis?: 'cliffhanger' | 'reveal' | null;
}

export function ComicPanel({
  panel,
  imageUrl,
  isGenerating,
  error,
  onRegenerate,
  onDownload,
  className,
  emphasis,
}: ComicPanelProps) {
  const [consistencyOpen, setConsistencyOpen] = useState(false);

  return (
    <div
      className={cn(
        'relative border-4 border-border rounded-sm overflow-hidden group bg-secondary',
        emphasis === 'cliffhanger' && 'ring-2 ring-amber-500/50',
        emphasis === 'reveal' && 'ring-2 ring-primary/50',
        className
      )}
    >
      {/* Panel number tag */}
      <div className="absolute top-2 left-2 z-20 font-mono text-[10px] uppercase tracking-wider bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
        {panel.panelKey}
      </div>

      {/* Hover controls */}
      {!isGenerating && (imageUrl || error) && (
        <div className="absolute top-2 right-2 z-20 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
          {onRegenerate && (
            <Button
              variant="secondary"
              size="sm"
              onClick={onRegenerate}
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-7 px-2 text-xs"
              title="Regenerate this panel"
            >
              <RefreshCw className="w-3 h-3 mr-1" />
              Regenerate
            </Button>
          )}
          {imageUrl && (
            <Button
              variant="secondary"
              size="icon"
              onClick={() => setConsistencyOpen(true)}
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-7 w-7"
              title="Check character consistency"
            >
              <ShieldCheck className="w-3 h-3" />
            </Button>
          )}
          {imageUrl && onDownload && (
            <Button
              variant="secondary"
              size="icon"
              onClick={onDownload}
              className="bg-background/80 backdrop-blur-sm hover:bg-background h-7 w-7"
              title="Download panel image"
            >
              <Download className="w-3 h-3" />
            </Button>
          )}
        </div>
      )}

      {/* Main image / loading / placeholder */}
      <div className="relative w-full aspect-[4/3] bg-gradient-to-br from-secondary to-muted">
        {isGenerating ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <Loader2 className="w-10 h-10 text-primary animate-spin mx-auto mb-3" />
              <p className="text-xs text-muted-foreground font-mono uppercase tracking-wider">
                Rendering {panel.panelKey}…
              </p>
            </div>
          </div>
        ) : imageUrl ? (
          <img src={imageUrl} alt={panel.description} className="w-full h-full object-cover" />
        ) : error ? (
          <div className="absolute inset-0 flex items-center justify-center p-4 bg-destructive/10">
            <div className="text-center">
              <p className="text-xs text-destructive mb-2">Generation failed</p>
              <p className="text-[10px] text-muted-foreground">{error}</p>
              {onRegenerate && (
                <Button variant="outline" size="sm" onClick={onRegenerate} className="mt-3 h-7 text-xs">
                  <RefreshCw className="w-3 h-3 mr-1" /> Retry
                </Button>
              )}
            </div>
          </div>
        ) : (
          <div className="absolute inset-0 flex items-center justify-center p-4">
            <p className="text-[10px] text-muted-foreground text-center line-clamp-4 leading-snug font-mono">
              {panel.description || '(no description)'}
            </p>
          </div>
        )}
      </div>

      {/* Narration box (top) */}
      {panel.narration && (imageUrl || !error) && (
        <div className="absolute top-8 left-2 right-2 z-10 pointer-events-none">
          <div
            className="bg-accent text-accent-foreground px-3 py-1.5 font-mono text-[11px] font-bold uppercase leading-tight"
            style={{ clipPath: 'polygon(0 0, 100% 0, 98% 100%, 2% 100%)' }}
          >
            {panel.narration}
          </div>
        </div>
      )}

      {/* Speech bubble (bottom) */}
      {panel.dialogue && (imageUrl || !error) && (
        <div className="absolute bottom-3 left-3 right-3 z-10 pointer-events-none">
          <div className="relative bg-background text-foreground border border-border rounded-lg px-3 py-2 font-mono text-[11px] font-bold uppercase leading-tight">
            {panel.dialogue}
            <div
              className="absolute -bottom-2 left-5 w-0 h-0"
              style={{
                borderLeft: '8px solid transparent',
                borderRight: '8px solid transparent',
                borderTop: '8px solid hsl(var(--background))',
              }}
            />
          </div>
        </div>
      )}

      {/* Emphasis badge */}
      {emphasis && (
        <div className="absolute bottom-2 right-2 z-20 font-mono text-[9px] uppercase tracking-widest bg-background/80 backdrop-blur-sm px-1.5 py-0.5 rounded">
          {emphasis === 'cliffhanger' ? '🔥 Cliffhanger' : '⚡ Reveal'}
        </div>
      )}

      {imageUrl && (
        <ConsistencyCheckDialog
          open={consistencyOpen}
          onOpenChange={setConsistencyOpen}
          panelImage={imageUrl}
          panelLabel={panel.panelKey}
        />
      )}
    </div>
  );
}
