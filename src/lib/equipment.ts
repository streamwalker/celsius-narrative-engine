// Equipment data types and categories for Character Builder

export type EquipmentSlot = 'mainHand' | 'offHand' | 'head' | 'chest' | 'hands' | 'feet' | 'neck' | 'ring';
export type EquipmentCategory = 'weapon' | 'armor' | 'accessory' | 'shield';
export type EquipmentRarity = 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';

export interface Equipment {
  id: string;
  name: string;
  category: EquipmentCategory;
  slot: EquipmentSlot;
  rarity: EquipmentRarity;
  imagePromptHints: string;
  classRestrictions?: string[];
  icon: string; // Emoji for display
}

export interface EquippedItems {
  mainHand?: Equipment;
  offHand?: Equipment;
  head?: Equipment;
  chest?: Equipment;
  hands?: Equipment;
  feet?: Equipment;
  neck?: Equipment;
  ring?: Equipment;
}

// Weapons
export const WEAPONS: Equipment[] = [
  { id: 'longsword', name: 'Longsword', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'wielding a steel longsword', icon: '⚔️' },
  { id: 'greatsword', name: 'Greatsword', category: 'weapon', slot: 'mainHand', rarity: 'uncommon', imagePromptHints: 'wielding a massive two-handed greatsword', icon: '🗡️', classRestrictions: ['warrior'] },
  { id: 'battleaxe', name: 'Battle Axe', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'wielding a heavy battle axe', icon: '🪓' },
  { id: 'dagger', name: 'Dagger', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'wielding a curved dagger', icon: '🔪' },
  { id: 'dual-daggers', name: 'Dual Daggers', category: 'weapon', slot: 'mainHand', rarity: 'uncommon', imagePromptHints: 'wielding twin daggers', icon: '🗡️', classRestrictions: ['rogue'] },
  { id: 'staff', name: 'Wizard Staff', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'holding an ornate magical staff with glowing crystal', icon: '🪄', classRestrictions: ['mage', 'necromancer', 'warlock', 'sorcerer', 'druid'] },
  { id: 'gnarled-staff', name: 'Gnarled Staff', category: 'weapon', slot: 'mainHand', rarity: 'uncommon', imagePromptHints: 'holding a gnarled wooden druidic staff', icon: '🌿', classRestrictions: ['druid'] },
  { id: 'bow', name: 'Longbow', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'carrying a elegant longbow', icon: '🏹' },
  { id: 'crossbow', name: 'Crossbow', category: 'weapon', slot: 'mainHand', rarity: 'uncommon', imagePromptHints: 'holding a mechanical crossbow', icon: '🎯' },
  { id: 'wand', name: 'Magic Wand', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'holding a slender magic wand', icon: '✨', classRestrictions: ['mage', 'warlock', 'sorcerer'] },
  { id: 'lute', name: 'Enchanted Lute', category: 'weapon', slot: 'mainHand', rarity: 'uncommon', imagePromptHints: 'carrying an ornate lute', icon: '🎸', classRestrictions: ['bard'] },
  { id: 'mace', name: 'War Mace', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'wielding a heavy war mace', icon: '🔨' },
  { id: 'quarterstaff', name: 'Quarterstaff', category: 'weapon', slot: 'mainHand', rarity: 'common', imagePromptHints: 'holding a wooden quarterstaff', icon: '🥢', classRestrictions: ['monk'] },
  { id: 'scythe', name: 'Death Scythe', category: 'weapon', slot: 'mainHand', rarity: 'rare', imagePromptHints: 'wielding a dark curved scythe', icon: '⚰️', classRestrictions: ['necromancer'] },
];

