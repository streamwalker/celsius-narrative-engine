
import { useMemo, useState, useCallback, DragEvent } from 'react';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { ChevronDown, ChevronUp, AlertTriangle, BarChart3, Wrench } from 'lucide-react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { toast } from 'sonner';
import type { Scene } from '@/lib/narrative/types';
import { getAllowedTiers, getSceneViolations } from '@/lib/narrative/pacing';

// Re-export for backward compatibility
export { getAllowedTiers, getSceneViolations, getClosestAllowedTier } from '@/lib/narrative/pacing';

interface SeasonOverviewPanelProps {
  scenes: Scene[];
  totalEpisodes: number;
  onEpisodeClick: (ep: number) => void;
  activeEpisode: number;
  onFixViolations: () => number;
  onMoveScene: (sceneNumber: number, fromEpisode: number, toEpisode: number) => void;
}

interface EpisodeStats {
  episode: number;
  sceneCount: number;
  axis: { A: number; B: number; C: number };
  avgTension: number;
  beatTiers: Record<string, number>;
  violations: number;
}

const tierOrder = ['setup', 'escalation', 'midpoint', 'collapse', 'resolution'];
const tierColors: Record<string, string> = {
  setup: 'bg-blue-500',
  escalation: 'bg-amber-500',
  midpoint: 'bg-yellow-500',
  collapse: 'bg-red-500',
  resolution: 'bg-emerald-500',
};

