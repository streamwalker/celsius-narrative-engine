/**
 * Generates a print-friendly HTML document for the Narrative Engine story data
 * and opens the browser print dialog for PDF export.
 * 
 * Uses shared field definitions from narrative/fields.ts.
 */
import { coreDnaFields, sectionDefinitions } from '@/lib/narrative/fields';
import type { StoryField } from '@/lib/narrative/types';

function escHtml(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

function renderFields(fields: StoryField[], data: Record<string, string>): string {
  return fields
    .filter(f => data[f.key]?.trim())
    .map(f => `
      <div class="field">
        <div class="field-label">${escHtml(f.label)}</div>
        <div class="field-value">${escHtml(data[f.key])}</div>
      </div>
    `).join('');
}

export function exportStoryAsPdf(data: Record<string, string>, projectTitle?: string) {
  const title = projectTitle || data.protag_name
    ? `${projectTitle || data.protag_name || 'Untitled'} — Story Bible`
    : 'Story Bible';

  const filledCoreDna = renderFields(coreDnaFields, data);

  const sectionsHtml = sectionDefinitions
    .filter(s => s.fields.some(f => data[f.key]?.trim()))
    .map(s => `
      <div class="section" style="border-left-color: ${s.threadColor}">
        <h2 class="section-title" style="color: ${s.threadColor}">${escHtml(s.title)}</h2>
        ${renderFields(s.fields, data)}
      </div>
    `).join('');

  // Format info
  let formatLine = '';
  if (data._medium) {
    const mediumLabels: Record<string, string> = { comic: 'Comic Book', tv_episode: 'TV Episode', tv_series: 'TV Series', film: 'Feature Film' };
    formatLine = mediumLabels[data._medium] || data._medium;
    if (data._medium === 'comic' && data._comic_pages) formatLine += ` · ${data._comic_pages} pages`;
    if (data._medium === 'comic' && data._comic_series) formatLine += ` · ${data._comic_series}-issue series`;
    if (data._medium === 'tv_series' && data._tv_series_episodes) formatLine += ` · ${data._tv_series_episodes} episodes`;
    if (data._medium === 'film' && data._film_length) formatLine += ` · ${data._film_length} min`;
  }

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${escHtml(title)}</title>
  <style>
    @page { margin: 0.75in; size: letter; }
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body {
      font-family: 'Segoe UI', -apple-system, BlinkMacSystemFont, sans-serif;
      font-size: 11pt;
      line-height: 1.5;
      color: #1a1a2e;
      background: #fff;
    }
    .cover {
      text-align: center;
      padding: 3in 0 2in;
      page-break-after: always;
    }
    .cover h1 {
      font-size: 28pt;
      font-weight: 800;
      letter-spacing: -0.5px;
      color: #1a1a2e;
      margin-bottom: 8px;
    }
    .cover .subtitle {
      font-size: 12pt;
      color: #666;
      margin-bottom: 4px;
    }
    .cover .format {
      font-size: 10pt;
      color: #888;
      text-transform: uppercase;
      letter-spacing: 2px;
      margin-top: 24px;
    }
    .cover .date {
      font-size: 9pt;
      color: #aaa;
      margin-top: 8px;
    }
    .cover .engine {
      font-size: 8pt;
      color: #ccc;
      margin-top: 48px;
      letter-spacing: 3px;
      text-transform: uppercase;
    }

    h2.page-title {
      font-size: 16pt;
      font-weight: 700;
      color: #1a1a2e;
      border-bottom: 2px solid #1a1a2e;
      padding-bottom: 6px;
      margin-bottom: 16px;
    }

    .section {
      border-left: 3px solid #ccc;
      padding-left: 16px;
      margin-bottom: 20px;
      page-break-inside: avoid;
    }
    .section-title {
      font-size: 11pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 1px;
      margin-bottom: 10px;
    }

    .field {
      margin-bottom: 10px;
    }
    .field-label {
      font-size: 8pt;
      font-weight: 700;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      color: #888;
      margin-bottom: 2px;
    }
    .field-value {
      font-size: 10.5pt;
      color: #1a1a2e;
      line-height: 1.6;
    }

    .core-dna {
      background: #f8f8fc;
      border: 1px solid #e0e0e8;
      border-radius: 6px;
      padding: 20px;
      margin-bottom: 24px;
    }
    .core-dna h2 {
      font-size: 13pt;
      font-weight: 700;
      color: #6366f1;
      margin-bottom: 14px;
      letter-spacing: 1px;
    }

    .footer {
      text-align: center;
      font-size: 7pt;
      color: #ccc;
      margin-top: 40px;
      padding-top: 12px;
      border-top: 1px solid #eee;
    }

    @media print {
      body { -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    }
  </style>
</head>
<body>
  <div class="cover">
    <h1>${escHtml(projectTitle || data.protag_name ? `${data.protag_name || 'Untitled'}'s Story` : 'Story Bible')}</h1>
    <div class="subtitle">Celsius Narrative Triad™</div>
    <div class="subtitle">Tri-Axis Story Architecture</div>
    ${formatLine ? `<div class="format">${escHtml(formatLine)}</div>` : ''}
    <div class="date">${new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</div>
    <div class="engine">Celsius · Narrative Engine</div>
  </div>

  ${filledCoreDna ? `
    <div class="core-dna">
      <h2>◆ CORE STORY DNA</h2>
      ${filledCoreDna}
    </div>
  ` : ''}

  ${sectionsHtml}

  <div class="footer">
    Generated by Celsius Narrative Engine · ${new Date().toISOString().split('T')[0]}
  </div>
</body>
</html>`;

  const printWindow = window.open('', '_blank');
  if (!printWindow) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(projectTitle || 'story-bible').replace(/\s+/g, '-').toLowerCase()}.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }

  printWindow.document.write(html);
  printWindow.document.close();
  printWindow.onload = () => {
    setTimeout(() => {
      printWindow.print();
    }, 300);
  };
}
