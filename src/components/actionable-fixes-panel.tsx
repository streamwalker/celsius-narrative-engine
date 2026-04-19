
import React from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Loader2, Zap, MoveHorizontal, Trash2, RefreshCw, Pencil } from 'lucide-react';
import type { ParsedFix } from '@/lib/narrative/types';

// Re-export type for backward compatibility
export type { ParsedFix } from '@/lib/narrative/types';

const categoryConfig = {
  move: { icon: MoveHorizontal, label: 'Move', color: 'text-blue-400', border: 'border-blue-500/30' },
  delete: { icon: Trash2, label: 'Delete', color: 'text-red-400', border: 'border-red-500/30' },
  reassign: { icon: RefreshCw, label: 'Reassign', color: 'text-purple-400', border: 'border-purple-500/30' },
  rename: { icon: Pencil, label: 'Rename', color: 'text-amber-400', border: 'border-amber-500/30' },
  general: { icon: Zap, label: 'Fix', color: 'text-emerald-400', border: 'border-emerald-500/30' },
};

export function parseAnalysisIntoFixes(analysis: string): ParsedFix[] {
  const fixes: ParsedFix[] = [];
  const lines = analysis.split('\n');
  let id = 0;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].trim();

    // Match "*   **EPISODE X, ..." pattern (misplaced scenes)
    if (/^\*\s+\*\*EPISODE\s+\d+/i.test(line)) {
      const titleMatch = line.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : line.slice(0, 80);
      let desc = '';
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (!next || /^\*\s+\*\*/.test(next) || /^###/.test(next) || /^\|/.test(next)) break;
        desc += next.replace(/^\*\s+/, '').replace(/\*\*/g, '') + ' ';
      }

      let category: ParsedFix['category'] = 'general';
      if (/move|belong|relocat/i.test(desc)) category = 'move';
      else if (/delet|remov|collaps|merg/i.test(desc)) category = 'delete';
      else if (/reassign|retier|relabel|beat\s*tier|axis/i.test(desc)) category = 'reassign';
      else if (/rename|refocus|retitle/i.test(desc)) category = 'rename';

      fixes.push({ id: `fix-${id++}`, category, title: title.replace(/\*\*/g, ''), description: desc.trim() });
    }

    // Match numbered strategic advice
    if (/^\d+\.\s+\*\*/.test(line)) {
      const titleMatch = line.match(/\*\*(.+?)\*\*/);
      const title = titleMatch ? titleMatch[1] : line.slice(0, 80);
      let desc = line.replace(/^\d+\.\s+/, '').replace(/\*\*/g, '');
      for (let j = i + 1; j < lines.length; j++) {
        const next = lines[j].trim();
        if (!next || /^\d+\.\s+\*\*/.test(next) || /^###/.test(next)) break;
        desc += ' ' + next.replace(/\*\*/g, '');
      }

      let category: ParsedFix['category'] = 'general';
      if (/move|relocat/i.test(title + desc)) category = 'move';
      else if (/delet|remov|collaps|merg|compress/i.test(title + desc)) category = 'delete';
      else if (/reassign|retier|beat\s*tier|axis/i.test(title + desc)) category = 'reassign';
      else if (/refactor|rename|refocus/i.test(title + desc)) category = 'rename';

      const isDup = fixes.some(f => f.title === title.replace(/\*\*/g, ''));
      if (!isDup) {
        fixes.push({ id: `fix-${id++}`, category, title: title.replace(/\*\*/g, ''), description: desc.trim() });
      }
    }

    // Match table rows
    if (/^\|\s*\*\*\d+/.test(line)) {
      const cols = line.split('|').filter(Boolean).map(c => c.trim());
      if (cols.length >= 3 && /fatal|redundant|weak|broken/i.test(cols[1] + cols[2])) {
        const epLabel = cols[0].replace(/\*\*/g, '');
        const feedback = cols[2]?.replace(/\*\*/g, '') || cols[1]?.replace(/\*\*/g, '');
        const category: ParsedFix['category'] = /delet|collaps|redundant/i.test(feedback) ? 'delete' : 'general';
        fixes.push({
          id: `fix-${id++}`,
          category,
          title: `Episode ${epLabel}: ${cols[1]?.replace(/\*\*/g, '')}`,
          description: feedback,
        });
      }
    }
  }

  return fixes;
}

interface ActionableFixesPanelProps {
  fixes: ParsedFix[];
  applyingFixId: string | null;
  onApplyFix: (fix: ParsedFix) => void;
}

export function ActionableFixesPanel({ fixes, applyingFixId, onApplyFix }: ActionableFixesPanelProps) {
  if (fixes.length === 0) return null;

  return (
    <div className="space-y-3 pt-3 border-t border-border/40">
      <h4 className="text-xs font-['Orbitron'] text-accent flex items-center gap-2">
        <Zap className="h-3.5 w-3.5" />
        ACTIONABLE FIXES ({fixes.length})
      </h4>
      <div className="space-y-2">
        {fixes.map(fix => {
          const config = categoryConfig[fix.category];
          const Icon = config.icon;
          const isApplying = applyingFixId === fix.id;
          return (
            <div key={fix.id} className={`rounded-lg border ${config.border} bg-muted/30 p-3`}>
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-2 flex-1 min-w-0">
                  <Icon className={`h-4 w-4 mt-0.5 ${config.color} shrink-0`} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge variant="outline" className={`text-[9px] ${config.border} ${config.color}`}>
                        {config.label}
                      </Badge>
                      <span className="text-sm font-medium text-foreground truncate">{fix.title}</span>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{fix.description}</p>
                  </div>
                </div>
                <Button
                  size="sm"
                  variant="outline"
                  disabled={!!applyingFixId}
                  onClick={() => onApplyFix(fix)}
                  className={`shrink-0 ${config.border} ${config.color} hover:bg-muted/50`}
                >
                  {isApplying ? (
                    <><Loader2 className="h-3.5 w-3.5 mr-1 animate-spin" /> Applying...</>
                  ) : (
                    <><Zap className="h-3.5 w-3.5 mr-1" /> Apply</>
                  )}
                </Button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
