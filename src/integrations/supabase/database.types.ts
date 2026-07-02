export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      admin_users: {
        Row: {
          auth_user_id: string | null
          created_at: string
          email: string
          id: string
          is_active: boolean
          role: string
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          role?: string
          updated_at?: string
        }
        Relationships: []
      }
      agency_settings: {
        Row: {
          agency_name: string
          company_address: string | null
          company_email: string | null
          company_phone: string | null
          company_whatsapp: string | null
          created_at: string
          default_commission_rules: string | null
          default_contract_terms: string | null
          default_payment_terms: string | null
          default_security_deposit_rules: string | null
          default_service_charges: number | null
          id: string
          logo_url: string | null
          rera_number: string | null
          signatory_name: string | null
          signatory_title: string | null
          trade_license_number: string | null
          updated_at: string
        }
        Insert: {
          agency_name?: string
          company_address?: string | null
          company_email?: string | null
          company_phone?: string | null
          company_whatsapp?: string | null
          created_at?: string
          default_commission_rules?: string | null
          default_contract_terms?: string | null
          default_payment_terms?: string | null
          default_security_deposit_rules?: string | null
          default_service_charges?: number | null
          id?: string
          logo_url?: string | null
          rera_number?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          trade_license_number?: string | null
          updated_at?: string
        }
        Update: {
          agency_name?: string
          company_address?: string | null
          company_email?: string | null
          company_phone?: string | null
          company_whatsapp?: string | null
          created_at?: string
          default_commission_rules?: string | null
          default_contract_terms?: string | null
          default_payment_terms?: string | null
          default_security_deposit_rules?: string | null
          default_service_charges?: number | null
          id?: string
          logo_url?: string | null
          rera_number?: string | null
          signatory_name?: string | null
          signatory_title?: string | null
          trade_license_number?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      agent_approvals: {
        Row: {
          agent_id: string
          created_at: string
          decision: string
          id: string
          internal_notes: string | null
          transaction_id: string
        }
        Insert: {
          agent_id: string
          created_at?: string
          decision: string
          id?: string
          internal_notes?: string | null
          transaction_id: string
        }
        Update: {
          agent_id?: string
          created_at?: string
          decision?: string
          id?: string
          internal_notes?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "agent_approvals_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "agent_approvals_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      agents: {
        Row: {
          auth_user_id: string | null
          created_at: string
          default_commission_type: string
          default_commission_value: number
          email: string
          id: string
          is_active: boolean
          license_number: string | null
          name: string
          phone: string | null
          photo_url: string | null
          updated_at: string
          whatsapp: string | null
        }
        Insert: {
          auth_user_id?: string | null
          created_at?: string
          default_commission_type?: string
          default_commission_value?: number
          email: string
          id?: string
          is_active?: boolean
          license_number?: string | null
          name: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Update: {
          auth_user_id?: string | null
          created_at?: string
          default_commission_type?: string
          default_commission_value?: number
          email?: string
          id?: string
          is_active?: boolean
          license_number?: string | null
          name?: string
          phone?: string | null
          photo_url?: string | null
          updated_at?: string
          whatsapp?: string | null
        }
        Relationships: []
      }
      amenities: {
        Row: {
          icon: string | null
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          icon?: string | null
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          icon?: string | null
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      categories: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          parent_id: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          parent_id?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          parent_id?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "categories_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
        ]
      }
      client_declarations: {
        Row: {
          created_at: string
          decision: string
          id: string
          notes: string | null
          transaction_id: string
          viewing_request_id: string | null
        }
        Insert: {
          created_at?: string
          decision: string
          id?: string
          notes?: string | null
          transaction_id: string
          viewing_request_id?: string | null
        }
        Update: {
          created_at?: string
          decision?: string
          id?: string
          notes?: string | null
          transaction_id?: string
          viewing_request_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "client_declarations_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "client_declarations_viewing_request_id_fkey"
            columns: ["viewing_request_id"]
            isOneToOne: false
            referencedRelation: "viewing_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      client_profiles: {
        Row: {
          address: string | null
          created_at: string
          emirates_id: string | null
          full_name: string | null
          nationality: string | null
          passport_number: string | null
          phone: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          address?: string | null
          created_at?: string
          emirates_id?: string | null
          full_name?: string | null
          nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          address?: string | null
          created_at?: string
          emirates_id?: string | null
          full_name?: string | null
          nationality?: string | null
          passport_number?: string | null
          phone?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      cms_media: {
        Row: {
          created_at: string
          file_name: string | null
          folder: string | null
          id: string
          kind: string | null
          public_url: string
        }
        Insert: {
          created_at?: string
          file_name?: string | null
          folder?: string | null
          id?: string
          kind?: string | null
          public_url: string
        }
        Update: {
          created_at?: string
          file_name?: string | null
          folder?: string | null
          id?: string
          kind?: string | null
          public_url?: string
        }
        Relationships: []
      }
      collections: {
        Row: {
          cover_image_url: string | null
          created_at: string
          description: string | null
          id: string
          is_active: boolean
          slug: string
          sort_order: number
          title: string
          type: string | null
          updated_at: string
        }
        Insert: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slug: string
          sort_order?: number
          title: string
          type?: string | null
          updated_at?: string
        }
        Update: {
          cover_image_url?: string | null
          created_at?: string
          description?: string | null
          id?: string
          is_active?: boolean
          slug?: string
          sort_order?: number
          title?: string
          type?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      contract_requests: {
        Row: {
          created_at: string
          id: string
          status: string
          transaction_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          status?: string
          transaction_id: string
        }
        Update: {
          created_at?: string
          id?: string
          status?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "contract_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      coupon_redemptions: {
        Row: {
          coupon_id: string
          email: string | null
          id: string
          order_id: string | null
          redeemed_at: string
        }
        Insert: {
          coupon_id: string
          email?: string | null
          id?: string
          order_id?: string | null
          redeemed_at?: string
        }
        Update: {
          coupon_id?: string
          email?: string | null
          id?: string
          order_id?: string | null
          redeemed_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "coupon_redemptions_coupon_id_fkey"
            columns: ["coupon_id"]
            isOneToOne: false
            referencedRelation: "coupons"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "coupon_redemptions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
        ]
      }
      coupons: {
        Row: {
          code: string
          created_at: string
          description: string | null
          discount_type: string
          discount_value: number
          expires_at: string | null
          id: string
          is_active: boolean
          max_uses: number | null
          min_subtotal: number
          starts_at: string | null
          updated_at: string
          used_count: number
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          discount_type: string
          discount_value: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          discount_type?: string
          discount_value?: number
          expires_at?: string | null
          id?: string
          is_active?: boolean
          max_uses?: number | null
          min_subtotal?: number
          starts_at?: string | null
          updated_at?: string
          used_count?: number
        }
        Relationships: []
      }
      email_templates: {
        Row: {
          body_html: string
          description: string
          enabled: boolean
          id: string
          name: string
          subject: string
          template_key: string
          updated_at: string
        }
        Insert: {
          body_html: string
          description?: string
          enabled?: boolean
          id?: string
          name: string
          subject: string
          template_key: string
          updated_at?: string
        }
        Update: {
          body_html?: string
          description?: string
          enabled?: boolean
          id?: string
          name?: string
          subject?: string
          template_key?: string
          updated_at?: string
        }
        Relationships: []
      }
      feature_cards: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      form_submissions: {
        Row: {
          admin_viewed_at: string | null
          created_at: string
          form_type: string
          id: string
          payload: Json
          status: string
        }
        Insert: {
          admin_viewed_at?: string | null
          created_at?: string
          form_type?: string
          id?: string
          payload?: Json
          status?: string
        }
        Update: {
          admin_viewed_at?: string | null
          created_at?: string
          form_type?: string
          id?: string
          payload?: Json
          status?: string
        }
        Relationships: []
      }
      furnishing_statuses: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      generated_contracts: {
        Row: {
          agent_id: string | null
          contract_data: Json
          created_at: string
          file_name: string | null
          file_url: string | null
          id: string
          transaction_id: string
        }
        Insert: {
          agent_id?: string | null
          contract_data?: Json
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          transaction_id: string
        }
        Update: {
          agent_id?: string | null
          contract_data?: Json
          created_at?: string
          file_name?: string | null
          file_url?: string | null
          id?: string
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "generated_contracts_agent_id_fkey"
            columns: ["agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "generated_contracts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      handover_records: {
        Row: {
          agent_notes: string | null
          created_at: string
          handover_date: string | null
          handover_time: string | null
          id: string
          key_collection_details: string | null
          meeting_location: string | null
          possession_instructions: string | null
          required_documents: string | null
          status: string
          transaction_id: string
          updated_at: string
        }
        Insert: {
          agent_notes?: string | null
          created_at?: string
          handover_date?: string | null
          handover_time?: string | null
          id?: string
          key_collection_details?: string | null
          meeting_location?: string | null
          possession_instructions?: string | null
          required_documents?: string | null
          status?: string
          transaction_id: string
          updated_at?: string
        }
        Update: {
          agent_notes?: string | null
          created_at?: string
          handover_date?: string | null
          handover_time?: string | null
          id?: string
          key_collection_details?: string | null
          meeting_location?: string | null
          possession_instructions?: string | null
          required_documents?: string | null
          status?: string
          transaction_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "handover_records_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      hero_slides: {
        Row: {
          background_color: string | null
          created_at: string
          cta_label: string | null
          cta_url: string | null
          headline_lines: Json
          id: string
          image_url: string | null
          image_url_mobile: string | null
          image_url_tablet: string | null
          is_active: boolean
          sort_order: number
          updated_at: string
        }
        Insert: {
          background_color?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          headline_lines?: Json
          id?: string
          image_url?: string | null
          image_url_mobile?: string | null
          image_url_tablet?: string | null
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Update: {
          background_color?: string | null
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          headline_lines?: Json
          id?: string
          image_url?: string | null
          image_url_mobile?: string | null
          image_url_tablet?: string | null
          is_active?: boolean
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      homepage_sections: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          section_key: string
          sort_order: number
          subtitle: string | null
          title: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          section_key?: string
          sort_order?: number
          subtitle?: string | null
          title?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inventory_reservations: {
        Row: {
          created_at: string
          expires_at: string
          id: string
          order_id: string
          product_id: string | null
          quantity: number
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          expires_at: string
          id?: string
          order_id: string
          product_id?: string | null
          quantity: number
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          expires_at?: string
          id?: string
          order_id?: string
          product_id?: string | null
          quantity?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "inventory_reservations_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "inventory_reservations_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      invoices: {
        Row: {
          client_email: string
          currency: string
          file_url: string | null
          id: string
          invoice_number: string
          issued_at: string
          metadata: Json
          payment_status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          total_amount: number
          transaction_id: string
        }
        Insert: {
          client_email: string
          currency?: string
          file_url?: string | null
          id?: string
          invoice_number: string
          issued_at?: string
          metadata?: Json
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          transaction_id: string
        }
        Update: {
          client_email?: string
          currency?: string
          file_url?: string | null
          id?: string
          invoice_number?: string
          issued_at?: string
          metadata?: Json
          payment_status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          total_amount?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "invoices_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      leases: {
        Row: {
          assigned_agent_id: string | null
          cheque_count: number | null
          created_at: string
          end_date: string | null
          id: string
          landlord_owner_id: string | null
          payment_frequency: string
          product_id: string
          property_transaction_id: string | null
          rent_amount: number
          security_deposit: number | null
          start_date: string
          status: string
          tenant_user_id: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          cheque_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          landlord_owner_id?: string | null
          payment_frequency?: string
          product_id: string
          property_transaction_id?: string | null
          rent_amount: number
          security_deposit?: number | null
          start_date: string
          status?: string
          tenant_user_id: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          cheque_count?: number | null
          created_at?: string
          end_date?: string | null
          id?: string
          landlord_owner_id?: string | null
          payment_frequency?: string
          product_id?: string
          property_transaction_id?: string | null
          rent_amount?: number
          security_deposit?: number | null
          start_date?: string
          status?: string
          tenant_user_id?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "leases_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_landlord_owner_id_fkey"
            columns: ["landlord_owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "leases_property_transaction_id_fkey"
            columns: ["property_transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      lifestyle_cards: {
        Row: {
          created_at: string
          cta_label: string | null
          cta_url: string | null
          id: string
          image_url: string | null
          is_active: boolean
          layout: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout?: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          cta_label?: string | null
          cta_url?: string | null
          id?: string
          image_url?: string | null
          is_active?: boolean
          layout?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      marketing_pages: {
        Row: {
          body_html: string | null
          created_at: string
          id: string
          meta_description: string | null
          published: boolean
          slug: string
          sort_order: number
          title: string
          updated_at: string
        }
        Insert: {
          body_html?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published?: boolean
          slug: string
          sort_order?: number
          title: string
          updated_at?: string
        }
        Update: {
          body_html?: string | null
          created_at?: string
          id?: string
          meta_description?: string | null
          published?: boolean
          slug?: string
          sort_order?: number
          title?: string
          updated_at?: string
        }
        Relationships: []
      }
      move_in_checklists: {
        Row: {
          agent_signed_at: string | null
          created_at: string
          handover_record_id: string | null
          id: string
          items: Json
          lease_id: string
          tenant_signed_at: string | null
          updated_at: string
        }
        Insert: {
          agent_signed_at?: string | null
          created_at?: string
          handover_record_id?: string | null
          id?: string
          items?: Json
          lease_id: string
          tenant_signed_at?: string | null
          updated_at?: string
        }
        Update: {
          agent_signed_at?: string | null
          created_at?: string
          handover_record_id?: string | null
          id?: string
          items?: Json
          lease_id?: string
          tenant_signed_at?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "move_in_checklists_handover_record_id_fkey"
            columns: ["handover_record_id"]
            isOneToOne: false
            referencedRelation: "handover_records"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "move_in_checklists_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      nav_links: {
        Row: {
          created_at: string
          href: string
          id: string
          is_active: boolean
          label: string
          location: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          id?: string
          is_active?: boolean
          label: string
          location: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          id?: string
          is_active?: boolean
          label?: string
          location?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          source: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          source?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          source?: string | null
        }
        Relationships: []
      }
      notifications: {
        Row: {
          body: string | null
          created_at: string
          id: string
          is_read: boolean
          link_href: string | null
          recipient_role: string
          title: string
          transaction_id: string | null
          user_id: string | null
        }
        Insert: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_href?: string | null
          recipient_role: string
          title: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Update: {
          body?: string | null
          created_at?: string
          id?: string
          is_read?: boolean
          link_href?: string | null
          recipient_role?: string
          title?: string
          transaction_id?: string | null
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "notifications_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      order_items: {
        Row: {
          bundle_id: string | null
          created_at: string
          id: string
          image_url: string | null
          line_total: number
          metadata: Json
          order_id: string
          product_id: string | null
          product_name: string
          product_slug: string | null
          quantity: number
          unit_price: number
          variant_id: string | null
          variant_name: string | null
        }
        Insert: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          line_total: number
          metadata?: Json
          order_id: string
          product_id?: string | null
          product_name: string
          product_slug?: string | null
          quantity?: number
          unit_price: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Update: {
          bundle_id?: string | null
          created_at?: string
          id?: string
          image_url?: string | null
          line_total?: number
          metadata?: Json
          order_id?: string
          product_id?: string | null
          product_name?: string
          product_slug?: string | null
          quantity?: number
          unit_price?: number
          variant_id?: string | null
          variant_name?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "order_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "order_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      orders: {
        Row: {
          admin_viewed_at: string | null
          carrier: string | null
          coupon_code: string | null
          created_at: string
          currency: string
          discount_total: number
          email: string
          fulfillment_status: string
          id: string
          metadata: Json | null
          order_number: string
          shipped_at: string | null
          shipping_address: Json | null
          shipping_total: number
          status: string
          stripe_payment_intent_id: string | null
          stripe_session_id: string | null
          subtotal: number
          tax_total: number
          total: number
          tracking_number: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          admin_viewed_at?: string | null
          carrier?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          email: string
          fulfillment_status?: string
          id?: string
          metadata?: Json | null
          order_number: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_total?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax_total?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          admin_viewed_at?: string | null
          carrier?: string | null
          coupon_code?: string | null
          created_at?: string
          currency?: string
          discount_total?: number
          email?: string
          fulfillment_status?: string
          id?: string
          metadata?: Json | null
          order_number?: string
          shipped_at?: string | null
          shipping_address?: Json | null
          shipping_total?: number
          status?: string
          stripe_payment_intent_id?: string | null
          stripe_session_id?: string | null
          subtotal?: number
          tax_total?: number
          total?: number
          tracking_number?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      owner_statements: {
        Row: {
          created_at: string
          fees: number
          gross_rent: number
          id: string
          net_payout: number
          pdf_url: string | null
          period_end: string
          period_start: string
          property_owner_id: string
        }
        Insert: {
          created_at?: string
          fees?: number
          gross_rent?: number
          id?: string
          net_payout?: number
          pdf_url?: string | null
          period_end: string
          period_start: string
          property_owner_id: string
        }
        Update: {
          created_at?: string
          fees?: number
          gross_rent?: number
          id?: string
          net_payout?: number
          pdf_url?: string | null
          period_end?: string
          period_start?: string
          property_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "owner_statements_property_owner_id_fkey"
            columns: ["property_owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_breakdowns: {
        Row: {
          amount: number
          charge_type_id: string | null
          created_at: string
          id: string
          label: string
          sort_order: number
          transaction_id: string
        }
        Insert: {
          amount?: number
          charge_type_id?: string | null
          created_at?: string
          id?: string
          label: string
          sort_order?: number
          transaction_id: string
        }
        Update: {
          amount?: number
          charge_type_id?: string | null
          created_at?: string
          id?: string
          label?: string
          sort_order?: number
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "payment_breakdowns_charge_type_id_fkey"
            columns: ["charge_type_id"]
            isOneToOne: false
            referencedRelation: "payment_charge_types"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "payment_breakdowns_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      payment_charge_types: {
        Row: {
          applies_to: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          applies_to?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          applies_to?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      private_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      product_bundle_items: {
        Row: {
          bundle_id: string
          created_at: string
          id: string
          label: string | null
          product_id: string
          quantity: number
          sort_order: number
          variant_id: string | null
        }
        Insert: {
          bundle_id: string
          created_at?: string
          id?: string
          label?: string | null
          product_id: string
          quantity?: number
          sort_order?: number
          variant_id?: string | null
        }
        Update: {
          bundle_id?: string
          created_at?: string
          id?: string
          label?: string | null
          product_id?: string
          quantity?: number
          sort_order?: number
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "product_bundle_items_bundle_id_fkey"
            columns: ["bundle_id"]
            isOneToOne: false
            referencedRelation: "product_bundles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_bundle_items_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      product_bundles: {
        Row: {
          badge: string | null
          compare_at_price: number | null
          created_at: string
          description: string | null
          gallery_urls: Json
          id: string
          image_url: string | null
          name: string
          overview: string | null
          price: number
          published: boolean
          sku: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          badge?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gallery_urls?: Json
          id?: string
          image_url?: string | null
          name: string
          overview?: string | null
          price: number
          published?: boolean
          sku?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          badge?: string | null
          compare_at_price?: number | null
          created_at?: string
          description?: string | null
          gallery_urls?: Json
          id?: string
          image_url?: string | null
          name?: string
          overview?: string | null
          price?: number
          published?: boolean
          sku?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      product_reviews: {
        Row: {
          body: string
          created_at: string
          id: string
          order_id: string | null
          product_id: string
          rating: number
          status: string
          title: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          body: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id: string
          rating: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          body?: string
          created_at?: string
          id?: string
          order_id?: string | null
          product_id?: string
          rating?: number
          status?: string
          title?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_reviews_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "product_reviews_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      product_variants: {
        Row: {
          compare_at_price: number | null
          created_at: string
          id: string
          image_url: string | null
          inventory_count: number
          is_active: boolean
          name: string
          option_values: Json
          price: number | null
          product_id: string
          sku: string | null
          sort_order: number
          updated_at: string
        }
        Insert: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_count?: number
          is_active?: boolean
          name: string
          option_values?: Json
          price?: number | null
          product_id: string
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Update: {
          compare_at_price?: number | null
          created_at?: string
          id?: string
          image_url?: string | null
          inventory_count?: number
          is_active?: boolean
          name?: string
          option_values?: Json
          price?: number | null
          product_id?: string
          sku?: string | null
          sort_order?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "product_variants_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      products: {
        Row: {
          agent_commission_type: string | null
          agent_commission_value: number | null
          area_id: string | null
          assigned_agent_id: string | null
          availability_date: string | null
          badge: string | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          contract_terms: string | null
          created_at: string
          delivery_info: string | null
          description: string | null
          exact_address: string | null
          furnishing_status_id: string | null
          gallery_urls: Json
          id: string
          image_url: string | null
          inventory_count: number
          is_featured: boolean
          is_new: boolean
          is_summer: boolean
          latitude: number | null
          listing_type: string | null
          longitude: number | null
          name: string
          other_charges: number | null
          overview: string | null
          price: number
          property_reference: string | null
          property_status_id: string | null
          property_type_id: string | null
          published: boolean
          rent_payment_cheques: number | null
          security_deposit: number | null
          size_sqft: number | null
          sku: string | null
          slug: string
          sort_order: number
          specs: Json
          updated_at: string
          use_default_delivery: boolean
          viewing_availability: Json
          weight_kg: number | null
        }
        Insert: {
          agent_commission_type?: string | null
          agent_commission_value?: number | null
          area_id?: string | null
          assigned_agent_id?: string | null
          availability_date?: string | null
          badge?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          contract_terms?: string | null
          created_at?: string
          delivery_info?: string | null
          description?: string | null
          exact_address?: string | null
          furnishing_status_id?: string | null
          gallery_urls?: Json
          id?: string
          image_url?: string | null
          inventory_count?: number
          is_featured?: boolean
          is_new?: boolean
          is_summer?: boolean
          latitude?: number | null
          listing_type?: string | null
          longitude?: number | null
          name: string
          other_charges?: number | null
          overview?: string | null
          price: number
          property_reference?: string | null
          property_status_id?: string | null
          property_type_id?: string | null
          published?: boolean
          rent_payment_cheques?: number | null
          security_deposit?: number | null
          size_sqft?: number | null
          sku?: string | null
          slug: string
          sort_order?: number
          specs?: Json
          updated_at?: string
          use_default_delivery?: boolean
          viewing_availability?: Json
          weight_kg?: number | null
        }
        Update: {
          agent_commission_type?: string | null
          agent_commission_value?: number | null
          area_id?: string | null
          assigned_agent_id?: string | null
          availability_date?: string | null
          badge?: string | null
          bathrooms?: number | null
          bedrooms?: number | null
          category_id?: string | null
          collection_id?: string | null
          compare_at_price?: number | null
          contract_terms?: string | null
          created_at?: string
          delivery_info?: string | null
          description?: string | null
          exact_address?: string | null
          furnishing_status_id?: string | null
          gallery_urls?: Json
          id?: string
          image_url?: string | null
          inventory_count?: number
          is_featured?: boolean
          is_new?: boolean
          is_summer?: boolean
          latitude?: number | null
          listing_type?: string | null
          longitude?: number | null
          name?: string
          other_charges?: number | null
          overview?: string | null
          price?: number
          property_reference?: string | null
          property_status_id?: string | null
          property_type_id?: string | null
          published?: boolean
          rent_payment_cheques?: number | null
          security_deposit?: number | null
          size_sqft?: number | null
          sku?: string | null
          slug?: string
          sort_order?: number
          specs?: Json
          updated_at?: string
          use_default_delivery?: boolean
          viewing_availability?: Json
          weight_kg?: number | null
        }
        Relationships: [
          {
            foreignKeyName: "products_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "property_areas"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "categories"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_collection_id_fkey"
            columns: ["collection_id"]
            isOneToOne: false
            referencedRelation: "collections"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_furnishing_status_id_fkey"
            columns: ["furnishing_status_id"]
            isOneToOne: false
            referencedRelation: "furnishing_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_property_status_id_fkey"
            columns: ["property_status_id"]
            isOneToOne: false
            referencedRelation: "property_statuses"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "products_property_type_id_fkey"
            columns: ["property_type_id"]
            isOneToOne: false
            referencedRelation: "property_types"
            referencedColumns: ["id"]
          },
        ]
      }
      property_amenities: {
        Row: {
          amenity_id: string
          property_id: string
        }
        Insert: {
          amenity_id: string
          property_id: string
        }
        Update: {
          amenity_id?: string
          property_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_amenities_amenity_id_fkey"
            columns: ["amenity_id"]
            isOneToOne: false
            referencedRelation: "amenities"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_amenities_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      property_areas: {
        Row: {
          city: string | null
          country: string | null
          created_at: string
          id: string
          is_active: boolean
          latitude: number | null
          longitude: number | null
          name: string
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name: string
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          city?: string | null
          country?: string | null
          created_at?: string
          id?: string
          is_active?: boolean
          latitude?: number | null
          longitude?: number | null
          name?: string
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      property_inquiries: {
        Row: {
          assigned_agent_id: string | null
          client_user_id: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          interest_type: string | null
          message: string | null
          phone: string | null
          preferred_viewing_date: string | null
          preferred_viewing_time: string | null
          property_id: string
          property_reference: string | null
          status: string
          transaction_id: string | null
        }
        Insert: {
          assigned_agent_id?: string | null
          client_user_id?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          interest_type?: string | null
          message?: string | null
          phone?: string | null
          preferred_viewing_date?: string | null
          preferred_viewing_time?: string | null
          property_id: string
          property_reference?: string | null
          status?: string
          transaction_id?: string | null
        }
        Update: {
          assigned_agent_id?: string | null
          client_user_id?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          interest_type?: string | null
          message?: string | null
          phone?: string | null
          preferred_viewing_date?: string | null
          preferred_viewing_time?: string | null
          property_id?: string
          property_reference?: string | null
          status?: string
          transaction_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "property_inquiries_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inquiries_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_inquiries_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owner_assignments: {
        Row: {
          created_at: string
          id: string
          management_fee_pct: number
          ownership_share: number
          product_id: string
          property_owner_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          management_fee_pct?: number
          ownership_share?: number
          product_id: string
          property_owner_id: string
        }
        Update: {
          created_at?: string
          id?: string
          management_fee_pct?: number
          ownership_share?: number
          product_id?: string
          property_owner_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_owner_assignments_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_owner_assignments_property_owner_id_fkey"
            columns: ["property_owner_id"]
            isOneToOne: false
            referencedRelation: "property_owners"
            referencedColumns: ["id"]
          },
        ]
      }
      property_owners: {
        Row: {
          auth_user_id: string | null
          company_name: string | null
          created_at: string
          email: string
          full_name: string
          id: string
          is_active: boolean
          phone: string | null
          tax_id: string | null
          updated_at: string
        }
        Insert: {
          auth_user_id?: string | null
          company_name?: string | null
          created_at?: string
          email: string
          full_name: string
          id?: string
          is_active?: boolean
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Update: {
          auth_user_id?: string | null
          company_name?: string | null
          created_at?: string
          email?: string
          full_name?: string
          id?: string
          is_active?: boolean
          phone?: string | null
          tax_id?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      property_statuses: {
        Row: {
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      property_transactions: {
        Row: {
          assigned_agent_id: string | null
          client_email: string
          client_user_id: string | null
          created_at: string
          id: string
          listing_type: string
          metadata: Json
          order_id: string | null
          property_id: string
          status: string
          transaction_number: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          client_email: string
          client_user_id?: string | null
          created_at?: string
          id?: string
          listing_type: string
          metadata?: Json
          order_id?: string | null
          property_id: string
          status?: string
          transaction_number: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          client_email?: string
          client_user_id?: string | null
          created_at?: string
          id?: string
          listing_type?: string
          metadata?: Json
          order_id?: string | null
          property_id?: string
          status?: string
          transaction_number?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "property_transactions_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_order_id_fkey"
            columns: ["order_id"]
            isOneToOne: false
            referencedRelation: "orders"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "property_transactions_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      property_types: {
        Row: {
          created_at: string
          id: string
          is_active: boolean
          name: string
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          id?: string
          is_active?: boolean
          name: string
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          id?: string
          is_active?: boolean
          name?: string
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      rate_limit_events: {
        Row: {
          action: string
          created_at: string
          id: string
          identifier: string
        }
        Insert: {
          action: string
          created_at?: string
          id?: string
          identifier: string
        }
        Update: {
          action?: string
          created_at?: string
          id?: string
          identifier?: string
        }
        Relationships: []
      }
      rent_installments: {
        Row: {
          amount: number
          created_at: string
          due_date: string
          id: string
          installment_type: string
          lease_id: string
          status: string
          updated_at: string
        }
        Insert: {
          amount: number
          created_at?: string
          due_date: string
          id?: string
          installment_type?: string
          lease_id: string
          status?: string
          updated_at?: string
        }
        Update: {
          amount?: number
          created_at?: string
          due_date?: string
          id?: string
          installment_type?: string
          lease_id?: string
          status?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "rent_installments_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      rent_payments: {
        Row: {
          admin_notes: string | null
          amount: number
          created_at: string
          id: string
          installment_id: string
          payment_method: string
          proof_url: string | null
          status: string
          stripe_payment_id: string | null
          submitted_by: string | null
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          admin_notes?: string | null
          amount: number
          created_at?: string
          id?: string
          installment_id: string
          payment_method?: string
          proof_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          submitted_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          admin_notes?: string | null
          amount?: number
          created_at?: string
          id?: string
          installment_id?: string
          payment_method?: string
          proof_url?: string | null
          status?: string
          stripe_payment_id?: string | null
          submitted_by?: string | null
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "rent_payments_installment_id_fkey"
            columns: ["installment_id"]
            isOneToOne: false
            referencedRelation: "rent_installments"
            referencedColumns: ["id"]
          },
        ]
      }
      service_request_messages: {
        Row: {
          attachments: Json
          author_role: string
          author_user_id: string
          body: string
          created_at: string
          id: string
          request_id: string
        }
        Insert: {
          attachments?: Json
          author_role: string
          author_user_id: string
          body: string
          created_at?: string
          id?: string
          request_id: string
        }
        Update: {
          attachments?: Json
          author_role?: string
          author_user_id?: string
          body?: string
          created_at?: string
          id?: string
          request_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_request_messages_request_id_fkey"
            columns: ["request_id"]
            isOneToOne: false
            referencedRelation: "service_requests"
            referencedColumns: ["id"]
          },
        ]
      }
      service_requests: {
        Row: {
          assigned_agent_id: string | null
          category: string | null
          created_at: string
          description: string
          id: string
          lease_id: string | null
          priority: string
          product_id: string | null
          request_type: string
          resolved_at: string | null
          sla_due_at: string | null
          status: string
          tenant_user_id: string
          title: string
          updated_at: string
        }
        Insert: {
          assigned_agent_id?: string | null
          category?: string | null
          created_at?: string
          description: string
          id?: string
          lease_id?: string | null
          priority?: string
          product_id?: string | null
          request_type: string
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string
          tenant_user_id: string
          title: string
          updated_at?: string
        }
        Update: {
          assigned_agent_id?: string | null
          category?: string | null
          created_at?: string
          description?: string
          id?: string
          lease_id?: string | null
          priority?: string
          product_id?: string | null
          request_type?: string
          resolved_at?: string | null
          sla_due_at?: string | null
          status?: string
          tenant_user_id?: string
          title?: string
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "service_requests_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "service_requests_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
      shipping_zones: {
        Row: {
          countries: Json
          created_at: string
          flat_rate: number
          free_shipping_threshold: number | null
          id: string
          is_active: boolean
          name: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          countries?: Json
          created_at?: string
          flat_rate?: number
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          name: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          countries?: Json
          created_at?: string
          flat_rate?: number
          free_shipping_threshold?: number | null
          id?: string
          is_active?: boolean
          name?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          key: string
          updated_at: string
          value: string
        }
        Insert: {
          key: string
          updated_at?: string
          value?: string
        }
        Update: {
          key?: string
          updated_at?: string
          value?: string
        }
        Relationships: []
      }
      social_links: {
        Row: {
          created_at: string
          href: string
          icon: string
          id: string
          is_active: boolean
          label: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          href: string
          icon?: string
          id?: string
          is_active?: boolean
          label: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          href?: string
          icon?: string
          id?: string
          is_active?: boolean
          label?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      stock_alert_subscriptions: {
        Row: {
          created_at: string
          email: string
          id: string
          notified_at: string | null
          product_id: string
          variant_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          notified_at?: string | null
          product_id: string
          variant_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          notified_at?: string | null
          product_id?: string
          variant_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "stock_alert_subscriptions_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "stock_alert_subscriptions_variant_id_fkey"
            columns: ["variant_id"]
            isOneToOne: false
            referencedRelation: "product_variants"
            referencedColumns: ["id"]
          },
        ]
      }
      storefront_carts: {
        Row: {
          abandoned_email_sent_at: string | null
          coupon_code: string | null
          created_at: string
          email: string | null
          id: string
          items: Json
          last_activity_at: string
          session_id: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          abandoned_email_sent_at?: string | null
          coupon_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          last_activity_at?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          abandoned_email_sent_at?: string | null
          coupon_code?: string | null
          created_at?: string
          email?: string | null
          id?: string
          items?: Json
          last_activity_at?: string
          session_id?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      tenant_documents: {
        Row: {
          created_at: string
          doc_type: string
          file_url: string
          id: string
          lease_id: string
          verified_at: string | null
          verified_by: string | null
        }
        Insert: {
          created_at?: string
          doc_type: string
          file_url: string
          id?: string
          lease_id: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Update: {
          created_at?: string
          doc_type?: string
          file_url?: string
          id?: string
          lease_id?: string
          verified_at?: string | null
          verified_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "tenant_documents_lease_id_fkey"
            columns: ["lease_id"]
            isOneToOne: false
            referencedRelation: "leases"
            referencedColumns: ["id"]
          },
        ]
      }
      uploaded_contracts: {
        Row: {
          client_user_id: string | null
          created_at: string
          file_name: string | null
          file_url: string
          generated_contract_id: string | null
          id: string
          review_notes: string | null
          review_status: string
          reviewed_at: string | null
          reviewed_by_agent_id: string | null
          transaction_id: string
        }
        Insert: {
          client_user_id?: string | null
          created_at?: string
          file_name?: string | null
          file_url: string
          generated_contract_id?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by_agent_id?: string | null
          transaction_id: string
        }
        Update: {
          client_user_id?: string | null
          created_at?: string
          file_name?: string | null
          file_url?: string
          generated_contract_id?: string | null
          id?: string
          review_notes?: string | null
          review_status?: string
          reviewed_at?: string | null
          reviewed_by_agent_id?: string | null
          transaction_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "uploaded_contracts_generated_contract_id_fkey"
            columns: ["generated_contract_id"]
            isOneToOne: false
            referencedRelation: "generated_contracts"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_contracts_reviewed_by_agent_id_fkey"
            columns: ["reviewed_by_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "uploaded_contracts_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      viewing_requests: {
        Row: {
          agent_notes: string | null
          assigned_agent_id: string | null
          client_email: string | null
          client_full_name: string | null
          client_phone: string | null
          client_user_id: string | null
          created_at: string
          id: string
          preferred_date: string | null
          preferred_time: string | null
          property_id: string
          scheduled_date: string | null
          scheduled_time: string | null
          status: string
          transaction_id: string | null
          updated_at: string
        }
        Insert: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          client_email?: string | null
          client_full_name?: string | null
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_id: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Update: {
          agent_notes?: string | null
          assigned_agent_id?: string | null
          client_email?: string | null
          client_full_name?: string | null
          client_phone?: string | null
          client_user_id?: string | null
          created_at?: string
          id?: string
          preferred_date?: string | null
          preferred_time?: string | null
          property_id?: string
          scheduled_date?: string | null
          scheduled_time?: string | null
          status?: string
          transaction_id?: string | null
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "viewing_requests_assigned_agent_id_fkey"
            columns: ["assigned_agent_id"]
            isOneToOne: false
            referencedRelation: "agents"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_property_id_fkey"
            columns: ["property_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "viewing_requests_transaction_id_fkey"
            columns: ["transaction_id"]
            isOneToOne: false
            referencedRelation: "property_transactions"
            referencedColumns: ["id"]
          },
        ]
      }
      wishlists: {
        Row: {
          created_at: string
          id: string
          product_id: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          product_id: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          product_id?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "wishlists_product_id_fkey"
            columns: ["product_id"]
            isOneToOne: false
            referencedRelation: "products"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      auth_user_email: { Args: { p_user_id: string }; Returns: string }
      bundle_available_quantity: {
        Args: { p_bundle_id: string; p_selections?: Json }
        Returns: number
      }
      can_manage_admin_users: { Args: never; Returns: boolean }
      create_workflow_notification: {
        Args: {
          p_body: string
          p_link_href: string
          p_recipient_role: string
          p_title: string
          p_transaction_id: string
          p_user_id: string
        }
        Returns: undefined
      }
      current_agent_id: { Args: never; Returns: string }
      current_landlord_id: { Args: never; Returns: string }
      is_admin: { Args: never; Returns: boolean }
      is_admin_reader: { Args: never; Returns: boolean }
      is_agent: { Args: never; Returns: boolean }
      is_landlord: { Args: never; Returns: boolean }
      is_tenant: { Args: never; Returns: boolean }
      next_property_invoice_number: { Args: never; Returns: string }
      next_property_transaction_number: { Args: never; Returns: string }
      reserved_inventory_quantity: {
        Args: {
          p_exclude_order_id?: string
          p_product_id: string
          p_variant_id?: string
        }
        Returns: number
      }
      resolve_bundle_item_variant: {
        Args: { p_bundle_item_id: string; p_selections: Json }
        Returns: string
      }
      resolve_coupon_discount: {
        Args: { p_code: string; p_subtotal: number }
        Returns: Json
      }
      resolve_product_delivery_text: {
        Args: { p_product_id: string }
        Returns: string
      }
      resolve_shipping_rate: {
        Args: { p_country: string; p_subtotal: number }
        Returns: number
      }
      rpc_activate_lease_from_transaction: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_admin_fulfill_order_inventory: {
        Args: { p_order_id: string }
        Returns: Json
      }
      rpc_agent_approve_transaction: {
        Args: {
          p_decision: string
          p_internal_notes?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      rpc_agent_generate_contract: {
        Args: {
          p_contract_data?: Json
          p_file_name?: string
          p_file_url?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      rpc_agent_review_contract: {
        Args: {
          p_decision: string
          p_review_notes?: string
          p_upload_id: string
        }
        Returns: Json
      }
      rpc_agent_update_viewing: {
        Args: {
          p_agent_notes?: string
          p_scheduled_date?: string
          p_scheduled_time?: string
          p_status: string
          p_viewing_id: string
        }
        Returns: Json
      }
      rpc_build_payment_breakdown: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_can_review_product: { Args: { p_product_id: string }; Returns: Json }
      rpc_check_rate_limit: {
        Args: {
          p_action: string
          p_identifier: string
          p_max_requests?: number
          p_window_seconds?: number
        }
        Returns: Json
      }
      rpc_client_request_contract: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_complete_handover: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_create_property_invoice: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_create_service_request: {
        Args: {
          p_category: string
          p_description: string
          p_lease_id: string
          p_priority: string
          p_title: string
          p_type: string
        }
        Returns: Json
      }
      rpc_fulfill_order_inventory: {
        Args: { p_order_id: string }
        Returns: Json
      }
      rpc_generate_owner_statement: {
        Args: {
          p_owner_id: string
          p_period_end: string
          p_period_start: string
        }
        Returns: Json
      }
      rpc_get_admin_dashboard: { Args: never; Returns: Json }
      rpc_get_admin_edit_context: { Args: never; Returns: Json }
      rpc_get_admin_session: { Args: never; Returns: Json }
      rpc_get_cart_totals: {
        Args: {
          p_coupon_code?: string
          p_currency?: string
          p_items: Json
          p_shipping_country?: string
        }
        Returns: Json
      }
      rpc_get_collection_products: {
        Args: { p_collection_slug: string }
        Returns: {
          agent_commission_type: string | null
          agent_commission_value: number | null
          area_id: string | null
          assigned_agent_id: string | null
          availability_date: string | null
          badge: string | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          contract_terms: string | null
          created_at: string
          delivery_info: string | null
          description: string | null
          exact_address: string | null
          furnishing_status_id: string | null
          gallery_urls: Json
          id: string
          image_url: string | null
          inventory_count: number
          is_featured: boolean
          is_new: boolean
          is_summer: boolean
          latitude: number | null
          listing_type: string | null
          longitude: number | null
          name: string
          other_charges: number | null
          overview: string | null
          price: number
          property_reference: string | null
          property_status_id: string | null
          property_type_id: string | null
          published: boolean
          rent_payment_cheques: number | null
          security_deposit: number | null
          size_sqft: number | null
          sku: string | null
          slug: string
          sort_order: number
          specs: Json
          updated_at: string
          use_default_delivery: boolean
          viewing_availability: Json
          weight_kg: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rpc_get_contract_data: {
        Args: { p_transaction_id: string }
        Returns: Json
      }
      rpc_get_homepage_products: {
        Args: { p_section?: string }
        Returns: {
          agent_commission_type: string | null
          agent_commission_value: number | null
          area_id: string | null
          assigned_agent_id: string | null
          availability_date: string | null
          badge: string | null
          bathrooms: number | null
          bedrooms: number | null
          category_id: string | null
          collection_id: string | null
          compare_at_price: number | null
          contract_terms: string | null
          created_at: string
          delivery_info: string | null
          description: string | null
          exact_address: string | null
          furnishing_status_id: string | null
          gallery_urls: Json
          id: string
          image_url: string | null
          inventory_count: number
          is_featured: boolean
          is_new: boolean
          is_summer: boolean
          latitude: number | null
          listing_type: string | null
          longitude: number | null
          name: string
          other_charges: number | null
          overview: string | null
          price: number
          property_reference: string | null
          property_status_id: string | null
          property_type_id: string | null
          published: boolean
          rent_payment_cheques: number | null
          security_deposit: number | null
          size_sqft: number | null
          sku: string | null
          slug: string
          sort_order: number
          specs: Json
          updated_at: string
          use_default_delivery: boolean
          viewing_availability: Json
          weight_kg: number | null
        }[]
        SetofOptions: {
          from: "*"
          to: "products"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      rpc_get_storefront_bundle: { Args: { p_slug: string }; Returns: Json }
      rpc_get_storefront_product: { Args: { p_slug: string }; Returns: Json }
      rpc_get_tenancy_dashboard: { Args: never; Returns: Json }
      rpc_list_admin_customers: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Json
      }
      rpc_list_admin_orders: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Json
      }
      rpc_list_admin_products: {
        Args: { p_limit?: number; p_offset?: number; p_search?: string }
        Returns: Json
      }
      rpc_list_client_transactions: { Args: never; Returns: Json }
      rpc_list_cms_media: {
        Args: {
          p_kind?: string
          p_limit?: number
          p_offset?: number
          p_search?: string
        }
        Returns: Json
      }
      rpc_list_low_stock_products: {
        Args: { p_threshold?: number }
        Returns: Json
      }
      rpc_list_storefront_bundles: {
        Args: { p_limit?: number; p_offset?: number }
        Returns: Json
      }
      rpc_list_storefront_products:
        | {
            Args: {
              p_filter?: string
              p_limit?: number
              p_offset?: number
              p_slug?: string
            }
            Returns: Json
          }
        | {
            Args: {
              p_filter?: string
              p_in_stock_only?: boolean
              p_limit?: number
              p_max_price?: number
              p_min_price?: number
              p_offset?: number
              p_slug?: string
              p_sort?: string
            }
            Returns: Json
          }
      rpc_list_wishlist_product_ids: { Args: never; Returns: Json }
      rpc_notify_stock_alerts: { Args: never; Returns: Json }
      rpc_product_autocomplete: {
        Args: { p_limit?: number; p_query: string }
        Returns: Json
      }
      rpc_record_property_payment: {
        Args: { p_invoice_id?: string; p_transaction_id: string }
        Returns: Json
      }
      rpc_redeem_coupon_for_order: {
        Args: { p_order_id: string }
        Returns: Json
      }
      rpc_register_cms_media: {
        Args: {
          p_file_name?: string
          p_folder?: string
          p_kind?: string
          p_public_url: string
        }
        Returns: Json
      }
      rpc_release_expired_reservations: { Args: never; Returns: Json }
      rpc_release_inventory_for_order: {
        Args: { p_order_id: string }
        Returns: Json
      }
      rpc_reserve_inventory_for_order: {
        Args: { p_order_id: string; p_ttl_minutes?: number }
        Returns: Json
      }
      rpc_schedule_handover: {
        Args: {
          p_agent_notes?: string
          p_handover_date: string
          p_handover_time?: string
          p_key_collection_details?: string
          p_meeting_location?: string
          p_possession_instructions?: string
          p_required_documents?: string
          p_transaction_id: string
        }
        Returns: Json
      }
      rpc_search_storefront_products: {
        Args: { p_limit?: number; p_offset?: number; p_query: string }
        Returns: Json
      }
      rpc_submit_client_declaration: {
        Args: {
          p_decision?: string
          p_notes?: string
          p_transaction_id: string
          p_viewing_request_id?: string
        }
        Returns: Json
      }
      rpc_submit_contact_form: {
        Args: { p_email: string; p_message: string; p_name: string }
        Returns: Json
      }
      rpc_submit_product_review: {
        Args: {
          p_body?: string
          p_product_id: string
          p_rating: number
          p_title?: string
        }
        Returns: Json
      }
      rpc_submit_property_callback: {
        Args: { p_full_name: string; p_phone: string; p_property_id: string }
        Returns: Json
      }
      rpc_submit_property_inquiry: {
        Args: {
          p_email: string
          p_full_name: string
          p_interest_type?: string
          p_message?: string
          p_phone?: string
          p_preferred_viewing_date?: string
          p_preferred_viewing_time?: string
          p_property_id: string
          p_request_viewing?: boolean
        }
        Returns: Json
      }
      rpc_submit_rent_payment_proof: {
        Args: {
          p_amount: number
          p_installment_id: string
          p_method: string
          p_proof_url?: string
        }
        Returns: Json
      }
      rpc_subscribe_newsletter: {
        Args: { p_email: string; p_source?: string }
        Returns: Json
      }
      rpc_subscribe_stock_alert: {
        Args: { p_email: string; p_product_id: string; p_variant_id?: string }
        Returns: Json
      }
      rpc_sync_storefront_cart: {
        Args: {
          p_coupon_code?: string
          p_email?: string
          p_items: Json
          p_session_id: string
        }
        Returns: Json
      }
      rpc_toggle_move_in_item: {
        Args: { p_checklist_id: string; p_done: boolean; p_item_id: string }
        Returns: Json
      }
      rpc_toggle_wishlist: { Args: { p_product_id: string }; Returns: Json }
      rpc_update_service_request_status: {
        Args: {
          p_assigned_agent_id?: string
          p_request_id: string
          p_status: string
        }
        Returns: Json
      }
      rpc_verify_rent_payment: {
        Args: { p_approve: boolean; p_notes?: string; p_payment_id: string }
        Returns: Json
      }
      user_has_purchased_product: {
        Args: { p_product_id: string; p_user_id: string }
        Returns: boolean
      }
    }
    Enums: {
      [_ in never]: never
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
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
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {},
  },
} as const
