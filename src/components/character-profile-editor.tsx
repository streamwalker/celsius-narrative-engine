import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Slider } from '@/components/ui/slider';
import { 
  User, 
  Palette, 
  Shirt, 
  Sparkles, 
  Eye,
  X,
  Plus,
  Save,
  Wand2
} from 'lucide-react';
import { KeyFeatures } from '@/lib/character-consistency-model';

export interface CharacterProfileData {
  id: string;
  name: string;
  description: string;
  keyFeatures: KeyFeatures;
  consistencyWeight: number;
}

interface CharacterProfileEditorProps {
  character: {
    id: string;
    name: string;
    description: string;
  };
  existingProfile?: CharacterProfileData;
  onSave: (profile: CharacterProfileData) => void;
  trigger?: React.ReactNode;
}

const DEFAULT_KEY_FEATURES: KeyFeatures = {
  hairColor: '',
  hairStyle: '',
  eyeColor: '',
  skinTone: '',
  facialFeatures: [],
  clothing: [],
  accessories: [],
  distinctiveMarks: [],
  bodyType: '',
};

const HAIR_COLORS = ['Black', 'Brown', 'Blonde', 'Red', 'Gray', 'White', 'Blue', 'Pink', 'Green', 'Purple'];
const HAIR_STYLES = ['Short', 'Long', 'Medium', 'Curly', 'Straight', 'Wavy', 'Bald', 'Ponytail', 'Braided', 'Mohawk', 'Spiky', 'Dreadlocks'];
const EYE_COLORS = ['Brown', 'Blue', 'Green', 'Hazel', 'Gray', 'Amber', 'Red', 'Purple', 'Heterochromia'];
const SKIN_TONES = ['Very Fair', 'Fair', 'Light', 'Medium', 'Tan', 'Olive', 'Brown', 'Dark Brown', 'Deep'];
const BODY_TYPES = ['Slim', 'Athletic', 'Average', 'Muscular', 'Curvy', 'Stocky', 'Tall', 'Short', 'Petite'];
const FACIAL_FEATURES = ['Sharp jawline', 'Round face', 'High cheekbones', 'Square jaw', 'Narrow nose', 'Wide nose', 'Full lips', 'Thin lips', 'Beard', 'Mustache', 'Glasses', 'Freckles', 'Dimples'];
const ACCESSORIES_OPTIONS = ['Glasses', 'Sunglasses', 'Hat', 'Necklace', 'Earrings', 'Watch', 'Bracelet', 'Ring', 'Headband', 'Scarf', 'Tie', 'Bow tie'];

