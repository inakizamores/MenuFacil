export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export interface Database {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string
          full_name: string | null
          avatar_url: string | null
          billing_address: Json | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          full_name?: string | null
          avatar_url?: string | null
          billing_address?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      restaurants: {
        Row: {
          id: string
          name: string
          description: string | null
          logo_url: string | null
          primary_color: string | null
          secondary_color: string | null
          address: string | null
          city: string | null
          state: string | null
          postal_code: string | null
          country: string | null
          phone: string | null
          email: string | null
          website: string | null
          social_media: Json | null
          business_hours: Json | null
          owner_id: string
          is_active: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          social_media?: Json | null
          business_hours?: Json | null
          owner_id: string
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          primary_color?: string | null
          secondary_color?: string | null
          address?: string | null
          city?: string | null
          state?: string | null
          postal_code?: string | null
          country?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          social_media?: Json | null
          business_hours?: Json | null
          owner_id?: string
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      restaurant_members: {
        Row: {
          id: string
          restaurant_id: string
          user_id: string
          role: Database['public']['Enums']['team_role']
          is_active: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          user_id: string
          role?: Database['public']['Enums']['team_role']
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          user_id?: string
          role?: Database['public']['Enums']['team_role']
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      menus: {
        Row: {
          id: string
          restaurant_id: string
          name: string
          description: string | null
          is_active: boolean | null
          is_default: boolean | null
          template_id: string | null
          custom_css: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          name: string
          description?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          template_id?: string | null
          custom_css?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          name?: string
          description?: string | null
          is_active?: boolean | null
          is_default?: boolean | null
          template_id?: string | null
          custom_css?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      menu_categories: {
        Row: {
          id: string
          menu_id: string
          name: string
          description: string | null
          image_url: string | null
          sort_order: number
          is_active: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          menu_id: string
          name: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          menu_id?: string
          name?: string
          description?: string | null
          image_url?: string | null
          sort_order?: number
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      menu_items: {
        Row: {
          id: string
          category_id: string
          name: string
          description: string | null
          price: number
          discounted_price: number | null
          image_url: string | null
          ingredients: string[] | null
          allergens: string[] | null
          nutritional_info: Json | null
          dietary_options: string[] | null
          preparation_time: number | null
          sort_order: number
          is_active: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          category_id: string
          name: string
          description?: string | null
          price: number
          discounted_price?: number | null
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          dietary_options?: string[] | null
          preparation_time?: number | null
          sort_order?: number
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          category_id?: string
          name?: string
          description?: string | null
          price?: number
          discounted_price?: number | null
          image_url?: string | null
          ingredients?: string[] | null
          allergens?: string[] | null
          nutritional_info?: Json | null
          dietary_options?: string[] | null
          preparation_time?: number | null
          sort_order?: number
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      item_variants: {
        Row: {
          id: string
          item_id: string
          name: string
          description: string | null
          price_adjustment: number
          is_default: boolean | null
          is_active: boolean | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          item_id: string
          name: string
          description?: string | null
          price_adjustment?: number
          is_default?: boolean | null
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          item_id?: string
          name?: string
          description?: string | null
          price_adjustment?: number
          is_default?: boolean | null
          is_active?: boolean | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      qr_codes: {
        Row: {
          id: string
          restaurant_id: string
          menu_id: string
          name: string
          description: string | null
          table_number: string | null
          design_options: Json | null
          is_active: boolean | null
          stats: Json | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id: string
          menu_id: string
          name: string
          description?: string | null
          table_number?: string | null
          design_options?: Json | null
          is_active?: boolean | null
          stats?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string
          menu_id?: string
          name?: string
          description?: string | null
          table_number?: string | null
          design_options?: Json | null
          is_active?: boolean | null
          stats?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      analytics_events: {
        Row: {
          id: string
          restaurant_id: string | null
          menu_id: string | null
          item_id: string | null
          qr_id: string | null
          event_type: string
          event_data: Json | null
          user_id: string | null
          session_id: string | null
          device_info: Json | null
          location: Json | null
          created_at: string | null
        }
        Insert: {
          id?: string
          restaurant_id?: string | null
          menu_id?: string | null
          item_id?: string | null
          qr_id?: string | null
          event_type: string
          event_data?: Json | null
          user_id?: string | null
          session_id?: string | null
          device_info?: Json | null
          location?: Json | null
          created_at?: string | null
        }
        Update: {
          id?: string
          restaurant_id?: string | null
          menu_id?: string | null
          item_id?: string | null
          qr_id?: string | null
          event_type?: string
          event_data?: Json | null
          user_id?: string | null
          session_id?: string | null
          device_info?: Json | null
          location?: Json | null
          created_at?: string | null
        }
      }
      subscriptions: {
        Row: {
          id: string
          user_id: string
          restaurant_id: string | null
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          stripe_price_id: string | null
          status: Database['public']['Enums']['subscription_status']
          current_period_start: string | null
          current_period_end: string | null
          cancel_at: string | null
          canceled_at: string | null
          trial_start: string | null
          trial_end: string | null
          subscription_data: Json | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          user_id: string
          restaurant_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: Database['public']['Enums']['subscription_status']
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          subscription_data?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          user_id?: string
          restaurant_id?: string | null
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          stripe_price_id?: string | null
          status?: Database['public']['Enums']['subscription_status']
          current_period_start?: string | null
          current_period_end?: string | null
          cancel_at?: string | null
          canceled_at?: string | null
          trial_start?: string | null
          trial_end?: string | null
          subscription_data?: Json | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
      templates: {
        Row: {
          id: string
          name: string
          description: string | null
          preview_image: string | null
          template_data: Json
          is_default: boolean | null
          is_public: boolean | null
          creator_id: string | null
          updated_at: string | null
          created_at: string | null
        }
        Insert: {
          id?: string
          name: string
          description?: string | null
          preview_image?: string | null
          template_data: Json
          is_default?: boolean | null
          is_public?: boolean | null
          creator_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
        Update: {
          id?: string
          name?: string
          description?: string | null
          preview_image?: string | null
          template_data?: Json
          is_default?: boolean | null
          is_public?: boolean | null
          creator_id?: string | null
          updated_at?: string | null
          created_at?: string | null
        }
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      team_role: 'owner' | 'admin' | 'editor' | 'viewer'
      subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 