// Shields & Offhand
export const OFFHAND: Equipment[] = [
  { id: 'tower-shield', name: 'Tower Shield', category: 'shield', slot: 'offHand', rarity: 'uncommon', imagePromptHints: 'carrying a large tower shield', icon: '🛡️', classRestrictions: ['warrior'] },
  { id: 'buckler', name: 'Buckler', category: 'shield', slot: 'offHand', rarity: 'common', imagePromptHints: 'with a small buckler on arm', icon: '🔘' },
  { id: 'kite-shield', name: 'Kite Shield', category: 'shield', slot: 'offHand', rarity: 'common', imagePromptHints: 'carrying a kite-shaped shield', icon: '🛡️' },
  { id: 'spellbook', name: 'Spellbook', category: 'accessory', slot: 'offHand', rarity: 'uncommon', imagePromptHints: 'holding an ancient spellbook', icon: '📖', classRestrictions: ['mage', 'warlock', 'sorcerer', 'necromancer'] },
  { id: 'orb', name: 'Arcane Orb', category: 'accessory', slot: 'offHand', rarity: 'rare', imagePromptHints: 'holding a glowing arcane orb', icon: '🔮', classRestrictions: ['mage', 'warlock', 'sorcerer'] },
  { id: 'skull', name: 'Necromancer Skull', category: 'accessory', slot: 'offHand', rarity: 'rare', imagePromptHints: 'holding a glowing skull focus', icon: '💀', classRestrictions: ['necromancer'] },
];

// Head Armor
export const HEAD_ARMOR: Equipment[] = [
  { id: 'plate-helm', name: 'Plate Helm', category: 'armor', slot: 'head', rarity: 'uncommon', imagePromptHints: 'wearing a full plate helmet', icon: '⛑️', classRestrictions: ['warrior'] },
  { id: 'leather-hood', name: 'Leather Hood', category: 'armor', slot: 'head', rarity: 'common', imagePromptHints: 'wearing a shadowy leather hood', icon: '🧥', classRestrictions: ['rogue'] },
  { id: 'wizard-hat', name: 'Wizard Hat', category: 'armor', slot: 'head', rarity: 'common', imagePromptHints: 'wearing a pointed wizard hat', icon: '🎩', classRestrictions: ['mage', 'warlock', 'sorcerer'] },
  { id: 'circlet', name: 'Golden Circlet', category: 'armor', slot: 'head', rarity: 'uncommon', imagePromptHints: 'wearing an elegant golden circlet', icon: '👑' },
  { id: 'horned-helm', name: 'Horned Helm', category: 'armor', slot: 'head', rarity: 'rare', imagePromptHints: 'wearing a menacing horned helmet', icon: '😈' },
  { id: 'flower-crown', name: 'Flower Crown', category: 'armor', slot: 'head', rarity: 'uncommon', imagePromptHints: 'wearing a crown of living flowers', icon: '🌸', classRestrictions: ['druid'] },
  { id: 'bards-cap', name: "Bard's Cap", category: 'armor', slot: 'head', rarity: 'common', imagePromptHints: 'wearing a feathered bard cap', icon: '🪶', classRestrictions: ['bard'] },
];

