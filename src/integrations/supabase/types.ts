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
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          color?: string | null
          created_at?: string
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          color?: string | null
          created_at?: string
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      client_category_mappings: {
        Row: {
          category_id: string
          client_id: string
        }
        Insert: {
          category_id: string
          client_id: string
        }
        Update: {
          category_id?: string
          client_id?: string
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
      client_groups: {
        Row: {
          company_id: string | null
          created_at: string | null
          description: string | null
          id: string
          name: string
          type: Database["public"]["Enums"]["client_group_type"] | null
          updated_at: string | null
        }
        Insert: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          type?: Database["public"]["Enums"]["client_group_type"] | null
          updated_at?: string | null
        }
        Update: {
          company_id?: string | null
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          type?: Database["public"]["Enums"]["client_group_type"] | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_groups_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
        ]
      }
      clients: {
        Row: {
          address: string | null
          client_name: string
          company_id: string | null
          created_at: string | null
          email: string | null
          group_id: string | null
          id: string
          notes: string | null
          phone: string | null
          reference_number: string | null
          updated_at: string | null
        }
        Insert: {
          address?: string | null
          client_name: string
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Update: {
          address?: string | null
          client_name?: string
          company_id?: string | null
          created_at?: string | null
          email?: string | null
          group_id?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          reference_number?: string | null
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "clients_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "clients_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "client_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      companies: {
        Row: {
          address: string | null
          company_name: string
          created_at: string | null
          email: string | null
          id: string
          logo_url: string | null
          phone: string | null
          tps_number: string | null
          tvq_number: string | null
          updated_at: string | null
          user_id: string | null
          website: string | null
        }
        Insert: {
          address?: string | null
          company_name: string
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tps_number?: string | null
          tvq_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Update: {
          address?: string | null
          company_name?: string
          created_at?: string | null
          email?: string | null
          id?: string
          logo_url?: string | null
          phone?: string | null
          tps_number?: string | null
          tvq_number?: string | null
          updated_at?: string | null
          user_id?: string | null
          website?: string | null
        }
        Relationships: []
      }
      devis: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string
          customizations: Json | null
          execution_date: string | null
          id: string
          issue_date: string
          notes: string | null
          public_link: string | null
          quote_number: string | null
          status: string
          subtotal: number
          tax_amount: number
          template_id: string | null
          total_amount: number
          updated_at: string
          validity_date: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          customizations?: Json | null
          execution_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          public_link?: string | null
          quote_number?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          validity_date?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          customizations?: Json | null
          execution_date?: string | null
          id?: string
          issue_date?: string
          notes?: string | null
          public_link?: string | null
          quote_number?: string | null
          status?: string
          subtotal?: number
          tax_amount?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string
          validity_date?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "devis_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_items: {
        Row: {
          created_at: string
          description: string
          id: string
          quantity: number
          quote_id: string
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string
          description: string
          id?: string
          quantity?: number
          quote_id: string
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string
          description?: string
          id?: string
          quantity?: number
          quote_id?: string
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "devis_items_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
        ]
      }
      devis_signatures: {
        Row: {
          checkbox_confirmed: boolean
          created_at: string
          id: string
          quote_id: string
          signature_data: Json | null
          signature_url: string | null
          signed_at: string
          signed_ip: string | null
          signed_name: string
          user_agent: string | null
        }
        Insert: {
          checkbox_confirmed?: boolean
          created_at?: string
          id?: string
          quote_id: string
          signature_data?: Json | null
          signature_url?: string | null
          signed_at?: string
          signed_ip?: string | null
          signed_name: string
          user_agent?: string | null
        }
        Update: {
          checkbox_confirmed?: boolean
          created_at?: string
          id?: string
          quote_id?: string
          signature_data?: Json | null
          signature_url?: string | null
          signed_at?: string
          signed_ip?: string | null
          signed_name?: string
          user_agent?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "devis_signatures_quote_id_fkey"
            columns: ["quote_id"]
            isOneToOne: false
            referencedRelation: "devis"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_items: {
        Row: {
          created_at: string | null
          description: string
          id: string
          invoice_id: string | null
          quantity: number
          total_price: number
          unit_price: number
        }
        Insert: {
          created_at?: string | null
          description: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Update: {
          created_at?: string | null
          description?: string
          id?: string
          invoice_id?: string | null
          quantity?: number
          total_price?: number
          unit_price?: number
        }
        Relationships: [
          {
            foreignKeyName: "invoice_items_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
        ]
      }
      invoice_reminders: {
        Row: {
          created_at: string
          email_body: string | null
          email_subject: string | null
          id: string
          invoice_id: string
          metadata: Json | null
          reminder_rule_id: string | null
          sent_at: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email_body?: string | null
          email_subject?: string | null
          id?: string
          invoice_id: string
          metadata?: Json | null
          reminder_rule_id?: string | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email_body?: string | null
          email_subject?: string | null
          id?: string
          invoice_id?: string
          metadata?: Json | null
          reminder_rule_id?: string | null
          sent_at?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoice_reminders_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
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
          color_scheme: Json | null
          created_at: string | null
          description: string | null
          id: string
          is_default: boolean | null
          is_system: boolean | null
          layout_type: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          layout_type: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color_scheme?: Json | null
          created_at?: string | null
          description?: string | null
          id?: string
          is_default?: boolean | null
          is_system?: boolean | null
          layout_type?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      invoices: {
        Row: {
          client_id: string | null
          company_id: string | null
          created_at: string | null
          customizations: Json | null
          due_date: string | null
          id: string
          invoice_number: string
          issue_date: string
          notes: string | null
          payment_link: string | null
          payment_terms: string | null
          status: string
          stripe_hosted_invoice_url: string | null
          stripe_invoice_id: string | null
          stripe_payment_intent_id: string | null
          subtotal: number
          tax_amount: number
          template_id: string | null
          total_amount: number
          updated_at: string | null
        }
        Insert: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          customizations?: Json | null
          due_date?: string | null
          id?: string
          invoice_number: string
          issue_date?: string
          notes?: string | null
          payment_link?: string | null
          payment_terms?: string | null
          status?: string
          stripe_hosted_invoice_url?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Update: {
          client_id?: string | null
          company_id?: string | null
          created_at?: string | null
          customizations?: Json | null
          due_date?: string | null
          id?: string
          invoice_number?: string
          issue_date?: string
          notes?: string | null
          payment_link?: string | null
          payment_terms?: string | null
          status?: string
          stripe_hosted_invoice_url?: string | null
          stripe_invoice_id?: string | null
          stripe_payment_intent_id?: string | null
          subtotal?: number
          tax_amount?: number
          template_id?: string | null
          total_amount?: number
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "invoices_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
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
          metadata: Json | null
          reference_id: string | null
          reference_type: string | null
          title: string
          type: string
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
          user_id?: string
        }
        Relationships: []
      }
      payment_attempts: {
        Row: {
          amount: number
          attempt_date: string
          client_ip: string | null
          created_at: string
          currency: string
          error_message: string | null
          gateway_reference: string | null
          gateway_response: Json | null
          id: string
          payment_id: string
          payment_method_id: string | null
          status: string
          user_id: string | null
        }
        Insert: {
          amount: number
          attempt_date?: string
          client_ip?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_id: string
          payment_method_id?: string | null
          status?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          attempt_date?: string
          client_ip?: string | null
          created_at?: string
          currency?: string
          error_message?: string | null
          gateway_reference?: string | null
          gateway_response?: Json | null
          id?: string
          payment_id?: string
          payment_method_id?: string | null
          status?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "payment_attempts_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_attempts_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_methods: {
        Row: {
          code: string
          config: Json | null
          created_at: string
          description: string | null
          display_order: number
          gateway_code: string | null
          icon: string | null
          id: string
          is_enabled: boolean
          name: string
          requires_gateway: boolean
          updated_at: string
          user_id: string | null
        }
        Insert: {
          code: string
          config?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number
          gateway_code?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name: string
          requires_gateway?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          code?: string
          config?: Json | null
          created_at?: string
          description?: string | null
          display_order?: number
          gateway_code?: string | null
          icon?: string | null
          id?: string
          is_enabled?: boolean
          name?: string
          requires_gateway?: boolean
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      payment_webhooks: {
        Row: {
          created_at: string
          error_message: string | null
          event_type: string
          id: string
          payload: Json
          payment_id: string | null
          processed_at: string | null
          provider: string
          status: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_type: string
          id?: string
          payload: Json
          payment_id?: string | null
          processed_at?: string | null
          provider: string
          status?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_type?: string
          id?: string
          payload?: Json
          payment_id?: string | null
          processed_at?: string | null
          provider?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_webhooks_payment_id_fkey"
            columns: ["payment_id"]
            isOneToOne: false
            referencedRelation: "payments"
            referencedColumns: ["id"]
          },
        ]
      }
      payments: {
        Row: {
          amount: number
          attempts_count: number | null
          card_brand: string | null
          card_last4: string | null
          client_id: string | null
          company_id: string | null
          created_at: string
          currency: string | null
          failure_reason: string | null
          gateway_response: Json | null
          gateway_status: string | null
          id: string
          invoice_id: string | null
          payment_date: string | null
          payment_link: string | null
          payment_method: string | null
          payment_method_id: string | null
          payment_reference: string | null
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          transaction_reference: string | null
          updated_at: string
        }
        Insert: {
          amount: number
          attempts_count?: number | null
          card_brand?: string | null
          card_last4?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          gateway_response?: Json | null
          gateway_status?: string | null
          id?: string
          invoice_id?: string | null
          payment_date?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Update: {
          amount?: number
          attempts_count?: number | null
          card_brand?: string | null
          card_last4?: string | null
          client_id?: string | null
          company_id?: string | null
          created_at?: string
          currency?: string | null
          failure_reason?: string | null
          gateway_response?: Json | null
          gateway_status?: string | null
          id?: string
          invoice_id?: string | null
          payment_date?: string | null
          payment_link?: string | null
          payment_method?: string | null
          payment_method_id?: string | null
          payment_reference?: string | null
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          transaction_reference?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "payments_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_company_id_fkey"
            columns: ["company_id"]
            isOneToOne: false
            referencedRelation: "companies"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_invoice_id_fkey"
            columns: ["invoice_id"]
            isOneToOne: false
            referencedRelation: "invoices"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payments_payment_method_id_fkey"
            columns: ["payment_method_id"]
            isOneToOne: false
            referencedRelation: "payment_methods"
            referencedColumns: ["id"]
          },
        ]
      }
      product_categories: {
        Row: {
          color: string | null
          created_at: string | null
          id: string
          name: string
          updated_at: string | null
        }
        Insert: {
          color?: string | null
          created_at?: string | null
          id?: string
          name: string
          updated_at?: string | null
        }
        Update: {
          color?: string | null
          created_at?: string | null
          id?: string
          name?: string
          updated_at?: string | null
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          language: string
          notification_settings: Json
          phone: string | null
          timezone: string
          updated_at: string
          username: string | null
        }
        Insert: {
          avatar_url?: string | null
          created_at?: string
          email: string
          full_name: string
          id: string
          language?: string
          notification_settings?: Json
          phone?: string | null
          timezone?: string
          updated_at?: string
          username?: string | null
        }
        Update: {
          avatar_url?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          language?: string
          notification_settings?: Json
          phone?: string | null
          timezone?: string
          updated_at?: string
          username?: string | null
        }
        Relationships: []
      }
      reminder_rules: {
        Row: {
          created_at: string | null
          email_body: string | null
          email_subject: string | null
          id: string
          schedule_id: string | null
          trigger_type: string
          trigger_value: number
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          schedule_id?: string | null
          trigger_type: string
          trigger_value: number
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          email_body?: string | null
          email_subject?: string | null
          id?: string
          schedule_id?: string | null
          trigger_type?: string
          trigger_value?: number
          updated_at?: string | null
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
          created_at: string | null
          enabled: boolean
          id: string
          is_default: boolean
          name: string
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          created_at?: string | null
          enabled?: boolean
          id?: string
          is_default?: boolean
          name?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      stripe_customers: {
        Row: {
          client_id: string | null
          created_at: string
          email: string
          id: string
          metadata: Json | null
          stripe_customer_id: string
          updated_at: string
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string
          email: string
          id?: string
          metadata?: Json | null
          stripe_customer_id: string
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string
          email?: string
          id?: string
          metadata?: Json | null
          stripe_customer_id?: string
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stripe_customers_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_invoices: {
        Row: {
          amount_total: number
          client_id: string | null
          created_at: string
          currency: string
          due_date: string | null
          id: string
          invoice_number: string
          issued_date: string
          paid_date: string | null
          status: string
          updated_at: string
        }
        Insert: {
          amount_total?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number: string
          issued_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Update: {
          amount_total?: number
          client_id?: string | null
          created_at?: string
          currency?: string
          due_date?: string | null
          id?: string
          invoice_number?: string
          issued_date?: string
          paid_date?: string | null
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "stripe_invoices_client_id_fkey"
            columns: ["client_id"]
            isOneToOne: false
            referencedRelation: "clients"
            referencedColumns: ["id"]
          },
        ]
      }
      stripe_products: {
        Row: {
          active: boolean | null
          category_id: string | null
          created_at: string | null
          currency: string | null
          description: string | null
          id: string
          metadata: Json | null
          name: string
          price_cents: number
          product_type: string | null
          recurring_interval: string | null
          recurring_interval_count: number | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name: string
          price_cents?: number
          product_type?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          active?: boolean | null
          category_id?: string | null
          created_at?: string | null
          currency?: string | null
          description?: string | null
          id?: string
          metadata?: Json | null
          name?: string
          price_cents?: number
          product_type?: string | null
          recurring_interval?: string | null
          recurring_interval_count?: number | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Relationships: []
      }
      subscription_items: {
        Row: {
          created_at: string | null
          id: string
          price_cents: number
          product_id: string | null
          quantity: number
          subscription_id: string | null
          tax_rate: number | null
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          price_cents?: number
          product_id?: string | null
          quantity?: number
          subscription_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          price_cents?: number
          product_id?: string | null
          quantity?: number
          subscription_id?: string | null
          tax_rate?: number | null
          updated_at?: string | null
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
          client_id: string | null
          created_at: string | null
          custom_days: number | null
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
          updated_at: string | null
          user_id: string | null
        }
        Insert: {
          client_id?: string | null
          created_at?: string | null
          custom_days?: number | null
          description?: string | null
          end_date?: string | null
          id?: string
          last_invoice_date?: string | null
          metadata?: Json | null
          name: string
          next_invoice_date: string
          recurring_interval: string
          recurring_interval_count?: number
          start_date?: string
          status?: string
          updated_at?: string | null
          user_id?: string | null
        }
        Update: {
          client_id?: string | null
          created_at?: string | null
          custom_days?: number | null
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
          updated_at?: string | null
          user_id?: string | null
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
      template_mappings: {
        Row: {
          template_id: string | null
          template_name: string
        }
        Insert: {
          template_id?: string | null
          template_name: string
        }
        Update: {
          template_id?: string | null
          template_name?: string
        }
        Relationships: [
          {
            foreignKeyName: "template_mappings_template_id_fkey"
            columns: ["template_id"]
            isOneToOne: false
            referencedRelation: "invoice_templates"
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
    }
    Enums: {
      client_group_type: "vip" | "regular" | "monthly" | "project"
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
      client_group_type: ["vip", "regular", "monthly", "project"],
    },
  },
} as const
