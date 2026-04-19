// Mood-based color grading presets for panel generation

import { MoodCategory, EmotionState, EMOTION_STATES } from './character-moods';

export interface ColorGradingPreset {
  id: string;
  name: string;
  description: string;
  moodCategory: MoodCategory | 'mixed';
  primaryMoods: string[]; // Mood IDs this preset works best with
  colorAdjustments: {
    hueShift: number; // -180 to 180
    saturation: number; // 0 to 200 (100 = normal)
    brightness: number; // 0 to 200 (100 = normal)
    contrast: number; // 0 to 200 (100 = normal)
    warmth: number; // -100 (cool) to 100 (warm)
  };
  overlayColor?: string; // Optional color overlay with alpha
  vignetteStrength: number; // 0 to 100
  promptModifier: string; // Added to generation prompt
}

export const COLOR_GRADING_PRESETS: ColorGradingPreset[] = [
  // Positive moods
  {
    id: 'warm_glow',
    name: 'Warm Glow',
    description: 'Golden, warm tones for happy and hopeful scenes',
    moodCategory: 'positive',
    primaryMoods: ['happy', 'content', 'hopeful', 'excited'],
    colorAdjustments: {
      hueShift: 10,
      saturation: 115,
      brightness: 110,
      contrast: 95,
      warmth: 40,
    },
    overlayColor: 'rgba(255, 200, 100, 0.1)',
    vignetteStrength: 15,
    promptModifier: 'warm golden lighting, soft glow, bright and cheerful atmosphere, saturated warm colors',
  },
  {
    id: 'soft_pastel',
    name: 'Soft Pastel',
    description: 'Gentle, dreamy colors for peaceful moments',
    moodCategory: 'positive',
    primaryMoods: ['content', 'hopeful'],
    colorAdjustments: {
      hueShift: 0,
      saturation: 80,
      brightness: 115,
      contrast: 85,
      warmth: 20,
    },
    overlayColor: 'rgba(255, 230, 240, 0.15)',
    vignetteStrength: 10,
    promptModifier: 'soft pastel colors, dreamy atmosphere, gentle lighting, ethereal glow',
  },
  {
    id: 'vibrant_energy',
    name: 'Vibrant Energy',
    description: 'High saturation and contrast for excitement',
    moodCategory: 'positive',
    primaryMoods: ['excited', 'victorious'],
    colorAdjustments: {
      hueShift: 5,
      saturation: 140,
      brightness: 105,
      contrast: 120,
      warmth: 25,
    },
    vignetteStrength: 20,
    promptModifier: 'vibrant saturated colors, dynamic lighting, high energy, bold color palette',
  },

  // Negative moods
  {
    id: 'cool_melancholy',
    name: 'Cool Melancholy',
    description: 'Blue-tinted desaturated tones for sadness',
    moodCategory: 'negative',
    primaryMoods: ['sad', 'fearful'],
    colorAdjustments: {
      hueShift: -15,
      saturation: 70,
      brightness: 90,
      contrast: 90,
      warmth: -40,
    },
    overlayColor: 'rgba(100, 130, 180, 0.15)',
    vignetteStrength: 35,
    promptModifier: 'cool blue tones, desaturated colors, melancholic lighting, muted palette, somber atmosphere',
  },
  {
    id: 'angry_red',
    name: 'Angry Red',
    description: 'Hot, aggressive colors for anger and conflict',
    moodCategory: 'negative',
    primaryMoods: ['angry', 'disgusted'],
    colorAdjustments: {
      hueShift: -5,
      saturation: 130,
      brightness: 95,
      contrast: 130,
      warmth: 50,
    },
    overlayColor: 'rgba(200, 50, 50, 0.1)',
    vignetteStrength: 40,
    promptModifier: 'harsh red tones, aggressive lighting, high contrast shadows, intense color palette',
  },
  {
    id: 'dark_fear',
    name: 'Dark Fear',
    description: 'Dark, shadowy tones for fear and horror',
    moodCategory: 'negative',
    primaryMoods: ['fearful', 'desperate'],
    colorAdjustments: {
      hueShift: -10,
      saturation: 60,
      brightness: 75,
      contrast: 140,
      warmth: -30,
    },
    overlayColor: 'rgba(20, 20, 40, 0.2)',
    vignetteStrength: 60,
    promptModifier: 'dark shadows, low-key lighting, ominous atmosphere, deep blacks, horror movie aesthetic',
  },

  // Neutral moods
  {
    id: 'natural_balance',
    name: 'Natural Balance',
    description: 'Balanced, realistic colors for neutral scenes',
    moodCategory: 'neutral',
    primaryMoods: ['neutral', 'thoughtful', 'curious'],
    colorAdjustments: {
      hueShift: 0,
      saturation: 100,
      brightness: 100,
      contrast: 100,
      warmth: 0,
    },
    vignetteStrength: 10,
    promptModifier: 'natural lighting, balanced colors, realistic color palette',
  },
  {
    id: 'muted_contemplation',
    name: 'Muted Contemplation',
    description: 'Subdued tones for introspective moments',
    moodCategory: 'neutral',
    primaryMoods: ['thoughtful'],
    colorAdjustments: {
      hueShift: 5,
      saturation: 75,
      brightness: 95,
      contrast: 90,
      warmth: 10,
    },
    overlayColor: 'rgba(200, 180, 160, 0.1)',
    vignetteStrength: 25,
    promptModifier: 'muted color palette, soft shadows, contemplative atmosphere, sepia undertones',
  },

  // Intense moods
  {
    id: 'heroic_drama',
    name: 'Heroic Drama',
    description: 'Bold, dramatic lighting for determination and victory',
    moodCategory: 'intense',
    primaryMoods: ['determined', 'victorious'],
    colorAdjustments: {
      hueShift: 15,
      saturation: 125,
      brightness: 100,
      contrast: 135,
      warmth: 30,
    },
    overlayColor: 'rgba(255, 180, 100, 0.08)',
    vignetteStrength: 30,
    promptModifier: 'heroic lighting, dramatic shadows, golden hour glow, epic atmosphere, cinematic contrast',
  },
  {
    id: 'sinister_shadow',
    name: 'Sinister Shadow',
    description: 'Ominous tones for menacing characters',
    moodCategory: 'intense',
    primaryMoods: ['menacing'],
    colorAdjustments: {
      hueShift: -20,
      saturation: 90,
      brightness: 80,
      contrast: 150,
      warmth: -20,
    },
    overlayColor: 'rgba(80, 0, 80, 0.12)',
    vignetteStrength: 50,
    promptModifier: 'sinister lighting, deep shadows, cold undertones, villain aesthetic, dramatic noir style',
  },
  {
    id: 'desperate_urgency',
    name: 'Desperate Urgency',
    description: 'Harsh, urgent tones for desperate scenes',
    moodCategory: 'intense',
    primaryMoods: ['desperate'],
    colorAdjustments: {
      hueShift: 0,
      saturation: 110,
      brightness: 90,
      contrast: 145,
      warmth: 15,
    },
    overlayColor: 'rgba(255, 100, 50, 0.08)',
    vignetteStrength: 45,
    promptModifier: 'harsh lighting, urgent atmosphere, high contrast, motion blur feel, adrenaline aesthetic',
  },
];

