import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { 
  Wand2, 
  ArrowRight,
  Loader2,
  Palette,
  CheckCircle,
  AlertTriangle
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  referenceImages: string[];
  poses?: { id: string; image: string; poseType: string; tags: string[] }[];
}

interface StyleTransferDialogProps {
  characters: CharacterPreset[];
  onStyleTransferred: (targetId: string, newImages: string[]) => void;
  trigger?: React.ReactNode;
}

interface StyleFeatures {
  artStyle: boolean;
  colorPalette: boolean;
  lineWeight: boolean;
  shadingStyle: boolean;
}

export function StyleTransferDialog({
  characters,
  onStyleTransferred,
  trigger,
}: StyleTransferDialogProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [sourceId, setSourceId] = useState<string | null>(null);
  const [targetId, setTargetId] = useState<string | null>(null);
  const [features, setFeatures] = useState<StyleFeatures>({
    artStyle: true,
    colorPalette: true,
    lineWeight: true,
    shadingStyle: true,
  });
  const [isTransferring, setIsTransferring] = useState(false);
  const [previewImage, setPreviewImage] = useState<string | null>(null);

  const sourceCharacter = characters.find(c => c.id === sourceId);
  const targetCharacter = characters.find(c => c.id === targetId);

  const handleTransfer = async () => {
    if (!sourceCharacter || !targetCharacter) {
      toast.error('Please select both source and target characters');
      return;
    }

    const sourceImages = sourceCharacter.poses?.map(p => p.image) || sourceCharacter.referenceImages;
    const targetImages = targetCharacter.poses?.map(p => p.image) || targetCharacter.referenceImages;

    if (sourceImages.length === 0) {
      toast.error('Source character has no reference images');
      return;
    }

    if (targetImages.length === 0) {
      toast.error('Target character has no reference images');
      return;
    }

    setIsTransferring(true);
    setPreviewImage(null);

    try {
      const { data, error } = await supabase.functions.invoke('transfer-style', {
        body: {
          sourceImages,
          targetImages,
          targetDescription: targetCharacter.description,
          features,
        },
      });

      if (error) {
        if (error.message?.includes('429')) {
          toast.error('Rate limit reached. Please try again later.');
        } else if (error.message?.includes('402')) {
          toast.error('AI credits exhausted. Please add credits.');
        } else {
          toast.error('Style transfer failed');
        }
        return;
      }

      if (data?.images && data.images.length > 0) {
        setPreviewImage(data.images[0]);
        toast.success('Style transfer complete! Review the preview.');
      }
    } catch (err) {
      console.error('Style transfer error:', err);
      toast.error('Failed to transfer style');
    } finally {
      setIsTransferring(false);
    }
  };

  const handleApply = () => {
    if (!targetId || !previewImage) return;
    onStyleTransferred(targetId, [previewImage]);
    setIsOpen(false);
    setPreviewImage(null);
    toast.success('Style applied to character');
  };

  const canTransfer = sourceId && targetId && sourceId !== targetId;

  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      <DialogTrigger asChild>
        {trigger || (
          <Button variant="outline" size="sm" className="gap-1.5">
            <Palette className="h-4 w-4" />
            Style Transfer
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Character Style Transfer
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Source and Target Selection */}
          <div className="grid grid-cols-2 gap-4">
            {/* Source Character */}
            <div className="space-y-2">
              <Label>Source (copy style from)</Label>
              <ScrollArea className="h-[150px] border rounded-lg p-2">
                <div className="space-y-1">
                  {characters.filter(c => (c.poses?.length || c.referenceImages.length) > 0).map((char) => (
                    <div
                      key={char.id}
                      onClick={() => setSourceId(char.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        sourceId === char.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {(char.poses?.[0]?.image || char.referenceImages[0]) && (
                        <img
                          src={char.poses?.[0]?.image || char.referenceImages[0]}
                          alt={char.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{char.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {char.poses?.length || char.referenceImages.length} images
                        </p>
                      </div>
                      {sourceId === char.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>

            {/* Target Character */}
            <div className="space-y-2">
              <Label>Target (apply style to)</Label>
              <ScrollArea className="h-[150px] border rounded-lg p-2">
                <div className="space-y-1">
                  {characters.filter(c => c.id !== sourceId && (c.poses?.length || c.referenceImages.length) > 0).map((char) => (
                    <div
                      key={char.id}
                      onClick={() => setTargetId(char.id)}
                      className={`flex items-center gap-2 p-2 rounded-lg cursor-pointer transition-colors ${
                        targetId === char.id
                          ? 'bg-primary/20 border border-primary'
                          : 'hover:bg-muted/50'
                      }`}
                    >
                      {(char.poses?.[0]?.image || char.referenceImages[0]) && (
                        <img
                          src={char.poses?.[0]?.image || char.referenceImages[0]}
                          alt={char.name}
                          className="w-10 h-10 rounded object-cover"
                        />
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm truncate">{char.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {char.poses?.length || char.referenceImages.length} images
                        </p>
                      </div>
                      {targetId === char.id && (
                        <CheckCircle className="h-4 w-4 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          </div>

          {/* Transfer Arrow */}
          {sourceCharacter && targetCharacter && (
            <div className="flex items-center justify-center gap-4 py-2">
              <Badge variant="outline">{sourceCharacter.name}</Badge>
              <ArrowRight className="h-5 w-5 text-muted-foreground" />
              <Badge variant="outline">{targetCharacter.name}</Badge>
            </div>
          )}

          {/* Feature Selection */}
          <div className="space-y-3">
            <Label>Features to Transfer</Label>
            <div className="grid grid-cols-2 gap-3">
              {Object.entries(features).map(([key, value]) => (
                <div
                  key={key}
                  className="flex items-center justify-between p-3 rounded-lg border"
                >
                  <Label htmlFor={key} className="text-sm capitalize cursor-pointer">
                    {key.replace(/([A-Z])/g, ' $1').trim()}
                  </Label>
                  <Switch
                    id={key}
                    checked={value}
                    onCheckedChange={(checked) =>
                      setFeatures((prev) => ({ ...prev, [key]: checked }))
                    }
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Preview */}
          {previewImage && (
            <div className="space-y-2">
              <Label>Preview</Label>
              <div className="relative rounded-lg overflow-hidden border">
                <img
                  src={previewImage}
                  alt="Style transfer preview"
                  className="w-full h-48 object-contain bg-muted"
                />
                <Badge className="absolute top-2 right-2 bg-green-500">
                  Style Applied
                </Badge>
              </div>
            </div>
          )}

          {/* Warning */}
          {sourceId === targetId && sourceId !== null && (
            <div className="flex items-center gap-2 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-lg text-sm text-yellow-600">
              <AlertTriangle className="h-4 w-4" />
              Source and target must be different characters
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancel
            </Button>
            {previewImage ? (
              <Button onClick={handleApply}>
                <CheckCircle className="h-4 w-4 mr-1" />
                Apply Style
              </Button>
            ) : (
              <Button
                onClick={handleTransfer}
                disabled={!canTransfer || isTransferring}
              >
                {isTransferring ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                    Transferring...
                  </>
                ) : (
                  <>
                    <Wand2 className="h-4 w-4 mr-1" />
                    Transfer Style
                  </>
                )}
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
