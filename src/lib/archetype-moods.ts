// Archetype-based mood templates - suggests default emotional responses based on personality type

import { CHARACTER_ARCHETYPES, CharacterArchetype } from './character-archetypes';
import { EmotionState, EMOTION_STATES, MoodCategory } from './character-moods';

export interface ArchetypeMoodProfile {
  archetypeId: string;
  defaultMoods: string[]; // Most likely moods for this archetype
  stressResponse: string; // How they react under pressure
  socialMoods: string[]; // Moods in social situations
  conflictMoods: string[]; // Moods during confrontation
  downtime: string; // Mood during peaceful moments
  moodModifiers: {
    positive: number; // Likelihood modifier for positive moods (-1 to 1)
    negative: number;
    neutral: number;
    intense: number;
  };
}

export const ARCHETYPE_MOOD_PROFILES: ArchetypeMoodProfile[] = [
  {
    archetypeId: 'hero',
    defaultMoods: ['determined', 'hopeful', 'neutral'],
    stressResponse: 'determined',
    socialMoods: ['happy', 'content', 'hopeful'],
    conflictMoods: ['determined', 'angry', 'victorious'],
    downtime: 'content',
    moodModifiers: { positive: 0.3, negative: -0.2, neutral: 0, intense: 0.2 }
  },
  {
    archetypeId: 'anti-hero',
    defaultMoods: ['neutral', 'thoughtful', 'menacing'],
    stressResponse: 'angry',
    socialMoods: ['neutral', 'disgusted', 'curious'],
    conflictMoods: ['angry', 'menacing', 'determined'],
    downtime: 'thoughtful',
    moodModifiers: { positive: -0.3, negative: 0.2, neutral: 0.1, intense: 0.3 }
  },
  {
    archetypeId: 'mentor',
    defaultMoods: ['thoughtful', 'content', 'curious'],
    stressResponse: 'thoughtful',
    socialMoods: ['happy', 'content', 'curious'],
    conflictMoods: ['thoughtful', 'determined', 'sad'],
    downtime: 'content',
    moodModifiers: { positive: 0.1, negative: -0.1, neutral: 0.3, intense: -0.2 }
  },
  {
    archetypeId: 'trickster',
    defaultMoods: ['happy', 'excited', 'curious'],
    stressResponse: 'excited',
    socialMoods: ['happy', 'excited', 'curious'],
    conflictMoods: ['excited', 'menacing', 'happy'],
    downtime: 'curious',
    moodModifiers: { positive: 0.4, negative: -0.2, neutral: -0.1, intense: 0.1 }
  },
  {
    archetypeId: 'guardian',
    defaultMoods: ['neutral', 'determined', 'content'],
    stressResponse: 'determined',
    socialMoods: ['content', 'neutral', 'happy'],
    conflictMoods: ['determined', 'angry', 'fearful'],
    downtime: 'content',
    moodModifiers: { positive: 0.1, negative: 0, neutral: 0.2, intense: 0.2 }
  },
  {
    archetypeId: 'outcast',
    defaultMoods: ['sad', 'neutral', 'thoughtful'],
    stressResponse: 'angry',
    socialMoods: ['neutral', 'fearful', 'hopeful'],
    conflictMoods: ['angry', 'desperate', 'determined'],
    downtime: 'sad',
    moodModifiers: { positive: -0.2, negative: 0.3, neutral: 0.1, intense: 0.1 }
  },
  {
    archetypeId: 'scholar',
    defaultMoods: ['curious', 'thoughtful', 'excited'],
    stressResponse: 'curious',
    socialMoods: ['curious', 'neutral', 'content'],
    conflictMoods: ['fearful', 'thoughtful', 'determined'],
    downtime: 'curious',
    moodModifiers: { positive: 0.1, negative: -0.1, neutral: 0.4, intense: -0.2 }
  },
  {
    archetypeId: 'rebel',
    defaultMoods: ['angry', 'determined', 'excited'],
    stressResponse: 'angry',
    socialMoods: ['excited', 'happy', 'angry'],
    conflictMoods: ['angry', 'determined', 'victorious'],
    downtime: 'hopeful',
    moodModifiers: { positive: 0.1, negative: 0.1, neutral: -0.2, intense: 0.4 }
  },
  {
    archetypeId: 'healer',
    defaultMoods: ['content', 'hopeful', 'sad'],
    stressResponse: 'desperate',
    socialMoods: ['happy', 'content', 'hopeful'],
    conflictMoods: ['fearful', 'sad', 'determined'],
    downtime: 'content',
    moodModifiers: { positive: 0.4, negative: 0.1, neutral: 0, intense: -0.2 }
  },
  {
    archetypeId: 'avenger',
    defaultMoods: ['angry', 'determined', 'menacing'],
    stressResponse: 'angry',
    socialMoods: ['neutral', 'disgusted', 'sad'],
    conflictMoods: ['angry', 'menacing', 'victorious'],
    downtime: 'sad',
    moodModifiers: { positive: -0.3, negative: 0.3, neutral: -0.1, intense: 0.5 }
  },
  {
    archetypeId: 'innocent',
    defaultMoods: ['happy', 'curious', 'hopeful'],
    stressResponse: 'fearful',
    socialMoods: ['happy', 'excited', 'curious'],
    conflictMoods: ['fearful', 'sad', 'hopeful'],
    downtime: 'happy',
    moodModifiers: { positive: 0.5, negative: -0.2, neutral: 0, intense: -0.3 }
  },
  {
    archetypeId: 'mastermind',
    defaultMoods: ['neutral', 'thoughtful', 'menacing'],
    stressResponse: 'thoughtful',
    socialMoods: ['neutral', 'content', 'curious'],
    conflictMoods: ['menacing', 'victorious', 'determined'],
    downtime: 'thoughtful',
    moodModifiers: { positive: -0.2, negative: 0.1, neutral: 0.3, intense: 0.2 }
  }
];

