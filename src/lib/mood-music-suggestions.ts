// Mood-based music and sound suggestions

import { MoodCategory, getEmotionById } from './character-moods';

export interface MusicSuggestion {
  id: string;
  title: string;
  genre: string;
  tempo: 'slow' | 'moderate' | 'fast';
  mood: string;
  instruments: string[];
  description: string;
  searchQuery: string; // For finding on music platforms
}

export interface SoundEffectSuggestion {
  id: string;
  name: string;
  category: 'ambient' | 'action' | 'emotional' | 'nature' | 'urban';
  description: string;
}

export interface PanelAudioSuggestion {
  dominantMood: string;
  moodCategory: MoodCategory;
  intensity: number;
  musicSuggestions: MusicSuggestion[];
  ambientSounds: SoundEffectSuggestion[];
  productionNotes: string;
}

// Music suggestions by mood category
const musicByCategory: Record<MoodCategory, MusicSuggestion[]> = {
  positive: [
    {
      id: 'uplifting-orchestral',
      title: 'Uplifting Orchestral',
      genre: 'Orchestral',
      tempo: 'moderate',
      mood: 'hopeful',
      instruments: ['strings', 'brass', 'percussion'],
      description: 'Sweeping orchestral piece with rising melodies',
      searchQuery: 'uplifting orchestral cinematic hopeful'
    },
    {
      id: 'acoustic-warmth',
      title: 'Acoustic Warmth',
      genre: 'Acoustic',
      tempo: 'slow',
      mood: 'content',
      instruments: ['acoustic guitar', 'piano', 'soft drums'],
      description: 'Gentle acoustic melodies for tender moments',
      searchQuery: 'acoustic warm gentle emotional'
    },
    {
      id: 'triumphant-fanfare',
      title: 'Triumphant Fanfare',
      genre: 'Epic',
      tempo: 'fast',
      mood: 'victorious',
      instruments: ['brass', 'timpani', 'choir'],
      description: 'Bold brass fanfare for triumphant scenes',
      searchQuery: 'triumphant epic fanfare victory'
    },
    {
      id: 'playful-whimsy',
      title: 'Playful Whimsy',
      genre: 'Comedy',
      tempo: 'moderate',
      mood: 'playful',
      instruments: ['pizzicato strings', 'woodwinds', 'xylophone'],
      description: 'Light-hearted and bouncy for comedic moments',
      searchQuery: 'playful whimsical comedy lighthearted'
    }
  ],
  negative: [
    {
      id: 'dark-ambient',
      title: 'Dark Ambient',
      genre: 'Ambient',
      tempo: 'slow',
      mood: 'ominous',
      instruments: ['synth pads', 'drone', 'low strings'],
      description: 'Unsettling atmosphere with droning tones',
      searchQuery: 'dark ambient ominous tension'
    },
    {
      id: 'tragic-strings',
      title: 'Tragic Strings',
      genre: 'Classical',
      tempo: 'slow',
      mood: 'sorrowful',
      instruments: ['solo violin', 'cello', 'piano'],
      description: 'Melancholic string arrangement for sad scenes',
      searchQuery: 'tragic sad strings melancholy emotional'
    },
    {
      id: 'horror-tension',
      title: 'Horror Tension',
      genre: 'Horror',
      tempo: 'slow',
      mood: 'fearful',
      instruments: ['dissonant strings', 'percussion', 'synth'],
      description: 'Building dread with discordant elements',
      searchQuery: 'horror tension dread suspense scary'
    },
    {
      id: 'angry-industrial',
      title: 'Angry Industrial',
      genre: 'Industrial',
      tempo: 'fast',
      mood: 'aggressive',
      instruments: ['distorted synth', 'heavy drums', 'industrial sounds'],
      description: 'Harsh industrial sounds for intense anger',
      searchQuery: 'industrial aggressive angry heavy intense'
    }
  ],
  neutral: [
    {
      id: 'ambient-meditation',
      title: 'Ambient Meditation',
      genre: 'Ambient',
      tempo: 'slow',
      mood: 'calm',
      instruments: ['synth pads', 'bells', 'soft piano'],
      description: 'Peaceful ambient textures for quiet moments',
      searchQuery: 'ambient calm meditation peaceful'
    },
    {
      id: 'everyday-life',
      title: 'Everyday Life',
      genre: 'Indie',
      tempo: 'moderate',
      mood: 'contemplative',
      instruments: ['acoustic guitar', 'light percussion', 'bass'],
      description: 'Understated music for slice-of-life scenes',
      searchQuery: 'indie acoustic everyday contemplative'
    },
    {
      id: 'mysterious-wonder',
      title: 'Mysterious Wonder',
      genre: 'Cinematic',
      tempo: 'slow',
      mood: 'curious',
      instruments: ['piano', 'celeste', 'soft strings'],
      description: 'Gentle mystery and discovery themes',
      searchQuery: 'mysterious wonder discovery magical'
    }
  ],
  intense: [
    {
      id: 'action-percussion',
      title: 'Action Percussion',
      genre: 'Action',
      tempo: 'fast',
      mood: 'determined',
      instruments: ['taiko drums', 'orchestral hits', 'brass stabs'],
      description: 'Driving percussion for action sequences',
      searchQuery: 'action percussion intense driving'
    },
    {
      id: 'epic-battle',
      title: 'Epic Battle',
      genre: 'Epic',
      tempo: 'fast',
      mood: 'fierce',
      instruments: ['full orchestra', 'choir', 'war drums'],
      description: 'Full orchestral battle music',
      searchQuery: 'epic battle war orchestral intense'
    },
    {
      id: 'suspense-thriller',
      title: 'Suspense Thriller',
      genre: 'Thriller',
      tempo: 'moderate',
      mood: 'tense',
      instruments: ['strings', 'heartbeat bass', 'subtle percussion'],
      description: 'Building suspense for thriller moments',
      searchQuery: 'suspense thriller tension building'
    },
    {
      id: 'romantic-passion',
      title: 'Romantic Passion',
      genre: 'Romantic',
      tempo: 'moderate',
      mood: 'passionate',
      instruments: ['full strings', 'piano', 'harp'],
      description: 'Intense romantic themes',
      searchQuery: 'romantic passionate love emotional strings'
    }
  ]
};

