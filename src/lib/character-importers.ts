import { RACES, Race } from './races';
import { CLASSES, CharacterClass } from './classes';
import { Stats, DEFAULT_STATS } from './character-builder';

export interface ImportedCharacter {
  name: string;
  race: string;
  class: string;
  stats: Partial<Stats>;
  equipment: string[];
  backstory?: string;
  appearance?: {
    hair?: string;
    eyes?: string;
    skin?: string;
    height?: string;
    weight?: string;
  };
  level?: number;
  source: 'dnd-beyond' | 'generic-json' | 'csv' | 'manual';
}

export interface ImportResult {
  success: boolean;
  characters: ImportedCharacter[];
  errors: string[];
  warnings: string[];
}

// D&D Beyond stat names mapped to our format
const DND_STAT_MAP: Record<string, keyof Stats> = {
  'str': 'strength',
  'dex': 'dexterity',
  'con': 'constitution',
  'int': 'intelligence',
  'wis': 'wisdom',
  'cha': 'charisma',
  'strength': 'strength',
  'dexterity': 'dexterity',
  'constitution': 'constitution',
  'intelligence': 'intelligence',
  'wisdom': 'wisdom',
  'charisma': 'charisma',
};

// Race name variations mapped to our race IDs
const RACE_NAME_MAP: Record<string, string> = {
  'human': 'human',
  'elf': 'elf',
  'high elf': 'elf',
  'wood elf': 'elf',
  'dark elf': 'elf',
  'drow': 'elf',
  'dwarf': 'dwarf',
  'hill dwarf': 'dwarf',
  'mountain dwarf': 'dwarf',
  'orc': 'orc',
  'half-orc': 'orc',
  'halfling': 'halfling',
  'lightfoot halfling': 'halfling',
  'stout halfling': 'halfling',
  'tiefling': 'tiefling',
  'dragonborn': 'dragonborn',
  'gnome': 'gnome',
  'rock gnome': 'gnome',
  'forest gnome': 'gnome',
  'aasimar': 'aasimar',
  'goliath': 'goliath',
  'kenku': 'kenku',
  'tabaxi': 'tabaxi',
};

// Class name variations mapped to our class IDs
const CLASS_NAME_MAP: Record<string, string> = {
  'fighter': 'warrior',
  'warrior': 'warrior',
  'paladin': 'paladin',
  'barbarian': 'warrior',
  'wizard': 'mage',
  'mage': 'mage',
  'sorcerer': 'sorcerer',
  'warlock': 'warlock',
  'rogue': 'rogue',
  'thief': 'rogue',
  'assassin': 'rogue',
  'cleric': 'cleric',
  'priest': 'cleric',
  'ranger': 'ranger',
  'hunter': 'ranger',
  'bard': 'bard',
  'monk': 'monk',
  'druid': 'druid',
  'necromancer': 'necromancer',
};

export function mapRaceName(raceName: string): string {
  const normalized = raceName.toLowerCase().trim();
  return RACE_NAME_MAP[normalized] || 'human';
}

export function mapClassName(className: string): string {
  const normalized = className.toLowerCase().trim();
  return CLASS_NAME_MAP[normalized] || 'warrior';
}

export function getRaceForImport(raceId: string): Race | undefined {
  return RACES.find(r => r.id === raceId);
}

export function getClassForImport(classId: string): CharacterClass | undefined {
  return CLASSES.find(c => c.id === classId);
}

