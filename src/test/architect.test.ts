import { describe, it, expect, vi } from 'vitest';
import { STAGES } from '@/lib/architect/templates';
import { beatCoverage, coverage, deleteBeat, deleteWorld, duplicateProject, importProject, MAX_IMPORT_BYTES, moveBeat, newBeat, newProject, newScene, newWorld, parseWorkspace, persistWorkspace, reviewProject, sampleProject, serializeProject, serializeWorkspace, STORAGE_KEY, storyBrief } from '@/lib/architect/model';

const workspace = () => { const p = newProject(); return { version: 1 as const, activeId: p.id, projects: [p] }; };

describe('Story Architect templates and editing', () => {
  it('creates exactly twelve independent Hero’s Journey beats', () => {
    const a = newProject(), b = newProject();
    expect(a.beats).toHaveLength(12); expect(STAGES).toHaveLength(12);
    expect(new Set(a.beats.map(b => b.id)).size).toBe(12);
    expect(a.id).not.toBe(b.id); expect(a.beats[0].id).not.toBe(b.beats[0].id);
  });
  it('supports three-act and freeform starting points', () => {
    expect(newProject('three-act').beats.map(b => b.act)).toEqual([1, 2, 3]);
    expect(newProject('freeform').beats).toEqual([]);
  });
  it('reorders beats without modifying the original or breaking links', () => {
    const p = newProject(); p.scenes = [newScene(p.beats[0])];
    const updated = moveBeat(p, p.beats[0].id, 1);
    expect(updated.beats[1].id).toBe(p.beats[0].id);
    expect(p.beats[0].stageId).toBe('ordinary');
    expect(updated.scenes[0].beatId).toBe(updated.beats[1].id);
  });
  it('does not wrap at the beginning or end', () => {
    const p = newProject();
    expect(moveBeat(p, p.beats[0].id, -1)).toBe(p);
    expect(moveBeat(p, p.beats[11].id, 1)).toBe(p);
    expect(moveBeat(p, 'missing', 1)).toBe(p);
  });
  it('keeps scene content when a linked beat is deleted', () => {
    const p = newProject(); p.scenes = [newScene(p.beats[0])];
    const next = deleteBeat(p, p.beats[0].id);
    expect(next.beats).toHaveLength(11); expect(next.scenes[0].beatId).toBe('');
    expect(next.scenes[0].data).toEqual(p.scenes[0].data);
  });
  it('removes dangling references when a world entry is deleted', () => {
    const p = sampleProject(); const id = p.worlds[0].id;
    const next = deleteWorld(p, id);
    expect(next.worlds).toHaveLength(0); expect(next.beats.every(b => !b.ruleIds.includes(id))).toBe(true);
    expect(p.worlds).toHaveLength(1);
  });
  it('excludes deliberate omissions from note coverage', () => {
    const p = newProject(); p.beats[0].external = 'A choice'; p.beats[0].status = 'omitted';
    expect(beatCoverage(p.beats[0])).toBe(1); expect(coverage(p)).toEqual({ written: 0, total: 11, reviewed: 0 });
  });
  it('branches by deep-copying all story data', () => {
    const p = sampleProject(), next = duplicateProject(p);
    next.beats[0].external = 'A different direction'; next.scenes[0].data.summary = 'Rewritten';
    expect(next.id).not.toBe(p.id); expect(p.beats[0].external).not.toBe(next.beats[0].external);
    expect(p.scenes[0].data.summary).not.toBe(next.scenes[0].data.summary);
  });
});

