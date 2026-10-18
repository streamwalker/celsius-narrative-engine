import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import StoryArchitect from './StoryArchitect';
import { exportProject, importProject, makeProject, makeSample, makeWorkspace, makeWorld, MAX_IMPORT_BYTES, projectSchema, reviewProject, STORAGE_KEY, workspaceSchema } from './model';
import { readWorkspace, writeWorkspace } from './useWorkspace';

beforeEach(() => window.localStorage.clear());
afterEach(() => { cleanup(); vi.restoreAllMocks(); });
const renderStudio = () => render(<MemoryRouter><StoryArchitect /></MemoryRouter>);
const disk = () => workspaceSchema.parse(JSON.parse(window.localStorage.getItem(STORAGE_KEY)!));

describe('Story Architect data and import safety', () => {
  it('starts with twelve distinct editable beats, no invented canon and no invented scores', () => {
    const p = makeProject();
    expect(p.beats).toHaveLength(12);
    expect(new Set(p.beats.map(b => b.id)).size).toBe(12);
    expect(p.beats.every(b => b.pressure === null)).toBe(true);
    expect(p.worlds).toEqual([]);
    expect(p.sample).toBe(false);
    expect(projectSchema.safeParse(p).success).toBe(true);
  });
  it('round-trips notes, skipped beats, ordering, world links, and original scenes', () => {
    const p = makeSample();
    p.beats.reverse(); p.beats[0].included = false;
    p.legacyFields = { _medium: 'comic', project_title: 'Legacy title' };
    p.legacyScenes = [{ sceneNumber: 1, summary: 'Untouched', custom: { props: ['original'] } }];
    const result = importProject(exportProject(p));
    expect(result.id).not.toBe(p.id);
    expect(result.beats).toEqual(p.beats);
    expect(result.worlds).toEqual(p.worlds);
    expect(result.legacyFields).toEqual(p.legacyFields);
    expect(result.legacyScenes).toEqual(p.legacyScenes);
  });
  it('maps actual legacy fields without rewriting the source', () => {
    const legacy = { project_title: 'Existing title', protag_name: 'Ari', a_goal: 'Reach home', a1_inciting: 'A letter arrives', den_world: 'The city changes', _comic_pages: '32', extra: 'Retain me', __scenes: [{ panelCount: 5 }] };
    const raw = JSON.stringify(legacy);
    const p = importProject(raw);
    expect(p.title).toBe('Existing title');
    expect(p.beats.find(b => b.template === 'call')?.plot).toBe('A letter arrives');
    expect(p.legacyFields.extra).toBe('Retain me');
    expect(p.legacyScenes).toEqual(legacy.__scenes);
    expect(JSON.stringify(legacy)).toBe(raw);
  });
  it('accepts a cloud story_data envelope with separately stored scenes', () => {
    const p = importProject(JSON.stringify({ title: 'Cloud title', story_data: { protag_name: 'Ari' }, scene_data: [{ title: 'Original' }] }));
    expect(p.title).toBe('Cloud title');
    expect(p.legacyScenes).toEqual([{ title: 'Original' }]);
  });
  it.each(['null', '[]', '{broken', '{"anything":"else"}', '{"format":"celsius-story-architect","version":99}'])('rejects invalid or unsupported input %s', input => {
    expect(() => importProject(input)).toThrow();
  });
  it('rejects non-array legacy scenes instead of silently dropping them', () => {
    expect(() => importProject('{"protag_name":"Ari","__scenes":"bad"}')).toThrow(/scene data/);
  });
  it('rejects oversized input', () => {
    expect(() => importProject(' '.repeat(MAX_IMPORT_BYTES + 1))).toThrow(/5 MB/);
  });
  it('rejects duplicate IDs and invalid active projects', () => {
    const p = makeProject(); p.beats[1].id = p.beats[0].id;
    expect(projectSchema.safeParse(p).success).toBe(false);
    const w = makeWorkspace(); w.activeId = 'missing';
    expect(workspaceSchema.safeParse(w).success).toBe(false);
  });
  it('does not treat empty or intentionally skipped beats as failures', () => {
    const p = makeProject();
    expect(reviewProject(p)).toEqual([]);
    p.beats[1].plot = 'Event'; p.beats[1].included = false;
    expect(reviewProject(p)).toEqual([]);
  });
  it('explains every editorial question and links it to the actual beat', () => {
    const p = makeProject(); p.beats[1].plot = 'Event';
    const signals = reviewProject(p);
    expect(signals).toHaveLength(4);
    expect(signals.every(s => s.beatId === p.beats[1].id && s.detail && s.level === 'question')).toBe(true);
  });
  it('detects missing references and approved rules without text', () => {
    const p = makeProject(); p.beats[0].plot = 'Event'; p.beats[0].worldIds = ['missing'];
    const w = makeWorld(); w.status = 'approved'; p.worlds.push(w);
    expect(reviewProject(p).filter(s => s.level === 'check')).toHaveLength(2);
  });
});

