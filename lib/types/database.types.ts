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
    PostgrestVersion: "14.1"
  }
  public: {
    Tables: {
      certificate_issued: {
        Row: {
          certificate_id: string
          certificate_url: string
          id: string
          issued_at: string | null
          registration_id: string
          verification_code: string
        }
        Insert: {
          certificate_id: string
          certificate_url: string
          id?: string
          issued_at?: string | null
          registration_id: string
          verification_code: string
        }
        Update: {
          certificate_id?: string
          certificate_url?: string
          id?: string
          issued_at?: string | null
          registration_id?: string
          verification_code?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificate_issued_certificate_id_fkey"
            columns: ["certificate_id"]
            isOneToOne: false
            referencedRelation: "certificates"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "certificate_issued_registration_id_fkey"
            columns: ["registration_id"]
            isOneToOne: true
            referencedRelation: "registrations"
            referencedColumns: ["id"]
          },
        ]
      }
      certificates: {
        Row: {
          created_at: string | null
          custom_design_url: string | null
          custom_message: string | null
          dynamic_fields: Json | null
          id: string
          template_type: string
          updated_at: string | null
          workshop_id: string
        }
        Insert: {
          created_at?: string | null
          custom_design_url?: string | null
          custom_message?: string | null
          dynamic_fields?: Json | null
          id?: string
          template_type?: string
          updated_at?: string | null
          workshop_id: string
        }
        Update: {
          created_at?: string | null
          custom_design_url?: string | null
          custom_message?: string | null
          dynamic_fields?: Json | null
          id?: string
          template_type?: string
          updated_at?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "certificates_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: true
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      registrations: {
        Row: {
          approved_at: string | null
          custom_data: Json | null
          id: string
          registered_at: string | null
          status: Database["public"]["Enums"]["registration_status"]
          student_email: string
          student_name: string
          student_phone: string
          updated_at: string | null
          user_id: string | null
          workshop_id: string
        }
        Insert: {
          approved_at?: string | null
          custom_data?: Json | null
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          student_email: string
          student_name: string
          student_phone: string
          updated_at?: string | null
          user_id?: string | null
          workshop_id: string
        }
        Update: {
          approved_at?: string | null
          custom_data?: Json | null
          id?: string
          registered_at?: string | null
          status?: Database["public"]["Enums"]["registration_status"]
          student_email?: string
          student_name?: string
          student_phone?: string
          updated_at?: string | null
          user_id?: string | null
          workshop_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "registrations_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "registrations_workshop_id_fkey"
            columns: ["workshop_id"]
            isOneToOne: false
            referencedRelation: "workshops"
            referencedColumns: ["id"]
          },
        ]
      }
      subscription_plans: {
        Row: {
          created_at: string
          features: Json | null
          id: string
          is_active: boolean | null
          max_students_per_workshop: number | null
          max_workshops: number | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type_enum"]
          price_monthly: number
          price_yearly: number
          stripe_price_id_monthly: string | null
          stripe_price_id_yearly: string | null
        }
        Insert: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_students_per_workshop?: number | null
          max_workshops?: number | null
          name: string
          plan_type: Database["public"]["Enums"]["plan_type_enum"]
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Update: {
          created_at?: string
          features?: Json | null
          id?: string
          is_active?: boolean | null
          max_students_per_workshop?: number | null
          max_workshops?: number | null
          name?: string
          plan_type?: Database["public"]["Enums"]["plan_type_enum"]
          price_monthly?: number
          price_yearly?: number
          stripe_price_id_monthly?: string | null
          stripe_price_id_yearly?: string | null
        }
        Relationships: []
      }
      user_subscriptions: {
        Row: {
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          cancel_at_period_end: boolean | null
          created_at: string
          current_period_end: string | null
          current_period_start: string | null
          id: string
          plan_id: string
          status: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id: string | null
          stripe_subscription_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          billing_period: Database["public"]["Enums"]["billing_period_enum"]
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          billing_period?: Database["public"]["Enums"]["billing_period_enum"]
          cancel_at_period_end?: boolean | null
          created_at?: string
          current_period_end?: string | null
          current_period_start?: string | null
          id?: string
          plan_id?: string
          status?: Database["public"]["Enums"]["subscription_status_enum"]
          stripe_customer_id?: string | null
          stripe_subscription_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_subscriptions_plan_id_fkey"
            columns: ["plan_id"]
            isOneToOne: false
            referencedRelation: "subscription_plans"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_subscriptions_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      users: {
        Row: {
          account_role: Database["public"]["Enums"]["user_role"]
          created_at: string | null
          email: string
          full_name: string
          id: string
          phone: string | null
          subscription_id: string | null
          updated_at: string | null
          user_type: Database["public"]["Enums"]["organizer_type"] | null
        }
        Insert: {
          account_role?: Database["public"]["Enums"]["user_role"]
          created_at?: string | null
          email: string
          full_name: string
          id: string
          phone?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["organizer_type"] | null
        }
        Update: {
          account_role?: Database["public"]["Enums"]["user_role"]
          created_at?: string | null
          email?: string
          full_name?: string
          id?: string
          phone?: string | null
          subscription_id?: string | null
          updated_at?: string | null
          user_type?: Database["public"]["Enums"]["organizer_type"] | null
        }
        Relationships: [
          {
            foreignKeyName: "users_subscription_id_fkey"
            columns: ["subscription_id"]
            isOneToOne: false
            referencedRelation: "user_subscriptions"
            referencedColumns: ["id"]
          },
        ]
      }
      webhook_events: {
        Row: {
          created_at: string
          error_message: string | null
          event_data: Json
          event_type: string
          id: string
          processed: boolean | null
          processed_at: string | null
        }
        Insert: {
          created_at?: string
          error_message?: string | null
          event_data: Json
          event_type: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Update: {
          created_at?: string
          error_message?: string | null
          event_data?: Json
          event_type?: string
          id?: string
          processed?: boolean | null
          processed_at?: string | null
        }
        Relationships: []
      }
      whatsapp_templates: {
        Row: {
          created_at: string | null
          id: string
          template_message: string
          template_name: string
          updated_at: string | null
          user_id: string
        }
        Insert: {
          created_at?: string | null
          id?: string
          template_message: string
          template_name: string
          updated_at?: string | null
          user_id: string
        }
        Update: {
          created_at?: string | null
          id?: string
          template_message?: string
          template_name?: string
          updated_at?: string | null
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "whatsapp_templates_user_id_fkey"
            columns: ["user_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
      workshops: {
        Row: {
          created_at: string | null
          custom_fields: Json | null
          description: string | null
          end_date: string
          id: string
          max_capacity: number
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          start_date: string
          status: Database["public"]["Enums"]["workshop_status"]
          title: string
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          end_date: string
          id?: string
          max_capacity?: number
          organizer_id: string
          organizer_type: Database["public"]["Enums"]["organizer_type"]
          start_date: string
          status?: Database["public"]["Enums"]["workshop_status"]
          title: string
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          custom_fields?: Json | null
          description?: string | null
          end_date?: string
          id?: string
          max_capacity?: number
          organizer_id?: string
          organizer_type?: Database["public"]["Enums"]["organizer_type"]
          start_date?: string
          status?: Database["public"]["Enums"]["workshop_status"]
          title?: string
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "workshops_organizer_id_fkey"
            columns: ["organizer_id"]
            isOneToOne: false
            referencedRelation: "users"
            referencedColumns: ["id"]
          },
        ]
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      generate_verification_code: { Args: never; Returns: string }
      update_workshop_status: { Args: never; Returns: undefined }
    }
    Enums: {
      billing_period_enum: "monthly" | "yearly"
      organizer_type: "individual" | "academy"
      plan_type_enum: "free" | "basic" | "premium" | "enterprise"
      registration_status: "pending" | "approved" | "rejected"
      subscription_status_enum: "active" | "cancelled" | "past_due" | "trialing"
      user_role: "organizer" | "student"
      workshop_status: "draft" | "active" | "completed" | "cancelled"
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
    Enums: {
      billing_period_enum: ["monthly", "yearly"],
      organizer_type: ["individual", "academy"],
      plan_type_enum: ["free", "basic", "premium", "enterprise"],
      registration_status: ["pending", "approved", "rejected"],
      subscription_status_enum: ["active", "cancelled", "past_due", "trialing"],
      user_role: ["organizer", "student"],
      workshop_status: ["draft", "active", "completed", "cancelled"],
    },
  },
} as const

