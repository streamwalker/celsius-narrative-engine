// Minimal Database types. Regenerate with `supabase gen types typescript` once
// the project is linked. The types below cover the tables required for the
// Phase-1 rebuild; additional tables from migrations will be added as each
// feature slice is ported.

export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      script_drafts: {
        Row: {
          id: string;
          user_id: string;
          title: string;
          version_label: string;
          content: string;
          format: string;
          formatted_result: string | null;
          updated_at: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          title?: string;
          version_label?: string;
          content?: string;
          format?: string;
          formatted_result?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          title?: string;
          version_label?: string;
          content?: string;
          format?: string;
          formatted_result?: string | null;
          updated_at?: string;
          created_at?: string;
        };
        Relationships: [];
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
    CompositeTypes: Record<string, never>;
  };
}
