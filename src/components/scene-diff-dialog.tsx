
import React from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Badge } from '@/components/ui/badge';

import { Check, X, ArrowRight, Trash2, Pencil, MoveHorizontal, RefreshCw } from 'lucide-react';
import type { Scene, SceneChange } from '@/lib/narrative/types';

interface SceneDiffDialogProps {
  isOpen: boolean;
  onClose: () => void;
  originalScenes: Scene[];
  correctedScenes: Scene[];
  changesSummary: string;
  onConfirm: () => void;
}

function diffScenes(original: Scene[], corrected: Scene[]): SceneChange[] {
  const changes: SceneChange[] = [];
  
  const origByTitle = new Map<string, Scene>();
  for (const s of original) origByTitle.set(s.title, s);
  
  const corrByTitle = new Map<string, Scene>();
  for (const s of corrected) corrByTitle.set(s.title, s);

  for (const s of original) {
    if (!corrByTitle.has(s.title)) {
      changes.push({ type: 'deleted', original: s, details: `Ep ${s.episode ?? '?'}, S${s.sceneNumber}: "${s.title}" removed` });
    }
  }

  for (const c of corrected) {
    const o = origByTitle.get(c.title);
    if (!o) {
      changes.push({ type: 'modified', updated: c, details: `New/renamed scene: Ep ${c.episode ?? '?'}, S${c.sceneNumber}: "${c.title}"` });
      continue;
    }

    const diffs: string[] = [];
    if (o.episode !== c.episode) diffs.push(`Episode: ${o.episode} → ${c.episode}`);
    if (o.sceneNumber !== c.sceneNumber) diffs.push(`Scene#: ${o.sceneNumber} → ${c.sceneNumber}`);
    if (o.beatTier !== c.beatTier) diffs.push(`BeatTier: ${o.beatTier} → ${c.beatTier}`);
    if (o.primaryAxis !== c.primaryAxis) diffs.push(`Axis: ${o.primaryAxis} → ${c.primaryAxis}`);
    if (o.purpose !== c.purpose) diffs.push(`Purpose updated`);
    if (o.summary !== c.summary) diffs.push(`Summary updated`);

    if (diffs.length === 0) continue;

    const hasMoved = o.episode !== c.episode;
    changes.push({
      type: hasMoved ? 'moved' : 'modified',
      original: o,
      updated: c,
      details: diffs.join(' · '),
    });
  }

  const order = { deleted: 0, moved: 1, renamed: 2, modified: 3 };
  changes.sort((a, b) => order[a.type] - order[b.type]);

  return changes;
}

const typeConfig = {
  moved: { icon: MoveHorizontal, label: 'Moved', color: 'text-blue-400', bg: 'bg-blue-500/10 border-blue-500/30' },
  renamed: { icon: Pencil, label: 'Renamed', color: 'text-amber-400', bg: 'bg-amber-500/10 border-amber-500/30' },
  deleted: { icon: Trash2, label: 'Deleted', color: 'text-red-400', bg: 'bg-red-500/10 border-red-500/30' },
  modified: { icon: RefreshCw, label: 'Modified', color: 'text-purple-400', bg: 'bg-purple-500/10 border-purple-500/30' },
};

export function SceneDiffDialog({
  isOpen,
  onClose,
  originalScenes,
  correctedScenes,
  changesSummary,
  onConfirm,
}: SceneDiffDialogProps) {
  const changes = diffScenes(originalScenes, correctedScenes);

  const counts = {
    moved: changes.filter(c => c.type === 'moved').length,
    modified: changes.filter(c => c.type === 'modified').length,
    deleted: changes.filter(c => c.type === 'deleted').length,
    renamed: changes.filter(c => c.type === 'renamed').length,
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-3xl max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <RefreshCw className="h-5 w-5 text-primary" />
            Review Changes Before Applying
          </DialogTitle>
        </DialogHeader>

        <div
          className="bg-muted/50 rounded-lg p-3 text-sm text-muted-foreground prose prose-sm prose-invert max-w-none [&_ul]:list-disc [&_ul]:pl-4 [&_li]:my-0.5"
          dangerouslySetInnerHTML={{ __html: changesSummary }}
        />

        <div className="flex gap-3 flex-wrap">
          {counts.moved > 0 && <Badge variant="outline" className="border-blue-500/50 text-blue-400">{counts.moved} Moved</Badge>}
          {counts.modified > 0 && <Badge variant="outline" className="border-purple-500/50 text-purple-400">{counts.modified} Modified</Badge>}
          {counts.deleted > 0 && <Badge variant="outline" className="border-red-500/50 text-red-400">{counts.deleted} Deleted</Badge>}
          {changes.length === 0 && <span className="text-xs text-muted-foreground">No changes detected</span>}
          <span className="text-xs text-muted-foreground ml-auto">{originalScenes.length} → {correctedScenes.length} scenes</span>
        </div>

        <div className="overflow-y-auto max-h-[50vh]">
          <div className="space-y-2 pr-4">
            {changes.map((change, i) => {
              const config = typeConfig[change.type];
              const Icon = config.icon;
              return (
                <div key={i} className={`rounded-lg border p-3 ${config.bg}`}>
                  <div className="flex items-start gap-2">
                    <Icon className={`h-4 w-4 mt-0.5 ${config.color} shrink-0`} />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`text-xs font-semibold ${config.color}`}>{config.label}</span>
                        <span className="text-sm font-medium text-foreground truncate">
                          {change.original?.title || change.updated?.title}
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">{change.details}</p>
                      {change.type === 'moved' && change.original && change.updated && (
                        <div className="flex items-center gap-2 mt-2 text-xs">
                          <span className="bg-muted rounded px-2 py-0.5">
                            Ep {change.original.episode}, S{change.original.sceneNumber}
                          </span>
                          <ArrowRight className="h-3 w-3 text-muted-foreground" />
                          <span className="bg-primary/20 text-primary rounded px-2 py-0.5">
                            Ep {change.updated.episode}, S{change.updated.sceneNumber}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        <div className="flex gap-2 justify-end pt-2 border-t border-border">
          <Button variant="outline" onClick={onClose}>
            <X className="h-4 w-4 mr-1" /> Cancel
          </Button>
          <Button onClick={onConfirm} className="bg-emerald-600 hover:bg-emerald-700 text-white">
            <Check className="h-4 w-4 mr-1" /> Apply {changes.length} Changes
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