describe('Local storage protection', () => {
  it('does not overwrite invalid saved data during reading', () => {
    localStorage.setItem(STORAGE_KEY, '{broken');
    const result = readWorkspace(localStorage);
    expect(result.error).toContain('NOT been overwritten');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });
  it('writes and reloads a valid independent workspace', () => {
    const w = makeWorkspace();
    const raw = writeWorkspace(localStorage, w, null);
    expect(readWorkspace(localStorage).workspace).toEqual(w);
    expect(raw).toBe(localStorage.getItem(STORAGE_KEY));
  });
  it('refuses to overwrite a change made by another tab', () => {
    const w = makeWorkspace(); localStorage.setItem(STORAGE_KEY, 'external change');
    expect(() => writeWorkspace(localStorage, w, null)).toThrow(/Another tab/);
    expect(localStorage.getItem(STORAGE_KEY)).toBe('external change');
  });
  it('surfaces quota or permission failures', () => {
    const storage = { getItem: () => null, setItem: () => { throw new Error('Quota exceeded'); } };
    expect(() => writeWorkspace(storage, makeWorkspace(), null)).toThrow('Quota exceeded');
  });
});

describe('Working editor flows', () => {
  it('saves edits, switches projects, and leaves the old engine untouched', async () => {
    localStorage.setItem('narrative-engine-data', '{"protag_name":"Original"}');
    renderStudio();
    fireEvent.change(screen.getByLabelText('Working title'), { target: { value: 'First story' } });
    fireEvent.change(screen.getByLabelText('What happens?'), { target: { value: 'A choice with consequences.' } });
    const firstId = disk().activeId;
    fireEvent.click(screen.getByRole('button', { name: 'New story' }));
    expect(screen.getByLabelText('What happens?')).toHaveValue('');
    fireEvent.change(screen.getByLabelText('Current story'), { target: { value: firstId } });
    expect(screen.getByLabelText('What happens?')).toHaveValue('A choice with consequences.');
    expect(localStorage.getItem('narrative-engine-data')).toBe('{"protag_name":"Original"}');
    await waitFor(() => expect(screen.getByRole('status')).toHaveTextContent('Saved on this device'));
  });
  it('reorders and skips beats without losing content', () => {
    renderStudio();
    fireEvent.change(screen.getByLabelText('What happens?'), { target: { value: 'Keep this note.' } });
    const id = disk().projects[0].beats[0].id;
    fireEvent.click(screen.getByRole('button', { name: 'Move beat later' }));
    expect(disk().projects[0].beats[1].id).toBe(id);
    fireEvent.click(screen.getByLabelText('Include this beat'));
    expect(disk().projects[0].beats[1].included).toBe(false);
    expect(disk().projects[0].beats[1].plot).toBe('Keep this note.');
  });
  it('changes lenses without altering the beat data', () => {
    renderStudio();
    fireEvent.change(screen.getByLabelText('What happens?'), { target: { value: 'My opening.' } });
    const before = disk().projects[0].beats;
    fireEvent.change(screen.getByLabelText('Structure lens'), { target: { value: 'freeform' } });
    expect(disk().projects[0].beats).toEqual(before);
  });
  it('creates a world element and connects it to a beat', () => {
    renderStudio();
    fireEvent.click(screen.getByRole('button', { name: /World atlas/ }));
    fireEvent.click(screen.getByRole('button', { name: 'Add world element' }));
    fireEvent.change(screen.getByLabelText('Element name'), { target: { value: 'The gate' } });
    fireEvent.change(screen.getByLabelText('Rule / what this makes possible or impossible'), { target: { value: 'Only opens at dusk.' } });
    fireEvent.click(screen.getByRole('button', { name: /Story journey/ }));
    fireEvent.click(screen.getByRole('checkbox', { name: /The gate/ }));
    expect(disk().projects[0].beats[0].worldIds).toEqual([disk().projects[0].worlds[0].id]);
  });
  it('requires review before copying legacy engine fields', () => {
    localStorage.setItem('narrative-engine-data', '{"project_title":"Legacy","protag_name":"Original"}');
    renderStudio();
    fireEvent.click(screen.getByRole('button', { name: 'Import engine fields' }));
    expect(disk().projects).toHaveLength(1);
    expect(screen.getByRole('heading', { name: 'Review import: Legacy' })).toBeInTheDocument();
    fireEvent.click(screen.getByRole('button', { name: 'Import as new story' }));
    expect(disk().projects).toHaveLength(2);
    expect(screen.getByLabelText('Protagonist')).toHaveValue('Original');
  });
  it('keeps corrupted storage unchanged even when the editor is used', () => {
    localStorage.setItem(STORAGE_KEY, 'invalid saved content');
    renderStudio();
    fireEvent.change(screen.getByLabelText('Working title'), { target: { value: 'In-memory edits' } });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('invalid saved content');
    expect(screen.getByRole('status')).toHaveTextContent('Not saved');
  });
  it('creates clearly labeled sample content only when requested', () => {
    renderStudio();
    expect(screen.queryByText(/original demonstration material/)).toBeNull();
    fireEvent.click(screen.getByRole('button', { name: 'Explore a sample' }));
    expect(screen.getByText(/not part of your existing story canon/)).toBeInTheDocument();
    expect(disk().projects).toHaveLength(2);
  });
});
