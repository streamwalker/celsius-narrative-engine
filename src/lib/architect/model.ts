import { z } from 'zod';
import { STAGES, LANES, WORLD_KINDS, type Structure } from './templates';

export const STORAGE_KEY = 'celsius-story-architect-v1';
export const MAX_IMPORT_BYTES = 5 * 1024 * 1024;
export const uid = (): string => {
  if (typeof crypto.randomUUID === 'function') return crypto.randomUUID();
  const bytes = crypto.getRandomValues(new Uint8Array(16));
  bytes[6] = (bytes[6] & 15) | 64; bytes[8] = (bytes[8] & 63) | 128;
  const hex = Array.from(bytes, b => b.toString(16).padStart(2, '0')).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20)}`;
};
const text = z.string().max(100_000);
const id = z.string().min(1).max(200);
const beatSchema = z.object({
  id, stageId: z.string(), title: text, act: z.union([z.literal(1), z.literal(2), z.literal(3)]),
  status: z.enum(['draft', 'reviewed', 'omitted']),
  external: text, internal: text, opposition: text, world: text, decision: text, consequence: text,
  ruleIds: z.array(id).max(500),
}).passthrough();
const worldSchema = z.object({
  id, title: text, kind: z.enum(WORLD_KINDS), status: z.enum(['draft', 'canon', 'rumor']),
  description: text, limits: text, cost: text, source: text,
}).passthrough();
// Preserve the complete scene payload, including fields from older or newer engines.
const sceneDataSchema = z.object({ title: text.optional(), summary: text.optional(), purpose: text.optional() }).passthrough();
const sceneSchema = z.object({ id, beatId: z.string(), data: sceneDataSchema }).passthrough();
export const projectSchema = z.object({
  kind: z.literal('celsius-story-architect'), schemaVersion: z.literal(1), id, title: text,
  structure: z.enum(['hero', 'three-act', 'freeform']), fields: z.record(text),
  beats: z.array(beatSchema).max(250), worlds: z.array(worldSchema).max(500), scenes: z.array(sceneSchema).max(2500),
  updatedAt: z.string(), sample: z.boolean(), sourceSnapshot: z.unknown().optional(),
}).passthrough().superRefine((p, ctx) => {
  for (const key of ['beats', 'worlds', 'scenes'] as const) {
    if (new Set(p[key].map(v => v.id)).size !== p[key].length) {
      ctx.addIssue({ code: 'custom', message: `Duplicate ${key} IDs`, path: [key] });
    }
  }
});
export type Project = z.infer<typeof projectSchema>;
export type Beat = z.infer<typeof beatSchema>;
export type World = z.infer<typeof worldSchema>;
export type SceneCard = z.infer<typeof sceneSchema>;
export type Workspace = { version: 1; activeId: string; projects: Project[] };
const workspaceSchema = z.object({ version: z.literal(1), activeId: id, projects: z.array(projectSchema).min(1).max(100) })
  .refine(w => new Set(w.projects.map(p => p.id)).size === w.projects.length && w.projects.some(p => p.id === w.activeId), 'Invalid project selection');

export function newBeat(title = 'Untitled beat', act: 1 | 2 | 3 = 1, stageId = ''): Beat {
  return { id: uid(), title, act, stageId, status: 'draft', external: '', internal: '', opposition: '', world: '', decision: '', consequence: '', ruleIds: [] };
}
export function newProject(structure: Structure = 'hero'): Project {
  const beats = structure === 'hero' ? STAGES.map(s => newBeat(s[1], s[2], s[0]))
    : structure === 'three-act' ? [newBeat('Setup', 1), newBeat('Confrontation', 2), newBeat('Resolution', 3)] : [];
  return { kind: 'celsius-story-architect', schemaVersion: 1, id: uid(), title: 'Untitled story', structure, fields: {}, beats, worlds: [], scenes: [], updatedAt: new Date().toISOString(), sample: false };
}
export function newWorld(): World {
  return { id: uid(), title: 'Untitled world entry', kind: 'Culture', status: 'draft', description: '', limits: '', cost: '', source: '' };
}
export function newScene(beat?: Beat): SceneCard {
  return { id: uid(), beatId: beat?.id || '', data: {
    sceneNumber: 1, title: beat?.title || 'Untitled scene', act: beat?.act || 1,
    sequence: '', purpose: beat?.decision || '', summary: beat?.external || '', tone: '', dialogueDensity: '',
    estimatedDialogueLines: 0, conflictInternal: beat?.internal || '', conflictExternal: beat?.opposition || '',
    buildsFrom: '', setsUp: beat?.consequence || '', keyFunction: '', visualSignature: beat?.world || '', energyLevel: 0,
  } };
}
export function moveBeat(p: Project, beatId: string, direction: -1 | 1): Project {
  const at = p.beats.findIndex(b => b.id === beatId), to = at + direction;
  if (at < 0 || to < 0 || to >= p.beats.length) return p;
  const beats = [...p.beats];
  [beats[at], beats[to]] = [beats[to], beats[at]];
  return { ...p, beats };
}
export function deleteBeat(p: Project, beatId: string): Project {
  return { ...p, beats: p.beats.filter(b => b.id !== beatId), scenes: p.scenes.map(s => s.beatId === beatId ? { ...s, beatId: '' } : s) };
}
export function deleteWorld(p: Project, worldId: string): Project {
  return { ...p, worlds: p.worlds.filter(w => w.id !== worldId), beats: p.beats.map(b => ({ ...b, ruleIds: b.ruleIds.filter(i => i !== worldId) })) };
}
export function duplicateProject(p: Project): Project {
  return { ...JSON.parse(JSON.stringify(p)), id: uid(), title: `${p.title} — branch`, updatedAt: new Date().toISOString() };
}
export function beatCoverage(b: Beat) { return LANES.filter(l => b[l.key].trim()).length; }
export function coverage(p: Project) {
  const active = p.beats.filter(b => b.status !== 'omitted');
  return { written: active.filter(b => beatCoverage(b) > 0).length, reviewed: active.filter(b => b.status === 'reviewed').length, total: active.length };
}

function safeParse(raw: string): unknown {
  if (new Blob([raw]).size > MAX_IMPORT_BYTES) throw new Error('File exceeds the 5 MB import limit.');
  const value: unknown = JSON.parse(raw);
  const inspect = (v: unknown, depth: number) => {
    if (depth > 40) throw new Error('JSON is nested too deeply.');
    if (v && typeof v === 'object') for (const [key, child] of Object.entries(v)) {
      if (['__proto__', 'prototype', 'constructor'].includes(key)) throw new Error('Unsafe JSON property.');
      inspect(child, depth + 1);
    }
  };
  inspect(value, 0);
  return value;
}
const record = (v: unknown): v is Record<string, unknown> => !!v && typeof v === 'object' && !Array.isArray(v);
export function importProject(raw: string): Project {
  const value = safeParse(raw);
  if (!record(value)) throw new Error('Expected a Celsius project object, not a list or scalar.');
  if ('kind' in value || 'schemaVersion' in value) {
    const p = projectSchema.parse(value);
    return { ...p, id: uid(), updatedAt: new Date().toISOString() };
  }
  // Legacy flat exports and Supabase story_projects rows. Never guess at unrelated JSON.
  const source = value.story_data ?? value.storyData ?? value;
  if (!record(source)) throw new Error('Legacy story_data must be an object.');
  const { __scenes, ...rest } = source;
  const fields = z.record(z.string()).parse(rest);
  const recognized = ['protag_name', 'project_title', 'theme', 'a_goal', 'a1_want', '_medium', 'antag_name'];
  if (!recognized.some(k => k in fields)) throw new Error('No recognized Celsius story fields found.');
  const rawScenes = __scenes ?? value.scene_data ?? value.scenes ?? [];
  const scenes = z.array(sceneDataSchema).max(2500).parse(rawScenes === null ? [] : rawScenes);
  const p = newProject();
  return projectSchema.parse({ ...p, title: typeof value.title === 'string' ? value.title : fields.project_title || fields.protag_name || p.title, fields,
    scenes: scenes.map(data => ({ id: uid(), beatId: '', data })), sourceSnapshot: value });
}
export function serializeProject(p: Project) { return JSON.stringify(projectSchema.parse(p), null, 2); }
export function parseWorkspace(raw: string): Workspace { return workspaceSchema.parse(safeParse(raw)) as Workspace; }
export function serializeWorkspace(w: Workspace): string {
  const raw = JSON.stringify(workspaceSchema.parse(w));
  if (new Blob([raw]).size > MAX_IMPORT_BYTES) throw new Error('Local workspace is too large. Export a backup before removing unused projects.');
  return raw;
}
/** Compare-and-set protects against most stale-tab writes; localStorage is not a transactional database. */
export function persistWorkspace(storage: Pick<Storage, 'getItem' | 'setItem'>, w: Workspace, expected: string | null): string {
  if (storage.getItem(STORAGE_KEY) !== expected) throw new Error('Another tab changed this workspace. Export this draft, then reload before editing.');
  const next = serializeWorkspace(w);
  storage.setItem(STORAGE_KEY, next);
  return next;
}
export type Check = { id: string; title: string; detail: string; target: 'story' | 'journey' | 'world' | 'scenes'; targetId?: string };
export function reviewProject(p: Project): Check[] {
  const checks: Check[] = [];
  if (!p.fields.a_goal?.trim()) checks.push({ id: 'goal', title: 'Clarify the central pursuit', detail: 'An explicit goal is useful for this planning approach, not a universal requirement for fiction.', target: 'story' });
  for (const b of p.beats.filter(b => b.status !== 'omitted' && beatCoverage(b) > 0)) {
    if (!b.decision.trim() || !b.consequence.trim()) checks.push({ id: `cause-${b.id}`, title: `${b.title}: connect choice to consequence`, detail: 'One or both causal fields are empty. A deliberate pause is valid; record the intention rather than adding artificial conflict.', target: 'journey', targetId: b.id });
    if (b.ruleIds.some(i => !p.worlds.some(w => w.id === i))) checks.push({ id: `rule-${b.id}`, title: `${b.title}: missing world reference`, detail: 'A linked world entry is not present in this project.', target: 'journey', targetId: b.id });
    if (b.ruleIds.some(i => p.worlds.some(w => w.id === i && w.status !== 'canon'))) checks.push({ id: `canon-${b.id}`, title: `${b.title}: provisional world knowledge`, detail: 'This beat links to a draft or rumor. That may be intentional; do not treat it as established canon without review.', target: 'journey', targetId: b.id });
  }
  for (const w of p.worlds) {
    if (w.status === 'canon' && ['Magic', 'Technology'].includes(w.kind) && (!w.limits.trim() || !w.cost.trim())) checks.push({ id: `cost-${w.id}`, title: `${w.title}: define limits and cost`, detail: 'Add a restriction and a price, or explicitly record that none applies. This is an empty-field check, not an evaluation of your world’s logic.', target: 'world', targetId: w.id });
  }
  const normalize = (s: string) => s.trim().replace(/\s+/g, ' ').toLowerCase();
  for (let i = 0; i < p.worlds.length; i++) {
    const w = p.worlds[i];
    if (w.status !== 'canon' || !w.title.trim()) continue;
    const other = p.worlds.slice(i + 1).find(v => v.status === 'canon' && normalize(v.title) === normalize(w.title) && normalize(v.description) !== normalize(w.description));
    if (other) checks.push({ id: `duplicate-${w.id}`, title: `${w.title}: differing canon entries`, detail: 'Two canon entries share a title but differ in description. Compare their scope and source; this is a possible mismatch, not a proven contradiction.', target: 'world', targetId: w.id });
  }
  for (const s of p.scenes) if (s.beatId && !p.beats.some(b => b.id === s.beatId)) checks.push({ id: `scene-${s.id}`, title: `${s.data.title || 'Scene'}: missing beat`, detail: 'The linked beat no longer exists. Reassign this scene or leave it deliberately unlinked.', target: 'scenes', targetId: s.id });
  return checks;
}
export function storyBrief(p: Project): string {
  return [`# ${p.title}`, 'Celsius Story Architect • author-controlled planning brief', p.sample ? 'ILLUSTRATIVE SAMPLE — NOT ESTABLISHED STORY CANON' : '',
    '## Story foundation', ...Object.entries(p.fields).map(([k, v]) => `### ${k}\n${v}`),
    '## Journey', ...p.beats.map((b, i) => `### ${i + 1}. ${b.title} (Act ${b.act}; ${b.status})\n${LANES.map(l => `**${l.label}**\n${b[l.key] || 'Not yet written.'}`).join('\n\n')}\n\nWorld links: ${b.ruleIds.map(id => p.worlds.find(w => w.id === id)?.title || `[missing: ${id}]`).join(', ') || 'None'}`),
    '## World bible', ...p.worlds.map(w => `### ${w.title} (${w.kind}; ${w.status})\n${w.description}\n\nLimits: ${w.limits}\n\nCost: ${w.cost}\n\nSource / scope: ${w.source}`),
    '## Scenes', ...p.scenes.map((s, i) => `### ${i + 1}. ${s.data.title || 'Untitled'}\nBeat: ${p.beats.find(b => b.id === s.beatId)?.title || 'Unlinked'}\n\n${s.data.summary || ''}\n\nPurpose: ${s.data.purpose || ''}`),
    '\nThis brief is not a full backup. Use the versioned JSON export to preserve every field and scene payload.'].filter(Boolean).join('\n\n');
}
export function sampleProject(): Project {
  const p = newProject();
  p.title = 'The Last Tide'; p.sample = true;
  p.fields = { protag_name: 'Mara', theme: 'Can a community survive without choosing who deserves to be saved?', a_goal: 'Restore the flood gates before the next high tide cuts off the lower city.', protag_flaw: 'She confuses control with responsibility.', protag_misbelief: 'Only she can keep people safe.', antag_name: 'The Harbor Council', antag_want: 'Protect the upper city and preserve its emergency reserves.', antag_belief: 'A controlled sacrifice prevents a catastrophe.', world_before: 'The upper city owns the tide engines; the lower city pays for access.', world_after: 'The engines are governed by a shared council of both districts.', _medium: 'comic' };
  const w = newWorld(); Object.assign(w, { title: 'Tide engines need living coral', kind: 'Technology', status: 'canon', description: 'Every gate opening consumes a living coral core.', limits: 'A dead core cannot be restarted.', cost: 'Opening the rescue channel uses the upper city’s last spare core.', source: 'Original sample world rule; applies to all tide engines.' }); p.worlds.push(w);
  Object.assign(p.beats[0], { external: 'Mara maintains the flood gates while the lower district waits for water.', internal: 'She refuses to delegate even routine repairs.', opposition: 'The council diverts maintenance stock to the upper district.', world: 'Water access is determined by elevation and status.', decision: 'Mara quietly uses her own supply to repair a lower gate.', consequence: 'Her workshop runs out of replacement cores.', status: 'reviewed', ruleIds: [w.id] });
  Object.assign(p.beats[1], { external: 'A broken gate traps a school ferry below the flood line.', internal: 'Mara thinks asking for help would reveal that she is unfit to lead.', opposition: 'The council locks the emergency reserve.', world: 'The only spare coral is behind the council’s seal.', decision: 'She decides to open the reserve without authorization.', consequence: 'She becomes a wanted saboteur.', ruleIds: [w.id] });
  Object.assign(p.beats[4], { external: 'Mara crosses into the flooded service tunnels with a rival engineer.', internal: 'She must let someone else navigate.', opposition: 'Council wardens seal the upper access points.', world: 'Opening one gate will drain the coral needed by another.', decision: 'She gives the rival control of the route.', consequence: 'Their escape now depends on mutual trust.', ruleIds: [w.id] });
  p.scenes.push(newScene(p.beats[0]));
  return p;
}
