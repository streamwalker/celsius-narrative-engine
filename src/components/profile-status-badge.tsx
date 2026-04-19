import { CheckCircle, AlertCircle, XCircle } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { CharacterProfileData } from '@/components/character-profile-editor';

interface ProfileStatusBadgeProps {
  profile?: CharacterProfileData;
  size?: 'sm' | 'md';
}

type ProfileStatus = 'complete' | 'partial' | 'missing';

function getProfileStatus(profile?: CharacterProfileData): ProfileStatus {
  if (!profile) return 'missing';
  
  const features = profile.keyFeatures;
  const hasHair = !!features.hairColor || !!features.hairStyle;
  const hasEyes = !!features.eyeColor;
  const hasClothing = features.clothing.length > 0;
  const hasExtras = features.accessories.length > 0 || 
                    features.distinctiveMarks.length > 0 || 
                    features.facialFeatures.length > 0;
  
  const requiredCount = [hasHair, hasEyes, hasClothing].filter(Boolean).length;
  
  if (requiredCount >= 3 && hasExtras) return 'complete';
  if (requiredCount >= 1 || hasExtras) return 'partial';
  return 'missing';
}

function getStatusDetails(profile?: CharacterProfileData): string[] {
  if (!profile) return ['No profile configured'];
  
  const details: string[] = [];
  const features = profile.keyFeatures;
  
  if (features.hairColor) details.push(`Hair: ${features.hairColor}${features.hairStyle ? ` ${features.hairStyle}` : ''}`);
  if (features.eyeColor) details.push(`Eyes: ${features.eyeColor}`);
  if (features.skinTone) details.push(`Skin: ${features.skinTone}`);
  if (features.clothing.length > 0) details.push(`Clothing: ${features.clothing.slice(0, 2).join(', ')}${features.clothing.length > 2 ? '...' : ''}`);
  if (features.accessories.length > 0) details.push(`Accessories: ${features.accessories.length}`);
  if (features.distinctiveMarks.length > 0) details.push(`Marks: ${features.distinctiveMarks.length}`);
  
  if (details.length === 0) return ['Profile incomplete - add features'];
  
  return details;
}

export function ProfileStatusBadge({ profile, size = 'sm' }: ProfileStatusBadgeProps) {
  const status = getProfileStatus(profile);
  const details = getStatusDetails(profile);
  const iconSize = size === 'sm' ? 'h-3.5 w-3.5' : 'h-4 w-4';
  
  const statusConfig = {
    complete: {
      icon: CheckCircle,
      label: 'Complete',
      variant: 'default' as const,
      className: 'bg-green-500/20 text-green-600 hover:bg-green-500/30 border-green-500/30',
    },
    partial: {
      icon: AlertCircle,
      label: 'Partial',
      variant: 'outline' as const,
      className: 'bg-yellow-500/20 text-yellow-600 hover:bg-yellow-500/30 border-yellow-500/30',
    },
    missing: {
      icon: XCircle,
      label: 'Missing',
      variant: 'outline' as const,
      className: 'bg-muted text-muted-foreground hover:bg-muted/80',
    },
  };
  
  const config = statusConfig[status];
  const Icon = config.icon;
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge 
            variant={config.variant}
            className={`${config.className} gap-1 cursor-default ${size === 'sm' ? 'text-xs px-1.5 py-0.5' : ''}`}
          >
            <Icon className={iconSize} />
            {size === 'md' && config.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent side="bottom" className="max-w-[200px]">
          <p className="font-medium mb-1">Profile: {config.label}</p>
          <ul className="text-xs space-y-0.5">
            {details.map((detail, i) => (
              <li key={i}>{detail}</li>
            ))}
          </ul>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}

// Export utility for external use
export { getProfileStatus };
