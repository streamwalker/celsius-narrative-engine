// Story Arc Planner - organizes events into chapters and tracks character development

import { StoryEvent, loadStoryEvents } from './story-events';

export interface CharacterArc {
  characterId: string;
  characterName: string;
  startingState: string;
  endingState: string;
  keyMoments: string[];
  growthAreas: string[];
  challenges: string[];
}

export interface Chapter {
  id: string;
  number: number;
  title: string;
  description: string;
  eventIds: string[];
  characterArcs: CharacterArc[];
  themes: string[];
  status: 'planned' | 'in-progress' | 'completed';
}

export interface StoryArc {
  id: string;
  title: string;
  description: string;
  genre: string;
  themes: string[];
  chapters: Chapter[];
  mainCharacterIds: string[];
  antagonistIds: string[];
  setting: string;
  timespan: string;
  createdAt: number;
  updatedAt: number;
}

const STORAGE_KEY = 'story_arcs';

export function loadStoryArcs(): StoryArc[] {
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveStoryArcs(arcs: StoryArc[]): void {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(arcs));
}

export function createStoryArc(arc: Omit<StoryArc, 'id' | 'createdAt' | 'updatedAt'>): StoryArc {
  const arcs = loadStoryArcs();
  const newArc: StoryArc = {
    ...arc,
    id: `arc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    createdAt: Date.now(),
    updatedAt: Date.now()
  };
  arcs.push(newArc);
  saveStoryArcs(arcs);
  return newArc;
}

export function updateStoryArc(arcId: string, updates: Partial<StoryArc>): void {
  const arcs = loadStoryArcs();
  const index = arcs.findIndex(a => a.id === arcId);
  if (index !== -1) {
    arcs[index] = { ...arcs[index], ...updates, updatedAt: Date.now() };
    saveStoryArcs(arcs);
  }
}

export function deleteStoryArc(arcId: string): void {
  const arcs = loadStoryArcs().filter(a => a.id !== arcId);
  saveStoryArcs(arcs);
}

export function addChapter(arcId: string, chapter: Omit<Chapter, 'id'>): Chapter {
  const arcs = loadStoryArcs();
  const arc = arcs.find(a => a.id === arcId);
  if (!arc) throw new Error('Arc not found');
  
  const newChapter: Chapter = {
    ...chapter,
    id: `ch_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
  };
  arc.chapters.push(newChapter);
  arc.updatedAt = Date.now();
  saveStoryArcs(arcs);
  return newChapter;
}

export function updateChapter(arcId: string, chapterId: string, updates: Partial<Chapter>): void {
  const arcs = loadStoryArcs();
  const arc = arcs.find(a => a.id === arcId);
  if (!arc) return;
  
  const chapter = arc.chapters.find(c => c.id === chapterId);
  if (chapter) {
    Object.assign(chapter, updates);
    arc.updatedAt = Date.now();
    saveStoryArcs(arcs);
  }
}

export function deleteChapter(arcId: string, chapterId: string): void {
  const arcs = loadStoryArcs();
  const arc = arcs.find(a => a.id === arcId);
  if (!arc) return;
  
  arc.chapters = arc.chapters.filter(c => c.id !== chapterId);
  arc.updatedAt = Date.now();
  saveStoryArcs(arcs);
}

export function getChapterEvents(chapter: Chapter): StoryEvent[] {
  const allEvents = loadStoryEvents();
  return allEvents.filter(e => chapter.eventIds.includes(e.id));
}

export function getCharacterDevelopment(characterId: string, arcId: string): {
  appearances: number;
  chaptersIn: number[];
  roleProgression: string[];
} {
  const arcs = loadStoryArcs();
  const arc = arcs.find(a => a.id === arcId);
  if (!arc) return { appearances: 0, chaptersIn: [], roleProgression: [] };
  
  const allEvents = loadStoryEvents();
  let appearances = 0;
  const chaptersIn: number[] = [];
  const roleProgression: string[] = [];
  
  arc.chapters.forEach((chapter, idx) => {
    const chapterEvents = allEvents.filter(e => chapter.eventIds.includes(e.id));
    const charEvents = chapterEvents.filter(e => 
      e.involvedCharacters.some(c => c.characterId === characterId)
    );
    
    if (charEvents.length > 0) {
      appearances += charEvents.length;
      chaptersIn.push(idx + 1);
      
      charEvents.forEach(e => {
        const involvement = e.involvedCharacters.find(c => c.characterId === characterId);
        if (involvement && !roleProgression.includes(involvement.role)) {
          roleProgression.push(involvement.role);
        }
      });
    }
  });
  
  return { appearances, chaptersIn, roleProgression };
}

export const GENRE_OPTIONS = [
  'Fantasy', 'Sci-Fi', 'Horror', 'Mystery', 'Romance', 
  'Action', 'Comedy', 'Drama', 'Thriller', 'Adventure'
];

export const THEME_OPTIONS = [
  'Redemption', 'Revenge', 'Love', 'Sacrifice', 'Power',
  'Identity', 'Family', 'Friendship', 'Survival', 'Justice',
  'Betrayal', 'Coming of Age', 'Good vs Evil', 'Loss', 'Hope'
];
