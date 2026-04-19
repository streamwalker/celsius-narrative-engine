/**
 * API client layer for Narrative Engine backend functions.
 * Uses the Supabase client to invoke edge functions.
 */
import { supabase } from '@/integrations/supabase/client';
import type { Scene, ImplementFixesResult } from './types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL as string;
const SUPABASE_KEY = import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY as string;

async function authHeaders(): Promise<Record<string, string>> {
  const { data: { session } } = await supabase.auth.getSession();
  return {
    'Content-Type': 'application/json',
    Authorization: `Bearer ${session?.access_token ?? SUPABASE_KEY}`,
    apikey: SUPABASE_KEY,
  };
}

async function handleErrorResponse(resp: Response): Promise<never> {
  const err = await resp.json().catch(() => ({ error: 'Request failed' }));
  throw new Error(err.error || `Request failed (${resp.status})`);
}

/**
 * Stream AI story analysis. Yields content chunks as they arrive.
 */
export async function* streamAnalysis(
  storyData: Record<string, string>,
  scenes?: Scene[],
  previousAnalysis?: string,
  signal?: AbortSignal,
): AsyncGenerator<string> {
  const headers = await authHeaders();
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/analyze-story`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      storyData,
      scenes: scenes && scenes.length > 0 ? scenes : undefined,
      previousAnalysis: previousAnalysis || undefined,
    }),
    signal,
  });

  if (!resp.ok) await handleErrorResponse(resp);

  const reader = resp.body?.getReader();
  if (!reader) throw new Error('No stream');

  const decoder = new TextDecoder();
  let buf = '';

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    buf += decoder.decode(value, { stream: true });

    let idx: number;
    while ((idx = buf.indexOf('\n')) !== -1) {
      let line = buf.slice(0, idx);
      buf = buf.slice(idx + 1);
      if (line.endsWith('\r')) line = line.slice(0, -1);
      if (!line.startsWith('data: ')) continue;
      const json = line.slice(6).trim();
      if (json === '[DONE]') return;
      try {
        const parsed = JSON.parse(json);
        const content = parsed.choices?.[0]?.delta?.content;
        if (content) yield content;
      } catch { /* partial JSON — skip */ }
    }
  }
}

/**
 * Implement fixes (bulk or individual) via the AI.
 */
export async function implementFixes(
  scenes: Scene[],
  analysis: string,
  storyData: Record<string, string>,
  signal?: AbortSignal,
): Promise<ImplementFixesResult> {
  const headers = await authHeaders();
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/implement-fixes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({ scenes, analysis, storyData }),
    signal,
  });

  if (!resp.ok) await handleErrorResponse(resp);

  const result = await resp.json();
  if (result.correctedScenes && Array.isArray(result.correctedScenes)) {
    return {
      correctedScenes: result.correctedScenes,
      changesSummary: result.changesSummary || 'AI-generated fixes',
    };
  }
  throw new Error('Invalid response from AI');
}

/**
 * Generate scenes for a specific episode/issue or the entire story.
 */
export async function generateScenes(
  storyData: Record<string, string>,
  medium: string,
  mediumConfig: Record<string, string>,
  episodeNumber?: number,
  totalEpisodes?: number,
): Promise<Scene[]> {
  const headers = await authHeaders();
  const resp = await fetch(`${SUPABASE_URL}/functions/v1/generate-scenes`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      storyData,
      medium,
      mediumConfig: {
        ...mediumConfig,
        length: mediumConfig?._film_length || mediumConfig?._tv_ep_length || mediumConfig?._tv_series_ep_length,
        episodes: mediumConfig?._tv_series_episodes,
        pages: mediumConfig?._comic_pages,
        issues: mediumConfig?._comic_issues,
        acts: mediumConfig?._stage_acts,
        runtime: mediumConfig?._stage_runtime,
      },
      ...(episodeNumber != null && { episodeNumber, totalEpisodes }),
    }),
  });

  if (!resp.ok) await handleErrorResponse(resp);

  const result = await resp.json();
  const newScenes = result.scenes || result;
  return Array.isArray(newScenes) ? newScenes : [];
}
