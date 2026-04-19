export type RelationshipType = 
  | 'ally' 
  | 'enemy' 
  | 'rival' 
  | 'family' 
  | 'mentor' 
  | 'student'
  | 'romantic' 
  | 'friend' 
  | 'neutral';

export interface CharacterRelationship {
  id: string;
  sourceId: string;
  targetId: string;
  type: RelationshipType;
  description?: string;
  strength: number; // 1-10
  bidirectional: boolean;
}

const RELATIONSHIPS_STORAGE_KEY = 'comic-character-relationships';

export function loadRelationships(): CharacterRelationship[] {
  try {
    const saved = localStorage.getItem(RELATIONSHIPS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load relationships:', e);
    return [];
  }
}

export function saveRelationships(relationships: CharacterRelationship[]): void {
  try {
    localStorage.setItem(RELATIONSHIPS_STORAGE_KEY, JSON.stringify(relationships));
  } catch (e) {
    console.error('Failed to save relationships:', e);
  }
}

export function addRelationship(
  sourceId: string,
  targetId: string,
  type: RelationshipType,
  description?: string,
  strength: number = 5,
  bidirectional: boolean = true
): CharacterRelationship {
  const relationships = loadRelationships();
  
  // Check if relationship already exists
  const existing = relationships.find(
    r => (r.sourceId === sourceId && r.targetId === targetId) ||
         (r.bidirectional && r.sourceId === targetId && r.targetId === sourceId)
  );
  
  if (existing) {
    // Update existing
    existing.type = type;
    existing.description = description;
    existing.strength = strength;
    existing.bidirectional = bidirectional;
    saveRelationships(relationships);
    return existing;
  }
  
  const newRelationship: CharacterRelationship = {
    id: `rel-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    sourceId,
    targetId,
    type,
    description,
    strength,
    bidirectional,
  };
  
  relationships.push(newRelationship);
  saveRelationships(relationships);
  
  return newRelationship;
}

export function updateRelationship(
  id: string, 
  updates: Partial<Omit<CharacterRelationship, 'id' | 'sourceId' | 'targetId'>>
): CharacterRelationship | undefined {
  const relationships = loadRelationships();
  const index = relationships.findIndex(r => r.id === id);
  
  if (index === -1) return undefined;
  
  relationships[index] = { ...relationships[index], ...updates };
  saveRelationships(relationships);
  
  return relationships[index];
}

export function deleteRelationship(id: string): boolean {
  const relationships = loadRelationships();
  const index = relationships.findIndex(r => r.id === id);
  
  if (index === -1) return false;
  
  relationships.splice(index, 1);
  saveRelationships(relationships);
  
  return true;
}

export function getCharacterRelationships(characterId: string): CharacterRelationship[] {
  const relationships = loadRelationships();
  return relationships.filter(
    r => r.sourceId === characterId || 
         (r.bidirectional && r.targetId === characterId)
  );
}

export function getRelationshipBetween(
  charId1: string, 
  charId2: string
): CharacterRelationship | undefined {
  const relationships = loadRelationships();
  return relationships.find(
    r => (r.sourceId === charId1 && r.targetId === charId2) ||
         (r.sourceId === charId2 && r.targetId === charId1)
  );
}

export function deleteCharacterRelationships(characterId: string): void {
  const relationships = loadRelationships();
  const filtered = relationships.filter(
    r => r.sourceId !== characterId && r.targetId !== characterId
  );
  saveRelationships(filtered);
}

export const RELATIONSHIP_COLORS: Record<RelationshipType, string> = {
  ally: '#22c55e',      // green-500
  enemy: '#ef4444',     // red-500
  rival: '#f97316',     // orange-500
  family: '#3b82f6',    // blue-500
  mentor: '#8b5cf6',    // violet-500
  student: '#a855f7',   // purple-500
  romantic: '#ec4899',  // pink-500
  friend: '#14b8a6',    // teal-500
  neutral: '#6b7280',   // gray-500
};

export const RELATIONSHIP_LABELS: Record<RelationshipType, string> = {
  ally: 'Ally',
  enemy: 'Enemy',
  rival: 'Rival',
  family: 'Family',
  mentor: 'Mentor',
  student: 'Student',
  romantic: 'Romantic',
  friend: 'Friend',
  neutral: 'Neutral',
};

export const RELATIONSHIP_ICONS: Record<RelationshipType, string> = {
  ally: '🤝',
  enemy: '⚔️',
  rival: '🎭',
  family: '👨‍👩‍👧',
  mentor: '📚',
  student: '📖',
  romantic: '❤️',
  friend: '😊',
  neutral: '🔘',
};
