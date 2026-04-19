// Mood Timeline - track emotional journeys across panels

import { EmotionState, getEmotionById, MoodCategory } from './character-moods';

export interface PanelMoodSnapshot {
  panelId: number;
  pageNumber: number;
  panelIndex: number;
  characterMoods: Record<string, string>; // characterName -> moodId
  timestamp: number;
}

export interface CharacterMoodTimeline {
  characterName: string;
  snapshots: {
    panelId: number;
    pageNumber: number;
    panelIndex: number;
    moodId: string;
    emotion: EmotionState | null;
  }[];
}

export interface MoodTransition {
  characterName: string;
  fromPanelId: number;
  toPanelId: number;
  fromMoodId: string;
  toMoodId: string;
  intensity: 'subtle' | 'moderate' | 'dramatic';
}

export interface TimelineStatistics {
  characterName: string;
  mostCommonMood: string;
  moodDistribution: Record<string, number>;
  emotionalRange: { min: number; max: number };
  transitionCount: number;
  averageIntensity: number;
}

const TIMELINE_STORAGE_KEY = 'mood_timeline';

export function loadMoodTimeline(): PanelMoodSnapshot[] {
  try {
    const stored = localStorage.getItem(TIMELINE_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveMoodSnapshot(snapshot: PanelMoodSnapshot): void {
  const timeline = loadMoodTimeline();
  const existingIndex = timeline.findIndex(s => s.panelId === snapshot.panelId);
  
  if (existingIndex !== -1) {
    timeline[existingIndex] = snapshot;
  } else {
    timeline.push(snapshot);
  }
  
  // Sort by page and panel
  timeline.sort((a, b) => {
    if (a.pageNumber !== b.pageNumber) return a.pageNumber - b.pageNumber;
    return a.panelIndex - b.panelIndex;
  });
  
  localStorage.setItem(TIMELINE_STORAGE_KEY, JSON.stringify(timeline));
}

export function clearMoodTimeline(): void {
  localStorage.removeItem(TIMELINE_STORAGE_KEY);
}

// Mood inheritance - get the previous mood for a character
export function getPreviousMoodForCharacter(
  characterName: string,
  currentPageNumber: number,
  currentPanelIndex: number
): string | null {
  const timeline = loadMoodTimeline();
  
  // Find all snapshots for this character before the current panel
  const previousSnapshots = timeline
    .filter(s => characterName in s.characterMoods)
    .filter(s => {
      // Before current page, or same page but earlier panel
      if (s.pageNumber < currentPageNumber) return true;
      if (s.pageNumber === currentPageNumber && s.panelIndex < currentPanelIndex) return true;
      return false;
    })
    .sort((a, b) => {
      if (a.pageNumber !== b.pageNumber) return b.pageNumber - a.pageNumber;
      return b.panelIndex - a.panelIndex;
    });
  
  // Return the most recent mood
  if (previousSnapshots.length > 0) {
    return previousSnapshots[0].characterMoods[characterName];
  }
  
  return null;
}

// Get inherited moods for all characters in a panel
export function getInheritedMoods(
  characterNames: string[],
  pageNumber: number,
  panelIndex: number
): Record<string, string> {
  const inheritedMoods: Record<string, string> = {};
  
  characterNames.forEach(charName => {
    const previousMood = getPreviousMoodForCharacter(charName, pageNumber, panelIndex);
    if (previousMood) {
      inheritedMoods[charName] = previousMood;
    }
  });
  
  return inheritedMoods;
}

export function buildCharacterTimeline(characterName: string): CharacterMoodTimeline {
  const timeline = loadMoodTimeline();
  const snapshots = timeline
    .filter(s => characterName in s.characterMoods)
    .map(s => ({
      panelId: s.panelId,
      pageNumber: s.pageNumber,
      panelIndex: s.panelIndex,
      moodId: s.characterMoods[characterName],
      emotion: getEmotionById(s.characterMoods[characterName]) || null,
    }));
  
  return { characterName, snapshots };
}

export function getAllCharacterTimelines(): CharacterMoodTimeline[] {
  const timeline = loadMoodTimeline();
  const allCharacters = new Set<string>();
  
  timeline.forEach(s => {
    Object.keys(s.characterMoods).forEach(char => allCharacters.add(char));
  });
  
  return Array.from(allCharacters).map(char => buildCharacterTimeline(char));
}

export function detectMoodTransitions(characterName: string): MoodTransition[] {
  const timeline = buildCharacterTimeline(characterName);
  const transitions: MoodTransition[] = [];
  
  for (let i = 1; i < timeline.snapshots.length; i++) {
    const prev = timeline.snapshots[i - 1];
    const curr = timeline.snapshots[i];
    
    if (prev.moodId !== curr.moodId) {
      const prevEmotion = prev.emotion;
      const currEmotion = curr.emotion;
      
      // Calculate intensity of transition
      let intensity: 'subtle' | 'moderate' | 'dramatic' = 'subtle';
      
      if (prevEmotion && currEmotion) {
        const categoryChange = prevEmotion.category !== currEmotion.category;
        const intensityDiff = Math.abs(prevEmotion.intensity - currEmotion.intensity);
        
        if (categoryChange && intensityDiff >= 2) {
          intensity = 'dramatic';
        } else if (categoryChange || intensityDiff >= 1) {
          intensity = 'moderate';
        }
      }
      
      transitions.push({
        characterName,
        fromPanelId: prev.panelId,
        toPanelId: curr.panelId,
        fromMoodId: prev.moodId,
        toMoodId: curr.moodId,
        intensity,
      });
    }
  }
  
  return transitions;
}

export function calculateTimelineStatistics(characterName: string): TimelineStatistics {
  const timeline = buildCharacterTimeline(characterName);
  const moodDistribution: Record<string, number> = {};
  let intensitySum = 0;
  let minIntensity = 3;
  let maxIntensity = 1;
  
  timeline.snapshots.forEach(s => {
    moodDistribution[s.moodId] = (moodDistribution[s.moodId] || 0) + 1;
    if (s.emotion) {
      intensitySum += s.emotion.intensity;
      minIntensity = Math.min(minIntensity, s.emotion.intensity);
      maxIntensity = Math.max(maxIntensity, s.emotion.intensity);
    }
  });
  
  const mostCommonMood = Object.entries(moodDistribution)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';
  
  const transitions = detectMoodTransitions(characterName);
  
  return {
    characterName,
    mostCommonMood,
    moodDistribution,
    emotionalRange: { 
      min: timeline.snapshots.length > 0 ? minIntensity : 1, 
      max: timeline.snapshots.length > 0 ? maxIntensity : 1 
    },
    transitionCount: transitions.length,
    averageIntensity: timeline.snapshots.length > 0 
      ? intensitySum / timeline.snapshots.length 
      : 1,
  };
}

export function getCategoryColor(category: MoodCategory): string {
  switch (category) {
    case 'positive': return 'hsl(142, 76%, 36%)'; // green
    case 'negative': return 'hsl(0, 84%, 60%)'; // red
    case 'neutral': return 'hsl(215, 20%, 65%)'; // gray-blue
    case 'intense': return 'hsl(25, 95%, 53%)'; // orange
    default: return 'hsl(215, 20%, 65%)';
  }
}

export function getIntensityOpacity(intensity: 1 | 2 | 3): number {
  switch (intensity) {
    case 1: return 0.5;
    case 2: return 0.75;
    case 3: return 1;
    default: return 0.75;
  }
}
