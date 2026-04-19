import { supabase } from "@/integrations/supabase/client";
import { ArtStyle, StyleMix } from './art-styles';

export interface StyleFavorite {
  id: string;
  userId: string;
  createdAt: string;
  styleId?: string;
  isMix: boolean;
  primaryStyle?: string;
  secondaryStyle?: string;
  primaryIntensity?: number;
  secondaryIntensity?: number;
  customName?: string;
}

export async function getFavorites(): Promise<StyleFavorite[]> {
  const { data, error } = await supabase
    .from('style_favorites')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching favorites:', error);
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
    customName: row.custom_name || undefined,
  }));
}

export async function addStyleFavorite(
  styleId: ArtStyle,
  customName?: string
): Promise<StyleFavorite | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('style_favorites')
    .insert({
      user_id: user.id,
      style_id: styleId,
      is_mix: false,
      custom_name: customName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding favorite:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    styleId: data.style_id || undefined,
    isMix: data.is_mix,
    customName: data.custom_name || undefined,
  };
}

export async function addMixFavorite(
  mix: StyleMix,
  customName?: string
): Promise<StyleFavorite | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('style_favorites')
    .insert({
      user_id: user.id,
      is_mix: true,
      primary_style: mix.primaryStyle,
      secondary_style: mix.secondaryStyle,
      primary_intensity: mix.primaryIntensity,
      secondary_intensity: mix.secondaryIntensity,
      custom_name: customName,
    })
    .select()
    .single();

  if (error) {
    console.error('Error adding mix favorite:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    isMix: data.is_mix,
    primaryStyle: data.primary_style || undefined,
    secondaryStyle: data.secondary_style || undefined,
    primaryIntensity: data.primary_intensity || undefined,
    secondaryIntensity: data.secondary_intensity || undefined,
    customName: data.custom_name || undefined,
  };
}

export async function removeFavorite(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('style_favorites')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error removing favorite:', error);
    return false;
  }

  return true;
}

export function isFavorited(
  favorites: StyleFavorite[],
  styleId: ArtStyle
): StyleFavorite | undefined {
  return favorites.find(f => !f.isMix && f.styleId === styleId);
}

export function isMixFavorited(
  favorites: StyleFavorite[],
  mix: StyleMix
): StyleFavorite | undefined {
  return favorites.find(
    f =>
      f.isMix &&
      f.primaryStyle === mix.primaryStyle &&
      f.secondaryStyle === mix.secondaryStyle &&
      f.primaryIntensity === mix.primaryIntensity &&
      f.secondaryIntensity === mix.secondaryIntensity
  );
}