// Parse D&D Beyond JSON format
export function parseDnDBeyondJson(data: unknown): ImportResult {
  const result: ImportResult = {
    success: false,
    characters: [],
    errors: [],
    warnings: [],
  };

  try {
    const json = data as Record<string, unknown>;
    
    // D&D Beyond character structure
    const name = (json.name as string) || 'Unknown Character';
    
    // Extract race
    let raceName = 'human';
    if (json.race && typeof json.race === 'object') {
      raceName = ((json.race as Record<string, unknown>).fullName as string) || 
                 ((json.race as Record<string, unknown>).baseName as string) || 
                 'human';
    } else if (typeof json.race === 'string') {
      raceName = json.race;
    }
    
    // Extract class
    let className = 'warrior';
    if (json.classes && Array.isArray(json.classes) && json.classes.length > 0) {
      const primaryClass = json.classes[0] as Record<string, unknown>;
      if (primaryClass.definition && typeof primaryClass.definition === 'object') {
        className = ((primaryClass.definition as Record<string, unknown>).name as string) || 'warrior';
      }
    }
    
    // Extract stats
    const stats: Partial<Stats> = { ...DEFAULT_STATS };
    if (json.stats && Array.isArray(json.stats)) {
      json.stats.forEach((stat: unknown) => {
        const s = stat as Record<string, unknown>;
        const statId = s.id as number;
        const value = s.value as number;
        
        // D&D Beyond stat IDs: 1=STR, 2=DEX, 3=CON, 4=INT, 5=WIS, 6=CHA
        const statMap: Record<number, keyof Stats> = {
          1: 'strength',
          2: 'dexterity',
          3: 'constitution',
          4: 'intelligence',
          5: 'wisdom',
          6: 'charisma',
        };
        
        if (statMap[statId] && typeof value === 'number') {
          stats[statMap[statId]] = value;
        }
      });
    }
    
    // Extract equipment
    const equipment: string[] = [];
    if (json.inventory && Array.isArray(json.inventory)) {
      json.inventory.forEach((item: unknown) => {
        const i = item as Record<string, unknown>;
        if (i.definition && typeof i.definition === 'object') {
          const def = i.definition as Record<string, unknown>;
          const itemName = def.name as string;
          if (itemName) equipment.push(itemName);
        }
      });
    }
    
    // Extract backstory
    let backstory = '';
    if (json.notes && typeof json.notes === 'object') {
      const notes = json.notes as Record<string, unknown>;
      backstory = (notes.backstory as string) || '';
    }
    if (json.traits && typeof json.traits === 'object') {
      const traits = json.traits as Record<string, unknown>;
      backstory = (traits.backstory as string) || backstory;
    }
    
    // Extract appearance
    const appearance: ImportedCharacter['appearance'] = {};
    if (json.traits && typeof json.traits === 'object') {
      const traits = json.traits as Record<string, unknown>;
      appearance.hair = traits.hairColor as string;
      appearance.eyes = traits.eyeColor as string;
      appearance.skin = traits.skinColor as string;
      appearance.height = traits.height as string;
      appearance.weight = traits.weight as string;
    }
    
    const character: ImportedCharacter = {
      name,
      race: mapRaceName(raceName),
      class: mapClassName(className),
      stats,
      equipment,
      backstory: backstory || undefined,
      appearance: Object.keys(appearance).length > 0 ? appearance : undefined,
      level: typeof json.level === 'number' ? json.level : undefined,
      source: 'dnd-beyond',
    };
    
    result.characters.push(character);
    result.success = true;
    
    // Add warnings for unmapped values
    if (!RACE_NAME_MAP[raceName.toLowerCase()]) {
      result.warnings.push(`Race "${raceName}" was mapped to "Human"`);
    }
    if (!CLASS_NAME_MAP[className.toLowerCase()]) {
      result.warnings.push(`Class "${className}" was mapped to "Warrior"`);
    }
  } catch (e) {
    result.errors.push(`Failed to parse D&D Beyond JSON: ${e}`);
  }
  
  return result;
}

