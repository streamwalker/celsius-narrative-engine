export interface CharacterVersion {
  id: string;
  characterId: string;
  timestamp: number;
  changeType: 'created' | 'edited' | 'profile_updated' | 'pose_added' | 'pose_removed' | 'equipment_changed';
  changeDescription: string;
  snapshot: unknown; // Full character state at this point
  previousVersionId?: string;
}

const HISTORY_STORAGE_KEY = 'comic-character-history';
const MAX_VERSIONS_PER_CHARACTER = 20;

export function loadCharacterHistory(): Record<string, CharacterVersion[]> {
  try {
    const saved = localStorage.getItem(HISTORY_STORAGE_KEY);
    return saved ? JSON.parse(saved) : {};
  } catch (e) {
    console.error('Failed to load character history:', e);
    return {};
  }
}

export function saveCharacterHistory(history: Record<string, CharacterVersion[]>): void {
  try {
    localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
  } catch (e) {
    console.error('Failed to save character history:', e);
  }
}

export function getCharacterVersions(characterId: string): CharacterVersion[] {
  const history = loadCharacterHistory();
  return history[characterId] || [];
}

export function addCharacterVersion(
  characterId: string,
  changeType: CharacterVersion['changeType'],
  changeDescription: string,
  snapshot: unknown
): CharacterVersion {
  const history = loadCharacterHistory();
  const versions = history[characterId] || [];
  
  const newVersion: CharacterVersion = {
    id: `v-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    characterId,
    timestamp: Date.now(),
    changeType,
    changeDescription,
    snapshot: JSON.parse(JSON.stringify(snapshot)), // Deep clone
    previousVersionId: versions.length > 0 ? versions[versions.length - 1].id : undefined,
  };
  
  versions.push(newVersion);
  
  // Prune old versions if exceeding max
  if (versions.length > MAX_VERSIONS_PER_CHARACTER) {
    versions.splice(0, versions.length - MAX_VERSIONS_PER_CHARACTER);
  }
  
  history[characterId] = versions;
  saveCharacterHistory(history);
  
  return newVersion;
}

export function getVersionById(characterId: string, versionId: string): CharacterVersion | undefined {
  const versions = getCharacterVersions(characterId);
  return versions.find(v => v.id === versionId);
}

export function deleteCharacterHistory(characterId: string): void {
  const history = loadCharacterHistory();
  delete history[characterId];
  saveCharacterHistory(history);
}

export function formatVersionDate(timestamp: number): string {
  const date = new Date(timestamp);
  const now = new Date();
  const diff = now.getTime() - timestamp;
  
  // Less than 1 minute
  if (diff < 60 * 1000) {
    return 'Just now';
  }
  
  // Less than 1 hour
  if (diff < 60 * 60 * 1000) {
    const mins = Math.floor(diff / (60 * 1000));
    return `${mins} min${mins > 1 ? 's' : ''} ago`;
  }
  
  // Less than 24 hours
  if (diff < 24 * 60 * 60 * 1000) {
    const hours = Math.floor(diff / (60 * 60 * 1000));
    return `${hours} hour${hours > 1 ? 's' : ''} ago`;
  }
  
  // Less than 7 days
  if (diff < 7 * 24 * 60 * 60 * 1000) {
    const days = Math.floor(diff / (24 * 60 * 60 * 1000));
    return `${days} day${days > 1 ? 's' : ''} ago`;
  }
  
  // Format as date
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: date.getFullYear() !== now.getFullYear() ? 'numeric' : undefined,
  });
}

export function getChangeTypeLabel(changeType: CharacterVersion['changeType']): string {
  switch (changeType) {
    case 'created':
      return 'Created';
    case 'edited':
      return 'Edited';
    case 'profile_updated':
      return 'Profile Updated';
    case 'pose_added':
      return 'Pose Added';
    case 'pose_removed':
      return 'Pose Removed';
    case 'equipment_changed':
      return 'Equipment Changed';
    default:
      return 'Modified';
  }
}

export function getChangeTypeColor(changeType: CharacterVersion['changeType']): string {
  switch (changeType) {
    case 'created':
      return 'bg-green-500/20 text-green-500';
    case 'edited':
      return 'bg-blue-500/20 text-blue-500';
    case 'profile_updated':
      return 'bg-purple-500/20 text-purple-500';
    case 'pose_added':
      return 'bg-amber-500/20 text-amber-500';
    case 'pose_removed':
      return 'bg-red-500/20 text-red-500';
    case 'equipment_changed':
      return 'bg-cyan-500/20 text-cyan-500';
    default:
      return 'bg-muted text-muted-foreground';
  }
}
