import { ScriptParsingTemplate, getTemplateById, BUILT_IN_TEMPLATES } from './script-templates';

export interface ParsedPanel {
  id: number;
  description: string;
  narration?: string;
  dialogue?: string;
  isBlackAndWhite?: boolean;
  characters?: string[];
  compositionNotes?: string;
  dialogueSpeakers?: string[];
}

export interface ParsedPage {
  pageNumber: number;
  title?: string;
  panels: ParsedPanel[];
  openingNarration?: string;
}

// Extract character names from text (looks for ALL CAPS names)
function extractCharacterNames(text: string, pattern?: string): string[] {
  const names: string[] = [];
  
  // Use custom pattern if provided
  if (pattern) {
    try {
      const customRegex = new RegExp(pattern, 'g');
      let match;
      while ((match = customRegex.exec(text)) !== null) {
        const name = (match[1] || match[0]).trim();
        if (name && !names.includes(name) && name.length > 1) {
          names.push(name);
        }
      }
    } catch (e) {
      console.warn('Invalid character pattern:', e);
    }
  }
  
  // Default: Match dialogue format: CHARACTER NAME: or CHARACTER NAME (action):
  const dialoguePattern = /\b([A-Z][A-Z\s]{1,20})(?:\s*\([^)]*\))?\s*:/g;
  let match;
  while ((match = dialoguePattern.exec(text)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 1) {
      names.push(name);
    }
  }
  
  // Also look for character names mentioned in descriptions
  const actionPattern = /\b([A-Z][A-Z]{2,})\s+(?:stands?|sits?|walks?|runs?|attacks?|blocks?|looks?|turns?|faces?|holds?|raises?|grabs?|throws?|flies?|lands?|falls?|jumps?|moves?|appears?|enters?|exits?)/gi;
  while ((match = actionPattern.exec(text)) !== null) {
    const name = match[1].trim();
    if (name && !names.includes(name) && name.length > 2) {
      names.push(name);
    }
  }
  
  return names;
}

// Extract composition/direction notes
function extractCompositionNotes(text: string): string | undefined {
  const notes: string[] = [];
  
  const directionPatterns = [
    /facing\s+(the\s+)?(camera|viewer|screen|audience|left|right|forward|away)/gi,
    /looking\s+(at\s+)?(the\s+)?(camera|viewer|screen|audience|each other)/gi,
    /(wide|medium|close[- ]up|establishing|aerial|low[- ]angle|high[- ]angle)\s+shot/gi,
    /from\s+(above|below|behind|the side)/gi,
    /(all|everyone|both|they)\s+(face|look|turn)\s+(toward|at|to)/gi,
    /POV|point of view/gi,
  ];
  
  for (const pattern of directionPatterns) {
    let match;
    while ((match = pattern.exec(text)) !== null) {
      if (!notes.includes(match[0])) {
        notes.push(match[0]);
      }
    }
  }
  
  return notes.length > 0 ? notes.join(', ') : undefined;
}

// Extract dialogue speakers from panel content
function extractDialogueSpeakers(text: string, pattern?: string): string[] {
  const speakers: string[] = [];
  
  // Use custom pattern if provided
  if (pattern) {
    try {
      const customRegex = new RegExp(pattern, 'gm');
      let match;
      while ((match = customRegex.exec(text)) !== null) {
        const speaker = (match[1] || match[0]).trim();
        if (speaker && !speakers.includes(speaker)) {
          speakers.push(speaker);
        }
      }
    } catch (e) {
      console.warn('Invalid dialogue pattern:', e);
    }
  }
  
  // Default: Match "CHARACTER:" or "CHARACTER (whispers):" patterns
  const speakerPattern = /\b([A-Z][A-Z\s]{1,20})(?:\s*\([^)]*\))?\s*:/g;
  let match;
  while ((match = speakerPattern.exec(text)) !== null) {
    const speaker = match[1].trim();
    if (speaker && !speakers.includes(speaker)) {
      speakers.push(speaker);
    }
  }
  
  return speakers;
}

