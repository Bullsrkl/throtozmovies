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
      certificates: {
        Row: {
          account_id: string
          certificate_type: string
          id: string
          issued_at: string
          user_id: string
        }
        Insert: {
          account_id: string
          certificate_type: string
          id?: string
          issued_at?: string
          user_id: string
        }
        Update: {
          account_id?: string
          certificate_type?: string
          id?: string
          issued_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_account_id_fkey"
            columns: ["account_id"]
            isOneToOne: false
            referencedRelation: "trading_accounts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      challenge_plans: {
        Row: {
          account_size: number
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at: string
          daily_drawdown_limit: number
          id: string
          min_trading_days: number
          overall_drawdown_limit: number
          price_usd: number
          profit_target_phase1: number
          profit_target_phase2: number
        }
        Insert: {
          account_size: number
          challenge_type: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          daily_drawdown_limit?: number
          id?: string
          min_trading_days?: number
          overall_drawdown_limit?: number
          price_usd: number
          profit_target_phase1?: number
          profit_target_phase2?: number
        }
        Update: {
          account_size?: number
          challenge_type?: Database["public"]["Enums"]["challenge_type"]
          created_at?: string
          daily_drawdown_limit?: number
          id?: string
          min_trading_days?: number
          overall_drawdown_limit?: number
          price_usd?: number
          profit_target_phase1?: number
          profit_target_phase2?: number
        }
        Relationships: []
      }
      challenge_purchases: {
        Row: {
          created_at: string
          discount_code: string | null
          id: string
          payment_screenshot_url: string | null
          plan_id: string
          status: Database["public"]["Enums"]["purchase_status"]
          transaction_id: string | null
          user_id: string
        }
        Insert: {
          created_at?: string
          discount_code?: string | null
          id?: string
          payment_screenshot_url?: string | null
          plan_id: string
          status?: Database["public"]["Enums"]["purchase_status"]
          transaction_id?: string | null
          user_id: string
        }
        Update: {
          created_at?: string
          discount_code?: string | null
          id?: string
          payment_screenshot_url?: string | null
          plan_id?: string
          status?: Database["public"]["Enums"]["purchase_status"]
          transaction_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "challenge_purchases_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "challenge_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "challenge_purchases_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
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
          screenshot_url: string | null
          seo_keywords: string | null
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
          screenshot_url?: string | null
          seo_keywords?: string | null
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
          screenshot_url?: string | null
          seo_keywords?: string | null
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
      platform_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          auto_withdrawal: boolean | null
          auto_withdrawal_threshold: number | null
          avatar_url: string | null
          created_at: string
          default_category: string | null
          default_language: string | null
          email: string
          full_name: string | null
          id: string
          notify_downloads: boolean | null
          notify_earnings: boolean | null
          notify_promotions: boolean | null
          notify_subscription: boolean | null
          notify_withdrawals: boolean | null
          primary_upi_id: string | null
          referral_code: string | null
          secondary_upi_id: string | null
          updated_at: string
          youtube_bonus_claimed: boolean | null
        }
        Insert: {
          auto_withdrawal?: boolean | null
          auto_withdrawal_threshold?: number | null
          avatar_url?: string | null
          created_at?: string
          default_category?: string | null
          default_language?: string | null
          email: string
          full_name?: string | null
          id: string
          notify_downloads?: boolean | null
          notify_earnings?: boolean | null
          notify_promotions?: boolean | null
          notify_subscription?: boolean | null
          notify_withdrawals?: boolean | null
          primary_upi_id?: string | null
          referral_code?: string | null
          secondary_upi_id?: string | null
          updated_at?: string
          youtube_bonus_claimed?: boolean | null
        }
        Update: {
          auto_withdrawal?: boolean | null
          auto_withdrawal_threshold?: number | null
          avatar_url?: string | null
          created_at?: string
          default_category?: string | null
          default_language?: string | null
          email?: string
          full_name?: string | null
          id?: string
          notify_downloads?: boolean | null
          notify_earnings?: boolean | null
          notify_promotions?: boolean | null
          notify_subscription?: boolean | null
          notify_withdrawals?: boolean | null
          primary_upi_id?: string | null
          referral_code?: string | null
          secondary_upi_id?: string | null
          updated_at?: string
          youtube_bonus_claimed?: boolean | null
        }
        Relationships: []
      }
      promotion_requests: {
        Row: {
          admin_notes: string | null
          duration_days: number
          id: string
          movie_id: string
          payment_method: string | null
          processed_at: string | null
          promotion_price: number | null
          requested_at: string
          status: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          duration_days?: number
          id?: string
          movie_id: string
          payment_method?: string | null
          processed_at?: string | null
          promotion_price?: number | null
          requested_at?: string
          status?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          duration_days?: number
          id?: string
          movie_id?: string
          payment_method?: string | null
          processed_at?: string | null
          promotion_price?: number | null
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
      referrals: {
        Row: {
          created_at: string | null
          id: string
          referral_code: string
          referred_id: string
          referrer_id: string
          signup_bonus_credited: boolean | null
          status: string | null
          subscription_bonus_credited: boolean | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          referral_code: string
          referred_id: string
          referrer_id: string
          signup_bonus_credited?: boolean | null
          status?: string | null
          subscription_bonus_credited?: boolean | null
        }
        Update: {
          created_at?: string | null
          id?: string
          referral_code?: string
          referred_id?: string
          referrer_id?: string
          signup_bonus_credited?: boolean | null
          status?: string | null
          subscription_bonus_credited?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referred_id_fkey"
            columns: ["referred_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
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
          original_price_inr: number | null
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
          original_price_inr?: number | null
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
          original_price_inr?: number | null
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
      trading_accounts: {
        Row: {
          account_number: string
          balance: number
          created_at: string
          daily_drawdown: number
          id: string
          overall_drawdown: number
          password: string
          phase: Database["public"]["Enums"]["account_phase"]
          platform: string
          profit_percent: number
          profit_target: number
          purchase_id: string
          server: string
          status: Database["public"]["Enums"]["account_status"]
          trading_days: number
          user_id: string
        }
        Insert: {
          account_number: string
          balance?: number
          created_at?: string
          daily_drawdown?: number
          id?: string
          overall_drawdown?: number
          password: string
          phase?: Database["public"]["Enums"]["account_phase"]
          platform?: string
          profit_percent?: number
          profit_target?: number
          purchase_id: string
          server?: string
          status?: Database["public"]["Enums"]["account_status"]
          trading_days?: number
          user_id: string
        }
        Update: {
          account_number?: string
          balance?: number
          created_at?: string
          daily_drawdown?: number
          id?: string
          overall_drawdown?: number
          password?: string
          phase?: Database["public"]["Enums"]["account_phase"]
          platform?: string
          profit_percent?: number
          profit_target?: number
          purchase_id?: string
          server?: string
          status?: Database["public"]["Enums"]["account_status"]
          trading_days?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "trading_accounts_purchase_id_fkey"
            columns: ["purchase_id"]
            isOneToOne: false
            referencedRelation: "challenge_purchases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "trading_accounts_user_id_fkey"
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
          network: string | null
          payment_receipt_url: string | null
          platform_fee: number
          processed_at: string | null
          requested_at: string
          status: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id: string | null
          usdt_address: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          id?: string
          net_amount: number
          network?: string | null
          payment_receipt_url?: string | null
          platform_fee: number
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id?: string | null
          usdt_address?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          id?: string
          net_amount?: number
          network?: string | null
          payment_receipt_url?: string | null
          platform_fee?: number
          processed_at?: string | null
          requested_at?: string
          status?: Database["public"]["Enums"]["withdrawal_status"] | null
          upi_id?: string | null
          usdt_address?: string | null
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
      credit_referral_bonus: {
        Args: {
          p_bonus_type: string
          p_referred_id: string
          p_referrer_id: string
        }
        Returns: undefined
      }
      credit_wallet_bonus: {
        Args: { p_amount: number; p_user_id: string }
        Returns: undefined
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      account_phase: "phase1" | "phase2" | "master"
      account_status: "active" | "passed" | "failed" | "funded"
      app_role: "admin" | "creator" | "user"
      challenge_type: "instant" | "one_step" | "two_step"
      purchase_status:
        | "pending_payment"
        | "payment_submitted"
        | "approved"
        | "rejected"
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
      account_phase: ["phase1", "phase2", "master"],
      account_status: ["active", "passed", "failed", "funded"],
      app_role: ["admin", "creator", "user"],
      challenge_type: ["instant", "one_step", "two_step"],
      purchase_status: [
        "pending_payment",
        "payment_submitted",
        "approved",
        "rejected",
      ],
      subscription_status: ["active", "expired", "cancelled", "trial"],
      withdrawal_status: ["pending", "paid", "rejected"],
    },
  },
} as const
