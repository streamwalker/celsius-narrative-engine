/**
 * Master print/export — compiles the entire Narrative Engine project into a single
 * 'Complete Story Bible' PDF via browser print dialog.
 * 
 * Uses shared field/section definitions from narrative/fields.ts.
 */
import type { Scene, StoryField } from '@/lib/narrative/types';
import { coreDnaFields, sectionDefinitions } from '@/lib/narrative/fields';

function esc(str: string): string {
  return str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
}

function renderFieldsHtml(fields: StoryField[], data: Record<string, string>): string {
  return fields
    .filter(f => data[f.key]?.trim())
    .map(f => `<div class="field"><div class="fl">${esc(f.label)}</div><div class="fv">${esc(data[f.key])}</div></div>`)
    .join('');
}

function renderSingleSceneHtml(s: Scene, actColors: Record<number, string>): string {
    const color = actColors[s.act] || '#888';
    const energyPct = Math.max(s.energyLevel, 5);
    const energyColor = s.energyLevel >= 80 ? '#ef4444' : s.energyLevel >= 60 ? '#f97316' : s.energyLevel >= 40 ? '#f59e0b' : '#60a5fa';
    const axisColor = s.primaryAxis === 'A' ? '#60a5fa' : s.primaryAxis === 'B' ? '#fbbf24' : s.primaryAxis === 'C' ? '#f87171' : '#888';
    const axisLabel = s.primaryAxis === 'A' ? 'A-Axis (External)' : s.primaryAxis === 'B' ? 'B-Axis (Internal)' : s.primaryAxis === 'C' ? 'C-Axis (Opposition)' : '';
    return `
      <div class="scene" style="border-left-color:${color}">
        <div class="scene-header">
          <span class="scene-num">Scene ${String(s.sceneNumber).padStart(2, '0')}</span>
          ${s.primaryAxis ? `<span style="color:${axisColor};font-weight:700;font-size:8pt;background:${axisColor}15;padding:1px 5px;border-radius:3px">${esc(axisLabel)}</span>` : ''}
          <span class="scene-act" style="color:${color}">Act ${s.act}</span>
          <span class="scene-func">${esc(s.keyFunction || '')}</span>
          ${s.beatTier ? `<span style="font-size:8pt;color:#888;font-style:italic">${esc(s.beatTier)}</span>` : ''}
        </div>
        <h4 class="scene-title">${esc(s.title)}</h4>
        <div class="energy-row">
          <span class="energy-label">Celsius Tension Index™</span>
          <div class="energy-bar"><div class="energy-fill" style="width:${energyPct}%;background:${energyColor}"></div></div>
          <span class="energy-val">${s.energyLevel}°C</span>
        </div>
        <div class="scene-grid">
          ${s.purpose ? `<div class="field"><div class="fl">Purpose</div><div class="fv">${esc(s.purpose)}</div></div>` : ''}
          ${s.summary ? `<div class="field"><div class="fl">Summary</div><div class="fv">${esc(s.summary)}</div></div>` : ''}
          ${s.tone ? `<div class="field"><div class="fl">Tone</div><div class="fv">${esc(s.tone)}</div></div>` : ''}
          ${s.visualSignature ? `<div class="field"><div class="fl">Visual Signature</div><div class="fv">${esc(s.visualSignature)}</div></div>` : ''}
          ${s.conflictInternal ? `<div class="field"><div class="fl">Conflict (Internal)</div><div class="fv">${esc(s.conflictInternal)}</div></div>` : ''}
          ${s.conflictExternal ? `<div class="field"><div class="fl">Conflict (External)</div><div class="fv">${esc(s.conflictExternal)}</div></div>` : ''}
        </div>
        <div class="causality">
          <span>Builds From: ${esc(s.buildsFrom || '—')}</span>
          <span class="arrow">→</span>
          <span class="current">Scene ${s.sceneNumber}</span>
          <span class="arrow">→</span>
          <span>Sets Up: ${esc(s.setsUp || '—')}</span>
        </div>
        <div class="scene-meta">
          Dialogue: ${esc(s.dialogueDensity || '—')} · Est. Lines: ${s.estimatedDialogueLines || '—'}${s.primaryAxis ? ` · Axis: ${esc(axisLabel)}` : ''}${s.beatTier ? ` · Beat: ${esc(s.beatTier)}` : ''}
        </div>
      </div>`;
}

