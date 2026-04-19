import { supabase } from "@/integrations/supabase/client";
import { ArtStyle, StyleMix } from './art-styles';

export interface StyleHistoryEntry {
  id: string;
  userId: string;
  createdAt: string;
  styleId?: string;
  isMix: boolean;
  primaryStyle?: string;
  secondaryStyle?: string;
  primaryIntensity?: number;
  secondaryIntensity?: number;
  useCount: number;
  lastUsedAt: string;
}

export async function getStyleHistory(limit = 10): Promise<StyleHistoryEntry[]> {
  const { data, error } = await supabase
    .from('style_history')
    .select('*')
    .order('last_used_at', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching style history:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    styleId: row.style_id || undefined,
    isMix: row.is_mix,
    primaryStyle: row.primary_style || undefined,
    secondaryStyle: row.secondary_style || undefined,
    primaryIntensity: row.primary_intensity || undefined,
    secondaryIntensity: row.secondary_intensity || undefined,
    useCount: row.use_count,
    lastUsedAt: row.last_used_at,
  }));
}

export async function getMostUsedStyles(limit = 5): Promise<StyleHistoryEntry[]> {
  const { data, error } = await supabase
    .from('style_history')
    .select('*')
    .order('use_count', { ascending: false })
    .limit(limit);

  if (error) {
    console.error('Error fetching most used styles:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    styleId: row.style_id || undefined,
    isMix: row.is_mix,
    primaryStyle: row.primary_style || undefined,
    secondaryStyle: row.secondary_style || undefined,
    primaryIntensity: row.primary_intensity || undefined,
    secondaryIntensity: row.secondary_intensity || undefined,
    useCount: row.use_count,
    lastUsedAt: row.last_used_at,
  }));
}

export async function recordStyleUsage(styleId: ArtStyle): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('style_history')
    .select('id, use_count')
    .eq('user_id', user.id)
    .eq('style_id', styleId)
    .eq('is_mix', false)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('style_history')
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('style_history')
      .insert({
        user_id: user.id,
        style_id: styleId,
        is_mix: false,
      });
  }
}

export async function recordMixUsage(mix: StyleMix): Promise<void> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return;

  const { data: existing } = await supabase
    .from('style_history')
    .select('id, use_count')
    .eq('user_id', user.id)
    .eq('is_mix', true)
    .eq('primary_style', mix.primaryStyle)
    .eq('secondary_style', mix.secondaryStyle)
    .eq('primary_intensity', mix.primaryIntensity)
    .eq('secondary_intensity', mix.secondaryIntensity)
    .maybeSingle();

  if (existing) {
    await supabase
      .from('style_history')
      .update({
        use_count: existing.use_count + 1,
        last_used_at: new Date().toISOString(),
      })
      .eq('id', existing.id);
  } else {
    await supabase
      .from('style_history')
      .insert({
        user_id: user.id,
        is_mix: true,
        primary_style: mix.primaryStyle,
        secondary_style: mix.secondaryStyle,
        primary_intensity: mix.primaryIntensity,
        secondary_intensity: mix.secondaryIntensity,
      });
  }
}

export async function clearStyleHistory(): Promise<boolean> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return false;

  const { error } = await supabase
    .from('style_history')
    .delete()
    .eq('user_id', user.id);

  return !error;
}
