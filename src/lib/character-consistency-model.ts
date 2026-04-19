/**
 * OpenArt-inspired Character Consistency Model
 * 
 * This module implements a character consistency system inspired by OpenArt.ai's Character 2.0:
 * 
 * 1. Multi-Reference Processing: Uses multiple reference images per character for better identity capture
 * 2. Character Weight System: Adjustable adherence to references vs creative freedom
 * 3. Feature Preservation: Explicitly tracks key features (hair, face, clothing, accessories)
 * 4. Pose-Independent Identity: Separates character identity from pose/action
 * 5. Consistency Scoring: Analyzes generated images against references
 */

export interface CharacterProfile {
  id: string;
  name: string;
  description: string;
  references: CharacterReference[];
  keyFeatures: KeyFeatures;
  consistencyWeight: number; // 0-1, how strictly to follow references
}

export interface CharacterReference {
  image: string;
  poseType: 'front' | 'side' | 'back' | 'action' | 'portrait' | 'full-body';
  tags: string[];
  isPrimary: boolean;
}

export interface KeyFeatures {
  hairColor: string;
  hairStyle: string;
  eyeColor: string;
  skinTone: string;
  facialFeatures: string[];
  clothing: string[];
  accessories: string[];
  distinctiveMarks: string[];
  bodyType: string;
}

export interface ConsistencyConfig {
  characterWeight: number; // 0-1, overall adherence
  preserveKeyFeatures: boolean;
  faceMatchingPriority: 'high' | 'medium' | 'low';
  clothingConsistency: boolean;
  poseFlexibility: 'strict' | 'moderate' | 'flexible';
}

/**
 * Generate enhanced prompt with character consistency instructions
 */
export function generateConsistencyPrompt(
  basePrompt: string,
  characters: CharacterProfile[],
  config: ConsistencyConfig
): string {
  const characterBlocks = characters.map(char => {
    const featureList = buildFeatureList(char.keyFeatures);
    const weight = char.consistencyWeight * config.characterWeight;
    
    return `
CHARACTER: "${char.name}"
Identity Weight: ${Math.round(weight * 100)}%
Key Features (MUST PRESERVE):
${featureList}
Description: ${char.description}
`;
  }).join('\n---\n');

  const consistencyRules = buildConsistencyRules(config);

  return `${consistencyRules}

CHARACTERS IN SCENE:
${characterBlocks}

SCENE TO GENERATE:
${basePrompt}

CRITICAL: Each character must be immediately recognizable based on their key features.`;
}

function buildFeatureList(features: KeyFeatures): string {
  const lines: string[] = [];
  
  if (features.hairColor || features.hairStyle) {
    lines.push(`- Hair: ${features.hairColor} ${features.hairStyle}`.trim());
  }
  if (features.eyeColor) {
    lines.push(`- Eyes: ${features.eyeColor}`);
  }
  if (features.skinTone) {
    lines.push(`- Skin: ${features.skinTone}`);
  }
  if (features.facialFeatures.length > 0) {
    lines.push(`- Face: ${features.facialFeatures.join(', ')}`);
  }
  if (features.clothing.length > 0) {
    lines.push(`- Clothing: ${features.clothing.join(', ')}`);
  }
  if (features.accessories.length > 0) {
    lines.push(`- Accessories: ${features.accessories.join(', ')}`);
  }
  if (features.distinctiveMarks.length > 0) {
    lines.push(`- Distinctive: ${features.distinctiveMarks.join(', ')}`);
  }
  if (features.bodyType) {
    lines.push(`- Build: ${features.bodyType}`);
  }
  
  return lines.join('\n');
}

function buildConsistencyRules(config: ConsistencyConfig): string {
  const rules: string[] = [
    'CHARACTER CONSISTENCY PROTOCOL (OpenArt-Style):',
  ];

  if (config.preserveKeyFeatures) {
    rules.push('- PRESERVE KEY FEATURES: Hair color/style, eye color, clothing, and accessories must match references EXACTLY');
  }

  switch (config.faceMatchingPriority) {
    case 'high':
      rules.push('- FACE PRIORITY: HIGH - Facial structure, proportions, and expression style must closely match reference');
      break;
    case 'medium':
      rules.push('- FACE PRIORITY: MEDIUM - Maintain recognizable facial features with some artistic flexibility');
      break;
    case 'low':
      rules.push('- FACE PRIORITY: LOW - General resemblance acceptable');
      break;
  }

  if (config.clothingConsistency) {
    rules.push('- CLOTHING LOCK: Maintain consistent outfit details across all panels unless script specifies change');
  }

  switch (config.poseFlexibility) {
    case 'strict':
      rules.push('- POSE MODE: STRICT - Character proportions and style must remain constant');
      break;
    case 'moderate':
      rules.push('- POSE MODE: MODERATE - Allow dynamic poses while maintaining character identity');
      break;
    case 'flexible':
      rules.push('- POSE MODE: FLEXIBLE - Prioritize action/emotion over strict consistency');
      break;
  }

  return rules.join('\n');
}

