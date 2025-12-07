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
    PostgrestVersion: "13.0.5"
  }
  public: {
    Tables: {
      entry_lots: {
        Row: {
          barcode: string | null
          barcode_image_url: string | null
          created_at: string
          delivery_note_url: string | null
          id: string
          lot_number: string
          obrador_id: string | null
          product: string
          quantity: number
          supplier: string
          unit: string
          user_id: string
        }
        Insert: {
          barcode?: string | null
          barcode_image_url?: string | null
          created_at?: string
          delivery_note_url?: string | null
          id?: string
          lot_number: string
          obrador_id?: string | null
          product: string
          quantity: number
          supplier: string
          unit?: string
          user_id: string
        }
        Update: {
          barcode?: string | null
          barcode_image_url?: string | null
          created_at?: string
          delivery_note_url?: string | null
          id?: string
          lot_number?: string
          obrador_id?: string | null
          product?: string
          quantity?: number
          supplier?: string
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "entry_lots_obrador_id_fkey"
            columns: ["obrador_id"]
            isOneToOne: false
            referencedRelation: "obradores"
            referencedColumns: ["id"]
          },
        ]
      }
      obradores: {
        Row: {
          code: string
          created_at: string
          id: string
          name: string
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name: string
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name?: string
        }
        Relationships: []
      }
      output_lots: {
        Row: {
          created_at: string
          destination: string
          id: string
          lot_number: string
          obrador_id: string | null
          production_batch_id: string | null
          quantity: number
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          destination: string
          id?: string
          lot_number: string
          obrador_id?: string | null
          production_batch_id?: string | null
          quantity: number
          unit?: string
          user_id: string
        }
        Update: {
          created_at?: string
          destination?: string
          id?: string
          lot_number?: string
          obrador_id?: string | null
          production_batch_id?: string | null
          quantity?: number
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "output_lots_obrador_id_fkey"
            columns: ["obrador_id"]
            isOneToOne: false
            referencedRelation: "obradores"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "output_lots_production_batch_id_fkey"
            columns: ["production_batch_id"]
            isOneToOne: false
            referencedRelation: "production_batches"
            referencedColumns: ["id"]
          },
        ]
      }
      production_batches: {
        Row: {
          batch_number: string
          created_at: string
          id: string
          input_lot_ids: string[]
          obrador_id: string | null
          operator: string
          product: string
          quantity: number
          unit: string
          user_id: string
        }
        Insert: {
          batch_number: string
          created_at?: string
          id?: string
          input_lot_ids?: string[]
          obrador_id?: string | null
          operator: string
          product: string
          quantity: number
          unit?: string
          user_id: string
        }
        Update: {
          batch_number?: string
          created_at?: string
          id?: string
          input_lot_ids?: string[]
          obrador_id?: string | null
          operator?: string
          product?: string
          quantity?: number
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "production_batches_obrador_id_fkey"
            columns: ["obrador_id"]
            isOneToOne: false
            referencedRelation: "obradores"
            referencedColumns: ["id"]
          },
        ]
      }
      profiles: {
        Row: {
          created_at: string
          full_name: string | null
          id: string
          obrador_code: string | null
          obrador_id: string | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          full_name?: string | null
          id?: string
          obrador_code?: string | null
          obrador_id?: string | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          full_name?: string | null
          id?: string
          obrador_code?: string | null
          obrador_id?: string | null
          updated_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "profiles_obrador_id_fkey"
            columns: ["obrador_id"]
            isOneToOne: false
            referencedRelation: "obradores"
            referencedColumns: ["id"]
          },
        ]
      }
      stock_movements: {
        Row: {
          created_at: string
          id: string
          lot_number: string
          lot_type: string
          movement_type: string
          obrador_id: string | null
          product: string
          quantity: number
          reference_id: string | null
          reference_type: string | null
          source_lot_id: string
          unit: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          lot_number: string
          lot_type: string
          movement_type: string
          obrador_id?: string | null
          product: string
          quantity: number
          reference_id?: string | null
          reference_type?: string | null
          source_lot_id: string
          unit?: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          lot_number?: string
          lot_type?: string
          movement_type?: string
          obrador_id?: string | null
          product?: string
          quantity?: number
          reference_id?: string | null
          reference_type?: string | null
          source_lot_id?: string
          unit?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "stock_movements_obrador_id_fkey"
            columns: ["obrador_id"]
            isOneToOne: false
            referencedRelation: "obradores"
            referencedColumns: ["id"]
          },
        ]
      }
      user_roles: {
        Row: {
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      stock_balances: {
        Row: {
          available_balance: number | null
          lot_number: string | null
          lot_type: string | null
          product: string | null
          source_lot_id: string | null
          unit: string | null
        }
        Relationships: []
      }
    }
    Functions: {
      get_user_obrador_id: { Args: { _user_id: string }; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
    }
    Enums: {
      app_role: "admin" | "operario"
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
      app_role: ["admin", "operario"],
    },
  },
} as const
