export interface ClassAbility {
  name: string;
  description: string;
  level: number;
}

export interface CharacterClass {
  id: string;
  name: string;
  description: string;
  role: 'tank' | 'damage' | 'healer' | 'support' | 'hybrid';
  primaryStats: string[];
  abilities: ClassAbility[];
  startingEquipment: string[];
  imagePromptHints: string;
}

export const CLASSES: CharacterClass[] = [
  {
    id: 'warrior',
    name: 'Warrior',
    description: 'Masters of martial combat, warriors excel in close-quarters battle.',
    role: 'tank',
    primaryStats: ['strength', 'constitution'],
    abilities: [
      { name: 'Shield Wall', description: 'Increases defense for you and nearby allies.', level: 1 },
      { name: 'Power Strike', description: 'A devastating blow that deals extra damage.', level: 3 },
      { name: 'Battle Cry', description: 'Intimidates enemies and boosts ally morale.', level: 5 },
    ],
    startingEquipment: ['Longsword', 'Shield', 'Chain Mail'],
    imagePromptHints: 'heavily armored warrior, sword and shield, battle-ready stance',
  },
  {
    id: 'mage',
    name: 'Mage',
    description: 'Wielders of arcane power, mages command destructive magical forces.',
    role: 'damage',
    primaryStats: ['intelligence', 'wisdom'],
    abilities: [
      { name: 'Arcane Bolt', description: 'A beam of pure magical energy.', level: 1 },
      { name: 'Fireball', description: 'An explosive ball of fire.', level: 3 },
      { name: 'Teleport', description: 'Instantly move to a nearby location.', level: 5 },
    ],
    startingEquipment: ['Staff', 'Spellbook', 'Robes'],
    imagePromptHints: 'robed mage, magical staff, arcane symbols, mystical aura',
  },
  {
    id: 'rogue',
    name: 'Rogue',
    description: 'Silent and deadly, rogues strike from the shadows with precision.',
    role: 'damage',
    primaryStats: ['dexterity', 'charisma'],
    abilities: [
      { name: 'Backstab', description: 'Deal critical damage from behind.', level: 1 },
      { name: 'Stealth', description: 'Become invisible to enemies.', level: 3 },
      { name: 'Poison Blade', description: 'Coat weapons with deadly poison.', level: 5 },
    ],
    startingEquipment: ['Daggers', 'Leather Armor', 'Lockpicks'],
    imagePromptHints: 'hooded rogue, dual daggers, leather armor, shadowy figure',
  },
  {
    id: 'cleric',
    name: 'Cleric',
    description: 'Holy warriors who channel divine power to heal and protect.',
    role: 'healer',
    primaryStats: ['wisdom', 'constitution'],
    abilities: [
      { name: 'Heal', description: 'Restore health to an ally.', level: 1 },
      { name: 'Divine Shield', description: 'Create a protective barrier.', level: 3 },
      { name: 'Smite', description: 'Call down holy wrath on enemies.', level: 5 },
    ],
    startingEquipment: ['Mace', 'Holy Symbol', 'Scale Mail'],
    imagePromptHints: 'armored cleric, holy symbol, divine light, protective stance',
  },
  {
    id: 'ranger',
    name: 'Ranger',
    description: 'Masters of the wilderness, rangers are deadly with bow and blade.',
    role: 'hybrid',
    primaryStats: ['dexterity', 'wisdom'],
    abilities: [
      { name: 'Aimed Shot', description: 'A precise arrow that deals extra damage.', level: 1 },
      { name: 'Animal Companion', description: 'Summon a loyal animal ally.', level: 3 },
      { name: 'Nature\'s Wrath', description: 'Call upon nature to strike foes.', level: 5 },
    ],
    startingEquipment: ['Longbow', 'Short Sword', 'Leather Armor'],
    imagePromptHints: 'ranger with bow, forest attire, hooded cloak, nature-themed',
  },
  {
    id: 'paladin',
    name: 'Paladin',
    description: 'Holy knights who combine martial prowess with divine magic.',
    role: 'tank',
    primaryStats: ['strength', 'charisma'],
    abilities: [
      { name: 'Lay on Hands', description: 'Heal through divine touch.', level: 1 },
      { name: 'Divine Smite', description: 'Infuse attacks with holy power.', level: 3 },
      { name: 'Aura of Protection', description: 'Shield nearby allies from harm.', level: 5 },
    ],
    startingEquipment: ['Greatsword', 'Plate Armor', 'Holy Symbol'],
    imagePromptHints: 'paladin in shining armor, holy symbol, radiant glow, noble bearing',
  },
  {
    id: 'necromancer',
    name: 'Necromancer',
    description: 'Masters of death magic who command undead and drain life force.',
    role: 'damage',
    primaryStats: ['intelligence', 'constitution'],
    abilities: [
      { name: 'Raise Dead', description: 'Animate a corpse to fight for you.', level: 1 },
      { name: 'Life Drain', description: 'Steal life force from enemies.', level: 3 },
      { name: 'Bone Shield', description: 'Create a barrier of bones for protection.', level: 5 },
    ],
    startingEquipment: ['Bone Staff', 'Dark Robes', 'Skull Focus'],
    imagePromptHints: 'necromancer, dark robes, skull motifs, pale skin, glowing eyes, death magic',
  },
  {
    id: 'bard',
    name: 'Bard',
    description: 'Musical magic-users who inspire allies and confound enemies.',
    role: 'support',
    primaryStats: ['charisma', 'dexterity'],
    abilities: [
      { name: 'Inspire', description: 'Grant allies bonus to their actions.', level: 1 },
      { name: 'Cutting Words', description: 'Distract and debilitate enemies.', level: 3 },
      { name: 'Song of Rest', description: 'Help allies recover during rest.', level: 5 },
    ],
    startingEquipment: ['Lute', 'Rapier', 'Fine Clothes'],
    imagePromptHints: 'bard, musical instrument, colorful clothes, charming smile, performer',
  },
  {
    id: 'monk',
    name: 'Monk',
    description: 'Martial artists who channel ki for devastating attacks.',
    role: 'hybrid',
    primaryStats: ['dexterity', 'wisdom'],
    abilities: [
      { name: 'Flurry of Blows', description: 'Unleash rapid unarmed strikes.', level: 1 },
      { name: 'Deflect Missiles', description: 'Catch and return projectiles.', level: 3 },
      { name: 'Stunning Strike', description: 'Stun enemies with ki-infused attacks.', level: 5 },
    ],
    startingEquipment: ['Simple Robes', 'Quarterstaff', 'Meditation Beads'],
    imagePromptHints: 'monk, simple robes, martial arts stance, focused expression, barefoot',
  },
  {
    id: 'druid',
    name: 'Druid',
    description: 'Nature magic wielders who can transform into beasts.',
    role: 'hybrid',
    primaryStats: ['wisdom', 'constitution'],
    abilities: [
      { name: 'Wild Shape', description: 'Transform into an animal.', level: 1 },
      { name: 'Entangle', description: 'Cause plants to restrain enemies.', level: 3 },
      { name: 'Call Lightning', description: 'Summon a storm to strike foes.', level: 5 },
    ],
    startingEquipment: ['Wooden Staff', 'Hide Armor', 'Totem'],
    imagePromptHints: 'druid, nature-themed robes, leaves and vines, wooden staff, wild hair',
  },
  {
    id: 'warlock',
    name: 'Warlock',
    description: 'Seekers of forbidden knowledge who forge pacts with powerful beings.',
    role: 'damage',
    primaryStats: ['charisma', 'constitution'],
    abilities: [
      { name: 'Eldritch Blast', description: 'A beam of crackling energy.', level: 1 },
      { name: 'Hex', description: 'Curse an enemy for extra damage.', level: 3 },
      { name: 'Dark One\'s Blessing', description: 'Gain temporary life when felling foes.', level: 5 },
    ],
    startingEquipment: ['Tome of Shadows', 'Leather Armor', 'Arcane Focus'],
    imagePromptHints: 'warlock, dark mysterious robes, eldritch symbols, glowing eyes, otherworldly aura',
  },
  {
    id: 'sorcerer',
    name: 'Sorcerer',
    description: 'Born with innate magical power flowing through their blood.',
    role: 'damage',
    primaryStats: ['charisma', 'constitution'],
    abilities: [
      { name: 'Wild Magic', description: 'Raw magical surges of power.', level: 1 },
      { name: 'Metamagic', description: 'Twist spells for unique effects.', level: 3 },
      { name: 'Sorcerous Origin', description: 'Manifest bloodline powers.', level: 5 },
    ],
    startingEquipment: ['Arcane Orb', 'Fine Robes', 'Component Pouch'],
    imagePromptHints: 'sorcerer, magical aura, glowing eyes, flowing robes, raw magical energy',
  },
];

export function getClassById(id: string): CharacterClass | undefined {
  return CLASSES.find(c => c.id === id);
}
