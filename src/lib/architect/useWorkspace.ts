import { useEffect, useRef, useState } from 'react';
import { newProject, parseWorkspace, persistWorkspace, STORAGE_KEY, type Workspace } from './model';

function initialState(): { workspace: Workspace; raw: string | null; error: string } {
  let raw: string | null = null;
  try {
    raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return { workspace: parseWorkspace(raw), raw, error: '' };
  } catch {
    const project = newProject();
    return { workspace: { version: 1, activeId: project.id, projects: [project] }, raw,
      error: 'Saved storage could not be read. The original bytes have not been changed. This workspace is temporary; export your edits before leaving.' };
  }
  const project = newProject();
  return { workspace: { version: 1, activeId: project.id, projects: [project] }, raw, error: '' };
}

export function useWorkspace() {
  const [initial] = useState(initialState);
  const [workspace, setWorkspace] = useState(initial.workspace);
  const expected = useRef(initial.raw);
  const blocked = useRef(!!initial.error);
  const [error, setError] = useState(initial.error);
  const [savedAt, setSavedAt] = useState('');

  useEffect(() => {
    if (blocked.current) return;
    try {
      expected.current = persistWorkspace(localStorage, workspace, expected.current);
      setSavedAt(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
      setError('');
    } catch (e) {
      blocked.current = true;
      setError(`${e instanceof Error ? e.message : 'Local storage failed.'} Edits remain in memory. Export your workspace before reloading.`);
    }
  }, [workspace]);

  useEffect(() => {
    const changed = (event: StorageEvent) => {
      if ((event.key === STORAGE_KEY || event.key === null) && event.newValue !== expected.current) {
        blocked.current = true;
        setError('Another tab changed local storage. Saving is paused to avoid overwriting it. Export this workspace, then reload.');
      }
    };
    window.addEventListener('storage', changed);
    return () => window.removeEventListener('storage', changed);
  }, []);

  useEffect(() => {
    if (!error) return;
    const warn = (event: BeforeUnloadEvent) => { event.preventDefault(); event.returnValue = ''; };
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [error]);

  return { workspace, setWorkspace, error, savedAt, recoveryRaw: initial.error ? initial.raw : null };
}
