// Character Mood/Emotion States - influences panel generation

export type MoodCategory = 'positive' | 'negative' | 'neutral' | 'intense';

export interface EmotionState {
  id: string;
  name: string;
  category: MoodCategory;
  intensity: 1 | 2 | 3; // 1 = subtle, 2 = moderate, 3 = extreme
  visualCues: string[];
  colorTones: string[];
  expressionKeywords: string[];
  bodyLanguageHints: string[];
}

export const EMOTION_STATES: EmotionState[] = [
  // Positive emotions
  {
    id: 'happy',
    name: 'Happy',
    category: 'positive',
    intensity: 2,
    visualCues: ['bright eyes', 'genuine smile', 'relaxed posture'],
    colorTones: ['warm yellows', 'soft oranges', 'light'],
    expressionKeywords: ['smiling', 'joyful', 'cheerful', 'beaming'],
    bodyLanguageHints: ['open stance', 'animated gestures', 'head held high']
  },
  {
    id: 'content',
    name: 'Content',
    category: 'positive',
    intensity: 1,
    visualCues: ['soft smile', 'peaceful expression', 'relaxed features'],
    colorTones: ['soft pastels', 'gentle warmth', 'muted'],
    expressionKeywords: ['serene', 'calm', 'satisfied', 'peaceful'],
    bodyLanguageHints: ['relaxed shoulders', 'gentle posture', 'still movements']
  },
  {
    id: 'excited',
    name: 'Excited',
    category: 'positive',
    intensity: 3,
    visualCues: ['wide eyes', 'broad grin', 'energetic stance'],
    colorTones: ['vibrant colors', 'dynamic lighting', 'high contrast'],
    expressionKeywords: ['exuberant', 'thrilled', 'ecstatic', 'animated'],
    bodyLanguageHints: ['jumping', 'raised arms', 'rapid movements', 'leaning forward']
  },
  {
    id: 'hopeful',
    name: 'Hopeful',
    category: 'positive',
    intensity: 2,
    visualCues: ['upward gaze', 'slight smile', 'lifted chin'],
    colorTones: ['golden light', 'dawn colors', 'rising brightness'],
    expressionKeywords: ['optimistic', 'anticipating', 'yearning', 'aspiring'],
    bodyLanguageHints: ['reaching upward', 'forward lean', 'eyes on horizon']
  },
  // Negative emotions
  {
    id: 'sad',
    name: 'Sad',
    category: 'negative',
    intensity: 2,
    visualCues: ['downcast eyes', 'frown', 'slumped shoulders'],
    colorTones: ['cool blues', 'muted grays', 'dim lighting'],
    expressionKeywords: ['melancholy', 'sorrowful', 'dejected', 'crestfallen'],
    bodyLanguageHints: ['hunched posture', 'slow movements', 'looking down', 'withdrawn']
  },
  {
    id: 'angry',
    name: 'Angry',
    category: 'negative',
    intensity: 3,
    visualCues: ['furrowed brow', 'clenched jaw', 'narrowed eyes'],
    colorTones: ['deep reds', 'harsh shadows', 'high contrast'],
    expressionKeywords: ['furious', 'enraged', 'seething', 'wrathful'],
    bodyLanguageHints: ['clenched fists', 'tense muscles', 'aggressive stance', 'pointing']
  },
  {
    id: 'fearful',
    name: 'Fearful',
    category: 'negative',
    intensity: 2,
    visualCues: ['wide eyes', 'pale complexion', 'trembling'],
    colorTones: ['cold colors', 'dark shadows', 'harsh lighting'],
    expressionKeywords: ['terrified', 'scared', 'anxious', 'panicked'],
    bodyLanguageHints: ['backing away', 'raised hands defensively', 'cowering', 'frozen']
  },
  {
    id: 'disgusted',
    name: 'Disgusted',
    category: 'negative',
    intensity: 2,
    visualCues: ['wrinkled nose', 'curled lip', 'averted gaze'],
    colorTones: ['sickly greens', 'murky tones', 'unpleasant contrast'],
    expressionKeywords: ['repulsed', 'revolted', 'nauseated', 'contemptuous'],
    bodyLanguageHints: ['turning away', 'pushing gesture', 'distance creating', 'recoiling']
  },
  // Neutral emotions
  {
    id: 'neutral',
    name: 'Neutral',
    category: 'neutral',
    intensity: 1,
    visualCues: ['relaxed face', 'steady gaze', 'balanced expression'],
    colorTones: ['balanced tones', 'natural lighting', 'moderate contrast'],
    expressionKeywords: ['calm', 'composed', 'impassive', 'neutral'],
    bodyLanguageHints: ['balanced stance', 'natural posture', 'steady movements']
  },
  {
    id: 'curious',
    name: 'Curious',
    category: 'neutral',
    intensity: 2,
    visualCues: ['raised eyebrows', 'tilted head', 'focused gaze'],
    colorTones: ['cool curiosity blues', 'investigative lighting', 'focused highlights'],
    expressionKeywords: ['inquisitive', 'intrigued', 'puzzled', 'interested'],
    bodyLanguageHints: ['leaning in', 'examining gesture', 'head tilt', 'approaching']
  },
  {
    id: 'thoughtful',
    name: 'Thoughtful',
    category: 'neutral',
    intensity: 1,
    visualCues: ['distant gaze', 'slight frown', 'hand on chin'],
    colorTones: ['soft shadows', 'contemplative lighting', 'muted background'],
    expressionKeywords: ['pensive', 'contemplating', 'pondering', 'reflective'],
    bodyLanguageHints: ['chin resting on hand', 'gazing away', 'slow movements', 'seated']
  },
  // Intense emotions
  {
    id: 'determined',
    name: 'Determined',
    category: 'intense',
    intensity: 3,
    visualCues: ['set jaw', 'focused eyes', 'firm expression'],
    colorTones: ['strong contrasts', 'heroic lighting', 'bold colors'],
    expressionKeywords: ['resolute', 'unwavering', 'steely', 'fierce'],
    bodyLanguageHints: ['squared shoulders', 'planted feet', 'forward lean', 'ready stance']
  },
  {
    id: 'desperate',
    name: 'Desperate',
    category: 'intense',
    intensity: 3,
    visualCues: ['wild eyes', 'strained expression', 'sweat'],
    colorTones: ['harsh lighting', 'dramatic shadows', 'urgent reds'],
    expressionKeywords: ['frantic', 'panicked', 'urgent', 'wild'],
    bodyLanguageHints: ['reaching out', 'running', 'grasping', 'pleading gesture']
  },
  {
    id: 'menacing',
    name: 'Menacing',
    category: 'intense',
    intensity: 3,
    visualCues: ['shadowed face', 'cold smile', 'predatory gaze'],
    colorTones: ['dark shadows', 'ominous lighting', 'blood reds', 'cold blues'],
    expressionKeywords: ['threatening', 'sinister', 'intimidating', 'dangerous'],
    bodyLanguageHints: ['looming posture', 'slow deliberate movement', 'invasive stance']
  },
  {
    id: 'victorious',
    name: 'Victorious',
    category: 'intense',
    intensity: 3,
    visualCues: ['triumphant smile', 'proud stance', 'raised head'],
    colorTones: ['golden glory', 'heroic lighting', 'warm highlights'],
    expressionKeywords: ['triumphant', 'proud', 'exultant', 'conquering'],
    bodyLanguageHints: ['raised arms', 'chest out', 'powerful stance', 'weapon raised']
  }
];

