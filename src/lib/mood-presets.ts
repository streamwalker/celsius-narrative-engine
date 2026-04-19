// Mood Presets System - save and load common scene mood configurations

export interface CharacterMoodAssignment {
  role: 'protagonist' | 'antagonist' | 'supporting' | 'any';
  moodId: string;
  intensityOverride?: 1 | 2 | 3;
}

export interface MoodPreset {
  id: string;
  name: string;
  description: string;
  category: 'action' | 'romance' | 'drama' | 'comedy' | 'horror' | 'mystery' | 'custom';
  isBuiltIn: boolean;
  characterMoods: CharacterMoodAssignment[];
  createdAt: number;
}

const PRESET_STORAGE_KEY = 'mood_presets';

export const BUILT_IN_PRESETS: MoodPreset[] = [
  {
    id: 'tense_confrontation',
    name: 'Tense Confrontation',
    description: 'Perfect for face-offs and standoffs between characters',
    category: 'action',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'determined', intensityOverride: 3 },
      { role: 'antagonist', moodId: 'menacing', intensityOverride: 3 },
      { role: 'supporting', moodId: 'fearful', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'romantic_moment',
    name: 'Romantic Moment',
    description: 'Soft, intimate scenes between characters',
    category: 'romance',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'hopeful', intensityOverride: 2 },
      { role: 'any', moodId: 'content', intensityOverride: 1 },
    ],
    createdAt: 0,
  },
  {
    id: 'battle_scene',
    name: 'Battle Scene',
    description: 'High-energy combat with mixed emotions',
    category: 'action',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'determined', intensityOverride: 3 },
      { role: 'antagonist', moodId: 'angry', intensityOverride: 3 },
      { role: 'supporting', moodId: 'fearful', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'peaceful_gathering',
    name: 'Peaceful Gathering',
    description: 'Calm, happy group scenes',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'any', moodId: 'content', intensityOverride: 1 },
      { role: 'protagonist', moodId: 'happy', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'mystery_reveal',
    name: 'Mystery Reveal',
    description: 'When the truth comes to light',
    category: 'mystery',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'curious', intensityOverride: 2 },
      { role: 'antagonist', moodId: 'fearful', intensityOverride: 2 },
      { role: 'supporting', moodId: 'excited', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'villain_monologue',
    name: 'Villain Monologue',
    description: 'The antagonist reveals their plans',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'antagonist', moodId: 'menacing', intensityOverride: 3 },
      { role: 'protagonist', moodId: 'fearful', intensityOverride: 2 },
      { role: 'supporting', moodId: 'desperate', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'tragedy',
    name: 'Tragedy',
    description: 'Devastating emotional moments',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'sad', intensityOverride: 3 },
      { role: 'supporting', moodId: 'sad', intensityOverride: 2 },
      { role: 'any', moodId: 'desperate', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'victory_celebration',
    name: 'Victory Celebration',
    description: 'Triumphant moments after success',
    category: 'action',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'victorious', intensityOverride: 3 },
      { role: 'supporting', moodId: 'excited', intensityOverride: 3 },
      { role: 'antagonist', moodId: 'angry', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'stealth_mission',
    name: 'Stealth Mission',
    description: 'Tense, quiet infiltration scenes',
    category: 'action',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'determined', intensityOverride: 2 },
      { role: 'supporting', moodId: 'fearful', intensityOverride: 1 },
      { role: 'any', moodId: 'neutral', intensityOverride: 1 },
    ],
    createdAt: 0,
  },
  {
    id: 'comic_relief',
    name: 'Comic Relief',
    description: 'Light-hearted, funny moments',
    category: 'comedy',
    isBuiltIn: true,
    characterMoods: [
      { role: 'any', moodId: 'happy', intensityOverride: 2 },
      { role: 'protagonist', moodId: 'excited', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'betrayal',
    name: 'Betrayal',
    description: 'When trust is broken',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'angry', intensityOverride: 3 },
      { role: 'antagonist', moodId: 'menacing', intensityOverride: 2 },
      { role: 'supporting', moodId: 'sad', intensityOverride: 2 },
    ],
    createdAt: 0,
  },
  {
    id: 'farewell',
    name: 'Farewell',
    description: 'Emotional goodbyes and departures',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'sad', intensityOverride: 2 },
      { role: 'supporting', moodId: 'hopeful', intensityOverride: 1 },
      { role: 'any', moodId: 'content', intensityOverride: 1 },
    ],
    createdAt: 0,
  },
  {
    id: 'horror_reveal',
    name: 'Horror Reveal',
    description: 'Terrifying discoveries and scares',
    category: 'horror',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'fearful', intensityOverride: 3 },
      { role: 'antagonist', moodId: 'menacing', intensityOverride: 3 },
      { role: 'supporting', moodId: 'desperate', intensityOverride: 3 },
    ],
    createdAt: 0,
  },
  {
    id: 'planning_session',
    name: 'Planning Session',
    description: 'Characters strategizing together',
    category: 'drama',
    isBuiltIn: true,
    characterMoods: [
      { role: 'protagonist', moodId: 'thoughtful', intensityOverride: 2 },
      { role: 'supporting', moodId: 'curious', intensityOverride: 1 },
      { role: 'any', moodId: 'neutral', intensityOverride: 1 },
    ],
    createdAt: 0,
  },
];

