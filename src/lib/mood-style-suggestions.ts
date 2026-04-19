import { ArtStyle, ArtStyleConfig, getStyleById } from './art-styles';
import { MoodCategory, EmotionState } from './character-moods';

export interface MoodStyleRecommendation {
  style: ArtStyleConfig;
  score: number;
  reason: string;
}

// Map mood categories and specific emotions to compatible art styles
const MOOD_STYLE_MAPPING: Record<string, { styles: ArtStyle[]; reason: string }> = {
  // Categories
  positive: {
    styles: ['manga', 'alan-davis', 'wendy-pini', 'john-byrne'],
    reason: 'Bright, expressive styles suit positive emotions well'
  },
  negative: {
    styles: ['mike-mignola', 'frank-miller', 'noir', 'todd-mcfarlane'],
    reason: 'Dark, dramatic styles enhance negative emotional weight'
  },
  neutral: {
    styles: ['western', 'moebius', 'oliver-coipel', 'john-byrne'],
    reason: 'Balanced styles work well with contemplative scenes'
  },
  intense: {
    styles: ['jim-lee', 'todd-mcfarlane', 'mark-silvestri', 'frank-miller'],
    reason: 'High-energy styles amplify intense emotional moments'
  },
  
  // Specific emotions for more targeted recommendations
  happy: {
    styles: ['manga', 'alan-davis', 'wendy-pini'],
    reason: 'Light, expressive styles capture joy and warmth'
  },
  excited: {
    styles: ['jim-lee', 'manga', 'mark-silvestri'],
    reason: 'Dynamic, energetic styles match excitement'
  },
  sad: {
    styles: ['mike-mignola', 'watercolor', 'alex-ross'],
    reason: 'Moody, atmospheric styles enhance melancholy'
  },
  angry: {
    styles: ['frank-miller', 'todd-mcfarlane', 'jim-lee'],
    reason: 'Bold, aggressive styles suit anger and conflict'
  },
  fearful: {
    styles: ['mike-mignola', 'noir', 'frank-miller'],
    reason: 'Dark, shadowy styles heighten fear and tension'
  },
  determined: {
    styles: ['jim-lee', 'alex-ross', 'john-byrne'],
    reason: 'Heroic styles reinforce determination and resolve'
  },
  menacing: {
    styles: ['mike-mignola', 'todd-mcfarlane', 'frank-miller'],
    reason: 'Gothic, intense styles amplify menace'
  },
  victorious: {
    styles: ['alex-ross', 'jim-lee', 'john-byrne'],
    reason: 'Epic, heroic styles celebrate triumph'
  },
  desperate: {
    styles: ['frank-miller', 'mike-mignola', 'noir'],
    reason: 'High-contrast styles convey desperation'
  },
  curious: {
    styles: ['moebius', 'alan-davis', 'barry-windsor-smith'],
    reason: 'Detailed, wonder-filled styles suit curiosity'
  },
  hopeful: {
    styles: ['alex-ross', 'watercolor', 'wendy-pini'],
    reason: 'Soft, luminous styles capture hope'
  },
  thoughtful: {
    styles: ['moebius', 'alex-ross', 'barry-windsor-smith'],
    reason: 'Contemplative, detailed styles enhance reflection'
  }
};

export function getStyleSuggestionsForMood(
  moodId: string,
  category: MoodCategory
): MoodStyleRecommendation[] {
  const recommendations: MoodStyleRecommendation[] = [];
  
  // Get specific mood recommendations first
  const moodMapping = MOOD_STYLE_MAPPING[moodId];
  if (moodMapping) {
    moodMapping.styles.forEach((styleId, index) => {
      const style = getStyleById(styleId);
      if (style) {
        recommendations.push({
          style,
          score: 100 - (index * 10), // First is best match
          reason: moodMapping.reason
        });
      }
    });
  }
  
  // Add category-based recommendations if we need more
  if (recommendations.length < 4) {
    const categoryMapping = MOOD_STYLE_MAPPING[category];
    if (categoryMapping) {
      categoryMapping.styles.forEach((styleId, index) => {
        // Avoid duplicates
        if (!recommendations.find(r => r.style.id === styleId)) {
          const style = getStyleById(styleId);
          if (style) {
            recommendations.push({
              style,
              score: 80 - (index * 10),
              reason: categoryMapping.reason
            });
          }
        }
      });
    }
  }
  
  return recommendations.slice(0, 4);
}

export function getStyleSuggestionsForMultipleMoods(
  characterMoods: Array<{ moodId: string; category: MoodCategory; intensity: number }>
): MoodStyleRecommendation[] {
  // Aggregate scores across all character moods
  const styleScores = new Map<string, { style: ArtStyleConfig; totalScore: number; reasons: Set<string> }>();
  
  characterMoods.forEach(({ moodId, category, intensity }) => {
    const suggestions = getStyleSuggestionsForMood(moodId, category);
    
    suggestions.forEach(suggestion => {
      const existing = styleScores.get(suggestion.style.id);
      // Weight by intensity
      const weightedScore = suggestion.score * (intensity / 2);
      
      if (existing) {
        existing.totalScore += weightedScore;
        existing.reasons.add(suggestion.reason);
      } else {
        styleScores.set(suggestion.style.id, {
          style: suggestion.style,
          totalScore: weightedScore,
          reasons: new Set([suggestion.reason])
        });
      }
    });
  });
  
  // Convert to sorted array
  return Array.from(styleScores.values())
    .map(({ style, totalScore, reasons }) => ({
      style,
      score: Math.min(100, totalScore),
      reason: Array.from(reasons)[0] // Use primary reason
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 4);
}

export function getDominantMoodCategory(
  characterMoods: Array<{ category: MoodCategory; intensity: number }>
): MoodCategory {
  const categoryScores: Record<MoodCategory, number> = {
    positive: 0,
    negative: 0,
    neutral: 0,
    intense: 0
  };
  
  characterMoods.forEach(({ category, intensity }) => {
    categoryScores[category] += intensity;
  });
  
  return Object.entries(categoryScores)
    .sort((a, b) => b[1] - a[1])[0][0] as MoodCategory;
}
