/**
 * Comic panel parser — extracts structured panel data from a formatted
 * graphic-novel script. The Script Formatter edge function produces text like:
 *
 *   PAGE 1
 *   1 - Wide establishing shot of the city at dawn. Silhouetted figures
 *       stand on the roofline.
 *   Reads: The day began like any other.
 *   ZEUS: "It's quiet out there."
 *
 *   2 - Close-up on Zeus's face, eyes narrowed.
 *   ASTRA: "Too quiet."
 *
 * This parser breaks that into pages, panels, and per-panel
 * { description, narration, dialogue, characters }.
 */

export type DialogueKind = 'speech' | 'thought' | 'shout' | 'whisper';

export interface DialogueLine {
  speaker: string;
  text: string;
  kind: DialogueKind;
}

export interface ComicPanelData {
  /** Panel number within its page (1-indexed) */
  panelNumber: number;
  /** A stable unique id across the entire script, used as key for image caching */
  panelKey: string;
  /** Visual description to send to the image generator */
  description: string;
  /** "Reads:" narration box content, if any */
  narration?: string;
  /** First speech-bubble content (CHARACTER: "line"), if any. Kept for backward compatibility. */
  dialogue?: string;
  /** Full ordered list of dialogue lines (speech, thought, shout, whisper). */
  dialogues: DialogueLine[];
  /** Character names extracted from dialogue cues (ALL CAPS before ':') */
  characters: string[];
}

export interface ComicPage {
  pageNumber: number;
  /** True if page number is odd (right-hand / recto). Relevant for page-turn reveals. */
  isOdd: boolean;
  panels: ComicPanelData[];
}

const DIALOGUE_LINE_REGEX = /^([A-Z][A-Z0-9 _-]{1,30}):\s*["“]?([^"”]+?)["”]?\s*$/;
const NARRATION_LINE_REGEX = /^(?:Reads|NARR(?:ATION)?|CAPTION):\s*(.+)$/i;

function parsePanelBody(body: string): {
  description: string;
  narration?: string;
  dialogue?: string;
  characters: string[];
} {
  const lines = body
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean);

  const descriptionLines: string[] = [];
  let narration: string | undefined;
  let dialogue: string | undefined;
  const characters: string[] = [];

  for (const line of lines) {
    const narrMatch = line.match(NARRATION_LINE_REGEX);
    if (narrMatch) {
      narration = narration ? `${narration} ${narrMatch[1].trim()}` : narrMatch[1].trim();
      continue;
    }

    const dialogueMatch = line.match(DIALOGUE_LINE_REGEX);
    if (dialogueMatch) {
      const name = dialogueMatch[1].trim();
      const content = dialogueMatch[2].trim();
      if (!characters.includes(name)) characters.push(name);
      // Keep only the first dialogue line as the primary bubble;
      // additional dialogue remains in the description so the image generator sees it.
      if (!dialogue) {
        dialogue = content;
      } else {
        descriptionLines.push(`${name}: "${content}"`);
      }
      continue;
    }

    descriptionLines.push(line);
  }

  return {
    description: descriptionLines.join(' ').trim(),
    narration,
    dialogue,
    characters,
  };
}

export function parseComicScript(script: string): ComicPage[] {
  if (!script.trim()) return [];

  const pageRegex = /^PAGE\s+(\d+)\b/gim;
  const pageMatches: { index: number; pageNumber: number }[] = [];

  let match: RegExpExecArray | null;
  while ((match = pageRegex.exec(script)) !== null) {
    pageMatches.push({ index: match.index, pageNumber: parseInt(match[1], 10) });
  }
  if (pageMatches.length === 0) return [];

  const pages: ComicPage[] = [];

  for (let i = 0; i < pageMatches.length; i++) {
    const start = pageMatches[i].index;
    const end = i + 1 < pageMatches.length ? pageMatches[i + 1].index : script.length;
    const pageBody = script.slice(start, end);
    const pageNumber = pageMatches[i].pageNumber;

    // Find panel boundaries: lines starting with "N -" or "N)"
    const panelRegex = /^\s*(\d+)\s*[-–—)]\s*/gm;
    const panelMatches: { index: number; matchLength: number; panelNumber: number }[] = [];
    let pm: RegExpExecArray | null;
    while ((pm = panelRegex.exec(pageBody)) !== null) {
      panelMatches.push({
        index: pm.index,
        matchLength: pm[0].length,
        panelNumber: parseInt(pm[1], 10),
      });
    }

    const panels: ComicPanelData[] = [];
    for (let j = 0; j < panelMatches.length; j++) {
      const pStart = panelMatches[j].index + panelMatches[j].matchLength;
      const pEnd = j + 1 < panelMatches.length ? panelMatches[j + 1].index : pageBody.length;
      const body = pageBody.slice(pStart, pEnd).trimEnd();
      const panelNumber = panelMatches[j].panelNumber;
      const parsed = parsePanelBody(body);
      panels.push({
        panelNumber,
        panelKey: `p${pageNumber}-${panelNumber}`,
        ...parsed,
      });
    }

    pages.push({
      pageNumber,
      isOdd: pageNumber % 2 !== 0,
      panels,
    });
  }

  return pages;
}

/**
 * Build the image generation prompt for a single panel. Incorporates the
 * panel description, any narration, and stylistic hints appropriate for
 * a graphic-novel panel.
 */
export function buildPanelPrompt(panel: ComicPanelData, options?: { style?: string }): string {
  const style = options?.style ?? 'professional graphic novel panel art, dynamic composition, cinematic lighting';
  const parts = [style, panel.description];
  if (panel.characters.length > 0) {
    parts.push(`Characters present: ${panel.characters.join(', ')}.`);
  }
  if (panel.narration) {
    parts.push(`Tone: ${panel.narration}`);
  }
  // Intentionally omit the dialogue from the image prompt — dialogue is
  // overlaid via speech bubbles, not drawn into the scene.
  return parts.filter(Boolean).join(' — ');
}
