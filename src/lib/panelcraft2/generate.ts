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

export async function generateBreakdown(input: GenerateInput): Promise<GeneratedIssue> {
  const { data, error } = await supabase.functions.invoke('panelcraft-generate', {
    body: input,
  });

  if (error) {
    throw new Error(error.message || 'Generation failed.');
  }
  if (!data || (data as any).error) {
    throw new Error((data as any)?.error || 'Generation failed.');
  }
  return data as GeneratedIssue;
}
