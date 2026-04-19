import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Loader2, Wand2, RefreshCw } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { Race } from '@/lib/races';
import { CharacterClass } from '@/lib/classes';
import { AppearanceConfig, generateAppearancePrompt } from '@/lib/character-builder';

interface BackstoryGeneratorProps {
  characterName: string;
  race: Race;
  characterClass: CharacterClass;
  appearance: AppearanceConfig;
  backstory: string;
  onBackstoryChange: (backstory: string) => void;
}

type BackstoryStyle = 'heroic' | 'tragic' | 'mysterious' | 'comedic';

const STYLE_OPTIONS: { value: BackstoryStyle; label: string; emoji: string }[] = [
  { value: 'heroic', label: 'Heroic', emoji: '⚔️' },
  { value: 'tragic', label: 'Tragic', emoji: '💔' },
  { value: 'mysterious', label: 'Mysterious', emoji: '🌙' },
  { value: 'comedic', label: 'Comedic', emoji: '😄' },
];

export function BackstoryGenerator({
  characterName,
  race,
  characterClass,
  appearance,
  backstory,
  onBackstoryChange,
}: BackstoryGeneratorProps) {
  const [isGenerating, setIsGenerating] = useState(false);
  const [selectedStyle, setSelectedStyle] = useState<BackstoryStyle>('heroic');
  const [streamedText, setStreamedText] = useState('');

  const generateBackstory = async () => {
    setIsGenerating(true);
    setStreamedText('');

    const appearanceDesc = generateAppearancePrompt(appearance, race, characterClass);

    try {
      const response = await supabase.functions.invoke('generate-backstory', {
        body: {
          characterName: characterName || 'The Unnamed Hero',
          race: race.name,
          characterClass: characterClass.name,
          appearance: appearanceDesc,
          style: selectedStyle,
        },
      });

      if (response.error) {
        if (response.error.message?.includes('429')) {
          toast.error('Rate limit reached. Please try again later.');
        } else if (response.error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits.');
        } else {
          throw response.error;
        }
        return;
      }

      if (response.data?.backstory) {
        const text = response.data.backstory;
        let currentIndex = 0;

        const typeInterval = setInterval(() => {
          if (currentIndex < text.length) {
            const chunkSize = Math.min(3, text.length - currentIndex);
            setStreamedText(text.slice(0, currentIndex + chunkSize));
            currentIndex += chunkSize;
          } else {
            clearInterval(typeInterval);
            onBackstoryChange(text);
            setStreamedText('');
            toast.success('Backstory generated!');
          }
        }, 10);
      }
    } catch (err) {
      console.error('Backstory generation error:', err);
      toast.error('Failed to generate backstory');
    } finally {
      setIsGenerating(false);
    }
  };

  const displayText = streamedText || backstory;

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <Label>Backstory</Label>
        <div className="flex items-center gap-2">
          <div className="flex gap-1">
            {STYLE_OPTIONS.map((style) => (
              <Badge
                key={style.value}
                variant={selectedStyle === style.value ? 'default' : 'outline'}
                className="cursor-pointer gap-1"
                onClick={() => setSelectedStyle(style.value)}
              >
                <span>{style.emoji}</span>
                <span className="hidden sm:inline">{style.label}</span>
              </Badge>
            ))}
          </div>

          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={generateBackstory}
            disabled={isGenerating}
            className="gap-1"
          >
            {isGenerating ? (
              <>
                <Loader2 className="w-3 h-3 animate-spin" />
                Generating...
              </>
            ) : backstory ? (
              <>
                <RefreshCw className="w-3 h-3" />
                Regenerate
              </>
            ) : (
              <>
                <Wand2 className="w-3 h-3" />
                Generate
              </>
            )}
          </Button>
        </div>
      </div>

      <div className="relative">
        <Textarea
          value={displayText}
          onChange={(e) => onBackstoryChange(e.target.value)}
          placeholder="Write your character's backstory or click Generate to create one with AI..."
          className="h-40 resize-none"
          disabled={isGenerating && streamedText.length > 0}
        />

        {isGenerating && streamedText.length > 0 && (
          <div className="absolute bottom-2 right-2">
            <span className="inline-block w-2 h-4 bg-primary animate-pulse" />
          </div>
        )}
      </div>

      {!backstory && !isGenerating && (
        <p className="text-xs text-muted-foreground">
          Tip: Choose a style above before generating for different narrative tones.
        </p>
      )}
    </div>
  );
}
