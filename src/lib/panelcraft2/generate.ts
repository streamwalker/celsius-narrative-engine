import { supabase } from '@/integrations/supabase/client';
import type { PanelcraftIssue } from '@/lib/panelcraft/types';

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
  constructor(message: string, code: GenerateError['code'] = 'unknown') {
    super(message);
    this.code = code;
  }
}


export async function generateBreakdown(input: GenerateInput): Promise<GeneratedIssue> {
  const { data, error } = await supabase.functions.invoke('panelcraft-generate', {
    body: input,
  });

  if (error) {
    // Try to read the underlying response body for a meaningful status + message
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
    const code = (data as any)?.code === 'credits_exhausted' ? 'credits_exhausted' : 'unknown';
    throw new GenerateError((data as any)?.error || 'Generation failed.', code);
  }
  return data as GeneratedIssue;
}
