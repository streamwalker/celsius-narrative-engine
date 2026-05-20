import type { PanelcraftIssue } from './types';

const NUMBER_WORDS = ['ZERO','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN'];
const PAGE_WORDS = ['','ONE','TWO','THREE','FOUR','FIVE','SIX','SEVEN','EIGHT','NINE','TEN','ELEVEN','TWELVE','THIRTEEN','FOURTEEN','FIFTEEN','SIXTEEN','SEVENTEEN','EIGHTEEN','NINETEEN','TWENTY','TWENTY-ONE','TWENTY-TWO','TWENTY-THREE','TWENTY-FOUR','TWENTY-FIVE','TWENTY-SIX','TWENTY-SEVEN','TWENTY-EIGHT','TWENTY-NINE','THIRTY','THIRTY-ONE','THIRTY-TWO'];

export function exportPanelcraftScript(issue: PanelcraftIssue): string {
  const lines: string[] = [];
  lines.push(issue.title.toUpperCase());
  if (issue.theme) lines.push(`Theme: ${issue.theme}`);
  lines.push('');
  lines.push('');

  issue.pages.forEach((page) => {
    const panelCountStr = page.panels.length === 0
      ? ''
      : ` (${NUMBER_WORDS[page.panels.length] || String(page.panels.length)} ${page.panels.length === 1 ? 'PANEL' : 'PANELS'})`;
    const pageWord = PAGE_WORDS[page.number] || String(page.number);
    lines.push(`PAGE ${pageWord}${panelCountStr}`);
    if (page.title) lines.push(`[${page.title}${page.side === 'R' && page.isCliffhanger ? ' — CLIFFHANGER' : ''}]`);
    lines.push('');

    if (!page.panels.length) {
      lines.push(`  (Page not yet scripted.)`);
      lines.push(`  Summary: ${page.summary}`);
      lines.push('');
      lines.push('');
      return;
    }

    page.panels.forEach((panel, idx) => {
      lines.push(`PANEL ${idx + 1}`);
      if (panel.description) lines.push(panel.description);
      lines.push('');
      panel.lines.forEach(l => {
        const toneStr = l.tone ? ` (${l.tone.toLowerCase()})` : '';
        if (l.type === 'CAPTION') {
          lines.push(`CAPTION${toneStr}: ${l.text}`);
        } else if (l.type === 'SFX') {
          lines.push(`SFX: ${l.text}`);
        } else {
          const char = (l.character || 'CHARACTER').toUpperCase();
          const typeMod = l.type === 'DIALOGUE' ? '' : ` (${l.type.toLowerCase()})`;
          lines.push(`${char}${typeMod}${toneStr}`);
          lines.push(l.text);
        }
        lines.push('');
      });
    });
    lines.push('');
  });

  return lines.join('\n');
}
