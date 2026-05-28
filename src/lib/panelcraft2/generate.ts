import { supabase } from '@/integrations/supabase/client';
import type { Page, Panel, PanelcraftIssue, PanelTransition, ShotType } from '@/lib/panelcraft/types';
import { uid } from '@/lib/panelcraft/constants';


export interface GenerateInput {
  title: string;
  theme: string;
  treatment: string;
  targetPages: 'auto' | '22' | '32';
}

export interface GeneratedIssue extends PanelcraftIssue {
  treatment: string;
}

export class GenerateError extends Error {
  code: 'credits_exhausted' | 'rate_limited' | 'invalid_model_json' | 'unknown';
  snippet?: string;
  constructor(message: string, code: GenerateError['code'] = 'unknown', snippet?: string) {
    super(message);
    this.code = code;
    this.snippet = snippet;
  }
}



async function attemptGenerate(input: GenerateInput): Promise<GeneratedIssue> {
  const { data, error } = await supabase.functions.invoke('panelcraft-generate', {
    body: input,
  });

  if (error) {
    const ctx: any = (error as any).context;
    let status: number | undefined;
    let bodyMsg: string | undefined;
    try {
      if (ctx?.response) {
        status = ctx.response.status;
        const txt = await ctx.response.clone().text();
        try {
          const j = JSON.parse(txt);
          bodyMsg = j.error || j.message;
        } catch {
          bodyMsg = txt;
        }
      }
    } catch {
      // ignore
    }
    if (status === 402) {
      throw new GenerateError(
        'AI credits are exhausted for this workspace. Add funds in Lovable Cloud workspace settings, then try again.',
        'credits_exhausted',
      );
    }
    if (status === 429) {
      throw new GenerateError(
        'Rate limit reached. Please wait a moment and try again.',
        'rate_limited',
      );
    }
    throw new GenerateError(bodyMsg || error.message || 'Generation failed.');
  }
  if (!data || (data as any).error) {
    const raw = (data as any)?.code;
    const code: GenerateError['code'] =
      raw === 'credits_exhausted' || raw === 'rate_limited' || raw === 'invalid_model_json'
        ? raw
        : 'unknown';
    throw new GenerateError((data as any)?.error || 'Generation failed.', code, (data as any)?.snippet);
  }

  return data as GeneratedIssue;
}

export async function generateBreakdown(input: GenerateInput): Promise<GeneratedIssue> {
  const MAX_ATTEMPTS = 2;
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await attemptGenerate(input);
    } catch (err) {
      lastErr = err;
      if (err instanceof GenerateError && err.code === 'invalid_model_json' && attempt < MAX_ATTEMPTS) {
        await new Promise((r) => setTimeout(r, 400));
        continue;
      }
      throw err;
    }
  }
  throw lastErr;
}

