import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { 
  ImagePlus, X, Loader2, Sparkles, Tag, 
  User, ChevronDown, ChevronUp 
} from 'lucide-react';
import { toast } from 'sonner';
import { supabase } from '@/integrations/supabase/client';

export type PoseType = 'front' | 'side' | 'back' | 'action' | 'portrait' | 'full-body' | 'custom';

export interface CharacterPose {
  id: string;
  image: string; // base64
  poseType: PoseType;
  tags: string[]; // AI-generated tags
  description?: string; // AI-generated description
}

export interface CharacterAnalysis {
  suggestedName: string;
  physicalDescription: string;
  clothing: string;
  distinguishingFeatures: string;
  colorPalette: string;
  estimatedAge: string;
  confidence: 'high' | 'medium' | 'low';
}

interface PoseGalleryProps {
  poses: CharacterPose[];
  onPosesChange: (poses: CharacterPose[]) => void;
  characterName?: string;
  disabled?: boolean;
  compact?: boolean;
}

const POSE_COLORS: Record<PoseType, string> = {
  front: 'bg-blue-500/20 text-blue-600 border-blue-500/30',
  side: 'bg-purple-500/20 text-purple-600 border-purple-500/30',
  back: 'bg-amber-500/20 text-amber-600 border-amber-500/30',
  action: 'bg-red-500/20 text-red-600 border-red-500/30',
  portrait: 'bg-green-500/20 text-green-600 border-green-500/30',
  'full-body': 'bg-cyan-500/20 text-cyan-600 border-cyan-500/30',
  custom: 'bg-gray-500/20 text-gray-600 border-gray-500/30',
};