export type SceneContext = 'default' | 'stress' | 'social' | 'conflict' | 'downtime';

export function getArchetypeMoodProfile(archetypeId: string): ArchetypeMoodProfile | undefined {
  return ARCHETYPE_MOOD_PROFILES.find(p => p.archetypeId === archetypeId);
}

export function getSuggestedMoodsForArchetype(
  archetypeId: string, 
  context: SceneContext = 'default'
): EmotionState[] {
  const profile = getArchetypeMoodProfile(archetypeId);
  if (!profile) return [];

  let moodIds: string[];
  switch (context) {
    case 'stress':
      moodIds = [profile.stressResponse, ...profile.defaultMoods.slice(0, 2)];
      break;
    case 'social':
      moodIds = profile.socialMoods;
      break;
    case 'conflict':
      moodIds = profile.conflictMoods;
      break;
    case 'downtime':
      moodIds = [profile.downtime, ...profile.defaultMoods.slice(0, 2)];
      break;
    default:
      moodIds = profile.defaultMoods;
  }

  return moodIds
    .map(id => EMOTION_STATES.find(e => e.id === id))
    .filter((e): e is EmotionState => e !== undefined);
}

export function scoreMoodForArchetype(
  archetypeId: string,
  moodId: string
): number {
  const profile = getArchetypeMoodProfile(archetypeId);
  const emotion = EMOTION_STATES.find(e => e.id === moodId);
  
  if (!profile || !emotion) return 0;

  // Base score from category modifier
  let score = profile.moodModifiers[emotion.category];

  // Bonus if it's a default mood
  if (profile.defaultMoods.includes(moodId)) {
    score += 0.5;
  }

  return Math.max(-1, Math.min(1, score));
}

export function getMoodCompatibilityLabel(score: number): { label: string; color: string } {
  if (score >= 0.4) return { label: 'Very likely', color: 'text-green-500' };
  if (score >= 0.1) return { label: 'Likely', color: 'text-green-400' };
  if (score >= -0.1) return { label: 'Neutral', color: 'text-muted-foreground' };
  if (score >= -0.4) return { label: 'Unlikely', color: 'text-orange-400' };
  return { label: 'Very unlikely', color: 'text-red-500' };
}

export function detectMoodConflicts(
  characterMoods: Array<{ 
    characterName: string; 
    archetypeId?: string; 
    moodId: string;
  }>,
  sceneContext: SceneContext,
  panelDescription: string
): Array<{
  characterName: string;
  conflict: string;
  severity: 'low' | 'medium' | 'high';
  suggestion: string;
}> {
  const conflicts: Array<{
    characterName: string;
    conflict: string;
    severity: 'low' | 'medium' | 'high';
    suggestion: string;
  }> = [];

  // Detect scene tone from description
  const descLower = panelDescription.toLowerCase();
  const isHappyScene = /laugh|smile|celebrate|party|wedding|reunion|victory/.test(descLower);
  const isSadScene = /cry|mourn|funeral|loss|goodbye|death|tragic/.test(descLower);
  const isActionScene = /fight|battle|chase|escape|attack|defend|explosion/.test(descLower);
  const isTenseScene = /tension|standoff|confront|threat|danger|lurk/.test(descLower);
  const isRomanticScene = /love|kiss|embrace|romantic|tender|intimate/.test(descLower);

  characterMoods.forEach(({ characterName, archetypeId, moodId }) => {
    const emotion = EMOTION_STATES.find(e => e.id === moodId);
    if (!emotion) return;

    // Scene-mood conflicts
    if (isHappyScene && emotion.category === 'negative' && emotion.intensity >= 2) {
      conflicts.push({
        characterName,
        conflict: `${emotion.name} mood seems out of place in a celebratory scene`,
        severity: 'medium',
        suggestion: `Consider using a positive mood like "happy" or "excited"`,
      });
    }

    if (isSadScene && emotion.category === 'positive' && emotion.intensity >= 2) {
      conflicts.push({
        characterName,
        conflict: `${emotion.name} mood may not fit the somber tone`,
        severity: 'medium',
        suggestion: `Consider "sad", "thoughtful", or at least a subdued positive emotion`,
      });
    }

    if (isActionScene && emotion.id === 'content') {
      conflicts.push({
        characterName,
        conflict: `"Content" seems too calm for an action scene`,
        severity: 'low',
        suggestion: `Consider "determined", "fearful", or "excited" for more dynamic energy`,
      });
    }

    if (isTenseScene && (emotion.id === 'happy' || emotion.id === 'excited')) {
      conflicts.push({
        characterName,
        conflict: `${emotion.name} may undercut the tension`,
        severity: 'low',
        suggestion: `Consider "neutral", "fearful", or "determined" to maintain suspense`,
      });
    }

    // Archetype-mood conflicts
    if (archetypeId) {
      const score = scoreMoodForArchetype(archetypeId, moodId);
      const archetype = CHARACTER_ARCHETYPES.find(a => a.id === archetypeId);
      
      if (score < -0.3 && archetype) {
        const profile = getArchetypeMoodProfile(archetypeId);
        const suggestedMood = profile?.defaultMoods[0] || 'neutral';
        
        conflicts.push({
          characterName,
          conflict: `${emotion.name} is unusual for ${archetype.name} archetype`,
          severity: 'low',
          suggestion: `${archetype.name} characters typically show "${suggestedMood}" emotions`,
        });
      }
    }
  });

  return conflicts;
}
