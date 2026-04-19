/**
 * Unified pacing and tier validation logic.
 * Single source of truth — replaces 3 divergent copies.
 */
import type { Scene } from './types';

/**
 * Returns the allowed beat tiers for a given episode/issue number.
 * Uses percentage-based thresholds:
 *   0–30%  → setup, escalation
 *   31–70% → escalation, midpoint
 *   71–80% → collapse
 *   81–100% → resolution
 */
export function getAllowedTiers(episodeNumber: number, totalEpisodes: number): string[] {
  const setupEnd = Math.ceil(totalEpisodes * 0.3);
  const escalationEnd = Math.ceil(totalEpisodes * 0.7);
  const collapseEnd = Math.ceil(totalEpisodes * 0.8);
  if (episodeNumber <= setupEnd) return ['setup', 'escalation'];
  if (episodeNumber <= escalationEnd) return ['escalation', 'midpoint'];
  if (episodeNumber <= collapseEnd) return ['collapse'];
  return ['resolution'];
}

/**
 * Check if a scene violates beat-tier placement rules.
 * Returns a human-readable description or null if valid.
 */
export function getSceneViolations(scene: Scene, totalEpisodes: number): string | null {
  if (!scene.episode || !scene.beatTier) return null;
  const allowed = getAllowedTiers(scene.episode, totalEpisodes);
  if (!allowed.includes(scene.beatTier)) {
    return `"${scene.beatTier}" beat in Episode ${scene.episode} — expected: ${allowed.join(' or ')}`;
  }
  return null;
}

/**
 * Returns the best allowed tier to reassign a misplaced beat to,
 * using a weight-distance approach for minimal narrative disruption.
 */
export function getClosestAllowedTier(currentTier: string, allowed: string[]): string {
  const tierWeight: Record<string, number> = { setup: 0, escalation: 1, midpoint: 2, collapse: 3, resolution: 4 };
  const currentWeight = tierWeight[currentTier] ?? 1;
  let best = allowed[0];
  let bestDist = Infinity;
  for (const t of allowed) {
    const dist = Math.abs((tierWeight[t] ?? 1) - currentWeight);
    if (dist < bestDist) { bestDist = dist; best = t; }
  }
  return best;
}

/**
 * Fix all beat-tier violations across a scene array.
 * Returns the corrected array and the count of fixes applied.
 */
export function fixAllViolations(scenes: Scene[], totalEpisodes: number): { fixed: Scene[]; count: number } {
  let count = 0;
  const fixed = scenes.map(s => {
    if (!s.episode || !s.beatTier) return s;
    const allowed = getAllowedTiers(s.episode, totalEpisodes);
    if (!allowed.includes(s.beatTier)) {
      count++;
      return { ...s, beatTier: getClosestAllowedTier(s.beatTier, allowed) as Scene['beatTier'] };
    }
    return s;
  });
  return { fixed, count };
}
