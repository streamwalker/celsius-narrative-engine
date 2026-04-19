import { supabase } from "@/integrations/supabase/client";
import { ArtStyle, ArtStyleConfig, getStyleById } from './art-styles';

export interface CustomStyle {
  id: string;
  userId: string;
  createdAt: string;
  updatedAt: string;
  name: string;
  description?: string;
  promptModifier: string;
  previewEmoji: string;
  baseStyle?: ArtStyle;
}

export async function getCustomStyles(): Promise<CustomStyle[]> {
  const { data, error } = await supabase
    .from('custom_styles')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Error fetching custom styles:', error);
    return [];
  }

  return (data || []).map((row: any) => ({
    id: row.id,
    userId: row.user_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    name: row.name,
    description: row.description || undefined,
    promptModifier: row.prompt_modifier,
    previewEmoji: row.preview_emoji || '🎨',
    baseStyle: row.base_style as ArtStyle | undefined,
  }));
}

export async function createCustomStyle(
  name: string,
  promptModifier: string,
  description?: string,
  previewEmoji = '🎨',
  baseStyle?: ArtStyle
): Promise<CustomStyle | null> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;

  const { data, error } = await supabase
    .from('custom_styles')
    .insert({
      user_id: user.id,
      name,
      description,
      prompt_modifier: promptModifier,
      preview_emoji: previewEmoji,
      base_style: baseStyle,
    })
    .select()
    .single();

  if (error) {
    console.error('Error creating custom style:', error);
    return null;
  }

  return {
    id: data.id,
    userId: data.user_id,
    createdAt: data.created_at,
    updatedAt: data.updated_at,
    name: data.name,
    description: data.description || undefined,
    promptModifier: data.prompt_modifier,
    previewEmoji: data.preview_emoji || '🎨',
    baseStyle: data.base_style as ArtStyle | undefined,
  };
}

export async function updateCustomStyle(
  id: string,
  updates: Partial<Pick<CustomStyle, 'name' | 'description' | 'promptModifier' | 'previewEmoji' | 'baseStyle'>>
): Promise<boolean> {
  const { error } = await supabase
    .from('custom_styles')
    .update({
      name: updates.name,
      description: updates.description,
      prompt_modifier: updates.promptModifier,
      preview_emoji: updates.previewEmoji,
      base_style: updates.baseStyle,
    })
    .eq('id', id);

  if (error) {
    console.error('Error updating custom style:', error);
    return false;
  }

  return true;
}

export async function deleteCustomStyle(id: string): Promise<boolean> {
  const { error } = await supabase
    .from('custom_styles')
    .delete()
    .eq('id', id);

  if (error) {
    console.error('Error deleting custom style:', error);
    return false;
  }

  return true;
}

// Convert custom style to ArtStyleConfig for compatibility
export function customStyleToConfig(custom: CustomStyle): ArtStyleConfig {
  let fullPrompt = custom.promptModifier;

  if (custom.baseStyle) {
    const base = getStyleById(custom.baseStyle);
    fullPrompt = `${base.promptModifier}, ${custom.promptModifier}`;
  }

  return {
    id: `custom-${custom.id}` as ArtStyle,
    name: custom.name,
    description: custom.description || 'Custom style',
    promptModifier: fullPrompt,
    preview: custom.previewEmoji,
    category: 'general',
  };
}

// Export/Import types
export interface ExportedCustomStyle {
  name: string;
  description?: string;
  promptModifier: string;
  previewEmoji: string;
  baseStyle?: ArtStyle;
  exportedAt: string;
  version: number;
}

export interface StyleExportPackage {
  version: number;
  exportedAt: string;
  styles: ExportedCustomStyle[];
}

const EXPORT_VERSION = 1;

export function exportCustomStyles(styles: CustomStyle[]): StyleExportPackage {
  return {
    version: EXPORT_VERSION,
    exportedAt: new Date().toISOString(),
    styles: styles.map(style => ({
      name: style.name,
      description: style.description,
      promptModifier: style.promptModifier,
      previewEmoji: style.previewEmoji,
      baseStyle: style.baseStyle,
      exportedAt: new Date().toISOString(),
      version: EXPORT_VERSION,
    })),
  };
}

export function downloadStyleExport(styles: CustomStyle[], filename = 'custom-styles.json') {
  const exportData = exportCustomStyles(styles);
  const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);

  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export function validateStyleImport(data: unknown): StyleExportPackage | null {
  if (!data || typeof data !== 'object') return null;

  const pkg = data as StyleExportPackage;

  if (typeof pkg.version !== 'number' || !Array.isArray(pkg.styles)) {
    return null;
  }

  for (const style of pkg.styles) {
    if (
      typeof style.name !== 'string' ||
      typeof style.promptModifier !== 'string' ||
      style.name.length < 2 ||
      style.promptModifier.length < 5
    ) {
      return null;
    }
  }

  return pkg;
}

export async function importCustomStyles(
  pkg: StyleExportPackage,
  existingStyles: CustomStyle[],
  conflictResolution: 'skip' | 'replace' | 'rename' = 'rename'
): Promise<{ imported: number; skipped: number; errors: number }> {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return { imported: 0, skipped: 0, errors: 0 };

  let imported = 0;
  let skipped = 0;
  let errors = 0;

  for (const style of pkg.styles) {
    const existingStyle = existingStyles.find(s => s.name === style.name);

    if (existingStyle) {
      switch (conflictResolution) {
        case 'skip':
          skipped++;
          continue;
        case 'replace': {
          const updated = await updateCustomStyle(existingStyle.id, {
            description: style.description,
            promptModifier: style.promptModifier,
            previewEmoji: style.previewEmoji || '🎨',
            baseStyle: style.baseStyle,
          });
          if (updated) {
            imported++;
          } else {
            errors++;
          }
          continue;
        }
        case 'rename': {
          let newName = style.name;
          let counter = 1;
          while (existingStyles.some(s => s.name === newName)) {
            newName = `${style.name} (${counter})`;
            counter++;
          }
          style.name = newName;
          break;
        }
      }
    }

    const created = await createCustomStyle(
      style.name,
      style.promptModifier,
      style.description,
      style.previewEmoji || '🎨',
      style.baseStyle
    );

    if (created) {
      imported++;
      existingStyles.push(created);
    } else {
      errors++;
    }
  }

  return { imported, skipped, errors };
}

export function readFileAsJson(file: File): Promise<unknown> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result as string);
        resolve(data);
      } catch {
        reject(new Error('Invalid JSON file'));
      }
    };
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
}
