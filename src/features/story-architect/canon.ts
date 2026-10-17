import type { Project, WorldEntry } from './model';

const CANON_FIELDS = ['name', 'kind', 'description', 'rule', 'cost', 'exception'] as const;

/** Author approval applies to specific content, not permanently to an entry ID.
 * Editing approved lore requires a new approval. Status-only author decisions
 * are preserved, and neither the previous project nor the proposed edit is mutated.
 */
export function reconcileCanonApproval(previous: Project, proposed: Project): Project {
  const prior = new Map(previous.worlds.map(world => [world.id, world]));
  const worlds: WorldEntry[] = proposed.worlds.map(world => {
    const before = prior.get(world.id);
    const changed = before && CANON_FIELDS.some(key => before[key] !== world[key]);
    return before?.status === 'approved' && changed ? { ...world, status: 'draft' } : world;
  });
  return { ...proposed, worlds };
}
