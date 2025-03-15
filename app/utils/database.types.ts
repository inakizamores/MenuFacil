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
      restaurants: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          logo_url: string | null
          owner_id: string
          is_active: boolean
          address: string | null
          phone: string | null
          email: string | null
          website: string | null
          template_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          logo_url?: string | null
          owner_id: string
          is_active?: boolean
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          template_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          logo_url?: string | null
          owner_id?: string
          is_active?: boolean
          address?: string | null
          phone?: string | null
          email?: string | null
          website?: string | null
          template_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "restaurants_owner_id_fkey"
            columns: ["owner_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "restaurants_template_id_fkey"
            columns: ["template_id"]
            referencedRelation: "templates"
            referencedColumns: ["id"]
          }
        ]
      }
      menus: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          restaurant_id: string
          is_active: boolean
          is_default: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          restaurant_id: string
          is_active?: boolean
          is_default?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          restaurant_id?: string
          is_active?: boolean
          is_default?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "menus_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          }
        ]
      }
      menu_categories: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          menu_id: string
          order: number
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          menu_id: string
          order?: number
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          menu_id?: string
          order?: number
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "menu_categories_menu_id_fkey"
            columns: ["menu_id"]
            referencedRelation: "menus"
            referencedColumns: ["id"]
          }
        ]
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
          category_id: string
          is_available: boolean
          order: number
          allergens: string[] | null
          ingredients: string[] | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          category_id: string
          is_available?: boolean
          order?: number
          allergens?: string[] | null
          ingredients?: string[] | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          category_id?: string
          is_available?: boolean
          order?: number
          allergens?: string[] | null
          ingredients?: string[] | null
        }
        Relationships: [
          {
            foreignKeyName: "menu_items_category_id_fkey"
            columns: ["category_id"]
            referencedRelation: "menu_categories"
            referencedColumns: ["id"]
          }
        ]
      }
      templates: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          preview_url: string | null
          is_active: boolean
          is_premium: boolean
          config: Json | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          preview_url?: string | null
          is_active?: boolean
          is_premium?: boolean
          config?: Json | null
        }
        Relationships: []
      }
      subscriptions: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          status: string
          current_period_end: string | null
          cancel_at_period_end: boolean
          restaurant_id: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          restaurant_id: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          status?: string
          current_period_end?: string | null
          cancel_at_period_end?: boolean
          restaurant_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscriptions_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      translations: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          entity_id: string
          entity_type: string
          language: string
          field: string
          value: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          entity_id: string
          entity_type: string
          language: string
          field: string
          value: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          entity_id?: string
          entity_type?: string
          language?: string
          field?: string
          value?: string
        }
        Relationships: []
      }
      employees: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          restaurant_id: string
          role: string
          is_active: boolean
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          restaurant_id: string
          role: string
          is_active?: boolean
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          restaurant_id?: string
          role?: string
          is_active?: boolean
        }
        Relationships: [
          {
            foreignKeyName: "employees_restaurant_id_fkey"
            columns: ["restaurant_id"]
            referencedRelation: "restaurants"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "employees_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
      profiles: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          user_id: string
          full_name: string | null
          avatar_url: string | null
          role: string
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          user_id?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_user_id_fkey"
            columns: ["user_id"]
            referencedRelation: "users"
            referencedColumns: ["id"]
          }
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
} 