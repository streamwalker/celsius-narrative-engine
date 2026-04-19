/**
 * Character Consistency Validator
 * 
 * Pre-generation validation to ensure characters have sufficient references
 * and consistent descriptions before batch generation.
 */

import { CharacterProfile, KeyFeatures } from './character-consistency-model';

export type IssueSeverity = 'blocker' | 'warning' | 'info';

export interface ValidationIssue {
  id: string;
  characterId: string;
  characterName: string;
  severity: IssueSeverity;
  category: 'reference' | 'profile' | 'description' | 'pose' | 'consistency';
  message: string;
  suggestion: string;
  affectedPanels?: string[];
}

export interface ValidationResult {
  isValid: boolean;
  readinessScore: number; // 0-100
  issues: ValidationIssue[];
  blockerCount: number;
  warningCount: number;
  infoCount: number;
  characterBreakdown: CharacterValidation[];
}

export interface CharacterValidation {
  characterId: string;
  characterName: string;
  score: number;
  hasBlockers: boolean;
  issues: ValidationIssue[];
  referenceCount: number;
  profileCompleteness: number;
}

export interface PanelCharacterData {
  panelKey: string;
  characters: string[];
}

/**
 * Validate all characters before batch generation
 */
export function validateCharactersForGeneration(
  characters: CharacterProfile[],
  panelData: PanelCharacterData[]
): ValidationResult {
  const issues: ValidationIssue[] = [];
  const characterBreakdown: CharacterValidation[] = [];

  // Build character appearance map
  const characterAppearances: Record<string, string[]> = {};
  for (const panel of panelData) {
    for (const charName of panel.characters) {
      if (!characterAppearances[charName.toLowerCase()]) {
        characterAppearances[charName.toLowerCase()] = [];
      }
      characterAppearances[charName.toLowerCase()].push(panel.panelKey);
    }
  }

  // Validate each character
  for (const char of characters) {
    const charIssues: ValidationIssue[] = [];
    const affectedPanels = characterAppearances[char.name.toLowerCase()] || [];

    // Check reference images
    if (char.references.length === 0) {
      charIssues.push({
        id: `${char.id}-no-refs`,
        characterId: char.id,
        characterName: char.name,
        severity: 'blocker',
        category: 'reference',
        message: 'No reference images',
        suggestion: 'Add at least one reference image to ensure character consistency',
        affectedPanels,
      });
    } else if (char.references.length === 1) {
      charIssues.push({
        id: `${char.id}-single-ref`,
        characterId: char.id,
        characterName: char.name,
        severity: 'warning',
        category: 'reference',
        message: 'Only 1 reference image',
        suggestion: 'Add 3+ reference images from different angles for better consistency',
        affectedPanels,
      });
    } else if (char.references.length < 3) {
      charIssues.push({
        id: `${char.id}-few-refs`,
        characterId: char.id,
        characterName: char.name,
        severity: 'info',
        category: 'reference',
        message: `Only ${char.references.length} reference images`,
        suggestion: 'Consider adding more reference images for optimal results',
        affectedPanels,
      });
    }

    // Check for primary reference
    if (char.references.length > 0 && !char.references.some(r => r.isPrimary)) {
      charIssues.push({
        id: `${char.id}-no-primary`,
        characterId: char.id,
        characterName: char.name,
        severity: 'warning',
        category: 'reference',
        message: 'No primary reference designated',
        suggestion: 'Mark one reference as primary for best consistency',
        affectedPanels,
      });
    }

    // Check profile completeness
    const profileIssues = validateKeyFeatures(char.id, char.name, char.keyFeatures, affectedPanels);
    charIssues.push(...profileIssues);

    // Check pose coverage
    const poseIssues = validatePoseCoverage(char, panelData, affectedPanels);
    charIssues.push(...poseIssues);

    // Check consistency weight
    if (char.consistencyWeight < 0.5) {
      charIssues.push({
        id: `${char.id}-low-weight`,
        characterId: char.id,
        characterName: char.name,
        severity: 'info',
        category: 'consistency',
        message: 'Low consistency weight may cause variations',
        suggestion: 'Increase consistency weight for stricter adherence to references',
        affectedPanels,
      });
    }

    // Calculate character score
    const blockerCount = charIssues.filter(i => i.severity === 'blocker').length;
    const warningCount = charIssues.filter(i => i.severity === 'warning').length;
    const infoCount = charIssues.filter(i => i.severity === 'info').length;
    
    const score = Math.max(0, 100 - (blockerCount * 40) - (warningCount * 15) - (infoCount * 5));
    const profileCompleteness = calculateProfileCompleteness(char.keyFeatures);

    characterBreakdown.push({
      characterId: char.id,
      characterName: char.name,
      score,
      hasBlockers: blockerCount > 0,
      issues: charIssues,
      referenceCount: char.references.length,
      profileCompleteness,
    });

    issues.push(...charIssues);
  }

  // Check for characters in script but not in profiles
  for (const [charName, panels] of Object.entries(characterAppearances)) {
    const hasProfile = characters.some(c => c.name.toLowerCase() === charName);
    if (!hasProfile && panels.length > 0) {
      issues.push({
        id: `missing-${charName}`,
        characterId: 'missing',
        characterName: charName,
        severity: 'warning',
        category: 'profile',
        message: `Character "${charName}" appears in script but has no profile`,
        suggestion: `Create a character profile for "${charName}" with reference images`,
        affectedPanels: panels,
      });
    }
  }

  const totalBlockers = issues.filter(i => i.severity === 'blocker').length;
  const totalWarnings = issues.filter(i => i.severity === 'warning').length;
  const totalInfo = issues.filter(i => i.severity === 'info').length;
  
  const readinessScore = Math.max(0, 100 - (totalBlockers * 30) - (totalWarnings * 10) - (totalInfo * 2));

  return {
    isValid: totalBlockers === 0,
    readinessScore,
    issues,
    blockerCount: totalBlockers,
    warningCount: totalWarnings,
    infoCount: totalInfo,
    characterBreakdown,
  };
}

