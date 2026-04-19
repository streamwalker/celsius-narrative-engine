import { ArtStyle, StyleMix, getStyleById } from './art-styles';
import { StoryGenre, detectGenreFromScript } from './style-recommendations';

export interface StyleTemplate {
  id: string;
  name: string;
  description: string;
  icon: string;
  genre: StoryGenre;
  primaryStyle: ArtStyle;
  secondaryStyle: ArtStyle;
  primaryIntensity: number;
  secondaryIntensity: number;
  moodKeywords: string[];
  exampleScenes: string[];
}

export const STYLE_TEMPLATES: StyleTemplate[] = [
  {
    id: 'action-manga',
    name: 'Action Manga',
    description: 'Explosive action with manga speed lines and dramatic poses',
    icon: '⚡',
    genre: 'action',
    primaryStyle: 'jim-lee',
    secondaryStyle: 'manga',
    primaryIntensity: 60,
    secondaryIntensity: 40,
    moodKeywords: ['intense', 'dynamic', 'explosive', 'fast-paced'],
    exampleScenes: ['Epic fight sequences', 'Character power-ups', 'Chase scenes']
  },
  {
    id: 'noir-detective',
    name: 'Noir Detective',
    description: 'Classic crime drama with stark shadows and urban grit',
    icon: '🕵️',
    genre: 'mystery',
    primaryStyle: 'frank-miller',
    secondaryStyle: 'noir',
    primaryIntensity: 70,
    secondaryIntensity: 30,
    moodKeywords: ['dark', 'mysterious', 'gritty', 'moody'],
    exampleScenes: ['Rainy city streets', 'Interrogation rooms', 'Crime scenes']
  },
  {
    id: 'fantasy-epic',
    name: 'Fantasy Epic',
    description: 'Ornate mythical adventures with painterly backgrounds',
    icon: '🏰',
    genre: 'fantasy',
    primaryStyle: 'barry-windsor-smith',
    secondaryStyle: 'watercolor',
    primaryIntensity: 65,
    secondaryIntensity: 35,
    moodKeywords: ['magical', 'epic', 'mythical', 'grand'],
    exampleScenes: ['Dragon encounters', 'Ancient ruins', 'Royal courts']
  },
  {
    id: 'cosmic-horror',
    name: 'Cosmic Horror',
    description: 'Supernatural dread with surreal otherworldly elements',
    icon: '👁️',
    genre: 'horror',
    primaryStyle: 'mike-mignola',
    secondaryStyle: 'moebius',
    primaryIntensity: 75,
    secondaryIntensity: 25,
    moodKeywords: ['eldritch', 'surreal', 'dread', 'alien'],
    exampleScenes: ['Lovecraftian entities', 'Dimensional rifts', 'Occult rituals']
  },
  {
    id: 'superhero-classic',
    name: 'Superhero Classic',
    description: 'Timeless heroic styling blending classic and realistic',
    icon: '🦸',
    genre: 'superhero',
    primaryStyle: 'john-byrne',
    secondaryStyle: 'alex-ross',
    primaryIntensity: 55,
    secondaryIntensity: 45,
    moodKeywords: ['heroic', 'inspiring', 'powerful', 'iconic'],
    exampleScenes: ['Hero poses', 'Team battles', 'Origin stories']
  },
  {
    id: 'romantic-drama',
    name: 'Romantic Drama',
    description: 'Emotional storytelling with soft, flowing aesthetics',
    icon: '💕',
    genre: 'romance',
    primaryStyle: 'wendy-pini',
    secondaryStyle: 'watercolor',
    primaryIntensity: 60,
    secondaryIntensity: 40,
    moodKeywords: ['emotional', 'tender', 'passionate', 'intimate'],
    exampleScenes: ['Confession scenes', 'Reunions', 'Heartbreak moments']
  },
  {
    id: 'scifi-adventure',
    name: 'Sci-Fi Adventure',
    description: 'Surreal futuristic landscapes with cinematic flair',
    icon: '🚀',
    genre: 'sci-fi',
    primaryStyle: 'moebius',
    secondaryStyle: 'oliver-coipel',
    primaryIntensity: 70,
    secondaryIntensity: 30,
    moodKeywords: ['futuristic', 'alien', 'vast', 'technological'],
    exampleScenes: ['Space stations', 'Alien worlds', 'Cyberpunk cities']
  },
  {
    id: 'dark-superhero',
    name: 'Dark Superhero',
    description: 'Gritty anti-hero tales with supernatural darkness',
    icon: '🦇',
    genre: 'superhero',
    primaryStyle: 'todd-mcfarlane',
    secondaryStyle: 'mike-mignola',
    primaryIntensity: 65,
    secondaryIntensity: 35,
    moodKeywords: ['dark', 'violent', 'edgy', 'supernatural'],
    exampleScenes: ['Vigilante justice', 'Demon battles', 'Urban warfare']
  },
  {
    id: 'slice-of-life',
    name: 'Slice of Life Manga',
    description: 'Warm everyday stories with expressive characters',
    icon: '🌸',
    genre: 'slice-of-life',
    primaryStyle: 'manga',
    secondaryStyle: 'wendy-pini',
    primaryIntensity: 80,
    secondaryIntensity: 20,
    moodKeywords: ['cozy', 'heartwarming', 'gentle', 'everyday'],
    exampleScenes: ['School days', 'Coffee shop chats', 'Family moments']
  },
  {
    id: 'action-blockbuster',
    name: 'Action Blockbuster',
    description: '90s-style explosive action with maximum detail',
    icon: '💥',
    genre: 'action',
    primaryStyle: 'mark-silvestri',
    secondaryStyle: 'jim-lee',
    primaryIntensity: 55,
    secondaryIntensity: 45,
    moodKeywords: ['explosive', 'detailed', 'intense', 'muscular'],
    exampleScenes: ['Team showdowns', 'Vehicle chases', 'Final battles']
  },
  {
    id: 'gothic-fantasy',
    name: 'Gothic Fantasy',
    description: 'Dark fantasy with ornate gothic atmosphere',
    icon: '🦇',
    genre: 'fantasy',
    primaryStyle: 'mike-mignola',
    secondaryStyle: 'barry-windsor-smith',
    primaryIntensity: 50,
    secondaryIntensity: 50,
    moodKeywords: ['gothic', 'dark', 'ornate', 'mysterious'],
    exampleScenes: ['Haunted castles', 'Dark forests', 'Vampire courts']
  },
  {
    id: 'comedy-adventure',
    name: 'Comedy Adventure',
    description: 'Fun, expressive adventures with clean storytelling',
    icon: '😄',
    genre: 'comedy',
    primaryStyle: 'manga',
    secondaryStyle: 'alan-davis',
    primaryIntensity: 65,
    secondaryIntensity: 35,
    moodKeywords: ['fun', 'light', 'expressive', 'energetic'],
    exampleScenes: ['Comedic chases', 'Silly villains', 'Buddy adventures']
  }
];

export function getTemplateById(id: string): StyleTemplate | undefined {
  return STYLE_TEMPLATES.find(t => t.id === id);
}

export function getTemplatesByGenre(genre: StoryGenre): StyleTemplate[] {
  return STYLE_TEMPLATES.filter(t => t.genre === genre);
}

export function applyTemplate(template: StyleTemplate): StyleMix {
  return {
    primaryStyle: template.primaryStyle,
    secondaryStyle: template.secondaryStyle,
    primaryIntensity: template.primaryIntensity,
    secondaryIntensity: template.secondaryIntensity
  };
}

export function getRecommendedTemplates(script: string): StyleTemplate[] {
  const detection = detectGenreFromScript(script);
  if (!detection) return STYLE_TEMPLATES.slice(0, 3);
  
  const genreTemplates = getTemplatesByGenre(detection.genre);
  if (genreTemplates.length > 0) return genreTemplates;
  
  return STYLE_TEMPLATES.slice(0, 3);
}

export function getAllGenres(): StoryGenre[] {
  const genres = new Set(STYLE_TEMPLATES.map(t => t.genre));
  return Array.from(genres);
}
