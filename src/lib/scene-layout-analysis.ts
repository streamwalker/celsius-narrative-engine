import { ParsedPanel } from './script-parser';

export type LayoutTemplate = 'standard-grid' | 'dynamic-flow' | 'splash-heavy' | 'dialogue-focused' | 'action-sequence';
export type PanelSize = 'full' | 'large' | 'medium' | 'small' | 'strip';
export type CameraAngle = 'wide' | 'medium' | 'closeup' | 'extreme-closeup' | 'bird-eye' | 'worm-eye';
export type ScenePacing = 'fast' | 'medium' | 'slow' | 'variable';

export interface LayoutTemplateConfig {
  id: LayoutTemplate;
  name: string;
  description: string;
  bestFor: string[];
  icon: string;
  defaultPanelSizes: PanelSize[];
}

export const LAYOUT_TEMPLATES: Record<LayoutTemplate, LayoutTemplateConfig> = {
  'standard-grid': {
    id: 'standard-grid',
    name: 'Standard Grid',
    description: '3-4 equal panels per page, balanced composition',
    bestFor: ['dialogue', 'slice-of-life', 'exposition'],
    icon: '▦',
    defaultPanelSizes: ['medium', 'medium', 'medium', 'medium'],
  },
  'dynamic-flow': {
    id: 'dynamic-flow',
    name: 'Dynamic Flow',
    description: 'Varied panel sizes following the action',
    bestFor: ['action', 'chase-scenes', 'fights'],
    icon: '◢',
    defaultPanelSizes: ['large', 'small', 'small', 'medium'],
  },
  'splash-heavy': {
    id: 'splash-heavy',
    name: 'Splash Heavy',
    description: 'Large dramatic panels with small inserts',
    bestFor: ['revelations', 'epic-moments', 'establishing-shots'],
    icon: '▣',
    defaultPanelSizes: ['full', 'small', 'small'],
  },
  'dialogue-focused': {
    id: 'dialogue-focused',
    name: 'Dialogue Focused',
    description: 'Smaller panels optimized for character exchanges',
    bestFor: ['conversations', 'debates', 'interrogations'],
    icon: '▤',
    defaultPanelSizes: ['small', 'small', 'small', 'small', 'medium', 'medium'],
  },
  'action-sequence': {
    id: 'action-sequence',
    name: 'Action Sequence',
    description: 'Rapid small panels for fast pacing',
    bestFor: ['fights', 'chases', 'montages'],
    icon: '▥',
    defaultPanelSizes: ['strip', 'strip', 'strip', 'medium', 'strip', 'strip'],
  },
};

export interface CameraAngleGuide {
  angle: CameraAngle;
  name: string;
  useCases: string[];
  emotionalEffect: string;
  icon: string;
}

export const CAMERA_ANGLES: CameraAngleGuide[] = [
  {
    angle: 'wide',
    name: 'Wide Shot',
    useCases: ['establishing', 'group-scenes', 'locations'],
    emotionalEffect: 'Context, scale, environment',
    icon: '🏔️',
  },
  {
    angle: 'medium',
    name: 'Medium Shot',
    useCases: ['dialogue', 'interactions', 'standard-action'],
    emotionalEffect: 'Balanced, neutral, conversational',
    icon: '👤',
  },
  {
    angle: 'closeup',
    name: 'Close-up',
    useCases: ['emotions', 'reactions', 'tension'],
    emotionalEffect: 'Intimacy, focus, emotion',
    icon: '😐',
  },
  {
    angle: 'extreme-closeup',
    name: 'Extreme Close-up',
    useCases: ['critical-objects', 'eyes', 'dramatic-moments'],
    emotionalEffect: 'Intensity, significance, drama',
    icon: '👁️',
  },
  {
    angle: 'bird-eye',
    name: "Bird's Eye View",
    useCases: ['overview', 'vulnerability', 'chaos'],
    emotionalEffect: 'God-view, overwhelm, isolation',
    icon: '🦅',
  },
  {
    angle: 'worm-eye',
    name: "Worm's Eye View",
    useCases: ['power', 'intimidation', 'heroic'],
    emotionalEffect: 'Dominance, awe, threat',
    icon: '⬆️',
  },
];

