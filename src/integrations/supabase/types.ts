export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instanciate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "12.2.12 (cd3cf9e)"
  }
  public: {
    Tables: {
      mission4_questions: {
        Row: {
          created_at: string
          id: number
          options: Json | null
          question_id: number
          question_text: string
          question_type: string
          softwares: string[] | null
          star_legends: Json | null
          target_areas: string[] | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: number
          options?: Json | null
          question_id: number
          question_text: string
          question_type: string
          softwares?: string[] | null
          star_legends?: Json | null
          target_areas?: string[] | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: number
          options?: Json | null
          question_id?: number
          question_text?: string
          question_type?: string
          softwares?: string[] | null
          star_legends?: Json | null
          target_areas?: string[] | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          area: string | null
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
          cargo?: string | null
          cpf?: string
          created_at?: string
          email?: string | null
          id?: string
          nome?: string | null
          updated_at?: string
          user_id?: string | null
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
          total_play_time: number | null
          total_xp: number | null
          updated_at: string
          user_id: string
        }
        Insert: {
          created_at?: string
          current_position?: string | null
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
          total_play_time?: number | null
          total_xp?: number | null
          updated_at?: string
          user_id: string
        }
        Update: {
          created_at?: string
          current_position?: string | null
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
      has_role: {
        Args: {
          _user_id: string
          _role: Database["public"]["Enums"]["app_role"]
        }
        Returns: boolean
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
