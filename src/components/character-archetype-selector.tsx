import React from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Sparkles, User, Target, Shield, AlertTriangle, Star } from 'lucide-react';
import { CHARACTER_ARCHETYPES, CharacterArchetype, getSuggestedArchetypes } from '@/lib/character-archetypes';

interface CharacterArchetypeSelectorProps {
  selectedArchetype?: CharacterArchetype;
  onSelectArchetype: (archetype: CharacterArchetype) => void;
  raceId?: string;
  classId?: string;
  trigger?: React.ReactNode;
}

export function CharacterArchetypeSelector({
  selectedArchetype,
  onSelectArchetype,
  raceId,
  classId,
  trigger,
}: CharacterArchetypeSelectorProps) {
  const [open, setOpen] = React.useState(false);

  const suggestedArchetypes = raceId && classId
    ? getSuggestedArchetypes(raceId, classId)
    : [];

  const handleSelect = (archetype: CharacterArchetype) => {
    onSelectArchetype(archetype);
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" className="gap-2">
            <Sparkles className="h-4 w-4" />
            {selectedArchetype ? selectedArchetype.name : 'Choose Archetype'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-4xl max-h-[85vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-primary" />
            Character Archetypes
          </DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[65vh] pr-4">
          {suggestedArchetypes.length > 0 && (
            <div className="mb-6">
              <h3 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Star className="h-4 w-4 text-yellow-500" />
                Suggested for your race/class
              </h3>
              <div className="grid grid-cols-2 gap-3">
                {suggestedArchetypes.map((archetype) => (
                  <ArchetypeCard
                    key={archetype.id}
                    archetype={archetype}
                    isSelected={selectedArchetype?.id === archetype.id}
                    onSelect={handleSelect}
                    isSuggested
                  />
                ))}
              </div>
            </div>
          )}

          <h3 className="text-sm font-medium text-muted-foreground mb-3">All Archetypes</h3>
          <div className="grid grid-cols-2 gap-3">
            {CHARACTER_ARCHETYPES.map((archetype) => (
              <ArchetypeCard
                key={archetype.id}
                archetype={archetype}
                isSelected={selectedArchetype?.id === archetype.id}
                onSelect={handleSelect}
              />
            ))}
          </div>
        </ScrollArea>
      </DialogContent>
    </Dialog>
  );
}

function ArchetypeCard({
  archetype,
  isSelected,
  onSelect,
  isSuggested,
}: {
  archetype: CharacterArchetype;
  isSelected: boolean;
  onSelect: (a: CharacterArchetype) => void;
  isSuggested?: boolean;
}) {
  return (
    <Card
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      } ${isSuggested ? 'border-yellow-500/50' : ''}`}
      onClick={() => onSelect(archetype)}
    >
      <CardHeader className="pb-2">
        <CardTitle className="text-base flex items-center justify-between">
          <span className="flex items-center gap-2">
            <User className="h-4 w-4" />
            {archetype.name}
          </span>
          {isSuggested && <Star className="h-4 w-4 text-yellow-500" />}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {archetype.description}
        </p>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Target className="h-3 w-3 text-blue-500" />
            <span className="text-xs font-medium">Traits:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {archetype.personalityTraits.slice(0, 3).map((trait) => (
              <Badge key={trait} variant="secondary" className="text-xs">
                {trait}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Shield className="h-3 w-3 text-green-500" />
            <span className="text-xs font-medium">Strengths:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {archetype.strengths.slice(0, 2).map((strength) => (
              <Badge key={strength} variant="outline" className="text-xs text-green-600">
                {strength}
              </Badge>
            ))}
          </div>
        </div>

        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <AlertTriangle className="h-3 w-3 text-orange-500" />
            <span className="text-xs font-medium">Flaws:</span>
          </div>
          <div className="flex flex-wrap gap-1">
            {archetype.flaws.slice(0, 2).map((flaw) => (
              <Badge key={flaw} variant="outline" className="text-xs text-orange-600">
                {flaw}
              </Badge>
            ))}
          </div>
        </div>

        <div className="pt-2 border-t">
          <span className="text-xs text-muted-foreground">Story Roles: </span>
          <span className="text-xs">{archetype.storyRoles.join(', ')}</span>
        </div>
      </CardContent>
    </Card>
  );
}
