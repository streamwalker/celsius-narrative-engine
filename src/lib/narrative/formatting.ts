/**
 * Pure formatting functions for copy/print/export of scenes and analysis.
 */
import type { Scene } from './types';

const mediumLabels: Record<string, string> = {
  film: 'Feature Film',
  tv_episode: 'TV Episode',
  tv_series: 'TV Series',
  comic: 'Comic Book',
  stage_play: 'Stage Play',
};

/**
 * Build plain-text representation of scenes for clipboard copy.
 */
export function copyScenesText(
  scenes: Scene[],
  medium: string,
  isMultiUnit: boolean,
  activeEpisode: number,
  totalEpisodes: number,
  unitLabel: string,
  isComic: boolean,
): string {
  const mediumLabel = mediumLabels[medium] || medium;
  const header = isMultiUnit
    ? `CELSIUS SCENE ENGINE — ${mediumLabel} — ${unitLabel} ${activeEpisode} of ${totalEpisodes}\n${'='.repeat(60)}\n\n`
    : `CELSIUS SCENE ENGINE — ${mediumLabel}\n${'='.repeat(50)}\n\n`;

  return header + scenes.map(s => [
    `Scene ${String(s.sceneNumber).padStart(2, '0')}: ${s.title}`,
    `Act: ${s.act} | Sequence: ${s.sequence}`,
    `Purpose: ${s.purpose || '—'}`,
    `Summary: ${s.summary || '—'}`,
    `Tone: ${s.tone || '—'} | Dialogue: ${s.dialogueDensity || '—'} (${s.estimatedDialogueLines} lines)`,
    `Conflict (Internal): ${s.conflictInternal || '—'}`,
    `Conflict (External): ${s.conflictExternal || '—'}`,
    `Builds From: ${s.buildsFrom || '—'} → Sets Up: ${s.setsUp || '—'}`,
    `Key Function: ${s.keyFunction || '—'}`,
    `Visual Signature: ${s.visualSignature || '—'}`,
    `Celsius Tension Index™: ${s.energyLevel}°C`,
    isComic ? `Panels: ${s.panelCount || 4} | Layout: ${(s.pageLayout || 'standard-grid').replace(/-/g, ' ')}${s.isSplashPage ? ' | SPLASH PAGE' : ''}` : null,
    '---',
  ].filter(Boolean).join('\n')).join('\n\n');
}

/**
 * Generate a print-ready HTML document for scenes and open the browser print dialog.
 */
