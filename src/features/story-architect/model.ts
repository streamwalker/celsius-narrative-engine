import { z } from 'zod';
import { JOURNEY, WORLD_KINDS } from './journey';

const text = z.string().max(100_000);
export const beatSchema = z.object({
  id: z.string().min(1).max(120), template: z.string().max(120), title: text,
  act: z.number().int().min(1).max(3), included: z.boolean(),
  plot: text, internal: text, opposition: text, world: text,
  decision: text, consequence: text, because: text,
  worldIds: z.array(z.string()).max(200), pressure: z.number().min(0).max(100).nullable(),
});
export const worldSchema = z.object({
  id: z.string().min(1).max(120), name: text, kind: z.enum(WORLD_KINDS),
  description: text, rule: text, cost: text, exception: text,
  status: z.enum(['draft', 'approved']),
});
export const projectSchema = z.object({
  id: z.string().min(1).max(120), title: text, premise: text, theme: text,
  protagonist: text, want: text, belief: text, need: text,
  antagonist: text, oppositionGoal: text,
  arc: z.enum(['growth', 'fall', 'steadfast', 'open']), lens: z.enum(['journey', 'freeform']),
  beats: z.array(beatSchema).min(1).max(100), worlds: z.array(worldSchema).max(200),
  legacyFields: z.record(z.string()).default({}), legacyScenes: z.array(z.unknown()).max(5000).default([]),
  createdAt: z.string(), updatedAt: z.string(), sample: z.boolean().default(false),
}).superRefine((p, ctx) => {
  for (const key of ['beats', 'worlds'] as const) {
    if (new Set(p[key].map(item => item.id)).size !== p[key].length) {
      ctx.addIssue({ code: 'custom', path: [key], message: 'Duplicate IDs are not allowed.' });
    }
  }
});
export const workspaceSchema = z.object({
  version: z.literal(1), activeId: z.string(), projects: z.array(projectSchema).min(1).max(30),
}).superRefine((w, ctx) => {
  if (!w.projects.some(p => p.id === w.activeId) || new Set(w.projects.map(p => p.id)).size !== w.projects.length) {
    ctx.addIssue({ code: 'custom', message: 'Invalid active project or duplicate project IDs.' });
  }
});
export type Beat = z.infer<typeof beatSchema>;
export type WorldEntry = z.infer<typeof worldSchema>;
export type Project = z.infer<typeof projectSchema>;
export type Workspace = z.infer<typeof workspaceSchema>;
export const STORAGE_KEY = 'celsius-story-architect-v1';
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const uid = () => globalThis.crypto?.randomUUID?.() ?? `id-${Date.now()}-${Math.random().toString(36).slice(2)}`;
export function makeBeat(title = 'Custom beat', act = 2, template = 'custom'): Beat {
  return { id: uid(), template, title, act, included: true, plot: '', internal: '', opposition: '', world: '', decision: '', consequence: '', because: '', worldIds: [], pressure: null };
}
export function makeProject(title = 'Untitled story'): Project {
  const now = new Date().toISOString();
  return { id: uid(), title, premise: '', theme: '', protagonist: '', want: '', belief: '', need: '', antagonist: '', oppositionGoal: '', arc: 'growth', lens: 'journey', beats: JOURNEY.map(s => makeBeat(s.title, s.act, s.id)), worlds: [], legacyFields: {}, legacyScenes: [], createdAt: now, updatedAt: now, sample: false };
}
export function makeWorld(): WorldEntry {
  return { id: uid(), name: 'Untitled world element', kind: 'Place', description: '', rule: '', cost: '', exception: '', status: 'draft' };
}
export function makeWorkspace(): Workspace {
  const project = makeProject();
  return { version: 1, activeId: project.id, projects: [project] };
}
export function hasOutline(beat: Beat) { return Boolean(beat.plot.trim()); }
export function exportProject(project: Project): string {
  return JSON.stringify({ format: 'celsius-story-architect', version: 1, project: projectSchema.parse(project) }, null, 2);
}

