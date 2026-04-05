export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type AppRole = "super_admin" | "admin" | "agent" | "user";
export type TransactionType =
  | "deposit"
  | "withdraw"
  | "bet"
  | "win"
  | "bonus"
  | "referral"
  | "commission"
  | "adjustment";
export type TransactionStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "completed"
  | "processing";
export type GameCategory = "sports" | "casino" | "lottery" | "cards" | "other";
export type BetResult = "pending" | "win" | "lose" | "draw" | "void";
export type NotificationType =
  | "info"
  | "success"
  | "warning"
  | "danger"
  | "deposit"
  | "withdraw"
  | "win"
  | "system";
export type PaymentMethodType = "upi" | "bank" | "wallet" | "crypto";
export type SettingType = "string" | "number" | "boolean" | "json";
export type SubscriptionPlan = "free" | "basic" | "pro" | "enterprise";
export type RevenueType = "subscription" | "commission" | "one_time";

export interface Database {
  public: {
    Tables: {
      tenants: {
        Row: {
          id: string;
          name: string;
          slug: string;
          domain: string | null;
          logo_url: string | null;
          primary_color: string | null;
          secondary_color: string | null;
          theme_config: Json | null;
          owner_id: string | null;
          subscription_plan: SubscriptionPlan;
          monthly_price: number | null;
          subscription_start_date: string | null;
          subscription_end_date: string | null;
          is_active: boolean | null;
          is_suspended: boolean | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["tenants"]["Row"]> & {
          name: string;
          slug: string;
        };
        Update: Partial<Database["public"]["Tables"]["tenants"]["Row"]>;
      };
      profiles: {
        Row: {
          id: string;
          tenant_id: string | null;
          phone: string | null;
          email: string | null;
          full_name: string | null;
          role: AppRole;
          balance: number;
          bonus_balance: number | null;
          total_deposited: number | null;
          total_withdrawn: number | null;
          total_won: number | null;
          total_lost: number | null;
          referral_code: string | null;
          referred_by: string | null;
          agent_id: string | null;
          is_active: boolean | null;
          is_verified: boolean | null;
          avatar_url: string | null;
          bank_account: string | null;
          ifsc_code: string | null;
          account_holder: string | null;
          upi_id: string | null;
          last_login_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["profiles"]["Row"]> & {
          id: string;
        };
        Update: Partial<Database["public"]["Tables"]["profiles"]["Row"]>;
      };
      transactions: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string;
          type: TransactionType;
          amount: number;
          balance_before: number | null;
          balance_after: number | null;
          status: TransactionStatus | null;
          payment_method: string | null;
          payment_reference: string | null;
          screenshot_url: string | null;
          upi_id: string | null;
          bank_account: string | null;
          ifsc_code: string | null;
          account_holder: string | null;
          admin_note: string | null;
          approved_by: string | null;
          approved_at: string | null;
          created_at: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["transactions"]["Row"]> & {
          user_id: string;
          type: TransactionType;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["transactions"]["Row"]>;
      };
      games: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          provider: string;
          category: GameCategory;
          thumbnail_url: string | null;
          launch_url: string | null;
          description: string | null;
          is_active: boolean | null;
          is_featured: boolean | null;
          is_hot: boolean | null;
          is_new: boolean | null;
          sort_order: number | null;
          min_bet: number | null;
          max_bet: number | null;
          tags: string[] | null;
          play_count: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["games"]["Row"]> & {
          name: string;
          provider: string;
          category: GameCategory;
        };
        Update: Partial<Database["public"]["Tables"]["games"]["Row"]>;
      };
      bets: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string;
          game_id: string;
          amount: number;
          odds: number | null;
          potential_win: number | null;
          result: BetResult | null;
          payout: number | null;
          settled_at: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["bets"]["Row"]> & {
          user_id: string;
          game_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["bets"]["Row"]>;
      };
      commissions: {
        Row: {
          id: string;
          tenant_id: string | null;
          agent_id: string;
          player_id: string;
          transaction_id: string | null;
          amount: number;
          rate: number | null;
          type: string | null;
          is_paid: boolean | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["commissions"]["Row"]> & {
          agent_id: string;
          player_id: string;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["commissions"]["Row"]>;
      };
      notifications: {
        Row: {
          id: string;
          tenant_id: string | null;
          user_id: string;
          title: string;
          body: string;
          type: NotificationType | null;
          is_read: boolean | null;
          action_url: string | null;
          metadata: Json | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["notifications"]["Row"]> & {
          user_id: string;
          title: string;
          body: string;
        };
        Update: Partial<Database["public"]["Tables"]["notifications"]["Row"]>;
      };
      otp_tokens: {
        Row: {
          id: string;
          identifier: string;
          token: string;
          purpose: string | null;
          expires_at: string;
          is_used: boolean | null;
          attempt_count: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["otp_tokens"]["Row"]> & {
          identifier: string;
          token: string;
          expires_at: string;
        };
        Update: Partial<Database["public"]["Tables"]["otp_tokens"]["Row"]>;
      };
      payment_methods: {
        Row: {
          id: string;
          tenant_id: string | null;
          name: string;
          type: PaymentMethodType;
          details: Json | null;
          is_active: boolean | null;
          for_deposit: boolean | null;
          for_withdraw: boolean | null;
          sort_order: number | null;
          min_amount: number | null;
          max_amount: number | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["payment_methods"]["Row"]> & {
          name: string;
          type: PaymentMethodType;
        };
        Update: Partial<Database["public"]["Tables"]["payment_methods"]["Row"]>;
      };
      site_settings: {
        Row: {
          key: string;
          tenant_id: string | null;
          value: string | null;
          type: SettingType | null;
          description: string | null;
          updated_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["site_settings"]["Row"]> & {
          key: string;
        };
        Update: Partial<Database["public"]["Tables"]["site_settings"]["Row"]>;
      };
      platform_revenue: {
        Row: {
          id: string;
          tenant_id: string | null;
          type: RevenueType;
          amount: number;
          currency: string | null;
          transaction_id: string | null;
          description: string | null;
          created_at: string | null;
        };
        Insert: Partial<Database["public"]["Tables"]["platform_revenue"]["Row"]> & {
          tenant_id: string;
          type: RevenueType;
          amount: number;
        };
        Update: Partial<Database["public"]["Tables"]["platform_revenue"]["Row"]>;
      };
    };
    Functions: {
      update_balance: {
        Args: {
          p_user_id: string;
          p_amount: number;
          p_type: string;
        };
        Returns: Json;
      };
      get_dashboard_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_platform_stats: {
        Args: Record<string, never>;
        Returns: Json;
      };
      get_current_tenant_id: {
        Args: Record<string, never>;
        Returns: string;
      };
      create_tenant_with_admin: {
        Args: {
          p_tenant_name: string;
          p_slug: string;
          p_domain: string;
          p_owner_email: string;
          p_owner_name: string;
          p_primary_color: string;
        };
        Returns: string;
      };
    };
  };
}

export type Profile = Database["public"]["Tables"]["profiles"]["Row"];
export type Tenant = Database["public"]["Tables"]["tenants"]["Row"];
export type Transaction = Database["public"]["Tables"]["transactions"]["Row"];
export type Game = Database["public"]["Tables"]["games"]["Row"];
export type Bet = Database["public"]["Tables"]["bets"]["Row"];
export type Commission = Database["public"]["Tables"]["commissions"]["Row"];
export type Notification = Database["public"]["Tables"]["notifications"]["Row"];
export type OtpToken = Database["public"]["Tables"]["otp_tokens"]["Row"];
export type PaymentMethod = Database["public"]["Tables"]["payment_methods"]["Row"];
export type SiteSetting = Database["public"]["Tables"]["site_settings"]["Row"];
export type PlatformRevenue = Database["public"]["Tables"]["platform_revenue"]["Row"];

export interface TenantTheme {
  primary?: string;
  secondary?: string;
  logo?: string;
  appName?: string;
  accent?: string;
}

export interface DashboardStats {
  total_users: number;
  total_agents: number;
  today_deposits: number;
  today_withdrawals: number;
  pending_deposits: number;
  pending_withdrawals: number;
  total_balance: number;
  new_users_today: number;
}

export interface PlatformStats {
  total_tenants: number;
  active_tenants: number;
  suspended_tenants: number;
  total_users: number;
  total_admins: number;
  total_revenue: number;
  monthly_revenue: number;
  pending_approvals: number;
}

export interface ReferralTreeNode {
  profile: Profile;
  directReferrals: Profile[];
  secondLevelReferrals: Profile[];
  commissions: Commission[];
}

export interface AppSession {
  id: string;
  email: string;
  role: AppRole;
  fullName: string;
  tenantId?: string;
  accessToken: string;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
}
