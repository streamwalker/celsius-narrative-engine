import { ArtStyle, StyleMix, ART_STYLES, getStyleById, generateMixedStylePrompt } from './art-styles';
import { StoryGenre, getRecommendedStylesForGenre } from './style-recommendations';

export type RandomizerMode = 'full-random' | 'genre-aware' | 'complementary';

export interface RandomizerConfig {
  mode: RandomizerMode;
  excludeStyles?: ArtStyle[];
  genre?: StoryGenre;
  intensityRange?: { min: number; max: number };
}

export interface RandomizedResult {
  mix: StyleMix;
  promptModifier: string;
  compatibilityScore: number;
  funFact: string;
}

const COMPLEMENTARY_PAIRS: [ArtStyle, ArtStyle][] = [
  ['jim-lee', 'manga'],
  ['mike-mignola', 'watercolor'],
  ['alex-ross', 'noir'],
  ['moebius', 'frank-miller'],
  ['wendy-pini', 'barry-windsor-smith'],
  ['todd-mcfarlane', 'oliver-coipel'],
  ['john-byrne', 'alan-davis'],
  ['mark-silvestri', 'jim-lee'],
  ['manga', 'alex-ross'],
  ['noir', 'moebius'],
  ['watercolor', 'frank-miller'],
];

const FUN_FACTS: Record<string, string> = {
  'jim-lee+manga': 'This blend combines 90s superhero dynamism with manga expressiveness!',
  'mike-mignola+watercolor': 'Gothic shadows meet ethereal washes for haunting beauty!',
  'alex-ross+noir': 'Painterly realism dipped in noir mystery!',
  'moebius+frank-miller': 'Surreal sci-fi landscapes clash with urban brutalism!',
  'wendy-pini+barry-windsor-smith': 'Fantasy elegance doubled for maximum mythical beauty!',
  'todd-mcfarlane+oliver-coipel': 'Dark 90s edge meets modern cinematic polish!',
  'john-byrne+alan-davis': 'Classic Bronze Age storytelling in perfect harmony!',
  'manga+alex-ross': 'Anime energy meets painted realism - like an anime movie!',
  'noir+moebius': 'Shadow and light dance through alien dreamscapes!',
  'watercolor+frank-miller': 'Delicate washes tamed by bold noir lines!',
};

const GENERIC_FUN_FACTS = [
  'An unexpected blend that might create something magical!',
  'Breaking the rules often leads to the most interesting results!',
  'This combination could define a whole new genre!',
  'Sometimes the best art comes from unlikely pairings!',
  'A bold mix that challenges conventional style choices!',
  'Creative experimentation at its finest!',
  'This blend might surprise you with its unique charm!',
];

function getRandomElement<T>(array: T[]): T {
  return array[Math.floor(Math.random() * array.length)];
}

function getRandomIntensity(min: number = 50, max: number = 85): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function getAllStyles(): ArtStyle[] {
  return ART_STYLES.map(s => s.id as ArtStyle);
}

function filterStyles(styles: ArtStyle[], exclude?: ArtStyle[]): ArtStyle[] {
  if (!exclude || exclude.length === 0) return styles;
  return styles.filter(s => !exclude.includes(s));
}

function calculateCompatibility(primary: ArtStyle, secondary: ArtStyle): number {
  // Check if it's a known complementary pair
  const isPair = COMPLEMENTARY_PAIRS.some(
    ([a, b]) => (a === primary && b === secondary) || (a === secondary && b === primary)
  );
  if (isPair) return 85 + Math.floor(Math.random() * 15);
  
  // Check if same category (both artist or both general)
  const primaryConfig = getStyleById(primary);
  const secondaryConfig = getStyleById(secondary);
  const sameCategory = primaryConfig?.category === secondaryConfig?.category;
  
  if (sameCategory) {
    return 60 + Math.floor(Math.random() * 20);
  }
  
  // Mixed category (artist + general) usually works well
  return 70 + Math.floor(Math.random() * 20);
}

function getFunFact(primary: ArtStyle, secondary: ArtStyle): string {
  const key1 = `${primary}+${secondary}`;
  const key2 = `${secondary}+${primary}`;
  
  if (FUN_FACTS[key1]) return FUN_FACTS[key1];
  if (FUN_FACTS[key2]) return FUN_FACTS[key2];
  
  return getRandomElement(GENERIC_FUN_FACTS);
}

export function randomizeStyle(config: RandomizerConfig): RandomizedResult {
  const { mode, excludeStyles, genre, intensityRange } = config;
  const minIntensity = intensityRange?.min ?? 50;
  const maxIntensity = intensityRange?.max ?? 85;
  
  let primaryStyle: ArtStyle;
  let secondaryStyle: ArtStyle;
  
  switch (mode) {
    case 'complementary': {
      const availablePairs = COMPLEMENTARY_PAIRS.filter(
        ([a, b]) => !excludeStyles?.includes(a) && !excludeStyles?.includes(b)
      );
      if (availablePairs.length > 0) {
        const [a, b] = getRandomElement(availablePairs);
        primaryStyle = Math.random() > 0.5 ? a : b;
        secondaryStyle = primaryStyle === a ? b : a;
      } else {
        // Fallback to full random
        const allStyles = filterStyles(getAllStyles(), excludeStyles);
        primaryStyle = getRandomElement(allStyles);
        secondaryStyle = getRandomElement(allStyles.filter(s => s !== primaryStyle));
      }
      break;
    }
    
    case 'genre-aware': {
      if (genre) {
        const recommended = getRecommendedStylesForGenre(genre);
        const allRecommended = [...recommended.primary, ...recommended.secondary];
        const available = filterStyles(
          allRecommended.map(s => s.id as ArtStyle),
          excludeStyles
        );
        
        if (available.length >= 2) {
          primaryStyle = getRandomElement(available);
          secondaryStyle = getRandomElement(available.filter(s => s !== primaryStyle));
        } else {
          const allStyles = filterStyles(getAllStyles(), excludeStyles);
          primaryStyle = available[0] || getRandomElement(allStyles);
          secondaryStyle = getRandomElement(allStyles.filter(s => s !== primaryStyle));
        }
      } else {
        const allStyles = filterStyles(getAllStyles(), excludeStyles);
        primaryStyle = getRandomElement(allStyles);
        secondaryStyle = getRandomElement(allStyles.filter(s => s !== primaryStyle));
      }
      break;
    }
    
    case 'full-random':
    default: {
      const allStyles = filterStyles(getAllStyles(), excludeStyles);
      primaryStyle = getRandomElement(allStyles);
      secondaryStyle = getRandomElement(allStyles.filter(s => s !== primaryStyle));
      break;
    }
  }
  
  const primaryIntensity = getRandomIntensity(minIntensity, maxIntensity);
  const secondaryIntensity = 100 - primaryIntensity;
  
  const mix: StyleMix = {
    primaryStyle,
    secondaryStyle,
    primaryIntensity,
    secondaryIntensity
  };
  
  return {
    mix,
    promptModifier: generateMixedStylePrompt(mix),
    compatibilityScore: calculateCompatibility(primaryStyle, secondaryStyle),
    funFact: getFunFact(primaryStyle, secondaryStyle)
  };
}

export function getRandomizerModes(): { id: RandomizerMode; name: string; description: string }[] {
  return [
    { id: 'full-random', name: 'Full Random', description: 'Completely random style combinations' },
    { id: 'complementary', name: 'Complementary', description: 'Curated pairs that work well together' },
    { id: 'genre-aware', name: 'Genre-Aware', description: 'Random within genre-appropriate styles' }
  ];
}
