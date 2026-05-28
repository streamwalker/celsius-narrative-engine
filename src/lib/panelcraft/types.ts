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

export type ShotType =
  | 'ESTABLISHING' | 'WIDE' | 'MEDIUM' | 'CLOSE'
  | 'ECU' | 'OTS' | 'POV' | 'INSERT' | 'SPLASH';

export type PanelTransition =
  | 'NONE'
  | 'MOMENT_TO_MOMENT' | 'ACTION_TO_ACTION' | 'SUBJECT_TO_SUBJECT'
  | 'SCENE_TO_SCENE' | 'ASPECT_TO_ASPECT' | 'NON_SEQUITUR';

export interface Panel {
  id: string;
  function: PanelFunctionId;
  description: string;
  lines: PanelLine[];
  shotType?: ShotType;
  transitionFromPrev?: PanelTransition;
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

export interface IssueStructure {
  /** Two 1-based page numbers: end of act 1, end of act 2. */
  actBreaks: [number, number];
  /** 1-based page number of the midpoint reversal. */
  midpoint: number;
  /** 1-based page number of the issue's main climax. */
  climaxPage: number;
}

export interface PanelcraftIssue {
  title: string;
  theme: string;
  structure?: IssueStructure;
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
