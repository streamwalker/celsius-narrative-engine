import type { CraftIssue } from '@/lib/panelcraft/types';
import { cn } from '@/lib/utils';

export function CraftPanel({ issues }: { issues: CraftIssue[] }) {
  if (!issues.length) {
    return (
      <div className="text-xs px-3 py-2 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        No craft issues flagged on this page.
      </div>
    );
  }
  return (
    <div className="space-y-1.5">
      {issues.map((issue, i) => (
        <div
          key={i}
          className={cn(
            'text-xs px-3 py-2 rounded border leading-relaxed',
            issue.level === 'warn'
              ? 'bg-destructive/10 text-destructive border-destructive/30'
              : 'bg-accent/5 text-accent/90 border-accent/20'
          )}
        >
          <span className="font-mono text-[9px] mr-1.5 opacity-60">
            {issue.level === 'warn' ? 'WARN' : 'NOTE'}
          </span>
          {issue.text}
        </div>
      ))}
    </div>
  );
}