// Parse script with default template
export function parseScript(scriptText: string, templateId?: string): ParsedPage[] {
  const template = templateId 
    ? getTemplateById(templateId) || BUILT_IN_TEMPLATES[0]
    : BUILT_IN_TEMPLATES[0]; // Default to comic-script
  
  return parseScriptWithTemplate(scriptText, template);
}

// Parse script using a specific template
export function parseScriptWithTemplate(scriptText: string, template: ScriptParsingTemplate): ParsedPage[] {
  const pages: ParsedPage[] = [];
  let globalPanelId = 1;
  
  // Build regex from template patterns
  let pagePattern: RegExp;
  try {
    pagePattern = new RegExp(template.pageMarkerPattern, 'gi');
  } catch (e) {
    console.warn('Invalid page pattern, using default:', e);
    pagePattern = /PAGE\s*(\d+)/gi;
  }
  
  // Split by PAGE markers
  const pageSections = scriptText.split(pagePattern);
  
  // Process each page section
  for (let i = 1; i < pageSections.length; i += 2) {
    const pageNumber = parseInt(pageSections[i], 10) || pages.length + 1;
    const pageContent = pageSections[i + 1] || '';
    
    const { page, nextGlobalId } = parsePageContentWithTemplate(
      pageNumber, 
      pageContent, 
      globalPanelId,
      template
    );
    globalPanelId = nextGlobalId;
    pages.push(page);
  }
  
  // If no pages found, try to parse as single page
  if (pages.length === 0 && scriptText.trim()) {
    const { page } = parsePageContentWithTemplate(1, scriptText, globalPanelId, template);
    pages.push(page);
  }
  
  return pages;
}

function parsePageContentWithTemplate(
  pageNumber: number, 
  content: string, 
  startingPanelId: number,
  template: ScriptParsingTemplate
): { page: ParsedPage; nextGlobalId: number } {
  const panels: ParsedPanel[] = [];
  let openingNarration = '';
  let currentPanelId = startingPanelId;
  
  // Build narration regex
  let narrationPattern: RegExp;
  try {
    narrationPattern = new RegExp(template.narrationPattern, 'i');
  } catch (e) {
    narrationPattern = /Reads:\s*([^]*?)(?=\d+\s*-|\n\n\n|$)/i;
  }
  
  // Extract opening narration
  const readsMatch = content.match(narrationPattern);
  if (readsMatch) {
    openingNarration = (readsMatch[1] || readsMatch[0]).trim().replace(/\s+/g, ' ');
  }
  
  // Build panel regex
  let panelPattern: RegExp;
  try {
    panelPattern = new RegExp(template.panelPattern, 'gi');
  } catch (e) {
    panelPattern = /(\d+)\s*[-–—]\s*([^]*?)(?=\d+\s*[-–—]|Reads:|$)/gi;
  }
  
  let match;
  while ((match = panelPattern.exec(content)) !== null) {
    let panelContent = (match[2] || match[1] || match[0]).trim();
    
    let dialogue = '';
    let narration = '';
    
    // Look for "Reads:" within panel description
    const panelReadsMatch = panelContent.match(/Reads:\s*(.+)/i);
    if (panelReadsMatch) {
      narration = panelReadsMatch[1].trim();
      panelContent = panelContent.replace(/Reads:\s*.+/i, '').trim();
    }
    
    // Check for black and white instruction
    const isBlackAndWhite = /black\s*and\s*white/i.test(panelContent);
    
    // Extract characters mentioned in this panel
    const characters = extractCharacterNames(panelContent, template.characterNamePattern);
    
    // Extract composition/direction notes
    const compositionNotes = extractCompositionNotes(panelContent);
    
    // Extract dialogue speakers
    const dialogueSpeakers = extractDialogueSpeakers(panelContent, template.dialoguePattern);
    
    // Clean up description
    const description = panelContent
      .replace(/black\s*and\s*white/gi, '')
      .replace(/\s+/g, ' ')
      .trim();
    
    if (description) {
      panels.push({
        id: currentPanelId++,
        description,
        narration: narration || undefined,
        dialogue: dialogue || undefined,
        isBlackAndWhite,
        characters: characters.length > 0 ? characters : undefined,
        compositionNotes,
        dialogueSpeakers: dialogueSpeakers.length > 0 ? dialogueSpeakers : undefined,
      });
    }
  }
  
  return {
    page: {
      pageNumber,
      panels,
      openingNarration: openingNarration || undefined,
    },
    nextGlobalId: currentPanelId,
  };
}