export interface PanelLayoutSuggestion {
  panelKey: string;
  panelIndex: number;
  suggestedSize: PanelSize;
  suggestedCameraAngle: CameraAngle;
  dramaticWeight: 1 | 2 | 3 | 4 | 5;
  compositionNotes: string;
  reasoning: string;
  isKeyMoment: boolean;
  keyMomentType?: 'revelation' | 'action-peak' | 'emotional-beat' | 'transition' | 'establishing';
}

export interface SceneAnalysisResult {
  overallPacing: ScenePacing;
  suggestedTemplate: LayoutTemplate;
  panelSuggestions: PanelLayoutSuggestion[];
  narrativeNotes: string;
  estimatedImpact: number; // 1-10 scale
}

// Action words that indicate fast pacing
const ACTION_WORDS = [
  'explodes', 'crashes', 'runs', 'jumps', 'attacks', 'dodges', 'strikes',
  'slams', 'bursts', 'races', 'charges', 'leaps', 'punches', 'kicks',
  'shoots', 'falls', 'smashes', 'breaks', 'throws', 'catches', 'grabs',
];

// Emotional words that indicate dramatic moments
const DRAMATIC_WORDS = [
  'reveals', 'discovers', 'realizes', 'confesses', 'betrays', 'dies',
  'transforms', 'awakens', 'remembers', 'forgives', 'sacrifices',
  'declares', 'promises', 'threatens', 'weeps', 'screams', 'whispers',
];

// Detect pacing from script text
export function detectScenePacing(panels: ParsedPanel[]): ScenePacing {
  const allText = panels.map(p => 
    `${p.description} ${p.dialogue || ''} ${p.narration || ''}`
  ).join(' ').toLowerCase();
  
  const actionCount = ACTION_WORDS.filter(word => allText.includes(word)).length;
  const dialogueLength = panels.reduce((sum, p) => sum + (p.dialogue?.length || 0), 0);
  const descriptionLength = panels.reduce((sum, p) => sum + p.description.length, 0);
  
  const dialogueRatio = dialogueLength / (dialogueLength + descriptionLength + 1);
  
  if (actionCount > 5) return 'fast';
  if (dialogueRatio > 0.6) return 'slow';
  if (actionCount > 2 && dialogueRatio < 0.3) return 'fast';
  if (actionCount === 0 && dialogueRatio > 0.4) return 'slow';
  
  // Check for mixed pacing
  const hasAction = actionCount > 0;
  const hasDialogue = dialogueRatio > 0.2;
  if (hasAction && hasDialogue) return 'variable';
  
  return 'medium';
}

// Suggest layout template based on pacing and content
export function suggestLayoutTemplate(pacing: ScenePacing, panels: ParsedPanel[]): LayoutTemplate {
  const allText = panels.map(p => p.description).join(' ').toLowerCase();
  
  // Check for specific content patterns
  const hasDramaticMoment = DRAMATIC_WORDS.some(word => allText.includes(word));
  const hasDialogue = panels.some(p => p.dialogue && p.dialogue.length > 50);
  const hasAction = ACTION_WORDS.some(word => allText.includes(word));
  
  if (hasDramaticMoment && panels.length <= 4) return 'splash-heavy';
  if (pacing === 'fast' && hasAction) return 'action-sequence';
  if (pacing === 'slow' && hasDialogue) return 'dialogue-focused';
  if (pacing === 'variable') return 'dynamic-flow';
  
  return 'standard-grid';
}

// Calculate dramatic weight for a panel
export function calculateDramaticWeight(
  panel: ParsedPanel,
  panelIndex: number,
  totalPanels: number
): 1 | 2 | 3 | 4 | 5 {
  const text = `${panel.description} ${panel.dialogue || ''} ${panel.narration || ''}`.toLowerCase();
  
  let weight = 2; // Base weight
  
  // Check for dramatic words
  const dramaticCount = DRAMATIC_WORDS.filter(word => text.includes(word)).length;
  weight += Math.min(dramaticCount, 2);
  
  // First and last panels often carry more weight
  if (panelIndex === 0 || panelIndex === totalPanels - 1) {
    weight += 1;
  }
  
  // Exclamation marks indicate intensity
  const exclamations = (text.match(/!/g) || []).length;
  if (exclamations > 2) weight += 1;
  
  // Long dialogue might indicate important scene
  if (panel.dialogue && panel.dialogue.length > 100) weight += 1;
  
  return Math.min(5, Math.max(1, weight)) as 1 | 2 | 3 | 4 | 5;
}