function renderScenesHtml(scenes: Scene[]): string {
  if (!scenes.length) return '';
  const actColors: Record<number, string> = { 1: '#60a5fa', 2: '#fbbf24', 3: '#f87171', 4: '#a78bfa', 5: '#34d399' };
  
  const hasEpisodes = scenes.some(s => s.episode && s.episode > 0);
  
  if (hasEpisodes) {
    const episodeMap = new Map<number, Scene[]>();
    scenes.forEach(s => {
      const ep = s.episode || 1;
      if (!episodeMap.has(ep)) episodeMap.set(ep, []);
      episodeMap.get(ep)!.push(s);
    });
    const sortedEpisodes = Array.from(episodeMap.entries()).sort((a, b) => a[0] - b[0]);
    return sortedEpisodes.map(([ep, epScenes]) =>
      `<h3 class="ep-divider" style="font-size:13pt;font-weight:700;color:#6366f1;border-bottom:2px solid #6366f1;padding:12px 0 6px;margin:28px 0 14px;page-break-before:always">Episode ${ep} — ${epScenes.length} Scenes</h3>` +
      epScenes.map(s => renderSingleSceneHtml(s, actColors)).join('')
    ).join('');
  }
  
  return scenes.map(s => renderSingleSceneHtml(s, actColors)).join('');
}

// Thread timeline summary
function renderTimelineSummary(data: Record<string, string>): string {
  const axes = [
    { name: 'A-AXIS (External Drive)', color: '#60a5fa', keys: ['a1_want','a1_trigger','a1_stakes','a1_inciting','a1_ponr','a2_plan','a2_win1','a2_win2','a2_complication','a3_plan','a3_confrontation','a3_risked','a3_sacrificed'] },
    { name: 'B-AXIS (Internal Resistance)', color: '#fbbf24', keys: ['b1_flaws','b1_contradiction','b1_block','b2_warnings','b2_flaw_active','b2_crisis','b3_revelation','b3_decision'] },
    { name: 'C-AXIS (Opposition Intelligence)', color: '#f87171', keys: ['c1_motivation','c1_understand','c1_believe','c1_sympathize','c1_goal','c2_adapt','c2_learns','c3_flaw','c3_mirror'] },
  ];
  return axes.map(a => {
    const filled = a.keys.filter(k => data[k]?.trim()).length;
    return `<div class="timeline-axis"><span class="tl-name" style="color:${a.color}">${a.name}</span><span class="tl-count">${filled}/${a.keys.length} beats filled</span></div>`;
  }).join('');
}

