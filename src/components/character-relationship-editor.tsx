import React, { useState } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Textarea } from '@/components/ui/textarea';
import { Switch } from '@/components/ui/switch';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { 
  Link2, 
  Unlink,
  Save
} from 'lucide-react';
import { 
  RelationshipType,
  CharacterRelationship,
  addRelationship,
  updateRelationship,
  deleteRelationship,
  getRelationshipBetween,
  RELATIONSHIP_LABELS,
  RELATIONSHIP_ICONS,
  RELATIONSHIP_COLORS
} from '@/lib/character-relationships';
import { toast } from 'sonner';

interface Character {
  id: string;
  name: string;
}

interface CharacterRelationshipEditorProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  sourceCharacter: Character;
  targetCharacter: Character;
  onUpdate?: () => void;
}

export function CharacterRelationshipEditor({
  open,
  onOpenChange,
  sourceCharacter,
  targetCharacter,
  onUpdate,
}: CharacterRelationshipEditorProps) {
  const existingRelationship = getRelationshipBetween(sourceCharacter.id, targetCharacter.id);
  
  const [type, setType] = useState<RelationshipType>(existingRelationship?.type || 'neutral');
  const [description, setDescription] = useState(existingRelationship?.description || '');
  const [strength, setStrength] = useState(existingRelationship?.strength || 5);
  const [bidirectional, setBidirectional] = useState(existingRelationship?.bidirectional ?? true);

  const handleSave = () => {
    if (existingRelationship) {
      updateRelationship(existingRelationship.id, {
        type,
        description: description || undefined,
        strength,
        bidirectional,
      });
      toast.success('Relationship updated');
    } else {
      addRelationship(
        sourceCharacter.id,
        targetCharacter.id,
        type,
        description || undefined,
        strength,
        bidirectional
      );
      toast.success('Relationship created');
    }
    onUpdate?.();
    onOpenChange(false);
  };

  const handleDelete = () => {
    if (existingRelationship) {
      deleteRelationship(existingRelationship.id);
      toast.success('Relationship removed');
      onUpdate?.();
      onOpenChange(false);
    }
  };

  const relationshipTypes = Object.entries(RELATIONSHIP_LABELS) as [RelationshipType, string][];

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Link2 className="w-5 h-5 text-primary" />
            {existingRelationship ? 'Edit' : 'Create'} Relationship
          </DialogTitle>
          <DialogDescription>
            Define the relationship between {sourceCharacter.name} and {targetCharacter.name}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6 py-4">
          {/* Characters Preview */}
          <div className="flex items-center justify-center gap-4 p-4 bg-muted/50 rounded-lg">
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
                {sourceCharacter.name.charAt(0)}
              </div>
              <p className="text-xs mt-1 truncate max-w-[80px]">{sourceCharacter.name}</p>
            </div>
            <div className="flex flex-col items-center">
              <span className="text-2xl">{RELATIONSHIP_ICONS[type]}</span>
              <div 
                className="w-16 h-0.5 mt-1" 
                style={{ backgroundColor: RELATIONSHIP_COLORS[type] }}
              />
            </div>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center text-lg font-medium">
                {targetCharacter.name.charAt(0)}
              </div>
              <p className="text-xs mt-1 truncate max-w-[80px]">{targetCharacter.name}</p>
            </div>
          </div>

          {/* Relationship Type */}
          <div className="space-y-2">
            <Label>Relationship Type</Label>
            <Select value={type} onValueChange={(v) => setType(v as RelationshipType)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {relationshipTypes.map(([key, label]) => (
                  <SelectItem key={key} value={key}>
                    <span className="flex items-center gap-2">
                      <span>{RELATIONSHIP_ICONS[key]}</span>
                      {label}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Strength */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label>Relationship Strength</Label>
              <Badge variant="secondary">{strength}/10</Badge>
            </div>
            <Slider
              value={[strength]}
              onValueChange={([v]) => setStrength(v)}
              min={1}
              max={10}
              step={1}
            />
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Weak</span>
              <span>Strong</span>
            </div>
          </div>

          {/* Bidirectional */}
          <div className="flex items-center justify-between">
            <div>
              <Label>Bidirectional</Label>
              <p className="text-xs text-muted-foreground">Both characters share this relationship</p>
            </div>
            <Switch checked={bidirectional} onCheckedChange={setBidirectional} />
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>Description (optional)</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g., Childhood friends who grew up together..."
              className="min-h-[80px]"
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center gap-2">
          {existingRelationship && (
            <Button variant="destructive" size="sm" onClick={handleDelete} className="gap-1">
              <Unlink className="w-4 h-4" />
              Remove
            </Button>
          )}
          <div className="flex-1" />
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave} className="gap-1">
            <Save className="w-4 h-4" />
            Save
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