// Chest Armor
export const CHEST_ARMOR: Equipment[] = [
  { id: 'plate-armor', name: 'Plate Armor', category: 'armor', slot: 'chest', rarity: 'uncommon', imagePromptHints: 'wearing shining plate armor', icon: '🛡️', classRestrictions: ['warrior'] },
  { id: 'chainmail', name: 'Chainmail', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing chainmail armor', icon: '⛓️' },
  { id: 'leather-armor', name: 'Leather Armor', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing studded leather armor', icon: '🧥' },
  { id: 'robes', name: 'Mage Robes', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing flowing mage robes', icon: '👘', classRestrictions: ['mage', 'warlock', 'sorcerer'] },
  { id: 'dark-robes', name: 'Dark Robes', category: 'armor', slot: 'chest', rarity: 'uncommon', imagePromptHints: 'wearing ominous dark robes', icon: '🖤', classRestrictions: ['necromancer', 'warlock'] },
  { id: 'monk-garb', name: 'Monk Garb', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing simple monk robes', icon: '🥋', classRestrictions: ['monk'] },
  { id: 'bard-outfit', name: 'Performer Outfit', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing colorful performer clothing', icon: '🎭', classRestrictions: ['bard'] },
  { id: 'druid-vest', name: 'Nature Vest', category: 'armor', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing a leather vest with nature motifs', icon: '🌿', classRestrictions: ['druid'] },
];

// Accessories
export const ACCESSORIES: Equipment[] = [
  { id: 'amulet-power', name: 'Amulet of Power', category: 'accessory', slot: 'neck', rarity: 'rare', imagePromptHints: 'wearing a glowing amulet', icon: '📿' },
  { id: 'pendant', name: 'Crystal Pendant', category: 'accessory', slot: 'neck', rarity: 'uncommon', imagePromptHints: 'wearing a crystal pendant', icon: '💎' },
  { id: 'bone-necklace', name: 'Bone Necklace', category: 'accessory', slot: 'neck', rarity: 'uncommon', imagePromptHints: 'wearing a necklace of bones', icon: '🦴', classRestrictions: ['necromancer'] },
  { id: 'cloak', name: 'Adventurer Cloak', category: 'accessory', slot: 'chest', rarity: 'common', imagePromptHints: 'wearing a traveling cloak', icon: '🧣' },
  { id: 'shadow-cloak', name: 'Shadow Cloak', category: 'accessory', slot: 'chest', rarity: 'rare', imagePromptHints: 'wearing a cloak that blends with shadows', icon: '🌑', classRestrictions: ['rogue'] },
  { id: 'ring-fire', name: 'Ring of Fire', category: 'accessory', slot: 'ring', rarity: 'rare', imagePromptHints: 'wearing a ring with a flickering flame', icon: '🔥' },
  { id: 'ring-ice', name: 'Ring of Ice', category: 'accessory', slot: 'ring', rarity: 'rare', imagePromptHints: 'wearing a frost-covered ring', icon: '❄️' },
  { id: 'gauntlets', name: 'Steel Gauntlets', category: 'armor', slot: 'hands', rarity: 'common', imagePromptHints: 'wearing steel gauntlets', icon: '🧤', classRestrictions: ['warrior'] },
  { id: 'leather-gloves', name: 'Leather Gloves', category: 'armor', slot: 'hands', rarity: 'common', imagePromptHints: 'wearing leather gloves', icon: '🧤' },
  { id: 'boots-speed', name: 'Boots of Speed', category: 'armor', slot: 'feet', rarity: 'rare', imagePromptHints: 'wearing boots with winged anklets', icon: '👟' },
  { id: 'plate-boots', name: 'Plate Boots', category: 'armor', slot: 'feet', rarity: 'uncommon', imagePromptHints: 'wearing heavy plate boots', icon: '🥾', classRestrictions: ['warrior'] },
];

export const ALL_EQUIPMENT: Equipment[] = [
  ...WEAPONS,
  ...OFFHAND,
  ...HEAD_ARMOR,
  ...CHEST_ARMOR,
  ...ACCESSORIES,
];

export const DEFAULT_EQUIPPED: EquippedItems = {};

export function getEquipmentBySlot(slot: EquipmentSlot): Equipment[] {
  return ALL_EQUIPMENT.filter(e => e.slot === slot);
}

export function getEquipmentForClass(classId: string): Equipment[] {
  return ALL_EQUIPMENT.filter(e => 
    !e.classRestrictions || e.classRestrictions.includes(classId)
  );
}

export function generateEquipmentPrompt(equipped: EquippedItems): string {
  const hints: string[] = [];
  
  Object.values(equipped).forEach(item => {
    if (item) {
      hints.push(item.imagePromptHints);
    }
  });
  
  return hints.join(', ');
}

export function getRarityColor(rarity: EquipmentRarity): string {
  switch (rarity) {
    case 'common': return 'text-muted-foreground';
    case 'uncommon': return 'text-green-500';
    case 'rare': return 'text-blue-500';
    case 'epic': return 'text-purple-500';
    case 'legendary': return 'text-amber-500';
  }
}

export const SLOT_LABELS: Record<EquipmentSlot, string> = {
  mainHand: 'Main Hand',
  offHand: 'Off Hand',
  head: 'Head',
  chest: 'Chest',
  hands: 'Hands',
  feet: 'Feet',
  neck: 'Neck',
  ring: 'Ring',
};
