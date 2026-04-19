import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  ArrowLeft, ArrowRight, Wand2, Loader2, Save, Dices, User, CheckCircle, Sparkles,
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';
import { RACES, Race, getRaceById } from '@/lib/races';
import { CLASSES, CharacterClass, getClassById } from '@/lib/classes';
import {
  Stats, AppearanceConfig, CharacterBuild, DEFAULT_STATS, DEFAULT_APPEARANCE,
  HAIR_STYLES, SCAR_OPTIONS, TATTOO_OPTIONS, ACCESSORY_OPTIONS,
  calculateFinalStats, generateCharacterDescription,
} from '@/lib/character-builder';
import { EquippedItems, DEFAULT_EQUIPPED, generateEquipmentPrompt } from '@/lib/equipment';
import { EquipmentSelector } from '@/components/equipment-selector';
import { BackstoryGenerator } from '@/components/backstory-generator';
import { CharacterTemplateSelector } from '@/components/character-template-selector';
import { CharacterArchetypeSelector } from '@/components/character-archetype-selector';
import { CharacterTemplate } from '@/lib/character-templates';
import { CharacterArchetype } from '@/lib/character-archetypes';

const STEPS = ['race', 'class', 'appearance', 'stats', 'equipment', 'summary'] as const;
type Step = typeof STEPS[number];

const STAT_POINTS = 27;

