
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import { Clapperboard, Tv, Film, Theater, Wand2 } from 'lucide-react';
import type { StoryFormatDefault } from '@/lib/story-plan-data';

interface PortFormatDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: (formatFields: Record<string, string>) => void;
  storyTitle: string;
  defaultFormat?: StoryFormatDefault;
}

type Medium = 'comic' | 'tv' | 'tv-series' | 'film' | 'stage' | '';

const MEDIUM_OPTIONS: { value: Medium; label: string; icon: React.ComponentType<{ className?: string }> }[] = [
  { value: 'comic', label: 'Graphic Novel', icon: Clapperboard },
  { value: 'tv', label: 'TV Pilot / Episode', icon: Tv },
  { value: 'tv-series', label: 'TV Series', icon: Tv },
  { value: 'film', label: 'Feature Film', icon: Film },
  { value: 'stage', label: 'Stage Play', icon: Theater },
];

export function PortFormatDialog({ open, onOpenChange, onConfirm, storyTitle, defaultFormat }: PortFormatDialogProps) {
  const [medium, setMedium] = useState<Medium>('');
  const [comicPages, setComicPages] = useState('');
  const [comicIssues, setComicIssues] = useState('');
  const [tvEpLength, setTvEpLength] = useState('');
  const [tvSeriesEpLength, setTvSeriesEpLength] = useState('');
  const [tvSeriesEpisodes, setTvSeriesEpisodes] = useState('');
  const [filmLength, setFilmLength] = useState('');
  const [stageActs, setStageActs] = useState('');
  const [stageRuntime, setStageRuntime] = useState('');

  useEffect(() => {
    if (open && defaultFormat) {
      setMedium(defaultFormat.medium as Medium);
      const cfg = defaultFormat.config || {};
      setComicPages(cfg._comic_pages || '');
      setComicIssues(cfg._comic_issues || '');
      setTvEpLength(cfg._tv_ep_length || '');
      setTvSeriesEpLength(cfg._tv_series_ep_length || '');
      setTvSeriesEpisodes(cfg._tv_series_episodes || '');
      setFilmLength(cfg._film_length || '');
      setStageActs(cfg._stage_acts || '');
      setStageRuntime(cfg._stage_runtime || '');
    }
  }, [open, defaultFormat]);

  const handleConfirm = () => {
    const fields: Record<string, string> = { _medium: medium };
    if (medium === 'comic') {
      if (comicPages) fields._comic_pages = comicPages;
      if (comicIssues) fields._comic_issues = comicIssues;
    } else if (medium === 'tv') {
      if (tvEpLength) fields._tv_ep_length = tvEpLength;
    } else if (medium === 'tv-series') {
      if (tvSeriesEpLength) fields._tv_series_ep_length = tvSeriesEpLength;
      if (tvSeriesEpisodes) fields._tv_series_episodes = tvSeriesEpisodes;
    } else if (medium === 'film') {
      if (filmLength) fields._film_length = filmLength;
    } else if (medium === 'stage') {
      if (stageActs) fields._stage_acts = stageActs;
      if (stageRuntime) fields._stage_runtime = stageRuntime;
    }
    onConfirm(fields);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5 text-primary" />
            Port &quot;{storyTitle}&quot;
          </DialogTitle>
          <DialogDescription>Choose the output medium and (optionally) specify length targets.</DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          <div>
            <p className="text-xs font-mono uppercase tracking-widest text-muted-foreground mb-2">Medium</p>
            <div className="grid grid-cols-2 gap-2">
              {MEDIUM_OPTIONS.map((opt) => {
                const Icon = opt.icon;
                const active = medium === opt.value;
                return (
                  <button
                    key={opt.value}
                    type="button"
                    onClick={() => setMedium(opt.value)}
                    className={`flex items-center gap-2 rounded-md border p-3 text-left text-sm transition-colors ${
                      active ? 'border-primary bg-primary/5 text-primary' : 'border-border hover:border-muted-foreground/50'
                    }`}
                  >
                    <Icon className="h-4 w-4 shrink-0" />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {medium === 'comic' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Pages / issue</label>
                <input
                  value={comicPages}
                  onChange={(e) => setComicPages(e.target.value)}
                  placeholder="22"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Issues</label>
                <input
                  value={comicIssues}
                  onChange={(e) => setComicIssues(e.target.value)}
                  placeholder="6"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          )}

          {medium === 'tv' && (
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Episode length (min)</label>
              <input
                value={tvEpLength}
                onChange={(e) => setTvEpLength(e.target.value)}
                placeholder="60"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          )}

          {medium === 'tv-series' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Ep length</label>
                <input
                  value={tvSeriesEpLength}
                  onChange={(e) => setTvSeriesEpLength(e.target.value)}
                  placeholder="60"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Episodes</label>
                <input
                  value={tvSeriesEpisodes}
                  onChange={(e) => setTvSeriesEpisodes(e.target.value)}
                  placeholder="10"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          )}

          {medium === 'film' && (
            <div>
              <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Runtime (min)</label>
              <input
                value={filmLength}
                onChange={(e) => setFilmLength(e.target.value)}
                placeholder="120"
                className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
              />
            </div>
          )}

          {medium === 'stage' && (
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Acts</label>
                <input
                  value={stageActs}
                  onChange={(e) => setStageActs(e.target.value)}
                  placeholder="3"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
              <div>
                <label className="text-xs font-mono uppercase tracking-widest text-muted-foreground">Runtime (min)</label>
                <input
                  value={stageRuntime}
                  onChange={(e) => setStageRuntime(e.target.value)}
                  placeholder="120"
                  className="mt-1 h-9 w-full rounded-md border border-input bg-background px-3 text-sm"
                />
              </div>
            </div>
          )}

          {defaultFormat && (
            <Badge variant="outline" className="font-mono text-[10px]">
              Default: {defaultFormat.label}
            </Badge>
          )}
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={!medium}>
            Port
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
