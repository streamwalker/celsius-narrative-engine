import React, { useState, useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Card, CardContent } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Heart, Smile, Frown, Zap, Minus, Check } from 'lucide-react';
import { 
  EmotionState, 
  EMOTION_STATES, 
  getCharacterMood, 
  setCharacterMood,
  getEmotionById,
  getEmotionsByCategory,
  MoodCategory
} from '@/lib/character-moods';
import { toast } from 'sonner';

interface CharacterMoodSelectorProps {
  characterId: string;
  characterName: string;
  onMoodChange?: (emotion: EmotionState) => void;
  trigger?: React.ReactNode;
}

const CATEGORY_ICONS: Record<MoodCategory, React.ReactNode> = {
  positive: <Smile className="h-4 w-4 text-green-500" />,
  negative: <Frown className="h-4 w-4 text-red-500" />,
  neutral: <Minus className="h-4 w-4 text-gray-500" />,
  intense: <Zap className="h-4 w-4 text-yellow-500" />
};

export function CharacterMoodSelector({
  characterId,
  characterName,
  onMoodChange,
  trigger
}: CharacterMoodSelectorProps) {
  const [open, setOpen] = useState(false);
  const [currentMood, setCurrentMood] = useState<EmotionState | undefined>();
  const [reason, setReason] = useState('');

  useEffect(() => {
    if (open) {
      const moodState = getCharacterMood(characterId);
      if (moodState) {
        setCurrentMood(getEmotionById(moodState.currentMood));
      }
    }
  }, [open, characterId]);

  const handleSelectMood = (emotion: EmotionState) => {
    setCharacterMood(characterId, emotion.id, reason || undefined);
    setCurrentMood(emotion);
    onMoodChange?.(emotion);
    toast.success(`${characterName}'s mood set to ${emotion.name}`);
    setReason('');
    setOpen(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-2">
            <Heart className="h-4 w-4" />
            {currentMood ? currentMood.name : 'Set Mood'}
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[80vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Heart className="h-5 w-5 text-primary" />
            {characterName}'s Mood
          </DialogTitle>
        </DialogHeader>

        {currentMood && (
          <div className="p-4 bg-muted rounded-lg mb-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-sm font-medium">Current mood:</span>
              <Badge className="gap-1">
                {CATEGORY_ICONS[currentMood.category]}
                {currentMood.name}
              </Badge>
            </div>
            <p className="text-xs text-muted-foreground">
              Visual cues: {currentMood.visualCues.join(', ')}
            </p>
          </div>
        )}

        <div className="space-y-2 mb-4">
          <Label>Reason for mood change (optional)</Label>
          <Input
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            placeholder="Lost a close friend in battle..."
          />
        </div>

        <Tabs defaultValue="positive">
          <TabsList className="grid grid-cols-4 mb-4">
            <TabsTrigger value="positive" className="gap-1">
              {CATEGORY_ICONS.positive} Positive
            </TabsTrigger>
            <TabsTrigger value="negative" className="gap-1">
              {CATEGORY_ICONS.negative} Negative
            </TabsTrigger>
            <TabsTrigger value="neutral" className="gap-1">
              {CATEGORY_ICONS.neutral} Neutral
            </TabsTrigger>
            <TabsTrigger value="intense" className="gap-1">
              {CATEGORY_ICONS.intense} Intense
            </TabsTrigger>
          </TabsList>

          {(['positive', 'negative', 'neutral', 'intense'] as MoodCategory[]).map((category) => (
            <TabsContent key={category} value={category}>
              <ScrollArea className="h-[40vh]">
                <div className="grid grid-cols-2 gap-3">
                  {getEmotionsByCategory(category).map((emotion) => (
                    <EmotionCard
                      key={emotion.id}
                      emotion={emotion}
                      isSelected={currentMood?.id === emotion.id}
                      onSelect={handleSelectMood}
                    />
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          ))}
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function EmotionCard({
  emotion,
  isSelected,
  onSelect
}: {
  emotion: EmotionState;
  isSelected: boolean;
  onSelect: (e: EmotionState) => void;
}) {
  const intensityBars = Array.from({ length: 3 }, (_, i) => i < emotion.intensity);

  return (
    <Card 
      className={`cursor-pointer transition-all hover:shadow-md ${
        isSelected ? 'ring-2 ring-primary bg-primary/5' : ''
      }`}
      onClick={() => onSelect(emotion)}
    >
      <CardContent className="p-4 space-y-3">
        <div className="flex items-center justify-between">
          <span className="font-medium flex items-center gap-2">
            {emotion.name}
            {isSelected && <Check className="h-4 w-4 text-primary" />}
          </span>
          <div className="flex gap-0.5">
            {intensityBars.map((filled, i) => (
              <div
                key={i}
                className={`w-2 h-4 rounded-sm ${
                  filled ? 'bg-primary' : 'bg-muted'
                }`}
              />
            ))}
          </div>
        </div>

        <div className="space-y-1">
          <div className="flex flex-wrap gap-1">
            {emotion.expressionKeywords.slice(0, 2).map((keyword) => (
              <Badge key={keyword} variant="secondary" className="text-xs">
                {keyword}
              </Badge>
            ))}
          </div>
        </div>

        <div className="text-xs text-muted-foreground">
          <p><span className="font-medium">Visual:</span> {emotion.visualCues[0]}</p>
          <p><span className="font-medium">Body:</span> {emotion.bodyLanguageHints[0]}</p>
        </div>

        <div className="flex flex-wrap gap-1">
          {emotion.colorTones.slice(0, 2).map((tone) => (
            <span key={tone} className="text-xs px-2 py-0.5 bg-muted rounded">
              {tone}
            </span>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

// Compact inline selector for use in panel editor
export function MoodQuickSelector({
  characterId,
  onMoodChange
}: {
  characterId: string;
  onMoodChange: (emotion: EmotionState) => void;
}) {
  const moodState = getCharacterMood(characterId);
  const currentMood = moodState ? getEmotionById(moodState.currentMood) : undefined;

  return (
    <div className="flex flex-wrap gap-1">
      {EMOTION_STATES.slice(0, 8).map((emotion) => (
        <Button
          key={emotion.id}
          variant={currentMood?.id === emotion.id ? 'default' : 'ghost'}
          size="sm"
          className="h-7 text-xs"
          onClick={() => {
            setCharacterMood(characterId, emotion.id);
            onMoodChange(emotion);
          }}
        >
          {emotion.name}
        </Button>
      ))}
    </div>
  );
}