// Parse generic JSON format
export function parseGenericJson(data: unknown): ImportResult {
  const result: ImportResult = {
    success: false,
    characters: [],
    errors: [],
    warnings: [],
  };

  try {
    const items = Array.isArray(data) ? data : [data];
    
    items.forEach((item, index) => {
      const json = item as Record<string, unknown>;
      
      if (!json.name) {
        result.warnings.push(`Character at index ${index} has no name, skipping`);
        return;
      }
      
      const character: ImportedCharacter = {
        name: json.name as string,
        race: mapRaceName((json.race as string) || 'human'),
        class: mapClassName((json.class as string) || (json.className as string) || 'warrior'),
        stats: {},
        equipment: [],
        source: 'generic-json',
      };
      
      // Parse stats
      if (json.stats && typeof json.stats === 'object') {
        const statsObj = json.stats as Record<string, unknown>;
        Object.entries(statsObj).forEach(([key, value]) => {
          const mappedKey = DND_STAT_MAP[key.toLowerCase()];
          if (mappedKey && typeof value === 'number') {
            character.stats[mappedKey] = value;
          }
        });
      }
      
      // Parse equipment
      if (json.equipment && Array.isArray(json.equipment)) {
        character.equipment = json.equipment.filter(e => typeof e === 'string') as string[];
      }
      
      // Parse backstory
      if (typeof json.backstory === 'string') {
        character.backstory = json.backstory;
      }
      
      // Parse appearance
      if (json.appearance && typeof json.appearance === 'object') {
        character.appearance = json.appearance as ImportedCharacter['appearance'];
      }
      
      result.characters.push(character);
    });
    
    result.success = result.characters.length > 0;
  } catch (e) {
    result.errors.push(`Failed to parse JSON: ${e}`);
  }
  
  return result;
}

// Parse CSV format
export function parseCsv(csvText: string): ImportResult {
  const result: ImportResult = {
    success: false,
    characters: [],
    errors: [],
    warnings: [],
  };

  try {
    const lines = csvText.trim().split('\n');
    if (lines.length < 2) {
      result.errors.push('CSV must have a header row and at least one data row');
      return result;
    }
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    const nameIndex = headers.findIndex(h => h === 'name');
    const raceIndex = headers.findIndex(h => h === 'race');
    const classIndex = headers.findIndex(h => h === 'class');
    
    if (nameIndex === -1) {
      result.errors.push('CSV must have a "name" column');
      return result;
    }
    
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',').map(v => v.trim());
      
      if (!values[nameIndex]) {
        result.warnings.push(`Row ${i + 1} has no name, skipping`);
        continue;
      }
      
      const character: ImportedCharacter = {
        name: values[nameIndex],
        race: raceIndex !== -1 ? mapRaceName(values[raceIndex] || 'human') : 'human',
        class: classIndex !== -1 ? mapClassName(values[classIndex] || 'warrior') : 'warrior',
        stats: {},
        equipment: [],
        source: 'csv',
      };
      
      // Check for stat columns
      headers.forEach((header, index) => {
        const mappedStat = DND_STAT_MAP[header];
        if (mappedStat && values[index]) {
          const value = parseInt(values[index], 10);
          if (!isNaN(value)) {
            character.stats[mappedStat] = value;
          }
        }
      });
      
      // Check for description/backstory column
      const descIndex = headers.findIndex(h => h === 'description' || h === 'backstory');
      if (descIndex !== -1 && values[descIndex]) {
        character.backstory = values[descIndex];
      }
      
      result.characters.push(character);
    }
    
    result.success = result.characters.length > 0;
  } catch (e) {
    result.errors.push(`Failed to parse CSV: ${e}`);
  }
  
  return result;
}

// Auto-detect format and parse
export function parseCharacterData(data: string | unknown, format?: 'json' | 'csv' | 'dnd-beyond'): ImportResult {
  // If data is already parsed (object), try JSON formats
  if (typeof data === 'object') {
    const json = data as Record<string, unknown>;
    
  // Check for D&D Beyond specific fields
  const raceObj = json.race as Record<string, unknown> | undefined;
  if (json.classes || (raceObj && 'fullName' in raceObj) || json.modifiers) {
    return parseDnDBeyondJson(data);
  }
    
    return parseGenericJson(data);
  }
  
  // String data
  const str = data as string;
  
  if (format === 'csv' || (!format && str.includes(',') && str.includes('\n') && !str.trim().startsWith('{'))) {
    return parseCsv(str);
  }
  
  // Try to parse as JSON
  try {
    const parsed = JSON.parse(str);
    return parseCharacterData(parsed);
  } catch {
    return {
      success: false,
      characters: [],
      errors: ['Could not parse data as JSON or CSV'],
      warnings: [],
    };
  }
}
