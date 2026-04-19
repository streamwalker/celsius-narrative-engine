import { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ArrowLeftRight, User } from 'lucide-react';
import { CharacterPose } from '@/components/pose-gallery';
import { CharacterProfileData } from '@/components/character-profile-editor';

interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];
  poses?: CharacterPose[];
  profile?: CharacterProfileData;
}

interface CharacterComparisonDialogProps {
  isOpen: boolean;
  onClose: () => void;
  characters: CharacterPreset[];
  initialCharacters?: [string?, string?];
}

export function CharacterComparisonDialog({
  isOpen,
  onClose,
  characters,
  initialCharacters = [],
}: CharacterComparisonDialogProps) {
  const [leftId, setLeftId] = useState<string | undefined>(initialCharacters[0]);
  const [rightId, setRightId] = useState<string | undefined>(initialCharacters[1]);

  const leftChar = characters.find(c => c.id === leftId);
  const rightChar = characters.find(c => c.id === rightId);

  useEffect(() => {
    if (isOpen && characters.length >= 2) {
      if (!leftId) setLeftId(characters[0]?.id);
      if (!rightId) setRightId(characters[1]?.id);
    }
  }, [isOpen, characters]);

  const handleSwap = () => {
    setLeftId(rightId);
    setRightId(leftId);
  };

  const getCharacterImage = (char?: CharacterPreset) => {
    if (!char) return null;
    if (char.poses && char.poses.length > 0) return char.poses[0].image;
    if (char.referenceImages && char.referenceImages.length > 0) return char.referenceImages[0];
    return null;
  };

  const renderProfileComparison = () => {
    const leftProfile = leftChar?.profile;
    const rightProfile = rightChar?.profile;
    
    if (!leftProfile && !rightProfile) return null;

    const fields = [
      { key: 'hairStyle', label: 'Hair Style' },
      { key: 'hairColor', label: 'Hair Color' },
      { key: 'eyeColor', label: 'Eye Color' },
      { key: 'skinTone', label: 'Skin Tone' },
      { key: 'bodyType', label: 'Body Type' },
      { key: 'clothing', label: 'Clothing' },
      { key: 'accessories', label: 'Accessories' },
      { key: 'distinctiveMarks', label: 'Distinctive Marks' },
    ] as const;

    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Profile Features</h4>
        <div className="grid gap-2">
          {fields.map(({ key, label }) => {
            const leftVal = leftProfile?.keyFeatures?.[key] || '-';
            const rightVal = rightProfile?.keyFeatures?.[key] || '-';
            const isDifferent = leftVal !== rightVal;
            
            return (
              <div key={key} className="grid grid-cols-[1fr,80px,1fr] gap-2 text-sm">
                <div className={`text-right truncate ${isDifferent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {leftVal}
                </div>
                <div className="text-center text-xs text-muted-foreground">
                  {label}
                </div>
                <div className={`text-left truncate ${isDifferent ? 'text-primary font-medium' : 'text-muted-foreground'}`}>
                  {rightVal}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const renderConsistencyComparison = () => {
    const leftWeight = leftChar?.profile?.consistencyWeight ?? 0.7;
    const rightWeight = rightChar?.profile?.consistencyWeight ?? 0.7;
    
    return (
      <div className="space-y-3">
        <h4 className="text-sm font-semibold text-foreground">Consistency Settings</h4>
        <div className="grid grid-cols-[1fr,80px,1fr] gap-2 text-sm">
          <div className="text-right">
            <Badge variant="outline">{Math.round(leftWeight * 100)}%</Badge>
          </div>
          <div className="text-center text-xs text-muted-foreground">Weight</div>
          <div className="text-left">
            <Badge variant="outline">{Math.round(rightWeight * 100)}%</Badge>
          </div>
        </div>
      </div>
    );
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-3xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Compare Characters</DialogTitle>
        </DialogHeader>

        {/* Character Selectors */}
        <div className="flex items-center gap-3 py-2">
          <Select value={leftId} onValueChange={setLeftId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select character" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id} disabled={char.id === rightId}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button variant="ghost" size="icon" onClick={handleSwap}>
            <ArrowLeftRight className="w-4 h-4" />
          </Button>
          
          <Select value={rightId} onValueChange={setRightId}>
            <SelectTrigger className="flex-1">
              <SelectValue placeholder="Select character" />
            </SelectTrigger>
            <SelectContent>
              {characters.map((char) => (
                <SelectItem key={char.id} value={char.id} disabled={char.id === leftId}>
                  {char.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Portrait Comparison */}
        <div className="grid grid-cols-2 gap-4">
          {[leftChar, rightChar].map((char, idx) => (
            <div key={idx} className="space-y-3">
              <div className="aspect-square bg-secondary rounded-lg border border-border overflow-hidden">
                {char && getCharacterImage(char) ? (
                  <img
                    src={getCharacterImage(char)!}
                    alt={char.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <User className="w-16 h-16 text-muted-foreground/30" />
                  </div>
                )}
              </div>
              <div className="text-center">
                <h3 className="font-medium text-foreground">{char?.name || 'Select character'}</h3>
                <p className="text-xs text-muted-foreground line-clamp-2">{char?.description}</p>
                {char?.poses && (
                  <Badge variant="secondary" className="mt-2">
                    {char.poses.length} pose{char.poses.length !== 1 ? 's' : ''}
                  </Badge>
                )}
              </div>
            </div>
          ))}
        </div>

        {/* Profile Comparison */}
        {leftChar && rightChar && (
          <div className="space-y-6 pt-4 border-t border-border">
            {renderProfileComparison()}
            {renderConsistencyComparison()}
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