/** Import as a NEW project. Original fields and scenes remain available for round-trip backup. */
export function importProject(raw: string): Project {
  if (new TextEncoder().encode(raw).byteLength > MAX_IMPORT_BYTES) throw new Error('The import exceeds the 5 MB limit.');
  let value: unknown;
  try { value = JSON.parse(raw); } catch { throw new Error('This is not valid JSON. No existing story was changed.'); }
  if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('Choose a Celsius story export.');
  const record = value as Record<string, unknown>;
  if (record.format === 'celsius-story-architect') {
    if (record.version !== 1) throw new Error('Unsupported export version. Keep this backup and use a compatible version of Celsius.');
    const parsed = projectSchema.safeParse(record.project);
    if (!parsed.success) throw new Error('The story export is incomplete or malformed. No existing story was changed.');
    return { ...parsed.data, id: uid(), updatedAt: new Date().toISOString() };
  }
  const source = record.story_data && typeof record.story_data === 'object' && !Array.isArray(record.story_data)
    ? record.story_data as Record<string, unknown> : record;
  if (!['protag_name', 'project_title', 'theme', 'a_goal', 'a1_inciting'].some(k => typeof source[k] === 'string')) {
    throw new Error('This file is not a recognized Celsius story export.');
  }
  const fields = Object.fromEntries(Object.entries(source).filter(([, v]) => typeof v === 'string')) as Record<string, string>;
  const sceneSource = source.__scenes ?? record.scene_data ?? [];
  if (!Array.isArray(sceneSource)) throw new Error('The legacy scene data is malformed. No existing story was changed.');
  const p = makeProject(fields.project_title || (typeof record.title === 'string' ? record.title : '') || 'Imported story');
  Object.assign(p, { protagonist: fields.protag_name || '', theme: fields.theme || '', want: fields.a_goal || '', belief: fields.protag_misbelief || '', need: fields.b3_revelation || '', antagonist: fields.antag_name || '', oppositionGoal: fields.antag_want || '', legacyFields: fields, legacyScenes: sceneSource });
  const map: Record<string, [string, keyof Beat][]> = {
    ordinary: [['a1_want', 'plot'], ['b1_flaws', 'internal']], call: [['a1_inciting', 'plot'], ['a1_stakes', 'consequence']],
    refusal: [['b1_block', 'internal']], threshold: [['a1_ponr', 'plot']], tests: [['a2_plan', 'plot'], ['c2_adapt', 'opposition']],
    ordeal: [['low_external', 'plot'], ['low_internal', 'internal']], reward: [['b3_revelation', 'internal']],
    road: [['a3_plan', 'plot']], resurrection: [['a3_confrontation', 'plot'], ['b3_decision', 'decision']],
    elixir: [['den_protag', 'internal'], ['den_world', 'world'], ['den_cost', 'consequence']],
  };
  p.beats = p.beats.map(b => {
    const patch = Object.fromEntries((map[b.template] || []).map(([from, to]) => [to, fields[from] || '']));
    return { ...b, ...patch };
  });
  const parsed = projectSchema.safeParse(p);
  if (!parsed.success) throw new Error('The imported content exceeds the supported story limits.');
  return parsed.data;
}

