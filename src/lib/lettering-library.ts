import { supabase } from '@/integrations/supabase/client';
import type { PanelBubbleData } from '@/lib/comic-bubbles';

export interface LetteringPanel {
  index: number;
  x: number;
  y: number;
  w: number;
  h: number;
  speakers: { name: string; x: number; y: number }[];
}

export interface LetteringProjectRow {
  id: string;
  user_id: string;
  title: string;
  script_text: string;
  image_path: string | null;
  panels: LetteringPanel[];
  bubbles_by_panel: Record<string, PanelBubbleData[]>;
  speaker_map: Record<string, string | string[]>;
  created_at: string;
  updated_at: string;
}

export interface LetteringSummary {
  id: string;
  title: string;
  updated_at: string;
  image_path: string | null;
}

const BUCKET = 'lettering-pages';

function dataUrlToBlob(dataUrl: string): Blob {
  const [meta, b64] = dataUrl.split(',');
  const mime = /data:(.*?);base64/.exec(meta)?.[1] ?? 'image/png';
  const bin = atob(b64);
  const arr = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) arr[i] = bin.charCodeAt(i);
  return new Blob([arr], { type: mime });
}

export async function listLetteringProjects(userId: string): Promise<LetteringSummary[]> {
  const { data, error } = await supabase
    .from('lettering_projects')
    .select('id,title,updated_at,image_path')
    .eq('user_id', userId)
    .order('updated_at', { ascending: false });
  if (error) throw error;
  return data ?? [];
}

export async function loadLetteringProject(id: string): Promise<{
  row: LetteringProjectRow;
  imageUrl: string | null;
}> {
  const { data, error } = await supabase
    .from('lettering_projects')
    .select('*')
    .eq('id', id)
    .single();
  if (error) throw error;
  const row = data as unknown as LetteringProjectRow;
  let imageUrl: string | null = null;
  if (row.image_path) {
    const { data: signed } = await supabase.storage
      .from(BUCKET)
      .createSignedUrl(row.image_path, 60 * 60);
    imageUrl = signed?.signedUrl ?? null;
  }
  return { row, imageUrl };
}

export async function saveLetteringProject(params: {
  id?: string | null;
  userId: string;
  title: string;
  scriptText: string;
  panels: LetteringPanel[];
  bubblesByPanel: Record<string, PanelBubbleData[]>;
  speakerMap: Record<string, string>;
  /** Provide when uploading a new artwork; data: URL */
  newImageDataUrl?: string | null;
  /** Existing image path to keep (when not replacing). */
  existingImagePath?: string | null;
}): Promise<string> {
  let imagePath = params.existingImagePath ?? null;

  if (params.newImageDataUrl) {
    const blob = dataUrlToBlob(params.newImageDataUrl);
    const ext = (blob.type.split('/')[1] || 'png').replace('jpeg', 'jpg');
    const path = `${params.userId}/${Date.now()}-${Math.random().toString(36).slice(2, 8)}.${ext}`;
    const { error: upErr } = await supabase.storage.from(BUCKET).upload(path, blob, {
      contentType: blob.type,
      upsert: false,
    });
    if (upErr) throw upErr;
    // Best-effort cleanup of previous image
    if (imagePath && imagePath !== path) {
      await supabase.storage.from(BUCKET).remove([imagePath]).catch(() => {});
    }
    imagePath = path;
  }

  const payload = {
    user_id: params.userId,
    title: params.title || 'Untitled Lettering',
    script_text: params.scriptText,
    image_path: imagePath,
    panels: params.panels as any,
    bubbles_by_panel: params.bubblesByPanel as any,
    speaker_map: params.speakerMap as any,
  };

  if (params.id) {
    const { error } = await supabase
      .from('lettering_projects')
      .update(payload)
      .eq('id', params.id);
    if (error) throw error;
    return params.id;
  }
  const { data, error } = await supabase
    .from('lettering_projects')
    .insert(payload)
    .select('id')
    .single();
  if (error) throw error;
  return data.id;
}

export async function deleteLetteringProject(id: string, imagePath: string | null) {
  if (imagePath) {
    await supabase.storage.from(BUCKET).remove([imagePath]).catch(() => {});
  }
  const { error } = await supabase.from('lettering_projects').delete().eq('id', id);
  if (error) throw error;
}
