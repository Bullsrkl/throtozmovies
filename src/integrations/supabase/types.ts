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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      download_logs: {
        Row: {
          created_at: string
          downloader_ip: string | null
          earning: number
          episode_id: string | null
          id: string
          movie_id: string
          uploader_id: string
        }
        Insert: {
          created_at?: string
          downloader_ip?: string | null
          earning: number
          episode_id?: string | null
          id?: string
          movie_id: string
          uploader_id: string
        }
        Update: {
          created_at?: string
          downloader_ip?: string | null
          earning?: number
          episode_id?: string | null
          id?: string
          movie_id?: string
          uploader_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "download_logs_episode_id_fkey"
            columns: ["episode_id"]
            isOneToOne: false
            referencedRelation: "episodes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "download_logs_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      episodes: {
        Row: {
          created_at: string
          downloads: number | null
          episode_link: string
          episode_number: number
          episode_title: string
          id: string
          movie_id: string
          views: number | null
        }
        Insert: {
          created_at?: string
          downloads?: number | null
          episode_link: string
          episode_number: number
          episode_title: string
          id?: string
          movie_id: string
          views?: number | null
        }
        Update: {
          created_at?: string
          downloads?: number | null
          episode_link?: string
          episode_number?: number
          episode_title?: string
          id?: string
          movie_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "episodes_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
        ]
      }
      movies: {
        Row: {
          category: string
          clicks: number | null
          created_at: string
          description: string | null
          direct_link: string | null
          downloads: number | null
          id: string
          impressions: number | null
          is_promoted: boolean | null
          is_web_series: boolean | null
          language: string
          poster_url: string
          promoted_until: string | null
          shares: number | null
          title: string
          updated_at: string
          uploader_id: string
          views: number | null
        }
        Insert: {
          category: string
          clicks?: number | null
          created_at?: string
          description?: string | null
          direct_link?: string | null
          downloads?: number | null
          id?: string
          impressions?: number | null
          is_promoted?: boolean | null
          is_web_series?: boolean | null
          language: string
          poster_url: string
          promoted_until?: string | null
          shares?: number | null
          title: string
          updated_at?: string
          uploader_id: string
          views?: number | null
        }
        Update: {
          category?: string
          clicks?: number | null
          created_at?: string
          description?: string | null
          direct_link?: string | null
          downloads?: number | null
          id?: string
          impressions?: number | null
          is_promoted?: boolean | null
          is_web_series?: boolean | null
          language?: string
          poster_url?: string
          promoted_until?: string | null
          shares?: number | null
          title?: string
          updated_at?: string
          uploader_id?: string
          views?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "movies_uploader_id_fkey"
            columns: ["uploader_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string | null
          id: string
          updated_at: string
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name?: string | null
          id: string
          updated_at?: string
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string | null
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      promotion_requests: {
        Row: {
          admin_notes: string | null
          duration_days: number
          id: string
          movie_id: string
          processed_at: string | null
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          duration_days?: number
          id?: string
          movie_id: string
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          duration_days?: number
          id?: string
          movie_id?: string
          processed_at?: string | null
          requested_at?: string
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "promotion_requests_movie_id_fkey"
            columns: ["movie_id"]
            isOneToOne: false
            referencedRelation: "movies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "promotion_requests_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          duration_days: number
          earning_per_download: number
          id: string
          is_trial: boolean | null
          plan_code: string
          plan_name: string
          price_inr: number
          uploads_per_day: number
          withdrawal_max: number
          withdrawal_min: number
          withdrawal_threshold: number
        }
        Insert: {
          created_at?: string
          duration_days: number
          earning_per_download: number
          id?: string
          is_trial?: boolean | null
          plan_code: string
          plan_name: string
          price_inr: number
          uploads_per_day: number
          withdrawal_max: number
          withdrawal_min: number
          withdrawal_threshold: number
        }
        Update: {
          created_at?: string
          duration_days?: number
          earning_per_download?: number
          id?: string
          is_trial?: boolean | null
          plan_code?: string
          plan_name?: string
          price_inr?: number
          uploads_per_day?: number
          withdrawal_max?: number
          withdrawal_min?: number
          withdrawal_threshold?: number
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          auto_pay: boolean | null
          created_at: string
          expiry_date: string
          id: string
          payment_receipt_url: string | null
          payment_verified: boolean | null
          plan_id: string
          start_date: string
          status: Database["public"]["Enums"]["subscription_status"]
          updated_at: string
          user_id: string
        }
        Insert: {
          auto_pay?: boolean | null
          created_at?: string
          expiry_date: string
          id?: string
          payment_receipt_url?: string | null
          payment_verified?: boolean | null
          plan_id: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id: string
        }
        Update: {
          auto_pay?: boolean | null
          created_at?: string
          expiry_date?: string
          id?: string
          payment_receipt_url?: string | null
          payment_verified?: boolean | null
          plan_id?: string
          start_date?: string
          status?: Database["public"]["Enums"]["subscription_status"]
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
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
        Relationships: [
          {
            foreignKeyName: "user_roles_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      wallets: {
        Row: {
          balance: number | null
          created_at: string
          id: string
          total_earnings: number | null
          total_withdrawn: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          balance?: number | null
          created_at?: string
          id?: string
          total_earnings?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          balance?: number | null
          created_at?: string
          id?: string
          total_earnings?: number | null
          total_withdrawn?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wallets_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      withdrawals: {
        Row: {
          admin_notes: string | null
          amount: number
          id: string
          net_amount: number
          payment_receipt_url: string | null
          platform_fee: number
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id: string
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          id?: string
          net_amount: number
          payment_receipt_url?: string | null
          platform_fee: number
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id: string
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          id?: string
          net_amount?: number
          payment_receipt_url?: string | null
          platform_fee?: number
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "withdrawals_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "creator" | "user"
      subscription_status: "active" | "expired" | "cancelled" | "trial"
      withdrawal_status: "pending" | "paid" | "rejected"
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
      app_role: ["admin", "creator", "user"],
      subscription_status: ["active", "expired", "cancelled", "trial"],
      withdrawal_status: ["pending", "paid", "rejected"],
    },
  },
} as const
