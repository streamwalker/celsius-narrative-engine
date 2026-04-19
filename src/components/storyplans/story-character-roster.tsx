
import { useState } from 'react';
// next/image removed
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent } from '@/components/ui/card';
import { ChevronDown, ChevronUp, Shield, Swords, Zap } from 'lucide-react';

export interface CharacterStats {
  strength: number;
  agility: number;
  intelligence: number;
  willpower: number;
  charisma: number;
  psiPower: number;
}

export interface CharacterData {
  id: string;
  name: string;
  title: string;
  species: string;
  classRole: string;
  abilities: string[];
  stats: CharacterStats;
  equipment: string[];
  backstory: string;
  alignmentLaw: number;
  alignmentMoral: number;
  image: string;
}

interface StoryCharacterRosterProps {
  storyTitle: string;
  characters: CharacterData[];
  headerImage?: string;
}

function alignmentLabel(law: number, moral: number): string {
  const lawAxis = law < 33 ? 'Lawful' : law < 66 ? 'Neutral' : 'Chaotic';
  const moralAxis = moral < 33 ? 'Good' : moral < 66 ? 'Neutral' : 'Evil';
  if (lawAxis === 'Neutral' && moralAxis === 'Neutral') return 'True Neutral';
  return `${lawAxis} ${moralAxis}`;
}

function StatBar({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-16 font-mono uppercase tracking-wider text-muted-foreground">{label}</span>
      <div className="flex-1 h-1.5 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-primary/70" style={{ width: `${value}%` }} />
      </div>
      <span className="w-8 text-right font-mono text-muted-foreground">{value}</span>
    </div>
  );
}

export function StoryCharacterRoster({ storyTitle, characters, headerImage }: StoryCharacterRosterProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  return (
    <div className="space-y-6">
      {headerImage && (
        <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden border border-border">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={headerImage} alt={`${storyTitle} header`} className="w-full h-full object-cover" />
        </div>
      )}

      <div className="flex items-baseline justify-between flex-wrap gap-2">
        <h3 className="font-mono tracking-[0.15em] text-accent uppercase text-lg">Character Roster</h3>
        <span className="text-xs text-muted-foreground font-mono">
          {characters.length} {characters.length === 1 ? 'character' : 'characters'} · {storyTitle}
        </span>
      </div>

      <p className="text-xs text-muted-foreground font-mono bg-muted/30 border border-border/50 rounded-md px-3 py-2">
        Interactive character editor is queued for Phase 2b. This read-only roster preserves all character data and can
        be ported into the Character Builder once that slice ships.
      </p>

      <div className="grid gap-3 md:grid-cols-2">
        {characters.map((c) => {
          const isExpanded = expanded === c.id;
          return (
            <Card key={c.id} className="overflow-hidden">
              <CardContent className="p-0">
                <div className="flex gap-3 p-4">
                  <div className="w-16 h-16 shrink-0 rounded-md bg-muted overflow-hidden border border-border">
                    {c.image ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-2xl text-muted-foreground/30">
                        {c.name[0]}
                      </div>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="font-semibold truncate">{c.name}</h4>
                    <p className="text-xs text-muted-foreground truncate">{c.title}</p>
                    <div className="flex flex-wrap gap-1 mt-1.5">
                      <Badge variant="outline" className="text-[10px]">
                        {c.species}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {c.classRole}
                      </Badge>
                      <Badge variant="outline" className="text-[10px]">
                        {alignmentLabel(c.alignmentLaw, c.alignmentMoral)}
                      </Badge>
                    </div>
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setExpanded(isExpanded ? null : c.id)}
                  className="w-full justify-center border-t border-border rounded-none"
                >
                  {isExpanded ? (
                    <>
                      <ChevronUp className="h-3 w-3 mr-1" /> Collapse
                    </>
                  ) : (
                    <>
                      <ChevronDown className="h-3 w-3 mr-1" /> Details
                    </>
                  )}
                </Button>

                {isExpanded && (
                  <div className="px-4 py-3 space-y-3 border-t border-border bg-muted/20">
                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <Zap className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                          Abilities
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-1">
                        {c.abilities.map((a) => (
                          <Badge key={a} variant="secondary" className="text-[10px]">
                            {a}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="flex items-center gap-1 mb-1.5">
                        <Swords className="h-3 w-3 text-primary" />
                        <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">Stats</span>
                      </div>
                      <div className="space-y-1">
                        <StatBar label="STR" value={c.stats.strength} />
                        <StatBar label="AGI" value={c.stats.agility} />
                        <StatBar label="INT" value={c.stats.intelligence} />
                        <StatBar label="WIL" value={c.stats.willpower} />
                        <StatBar label="CHA" value={c.stats.charisma} />
                        <StatBar label="PSI" value={c.stats.psiPower} />
                      </div>
                    </div>

                    {c.equipment.length > 0 && (
                      <div>
                        <div className="flex items-center gap-1 mb-1.5">
                          <Shield className="h-3 w-3 text-primary" />
                          <span className="text-xs font-mono uppercase tracking-wider text-muted-foreground">
                            Equipment
                          </span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {c.equipment.map((eq) => (
                            <Badge key={eq} variant="outline" className="text-[10px]">
                              {eq}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    <div>
                      <p className="text-xs font-mono uppercase tracking-wider text-muted-foreground mb-1">Backstory</p>
                      <p className="text-xs text-foreground/80 leading-relaxed">{c.backstory}</p>
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}
