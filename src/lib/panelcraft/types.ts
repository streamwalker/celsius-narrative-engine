export type PanelFunctionId =
  | 'SETUP' | 'EXPOSITION' | 'BEAT' | 'TRANSITION'
  | 'ESCALATE' | 'TURN' | 'COMBAT' | 'REVEAL' | 'CLIMAX';

export type LineTypeId = 'DIALOGUE' | 'CAPTION' | 'THOUGHT' | 'WHISPER' | 'SHOUT' | 'SFX';

export type ToneTag =
  | 'TENSE' | 'VULNERABLE' | 'MENACING' | 'DEFLECTING'
  | 'ASSERTIVE' | 'DETACHED' | 'CRYPTIC' | 'DESPERATE'
  | 'COMMANDING' | 'CONFUSED' | 'WRY' | 'GRAVE'
  | 'PLEADING' | 'COLD' | 'WARM' | 'STUNNED' | '';

export interface PanelLine {
  id: string;
  type: LineTypeId;
  character: string;
  tone: ToneTag;
  text: string;
}

export interface Panel {
  id: string;
  function: PanelFunctionId;
  description: string;
  lines: PanelLine[];
}

export type PageSide = 'L' | 'R';

export interface Page {
  number: number;
  side: PageSide;
  title: string;
  summary: string;
  isCliffhanger: boolean;
  panels: Panel[];
}

export interface PanelcraftIssue {
  title: string;
  theme: string;
  pages: Page[];
}

export interface PanelcraftIssueDef {
  id: PanelFunctionId;
  label: string;
  tension: number;
  colorVar: string; // e.g. 'hsl(var(--accent))'
  desc: string;
}

export interface CraftIssue {
  level: 'warn' | 'info';
  text: string;
}
