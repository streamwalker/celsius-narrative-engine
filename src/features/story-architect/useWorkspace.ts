import { useCallback, useEffect, useRef, useState } from 'react';
import { makeWorkspace, STORAGE_KEY, workspaceSchema, type Project, type Workspace } from './model';

export function readWorkspace(storage: Pick<Storage, 'getItem'>) {
  let raw: string | null = null;
  try {
    raw = storage.getItem(STORAGE_KEY);
    if (raw === null) return { workspace: makeWorkspace(), raw, error: '' };
    return { workspace: workspaceSchema.parse(JSON.parse(raw)), raw, error: '' };
  } catch {
    return { workspace: makeWorkspace(), raw, error: 'The saved workspace could not be read. It has NOT been overwritten. Export the saved data before recovering it.' };
  }
}

/** Refuse to overwrite a workspace changed by another tab; storage failures remain visible. */
export function writeWorkspace(storage: Pick<Storage, 'getItem' | 'setItem'>, workspace: Workspace, expected: string | null) {
  if (storage.getItem(STORAGE_KEY) !== expected) throw new Error('Another tab changed this workspace. Export your unsaved story, then reload the saved workspace.');
  const raw = JSON.stringify(workspace);
  if (raw !== expected) storage.setItem(STORAGE_KEY, raw);
  return raw;
}

export function useWorkspace() {
  const [initial] = useState(() => {
    try { return readWorkspace(window.localStorage); }
    catch { return { workspace: makeWorkspace(), raw: null, error: 'Browser storage is unavailable. Edits will remain in memory; export your story before leaving.' }; }
  });
  const [workspace, setWorkspace] = useState<Workspace>(initial.workspace);
  const [error, setError] = useState(initial.error);
  const [saved, setSaved] = useState(false);
  const expected = useRef(initial.raw);
  const blocked = useRef(Boolean(initial.error));

  useEffect(() => {
    if (blocked.current) return;
    try {
      expected.current = writeWorkspace(window.localStorage, workspace, expected.current);
      setSaved(true);
      setError('');
    } catch (e) {
      blocked.current = true;
      setSaved(false);
      setError(e instanceof Error && /Another tab/.test(e.message) ? e.message : 'The browser could not save this edit. Storage may be full or blocked. Export your story before leaving.');
    }
  }, [workspace]);

  useEffect(() => {
    const onStorage = (e: StorageEvent) => {
      if ((e.key === STORAGE_KEY || e.key === null) && e.newValue !== expected.current) {
        blocked.current = true;
        setSaved(false);
        setError('Another tab changed this workspace. Export your unsaved story, then reload the saved workspace.');
      }
    };
    window.addEventListener('storage', onStorage);
    return () => window.removeEventListener('storage', onStorage);
  }, []);

  useEffect(() => {
    if (saved) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [saved]);

  const change = useCallback((mutate: (previous: Workspace) => Workspace) => {
    setSaved(false);
    setWorkspace(mutate);
  }, []);
  const updateProject = useCallback((project: Project) => {
    const next = { ...project, updatedAt: new Date().toISOString() };
    change(w => ({ ...w, projects: w.projects.map(p => p.id === next.id ? next : p) }));
  }, [change]);
  const addProject = useCallback((project: Project) => {
    change(w => w.projects.length >= 30 ? w : ({ ...w, activeId: project.id, projects: [...w.projects, project] }));
  }, [change]);
  const selectProject = useCallback((id: string) => {
    change(w => w.projects.some(p => p.id === id) ? { ...w, activeId: id } : w);
  }, [change]);
  const reload = useCallback(() => {
    try {
      const loaded = readWorkspace(window.localStorage);
      if (loaded.error) { setError(loaded.error); return; }
      expected.current = loaded.raw;
      blocked.current = false;
      setError('');
      setWorkspace(loaded.workspace);
    } catch { setError('Browser storage is still unavailable. Export your unsaved story.'); }
  }, []);
  const recover = useCallback(() => {
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw !== null) window.localStorage.setItem(`${STORAGE_KEY}-recovery-${Date.now()}`, raw);
      // Preserve the on-disk original before replacing it with the in-memory workspace.
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(workspace));
      expected.current = JSON.stringify(workspace);
      blocked.current = false;
      setSaved(true);
      setError('');
    } catch { setError('Recovery could not save a backup. The saved workspace was left in place. Export your story and the saved data.'); }
  }, [workspace]);
  return { workspace, project: workspace.projects.find(p => p.id === workspace.activeId)!, updateProject, addProject, selectProject, saved, error, reload, recover, originalRaw: initial.raw };
}