export interface CharacterMoodState {
  characterId: string;
  currentMood: string;
  moodHistory: { moodId: string; timestamp: number; reason?: string }[];
  defaultMood: string;
}

const MOOD_STORAGE_KEY = 'character_moods';

export function loadCharacterMoods(): CharacterMoodState[] {
  try {
    const stored = localStorage.getItem(MOOD_STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

export function saveCharacterMoods(moods: CharacterMoodState[]): void {
  localStorage.setItem(MOOD_STORAGE_KEY, JSON.stringify(moods));
}

export function getCharacterMood(characterId: string): CharacterMoodState | undefined {
  return loadCharacterMoods().find(m => m.characterId === characterId);
}

export function setCharacterMood(characterId: string, moodId: string, reason?: string): void {
  const moods = loadCharacterMoods();
  const existing = moods.find(m => m.characterId === characterId);
  
  if (existing) {
    existing.moodHistory.push({ moodId: existing.currentMood, timestamp: Date.now(), reason });
    existing.currentMood = moodId;
  } else {
    moods.push({
      characterId,
      currentMood: moodId,
      defaultMood: 'neutral',
      moodHistory: []
    });
  }
  
  saveCharacterMoods(moods);
}

export function getEmotionById(id: string): EmotionState | undefined {
  return EMOTION_STATES.find(e => e.id === id);
}

export function getEmotionsByCategory(category: MoodCategory): EmotionState[] {
  return EMOTION_STATES.filter(e => e.category === category);
}

export function generateMoodPromptModifier(emotion: EmotionState): string {
  const expression = emotion.expressionKeywords.slice(0, 2).join(', ');
  const visual = emotion.visualCues.slice(0, 2).join(', ');
  const body = emotion.bodyLanguageHints[0];
  const color = emotion.colorTones[0];
  
  return `Character appears ${expression} with ${visual}. Body language shows ${body}. Scene uses ${color} color palette for emotional emphasis.`;
}