export function printScenesHtml(
  allScenes: Scene[],
  medium: string,
  isMultiUnit: boolean,
  totalEpisodes: number,
  unitLabel: string,
  unitLabelPlural: string,
  isComic: boolean,
): void {
  const mediumLabel = mediumLabels[medium] || medium;
  const printActColors: Record<number, string> = { 1: '#60a5fa', 2: '#fbbf24', 3: '#f87171', 4: '#a78bfa', 5: '#34d399' };

  const groupedByEpisode = isMultiUnit
    ? Array.from({ length: totalEpisodes }, (_, i) => ({
        episode: i + 1,
        scenes: allScenes.filter(s => s.episode === i + 1),
      })).filter(g => g.scenes.length > 0)
    : [{ episode: 0, scenes: allScenes }];

  const renderSceneHtml = (s: Scene) => {
    const color = printActColors[s.act] || '#888';
    const energyColor = s.energyLevel >= 80 ? '#ef4444' : s.energyLevel >= 60 ? '#f97316' : s.energyLevel >= 40 ? '#f59e0b' : '#60a5fa';
    return `<div class="scene" style="border-left-color:${color}"><div class="sh"><span class="sn">Scene ${String(s.sceneNumber).padStart(2,'0')}</span><span style="color:${color};font-weight:700">Act ${s.act}</span><span class="sf">${s.keyFunction||''}</span></div><h3 class="st">${s.title}</h3><div class="eb"><span class="el">CELSIUS TENSION INDEX™</span><div class="bar"><div class="fill" style="width:${Math.max(s.energyLevel,5)}%;background:${energyColor}"></div></div><span class="ev">${s.energyLevel}°C</span></div><div class="grid"><div><b class="fl">Purpose</b><p>${s.purpose||'—'}</p></div><div><b class="fl">Summary</b><p>${s.summary||'—'}</p></div><div><b class="fl">Tone</b><p>${s.tone||'—'}</p></div><div><b class="fl">Visual Signature</b><p>${s.visualSignature||'—'}</p></div><div><b class="fl">Conflict (Internal)</b><p>${s.conflictInternal||'—'}</p></div><div><b class="fl">Conflict (External)</b><p>${s.conflictExternal||'—'}</p></div></div><div class="ca">Builds From: ${s.buildsFrom||'—'} → <b>Scene ${s.sceneNumber}</b> → Sets Up: ${s.setsUp||'—'}</div><div class="dm">Dialogue: ${s.dialogueDensity||'—'} · Est. Lines: ${s.estimatedDialogueLines||'—'}</div>${isComic ? `<div class="dm" style="color:#a855f7">Panels: ${s.panelCount||4} · Layout: ${(s.pageLayout||'standard-grid').replace(/-/g,' ')}${s.isSplashPage ? ' · <b>SPLASH PAGE</b>' : ''}</div>` : ''}</div>`;
  };

  const scenesHtml = groupedByEpisode.map(g => {
    const epHeader = isMultiUnit ? `<h2 class="ep-header">${unitLabel} ${g.episode} — ${g.scenes.length} Scenes</h2>` : '';
    return epHeader + g.scenes.map(renderSceneHtml).join('');
  }).join('');

  const subtitle = isMultiUnit
    ? `${mediumLabel} — ${totalEpisodes} ${unitLabelPlural} · ${allScenes.length} Total Scenes`
    : `${mediumLabel} — ${allScenes.length} Scenes`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>Celsius Scene Engine</title><style>@page{margin:0.75in;size:letter}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',-apple-system,sans-serif;font-size:11pt;line-height:1.5;color:#1a1a2e;background:#fff;padding:40px 60px}.header{text-align:center;border-bottom:2px solid #1a1a2e;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:22pt;font-weight:800}.header .sub{font-size:11pt;color:#666}.header .date{font-size:9pt;color:#aaa;margin-top:6px}.ep-header{font-size:16pt;font-weight:700;color:#1a1a2e;border-bottom:2px solid #6366f1;padding:12px 0 6px;margin:32px 0 16px;page-break-before:always}.ep-header:first-of-type{page-break-before:auto}.scene{border-left:3px solid #ccc;padding:12px 16px;margin-bottom:16px;page-break-inside:avoid}.sh{display:flex;gap:12px;align-items:center;font-size:9pt;text-transform:uppercase;letter-spacing:1px;margin-bottom:4px}.sn{font-weight:700;color:#888}.sf{color:#888;margin-left:auto}.st{font-size:12pt;font-weight:700;margin-bottom:8px}.eb{display:flex;align-items:center;gap:8px;margin-bottom:8px}.el{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888;white-space:nowrap}.bar{flex:1;height:6px;background:#e0e0e8;border-radius:3px;overflow:hidden}.fill{height:100%;border-radius:3px}.ev{font-size:10pt;font-weight:700;min-width:40px;text-align:right}.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}.fl{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888;display:block;margin-bottom:2px}.grid p{font-size:10pt;margin:0}.ca{font-size:9pt;color:#666;margin-bottom:4px}.dm{font-size:9pt;color:#888}.footer{text-align:center;font-size:7pt;color:#ccc;margin-top:40px;padding-top:12px;border-top:1px solid #eee}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="header"><h1>Celsius Scene Engine</h1><div class="sub">${subtitle}</div><div class="date">${new Date().toLocaleDateString('en-US',{year:'numeric',month:'long',day:'numeric'})}</div></div>${scenesHtml}<div class="footer">Generated by Celsius Narrative Engine · ${new Date().toISOString().split('T')[0]}</div></body></html>`;
  const w = window.open('', '_blank');
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 300);
}

/**
 * Generate print-ready HTML for the AI analysis report and open print dialog.
 */
export function printAnalysisHtml(analysis: string, title: string): void {
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
  const escaped = analysis.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>AI Story Consultant — Analysis Report</title><style>@page{margin:0.75in;size:letter}*{box-sizing:border-box;margin:0;padding:0}body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11pt;line-height:1.6;color:#1a1a2e;background:#fff;padding:40px 60px}.header{text-align:center;border-bottom:2px solid #1a1a2e;padding-bottom:16px;margin-bottom:24px}.header h1{font-size:22pt;font-weight:800;color:#1a1a2e;margin-bottom:4px}.header .subtitle{font-size:11pt;color:#666}.header .date{font-size:9pt;color:#aaa;margin-top:6px}.body{white-space:pre-wrap;font-size:10.5pt;line-height:1.7}.footer{text-align:center;font-size:7pt;color:#ccc;margin-top:40px;padding-top:12px;border-top:1px solid #eee}@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}</style></head><body><div class="header"><h1>AI Story Consultant</h1><div class="subtitle">Analysis Report — ${title}</div><div class="date">${dateStr}</div></div><div class="body">${escaped}</div><div class="footer">Astralonaut Studios · Narrative Engine · ${new Date().toISOString().split('T')[0]}</div></body></html>`;
  const w = window.open('', '_blank');
  if (!w) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'ai-analysis-report.html'; a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 300);
}
