export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  public: {
    Tables: {
      stripe_connect_accounts: {
        Row: {
          access_token: string | null
          account_details: Json | null
          connected_at: string
          created_at: string
          disconnected_at: string | null
          id: string
          is_active: boolean
          livemode: boolean
          refresh_token: string | null
          scope: string | null
          stripe_account_id: string
          token_type: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          access_token?: string | null
          account_details?: Json | null
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          id?: string
          is_active?: boolean
          livemode?: boolean
          refresh_token?: string | null
          scope?: string | null
          stripe_account_id: string
          token_type?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          access_token?: string | null
          account_details?: Json | null
          connected_at?: string
          created_at?: string
          disconnected_at?: string | null
          id?: string
          is_active?: boolean
          livemode?: boolean
          refresh_token?: string | null
          scope?: string | null
          stripe_account_id?: string
          token_type?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string | null
          phone: string | null
          stripe_customer_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name?: string | null
          phone?: string | null
          stripe_customer_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string | null
          phone?: string | null
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_invoice_items: {
        Row: {
          amount_tax: number | null
          amount_total: number
          created_at: string
          description: string | null
          id: string
          metadata: Json | null
          quantity: number
          stripe_invoice_id: string | null
          stripe_product_id: string | null
          tax_rate: number | null
          unit_price_cents: number
        }
        Insert: {
          amount_tax?: number | null
          amount_total: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          quantity?: number
          stripe_invoice_id?: string | null
          stripe_product_id?: string | null
          tax_rate?: number | null
          unit_price_cents: number
        }
        Update: {
          amount_tax?: number | null
          amount_total?: number
          created_at?: string
          description?: string | null
          id?: string
          metadata?: Json | null
          quantity?: number
          stripe_invoice_id?: string | null
          stripe_product_id?: string | null
          tax_rate?: number | null
          unit_price_cents?: number
        }
        Relationships: [
          {
            foreignKeyName: "stripe_invoice_items_stripe_invoice_id_fkey"
            columns: ["stripe_invoice_id"]
            isOneToOne: false
            referencedRelation: "stripe_invoices"
            referencedColumns: ["stripe_invoice_id"]
          },
          {
            foreignKeyName: "stripe_invoice_items_stripe_product_id_fkey"
            columns: ["stripe_product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["stripe_product_id"]
          },
        ]
      }
      stripe_invoices: {
        Row: {
          amount_paid: number | null
          amount_total: number
          connected_stripe_account_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          invoice_pdf_url: string | null
          issued_date: string
          metadata: Json | null
          paid_date: string | null
          payment_intent_id: string | null
          payment_link: string | null
          status: string
          stripe_customer_id: string | null
          stripe_invoice_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount_paid?: number | null
          amount_total: number
          connected_stripe_account_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          invoice_pdf_url?: string | null
          issued_date?: string
          metadata?: Json | null
          paid_date?: string | null
          payment_intent_id?: string | null
          payment_link?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount_paid?: number | null
          amount_total?: number
          connected_stripe_account_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          invoice_pdf_url?: string | null
          issued_date?: string
          metadata?: Json | null
          paid_date?: string | null
          payment_intent_id?: string | null
          payment_link?: string | null
          status?: string
          stripe_customer_id?: string | null
          stripe_invoice_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_invoices_stripe_customer_id_fkey"
            columns: ["stripe_customer_id"]
            isOneToOne: false
            referencedRelation: "stripe_customers"
            referencedColumns: ["stripe_customer_id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          created_at: string
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price_cents: number | null
          stripe_product_id: string | null
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          active?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price_cents?: number | null
          stripe_product_id?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          active?: boolean | null
          created_at?: string
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price_cents?: number | null
          stripe_product_id?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      tax_configurations: {
        Row: {
          country_code: string
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          region_code: string | null
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          country_code: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          region_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          country_code?: string
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          region_code?: string | null
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      tax_rates: {
        Row: {
          configuration_id: string | null
          created_at: string | null
          description: string | null
          display_order: number | null
          id: string
          is_compound: boolean | null
          name: string
          rate: number
          tax_code: string | null
          tax_type: Database["public"]["Enums"]["tax_type"]
          updated_at: string | null
        }
        Insert: {
          configuration_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_compound?: boolean | null
          name: string
          rate: number
          tax_code?: string | null
          tax_type: Database["public"]["Enums"]["tax_type"]
          updated_at?: string | null
        }
        Update: {
          configuration_id?: string | null
          created_at?: string | null
          description?: string | null
          display_order?: number | null
          id?: string
          is_compound?: boolean | null
          name?: string
          rate?: number
          tax_code?: string | null
          tax_type?: Database["public"]["Enums"]["tax_type"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tax_rates_configuration_id_fkey"
            columns: ["configuration_id"]
            isOneToOne: false
            referencedRelation: "tax_configurations"
            referencedColumns: ["id"]
          },
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
      tax_type: "vat" | "gst" | "pst" | "hst" | "qst" | "sales" | "other"
    }
    CompositeTypes: {
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
    Enums: {
      tax_type: ["vat", "gst", "pst", "hst", "qst", "sales", "other"],
    },
  },
} as const
