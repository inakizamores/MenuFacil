// Database type definitions for Supabase
import { UUID } from 'crypto';

// Define the type for social media links
export type SocialMedia = {
  facebook?: string;
  instagram?: string;
  twitter?: string;
  tiktok?: string;
  youtube?: string;
  website?: string;
};

// Define the type for business hours
export type BusinessHours = {
  monday?: { open: string; close: string; closed: boolean };
  tuesday?: { open: string; close: string; closed: boolean };
  wednesday?: { open: string; close: string; closed: boolean };
  thursday?: { open: string; close: string; closed: boolean };
  friday?: { open: string; close: string; closed: boolean };
  saturday?: { open: string; close: string; closed: boolean };
  sunday?: { open: string; close: string; closed: boolean };
};

// Define the type for billing address
export type BillingAddress = {
  street: string;
  city: string;
  state: string;
  postalCode: string;
  country: string;
};

// Define the type for nutritional information
export type NutritionalInfo = {
  calories?: number;
  protein?: number;
  carbs?: number;
  fat?: number;
  sugar?: number;
  fiber?: number;
  sodium?: number;
};

// Define the type for QR code custom design
export type QRCodeDesign = {
  foregroundColor: string;
  backgroundColor: string;
  logoUrl?: string;
  cornerRadius?: number;
  margin?: number;
};

// Define enum types
export enum TeamRole {
  Owner = 'owner',
  Admin = 'admin',
  Editor = 'editor',
  Viewer = 'viewer',
}

export enum SubscriptionStatus {
  Active = 'active',
  Trialing = 'trialing',
  PastDue = 'past_due',
  Canceled = 'canceled',
  Incomplete = 'incomplete',
  IncompleteExpired = 'incomplete_expired',
}

export enum SubscriptionTier {
  Free = 'free',
  Basic = 'basic',
  Premium = 'premium',
  Enterprise = 'enterprise',
}