export function getColorGradingForMood(moodId: string): ColorGradingPreset | undefined {
  // Find preset that includes this mood in primaryMoods
  const directMatch = COLOR_GRADING_PRESETS.find(p => p.primaryMoods.includes(moodId));
  if (directMatch) return directMatch;

  // Fall back to category match
  const emotion = EMOTION_STATES.find(e => e.id === moodId);
  if (!emotion) return COLOR_GRADING_PRESETS.find(p => p.id === 'natural_balance');

  return COLOR_GRADING_PRESETS.find(p => p.moodCategory === emotion.category) 
    || COLOR_GRADING_PRESETS.find(p => p.id === 'natural_balance');
}

export function getDominantMoodColorGrading(
  characterMoods: Record<string, string>
): ColorGradingPreset {
  const moodCounts: Record<MoodCategory, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    intense: 0,
  };

  const moodIds = Object.values(characterMoods);
  moodIds.forEach(moodId => {
    const emotion = EMOTION_STATES.find(e => e.id === moodId);
    if (emotion) {
      moodCounts[emotion.category]++;
    }
  });

  // Find dominant category
  const dominantCategory = (Object.entries(moodCounts) as [MoodCategory, number][])
    .sort((a, b) => b[1] - a[1])[0]?.[0] || 'neutral';

  // Get most common mood in dominant category
  const dominantMoods = moodIds.filter(id => {
    const e = EMOTION_STATES.find(em => em.id === id);
    return e?.category === dominantCategory;
  });

  const mostCommonMood = dominantMoods[0] || 'neutral';
  
  return getColorGradingForMood(mostCommonMood) 
    || COLOR_GRADING_PRESETS.find(p => p.id === 'natural_balance')!;
}

export function generateColorGradingCSS(preset: ColorGradingPreset): string {
  const { colorAdjustments, overlayColor, vignetteStrength } = preset;
  
  const filters: string[] = [];
  
  if (colorAdjustments.hueShift !== 0) {
    filters.push(`hue-rotate(${colorAdjustments.hueShift}deg)`);
  }
  if (colorAdjustments.saturation !== 100) {
    filters.push(`saturate(${colorAdjustments.saturation}%)`);
  }
  if (colorAdjustments.brightness !== 100) {
    filters.push(`brightness(${colorAdjustments.brightness}%)`);
  }
  if (colorAdjustments.contrast !== 100) {
    filters.push(`contrast(${colorAdjustments.contrast}%)`);
  }
  
  return filters.join(' ');
}

export function getColorGradingPresetById(id: string): ColorGradingPreset | undefined {
  return COLOR_GRADING_PRESETS.find(p => p.id === id);
}

export function getPresetsForCategory(category: MoodCategory): ColorGradingPreset[] {
  return COLOR_GRADING_PRESETS.filter(p => p.moodCategory === category);
}
