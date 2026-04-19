// Character Archetypes - personality traits, motivations, and story roles

export interface CharacterArchetype {
  id: string;
  name: string;
  description: string;
  personalityTraits: string[];
  motivations: string[];
  storyRoles: string[];
  flaws: string[];
  strengths: string[];
  suggestedRaces: string[];
  suggestedClasses: string[];
}

export const CHARACTER_ARCHETYPES: CharacterArchetype[] = [
  {
    id: 'hero',
    name: 'The Hero',
    description: 'A noble champion who rises to meet challenges and protect others.',
    personalityTraits: ['Brave', 'Selfless', 'Determined', 'Honorable'],
    motivations: ['Protect the innocent', 'Seek justice', 'Prove their worth', 'Fulfill a prophecy'],
    storyRoles: ['Protagonist', 'Leader', 'Champion', 'Savior'],
    flaws: ['Stubborn', 'Self-sacrificing to a fault', 'Struggles with failure'],
    strengths: ['Inspiring presence', 'Unwavering courage', 'Natural leader'],
    suggestedRaces: ['human', 'aasimar', 'dragonborn'],
    suggestedClasses: ['warrior', 'monk', 'druid']
  },
  {
    id: 'anti-hero',
    name: 'The Anti-Hero',
    description: 'A morally ambiguous figure who does right for wrong reasons.',
    personalityTraits: ['Cynical', 'Pragmatic', 'Independent', 'Ruthless'],
    motivations: ['Personal vengeance', 'Survival', 'Redemption', 'Self-interest that aligns with good'],
    storyRoles: ['Reluctant ally', 'Wild card', 'Reformed villain', 'Necessary evil'],
    flaws: ['Trust issues', 'Moral flexibility', 'Dark past'],
    strengths: ['Willing to do what others wont', 'Street smart', 'Unpredictable'],
    suggestedRaces: ['human', 'goliath', 'tabaxi'],
    suggestedClasses: ['rogue', 'warlock', 'necromancer']
  },
  {
    id: 'mentor',
    name: 'The Mentor',
    description: 'A wise guide who shares knowledge and prepares others for their journey.',
    personalityTraits: ['Wise', 'Patient', 'Mysterious', 'Protective'],
    motivations: ['Pass on knowledge', 'Guide the next generation', 'Atone for past mistakes'],
    storyRoles: ['Teacher', 'Advisor', 'Guardian', 'Oracle'],
    flaws: ['Keeps secrets', 'Overprotective', 'Haunted by past failures'],
    strengths: ['Vast knowledge', 'Strategic mind', 'Calm under pressure'],
    suggestedRaces: ['elf', 'gnome', 'human'],
    suggestedClasses: ['mage', 'druid', 'bard']
  },
  {
    id: 'trickster',
    name: 'The Trickster',
    description: 'A cunning figure who uses wit and deception to achieve their goals.',
    personalityTraits: ['Clever', 'Mischievous', 'Charming', 'Unpredictable'],
    motivations: ['Chaos for its own sake', 'Challenge authority', 'Personal amusement', 'Hidden agenda'],
    storyRoles: ['Comic relief', 'Spy', 'Catalyst', 'Double agent'],
    flaws: ['Unreliable', 'Self-serving', 'Addicted to risk'],
    strengths: ['Quick thinking', 'Social manipulation', 'Escape artist'],
    suggestedRaces: ['gnome', 'tabaxi', 'kenku'],
    suggestedClasses: ['rogue', 'bard', 'warlock']
  },
  {
    id: 'guardian',
    name: 'The Guardian',
    description: 'A steadfast protector devoted to defending others above all else.',
    personalityTraits: ['Loyal', 'Stoic', 'Dependable', 'Vigilant'],
    motivations: ['Protect a person or place', 'Fulfill a sacred duty', 'Honor a debt'],
    storyRoles: ['Bodyguard', 'Defender', 'Shield', 'Last line of defense'],
    flaws: ['Inflexible', 'Self-neglecting', 'Single-minded'],
    strengths: ['Unwavering loyalty', 'Physical prowess', 'Situational awareness'],
    suggestedRaces: ['dwarf', 'goliath', 'dragonborn'],
    suggestedClasses: ['warrior', 'monk', 'druid']
  },
  {
    id: 'outcast',
    name: 'The Outcast',
    description: 'A rejected soul seeking acceptance or revenge against society.',
    personalityTraits: ['Bitter', 'Resilient', 'Observant', 'Guarded'],
    motivations: ['Find belonging', 'Prove doubters wrong', 'Revenge on those who wronged them'],
    storyRoles: ['Sympathetic outsider', 'Hidden ally', 'Tragic figure', 'Unexpected hero'],
    flaws: ['Distrustful', 'Chip on shoulder', 'Difficulty connecting'],
    strengths: ['Self-reliant', 'Unique perspective', 'Nothing to lose'],
    suggestedRaces: ['kenku', 'goliath', 'dragonborn'],
    suggestedClasses: ['warlock', 'sorcerer', 'necromancer']
  },
  {
    id: 'scholar',
    name: 'The Scholar',
    description: 'A seeker of knowledge driven by curiosity and the pursuit of truth.',
    personalityTraits: ['Curious', 'Analytical', 'Absent-minded', 'Passionate'],
    motivations: ['Uncover ancient secrets', 'Solve mysteries', 'Advance understanding'],
    storyRoles: ['Researcher', 'Problem solver', 'Lore keeper', 'Voice of reason'],
    flaws: ['Socially awkward', 'Obsessive', 'Overlooks practical concerns'],
    strengths: ['Encyclopedic knowledge', 'Pattern recognition', 'Patience for detail'],
    suggestedRaces: ['elf', 'gnome', 'human'],
    suggestedClasses: ['mage', 'bard', 'warlock']
  },
  {
    id: 'rebel',
    name: 'The Rebel',
    description: 'A defiant spirit who challenges unjust systems and authority.',
    personalityTraits: ['Passionate', 'Idealistic', 'Reckless', 'Charismatic'],
    motivations: ['Overthrow tyranny', 'Fight for freedom', 'Inspire change'],
    storyRoles: ['Revolutionary', 'Voice of the people', 'Symbol of hope', 'Troublemaker'],
    flaws: ['Hot-headed', 'Black-and-white thinking', 'Martyr complex'],
    strengths: ['Inspiring leader', 'Fearless', 'Strong convictions'],
    suggestedRaces: ['human', 'aasimar', 'tabaxi'],
    suggestedClasses: ['rogue', 'bard', 'sorcerer']
  },
  {
    id: 'healer',
    name: 'The Healer',
    description: 'A compassionate soul dedicated to mending wounds of body and spirit.',
    personalityTraits: ['Compassionate', 'Gentle', 'Empathetic', 'Selfless'],
    motivations: ['Ease suffering', 'Preserve life', 'Atone through service'],
    storyRoles: ['Medic', 'Counselor', 'Moral compass', 'Peacemaker'],
    flaws: ['Takes on others pain', 'Avoids conflict', 'Guilt over those they couldnt save'],
    strengths: ['Calming presence', 'Medical expertise', 'Emotional intelligence'],
    suggestedRaces: ['aasimar', 'elf', 'human'],
    suggestedClasses: ['druid', 'monk', 'bard']
  },
  {
    id: 'avenger',
    name: 'The Avenger',
    description: 'A driven soul consumed by the need for revenge or justice.',
    personalityTraits: ['Driven', 'Intense', 'Focused', 'Haunted'],
    motivations: ['Avenge a wrong', 'Hunt a specific enemy', 'Destroy evil'],
    storyRoles: ['Hunter', 'Executioner', 'One-person army', 'Dark mirror'],
    flaws: ['Obsessive', 'Sacrifices everything for the mission', 'Losing humanity'],
    strengths: ['Relentless pursuit', 'Combat expertise', 'Fearless'],
    suggestedRaces: ['human', 'goliath', 'dragonborn'],
    suggestedClasses: ['warrior', 'rogue', 'necromancer']
  },
  {
    id: 'innocent',
    name: 'The Innocent',
    description: 'A pure-hearted soul whose optimism and kindness inspire others.',
    personalityTraits: ['Optimistic', 'Trusting', 'Curious', 'Kind'],
    motivations: ['See the best in people', 'Experience the world', 'Help those in need'],
    storyRoles: ['Heart of the group', 'Moral center', 'Catalyst for change', 'Protected one'],
    flaws: ['Naive', 'Easily manipulated', 'Struggles with harsh realities'],
    strengths: ['Brings out the best in others', 'Uncorrupted judgment', 'Hope in dark times'],
    suggestedRaces: ['gnome', 'aasimar', 'human'],
    suggestedClasses: ['bard', 'druid', 'monk']
  },
  {
    id: 'mastermind',
    name: 'The Mastermind',
    description: 'A brilliant strategist who plans several moves ahead.',
    personalityTraits: ['Calculating', 'Patient', 'Ambitious', 'Secretive'],
    motivations: ['Achieve grand plans', 'Outsmart opponents', 'Control outcomes'],
    storyRoles: ['Strategist', 'Manipulator', 'Hidden power', 'Chess master'],
    flaws: ['Arrogant', 'Underestimates emotion', 'Paranoid'],
    strengths: ['Strategic genius', 'Resource management', 'Long-term planning'],
    suggestedRaces: ['elf', 'human', 'gnome'],
    suggestedClasses: ['mage', 'warlock', 'rogue']
  }
];

export function getArchetypeById(id: string): CharacterArchetype | undefined {
  return CHARACTER_ARCHETYPES.find(a => a.id === id);
}

export function getSuggestedArchetypes(raceId: string, classId: string): CharacterArchetype[] {
  return CHARACTER_ARCHETYPES.filter(archetype => 
    archetype.suggestedRaces.includes(raceId) || 
    archetype.suggestedClasses.includes(classId)
  ).slice(0, 4);
}

export function generateArchetypePromptModifier(archetype: CharacterArchetype): string {
  const traits = archetype.personalityTraits.slice(0, 2).join(' and ');
  const role = archetype.storyRoles[0];
  return `Character embodies the ${archetype.name} archetype: ${traits}, serving as the ${role}`;
}