export interface LabeledReferenceImage {
  image: string;
  characterName: string;
}

export function generatePanelPrompt(
  panel: ParsedPanel, 
  context?: string, 
  styleModifier?: string,
  characterContext?: string,
  labeledImages?: LabeledReferenceImage[]
): string {
  let prompt = `Comic book panel illustration, professional graphic novel art. `;
  
  if (styleModifier) {
    prompt += `${styleModifier}. `;
  }
  
  // Add relevant character descriptions for characters in this panel
  if (characterContext?.trim()) {
    const panelCharacters = panel.characters || [];
    const dialogueSpeakers = panel.dialogueSpeakers || [];
    const allPanelCharacters = [...new Set([...panelCharacters, ...dialogueSpeakers])];
    
    if (allPanelCharacters.length > 0) {
      const relevantDescriptions: string[] = [];
      const lines = characterContext.split('\n').filter(l => l.trim());
      
      for (const charName of allPanelCharacters) {
        for (const line of lines) {
          const upperLine = line.toUpperCase();
          if (upperLine.startsWith(charName) || upperLine.includes(`${charName}:`)) {
            relevantDescriptions.push(line.trim());
            break;
          }
        }
      }
      
      if (relevantDescriptions.length > 0) {
        prompt += `IMPORTANT - Characters in this panel:\n${relevantDescriptions.join('\n')}\n\n`;
      } else {
        prompt += `Character reference: ${characterContext.trim()}. `;
      }
    } else {
      prompt += `Character reference: ${characterContext.trim()}. `;
    }
  }
  
  // Add composition instructions prominently
  if (panel.compositionNotes) {
    prompt += `COMPOSITION DIRECTION: ${panel.compositionNotes}. `;
  }
  
  // Add scene description
  prompt += `SCENE: ${panel.description}`;
  
  // Add dialogue context if present
  if (panel.dialogueSpeakers && panel.dialogueSpeakers.length > 0) {
    prompt += ` (Characters speaking: ${panel.dialogueSpeakers.join(', ')})`;
  }
  
  if (context) {
    prompt += ` Story context: ${context}`;
  }
  
  if (panel.isBlackAndWhite) {
    prompt += ` Black and white ink style, high contrast.`;
  } else if (!styleModifier?.includes('black and white')) {
    prompt += ` Full color, cinematic lighting.`;
  }
  
  prompt += ` No text or speech bubbles in the image. Ultra high resolution.`;
  
  return prompt;
}

// Helper to build labeled reference image instructions for the AI
export function buildReferenceImageInstructions(
  labeledImages: LabeledReferenceImage[],
  panelCharacters?: string[]
): string {
  if (labeledImages.length === 0) return '';
  
  const relevantImages = panelCharacters && panelCharacters.length > 0
    ? labeledImages.filter(img => 
        panelCharacters.some(char => 
          img.characterName.toUpperCase().includes(char.toUpperCase()) ||
          char.toUpperCase().includes(img.characterName.toUpperCase())
        )
      )
    : labeledImages;
  
  const imagesToUse = relevantImages.length > 0 ? relevantImages : labeledImages;
  
  return imagesToUse
    .map((img, i) => `Reference Image ${i + 1}: Character "${img.characterName}" - Use this exact appearance for ${img.characterName}`)
    .join('\n');
}
