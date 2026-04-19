export interface RaceAppearanceModifiers {
  skinTones: string[];
  earType: 'normal' | 'pointed' | 'small' | 'large';
  heightModifier: number; // -0.3 to +0.3
  buildModifier: number; // -0.3 to +0.3
}

export interface Race {
  id: string;
  name: string;
  description: string;
  traits: string[];
  appearanceModifiers: RaceAppearanceModifiers;
  statBonuses: Partial<Record<string, number>>;
  lore: string;
  imagePromptHints: string;
}

export const RACES: Race[] = [
  {
    id: 'human',
    name: 'Human',
    description: 'Versatile and ambitious, humans are the most adaptable of all races.',
    traits: ['Versatile', 'Ambitious', 'Resourceful'],
    appearanceModifiers: {
      skinTones: ['pale', 'fair', 'tan', 'olive', 'brown', 'dark'],
      earType: 'normal',
      heightModifier: 0,
      buildModifier: 0,
    },
    statBonuses: { strength: 1, dexterity: 1, intelligence: 1, wisdom: 1, charisma: 1 },
    lore: 'Humans are the youngest of the civilized races, but their ambition and adaptability have allowed them to spread across the world.',
    imagePromptHints: 'human, realistic proportions',
  },
  {
    id: 'elf',
    name: 'Elf',
    description: 'Graceful and long-lived, elves are masters of magic and archery.',
    traits: ['Graceful', 'Long-lived', 'Keen Senses'],
    appearanceModifiers: {
      skinTones: ['pale', 'fair', 'golden', 'bronze', 'silver-tinged'],
      earType: 'pointed',
      heightModifier: 0.1,
      buildModifier: -0.2,
    },
    statBonuses: { dexterity: 2, intelligence: 1 },
    lore: 'The elves are an ancient people, attuned to the natural world and the arcane mysteries of existence.',
    imagePromptHints: 'elf, pointed ears, slender and graceful, elegant features',
  },
  {
    id: 'dwarf',
    name: 'Dwarf',
    description: 'Stout and hardy, dwarves are master craftsmen and fierce warriors.',
    traits: ['Sturdy', 'Craftsman', 'Resilient'],
    appearanceModifiers: {
      skinTones: ['pale', 'ruddy', 'tan', 'grey-tinged'],
      earType: 'small',
      heightModifier: -0.25,
      buildModifier: 0.3,
    },
    statBonuses: { constitution: 2, strength: 1 },
    lore: 'Born from the mountains, dwarves are renowned for their endurance, craftsmanship, and love of ale.',
    imagePromptHints: 'dwarf, short and stocky, thick beard, muscular build',
  },
  {
    id: 'orc',
    name: 'Orc',
    description: 'Powerful and fearsome, orcs are born warriors with unmatched strength.',
    traits: ['Powerful', 'Aggressive', 'Enduring'],
    appearanceModifiers: {
      skinTones: ['green', 'grey', 'brown', 'olive-green'],
      earType: 'pointed',
      heightModifier: 0.2,
      buildModifier: 0.3,
    },
    statBonuses: { strength: 2, constitution: 1 },
    lore: 'Orcs are fierce warriors from the harsh wastelands, their culture built around strength and honor in battle.',
    imagePromptHints: 'orc, tusks, green-grey skin, muscular and imposing',
  },
  {
    id: 'halfling',
    name: 'Halfling',
    description: 'Small but clever, halflings are nimble and lucky.',
    traits: ['Lucky', 'Nimble', 'Brave'],
    appearanceModifiers: {
      skinTones: ['pale', 'fair', 'tan', 'warm brown'],
      earType: 'small',
      heightModifier: -0.4,
      buildModifier: -0.1,
    },
    statBonuses: { dexterity: 2, charisma: 1 },
    lore: 'Halflings are a cheerful folk who value comfort and community, but possess surprising courage when needed.',
    imagePromptHints: 'halfling, small stature, curly hair, friendly face, bare feet',
  },
  {
    id: 'tiefling',
    name: 'Tiefling',
    description: 'Descended from fiends, tieflings bear the mark of their infernal heritage.',
    traits: ['Infernal Heritage', 'Charismatic', 'Resistant'],
    appearanceModifiers: {
      skinTones: ['red', 'purple', 'blue', 'ashen grey', 'dark crimson'],
      earType: 'pointed',
      heightModifier: 0,
      buildModifier: 0,
    },
    statBonuses: { charisma: 2, intelligence: 1 },
    lore: 'Tieflings carry the bloodline of fiends, their horns and tails marking them as outsiders in most societies.',
    imagePromptHints: 'tiefling, horns, tail, unusual skin color, glowing eyes',
  },
  {
    id: 'dragonborn',
    name: 'Dragonborn',
    description: 'Proud dragon-blooded warriors with breath weapons and scales.',
    traits: ['Draconic Ancestry', 'Breath Weapon', 'Fearless'],
    appearanceModifiers: {
      skinTones: ['red scales', 'blue scales', 'green scales', 'gold scales', 'silver scales', 'black scales', 'white scales'],
      earType: 'small',
      heightModifier: 0.15,
      buildModifier: 0.25,
    },
    statBonuses: { strength: 2, charisma: 1 },
    lore: 'Dragonborn are proud, honorable warriors who carry the blood of true dragons in their veins.',
    imagePromptHints: 'dragonborn, dragon head, scaled skin, muscular, draconic features, no hair',
  },
  {
    id: 'gnome',
    name: 'Gnome',
    description: 'Tiny and clever, gnomes are natural tinkers and illusionists.',
    traits: ['Inventor', 'Illusionist', 'Curious'],
    appearanceModifiers: {
      skinTones: ['pale', 'tan', 'bronze', 'grey-tinged'],
      earType: 'pointed',
      heightModifier: -0.35,
      buildModifier: -0.15,
    },
    statBonuses: { intelligence: 2, constitution: 1 },
    lore: 'Gnomes are curious inventors and natural tricksters, their minds always racing with new ideas.',
    imagePromptHints: 'gnome, very small, pointed ears, wild hair, large expressive eyes, cheerful',
  },
  {
    id: 'aasimar',
    name: 'Aasimar',
    description: 'Celestial-touched beings with radiant souls and divine heritage.',
    traits: ['Celestial Heritage', 'Healing Hands', 'Radiant Soul'],
    appearanceModifiers: {
      skinTones: ['pale luminous', 'golden', 'silver', 'bronze', 'ethereal white'],
      earType: 'normal',
      heightModifier: 0.05,
      buildModifier: 0,
    },
    statBonuses: { charisma: 2, wisdom: 1 },
    lore: 'Aasimar are mortals touched by the divine, bearing celestial blood and destined for greatness.',
    imagePromptHints: 'aasimar, ethereal beauty, glowing eyes, subtle halo, radiant skin, angelic features',
  },
  {
    id: 'goliath',
    name: 'Goliath',
    description: 'Mountain-born giants with stone-like endurance and unmatched strength.',
    traits: ['Stone Endurance', 'Powerful Build', 'Mountain Born'],
    appearanceModifiers: {
      skinTones: ['grey', 'stone grey', 'pale grey', 'blue-grey'],
      earType: 'normal',
      heightModifier: 0.35,
      buildModifier: 0.35,
    },
    statBonuses: { strength: 2, constitution: 1 },
    lore: 'Goliaths are born in the highest mountain peaks, their culture built on competition and self-reliance.',
    imagePromptHints: 'goliath, very tall, grey skin, bald, tribal markings, muscular, stone-like',
  },
  {
    id: 'kenku',
    name: 'Kenku',
    description: 'Raven-folk mimics who lost their flight but gained cunning.',
    traits: ['Mimicry', 'Expert Forgery', 'Ambusher'],
    appearanceModifiers: {
      skinTones: ['black feathers', 'dark grey feathers', 'brown feathers'],
      earType: 'small',
      heightModifier: -0.1,
      buildModifier: -0.1,
    },
    statBonuses: { dexterity: 2, wisdom: 1 },
    lore: 'Kenku are cursed raven-folk, stripped of flight and original voice, yet masters of imitation.',
    imagePromptHints: 'kenku, raven humanoid, black feathers, bird beak, bird-like eyes, hunched',
  },
  {
    id: 'tabaxi',
    name: 'Tabaxi',
    description: 'Cat-like humanoids driven by curiosity and incredible agility.',
    traits: ['Feline Agility', 'Cat Claws', 'Curiosity'],
    appearanceModifiers: {
      skinTones: ['spotted fur', 'striped fur', 'solid fur', 'tawny', 'grey', 'black'],
      earType: 'large',
      heightModifier: 0.05,
      buildModifier: -0.1,
    },
    statBonuses: { dexterity: 2, charisma: 1 },
    lore: 'Tabaxi are wandering cat-folk, driven by insatiable curiosity to explore and collect stories.',
    imagePromptHints: 'tabaxi, cat humanoid, fur, cat ears, cat eyes, tail, agile build, feline features',
  },
];

export function getRaceById(id: string): Race | undefined {
  return RACES.find(r => r.id === id);
}
