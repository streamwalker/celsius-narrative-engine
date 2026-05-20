import { cn } from '@/lib/utils';
import type { Page } from '@/lib/panelcraft/types';

interface Props {
  page: Page;
  active: boolean;
  onSelect: () => void;
  tension: number;
}

/**
 * Page list item with a tension heat overlay (intensity scales with tension 0-9).
 */
export function PageListItemV2({ page, active, onSelect, tension }: Props) {
  const t = Math.min(1, Math.max(0, tension / 9));
  const heatOpacity = 0.06 + t * 0.22;

  return (
    <button
      onClick={onSelect}
      className={cn(
        'w-full text-left px-3 py-2 border-l-2 transition-colors relative block',
        active ? 'border-accent bg-accent/10' : 'border-transparent hover:bg-accent/5',
      )}
    >
      {/* Tension heat gradient */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: `linear-gradient(90deg, hsl(var(--accent) / ${heatOpacity}) 0%, transparent 80%)`,
        }}
      />
      <div className="flex items-baseline gap-2 relative">
        <span className={cn('font-mono text-xs', active ? 'text-accent' : 'text-muted-foreground')}>
          {String(page.number).padStart(2, '0')}
        </span>
        <span
          className={cn(
            'font-mono text-[10px] px-1 rounded',
            page.side === 'R'
              ? 'bg-accent/15 text-accent'
              : 'bg-muted text-muted-foreground',
          )}
        >
          {page.side}
        </span>
        {page.isCliffhanger && <span className="text-[10px] text-destructive">●</span>}
        <span className="ml-auto font-mono text-[9px] text-muted-foreground/70" title="page tension">
          t·{tension.toFixed(1)}
        </span>
      </div>
      <div className={cn('text-sm mt-0.5 relative truncate', active ? 'text-foreground' : 'text-muted-foreground')}>
        {page.title}
      </div>
    </button>
  );
}