export function printAllStoryData(
  data: Record<string, string>,
  scenes: Scene[],
  aiAnalysis: string | null,
  projectTitle?: string,
) {
  const title = projectTitle || data.project_title || data.protag_name || 'Untitled';
  const dateStr = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

  const coreDnaHtml = renderFieldsHtml(coreDnaFields, data);
  const sectionsHtml = sectionDefinitions
    .filter(s => s.fields.some(f => data[f.key]?.trim()))
    .map(s => `<div class="section" style="border-left-color:${s.threadColor}"><h3 class="sec-title" style="color:${s.threadColor}">${esc(s.title)}</h3>${renderFieldsHtml(s.fields, data)}</div>`)
    .join('');
  const scenesHtml = renderScenesHtml(scenes);
  const timelineHtml = renderTimelineSummary(data);
  const diagHtml = `
    <div class="diag">
      <div class="${data.a_goal?.trim() ? 'pass' : 'fail'}">1. The goal wasn't clear — ${data.a_goal?.trim() ? '✓ PASS' : '✗ FAIL'}</div>
      <div class="${data.protag_flaw?.trim() ? 'pass' : 'fail'}">2. The flaw didn't matter — ${data.protag_flaw?.trim() ? '✓ PASS' : '✗ FAIL'}</div>
      <div class="${data.antag_belief?.trim() ? 'pass' : 'fail'}">3. The antagonist wasn't right enough — ${data.antag_belief?.trim() ? '✓ PASS' : '✗ FAIL'}</div>
    </div>`;

  const html = `<!DOCTYPE html><html><head><meta charset="utf-8"><title>${esc(title)} — Complete Story Bible</title>
<style>
@page{margin:0.75in;size:letter}
*{box-sizing:border-box;margin:0;padding:0}
body{font-family:'Segoe UI',-apple-system,BlinkMacSystemFont,sans-serif;font-size:11pt;line-height:1.5;color:#1a1a2e;background:#fff}
.cover{text-align:center;padding:3in 0 2in;page-break-after:always}
.cover h1{font-size:28pt;font-weight:800;color:#1a1a2e;margin-bottom:8px}
.cover .sub{font-size:12pt;color:#666;margin-bottom:4px}
.cover .date{font-size:9pt;color:#aaa;margin-top:8px}
.cover .engine{font-size:8pt;color:#ccc;margin-top:48px;letter-spacing:3px;text-transform:uppercase}
.page-title{font-size:16pt;font-weight:700;color:#1a1a2e;border-bottom:2px solid #1a1a2e;padding-bottom:6px;margin-bottom:16px;page-break-before:always}
.page-title:first-of-type{page-break-before:auto}
.core-dna{background:#f8f8fc;border:1px solid #e0e0e8;border-radius:6px;padding:20px;margin-bottom:24px}
.core-dna h3{font-size:13pt;font-weight:700;color:#6366f1;margin-bottom:14px;letter-spacing:1px}
.section{border-left:3px solid #ccc;padding-left:16px;margin-bottom:20px;page-break-inside:avoid}
.sec-title{font-size:11pt;font-weight:700;text-transform:uppercase;letter-spacing:1px;margin-bottom:10px}
.field{margin-bottom:10px}
.fl{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888;margin-bottom:2px}
.fv{font-size:10.5pt;color:#1a1a2e;line-height:1.6}
.timeline-axis{display:flex;justify-content:space-between;padding:6px 0;border-bottom:1px solid #eee}
.tl-name{font-weight:700;font-size:10pt}
.tl-count{font-size:10pt;color:#888}
.scene{border-left:3px solid #ccc;padding:12px 16px;margin-bottom:16px;page-break-inside:avoid}
.scene-header{display:flex;gap:12px;align-items:center;margin-bottom:4px;font-size:9pt;text-transform:uppercase;letter-spacing:1px}
.scene-num{font-weight:700;color:#888}
.scene-act{font-weight:700}
.scene-func{color:#888;margin-left:auto}
.scene-title{font-size:12pt;font-weight:700;color:#1a1a2e;margin-bottom:8px}
.energy-row{display:flex;align-items:center;gap:8px;margin-bottom:8px}
.energy-label{font-size:8pt;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:#888;white-space:nowrap}
.energy-bar{flex:1;height:6px;background:#e0e0e8;border-radius:3px;overflow:hidden}
.energy-fill{height:100%;border-radius:3px}
.energy-val{font-size:10pt;font-weight:700;min-width:40px;text-align:right}
.scene-grid{display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-bottom:8px}
.causality{font-size:9pt;color:#666;display:flex;gap:6px;flex-wrap:wrap;align-items:center;margin-bottom:4px}
.causality .arrow{color:#6366f1;font-weight:700}
.causality .current{color:#6366f1;font-weight:700}
.scene-meta{font-size:9pt;color:#888}
.analysis{white-space:pre-wrap;font-size:10.5pt;line-height:1.7;color:#1a1a2e}
.diag div{padding:4px 0;font-size:10pt}
.pass{color:#22c55e}
.fail{color:#ef4444}
.footer{text-align:center;font-size:7pt;color:#ccc;margin-top:40px;padding-top:12px;border-top:1px solid #eee}
@media print{body{-webkit-print-color-adjust:exact;print-color-adjust:exact}}
</style></head><body>
<div class="cover">
  <h1>${esc(title)}</h1>
  <div class="sub">Celsius Narrative Triad™ — Complete Story Bible</div>
  <div class="date">${dateStr}</div>
  <div class="engine">Celsius · Narrative Engine</div>
</div>

${coreDnaHtml ? `<h2 class="page-title">◆ Core Story DNA</h2><div class="core-dna"><h3>CORE STORY DNA</h3>${coreDnaHtml}</div>` : ''}

${sectionsHtml ? `<h2 class="page-title">◆ Tri-Axis Narrative Structure</h2>${sectionsHtml}` : ''}

${timelineHtml ? `<h2 class="page-title">◆ Story Thread Timeline</h2>${timelineHtml}` : ''}

${scenesHtml ? `<h2 class="page-title">◆ Scene Engine — ${scenes.length} Scenes</h2>${scenesHtml}` : ''}

${aiAnalysis ? `<h2 class="page-title">◆ AI Story Consultant — Analysis</h2><div class="analysis">${esc(aiAnalysis)}</div>` : ''}

<h2 class="page-title">◆ Failure Diagnostics</h2>
${diagHtml}

<div class="footer">Generated by Celsius Narrative Engine · ${new Date().toISOString().split('T')[0]}</div>
</body></html>`;

  const w = window.open('', '_blank');
  if (!w) {
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.replace(/\s+/g, '-').toLowerCase()}-story-bible.html`;
    a.click();
    URL.revokeObjectURL(url);
    return;
  }
  w.document.write(html);
  w.document.close();
  w.onload = () => setTimeout(() => w.print(), 300);
}
