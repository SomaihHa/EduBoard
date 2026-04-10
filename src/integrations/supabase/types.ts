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
      assignment_submissions: {
        Row: {
          assignment_id: string
          audio_url: string | null
          id: string
          reviewed_at: string | null
          status: string
          student_id: string
          submission_image_url: string | null
          submission_text: string | null
          submitted_at: string
          teacher_feedback: string | null
        }
        Insert: {
          assignment_id: string
          audio_url?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          student_id: string
          submission_image_url?: string | null
          submission_text?: string | null
          submitted_at?: string
          teacher_feedback?: string | null
        }
        Update: {
          assignment_id?: string
          audio_url?: string | null
          id?: string
          reviewed_at?: string | null
          status?: string
          student_id?: string
          submission_image_url?: string | null
          submission_text?: string | null
          submitted_at?: string
          teacher_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "assignment_submissions_assignment_id_fkey"
            columns: ["assignment_id"]
            isOneToOne: false
            referencedRelation: "quran_assignments"
            referencedColumns: ["id"]
          },
        ]
      }
      class_invitations: {
        Row: {
          class_name: string | null
          created_at: string
          expires_at: string | null
          id: string
          invite_code: string
          is_active: boolean
          max_uses: number | null
          teacher_id: string
          use_count: number
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          invite_code: string
          is_active?: boolean
          max_uses?: number | null
          teacher_id: string
          use_count?: number
        }
        Update: {
          class_name?: string | null
          created_at?: string
          expires_at?: string | null
          id?: string
          invite_code?: string
          is_active?: boolean
          max_uses?: number | null
          teacher_id?: string
          use_count?: number
        }
        Relationships: []
      }
      presentation_logos: {
        Row: {
          created_at: string
          id: string
          is_preset: boolean
          name: string
          storage_path: string
          teacher_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_preset?: boolean
          name: string
          storage_path: string
          teacher_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_preset?: boolean
          name?: string
          storage_path?: string
          teacher_id?: string
        }
        Relationships: []
      }
      presentations: {
        Row: {
          created_at: string
          duration: string
          grade_level: string
          id: string
          language: string
          slides: Json
          speaker_notes: Json
          status: string
          subject: string
          teacher_id: string
          title: string
          topic: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          duration?: string
          grade_level?: string
          id?: string
          language?: string
          slides?: Json
          speaker_notes?: Json
          status?: string
          subject?: string
          teacher_id: string
          title: string
          topic?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          duration?: string
          grade_level?: string
          id?: string
          language?: string
          slides?: Json
          speaker_notes?: Json
          status?: string
          subject?: string
          teacher_id?: string
          title?: string
          topic?: string
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          created_at: string
          email: string | null
          full_name: string
          id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          email?: string | null
          full_name?: string
          id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string | null
          full_name?: string
          id?: string
          updated_at?: string
        }
        Relationships: []
      }
      pronunciation_submissions: {
        Row: {
          accuracy_score: number | null
          ai_feedback: string | null
          articulation_score: number | null
          attempt_number: number
          audio_url: string | null
          clarity_score: number | null
          id: string
          is_best_attempt: boolean
          mispronounced_parts: Json | null
          overall_score: number | null
          reviewed_at: string | null
          stress_score: number | null
          student_id: string
          submitted_at: string
          task_id: string
          teacher_feedback: string | null
        }
        Insert: {
          accuracy_score?: number | null
          ai_feedback?: string | null
          articulation_score?: number | null
          attempt_number?: number
          audio_url?: string | null
          clarity_score?: number | null
          id?: string
          is_best_attempt?: boolean
          mispronounced_parts?: Json | null
          overall_score?: number | null
          reviewed_at?: string | null
          stress_score?: number | null
          student_id: string
          submitted_at?: string
          task_id: string
          teacher_feedback?: string | null
        }
        Update: {
          accuracy_score?: number | null
          ai_feedback?: string | null
          articulation_score?: number | null
          attempt_number?: number
          audio_url?: string | null
          clarity_score?: number | null
          id?: string
          is_best_attempt?: boolean
          mispronounced_parts?: Json | null
          overall_score?: number | null
          reviewed_at?: string | null
          stress_score?: number | null
          student_id?: string
          submitted_at?: string
          task_id?: string
          teacher_feedback?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "pronunciation_submissions_task_id_fkey"
            columns: ["task_id"]
            isOneToOne: false
            referencedRelation: "pronunciation_tasks"
            referencedColumns: ["id"]
          },
        ]
      }
      pronunciation_tasks: {
        Row: {
          assign_to: string
          assigned_student_id: string | null
          created_at: string
          id: string
          is_library_item: boolean
          language: string
          level: string
          phonetic_hint: string | null
          practice_mode: string
          target_accuracy: number | null
          teacher_id: string
          text_content: string
          updated_at: string
        }
        Insert: {
          assign_to?: string
          assigned_student_id?: string | null
          created_at?: string
          id?: string
          is_library_item?: boolean
          language?: string
          level?: string
          phonetic_hint?: string | null
          practice_mode?: string
          target_accuracy?: number | null
          teacher_id: string
          text_content: string
          updated_at?: string
        }
        Update: {
          assign_to?: string
          assigned_student_id?: string | null
          created_at?: string
          id?: string
          is_library_item?: boolean
          language?: string
          level?: string
          phonetic_hint?: string | null
          practice_mode?: string
          target_accuracy?: number | null
          teacher_id?: string
          text_content?: string
          updated_at?: string
        }
        Relationships: []
      }
      quran_assignments: {
        Row: {
          assignment_type: string
          ayah_from: number
          ayah_to: number
          created_at: string
          description: string | null
          id: string
          surah_name: string
          surah_name_ar: string
          surah_number: number
          teacher_id: string
          updated_at: string
        }
        Insert: {
          assignment_type?: string
          ayah_from?: number
          ayah_to: number
          created_at?: string
          description?: string | null
          id?: string
          surah_name: string
          surah_name_ar?: string
          surah_number: number
          teacher_id: string
          updated_at?: string
        }
        Update: {
          assignment_type?: string
          ayah_from?: number
          ayah_to?: number
          created_at?: string
          description?: string | null
          id?: string
          surah_name?: string
          surah_name_ar?: string
          surah_number?: number
          teacher_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      saved_lecture_notes: {
        Row: {
          created_at: string
          highlights: Json | null
          id: string
          key_terms: Json | null
          original_text: string | null
          questions_and_answers: Json | null
          sections: Json | null
          summary: string | null
          title: string
          user_id: string
        }
        Insert: {
          created_at?: string
          highlights?: Json | null
          id?: string
          key_terms?: Json | null
          original_text?: string | null
          questions_and_answers?: Json | null
          sections?: Json | null
          summary?: string | null
          title: string
          user_id: string
        }
        Update: {
          created_at?: string
          highlights?: Json | null
          id?: string
          key_terms?: Json | null
          original_text?: string | null
          questions_and_answers?: Json | null
          sections?: Json | null
          summary?: string | null
          title?: string
          user_id?: string
        }
        Relationships: []
      }
      skill_group_members: {
        Row: {
          group_id: string
          id: string
          joined_at: string
          user_id: string
        }
        Insert: {
          group_id: string
          id?: string
          joined_at?: string
          user_id: string
        }
        Update: {
          group_id?: string
          id?: string
          joined_at?: string
          user_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "skill_group_members_group_id_fkey"
            columns: ["group_id"]
            isOneToOne: false
            referencedRelation: "skill_groups"
            referencedColumns: ["id"]
          },
        ]
      }
      skill_groups: {
        Row: {
          created_at: string
          created_by: string
          description: string | null
          id: string
          max_members: number
          name: string
          skill_id: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by: string
          description?: string | null
          id?: string
          max_members?: number
          name: string
          skill_id: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string
          description?: string | null
          id?: string
          max_members?: number
          name?: string
          skill_id?: string
          updated_at?: string
        }
        Relationships: []
      }
      teacher_students: {
        Row: {
          class_name: string | null
          created_at: string
          id: string
          student_id: string
          teacher_id: string
        }
        Insert: {
          class_name?: string | null
          created_at?: string
          id?: string
          student_id: string
          teacher_id: string
        }
        Update: {
          class_name?: string | null
          created_at?: string
          id?: string
          student_id?: string
          teacher_id?: string
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
          role: Database["public"]["Enums"]["app_role"]
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
      generate_invite_code: { Args: never; Returns: string }
      has_role: {
        Args: {
          _role: Database["public"]["Enums"]["app_role"]
          _user_id: string
        }
        Returns: boolean
      }
      validate_invite_code: {
        Args: { p_code: string }
        Returns: {
          class_name: string
          expires_at: string
          id: string
          invite_code: string
          is_active: boolean
          max_uses: number
          teacher_id: string
          use_count: number
        }[]
      }
    }
    Enums: {
      app_role: "teacher" | "student"
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
      app_role: ["teacher", "student"],
    },
  },
} as const
