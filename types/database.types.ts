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
          created_at: string
          updated_at: string
          full_name: string | null
          avatar_url: string | null
          role: 'system_admin' | 'restaurant_owner' | 'restaurant_staff'
          parent_user_id: string | null
          linked_restaurant_id: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'system_admin' | 'restaurant_owner' | 'restaurant_staff'
          parent_user_id?: string | null
          linked_restaurant_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'system_admin' | 'restaurant_owner' | 'restaurant_staff'
          parent_user_id?: string | null
          linked_restaurant_id?: string | null
        }
      }
      restaurants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          address: string | null
          phone: string | null
          owner_id: string
          logo_url: string | null
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          address?: string | null
          phone?: string | null
          owner_id: string
          logo_url?: string | null
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          address?: string | null
          phone?: string | null
          owner_id?: string
          logo_url?: string | null
          is_active?: boolean
        }
      }
      restaurant_staff: {
        Row: {
          id: string
          created_at: string
          user_id: string
          restaurant_id: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          user_id: string
          restaurant_id: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          user_id?: string
          restaurant_id?: string
          role?: string
        }
      }
      restaurant_members: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          restaurant_id: string
          user_id: string
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          restaurant_id: string
          user_id: string
          role: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          restaurant_id?: string
          user_id?: string
          role?: string
        }
      }
      menus: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          restaurant_id: string
          is_published: boolean
          published_url: string | null
          qr_code_url: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          restaurant_id: string
          is_published?: boolean
          published_url?: string | null
          qr_code_url?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          restaurant_id?: string
          is_published?: boolean
          published_url?: string | null
          qr_code_url?: string | null
        }
      }
      menu_categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          restaurant_id: string
          display_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          restaurant_id: string
          display_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          restaurant_id?: string
          display_order?: number
        }
      }
      menu_items: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          restaurant_id: string
          is_available: boolean
          category_id: string | null
          display_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          restaurant_id: string
          is_available?: boolean
          category_id?: string | null
          display_order?: number
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          restaurant_id?: string
          is_available?: boolean
          category_id?: string | null
          display_order?: number
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
      system_role: 'system_admin' | 'restaurant_owner' | 'restaurant_staff'
      subscription_status: 'active' | 'trialing' | 'past_due' | 'canceled' | 'incomplete' | 'incomplete_expired' | 'unpaid'
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 