// Suggest camera angle based on panel content
export function suggestCameraAngle(panel: ParsedPanel): CameraAngle {
  const text = `${panel.description} ${panel.dialogue || ''}`.toLowerCase();
  
  // Check for establishing/location keywords
  if (text.includes('city') || text.includes('landscape') || text.includes('building') ||
      text.includes('forest') || text.includes('establishing')) {
    return 'wide';
  }
  
  // Check for emotional/reaction keywords
  if (text.includes('tears') || text.includes('expression') || text.includes('eyes') ||
      text.includes('face') || text.includes('emotion')) {
    return 'closeup';
  }
  
  // Check for power/intimidation
  if (text.includes('tower') || text.includes('looming') || text.includes('powerful') ||
      text.includes('intimidating') || text.includes('giant')) {
    return 'worm-eye';
  }
  
  // Check for overview/chaos
  if (text.includes('battle') || text.includes('crowd') || text.includes('overview') ||
      text.includes('chaos') || text.includes('above')) {
    return 'bird-eye';
  }
  
  // Check for intense close-ups
  if (text.includes('detail') || text.includes('focus on') || text.includes('zoom')) {
    return 'extreme-closeup';
  }
  
  // Default to medium shot for dialogue
  if (panel.dialogue && panel.dialogue.length > 20) {
    return 'medium';
  }
  
  return 'medium';
}

// Suggest panel size based on dramatic weight and content
export function suggestPanelSize(dramaticWeight: number, panel: ParsedPanel): PanelSize {
  if (dramaticWeight >= 5) return 'full';
  if (dramaticWeight >= 4) return 'large';
  if (dramaticWeight <= 1) return 'small';
  
  // Check dialogue length
  if (panel.dialogue && panel.dialogue.length > 150) return 'large';
  if (!panel.dialogue || panel.dialogue.length < 30) return 'small';
  
  return 'medium';
}

// Detect key moments in panels
export function detectKeyMoment(
  panel: ParsedPanel
): { isKeyMoment: boolean; type?: PanelLayoutSuggestion['keyMomentType'] } {
  const text = `${panel.description} ${panel.dialogue || ''} ${panel.narration || ''}`.toLowerCase();
  
  if (text.includes('reveal') || text.includes('discover') || text.includes('realize')) {
    return { isKeyMoment: true, type: 'revelation' };
  }
  
  if (text.includes('attack') || text.includes('strike') || text.includes('explode') ||
      text.includes('clash') || text.includes('fight')) {
    return { isKeyMoment: true, type: 'action-peak' };
  }
  
  if (text.includes('tears') || text.includes('embrace') || text.includes('confess') ||
      text.includes('love') || text.includes('forgive')) {
    return { isKeyMoment: true, type: 'emotional-beat' };
  }
  
  if (text.includes('meanwhile') || text.includes('later') || text.includes('elsewhere')) {
    return { isKeyMoment: true, type: 'transition' };
  }
  
  if (text.includes('establishing') || text.includes('city') || text.includes('location')) {
    return { isKeyMoment: true, type: 'establishing' };
  }
  
  return { isKeyMoment: false };
}

// Generate composition notes for a panel
export function generateCompositionNotes(
  panel: ParsedPanel,
  cameraAngle: CameraAngle,
  size: PanelSize
): string {
  const notes: string[] = [];
  
  const angleGuide = CAMERA_ANGLES.find(a => a.angle === cameraAngle);
  if (angleGuide) {
    notes.push(`${angleGuide.name}: ${angleGuide.emotionalEffect}`);
  }
  
  if (size === 'full' || size === 'large') {
    notes.push('Give this moment visual emphasis');
  }
  
  if (panel.dialogue && panel.dialogue.length > 100) {
    notes.push('Leave space for speech bubbles');
  }
  
  if (panel.narration) {
    notes.push('Include caption box area');
  }
  
  return notes.join('. ');
}

// Get panel size display info
export function getPanelSizeInfo(size: PanelSize): { label: string; width: string } {
  switch (size) {
    case 'full': return { label: 'Full Page', width: '100%' };
    case 'large': return { label: 'Large', width: '66%' };
    case 'medium': return { label: 'Medium', width: '50%' };
    case 'small': return { label: 'Small', width: '33%' };
    case 'strip': return { label: 'Strip', width: '100%' };
    default: return { label: 'Medium', width: '50%' };
  }
}

// Get dramatic weight display
export function getDramaticWeightStars(weight: number): string {
  return '★'.repeat(weight) + '☆'.repeat(5 - weight);
}