// Ambient sounds by mood category
const ambientByCategory: Record<MoodCategory, SoundEffectSuggestion[]> = {
  positive: [
    { id: 'birds-chirping', name: 'Birds Chirping', category: 'nature', description: 'Morning birdsong' },
    { id: 'gentle-stream', name: 'Gentle Stream', category: 'nature', description: 'Peaceful water flow' },
    { id: 'crowd-cheering', name: 'Crowd Cheering', category: 'urban', description: 'Celebratory crowd' },
    { id: 'wind-chimes', name: 'Wind Chimes', category: 'ambient', description: 'Delicate chiming' }
  ],
  negative: [
    { id: 'rain-heavy', name: 'Heavy Rain', category: 'nature', description: 'Downpour with thunder' },
    { id: 'wind-howling', name: 'Howling Wind', category: 'nature', description: 'Eerie wind sounds' },
    { id: 'heartbeat-slow', name: 'Slow Heartbeat', category: 'emotional', description: 'Tension heartbeat' },
    { id: 'distant-sirens', name: 'Distant Sirens', category: 'urban', description: 'Emergency sirens' }
  ],
  neutral: [
    { id: 'city-ambience', name: 'City Ambience', category: 'urban', description: 'Background city sounds' },
    { id: 'office-murmur', name: 'Office Murmur', category: 'ambient', description: 'Quiet workplace' },
    { id: 'nature-breeze', name: 'Light Breeze', category: 'nature', description: 'Gentle wind' },
    { id: 'clock-ticking', name: 'Clock Ticking', category: 'ambient', description: 'Passage of time' }
  ],
  intense: [
    { id: 'thunder-rolling', name: 'Rolling Thunder', category: 'nature', description: 'Dramatic thunder' },
    { id: 'battle-sounds', name: 'Battle Sounds', category: 'action', description: 'Combat ambience' },
    { id: 'heartbeat-fast', name: 'Fast Heartbeat', category: 'emotional', description: 'Racing heartbeat' },
    { id: 'fire-crackling', name: 'Fire Crackling', category: 'nature', description: 'Intense flames' }
  ]
};

export function getMusicSuggestions(category: MoodCategory, intensity: number): MusicSuggestion[] {
  const suggestions = musicByCategory[category] || musicByCategory.neutral;
  
  // Filter by tempo based on intensity
  if (intensity === 3) {
    // High intensity - prefer fast/moderate
    return suggestions.filter(s => s.tempo === 'fast' || s.tempo === 'moderate');
  } else if (intensity === 1) {
    // Low intensity - prefer slow
    return suggestions.filter(s => s.tempo === 'slow');
  }
  
  return suggestions;
}

export function getAmbientSuggestions(category: MoodCategory): SoundEffectSuggestion[] {
  return ambientByCategory[category] || ambientByCategory.neutral;
}

export function generatePanelAudioSuggestion(
  characterMoods: Record<string, string>,
  moodIntensities: Record<string, number> = {}
): PanelAudioSuggestion {
  // Analyze all character moods to find dominant mood
  const moodCounts: Record<MoodCategory, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    intense: 0
  };
  
  let dominantMoodId = 'neutral';
  let totalIntensity = 0;
  let moodCount = 0;
  
  Object.entries(characterMoods).forEach(([charName, moodId]) => {
    const emotion = getEmotionById(moodId);
    if (emotion) {
      moodCounts[emotion.category]++;
      dominantMoodId = moodId;
      totalIntensity += moodIntensities[charName] || emotion.intensity;
      moodCount++;
    }
  });
  
  // Find dominant category
  const dominantCategory = (Object.entries(moodCounts)
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral') as MoodCategory;
  
  const avgIntensity = moodCount > 0 ? Math.round(totalIntensity / moodCount) : 2;
  
  const emotion = getEmotionById(dominantMoodId);
  
  // Generate production notes based on mood mix
  let productionNotes = '';
  const moodMix = Object.entries(moodCounts).filter(([_, count]) => count > 0);
  
  if (moodMix.length > 1) {
    productionNotes = `Mixed emotional scene with ${moodMix.map(([cat, count]) => `${count} ${cat}`).join(', ')} mood(s). Consider layering music to reflect character contrasts.`;
  } else if (avgIntensity >= 3) {
    productionNotes = 'High intensity scene - music should build to a crescendo or maintain high energy throughout.';
  } else if (avgIntensity === 1) {
    productionNotes = 'Subtle emotional moment - consider minimal instrumentation or even silence with ambient sounds.';
  } else {
    productionNotes = 'Balanced scene - music should support but not overpower the visual narrative.';
  }
  
  return {
    dominantMood: emotion?.name || 'Neutral',
    moodCategory: dominantCategory,
    intensity: avgIntensity,
    musicSuggestions: getMusicSuggestions(dominantCategory, avgIntensity),
    ambientSounds: getAmbientSuggestions(dominantCategory),
    productionNotes
  };
}

export function getTempoLabel(tempo: 'slow' | 'moderate' | 'fast'): string {
  switch (tempo) {
    case 'slow': return '60-80 BPM';
    case 'moderate': return '80-120 BPM';
    case 'fast': return '120-160 BPM';
  }
}
