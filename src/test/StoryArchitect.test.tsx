import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { toast } from 'sonner';
import StoryArchitect from '@/pages/StoryArchitect';
import { parseWorkspace, STORAGE_KEY } from '@/lib/architect/model';
vi.mock('sonner', () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
const show = () => render(<MemoryRouter><StoryArchitect /></MemoryRouter>);
const current = () => { const w = parseWorkspace(localStorage.getItem(STORAGE_KEY)!); return w.projects.find(p => p.id === w.activeId)!; };
beforeEach(() => { localStorage.clear(); vi.clearAllMocks(); });
afterEach(() => { cleanup(); vi.restoreAllMocks(); });

describe('Story Architect workspace', () => {
  it('has an accessible heading and honestly labeled local saving', () => {
    show(); expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent('Celsius Story Architect');
    expect(screen.getByRole('status')).toHaveTextContent('Saved locally');
  });
  it('persists title and DNA edits across remounts', () => {
    const first = show(); fireEvent.change(screen.getByLabelText('Project title'), { target: { value: 'A better story' } });
    fireEvent.change(screen.getByLabelText('Protagonist'), { target: { value: 'Mara' } });
    expect(current().title).toBe('A better story'); expect(current().fields.protag_name).toBe('Mara');
    first.unmount(); show(); expect(screen.getByLabelText('Project title')).toHaveValue('A better story');
  });
  it('creates a separate freeform project without deleting the first', () => {
    show(); const before = current().id;
    fireEvent.change(screen.getByLabelText('New project structure'), { target: { value: 'freeform' } });
    fireEvent.click(screen.getByRole('button', { name: 'New' }));
    const w = parseWorkspace(localStorage.getItem(STORAGE_KEY)!);
    expect(w.projects).toHaveLength(2); expect(w.projects.some(p => p.id === before)).toBe(true);
    expect(current().beats).toHaveLength(0);
  });
  it('copies beat notes into a scene, without claiming to generate AI content', () => {
    show(); fireEvent.click(screen.getByRole('button', { name: 'Journey' }));
    fireEvent.change(screen.getByLabelText('External drive'), { target: { value: 'Mara opens the gate.' } });
    fireEvent.click(screen.getByRole('button', { name: 'Create scene from notes' }));
    expect(screen.getByLabelText('Scene summary')).toHaveValue('Mara opens the gate.');
    expect(current().scenes[0].beatId).toBe(current().beats[0].id);
    expect(toast.success).toHaveBeenCalledWith(expect.stringContaining('No AI'));
  });
  it('creates, approves, and links a world rule', () => {
    show(); fireEvent.click(screen.getByRole('button', { name: 'World bible' }));
    fireEvent.click(screen.getByRole('button', { name: 'New world entry' }));
    fireEvent.change(screen.getByLabelText('Entry title'), { target: { value: 'No free portal travel' } });
    fireEvent.change(screen.getByLabelText('Knowledge status'), { target: { value: 'canon' } });
    fireEvent.click(screen.getByRole('button', { name: 'Journey' }));
    fireEvent.click(screen.getByRole('checkbox', { name: /No free portal travel/ }));
    expect(current().beats[0].ruleIds).toEqual([current().worlds[0].id]); expect(current().worlds[0].status).toBe('canon');
  });
  it('copies the legacy draft without modifying any legacy storage', () => {
    const raw = '{"protag_name":"Rhea","a_goal":"Rescue the crew"}';
    localStorage.setItem('narrative-engine-data', raw); localStorage.setItem('celsius-scenes-local', '[{"title":"unrelated"}]');
    show(); fireEvent.click(screen.getByRole('button', { name: 'Copy local engine draft' }));
    expect(current().fields.protag_name).toBe('Rhea'); expect(current().scenes).toHaveLength(0);
    expect(localStorage.getItem('narrative-engine-data')).toBe(raw);
    expect(localStorage.getItem('celsius-scenes-local')).toBe('[{"title":"unrelated"}]');
  });
  it('rejects bad imported files without replacing the current project', async () => {
    show(); const id = current().id;
    const file = new File(['{}'], 'wrong.json', { type: 'application/json' });
    Object.defineProperty(file, 'text', { value: async () => '{}' });
    fireEvent.change(screen.getByLabelText('Import Celsius JSON'), { target: { files: [file] } });
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith(expect.stringContaining('Import rejected')));
    expect(current().id).toBe(id); expect(screen.getByLabelText('Import Celsius JSON')).toHaveValue('');
  });
  it('leaves corrupted storage untouched and exposes recovery controls', () => {
    localStorage.setItem(STORAGE_KEY, '{broken'); show();
    expect(screen.getByRole('alert')).toHaveTextContent('original bytes');
    expect(screen.getByRole('button', { name: 'Download original storage' })).toBeInTheDocument();
    fireEvent.change(screen.getByLabelText('Project title'), { target: { value: 'Temporary recovery' } });
    expect(localStorage.getItem(STORAGE_KEY)).toBe('{broken');
  });
  it('pauses on a second-tab change instead of overwriting it', () => {
    show(); const before = localStorage.getItem(STORAGE_KEY)!;
    localStorage.setItem(STORAGE_KEY, 'newer value');
    fireEvent(window, new StorageEvent('storage', { key: STORAGE_KEY, oldValue: before, newValue: 'newer value' }));
    fireEvent.change(screen.getByLabelText('Project title'), { target: { value: 'My unsaved edit' } });
    expect(screen.getByRole('status')).toHaveTextContent('Saving paused');
    expect(localStorage.getItem(STORAGE_KEY)).toBe('newer value');
  });
  it('reports a storage quota error without displaying saved status', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Quota exceeded'); });
    show(); expect(screen.getByRole('status')).toHaveTextContent('Saving paused');
    expect(screen.getByRole('alert')).toHaveTextContent('Quota exceeded');
  });
});
