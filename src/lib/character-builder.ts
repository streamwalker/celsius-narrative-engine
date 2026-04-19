import { Race, getRaceById } from './races';
import { CharacterClass, getClassById } from './classes';

export interface Stats {
  strength: number;
  dexterity: number;
  constitution: number;
  intelligence: number;
  wisdom: number;
  charisma: number;
}

export interface AppearanceConfig {
  face: {
    shape: number; // 0-100, round to angular
    eyeSize: number;
    eyeShape: number;
    eyeSpacing: number;
    noseWidth: number;
    noseLength: number;
    mouthSize: number;
    lipFullness: number;
  };
  hair: {
    style: string;
    color: string;
    length: number;
  };
  body: {
    height: number; // 0-100
    build: number; // 0-100, slim to muscular
    skinTone: string;
  };
  distinguishing: {
    scars: string[];
    tattoos: string[];
    accessories: string[];
  };
}

export interface CharacterBuild {
  id: string;
  name: string;
  race: Race;
  characterClass: CharacterClass;
  appearance: AppearanceConfig;
  stats: Stats;
  equipment: string[];
  backstory: string;
}

export const DEFAULT_STATS: Stats = {
  strength: 10,
  dexterity: 10,
  constitution: 10,
  intelligence: 10,
  wisdom: 10,
  charisma: 10,
};

export const DEFAULT_APPEARANCE: AppearanceConfig = {
  face: {
    shape: 50,
    eyeSize: 50,
    eyeShape: 50,
    eyeSpacing: 50,
    noseWidth: 50,
    noseLength: 50,
    mouthSize: 50,
    lipFullness: 50,
  },
  hair: {
    style: 'short',
    color: '#4a3728',
    length: 50,
  },
  body: {
    height: 50,
    build: 50,
    skinTone: 'fair',
  },
  distinguishing: {
    scars: [],
    tattoos: [],
    accessories: [],
  },
};

export const HAIR_STYLES = [
  'bald', 'buzzcut', 'short', 'medium', 'long', 'braided', 
  'ponytail', 'mohawk', 'dreadlocks', 'curly', 'wavy', 'straight'
];

export const SCAR_OPTIONS = [
  'facial scar', 'eye scar', 'cheek scar', 'forehead scar', 
  'battle scars', 'burn marks'
];

export const TATTOO_OPTIONS = [
  'tribal tattoos', 'rune tattoos', 'face tattoos', 
  'arm tattoos', 'full sleeve', 'magical markings'
];

export const ACCESSORY_OPTIONS = [
  'earring', 'nose ring', 'eyepatch', 'headband', 
  'circlet', 'face paint', 'glasses', 'monocle'
];

export function calculateFinalStats(baseStats: Stats, race: Race, characterClass: CharacterClass): Stats {
  const finalStats = { ...baseStats };
  
  // Apply race bonuses
  for (const [stat, bonus] of Object.entries(race.statBonuses)) {
    if (stat in finalStats) {
      finalStats[stat as keyof Stats] += bonus as number;
    }
  }
  
  return finalStats;
}

export function generateAppearancePrompt(
  appearance: AppearanceConfig,
  race: Race,
  characterClass: CharacterClass
): string {
  const parts: string[] = [];
  
  // Race hints
  parts.push(race.imagePromptHints);
  
  // Class hints
  parts.push(characterClass.imagePromptHints);
  
  // Body
  const heightDesc = appearance.body.height < 30 ? 'short' : appearance.body.height > 70 ? 'tall' : 'average height';
  const buildDesc = appearance.body.build < 30 ? 'slim' : appearance.body.build > 70 ? 'muscular' : 'average build';
  parts.push(`${heightDesc}, ${buildDesc}, ${appearance.body.skinTone} skin`);
  
  // Face
  const faceDesc = appearance.face.shape < 30 ? 'round face' : appearance.face.shape > 70 ? 'angular face' : 'oval face';
  parts.push(faceDesc);
  
  // Hair
  if (appearance.hair.style !== 'bald') {
    parts.push(`${appearance.hair.style} hair`);
  } else {
    parts.push('bald');
  }
  
  // Distinguishing features
  if (appearance.distinguishing.scars.length > 0) {
    parts.push(appearance.distinguishing.scars.join(', '));
  }
  if (appearance.distinguishing.tattoos.length > 0) {
    parts.push(appearance.distinguishing.tattoos.join(', '));
  }
  if (appearance.distinguishing.accessories.length > 0) {
    parts.push(appearance.distinguishing.accessories.join(', '));
  }
  
  return parts.join(', ');
}

export function generateCharacterDescription(build: CharacterBuild): string {
  const { race, characterClass, appearance } = build;
  const prompt = generateAppearancePrompt(appearance, race, characterClass);
  return `A ${race.name} ${characterClass.name}, ${prompt}`;
}
