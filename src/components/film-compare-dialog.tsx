
import { useState, useMemo } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Button } from '@/components/ui/button';
import { Film, Tv, GitCompareArrows, Minus } from 'lucide-react';
import { filmExamples, getFullTemplates } from '@/lib/film-examples';

/* Ordered field definitions for display */
const compareFields: { key: string; label: string; section: string }[] = [
  { key: 'theme', label: 'Theme', section: 'Core DNA' },
  { key: 'protag_name', label: 'Protagonist', section: 'Core DNA' },
  { key: 'protag_archetype', label: 'Archetype', section: 'Core DNA' },
  { key: 'protag_flaw', label: 'Core Flaw', section: 'Core DNA' },
  { key: 'protag_misbelief', label: 'Misbelief', section: 'Core DNA' },
  { key: 'a_goal', label: 'Primary Objective', section: 'Core DNA' },
  { key: 'antag_name', label: 'Antagonist', section: 'Core DNA' },
  { key: 'antag_want', label: 'Antagonist Want', section: 'Core DNA' },
  { key: 'antag_belief', label: 'Antagonist Belief', section: 'Core DNA' },
  { key: 'antag_flaw', label: 'Antagonist Flaw', section: 'Core DNA' },
  { key: 'a1_want', label: 'Who wants what?', section: 'Act I — A Story' },
  { key: 'a1_trigger', label: 'Why now?', section: 'Act I — A Story' },
  { key: 'a1_stakes', label: 'Stakes', section: 'Act I — A Story' },
  { key: 'a1_inciting', label: 'Inciting Incident', section: 'Act I — A Story' },
  { key: 'a1_ponr', label: 'Point of No Return', section: 'Act I — A Story' },
  { key: 'b1_flaws', label: 'Flaws Introduced', section: 'Act I — B Story' },
  { key: 'b1_contradiction', label: 'Internal Contradiction', section: 'Act I — B Story' },
  { key: 'b1_block', label: 'Internal Block', section: 'Act I — B Story' },
  { key: 'c1_motivation', label: 'Opposition Motivation', section: 'Act I — C Story' },
  { key: 'c1_understand', label: 'Understandable?', section: 'Act I — C Story' },
  { key: 'c1_believe', label: 'Believable?', section: 'Act I — C Story' },
  { key: 'c1_sympathize', label: 'Sympathetic?', section: 'Act I — C Story' },
  { key: 'c1_goal', label: 'Opposition Goal', section: 'Act I — C Story' },
  { key: 'a2_plan', label: 'False Confidence Plan', section: 'Act II — A Story' },
  { key: 'a2_win1', label: 'Win #1', section: 'Act II — A Story' },
  { key: 'a2_win2', label: 'Win #2', section: 'Act II — A Story' },
  { key: 'a2_complication', label: 'Complication', section: 'Act II — A Story' },
  { key: 'mid_choice', label: 'Wrong Choice / Right Reason', section: 'Midpoint' },
  { key: 'mid_change', label: 'What Changes?', section: 'Midpoint' },
  { key: 'mid_broken', label: 'Plan Broken', section: 'Midpoint' },
  { key: 'mid_impossible', label: 'Success Impossible', section: 'Midpoint' },
  { key: 'b2_warnings', label: 'Red Flags Ignored', section: 'Act II — B Story' },
  { key: 'b2_flaw_active', label: 'Flaw Causing Failure', section: 'Act II — B Story' },
  { key: 'b2_crisis', label: 'Internal Crisis', section: 'Act II — B Story' },
  { key: 'c2_adapt', label: 'Opposition Adapts', section: 'Act II — C Story' },
  { key: 'c2_learns', label: 'Exploit Discovered', section: 'Act II — C Story' },
  { key: 'low_external', label: 'External Collapse', section: 'Low Point' },
  { key: 'low_internal', label: 'Internal Collapse', section: 'Low Point' },
  { key: 'low_finished', label: 'Why Finished', section: 'Low Point' },
  { key: 'b3_revelation', label: 'Revelation', section: 'Act III — B Story' },
  { key: 'b3_decision', label: 'New Decision', section: 'Act III — B Story' },
  { key: 'a3_plan', label: 'New Plan', section: 'Act III — A Story' },
  { key: 'a3_confrontation', label: 'Final Confrontation', section: 'Act III — A Story' },
  { key: 'a3_risked', label: 'What Is Risked', section: 'Act III — A Story' },
  { key: 'a3_sacrificed', label: 'What Is Sacrificed', section: 'Act III — A Story' },
  { key: 'c3_flaw', label: 'Defeat Flaw', section: 'Act III — C Story' },
  { key: 'c3_mirror', label: 'Mirror', section: 'Act III — C Story' },
  { key: 'den_truth', label: 'Thematic Proof', section: 'Denouement' },
  { key: 'den_protag', label: 'Protagonist Changed', section: 'Denouement' },
  { key: 'den_support', label: 'Supporting Changed', section: 'Denouement' },
  { key: 'den_world', label: 'World Changed', section: 'Denouement' },
  { key: 'den_cost', label: 'Cost of Victory', section: 'Denouement' },
];

const sectionColors: Record<string, string> = {
  'Core DNA': 'text-primary',
  'Act I — A Story': 'text-blue-400',
  'Act I — B Story': 'text-amber-400',
  'Act I — C Story': 'text-red-400',
  'Act II — A Story': 'text-blue-400',
  'Midpoint': 'text-yellow-300',
  'Act II — B Story': 'text-amber-400',
  'Act II — C Story': 'text-red-400',
  'Low Point': 'text-orange-400',
  'Act III — B Story': 'text-amber-400',
  'Act III — A Story': 'text-blue-400',
  'Act III — C Story': 'text-red-400',
  'Denouement': 'text-emerald-400',
};

