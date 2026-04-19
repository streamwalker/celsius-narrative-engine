import { useState } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { Wand2, Loader2, Download, RefreshCw, Check, X, ImagePlus } from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { CharacterPose, PoseType } from './pose-gallery';

interface CharacterToGenerate {
  id: string;
  name: string;
  description: string;
  selected: boolean;
}

interface GeneratedResult {
  characterId: string;
  pose: PoseType;
  image: string;
  accepted: boolean;
}

interface GenerateReferencesDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onGenerated: (characterId: string, poses: CharacterPose[]) => void;
  characters: CharacterToGenerate[];
  artStyle?: string;
}

const POSE_OPTIONS: { value: PoseType; label: string }[] = [
  { value: 'front', label: 'Front View' },
  { value: 'side', label: 'Side Profile' },
  { value: 'action', label: 'Action Pose' },
  { value: 'portrait', label: 'Portrait' },
  { value: 'full-body', label: 'Full Body' },
];

const ART_STYLES = [
  { value: 'western-comics', label: 'Western Comics' },
  { value: 'manga', label: 'Manga' },
  { value: 'noir', label: 'Noir' },
  { value: 'watercolor', label: 'Watercolor' },
  { value: 'digital-art', label: 'Digital Art' },
  { value: 'realistic', label: 'Realistic' },
];

