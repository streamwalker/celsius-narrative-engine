import { ArtStyle, ArtStyleConfig, getStyleById } from './art-styles';

export type StoryGenre =
  | 'action'
  | 'romance'
  | 'horror'
  | 'sci-fi'
  | 'fantasy'
  | 'mystery'
  | 'comedy'
  | 'drama'
  | 'superhero'
  | 'slice-of-life';

export interface GenreConfig {
  id: StoryGenre;
  name: string;
  icon: string;
  primaryStyles: ArtStyle[];
  secondaryStyles: ArtStyle[];
  reasoning: string;
}

export const GENRE_CONFIGS: GenreConfig[] = [
  {
    id: 'action',
    name: 'Action',
    icon: '💥',
    primaryStyles: ['jim-lee', 'todd-mcfarlane', 'mark-silvestri'],
    secondaryStyles: ['western', 'arthur-adams'],
    reasoning: 'Dynamic poses, intense energy, and kinetic motion',
  },
  {
    id: 'romance',
    name: 'Romance',
    icon: '💕',
    primaryStyles: ['wendy-pini', 'manga', 'watercolor'],
    secondaryStyles: ['alan-davis', 'oliver-coipel'],
    reasoning: 'Emotional expression and soft aesthetics',
  },
  {
    id: 'horror',
    name: 'Horror',
    icon: '👻',
    primaryStyles: ['mike-mignola', 'frank-miller', 'noir'],
    secondaryStyles: ['barry-windsor-smith'],
    reasoning: 'Gothic shadows and atmospheric tension',
  },
  {
    id: 'sci-fi',
    name: 'Sci-Fi',
    icon: '🚀',
    primaryStyles: ['moebius', 'oliver-coipel'],
    secondaryStyles: ['western', 'jim-lee'],
    reasoning: 'Surreal landscapes and futuristic aesthetics',
  },
  {
    id: 'fantasy',
    name: 'Fantasy',
    icon: '🐉',
    primaryStyles: ['barry-windsor-smith', 'wendy-pini', 'arthur-adams'],
    secondaryStyles: ['watercolor', 'moebius'],
    reasoning: 'Ornate, illustrative, and mythical atmosphere',
  },
  {
    id: 'mystery',
    name: 'Mystery',
    icon: '🔍',
    primaryStyles: ['noir', 'frank-miller', 'mike-mignola'],
    secondaryStyles: ['oliver-coipel'],
    reasoning: 'High contrast and moody atmosphere',
  },
  {
    id: 'comedy',
    name: 'Comedy',
    icon: '😄',
    primaryStyles: ['manga', 'western', 'alan-davis'],
    secondaryStyles: ['wendy-pini'],
    reasoning: 'Expressive faces and dynamic expressions',
  },
  {
    id: 'drama',
    name: 'Drama',
    icon: '🎭',
    primaryStyles: ['alex-ross', 'oliver-coipel', 'john-byrne'],
    secondaryStyles: ['alan-davis', 'watercolor'],
    reasoning: 'Emotional realism and cinematic storytelling',
  },
  {
    id: 'superhero',
    name: 'Superhero',
    icon: '🦸',
    primaryStyles: ['jim-lee', 'john-byrne', 'alex-ross'],
    secondaryStyles: ['western', 'arthur-adams', 'todd-mcfarlane'],
    reasoning: 'Classic heroic poses and iconic imagery',
  },
  {
    id: 'slice-of-life',
    name: 'Slice of Life',
    icon: '☕',
    primaryStyles: ['manga', 'watercolor', 'wendy-pini'],
    secondaryStyles: ['alan-davis'],
    reasoning: 'Soft, everyday aesthetic with warmth',
  },
];

export function getGenreConfig(genre: StoryGenre): GenreConfig {
  return GENRE_CONFIGS.find(g => g.id === genre) || GENRE_CONFIGS[0];
}

export function getRecommendedStylesForGenre(genre: StoryGenre): {
  primary: ArtStyleConfig[];
  secondary: ArtStyleConfig[];
} {
  const config = getGenreConfig(genre);
  return {
    primary: config.primaryStyles.map(id => getStyleById(id)),
    secondary: config.secondaryStyles.map(id => getStyleById(id)),
  };
}

export function getStyleCompatibilityScore(style: ArtStyle, genre: StoryGenre): number {
  const config = getGenreConfig(genre);
  
  if (config.primaryStyles.includes(style)) {
    return 95 + Math.floor(Math.random() * 5); // 95-99
  }
  
  if (config.secondaryStyles.includes(style)) {
    return 75 + Math.floor(Math.random() * 15); // 75-89
  }
  
  return 40 + Math.floor(Math.random() * 25); // 40-64
}

// Keywords for auto-detection
const GENRE_KEYWORDS: Record<StoryGenre, string[]> = {
  action: ['fight', 'battle', 'explosion', 'chase', 'combat', 'attack', 'punch', 'kick', 'war', 'weapon'],
  romance: ['love', 'heart', 'kiss', 'relationship', 'date', 'romantic', 'embrace', 'wedding', 'couple'],
  horror: ['scary', 'monster', 'dark', 'blood', 'fear', 'nightmare', 'haunted', 'demon', 'ghost', 'undead'],
  'sci-fi': ['space', 'robot', 'future', 'alien', 'technology', 'spaceship', 'planet', 'cyber', 'laser'],
  fantasy: ['magic', 'dragon', 'wizard', 'elf', 'kingdom', 'sword', 'quest', 'mythical', 'enchanted', 'spell'],
  mystery: ['detective', 'clue', 'crime', 'investigation', 'suspect', 'secret', 'murder', 'solve', 'evidence'],
  comedy: ['funny', 'joke', 'laugh', 'silly', 'humor', 'prank', 'comic', 'gag', 'absurd'],
  drama: ['emotional', 'conflict', 'tension', 'relationship', 'struggle', 'betrayal', 'family', 'loss', 'growth'],
  superhero: ['hero', 'villain', 'power', 'cape', 'mask', 'save', 'justice', 'super', 'sidekick', 'rescue'],
  'slice-of-life': ['everyday', 'school', 'work', 'friend', 'coffee', 'home', 'routine', 'peaceful', 'casual'],
};

export function detectGenreFromScript(script: string): { genre: StoryGenre; confidence: number } | null {
  if (!script || script.trim().length < 20) return null;

  const lowerScript = script.toLowerCase();
  const scores: Record<StoryGenre, number> = {} as Record<StoryGenre, number>;

  for (const [genre, keywords] of Object.entries(GENRE_KEYWORDS)) {
    const matches = keywords.filter(keyword => lowerScript.includes(keyword)).length;
    scores[genre as StoryGenre] = matches;
  }

  const entries = Object.entries(scores);
  const maxEntry = entries.reduce((a, b) => (b[1] > a[1] ? b : a));

  if (maxEntry[1] === 0) return null;

  const totalMatches = entries.reduce((sum, [, count]) => sum + count, 0);
  const confidence = Math.min(95, Math.round((maxEntry[1] / totalMatches) * 100 + maxEntry[1] * 5));

  return {
    genre: maxEntry[0] as StoryGenre,
    confidence,
  };
}
