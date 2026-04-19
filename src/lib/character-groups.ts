export interface CharacterGroup {
  id: string;
  name: string;
  description?: string;
  color: string;
  characterIds: string[];
  createdAt: number;
  updatedAt: number;
}

const GROUPS_STORAGE_KEY = 'comic-character-groups';

export const GROUP_COLORS = [
  { id: 'red', color: '#ef4444', label: 'Red' },
  { id: 'orange', color: '#f97316', label: 'Orange' },
  { id: 'amber', color: '#f59e0b', label: 'Amber' },
  { id: 'green', color: '#22c55e', label: 'Green' },
  { id: 'teal', color: '#14b8a6', label: 'Teal' },
  { id: 'blue', color: '#3b82f6', label: 'Blue' },
  { id: 'indigo', color: '#6366f1', label: 'Indigo' },
  { id: 'purple', color: '#8b5cf6', label: 'Purple' },
  { id: 'pink', color: '#ec4899', label: 'Pink' },
];

export function loadGroups(): CharacterGroup[] {
  try {
    const saved = localStorage.getItem(GROUPS_STORAGE_KEY);
    return saved ? JSON.parse(saved) : [];
  } catch (e) {
    console.error('Failed to load character groups:', e);
    return [];
  }
}

export function saveGroups(groups: CharacterGroup[]): void {
  try {
    localStorage.setItem(GROUPS_STORAGE_KEY, JSON.stringify(groups));
  } catch (e) {
    console.error('Failed to save character groups:', e);
  }
}

export function createGroup(
  name: string,
  description?: string,
  color?: string,
  characterIds: string[] = []
): CharacterGroup {
  const groups = loadGroups();
  
  const newGroup: CharacterGroup = {
    id: `group-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name,
    description,
    color: color || GROUP_COLORS[groups.length % GROUP_COLORS.length].color,
    characterIds,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };
  
  groups.push(newGroup);
  saveGroups(groups);
  
  return newGroup;
}

export function updateGroup(
  id: string,
  updates: Partial<Omit<CharacterGroup, 'id' | 'createdAt'>>
): CharacterGroup | undefined {
  const groups = loadGroups();
  const index = groups.findIndex(g => g.id === id);
  
  if (index === -1) return undefined;
  
  groups[index] = {
    ...groups[index],
    ...updates,
    updatedAt: Date.now(),
  };
  
  saveGroups(groups);
  return groups[index];
}

export function deleteGroup(id: string): boolean {
  const groups = loadGroups();
  const index = groups.findIndex(g => g.id === id);
  
  if (index === -1) return false;
  
  groups.splice(index, 1);
  saveGroups(groups);
  
  return true;
}

export function addCharacterToGroup(groupId: string, characterId: string): boolean {
  const groups = loadGroups();
  const group = groups.find(g => g.id === groupId);
  
  if (!group) return false;
  if (group.characterIds.includes(characterId)) return true;
  
  group.characterIds.push(characterId);
  group.updatedAt = Date.now();
  saveGroups(groups);
  
  return true;
}

export function removeCharacterFromGroup(groupId: string, characterId: string): boolean {
  const groups = loadGroups();
  const group = groups.find(g => g.id === groupId);
  
  if (!group) return false;
  
  const index = group.characterIds.indexOf(characterId);
  if (index === -1) return false;
  
  group.characterIds.splice(index, 1);
  group.updatedAt = Date.now();
  saveGroups(groups);
  
  return true;
}

export function getCharacterGroups(characterId: string): CharacterGroup[] {
  const groups = loadGroups();
  return groups.filter(g => g.characterIds.includes(characterId));
}

export function getGroupById(id: string): CharacterGroup | undefined {
  const groups = loadGroups();
  return groups.find(g => g.id === id);
}

export function removeCharacterFromAllGroups(characterId: string): void {
  const groups = loadGroups();
  let changed = false;
  
  groups.forEach(group => {
    const index = group.characterIds.indexOf(characterId);
    if (index !== -1) {
      group.characterIds.splice(index, 1);
      group.updatedAt = Date.now();
      changed = true;
    }
  });
  
  if (changed) {
    saveGroups(groups);
  }
}
