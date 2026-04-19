/**
 * Single source of truth for all Narrative Engine field definitions.
 * Used by NarrativeEngine.tsx, storyPdfExport.ts, storyPrintAll.ts, and more.
 */
import type { StoryField, StorySection } from './types';

export const coreDnaFields: StoryField[] = [
  { label: 'Working Title', key: 'project_title', placeholder: 'e.g. Children of Aquarius' },
  { label: 'Theme (Non-negotiable truth)', key: 'theme', placeholder: 'This story proves that...', multiline: true },
  { label: 'Protagonist Name', key: 'protag_name', placeholder: 'Name' },
  { label: 'Archetype', key: 'protag_archetype', placeholder: 'e.g. Reluctant Hero, Anti-Hero, Everyman...' },
  { label: 'Core Flaw (internal weakness)', key: 'protag_flaw', placeholder: 'What breaks them from the inside?' },
  { label: 'Misbelief (what they think is true but isn\'t)', key: 'protag_misbelief', placeholder: 'The lie they live by...', multiline: true },
  { label: 'Primary Objective (A Story Goal)', key: 'a_goal', placeholder: 'Must achieve ___ BEFORE ___ or ___ (irreversible consequence)', multiline: true },
  { label: 'Antagonist Name', key: 'antag_name', placeholder: 'Name' },
  { label: 'What they want', key: 'antag_want', placeholder: 'Their objective...' },
  { label: 'Why they believe they are right', key: 'antag_belief', placeholder: 'Their justification...', multiline: true },
  { label: 'Antagonist flaw (mirror/inverse of protagonist)', key: 'antag_flaw', placeholder: 'How they reflect the hero...' },
];

/**
 * Tri-Axis section definitions — without React icons (pure data).
 * UI components add icons when rendering. Export/print use threadColor.
 */
