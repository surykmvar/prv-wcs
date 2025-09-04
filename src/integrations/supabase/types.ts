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
      app_settings: {
        Row: {
          description: string | null
          id: string
          key: string
          updated_at: string | null
          value: Json
        }
        Insert: {
          description?: string | null
          id?: string
          key: string
          updated_at?: string | null
          value: Json
        }
        Update: {
          description?: string | null
          id?: string
          key?: string
          updated_at?: string | null
          value?: Json
        }
        Relationships: []
      }
      credit_packages: {
        Row: {
          created_at: string
          currency: string
          id: string
          is_active: boolean | null
          is_popular: boolean | null
          name: string
          points: number
          price_cents: number
          region: string
          seasonal_offer_expires_at: string | null
          seasonal_offer_percentage: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name: string
          points: number
          price_cents: number
          region: string
          seasonal_offer_expires_at?: string | null
          seasonal_offer_percentage?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          id?: string
          is_active?: boolean | null
          is_popular?: boolean | null
          name?: string
          points?: number
          price_cents?: number
          region?: string
          seasonal_offer_expires_at?: string | null
          seasonal_offer_percentage?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      credits_ledger: {
        Row: {
          amount: number
          created_at: string | null
          description: string | null
          id: string
          reference_id: string | null
          transaction_type: string
          user_id: string | null
        }
        Insert: {
          amount: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          created_at?: string | null
          description?: string | null
          id?: string
          reference_id?: string | null
          transaction_type?: string
          user_id?: string | null
        }
        Relationships: []
      }
      membership_plans: {
        Row: {
          created_at: string
          currency: string
          description: string | null
          features: string[] | null
          id: string
          interval_type: string
          is_active: boolean | null
          name: string
          price_cents: number
          stripe_price_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          currency?: string
          description?: string | null
          features?: string[] | null
          id?: string
          interval_type?: string
          is_active?: boolean | null
          name?: string
          price_cents?: number
          stripe_price_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      orders: {
        Row: {
          amount_cents: number
          created_at: string | null
          currency: string
          id: string
          points_purchased: number
          region: string | null
          status: string | null
          stripe_session_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          amount_cents: number
          created_at?: string | null
          currency: string
          id?: string
          points_purchased: number
          region?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          amount_cents?: number
          created_at?: string | null
          currency?: string
          id?: string
          points_purchased?: number
          region?: string | null
          status?: string | null
          stripe_session_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auth_method: string | null
          avatar_url: string | null
          bio: string | null
          created_at: string
          display_name: string | null
          first_name: string | null
          id: string
          last_name: string | null
          phone: string | null
          show_email: boolean | null
          updated_at: string
          user_id: string
        }
        Insert: {
          auth_method?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          show_email?: boolean | null
          updated_at?: string
          user_id: string
        }
        Update: {
          auth_method?: string | null
          avatar_url?: string | null
          bio?: string | null
          created_at?: string
          display_name?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          phone?: string | null
          show_email?: boolean | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          assigned_to: string | null
          code: string
          created_at: string
          created_by: string | null
          current_uses: number | null
          discount_type: string | null
          discount_value: number | null
          expires_at: string | null
          id: string
          is_active: boolean | null
          max_uses: number | null
          points_reward: number | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          code: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          points_reward?: number | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          code?: string
          created_at?: string
          created_by?: string | null
          current_uses?: number | null
          discount_type?: string | null
          discount_value?: number | null
          expires_at?: string | null
          id?: string
          is_active?: boolean | null
          max_uses?: number | null
          points_reward?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      regional_pricing: {
        Row: {
          created_at: string | null
          currency: string
          id: string
          price_per_point: number
          region: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          currency: string
          id?: string
          price_per_point: number
          region: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          currency?: string
          id?: string
          price_per_point?: number
          region?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      sales_inquiries: {
        Row: {
          address: string | null
          company_name: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          status: string | null
          user_id: string | null
        }
        Insert: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          status?: string | null
          user_id?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          status?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      sales_inquiry_audit_log: {
        Row: {
          action: string
          admin_user_id: string
          created_at: string | null
          details: Json | null
          id: string
          inquiry_id: string | null
        }
        Insert: {
          action: string
          admin_user_id: string
          created_at?: string | null
          details?: Json | null
          id?: string
          inquiry_id?: string | null
        }
        Update: {
          action?: string
          admin_user_id?: string
          created_at?: string | null
          details?: Json | null
          id?: string
          inquiry_id?: string | null
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
      subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          plan_id: string | null
          stripe_customer_id: string | null
          subscribed: boolean
          subscription_end: string | null
          subscription_tier: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          plan_id?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          plan_id?: string | null
          stripe_customer_id?: string | null
          subscribed?: boolean
          subscription_end?: string | null
          subscription_tier?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscribers_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "membership_plans"
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
      trending_topics_cache: {
        Row: {
          created_at: string
          description: string
          expires_at: string
          google_trends_keyword: string
          id: string
          is_active: boolean | null
          region: string | null
          tags: string[] | null
          title: string
        }
        Insert: {
          created_at?: string
          description: string
          expires_at?: string
          google_trends_keyword: string
          id?: string
          is_active?: boolean | null
          region?: string | null
          tags?: string[] | null
          title: string
        }
        Update: {
          created_at?: string
          description?: string
          expires_at?: string
          google_trends_keyword?: string
          id?: string
          is_active?: boolean | null
          region?: string | null
          tags?: string[] | null
          title?: string
        }
        Relationships: []
      }
      user_referrals: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string | null
          referred_id: string
          referrer_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id?: string | null
          referred_id: string
          referrer_id: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string | null
          referred_id?: string
          referrer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          created_at: string | null
          credits_balance: number | null
          id: string
          is_premium: boolean | null
          premium_expires_at: string | null
          region: string | null
          total_credits_purchased: number | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          region?: string | null
          total_credits_purchased?: number | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          credits_balance?: number | null
          id?: string
          is_premium?: boolean | null
          premium_expires_at?: string | null
          region?: string | null
          total_credits_purchased?: number | null
          updated_at?: string | null
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
      public_app_settings: {
        Row: {
          description: string | null
          key: string | null
          value: Json | null
        }
        Insert: {
          description?: string | null
          key?: string | null
          value?: Json | null
        }
        Update: {
          description?: string | null
          key?: string | null
          value?: Json | null
        }
        Relationships: []
      }
    }
    Functions: {
      allocate_activity_credits: {
        Args: {
          activity_type: string
          reference_thought_id?: string
          target_user_uuid?: string
          user_uuid: string
          woices_count?: number
        }
        Returns: boolean
      }
      allocate_activity_points: {
        Args: {
          activity_type: string
          target_user_uuid?: string
          user_uuid: string
        }
        Returns: boolean
      }
      check_sales_inquiry_rate_limit: {
        Args: { p_email: string; p_max_per_hour?: number; p_user_id: string }
        Returns: boolean
      }
      cleanup_old_sales_inquiries: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      evaluate_thought_status: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      get_auth_users_basic: {
        Args: Record<PropertyKey, never>
        Returns: {
          created_at: string
          email: string
          last_sign_in_at: string
          user_id: string
        }[]
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
      get_public_thoughts_for_feed: {
        Args: Record<PropertyKey, never>
        Returns: {
          city: string
          country_code: string
          created_at: string
          description: string
          expires_at: string
          final_status: string
          id: string
          max_woices_allowed: number
          status: string
          tags: string[]
          thought_scope: string
          title: string
          voice_response_count: number
        }[]
      }
      get_public_voice_responses_for_feed: {
        Args: Record<PropertyKey, never>
        Returns: {
          audio_url: string
          classification: string
          created_at: string
          duration: number
          fact_votes: number
          id: string
          myth_votes: number
          thought_id: string
          transcript: string
          unclear_votes: number
        }[]
      }
      get_user_credits_balance: {
        Args: { user_uuid: string }
        Returns: number
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
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      update_expired_thoughts: {
        Args: Record<PropertyKey, never>
        Returns: undefined
      }
      update_user_credits: {
        Args: {
          credit_amount: number
          description?: string
          reference_uuid?: string
          transaction_type: string
          user_uuid: string
        }
        Returns: boolean
      }
      user_has_replied_to_thought: {
        Args: { thought_uuid: string; user_uuid: string }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
