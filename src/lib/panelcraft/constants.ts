import type { PanelFunctionId, LineTypeId, ToneTag } from './types';

export interface PanelFunctionDef {
  id: PanelFunctionId;
  label: string;
  tension: number;
  /** CSS color expression using semantic tokens */
  color: string;
  desc: string;
}

export const PANEL_FUNCTIONS: PanelFunctionDef[] = [
  { id: 'SETUP',      label: 'Setup',      tension: 2, color: 'hsl(var(--muted-foreground))', desc: 'Establishes scene, character, or premise.' },
  { id: 'EXPOSITION', label: 'Exposition', tension: 2, color: 'hsl(var(--muted-foreground))', desc: 'Conveys backstory or world-building.' },
  { id: 'BEAT',       label: 'Beat',       tension: 1, color: 'hsl(var(--muted-foreground) / 0.7)', desc: 'Quiet moment. Breath between actions.' },
  { id: 'TRANSITION', label: 'Transition', tension: 3, color: 'hsl(var(--muted-foreground))', desc: 'Move between scenes, times, or POVs.' },
  { id: 'ESCALATE',   label: 'Escalate',   tension: 5, color: 'hsl(var(--accent))', desc: 'Raises stakes or pressure.' },
  { id: 'TURN',       label: 'Turn',       tension: 6, color: 'hsl(var(--accent))', desc: 'Page-turn beat. Sets up the reveal on the next page.' },
  { id: 'COMBAT',     label: 'Combat',     tension: 7, color: 'hsl(var(--primary))', desc: 'Physical action: fighting, chase, escape.' },
  { id: 'REVEAL',     label: 'Reveal',     tension: 8, color: 'hsl(var(--destructive))', desc: 'Payoff. Information that recontextualizes.' },
  { id: 'CLIMAX',     label: 'Climax',     tension: 9, color: 'hsl(var(--destructive))', desc: 'Peak intensity. The biggest beat.' },
];

export const FUNCTION_MAP: Record<PanelFunctionId, PanelFunctionDef> =
  Object.fromEntries(PANEL_FUNCTIONS.map(f => [f.id, f])) as Record<PanelFunctionId, PanelFunctionDef>;

export const TONE_TAGS: Exclude<ToneTag, ''>[] = [
  'TENSE', 'VULNERABLE', 'MENACING', 'DEFLECTING',
  'ASSERTIVE', 'DETACHED', 'CRYPTIC', 'DESPERATE',
  'COMMANDING', 'CONFUSED', 'WRY', 'GRAVE',
  'PLEADING', 'COLD', 'WARM', 'STUNNED',
];

export const LINE_TYPES: { id: LineTypeId; label: string }[] = [
  { id: 'DIALOGUE', label: 'Dialogue' },
  { id: 'CAPTION',  label: 'Caption' },
  { id: 'THOUGHT',  label: 'Thought' },
  { id: 'WHISPER',  label: 'Whisper' },
  { id: 'SHOUT',    label: 'Shout' },
  { id: 'SFX',      label: 'SFX' },
];

export const STORAGE_KEY = 'panelcraft:state:v1';

export const uid = () => Math.random().toString(36).slice(2, 10);

export function wordCount(text: string): number {
  return (text || '').trim().split(/\s+/).filter(Boolean).length;
}
