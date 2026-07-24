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
      balance_games: {
        Row: {
          comments_count: number
          created_at: string
          creator_client_id: string
          creator_nickname: string
          id: string
          likes_count: number
          option_a_image_url: string
          option_a_prompt: string
          option_a_title: string | null
          option_b_image_url: string
          option_b_prompt: string
          option_b_title: string | null
          slug: string
          status: string
          votes_a_count: number
          votes_b_count: number
        }
        Insert: {
          comments_count?: number
          created_at?: string
          creator_client_id: string
          creator_nickname?: string
          id?: string
          likes_count?: number
          option_a_image_url: string
          option_a_prompt: string
          option_a_title?: string | null
          option_b_image_url: string
          option_b_prompt: string
          option_b_title?: string | null
          slug: string
          status?: string
          votes_a_count?: number
          votes_b_count?: number
        }
        Update: {
          comments_count?: number
          created_at?: string
          creator_client_id?: string
          creator_nickname?: string
          id?: string
          likes_count?: number
          option_a_image_url?: string
          option_a_prompt?: string
          option_a_title?: string | null
          option_b_image_url?: string
          option_b_prompt?: string
          option_b_title?: string | null
          slug?: string
          status?: string
          votes_a_count?: number
          votes_b_count?: number
        }
        Relationships: []
      }
      comments: {
        Row: {
          client_id: string
          content: string
          created_at: string
          game_id: string
          id: string
          nickname: string
          status: string
        }
        Insert: {
          client_id: string
          content: string
          created_at?: string
          game_id: string
          id?: string
          nickname?: string
          status?: string
        }
        Update: {
          client_id?: string
          content?: string
          created_at?: string
          game_id?: string
          id?: string
          nickname?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "balance_games"
            referencedColumns: ["id"]
          },
        ]
      }
      generation_usage: {
        Row: {
          ads_watched: number
          client_id: string
          consumed: number
          granted_bonus: number
          usage_date: string
        }
        Insert: {
          ads_watched?: number
          client_id: string
          consumed?: number
          granted_bonus?: number
          usage_date?: string
        }
        Update: {
          ads_watched?: number
          client_id?: string
          consumed?: number
          granted_bonus?: number
          usage_date?: string
        }
        Relationships: []
      }
      image_generation_jobs: {
        Row: {
          client_id: string
          cost_cents: number | null
          created_at: string
          id: string
          image_url: string | null
          prompt: string
          provider: string
          status: string
        }
        Insert: {
          client_id: string
          cost_cents?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          prompt: string
          provider: string
          status: string
        }
        Update: {
          client_id?: string
          cost_cents?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          prompt?: string
          provider?: string
          status?: string
        }
        Relationships: []
      }
      ip_generation_usage: {
        Row: {
          consumed: number
          ip_address: string
          usage_date: string
        }
        Insert: {
          consumed?: number
          ip_address: string
          usage_date?: string
        }
        Update: {
          consumed?: number
          ip_address?: string
          usage_date?: string
        }
        Relationships: []
      }
      likes: {
        Row: {
          client_id: string
          created_at: string
          game_id: string
          id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          game_id: string
          id?: string
        }
        Update: {
          client_id?: string
          created_at?: string
          game_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "balance_games"
            referencedColumns: ["id"]
          },
        ]
      }
      reports: {
        Row: {
          created_at: string
          id: string
          reason: string | null
          reporter_client_id: string
          target_id: string
          target_type: string
        }
        Insert: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_client_id: string
          target_id: string
          target_type: string
        }
        Update: {
          created_at?: string
          id?: string
          reason?: string | null
          reporter_client_id?: string
          target_id?: string
          target_type?: string
        }
        Relationships: []
      }
      votes: {
        Row: {
          choice: string
          created_at: string
          game_id: string
          id: string
          voter_client_id: string
        }
        Insert: {
          choice: string
          created_at?: string
          game_id: string
          id?: string
          voter_client_id: string
        }
        Update: {
          choice?: string
          created_at?: string
          game_id?: string
          id?: string
          voter_client_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "votes_game_id_fkey"
            columns: ["game_id"]
            isOneToOne: false
            referencedRelation: "balance_games"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      add_comment:
        | {
            Args: { p_client_id: string; p_content: string; p_slug: string }
            Returns: string
          }
        | {
            Args: {
              p_client_id: string
              p_content: string
              p_nickname?: string
              p_slug: string
            }
            Returns: string
          }
      cast_vote: {
        Args: { p_choice: string; p_slug: string; p_voter_client_id: string }
        Returns: boolean
      }
      consume_generation_credit: {
        Args: {
          p_client_id: string
          p_free_limit: number
          p_ip_address: string
          p_ip_daily_cap: number
        }
        Returns: boolean
      }
      delete_comment: {
        Args: { p_client_id: string; p_comment_id: string }
        Returns: boolean
      }
      edit_comment: {
        Args: { p_client_id: string; p_comment_id: string; p_content: string }
        Returns: boolean
      }
      grant_reward_credit: {
        Args: {
          p_bonus_per_ad: number
          p_client_id: string
          p_max_ads_per_day: number
        }
        Returns: boolean
      }
      submit_report_and_maybe_hide: {
        Args: {
          p_auto_hide_threshold: number
          p_reason: string
          p_reporter_client_id: string
          p_slug: string
        }
        Returns: undefined
      }
      toggle_like: {
        Args: { p_client_id: string; p_slug: string }
        Returns: boolean
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