export function GenerateReferencesDialog({
  isOpen,
  onClose,
  onGenerated,
  characters: initialCharacters,
  artStyle: defaultStyle,
}: GenerateReferencesDialogProps) {
  const [characters, setCharacters] = useState<CharacterToGenerate[]>(
    initialCharacters.map(c => ({ ...c, selected: true }))
  );
  const [selectedPoses, setSelectedPoses] = useState<PoseType[]>(['front', 'side', 'action']);
  const [artStyle, setArtStyle] = useState(defaultStyle || 'western-comics');
  const [isGenerating, setIsGenerating] = useState(false);
  const [currentProgress, setCurrentProgress] = useState({ character: '', pose: '', progress: 0 });
  const [results, setResults] = useState<GeneratedResult[]>([]);
  const [showResults, setShowResults] = useState(false);

  const toggleCharacter = (id: string) => {
    setCharacters(prev => prev.map(c => 
      c.id === id ? { ...c, selected: !c.selected } : c
    ));
  };

  const togglePose = (pose: PoseType) => {
    setSelectedPoses(prev => 
      prev.includes(pose) 
        ? prev.filter(p => p !== pose)
        : [...prev, pose]
    );
  };

  const updateDescription = (id: string, description: string) => {
    setCharacters(prev => prev.map(c => 
      c.id === id ? { ...c, description } : c
    ));
  };

  const generateReferences = async () => {
    const selectedCharacters = characters.filter(c => c.selected);
    
    if (selectedCharacters.length === 0) {
      toast.error('Select at least one character');
      return;
    }
    
    if (selectedPoses.length === 0) {
      toast.error('Select at least one pose type');
      return;
    }

    setIsGenerating(true);
    setResults([]);
    const newResults: GeneratedResult[] = [];

    const total = selectedCharacters.length * selectedPoses.length;
    let completed = 0;

    for (const character of selectedCharacters) {
      for (const pose of selectedPoses) {
        setCurrentProgress({
          character: character.name,
          pose,
          progress: Math.round((completed / total) * 100),
        });

        try {
          const { data, error } = await supabase.functions.invoke('generate-character-reference', {
            body: {
              characterName: character.name,
              characterDescription: character.description,
              poseType: pose,
              artStyle,
            }
          });

          if (error) {
            console.error('Generation error:', error);
            if (error.message?.includes('402')) {
              toast.error('AI credits exhausted');
              setIsGenerating(false);
              return;
            }
            if (error.message?.includes('429')) {
              toast.error('Rate limited. Please wait and try again.');
              // Wait and retry
              await new Promise(r => setTimeout(r, 5000));
              continue;
            }
            continue;
          }

          if (data?.image) {
            newResults.push({
              characterId: character.id,
              pose,
              image: data.image,
              accepted: true,
            });
          }
        } catch (err) {
          console.error('Generation failed:', err);
        }

        completed++;
        
        // Small delay between requests
        if (completed < total) {
          await new Promise(r => setTimeout(r, 1000));
        }
      }
    }

    setResults(newResults);
    setShowResults(true);
    setIsGenerating(false);
    
    if (newResults.length > 0) {
      toast.success(`Generated ${newResults.length} reference image(s)!`);
    } else {
      toast.error('No images were generated');
    }
  };

  const toggleResultAccepted = (index: number) => {
    setResults(prev => prev.map((r, i) => 
      i === index ? { ...r, accepted: !r.accepted } : r
    ));
  };

  const regenerateResult = async (index: number) => {
    const result = results[index];
    const character = characters.find(c => c.id === result.characterId);
    if (!character) return;

    setResults(prev => prev.map((r, i) => 
      i === index ? { ...r, image: '' } : r
    ));

    try {
      const { data, error } = await supabase.functions.invoke('generate-character-reference', {
        body: {
          characterName: character.name,
          characterDescription: character.description,
          poseType: result.pose,
          artStyle,
        }
      });

      if (error) throw error;

      if (data?.image) {
        setResults(prev => prev.map((r, i) => 
          i === index ? { ...r, image: data.image, accepted: true } : r
        ));
        toast.success('Regenerated!');
      }
    } catch (err) {
      console.error('Regeneration failed:', err);
      toast.error('Failed to regenerate');
    }
  };

  const confirmResults = () => {
    const acceptedByCharacter: Record<string, GeneratedResult[]> = {};
    
    results.filter(r => r.accepted && r.image).forEach(result => {
      if (!acceptedByCharacter[result.characterId]) {
        acceptedByCharacter[result.characterId] = [];
      }
      acceptedByCharacter[result.characterId].push(result);
    });

    Object.entries(acceptedByCharacter).forEach(([characterId, charResults]) => {
      const poses: CharacterPose[] = charResults.map(r => ({
        id: `pose-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        image: r.image,
        poseType: r.pose,
        tags: ['ai-generated'],
      }));
      
      onGenerated(characterId, poses);
    });

    toast.success(`Added ${results.filter(r => r.accepted).length} poses to characters`);
    setShowResults(false);
    setResults([]);
    onClose();
  };

  const selectedCount = characters.filter(c => c.selected).length;
  const totalToGenerate = selectedCount * selectedPoses.length;

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && !isGenerating && onClose()}>
      <DialogContent className="max-w-2xl max-h-[85vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="w-5 h-5 text-primary" />
            Generate AI Reference Images
          </DialogTitle>
          <DialogDescription>
            Create consistent character reference images using AI for characters without uploaded images.
          </DialogDescription>
        </DialogHeader>

        {!showResults ? (
          <div className="space-y-6">
            {/* Character selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Select Characters</Label>
              <div className="space-y-2 max-h-48 overflow-y-auto border border-border rounded-lg p-2">
                {characters.map(character => (
                  <div key={character.id} className="space-y-2 p-2 rounded bg-secondary/30">
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={character.id}
                        checked={character.selected}
                        onCheckedChange={() => toggleCharacter(character.id)}
                        disabled={isGenerating}
                      />
                      <label htmlFor={character.id} className="text-sm font-medium cursor-pointer">
                        {character.name}
                      </label>
                    </div>
                    {character.selected && (
                      <Textarea
                        value={character.description}
                        onChange={(e) => updateDescription(character.id, e.target.value)}
                        placeholder="Character description for AI generation..."
                        className="h-16 text-xs"
                        disabled={isGenerating}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Pose selection */}
            <div className="space-y-3">
              <Label className="text-sm font-medium">Poses to Generate</Label>
              <div className="flex flex-wrap gap-2">
                {POSE_OPTIONS.map(pose => (
                  <button
                    key={pose.value}
                    onClick={() => togglePose(pose.value)}
                    disabled={isGenerating}
                    className={`px-3 py-1.5 rounded-full text-sm border transition-colors ${
                      selectedPoses.includes(pose.value)
                        ? 'bg-primary text-primary-foreground border-primary'
                        : 'bg-secondary/50 text-foreground border-border hover:border-primary/50'
                    }`}
                  >
                    {pose.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Art style selection */}
            <div className="space-y-2">
              <Label className="text-sm font-medium">Art Style</Label>
              <Select value={artStyle} onValueChange={setArtStyle} disabled={isGenerating}>
                <SelectTrigger>
                  <SelectValue placeholder="Select art style..." />
                </SelectTrigger>
                <SelectContent>
                  {ART_STYLES.map(style => (
                    <SelectItem key={style.value} value={style.value}>
                      {style.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Generation preview */}
            <div className="p-3 bg-accent/20 rounded-lg border border-accent/30">
              <p className="text-sm">
                Will generate <span className="font-bold text-primary">{totalToGenerate}</span> images
                ({selectedCount} characters × {selectedPoses.length} poses)
              </p>
            </div>

            {/* Progress */}
            {isGenerating && (
              <div className="space-y-2 p-3 bg-primary/10 rounded-lg border border-primary/20">
                <div className="flex items-center gap-2">
                  <Loader2 className="w-4 h-4 animate-spin text-primary" />
                  <span className="text-sm font-medium">
                    Generating {currentProgress.character} - {currentProgress.pose}...
                  </span>
                </div>
                <div className="h-2 bg-secondary rounded-full overflow-hidden">
                  <div 
                    className="h-full bg-primary transition-all duration-300"
                    style={{ width: `${currentProgress.progress}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">{currentProgress.progress}% complete</p>
              </div>
            )}
          </div>
        ) : (
          /* Results view */
          <div className="space-y-4">
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {results.map((result, index) => {
                const character = characters.find(c => c.id === result.characterId);
                return (
                  <div 
                    key={index}
                    className={`relative rounded-lg border overflow-hidden ${
                      result.accepted ? 'border-primary/50' : 'border-border opacity-50'
                    }`}
                  >
                    {result.image ? (
                      <img 
                        src={result.image} 
                        alt={`${character?.name} ${result.pose}`}
                        className="w-full aspect-square object-cover"
                      />
                    ) : (
                      <div className="w-full aspect-square bg-secondary flex items-center justify-center">
                        <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
                      </div>
                    )}
                    
                    {/* Info overlay */}
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/80 to-transparent p-2">
                      <p className="text-xs text-white font-medium">{character?.name}</p>
                      <p className="text-xs text-white/70">{result.pose}</p>
                    </div>

                    {/* Controls */}
                    <div className="absolute top-1 right-1 flex gap-1">
                      <button
                        onClick={() => toggleResultAccepted(index)}
                        className={`w-6 h-6 rounded-full flex items-center justify-center ${
                          result.accepted 
                            ? 'bg-green-500 text-white' 
                            : 'bg-destructive text-white'
                        }`}
                      >
                        {result.accepted ? <Check className="w-3 h-3" /> : <X className="w-3 h-3" />}
                      </button>
                      <button
                        onClick={() => regenerateResult(index)}
                        className="w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center"
                        disabled={!result.image}
                      >
                        <RefreshCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            <p className="text-sm text-muted-foreground">
              {results.filter(r => r.accepted).length} of {results.length} images selected
            </p>
          </div>
        )}

        <DialogFooter className="gap-2">
          {!showResults ? (
            <>
              <Button variant="outline" onClick={onClose} disabled={isGenerating}>
                Cancel
              </Button>
              <Button 
                onClick={generateReferences} 
                disabled={isGenerating || selectedCount === 0 || selectedPoses.length === 0}
              >
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    Generate {totalToGenerate} Images
                  </>
                )}
              </Button>
            </>
          ) : (
            <>
              <Button variant="outline" onClick={() => setShowResults(false)}>
                Back
              </Button>
              <Button onClick={confirmResults} disabled={results.filter(r => r.accepted).length === 0}>
                <ImagePlus className="w-4 h-4 mr-2" />
                Add {results.filter(r => r.accepted).length} Poses
              </Button>
            </>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