export const sectionDefinitions: StorySection[] = [
  // ─── ACT I ───
  {
    id: 'a1', title: 'A-AXIS (External Drive) — ACT I: Setup', color: 'text-blue-400', threadColor: '#60a5fa',
    fields: [
      { label: 'Who wants what from who?', key: 'a1_want', placeholder: 'The external desire...', multiline: true },
      { label: 'Why now? (trigger event)', key: 'a1_trigger', placeholder: 'What forces action TODAY?', multiline: true },
      { label: 'Stakes (what happens if they fail?)', key: 'a1_stakes', placeholder: 'Irreversible consequences...', multiline: true },
      { label: 'Inciting Incident', key: 'a1_inciting', placeholder: 'The moment everything changes...', multiline: true },
      { label: 'Point of No Return', key: 'a1_ponr', placeholder: 'Protagonist commits — cannot go back because...', multiline: true },
    ],
  },
  {
    id: 'b1', title: 'B-AXIS (Internal Resistance) — ACT I: Setup', color: 'text-amber-400', threadColor: '#fbbf24',
    fields: [
      { label: 'Flaws / Vulnerabilities introduced', key: 'b1_flaws', placeholder: 'What weaknesses are visible?', multiline: true },
      { label: 'Internal Contradiction', key: 'b1_contradiction', placeholder: 'Wants ___ but behaves like ___', multiline: true },
      { label: 'Internal Block', key: 'b1_block', placeholder: 'What inside them prevents success?', multiline: true },
    ],
  },
  {
    id: 'c1', title: 'C-AXIS (Opposition Intelligence) — ACT I: Setup', color: 'text-red-400', threadColor: '#f87171',
    fields: [
      { label: 'Antagonist motivation established', key: 'c1_motivation', placeholder: 'Sound motivation for primary opposition...', multiline: true },
      { label: 'Do we understand them?', key: 'c1_understand', placeholder: 'Why their logic makes sense...', multiline: true },
      { label: 'Do we believe them?', key: 'c1_believe', placeholder: 'What makes them credible?', multiline: true },
      { label: 'Do we sympathize (even slightly)?', key: 'c1_sympathize', placeholder: 'The human element...', multiline: true },
      { label: 'Opposition Goal', key: 'c1_goal', placeholder: 'What they\'re trying to achieve...', multiline: true },
    ],
  },
  // ─── ACT II ───
  {
    id: 'a2', title: 'A-AXIS (External Drive) — ACT II: Confrontation', color: 'text-blue-400', threadColor: '#60a5fa',
    fields: [
      { label: 'Plan (False Confidence)', key: 'a2_plan', placeholder: 'The protagonist believes this will work...', multiline: true },
      { label: 'Win #1', key: 'a2_win1', placeholder: 'First success...' },
      { label: 'Win #2', key: 'a2_win2', placeholder: 'Second success...' },
      { label: 'Complication', key: 'a2_complication', placeholder: 'What goes wrong?', multiline: true },
    ],
  },
  {
    id: 'midpoint', title: '⚠️ MIDPOINT — The Trap', color: 'text-yellow-300', threadColor: '#fde047',
    fields: [
      { label: 'Wrong choice for the right reason', key: 'mid_choice', placeholder: 'The protagonist makes the WRONG choice for the RIGHT reason...', multiline: true },
      { label: 'What changes?', key: 'mid_change', placeholder: 'The shift...', multiline: true },
      { label: 'Why is the original plan now broken?', key: 'mid_broken', placeholder: 'What\'s been destroyed?', multiline: true },
      { label: 'Why is success now impossible (as originally defined)?', key: 'mid_impossible', placeholder: 'The walls close in...', multiline: true },
    ],
  },
  {
    id: 'b2', title: 'B-AXIS (Internal Resistance) — ACT II: Pressure', color: 'text-amber-400', threadColor: '#fbbf24',
    fields: [
      { label: 'Warning signs / red flags ignored', key: 'b2_warnings', placeholder: 'What they refuse to see...', multiline: true },
      { label: 'Flaw is now actively causing failure', key: 'b2_flaw_active', placeholder: 'How their weakness sabotages them...', multiline: true },
      { label: 'Internal Crisis', key: 'b2_crisis', placeholder: 'The character must face...', multiline: true },
    ],
  },
  {
    id: 'c2', title: 'C-AXIS (Opposition Intelligence) — ACT II: Gains', color: 'text-red-400', threadColor: '#f87171',
    fields: [
      { label: 'Antagonist adapts / gains leverage', key: 'c2_adapt', placeholder: 'How the opposition evolves...', multiline: true },
      { label: 'Learns something critical about protagonist', key: 'c2_learns', placeholder: 'Exploit discovered...', multiline: true },
    ],
  },
  {
    id: 'lowpoint', title: '🔥 END OF ACT II — Low Point', color: 'text-orange-400', threadColor: '#fb923c',
    fields: [
      { label: 'External failure', key: 'low_external', placeholder: 'Everything collapses externally...', multiline: true },
      { label: 'Internal failure', key: 'low_internal', placeholder: 'Everything collapses internally...', multiline: true },
      { label: 'Why they are "finished"', key: 'low_finished', placeholder: 'All hope is gone because...', multiline: true },
    ],
  },
  // ─── ACT III ───
  {
    id: 'b3', title: 'B-AXIS (Internal Resistance) — ACT III: Shift', color: 'text-amber-400', threadColor: '#fbbf24',
    fields: [
      { label: 'Revelation (Truth vs Misbelief)', key: 'b3_revelation', placeholder: '"I thought ___, but the truth is ___"', multiline: true },
      { label: 'New Decision', key: 'b3_decision', placeholder: 'The protagonist now chooses differently...', multiline: true },
    ],
  },
  {
    id: 'a3', title: 'A-AXIS (External Drive) — ACT III: Execution', color: 'text-blue-400', threadColor: '#60a5fa',
    fields: [
      { label: 'New Plan (Based on truth)', key: 'a3_plan', placeholder: 'The real strategy...', multiline: true },
      { label: 'Final confrontation', key: 'a3_confrontation', placeholder: 'The climactic moment...', multiline: true },
      { label: 'What is risked', key: 'a3_risked', placeholder: 'Everything on the line...' },
      { label: 'What is sacrificed', key: 'a3_sacrificed', placeholder: 'The cost of victory...' },
    ],
  },
  {
    id: 'c3', title: 'C-AXIS (Opposition Intelligence) — ACT III: Collapse', color: 'text-red-400', threadColor: '#f87171',
    fields: [
      { label: 'What flaw causes their defeat?', key: 'c3_flaw', placeholder: 'Their own undoing...', multiline: true },
      { label: 'How does it mirror the protagonist?', key: 'c3_mirror', placeholder: 'The thematic echo...', multiline: true },
    ],
  },
  // ─── DENOUEMENT ───
  {
    id: 'denouement', title: 'DENOUEMENT — Aftermath', color: 'text-emerald-400', threadColor: '#34d399',
    fields: [
      { label: 'What is now undeniably true?', key: 'den_truth', placeholder: 'The thematic proof...', multiline: true },
      { label: 'Protagonist — how changed?', key: 'den_protag', placeholder: 'Their new state...' },
      { label: 'Supporting characters — how changed?', key: 'den_support', placeholder: 'Ripple effects...' },
      { label: 'System/world — how changed?', key: 'den_world', placeholder: 'The new normal...' },
      { label: 'Cost of Victory', key: 'den_cost', placeholder: 'What did it take?', multiline: true },
    ],
  },
  // ─── FRANCHISE ───
  {
    id: 'franchise', title: '⚡ FRANCHISE EXTENSION HOOK', color: 'text-purple-400', threadColor: '#a78bfa',
    fields: [
      { label: 'What new imbalance is introduced?', key: 'fran_imbalance', placeholder: 'The next threat...', multiline: true },
      { label: 'Who is watching / reacting?', key: 'fran_watching', placeholder: 'Lurking forces...' },
      { label: 'What larger system is hinted at?', key: 'fran_system', placeholder: 'The bigger picture...', multiline: true },
    ],
  },
];