export type Signal = { id: string; level: 'question' | 'check'; title: string; detail: string; beatId?: string; worldId?: string };
/** Deterministic editorial prompts. These do not grade prose or prove semantic contradictions. */
export function reviewProject(p: Project): Signal[] {
  const result: Signal[] = [];
  const active = p.beats.filter(b => b.included);
  for (const b of active.filter(hasOutline)) {
    if (!b.decision.trim()) result.push({ id: `${b.id}-choice`, level: 'question', title: `What is chosen in “${b.title}”?`, detail: 'The beat has an external event but no recorded decision. A deliberate lack of agency can be intentional.', beatId: b.id });
    if (!b.consequence.trim()) result.push({ id: `${b.id}-consequence`, level: 'question', title: `What changes after “${b.title}”?`, detail: 'Record the outcome or cost that the next beat must inherit.', beatId: b.id });
    if (active.indexOf(b) > 0 && !b.because.trim()) result.push({ id: `${b.id}-cause`, level: 'question', title: `Why does “${b.title}” follow?`, detail: 'Explain the causal connection—or the intentional contrast in a nonlinear sequence.', beatId: b.id });
    if (!b.world.trim() && !b.worldIds.length) result.push({ id: `${b.id}-world`, level: 'question', title: `Could “${b.title}” happen in any setting?`, detail: 'Consider a world-specific constraint. Not every quiet beat needs one.', beatId: b.id });
    for (const id of b.worldIds) if (!p.worlds.some(w => w.id === id)) result.push({ id: `${b.id}-${id}`, level: 'check', title: 'A linked world element is missing', detail: `Repair the missing reference in “${b.title}”.`, beatId: b.id });
  }
  for (const w of p.worlds) {
    if (w.status === 'approved' && !w.rule.trim()) result.push({ id: `${w.id}-rule`, level: 'check', title: `“${w.name}” has no recorded rule`, detail: 'Approval records your decision; it does not fill in the rule. Add a rule or return the entry to draft.', worldId: w.id });
    if (w.rule.trim() && !active.some(b => b.worldIds.includes(w.id))) result.push({ id: `${w.id}-unused`, level: 'question', title: `Where does “${w.name}” affect the story?`, detail: 'This entry has a rule but is not linked to an included beat. Background-only lore is allowed.', worldId: w.id });
  }
  return result;
}

/** Original, explicitly fictional study material; unrelated to the author's existing canon. */
export function makeSample(): Project {
  const p = makeProject('The Last Tide');
  Object.assign(p, { sample: true, premise: 'When a floating city’s tide engine begins consuming human memories, an exiled cartographer must choose between restoring its power and revealing who has been paying for it.', theme: 'A society cannot heal while hiding the cost of its survival.', protagonist: 'Mara Venn', want: 'Repair the tide engine before the next storm.', belief: 'Keeping people safe means keeping painful truths from them.', need: 'Let others make informed choices, even when she cannot control the outcome.', antagonist: 'The Harbor Regent', oppositionGoal: 'Preserve the city through compulsory memory offerings.' });
  const city = { ...makeWorld(), name: 'The Floating City', description: 'An archipelago of districts chained around a failing tide engine.', rule: 'Only licensed navigators may cross the outer chains.', cost: 'Unlicensed crossing forfeits citizenship.', status: 'approved' as const };
  const engine = { ...makeWorld(), kind: 'Science / magic' as const, name: 'The Tide Engine', description: 'A machine that turns remembered experience into buoyancy.', rule: 'Every hour of lift consumes an irreplaceable memory.', cost: 'Erased memories cannot be restored by the engine.', exception: 'The engine accepts freely shared memories, but their owners still lose them.', status: 'approved' as const };
  p.worlds = [city, engine];
  const plots = ['Mara charts safe routes while hiding the reason for her exile.', 'A district sinks, revealing names missing from the public memorial.', 'Mara refuses a repair mission that would expose her complicity.', 'A retired engine keeper gives Mara the unedited maintenance record.', 'Mara cuts the outer chain and sails into the forbidden engine district.', 'An archivist and a dockworker force Mara to test her official maps.', 'The crew plans a covert repair beneath the city’s council chamber.', 'Mara learns the repair would consume the crew’s memories.', 'The crew takes proof of the compulsory offerings instead of restoring power.', 'The Regent brands the crew saboteurs and seals the harbor.', 'Mara releases the truth and lets each district choose its contribution.', 'The city survives in a changed form; the lost memories stay lost.'];
  p.beats = p.beats.map((b, i) => ({ ...b, plot: plots[i], worldIds: [i < 5 ? city.id : engine.id], pressure: [12, 40, 26, 32, 58, 46, 64, 92, 51, 76, 96, 24][i] }));
  Object.assign(p.beats[4], { internal: 'Mara gives up the protection of official approval.', opposition: 'The Regent orders the outer chains sealed.', world: 'Crossing without a license ends her citizenship.', decision: 'Leave the protection of the harbor and take the crew with her.', consequence: 'She can no longer return legally, and her crew shares the penalty.', because: 'The unedited record proves the repair cannot be understood from inside the harbor.' });
  return p;
}