function validateKeyFeatures(
  charId: string,
  charName: string,
  features: KeyFeatures,
  affectedPanels: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];

  // Check essential features
  if (!features.hairColor && !features.hairStyle) {
    issues.push({
      id: `${charId}-no-hair`,
      characterId: charId,
      characterName: charName,
      severity: 'blocker',
      category: 'profile',
      message: 'Missing hair description',
      suggestion: 'Add hair color and style for consistent rendering',
      affectedPanels,
    });
  }

  if (!features.eyeColor) {
    issues.push({
      id: `${charId}-no-eyes`,
      characterId: charId,
      characterName: charName,
      severity: 'warning',
      category: 'profile',
      message: 'Missing eye color',
      suggestion: 'Specify eye color for facial consistency',
      affectedPanels,
    });
  }

  if (features.clothing.length === 0) {
    issues.push({
      id: `${charId}-no-clothing`,
      characterId: charId,
      characterName: charName,
      severity: 'warning',
      category: 'profile',
      message: 'No clothing described',
      suggestion: 'Describe clothing to maintain outfit consistency',
      affectedPanels,
    });
  }

  // Check for vague descriptions
  const vagueTerms = ['dark', 'light', 'normal', 'average', 'medium'];
  const checkVague = (value: string, field: string) => {
    if (value && vagueTerms.some(v => value.toLowerCase() === v)) {
      issues.push({
        id: `${charId}-vague-${field}`,
        characterId: charId,
        characterName: charName,
        severity: 'info',
        category: 'description',
        message: `Vague ${field} description: "${value}"`,
        suggestion: `Use specific descriptors like "jet black" instead of "dark"`,
        affectedPanels,
      });
    }
  };

  checkVague(features.hairColor, 'hair color');
  checkVague(features.skinTone, 'skin tone');
  checkVague(features.eyeColor, 'eye color');

  return issues;
}

function validatePoseCoverage(
  char: CharacterProfile,
  panelData: PanelCharacterData[],
  affectedPanels: string[]
): ValidationIssue[] {
  const issues: ValidationIssue[] = [];
  
  const hasPoseType = (type: string) => char.references.some(r => r.poseType === type);
  
  // Check for front-facing pose (important for dialogue)
  if (!hasPoseType('front') && !hasPoseType('portrait')) {
    issues.push({
      id: `${char.id}-no-front`,
      characterId: char.id,
      characterName: char.name,
      severity: 'info',
      category: 'pose',
      message: 'No front-facing reference',
      suggestion: 'Add a front-facing reference for dialogue scenes',
      affectedPanels,
    });
  }

  // Check for action pose
  if (!hasPoseType('action') && !hasPoseType('full-body')) {
    issues.push({
      id: `${char.id}-no-action`,
      characterId: char.id,
      characterName: char.name,
      severity: 'info',
      category: 'pose',
      message: 'No action/full-body reference',
      suggestion: 'Add an action pose for dynamic scenes',
      affectedPanels,
    });
  }

  return issues;
}

function calculateProfileCompleteness(features: KeyFeatures): number {
  let filled = 0;
  let total = 8;

  if (features.hairColor) filled++;
  if (features.hairStyle) filled++;
  if (features.eyeColor) filled++;
  if (features.skinTone) filled++;
  if (features.facialFeatures.length > 0) filled++;
  if (features.clothing.length > 0) filled++;
  if (features.accessories.length > 0) filled++;
  if (features.bodyType) filled++;

  return Math.round((filled / total) * 100);
}

/**
 * Generate auto-fix suggestions for common issues
 */
export function generateAutoFixes(issues: ValidationIssue[]): {
  issueId: string;
  fixType: 'auto' | 'manual';
  action: string;
  description: string;
}[] {
  return issues.map(issue => {
    switch (issue.category) {
      case 'reference':
        return {
          issueId: issue.id,
          fixType: 'manual' as const,
          action: 'add_reference',
          description: 'Navigate to Character Library to add reference images',
        };
      case 'profile':
        return {
          issueId: issue.id,
          fixType: 'manual' as const,
          action: 'edit_profile',
          description: 'Open Profile Editor to complete missing fields',
        };
      case 'description':
        return {
          issueId: issue.id,
          fixType: 'auto' as const,
          action: 'enhance_description',
          description: 'AI can suggest more specific descriptions',
        };
      case 'consistency':
        return {
          issueId: issue.id,
          fixType: 'auto' as const,
          action: 'adjust_weight',
          description: 'Increase consistency weight to recommended level',
        };
      default:
        return {
          issueId: issue.id,
          fixType: 'manual' as const,
          action: 'review',
          description: 'Review and address manually',
        };
    }
  });
}
