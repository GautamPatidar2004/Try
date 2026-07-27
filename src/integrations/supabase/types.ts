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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      ab_tests: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          end_date: string | null
          id: string
          metrics: Json | null
          name: string
          start_date: string | null
          status: string | null
          target_segment: Json | null
          updated_at: string | null
          variants: Json
          winner_variant: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name: string
          start_date?: string | null
          status?: string | null
          target_segment?: Json | null
          updated_at?: string | null
          variants?: Json
          winner_variant?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          end_date?: string | null
          id?: string
          metrics?: Json | null
          name?: string
          start_date?: string | null
          status?: string | null
          target_segment?: Json | null
          updated_at?: string | null
          variants?: Json
          winner_variant?: string | null
        }
        Relationships: []
      }
      admin_activity_log: {
        Row: {
          action: string
          admin_id: string
          created_at: string
          details: Json | null
          id: string
          target_id: string | null
          target_type: string
        }
        Insert: {
          action: string
          admin_id: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type: string
        }
        Update: {
          action?: string
          admin_id?: string
          created_at?: string
          details?: Json | null
          id?: string
          target_id?: string | null
          target_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "admin_activity_log_admin_id_profiles_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "admin_activity_log_admin_id_profiles_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      admin_notifications: {
        Row: {
          created_at: string
          data: Json | null
          id: string
          message: string
          read_at: string | null
          title: string
          type: string
        }
        Insert: {
          created_at?: string
          data?: Json | null
          id?: string
          message: string
          read_at?: string | null
          title: string
          type: string
        }
        Update: {
          created_at?: string
          data?: Json | null
          id?: string
          message?: string
          read_at?: string | null
          title?: string
          type?: string
        }
        Relationships: []
      }
      affiliate_conversions: {
        Row: {
          affiliate_code_id: string
          commission_amount: number
          confirmed_at: string | null
          conversion_type: string
          converted_at: string
          created_at: string
          creator_id: string
          currency: string
          customer_email_hash: string | null
          external_reference: string | null
          host_id: string
          id: string
          metadata: Json | null
          order_amount: number
          paid_at: string | null
          status: string
        }
        Insert: {
          affiliate_code_id: string
          commission_amount: number
          confirmed_at?: string | null
          conversion_type: string
          converted_at?: string
          created_at?: string
          creator_id: string
          currency?: string
          customer_email_hash?: string | null
          external_reference?: string | null
          host_id: string
          id?: string
          metadata?: Json | null
          order_amount: number
          paid_at?: string | null
          status?: string
        }
        Update: {
          affiliate_code_id?: string
          commission_amount?: number
          confirmed_at?: string | null
          conversion_type?: string
          converted_at?: string
          created_at?: string
          creator_id?: string
          currency?: string
          customer_email_hash?: string | null
          external_reference?: string | null
          host_id?: string
          id?: string
          metadata?: Json | null
          order_amount?: number
          paid_at?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "affiliate_conversions_affiliate_code_id_fkey"
            columns: ["affiliate_code_id"]
            isOneToOne: false
            referencedRelation: "creator_affiliate_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "affiliate_conversions_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_match_scores: {
        Row: {
          ai_recommendation: string | null
          calculation_metadata: Json | null
          created_at: string | null
          id: string
          influencer_id: string
          match_reasons: Json | null
          match_score: number
          property_id: string
          updated_at: string | null
        }
        Insert: {
          ai_recommendation?: string | null
          calculation_metadata?: Json | null
          created_at?: string | null
          id?: string
          influencer_id: string
          match_reasons?: Json | null
          match_score: number
          property_id: string
          updated_at?: string | null
        }
        Update: {
          ai_recommendation?: string | null
          calculation_metadata?: Json | null
          created_at?: string | null
          id?: string
          influencer_id?: string
          match_reasons?: Json | null
          match_score?: number
          property_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ai_match_scores_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ai_match_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "ai_match_scores_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      ai_recommendations: {
        Row: {
          completed_at: string | null
          created_at: string
          dismissed_reason: string | null
          expires_at: string
          id: string
          influencer_id: string
          recommendation_data: Json
          status: string
        }
        Insert: {
          completed_at?: string | null
          created_at?: string
          dismissed_reason?: string | null
          expires_at?: string
          id?: string
          influencer_id: string
          recommendation_data?: Json
          status?: string
        }
        Update: {
          completed_at?: string | null
          created_at?: string
          dismissed_reason?: string | null
          expires_at?: string
          id?: string
          influencer_id?: string
          recommendation_data?: Json
          status?: string
        }
        Relationships: []
      }
      ambassador_announcements: {
        Row: {
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          priority: string | null
          scheduled_for: string | null
          sent_at: string | null
          target_tiers: string[] | null
          title: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          target_tiers?: string[] | null
          title: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          priority?: string | null
          scheduled_for?: string | null
          sent_at?: string | null
          target_tiers?: string[] | null
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_announcements_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_assets: {
        Row: {
          category: string
          created_at: string | null
          downloads: number | null
          file_url: string
          id: string
          preview_url: string | null
          title: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          downloads?: number | null
          file_url: string
          id?: string
          preview_url?: string | null
          title: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          downloads?: number | null
          file_url?: string
          id?: string
          preview_url?: string | null
          title?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ambassador_bonuses: {
        Row: {
          ambassador_id: string
          amount: number
          awarded_by: string | null
          created_at: string | null
          id: string
          paid_at: string | null
          reason: string
          status: string | null
          updated_at: string | null
        }
        Insert: {
          ambassador_id: string
          amount: number
          awarded_by?: string | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          reason: string
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string
          amount?: number
          awarded_by?: string | null
          created_at?: string | null
          id?: string
          paid_at?: string | null
          reason?: string
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_bonuses_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_bonuses_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_bonuses_awarded_by_fkey"
            columns: ["awarded_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_collaborations: {
        Row: {
          ambassador_id: string
          collaboration_id: string | null
          created_at: string | null
          flat_fee_amount: number
          id: string
          net30_due_date: string | null
          payment_date: string | null
          status: string | null
          type: string
          updated_at: string | null
        }
        Insert: {
          ambassador_id: string
          collaboration_id?: string | null
          created_at?: string | null
          flat_fee_amount: number
          id?: string
          net30_due_date?: string | null
          payment_date?: string | null
          status?: string | null
          type: string
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string
          collaboration_id?: string | null
          created_at?: string | null
          flat_fee_amount?: number
          id?: string
          net30_due_date?: string | null
          payment_date?: string | null
          status?: string | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_collaborations_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_collaborations_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_collaborations_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_content_templates: {
        Row: {
          category: string
          content: string
          content_type: string
          created_at: string | null
          id: string
          is_featured: boolean | null
          month: number | null
          tags: string[] | null
          title: string
          updated_at: string | null
          usage_count: number | null
        }
        Insert: {
          category: string
          content: string
          content_type: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          month?: number | null
          tags?: string[] | null
          title: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Update: {
          category?: string
          content?: string
          content_type?: string
          created_at?: string | null
          id?: string
          is_featured?: boolean | null
          month?: number | null
          tags?: string[] | null
          title?: string
          updated_at?: string | null
          usage_count?: number | null
        }
        Relationships: []
      }
      ambassador_content_tracking: {
        Row: {
          ambassador_id: string
          content_urls: Json | null
          created_at: string | null
          feed_posts_count: number | null
          id: string
          month: number
          stories_count: number | null
          updated_at: string | null
          verified: boolean | null
          year: number
        }
        Insert: {
          ambassador_id: string
          content_urls?: Json | null
          created_at?: string | null
          feed_posts_count?: number | null
          id?: string
          month: number
          stories_count?: number | null
          updated_at?: string | null
          verified?: boolean | null
          year: number
        }
        Update: {
          ambassador_id?: string
          content_urls?: Json | null
          created_at?: string | null
          feed_posts_count?: number | null
          id?: string
          month?: number
          stories_count?: number | null
          updated_at?: string | null
          verified?: boolean | null
          year?: number
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_content_tracking_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_contracts: {
        Row: {
          ambassador_member_id: string
          contract_pdf_url: string
          contract_version: string
          created_at: string | null
          id: string
          ip_address: string | null
          legal_name: string
          metadata: Json | null
          signature_data: Json
          signed_at: string
          updated_at: string | null
          user_agent: string | null
        }
        Insert: {
          ambassador_member_id: string
          contract_pdf_url: string
          contract_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          legal_name: string
          metadata?: Json | null
          signature_data?: Json
          signed_at?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Update: {
          ambassador_member_id?: string
          contract_pdf_url?: string
          contract_version?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          legal_name?: string
          metadata?: Json | null
          signature_data?: Json
          signed_at?: string
          updated_at?: string | null
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_contracts_ambassador_member_id_fkey"
            columns: ["ambassador_member_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_earnings: {
        Row: {
          ambassador_id: string
          amount: number
          created_at: string | null
          earning_type: string
          id: string
          metadata: Json | null
          payment_date: string | null
          payment_method: string | null
          status: string | null
        }
        Insert: {
          ambassador_id: string
          amount: number
          created_at?: string | null
          earning_type: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Update: {
          ambassador_id?: string
          amount?: number
          created_at?: string | null
          earning_type?: string
          id?: string
          metadata?: Json | null
          payment_date?: string | null
          payment_method?: string | null
          status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_earnings_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_members: {
        Row: {
          admin_notes: string | null
          agreed_to_terms: boolean | null
          commission_override: number | null
          contract_ip_address: string | null
          contract_signature_data: Json | null
          contract_signed_at: string | null
          contract_version: string | null
          created_at: string | null
          current_tier: string | null
          id: string
          joined_at: string | null
          monthly_requirements_met: boolean | null
          payment_method: Json | null
          referral_code: string
          status: string
          stripe_connect_id: string | null
          stripe_details_submitted: boolean | null
          stripe_onboarding_complete: boolean | null
          stripe_payouts_enabled: boolean | null
          tier_override: string | null
          tier_points: number | null
          tier_updated_at: string | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          admin_notes?: string | null
          agreed_to_terms?: boolean | null
          commission_override?: number | null
          contract_ip_address?: string | null
          contract_signature_data?: Json | null
          contract_signed_at?: string | null
          contract_version?: string | null
          created_at?: string | null
          current_tier?: string | null
          id?: string
          joined_at?: string | null
          monthly_requirements_met?: boolean | null
          payment_method?: Json | null
          referral_code: string
          status?: string
          stripe_connect_id?: string | null
          stripe_details_submitted?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          tier_override?: string | null
          tier_points?: number | null
          tier_updated_at?: string | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          admin_notes?: string | null
          agreed_to_terms?: boolean | null
          commission_override?: number | null
          contract_ip_address?: string | null
          contract_signature_data?: Json | null
          contract_signed_at?: string | null
          contract_version?: string | null
          created_at?: string | null
          current_tier?: string | null
          id?: string
          joined_at?: string | null
          monthly_requirements_met?: boolean | null
          payment_method?: Json | null
          referral_code?: string
          status?: string
          stripe_connect_id?: string | null
          stripe_details_submitted?: boolean | null
          stripe_onboarding_complete?: boolean | null
          stripe_payouts_enabled?: boolean | null
          tier_override?: string | null
          tier_points?: number | null
          tier_updated_at?: string | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_members_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_payouts: {
        Row: {
          ambassador_id: string
          amount: number
          created_at: string | null
          currency: string | null
          earnings_ids: string[] | null
          failure_reason: string | null
          id: string
          processed_at: string | null
          requested_at: string | null
          status: string | null
          stripe_payout_id: string | null
          stripe_transfer_id: string | null
          updated_at: string | null
        }
        Insert: {
          ambassador_id: string
          amount: number
          created_at?: string | null
          currency?: string | null
          earnings_ids?: string[] | null
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string
          amount?: number
          created_at?: string | null
          currency?: string | null
          earnings_ids?: string[] | null
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string | null
          status?: string | null
          stripe_payout_id?: string | null
          stripe_transfer_id?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_payouts_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_referral_clicks: {
        Row: {
          ambassador_id: string
          clicked_at: string | null
          converted: boolean | null
          converted_user_id: string | null
          created_at: string | null
          device_type: string | null
          id: string
          ip_hash: string | null
          landing_page: string | null
          referral_code: string
          referral_type: string
          referrer_url: string | null
          source_channel: string | null
          user_agent: string | null
          utm_campaign: string | null
          utm_medium: string | null
          utm_source: string | null
        }
        Insert: {
          ambassador_id: string
          clicked_at?: string | null
          converted?: boolean | null
          converted_user_id?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          landing_page?: string | null
          referral_code: string
          referral_type?: string
          referrer_url?: string | null
          source_channel?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Update: {
          ambassador_id?: string
          clicked_at?: string | null
          converted?: boolean | null
          converted_user_id?: string | null
          created_at?: string | null
          device_type?: string | null
          id?: string
          ip_hash?: string | null
          landing_page?: string | null
          referral_code?: string
          referral_type?: string
          referrer_url?: string | null
          source_channel?: string | null
          user_agent?: string | null
          utm_campaign?: string | null
          utm_medium?: string | null
          utm_source?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_referral_clicks_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_referral_clicks_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_referral_clicks_converted_user_id_fkey"
            columns: ["converted_user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_referrals: {
        Row: {
          ambassador_id: string
          click_count: number | null
          commission_rate: number | null
          conversion_stage: string | null
          created_at: string | null
          first_click_at: string | null
          id: string
          last_click_at: string | null
          lifetime_value: number | null
          referral_type: string | null
          referred_user_id: string
          signup_date: string | null
          source_channel: string | null
          status: string | null
          subscription_tier: string | null
          total_earned: number | null
          updated_at: string | null
          utm_params: Json | null
        }
        Insert: {
          ambassador_id: string
          click_count?: number | null
          commission_rate?: number | null
          conversion_stage?: string | null
          created_at?: string | null
          first_click_at?: string | null
          id?: string
          last_click_at?: string | null
          lifetime_value?: number | null
          referral_type?: string | null
          referred_user_id: string
          signup_date?: string | null
          source_channel?: string | null
          status?: string | null
          subscription_tier?: string | null
          total_earned?: number | null
          updated_at?: string | null
          utm_params?: Json | null
        }
        Update: {
          ambassador_id?: string
          click_count?: number | null
          commission_rate?: number | null
          conversion_stage?: string | null
          created_at?: string | null
          first_click_at?: string | null
          id?: string
          last_click_at?: string | null
          lifetime_value?: number | null
          referral_type?: string | null
          referred_user_id?: string
          signup_date?: string | null
          source_channel?: string | null
          status?: string | null
          subscription_tier?: string | null
          total_earned?: number | null
          updated_at?: string | null
          utm_params?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_referrals_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "ambassador_referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_streaks: {
        Row: {
          ambassador_id: string
          created_at: string | null
          current_streak: number
          id: string
          last_activity_date: string | null
          longest_streak: number
          streak_started_at: string | null
          streak_type: string
          updated_at: string | null
        }
        Insert: {
          ambassador_id: string
          created_at?: string | null
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_started_at?: string | null
          streak_type: string
          updated_at?: string | null
        }
        Update: {
          ambassador_id?: string
          created_at?: string | null
          current_streak?: number
          id?: string
          last_activity_date?: string | null
          longest_streak?: number
          streak_started_at?: string | null
          streak_type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_streaks_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      ambassador_tiers: {
        Row: {
          benefits: Json | null
          color: string
          commission_bonus: number
          created_at: string | null
          display_order: number
          icon: string
          id: string
          min_earnings: number
          min_referrals: number
          name: string
          updated_at: string | null
        }
        Insert: {
          benefits?: Json | null
          color: string
          commission_bonus?: number
          created_at?: string | null
          display_order?: number
          icon: string
          id?: string
          min_earnings?: number
          min_referrals?: number
          name: string
          updated_at?: string | null
        }
        Update: {
          benefits?: Json | null
          color?: string
          commission_bonus?: number
          created_at?: string | null
          display_order?: number
          icon?: string
          id?: string
          min_earnings?: number
          min_referrals?: number
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      ambassador_training_progress: {
        Row: {
          ambassador_id: string
          completion_percentage: number | null
          created_at: string | null
          id: string
          video_category: string
          video_id: string
          video_title: string
          watched_at: string | null
        }
        Insert: {
          ambassador_id: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          video_category: string
          video_id: string
          video_title: string
          watched_at?: string | null
        }
        Update: {
          ambassador_id?: string
          completion_percentage?: number | null
          created_at?: string | null
          id?: string
          video_category?: string
          video_id?: string
          video_title?: string
          watched_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "ambassador_training_progress_ambassador_id_fkey"
            columns: ["ambassador_id"]
            isOneToOne: false
            referencedRelation: "ambassador_members"
            referencedColumns: ["id"]
          },
        ]
      }
      analytics_events: {
        Row: {
          created_at: string
          event_name: string
          event_type: string
          id: string
          metadata: Json | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          event_name: string
          event_type: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          event_name?: string
          event_type?: string
          id?: string
          metadata?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      applications: {
        Row: {
          content_deadline: string | null
          content_deliverables: string[] | null
          content_delivery_status: string | null
          created_at: string
          creator_confirmation_sent: boolean | null
          creator_confirmation_sent_at: string | null
          delivered_at: string | null
          id: string
          influencer_id: string
          initiated_by: string
          notification_email_sent: boolean | null
          notification_email_sent_at: string | null
          property_id: string
          proposal_message: string | null
          proposed_dates_end: string | null
          proposed_dates_start: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          content_deadline?: string | null
          content_deliverables?: string[] | null
          content_delivery_status?: string | null
          created_at?: string
          creator_confirmation_sent?: boolean | null
          creator_confirmation_sent_at?: string | null
          delivered_at?: string | null
          id?: string
          influencer_id: string
          initiated_by?: string
          notification_email_sent?: boolean | null
          notification_email_sent_at?: string | null
          property_id: string
          proposal_message?: string | null
          proposed_dates_end?: string | null
          proposed_dates_start?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          content_deadline?: string | null
          content_deliverables?: string[] | null
          content_delivery_status?: string | null
          created_at?: string
          creator_confirmation_sent?: boolean | null
          creator_confirmation_sent_at?: string | null
          delivered_at?: string | null
          id?: string
          influencer_id?: string
          initiated_by?: string
          notification_email_sent?: boolean | null
          notification_email_sent_at?: string | null
          property_id?: string
          proposal_message?: string | null
          proposed_dates_end?: string | null
          proposed_dates_start?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "applications_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_enrollments: {
        Row: {
          completed_at: string | null
          current_step_id: string | null
          enrolled_at: string
          flow_id: string
          id: string
          last_step_at: string | null
          metadata: Json | null
          status: string
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          current_step_id?: string | null
          enrolled_at?: string
          flow_id: string
          id?: string
          last_step_at?: string | null
          metadata?: Json | null
          status?: string
          user_id: string
        }
        Update: {
          completed_at?: string | null
          current_step_id?: string | null
          enrolled_at?: string
          flow_id?: string
          id?: string
          last_step_at?: string | null
          metadata?: Json | null
          status?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_enrollments_current_step_id_fkey"
            columns: ["current_step_id"]
            isOneToOne: false
            referencedRelation: "automation_steps"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_enrollments_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_execution_log: {
        Row: {
          action: string
          enrollment_id: string | null
          executed_at: string | null
          id: string
          result: Json | null
          step_id: string | null
        }
        Insert: {
          action: string
          enrollment_id?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          step_id?: string | null
        }
        Update: {
          action?: string
          enrollment_id?: string | null
          executed_at?: string | null
          id?: string
          result?: Json | null
          step_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "automation_execution_log_enrollment_id_fkey"
            columns: ["enrollment_id"]
            isOneToOne: false
            referencedRelation: "automation_enrollments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "automation_execution_log_step_id_fkey"
            columns: ["step_id"]
            isOneToOne: false
            referencedRelation: "automation_steps"
            referencedColumns: ["id"]
          },
        ]
      }
      automation_flows: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          id: string
          last_processed_at: string | null
          name: string
          status: string
          trigger_config: Json
          trigger_type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_processed_at?: string | null
          name: string
          status?: string
          trigger_config?: Json
          trigger_type: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          id?: string
          last_processed_at?: string | null
          name?: string
          status?: string
          trigger_config?: Json
          trigger_type?: string
          updated_at?: string
        }
        Relationships: []
      }
      automation_steps: {
        Row: {
          created_at: string
          delay_hours: number
          flow_id: string
          id: string
          position: number
          step_config: Json
          step_type: string
        }
        Insert: {
          created_at?: string
          delay_hours?: number
          flow_id: string
          id?: string
          position?: number
          step_config?: Json
          step_type: string
        }
        Update: {
          created_at?: string
          delay_hours?: number
          flow_id?: string
          id?: string
          position?: number
          step_config?: Json
          step_type?: string
        }
        Relationships: [
          {
            foreignKeyName: "automation_steps_flow_id_fkey"
            columns: ["flow_id"]
            isOneToOne: false
            referencedRelation: "automation_flows"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_challenges: {
        Row: {
          badge_id: string
          completed_at: string | null
          created_at: string | null
          id: string
          started_at: string | null
          status: string
          steps_data: Json | null
          updated_at: string | null
          user_id: string
        }
        Insert: {
          badge_id: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          steps_data?: Json | null
          updated_at?: string | null
          user_id: string
        }
        Update: {
          badge_id?: string
          completed_at?: string | null
          created_at?: string | null
          id?: string
          started_at?: string | null
          status?: string
          steps_data?: Json | null
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_challenges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      badge_definitions: {
        Row: {
          category: string | null
          created_at: string
          criteria: Json
          description: string
          display_order: number | null
          icon: string
          id: string
          is_active: boolean
          is_repeatable: boolean | null
          name: string
          points_reward: number | null
          prerequisites: string[] | null
          tier: string | null
          updated_at: string
        }
        Insert: {
          category?: string | null
          created_at?: string
          criteria?: Json
          description: string
          display_order?: number | null
          icon: string
          id?: string
          is_active?: boolean
          is_repeatable?: boolean | null
          name: string
          points_reward?: number | null
          prerequisites?: string[] | null
          tier?: string | null
          updated_at?: string
        }
        Update: {
          category?: string | null
          created_at?: string
          criteria?: Json
          description?: string
          display_order?: number | null
          icon?: string
          id?: string
          is_active?: boolean
          is_repeatable?: boolean | null
          name?: string
          points_reward?: number | null
          prerequisites?: string[] | null
          tier?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      badge_progress: {
        Row: {
          badge_id: string
          current_progress: number
          id: string
          last_updated: string
          progress_percentage: number
          target_progress: number
          user_id: string
        }
        Insert: {
          badge_id: string
          current_progress?: number
          id?: string
          last_updated?: string
          progress_percentage?: number
          target_progress: number
          user_id: string
        }
        Update: {
          badge_id?: string
          current_progress?: number
          id?: string
          last_updated?: string
          progress_percentage?: number
          target_progress?: number
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "badge_progress_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "badge_progress_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      benchmark_data: {
        Row: {
          avg_collaboration_rate: number | null
          avg_engagement_rate: number | null
          avg_post_frequency: number | null
          avg_rate_per_post: number | null
          avg_reel_plays: number | null
          avg_story_views: number | null
          created_at: string | null
          data_points_count: number | null
          follower_range: string
          id: string
          last_updated: string | null
          niche: string
          platform: string
        }
        Insert: {
          avg_collaboration_rate?: number | null
          avg_engagement_rate?: number | null
          avg_post_frequency?: number | null
          avg_rate_per_post?: number | null
          avg_reel_plays?: number | null
          avg_story_views?: number | null
          created_at?: string | null
          data_points_count?: number | null
          follower_range: string
          id?: string
          last_updated?: string | null
          niche: string
          platform: string
        }
        Update: {
          avg_collaboration_rate?: number | null
          avg_engagement_rate?: number | null
          avg_post_frequency?: number | null
          avg_rate_per_post?: number | null
          avg_reel_plays?: number | null
          avg_story_views?: number | null
          created_at?: string | null
          data_points_count?: number | null
          follower_range?: string
          id?: string
          last_updated?: string | null
          niche?: string
          platform?: string
        }
        Relationships: []
      }
      blog_posts: {
        Row: {
          author_id: string | null
          category: string | null
          content: string
          created_at: string
          excerpt: string | null
          featured: boolean
          featured_image_url: string | null
          id: string
          meta_description: string | null
          meta_title: string | null
          published_at: string | null
          reading_time_minutes: number | null
          slug: string
          status: string
          tags: string[] | null
          title: string
          updated_at: string
          views_count: number
        }
        Insert: {
          author_id?: string | null
          category?: string | null
          content: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug: string
          status?: string
          tags?: string[] | null
          title: string
          updated_at?: string
          views_count?: number
        }
        Update: {
          author_id?: string | null
          category?: string | null
          content?: string
          created_at?: string
          excerpt?: string | null
          featured?: boolean
          featured_image_url?: string | null
          id?: string
          meta_description?: string | null
          meta_title?: string | null
          published_at?: string | null
          reading_time_minutes?: number | null
          slug?: string
          status?: string
          tags?: string[] | null
          title?: string
          updated_at?: string
          views_count?: number
        }
        Relationships: [
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "blog_posts_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_campaign_applications: {
        Row: {
          campaign_id: string
          content_delivery_status: string | null
          cover_letter: string | null
          created_at: string | null
          creator_confirmation_sent: boolean | null
          creator_confirmation_sent_at: string | null
          delivered_at: string | null
          engagement_rate_snapshot: number | null
          follower_count_snapshot: number | null
          id: string
          influencer_id: string
          initiated_by: string
          notification_email_sent: boolean | null
          notification_email_sent_at: string | null
          portfolio_urls: string[] | null
          previous_brand_work: string[] | null
          proposed_content_ideas: string | null
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          campaign_id: string
          content_delivery_status?: string | null
          cover_letter?: string | null
          created_at?: string | null
          creator_confirmation_sent?: boolean | null
          creator_confirmation_sent_at?: string | null
          delivered_at?: string | null
          engagement_rate_snapshot?: number | null
          follower_count_snapshot?: number | null
          id?: string
          influencer_id: string
          initiated_by?: string
          notification_email_sent?: boolean | null
          notification_email_sent_at?: string | null
          portfolio_urls?: string[] | null
          previous_brand_work?: string[] | null
          proposed_content_ideas?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          campaign_id?: string
          content_delivery_status?: string | null
          cover_letter?: string | null
          created_at?: string | null
          creator_confirmation_sent?: boolean | null
          creator_confirmation_sent_at?: string | null
          delivered_at?: string | null
          engagement_rate_snapshot?: number | null
          follower_count_snapshot?: number | null
          id?: string
          influencer_id?: string
          initiated_by?: string
          notification_email_sent?: boolean | null
          notification_email_sent_at?: string | null
          portfolio_urls?: string[] | null
          previous_brand_work?: string[] | null
          proposed_content_ideas?: string | null
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_campaign_applications_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_campaign_applications_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_campaign_saved: {
        Row: {
          campaign_id: string
          created_at: string | null
          id: string
          influencer_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          id?: string
          influencer_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          id?: string
          influencer_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_campaign_saved_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_campaign_saved_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_campaigns: {
        Row: {
          affiliate_enabled: boolean
          affiliate_percentage: number | null
          application_deadline: string | null
          applications_count: number | null
          brand_description: string | null
          brand_logo_url: string | null
          brand_name: string
          brand_website: string | null
          budget_max: number | null
          budget_min: number | null
          campaign_brief_url: string | null
          campaign_description: string
          campaign_image_url: string | null
          campaign_subject_type: string
          campaign_title: string
          campaign_type: string | null
          compensation_type: string
          content_requirements: string[] | null
          created_at: string | null
          created_by: string | null
          creator_payout: number | null
          creators_needed: number | null
          currency: string | null
          deliverables: string[]
          deliverables_count: number | null
          expires_at: string | null
          geo_focus: string | null
          hfx_brand_id: string | null
          id: string
          max_followers: number | null
          min_engagement_rate: number | null
          min_followers: number | null
          payment_status: string | null
          platform_fee: number | null
          platform_source: string
          product_value: number | null
          property_id: string | null
          required_niches: string[] | null
          required_platforms: string[] | null
          requirements: string | null
          spots_available: number | null
          spots_filled: number | null
          status: string | null
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          target_destination: string | null
          timeline_end: string | null
          timeline_start: string | null
          total_budget: number | null
          updated_at: string | null
          views_count: number | null
          visibility: string | null
        }
        Insert: {
          affiliate_enabled?: boolean
          affiliate_percentage?: number | null
          application_deadline?: string | null
          applications_count?: number | null
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_name: string
          brand_website?: string | null
          budget_max?: number | null
          budget_min?: number | null
          campaign_brief_url?: string | null
          campaign_description: string
          campaign_image_url?: string | null
          campaign_subject_type?: string
          campaign_title: string
          campaign_type?: string | null
          compensation_type: string
          content_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          creator_payout?: number | null
          creators_needed?: number | null
          currency?: string | null
          deliverables?: string[]
          deliverables_count?: number | null
          expires_at?: string | null
          geo_focus?: string | null
          hfx_brand_id?: string | null
          id?: string
          max_followers?: number | null
          min_engagement_rate?: number | null
          min_followers?: number | null
          payment_status?: string | null
          platform_fee?: number | null
          platform_source?: string
          product_value?: number | null
          property_id?: string | null
          required_niches?: string[] | null
          required_platforms?: string[] | null
          requirements?: string | null
          spots_available?: number | null
          spots_filled?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          target_destination?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_budget?: number | null
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Update: {
          affiliate_enabled?: boolean
          affiliate_percentage?: number | null
          application_deadline?: string | null
          applications_count?: number | null
          brand_description?: string | null
          brand_logo_url?: string | null
          brand_name?: string
          brand_website?: string | null
          budget_max?: number | null
          budget_min?: number | null
          campaign_brief_url?: string | null
          campaign_description?: string
          campaign_image_url?: string | null
          campaign_subject_type?: string
          campaign_title?: string
          campaign_type?: string | null
          compensation_type?: string
          content_requirements?: string[] | null
          created_at?: string | null
          created_by?: string | null
          creator_payout?: number | null
          creators_needed?: number | null
          currency?: string | null
          deliverables?: string[]
          deliverables_count?: number | null
          expires_at?: string | null
          geo_focus?: string | null
          hfx_brand_id?: string | null
          id?: string
          max_followers?: number | null
          min_engagement_rate?: number | null
          min_followers?: number | null
          payment_status?: string | null
          platform_fee?: number | null
          platform_source?: string
          product_value?: number | null
          property_id?: string | null
          required_niches?: string[] | null
          required_platforms?: string[] | null
          requirements?: string | null
          spots_available?: number | null
          spots_filled?: number | null
          status?: string | null
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          target_destination?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_budget?: number | null
          updated_at?: string | null
          views_count?: number | null
          visibility?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_campaigns_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "brand_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_collaboration_agreements: {
        Row: {
          agreed_at: string | null
          application_id: string
          brand_id: string
          brand_ip_address: string | null
          brand_legal_name: string | null
          brand_signature_data: Json | null
          brand_signed_at: string | null
          campaign_id: string
          cancellation_policy: string | null
          content_requirements: string[] | null
          contract_pdf_url: string | null
          contract_version: string | null
          created_at: string
          creator_ip_address: string | null
          creator_legal_name: string | null
          creator_signature_data: Json | null
          creator_signed_at: string | null
          currency: string | null
          deadline: string | null
          deliverable_count: number | null
          id: string
          influencer_id: string
          payment_terms: string | null
          status: string | null
          total_fee: number | null
          updated_at: string
        }
        Insert: {
          agreed_at?: string | null
          application_id: string
          brand_id: string
          brand_ip_address?: string | null
          brand_legal_name?: string | null
          brand_signature_data?: Json | null
          brand_signed_at?: string | null
          campaign_id: string
          cancellation_policy?: string | null
          content_requirements?: string[] | null
          contract_pdf_url?: string | null
          contract_version?: string | null
          created_at?: string
          creator_ip_address?: string | null
          creator_legal_name?: string | null
          creator_signature_data?: Json | null
          creator_signed_at?: string | null
          currency?: string | null
          deadline?: string | null
          deliverable_count?: number | null
          id?: string
          influencer_id: string
          payment_terms?: string | null
          status?: string | null
          total_fee?: number | null
          updated_at?: string
        }
        Update: {
          agreed_at?: string | null
          application_id?: string
          brand_id?: string
          brand_ip_address?: string | null
          brand_legal_name?: string | null
          brand_signature_data?: Json | null
          brand_signed_at?: string | null
          campaign_id?: string
          cancellation_policy?: string | null
          content_requirements?: string[] | null
          contract_pdf_url?: string | null
          contract_version?: string | null
          created_at?: string
          creator_ip_address?: string | null
          creator_legal_name?: string | null
          creator_signature_data?: Json | null
          creator_signed_at?: string | null
          currency?: string | null
          deadline?: string | null
          deliverable_count?: number | null
          id?: string
          influencer_id?: string
          payment_terms?: string | null
          status?: string | null
          total_fee?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "brand_collaboration_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "brand_campaign_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collaboration_agreements_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collaboration_agreements_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collaboration_agreements_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collaboration_agreements_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_collaboration_agreements_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_documents: {
        Row: {
          brand_id: string
          created_at: string | null
          document_type: string
          document_url: string
          file_name: string
          file_size: number | null
          id: string
          rejection_reason: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: string | null
          uploaded_at: string | null
        }
        Insert: {
          brand_id: string
          created_at?: string | null
          document_type: string
          document_url: string
          file_name: string
          file_size?: number | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_at?: string | null
        }
        Update: {
          brand_id?: string
          created_at?: string | null
          document_type?: string
          document_url?: string
          file_name?: string
          file_size?: number | null
          id?: string
          rejection_reason?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: string | null
          uploaded_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brand_documents_brand_id_fkey"
            columns: ["brand_id"]
            isOneToOne: false
            referencedRelation: "brands"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brand_documents_reviewed_by_fkey"
            columns: ["reviewed_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      brand_partnerships: {
        Row: {
          brand_contact_email: string
          brand_contact_name: string | null
          brand_name: string
          campaign_description: string | null
          campaign_title: string
          completed_at: string | null
          content_requirements: string[] | null
          contract_signed_at: string | null
          created_at: string
          currency: string | null
          deliverables: string[] | null
          id: string
          influencer_id: string
          payment_terms: string | null
          status: string | null
          timeline_end: string | null
          timeline_start: string | null
          total_amount: number
          updated_at: string
        }
        Insert: {
          brand_contact_email: string
          brand_contact_name?: string | null
          brand_name: string
          campaign_description?: string | null
          campaign_title: string
          completed_at?: string | null
          content_requirements?: string[] | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: string[] | null
          id?: string
          influencer_id: string
          payment_terms?: string | null
          status?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_amount: number
          updated_at?: string
        }
        Update: {
          brand_contact_email?: string
          brand_contact_name?: string | null
          brand_name?: string
          campaign_description?: string | null
          campaign_title?: string
          completed_at?: string | null
          content_requirements?: string[] | null
          contract_signed_at?: string | null
          created_at?: string
          currency?: string | null
          deliverables?: string[] | null
          id?: string
          influencer_id?: string
          payment_terms?: string | null
          status?: string | null
          timeline_end?: string | null
          timeline_start?: string | null
          total_amount?: number
          updated_at?: string
        }
        Relationships: []
      }
      brands: {
        Row: {
          brand_name: string
          budget_range: string
          company_name: string
          contact_email: string
          contact_phone: string | null
          created_at: string
          description: string
          id: string
          industry: string
          logo_url: string | null
          updated_at: string
          user_id: string
          verified: boolean | null
          website: string | null
        }
        Insert: {
          brand_name: string
          budget_range: string
          company_name: string
          contact_email: string
          contact_phone?: string | null
          created_at?: string
          description: string
          id?: string
          industry: string
          logo_url?: string | null
          updated_at?: string
          user_id: string
          verified?: boolean | null
          website?: string | null
        }
        Update: {
          brand_name?: string
          budget_range?: string
          company_name?: string
          contact_email?: string
          contact_phone?: string | null
          created_at?: string
          description?: string
          id?: string
          industry?: string
          logo_url?: string | null
          updated_at?: string
          user_id?: string
          verified?: boolean | null
          website?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "brands_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      bulk_match_operations: {
        Row: {
          batch_size: number | null
          completed_at: string | null
          configuration: Json | null
          created_at: string | null
          current_batch: number | null
          error_log: Json | null
          failed_count: number | null
          id: string
          processed_count: number | null
          skipped_count: number | null
          started_at: string | null
          started_by: string | null
          status: string | null
          success_count: number | null
          total_combinations: number
          updated_at: string | null
        }
        Insert: {
          batch_size?: number | null
          completed_at?: string | null
          configuration?: Json | null
          created_at?: string | null
          current_batch?: number | null
          error_log?: Json | null
          failed_count?: number | null
          id?: string
          processed_count?: number | null
          skipped_count?: number | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          success_count?: number | null
          total_combinations: number
          updated_at?: string | null
        }
        Update: {
          batch_size?: number | null
          completed_at?: string | null
          configuration?: Json | null
          created_at?: string | null
          current_batch?: number | null
          error_log?: Json | null
          failed_count?: number | null
          id?: string
          processed_count?: number | null
          skipped_count?: number | null
          started_at?: string | null
          started_by?: string | null
          status?: string | null
          success_count?: number | null
          total_combinations?: number
          updated_at?: string | null
        }
        Relationships: []
      }
      campaign_recipients: {
        Row: {
          campaign_id: string
          created_at: string | null
          delivered_at: string | null
          email: string | null
          error_message: string | null
          id: string
          read_at: string | null
          sent_at: string | null
          status: string | null
          user_id: string
        }
        Insert: {
          campaign_id: string
          created_at?: string | null
          delivered_at?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id: string
        }
        Update: {
          campaign_id?: string
          created_at?: string | null
          delivered_at?: string | null
          email?: string | null
          error_message?: string | null
          id?: string
          read_at?: string | null
          sent_at?: string | null
          status?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "campaign_recipients_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "communication_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "campaign_recipients_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      collaboration_agreements: {
        Row: {
          affiliate_commission_rate: number | null
          agreed_at: string
          agreed_rate: number | null
          application_id: string
          cancellation_policy: string | null
          content_requirements: string[] | null
          contract_pdf_url: string | null
          contract_version: string | null
          created_at: string
          currency: string | null
          deadline: string | null
          deliverable_count: number | null
          host_id: string
          host_ip_address: string | null
          host_legal_name: string | null
          host_signature_data: Json | null
          host_signed_at: string | null
          id: string
          influencer_id: string
          influencer_ip_address: string | null
          influencer_legal_name: string | null
          influencer_signature_data: Json | null
          influencer_signed_at: string | null
          payment_terms: string | null
          status: string | null
          updated_at: string
        }
        Insert: {
          affiliate_commission_rate?: number | null
          agreed_at?: string
          agreed_rate?: number | null
          application_id: string
          cancellation_policy?: string | null
          content_requirements?: string[] | null
          contract_pdf_url?: string | null
          contract_version?: string | null
          created_at?: string
          currency?: string | null
          deadline?: string | null
          deliverable_count?: number | null
          host_id: string
          host_ip_address?: string | null
          host_legal_name?: string | null
          host_signature_data?: Json | null
          host_signed_at?: string | null
          id?: string
          influencer_id: string
          influencer_ip_address?: string | null
          influencer_legal_name?: string | null
          influencer_signature_data?: Json | null
          influencer_signed_at?: string | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
        }
        Update: {
          affiliate_commission_rate?: number | null
          agreed_at?: string
          agreed_rate?: number | null
          application_id?: string
          cancellation_policy?: string | null
          content_requirements?: string[] | null
          contract_pdf_url?: string | null
          contract_version?: string | null
          created_at?: string
          currency?: string | null
          deadline?: string | null
          deliverable_count?: number | null
          host_id?: string
          host_ip_address?: string | null
          host_legal_name?: string | null
          host_signature_data?: Json | null
          host_signed_at?: string | null
          id?: string
          influencer_id?: string
          influencer_ip_address?: string | null
          influencer_legal_name?: string | null
          influencer_signature_data?: Json | null
          influencer_signed_at?: string | null
          payment_terms?: string | null
          status?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["application_id_full"]
          },
        ]
      }
      collaboration_rates: {
        Row: {
          base_rate: number | null
          collaboration_type: string
          created_at: string
          currency: string | null
          id: string
          influencer_id: string
          is_active: boolean | null
          is_negotiable: boolean | null
          maximum_rate: number | null
          minimum_rate: number | null
          property_types: string[] | null
          rate_type: string
          seasonal_multiplier: number | null
          updated_at: string
          weekend_multiplier: number | null
        }
        Insert: {
          base_rate?: number | null
          collaboration_type: string
          created_at?: string
          currency?: string | null
          id?: string
          influencer_id: string
          is_active?: boolean | null
          is_negotiable?: boolean | null
          maximum_rate?: number | null
          minimum_rate?: number | null
          property_types?: string[] | null
          rate_type: string
          seasonal_multiplier?: number | null
          updated_at?: string
          weekend_multiplier?: number | null
        }
        Update: {
          base_rate?: number | null
          collaboration_type?: string
          created_at?: string
          currency?: string | null
          id?: string
          influencer_id?: string
          is_active?: boolean | null
          is_negotiable?: boolean | null
          maximum_rate?: number | null
          minimum_rate?: number | null
          property_types?: string[] | null
          rate_type?: string
          seasonal_multiplier?: number | null
          updated_at?: string
          weekend_multiplier?: number | null
        }
        Relationships: []
      }
      comments: {
        Row: {
          content: string
          content_post_id: string
          created_at: string
          id: string
          updated_at: string
          user_id: string
        }
        Insert: {
          content: string
          content_post_id: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          content?: string
          content_post_id?: string
          created_at?: string
          id?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "comments_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_campaigns: {
        Row: {
          content: string
          created_at: string | null
          created_by: string
          failed_deliveries: number | null
          id: string
          name: string
          scheduled_at: string | null
          sent_at: string | null
          status: string | null
          subject: string | null
          successful_deliveries: number | null
          target_segment: Json
          template_id: string | null
          total_recipients: number | null
          type: string
          updated_at: string | null
        }
        Insert: {
          content: string
          created_at?: string | null
          created_by: string
          failed_deliveries?: number | null
          id?: string
          name: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          successful_deliveries?: number | null
          target_segment?: Json
          template_id?: string | null
          total_recipients?: number | null
          type: string
          updated_at?: string | null
        }
        Update: {
          content?: string
          created_at?: string | null
          created_by?: string
          failed_deliveries?: number | null
          id?: string
          name?: string
          scheduled_at?: string | null
          sent_at?: string | null
          status?: string | null
          subject?: string | null
          successful_deliveries?: number | null
          target_segment?: Json
          template_id?: string | null
          total_recipients?: number | null
          type?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "communication_campaigns_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "communication_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      communication_templates: {
        Row: {
          category: string | null
          content: string
          created_at: string | null
          created_by: string | null
          id: string
          is_active: boolean | null
          name: string
          subject: string | null
          type: string
          updated_at: string | null
          variables: Json | null
        }
        Insert: {
          category?: string | null
          content: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          subject?: string | null
          type: string
          updated_at?: string | null
          variables?: Json | null
        }
        Update: {
          category?: string | null
          content?: string
          created_at?: string | null
          created_by?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          subject?: string | null
          type?: string
          updated_at?: string | null
          variables?: Json | null
        }
        Relationships: []
      }
      content_deliveries: {
        Row: {
          agreement_id: string
          approved_by_host_at: string | null
          content_post_id: string | null
          content_url: string | null
          created_at: string
          delivered_at: string | null
          delivery_type: string
          engagement_metrics: Json | null
          id: string
          payment_triggered: boolean | null
          updated_at: string
        }
        Insert: {
          agreement_id: string
          approved_by_host_at?: string | null
          content_post_id?: string | null
          content_url?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_type: string
          engagement_metrics?: Json | null
          id?: string
          payment_triggered?: boolean | null
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          approved_by_host_at?: string | null
          content_post_id?: string | null
          content_url?: string | null
          created_at?: string
          delivered_at?: string | null
          delivery_type?: string
          engagement_metrics?: Json | null
          id?: string
          payment_triggered?: boolean | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "content_deliveries_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_deliveries_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_deliveries_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      content_intelligence_reports: {
        Row: {
          created_at: string
          id: string
          influencer_id: string
          intelligence_data: Json
          overall_score: number | null
          valid_until: string
        }
        Insert: {
          created_at?: string
          id?: string
          influencer_id: string
          intelligence_data?: Json
          overall_score?: number | null
          valid_until?: string
        }
        Update: {
          created_at?: string
          id?: string
          influencer_id?: string
          intelligence_data?: Json
          overall_score?: number | null
          valid_until?: string
        }
        Relationships: []
      }
      content_posts: {
        Row: {
          application_id: string | null
          brand_campaign_application_id: string | null
          campaign_id: string | null
          caption: string | null
          collaboration_id: string | null
          comments_count: number | null
          created_at: string
          delivery_status: string | null
          hashtags: string[] | null
          host_approval_status: string | null
          id: string
          influencer_id: string
          last_synced_at: string | null
          likes_count: number | null
          location: string | null
          media_type: string
          media_url: string
          mentions: string[] | null
          posting_date: string | null
          property_id: string | null
          shares_count: number | null
          social_platform: string | null
          social_post_url: string | null
          stay_deliverable_id: string | null
          updated_at: string
          views_count: number | null
        }
        Insert: {
          application_id?: string | null
          brand_campaign_application_id?: string | null
          campaign_id?: string | null
          caption?: string | null
          collaboration_id?: string | null
          comments_count?: number | null
          created_at?: string
          delivery_status?: string | null
          hashtags?: string[] | null
          host_approval_status?: string | null
          id?: string
          influencer_id: string
          last_synced_at?: string | null
          likes_count?: number | null
          location?: string | null
          media_type: string
          media_url: string
          mentions?: string[] | null
          posting_date?: string | null
          property_id?: string | null
          shares_count?: number | null
          social_platform?: string | null
          social_post_url?: string | null
          stay_deliverable_id?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Update: {
          application_id?: string | null
          brand_campaign_application_id?: string | null
          campaign_id?: string | null
          caption?: string | null
          collaboration_id?: string | null
          comments_count?: number | null
          created_at?: string
          delivery_status?: string | null
          hashtags?: string[] | null
          host_approval_status?: string | null
          id?: string
          influencer_id?: string
          last_synced_at?: string | null
          likes_count?: number | null
          location?: string | null
          media_type?: string
          media_url?: string
          mentions?: string[] | null
          posting_date?: string | null
          property_id?: string | null
          shares_count?: number | null
          social_platform?: string | null
          social_post_url?: string | null
          stay_deliverable_id?: string | null
          updated_at?: string
          views_count?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "content_posts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["application_id_full"]
          },
          {
            foreignKeyName: "content_posts_brand_campaign_application_id_fkey"
            columns: ["brand_campaign_application_id"]
            isOneToOne: false
            referencedRelation: "brand_campaign_applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "brand_campaigns"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["application_id_full"]
          },
          {
            foreignKeyName: "content_posts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "content_posts_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "content_posts_stay_deliverable_id_fkey"
            columns: ["stay_deliverable_id"]
            isOneToOne: false
            referencedRelation: "stay_deliverables"
            referencedColumns: ["id"]
          },
        ]
      }
      conversion_funnel_steps: {
        Row: {
          completed_at: string
          id: string
          step_name: string
          step_order: number
          time_spent_seconds: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string
          id?: string
          step_name: string
          step_order: number
          time_spent_seconds?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string
          id?: string
          step_name?: string
          step_order?: number
          time_spent_seconds?: number | null
          user_id?: string
        }
        Relationships: []
      }
      creator_affiliate_codes: {
        Row: {
          code: string
          collaboration_id: string | null
          commission_rate: number
          commission_type: string
          created_at: string
          creator_id: string
          current_uses: number
          flat_fee_amount: number | null
          host_id: string
          id: string
          is_active: boolean
          property_id: string | null
          updated_at: string
          usage_limit: number | null
          valid_from: string
          valid_until: string | null
        }
        Insert: {
          code: string
          collaboration_id?: string | null
          commission_rate?: number
          commission_type?: string
          created_at?: string
          creator_id: string
          current_uses?: number
          flat_fee_amount?: number | null
          host_id: string
          id?: string
          is_active?: boolean
          property_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Update: {
          code?: string
          collaboration_id?: string | null
          commission_rate?: number
          commission_type?: string
          created_at?: string
          creator_id?: string
          current_uses?: number
          flat_fee_amount?: number | null
          host_id?: string
          id?: string
          is_active?: boolean
          property_id?: string | null
          updated_at?: string
          usage_limit?: number | null
          valid_from?: string
          valid_until?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_affiliate_codes_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_affiliate_codes_collaboration_id_fkey"
            columns: ["collaboration_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_affiliate_codes_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_affiliate_codes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "creator_affiliate_codes_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_goals: {
        Row: {
          completed_at: string | null
          created_at: string | null
          current_value: number | null
          deadline: string | null
          goal_type: string
          id: string
          influencer_id: string
          status: string | null
          target_value: number
          updated_at: string | null
        }
        Insert: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type: string
          id?: string
          influencer_id: string
          status?: string | null
          target_value: number
          updated_at?: string | null
        }
        Update: {
          completed_at?: string | null
          created_at?: string | null
          current_value?: number | null
          deadline?: string | null
          goal_type?: string
          id?: string
          influencer_id?: string
          status?: string | null
          target_value?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_goals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "creator_goals_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_payouts: {
        Row: {
          amount: number
          conversion_ids: string[]
          created_at: string
          creator_id: string
          currency: string
          failure_reason: string | null
          id: string
          processed_at: string | null
          requested_at: string
          status: string
          stripe_transfer_id: string | null
        }
        Insert: {
          amount: number
          conversion_ids?: string[]
          created_at?: string
          creator_id: string
          currency?: string
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Update: {
          amount?: number
          conversion_ids?: string[]
          created_at?: string
          creator_id?: string
          currency?: string
          failure_reason?: string | null
          id?: string
          processed_at?: string | null
          requested_at?: string
          status?: string
          stripe_transfer_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "creator_payouts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      creator_profile_boosts: {
        Row: {
          boosted_at: string
          created_at: string
          expires_at: string
          id: string
          influencer_id: string
        }
        Insert: {
          boosted_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          influencer_id: string
        }
        Update: {
          boosted_at?: string
          created_at?: string
          expires_at?: string
          id?: string
          influencer_id?: string
        }
        Relationships: []
      }
      crm_leads: {
        Row: {
          assigned_to: string | null
          company: string | null
          converted_profile_id: string | null
          created_at: string
          created_by: string | null
          email: string | null
          first_name: string | null
          id: string
          last_name: string | null
          lead_type: string
          lifecycle_stage: string
          notes: string | null
          phone: string | null
          source: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          company?: string | null
          converted_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: string
          lifecycle_stage?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          company?: string | null
          converted_profile_id?: string | null
          created_at?: string
          created_by?: string | null
          email?: string | null
          first_name?: string | null
          id?: string
          last_name?: string | null
          lead_type?: string
          lifecycle_stage?: string
          notes?: string | null
          phone?: string | null
          source?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_converted_profile_id_fkey"
            columns: ["converted_profile_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_converted_profile_id_fkey"
            columns: ["converted_profile_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_leads_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_notes: {
        Row: {
          author_id: string
          content: string
          created_at: string | null
          id: string
          is_pinned: boolean | null
          lead_id: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          author_id: string
          content: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          lead_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          author_id?: string
          content?: string
          created_at?: string | null
          id?: string
          is_pinned?: boolean | null
          lead_id?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_author_id_fkey"
            columns: ["author_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_notes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tags: {
        Row: {
          color: string | null
          created_at: string | null
          created_by: string | null
          id: string
          name: string
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name: string
        }
        Update: {
          color?: string | null
          created_at?: string | null
          created_by?: string | null
          id?: string
          name?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tags_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_tasks: {
        Row: {
          assigned_to: string | null
          completed_at: string | null
          created_at: string | null
          created_by: string | null
          description: string | null
          due_date: string | null
          id: string
          lead_id: string | null
          priority: string | null
          status: string | null
          title: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          assigned_to?: string | null
          completed_at?: string | null
          created_at?: string | null
          created_by?: string | null
          description?: string | null
          due_date?: string | null
          id?: string
          lead_id?: string | null
          priority?: string | null
          status?: string | null
          title?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_assigned_to_fkey"
            columns: ["assigned_to"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_created_by_fkey"
            columns: ["created_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_lead_id_fkey"
            columns: ["lead_id"]
            isOneToOne: false
            referencedRelation: "crm_leads"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_tasks_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      crm_user_tags: {
        Row: {
          assigned_at: string | null
          assigned_by: string | null
          id: string
          tag_id: string
          user_id: string
        }
        Insert: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tag_id: string
          user_id: string
        }
        Update: {
          assigned_at?: string | null
          assigned_by?: string | null
          id?: string
          tag_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "crm_user_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_user_tags_assigned_by_fkey"
            columns: ["assigned_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_user_tags_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "crm_tags"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "crm_user_tags_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      discovery_conversations: {
        Row: {
          created_at: string
          id: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      discovery_messages: {
        Row: {
          brands: Json | null
          content: string
          conversation_id: string
          created_at: string
          creators: Json | null
          id: string
          properties: Json | null
          role: string
          tool_calls: Json | null
        }
        Insert: {
          brands?: Json | null
          content: string
          conversation_id: string
          created_at?: string
          creators?: Json | null
          id?: string
          properties?: Json | null
          role: string
          tool_calls?: Json | null
        }
        Update: {
          brands?: Json | null
          content?: string
          conversation_id?: string
          created_at?: string
          creators?: Json | null
          id?: string
          properties?: Json | null
          role?: string
          tool_calls?: Json | null
        }
        Relationships: [
          {
            foreignKeyName: "discovery_messages_conversation_id_fkey"
            columns: ["conversation_id"]
            isOneToOne: false
            referencedRelation: "discovery_conversations"
            referencedColumns: ["id"]
          },
        ]
      }
      duplicate_account_groups: {
        Row: {
          created_at: string | null
          id: string
          matching_fields: Json
          reviewed_at: string | null
          reviewed_by_admin_id: string | null
          similarity_score: number
          status: string | null
          updated_at: string | null
          user_ids: string[]
        }
        Insert: {
          created_at?: string | null
          id?: string
          matching_fields: Json
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          similarity_score: number
          status?: string | null
          updated_at?: string | null
          user_ids: string[]
        }
        Update: {
          created_at?: string | null
          id?: string
          matching_fields?: Json
          reviewed_at?: string | null
          reviewed_by_admin_id?: string | null
          similarity_score?: number
          status?: string | null
          updated_at?: string | null
          user_ids?: string[]
        }
        Relationships: [
          {
            foreignKeyName: "duplicate_account_groups_reviewed_by_admin_id_fkey"
            columns: ["reviewed_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "duplicate_account_groups_reviewed_by_admin_id_fkey"
            columns: ["reviewed_by_admin_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      earnings: {
        Row: {
          available_at: string | null
          created_at: string
          currency: string | null
          earned_at: string
          gross_amount: number
          id: string
          influencer_id: string
          net_amount: number
          platform_fee: number | null
          source_id: string
          source_type: string
          status: string | null
          updated_at: string
        }
        Insert: {
          available_at?: string | null
          created_at?: string
          currency?: string | null
          earned_at: string
          gross_amount: number
          id?: string
          influencer_id: string
          net_amount: number
          platform_fee?: number | null
          source_id: string
          source_type: string
          status?: string | null
          updated_at?: string
        }
        Update: {
          available_at?: string | null
          created_at?: string
          currency?: string | null
          earned_at?: string
          gross_amount?: number
          id?: string
          influencer_id?: string
          net_amount?: number
          platform_fee?: number | null
          source_id?: string
          source_type?: string
          status?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      external_analytics: {
        Row: {
          account_id: string
          created_at: string | null
          id: string
          influencer_id: string
          metric_date: string
          metrics: Json
          platform: string
          updated_at: string | null
        }
        Insert: {
          account_id: string
          created_at?: string | null
          id?: string
          influencer_id: string
          metric_date: string
          metrics?: Json
          platform: string
          updated_at?: string | null
        }
        Update: {
          account_id?: string
          created_at?: string | null
          id?: string
          influencer_id?: string
          metric_date?: string
          metrics?: Json
          platform?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "external_analytics_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "external_analytics_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      faq: {
        Row: {
          answer: string
          category_id: string | null
          created_at: string
          display_order: number | null
          id: string
          is_active: boolean | null
          question: string
          search_keywords: string[] | null
          updated_at: string
        }
        Insert: {
          answer: string
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question: string
          search_keywords?: string[] | null
          updated_at?: string
        }
        Update: {
          answer?: string
          category_id?: string | null
          created_at?: string
          display_order?: number | null
          id?: string
          is_active?: boolean | null
          question?: string
          search_keywords?: string[] | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "faq_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "support_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      feature_flags: {
        Row: {
          created_at: string | null
          created_by: string | null
          description: string
          environment: string | null
          id: string
          is_enabled: boolean | null
          name: string
          rollout_percentage: number | null
          target_user_ids: string[] | null
          target_user_types: string[] | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          created_by?: string | null
          description: string
          environment?: string | null
          id?: string
          is_enabled?: boolean | null
          name: string
          rollout_percentage?: number | null
          target_user_ids?: string[] | null
          target_user_types?: string[] | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          created_by?: string | null
          description?: string
          environment?: string | null
          id?: string
          is_enabled?: boolean | null
          name?: string
          rollout_percentage?: number | null
          target_user_ids?: string[] | null
          target_user_types?: string[] | null
          updated_at?: string | null
        }
        Relationships: []
      }
      giveaway_entries: {
        Row: {
          age_verified: boolean
          created_at: string | null
          email: string
          entry_source: string
          id: string
          instagram_username: string | null
          name: string
          phone: string | null
          referral_count: number | null
          shared_to_story: boolean | null
          terms_agreed: boolean
          updated_at: string | null
          us_resident: boolean
        }
        Insert: {
          age_verified?: boolean
          created_at?: string | null
          email: string
          entry_source?: string
          id?: string
          instagram_username?: string | null
          name: string
          phone?: string | null
          referral_count?: number | null
          shared_to_story?: boolean | null
          terms_agreed?: boolean
          updated_at?: string | null
          us_resident?: boolean
        }
        Update: {
          age_verified?: boolean
          created_at?: string | null
          email?: string
          entry_source?: string
          id?: string
          instagram_username?: string | null
          name?: string
          phone?: string | null
          referral_count?: number | null
          shared_to_story?: boolean | null
          terms_agreed?: boolean
          updated_at?: string | null
          us_resident?: boolean
        }
        Relationships: []
      }
      host_applications: {
        Row: {
          applied_at: string
          id: string
          notes: string | null
          status: string
          user_id: string
        }
        Insert: {
          applied_at?: string
          id?: string
          notes?: string | null
          status?: string
          user_id: string
        }
        Update: {
          applied_at?: string
          id?: string
          notes?: string | null
          status?: string
          user_id?: string
        }
        Relationships: []
      }
      hosts: {
        Row: {
          business_name: string | null
          created_at: string
          id: string
          min_follower_count: number | null
          preferred_collaboration_types: string[] | null
          response_rate: number | null
          updated_at: string
          verification_status: string | null
        }
        Insert: {
          business_name?: string | null
          created_at?: string
          id: string
          min_follower_count?: number | null
          preferred_collaboration_types?: string[] | null
          response_rate?: number | null
          updated_at?: string
          verification_status?: string | null
        }
        Update: {
          business_name?: string | null
          created_at?: string
          id?: string
          min_follower_count?: number | null
          preferred_collaboration_types?: string[] | null
          response_rate?: number | null
          updated_at?: string
          verification_status?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "hosts_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "hosts_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      impact_creator_accounts: {
        Row: {
          created_at: string
          creator_id: string
          id: string
          impact_partner_id: string | null
          impact_subid: string
          last_synced_at: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          creator_id: string
          id?: string
          impact_partner_id?: string | null
          impact_subid: string
          last_synced_at?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          creator_id?: string
          id?: string
          impact_partner_id?: string | null
          impact_subid?: string
          last_synced_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "impact_creator_accounts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "impact_creator_accounts_creator_id_fkey"
            columns: ["creator_id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      influencers: {
        Row: {
          collaboration_preferences: string[] | null
          content_niches: string[] | null
          created_at: string
          date_of_birth: string | null
          engagement_rate: number | null
          gender: string | null
          id: string
          instagram_url: string | null
          lifestyle_tags: string[]
          rate_range_max: number | null
          rate_range_min: number | null
          tiktok_url: string | null
          total_followers: number | null
          twitter_url: string | null
          updated_at: string
          youtube_url: string | null
        }
        Insert: {
          collaboration_preferences?: string[] | null
          content_niches?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          engagement_rate?: number | null
          gender?: string | null
          id: string
          instagram_url?: string | null
          lifestyle_tags?: string[]
          rate_range_max?: number | null
          rate_range_min?: number | null
          tiktok_url?: string | null
          total_followers?: number | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Update: {
          collaboration_preferences?: string[] | null
          content_niches?: string[] | null
          created_at?: string
          date_of_birth?: string | null
          engagement_rate?: number | null
          gender?: string | null
          id?: string
          instagram_url?: string | null
          lifestyle_tags?: string[]
          rate_range_max?: number | null
          rate_range_min?: number | null
          tiktok_url?: string | null
          total_followers?: number | null
          twitter_url?: string | null
          updated_at?: string
          youtube_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "influencers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "influencers_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          amount_due: number
          amount_paid: number | null
          created_at: string
          currency: string | null
          due_date: string | null
          id: string
          invoice_number: string | null
          invoice_pdf_url: string | null
          paid_at: string | null
          status: string
          stripe_invoice_id: string | null
          subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          amount_due: number
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          amount_due?: number
          amount_paid?: number | null
          created_at?: string
          currency?: string | null
          due_date?: string | null
          id?: string
          invoice_number?: string | null
          invoice_pdf_url?: string | null
          paid_at?: string | null
          status?: string
          stripe_invoice_id?: string | null
          subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      likes: {
        Row: {
          content_post_id: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          content_post_id: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          content_post_id?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "likes_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      match_interactions: {
        Row: {
          action: string
          created_at: string
          id: string
          influencer_id: string | null
          match_id: string | null
          property_id: string | null
          user_id: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          influencer_id?: string | null
          match_id?: string | null
          property_id?: string | null
          user_id: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          influencer_id?: string | null
          match_id?: string | null
          property_id?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "match_interactions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_interactions_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_interactions_match_id_fkey"
            columns: ["match_id"]
            isOneToOne: false
            referencedRelation: "ai_match_scores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "match_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "match_interactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      media_kits: {
        Row: {
          bio: string | null
          builder_config: Json | null
          collaboration_examples: Json | null
          created_at: string | null
          id: string
          influencer_id: string
          is_public: boolean | null
          last_generated_at: string | null
          pdf_url: string | null
          rate_card: Json | null
          stats_snapshot: Json | null
          status: string | null
          title: string
          top_content: Json | null
          updated_at: string | null
        }
        Insert: {
          bio?: string | null
          builder_config?: Json | null
          collaboration_examples?: Json | null
          created_at?: string | null
          id?: string
          influencer_id: string
          is_public?: boolean | null
          last_generated_at?: string | null
          pdf_url?: string | null
          rate_card?: Json | null
          stats_snapshot?: Json | null
          status?: string | null
          title: string
          top_content?: Json | null
          updated_at?: string | null
        }
        Update: {
          bio?: string | null
          builder_config?: Json | null
          collaboration_examples?: Json | null
          created_at?: string | null
          id?: string
          influencer_id?: string
          is_public?: boolean | null
          last_generated_at?: string | null
          pdf_url?: string | null
          rate_card?: Json | null
          stats_snapshot?: Json | null
          status?: string | null
          title?: string
          top_content?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "media_kits_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "media_kits_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      messages: {
        Row: {
          application_id: string | null
          content: string
          created_at: string
          id: string
          is_read: boolean | null
          receiver_id: string
          sender_id: string
        }
        Insert: {
          application_id?: string | null
          content: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id: string
          sender_id: string
        }
        Update: {
          application_id?: string | null
          content?: string
          created_at?: string
          id?: string
          is_read?: boolean | null
          receiver_id?: string
          sender_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "messages_sender_id_fkey"
            columns: ["sender_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_accounts: {
        Row: {
          ad_account_id: string
          ad_account_name: string
          connected_at: string | null
          created_at: string | null
          currency: string
          host_id: string
          id: string
          is_active: boolean | null
          last_synced_at: string | null
          metadata: Json | null
          timezone: string | null
          updated_at: string | null
        }
        Insert: {
          ad_account_id: string
          ad_account_name: string
          connected_at?: string | null
          created_at?: string | null
          currency?: string
          host_id: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Update: {
          ad_account_id?: string
          ad_account_name?: string
          connected_at?: string | null
          created_at?: string | null
          currency?: string
          host_id?: string
          id?: string
          is_active?: boolean | null
          last_synced_at?: string | null
          metadata?: Json | null
          timezone?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_accounts_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_campaigns: {
        Row: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          created_at: string | null
          currency: string | null
          daily_budget: number | null
          end_time: string | null
          host_id: string
          id: string
          lifetime_budget: number | null
          objective: string
          property_id: string | null
          start_time: string
          status: string
          updated_at: string | null
        }
        Insert: {
          ad_account_id: string
          campaign_id: string
          campaign_name: string
          created_at?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_time?: string | null
          host_id: string
          id?: string
          lifetime_budget?: number | null
          objective: string
          property_id?: string | null
          start_time: string
          status?: string
          updated_at?: string | null
        }
        Update: {
          ad_account_id?: string
          campaign_id?: string
          campaign_name?: string
          created_at?: string | null
          currency?: string | null
          daily_budget?: number | null
          end_time?: string | null
          host_id?: string
          id?: string
          lifetime_budget?: number | null
          objective?: string
          property_id?: string | null
          start_time?: string
          status?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_campaigns_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ad_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "meta_ad_campaigns_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_creatives: {
        Row: {
          ad_id: string
          ad_name: string
          ad_set_id: string
          call_to_action: string | null
          created_at: string | null
          creative_type: string
          description: string | null
          headline: string | null
          id: string
          image_url: string | null
          link_url: string | null
          status: string
          thumbnail_url: string | null
          updated_at: string | null
          video_url: string | null
        }
        Insert: {
          ad_id: string
          ad_name: string
          ad_set_id: string
          call_to_action?: string | null
          created_at?: string | null
          creative_type: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Update: {
          ad_id?: string
          ad_name?: string
          ad_set_id?: string
          call_to_action?: string | null
          created_at?: string | null
          creative_type?: string
          description?: string | null
          headline?: string | null
          id?: string
          image_url?: string | null
          link_url?: string | null
          status?: string
          thumbnail_url?: string | null
          updated_at?: string | null
          video_url?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_creatives_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_sets"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_insights: {
        Row: {
          ad_id: string | null
          ad_set_id: string | null
          campaign_id: string | null
          clicks: number | null
          conversions: number | null
          cpc: number | null
          cpm: number | null
          created_at: string | null
          ctr: number | null
          date: string
          id: string
          impressions: number | null
          reach: number | null
          spend: number | null
        }
        Insert: {
          ad_id?: string | null
          ad_set_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date: string
          id?: string
          impressions?: number | null
          reach?: number | null
          spend?: number | null
        }
        Update: {
          ad_id?: string | null
          ad_set_id?: string | null
          campaign_id?: string | null
          clicks?: number | null
          conversions?: number | null
          cpc?: number | null
          cpm?: number | null
          created_at?: string | null
          ctr?: number | null
          date?: string
          id?: string
          impressions?: number | null
          reach?: number | null
          spend?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_insights_ad_id_fkey"
            columns: ["ad_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_creatives"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ad_insights_ad_set_id_fkey"
            columns: ["ad_set_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_sets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "meta_ad_insights_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      meta_ad_sets: {
        Row: {
          ad_set_id: string
          ad_set_name: string
          bid_amount: number | null
          campaign_id: string
          created_at: string | null
          daily_budget: number | null
          id: string
          placement: Json | null
          status: string
          targeting: Json | null
          updated_at: string | null
        }
        Insert: {
          ad_set_id: string
          ad_set_name: string
          bid_amount?: number | null
          campaign_id: string
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          placement?: Json | null
          status?: string
          targeting?: Json | null
          updated_at?: string | null
        }
        Update: {
          ad_set_id?: string
          ad_set_name?: string
          bid_amount?: number | null
          campaign_id?: string
          created_at?: string | null
          daily_budget?: number | null
          id?: string
          placement?: Json | null
          status?: string
          targeting?: Json | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "meta_ad_sets_campaign_id_fkey"
            columns: ["campaign_id"]
            isOneToOne: false
            referencedRelation: "meta_ad_campaigns"
            referencedColumns: ["id"]
          },
        ]
      }
      mutual_matches: {
        Row: {
          conversation_started: boolean | null
          id: string
          last_interaction_at: string | null
          match_context: Json | null
          match_score: number | null
          matched_at: string | null
          property_id: string | null
          user1_id: string
          user2_id: string
        }
        Insert: {
          conversation_started?: boolean | null
          id?: string
          last_interaction_at?: string | null
          match_context?: Json | null
          match_score?: number | null
          matched_at?: string | null
          property_id?: string | null
          user1_id: string
          user2_id: string
        }
        Update: {
          conversation_started?: boolean | null
          id?: string
          last_interaction_at?: string | null
          match_context?: Json | null
          match_score?: number | null
          matched_at?: string | null
          property_id?: string | null
          user1_id?: string
          user2_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "mutual_matches_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "mutual_matches_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_matches_user1_id_fkey"
            columns: ["user1_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "mutual_matches_user2_id_fkey"
            columns: ["user2_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          related_id: string | null
          title: string
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          related_id?: string | null
          title: string
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          related_id?: string | null
          title?: string
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      onboarding_progress: {
        Row: {
          completed_at: string | null
          completed_steps: Json | null
          completion_percentage: number | null
          current_step: number | null
          id: string
          last_activity_at: string
          metadata: Json | null
          started_at: string
          total_steps: number | null
          user_id: string
        }
        Insert: {
          completed_at?: string | null
          completed_steps?: Json | null
          completion_percentage?: number | null
          current_step?: number | null
          id?: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          total_steps?: number | null
          user_id: string
        }
        Update: {
          completed_at?: string | null
          completed_steps?: Json | null
          completion_percentage?: number | null
          current_step?: number | null
          id?: string
          last_activity_at?: string
          metadata?: Json | null
          started_at?: string
          total_steps?: number | null
          user_id?: string
        }
        Relationships: []
      }
      payment_methods: {
        Row: {
          card_brand: string | null
          card_last4: string | null
          created_at: string
          id: string
          is_default: boolean | null
          stripe_payment_method_id: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          card_brand?: string | null
          card_last4?: string | null
          created_at?: string
          id?: string
          is_default?: boolean | null
          stripe_payment_method_id?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      payouts: {
        Row: {
          amount: number
          arrival_date: string | null
          created_at: string
          currency: string | null
          failure_reason: string | null
          id: string
          influencer_id: string
          payout_method: string
          status: string | null
          stripe_payout_id: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          arrival_date?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          id?: string
          influencer_id: string
          payout_method: string
          status?: string | null
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          arrival_date?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          id?: string
          influencer_id?: string
          payout_method?: string
          status?: string | null
          stripe_payout_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      platform_metrics_snapshot: {
        Row: {
          created_at: string
          date: string
          id: string
          metrics_data: Json
        }
        Insert: {
          created_at?: string
          date: string
          id?: string
          metrics_data?: Json
        }
        Update: {
          created_at?: string
          date?: string
          id?: string
          metrics_data?: Json
        }
        Relationships: []
      }
      platform_settings: {
        Row: {
          category: string
          created_at: string | null
          description: string
          id: string
          is_public: boolean | null
          key: string
          type: string
          updated_at: string | null
          updated_by: string | null
          value: Json
        }
        Insert: {
          category: string
          created_at?: string | null
          description: string
          id?: string
          is_public?: boolean | null
          key: string
          type: string
          updated_at?: string | null
          updated_by?: string | null
          value: Json
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string
          id?: string
          is_public?: boolean | null
          key?: string
          type?: string
          updated_at?: string | null
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      point_transactions: {
        Row: {
          action_type: string
          created_at: string
          description: string
          id: string
          points: number
          related_id: string | null
          related_type: string | null
          user_id: string
        }
        Insert: {
          action_type: string
          created_at?: string
          description: string
          id?: string
          points: number
          related_id?: string | null
          related_type?: string | null
          user_id: string
        }
        Update: {
          action_type?: string
          created_at?: string
          description?: string
          id?: string
          points?: number
          related_id?: string | null
          related_type?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "point_transactions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      popup_events: {
        Row: {
          created_at: string
          cta_user_type: string | null
          event_type: string
          id: string
          metadata: Json
          path: string | null
          popup_name: string
          referrer: string | null
          session_id: string
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string
          cta_user_type?: string | null
          event_type: string
          id?: string
          metadata?: Json
          path?: string | null
          popup_name?: string
          referrer?: string | null
          session_id: string
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string
          cta_user_type?: string | null
          event_type?: string
          id?: string
          metadata?: Json
          path?: string | null
          popup_name?: string
          referrer?: string | null
          session_id?: string
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      post_media: {
        Row: {
          container_id: string | null
          created_at: string | null
          id: string
          media_type: string
          media_url: string
          scheduled_post_id: string | null
          upload_status: string | null
          user_id: string | null
        }
        Insert: {
          container_id?: string | null
          created_at?: string | null
          id?: string
          media_type: string
          media_url: string
          scheduled_post_id?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Update: {
          container_id?: string | null
          created_at?: string | null
          id?: string
          media_type?: string
          media_url?: string
          scheduled_post_id?: string | null
          upload_status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "post_media_scheduled_post_id_fkey"
            columns: ["scheduled_post_id"]
            isOneToOne: false
            referencedRelation: "scheduled_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          account_tier: string | null
          admin_notes: string | null
          ban_reason: string | null
          banned_at: string | null
          banned_by_admin_id: string | null
          bio: string | null
          created_at: string
          engagement_score: number | null
          first_name: string | null
          id: string
          is_active: boolean | null
          is_banned: boolean | null
          last_login_at: string | null
          last_name: string | null
          lifecycle_stage: string | null
          location: string | null
          login_count: number | null
          phone: string | null
          premium_override: boolean | null
          premium_override_expires_at: string | null
          profile_photo_url: string | null
          referred_by_code: string | null
          stripe_customer_id: string | null
          updated_at: string
          user_type: string | null
          username: string | null
          verified: boolean | null
          welcome_email_sent: boolean | null
          welcome_email_sent_at: string | null
        }
        Insert: {
          account_tier?: string | null
          admin_notes?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by_admin_id?: string | null
          bio?: string | null
          created_at?: string
          engagement_score?: number | null
          first_name?: string | null
          id: string
          is_active?: boolean | null
          is_banned?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          lifecycle_stage?: string | null
          location?: string | null
          login_count?: number | null
          phone?: string | null
          premium_override?: boolean | null
          premium_override_expires_at?: string | null
          profile_photo_url?: string | null
          referred_by_code?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          verified?: boolean | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Update: {
          account_tier?: string | null
          admin_notes?: string | null
          ban_reason?: string | null
          banned_at?: string | null
          banned_by_admin_id?: string | null
          bio?: string | null
          created_at?: string
          engagement_score?: number | null
          first_name?: string | null
          id?: string
          is_active?: boolean | null
          is_banned?: boolean | null
          last_login_at?: string | null
          last_name?: string | null
          lifecycle_stage?: string | null
          location?: string | null
          login_count?: number | null
          phone?: string | null
          premium_override?: boolean | null
          premium_override_expires_at?: string | null
          profile_photo_url?: string | null
          referred_by_code?: string | null
          stripe_customer_id?: string | null
          updated_at?: string
          user_type?: string | null
          username?: string | null
          verified?: boolean | null
          welcome_email_sent?: boolean | null
          welcome_email_sent_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_banned_by_admin_id_fkey"
            columns: ["banned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "profiles_banned_by_admin_id_fkey"
            columns: ["banned_by_admin_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      properties: {
        Row: {
          admin_deactivated: boolean | null
          admin_notes: string | null
          amenities: string[] | null
          base_nightly_rate: number | null
          bathrooms: number | null
          bedrooms: number | null
          campaign_rate: number | null
          collaboration_type: string
          content_requirements: string[] | null
          created_at: string
          creator_payout: number | null
          currency: string | null
          description: string | null
          discount_percentage: number | null
          host_id: string
          ical_last_synced_at: string | null
          ical_sync_enabled: boolean | null
          id: string
          is_active: boolean | null
          location: string
          max_guests: number
          payment_status: string | null
          platform_fee: number | null
          property_type: string
          stripe_checkout_session_id: string | null
          stripe_payment_intent_id: string | null
          title: string
          updated_at: string
        }
        Insert: {
          admin_deactivated?: boolean | null
          admin_notes?: string | null
          amenities?: string[] | null
          base_nightly_rate?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          campaign_rate?: number | null
          collaboration_type: string
          content_requirements?: string[] | null
          created_at?: string
          creator_payout?: number | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          host_id: string
          ical_last_synced_at?: string | null
          ical_sync_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          location: string
          max_guests?: number
          payment_status?: string | null
          platform_fee?: number | null
          property_type: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title: string
          updated_at?: string
        }
        Update: {
          admin_deactivated?: boolean | null
          admin_notes?: string | null
          amenities?: string[] | null
          base_nightly_rate?: number | null
          bathrooms?: number | null
          bedrooms?: number | null
          campaign_rate?: number | null
          collaboration_type?: string
          content_requirements?: string[] | null
          created_at?: string
          creator_payout?: number | null
          currency?: string | null
          description?: string | null
          discount_percentage?: number | null
          host_id?: string
          ical_last_synced_at?: string | null
          ical_sync_enabled?: boolean | null
          id?: string
          is_active?: boolean | null
          location?: string
          max_guests?: number
          payment_status?: string | null
          platform_fee?: number | null
          property_type?: string
          stripe_checkout_session_id?: string | null
          stripe_payment_intent_id?: string | null
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "properties_host_id_fkey"
            columns: ["host_id"]
            isOneToOne: false
            referencedRelation: "hosts"
            referencedColumns: ["id"]
          },
        ]
      }
      property_calendar_events: {
        Row: {
          created_at: string
          end_date: string
          event_uid: string
          id: string
          is_blocked: boolean | null
          property_id: string
          source: string | null
          start_date: string
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          end_date: string
          event_uid: string
          id?: string
          is_blocked?: boolean | null
          property_id: string
          source?: string | null
          start_date: string
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          end_date?: string
          event_uid?: string
          id?: string
          is_blocked?: boolean | null
          property_id?: string
          source?: string | null
          start_date?: string
          title?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_calendar_events_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      property_images: {
        Row: {
          created_at: string
          display_order: number | null
          id: string
          image_url: string
          is_primary: boolean | null
          property_id: string
        }
        Insert: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url: string
          is_primary?: boolean | null
          property_id: string
        }
        Update: {
          created_at?: string
          display_order?: number | null
          id?: string
          image_url?: string
          is_primary?: boolean | null
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "property_images_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      rate_limits: {
        Row: {
          created_at: string | null
          id: string
          is_active: boolean | null
          limit_count: number
          resource: string
          updated_at: string | null
          user_type: string | null
          window_seconds: number
        }
        Insert: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          limit_count: number
          resource: string
          updated_at?: string | null
          user_type?: string | null
          window_seconds: number
        }
        Update: {
          created_at?: string | null
          id?: string
          is_active?: boolean | null
          limit_count?: number
          resource?: string
          updated_at?: string | null
          user_type?: string | null
          window_seconds?: number
        }
        Relationships: []
      }
      referral_codes: {
        Row: {
          code: string
          created_at: string
          id: string
          is_active: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          is_active?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_codes_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      referral_commissions: {
        Row: {
          admin_notes: string | null
          commission_amount: number
          commission_percentage: number
          created_at: string
          id: string
          paid_at: string | null
          referral_id: string
          referrer_id: string
          status: string
          subscription_period_end: string
          subscription_period_start: string
          updated_at: string
        }
        Insert: {
          admin_notes?: string | null
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id: string
          referrer_id: string
          status?: string
          subscription_period_end: string
          subscription_period_start: string
          updated_at?: string
        }
        Update: {
          admin_notes?: string | null
          commission_amount?: number
          commission_percentage?: number
          created_at?: string
          id?: string
          paid_at?: string | null
          referral_id?: string
          referrer_id?: string
          status?: string
          subscription_period_end?: string
          subscription_period_start?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referral_commissions_referral_id_fkey"
            columns: ["referral_id"]
            isOneToOne: false
            referencedRelation: "referrals"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referral_commissions_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      referrals: {
        Row: {
          created_at: string
          id: string
          referral_code_id: string
          referred_user_id: string
          referrer_id: string
          status: string
          subscription_id: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          referral_code_id: string
          referred_user_id: string
          referrer_id: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          referral_code_id?: string
          referred_user_id?: string
          referrer_id?: string
          status?: string
          subscription_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "referrals_referral_code_id_fkey"
            columns: ["referral_code_id"]
            isOneToOne: false
            referencedRelation: "referral_codes"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referred_user_id_fkey"
            columns: ["referred_user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_referrer_id_fkey"
            columns: ["referrer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "referrals_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_bookings: {
        Row: {
          approved_by_owner_at: string | null
          booking_date: string
          booking_time: string
          cancellation_reason: string | null
          cancelled_by: string | null
          collaboration_type: string
          completed_at: string | null
          content_deadline: string | null
          content_deliverables: string[] | null
          content_delivery_status: string | null
          created_at: string | null
          currency: string | null
          decline_reason: string | null
          delivered_at: string | null
          id: string
          influencer_id: string
          meal_type: string
          party_size: number
          proposal_message: string | null
          proposed_rate: number | null
          restaurant_id: string
          reviewed_at: string | null
          special_requests: string | null
          status: string | null
          updated_at: string | null
        }
        Insert: {
          approved_by_owner_at?: string | null
          booking_date: string
          booking_time: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          collaboration_type: string
          completed_at?: string | null
          content_deadline?: string | null
          content_deliverables?: string[] | null
          content_delivery_status?: string | null
          created_at?: string | null
          currency?: string | null
          decline_reason?: string | null
          delivered_at?: string | null
          id?: string
          influencer_id: string
          meal_type: string
          party_size?: number
          proposal_message?: string | null
          proposed_rate?: number | null
          restaurant_id: string
          reviewed_at?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Update: {
          approved_by_owner_at?: string | null
          booking_date?: string
          booking_time?: string
          cancellation_reason?: string | null
          cancelled_by?: string | null
          collaboration_type?: string
          completed_at?: string | null
          content_deadline?: string | null
          content_deliverables?: string[] | null
          content_delivery_status?: string | null
          created_at?: string | null
          currency?: string | null
          decline_reason?: string | null
          delivered_at?: string | null
          id?: string
          influencer_id?: string
          meal_type?: string
          party_size?: number
          proposal_message?: string | null
          proposed_rate?: number | null
          restaurant_id?: string
          reviewed_at?: string | null
          special_requests?: string | null
          status?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_cancelled_by_fkey"
            columns: ["cancelled_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_bookings_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_images: {
        Row: {
          caption: string | null
          created_at: string | null
          display_order: number | null
          id: string
          image_type: string | null
          image_url: string
          is_primary: boolean | null
          restaurant_id: string
        }
        Insert: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url: string
          is_primary?: boolean | null
          restaurant_id: string
        }
        Update: {
          caption?: string | null
          created_at?: string | null
          display_order?: number | null
          id?: string
          image_type?: string | null
          image_url?: string
          is_primary?: boolean | null
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_images_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_menus: {
        Row: {
          category: string
          created_at: string | null
          description: string | null
          dietary_tags: string[] | null
          display_order: number | null
          id: string
          image_url: string | null
          is_available: boolean | null
          is_signature_dish: boolean | null
          item_name: string
          restaurant_id: string
          updated_at: string | null
        }
        Insert: {
          category: string
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_signature_dish?: boolean | null
          item_name: string
          restaurant_id: string
          updated_at?: string | null
        }
        Update: {
          category?: string
          created_at?: string | null
          description?: string | null
          dietary_tags?: string[] | null
          display_order?: number | null
          id?: string
          image_url?: string | null
          is_available?: boolean | null
          is_signature_dish?: boolean | null
          item_name?: string
          restaurant_id?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_owners: {
        Row: {
          average_rating: number | null
          business_license_number: string | null
          business_name: string
          created_at: string | null
          id: string
          rejection_reason: string | null
          response_rate: number | null
          total_collaborations: number | null
          updated_at: string | null
          verification_documents: Json | null
          verification_status: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          average_rating?: number | null
          business_license_number?: string | null
          business_name: string
          created_at?: string | null
          id: string
          rejection_reason?: string | null
          response_rate?: number | null
          total_collaborations?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          average_rating?: number | null
          business_license_number?: string | null
          business_name?: string
          created_at?: string | null
          id?: string
          rejection_reason?: string | null
          response_rate?: number | null
          total_collaborations?: number | null
          updated_at?: string | null
          verification_documents?: Json | null
          verification_status?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_owners_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_owners_id_fkey"
            columns: ["id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_owners_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_owners_verified_by_fkey"
            columns: ["verified_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurant_reviews: {
        Row: {
          ambiance_rating: number | null
          booking_id: string
          created_at: string | null
          food_quality: number | null
          id: string
          rating: number
          restaurant_id: string
          review_text: string | null
          reviewer_id: string
          reviewer_type: string
          service_quality: number | null
          updated_at: string | null
          would_recommend: boolean | null
        }
        Insert: {
          ambiance_rating?: number | null
          booking_id: string
          created_at?: string | null
          food_quality?: number | null
          id?: string
          rating: number
          restaurant_id: string
          review_text?: string | null
          reviewer_id: string
          reviewer_type: string
          service_quality?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Update: {
          ambiance_rating?: number | null
          booking_id?: string
          created_at?: string | null
          food_quality?: number | null
          id?: string
          rating?: number
          restaurant_id?: string
          review_text?: string | null
          reviewer_id?: string
          reviewer_type?: string
          service_quality?: number | null
          updated_at?: string | null
          would_recommend?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurant_reviews_booking_id_fkey"
            columns: ["booking_id"]
            isOneToOne: true
            referencedRelation: "restaurant_bookings"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reviews_restaurant_id_fkey"
            columns: ["restaurant_id"]
            isOneToOne: false
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurant_reviews_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      restaurants: {
        Row: {
          address: string
          admin_deactivated: boolean | null
          admin_notes: string | null
          advance_booking_hours: number | null
          ambiance: string[] | null
          average_rating: number | null
          booking_slots: Json
          city: string
          collaboration_types: string[]
          content_requirements: string[] | null
          country: string
          created_at: string | null
          cuisine_types: string[]
          currency: string | null
          description: string | null
          dietary_options: string[] | null
          dining_style: string
          featured: boolean | null
          has_outdoor_seating: boolean | null
          has_private_dining: boolean | null
          id: string
          is_active: boolean | null
          latitude: number | null
          longitude: number | null
          max_party_size: number | null
          meal_types: string[]
          min_follower_count: number | null
          name: string
          operating_hours: Json | null
          owner_id: string
          paid_rate_max: number | null
          paid_rate_min: number | null
          parking_available: boolean | null
          price_range: string
          seating_capacity: number | null
          state: string | null
          updated_at: string | null
        }
        Insert: {
          address: string
          admin_deactivated?: boolean | null
          admin_notes?: string | null
          advance_booking_hours?: number | null
          ambiance?: string[] | null
          average_rating?: number | null
          booking_slots?: Json
          city: string
          collaboration_types?: string[]
          content_requirements?: string[] | null
          country: string
          created_at?: string | null
          cuisine_types?: string[]
          currency?: string | null
          description?: string | null
          dietary_options?: string[] | null
          dining_style: string
          featured?: boolean | null
          has_outdoor_seating?: boolean | null
          has_private_dining?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_party_size?: number | null
          meal_types?: string[]
          min_follower_count?: number | null
          name: string
          operating_hours?: Json | null
          owner_id: string
          paid_rate_max?: number | null
          paid_rate_min?: number | null
          parking_available?: boolean | null
          price_range: string
          seating_capacity?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string
          admin_deactivated?: boolean | null
          admin_notes?: string | null
          advance_booking_hours?: number | null
          ambiance?: string[] | null
          average_rating?: number | null
          booking_slots?: Json
          city?: string
          collaboration_types?: string[]
          content_requirements?: string[] | null
          country?: string
          created_at?: string | null
          cuisine_types?: string[]
          currency?: string | null
          description?: string | null
          dietary_options?: string[] | null
          dining_style?: string
          featured?: boolean | null
          has_outdoor_seating?: boolean | null
          has_private_dining?: boolean | null
          id?: string
          is_active?: boolean | null
          latitude?: number | null
          longitude?: number | null
          max_party_size?: number | null
          meal_types?: string[]
          min_follower_count?: number | null
          name?: string
          operating_hours?: Json | null
          owner_id?: string
          paid_rate_max?: number | null
          paid_rate_min?: number | null
          parking_available?: boolean | null
          price_range?: string
          seating_capacity?: number | null
          state?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            isOneToOne: false
            referencedRelation: "restaurant_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      reviews_and_ratings: {
        Row: {
          admin_notes: string | null
          admin_reviewed_at: string | null
          admin_reviewed_by: string | null
          agreement_id: string | null
          brand_agreement_id: string | null
          communication_rating: number | null
          created_at: string
          flag_reason: string | null
          flagged_at: string | null
          flagged_by: string | null
          id: string
          is_flagged: boolean | null
          is_hidden: boolean | null
          is_public: boolean | null
          professionalism_rating: number | null
          quality_rating: number | null
          rating: number
          review_text: string | null
          reviewee_id: string
          reviewer_id: string
          reviewer_type: string
          updated_at: string
          would_work_again: boolean | null
        }
        Insert: {
          admin_notes?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          agreement_id?: string | null
          brand_agreement_id?: string | null
          communication_rating?: number | null
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          is_public?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating: number
          review_text?: string | null
          reviewee_id: string
          reviewer_id: string
          reviewer_type: string
          updated_at?: string
          would_work_again?: boolean | null
        }
        Update: {
          admin_notes?: string | null
          admin_reviewed_at?: string | null
          admin_reviewed_by?: string | null
          agreement_id?: string | null
          brand_agreement_id?: string | null
          communication_rating?: number | null
          created_at?: string
          flag_reason?: string | null
          flagged_at?: string | null
          flagged_by?: string | null
          id?: string
          is_flagged?: boolean | null
          is_hidden?: boolean | null
          is_public?: boolean | null
          professionalism_rating?: number | null
          quality_rating?: number | null
          rating?: number
          review_text?: string | null
          reviewee_id?: string
          reviewer_id?: string
          reviewer_type?: string
          updated_at?: string
          would_work_again?: boolean | null
        }
        Relationships: [
          {
            foreignKeyName: "reviews_and_ratings_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_brand_agreement_id_fkey"
            columns: ["brand_agreement_id"]
            isOneToOne: false
            referencedRelation: "brand_collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_reviewee_id_fkey"
            columns: ["reviewee_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "reviews_and_ratings_reviewer_id_fkey"
            columns: ["reviewer_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      saved_segments: {
        Row: {
          created_at: string
          created_by: string | null
          description: string | null
          filter_json: Json
          id: string
          is_smart: boolean
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_json?: Json
          id?: string
          is_smart?: boolean
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description?: string | null
          filter_json?: Json
          id?: string
          is_smart?: boolean
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      scheduled_posts: {
        Row: {
          caption: string | null
          content_type: string
          created_at: string | null
          error_message: string | null
          id: string
          media_urls: string[] | null
          platform: string
          platform_post_id: string | null
          post_type: string
          published_at: string | null
          scheduled_for: string
          social_account_id: string | null
          status: string | null
          user_id: string | null
        }
        Insert: {
          caption?: string | null
          content_type: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform: string
          platform_post_id?: string | null
          post_type: string
          published_at?: string | null
          scheduled_for: string
          social_account_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Update: {
          caption?: string | null
          content_type?: string
          created_at?: string | null
          error_message?: string | null
          id?: string
          media_urls?: string[] | null
          platform?: string
          platform_post_id?: string | null
          post_type?: string
          published_at?: string | null
          scheduled_for?: string
          social_account_id?: string | null
          status?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "scheduled_posts_social_account_id_fkey"
            columns: ["social_account_id"]
            isOneToOne: false
            referencedRelation: "social_accounts"
            referencedColumns: ["id"]
          },
        ]
      }
      social_accounts: {
        Row: {
          access_token: string | null
          analytics_data: Json | null
          can_publish: boolean | null
          connected_at: string | null
          created_at: string
          follower_count: number | null
          id: string
          influencer_id: string
          instagram_business_account_id: string | null
          is_verified: boolean | null
          last_sync_at: string | null
          last_updated: string | null
          page_access_token: string | null
          page_id: string | null
          page_name: string | null
          platform: string
          platform_user_id: string | null
          profile_url: string | null
          publishing_scopes: string[] | null
          refresh_token: string | null
          sync_enabled: boolean | null
          token_expires_at: string | null
          username: string
        }
        Insert: {
          access_token?: string | null
          analytics_data?: Json | null
          can_publish?: boolean | null
          connected_at?: string | null
          created_at?: string
          follower_count?: number | null
          id?: string
          influencer_id: string
          instagram_business_account_id?: string | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          last_updated?: string | null
          page_access_token?: string | null
          page_id?: string | null
          page_name?: string | null
          platform: string
          platform_user_id?: string | null
          profile_url?: string | null
          publishing_scopes?: string[] | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          username: string
        }
        Update: {
          access_token?: string | null
          analytics_data?: Json | null
          can_publish?: boolean | null
          connected_at?: string | null
          created_at?: string
          follower_count?: number | null
          id?: string
          influencer_id?: string
          instagram_business_account_id?: string | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          last_updated?: string | null
          page_access_token?: string | null
          page_id?: string | null
          page_name?: string | null
          platform?: string
          platform_user_id?: string | null
          profile_url?: string | null
          publishing_scopes?: string[] | null
          refresh_token?: string | null
          sync_enabled?: boolean | null
          token_expires_at?: string | null
          username?: string
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_check_ins: {
        Row: {
          agreement_id: string
          check_in_notes: string | null
          check_in_photo_url: string | null
          check_out_notes: string | null
          checked_in_at: string | null
          checked_out_at: string | null
          created_at: string
          creator_id: string
          id: string
          updated_at: string
        }
        Insert: {
          agreement_id: string
          check_in_notes?: string | null
          check_in_photo_url?: string | null
          check_out_notes?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          creator_id: string
          id?: string
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          check_in_notes?: string | null
          check_in_photo_url?: string | null
          check_out_notes?: string | null
          checked_in_at?: string | null
          checked_out_at?: string | null
          created_at?: string
          creator_id?: string
          id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_check_ins_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_check_ins_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: true
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
        ]
      }
      stay_deliverables: {
        Row: {
          agreement_id: string
          approved_at: string | null
          content_post_id: string | null
          created_at: string
          creator_id: string
          day_number: number
          deliverable_type: string
          due_date: string | null
          host_feedback: string | null
          id: string
          status: string
          submitted_at: string | null
          updated_at: string
        }
        Insert: {
          agreement_id: string
          approved_at?: string | null
          content_post_id?: string | null
          created_at?: string
          creator_id: string
          day_number: number
          deliverable_type?: string
          due_date?: string | null
          host_feedback?: string | null
          id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Update: {
          agreement_id?: string
          approved_at?: string | null
          content_post_id?: string | null
          created_at?: string
          creator_id?: string
          day_number?: number
          deliverable_type?: string
          due_date?: string | null
          host_feedback?: string | null
          id?: string
          status?: string
          submitted_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stay_deliverables_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_deliverables_agreement_id_fkey"
            columns: ["agreement_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stay_deliverables_content_post_id_fkey"
            columns: ["content_post_id"]
            isOneToOne: false
            referencedRelation: "content_posts"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          features: Json | null
          has_advanced_analytics: boolean | null
          has_ai_matching: boolean | null
          has_media_kit: boolean | null
          has_verified_badge: boolean | null
          id: string
          is_active: boolean | null
          marketplace_boosts_per_month: number | null
          max_applications_per_month: number | null
          max_brand_partnerships: number | null
          max_campaigns: number | null
          max_listings: number | null
          max_outbound_invites_per_month: number | null
          max_pitches_per_month: number | null
          max_profile_views_per_month: number | null
          name: string
          price_monthly: number
          price_yearly: number | null
          search_priority: number | null
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
          team_seats: number | null
          trial_days: number | null
          updated_at: string
          user_type_category: string | null
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          has_advanced_analytics?: boolean | null
          has_ai_matching?: boolean | null
          has_media_kit?: boolean | null
          has_verified_badge?: boolean | null
          id?: string
          is_active?: boolean | null
          marketplace_boosts_per_month?: number | null
          max_applications_per_month?: number | null
          max_brand_partnerships?: number | null
          max_campaigns?: number | null
          max_listings?: number | null
          max_outbound_invites_per_month?: number | null
          max_pitches_per_month?: number | null
          max_profile_views_per_month?: number | null
          name: string
          price_monthly: number
          price_yearly?: number | null
          search_priority?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          team_seats?: number | null
          trial_days?: number | null
          updated_at?: string
          user_type_category?: string | null
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          features?: Json | null
          has_advanced_analytics?: boolean | null
          has_ai_matching?: boolean | null
          has_media_kit?: boolean | null
          has_verified_badge?: boolean | null
          id?: string
          is_active?: boolean | null
          marketplace_boosts_per_month?: number | null
          max_applications_per_month?: number | null
          max_brand_partnerships?: number | null
          max_campaigns?: number | null
          max_listings?: number | null
          max_outbound_invites_per_month?: number | null
          max_pitches_per_month?: number | null
          max_profile_views_per_month?: number | null
          name?: string
          price_monthly?: number
          price_yearly?: number | null
          search_priority?: number | null
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
          team_seats?: number | null
          trial_days?: number | null
          updated_at?: string
          user_type_category?: string | null
        }
        Relationships: []
      }
      subscription_usage: {
        Row: {
          applications_count: number | null
          brand_partnerships_count: number | null
          created_at: string
          id: string
          period_end: string
          period_start: string
          subscription_id: string
          updated_at: string
        }
        Insert: {
          applications_count?: number | null
          brand_partnerships_count?: number | null
          created_at?: string
          id?: string
          period_end: string
          period_start: string
          subscription_id: string
          updated_at?: string
        }
        Update: {
          applications_count?: number | null
          brand_partnerships_count?: number | null
          created_at?: string
          id?: string
          period_end?: string
          period_start?: string
          subscription_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_usage_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          billing_interval: string
          cancel_at_period_end: boolean | null
          canceled_at: string | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          influencer_id: string
          plan_id: string
          status: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          trial_end: string | null
          trial_start: string | null
          updated_at: string
        }
        Insert: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          influencer_id: string
          plan_id: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Update: {
          billing_interval?: string
          cancel_at_period_end?: boolean | null
          canceled_at?: string | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          influencer_id?: string
          plan_id?: string
          status?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          trial_end?: string | null
          trial_start?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
        ]
      }
      support_categories: {
        Row: {
          created_at: string
          description: string | null
          display_order: number | null
          icon: string | null
          id: string
          is_active: boolean | null
          name: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          description?: string | null
          display_order?: number | null
          icon?: string | null
          id?: string
          is_active?: boolean | null
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      support_ticket_messages: {
        Row: {
          attachments: string[] | null
          created_at: string
          id: string
          is_admin_reply: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Insert: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          is_admin_reply?: boolean | null
          message: string
          ticket_id: string
          user_id: string
        }
        Update: {
          attachments?: string[] | null
          created_at?: string
          id?: string
          is_admin_reply?: boolean | null
          message?: string
          ticket_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_ticket_messages_ticket_id_fkey"
            columns: ["ticket_id"]
            isOneToOne: false
            referencedRelation: "support_tickets"
            referencedColumns: ["id"]
          },
        ]
      }
      support_tickets: {
        Row: {
          assigned_admin_id: string | null
          attachments: string[] | null
          category_id: string | null
          created_at: string
          description: string
          id: string
          priority: string | null
          resolved_at: string | null
          status: string | null
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          assigned_admin_id?: string | null
          attachments?: string[] | null
          category_id?: string | null
          created_at?: string
          description: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          assigned_admin_id?: string | null
          attachments?: string[] | null
          category_id?: string | null
          created_at?: string
          description?: string
          id?: string
          priority?: string | null
          resolved_at?: string | null
          status?: string | null
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "support_tickets_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "support_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      transactions: {
        Row: {
          amount: number
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          net_amount: number | null
          payer_id: string
          platform_fee: number | null
          processed_at: string | null
          recipient_id: string | null
          related_id: string | null
          status: string
          stripe_charge_id: string | null
          stripe_payment_intent_id: string | null
          type: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payer_id: string
          platform_fee?: number | null
          processed_at?: string | null
          recipient_id?: string | null
          related_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          type: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          net_amount?: number | null
          payer_id?: string
          platform_fee?: number | null
          processed_at?: string | null
          recipient_id?: string | null
          related_id?: string | null
          status?: string
          stripe_charge_id?: string | null
          stripe_payment_intent_id?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      user_achievements: {
        Row: {
          achievement_data: Json | null
          achievement_type: string
          created_at: string
          id: string
          user_id: string
        }
        Insert: {
          achievement_data?: Json | null
          achievement_type: string
          created_at?: string
          id?: string
          user_id: string
        }
        Update: {
          achievement_data?: Json | null
          achievement_type?: string
          created_at?: string
          id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_achievements_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_activity_timeline: {
        Row: {
          activity_description: string
          activity_type: string
          created_at: string | null
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
          user_id: string
        }
        Insert: {
          activity_description: string
          activity_type: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id: string
        }
        Update: {
          activity_description?: string
          activity_type?: string
          created_at?: string | null
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_activity_timeline_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_activity_timeline_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_badges: {
        Row: {
          badge_id: string
          earned_at: string
          id: string
          metadata: Json | null
          tier_level: number | null
          user_id: string
        }
        Insert: {
          badge_id: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          tier_level?: number | null
          user_id: string
        }
        Update: {
          badge_id?: string
          earned_at?: string
          id?: string
          metadata?: Json | null
          tier_level?: number | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_badges_badge_id_fkey"
            columns: ["badge_id"]
            isOneToOne: false
            referencedRelation: "badge_definitions"
            referencedColumns: ["id"]
          },
        ]
      }
      user_follows: {
        Row: {
          created_at: string
          follower_id: string
          following_id: string
          id: string
        }
        Insert: {
          created_at?: string
          follower_id: string
          following_id: string
          id?: string
        }
        Update: {
          created_at?: string
          follower_id?: string
          following_id?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_follower_id_fkey"
            columns: ["follower_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_follows_following_id_fkey"
            columns: ["following_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_impersonation_sessions: {
        Row: {
          admin_id: string
          ended_at: string | null
          id: string
          impersonated_user_id: string
          reason: string
          session_data: Json | null
          started_at: string | null
        }
        Insert: {
          admin_id: string
          ended_at?: string | null
          id?: string
          impersonated_user_id: string
          reason: string
          session_data?: Json | null
          started_at?: string | null
        }
        Update: {
          admin_id?: string
          ended_at?: string | null
          id?: string
          impersonated_user_id?: string
          reason?: string
          session_data?: Json | null
          started_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "user_impersonation_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_impersonation_sessions_admin_id_fkey"
            columns: ["admin_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_impersonation_sessions_impersonated_user_id_fkey"
            columns: ["impersonated_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_impersonation_sessions_impersonated_user_id_fkey"
            columns: ["impersonated_user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_points: {
        Row: {
          created_at: string
          current_level: string
          id: string
          level_progress: number
          lifetime_points: number
          points_to_next_level: number
          total_points: number
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_level?: string
          id?: string
          level_progress?: number
          lifetime_points?: number
          points_to_next_level?: number
          total_points?: number
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_level?: string
          id?: string
          level_progress?: number
          lifetime_points?: number
          points_to_next_level?: number
          total_points?: number
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_points_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: true
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          created_at: string
          granted_at: string | null
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_at?: string | null
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_roles_granted_by_profiles_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_granted_by_profiles_fkey"
            columns: ["granted_by"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_roles_user_id_profiles_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "user_metrics_summary"
            referencedColumns: ["id"]
          },
        ]
      }
      waitlist: {
        Row: {
          activated_at: string | null
          created_at: string
          email: string
          id: string
          invited_at: string | null
          name: string
          status: string | null
          temp_password: string | null
          user_type: string | null
        }
        Insert: {
          activated_at?: string | null
          created_at?: string
          email: string
          id?: string
          invited_at?: string | null
          name: string
          status?: string | null
          temp_password?: string | null
          user_type?: string | null
        }
        Update: {
          activated_at?: string | null
          created_at?: string
          email?: string
          id?: string
          invited_at?: string | null
          name?: string
          status?: string | null
          temp_password?: string | null
          user_type?: string | null
        }
        Relationships: []
      }
    }
    Views: {
      collaboration_agreements_with_details: {
        Row: {
          agreed_at: string | null
          agreed_rate: number | null
          application_id: string | null
          application_id_full: string | null
          created_at: string | null
          currency: string | null
          deadline: string | null
          deliverable_count: number | null
          host_first_name: string | null
          host_id: string | null
          host_last_name: string | null
          host_username: string | null
          id: string | null
          influencer_first_name: string | null
          influencer_id: string | null
          influencer_last_name: string | null
          influencer_username: string | null
          property_id: string | null
          property_title: string | null
          property_type: string | null
          proposed_dates_end: string | null
          proposed_dates_start: string | null
          status: string | null
          updated_at: string | null
        }
        Relationships: [
          {
            foreignKeyName: "collaboration_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "applications"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "collaboration_agreements_application_id_fkey"
            columns: ["application_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["application_id_full"]
          },
        ]
      }
      creator_analytics_summary: {
        Row: {
          follower_count: number | null
          historical_data: Json | null
          influencer_id: string | null
          is_verified: boolean | null
          last_sync_at: string | null
          latest_analytics: Json | null
          platform: string | null
          sync_enabled: boolean | null
          username: string | null
        }
        Insert: {
          follower_count?: number | null
          historical_data?: never
          influencer_id?: string | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          latest_analytics?: Json | null
          platform?: string | null
          sync_enabled?: boolean | null
          username?: string | null
        }
        Update: {
          follower_count?: number | null
          historical_data?: never
          influencer_id?: string | null
          is_verified?: boolean | null
          last_sync_at?: string | null
          latest_analytics?: Json | null
          platform?: string | null
          sync_enabled?: boolean | null
          username?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "social_accounts_influencer_id_fkey"
            columns: ["influencer_id"]
            isOneToOne: false
            referencedRelation: "influencers"
            referencedColumns: ["id"]
          },
        ]
      }
      property_review_stats: {
        Row: {
          average_rating: number | null
          property_id: string | null
          review_count: number | null
        }
        Relationships: [
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "collaboration_agreements_with_details"
            referencedColumns: ["property_id"]
          },
          {
            foreignKeyName: "applications_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "properties"
            referencedColumns: ["id"]
          },
        ]
      }
      user_metrics_summary: {
        Row: {
          active_collaboration_count: number | null
          application_count: number | null
          business_name: string | null
          content_niches: string[] | null
          content_post_count: number | null
          created_at: string | null
          engagement_rate: number | null
          id: string | null
          last_login_at: string | null
          total_followers: number | null
          user_type: string | null
          verification_status: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      award_badge: {
        Args: { p_badge_name: string; p_metadata?: Json; p_user_id: string }
        Returns: string
      }
      award_points: {
        Args: {
          p_action_type: string
          p_description: string
          p_points: number
          p_related_id?: string
          p_related_type?: string
          p_user_id: string
        }
        Returns: string
      }
      calculate_platform_fee: {
        Args: { amount: number; transaction_type: string }
        Returns: number
      }
      calculate_user_level: {
        Args: { points: number }
        Returns: {
          level: string
          points_to_next: number
          progress: number
        }[]
      }
      check_mutual_match: {
        Args: {
          p_other_user_id: string
          p_property_id: string
          p_user_id: string
        }
        Returns: Json
      }
      check_subscription_status: {
        Args: { influencer_user_id: string }
        Returns: boolean
      }
      create_ambassador_commission: {
        Args: {
          p_amount: number
          p_stripe_invoice_id: string
          p_subscription_tier: string
          p_user_id: string
        }
        Returns: string
      }
      ensure_primary_images: { Args: never; Returns: undefined }
      generate_affiliate_code: {
        Args: { p_creator_name: string; p_property_name: string }
        Returns: string
      }
      generate_referral_code: { Args: { p_user_id: string }; Returns: string }
      generate_stay_deliverables: {
        Args: { p_agreement_id: string }
        Returns: number
      }
      get_featured_creators: {
        Args: { p_limit?: number }
        Returns: {
          content_niches: string[]
          first_name: string
          id: string
          instagram_url: string
          last_name: string
          location: string
          profile_photo_url: string
          total_followers: number
        }[]
      }
      get_follower_count: { Args: { user_id: string }; Returns: number }
      get_following_count: { Args: { user_id: string }; Returns: number }
      has_premium_access: { Args: { _user_id: string }; Returns: boolean }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      increment_blog_post_views: {
        Args: { post_id: string }
        Returns: undefined
      }
      increment_campaign_views: {
        Args: { campaign_id: string }
        Returns: undefined
      }
      is_application_party: {
        Args: { _application_id: string; _user_id: string }
        Returns: boolean
      }
      is_content_creator: {
        Args: { _post_id: string; _user_id: string }
        Returns: boolean
      }
      is_following: {
        Args: { follower_id: string; following_id: string }
        Returns: boolean
      }
      is_property_host: {
        Args: { _property_id: string; _user_id: string }
        Returns: boolean
      }
      sync_user_badges: { Args: { p_user_id: string }; Returns: Json }
      update_onboarding_progress: {
        Args: { p_step: number; p_step_data?: Json; p_user_id: string }
        Returns: undefined
      }
    }
    Enums: {
      app_role: "admin" | "moderator" | "user"
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
      app_role: ["admin", "moderator", "user"],
    },
  },
} as const