export const FilmCompareDialog = () => {
  const [open, setOpen] = useState(false);
  const [leftTitle, setLeftTitle] = useState('');
  const [rightTitle, setRightTitle] = useState('');
  const templates = getFullTemplates();

  const left = useMemo(() => filmExamples.find(f => f.title === leftTitle), [leftTitle]);
  const right = useMemo(() => filmExamples.find(f => f.title === rightTitle), [rightTitle]);

  /* Only show fields where at least one side has data */
  const visibleFields = useMemo(() => {
    if (!left && !right) return [];
    return compareFields.filter(f => left?.fields[f.key] || right?.fields[f.key]);
  }, [left, right]);

  /* Group visible fields by section */
  const grouped = useMemo(() => {
    const map = new Map<string, typeof compareFields>();
    for (const f of visibleFields) {
      if (!map.has(f.section)) map.set(f.section, []);
      map.get(f.section)!.push(f);
    }
    return map;
  }, [visibleFields]);

  const MediumIcon = ({ medium }: { medium?: 'film' | 'tv' }) =>
    medium === 'tv' ? <Tv className="h-3 w-3 text-amber-400" /> : <Film className="h-3 w-3 text-blue-400" />;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="outline" size="sm" className="text-xs gap-1.5 border-accent/30">
          <GitCompareArrows className="h-3.5 w-3.5" />
          Compare Films
        </Button>
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh] p-0 gap-0">
        <DialogHeader className="p-4 pb-3 border-b border-border">
          <DialogTitle className="text-sm font-['Orbitron'] flex items-center gap-2 text-primary">
            <GitCompareArrows className="h-4 w-4" />
            Story Structure Comparison
          </DialogTitle>
          <p className="text-xs text-muted-foreground">
            Select two stories to compare their structural DNA side by side
          </p>
        </DialogHeader>

        {/* Selectors */}
        <div className="grid grid-cols-2 gap-3 p-4 border-b border-border bg-muted/20">
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Story A</label>
            <Select value={leftTitle} onValueChange={setLeftTitle}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Select a film or show…" />
              </SelectTrigger>
              <SelectContent>
                {filmExamples.map(f => (
                  <SelectItem key={f.title} value={f.title} disabled={f.title === rightTitle}>
                    <span className="flex items-center gap-1.5">
                      <MediumIcon medium={f.medium} />
                      {f.title} ({f.year})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1">
            <label className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground">Story B</label>
            <Select value={rightTitle} onValueChange={setRightTitle}>
              <SelectTrigger className="h-9 text-xs bg-background">
                <SelectValue placeholder="Select a film or show…" />
              </SelectTrigger>
              <SelectContent>
                {filmExamples.map(f => (
                  <SelectItem key={f.title} value={f.title} disabled={f.title === leftTitle}>
                    <span className="flex items-center gap-1.5">
                      <MediumIcon medium={f.medium} />
                      {f.title} ({f.year})
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Comparison body */}
        <ScrollArea className="flex-1 max-h-[calc(85vh-180px)]">
          {(!left && !right) ? (
            <div className="flex items-center justify-center h-48 text-muted-foreground text-sm">
              Select two stories above to begin comparing
            </div>
          ) : (
            <div className="p-4 space-y-4">
              {Array.from(grouped.entries()).map(([section, fields]) => (
                <div key={section}>
                  <div className="flex items-center gap-2 mb-2">
                    <span className={`text-xs font-['Orbitron'] font-semibold ${sectionColors[section] || 'text-foreground'}`}>
                      {section}
                    </span>
                    <Separator className="flex-1" />
                  </div>
                  <div className="space-y-2">
                    {fields.map(f => {
                      const lv = left?.fields[f.key];
                      const rv = right?.fields[f.key];
                      return (
                        <div key={f.key} className="rounded-lg border border-border overflow-hidden">
                          <div className="bg-muted/30 px-3 py-1.5">
                            <span className="text-[11px] font-semibold text-foreground">{f.label}</span>
                          </div>
                          <div className="grid grid-cols-2 divide-x divide-border">
                            <div className="p-3 min-h-[48px]">
                              {lv ? (
                                <p className="text-[11px] leading-relaxed text-foreground">{lv}</p>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50 italic">
                                  <Minus className="h-3 w-3" /> Not covered
                                </span>
                              )}
                            </div>
                            <div className="p-3 min-h-[48px]">
                              {rv ? (
                                <p className="text-[11px] leading-relaxed text-foreground">{rv}</p>
                              ) : (
                                <span className="flex items-center gap-1 text-[11px] text-muted-foreground/50 italic">
                                  <Minus className="h-3 w-3" /> Not covered
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              ))}

              {/* Coverage stats */}
              {left && right && (
                <div className="rounded-lg bg-muted/30 border border-border p-3">
                  <p className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground mb-2">Coverage Comparison</p>
                  <div className="grid grid-cols-2 gap-4">
                    {[{ film: left, label: 'A' }, { film: right, label: 'B' }].map(({ film, label }) => {
                      const filled = compareFields.filter(f => film.fields[f.key]).length;
                      const pct = Math.round((filled / compareFields.length) * 100);
                      return (
                        <div key={label} className="space-y-1">
                          <div className="flex items-center justify-between">
                            <span className="text-xs font-medium text-foreground flex items-center gap-1">
                              <MediumIcon medium={film.medium} />
                              {film.title}
                            </span>
                            <Badge variant="secondary" className="text-[10px]">{filled}/{compareFields.length}</Badge>
                          </div>
                          <div className="h-1.5 bg-muted rounded-full overflow-hidden">
                            <div
                              className="h-full bg-primary rounded-full transition-all"
                              style={{ width: `${pct}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          )}
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
};
