export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export interface Database {
  public: {
    Tables: {
      menu_categories: {
        Row: {
          id: string;
          menu_id: string;
          name: string;
          description: string | null;
          order: number;
          created_at: string;
          updated_at: string;
          restaurant_id: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          name: string;
          description?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
          restaurant_id: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          name?: string;
          description?: string | null;
          order?: number;
          created_at?: string;
          updated_at?: string;
          restaurant_id?: string;
        };
      };
      menu_items: {
        Row: {
          id: string;
          menu_id: string;
          category_id: string | null;
          name: string;
          description: string | null;
          price: number;
          image_url: string | null;
          is_available: boolean;
          created_at: string;
          updated_at: string;
          restaurant_id: string;
          has_variants: boolean;
        };
        Insert: {
          id?: string;
          menu_id: string;
          category_id?: string | null;
          name: string;
          description?: string | null;
          price: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
          restaurant_id: string;
          has_variants?: boolean;
        };
        Update: {
          id?: string;
          menu_id?: string;
          category_id?: string | null;
          name?: string;
          description?: string | null;
          price?: number;
          image_url?: string | null;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
          restaurant_id?: string;
          has_variants?: boolean;
        };
      };
      item_variants: {
        Row: {
          id: string;
          item_id: string;
          name: string;
          price: number;
          is_available: boolean;
          created_at: string;
          updated_at: string;
          restaurant_id: string;
        };
        Insert: {
          id?: string;
          item_id: string;
          name: string;
          price: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
          restaurant_id: string;
        };
        Update: {
          id?: string;
          item_id?: string;
          name?: string;
          price?: number;
          is_available?: boolean;
          created_at?: string;
          updated_at?: string;
          restaurant_id?: string;
        };
      };
      menus: {
        Row: {
          id: string;
          restaurant_id: string;
          name: string;
          description: string | null;
          is_published: boolean;
          created_at: string;
          updated_at: string;
          slug: string | null;
        };
        Insert: {
          id?: string;
          restaurant_id: string;
          name: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
        };
        Update: {
          id?: string;
          restaurant_id?: string;
          name?: string;
          description?: string | null;
          is_published?: boolean;
          created_at?: string;
          updated_at?: string;
          slug?: string | null;
        };
      };
      qr_codes: {
        Row: {
          id: string;
          menu_id: string;
          name: string;
          url: string;
          design: Json;
          views: number;
          created_at: string;
          updated_at: string;
          restaurant_id: string;
        };
        Insert: {
          id?: string;
          menu_id: string;
          name: string;
          url: string;
          design?: Json;
          views?: number;
          created_at?: string;
          updated_at?: string;
          restaurant_id: string;
        };
        Update: {
          id?: string;
          menu_id?: string;
          name?: string;
          url?: string;
          design?: Json;
          views?: number;
          created_at?: string;
          updated_at?: string;
          restaurant_id?: string;
        };
      };
      restaurants: {
        Row: {
          id: string;
          name: string;
          owner_id: string;
          address: string | null;
          phone: string | null;
          email: string | null;
          logo_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          owner_id: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          owner_id?: string;
          address?: string | null;
          phone?: string | null;
          email?: string | null;
          logo_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
      profiles: {
        Row: {
          id: string;
          user_id: string;
          first_name: string | null;
          last_name: string | null;
          avatar_url: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          user_id?: string;
          first_name?: string | null;
          last_name?: string | null;
          avatar_url?: string | null;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
    Views: {
      [_ in never]: never;
    };
    Functions: {
      [_ in never]: never;
    };
    Enums: {
      [_ in never]: never;
    };
    CompositeTypes: {
      [_ in never]: never;
    };
  };
} 