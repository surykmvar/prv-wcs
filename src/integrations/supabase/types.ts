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
    PostgrestVersion: "12.2.3 (519615d)"
  }
  public: {
    Tables: {
      profiles: {
        Row: {
          auth_method: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_method?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_method?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      saved_thoughts: {
        Row: {
          created_at: string | null
          id: string
          thought_id: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          thought_id?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          thought_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "saved_thoughts_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
      thoughts: {
        Row: {
          city: string | null
          country_code: string | null
          created_at: string
          description: string | null
          expires_at: string
          final_status: string | null
          id: string
          max_woices_allowed: number | null
          status: string
          tags: string[] | null
          thought_scope: string
          title: string
          user_id: string | null
        }
        Insert: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          final_status?: string | null
          id?: string
          max_woices_allowed?: number | null
          status?: string
          tags?: string[] | null
          thought_scope?: string
          title: string
          user_id?: string | null
        }
        Update: {
          city?: string | null
          country_code?: string | null
          created_at?: string
          description?: string | null
          expires_at?: string
          final_status?: string | null
          id?: string
          max_woices_allowed?: number | null
          status?: string
          tags?: string[] | null
          thought_scope?: string
          title?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_votes: {
        Row: {
          created_at: string | null
          id: string
          user_id: string | null
          user_session: string
          voice_response_id: string | null
          vote_type: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          user_session: string
          voice_response_id?: string | null
          vote_type: string
        }
        Update: {
          created_at?: string | null
          id?: string
          user_id?: string | null
          user_session?: string
          voice_response_id?: string | null
          vote_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_votes_voice_response_id_fkey"
            columns: ["voice_response_id"]
            isOneToOne: false
            referencedRelation: "voice_responses"
            referencedColumns: ["id"]
          },
        ]
      }
      voice_responses: {
        Row: {
          audio_url: string
          classification: string | null
          created_at: string
          duration: number
          fact_votes: number | null
          id: string
          myth_votes: number | null
          thought_id: string
          transcript: string | null
          unclear_votes: number | null
          user_id: string | null
          user_session: string
        }
        Insert: {
          audio_url: string
          classification?: string | null
          created_at?: string
          duration: number
          fact_votes?: number | null
          id?: string
          myth_votes?: number | null
          thought_id: string
          transcript?: string | null
          unclear_votes?: number | null
          user_id?: string | null
          user_session: string
        }
        Update: {
          audio_url?: string
          classification?: string | null
          created_at?: string
          duration?: number
          fact_votes?: number | null
          id?: string
          myth_votes?: number | null
          thought_id?: string
          transcript?: string | null
          unclear_votes?: number | null
          user_id?: string | null
          user_session?: string
        }
        Relationships: [
          {
            foreignKeyName: "voice_responses_thought_id_fkey"
            columns: ["thought_id"]
            isOneToOne: false
            referencedRelation: "thoughts"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      evaluate_thought_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_profile_display_info: {
        Args: { user_ids: string[] }
        Returns: {
          display_name: string
          first_name: string
          last_name: string
          user_id: string
        }[]
      }
      get_user_saved_thoughts: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          description: string
          expires_at: string
          id: string
          saved_at: string
          status: string
          tags: string[]
          title: string
        }[]
      }
      get_user_thoughts: {
        Args: { user_uuid: string }
        Returns: {
          created_at: string
          description: string
          expires_at: string
          final_status: string
          id: string
          max_woices_allowed: number
          status: string
          tags: string[]
          title: string
          voice_response_count: number
        }[]
      }
      get_user_voice_responses: {
        Args: { user_uuid: string }
        Returns: {
          audio_url: string
          classification: string
          created_at: string
          duration: number
          fact_votes: number
          id: string
          myth_votes: number
          thought_id: string
          thought_title: string
          transcript: string
          unclear_votes: number
        }[]
      }
      update_expired_thoughts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
    }
    Enums: {
      [_ in never]: never
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
    Enums: {},
  },
} as const
