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
      friendships: {
        Row: {
          created_at: string | null
          id: string
          receiver_id: string
          requester_id: string
          status: Database["public"]["Enums"]["friendship_status"]
          updated_at: string | null
        }
        Insert: {
          created_at?: string | null
          id?: string
          receiver_id: string
          requester_id: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Update: {
          created_at?: string | null
          id?: string
          receiver_id?: string
          requester_id?: string
          status?: Database["public"]["Enums"]["friendship_status"]
          updated_at?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "friendships_receiver_id_fkey"
            columns: ["receiver_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "friendships_requester_id_fkey"
            columns: ["requester_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      memories: {
        Row: {
          category: Database["public"]["Enums"]["memory_category"]
          created_at: string | null
          date: string
          date_precision: Database["public"]["Enums"]["date_precision"]
          description: string | null
          id: string
          location: string | null
          media_urls: string[] | null
          title: string
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          category: Database["public"]["Enums"]["memory_category"]
          created_at?: string | null
          date: string
          date_precision: Database["public"]["Enums"]["date_precision"]
          description?: string | null
          id?: string
          location?: string | null
          media_urls?: string[] | null
          title: string
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          category?: Database["public"]["Enums"]["memory_category"]
          created_at?: string | null
          date?: string
          date_precision?: Database["public"]["Enums"]["date_precision"]
          description?: string | null
          id?: string
          location?: string | null
          media_urls?: string[] | null
          title?: string
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      people: {
        Row: {
          creator_id: string
          email: string | null
          full_name: string
          id: string
          invited_at: string | null
          registered_user_id: string | null
          relationship: string | null
        }
        Insert: {
          creator_id: string
          email?: string | null
          full_name: string
          id?: string
          invited_at?: string | null
          registered_user_id?: string | null
          relationship?: string | null
        }
        Update: {
          creator_id?: string
          email?: string | null
          full_name?: string
          id?: string
          invited_at?: string | null
          registered_user_id?: string | null
          relationship?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "people_registered_user_id_fkey"
            columns: ["registered_user_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      periods: {
        Row: {
          created_at: string | null
          description: string | null
          end_date: string | null
          id: string
          location: string | null
          start_date: string
          title: string
          type: Database["public"]["Enums"]["period_type"]
          updated_at: string | null
          user_id: string
          visibility: Database["public"]["Enums"]["visibility_type"]
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date: string
          title: string
          type: Database["public"]["Enums"]["period_type"]
          updated_at?: string | null
          user_id: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Update: {
          created_at?: string | null
          description?: string | null
          end_date?: string | null
          id?: string
          location?: string | null
          start_date?: string
          title?: string
          type?: Database["public"]["Enums"]["period_type"]
          updated_at?: string | null
          user_id?: string
          visibility?: Database["public"]["Enums"]["visibility_type"]
        }
        Relationships: []
      }
      profiles: {
        Row: {
          avatar_url: string | null
          biography: string | null
          created_at: string | null
          date_of_birth: string | null
          id: string
          updated_at: string | null
          username: string
        }
        Insert: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id: string
          updated_at?: string | null
          username: string
        }
        Update: {
          avatar_url?: string | null
          biography?: string | null
          created_at?: string | null
          date_of_birth?: string | null
          id?: string
          updated_at?: string | null
          username?: string
        }
        Relationships: []
      }
      user_list_members: {
        Row: {
          list_id: string
          member_id: string
        }
        Insert: {
          list_id: string
          member_id: string
        }
        Update: {
          list_id?: string
          member_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "user_list_members_list_id_fkey"
            columns: ["list_id"]
            isOneToOne: false
            referencedRelation: "user_lists"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "user_list_members_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: false
            referencedRelation: "profiles"
            referencedColumns: ["id"]
          },
        ]
      }
      user_lists: {
        Row: {
          created_at: string | null
          description: string | null
          id: string
          name: string
          owner_id: string
        }
        Insert: {
          created_at?: string | null
          description?: string | null
          id?: string
          name: string
          owner_id: string
        }
        Update: {
          created_at?: string | null
          description?: string | null
          id?: string
          name?: string
          owner_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      [_ in never]: never
    }
    Enums: {
      date_precision: "today" | "complete" | "month_year" | "year_only"
      friendship_status: "pending" | "accepted" | "blocked"
      memory_category:
        | "travel"
        | "education"
        | "family"
        | "work"
        | "personal"
        | "milestone"
        | "other"
      period_type:
        | "residence"
        | "work"
        | "education"
        | "relationship"
        | "travel"
        | "project"
        | "other"
      visibility_type: "private" | "friends" | "lists" | "public"
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
      date_precision: ["today", "complete", "month_year", "year_only"],
      friendship_status: ["pending", "accepted", "blocked"],
      memory_category: [
        "travel",
        "education",
        "family",
        "work",
        "personal",
        "milestone",
        "other",
      ],
      period_type: [
        "residence",
        "work",
        "education",
        "relationship",
        "travel",
        "project",
        "other",
      ],
      visibility_type: ["private", "friends", "lists", "public"],
    },
  },
} as const
