import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Separator } from '@/components/ui/separator';
import { 
  Edit2, 
  Trash2, 
  Download, 
  ImagePlus,
  User,
  Scroll,
  Sparkles,
} from 'lucide-react';
import { CharacterAnimationPreview } from './character-animation-preview';
import { ProfileStatusBadge } from './profile-status-badge';
import { CharacterProfileData } from './character-profile-editor';

interface CharacterPose {
  id: string;
  image: string;
  poseType: string;
  tags?: string[];
}

interface CharacterPreset {
  id: string;
  name: string;
  description: string;
  poses?: CharacterPose[];
  profile?: CharacterProfileData;
}

interface CharacterDetailModalProps {
  character: CharacterPreset | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit?: (id: string) => void;
  onDelete?: (id: string) => void;
  onGeneratePose?: (id: string) => void;
  onExport?: (id: string) => void;
}

export function CharacterDetailModal({
  character,
  isOpen,
  onClose,
  onEdit,
  onDelete,
  onGeneratePose,
  onExport,
}: CharacterDetailModalProps) {
  if (!character) return null;

  const poses = character.poses || [];
  const profile = character.profile;

  const animationPoses = poses.map(p => ({
    id: p.id,
    image: p.image,
    label: p.poseType.charAt(0).toUpperCase() + p.poseType.slice(1),
  }));

  return (
    <Dialog open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <DialogContent className="max-w-4xl max-h-[90vh] flex flex-col">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <DialogTitle className="text-2xl">{character.name}</DialogTitle>
            <ProfileStatusBadge profile={profile} />
          </div>
        </DialogHeader>

        <ScrollArea className="flex-1 -mx-6 px-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Left Column - Poses */}
            <div className="space-y-4">
              <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Pose Gallery ({poses.length})
              </h3>

              {poses.length > 1 ? (
                <CharacterAnimationPreview poses={animationPoses} />
              ) : poses.length === 1 ? (
                <div className="aspect-square rounded-lg overflow-hidden border border-border">
                  <img
                    src={poses[0].image}
                    alt={character.name}
                    className="w-full h-full object-cover"
                  />
                </div>
              ) : (
                <div className="aspect-square rounded-lg border border-dashed border-border flex items-center justify-center bg-muted/50">
                  <div className="text-center text-muted-foreground">
                    <User className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No poses yet</p>
                    {onGeneratePose && (
                      <Button 
                        variant="outline" 
                        size="sm" 
                        className="mt-2"
                        onClick={() => onGeneratePose(character.id)}
                      >
                        <ImagePlus className="w-4 h-4 mr-1" />
                        Generate Poses
                      </Button>
                    )}
                  </div>
                </div>
              )}

              {/* Pose Thumbnails */}
              {poses.length > 1 && (
                <div className="grid grid-cols-4 gap-2">
                  {poses.map((pose) => (
                    <div 
                      key={pose.id}
                      className="aspect-square rounded-lg overflow-hidden border border-border"
                    >
                      <img
                        src={pose.image}
                        alt={pose.poseType}
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Right Column - Details */}
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-sm font-medium text-muted-foreground flex items-center gap-2 mb-2">
                  <Scroll className="w-4 h-4" />
                  Description
                </h3>
                <p className="text-sm leading-relaxed">{character.description}</p>
              </div>

              <Separator />

              {/* Profile Details */}
              {profile && (
                <>
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground mb-3">
                      Key Features
                    </h3>
                    <div className="space-y-3">
                      {profile.keyFeatures?.hairStyle && (
                        <div>
                          <span className="text-xs text-muted-foreground">Hair</span>
                          <p className="text-sm">{profile.keyFeatures.hairStyle} • {profile.keyFeatures.hairColor}</p>
                        </div>
                      )}
                      {profile.keyFeatures?.eyeColor && (
                        <div>
                          <span className="text-xs text-muted-foreground">Eyes</span>
                          <p className="text-sm">{profile.keyFeatures.eyeColor}</p>
                        </div>
                      )}
                      {profile.keyFeatures?.clothing && (
                        <div>
                          <span className="text-xs text-muted-foreground">Clothing</span>
                          <p className="text-sm">{profile.keyFeatures.clothing}</p>
                        </div>
                      )}
                      {profile.keyFeatures?.accessories && profile.keyFeatures.accessories.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">Accessories</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.keyFeatures.accessories.map((acc, i) => (
                              <Badge key={i} variant="secondary" className="text-xs">
                                {acc}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                      {profile.keyFeatures?.distinctiveMarks && profile.keyFeatures.distinctiveMarks.length > 0 && (
                        <div>
                          <span className="text-xs text-muted-foreground">Distinctive Marks</span>
                          <div className="flex flex-wrap gap-1 mt-1">
                            {profile.keyFeatures.distinctiveMarks.map((mark, i) => (
                              <Badge key={i} variant="outline" className="text-xs">
                                {mark}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {profile.consistencyWeight !== undefined && (
                    <>
                      <Separator />
                      <div>
                        <h3 className="text-sm font-medium text-muted-foreground mb-2">
                          Consistency Settings
                        </h3>
                        <div className="flex items-center gap-2">
                          <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                            <div 
                              className="h-full bg-primary transition-all"
                              style={{ width: `${profile.consistencyWeight * 100}%` }}
                            />
                          </div>
                          <span className="text-xs text-muted-foreground">
                            {profile.consistencyWeight < 0.3 ? 'Creative' : 
                             profile.consistencyWeight > 0.7 ? 'Strict' : 'Balanced'}
                          </span>
                        </div>
                      </div>
                    </>
                  )}
                </>
              )}
            </div>
          </div>
        </ScrollArea>

        <Separator className="my-4" />

        {/* Actions */}
        <div className="flex items-center justify-between">
          <div className="flex gap-2">
            {onGeneratePose && (
              <Button variant="outline" size="sm" onClick={() => onGeneratePose(character.id)}>
                <ImagePlus className="w-4 h-4 mr-1" />
                Add Pose
              </Button>
            )}
            {onExport && (
              <Button variant="outline" size="sm" onClick={() => onExport(character.id)}>
                <Download className="w-4 h-4 mr-1" />
                Export
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            {onEdit && (
              <Button variant="secondary" size="sm" onClick={() => onEdit(character.id)}>
                <Edit2 className="w-4 h-4 mr-1" />
                Edit
              </Button>
            )}
            {onDelete && (
              <Button 
                variant="destructive" 
                size="sm" 
                onClick={() => {
                  onDelete(character.id);
                  onClose();
                }}
              >
                <Trash2 className="w-4 h-4 mr-1" />
                Delete
              </Button>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
