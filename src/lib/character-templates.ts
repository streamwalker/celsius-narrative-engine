import { Stats, AppearanceConfig, DEFAULT_STATS, DEFAULT_APPEARANCE } from './character-builder';
import { EquippedItems } from './equipment';

export interface CharacterTemplate {
  id: string;
  name: string;
  description: string;
  raceId: string;
  classId: string;
  suggestedEquipment: Partial<EquippedItems>;
  suggestedAppearance: Partial<AppearanceConfig>;
  suggestedStats: Partial<Stats>;
  tags: string[];
  thumbnail?: string; // emoji or icon
}

export const CHARACTER_TEMPLATES: CharacterTemplate[] = [
  {
    id: 'noble-knight',
    name: 'Noble Knight',
    description: 'A chivalrous warrior sworn to protect the innocent and uphold justice.',
    raceId: 'human',
    classId: 'warrior',
    suggestedStats: { strength: 15, constitution: 14, charisma: 12 },
    suggestedAppearance: {
      body: { height: 60, build: 70, skinTone: 'fair' },
      face: { shape: 50, eyeSize: 50, eyeShape: 50, eyeSpacing: 50, noseWidth: 50, noseLength: 50, mouthSize: 50, lipFullness: 50 },
    },
    suggestedEquipment: {},
    tags: ['melee', 'tank', 'honorable'],
    thumbnail: '⚔️',
  },
  {
    id: 'elven-archer',
    name: 'Elven Archer',
    description: 'A graceful marksman with centuries of experience and deadly precision.',
    raceId: 'elf',
    classId: 'ranger',
    suggestedStats: { dexterity: 15, wisdom: 14, intelligence: 12 },
    suggestedAppearance: {
      body: { height: 65, build: 30, skinTone: 'fair' },
      face: { shape: 30, eyeSize: 60, eyeShape: 50, eyeSpacing: 50, noseWidth: 40, noseLength: 50, mouthSize: 45, lipFullness: 50 },
      hair: { style: 'long', color: 'silver', length: 80 },
    },
    suggestedEquipment: {},
    tags: ['ranged', 'nature', 'agile'],
    thumbnail: '🏹',
  },
  {
    id: 'dwarven-smith',
    name: 'Dwarven Smith',
    description: 'A stout craftsman-warrior equally skilled with hammer in forge or battle.',
    raceId: 'dwarf',
    classId: 'warrior',
    suggestedStats: { strength: 14, constitution: 15, wisdom: 12 },
    suggestedAppearance: {
      body: { height: 25, build: 85, skinTone: 'tan' },
      face: { shape: 70, eyeSize: 40, eyeShape: 50, eyeSpacing: 50, noseWidth: 60, noseLength: 50, mouthSize: 55, lipFullness: 50 },
      hair: { style: 'braided', color: 'red', length: 60 },
    },
    suggestedEquipment: {},
    tags: ['melee', 'tank', 'craftsman'],
    thumbnail: '🔨',
  },
  {
    id: 'shadow-assassin',
    name: 'Shadow Assassin',
    description: 'A deadly blade for hire who strikes from darkness without warning.',
    raceId: 'tiefling',
    classId: 'rogue',
    suggestedStats: { dexterity: 15, charisma: 14, intelligence: 12 },
    suggestedAppearance: {
      body: { height: 50, build: 40, skinTone: 'purple' },
      face: { shape: 45, eyeSize: 55, eyeShape: 50, eyeSpacing: 50, noseWidth: 45, noseLength: 50, mouthSize: 50, lipFullness: 50 },
    },
    suggestedEquipment: {},
    tags: ['stealth', 'damage', 'dark'],
    thumbnail: '🗡️',
  },
  {
    id: 'battle-mage',
    name: 'Battle Mage',
    description: 'A spell-slinger who has learned to channel magic in the heat of combat.',
    raceId: 'human',
    classId: 'mage',
    suggestedStats: { intelligence: 15, constitution: 14, dexterity: 12 },
    suggestedAppearance: {
      body: { height: 55, build: 45, skinTone: 'olive' },
      face: { shape: 50, eyeSize: 50, eyeShape: 50, eyeSpacing: 50, noseWidth: 50, noseLength: 50, mouthSize: 50, lipFullness: 50 },
    },
    suggestedEquipment: {},
    tags: ['magic', 'damage', 'versatile'],
    thumbnail: '🔥',
  },
  {
    id: 'forest-guardian',
    name: 'Forest Guardian',
    description: 'A protector of the wilds who can commune with beasts and command nature.',
    raceId: 'elf',
    classId: 'druid',
    suggestedStats: { wisdom: 15, constitution: 14, intelligence: 12 },
    suggestedAppearance: {
      body: { height: 60, build: 40, skinTone: 'golden' },
      face: { shape: 35, eyeSize: 55, eyeShape: 50, eyeSpacing: 50, noseWidth: 45, noseLength: 50, mouthSize: 45, lipFullness: 50 },
      hair: { style: 'wild', color: 'brown', length: 70 },
    },
    suggestedEquipment: {},
    tags: ['nature', 'magic', 'healer'],
    thumbnail: '🌿',
  },
  {
    id: 'holy-crusader',
    name: 'Holy Crusader',
    description: 'A divine warrior blessed with celestial power and unwavering faith.',
    raceId: 'aasimar',
    classId: 'paladin',
    suggestedStats: { strength: 14, charisma: 15, constitution: 12 },
    suggestedAppearance: {
      body: { height: 65, build: 65, skinTone: 'golden' },
      face: { shape: 50, eyeSize: 50, eyeShape: 50, eyeSpacing: 50, noseWidth: 50, noseLength: 50, mouthSize: 50, lipFullness: 50 },
      hair: { style: 'short', color: 'blonde', length: 30 },
    },
    suggestedEquipment: {},
    tags: ['divine', 'tank', 'holy'],
    thumbnail: '✨',
  },
  {
    id: 'bardic-entertainer',
    name: 'Bardic Entertainer',
    description: 'A charming performer whose music inspires allies and befuddles enemies.',
    raceId: 'halfling',
    classId: 'bard',
    suggestedStats: { charisma: 15, dexterity: 14, intelligence: 12 },
    suggestedAppearance: {
      body: { height: 20, build: 45, skinTone: 'warm brown' },
      face: { shape: 30, eyeSize: 65, eyeShape: 50, eyeSpacing: 50, noseWidth: 45, noseLength: 50, mouthSize: 55, lipFullness: 50 },
      hair: { style: 'curly', color: 'brown', length: 50 },
    },
    suggestedEquipment: {},
    tags: ['support', 'social', 'magic'],
    thumbnail: '🎵',
  },
  {
    id: 'dragon-shaman',
    name: 'Dragon Shaman',
    description: 'A dragonborn who channels innate draconic magic through sheer force of will.',
    raceId: 'dragonborn',
    classId: 'sorcerer',
    suggestedStats: { charisma: 15, constitution: 14, strength: 12 },
    suggestedAppearance: {
      body: { height: 70, build: 70, skinTone: 'red scales' },
      face: { shape: 65, eyeSize: 45, eyeShape: 50, eyeSpacing: 50, noseWidth: 55, noseLength: 50, mouthSize: 50, lipFullness: 50 },
    },
    suggestedEquipment: {},
    tags: ['magic', 'damage', 'draconic'],
    thumbnail: '🐉',
  },
  {
    id: 'dark-necromancer',
    name: 'Dark Necromancer',
    description: 'A master of death magic who commands legions of undead servants.',
    raceId: 'tiefling',
    classId: 'necromancer',
    suggestedStats: { intelligence: 15, constitution: 14, wisdom: 12 },
    suggestedAppearance: {
      body: { height: 55, build: 35, skinTone: 'ashen grey' },
      face: { shape: 55, eyeSize: 50, eyeShape: 50, eyeSpacing: 50, noseWidth: 45, noseLength: 50, mouthSize: 45, lipFullness: 50 },
      hair: { style: 'long', color: 'black', length: 75 },
    },
    suggestedEquipment: {},
    tags: ['magic', 'damage', 'dark'],
    thumbnail: '💀',
  },
  {
    id: 'mountain-berserker',
    name: 'Mountain Berserker',
    description: 'A towering warrior from the peaks who fights with primal fury.',
    raceId: 'goliath',
    classId: 'warrior',
    suggestedStats: { strength: 15, constitution: 14, dexterity: 12 },
    suggestedAppearance: {
      body: { height: 90, build: 90, skinTone: 'grey' },
      face: { shape: 75, eyeSize: 40, eyeShape: 50, eyeSpacing: 50, noseWidth: 55, noseLength: 50, mouthSize: 55, lipFullness: 50 },
      distinguishing: { scars: ['tribal'], tattoos: ['tribal tattoos'], accessories: [] },
    },
    suggestedEquipment: {},
    tags: ['melee', 'damage', 'primal'],
    thumbnail: '⛰️',
  },
  {
    id: 'monastery-monk',
    name: 'Monastery Monk',
    description: 'A disciplined martial artist who channels inner ki for devastating attacks.',
    raceId: 'human',
    classId: 'monk',
    suggestedStats: { dexterity: 15, wisdom: 14, constitution: 12 },
    suggestedAppearance: {
      body: { height: 55, build: 55, skinTone: 'tan' },
      face: { shape: 50, eyeSize: 50, eyeShape: 50, eyeSpacing: 50, noseWidth: 50, noseLength: 50, mouthSize: 50, lipFullness: 50 },
      hair: { style: 'bald', color: 'none', length: 0 },
    },
    suggestedEquipment: {},
    tags: ['melee', 'agile', 'spiritual'],
    thumbnail: '🥋',
  },
];

export function getTemplateById(id: string): CharacterTemplate | undefined {
  return CHARACTER_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByTag(tag: string): CharacterTemplate[] {
  return CHARACTER_TEMPLATES.filter(t => t.tags.includes(tag));
}

export function getTemplatesByRole(role: string): CharacterTemplate[] {
  const roleTags: Record<string, string[]> = {
    tank: ['tank', 'melee'],
    damage: ['damage', 'ranged'],
    healer: ['healer', 'support', 'divine'],
    support: ['support', 'social'],
    magic: ['magic', 'dark', 'holy'],
  };
  
  const tags = roleTags[role] || [];
  return CHARACTER_TEMPLATES.filter(t => t.tags.some(tag => tags.includes(tag)));
}
