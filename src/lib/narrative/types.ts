/**
 * Shared types for the Narrative Engine, Scene Engine, and AI Story Consultant.
 * Single source of truth — all modules import from here.
 */

export interface Scene {
  sceneNumber: number;
  title: string;
  act: number;
  sequence: string;
  purpose: string;
  summary: string;
  tone: string;
  dialogueDensity: string;
  estimatedDialogueLines: number;
  conflictInternal: string;
  conflictExternal: string;
  buildsFrom: string;
  setsUp: string;
  keyFunction: string;
  visualSignature: string;
  energyLevel: number;
  entrancesExits?: string;
  stageDirections?: string;
  panelCount?: number;
  pageLayout?: string;
  isSplashPage?: boolean;
  episode?: number;
  primaryAxis?: 'A' | 'B' | 'C';
  beatTier?: 'setup' | 'escalation' | 'midpoint' | 'collapse' | 'resolution';
}

export interface StoryField {
  label: string;
  key: string;
  placeholder?: string;
  multiline?: boolean;
}

export interface StorySection {
  id: string;
  title: string;
  icon?: React.ReactNode;
  color?: string;
  threadColor?: string;
  fields: StoryField[];
}

export interface StoryProject {
  id: string;
  title: string;
  story_data: Record<string, string>;
  scene_data?: any;
  created_at: string;
  updated_at: string;
}

export type MediumType = 'film' | 'tv_episode' | 'tv_series' | 'comic' | 'stage_play';

export interface MediumConfig {
  _medium?: MediumType;
  _comic_pages?: string;
  _comic_issues?: string;
  _tv_ep_length?: string;
  _tv_series_ep_length?: string;
  _tv_series_episodes?: string;
  _film_length?: string;
  _stage_acts?: string;
  _stage_runtime?: string;
  [key: string]: string | undefined;
}

export interface ParsedFix {
  id: string;
  category: 'move' | 'delete' | 'reassign' | 'rename' | 'general';
  title: string;
  description: string;
}

export interface SceneChange {
  type: 'moved' | 'renamed' | 'deleted' | 'modified';
  original?: Scene;
  updated?: Scene;
  details: string;
}

export interface ImplementFixesResult {
  correctedScenes: Scene[];
  changesSummary: string;
}
