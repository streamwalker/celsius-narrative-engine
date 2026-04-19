export interface ScriptParsingTemplate {
  id: string;
  name: string;
  description: string;
  isBuiltIn: boolean;
  // Parsing patterns (regex strings)
  pageMarkerPattern: string;
  panelPattern: string;
  dialoguePattern: string;
  narrationPattern: string;
  characterNamePattern: string;
  // Example format
  exampleFormat: string;
}

// Built-in templates
export const BUILT_IN_TEMPLATES: ScriptParsingTemplate[] = [
  {
    id: 'comic-script',
    name: 'Comic Script',
    description: 'Standard comic script format with PAGE markers and numbered panels',
    isBuiltIn: true,
    pageMarkerPattern: 'PAGE\\s*(\\d+)',
    panelPattern: '(\\d+)\\s*[-–—]\\s*([^]*?)(?=\\d+\\s*[-–—]|Reads:|$)',
    dialoguePattern: '([A-Z][A-Z\\s]{1,20})(?:\\s*\\([^)]*\\))?\\s*:',
    narrationPattern: 'Reads:\\s*(.+)',
    characterNamePattern: '\\b([A-Z][A-Z]{2,})\\b',
    exampleFormat: `PAGE 1

Reads: Opening narration text...

1 - Description of panel 1

2 - Description of panel 2
CHARACTER: "Dialogue here"`
  },
  {
    id: 'fountain',
    name: 'Fountain',
    description: 'Screenplay format used by Final Draft, Highland, etc.',
    isBuiltIn: true,
    pageMarkerPattern: '(?:^|\\n)(?:INT\\.|EXT\\.)\\s*(.+?)\\s*[-–—]',
    panelPattern: '(?:^|\\n)(?!INT\\.|EXT\\.|@)(.+?)(?=\\n\\n|$)',
    dialoguePattern: '^@?([A-Z][A-Z\\s]+)$',
    narrationPattern: '^\\s{4,}(.+)$',
    characterNamePattern: '@([A-Z][A-Z\\s]+)|^([A-Z][A-Z\\s]+)$',
    exampleFormat: `INT. LOCATION - DAY

Action description goes here.

@CHARACTER
(parenthetical)
Dialogue text here.

Another action line.`
  },
  {
    id: 'final-draft',
    name: 'Final Draft',
    description: 'Final Draft screenplay format with scene headings',
    isBuiltIn: true,
    pageMarkerPattern: '(?:INT\\.|EXT\\.)\\s*(.+?)\\s*[-–—]\\s*(?:DAY|NIGHT|CONTINUOUS)',
    panelPattern: '([^\\n]+)(?=\\n\\n|$)',
    dialoguePattern: '^\\s*([A-Z][A-Z\\s]+)\\s*$',
    narrationPattern: '^\\s*\\(V\\.O\\.\\)|^\\s*\\(O\\.S\\.\\)',
    characterNamePattern: '^\\s*([A-Z][A-Z\\s]+)\\s*$',
    exampleFormat: `INT. THRONE ROOM - DAY

The massive throne room stretches before us.

CHARACTER NAME
(beat)
Dialogue goes here.

Another character enters.`
  },
  {
    id: 'simple',
    name: 'Simple Panels',
    description: 'Simple format with just numbered panels, no page markers',
    isBuiltIn: true,
    pageMarkerPattern: '$^', // Never matches - single page
    panelPattern: '(?:Panel\\s*)?(\\d+)[.:\\s-]+\\s*(.+?)(?=(?:Panel\\s*)?\\d+[.:\\s-]|$)',
    dialoguePattern: '([A-Z][A-Z\\s]+):\\s*["\']',
    narrationPattern: '(?:Caption|Narration|Text):\\s*(.+)',
    characterNamePattern: '([A-Z][A-Z]+)',
    exampleFormat: `Panel 1: Wide shot of the city skyline.

Panel 2: Close-up on HERO's face.
HERO: "I won't let you win."

Panel 3: The villain laughs.`
  }
];

const USER_TEMPLATES_KEY = 'comic-script-templates';

// Get all templates (built-in + user)
export function getAllTemplates(): ScriptParsingTemplate[] {
  const userTemplates = getUserTemplates();
  return [...BUILT_IN_TEMPLATES, ...userTemplates];
}