const SeasonOverviewPanel = ({ scenes, totalEpisodes, onEpisodeClick, activeEpisode, onFixViolations, onMoveScene }: SeasonOverviewPanelProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [dragOverEpisode, setDragOverEpisode] = useState<number | null>(null);

  const episodeStats: EpisodeStats[] = useMemo(() => {
    return Array.from({ length: totalEpisodes }, (_, i) => {
      const ep = i + 1;
      const epScenes = scenes.filter(s => s.episode === ep);
      const axis = { A: 0, B: 0, C: 0 };
      const beatTiers: Record<string, number> = {};
      let totalEnergy = 0;
      let violations = 0;

      epScenes.forEach(s => {
        if (s.primaryAxis && axis.hasOwnProperty(s.primaryAxis)) {
          axis[s.primaryAxis as keyof typeof axis]++;
        }
        if (s.beatTier) {
          beatTiers[s.beatTier] = (beatTiers[s.beatTier] || 0) + 1;
        }
        totalEnergy += s.energyLevel || 0;
        if (getSceneViolations(s, totalEpisodes)) violations++;
      });

      return {
        episode: ep,
        sceneCount: epScenes.length,
        axis,
        avgTension: epScenes.length > 0 ? Math.round(totalEnergy / epScenes.length) : 0,
        beatTiers,
        violations,
      };
    });
  }, [scenes, totalEpisodes]);

  const totalViolations = useMemo(() => episodeStats.reduce((sum, e) => sum + e.violations, 0), [episodeStats]);
  const hasAnyScenes = scenes.some(s => s.episode);

  const handleDragStart = useCallback((e: DragEvent, scene: Scene) => {
    e.dataTransfer.setData('application/json', JSON.stringify({
      sceneNumber: scene.sceneNumber,
      fromEpisode: scene.episode,
    }));
    e.dataTransfer.effectAllowed = 'move';
  }, []);

  const handleDragOver = useCallback((e: DragEvent, ep: number) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    setDragOverEpisode(ep);
  }, []);

  const handleDragLeave = useCallback(() => {
    setDragOverEpisode(null);
  }, []);

  const handleDrop = useCallback((e: DragEvent, toEpisode: number) => {
    e.preventDefault();
    setDragOverEpisode(null);
    try {
      const data = JSON.parse(e.dataTransfer.getData('application/json'));
      if (data.fromEpisode !== toEpisode) {
        onMoveScene(data.sceneNumber, data.fromEpisode, toEpisode);
      }
    } catch {}
  }, [onMoveScene]);

  const handleFixViolations = useCallback(() => {
    const fixed = onFixViolations();
    if (fixed > 0) {
      toast.success(`Fixed ${fixed} beat tier violation${fixed !== 1 ? 's' : ''}`);
    } else {
      toast.info('No violations to fix');
    }
  }, [onFixViolations]);

  if (!hasAnyScenes) return null;

  return (
    <Collapsible open={isOpen} onOpenChange={setIsOpen}>
      <CollapsibleTrigger className="w-full flex items-center justify-between px-3 py-2 rounded-lg border border-border bg-muted/10 hover:bg-muted/20 transition-colors">
        <div className="flex items-center gap-2">
          <BarChart3 className="h-3.5 w-3.5 text-primary" />
          <span className="text-[10px] font-['Orbitron'] uppercase tracking-wider text-muted-foreground">
            Season Overview
          </span>
          {totalViolations > 0 && (
            <Badge variant="destructive" className="text-[8px] px-1.5 py-0 gap-1">
              <AlertTriangle className="h-2.5 w-2.5" />
              {totalViolations} violation{totalViolations !== 1 ? 's' : ''}
            </Badge>
          )}
        </div>
        {isOpen ? <ChevronUp className="h-3.5 w-3.5 text-muted-foreground" /> : <ChevronDown className="h-3.5 w-3.5 text-muted-foreground" />}
      </CollapsibleTrigger>

      <CollapsibleContent>
        {totalViolations > 0 && (
          <div className="mt-2 mb-1">
            <Button
              variant="outline"
              size="sm"
              className="gap-1.5 text-xs border-destructive/30 text-destructive hover:bg-destructive/10"
              onClick={(e) => { e.stopPropagation(); handleFixViolations(); }}
            >
              <Wrench className="h-3 w-3" />
              Fix {totalViolations} Violation{totalViolations !== 1 ? 's' : ''}
            </Button>
            <span className="ml-2 text-[9px] text-muted-foreground">Reassigns beat tiers to match episode arc position</span>
          </div>
        )}

        <div className="mt-2 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2">
          <TooltipProvider delayDuration={200}>
            {episodeStats.map(ep => {
              const isActive = activeEpisode === ep.episode;
              const allowed = getAllowedTiers(ep.episode, totalEpisodes);
              const tensionColor = ep.avgTension >= 70 ? 'text-red-400' : ep.avgTension >= 45 ? 'text-amber-400' : 'text-blue-400';
              const isDragOver = dragOverEpisode === ep.episode;
              const epScenes = scenes.filter(s => s.episode === ep.episode);

              return (
                <Tooltip key={ep.episode}>
                  <TooltipTrigger asChild>
                    <div
                      onClick={() => onEpisodeClick(ep.episode)}
                      onDragOver={(e) => handleDragOver(e, ep.episode)}
                      onDragLeave={handleDragLeave}
                      onDrop={(e) => handleDrop(e, ep.episode)}
                      className={`text-left rounded-lg p-2.5 border transition-all cursor-pointer ${
                        isDragOver
                          ? 'border-primary border-dashed bg-primary/10 scale-105'
                          : isActive
                            ? 'border-primary bg-primary/5'
                            : ep.sceneCount > 0
                              ? 'border-border/50 bg-muted/10 hover:bg-muted/20'
                              : 'border-border/20 bg-muted/5 opacity-50'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[10px] font-bold text-foreground">Ep {ep.episode}</span>
                        {ep.violations > 0 && (
                          <AlertTriangle className="h-3 w-3 text-destructive" />
                        )}
                      </div>

                      {ep.sceneCount > 0 ? (
                        <>
                          <div className="flex gap-1 mb-1.5">
                            <span className="text-[8px] text-blue-400 font-semibold">A:{ep.axis.A}</span>
                            <span className="text-[8px] text-amber-400 font-semibold">B:{ep.axis.B}</span>
                            <span className="text-[8px] text-red-400 font-semibold">C:{ep.axis.C}</span>
                          </div>

                          <div className="flex items-center gap-1 mb-1.5">
                            <span className={`text-[9px] font-bold ${tensionColor}`}>{ep.avgTension}°C</span>
                            <div className="flex-1 h-1 rounded-full bg-muted/30 overflow-hidden">
                              <div
                                className={`h-full rounded-full ${ep.avgTension >= 70 ? 'bg-red-500' : ep.avgTension >= 45 ? 'bg-amber-500' : 'bg-blue-400'}`}
                                style={{ width: `${ep.avgTension}%` }}
                              />
                            </div>
                          </div>

                          <div className="flex gap-px h-2 rounded-sm overflow-hidden">
                            {tierOrder.filter(t => ep.beatTiers[t]).map(t => (
                              <div
                                key={t}
                                className={`${tierColors[t]} ${!allowed.includes(t) ? 'opacity-40 ring-1 ring-destructive' : ''}`}
                                style={{ flex: ep.beatTiers[t] }}
                                title={`${t}: ${ep.beatTiers[t]}`}
                              />
                            ))}
                          </div>

                          <div className="mt-1.5 space-y-0.5">
                            {epScenes.slice(0, 3).map(s => (
                              <div
                                key={`${s.episode}-${s.sceneNumber}`}
                                draggable
                                onDragStart={(e) => handleDragStart(e, s)}
                                className="text-[7px] text-muted-foreground truncate cursor-grab active:cursor-grabbing hover:text-foreground transition-colors px-1 py-0.5 rounded hover:bg-muted/30"
                                title={`Drag to move Scene ${s.sceneNumber} to another episode`}
                              >
                                S{s.sceneNumber}: {s.title}
                              </div>
                            ))}
                            {epScenes.length > 3 && (
                              <div className="text-[7px] text-muted-foreground/50 px-1">
                                +{epScenes.length - 3} more
                              </div>
                            )}
                          </div>
                        </>
                      ) : (
                        <span className="text-[9px] text-muted-foreground">No scenes — drop here</span>
                      )}
                    </div>
                  </TooltipTrigger>
                  <TooltipContent side="bottom" className="text-xs max-w-[200px]">
                    <p className="font-semibold mb-1">Episode {ep.episode}</p>
                    <p className="text-muted-foreground">Allowed tiers: {allowed.join(', ')}</p>
                    {ep.violations > 0 && (
                      <p className="text-destructive mt-1">{ep.violations} beat placement violation{ep.violations !== 1 ? 's' : ''}</p>
                    )}
                    <p className="text-muted-foreground mt-1">Drag scenes between episodes to rebalance</p>
                  </TooltipContent>
                </Tooltip>
              );
            })}
          </TooltipProvider>
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
};

export default SeasonOverviewPanel;