export const PRESET_CATEGORIES = [
  { id: 'action', label: 'Action', color: 'text-red-500' },
  { id: 'romance', label: 'Romance', color: 'text-pink-500' },
  { id: 'drama', label: 'Drama', color: 'text-purple-500' },
  { id: 'comedy', label: 'Comedy', color: 'text-yellow-500' },
  { id: 'horror', label: 'Horror', color: 'text-gray-500' },
  { id: 'mystery', label: 'Mystery', color: 'text-blue-500' },
  { id: 'custom', label: 'Custom', color: 'text-green-500' },
] as const;

export function loadMoodPresets(): MoodPreset[] {
  try {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    const customPresets: MoodPreset[] = stored ? JSON.parse(stored) : [];
    return [...BUILT_IN_PRESETS, ...customPresets];
  } catch {
    return [...BUILT_IN_PRESETS];
  }
}

export function loadCustomPresets(): MoodPreset[] {
  try {
    const stored = localStorage.getItem(PRESET_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMoodPreset(preset: Omit<MoodPreset, 'id' | 'createdAt' | 'isBuiltIn'>): MoodPreset {
  const customPresets = loadCustomPresets();
  const newPreset: MoodPreset = {
    ...preset,
    id: `custom_${Date.now()}`,
    isBuiltIn: false,
    createdAt: Date.now(),
  };
  customPresets.push(newPreset);
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(customPresets));
  return newPreset;
}

export function updateMoodPreset(id: string, updates: Partial<MoodPreset>): void {
  const customPresets = loadCustomPresets();
  const index = customPresets.findIndex(p => p.id === id);
  if (index !== -1) {
    customPresets[index] = { ...customPresets[index], ...updates };
    localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(customPresets));
  }
}

export function deleteMoodPreset(id: string): void {
  const customPresets = loadCustomPresets();
  const filtered = customPresets.filter(p => p.id !== id);
  localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(filtered));
}

export function getPresetById(id: string): MoodPreset | undefined {
  return loadMoodPresets().find(p => p.id === id);
}

export function getPresetsByCategory(category: MoodPreset['category']): MoodPreset[] {
  return loadMoodPresets().filter(p => p.category === category);
}

export function applyPresetToCharacters(
  preset: MoodPreset,
  characters: string[],
  characterRoles?: Record<string, 'protagonist' | 'antagonist' | 'supporting'>
): Record<string, string> {
  const assignments: Record<string, string> = {};
  
  characters.forEach((char, index) => {
    const role = characterRoles?.[char] || (index === 0 ? 'protagonist' : 'supporting');
    
    // Find matching mood assignment
    const assignment = preset.characterMoods.find(m => m.role === role) 
      || preset.characterMoods.find(m => m.role === 'any');
    
    if (assignment) {
      assignments[char] = assignment.moodId;
    } else {
      assignments[char] = 'neutral';
    }
  });
  
  return assignments;
}

// Export/Import functionality
export interface PresetExportData {
  version: string;
  exportDate: string;
  presetCount: number;
  presets: MoodPreset[];
}

export function exportPresetsToJSON(presetIds?: string[]): string {
  const customPresets = loadCustomPresets();
  const presetsToExport = presetIds 
    ? customPresets.filter(p => presetIds.includes(p.id))
    : customPresets;
  
  const exportData: PresetExportData = {
    version: '1.0',
    exportDate: new Date().toISOString(),
    presetCount: presetsToExport.length,
    presets: presetsToExport,
  };
  
  return JSON.stringify(exportData, null, 2);
}

export interface ImportResult {
  success: boolean;
  imported: number;
  errors: string[];
  duplicates: string[];
}

export function importPresetsFromJSON(jsonString: string): ImportResult {
  const result: ImportResult = {
    success: false,
    imported: 0,
    errors: [],
    duplicates: [],
  };
  
  try {
    const data = JSON.parse(jsonString);
    
    // Validate structure
    if (!data.presets || !Array.isArray(data.presets)) {
      result.errors.push('Invalid file format: missing presets array');
      return result;
    }
    
    const existingPresets = loadCustomPresets();
    const existingNames = new Set(existingPresets.map(p => p.name.toLowerCase()));
    const newPresets: MoodPreset[] = [];
    
    for (const preset of data.presets) {
      // Validate required fields
      if (!preset.name || !preset.characterMoods) {
        result.errors.push(`Invalid preset: missing required fields`);
        continue;
      }
      
      // Check for duplicates by name
      if (existingNames.has(preset.name.toLowerCase())) {
        result.duplicates.push(preset.name);
        continue;
      }
      
      // Generate new ID to avoid conflicts
      const importedPreset: MoodPreset = {
        ...preset,
        id: `imported_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
        isBuiltIn: false,
        createdAt: Date.now(),
      };
      
      newPresets.push(importedPreset);
      existingNames.add(preset.name.toLowerCase());
    }
    
    // Save new presets
    if (newPresets.length > 0) {
      const allPresets = [...existingPresets, ...newPresets];
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(allPresets));
    }
    
    result.success = true;
    result.imported = newPresets.length;
    
  } catch (e) {
    result.errors.push(`Failed to parse JSON: ${e instanceof Error ? e.message : 'Unknown error'}`);
  }
  
  return result;
}

export function downloadPresetsAsFile(presetIds?: string[]): void {
  const json = exportPresetsToJSON(presetIds);
  const blob = new Blob([json], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = `mood-presets-${new Date().toISOString().split('T')[0]}.json`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
