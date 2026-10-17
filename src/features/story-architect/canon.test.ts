import { describe, expect, it } from 'vitest';
import { reconcileCanonApproval } from './canon';
import { makeProject, makeWorld, type Project } from './model';

function approvedProject(): Project {
  const project = makeProject('Approval test');
  project.worlds = [{ ...makeWorld(), name: 'Memory gate', rule: 'Every crossing costs a memory.', status: 'approved' }];
  return project;
}
describe('Author-controlled canon approval', () => {
  it('returns an edited approved rule to draft without mutating either input', () => {
    const previous = approvedProject();
    const proposed = { ...previous, worlds: [{ ...previous.worlds[0], rule: 'Every crossing costs two memories.' }] };
    const next = reconcileCanonApproval(previous, proposed);
    expect(next.worlds[0].status).toBe('draft');
    expect(next.worlds[0].rule).toBe(proposed.worlds[0].rule);
    expect(previous.worlds[0].status).toBe('approved');
    expect(proposed.worlds[0].status).toBe('approved');
  });
  it('invalidates approval for every editable canon content field', () => {
    const previous = approvedProject();
    for (const field of ['name', 'description', 'rule', 'cost', 'exception'] as const) {
      const proposed = { ...previous, worlds: [{ ...previous.worlds[0], [field]: 'Changed' }] };
      expect(reconcileCanonApproval(previous, proposed).worlds[0].status).toBe('draft');
    }
    const proposed = { ...previous, worlds: [{ ...previous.worlds[0], kind: 'Science / magic' as const }] };
    expect(reconcileCanonApproval(previous, proposed).worlds[0].status).toBe('draft');
  });
  it('preserves unchanged approved content', () => {
    const project = approvedProject();
    expect(reconcileCanonApproval(project, project).worlds[0].status).toBe('approved');
  });
  it('preserves an explicit draft-to-approved author decision', () => {
    const previous = approvedProject(); previous.worlds[0].status = 'draft';
    const proposed = { ...previous, worlds: [{ ...previous.worlds[0], status: 'approved' as const }] };
    expect(reconcileCanonApproval(previous, proposed).worlds[0].status).toBe('approved');
  });
  it('preserves an explicit return to draft', () => {
    const previous = approvedProject();
    const proposed = { ...previous, worlds: [{ ...previous.worlds[0], status: 'draft' as const }] };
    expect(reconcileCanonApproval(previous, proposed).worlds[0].status).toBe('draft');
  });
  it('leaves newly added world entries intact', () => {
    const previous = makeProject(); const world = makeWorld();
    expect(reconcileCanonApproval(previous, { ...previous, worlds: [world] }).worlds).toEqual([world]);
  });
  it('does not resurrect a removed world entry', () => {
    const previous = approvedProject();
    expect(reconcileCanonApproval(previous, { ...previous, worlds: [] }).worlds).toEqual([]);
  });
  it('does not invalidate canon when only the story title changes', () => {
    const previous = approvedProject();
    expect(reconcileCanonApproval(previous, { ...previous, title: 'New title' }).worlds[0].status).toBe('approved');
  });
});