export function PoseGallery({ 
  poses, 
  onPosesChange, 
  characterName,
  disabled,
  compact 
}: PoseGalleryProps) {
  const [expandedPose, setExpandedPose] = useState<string | null>(null);
  const [analyzingPoses, setAnalyzingPoses] = useState<Set<string>>(new Set());

  const analyzePose = async (poseId: string) => {
    const pose = poses.find(p => p.id === poseId);
    if (!pose) return;

    setAnalyzingPoses(prev => new Set([...prev, poseId]));

    try {
      const { data, error } = await supabase.functions.invoke('analyze-pose', {
        body: { image: pose.image, characterName }
      });

      if (error) {
        if (error.message?.includes('402')) {
          toast.error('AI credits exhausted');
        } else if (error.message?.includes('429')) {
          toast.error('Rate limited. Try again later.');
        } else {
          toast.error('Failed to analyze pose');
        }
        return;
      }

      if (data) {
        const updatedPoses = poses.map(p => 
          p.id === poseId 
            ? { 
                ...p, 
                poseType: data.poseType || p.poseType,
                tags: data.tags || p.tags,
                description: data.description || p.description,
              } 
            : p
        );
        onPosesChange(updatedPoses);
        toast.success(`Pose analyzed: ${data.poseType}`);
      }
    } catch (err) {
      console.error('Pose analysis failed:', err);
      toast.error('Failed to analyze pose');
    } finally {
      setAnalyzingPoses(prev => {
        const next = new Set(prev);
        next.delete(poseId);
        return next;
      });
    }
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files?.length) return;

    const newPoses: CharacterPose[] = [];

    for (const file of Array.from(files)) {
      if (!file.type.startsWith('image/')) continue;
      if (file.size > 5 * 1024 * 1024) {
        toast.error(`${file.name} is too large (max 5MB)`);
        continue;
      }

      const base64 = await new Promise<string>((resolve) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.readAsDataURL(file);
      });

      newPoses.push({
        id: `pose-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`,
        image: base64,
        poseType: 'custom',
        tags: [],
      });
    }

    if (newPoses.length > 0) {
      onPosesChange([...poses, ...newPoses]);
      toast.success(`Added ${newPoses.length} pose(s)`);
    }

    e.target.value = '';
  };

  const removePose = (poseId: string) => {
    onPosesChange(poses.filter(p => p.id !== poseId));
    toast.success('Pose removed');
  };

  const updatePoseType = (poseId: string, poseType: PoseType) => {
    onPosesChange(poses.map(p => 
      p.id === poseId ? { ...p, poseType } : p
    ));
  };

  if (compact && poses.length === 0) {
    return (
      <label className={`cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
        <input
          type="file"
          accept="image/*"
          multiple
          onChange={handleImageUpload}
          className="hidden"
          disabled={disabled}
        />
        <div className="flex items-center gap-2 text-xs text-primary hover:underline">
          <ImagePlus className="w-3 h-3" />
          Add poses
        </div>
      </label>
    );
  }

  return (
    <div className="space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <span className="text-xs text-muted-foreground flex items-center gap-1">
          <User className="w-3 h-3" />
          Pose Library ({poses.length})
        </span>
        <label className={`cursor-pointer ${disabled ? 'opacity-50 pointer-events-none' : ''}`}>
          <input
            type="file"
            accept="image/*"
            multiple
            onChange={handleImageUpload}
            className="hidden"
            disabled={disabled}
          />
          <span className="text-xs text-primary hover:underline flex items-center gap-1">
            <ImagePlus className="w-3 h-3" />
            Add poses
          </span>
        </label>
      </div>

      {/* Pose grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
        {poses.map(pose => {
          const isExpanded = expandedPose === pose.id;
          const isAnalyzing = analyzingPoses.has(pose.id);

          return (
            <div 
              key={pose.id} 
              className="relative group rounded-lg border border-border overflow-hidden bg-card"
            >
              {/* Image */}
              <div className="relative aspect-square">
                <img
                  src={pose.image}
                  alt={pose.poseType}
                  className="w-full h-full object-cover"
                />
                
                {/* Loading overlay */}
                {isAnalyzing && (
                  <div className="absolute inset-0 bg-background/80 flex items-center justify-center">
                    <Loader2 className="w-6 h-6 animate-spin text-primary" />
                  </div>
                )}

                {/* Remove button */}
                <button
                  onClick={() => removePose(pose.id)}
                  className="absolute top-1 right-1 w-5 h-5 bg-destructive text-destructive-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled}
                >
                  <X className="w-3 h-3" />
                </button>

                {/* Analyze button */}
                <button
                  onClick={() => analyzePose(pose.id)}
                  className="absolute top-1 left-1 w-6 h-6 bg-primary text-primary-foreground rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  disabled={disabled || isAnalyzing}
                  title="AI analyze pose"
                >
                  <Sparkles className="w-3 h-3" />
                </button>
              </div>

              {/* Pose type badge */}
              <div className="p-2">
                <select
                  value={pose.poseType}
                  onChange={(e) => updatePoseType(pose.id, e.target.value as PoseType)}
                  className={`text-xs px-2 py-0.5 rounded-full border w-full cursor-pointer ${POSE_COLORS[pose.poseType]}`}
                  disabled={disabled}
                >
                  <option value="front">Front</option>
                  <option value="side">Side</option>
                  <option value="back">Back</option>
                  <option value="action">Action</option>
                  <option value="portrait">Portrait</option>
                  <option value="full-body">Full Body</option>
                  <option value="custom">Custom</option>
                </select>

                {/* Tags */}
                {pose.tags.length > 0 && (
                  <div className="flex flex-wrap gap-1 mt-2">
                    {pose.tags.slice(0, 3).map((tag, i) => (
                      <Badge key={i} variant="secondary" className="text-xs px-1 py-0">
                        {tag}
                      </Badge>
                    ))}
                    {pose.tags.length > 3 && (
                      <Badge variant="outline" className="text-xs px-1 py-0">
                        +{pose.tags.length - 3}
                      </Badge>
                    )}
                  </div>
                )}

                {/* Expand button */}
                {pose.description && (
                  <button
                    onClick={() => setExpandedPose(isExpanded ? null : pose.id)}
                    className="text-xs text-muted-foreground hover:text-foreground flex items-center gap-1 mt-1"
                  >
                    {isExpanded ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                    {isExpanded ? 'Hide' : 'Details'}
                  </button>
                )}
              </div>

              {/* Expanded details */}
              {isExpanded && pose.description && (
                <div className="px-2 pb-2 pt-0 border-t border-border">
                  <p className="text-xs text-muted-foreground mt-1">{pose.description}</p>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {poses.length === 0 && (
        <div className="text-center py-6 border border-dashed border-border rounded-lg">
          <ImagePlus className="w-8 h-8 mx-auto text-muted-foreground/50 mb-2" />
          <p className="text-sm text-muted-foreground">No poses yet</p>
          <p className="text-xs text-muted-foreground">Upload images to create a pose library</p>
        </div>
      )}
    </div>
  );
}
