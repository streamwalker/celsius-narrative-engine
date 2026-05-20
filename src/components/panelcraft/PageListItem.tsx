import { Button } from '@/components/ui/button';
import { tensionForPage } from '@/lib/panelcraft/checks';
import type { Page } from '@/lib/panelcraft/types';
import { cn } from '@/lib/utils';

interface Props {
  page: Page;
  active: boolean;
  onSelect: () => void;
}

export function PageListItem({ page, active, onSelect }: Props) {
  const t = Math.min(1, tensionForPage(page) / 9);
  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2 border-l-2 transition-all relative',
        active ? 'border-accent bg-accent/10' : 'border-transparent hover:bg-muted/40'
      )}
    >
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: `linear-gradient(90deg, hsl(var(--accent) / ${0.1 + t * 0.4}) 0%, transparent 100%)` }}
      />
      <div className="flex items-baseline gap-2 relative">
        <span className={cn('font-mono text-xs', active ? 'text-accent' : 'text-muted-foreground')}>
          {String(page.number).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'font-mono text-[10px] px-1 rounded',
            page.side === 'R' ? 'bg-accent/20 text-accent' : 'bg-muted text-muted-foreground'
          )}
        >
          {page.side}
        </span>
        {page.isCliffhanger && <span className="text-[10px] text-destructive">●</span>}
      </div>
      <div className={cn('text-sm mt-0.5 relative', active ? 'text-foreground' : 'text-muted-foreground')}>
        {page.title || <span className="italic opacity-60">Untitled</span>}
      </div>
    </button>
  );
}