export default function CharacterBuilder() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState<Step>('race');
  const [characterName, setCharacterName] = useState('');
  const [selectedRace, setSelectedRace] = useState<Race | null>(null);
  const [selectedClass, setSelectedClass] = useState<CharacterClass | null>(null);
  const [appearance, setAppearance] = useState<AppearanceConfig>(DEFAULT_APPEARANCE);
  const [stats, setStats] = useState<Stats>(DEFAULT_STATS);
  const [equipped, setEquipped] = useState<EquippedItems>(DEFAULT_EQUIPPED);
  const [backstory, setBackstory] = useState('');
  const [selectedArchetype, setSelectedArchetype] = useState<CharacterArchetype | undefined>();
  const [previewImage, setPreviewImage] = useState<string | null>(null);
  const [isGeneratingPreview, setIsGeneratingPreview] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const stepIndex = STEPS.indexOf(currentStep);
  const goNext = () => stepIndex < STEPS.length - 1 && setCurrentStep(STEPS[stepIndex + 1]);
  const goPrev = () => stepIndex > 0 && setCurrentStep(STEPS[stepIndex - 1]);
  const getUsedPoints = () => Object.values(stats).reduce((sum, val) => sum + Math.max(0, val - 8), 0);

  const canProceed = () => {
    switch (currentStep) {
      case 'race': return selectedRace !== null;
      case 'class': return selectedClass !== null;
      case 'stats': return getUsedPoints() <= STAT_POINTS;
      case 'summary': return characterName.trim().length > 0;
      default: return true;
    }
  };

  const randomizeStats = () => {
    const newStats: Stats = { ...DEFAULT_STATS };
    let points = STAT_POINTS;
    const statKeys = Object.keys(newStats) as (keyof Stats)[];
    while (points > 0) {
      const k = statKeys[Math.floor(Math.random() * statKeys.length)];
      if (newStats[k] < 15) { newStats[k]++; points--; }
    }
    setStats(newStats);
    toast.success('Stats randomized!');
  };

  const generatePreview = async () => {
    if (!selectedRace || !selectedClass) return;
    setIsGeneratingPreview(true);
    const description = generateCharacterDescription({
      id: '', name: characterName || 'Character', race: selectedRace,
      characterClass: selectedClass, appearance, stats,
      equipment: Object.values(equipped).filter(Boolean).map(e => e!.name), backstory,
    });
    const equipmentHints = generateEquipmentPrompt(equipped);
    const fullDescription = equipmentHints ? `${description}, ${equipmentHints}` : description;
    try {
      const { data, error } = await supabase.functions.invoke('generate-character-reference', {
        body: { characterName: characterName || 'Character', characterDescription: fullDescription, artStyle: 'western', poseTypes: ['portrait'] },
      });
      if (error) {
        if (error.message?.includes('429')) toast.error('Rate limit reached. Please try again later.');
        else if (error.message?.includes('402')) toast.error('AI credits exhausted. Please add credits.');
        else toast.error('Failed to generate preview');
        return;
      }
      if (data?.images?.[0]) { setPreviewImage(data.images[0].image); toast.success('Preview generated!'); }
    } catch (err) {
      console.error('Preview generation error:', err);
      toast.error('Failed to generate preview');
    } finally {
      setIsGeneratingPreview(false);
    }
  };

  const handleSave = async () => {
    if (!selectedRace || !selectedClass || !characterName.trim()) {
      toast.error('Please complete all required fields');
      return;
    }
    setIsSaving(true);
    const build: CharacterBuild = {
      id: `char-${Date.now()}`, name: characterName, race: selectedRace,
      characterClass: selectedClass, appearance,
      stats: calculateFinalStats(stats, selectedRace, selectedClass),
      equipment: Object.values(equipped).filter(Boolean).map(e => e!.name), backstory,
    };
    try {
      const libRaw = localStorage.getItem('celsius-character-library');
      const lib = libRaw ? JSON.parse(libRaw) : [];
      const now = new Date().toISOString();
      lib.push({
        id: build.id, name: build.name, race: selectedRace.name, classRole: selectedClass.name,
        archetype: selectedArchetype?.name, backstory, imageUrl: previewImage || undefined,
        createdAt: now, updatedAt: now, description: generateCharacterDescription(build),
      });
      localStorage.setItem('celsius-character-library', JSON.stringify(lib));
      toast.success('Character saved to library!');
      navigate('/characters');
    } catch (err) {
      console.error('Save error:', err);
      toast.error('Failed to save character');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <nav className="sticky top-0 z-50 bg-background/80 backdrop-blur-md border-b border-border">
        <div className="container flex items-center justify-between h-16">
          <div className="flex items-center gap-4">
            <Button variant="ghost" size="sm" onClick={() => navigate('/characters')}>
              <ArrowLeft className="w-4 h-4 mr-2" />Back
            </Button>
            <h1 className="font-display text-xl text-foreground flex items-center gap-2">
              <Wand2 className="w-5 h-5 text-primary" />Character Builder
            </h1>
          </div>
          <div className="flex items-center gap-2">
            {STEPS.map((step, idx) => (
              <React.Fragment key={step}>
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-medium transition-colors ${
                  idx < stepIndex ? 'bg-primary text-primary-foreground'
                    : idx === stepIndex ? 'bg-primary/20 text-primary border-2 border-primary'
                    : 'bg-muted text-muted-foreground'
                }`}>
                  {idx < stepIndex ? <CheckCircle className="w-4 h-4" /> : idx + 1}
                </div>
                {idx < STEPS.length - 1 && <div className={`w-8 h-0.5 ${idx < stepIndex ? 'bg-primary' : 'bg-muted'}`} />}
              </React.Fragment>
            ))}
          </div>
        </div>
      </nav>

      <main className="container py-8 max-w-5xl">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2">
            {currentStep === 'race' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between flex-wrap gap-2">
                  <div>
                    <h2 className="text-2xl font-display text-foreground mb-2">Choose Your Race</h2>
                    <p className="text-muted-foreground">Select a race that defines your character&apos;s heritage and innate abilities.</p>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    <CharacterTemplateSelector
                      onSelect={(template: CharacterTemplate) => {
                        const race = getRaceById(template.raceId);
                        const charClass = getClassById(template.classId);
                        if (race) setSelectedRace(race);
                        if (charClass) setSelectedClass(charClass);
                        if (template.suggestedStats) setStats(prev => ({ ...prev, ...template.suggestedStats }));
                        if (template.suggestedAppearance) {
                          setAppearance(prev => ({
                            ...prev, ...template.suggestedAppearance,
                            face: { ...prev.face, ...(template.suggestedAppearance.face || {}) },
                            body: { ...prev.body, ...(template.suggestedAppearance.body || {}) },
                            hair: { ...prev.hair, ...(template.suggestedAppearance.hair || {}) },
                            distinguishing: { ...prev.distinguishing, ...(template.suggestedAppearance.distinguishing || {}) },
                          }));
                        }
                        toast.success(`Applied "${template.name}" template`);
                      }}
                      trigger={<Button variant="outline" className="gap-2"><Sparkles className="w-4 h-4" />Use Template</Button>}
                    />
                    <CharacterArchetypeSelector
                      selectedArchetype={selectedArchetype}
                      onSelectArchetype={setSelectedArchetype}
                      raceId={selectedRace?.id} classId={selectedClass?.id}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {RACES.map((race) => (
                    <Card key={race.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${selectedRace?.id === race.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setSelectedRace(race)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          {race.name}
                          {selectedRace?.id === race.id && <CheckCircle className="w-5 h-5 text-primary" />}
                        </CardTitle>
                        <CardDescription>{race.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <div className="flex flex-wrap gap-1">
                          {race.traits.map((trait) => <Badge key={trait} variant="secondary" className="text-xs">{trait}</Badge>)}
                        </div>
                        <div className="mt-3 text-xs text-muted-foreground">
                          <strong>Stat Bonuses:</strong>{' '}
                          {Object.entries(race.statBonuses).map(([s, b]) => `${s.charAt(0).toUpperCase() + s.slice(1)} +${b}`).join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'class' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display text-foreground mb-2">Choose Your Class</h2>
                  <p className="text-muted-foreground">Select a class that determines your combat style and abilities.</p>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {CLASSES.map((cls) => (
                    <Card key={cls.id}
                      className={`cursor-pointer transition-all hover:border-primary/50 ${selectedClass?.id === cls.id ? 'border-primary bg-primary/5' : ''}`}
                      onClick={() => setSelectedClass(cls)}>
                      <CardHeader className="pb-2">
                        <CardTitle className="flex items-center justify-between">
                          {cls.name}
                          {selectedClass?.id === cls.id && <CheckCircle className="w-5 h-5 text-primary" />}
                        </CardTitle>
                        <CardDescription>{cls.description}</CardDescription>
                      </CardHeader>
                      <CardContent>
                        <Badge variant="outline" className="mb-2 capitalize">{cls.role}</Badge>
                        <div className="text-xs text-muted-foreground">
                          <strong>Starting Equipment:</strong> {cls.startingEquipment.join(', ')}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            )}

            {currentStep === 'appearance' && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display text-foreground mb-2">Customize Appearance</h2>
                  <p className="text-muted-foreground">Fine-tune your character&apos;s physical features.</p>
                </div>
                <Tabs defaultValue="body" className="w-full">
                  <TabsList className="w-full">
                    <TabsTrigger value="body" className="flex-1">Body</TabsTrigger>
                    <TabsTrigger value="face" className="flex-1">Face</TabsTrigger>
                    <TabsTrigger value="hair" className="flex-1">Hair</TabsTrigger>
                    <TabsTrigger value="extras" className="flex-1">Extras</TabsTrigger>
                  </TabsList>
                  <TabsContent value="body" className="space-y-4 mt-4">
                    {(['height', 'build'] as const).map((key) => (
                      <div key={key}>
                        <Label className="capitalize">{key}</Label>
                        <Slider value={[appearance.body[key]]}
                          onValueChange={([v]) => setAppearance(prev => ({ ...prev, body: { ...prev.body, [key]: v } }))}
                          max={100} step={1} className="mt-2" />
                      </div>
                    ))}
                    <div>
                      <Label>Skin Tone</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {selectedRace?.appearanceModifiers.skinTones.map((tone) => (
                          <Badge key={tone} variant={appearance.body.skinTone === tone ? 'default' : 'outline'}
                            className="cursor-pointer"
                            onClick={() => setAppearance(prev => ({ ...prev, body: { ...prev.body, skinTone: tone } }))}>
                            {tone}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  </TabsContent>
                  <TabsContent value="face" className="space-y-4 mt-4">
                    {(['shape', 'eyeSize', 'noseWidth', 'lipFullness'] as const).map((key) => (
                      <div key={key}>
                        <Label className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</Label>
                        <Slider value={[appearance.face[key]]}
                          onValueChange={([v]) => setAppearance(prev => ({ ...prev, face: { ...prev.face, [key]: v } }))}
                          max={100} step={1} className="mt-2" />
                      </div>
                    ))}
                  </TabsContent>
                  <TabsContent value="hair" className="space-y-4 mt-4">
                    <div>
                      <Label>Hair Style</Label>
                      <div className="flex flex-wrap gap-2 mt-2">
                        {HAIR_STYLES.map((style) => (
                          <Badge key={style} variant={appearance.hair.style === style ? 'default' : 'outline'}
                            className="cursor-pointer capitalize"
                            onClick={() => setAppearance(prev => ({ ...prev, hair: { ...prev.hair, style } }))}>
                            {style}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    <div>
                      <Label>Hair Color</Label>
                      <Input type="color" value={appearance.hair.color}
                        onChange={(e) => setAppearance(prev => ({ ...prev, hair: { ...prev.hair, color: e.target.value } }))}
                        className="w-20 h-10 mt-2" />
                    </div>
                  </TabsContent>
                  <TabsContent value="extras" className="space-y-4 mt-4">
                    {([['scars', 'Scars', SCAR_OPTIONS], ['tattoos', 'Tattoos', TATTOO_OPTIONS], ['accessories', 'Accessories', ACCESSORY_OPTIONS]] as const).map(([key, label, options]) => (
                      <div key={key}>
                        <Label>{label}</Label>
                        <div className="flex flex-wrap gap-2 mt-2">
                          {options.map((opt) => (
                            <Badge key={opt} variant={appearance.distinguishing[key].includes(opt) ? 'default' : 'outline'}
                              className="cursor-pointer"
                              onClick={() => {
                                const cur = appearance.distinguishing[key];
                                const next = cur.includes(opt) ? cur.filter(s => s !== opt) : [...cur, opt];
                                setAppearance(prev => ({ ...prev, distinguishing: { ...prev.distinguishing, [key]: next } }));
                              }}>
                              {opt}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    ))}
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {currentStep === 'stats' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-display text-foreground mb-2">Allocate Stats</h2>
                    <p className="text-muted-foreground">
                      Points remaining: <span className={getUsedPoints() > STAT_POINTS ? 'text-destructive' : 'text-primary'}>{STAT_POINTS - getUsedPoints()}</span>
                    </p>
                  </div>
                  <Button variant="outline" size="sm" onClick={randomizeStats}>
                    <Dices className="w-4 h-4 mr-1" />Randomize
                  </Button>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  {(Object.entries(stats) as [keyof Stats, number][]).map(([stat, value]) => {
                    const raceBonus = selectedRace?.statBonuses[stat] || 0;
                    return (
                      <Card key={stat}>
                        <CardContent className="pt-4">
                          <div className="flex items-center justify-between mb-2">
                            <Label className="capitalize font-medium">{stat}</Label>
                            <div className="text-right">
                              <span className="text-lg font-bold">{value + raceBonus}</span>
                              {raceBonus > 0 && <span className="text-xs text-primary ml-1">(+{raceBonus})</span>}
                            </div>
                          </div>
                          <Slider value={[value]} onValueChange={([v]) => setStats(prev => ({ ...prev, [stat]: v }))} min={8} max={15} step={1} />
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              </div>
            )}

            {currentStep === 'equipment' && selectedClass && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display text-foreground mb-2">Choose Equipment</h2>
                  <p className="text-muted-foreground">Select weapons, armor, and accessories for your character.</p>
                </div>
                <EquipmentSelector classId={selectedClass.id} equipped={equipped} onEquipmentChange={setEquipped} />
              </div>
            )}

            {currentStep === 'summary' && selectedRace && selectedClass && (
              <div className="space-y-6">
                <div>
                  <h2 className="text-2xl font-display text-foreground mb-2">Finalize Character</h2>
                  <p className="text-muted-foreground">Review your character and add finishing touches.</p>
                </div>
                <div className="space-y-4">
                  <div>
                    <Label>Character Name *</Label>
                    <Input value={characterName} onChange={(e) => setCharacterName(e.target.value)} placeholder="Enter character name..." className="mt-1" />
                  </div>
                  <BackstoryGenerator characterName={characterName} race={selectedRace}
                    characterClass={selectedClass} appearance={appearance}
                    backstory={backstory} onBackstoryChange={setBackstory} />
                  <Card>
                    <CardHeader><CardTitle>Character Summary</CardTitle></CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div><strong>Race:</strong> {selectedRace.name}</div>
                      <div><strong>Class:</strong> {selectedClass.name}</div>
                      {selectedArchetype && <div><strong>Archetype:</strong> {selectedArchetype.name}</div>}
                      <div><strong>Equipment:</strong> {Object.values(equipped).filter(Boolean).map(e => e!.name).join(', ') || 'None selected'}</div>
                      <div className="pt-2">
                        <strong>Stats:</strong>
                        <div className="grid grid-cols-3 gap-2 mt-1">
                          {(Object.entries(calculateFinalStats(stats, selectedRace, selectedClass)) as [string, number][]).map(([stat, value]) => (
                            <Badge key={stat} variant="outline" className="justify-between">
                              <span className="capitalize">{stat.slice(0, 3)}</span><span>{value}</span>
                            </Badge>
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-8 pt-4 border-t border-border">
              <Button variant="outline" onClick={goPrev} disabled={stepIndex === 0}>
                <ArrowLeft className="w-4 h-4 mr-1" />Previous
              </Button>
              {currentStep === 'summary' ? (
                <Button onClick={handleSave} disabled={!canProceed() || isSaving}>
                  {isSaving ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Saving...</> : <><Save className="w-4 h-4 mr-1" />Save Character</>}
                </Button>
              ) : (
                <Button onClick={goNext} disabled={!canProceed()}>Next<ArrowRight className="w-4 h-4 ml-1" /></Button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><User className="w-4 h-4" />Character Preview</CardTitle>
              </CardHeader>
              <CardContent>
                {previewImage ? (
                  <img src={previewImage} alt="Character preview" className="w-full aspect-square object-cover rounded-lg border" />
                ) : (
                  <div className="w-full aspect-square rounded-lg border bg-muted flex items-center justify-center">
                    <div className="text-center text-muted-foreground">
                      <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                      <p className="text-xs">No preview yet</p>
                    </div>
                  </div>
                )}
                <Button onClick={generatePreview} disabled={!selectedRace || !selectedClass || isGeneratingPreview} className="w-full mt-4" variant="outline">
                  {isGeneratingPreview ? <><Loader2 className="w-4 h-4 mr-1 animate-spin" />Generating...</> : <><Wand2 className="w-4 h-4 mr-1" />Generate Preview</>}
                </Button>
                {(selectedRace || selectedClass) && (
                  <div className="mt-4 pt-4 border-t border-border space-y-2 text-xs">
                    {selectedRace && <Badge variant="outline">{selectedRace.name}</Badge>}
                    {selectedClass && <Badge variant="outline">{selectedClass.name}</Badge>}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
