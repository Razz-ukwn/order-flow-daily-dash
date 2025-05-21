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
          role: 'admin' | 'customer' | 'delivery_agent'
          phone: string | null
          address: string | null
        }
        Insert: {
          id: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'customer' | 'delivery_agent'
          phone?: string | null
          address?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          full_name?: string | null
          avatar_url?: string | null
          role?: 'admin' | 'customer' | 'delivery_agent'
          phone?: string | null
          address?: string | null
        }
      }
      products: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          name: string
          description: string | null
          price: number
          image_url: string | null
          is_available: boolean
          category: string | null
          stock_quantity: number | null
          track_inventory: boolean
          tags: string[]
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          name: string
          description?: string | null
          price: number
          image_url?: string | null
          is_available?: boolean
          category?: string | null
          stock_quantity?: number | null
          track_inventory?: boolean
          tags?: string[]
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          name?: string
          description?: string | null
          price?: number
          image_url?: string | null
          is_available?: boolean
          category?: string | null
          stock_quantity?: number | null
          track_inventory?: boolean
          tags?: string[]
        }
      }
      orders: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          customer_id: string
          delivery_address: string
          order_date: string
          delivery_date: string | null
          total_amount: number
          status: 'pending' | 'processing' | 'assigned' | 'delivered' | 'cancelled'
          payment_status: 'paid' | 'pending'
          payment_method: 'cash' | 'upi' | 'credit_card' | null
          notes: string | null
          route: string | null
          assigned_agent_id: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id: string
          delivery_address: string
          order_date: string
          delivery_date?: string | null
          total_amount: number
          status?: 'pending' | 'processing' | 'assigned' | 'delivered' | 'cancelled'
          payment_status?: 'paid' | 'pending'
          payment_method?: 'cash' | 'upi' | 'credit_card' | null
          notes?: string | null
          route?: string | null
          assigned_agent_id?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          customer_id?: string
          delivery_address?: string
          order_date?: string
          delivery_date?: string | null
          total_amount?: number
          status?: 'pending' | 'processing' | 'assigned' | 'delivered' | 'cancelled'
          payment_status?: 'paid' | 'pending'
          payment_method?: 'cash' | 'upi' | 'credit_card' | null
          notes?: string | null
          route?: string | null
          assigned_agent_id?: string | null
        }
      }
      order_items: {
        Row: {
          id: string
          created_at: string
          order_id: string
          product_id: string
          quantity: number
          price_at_order: number
        }
        Insert: {
          id?: string
          created_at?: string
          order_id: string
          product_id: string
          quantity: number
          price_at_order: number
        }
        Update: {
          id?: string
          created_at?: string
          order_id?: string
          product_id?: string
          quantity?: number
          price_at_order?: number
        }
      }
      deliveries: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          order_id: string
          agent_id: string
          assigned_at: string
          delivered_at: string | null
          status: 'pending' | 'in_progress' | 'delivered' | 'failed'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id: string
          agent_id: string
          assigned_at: string
          delivered_at?: string | null
          status?: 'pending' | 'in_progress' | 'delivered' | 'failed'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          order_id?: string
          agent_id?: string
          assigned_at?: string
          delivered_at?: string | null
          status?: 'pending' | 'in_progress' | 'delivered' | 'failed'
          notes?: string | null
        }
      }
      settings: {
        Row: {
          id: number
          created_at: string
          updated_at: string
          store_name: string
          store_description: string | null
          contact_email: string
          contact_phone: string | null
          enable_email_notifications: boolean
          enable_sms_notifications: boolean
          enable_delivery_notifications: boolean
          delivery_radius: number
          min_order_amount: number
          delivery_fee: number
          free_delivery_threshold: number
          enable_delivery_tracking: boolean
        }
        Insert: {
          id?: number
          created_at?: string
          updated_at?: string
          store_name: string
          store_description?: string | null
          contact_email: string
          contact_phone?: string | null
          enable_email_notifications?: boolean
          enable_sms_notifications?: boolean
          enable_delivery_notifications?: boolean
          delivery_radius?: number
          min_order_amount?: number
          delivery_fee?: number
          free_delivery_threshold?: number
          enable_delivery_tracking?: boolean
        }
        Update: {
          id?: number
          created_at?: string
          updated_at?: string
          store_name?: string
          store_description?: string | null
          contact_email?: string
          contact_phone?: string | null
          enable_email_notifications?: boolean
          enable_sms_notifications?: boolean
          enable_delivery_notifications?: boolean
          delivery_radius?: number
          min_order_amount?: number
          delivery_fee?: number
          free_delivery_threshold?: number
          enable_delivery_tracking?: boolean
        }
      }
      assigned_stock: {
        Row: {
          id: string
          created_at: string
          updated_at: string
          agent_id: string
          product_id: string
          quantity: number
          assigned_date: string
          status: 'assigned' | 'delivered' | 'returned'
          notes: string | null
        }
        Insert: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id: string
          product_id: string
          quantity: number
          assigned_date: string
          status?: 'assigned' | 'delivered' | 'returned'
          notes?: string | null
        }
        Update: {
          id?: string
          created_at?: string
          updated_at?: string
          agent_id?: string
          product_id?: string
          quantity?: number
          assigned_date?: string
          status?: 'assigned' | 'delivered' | 'returned'
          notes?: string | null
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
      [_ in never]: never
    }
  }
}

type DefaultSchema = Database[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? (Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      Database[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof Database },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends { schema: keyof Database }
  ? Database[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof Database },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof Database
  }
    ? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
  ? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
