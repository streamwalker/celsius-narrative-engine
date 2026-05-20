import type { Page, CraftIssue } from './types';
import { FUNCTION_MAP, wordCount } from './constants';

export function checksForPage(page: Page): CraftIssue[] {
  const issues: CraftIssue[] = [];

  if (page.side === 'R' && page.isCliffhanger) {
    const last = page.panels[page.panels.length - 1];
    if (!last) {
      issues.push({ level: 'warn', text: 'Right-hand cliffhanger page has no panels. The page-turn beat is undelivered.' });
    } else if (last.function !== 'TURN' && last.function !== 'REVEAL' && last.function !== 'CLIMAX') {
      issues.push({ level: 'warn', text: `Last panel is "${FUNCTION_MAP[last.function]?.label || last.function}". A right-hand cliffhanger typically lands on TURN, REVEAL, or CLIMAX.` });
    }
  }

  if (page.panels.length > 0) {
    if (page.panels.length === 1) {
      issues.push({ level: 'info', text: 'Single-panel page reads as a splash. Confirm this is intentional.' });
    } else if (page.panels.length >= 8) {
      issues.push({ level: 'warn', text: `${page.panels.length} panels on one page. Consider whether the reader can absorb this density.` });
    }
  }

  page.panels.forEach((panel, idx) => {
    const panelLabel = `Panel ${idx + 1}`;
    const speechLines = panel.lines.filter(l => l.type === 'DIALOGUE' || l.type === 'THOUGHT' || l.type === 'WHISPER' || l.type === 'SHOUT');
    if (speechLines.length >= 2) {
      const tones = new Set(speechLines.map(l => l.tone).filter(Boolean));
      if (tones.size === 1) {
        issues.push({ level: 'info', text: `${panelLabel}: all speech shares one tone. Friction often comes from tonal mismatch.` });
      }
    }
    const totalWords = panel.lines.reduce((sum, l) => sum + wordCount(l.text), 0);
    if (totalWords > 35) {
      issues.push({ level: 'warn', text: `${panelLabel}: ${totalWords} words. Lettering at this density will dominate the art.` });
    } else if (totalWords > 25) {
      issues.push({ level: 'info', text: `${panelLabel}: ${totalWords} words. Approaching the practical lettering limit.` });
    }
    if (panel.function === 'COMBAT' && !panel.lines.some(l => l.type === 'SFX')) {
      issues.push({ level: 'info', text: `${panelLabel} is COMBAT with no SFX. Action panels usually carry at least one.` });
    }
    if (!panel.description || !panel.description.trim()) {
      issues.push({ level: 'info', text: `${panelLabel} has no visual description.` });
    }
  });

  return issues;
}

export function tensionForPage(page: Page): number {
  if (!page.panels.length) return 0;
  const sum = page.panels.reduce((s, p) => s + (FUNCTION_MAP[p.function]?.tension || 0), 0);
  return sum / page.panels.length;
}