// Get user-created templates from localStorage
export function getUserTemplates(): ScriptParsingTemplate[] {
  try {
    const saved = localStorage.getItem(USER_TEMPLATES_KEY);
    if (saved) {
      return JSON.parse(saved);
    }
  } catch (e) {
    console.error('Failed to load user templates:', e);
  }
  return [];
}

// Save a user template
export function saveUserTemplate(template: Omit<ScriptParsingTemplate, 'id' | 'isBuiltIn'>): ScriptParsingTemplate {
  const userTemplates = getUserTemplates();
  const newTemplate: ScriptParsingTemplate = {
    ...template,
    id: `user-${Date.now()}`,
    isBuiltIn: false,
  };
  
  const updated = [...userTemplates, newTemplate];
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updated));
  return newTemplate;
}

// Update a user template
export function updateUserTemplate(id: string, updates: Partial<ScriptParsingTemplate>): void {
  const userTemplates = getUserTemplates();
  const updated = userTemplates.map(t => 
    t.id === id ? { ...t, ...updates } : t
  );
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updated));
}

// Delete a user template
export function deleteUserTemplate(id: string): void {
  const userTemplates = getUserTemplates();
  const updated = userTemplates.filter(t => t.id !== id);
  localStorage.setItem(USER_TEMPLATES_KEY, JSON.stringify(updated));
}

// Get template by ID
export function getTemplateById(id: string): ScriptParsingTemplate | undefined {
  return getAllTemplates().find(t => t.id === id);
}

export interface DetectionResult {
  template: ScriptParsingTemplate;
  confidence: number;
  reason: string;
}

// Auto-detect template from script content with confidence scoring
export function detectTemplateFromScript(script: string): ScriptParsingTemplate {
  const result = detectTemplateWithConfidence(script);
  return result.template;
}

// Enhanced detection with confidence scoring
export function detectTemplateWithConfidence(script: string): DetectionResult {
  if (!script.trim()) {
    return {
      template: BUILT_IN_TEMPLATES.find(t => t.id === 'comic-script')!,
      confidence: 0,
      reason: 'No content to analyze',
    };
  }

  const lines = script.trim().split('\n');
  const scores: { id: string; score: number; reason: string }[] = [];

  // Score for Comic Script format
  const pageMarkers = (script.match(/PAGE\s*\d+/gi) || []).length;
  const numberedPanels = (script.match(/^\s*\d+\s*[-–—]\s*/gm) || []).length;
  const readsMarkers = (script.match(/Reads:/gi) || []).length;
  const comicScore = pageMarkers * 30 + numberedPanels * 15 + readsMarkers * 20;
  scores.push({
    id: 'comic-script',
    score: comicScore,
    reason: `PAGE markers: ${pageMarkers}, Numbered panels: ${numberedPanels}, Reads: ${readsMarkers}`,
  });

  // Score for Fountain format
  const sceneHeadings = lines.filter(l => /^(INT\.|EXT\.)\s/i.test(l.trim())).length;
  const atCharacters = (script.match(/@[A-Z][A-Z\s]+/g) || []).length;
  const transitions = (script.match(/\b(CUT TO|FADE|DISSOLVE)\b/gi) || []).length;
  const fountainScore = sceneHeadings * 25 + atCharacters * 20 + transitions * 10;
  scores.push({
    id: 'fountain',
    score: fountainScore,
    reason: `Scene headings: ${sceneHeadings}, @Characters: ${atCharacters}, Transitions: ${transitions}`,
  });

  // Score for Final Draft format
  const dayNightMarkers = lines.filter(l => /\b(DAY|NIGHT|CONTINUOUS)\s*$/i.test(l.trim())).length;
  const indentedDialogue = lines.filter(l => /^\s{10,}/.test(l)).length;
  const centeredNames = lines.filter(l => /^\s{20,}[A-Z][A-Z\s]+\s*$/.test(l)).length;
  const finalDraftScore = sceneHeadings * 20 + dayNightMarkers * 25 + indentedDialogue * 5 + centeredNames * 15;
  scores.push({
    id: 'final-draft',
    score: finalDraftScore > fountainScore ? finalDraftScore : 0,
    reason: `Scene headings: ${sceneHeadings}, DAY/NIGHT: ${dayNightMarkers}, Centered names: ${centeredNames}`,
  });

  // Score for Simple Panels format
  const panelMarkers = (script.match(/Panel\s*\d+/gi) || []).length;
  const colonPanels = (script.match(/\d+[.:]\s+/g) || []).length;
  const simpleScore = panelMarkers * 30 + (panelMarkers === 0 ? colonPanels * 10 : 0);
  scores.push({
    id: 'simple',
    score: simpleScore,
    reason: `Panel markers: ${panelMarkers}, Colon panels: ${colonPanels}`,
  });

  // Find highest scoring template
  scores.sort((a, b) => b.score - a.score);
  const winner = scores[0];
  const template = BUILT_IN_TEMPLATES.find(t => t.id === winner.id) || BUILT_IN_TEMPLATES[0];

  // Calculate confidence (0-100)
  const maxPossibleScore = Math.max(100, winner.score);
  const confidence = winner.score === 0 ? 50 : Math.min(99, Math.round((winner.score / maxPossibleScore) * 100));

  return {
    template,
    confidence,
    reason: winner.reason,
  };
}