/**
 * Select optimal reference images for a specific panel context
 */
export function selectReferencesForPanel(
  character: CharacterProfile,
  panelDescription: string,
  dialogueAction?: string
): CharacterReference[] {
  const selected: CharacterReference[] = [];
  
  // Always include primary reference
  const primary = character.references.find(r => r.isPrimary);
  if (primary) {
    selected.push(primary);
  }

  // Analyze panel for action type
  const lowerDesc = panelDescription.toLowerCase();
  const isAction = lowerDesc.includes('running') || lowerDesc.includes('fighting') || 
                   lowerDesc.includes('jumping') || lowerDesc.includes('action');
  const isFrontView = lowerDesc.includes('facing') || lowerDesc.includes('front') ||
                      lowerDesc.includes('looking at');
  const isSideView = lowerDesc.includes('profile') || lowerDesc.includes('side view');
  const isBackView = lowerDesc.includes('back') || lowerDesc.includes('behind') ||
                     lowerDesc.includes('walking away');

  // Select matching pose references
  for (const ref of character.references) {
    if (ref.isPrimary) continue; // Already added
    
    if (isAction && ref.poseType === 'action') {
      selected.push(ref);
    } else if (isFrontView && ref.poseType === 'front') {
      selected.push(ref);
    } else if (isSideView && ref.poseType === 'side') {
      selected.push(ref);
    } else if (isBackView && ref.poseType === 'back') {
      selected.push(ref);
    }
  }

  // If no specific match, add portrait for close-ups
  if (selected.length === 1 && (lowerDesc.includes('close') || lowerDesc.includes('face'))) {
    const portrait = character.references.find(r => r.poseType === 'portrait');
    if (portrait) {
      selected.push(portrait);
    }
  }

  // Limit to 3 references for efficiency
  return selected.slice(0, 3);
}

/**
 * Analyze consistency issues and generate fix suggestions
 */
export function analyzeConsistencyIssues(
  characterMatches: { characterName: string; matchScore: number; issues: string[] }[]
): {
  characterName: string;
  issues: string[];
  suggestedFixes: string[];
  priority: 'high' | 'medium' | 'low';
}[] {
  return characterMatches.map(match => {
    const priority = match.matchScore < 50 ? 'high' : 
                     match.matchScore < 70 ? 'medium' : 'low';
    
    const suggestedFixes = match.issues.map(issue => {
      const lower = issue.toLowerCase();
      
      if (lower.includes('hair')) {
        return 'Add explicit hair color and style specification in prompt';
      }
      if (lower.includes('clothing') || lower.includes('costume')) {
        return 'Lock clothing details with specific garment descriptions';
      }
      if (lower.includes('face') || lower.includes('features')) {
        return 'Increase face matching priority and add portrait reference';
      }
      if (lower.includes('color')) {
        return 'Specify exact color values in character description';
      }
      if (lower.includes('accessory') || lower.includes('accessories')) {
        return 'List all accessories explicitly in character profile';
      }
      
      return 'Add more reference images covering this aspect';
    });

    return {
      characterName: match.characterName,
      issues: match.issues,
      suggestedFixes: [...new Set(suggestedFixes)],
      priority,
    };
  });
}

/**
 * Default consistency configuration (balanced)
 */
export const DEFAULT_CONSISTENCY_CONFIG: ConsistencyConfig = {
  characterWeight: 0.8,
  preserveKeyFeatures: true,
  faceMatchingPriority: 'medium',
  clothingConsistency: true,
  poseFlexibility: 'moderate',
};

/**
 * Strict consistency configuration (maximum adherence)
 */
export const STRICT_CONSISTENCY_CONFIG: ConsistencyConfig = {
  characterWeight: 1.0,
  preserveKeyFeatures: true,
  faceMatchingPriority: 'high',
  clothingConsistency: true,
  poseFlexibility: 'strict',
};
