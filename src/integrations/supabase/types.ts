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
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      areas: {
        Row: {
          code: string
          created_at: string
          description: string | null
          id: string
          name: string
          updated_at: string
        }
        Insert: {
          code: string
          created_at?: string
          description?: string | null
          id?: string
          name: string
          updated_at?: string
        }
        Update: {
          code?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
          updated_at?: string
        }
        Relationships: []
      }
      game_settings: {
        Row: {
          created_at: string
          created_by: string | null
          game_start_date: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          game_start_date: string
          id?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          game_start_date?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      profile_audit_log: {
        Row: {
          accessed_at: string | null
          accessed_profile_id: string | null
          action_type: string
          id: string
          ip_address: unknown | null
          user_agent: string | null
          user_id: string | null
        }
        Insert: {
          accessed_at?: string | null
          accessed_profile_id?: string | null
          action_type: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Update: {
          accessed_at?: string | null
          accessed_profile_id?: string | null
          action_type?: string
          id?: string
          ip_address?: unknown | null
          user_agent?: string | null
          user_id?: string | null
        }
        Relationships: []
      }
      profile_texts: {
        Row: {
          created_at: string
          id: string
          profile_name: string
          sublevel: string
          text_content: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          profile_name: string
          sublevel: string
          text_content: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          profile_name?: string
          sublevel?: string
          text_content?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
          area_id: string | null
          cargo: string | null
          cpf: string
          created_at: string
          email: string | null
          id: string
          nome: string | null
          updated_at: string
          user_id: string | null
        }
        Insert: {
          area?: string | null
          area_id?: string | null
          cargo?: string | null
          cpf: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          area?: string | null
          area_id?: string | null
          cargo?: string | null
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "profiles_area_id_fkey"
            columns: ["area_id"]
            isOneToOne: false
            referencedRelation: "areas"
            referencedColumns: ["id"]
          },
        ]
      }
      question_options: {
        Row: {
          created_at: string
          id: string
          option_letter: string
          option_text: string
          order_position: number
          points: number
          question_id: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          option_letter: string
          option_text: string
          order_position?: number
          points?: number
          question_id: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          option_letter?: string
          option_text?: string
          order_position?: number
          points?: number
          question_id?: number
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "question_options_question_id_fkey"
            columns: ["question_id"]
            isOneToOne: false
            referencedRelation: "questions"
            referencedColumns: ["id"]
          },
        ]
      }
      questions: {
        Row: {
          created_at: string
          id: number
          is_active: boolean
          legacy_question_id: number | null
          mission_number: number
          options: Json | null
          order_position: number
          points_mapping: Json | null
          question_text: string
          question_type: string
          softwares: string[] | null
          star_legends: Json | null
          target_area_ids: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          is_active?: boolean
          legacy_question_id?: number | null
          mission_number?: number
          options?: Json | null
          order_position?: number
          points_mapping?: Json | null
          question_text: string
          question_type: string
          softwares?: string[] | null
          star_legends?: Json | null
          target_area_ids?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          is_active?: boolean
          legacy_question_id?: number | null
          mission_number?: number
          options?: Json | null
          order_position?: number
          points_mapping?: Json | null
          question_text?: string
          question_type?: string
          softwares?: string[] | null
          star_legends?: Json | null
          target_area_ids?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      respostas: {
        Row: {
          email: string | null
          id: number
          nome: string
          respostas: Json | null
          user_id: string | null
        }
        Insert: {
          email?: string | null
          id?: number
          nome: string
          respostas?: Json | null
          user_id?: string | null
        }
        Update: {
          email?: string | null
          id?: number
          nome?: string
          respostas?: Json | null
          user_id?: string | null
        }
        Relationships: []
      }
      respostas_missao2: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          respostas: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          respostas: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          respostas?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      respostas_missao3: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          respostas: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          respostas: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          respostas?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      respostas_missao4: {
        Row: {
          created_at: string
          email: string
          id: string
          nome: string
          respostas: Json
          updated_at: string
          user_id: string | null
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          nome: string
          respostas: Json
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          nome?: string
          respostas?: Json
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      user_progress: {
        Row: {
          created_at: string
          current_position: string | null
          final_profile: string | null
          final_score: number | null
          game_base_xp: number | null
          game_end_date: string | null
          id: string
          last_saved_at: string | null
          missao_1_answers: Json | null
          missao_1_completed: boolean | null
          missao_1_current_question: number | null
          missao_2_answers: Json | null
          missao_2_completed: boolean | null
          missao_2_current_question: number | null
          missao_3_answers: Json | null
          missao_3_completed: boolean | null
          missao_3_current_question: number | null
          missao_4_answers: Json | null
          missao_4_completed: boolean | null
          missao_4_current_question: number | null
          session_start_time: string | null
          time_bonus_xp: number | null
          total_play_time: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_position?: string | null
          final_profile?: string | null
          final_score?: number | null
          game_base_xp?: number | null
          game_end_date?: string | null
          id?: string
          last_saved_at?: string | null
          missao_1_answers?: Json | null
          missao_1_completed?: boolean | null
          missao_1_current_question?: number | null
          missao_2_answers?: Json | null
          missao_2_completed?: boolean | null
          missao_2_current_question?: number | null
          missao_3_answers?: Json | null
          missao_3_completed?: boolean | null
          missao_3_current_question?: number | null
          missao_4_answers?: Json | null
          missao_4_completed?: boolean | null
          missao_4_current_question?: number | null
          session_start_time?: string | null
          time_bonus_xp?: number | null
          total_play_time?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_position?: string | null
          final_profile?: string | null
          final_score?: number | null
          game_base_xp?: number | null
          game_end_date?: string | null
          id?: string
          last_saved_at?: string | null
          missao_1_answers?: Json | null
          missao_1_completed?: boolean | null
          missao_1_current_question?: number | null
          missao_2_answers?: Json | null
          missao_2_completed?: boolean | null
          missao_2_current_question?: number | null
          missao_3_answers?: Json | null
          missao_3_completed?: boolean | null
          missao_3_current_question?: number | null
          missao_4_answers?: Json | null
          missao_4_completed?: boolean | null
          missao_4_current_question?: number | null
          session_start_time?: string | null
          time_bonus_xp?: number | null
          total_play_time?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      fix_corrupted_time_data: {
        Args: Record<PropertyKey, never>
        Returns: number
      }
      get_masked_profiles: {
        Args: Record<PropertyKey, never>
        Returns: {
          area: string
          area_id: string
          cargo: string
          cpf_masked: string
          created_at: string
          email: string
          id: string
          nome: string
          updated_at: string
          user_id: string
        }[]
      }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      mask_cpf: {
        Args: { cpf_value: string }
        Returns: string
      }
    }
    Enums: {
      app_role: "admin" | "user"
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
      app_role: ["admin", "user"],
    },
  },
} as const