export function CharacterProfileEditor({ 
  character, 
  existingProfile, 
  onSave,
  trigger 
}: CharacterProfileEditorProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [profile, setProfile] = useState<CharacterProfileData>(
    existingProfile || {
      id: character.id,
      name: character.name,
      description: character.description,
      keyFeatures: { ...DEFAULT_KEY_FEATURES },
      consistencyWeight: 0.8,
    }
  );

  const [newClothing, setNewClothing] = useState('');
  const [newAccessory, setNewAccessory] = useState('');
  const [newMark, setNewMark] = useState('');

  const updateFeature = <K extends keyof KeyFeatures>(key: K, value: KeyFeatures[K]) => {
    setProfile(prev => ({
      ...prev,
      keyFeatures: { ...prev.keyFeatures, [key]: value },
    }));
  };

  const addToArray = (key: keyof Pick<KeyFeatures, 'clothing' | 'accessories' | 'distinctiveMarks' | 'facialFeatures'>, value: string) => {
    if (!value.trim()) return;
    const current = profile.keyFeatures[key];
    if (!current.includes(value.trim())) {
      updateFeature(key, [...current, value.trim()]);
    }
  };

  const removeFromArray = (key: keyof Pick<KeyFeatures, 'clothing' | 'accessories' | 'distinctiveMarks' | 'facialFeatures'>, value: string) => {
    updateFeature(key, profile.keyFeatures[key].filter(v => v !== value));
  };

  const handleSave = () => {
    onSave(profile);
    setIsOpen(false);
  };

  const getWeightLabel = (weight: number) => {
    if (weight >= 0.9) return 'Maximum';
    if (weight >= 0.7) return 'High';
    if (weight >= 0.5) return 'Balanced';
    if (weight >= 0.3) return 'Flexible';
    return 'Creative';
  };

  const autoExtractFromDescription = () => {
    const desc = character.description.toLowerCase();
    const newFeatures = { ...profile.keyFeatures };

    // Auto-detect hair color
    HAIR_COLORS.forEach(color => {
      if (desc.includes(color.toLowerCase()) && desc.includes('hair')) {
        newFeatures.hairColor = color;
      }
    });

    // Auto-detect hair style
    HAIR_STYLES.forEach(style => {
      if (desc.includes(style.toLowerCase())) {
        newFeatures.hairStyle = style;
      }
    });

    // Auto-detect eye color
    EYE_COLORS.forEach(color => {
      if (desc.includes(color.toLowerCase()) && desc.includes('eye')) {
        newFeatures.eyeColor = color;
      }
    });

    // Auto-detect body type
    BODY_TYPES.forEach(type => {
      if (desc.includes(type.toLowerCase())) {
        newFeatures.bodyType = type;
      }
    });

    // Auto-detect facial features
    FACIAL_FEATURES.forEach(feature => {
      if (desc.includes(feature.toLowerCase()) && !newFeatures.facialFeatures.includes(feature)) {
        newFeatures.facialFeatures.push(feature);
      }
    });

    // Auto-detect accessories
    ACCESSORIES_OPTIONS.forEach(acc => {
      if (desc.includes(acc.toLowerCase()) && !newFeatures.accessories.includes(acc)) {
        newFeatures.accessories.push(acc);
      }
    });

    setProfile(prev => ({
      ...prev,
      keyFeatures: newFeatures,
    }));
  };

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <User className="h-4 w-4" />
            Edit Profile
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <User className="h-5 w-5" />
            Character Profile: {character.name}
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="appearance" className="w-full">
          <TabsList className="w-full">
            <TabsTrigger value="appearance" className="flex-1 gap-1">
              <Eye className="h-3.5 w-3.5" />
              Appearance
            </TabsTrigger>
            <TabsTrigger value="clothing" className="flex-1 gap-1">
              <Shirt className="h-3.5 w-3.5" />
              Clothing
            </TabsTrigger>
            <TabsTrigger value="distinctive" className="flex-1 gap-1">
              <Sparkles className="h-3.5 w-3.5" />
              Distinctive
            </TabsTrigger>
            <TabsTrigger value="settings" className="flex-1 gap-1">
              <Palette className="h-3.5 w-3.5" />
              Settings
            </TabsTrigger>
          </TabsList>

          <ScrollArea className="h-[400px] mt-4 pr-4">
            <TabsContent value="appearance" className="space-y-4 mt-0">
              {/* Auto-extract button */}
              <Button 
                variant="outline" 
                size="sm" 
                onClick={autoExtractFromDescription}
                className="w-full gap-2"
              >
                <Wand2 className="h-4 w-4" />
                Auto-Extract from Description
              </Button>

              {/* Hair */}
              <div className="space-y-2">
                <Label>Hair Color</Label>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_COLORS.map(color => (
                    <Badge
                      key={color}
                      variant={profile.keyFeatures.hairColor === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFeature('hairColor', profile.keyFeatures.hairColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label>Hair Style</Label>
                <div className="flex flex-wrap gap-1.5">
                  {HAIR_STYLES.map(style => (
                    <Badge
                      key={style}
                      variant={profile.keyFeatures.hairStyle === style ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFeature('hairStyle', profile.keyFeatures.hairStyle === style ? '' : style)}
                    >
                      {style}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Eyes */}
              <div className="space-y-2">
                <Label>Eye Color</Label>
                <div className="flex flex-wrap gap-1.5">
                  {EYE_COLORS.map(color => (
                    <Badge
                      key={color}
                      variant={profile.keyFeatures.eyeColor === color ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFeature('eyeColor', profile.keyFeatures.eyeColor === color ? '' : color)}
                    >
                      {color}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Skin Tone */}
              <div className="space-y-2">
                <Label>Skin Tone</Label>
                <div className="flex flex-wrap gap-1.5">
                  {SKIN_TONES.map(tone => (
                    <Badge
                      key={tone}
                      variant={profile.keyFeatures.skinTone === tone ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFeature('skinTone', profile.keyFeatures.skinTone === tone ? '' : tone)}
                    >
                      {tone}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Body Type */}
              <div className="space-y-2">
                <Label>Body Type</Label>
                <div className="flex flex-wrap gap-1.5">
                  {BODY_TYPES.map(type => (
                    <Badge
                      key={type}
                      variant={profile.keyFeatures.bodyType === type ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => updateFeature('bodyType', profile.keyFeatures.bodyType === type ? '' : type)}
                    >
                      {type}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Facial Features */}
              <div className="space-y-2">
                <Label>Facial Features</Label>
                <div className="flex flex-wrap gap-1.5">
                  {FACIAL_FEATURES.map(feature => (
                    <Badge
                      key={feature}
                      variant={profile.keyFeatures.facialFeatures.includes(feature) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (profile.keyFeatures.facialFeatures.includes(feature)) {
                          removeFromArray('facialFeatures', feature);
                        } else {
                          addToArray('facialFeatures', feature);
                        }
                      }}
                    >
                      {feature}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="clothing" className="space-y-4 mt-0">
              {/* Current clothing items */}
              <div className="space-y-2">
                <Label>Clothing Items</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border border-border rounded-lg bg-secondary/30">
                  {profile.keyFeatures.clothing.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No clothing items added</span>
                  ) : (
                    profile.keyFeatures.clothing.map(item => (
                      <Badge key={item} variant="secondary" className="gap-1">
                        {item}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeFromArray('clothing', item)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
              </div>

              {/* Add clothing */}
              <div className="flex gap-2">
                <Input
                  value={newClothing}
                  onChange={(e) => setNewClothing(e.target.value)}
                  placeholder="Add clothing item (e.g., 'red cape', 'leather jacket')..."
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      addToArray('clothing', newClothing);
                      setNewClothing('');
                    }
                  }}
                />
                <Button 
                  size="sm" 
                  onClick={() => {
                    addToArray('clothing', newClothing);
                    setNewClothing('');
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>

              {/* Quick add common items */}
              <div className="space-y-2">
                <Label className="text-xs text-muted-foreground">Quick Add</Label>
                <div className="flex flex-wrap gap-1.5">
                  {['T-shirt', 'Jeans', 'Dress', 'Suit', 'Hoodie', 'Jacket', 'Skirt', 'Uniform', 'Armor', 'Cape'].map(item => (
                    <Badge
                      key={item}
                      variant="outline"
                      className="cursor-pointer hover:bg-secondary"
                      onClick={() => addToArray('clothing', item)}
                    >
                      + {item}
                    </Badge>
                  ))}
                </div>
              </div>
            </TabsContent>

            <TabsContent value="distinctive" className="space-y-4 mt-0">
              {/* Accessories */}
              <div className="space-y-2">
                <Label>Accessories</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border border-border rounded-lg bg-secondary/30">
                  {profile.keyFeatures.accessories.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No accessories added</span>
                  ) : (
                    profile.keyFeatures.accessories.map(item => (
                      <Badge key={item} variant="secondary" className="gap-1">
                        {item}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeFromArray('accessories', item)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {ACCESSORIES_OPTIONS.map(acc => (
                    <Badge
                      key={acc}
                      variant={profile.keyFeatures.accessories.includes(acc) ? 'default' : 'outline'}
                      className="cursor-pointer"
                      onClick={() => {
                        if (profile.keyFeatures.accessories.includes(acc)) {
                          removeFromArray('accessories', acc);
                        } else {
                          addToArray('accessories', acc);
                        }
                      }}
                    >
                      {acc}
                    </Badge>
                  ))}
                </div>
              </div>

              {/* Distinctive Marks */}
              <div className="space-y-2">
                <Label>Distinctive Marks (scars, tattoos, birthmarks, etc.)</Label>
                <div className="flex flex-wrap gap-1.5 min-h-[40px] p-2 border border-border rounded-lg bg-secondary/30">
                  {profile.keyFeatures.distinctiveMarks.length === 0 ? (
                    <span className="text-sm text-muted-foreground">No distinctive marks added</span>
                  ) : (
                    profile.keyFeatures.distinctiveMarks.map(mark => (
                      <Badge key={mark} variant="secondary" className="gap-1">
                        {mark}
                        <X 
                          className="h-3 w-3 cursor-pointer hover:text-destructive" 
                          onClick={() => removeFromArray('distinctiveMarks', mark)}
                        />
                      </Badge>
                    ))
                  )}
                </div>
                <div className="flex gap-2">
                  <Input
                    value={newMark}
                    onChange={(e) => setNewMark(e.target.value)}
                    placeholder="Add distinctive mark (e.g., 'scar across left eye')..."
                    onKeyDown={(e) => {
                      if (e.key === 'Enter') {
                        addToArray('distinctiveMarks', newMark);
                        setNewMark('');
                      }
                    }}
                  />
                  <Button 
                    size="sm" 
                    onClick={() => {
                      addToArray('distinctiveMarks', newMark);
                      setNewMark('');
                    }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="settings" className="space-y-6 mt-0">
              {/* Consistency Weight Slider */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label>Consistency Weight</Label>
                  <Badge variant="secondary">
                    {getWeightLabel(profile.consistencyWeight)} ({Math.round(profile.consistencyWeight * 100)}%)
                  </Badge>
                </div>
                <Slider
                  value={[profile.consistencyWeight]}
                  onValueChange={([value]) => setProfile(prev => ({ ...prev, consistencyWeight: value }))}
                  min={0.1}
                  max={1}
                  step={0.1}
                  className="w-full"
                />
                <div className="flex justify-between text-xs text-muted-foreground">
                  <span>Creative Freedom</span>
                  <span>Strict Reference</span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {profile.consistencyWeight >= 0.8 
                    ? 'Maximum adherence to reference images. Character will look nearly identical across all panels.'
                    : profile.consistencyWeight >= 0.5
                    ? 'Balanced approach. Key features preserved with some artistic flexibility.'
                    : 'More creative freedom. General resemblance maintained but allows for stylistic variation.'}
                </p>
              </div>

              {/* Profile Summary */}
              <div className="p-4 rounded-lg border border-border bg-secondary/30">
                <Label className="text-sm font-medium">Profile Summary</Label>
                <div className="mt-2 space-y-1 text-sm text-muted-foreground">
                  {profile.keyFeatures.hairColor && (
                    <p>Hair: {profile.keyFeatures.hairColor} {profile.keyFeatures.hairStyle}</p>
                  )}
                  {profile.keyFeatures.eyeColor && <p>Eyes: {profile.keyFeatures.eyeColor}</p>}
                  {profile.keyFeatures.skinTone && <p>Skin: {profile.keyFeatures.skinTone}</p>}
                  {profile.keyFeatures.bodyType && <p>Build: {profile.keyFeatures.bodyType}</p>}
                  {profile.keyFeatures.facialFeatures.length > 0 && (
                    <p>Features: {profile.keyFeatures.facialFeatures.join(', ')}</p>
                  )}
                  {profile.keyFeatures.clothing.length > 0 && (
                    <p>Clothing: {profile.keyFeatures.clothing.join(', ')}</p>
                  )}
                  {profile.keyFeatures.accessories.length > 0 && (
                    <p>Accessories: {profile.keyFeatures.accessories.join(', ')}</p>
                  )}
                  {profile.keyFeatures.distinctiveMarks.length > 0 && (
                    <p>Marks: {profile.keyFeatures.distinctiveMarks.join(', ')}</p>
                  )}
                </div>
              </div>
            </TabsContent>
          </ScrollArea>
        </Tabs>

        <div className="flex gap-2 mt-4">
          <Button onClick={handleSave} className="flex-1 gap-2">
            <Save className="h-4 w-4" />
            Save Profile
          </Button>
          <Button variant="outline" onClick={() => setIsOpen(false)}>
            Cancel
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
