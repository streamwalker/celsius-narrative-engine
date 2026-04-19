import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Slider } from '@/components/ui/slider';
import { Label } from '@/components/ui/label';
import { 
  Wand2, 
  Loader2, 
  CheckCircle, 
  AlertTriangle,
  Eye,
  Shirt,
  Sparkles,
  Edit2,
  X
} from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from 'sonner';
import { KeyFeatures } from '@/lib/character-consistency-model';
import { CharacterProfileData } from './character-profile-editor';

interface ProfileWizardProps {
  character: {
    id: string;
    name: string;
    description: string;
  };
  referenceImages: string[];
  onComplete: (profile: CharacterProfileData) => void;
  trigger?: React.ReactNode;
}

export function ProfileWizard({ character, referenceImages, onComplete, trigger }: ProfileWizardProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisResult, setAnalysisResult] = useState<{
    keyFeatures: KeyFeatures;
    suggestedDescription: string;
    confidence: number;
  } | null>(null);
  const [editedFeatures, setEditedFeatures] = useState<KeyFeatures | null>(null);
  const [consistencyWeight, setConsistencyWeight] = useState(0.8);
  const [step, setStep] = useState<'analyze' | 'review' | 'configure'>('analyze');

  const runAnalysis = async () => {
    if (referenceImages.length === 0) {
      toast.error('No reference images available for analysis');
      return;
    }

    setIsAnalyzing(true);
    setAnalysisResult(null);

    try {
      const { data, error } = await supabase.functions.invoke('analyze-profile', {
        body: {
          images: referenceImages,
          characterName: character.name,
          existingDescription: character.description,
        },
      });

      if (error) {
        console.error('Profile analysis error:', error);
        if (error.message?.includes('429')) {
          toast.error('Rate limit reached. Please wait and try again.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits to continue.');
        } else {
          toast.error('Failed to analyze profile');
        }
        return;
      }

      setAnalysisResult(data);
      setEditedFeatures(data.keyFeatures);
      setStep('review');
      toast.success(`Profile analyzed with ${data.confidence}% confidence`);
    } catch (err) {
      console.error('Error analyzing profile:', err);
      toast.error('Failed to analyze character profile');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const updateFeature = <K extends keyof KeyFeatures>(key: K, value: KeyFeatures[K]) => {
    if (!editedFeatures) return;
    setEditedFeatures({ ...editedFeatures, [key]: value });
  };

  const removeFromArray = (key: keyof Pick<KeyFeatures, 'facialFeatures' | 'clothing' | 'accessories' | 'distinctiveMarks'>, value: string) => {
    if (!editedFeatures) return;
    updateFeature(key, editedFeatures[key].filter(v => v !== value));
  };

  const handleComplete = () => {
    if (!editedFeatures) return;

    const profile: CharacterProfileData = {
      id: character.id,
      name: character.name,
      description: analysisResult?.suggestedDescription || character.description,
      keyFeatures: editedFeatures,
      consistencyWeight,
    };

    onComplete(profile);
    setIsOpen(false);
    setStep('analyze');
    setAnalysisResult(null);
    setEditedFeatures(null);
    toast.success('Character profile created successfully!');
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-500';
    if (confidence >= 60) return 'text-yellow-500';
    return 'text-orange-500';
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.9) return 'Maximum';
    if (weight >= 0.7) return 'High';
    if (weight >= 0.5) return 'Balanced';
    return 'Creative';
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Wand2 className="h-4 w-4" />
            AI Profile Wizard
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            AI Character Profile Wizard - {character.name}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Progress Steps */}
          <div className="flex items-center justify-between text-sm">
            <div className={`flex items-center gap-2 ${step === 'analyze' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'analyze' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>1</div>
              Analyze
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className={`flex items-center gap-2 ${step === 'review' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'review' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>2</div>
              Review
            </div>
            <div className="flex-1 h-px bg-border mx-2" />
            <div className={`flex items-center gap-2 ${step === 'configure' ? 'text-primary' : 'text-muted-foreground'}`}>
              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${step === 'configure' ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}>3</div>
              Configure
            </div>
          </div>

          {/* Step 1: Analyze */}
          {step === 'analyze' && (
            <div className="text-center py-8 space-y-4">
              {referenceImages.length > 0 ? (
                <>
                  <div className="flex justify-center gap-2 mb-4">
                    {referenceImages.slice(0, 4).map((img, i) => (
                      <img 
                        key={i} 
                        src={img} 
                        alt={`Reference ${i + 1}`}
                        className="w-20 h-20 object-cover rounded-lg border border-border"
                      />
                    ))}
                    {referenceImages.length > 4 && (
                      <div className="w-20 h-20 rounded-lg bg-secondary flex items-center justify-center text-sm text-muted-foreground">
                        +{referenceImages.length - 4} more
                      </div>
                    )}
                  </div>
                  
                  {isAnalyzing ? (
                    <div className="space-y-4">
                      <Loader2 className="h-12 w-12 animate-spin mx-auto text-primary" />
                      <p className="text-muted-foreground">
                        Analyzing {referenceImages.length} reference image{referenceImages.length !== 1 ? 's' : ''}...
                      </p>
                      <p className="text-xs text-muted-foreground">
                        Extracting hair, facial features, clothing, and accessories
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      <p className="text-muted-foreground">
                        AI will analyze your reference images and extract key visual features
                      </p>
                      <Button onClick={runAnalysis} className="gap-2">
                        <Wand2 className="h-4 w-4" />
                        Start Analysis
                      </Button>
                    </div>
                  )}
                </>
              ) : (
                <div className="space-y-4">
                  <AlertTriangle className="h-12 w-12 mx-auto text-yellow-500" />
                  <p className="text-muted-foreground">
                    No reference images available for this character.
                  </p>
                  <p className="text-sm text-muted-foreground">
                    Add reference images first, then run the profile wizard.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* Step 2: Review Features */}
          {step === 'review' && editedFeatures && (
            <ScrollArea className="h-[400px] pr-4">
              <div className="space-y-4">
                {/* Confidence */}
                {analysisResult && (
                  <div className="flex items-center justify-between p-3 bg-secondary/50 rounded-lg">
                    <span className="text-sm">Analysis Confidence</span>
                    <Badge className={getConfidenceColor(analysisResult.confidence)}>
                      {analysisResult.confidence}%
                    </Badge>
                  </div>
                )}

                {/* Appearance */}
                <div className="space-y-3">
                  <div className="flex items-center gap-2">
                    <Eye className="h-4 w-4 text-primary" />
                    <Label className="font-medium">Appearance</Label>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Hair Color</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{editedFeatures.hairColor || 'Not detected'}</Badge>
                        {editedFeatures.hairColor && (
                          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                             onClick={() => updateFeature('hairColor', '')} />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Hair Style</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{editedFeatures.hairStyle || 'Not detected'}</Badge>
                        {editedFeatures.hairStyle && (
                          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                             onClick={() => updateFeature('hairStyle', '')} />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Eye Color</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{editedFeatures.eyeColor || 'Not detected'}</Badge>
                        {editedFeatures.eyeColor && (
                          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                             onClick={() => updateFeature('eyeColor', '')} />
                        )}
                      </div>
                    </div>
                    <div className="space-y-1">
                      <Label className="text-xs text-muted-foreground">Skin Tone</Label>
                      <div className="flex items-center gap-2">
                        <Badge variant="secondary">{editedFeatures.skinTone || 'Not detected'}</Badge>
                        {editedFeatures.skinTone && (
                          <X className="h-3 w-3 cursor-pointer text-muted-foreground hover:text-destructive" 
                             onClick={() => updateFeature('skinTone', '')} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Facial Features */}
                {editedFeatures.facialFeatures.length > 0 && (
                  <div className="space-y-2">
                    <Label className="text-xs text-muted-foreground">Facial Features</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {editedFeatures.facialFeatures.map((feature, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          {feature}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                             onClick={() => removeFromArray('facialFeatures', feature)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Clothing */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Shirt className="h-4 w-4 text-accent" />
                    <Label className="font-medium">Clothing</Label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editedFeatures.clothing.length > 0 ? (
                      editedFeatures.clothing.map((item, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          {item}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                             onClick={() => removeFromArray('clothing', item)} />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No clothing detected</span>
                    )}
                  </div>
                </div>

                {/* Accessories */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Sparkles className="h-4 w-4 text-purple-500" />
                    <Label className="font-medium">Accessories</Label>
                  </div>
                  <div className="flex flex-wrap gap-1.5">
                    {editedFeatures.accessories.length > 0 ? (
                      editedFeatures.accessories.map((item, i) => (
                        <Badge key={i} variant="outline" className="gap-1">
                          {item}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                             onClick={() => removeFromArray('accessories', item)} />
                        </Badge>
                      ))
                    ) : (
                      <span className="text-sm text-muted-foreground">No accessories detected</span>
                    )}
                  </div>
                </div>

                {/* Distinctive Marks */}
                {editedFeatures.distinctiveMarks.length > 0 && (
                  <div className="space-y-2">
                    <Label className="font-medium">Distinctive Marks</Label>
                    <div className="flex flex-wrap gap-1.5">
                      {editedFeatures.distinctiveMarks.map((mark, i) => (
                        <Badge key={i} variant="outline" className="gap-1 border-orange-500/50 text-orange-500">
                          {mark}
                          <X className="h-3 w-3 cursor-pointer hover:text-destructive" 
                             onClick={() => removeFromArray('distinctiveMarks', mark)} />
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Body Type */}
                {editedFeatures.bodyType && (
                  <div className="space-y-1">
                    <Label className="text-xs text-muted-foreground">Body Type</Label>
                    <Badge variant="secondary">{editedFeatures.bodyType}</Badge>
                  </div>
                )}

                {/* Suggested Description */}
                {analysisResult?.suggestedDescription && (
                  <div className="p-3 bg-secondary/50 rounded-lg space-y-1">
                    <Label className="text-xs text-muted-foreground">AI-Generated Description</Label>
                    <p className="text-sm">{analysisResult.suggestedDescription}</p>
                  </div>
                )}
              </div>
            </ScrollArea>
          )}

          {/* Step 3: Configure */}
          {step === 'configure' && (
            <div className="space-y-6 py-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Consistency Weight</Label>
                  <Badge variant="secondary">
                    {getWeightLabel(consistencyWeight)} ({Math.round(consistencyWeight * 100)}%)
                  </Badge>
                </div>
                <Slider
                  value={[consistencyWeight]}
                  onValueChange={([value]) => setConsistencyWeight(value)}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Creative Freedom</span>
                  <span>Strict Reference</span>
                </div>
                <p className="text-sm text-muted-foreground">
                  {consistencyWeight >= 0.8 
                    ? 'Character will look nearly identical across all panels. Best for main characters.'
                    : consistencyWeight >= 0.5
                    ? 'Key features preserved with artistic flexibility. Good for supporting characters.'
                    : 'More creative freedom for stylistic variation. Best for background characters.'}
                </p>
              </div>

              {/* Summary */}
              {editedFeatures && (
                <div className="p-4 border border-border rounded-lg bg-card space-y-2">
                  <Label className="font-medium">Profile Summary</Label>
                  <div className="text-sm text-muted-foreground space-y-1">
                    {editedFeatures.hairColor && <p>Hair: {editedFeatures.hairColor} {editedFeatures.hairStyle}</p>}
                    {editedFeatures.eyeColor && <p>Eyes: {editedFeatures.eyeColor}</p>}
                    {editedFeatures.clothing.length > 0 && <p>Clothing: {editedFeatures.clothing.join(', ')}</p>}
                    {editedFeatures.accessories.length > 0 && <p>Accessories: {editedFeatures.accessories.join(', ')}</p>}
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex gap-2">
            {step !== 'analyze' && (
              <Button 
                variant="outline" 
                onClick={() => setStep(step === 'configure' ? 'review' : 'analyze')}
              >
                Back
              </Button>
            )}
            <div className="flex-1" />
            {step === 'review' && (
              <Button onClick={() => setStep('configure')} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Looks Good
              </Button>
            )}
            {step === 'configure' && (
              <Button onClick={handleComplete} className="gap-2">
                <CheckCircle className="h-4 w-4" />
                Create Profile
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
