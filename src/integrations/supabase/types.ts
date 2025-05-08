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
      client_categories: {
        Row: {
          color: string | null
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          color?: string | null
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      client_category_mappings: {
        Row: {
          category_id: string
          client_id: string
          created_at: string
          id: string
        }
        Insert: {
          category_id: string
          client_id: string
          created_at?: string
          id?: string
        }
        Update: {
          category_id?: string
          client_id?: string
          created_at?: string
          id?: string
        }
        Relationships: [
          {
            foreignKeyName: "client_category_mappings_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "client_categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_category_mappings_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          created_at: string
          email: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          email: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          email?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      invoice_reminders: {
        Row: {
          email_body: string | null
          email_subject: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          reminder_rule_id: string | null
          sent_at: string
          status: string
        }
        Insert: {
          email_body?: string | null
          email_subject?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          reminder_rule_id?: string | null
          sent_at?: string
          status?: string
        }
        Update: {
          email_body?: string | null
          email_subject?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          reminder_rule_id?: string | null
          sent_at?: string
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "stripe_invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoice_reminders_reminder_rule_id_fkey"
            columns: ["reminder_rule_id"]
            isOneToOne: false
            referencedRelation: "reminder_rules"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_templates: {
        Row: {
          created_at: string
          description: string | null
          id: string
          is_default: boolean | null
          name: string
          template_data: Json
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name: string
          template_data: Json
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          is_default?: boolean | null
          name?: string
          template_data?: Json
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          message: string
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          message: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          title: string
          type: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          message?: string
          metadata?: Json | null
          reference_id?: string | null
          reference_type?: string | null
          title?: string
          type?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      product_categories: {
        Row: {
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_rules: {
        Row: {
          created_at: string
          email_body: string
          email_subject: string
          id: string
          schedule_id: string
          trigger_type: string
          trigger_value: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_body: string
          email_subject: string
          id?: string
          schedule_id: string
          trigger_type: string
          trigger_value: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_body?: string
          email_subject?: string
          id?: string
          schedule_id?: string
          trigger_type?: string
          trigger_value?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "reminder_rules_schedule_id_fkey"
            columns: ["schedule_id"]
            isOneToOne: false
            referencedRelation: "reminder_schedules"
            referencedColumns: ["id"]
          },
        ]
      }
      reminder_schedules: {
        Row: {
          created_at: string
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      reminder_templates: {
        Row: {
          body: string
          created_at: string
          id: string
          name: string
          subject: string
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          name: string
          subject: string
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          name?: string
          subject?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
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
          client_id: string | null
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
          client_id?: string | null
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
          client_id?: string | null
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
            foreignKeyName: "stripe_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
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
          is_recurring: boolean | null
          metadata: Json | null
          name: string
          price_cents: number | null
          product_type: string | null
          recurring_interval: string | null
          recurring_interval_count: number | null
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
          is_recurring?: boolean | null
          metadata?: Json | null
          name: string
          price_cents?: number | null
          product_type?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
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
          is_recurring?: boolean | null
          metadata?: Json | null
          name?: string
          price_cents?: number | null
          product_type?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          stripe_product_id?: string | null
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string
          id: string
          price_cents: number
          product_id: string
          quantity: number
          subscription_id: string
          tax_rate: number | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          price_cents: number
          product_id: string
          quantity?: number
          subscription_id: string
          tax_rate?: number | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          price_cents?: number
          product_id?: string
          quantity?: number
          subscription_id?: string
          tax_rate?: number | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscription_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "stripe_products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "subscription_items_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      subscriptions: {
        Row: {
          client_id: string
          created_at: string
          description: string | null
          end_date: string | null
          id: string
          last_invoice_date: string | null
          metadata: Json | null
          name: string
          next_invoice_date: string
          recurring_interval: string
          recurring_interval_count: number
          start_date: string
          status: string
          updated_at: string
          user_id: string
        }
        Insert: {
          client_id: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          last_invoice_date?: string | null
          metadata?: Json | null
          name: string
          next_invoice_date: string
          recurring_interval: string
          recurring_interval_count: number
          start_date: string
          status?: string
          updated_at?: string
          user_id: string
        }
        Update: {
          client_id?: string
          created_at?: string
          description?: string | null
          end_date?: string | null
          id?: string
          last_invoice_date?: string | null
          metadata?: Json | null
          name?: string
          next_invoice_date?: string
          recurring_interval?: string
          recurring_interval_count?: number
          start_date?: string
          status?: string
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "subscriptions_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      get_client_categories: {
        Args: { p_client_id: string }
        Returns: {
          category_id: string
          category_name: string
          category_color: string
        }[]
      }
      get_client_invoice_count: {
        Args: { client_id: string }
        Returns: number
      }
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