/** All field keys across coreDna + sections — for completion tracking */
export const allFieldKeys: string[] = [
  ...coreDnaFields.map(f => f.key),
  ...sectionDefinitions.flatMap(s => s.fields.map(f => f.key)),
];

/** Field-to-glossary term mapping */
export const fieldGlossaryMap: Record<string, string> = {
  'a1_inciting': 'inciting_incident',
  'a1_ponr': 'point_of_no_return',
  'mid_choice': 'midpoint',
  'low_external': 'low_point',
  'low_internal': 'low_point',
  'low_finished': 'low_point',
  'den_truth': 'denouement',
  'den_protag': 'denouement',
  'den_cost': 'denouement',
  'a3_confrontation': 'climax',
  'protag_archetype': 'archetype',
  'protag_misbelief': 'misbelief',
  'protag_flaw': 'core_flaw',
  'b1_contradiction': 'internal_contradiction',
  'b3_revelation': 'revelation',
  'a1_stakes': 'stakes',
  'a_goal': 'stakes',
  'fran_imbalance': 'franchise_extension_hook',
};

/** Section-to-glossary term mapping */
export const sectionGlossaryMap: Record<string, string> = {
  'midpoint': 'midpoint',
  'lowpoint': 'low_point',
  'denouement': 'denouement',
  'franchise': 'franchise_extension_hook',
};

/** Format keys excluded from story analysis */
export const FORMAT_KEYS = ['_medium', '_comic_pages', '_comic_issues', '_tv_ep_length', '_tv_series_ep_length', '_tv_series_episodes', '_film_length', '_stage_acts', '_stage_runtime'];