describe('Versioned import and backup safety', () => {
  it('round-trips world links, omitted beats, scenes, and extension fields', () => {
    const p = sampleProject(); p.beats[1].status = 'omitted';
    p.scenes[0].data.custom_future = { color: 'blue', cast: ['Mara'], metadata: [1, 2] };
    p.futureExtension = { keep: true };
    const next = importProject(serializeProject(p));
    expect(next.id).not.toBe(p.id);
    expect(next.beats).toEqual(p.beats); expect(next.worlds).toEqual(p.worlds); expect(next.scenes).toEqual(p.scenes);
    expect(next.futureExtension).toEqual({ keep: true });
  });
  it('imports flat legacy fields without touching the source', () => {
    const value = { protag_name: 'Rhea', a_goal: 'Rescue the crew', _medium: 'comic', unusual_field: 'Keep this' };
    const p = importProject(JSON.stringify(value)); expect(p.fields).toEqual(value); expect(p.sourceSnapshot).toEqual(value);
  });
  it('keeps __scenes out of string fields and preserves all scene metadata', () => {
    const s = { title: 'Gate', sceneNumber: 4, episode: 0, energyLevel: 55, panelCount: 5, metadata: { notes: ['x'] } };
    const p = importProject(JSON.stringify({ protag_name: 'Rhea', __scenes: [s] }));
    expect(p.fields.__scenes).toBeUndefined(); expect(p.scenes[0].data).toEqual(s);
  });
  it('accepts a cloud story row and retains its original snapshot', () => {
    const row = { id: 'legacy-project', title: 'Original project', user_id: 'owner', story_data: { protag_name: 'Nix' }, scene_data: [{ title: 'Scene', summary: 'Something changes' }] };
    const p = importProject(JSON.stringify(row)); expect(p.title).toBe(row.title); expect(p.scenes).toHaveLength(1); expect(p.sourceSnapshot).toEqual(row);
  });
  it('does not invent scenes missing from old exports', () => {
    expect(importProject('{"protag_name":"Mara"}').scenes).toEqual([]);
  });
  it.each(['null', '[]', '42', '"text"', '{}', '{"unrelated":"data"}', '{"protag_name":123}', '{"protag_name":"X","__scenes":{}}'])('rejects malformed or unrelated data: %s', raw => {
    expect(() => importProject(raw)).toThrow();
  });
  it('rejects unsupported future versions rather than downgrading them', () => {
    expect(() => importProject(JSON.stringify({ ...newProject(), schemaVersion: 2 }))).toThrow();
  });
  it('rejects unsafe property names', () => {
    expect(() => importProject('{"protag_name":"X","__proto__":{"polluted":true}}')).toThrow('Unsafe');
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
  });
  it('rejects files over the limit and excessively deep JSON', () => {
    expect(() => importProject(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow('5 MB');
    expect(() => importProject('{"protag_name":"X","extra":' + '['.repeat(42) + '0' + ']'.repeat(42) + '}')).toThrow('deeply');
  });
  it('rejects duplicate entity IDs', () => {
    const p = newProject(); p.beats[1].id = p.beats[0].id;
    expect(() => importProject(JSON.stringify(p))).toThrow();
  });
  it('rejects a legacy field exceeding the current field size limit', () => {
    expect(() => importProject(JSON.stringify({ protag_name: 'X'.repeat(100001) }))).toThrow();
  });
  it('keeps empty and populated workspaces valid across reloads', () => {
    const w = workspace(); expect(parseWorkspace(serializeWorkspace(w))).toEqual(w);
    w.projects.push(sampleProject()); expect(parseWorkspace(serializeWorkspace(w))).toEqual(w);
  });
  it('rejects invalid active IDs and duplicate project IDs', () => {
    const w = workspace(); expect(() => parseWorkspace(JSON.stringify({ ...w, activeId: 'missing' }))).toThrow();
    expect(() => parseWorkspace(JSON.stringify({ ...w, projects: [w.projects[0], w.projects[0]] }))).toThrow();
  });
  it('writes only to the new namespace', () => {
    const getItem = vi.fn().mockReturnValue(null), setItem = vi.fn();
    persistWorkspace({ getItem, setItem }, workspace(), null);
    expect(getItem).toHaveBeenCalledWith(STORAGE_KEY); expect(setItem.mock.calls[0][0]).toBe(STORAGE_KEY);
    expect(setItem.mock.calls).toHaveLength(1);
  });
  it('refuses stale-tab writes and propagates quota errors', () => {
    const setItem = vi.fn();
    expect(() => persistWorkspace({ getItem: () => 'newer', setItem }, workspace(), 'old')).toThrow('Another tab');
    expect(setItem).not.toHaveBeenCalled();
    expect(() => persistWorkspace({ getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } }, workspace(), null)).toThrow('Quota');
  });
});

describe('Transparent planning checks and exports', () => {
  it('flags missing causal fields only in beats that have notes', () => {
    const p = newProject(); expect(reviewProject(p)).toHaveLength(1);
    p.beats[0].external = 'Event'; expect(reviewProject(p).some(c => c.id.startsWith('cause-'))).toBe(true);
    p.beats[0].status = 'omitted'; expect(reviewProject(p)).toHaveLength(1);
  });
  it('flags broken references and provisional knowledge, without approving canon', () => {
    const p = sampleProject(); p.worlds[0].status = 'rumor'; p.beats[0].ruleIds.push('missing');
    expect(reviewProject(p).some(c => c.id.startsWith('rule-'))).toBe(true);
    expect(reviewProject(p).some(c => c.id.startsWith('canon-'))).toBe(true);
    expect(p.worlds[0].status).toBe('rumor');
  });
  it('flags two differing canon entries but not a rumor as a proven contradiction', () => {
    const p = sampleProject(); p.worlds.push({ ...newWorld(), title: p.worlds[0].title, description: 'Another rule', status: 'canon' });
    expect(reviewProject(p).find(c => c.id.startsWith('duplicate-'))?.detail).toContain('not a proven contradiction');
    p.worlds[1].status = 'rumor'; expect(reviewProject(p).some(c => c.id.startsWith('duplicate-'))).toBe(false);
  });
  it('checks canon magic and technology for stated cost and limits', () => {
    const p = newProject(); const w = newWorld(); Object.assign(w, { status: 'canon', kind: 'Magic' }); p.worlds.push(w);
    expect(reviewProject(p).some(c => c.id.startsWith('cost-'))).toBe(true);
    w.cost = 'No material cost by author intent'; w.limits = 'Limited to hearing range';
    expect(reviewProject(p).some(c => c.id.startsWith('cost-'))).toBe(false);
  });
  it('finds a missing scene-beat link', () => {
    const p = newProject(); p.scenes = [newScene(newBeat())];
    expect(reviewProject(p).some(c => c.id.startsWith('scene-'))).toBe(true);
  });
  it('exports an honest brief with linked world entries and sample disclosure', () => {
    const p = sampleProject(), text = storyBrief(p);
    expect(text).toContain('NOT ESTABLISHED STORY CANON'); expect(text).toContain(p.worlds[0].title);
    expect(text).toContain('not a full backup'); expect(text).toContain('## Scenes');
  });
});