// Extract name hint from filename
export function extractNameFromFilename(filename: string): string {
  // Remove extension
  let name = filename.replace(/\.[^/.]+$/, '');
  
  // Replace common separators with spaces
  name = name.replace(/[_-]/g, ' ');
  
  // Remove common suffixes like "ref", "reference", numbers
  name = name.replace(/\s*(ref|reference|image|img|pic|\d+)\s*$/i, '');
  
  // Clean up multiple spaces
  name = name.replace(/\s+/g, ' ').trim();
  
  // Convert to uppercase
  return name.toUpperCase();
}

// Template export/import functionality
export interface TemplateExport {
  version: string;
  exportedAt: string;
  templates: Omit<ScriptParsingTemplate, 'id' | 'isBuiltIn'>[];
}

// Export custom templates as JSON
export function exportTemplatesToJson(templateIds?: string[]): string {
  const userTemplates = getUserTemplates();
  
  const templatesToExport = templateIds 
    ? userTemplates.filter(t => templateIds.includes(t.id))
    : userTemplates;
  
  const exportData: TemplateExport = {
    version: '1.0',
    exportedAt: new Date().toISOString(),
    templates: templatesToExport.map(({ id, isBuiltIn, ...rest }) => rest),
  };
  
  return JSON.stringify(exportData, null, 2);
}

// Import templates from JSON
export function importTemplatesFromJson(jsonData: string): { imported: number; skipped: number; errors: string[] } {
  const errors: string[] = [];
  let imported = 0;
  let skipped = 0;
  
  try {
    const data = JSON.parse(jsonData) as TemplateExport;
    
    if (!data.templates || !Array.isArray(data.templates)) {
      return { imported: 0, skipped: 0, errors: ['Invalid template file format'] };
    }
    
    const existingTemplates = getUserTemplates();
    const existingNames = new Set(existingTemplates.map(t => t.name.toLowerCase()));
    
    for (const template of data.templates) {
      // Validate required fields
      if (!template.name || !template.panelPattern) {
        errors.push(`Skipped template: missing required fields`);
        skipped++;
        continue;
      }
      
      // Check for duplicate names
      if (existingNames.has(template.name.toLowerCase())) {
        errors.push(`Skipped "${template.name}": already exists`);
        skipped++;
        continue;
      }
      
      // Validate regex patterns
      try {
        new RegExp(template.pageMarkerPattern || '$^');
        new RegExp(template.panelPattern);
        new RegExp(template.dialoguePattern || '');
        new RegExp(template.narrationPattern || '');
        new RegExp(template.characterNamePattern || '');
      } catch (e) {
        errors.push(`Skipped "${template.name}": invalid regex pattern`);
        skipped++;
        continue;
      }
      
      // Save the template
      saveUserTemplate({
        name: template.name,
        description: template.description || '',
        pageMarkerPattern: template.pageMarkerPattern || '$^',
        panelPattern: template.panelPattern,
        dialoguePattern: template.dialoguePattern || '',
        narrationPattern: template.narrationPattern || '',
        characterNamePattern: template.characterNamePattern || '',
        exampleFormat: template.exampleFormat || '',
      });
      
      existingNames.add(template.name.toLowerCase());
      imported++;
    }
  } catch (e) {
    return { imported: 0, skipped: 0, errors: ['Failed to parse JSON file'] };
  }
  
  return { imported, skipped, errors };
}