// Define the core database types
export interface Tables {
  profiles: {
    Row: {
      id: UUID;
      full_name: string | null;
      avatar_url: string | null;
      billing_address: BillingAddress | null;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id: UUID;
      full_name?: string | null;
      avatar_url?: string | null;
      billing_address?: BillingAddress | null;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      full_name?: string | null;
      avatar_url?: string | null;
      billing_address?: BillingAddress | null;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  restaurants: {
    Row: {
      id: UUID;
      name: string;
      description: string | null;
      logo_url: string | null;
      primary_color: string;
      secondary_color: string;
      address: string | null;
      city: string | null;
      state: string | null;
      postal_code: string | null;
      country: string | null;
      phone: string | null;
      email: string | null;
      website: string | null;
      social_media: SocialMedia | null;
      business_hours: BusinessHours | null;
      owner_id: UUID;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      name: string;
      description?: string | null;
      logo_url?: string | null;
      primary_color?: string;
      secondary_color?: string;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      social_media?: SocialMedia | null;
      business_hours?: BusinessHours | null;
      owner_id: UUID;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      name?: string;
      description?: string | null;
      logo_url?: string | null;
      primary_color?: string;
      secondary_color?: string;
      address?: string | null;
      city?: string | null;
      state?: string | null;
      postal_code?: string | null;
      country?: string | null;
      phone?: string | null;
      email?: string | null;
      website?: string | null;
      social_media?: SocialMedia | null;
      business_hours?: BusinessHours | null;
      owner_id?: UUID;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  restaurant_members: {
    Row: {
      id: UUID;
      restaurant_id: UUID;
      user_id: UUID;
      role: TeamRole;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      restaurant_id: UUID;
      user_id: UUID;
      role?: TeamRole;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      restaurant_id?: UUID;
      user_id?: UUID;
      role?: TeamRole;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  menus: {
    Row: {
      id: UUID;
      restaurant_id: UUID;
      name: string;
      description: string | null;
      is_active: boolean;
      is_default: boolean;
      template_id: UUID | null;
      custom_css: string | null;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      restaurant_id: UUID;
      name: string;
      description?: string | null;
      is_active?: boolean;
      is_default?: boolean;
      template_id?: UUID | null;
      custom_css?: string | null;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      restaurant_id?: UUID;
      name?: string;
      description?: string | null;
      is_active?: boolean;
      is_default?: boolean;
      template_id?: UUID | null;
      custom_css?: string | null;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  menu_categories: {
    Row: {
      id: UUID;
      menu_id: UUID;
      name: string;
      description: string | null;
      image_url: string | null;
      sort_order: number;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      menu_id: UUID;
      name: string;
      description?: string | null;
      image_url?: string | null;
      sort_order?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      menu_id?: UUID;
      name?: string;
      description?: string | null;
      image_url?: string | null;
      sort_order?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  menu_items: {
    Row: {
      id: UUID;
      category_id: UUID;
      name: string;
      description: string | null;
      price: number;
      discounted_price: number | null;
      image_url: string | null;
      ingredients: string[] | null;
      allergens: string[] | null;
      nutritional_info: NutritionalInfo | null;
      dietary_options: string[] | null;
      preparation_time: number | null;
      sort_order: number;
      is_active: boolean;
      is_favorite: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      category_id: UUID;
      name: string;
      description?: string | null;
      price: number;
      discounted_price?: number | null;
      image_url?: string | null;
      ingredients?: string[] | null;
      allergens?: string[] | null;
      nutritional_info?: NutritionalInfo | null;
      dietary_options?: string[] | null;
      preparation_time?: number | null;
      sort_order?: number;
      is_active?: boolean;
      is_favorite?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      category_id?: UUID;
      name?: string;
      description?: string | null;
      price?: number;
      discounted_price?: number | null;
      image_url?: string | null;
      ingredients?: string[] | null;
      allergens?: string[] | null;
      nutritional_info?: NutritionalInfo | null;
      dietary_options?: string[] | null;
      preparation_time?: number | null;
      sort_order?: number;
      is_active?: boolean;
      is_favorite?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  menu_item_variants: {
    Row: {
      id: UUID;
      item_id: UUID;
      name: string;
      price_adjustment: number;
      is_default: boolean;
      sort_order: number;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      item_id: UUID;
      name: string;
      price_adjustment?: number;
      is_default?: boolean;
      sort_order?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      item_id?: UUID;
      name?: string;
      price_adjustment?: number;
      is_default?: boolean;
      sort_order?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  templates: {
    Row: {
      id: UUID;
      name: string;
      description: string | null;
      preview_image_url: string | null;
      html_structure: string;
      css_style: string;
      is_premium: boolean;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      name: string;
      description?: string | null;
      preview_image_url?: string | null;
      html_structure: string;
      css_style: string;
      is_premium?: boolean;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      name?: string;
      description?: string | null;
      preview_image_url?: string | null;
      html_structure?: string;
      css_style?: string;
      is_premium?: boolean;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  translations: {
    Row: {
      id: UUID;
      restaurant_id: UUID;
      entity_id: UUID;
      entity_type: string;
      field_name: string;
      language_code: string;
      translated_text: string;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      restaurant_id: UUID;
      entity_id: UUID;
      entity_type: string;
      field_name: string;
      language_code: string;
      translated_text: string;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      restaurant_id?: UUID;
      entity_id?: UUID;
      entity_type?: string;
      field_name?: string;
      language_code?: string;
      translated_text?: string;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  qr_codes: {
    Row: {
      id: UUID;
      restaurant_id: UUID;
      menu_id: UUID | null;
      name: string;
      description: string | null;
      url: string;
      image_url: string | null;
      custom_design: QRCodeDesign | null;
      table_number: string | null;
      unique_views: number;
      total_views: number;
      is_active: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      restaurant_id: UUID;
      menu_id?: UUID | null;
      name: string;
      description?: string | null;
      url: string;
      image_url?: string | null;
      custom_design?: QRCodeDesign | null;
      table_number?: string | null;
      unique_views?: number;
      total_views?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      restaurant_id?: UUID;
      menu_id?: UUID | null;
      name?: string;
      description?: string | null;
      url?: string;
      image_url?: string | null;
      custom_design?: QRCodeDesign | null;
      table_number?: string | null;
      unique_views?: number;
      total_views?: number;
      is_active?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  subscriptions: {
    Row: {
      id: UUID;
      user_id: UUID;
      stripe_customer_id: string | null;
      stripe_subscription_id: string | null;
      tier: SubscriptionTier;
      status: SubscriptionStatus;
      current_period_start: string | null;
      current_period_end: string | null;
      cancel_at_period_end: boolean;
      updated_at: string | null;
      created_at: string;
    };
    Insert: {
      id?: UUID;
      user_id: UUID;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      tier?: SubscriptionTier;
      status?: SubscriptionStatus;
      current_period_start?: string | null;
      current_period_end?: string | null;
      cancel_at_period_end?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
    Update: {
      id?: UUID;
      user_id?: UUID;
      stripe_customer_id?: string | null;
      stripe_subscription_id?: string | null;
      tier?: SubscriptionTier;
      status?: SubscriptionStatus;
      current_period_start?: string | null;
      current_period_end?: string | null;
      cancel_at_period_end?: boolean;
      updated_at?: string | null;
      created_at?: string;
    };
  };

  analytics_events: {
    Row: {
      id: UUID;
      restaurant_id: UUID;
      menu_id: UUID | null;
      item_id: UUID | null;
      qr_code_id: UUID | null;
      event_type: string;
      event_data: Record<string, any> | null;
      session_id: string | null;
      ip_address: string | null;
      user_agent: string | null;
      occurred_at: string;
    };
    Insert: {
      id?: UUID;
      restaurant_id: UUID;
      menu_id?: UUID | null;
      item_id?: UUID | null;
      qr_code_id?: UUID | null;
      event_type: string;
      event_data?: Record<string, any> | null;
      session_id?: string | null;
      ip_address?: string | null;
      user_agent?: string | null;
      occurred_at?: string;
    };
    Update: {
      id?: UUID;
      restaurant_id?: UUID;
      menu_id?: UUID | null;
      item_id?: UUID | null;
      qr_code_id?: UUID | null;
      event_type?: string;
      event_data?: Record<string, any> | null;
      session_id?: string | null;
      ip_address?: string | null;
      user_agent?: string | null;
      occurred_at?: string;
    };
  };
}

// Define database type with our tables
export interface Database {
  public: {
    Tables: Tables;
    Views: {
      [key: string]: {
        Row: Record<string, unknown>;
        Insert: Record<string, unknown>;
        Update: Record<string, unknown>;
      };
    };
    Functions: {
      [key: string]: unknown;
    };
    Enums: {
      team_role: TeamRole;
      subscription_status: SubscriptionStatus;
      subscription_tier: SubscriptionTier;
    };
  };
}

// Export commonly used types
export type Profile = Tables['profiles']['Row'];
export type Restaurant = Tables['restaurants']['Row'];
export type RestaurantMember = Tables['restaurant_members']['Row'];
export type Menu = Tables['menus']['Row'];
export type MenuCategory = Tables['menu_categories']['Row'];
export type MenuItem = Tables['menu_items']['Row'];
export type MenuItemVariant = Tables['menu_item_variants']['Row'];
export type Template = Tables['templates']['Row'];
export type Translation = Tables['translations']['Row'];
export type QRCode = Tables['qr_codes']['Row'];
export type Subscription = Tables['subscriptions']['Row'];
export type AnalyticsEvent = Tables['analytics_events']['Row']; 