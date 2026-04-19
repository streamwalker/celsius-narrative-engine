export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      comic_pages: {
        Row: {
          created_at: string
          id: string
          opening_narration: string | null
          page_number: number
          project_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          opening_narration?: string | null
          page_number: number
          project_id: string
        }
        Update: {
          created_at?: string
          id?: string
          opening_narration?: string | null
          page_number?: number
          project_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comic_pages_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "comic_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      comic_panels: {
        Row: {
          created_at: string
          description: string
          dialogue: string | null
          id: string
          image_data: string | null
          is_black_and_white: boolean | null
          narration: string | null
          page_id: string
          panel_number: number
          prompt_used: string | null
        }
        Insert: {
          created_at?: string
          description: string
          dialogue?: string | null
          id?: string
          image_data?: string | null
          is_black_and_white?: boolean | null
          narration?: string | null
          page_id: string
          panel_number: number
          prompt_used?: string | null
        }
        Update: {
          created_at?: string
          description?: string
          dialogue?: string | null
          id?: string
          image_data?: string | null
          is_black_and_white?: boolean | null
          narration?: string | null
          page_id?: string
          panel_number?: number
          prompt_used?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "comic_panels_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "comic_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      comic_projects: {
        Row: {
          art_style: string
          created_at: string
          id: string
          script_text: string
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          art_style?: string
          created_at?: string
          id?: string
          script_text: string
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          art_style?: string
          created_at?: string
          id?: string
          script_text?: string
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      custom_styles: {
        Row: {
          base_style: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          preview_emoji: string | null
          prompt_modifier: string
          updated_at: string
          user_id: string
        }
        Insert: {
          base_style?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          preview_emoji?: string | null
          prompt_modifier: string
          updated_at?: string
          user_id: string
        }
        Update: {
          base_style?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          preview_emoji?: string | null
          prompt_modifier?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      generation_queue: {
        Row: {
          art_style: string
          character_context: string | null
          completed_at: string | null
          completed_panels: number
          consistency_config: Json | null
          created_at: string
          error_message: string | null
          id: string
          labeled_images: Json | null
          notification_email: string | null
          priority: number
          project_id: string | null
          reference_images: Json | null
          result: Json | null
          script_text: string
          started_at: string | null
          status: string
          total_panels: number
          user_id: string
        }
        Insert: {
          art_style: string
          character_context?: string | null
          completed_at?: string | null
          completed_panels?: number
          consistency_config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          labeled_images?: Json | null
          notification_email?: string | null
          priority?: number
          project_id?: string | null
          reference_images?: Json | null
          result?: Json | null
          script_text: string
          started_at?: string | null
          status?: string
          total_panels?: number
          user_id: string
        }
        Update: {
          art_style?: string
          character_context?: string | null
          completed_at?: string | null
          completed_panels?: number
          consistency_config?: Json | null
          created_at?: string
          error_message?: string | null
          id?: string
          labeled_images?: Json | null
          notification_email?: string | null
          priority?: number
          project_id?: string | null
          reference_images?: Json | null
          result?: Json | null
          script_text?: string
          started_at?: string | null
          status?: string
          total_panels?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generation_queue_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "comic_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_collaborators: {
        Row: {
          accepted_at: string | null
          created_at: string | null
          id: string
          invited_at: string | null
          invited_by: string | null
          invited_email: string | null
          project_id: string
          role: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Insert: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          project_id: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id: string
        }
        Update: {
          accepted_at?: string | null
          created_at?: string | null
          id?: string
          invited_at?: string | null
          invited_by?: string | null
          invited_email?: string | null
          project_id?: string
          role?: Database["public"]["Enums"]["project_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_collaborators_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "comic_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_comments: {
        Row: {
          content: string
          created_at: string | null
          id: string
          is_resolved: boolean | null
          panel_id: string | null
          parent_id: string | null
          position_x: number | null
          position_y: number | null
          project_id: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          content: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          panel_id?: string | null
          parent_id?: string | null
          position_x?: number | null
          position_y?: number | null
          project_id: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          content?: string
          created_at?: string | null
          id?: string
          is_resolved?: boolean | null
          panel_id?: string | null
          parent_id?: string | null
          position_x?: number | null
          position_y?: number | null
          project_id?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "project_comments_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "project_comments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "project_comments_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "comic_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      project_versions: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_auto_save: boolean | null
          project_id: string
          snapshot: Json
          version_name: string | null
          version_number: number
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_auto_save?: boolean | null
          project_id: string
          snapshot: Json
          version_name?: string | null
          version_number: number
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_auto_save?: boolean | null
          project_id?: string
          snapshot?: Json
          version_name?: string | null
          version_number?: number
        }
        Relationships: [
          {
            foreignKeyName: "project_versions_project_id_fkey"
            columns: ["project_id"]
            isOneToOne: false
            referencedRelation: "comic_projects"
            referencedColumns: ["id"]
          },
        ]
      }
      script_drafts: {
        Row: {
          content: string
          created_at: string
          format: string
          formatted_result: string | null
          id: string
          title: string
          updated_at: string
          user_id: string
          version_label: string
        }
        Insert: {
          content?: string
          created_at?: string
          format?: string
          formatted_result?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id: string
          version_label?: string
        }
        Update: {
          content?: string
          created_at?: string
          format?: string
          formatted_result?: string | null
          id?: string
          title?: string
          updated_at?: string
          user_id?: string
          version_label?: string
        }
        Relationships: []
      }
      story_projects: {
        Row: {
          created_at: string
          id: string
          story_data: Json
          title: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          story_data?: Json
          title?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          story_data?: Json
          title?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      style_favorites: {
        Row: {
          created_at: string
          custom_name: string | null
          id: string
          is_mix: boolean
          primary_intensity: number | null
          primary_style: string | null
          secondary_intensity: number | null
          secondary_style: string | null
          style_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          custom_name?: string | null
          id?: string
          is_mix?: boolean
          primary_intensity?: number | null
          primary_style?: string | null
          secondary_intensity?: number | null
          secondary_style?: string | null
          style_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          custom_name?: string | null
          id?: string
          is_mix?: boolean
          primary_intensity?: number | null
          primary_style?: string | null
          secondary_intensity?: number | null
          secondary_style?: string | null
          style_id?: string | null
          user_id?: string
        }
        Relationships: []
      }
      style_history: {
        Row: {
          created_at: string
          id: string
          is_mix: boolean
          last_used_at: string
          primary_intensity: number | null
          primary_style: string | null
          secondary_intensity: number | null
          secondary_style: string | null
          style_id: string | null
          use_count: number
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_mix?: boolean
          last_used_at?: string
          primary_intensity?: number | null
          primary_style?: string | null
          secondary_intensity?: number | null
          secondary_style?: string | null
          style_id?: string | null
          use_count?: number
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_mix?: boolean
          last_used_at?: string
          primary_intensity?: number | null
          primary_style?: string | null
          secondary_intensity?: number | null
          secondary_style?: string | null
          style_id?: string | null
          use_count?: number
          user_id?: string
        }
        Relationships: []
      }
      user_preferences: {
        Row: {
          created_at: string
          email_notifications: boolean | null
          id: string
          notification_email: string | null
          notify_on_complete: boolean | null
          notify_on_failure: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_email?: string | null
          notify_on_complete?: boolean | null
          notify_on_failure?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email_notifications?: boolean | null
          id?: string
          notification_email?: string | null
          notify_on_complete?: boolean | null
          notify_on_failure?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_project_access: {
        Args: { _project_id: string; _user_id: string }
        Returns: boolean
      }
      has_project_role: {
        Args: {
          _min_role: Database["public"]["Enums"]["project_role"]
          _project_id: string
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      project_role: "owner" | "editor" | "viewer" | "commenter"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      project_role: ["owner", "editor", "viewer", "commenter"],
    },
  },
} as const
